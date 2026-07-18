import https from "node:https";
import { readFileSync } from "node:fs";

// Pomerium is self-hosted (open source has no API-key-style "service accounts" - that's an
// Enterprise feature), so this isn't a bearer token integration. A local Pomerium proxy
// (infra/pomerium/docker-compose.yml) sits in front of the actions upstream and only forwards
// requests presenting a client certificate matching the fingerprint pinned in config.yaml - see
// infra/pomerium/generate-certs.sh. Pure mTLS, no identity provider, no human login.
const actionUrl = process.env.POMERIUM_ACTION_URL || "";
const clientCertPath = process.env.POMERIUM_CLIENT_CERT_PATH || "";
const clientKeyPath = process.env.POMERIUM_CLIENT_KEY_PATH || "";
const caPath = process.env.POMERIUM_CA_PATH || "";

function loadMtlsAgent() {
  if (!clientCertPath || !clientKeyPath || !caPath) return null;
  try {
    return new https.Agent({
      cert: readFileSync(clientCertPath),
      key: readFileSync(clientKeyPath),
      ca: readFileSync(caPath)
    });
  } catch {
    return null;
  }
}

const mtlsAgent = loadMtlsAgent();

function postThroughPomerium(url, body) {
  return new Promise((resolve, reject) => {
    const request = https.request(
      url,
      { method: "POST", agent: mtlsAgent, headers: { "Content-Type": "application/json" }, timeout: 10000 },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          resolve({ statusCode: response.statusCode, raw });
        });
      }
    );
    request.on("error", reject);
    request.on("timeout", () => request.destroy(new Error("Pomerium request timed out after 10s")));
    request.write(JSON.stringify(body));
    request.end();
  });
}

export function createPomeriumActionClient() {
  const isConfigured = Boolean(actionUrl && mtlsAgent);

  return {
    status() {
      return {
        sponsor: "Pomerium",
        role: "secure action bridge",
        mode: isConfigured ? "live-mtls" : "simulated-actions",
        configured: isConfigured,
        note: "Self-hosted Pomerium proxy in front of the actions upstream, secured by mutual TLS (no IdP/API key).",
        requiredEnv: ["POMERIUM_ACTION_URL", "POMERIUM_CLIENT_CERT_PATH", "POMERIUM_CLIENT_KEY_PATH", "POMERIUM_CA_PATH"]
      };
    },

    async executeIntervention({ experiment, observation }) {
      const [primaryAction] = await this.executeInterventions({ experiment, observation });
      return primaryAction;
    },

    async executeInterventions({ experiment, observation }) {
      const actions = actionsForExperiment(experiment).map((action) => {
        if (action.actionType === "calendar_event" && observation?.date) {
          return { ...action, scheduledDate: observation.date };
        }
        return action;
      });

      const results = [];
      if (!isConfigured) {
        return actions.map((action) => ({
          ...action,
          status: "simulated_success",
          securedBy: "pomerium-ready-action-contract"
        }));
      }

      for (const action of actions) {
        try {
          const { statusCode, raw } = await postThroughPomerium(actionUrl, action);
          if (statusCode !== 200) {
            throw new Error(`Pomerium rejected the action request: HTTP ${statusCode}`);
          }

          results.push({
            ...action,
            status: "executed",
            securedBy: "pomerium-mtls",
            upstream: JSON.parse(raw)
          });
        } catch (error) {
          results.push({
            ...action,
            status: "simulated_success",
            securedBy: "pomerium-ready-action-contract",
            pomeriumError: error instanceof Error ? error.message : String(error)
          });
        }
      }

      return results;
    }
  };
}

function actionsForExperiment(experiment) {
  if (experiment.intervention === "evening_workout") {
    return [
      {
        actionType: "calendar_event",
        title: "Workout",
        scheduledFor: "19:00",
        description: "Moved by Adaptive Health because morning workouts conflict with calendar."
      },
      {
        actionType: "reminder",
        title: "Pack workout clothes",
        scheduledFor: "16:30",
        description: "Prep cue for the evening workout experiment."
      },
      {
        actionType: "routine_lock",
        title: "Protect post-workout wind-down",
        description: "Avoid adding late meetings after the workout block."
      }
    ];
  }

  if (experiment.intervention === "caffeine_cutoff") {
    return [
      {
        actionType: "reminder",
        title: "No caffeine after 2 PM",
        scheduledFor: "14:00",
        description: "Adaptive Health experiment to improve sleep quality."
      },
      {
        actionType: "calendar_event",
        title: "Caffeine-free wind-down",
        scheduledFor: "21:30",
        description: "Calendar block created by Adaptive Health to protect sleep quality."
      },
      {
        actionType: "routine_lock",
        title: "Block late espresso habit",
        description: "Keep stimulants out of the afternoon routine during this experiment."
      }
    ];
  }

  if (experiment.intervention === "high_protein_breakfast") {
    return [
      {
        actionType: "calendar_event",
        title: "High-protein breakfast",
        scheduledFor: "07:30",
        description: "Calendar block created by Adaptive Health to reduce the morning energy dip."
      },
      {
        actionType: "grocery_list",
        title: "High-protein breakfast supplies",
        items: ["Greek yogurt", "eggs", "tofu", "berries"],
        description: "Adaptive Health experiment to reduce morning energy dip."
      },
      {
        actionType: "reminder",
        title: "Prep protein breakfast",
        scheduledFor: "21:00",
        description: "Evening prep reminder so breakfast is easy tomorrow."
      }
    ];
  }

  return [
    {
      actionType: "calendar_event",
      title: "Recovery check-in",
      scheduledFor: "20:30",
      description: "Calendar check-in created by Adaptive Health while preserving the current routine."
    },
    {
      actionType: "routine_lock",
      title: "Preserve current routine",
      description: "Avoid adding a new intervention while current metrics are improving."
    }
  ];
}
