# Frontend API Contract

Base URL for local development:

```text
http://127.0.0.1:8787
```

## Get State

```http
GET /api/state
```

Returns:

```json
{
  "goal": "increase_energy",
  "currentDay": 1,
  "energyScore": 69,
  "currentBottleneck": "Morning workouts conflict with the user's calendar...",
  "activeExperiment": {},
  "suggestedActions": [],
  "timeline": [],
  "memory": {},
  "integrations": {}
}
```

## Advance One Day

```http
POST /api/advance-day
```

Runs:

```text
Nexla observe -> Zero diagnose -> Zero hypothesize -> Pomerium action -> Zero evaluate -> memory update
```

Returns:

```json
{
  "cycle": {
    "day": 1,
    "date": "2026-07-17",
    "observation": {},
    "diagnosis": {},
    "experiment": {},
    "action": {},
    "evaluation": {},
    "memory": {},
    "sponsorPath": [
      "Nexla ingested and schema-validated the health context live",
      "Zero.xyz reasoned over the agent roles (live)",
      "Pomerium executed the action through the self-hosted mTLS-secured bridge (live)",
      "AWS can schedule this loop daily",
      "Akash can keep the worker online"
    ]
  },
  "state": {}
}
```

`sponsorPath` is worth surfacing in the UI — it's a per-cycle, human-readable line per sponsor stating whether that cycle actually went live or fell back to deterministic demo data, which is exactly the "sponsor path" transparency judges look for.

## List Timeline

```http
GET /api/timeline
```

Returns `{ "timeline": [...] }` — every cycle run so far (same shape as `cycle` above), useful for rendering history without re-fetching full state.

## Integration Status

```http
GET /api/integrations/status
```

Returns the live/demo-fallback status of all 5 sponsors, e.g.:

```json
{
  "nexla": { "sponsor": "Nexla", "mode": "live", "configured": true, "...": "..." },
  "zero": { "sponsor": "Zero.xyz", "mode": "capability-marketplace", "configured": true, "...": "..." },
  "pomerium": { "sponsor": "Pomerium", "mode": "live-mtls", "configured": true, "...": "..." },
  "aws": { "sponsor": "AWS", "mode": "local-with-deploy-template", "configured": false, "...": "..." },
  "akash": { "sponsor": "Akash", "mode": "deploy-manifest-ready", "configured": true, "...": "..." }
}
```

`mode`/`configured` differ per sponsor's shape — good for a "sponsor status" panel on the dashboard. This same object is also embedded as `integrations` on `GET /api/state` and in `advance-day`'s `state`.

## Set Goal

```http
POST /api/goal
Content-Type: application/json

{ "goal": "increase_energy" }
```

## Reset Demo

```http
POST /api/reset
```
