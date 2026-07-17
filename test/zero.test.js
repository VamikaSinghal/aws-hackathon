import test from "node:test";
import assert from "node:assert/strict";
import { __zeroTestHooks } from "../src/integrations/zero.js";

test("Zero capability ranking avoids known-bad Groq and prefers agent402/OpenRouter", () => {
  const groq = {
    slug: "groq-chat-0362cf4f",
    canonicalName: "Groq Chat Completion",
    cost: { amount: "0.008" },
    rating: { score: "0.21", successRate: "0.56" },
    reviewCount: 4,
    activationCount: 108
  };
  const agent402 = {
    slug: "agent402-tools-llm-inference-proxy-gpt-4o-mini-0d820d98",
    canonicalName: "agent402.tools LLM Inference Proxy (GPT-4o-mini)",
    cost: { amount: "0.01" },
    rating: { score: "0.88", successRate: "0.54" },
    reviewCount: 2,
    activationCount: 39
  };
  const openrouter = {
    slug: "openrouter-withzero-xyz-openrouter-multi-model-chat-completion-gateway-afc45be7",
    canonicalName: "OpenRouter Multi-Model Chat Completion Gateway",
    cost: { amount: "0.001" },
    rating: { score: "0.92", successRate: "0.50" },
    reviewCount: 2,
    activationCount: 12
  };

  assert.ok(__zeroTestHooks.capabilityScore(agent402) > __zeroTestHooks.capabilityScore(groq));
  assert.ok(__zeroTestHooks.capabilityScore(openrouter) > __zeroTestHooks.capabilityScore(groq));
});

test("Zero request helpers produce provider-compatible chat settings", () => {
  assert.equal(
    __zeroTestHooks.pickModel(
      { canonicalName: "agent402.tools LLM Inference Proxy (GPT-4o-mini)" },
      { description: "Model ID - gpt-4o-mini" }
    ),
    "gpt-4o-mini"
  );
  assert.equal(
    __zeroTestHooks.pickModel(
      { canonicalName: "OpenRouter Multi-Model Chat Completion Gateway" },
      { description: "OpenRouter model ID" }
    ),
    "openai/gpt-4o-mini"
  );
  assert.equal(
    __zeroTestHooks.requiresStreamFalse({ required: ["model", "messages", "stream"] }),
    true
  );
});

test("Zero root-cause normalization turns terse labels into UI-friendly diagnoses", () => {
  const observation = {
    signals: ["low_morning_protein"],
    metrics: {
      proteinGrams: 54,
      workoutCompleted: true,
      caffeineAfter2pm: false
    }
  };

  assert.equal(
    __zeroTestHooks.normalizeRootCause("low_morning_protein", "protein_intake", observation),
    "Low morning protein is likely causing an energy dip despite better sleep."
  );
});
