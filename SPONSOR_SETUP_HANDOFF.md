# Sponsor Tooling Setup Handoff

This session set up two sponsor tools **at the machine level** (auth, CLIs, config) — it did not
touch app integration code. That work belongs to whoever is wiring `src/integrations/*.js`
(see [README.md](README.md) and [CODEX_HANDOFF.md](CODEX_HANDOFF.md)).

## Zero.xyz — done

- Installed globally: `@zeroxyz/cli@1.26.0` (`npm i -g @zeroxyz/cli`)
- Ran `zero init` — installed the `zero` skill and registered hooks in `~/.claude/settings.json`
  (and, as a side effect of the installer, in config for several other AI tools present on this
  machine: Codex, Cursor, Continue, Copilot, Kiro, Devin, Qwen — not scoped to this project)
- Ran `zero auth login` — signed in as `vamika_singhal@berkeley.edu`
- Wallet: `0x3774510b8b7fc7c33273B2A2af330654923E0915`, $0 balance, **$5 welcome bonus granted**
  for paid capability calls
- Session persisted to the shared `~/.zero/config.json` — already usable by the `zero` CLI or
  any Zero-aware agent on this machine, no per-project setup needed

App-level integration (`ZERO_LIVE`, `ZERO_MAX_PAY` env vars, the Diagnostician wiring) is
already documented in [README.md](README.md#zeroxyz-setup-live--diagnostician-only) — that part
was done in an earlier session, not this one.

**Not done (explicitly declined by user):** building/hosting a demo site via Zero's free
hosting capability.

## AWS — done

- Installed AWS CLI v2 (`aws-cli/2.36.2`) via the official `awscli.amazonaws.com` installer,
  PATH updated in `~/.zshrc`
- `aws login --region us-west-2` — browser-based sign-in, no keys entered
- Verified: `aws sts get-caller-identity` → Account `668425683898`, **signed in as root**
  (not an IAM user — fine for a hackathon, but not best practice long-term)
- Session valid 12h, renewable up to 90 days without re-browser-auth
- `aws configure agent-toolkit --yes --region us-east-1` — run manually by the user (blocked
  from automated execution by the Claude Code sandbox classifier as an interactive wizard)
- Verified via `aws agent-toolkit list-available-skills --region us-east-1` — full catalog
  returned (Bedrock, CDK, serverless, containers, observability, billing, etc.), now available
  as Claude Code skills in this project
- Saved AWS's official experience rules to [CLAUDE.md](CLAUDE.md) (MCP-first, skill-first,
  IaC preference, Secrets Manager safety rule — already reflected in this repo's CLAUDE.md)

**Note:** the Agent Toolkit service itself is pinned to `us-east-1` regardless of the account's
working region (`us-west-2` here) — that's a current constraint of the service, not a mistake.

**Not done:** any actual AWS resource creation. `src/lambda.js` and `infra/aws/template.yaml`
are still scaffolded per the existing README, not deployed.

## Open items for whoever picks this up

- AWS is authenticated as root — consider creating a scoped IAM user/role before deploying
  real infrastructure.
- Zero hooks are installed machine-wide across multiple AI tools, not just this project — fine
  to leave, but worth knowing if debugging unexpected `zero`-related behavior in another tool.
- Neither tool has been wired into the app itself beyond what predates this session (Zero's
  Diagnostician integration, per README).
