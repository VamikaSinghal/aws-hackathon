import http from "node:http";
import { URL } from "node:url";

try {
  process.loadEnvFile();
} catch {
  // no .env file present — rely on real environment variables
}

// Dynamic import so .env is loaded before integrations read process.env at module init.
const { createAdaptiveHealthApp } = await import("./app.js");
const { startActionsService } = await import("./services/actions-service.js");

const app = createAdaptiveHealthApp();
const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "127.0.0.1";
const actionsServicePort = Number(process.env.ACTIONS_SERVICE_PORT || 8788);

startActionsService(actionsServicePort);

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  });
  response.end(body);
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  return raw ? JSON.parse(raw) : {};
}

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === "OPTIONS") {
      sendJson(response, 200, { ok: true });
      return;
    }

    const url = new URL(request.url || "/", `http://${request.headers.host}`);

    if (request.method === "GET" && url.pathname === "/health") {
      sendJson(response, 200, { ok: true, service: "adaptive-health" });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/state") {
      sendJson(response, 200, await app.getState());
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/timeline") {
      const state = await app.getState();
      sendJson(response, 200, { timeline: state.timeline });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/integrations/status") {
      sendJson(response, 200, await app.getIntegrationStatus());
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/advance-day") {
      sendJson(response, 200, await app.advanceDay());
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/goal") {
      const body = await readJson(request);
      sendJson(response, 200, await app.setGoal(body.goal));
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/reset") {
      sendJson(response, 200, await app.reset());
      return;
    }

    sendJson(response, 404, { error: "not_found", path: url.pathname });
  } catch (error) {
    sendJson(response, 500, {
      error: "internal_error",
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

server.listen(port, host, () => {
  console.log(`Adaptive Health API listening on http://${host}:${port}`);
});
