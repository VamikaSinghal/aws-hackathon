import { HealthMetrics, HealthAction, AgentMessage, AgentReasoning, SponsorMessage, OrchestrationLoop, AgentType, SponsorType, StageType } from './types';

// ── Base health metrics (human-realistic) ──
const baselineMetrics: HealthMetrics = {
  sleep: { duration: 420, quality: 72 }, // 7h quality sleep
  hrv: { current: 54, baseline: 54, percentOfBaseline: 100 },
  recovery: { score: 78, status: 'green' },
  steps: 8500,
  activeCalories: 450,
  restingHeartRate: 58,
};

// ── Scenario: Poor recovery (before agent intervention) ──
const poorRecoveryMetrics: HealthMetrics = {
  sleep: { duration: 292, quality: 35 }, // 4h 52m, poor quality
  hrv: { current: 28, baseline: 54, percentOfBaseline: 52 },
  recovery: { score: 23, status: 'red' },
  steps: 2100,
  activeCalories: 120,
  restingHeartRate: 72,
};

// ── Scenario: Recovered after intervention ──
const recoveredMetrics: HealthMetrics = {
  sleep: { duration: 450, quality: 85 }, // 7h 30m, great quality
  hrv: { current: 51, baseline: 54, percentOfBaseline: 94 },
  recovery: { score: 71, status: 'green' },
  steps: 7200,
  activeCalories: 380,
  restingHeartRate: 60,
};

// ── Mock agent messages for poor recovery scenario ──
function generatePlannerMessages(): AgentMessage[] {
  return [
    {
      id: 'msg-1',
      timestamp: Date.now(),
      agent: 'Planner',
      type: 'proposal',
      content: 'Detected HRV at 52% of baseline. Body is in recovery debt. Recommend reducing workout intensity.',
      structuredData: { severity: 'high', urgency: 'immediate' },
      iteration: 1,
    },
    {
      id: 'msg-2',
      timestamp: Date.now() + 300,
      agent: 'Planner',
      type: 'proposal',
      content: 'Proposed actions: (1) Cancel 7am HIIT workout, (2) Move alarm to 7:30am, (3) Add +30g protein, (4) Block screens after 10:30pm',
      structuredData: { actions: 4, priority: 'high' },
      iteration: 1,
    },
  ];
}

function generateCriticMessages(): AgentMessage[] {
  return [
    {
      id: 'msg-3',
      timestamp: Date.now() + 600,
      agent: 'Critic',
      type: 'feedback',
      content: '✓ HIIT cancellation approved - HRV data supports this. ✗ Screen blocking rule too aggressive for user profile.',
      structuredData: { approved: 3, blocked: 1 },
      iteration: 1,
    },
    {
      id: 'msg-4',
      timestamp: Date.now() + 900,
      agent: 'Critic',
      type: 'refinement',
      content: 'Recommend softer screen policy: block notifications after 10:30pm instead of full device lock.',
      structuredData: { refinement: true },
      iteration: 2,
    },
  ];
}

function generateWorkoutExpertMessages(): AgentMessage[] {
  return [
    {
      id: 'msg-5',
      timestamp: Date.now() + 1200,
      agent: 'Workout Expert',
      type: 'approval',
      content: 'Confirmed: HIIT not safe at current HRV levels. HRV < 60% of baseline = sympathetic nervous system dominance. Risk of overtraining.',
      structuredData: { recommendation: 'cancel_hiit', alternative: 'light_walk_recommended' },
      iteration: 1,
    },
  ];
}

function generateNutritionExpertMessages(): AgentMessage[] {
  return [
    {
      id: 'msg-6',
      timestamp: Date.now() + 1500,
      agent: 'Nutrition Expert',
      type: 'approval',
      content: '+30g protein target confirmed. At 4h 52m sleep, elevated cortisol expected. Protein supports HPA axis recovery.',
      structuredData: { proteinTarget: 30, timing: 'post_workout_alternative', zinc: true, magnesium: true },
      iteration: 1,
    },
  ];
}

export function generateMockProposedActions(): HealthAction[] {
  return [
    {
      id: 'act-1',
      action: 'Cancel 7:00 AM HIIT workout',
      urgency: 'high',
      rationale: 'HRV at 28ms (52% of baseline) indicates sympathetic dominance. High-intensity exercise would increase cortisol.',
      status: 'proposed',
      executor: 'Zero.xyz',
    },
    {
      id: 'act-2',
      action: 'Move wake-up alarm from 6:00 AM to 7:30 AM',
      urgency: 'high',
      rationale: 'Sleep debt: 4h 52m vs 7h target. Extra 90 min critical for HRV recovery.',
      status: 'proposed',
      executor: 'Pomerium',
    },
    {
      id: 'act-3',
      action: 'Add +30g protein to nutrition target',
      urgency: 'medium',
      rationale: 'Low recovery score (23%) + elevated cortisol requires protein support for HPA axis.',
      status: 'proposed',
      executor: 'Zero.xyz',
    },
    {
      id: 'act-4',
      action: 'Block screen notifications after 10:30 PM',
      urgency: 'medium',
      rationale: 'Protect sleep quality. Current sleep quality at 35%. Blue light exposure delays melatonin.',
      status: 'proposed',
      executor: 'Pomerium',
    },
  ];
}

