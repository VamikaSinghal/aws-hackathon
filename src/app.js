import { advanceAgentCycle } from "./core/agent-loop.js";
import { createInitialState } from "./core/state.js";
import { readState, writeState } from "./storage/file-store.js";
import { createNexlaClient } from "./integrations/nexla.js";
import { createZeroReasoningProvider } from "./integrations/zero.js";
import { createPomeriumActionClient } from "./integrations/pomerium.js";
import { getAwsIntegrationStatus } from "./integrations/aws.js";
import { getAkashIntegrationStatus } from "./integrations/akash.js";

export function createAdaptiveHealthApp() {
  const nexla = createNexlaClient();
  const reasoning = createZeroReasoningProvider();
  const actions = createPomeriumActionClient();

  async function load() {
    return (await readState()) || createInitialState();
  }

  async function save(state) {
    await writeState(state);
    return state;
  }

  return {
    async getState() {
      const state = await load();
      return {
        ...state,
        integrations: await this.getIntegrationStatus()
      };
    },

    async getIntegrationStatus() {
      return {
        nexla: nexla.status(),
        zero: reasoning.status(),
        pomerium: actions.status(),
        aws: getAwsIntegrationStatus(),
        akash: getAkashIntegrationStatus()
      };
    },

    async advanceDay() {
      const state = await load();
      const result = await advanceAgentCycle(state, { nexla, reasoning, actions });
      await save(result.state);
      return {
        cycle: result.cycle,
        state: {
          ...result.state,
          integrations: await this.getIntegrationStatus()
        }
      };
    },

    async setGoal(goal) {
      if (!goal || typeof goal !== "string") {
        throw new Error("goal must be a non-empty string");
      }

      const state = await load();
      state.goal = goal;
      state.updatedAt = new Date().toISOString();
      await save(state);
      return this.getState();
    },

    async reset() {
      const state = createInitialState();
      await save(state);
      return this.getState();
    }
  };
}

