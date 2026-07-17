# Codex Handoff: Adaptive Health

This document is for the next AI coding assistant taking over the project. It supersedes all
earlier handoffs (the original Codex handoff and `SPONSOR_SETUP_HANDOFF.md` — both are now
historical background, not current instructions).

## Project Summary

Project name: **Adaptive Health**

Hackathon: **Loop Engineering Hackathon**

Core idea: an autonomous health optimization agent that observes health data, diagnoses a
bottleneck, runs an experiment, executes an action, evaluates the result, remembers what it
learned, and repeats:

```text
Observe -> Diagnose -> Hypothesize -> Act -> Evaluate -> Remember -> Repeat
```

## Current Status: all 5 sponsors are genuinely live

Every sponsor below is a real, working integration — verified end-to-end this session, not just
scaffolded. `docs/SPONSOR_INTEGRATIONS.md` has the full technical writeup for each; this doc is
the orientation + gotchas summary.

| Sponsor | Status | Where |
| --- | --- | --- |
| Nexla | **Live** | `src/integrations/nexla.js` |
| Zero.xyz | **Live** (Diagnostician only) | `src/integrations/zero.js` |
| Pomerium | **Live** (self-hosted mTLS) | `src/integrations/pomerium.js`, `src/services/actions-service.js`, `infra/pomerium/` |
| AWS | **Live** (deployed) | `src/lambda.js`, `infra/aws/template.yaml`, `src/storage/file-store.js` |
| Akash | **Live** (deployed) | `Dockerfile`, `deploy.akash.yaml`, `src/integrations/akash.js` |

## How To Run

```bash
cd /Users/magichour/Documents/LifeOS/aws-hackathon
npm install
npm run dev
```

This starts **two** listeners: the main API on `http://127.0.0.1:8787`, and a Pomerium-protected
"actions" upstream on `http://127.0.0.1:8788` (`src/services/actions-service.js`) — both are
started from `src/server.js`, one `npm run dev` is enough.

For Pomerium to actually work live (not just fall back), Docker must be running and the proxy
started separately:

```bash
cd infra/pomerium && docker compose up -d
```

`npm test` runs the test suite (fast, offline, ~80ms — deliberately does not touch any live
credentials; see "Cost/safety gates" below for why).

## Credentials

All live credentials are in `.env` (gitignored, already populated — do not need to be re-fetched
unless something expires). `.env.example` documents every variable's purpose without values.
**Do not commit `.env`** or `infra/pomerium/certs/` (also gitignored) — both contain live secrets.

## Sponsor-by-sponsor: architecture and gotchas

### 1. Nexla

Real account, agent API at `https://dev-api-express-code.nexla.com/` (not the marketing site —
this exact host came from the hackathon's `nexla-cli` docs, found via Discord `#nexla`).

Every `advance-day` cycle does two genuine live calls:
1. POST the day's raw signals to a Nexla-hosted webhook source (`NEXLA_WEBHOOK_URL`).
2. GET `/nexla/nexsets/{id}` to verify Nexla still holds a valid `output_schema`.

**Important gotcha**: this is *not* a full read-back round trip, despite what an earlier version
of this code (and its docs) claimed. `/nexla/nexsets/{id}`'s `samples` field is a **frozen
snapshot from schema-detection time**, not a live tail of the most recent record — confirmed by
pushing a distinctive marker value (`energy: 999`) and finding `samples[0]` never changed, even
after 30s. There is no live per-record read endpoint on this API surface (checked the full
OpenAPI schema). So the adapter normalizes the payload it just pushed (already schema-conformant,
since it authored it) once both live calls succeed — labeled `normalizedBy:
"nexla-live-ingest-verified"`. If you're tempted to "fix" this by reading `samples` again, don't
— re-verify with a marker-value test first.

Token minting: `nexla-cli login --service-key <key>` is shelled out to from Node
(`execFileSync`, 10s timeout), cached for 45 min. If `nexla-cli` isn't on PATH (e.g. a future
non-Lambda deploy target), it falls back to a static `NEXLA_TOKEN` if set.

### 2. Zero.xyz

**Not a fixed API** — it's a capability marketplace + payment layer (search → inspect → call →
pay → review), driven via the `zero` CLI. There is no `ZERO_API_KEY` to set; auth is
`zero auth login` (device-code flow), session lives in the machine-wide `~/.zero/config.json`.

