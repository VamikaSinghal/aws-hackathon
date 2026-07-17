# Sponsor Integration Notes

## Nexla — LIVE

Nexla is the core integration and should be demoed first. Adaptive Health treats Nexla as the health data layer: fragmented wearable, calendar, nutrition, and weather signals become a single normalized health-context object.

This is wired to a real Nexla account (not just demo-shaped fallback data). Every `advance-day` cycle does two genuine live calls:

1. The day's raw signals (sleep, steps, workout, calendar, weather) are POSTed to a Nexla-hosted webhook source (`NEXLA_WEBHOOK_URL`) — a real ingest, schema-validated against the nexset Nexla detected on first payload.
2. The adapter then does a `GET {NEXLA_API_URL}/nexla/nexsets/{id}` to verify Nexla still holds a valid `output_schema` for that nexset (a genuine live confirmation call).

**Architecture note**: this is *not* a full read-back round trip. `/nexla/nexsets/{id}`'s `samples` field turned out to be a frozen snapshot taken at schema-detection time, not a live tail of the most recently ingested record — confirmed by pushing a distinctive marker value and finding `samples[0]` never changed, even after a 30s wait. There's no live per-record read endpoint on this API surface. So rather than falsely claim a round trip, the adapter normalizes the same payload it just pushed (which is already schema-conformant, since it authored it) once Nexla's accept + schema-verify calls both succeed.

If either live call fails for any reason, the adapter catches it and falls back to local demo data so the loop never breaks mid-demo — check `observation.normalizedBy` in the API response (`nexla-live-ingest-verified` vs `nexla-live-error-fallback` vs `nexla-shaped-local-fallback`) to see which happened on a given cycle.

Relevant implementation:

