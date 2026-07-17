import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/core/state.js";
import { advanceAgentCycle } from "../src/core/agent-loop.js";
import { createNexlaClient } from "../src/integrations/nexla.js";
import { createZeroReasoningProvider } from "../src/integrations/zero.js";
import { createPomeriumActionClient } from "../src/integrations/pomerium.js";

test("advanceAgentCycle runs one complete sponsor-backed demo cycle", async () => {
  const initial = createInitialState();
  const result = await advanceAgentCycle(initial, {
    nexla: createNexlaClient(),
    reasoning: createZeroReasoningProvider(),
    actions: createPomeriumActionClient()
  });

  assert.equal(result.state.currentDay, 1);
  assert.equal(result.state.timeline.length, 1);
  assert.equal(result.cycle.observation.goal, "increase_energy");
  assert.equal(result.cycle.action.status, "simulated_success");
  assert.ok(result.cycle.evaluation.delta > 0);
  assert.ok(result.cycle.sponsorPath.some((item) => item.includes("Nexla")));
});