Only the **Diagnostician** role calls Zero live (search fresh each cycle for an
OpenAI-compatible chat capability, then pay-per-call); Scientist and Evaluator stay deterministic
— this was an explicit scope decision by the user, not a limitation. Gated behind `ZERO_LIVE=true`
(currently `true` in `.env`) — **critical**: `ZERO_LIVE` must stay opt-in. Earlier in this
project's history, omitting this gate caused `npm test` to make real paid network calls (22s
runtime, real USDC spent) just from running the test suite. Do not remove the gate.

**Known live-reliability issue**: the cheap/free community capabilities (Groq Chat Completion,
CivicMerge x402) frequently return HTTP 502/500 *after payment succeeds* — a real third-party
problem, not a bug here. The adapter catches this and falls back to the same deterministic
diagnosis logic cleanly (check `diagnosis.reasoningSource`: `"zero.xyz"` vs
`"deterministic-fallback"`, and `diagnosis.zeroError` for why). Wallet has ~$4.89 USDC left of a
$5 hackathon welcome bonus as of this handoff.

A stable `category` field (`workout_timing` / `caffeine_timing` / `protein_intake` /
`maintain_routine`) is enforced on every diagnosis (live or fallback) so a live LLM's exact
wording never breaks the downstream experiment-selection logic in `experimentForCategory()`.

### 3. Pomerium

Genuinely **self-hosted**, pure mutual TLS, no identity provider. **Open-source Pomerium has no
API-key-style "service accounts"** — that's an Enterprise/Zero-only feature (confirmed against
docs before building anything; an earlier version of this project incorrectly assumed otherwise).

Architecture: `infra/pomerium/generate-certs.sh` makes a local CA + server cert (Pomerium's own
HTTPS listener) + client cert (this backend). `infra/pomerium/docker-compose.yml` runs the
Pomerium proxy on `:8443`, fronting `host.docker.internal:8788` (the actions-service). The route
policy in `config.yaml` pins trust to one specific client-cert SHA-256 fingerprint via the
`client_certificate` PPL criterion — **not** `valid_client_certificate` (that criterion doesn't
exist; verified against Pomerium's actual Go source on GitHub after two wrong-schema dead ends
from paraphrased doc summaries — `pkg/policy/criteria/client_certificate.go` is the ground truth
if you need to touch this again).

If certs are regenerated, the pinned fingerprint in `config.yaml` must be updated to match:
`openssl x509 -in certs/client.crt -noout -fingerprint -sha256`, then `docker compose restart`.

`src/integrations/pomerium.js` calls through the proxy via `node:https` with a 10s timeout,
presenting the client cert. Any failure (Docker down, cert mismatch, timeout) falls back to
`simulated_success` so the demo loop never breaks.

### 4. AWS

Deployed for real: CloudFormation stack `adaptive-health` in `us-west-2`, account
`668425683898` (signed in as **root** — fine for a hackathon, not production).

- Lambda: `adaptive-health-AdaptiveHealthFunction-zZnXmurBtzqa`
- DynamoDB: `adaptive-health-AdaptiveHealthMemory-H96H4Q5JRPDC` (pay-per-request)
- EventBridge Scheduler: `AdaptiveHealthFunctionDailyOptimizationLoop`, `rate(1 day)`, enabled
- Deploy artifacts bucket: `s3://adaptive-health-deploy-668425683898`

`src/storage/file-store.js` genuinely branches: local dev uses the JSON file
(`AWS_DYNAMODB_TABLE` deliberately unset in `.env`), the deployed Lambda uses DynamoDB (env var
injected automatically by the SAM template — **do not** set `AWS_DYNAMODB_TABLE` in local `.env`
to a table name, it used to be wrongly hardcoded to a made-up name and broke local dev with
DynamoDB errors on every request).

**Packaging gotcha, will bite you again if forgotten**: `infra/aws/template.yaml`'s
`CodeUri: ../../` points at the repo root, which now also contains `frontend/`, `.git/`, and
`.env`/Pomerium's private keys. **Never package the repo root directly** — stage a clean
directory first:

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

Also: `DynamoDBDocumentClient` throws on `undefined` object fields (several optional diagnostic
fields are `undefined` when absent) unless constructed with
`marshallOptions: { removeUndefinedValues: true }` — already set in `file-store.js`, don't remove it.

### 5. Akash