- `src/integrations/nexla.js`
- `NEXLA_API_URL` — agent API base (from the hackathon's `nexla-cli` docs, not the marketing site)
- `NEXLA_SERVICE_KEY` — mints a fresh bearer token per call via `nexla-cli login --service-key` (falls back to a static `NEXLA_TOKEN` if the CLI binary isn't on PATH, e.g. in Lambda)
- `NEXLA_WEBHOOK_URL` — the `hosted_url` returned when the webhook source was created
- `NEXLA_NEXSET_ID` — the nexset that materializes after the first webhook payload

Setup used for this hackathon (repeatable if the nexset needs to be rebuilt):

```bash
export NEXLA_API_URL=https://dev-api-express-code.nexla.com/
export NEXLA_TOKEN=$(nexla-cli login --service-key "$NEXLA_SERVICE_KEY")
nexla-cli sources create --name adaptive-health-context --connector webhook --output json
# -> note the returned "hosted_url"
nexla-cli sources sample <source_id> --payload '{"date":"...", "energy":61, ...}'
nexla-cli sources get <source_id> --wait-until source_nexset_id
# -> source_nexset_id is NEXLA_NEXSET_ID
```

Docs:

- https://nexla.com/agent-cli/ (the standalone CLI used here — service key comes from https://express.dev/)
- https://docs.nexla.com/

## Zero.xyz — LIVE (Diagnostician only)

Zero.xyz is **not** a fixed reasoning API — it's a capability marketplace and payment layer (search → inspect → call → pay → review) for calling other services' capabilities on demand. The original scaffold guessed `ZERO_API_URL`/`ZERO_API_KEY` env vars, which don't correspond to anything real; that's been replaced.

The Diagnostician role now does a genuine live call each cycle when `ZERO_LIVE=true`:

1. `zero search "LLM chat completion reasoning" --status healthy` — search fresh every cycle (rankings/prices churn).
2. Walk the top few results, `zero get <token>` each until one has an OpenAI-compatible `{model, messages}` body schema.
3. `zero fetch <url> --capability <token> --max-pay $ZERO_MAX_PAY --json` — pays automatically (x402/MPP, including cross-chain bridging), asking for a JSON diagnosis with a fixed `category` enum (`workout_timing` / `caffeine_timing` / `protein_intake` / `maintain_routine`) so downstream experiment selection stays deterministic regardless of the LLM's exact wording.
4. `zero review <runId> --success/--no-success --accuracy --value --reliability` — best-effort, never blocks the loop.

Scientist and Evaluator stay deterministic (cheaper, faster, and the user chose to scope live spend to Diagnostician only).

**Reliability note**: several of the cheap/free community capabilities on Zero returned upstream 502/500s during testing even after payment succeeded (a real-world marketplace risk, not a bug here). The adapter catches any failure — search, schema mismatch, payment, or bad response — and falls back to the same deterministic diagnosis logic the rest of the loop already had, so the demo never breaks. Check `diagnosis.reasoningSource` (`"zero.xyz"` vs `"deterministic-fallback"`) and `diagnosis.zeroError` on each cycle to see what actually happened.

Auth is via `zero auth login` (device-code flow) on this machine — there's no API key to configure. `zero auth whoami` / `zero wallet balance` show the signed-in account and funds.

Relevant implementation:

- `src/integrations/zero.js`
- `ZERO_LIVE=true` — opt-in; unset/false keeps free deterministic-only mode (also what `npm test` runs with, so tests stay fast and offline)
- `ZERO_MAX_PAY` — per-call spend cap passed to `zero fetch` (default `0.10` USDC)
- `ZERO_SEARCH_QUERY` — override the capability search query (default `"LLM chat completion reasoning"`)

## Pomerium — LIVE (self-hosted, pure mTLS)

Pomerium secures the action bridge between the autonomous agent and sensitive services like calendar/reminders. It's genuinely self-hosted here, not an API you sign up for — **open-source Pomerium has no API-key-style "service accounts"; that's an Enterprise/Zero-only feature** (confirmed against the docs; the original scaffold's `POMERIUM_SERVICE_ACCOUNT_JWT` design assumed something that doesn't exist in Core).

Architecture actually running:

1. `infra/pomerium/generate-certs.sh` creates a local CA plus a server cert (for Pomerium's own HTTPS listener) and a client cert (for the Adaptive Health backend). No identity provider anywhere in the chain.
2. `infra/pomerium/docker-compose.yml` runs the Pomerium proxy (`docker compose up -d` from that directory), fronting `host.docker.internal:8788` — the actions upstream started in-process by `src/server.js` (`src/services/actions-service.js`).
3. `infra/pomerium/config.yaml` sets `downstream_mtls` + a route policy requiring `client_certificate.fingerprint` to match our one pinned client cert (`or: [{client_certificate: {fingerprint: ...}}]`) — pure mTLS, verified live: a request without the client cert gets Pomerium's own 403 page; with it, the request is forwarded and executed.
4. `src/integrations/pomerium.js` calls through the proxy via `node:https` with `{cert, key, ca}` from `POMERIUM_CLIENT_CERT_PATH`/`POMERIUM_CLIENT_KEY_PATH`/`POMERIUM_CA_PATH`. Any failure (Pomerium/Docker down, cert mismatch) is caught and falls back to `simulated_success` so the demo loop never breaks.

Regenerating certs: run `generate-certs.sh` again, then update the `fingerprint` in `config.yaml` to match the new `client.crt` (`openssl x509 -in certs/client.crt -noout -fingerprint -sha256`), then `docker compose restart` in `infra/pomerium/`.

Relevant implementation:

- `src/integrations/pomerium.js`
- `src/services/actions-service.js` — the protected upstream
- `infra/pomerium/config.yaml`, `docker-compose.yml`, `generate-certs.sh`
- `POMERIUM_ACTION_URL`, `POMERIUM_CLIENT_CERT_PATH`, `POMERIUM_CLIENT_KEY_PATH`, `POMERIUM_CA_PATH`

Docs:

- https://www.pomerium.com/docs/capabilities/mtls-clients
- https://www.pomerium.com/docs/reference/downstream-mtls-settings

## AWS — LIVE (deployed)

AWS is the production orchestration path, and it's actually deployed (account `668425683898`, `us-west-2`, CloudFormation stack `adaptive-health`):

- **Lambda** (`adaptive-health-AdaptiveHealthFunction-*`, Node.js 22.x) — runs `src/lambda.handler`, which calls the same `advanceAgentCycle` loop as the local API.
- **DynamoDB** (`adaptive-health-AdaptiveHealthMemory-*`, pay-per-request) — `src/storage/file-store.js` now genuinely branches on `AWS_DYNAMODB_TABLE`: local dev uses the JSON file, but the Lambda (which has that env var injected by the SAM template) persists state as a DynamoDB item instead. Verified via `aws dynamodb scan` after a real invoke — state round-trips correctly across invocations.
- **EventBridge Scheduler** (`AdaptiveHealthFunctionDailyOptimizationLoop`, `rate(1 day)`, enabled) — invokes the Lambda once a day automatically, so the loop keeps advancing even with the dashboard closed.

Deploying (redo from scratch or after code changes) — `template.yaml`'s `CodeUri: ../../` points at the repo root, which now also contains a `frontend/` app, `.git/`, and `.env`/cert secrets, so **do not package the repo root directly**. Stage a clean directory first:

```bash
rm -rf /tmp/adaptive-health-lambda-build && mkdir -p /tmp/adaptive-health-lambda-build
cp -R src package.json package-lock.json /tmp/adaptive-health-lambda-build/
cd /tmp/adaptive-health-lambda-build && npm ci --omit=dev
# copy infra/aws/template.yaml here too, with CodeUri changed from ../../ to .
aws cloudformation package --template-file template.yaml \
  --s3-bucket adaptive-health-deploy-668425683898 --output-template-file packaged.yaml --region us-west-2
aws cloudformation deploy --template-file packaged.yaml \
  --stack-name adaptive-health --capabilities CAPABILITY_IAM --region us-west-2
```

**Gotcha hit during setup**: `DynamoDBDocumentClient` throws on `undefined` object fields (several optional diagnostic fields — `nexlaError`, etc. — are `undefined` when absent) unless constructed with `marshallOptions: { removeUndefinedValues: true }` (already set in `file-store.js`).

**Note:** signed in as AWS **root**, not a scoped IAM user — fine for a hackathon, not for production.

Relevant implementation:

- `src/lambda.js`
- `src/storage/file-store.js` — DynamoDB vs. local-file branch
- `infra/aws/template.yaml`

Docs:

- https://docs.aws.amazon.com/lambda/latest/dg/with-eventbridge-scheduler.html

## Akash — LIVE (deployed)

Akash provides the persistent runtime path for the worker so optimization can continue beyond a browser session, and it's actually deployed and serving traffic on Akash's decentralized cloud right now.

- **Image**: `vamikasinghal/adaptive-health:v3` on Docker Hub, built with `docker buildx build --platform linux/amd64` (most Akash providers are x86_64).
- **Deployed via `console-axi`** (github.com/baktun14/console-axi — an agent-native CLI for the Akash Console managed wallet; server-side signing, no private key handling on this machine). Auth: `console-axi login --with-key <key>` (key from console.akash.network/user/api-keys).
- **`deploy.akash.yaml`** was regenerated with `console-axi sdl init web --image ... --port 8787 --as 80 --cpu 0.5 --memory 512Mi --storage 1Gi`, then validated (`sdl validate`), screened against real provider supply (`sdl screen` — 55 matching providers), and deployed (`console-axi deploy --sdl deploy.akash.yaml --deposit 0.5`).
- **Self-detection**: `src/integrations/akash.js` checks `AKASH_DEPLOYMENT_SEQUENCE` (auto-injected by the Akash provider into the container) to report `mode: "running-on-akash"` with the real provider address and public hostname — genuinely self-aware, not a static flag.
- **Deliberately runs in demo-fallback mode** for Nexla/Zero/Pomerium (no live credentials passed into the SDL's `env`) — Akash's role here is proving the app can run continuously on decentralized infra, not carrying every other sponsor's secrets onto a third-party/less-trusted provider's infrastructure.

**Real bug caught and fixed**: the app's HTTP server defaulted to binding `127.0.0.1` (loopback-only) — fine for local dev, but unreachable through Akash's ingress from outside the container (502 Bad Gateway on first deploy). Fixed via `ENV HOST=0.0.0.0` in the `Dockerfile` (container-only default; local dev behavior unchanged) and confirmed working by testing the built image locally before pushing.

**Redeploying after a code change:**

```bash
docker buildx build --platform linux/amd64 -t vamikasinghal/adaptive-health:vN --load .
# sanity check locally first:
docker run --rm -d --name test -p 18787:8787 vamikasinghal/adaptive-health:vN
curl http://127.0.0.1:18787/health
docker stop test
docker push vamikasinghal/adaptive-health:vN
# update deploy.akash.yaml's image tag to vN, then:
console-axi deployment update <dseq> --sdl deploy.akash.yaml
```

Relevant implementation:

- `Dockerfile`, `.dockerignore` (excludes `.env`, `infra/pomerium/certs`, `frontend/`, `.git` — do not remove; the Dockerfile's `COPY . .` would otherwise ship live credentials in a public image)
- `deploy.akash.yaml`
- `src/integrations/akash.js`

Docs:

- https://akash.network/docs/developers/deployment/akash-sdl/
- https://github.com/baktun14/console-axi

