import { getDemoHealthContext } from "./demo-data.js";

export async function advanceAgentCycle(state, integrations) {
  const dayIndex = state.currentDay;
  const fallbackContext = getDemoHealthContext(dayIndex);
  const healthContext = await integrations.nexla.getDailyHealthContext({
    dayIndex,
    fallbackContext,
    state
  });

  const observation = buildObservation(state, healthContext);
  const diagnosis = await integrations.reasoning.diagnose({ state, observation });
  const experiment = await integrations.reasoning.createExperiment({
    state,
    observation,
    diagnosis
  });
  const action = await integrations.actions.executeIntervention({ state, experiment });
  const nextContext = getDemoHealthContext(dayIndex + 1);
  const evaluation = await integrations.reasoning.evaluate({
    state,
    observation,
    experiment,
    action,
    nextContext
  });

  const memory = updateMemory(state.memory, experiment, evaluation);
  const cycle = {
    day: dayIndex + 1,
    date: healthContext.date,
    observation,
    diagnosis,
    experiment,
    action,
    evaluation,
    memory,
    sponsorPath: buildSponsorPath({ healthContext, action, integrations })
  };

  const nextState = {
    ...state,
    currentDay: dayIndex + 1,
    energyScore: evaluation.after,
    currentBottleneck: diagnosis.rootCause,
    activeExperiment: experiment,
    suggestedActions: [action],
    timeline: [...state.timeline, cycle],
    memory,
    updatedAt: new Date().toISOString()
  };

  return { cycle, state: nextState };
}

function buildObservation(state, healthContext) {
  const { metrics } = healthContext;
  const signals = [];

  if (metrics.sleepHours < 6.5) signals.push("poor_recovery");
  if (!metrics.workoutCompleted) signals.push("missed_workout");
  if (metrics.caffeineAfter2pm) signals.push("late_caffeine");
  if (metrics.proteinGrams < 70) signals.push("low_morning_protein");
  if (metrics.steps < 6000) signals.push("low_activity");

  return {
    date: healthContext.date,
    goal: state.goal,
    metrics,
    calendar: healthContext.calendar,
    weather: healthContext.weather,
    previousExperiments: state.memory.experiments,
    signals,
    summary: summarizeSignals(signals),
    source: healthContext.source,
    normalizedBy: healthContext.normalizedBy,
    nexlaError: healthContext.nexlaError
  };
}

function buildSponsorPath({ healthContext, action, integrations }) {
  const nexlaLive = healthContext.normalizedBy === "nexla-live-ingest-verified";
  const nexlaLine = nexlaLive
    ? "Nexla ingested and schema-validated the health context live"
    : healthContext.nexlaError
      ? `Nexla fell back to demo data after a live error: ${healthContext.nexlaError}`
      : "Nexla normalized the health context (demo fallback)";

  const zeroLive = integrations.reasoning.status().configured;
  const zeroLine = zeroLive
    ? "Zero.xyz reasoned over the agent roles (live)"
    : "Zero.xyz reasoned over the agent roles (deterministic demo)";

  const pomeriumLine = action.securedBy === "pomerium-mtls"
    ? "Pomerium executed the action through the self-hosted mTLS-secured bridge (live)"
    : "Pomerium protected the action bridge (simulated)";

  return [
    nexlaLine,
    zeroLine,
    pomeriumLine,
    "AWS can schedule this loop daily",
    "Akash can keep the worker online"
  ];
}

function summarizeSignals(signals) {
  if (signals.includes("missed_workout")) {
    return "Energy is low, recovery is weak, and the planned workout was missed.";
  }
  if (signals.includes("late_caffeine")) {
    return "Workout completion improved, but late caffeine is still hurting sleep quality.";
  }
  if (signals.includes("low_morning_protein")) {
    return "Recovery is improving, so morning nutrition is the next likely energy bottleneck.";
  }
  return "Energy is improving and the system should preserve the current routine.";
}

function updateMemory(memory, experiment, evaluation) {
  const result = {
    name: experiment.intervention,
    hypothesis: experiment.hypothesis,
    result: evaluation.success ? "success" : "failed",
    energyDelta: evaluation.delta,
    lesson: evaluation.lesson
  };

  return {
    experiments: [...memory.experiments, result],
    lessons: [...memory.lessons, evaluation.lesson]
  };
}