Deployed and serving traffic on Akash's decentralized cloud right now:
**http://7ua73nrso1ck90fgcqtslpr9q0.ingress.jjozzietech.com.au**
(dseq `1784323280475`, provider `akash1sevd2ymtty3dpq9ycxgkhuzzk4fe6mchqdwd4e`, ~$0.61/mo,
~$24 credit remaining from the hackathon's `AKASHLOOP25` coupon).

Deployed via `console-axi` (github.com/baktun14/console-axi — an agent-native CLI for the Akash
Console managed wallet; server-side signing, no private keys handled locally). Auth:
`console-axi login --with-key <key>` (key from `console.akash.network/user/api-keys`).

Image: `vamikasinghal/adaptive-health:v3` on Docker Hub, built with
`docker buildx build --platform linux/amd64` (most Akash providers are x86_64, this machine is
arm64). **`.dockerignore` is critical** — the `Dockerfile`'s `COPY . .` would otherwise ship
`.env` and Pomerium's private keys into a **public** Docker Hub image; verify with
`docker run --rm <image> find /app -iname '.env*' -o -iname '*.key'` before pushing if you ever
touch `.dockerignore`.

**Bug already found and fixed, don't reintroduce it**: the app's HTTP server defaulted to binding
`127.0.0.1` (loopback-only) — invisible to Akash's ingress from outside the container (`502 Bad
Gateway` on first deploy). Fixed via `ENV HOST=0.0.0.0` in the `Dockerfile` (container-only
default; local dev via `npm run dev` still defaults to `127.0.0.1` since `src/server.js` reads
`HOST` from env with that fallback).

`src/integrations/akash.js` self-detects via `AKASH_DEPLOYMENT_SEQUENCE` (auto-injected by Akash
into the container) — reports `mode: "running-on-akash"` with the real provider/hostname, not a
static flag. Deliberately runs in demo-fallback mode for the other 4 sponsors (no live
credentials passed into the SDL's `env`) — Akash's role is proving continuous decentralized
hosting, not carrying every secret onto third-party infra.

Redeploy after a code change:

```bash
docker buildx build --platform linux/amd64 -t vamikasinghal/adaptive-health:vN --load .
docker run --rm -d --name test -p 18787:8787 vamikasinghal/adaptive-health:vN
curl http://127.0.0.1:18787/health   # sanity check before pushing publicly
docker stop test
docker push vamikasinghal/adaptive-health:vN
# update deploy.akash.yaml's image tag to vN, then:
console-axi deployment update 1784323280475 --sdl deploy.akash.yaml
```

## Known gaps / what's left

1. **Frontend has zero backend integration.** `frontend/` (Next.js, teammate-owned) is a fully
   scripted/mocked dashboard — no `fetch`/`axios` anywhere, no API base URL config, all
   "live" data is hardcoded arrays advanced on `setTimeout`. Do not modify it without being asked
   — the teammate owns it and is actively pushing changes. If asked to wire it up, the contract
   is in `docs/FRONTEND_API.md` (base URL `http://127.0.0.1:8787`, all endpoints documented
   including `sponsorPath` on `POST /api/advance-day`, which is exactly the "which sponsor went
   live this cycle" signal judges want to see).
2. **AWS is root-signed-in**, not a scoped IAM user. Fine for the hackathon; flag before any
   production use.
3. **Zero.xyz live capability calls are flaky** (third-party 502/500s). The graceful-fallback
   design handles this correctly and is itself a fair reflection of real marketplace risk — not
   something to "fix" by retrying harder (each retry spends real USDC).

## Cost/safety gates already in place — do not remove

- `ZERO_LIVE` must stay an explicit opt-in env var (unset in test/CI contexts). Removing this
  gate means `npm test` silently spends real money.
- Every live external call (`fetch`, `execFileSync`, `https.request`) has a timeout. Removing one
  risks `advance-day` hanging indefinitely if that specific service stalls.
- `.dockerignore` and the AWS packaging staging-directory step both exist specifically to keep
  `.env` and `infra/pomerium/certs/` out of build artifacts. Don't take shortcuts here even under
  time pressure — a leaked credential in a public Docker Hub image is a real incident, not a demo
  inconvenience.

## Testing

```bash
npm test              # fast (~80ms), offline, no live credentials touched
npm run dev            # starts the local API + actions-service
curl -X POST http://127.0.0.1:8787/api/advance-day | python3 -m json.tool
```

`test/agent-loop.test.js` intentionally runs in pure demo-fallback mode for every sponsor
(constructs each client with no env configured beyond what's ambient) — this is correct and
should stay that way; don't "improve" the test by pointing it at live credentials.
