import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

const clientId = process.env.GOOGLE_CLIENT_ID || "";
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://127.0.0.1:8787/auth/google/callback";
const tokenPath = process.env.GOOGLE_TOKEN_PATH || "./data/google-calendar-token.json";
const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
const writeEnabled = process.env.GOOGLE_CALENDAR_WRITE_ENABLED === "true";
const timeZone = process.env.GOOGLE_CALENDAR_TIME_ZONE || Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Los_Angeles";

function isOAuthConfigured() {
  return Boolean(clientId && clientSecret && redirectUri);
}

function createOAuthClient() {
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

async function readStoredToken() {
  try {
    return JSON.parse(await readFile(tokenPath, "utf8"));
  } catch (error) {
    if (error && error.code === "ENOENT") return null;
    throw error;
  }
}

async function writeStoredToken(tokens) {
  await mkdir(path.dirname(tokenPath), { recursive: true });
  await writeFile(tokenPath, JSON.stringify(tokens, null, 2));
}

async function getAuthorizedClient() {
  if (!isOAuthConfigured()) {
    throw new Error("Google OAuth is not configured");
  }

  const tokens = await readStoredToken();
  if (!tokens) {
    throw new Error("Google Calendar is not connected");
  }

  const auth = createOAuthClient();
  auth.setCredentials(tokens);
  auth.on("tokens", async (refreshedTokens) => {
    if (Object.keys(refreshedTokens).length === 0) return;
    await writeStoredToken({ ...tokens, ...refreshedTokens });
  });
  return auth;
}

function dayBounds(date) {
  return {
    start: new Date(`${date}T00:00:00`).toISOString(),
    end: new Date(`${date}T23:59:59`).toISOString()
  };
}

function formatEvent(event) {
  const start = event.start?.dateTime || event.start?.date || "";
  const end = event.end?.dateTime || event.end?.date || "";
  return {
    id: event.id,
    title: event.summary || "Untitled event",
    start,
    end,
    location: event.location || "",
    status: event.status || "",
    htmlLink: event.htmlLink || ""
  };
}

function combineDateAndTime(date, hhmm) {
  const [hours = "09", minutes = "00"] = String(hhmm || "09:00").split(":");
  const start = new Date(`${date}T00:00:00`);
  start.setHours(Number(hours), Number(minutes), 0, 0);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 45);
  return { start, end };
}

export function createGoogleCalendarClient() {
  return {
    async status() {
      const connected = Boolean(await readStoredToken());
      return {
        provider: "Google Calendar",
        role: "live schedule context and calendar actions",
        mode: isOAuthConfigured()
          ? connected
            ? writeEnabled
              ? "live-read-write"
              : "live-read-only"
            : "oauth-not-connected"
          : "not-configured",
        configured: isOAuthConfigured(),
        connected,
        writeEnabled,
        calendarId,
        redirectUri,
        requiredEnv: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URI", "GOOGLE_CALENDAR_WRITE_ENABLED"]
      };
    },

    getAuthUrl() {
      if (!isOAuthConfigured()) {
        throw new Error("Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET first");
      }

      return createOAuthClient().generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: SCOPES
      });
    },

    async handleOAuthCallback(code) {
      if (!code) {
        throw new Error("Missing Google OAuth code");
      }

      const auth = createOAuthClient();
      const { tokens } = await auth.getToken(code);
      await writeStoredToken(tokens);
      return this.status();
    },

    async listEventsForDate(date) {
      const auth = await getAuthorizedClient();
      const calendar = google.calendar({ version: "v3", auth });
      const { start, end } = dayBounds(date);
      const response = await calendar.events.list({
        calendarId,
        timeMin: start,
        timeMax: end,
        singleEvents: true,
        orderBy: "startTime",
        maxResults: 20
      });

      return (response.data.items || []).map(formatEvent);
    },

    async enrichHealthContext(context) {
      if (!isOAuthConfigured() || !(await readStoredToken())) {
        return context;
      }

      try {
        const events = await this.listEventsForDate(context.date);
        return {
          ...context,
          calendar: events,
          calendarSource: "google-calendar-live"
        };
      } catch (error) {
        return {
          ...context,
          calendarSource: "google-calendar-error-fallback",
          googleCalendarError: error instanceof Error ? error.message : String(error)
        };
      }
    },

    async createEventFromAction(action, { date = new Date().toISOString().slice(0, 10) } = {}) {
      if (!writeEnabled) {
        throw new Error("Google Calendar writes are disabled. Set GOOGLE_CALENDAR_WRITE_ENABLED=true.");
      }

      const auth = await getAuthorizedClient();
      const calendar = google.calendar({ version: "v3", auth });
      const { start, end } = combineDateAndTime(date, action.scheduledFor);
      const response = await calendar.events.insert({
        calendarId,
        requestBody: {
          summary: action.title || "Adaptive Health action",
          description: action.description || "Created by Adaptive Health.",
          start: { dateTime: start.toISOString(), timeZone },
          end: { dateTime: end.toISOString(), timeZone },
          extendedProperties: {
            private: {
              createdBy: "adaptive-health",
              actionType: action.actionType || "calendar_event"
            }
          }
        }
      });

      return formatEvent(response.data);
    }
  };
}