export function generateMockApprovedActions(proposed: HealthAction[]): HealthAction[] {
  return proposed.map(a => ({
    ...a,
    status: 'approved' as const,
  })).filter(a => a.id !== 'act-4'); // Critic blocked the screen blocking, propose softer version
}

export function generateMockReasoningChain(): AgentReasoning[] {
  return [
    {
      agent: 'Planner',
      proposal: 'HRV recovery protocol: cancel HIIT, extend sleep 90min, +30g protein, screen block',
      approved: false,
      reasoning: 'Initial diagnosis complete. Submitted to multi-agent debate.',
      confidence: 85,
    },
    {
      agent: 'Critic',
      feedback: 'Approved 3 of 4 actions. Screen locking too aggressive.',
      approved: false,
      reasoning: 'Critic identified UX concern. Suggested notification-only alternative.',
      confidence: 92,
    },
    {
      agent: 'Workout Expert',
      proposal: 'HIIT unsafe. Recommend 20min light walk instead.',
      approved: true,
      reasoning: 'HRV < 60% baseline = sympathetic overdrive risk confirmed.',
      confidence: 95,
    },
    {
      agent: 'Nutrition Expert',
      proposal: 'Protein + magnesium + zinc protocol for HPA recovery',
      approved: true,
      reasoning: 'Sleep debt + low recovery + elevated cortisol = recovery nutrition justified.',
      confidence: 88,
    },
  ];
}

export function generateMockSponsorMessages(stage: StageType): SponsorMessage[] {
  const timestamp = Date.now();
  const sponsors: { [key in StageType]: SponsorMessage[] } = {
    'Collect': [
      {
        id: 'sp-1',
        timestamp,
        source: 'Nexla',
        destination: 'AWS',
        stage: 'Collect',
        messageType: 'data',
        content: 'Health data aggregated: sleep (4h 52m), HRV (28ms), recovery (23%), calendar (7am HIIT), Gmail (stress signals).',
        dataSize: 2400,
      },
    ],
    'Diagnose': [
      {
        id: 'sp-2',
        timestamp: timestamp + 500,
        source: 'Nexla',
        destination: 'Zero.xyz',
        stage: 'Diagnose',
        messageType: 'request',
        content: 'Bedrock Planner agent: analyze health metrics for risk patterns.',
        dataSize: 1024,
      },
      {
        id: 'sp-3',
        timestamp: timestamp + 1000,
        source: 'AWS',
        destination: 'Zero.xyz',
        stage: 'Diagnose',
        messageType: 'response',
        content: 'Planner diagnosis: symptomatic recovery debt detected. 4 actions proposed.',
        dataSize: 512,
      },
    ],
    'Plan': [
      {
        id: 'sp-4',
        timestamp: timestamp + 1500,
        source: 'Zero.xyz',
        destination: 'AWS',
        stage: 'Plan',
        messageType: 'request',
        content: 'Routing to Critic, Workout Expert, Nutrition Expert for parallel evaluation.',
        dataSize: 800,
      },
      {
        id: 'sp-5',
        timestamp: timestamp + 2500,
        source: 'AWS',
        destination: 'Zero.xyz',
        stage: 'Plan',
        messageType: 'response',
        content: '3 actions approved, 1 refined. Consensus: proceed with approved action set.',
        dataSize: 600,
      },
    ],
    'Act': [
      {
        id: 'sp-6',
        timestamp: timestamp + 3000,
        source: 'Zero.xyz',
        destination: 'Pomerium',
        stage: 'Act',
        messageType: 'request',
        content: 'Authorization request: 3 approved actions (cancel event, modify alarm, nutrition update).',
        dataSize: 1024,
      },
      {
        id: 'sp-7',
        timestamp: timestamp + 3500,
        source: 'Pomerium',
        destination: 'AWS',
        stage: 'Act',
        messageType: 'response',
        content: '✓ All 3 actions authorized and executed. Calendar event cancelled. Alarm moved. Nutrition plan updated.',
        dataSize: 256,
      },
    ],
    'Observe': [
      {
        id: 'sp-8',
        timestamp: timestamp + 4000,
        source: 'Akash',
        destination: 'Nexla',
        stage: 'Observe',
        messageType: 'request',
        content: 'Next morning: streaming outcome data. Sleep improved. HRV recovering.',
        dataSize: 1600,
      },
    ],
    'Learn': [
      {
        id: 'sp-9',
        timestamp: timestamp + 4500,
        source: 'AWS',
        destination: 'AWS',
        stage: 'Learn',
        messageType: 'response',
        content: 'DynamoDB updated: HRV protocol efficacy = 87%. Strategy locked. Next iteration ready.',
        dataSize: 512,
      },
    ],
  };

  return sponsors[stage] || [];
}

