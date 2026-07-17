// ── Core Types for Orchestration System ──

export type StageType = 'Collect' | 'Diagnose' | 'Plan' | 'Act' | 'Observe' | 'Learn';
export type AgentType = 'Planner' | 'Critic' | 'Workout Expert' | 'Nutrition Expert';
export type MessageType = 'proposal' | 'feedback' | 'approval' | 'block' | 'refinement' | 'consensus';
export type SponsorType = 'Nexla' | 'Zero.xyz' | 'AWS' | 'Pomerium' | 'Akash';

// ── Health Metrics ──
export interface HealthMetrics {
  sleep: {
    duration: number; // minutes
    quality: number; // 0-100
  };
  hrv: {
    current: number; // ms
    baseline: number; // ms
    percentOfBaseline: number; // %
  };
  recovery: {
    score: number; // 0-100
    status: 'red' | 'yellow' | 'green';
  };
  steps: number;
  activeCalories: number;
  restingHeartRate: number;
}

// ── Agent Messages ──
export interface AgentMessage {
  id: string;
  timestamp: number;
  agent: AgentType;
  type: MessageType;
  content: string;
  structuredData?: Record<string, any>;
  iteration?: number; // for multi-turn debates
}

// ── Agent Reasoning ──
export interface AgentReasoning {
  agent: AgentType;
  proposal?: string;
  feedback?: string;
  approved: boolean;
  reasoning: string;
  confidence: number; // 0-100
}

// ── Sponsor Message (data flowing through sponsor layer) ──
export interface SponsorMessage {
  id: string;
  timestamp: number;
  source: SponsorType;
  destination: SponsorType;
  stage: StageType;
  messageType: 'data' | 'request' | 'response' | 'action';
  content: string;
  dataSize?: number; // bytes, for visualization
}

// ── Actions proposed and executed ──
export interface HealthAction {
  id: string;
  action: string;
  urgency: 'low' | 'medium' | 'high';
  rationale: string;
  status: 'proposed' | 'approved' | 'blocked' | 'executed';
  executor: SponsorType;
  blockedBy?: AgentType;
  blockReason?: string;
}

// ── Single orchestration loop execution ──
export interface OrchestrationLoop {
  id: string;
  loopNumber: number;
  startedAt: number;
  completedAt?: number;

  // Loop stages
  currentStage: StageType;
  stages: {
    [key in StageType]: {
      startedAt: number;
      completedAt?: number;
      sponsor: SponsorType | SponsorType[];
      status: 'pending' | 'running' | 'completed' | 'error';
    };
  };

  // Health context
  healthMetrics: HealthMetrics;
  previousMetrics?: HealthMetrics;

  // Agent reasoning
  agentMessages: AgentMessage[];
  reasoning: AgentReasoning[];

  // Actions
  proposedActions: HealthAction[];
  approvedActions: HealthAction[];
  executedActions: HealthAction[];

  // Sponsor coordination
  sponsorMessages: SponsorMessage[];

  // Outcomes
  outcome?: {
    summary: string;
    metricsImprovement: Partial<HealthMetrics>;
    strategiesTested: string[];
  };
}

// ── Orchestration State ──
export interface OrchestrationState {
  isRunning: boolean;
  currentLoop: OrchestrationLoop;
  previousLoops: OrchestrationLoop[];

  // Sponsor status
  sponsorStatus: {
    [key in SponsorType]: {
      online: boolean;
      lastMessageAt?: number;
      messageCount: number;
    };
  };

  // Statistics
  stats: {
    totalLoops: number;
    totalActionsProposed: number;
    totalActionsApproved: number;
    averageRecoveryImprovement: number;
  };

  // Configuration
  dataSource: 'mock' | 'bedrock' | 'hybrid';
  bedrockAvailable: boolean;
}

// ── Timeline entry for UI ──
export interface TimelineEntry {
  id: string;
  timestamp: number;
  stage: StageType;
  agent?: AgentType;
  sponsor?: SponsorType;
  type: 'stage_start' | 'stage_end' | 'agent_message' | 'sponsor_message' | 'action_proposed' | 'action_blocked' | 'action_approved';
  title: string;
  description: string;
  icon?: string;
}

// ── Real-time metric update ──
export interface MetricUpdate {
  metric: keyof HealthMetrics;
  previousValue: any;
  newValue: any;
  timestamp: number;
  improvement: number; // percentage improvement
}

// ── Orchestrator events ──
export type OrchestrationEventType =
  | 'loopStarted'
  | 'stageStarted'
  | 'stageCompleted'
  | 'agentThinking'
  | 'agentMessage'
  | 'sponsorMessage'
  | 'actionProposed'
  | 'actionBlocked'
  | 'actionApproved'
  | 'actionExecuted'
  | 'debateRound'
  | 'consensusReached'
  | 'loopCompleted'
  | 'error';

export interface OrchestrationEvent {
  type: OrchestrationEventType;
  timestamp: number;
  loopId: string;
  loopNumber: number;
  payload?: Record<string, any>;
}

// ── Orchestrator interface ──
export interface IOrchestrator {
  startLoop(): Promise<OrchestrationLoop>;
  getState(): OrchestrationState;
  subscribeToEvents(callback: (event: OrchestrationEvent) => void): () => void;
  pause(): void;
  resume(): void;
  stop(): void;
  reset(): void;
}
