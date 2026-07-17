import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const ZERO_BIN = process.env.ZERO_BIN || "zero";
const ZERO_SEARCH_QUERY = process.env.ZERO_SEARCH_QUERY || "openai chat completions json";
const ZERO_MAX_PAY = process.env.ZERO_MAX_PAY || "0.10";
const ZERO_TIMEOUT_MS = 20000;
const ZERO_LIVE_ENABLED = process.env.ZERO_LIVE === "true" || process.env.ZERO_LIVE === "1";
const ZERO_PREFERRED_MODEL = process.env.ZERO_MODEL || "gpt-4o-mini";
const ZERO_BLOCKED_SLUGS = (process.env.ZERO_BLOCKED_SLUGS || "groq-chat-0362cf4f")
  .split(",")
  .map((slug) => slug.trim())
  .filter(Boolean);

const VALID_CATEGORIES = ["workout_timing", "caffeine_timing", "protein_intake", "maintain_routine"];

// Zero.xyz is a capability marketplace + payment layer (search -> inspect -> call -> pay -> review),
// not a single fixed reasoning API. We re-search live each cycle (rankings/prices churn) and only
// spend on the Diagnostician role; Scientist/Evaluator stay deterministic to keep cost/latency down.
let cliAvailable = null;

async function isCliAvailable() {
  if (cliAvailable !== null) return cliAvailable;
  try {
    await execFileAsync(ZERO_BIN, ["--help"], { timeout: 5000 });
    cliAvailable = true;
  } catch {
    cliAvailable = false;
  }
  return cliAvailable;
}

export function createZeroReasoningProvider() {
  return {
    status() {
      return {
        sponsor: "Zero.xyz",
        role: "multi-agent reasoning",
        mode: ZERO_LIVE_ENABLED && cliAvailable !== false ? "capability-marketplace" : "deterministic-demo",
        configured: ZERO_LIVE_ENABLED,
        note: "Diagnostician searches and pays for a live Zero.xyz reasoning capability each cycle; Scientist/Evaluator stay deterministic.",
        requiredEnv: ["ZERO_LIVE=true (opt-in; spends real USDC per diagnosis)"]
      };
    },

    async diagnose(input) {
      return diagnoseViaZero(input);
    },

    async createExperiment(input) {
      return deterministicExperiment(input.diagnosis);
    },

    async evaluate(input) {
      return deterministicEvaluation(input.observation, input.nextContext);
    }
  };
}