// ── Generate complete mock loop ──
export function generateMockOrchestrationLoop(loopNumber: number, scenario: 'poor' | 'recovering' = 'poor'): OrchestrationLoop {
  const startTime = Date.now();
  const healthMetrics = scenario === 'poor' ? poorRecoveryMetrics : recoveredMetrics;

  return {
    id: `loop-${loopNumber}-${Date.now()}`,
    loopNumber,
    startedAt: startTime,
    completedAt: startTime + 5000, // Simulated 5s loop

    currentStage: 'Learn',
    stages: {
      'Collect': {
        startedAt: startTime,
        completedAt: startTime + 500,
        sponsor: 'Nexla',
        status: 'completed',
      },
      'Diagnose': {
        startedAt: startTime + 500,
        completedAt: startTime + 1500,
        sponsor: ['AWS', 'Zero.xyz'],
        status: 'completed',
      },
      'Plan': {
        startedAt: startTime + 1500,
        completedAt: startTime + 2500,
        sponsor: ['AWS', 'Zero.xyz'],
        status: 'completed',
      },
      'Act': {
        startedAt: startTime + 2500,
        completedAt: startTime + 3500,
        sponsor: ['Pomerium', 'AWS'],
        status: 'completed',
      },
      'Observe': {
        startedAt: startTime + 3500,
        completedAt: startTime + 4000,
        sponsor: ['Nexla', 'Akash'],
        status: 'completed',
      },
      'Learn': {
        startedAt: startTime + 4000,
        completedAt: startTime + 5000,
        sponsor: 'AWS',
        status: 'completed',
      },
    },

    healthMetrics,
    previousMetrics: scenario === 'poor' ? baselineMetrics : poorRecoveryMetrics,

    agentMessages: [
      ...generatePlannerMessages(),
      ...generateCriticMessages(),
      ...generateWorkoutExpertMessages(),
      ...generateNutritionExpertMessages(),
    ],
    reasoning: generateMockReasoningChain(),

    proposedActions: generateMockProposedActions(),
    approvedActions: generateMockApprovedActions(generateMockProposedActions()),
    executedActions: generateMockApprovedActions(generateMockProposedActions()),

    sponsorMessages: [
      ...generateMockSponsorMessages('Collect'),
      ...generateMockSponsorMessages('Diagnose'),
      ...generateMockSponsorMessages('Plan'),
      ...generateMockSponsorMessages('Act'),
      ...generateMockSponsorMessages('Observe'),
      ...generateMockSponsorMessages('Learn'),
    ],

    outcome: {
      summary: 'Poor recovery detected and corrected. HRV protocol activated. Sleep extension approved.',
      metricsImprovement: {
        sleep: { duration: 450, quality: 85 },
        hrv: { current: 51, baseline: 54, percentOfBaseline: 94 },
        recovery: { score: 71, status: 'green' },
      },
      strategiesTested: ['HRV recovery', 'Sleep extension', 'Protein loading'],
    },
  };
}

export function initializeMockOrchestrationState() {
  return {
    isRunning: false,
    currentLoop: generateMockOrchestrationLoop(1),
    previousLoops: [
      generateMockOrchestrationLoop(1, 'poor'),
    ],
    sponsorStatus: {
      'Nexla': { online: true, lastMessageAt: Date.now() - 500, messageCount: 12 },
      'Zero.xyz': { online: true, lastMessageAt: Date.now() - 400, messageCount: 18 },
      'AWS': { online: true, lastMessageAt: Date.now() - 300, messageCount: 24 },
      'Pomerium': { online: true, lastMessageAt: Date.now() - 200, messageCount: 8 },
      'Akash': { online: true, lastMessageAt: Date.now() - 100, messageCount: 6 },
    },
    stats: {
      totalLoops: 23,
      totalActionsProposed: 156,
      totalActionsApproved: 142,
      averageRecoveryImprovement: 18,
    },
    dataSource: 'mock' as const,
    bedrockAvailable: false,
  };
}
