const demoDays = [
  {
    date: "2026-07-17",
    metrics: {
      energy: 61,
      sleepHours: 5.8,
      sleepQuality: 62,
      steps: 4200,
      workoutCompleted: false,
      restingHeartRate: 74,
      caffeineAfter2pm: true,
      proteinGrams: 48
    },
    calendar: [
      { title: "Class", start: "09:00", end: "12:00" },
      { title: "Team build", start: "13:00", end: "18:00" }
    ],
    weather: { condition: "sunny", temperatureF: 71 }
  },
  {
    date: "2026-07-18",
    metrics: {
      energy: 69,
      sleepHours: 6.2,
      sleepQuality: 70,
      steps: 7600,
      workoutCompleted: true,
      restingHeartRate: 70,
      caffeineAfter2pm: true,
      proteinGrams: 52
    },
    calendar: [
      { title: "Hackathon", start: "10:00", end: "18:00" },
      { title: "Workout", start: "19:00", end: "20:00" }
    ],
    weather: { condition: "cloudy", temperatureF: 68 }
  },
  {
    date: "2026-07-19",
    metrics: {
      energy: 76,
      sleepHours: 7.1,
      sleepQuality: 81,
      steps: 8100,
      workoutCompleted: true,
      restingHeartRate: 67,
      caffeineAfter2pm: false,
      proteinGrams: 54
    },
    calendar: [
      { title: "Demo prep", start: "11:00", end: "15:00" },
      { title: "Workout", start: "19:00", end: "20:00" }
    ],
    weather: { condition: "sunny", temperatureF: 74 }
  },
  {
    date: "2026-07-20",
    metrics: {
      energy: 83,
      sleepHours: 7.4,
      sleepQuality: 86,
      steps: 9000,
      workoutCompleted: true,
      restingHeartRate: 65,
      caffeineAfter2pm: false,
      proteinGrams: 86
    },
    calendar: [
      { title: "Deep work", start: "09:30", end: "12:00" },
      { title: "Workout", start: "19:00", end: "20:00" }
    ],
    weather: { condition: "sunny", temperatureF: 72 }
  }
];

// Beyond the scripted narrative (days 0-3), keep the story going instead of flatlining on day 4's
// values forever - a judge who keeps clicking "Advance Day" should keep seeing the agent react to
// new bottlenecks, not a frozen evaluation.delta of 0. Deterministic (same dayIndex -> same output)
// so behavior stays reproducible; a repeating setback -> partial recovery -> full recovery cycle
// with a slow capped upward trend across cycles.
const extendedCycleTemplates = [
  { workoutCompleted: false, caffeineAfter2pm: true, proteinGrams: 50, sleepHours: 6.0, energyDelta: -10 },
  { workoutCompleted: true, caffeineAfter2pm: true, proteinGrams: 65, sleepHours: 6.8, energyDelta: -3 },
  { workoutCompleted: true, caffeineAfter2pm: false, proteinGrams: 90, sleepHours: 7.6, energyDelta: 4 }
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function addDays(dateStr, days) {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function generateExtendedDay(dayIndex) {
  const baseline = demoDays[demoDays.length - 1];
  const extraIndex = dayIndex - (demoDays.length - 1);
  const cyclePos = (extraIndex - 1) % extendedCycleTemplates.length;
  const cycleNumber = Math.floor((extraIndex - 1) / extendedCycleTemplates.length);
  const template = extendedCycleTemplates[cyclePos];

  const trendBump = Math.min(cycleNumber * 2, 10);
  const energy = clamp(baseline.metrics.energy + template.energyDelta + trendBump, 55, 95);

  return {
    date: addDays(baseline.date, extraIndex),
    metrics: {
      energy,
      sleepHours: template.sleepHours,
      sleepQuality: clamp(60 + Math.round((energy - 55) * 0.8), 55, 95),
      steps: template.workoutCompleted ? 8500 : 4500,
      workoutCompleted: template.workoutCompleted,
      restingHeartRate: clamp(75 - Math.round((energy - 55) * 0.25), 60, 78),
      caffeineAfter2pm: template.caffeineAfter2pm,
      proteinGrams: template.proteinGrams
    },
    calendar: baseline.calendar,
    weather: baseline.weather
  };
}

export function getDemoHealthContext(dayIndex) {
  if (dayIndex < demoDays.length) {
    return demoDays[dayIndex];
  }
  return generateExtendedDay(dayIndex);
}

