# Adaptive Health

Adaptive Health is an autonomous health optimization agent for the Loop Engineering Hackathon.

It demonstrates a closed loop:

```text
Observe -> Diagnose -> Hypothesize -> Act -> Evaluate -> Remember -> Repeat
```

The frontend/dashboard can call this backend directly. The repo currently focuses on backend, agent logic, and sponsor integrations because the website/dashboard are owned separately.

## Quick Start

```bash
npm install
npm run dev
```

The API starts on `http://127.0.0.1:8787` by default.

Useful endpoints:

```text
GET  /health
GET  /api/state
GET  /api/timeline
GET  /api/integrations/status
POST /api/goal
POST /api/advance-day
POST /api/reset
```

Example:

```bash
curl -X POST http://localhost:8787/api/advance-day
```

## Sponsor Integrations

At least four sponsor integrations are represented as actual implementation surfaces:

| Sponsor | Role | Status | Files |
| --- | --- | --- | --- |
| Nexla | Normalized health/context data layer | **Live** | `src/integrations/nexla.js` |
| Zero.xyz | Reasoning agents | **Live** (Diagnostician) | `src/integrations/zero.js` |
| Pomerium | Secure bridge for user actions | **Live** (self-hosted mTLS) | `src/integrations/pomerium.js`, `src/services/actions-service.js`, `infra/pomerium/` |
| AWS | Scheduled autonomous orchestration | **Live** (deployed) | `src/lambda.js`, `infra/aws/template.yaml` |
| Akash | Persistent worker deployment | **Live** (deployed) | `Dockerfile`, `deploy.akash.yaml`, `src/integrations/akash.js` |

The app runs with deterministic demo fallbacks, then switches to live integrations when the matching environment variables are present (and, for Pomerium, when the local proxy is running).

## Frontend Contract

### `GET /api/state`

Returns the current goal, current day, metrics, active experiment, timeline, memory, and integration status.

### `POST /api/advance-day`

Runs one complete agent cycle and returns:

```json
{
  "cycle": {
    "day": 1,
    "observation": {},
    "diagnosis": {},
    "experiment": {},
    "action": {},
    "evaluation": {},
    "memory": {}
  },
  "state": {}
}
```

### `POST /api/goal`

Body:

```json
{ "goal": "increase_energy" }
```

## Nexla Setup (LIVE)

Nexla is the most important sponsor for this project, and it's wired to a real account. Each `advance-day` cycle POSTs that day's raw signals to a Nexla webhook source and verifies Nexla accepted and schema-validated them against the live nexset — two genuine live calls, not a canned response. See `docs/SPONSOR_INTEGRATIONS.md` for why this isn't a full read-back round trip (a real platform limitation found and worked around, not a shortcut).

Required env (see `.env.example`):

```text
NEXLA_API_URL=https://dev-api-express-code.nexla.com/
NEXLA_SERVICE_KEY=<from express.dev>
NEXLA_WEBHOOK_URL=<hosted_url from the webhook source>
NEXLA_NEXSET_ID=<source_nexset_id once materialized>
```

See `docs/SPONSOR_INTEGRATIONS.md` for the exact `nexla-cli` commands used to build the pipeline.

## Zero.xyz Setup (LIVE — Diagnostician only)

Zero.xyz is a capability marketplace, not a fixed API — there's no key to set. One-time auth on this machine:

```bash
zero auth login   # device-code flow, opens a browser approval link
```

Then in `.env`:

```text
ZERO_LIVE=true          # opt-in; each Diagnostician call spends real USDC
ZERO_MAX_PAY=0.10        # per-call spend cap (optional, defaults to 0.10)
```

Each `advance-day` cycle searches Zero fresh, pays for a live chat-completion capability to diagnose the bottleneck, and falls back to the existing deterministic logic if the search/payment/response fails for any reason. See `docs/SPONSOR_INTEGRATIONS.md` for details and reliability notes.

## Pomerium Setup (LIVE — self-hosted, pure mTLS)

Pomerium protects action execution (calendar writes, reminders). It's self-hosted — open-source Pomerium has no API-key/service-account feature (that's Enterprise-only), so this uses mutual TLS instead of a bearer token:

```bash
cd infra/pomerium
./generate-certs.sh     # local CA + server cert + client cert, no IdP involved
docker compose up -d    # starts the Pomerium proxy on :8443
```

`.env`:

```text
POMERIUM_ACTION_URL=https://adaptive-health-actions.localhost.pomerium.io:8443/execute
POMERIUM_CLIENT_CERT_PATH=./infra/pomerium/certs/client.crt
POMERIUM_CLIENT_KEY_PATH=./infra/pomerium/certs/client.key
POMERIUM_CA_PATH=./infra/pomerium/certs/ca.crt
```

`npm run dev` also starts the protected "actions" upstream (`src/services/actions-service.js`) that Pomerium fronts. A request without the right client cert gets a real 403 from Pomerium; with it, the request is verified and forwarded. See `docs/SPONSOR_INTEGRATIONS.md` for the full architecture and how to regenerate certs.

## AWS Setup (LIVE — deployed)

`src/lambda.js` exports `handler` for a daily EventBridge/Lambda loop, and it's actually deployed: Lambda + DynamoDB (real persistence, not the local JSON file) + EventBridge Scheduler (`rate(1 day)`), stack `adaptive-health` in `us-west-2`. See `docs/SPONSOR_INTEGRATIONS.md` for the exact redeploy commands (packaging needs a clean staging directory — `template.yaml`'s `CodeUri` must not zip the repo root now that it also contains `frontend/` and secret-bearing files).

## Akash Setup (LIVE — deployed)

Deployed and serving traffic on Akash's decentralized cloud via `console-axi` (github.com/baktun14/console-axi), an agent-native CLI for the Akash Console managed wallet (server-side signing — no private keys handled locally):

```bash
console-axi login --with-key <key>   # key from console.akash.network/user/api-keys
console-axi deploy --sdl deploy.akash.yaml --deposit 0.5
```

The app self-detects when it's running on Akash via the `AKASH_DEPLOYMENT_SEQUENCE` env var Akash injects automatically (`src/integrations/akash.js`). See `docs/SPONSOR_INTEGRATIONS.md` for the full build/push/redeploy workflow and a real bug it caught (server defaulting to a loopback-only bind, invisible to Akash's ingress).
