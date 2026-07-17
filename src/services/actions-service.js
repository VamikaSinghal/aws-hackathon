import http from "node:http";
import { randomUUID } from "node:crypto";

// The sensitive upstream Pomerium protects: it represents the real calendar/reminder/grocery
// write targets Adaptive Health takes actions against. It only trusts requests that already
// passed through the Pomerium mTLS proxy in front of it - see infra/pomerium/config.yaml.
export function startActionsService(port) {
  const server = http.createServer((request, response) => {
    if (request.method !== "POST" || request.url !== "/execute") {
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "not_found" }));
      return;
    }

    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => {
      let action;
      try {
        action = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
      } catch {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ error: "invalid_json" }));
        return;
      }

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          received: true,
          confirmationId: randomUUID(),
          executedAt: new Date().toISOString(),
          actionType: action.actionType || "unknown"
        })
      );
    });
  });

  server.listen(port, "127.0.0.1", () => {
    console.log(`Pomerium-protected actions service listening on http://127.0.0.1:${port}`);
  });

  return server;
}
