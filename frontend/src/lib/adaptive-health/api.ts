export type SponsorKey = "nexla" | "zero" | "pomerium" | "aws" | "akash";

export interface IntegrationStatus {
  sponsor: string;
  role: string;
  mode: string;
  configured: boolean;
  note?: string;
  nexsetId?: string;
  dynamoTable?: string | null;
  files?: string[];
  services?: string[];
}

export interface HealthMetrics {
  energy: number;
  sleepHours: number;
  sleepQuality: number;
  steps: number;
  workoutCompleted: boolean;
  restingHeartRate: number;
  caffeineAfter2pm: boolean;
  proteinGrams: number;
}

export interface Observation {
  date: string;
  goal: string;
  metrics: HealthMetrics;
  signals: string[];
  summary: string;
  source?: string;
  normalizedBy?: string;
}

export interface Diagnosis {
  rootCause: string;
  confidence: number;
  evidence: string[];
  category?: string;
  reasoningSource?: string;
  zeroError?: string;
}

export interface Experiment {
  hypothesis: string;
  intervention: string;
  successMetric: string;
  expectedImprovement: number;
  durationDays: number;
}

export interface SuggestedAction {
  actionType: string;
  title: string;
  scheduledFor?: string;
  description?: string;
  status: string;
  securedBy?: string;
  upstream?: {
    confirmationId?: string;
    executedAt?: string;
    actionType?: string;
  };
}

export interface Evaluation {
  success: boolean;
  metric: string;
  before: number;
  after: number;
  delta: number;
  lesson: string;
}

export interface MemoryExperiment {
  name: string;
  hypothesis: string;
  result: "success" | "failed" | string;
  energyDelta: number;
  lesson: string;
}

export interface AdaptiveCycle {
  day: number;
  date: string;
  observation: Observation;
  diagnosis: Diagnosis;
  experiment: Experiment;
  action: SuggestedAction;
  evaluation: Evaluation;
  memory: {
    experiments: MemoryExperiment[];
    lessons: string[];
  };
  sponsorPath: string[];
}

export interface AdaptiveHealthState {
  goal: string;
  currentDay: number;
  energyScore: number;
  currentBottleneck: string;
  activeExperiment: Experiment | null;
  suggestedActions: SuggestedAction[];
  timeline: AdaptiveCycle[];
  memory: {
    experiments: MemoryExperiment[];
    lessons: string[];
  };
  integrations: Record<SponsorKey, IntegrationStatus>;
}

export interface AdvanceDayResponse {
  cycle: AdaptiveCycle;
  state: AdaptiveHealthState;
}

const API_BASE = process.env.NEXT_PUBLIC_ADAPTIVE_HEALTH_API_URL || "http://127.0.0.1:8787";

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {})
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${init?.method || "GET"} ${path} failed: ${response.status} ${body}`);
  }

  return response.json() as Promise<T>;
}

export function getAdaptiveHealthState() {
  return requestJson<AdaptiveHealthState>("/api/state");
}

export function advanceAdaptiveHealthDay() {
  return requestJson<AdvanceDayResponse>("/api/advance-day", { method: "POST" });
}

export function resetAdaptiveHealthDemo() {
  return requestJson<AdaptiveHealthState>("/api/reset", { method: "POST" });
}

export function formatGoal(goal: string) {
  return goal
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

