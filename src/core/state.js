export function createInitialState() {
  const now = new Date().toISOString();

  return {
    goal: "increase_energy",
    currentDay: 0,
    energyScore: 61,
    currentBottleneck: "Unknown",
    activeExperiment: null,
    suggestedActions: [],
    timeline: [],
    memory: {
      experiments: [],
      lessons: []
    },
    createdAt: now,
    updatedAt: now
  };
}