async function diagnoseViaZero({ observation }) {
  const fallback = (reason) => ({
    ...deterministicDiagnosis(observation),
    reasoningSource: "deterministic-fallback",
    zeroError: reason
  });

  if (!ZERO_LIVE_ENABLED) {
    return fallback("ZERO_LIVE not enabled");
  }

  if (!(await isCliAvailable())) {
    return fallback("zero CLI not available on PATH");
  }

  let capability;
  let runId;
  try {
    capability = await findChatCapability();
    if (!capability) {
      return fallback("no OpenAI-compatible chat capability found in top search results");
    }

    const body = { model: capability.model, messages: buildDiagnosisMessages(observation) };
    if (capability.requiresStreamFalse) body.stream = false;
    if (capability.supportsTemperature) body.temperature = 0.3;
    if (capability.maxTokensField) body[capability.maxTokensField] = 300;
    if (capability.supportsResponseFormat) body.response_format = { type: "json_object" };

    const envelope = await runZeroFetch(capability, body);
    runId = envelope.runId;
    if (!envelope.ok) {
      throw new Error(`Zero capability call failed: HTTP ${envelope.status} - ${envelope.body?.error || "unknown error"}`);
    }

    const content = extractMessageContent(envelope.body);
    const parsed = JSON.parse(content);
    if (!parsed.rootCause || !VALID_CATEGORIES.includes(parsed.category)) {
      throw new Error("Zero capability response missing rootCause or a valid category");
    }

    reviewBestEffort(runId, true, "Diagnosed a wellness bottleneck for Adaptive Health's Observe/Diagnose loop.");

    return {
      rootCause: normalizeRootCause(parsed.rootCause, parsed.category, observation),
      confidence: Number(parsed.confidence ?? 0.7),
      evidence: Array.isArray(parsed.evidence) ? parsed.evidence.map(String) : [],
      category: parsed.category,
      reasoningSource: "zero.xyz",
      zeroCapability: capability.canonicalName
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    if (runId) {
      reviewBestEffort(runId, false, reason);
    }
    return fallback(reason);
  }
}

function normalizeRootCause(rootCause, category, observation) {
  const value = String(rootCause || "").trim();
  const looksLikeLabel = /^[a-z0-9_ -]{3,40}$/i.test(value) && !/[.]/.test(value);
  if (!looksLikeLabel || value.split(/\s+/).length > 4) {
    return value;
  }

  const deterministic = deterministicDiagnosis(observation);
  if (deterministic.category === category) {
    return deterministic.rootCause;
  }

  if (category === "workout_timing") {
    return "Workout timing is the strongest bottleneck for the user's energy goal.";
  }
  if (category === "caffeine_timing") {
    return "Late caffeine is the strongest bottleneck for sleep quality and next-day energy.";
  }
  if (category === "protein_intake") {
    return "Low protein intake is the strongest bottleneck for stable energy.";
  }
  return "The current routine is working and should be maintained before adding complexity.";
}

async function runZeroFetch(capability, body) {
  const args = [
    "fetch",
    capability.url,
    "--capability",
    capability.token,
    "-d",
    JSON.stringify(body),
    "--max-pay",
    ZERO_MAX_PAY,
    "--json"
  ];

  try {
    const { stdout } = await execFileAsync(ZERO_BIN, args, { timeout: ZERO_TIMEOUT_MS });
    return JSON.parse(stdout);
  } catch (error) {
    // `zero fetch` exits non-zero on a paid-but-failed call (e.g. upstream 502) while still
    // printing a full JSON envelope (with runId + payment info) to stdout — recover it so we
    // can review the run and report a precise reason instead of a raw command dump.
    if (error.stdout) {
      try {
        return JSON.parse(error.stdout);
      } catch {
        // stdout wasn't JSON either; fall through to the generic error below
      }
    }
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

async function findChatCapability() {
  const { stdout } = await execFileAsync(
    ZERO_BIN,
    ["search", ZERO_SEARCH_QUERY, "--json", "--status", "healthy", "--limit", "10"],
    { timeout: ZERO_TIMEOUT_MS }
  );
  const results = JSON.parse(stdout);
  const candidates = (results.capabilities || [])
    .filter((candidate) => !ZERO_BLOCKED_SLUGS.includes(candidate.slug))
    .sort(compareCapabilityCandidates);

  for (const candidate of candidates) {
    try {
      const { stdout: detailOut } = await execFileAsync(ZERO_BIN, ["get", candidate.token, "--json"], {
        timeout: ZERO_TIMEOUT_MS
      });
      const detail = JSON.parse(detailOut);
      const properties = detail.bodySchema?.properties || {};
      if ("model" in properties && "messages" in properties) {
        return {
          token: candidate.token,
          url: detail.url,
          canonicalName: candidate.canonicalName || candidate.name,
          model: pickModel(candidate, properties.model, detail.example?.request?.model),
          supportsTemperature: "temperature" in properties,
          supportsResponseFormat: "response_format" in properties,
          requiresStreamFalse: requiresStreamFalse(detail.bodySchema),
          maxTokensField: "max_completion_tokens" in properties
            ? "max_completion_tokens"
            : "max_tokens" in properties
              ? "max_tokens"
              : null
        };
      }
    } catch {
      // this candidate's schema couldn't be inspected in time; try the next one
    }
  }

  return null;
}

function compareCapabilityCandidates(a, b) {
  return capabilityScore(b) - capabilityScore(a);
}

function capabilityScore(candidate) {
  const slug = `${candidate.slug || ""} ${candidate.canonicalName || ""}`.toLowerCase();
  const rating = Number(candidate.rating?.score || 0);
  const successRate = Number(candidate.rating?.successRate || 0);
  const reviewCount = Number(candidate.reviewCount || 0);
  const activationCount = Number(candidate.activationCount || 0);
  const cost = Number(candidate.cost?.amount || 1);

  let score = rating * 10 + successRate * 8 + Math.min(reviewCount, 10) + Math.log10(activationCount + 1);
  if (slug.includes("agent402")) score += 12;
  if (slug.includes("openrouter")) score += 8;
  if (slug.includes("gpt-4o-mini")) score += 4;
  if (slug.includes("groq")) score -= 30;
  score -= cost * 10;
  return score;
}

function requiresStreamFalse(bodySchema) {
  return bodySchema?.required?.includes("stream") || bodySchema?.properties?.stream?.const === false;
}

function pickModel(candidate, modelSchema, exampleModel) {
  if (exampleModel) return exampleModel;
  if (Array.isArray(modelSchema?.enum) && modelSchema.enum.length > 0) return modelSchema.enum[0];
  const text = `${candidate.canonicalName || ""} ${candidate.name || ""} ${candidate.description || ""} ${modelSchema?.description || ""}`.toLowerCase();
  if (text.includes("gpt-4o-mini")) return "gpt-4o-mini";
  if (text.includes("openrouter")) return process.env.ZERO_OPENROUTER_MODEL || "openai/gpt-4o-mini";
  return "llama-3.3-70b-versatile";
}

export const __zeroTestHooks = {
  capabilityScore,
  pickModel,
  requiresStreamFalse,
  normalizeRootCause
};

function extractMessageContent(body) {
  const content = body?.data?.choices?.[0]?.message?.content ?? body?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Could not find message content in Zero capability response");
  }
  return content;
}

function reviewBestEffort(runId, success, content) {
  const rating = success ? "5" : "1";
  const args = [
    "review",
    runId,
    success ? "--success" : "--no-success",
    "--accuracy",
    rating,
    "--value",
    rating,
    "--reliability",
    rating,
    "--content",
    content
  ];
  execFileAsync(ZERO_BIN, args, { timeout: ZERO_TIMEOUT_MS }).catch(() => {
    // reviews are best-effort; never let this affect the agent loop
  });
}

function buildDiagnosisMessages(observation) {
  return [
    {
      role: "system",
      content:
        "You are the Diagnostician agent inside Adaptive Health, an autonomous wellness-optimization loop. " +
        "This is wellness experimentation only, not medical diagnosis or treatment. " +
        "Given a day's observation, identify the single most likely bottleneck limiting the user's stated goal, " +
        "and classify it into exactly one category from this fixed list: " +
        `${JSON.stringify(VALID_CATEGORIES)}. ` +
        'Respond ONLY with strict JSON: {"rootCause": string, "confidence": number between 0 and 1, ' +
        '"evidence": string[], "category": one of the categories above}.'
    },
    {
      role: "user",
      content: JSON.stringify({
        goal: observation.goal,
        signals: observation.signals,
        metrics: observation.metrics,
        calendar: observation.calendar,
        previousExperiments: observation.previousExperiments
      })
    }
  ];
}

function deterministicDiagnosis(observation) {
  const signals = observation.signals;

  if (signals.includes("missed_workout")) {
    return {
      rootCause: "Morning workouts conflict with the user's calendar, causing missed exercise and lower energy.",
      confidence: 0.82,
      evidence: ["workout missed", "morning calendar blocked", "low activity"],
      category: "workout_timing"
    };
  }

  if (signals.includes("late_caffeine")) {
    return {
      rootCause: "Late caffeine is suppressing sleep quality and limiting recovery.",
      confidence: 0.78,
      evidence: ["caffeine after 2 PM", "sleep quality below target", "resting heart rate still elevated"],
      category: "caffeine_timing"
    };
  }

  if (signals.includes("low_morning_protein")) {
    return {
      rootCause: "Low morning protein is likely causing an energy dip despite better sleep.",
      confidence: 0.71,
      evidence: ["protein below target", "sleep improved", "workout completed"],
      category: "protein_intake"
    };
  }

  return {
    rootCause: "Current routine is working; preserve the gains and avoid adding complexity.",
    confidence: 0.69,
    evidence: ["energy improving", "sleep stable", "workout completed"],
    category: "maintain_routine"
  };
}

function experimentForCategory(category) {
  if (category === "workout_timing") {
    return {
      hypothesis: "Moving workouts to 7 PM will improve completion and raise next-day energy.",
      intervention: "evening_workout",
      successMetric: "energy",
      expectedImprovement: 8,
      durationDays: 1
    };
  }

  if (category === "caffeine_timing") {
    return {
      hypothesis: "Stopping caffeine after 2 PM will improve sleep quality and next-day energy.",
      intervention: "caffeine_cutoff",
      successMetric: "sleepQuality",
      expectedImprovement: 7,
      durationDays: 1
    };
  }

  if (category === "protein_intake") {
    return {
      hypothesis: "Adding a high-protein breakfast will reduce the morning energy dip.",
      intervention: "high_protein_breakfast",
      successMetric: "energy",
      expectedImprovement: 6,
      durationDays: 1
    };
  }

  return {
    hypothesis: "Keeping the current routine stable will preserve recent energy gains.",
    intervention: "preserve_routine",
    successMetric: "energy",
    expectedImprovement: 1,
    durationDays: 1
  };
}

function deterministicExperiment(diagnosis) {
  return experimentForCategory(diagnosis.category);
}

function deterministicEvaluation(observation, nextContext) {
  const before = observation.metrics.energy;
  const after = nextContext.metrics.energy;
  const delta = after - before;

  return {
    success: delta > 0,
    metric: "energy",
    before,
    after,
    delta,
    lesson: delta > 0
      ? `The experiment improved energy by ${delta} points and should influence future plans.`
      : "The experiment did not improve energy and should not be repeated without changes."
  };
}
