'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Activity, Brain, Zap, Database, Cloud, Lock, Server, ArrowLeft,
  ChevronRight, Play, Pause, RotateCcw, Settings, Home, Workflow,
  TrendingUp, CheckCircle, AlertCircle
} from 'lucide-react';
import { RealTimeMetrics } from '@/components/orchestration/RealTimeMetrics';
import { OrchestrationDataFlow } from '@/components/orchestration/OrchestrationDataFlow';
import { AgentReasoningTimeline } from '@/components/orchestration/AgentReasoningTimeline';
import { ReasoningLog } from '@/components/orchestration/ReasoningLog';
import { getOrchestrator } from '@/lib/orchestration/orchestrator';

type TabType = 'sources' | 'overview' | 'agents' | 'sponsors' | 'actions' | 'metrics' | 'history';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [state, setState] = useState<any>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const orchestrator = getOrchestrator();
    setState(orchestrator.getState());

    const unsubscribe = orchestrator.subscribeToEvents(() => {
      setState(orchestrator.getState());
    });

    return () => unsubscribe();
  }, []);

  const handleStartLoop = async () => {
    setRunning(true);
    try {
      const orchestrator = getOrchestrator();
      await orchestrator.startLoop();
      setState(orchestrator.getState());
    } finally {
      setRunning(false);
    }
  };

  const handleReset = () => {
    const orchestrator = getOrchestrator();
    orchestrator.reset();
    setState(orchestrator.getState());
  };

  if (!state) return <div className="text-center py-20 text-[#677d64]">Loading orchestrator...</div>;

  const currentLoop = state.currentLoop;
  const stage = currentLoop.currentStage as any;

  const navItems: Array<{ id: TabType; label: string; icon: React.ReactNode; desc: string }> = [
    { id: 'sources', label: 'Data Sources', icon: <Database size={18} />, desc: 'Connected health apps' },
    { id: 'overview', label: 'Loop Overview', icon: <Home size={18} />, desc: 'Current stage & progress' },
    { id: 'agents', label: 'Agent Reasoning', icon: <Brain size={18} />, desc: 'Multi-agent debate' },
    { id: 'sponsors', label: 'Sponsor Flow', icon: <Workflow size={18} />, desc: 'Data coordination' },
    { id: 'actions', label: 'Actions Pipeline', icon: <Zap size={18} />, desc: 'Proposed to executed' },
    { id: 'metrics', label: 'Health Metrics', icon: <TrendingUp size={18} />, desc: 'Before & after' },
    { id: 'history', label: 'Strategy History', icon: <CheckCircle size={18} />, desc: 'Past outcomes' },
  ];

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#181818] dark:bg-[#212525]/95 backdrop-blur border-b border-[#333333] dark:border-[#1f2a33] h-16 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2 text-[#8cab87] hover:text-[#ddffdc] transition-colors">
          <ArrowLeft size={16} />
          <span className="text-body-sm font-medium">Back</span>
        </Link>
        <div className="h-4 w-px bg-[#485346]/40 mx-4" />
        <div className="flex-1 flex items-center gap-2">
          <div className="w-5 h-5 rounded-sm flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7fee64,#18b759)' }}>
            <Activity size={10} className="text-black" />
          </div>
          <span className="font-display text-[#ddffdc] text-sm font-medium">LifeOS</span>
          <span className="text-caption text-[#677d64]">/ Agent Dashboard</span>
        </div>

        {/* Header controls */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${running ? 'bg-[#7fee64] animate-pulse' : 'bg-[#677d64]'}`} />
            <span className="text-caption text-[#8cab87]">
              {running ? 'Processing' : 'Ready'} • Loop #{currentLoop.loopNumber}
            </span>
          </div>

          <button
            onClick={handleStartLoop}
            disabled={running}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-pills bg-[#7fee64] text-black text-caption font-medium hover:bg-[#9fff80] transition-colors disabled:opacity-50"
          >
            <Play size={12} />
            Start
          </button>

          <button
            onClick={handleReset}
            className="w-8 h-8 rounded-cards border border-[#485346]/40 flex items-center justify-center text-[#677d64] hover:text-[#9cbf93]"
            title="Reset"
          >
            <RotateCcw size={14} />
          </button>

          <ThemeToggle />
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-[#333333] dark:border-[#485346]/40 bg-[#f5f5f5] dark:bg-[#181818] min-h-screen">
          <div className="p-6 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-start gap-3 px-4 py-3 rounded-cards transition-all ${
                  activeTab === item.id
                    ? 'bg-[#7fee64]/10 border border-[#7fee64]/30'
                    : 'border border-transparent hover:bg-[#212525]'
                }`}
              >
                <div className={activeTab === item.id ? 'text-[#7fee64]' : 'text-[#677d64]'}>
                  {item.icon}
                </div>
                <div className="text-left">
                  <p className={`text-body-sm font-medium ${activeTab === item.id ? 'text-[#7fee64]' : 'text-[#ddffdc]'}`}>
                    {item.label}
                  </p>
                  <p className="text-caption text-[#677d64]">{item.desc}</p>
                </div>
                {activeTab === item.id && <ChevronRight size={14} className="ml-auto text-[#7fee64]" />}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="max-w-6xl mx-auto px-8 py-8">
            {activeTab === 'sources' && <DataSourcesPage />}
            {activeTab === 'overview' && <LoopOverview loop={currentLoop} state={state} stage={stage} />}
            {activeTab === 'agents' && <AgentReasoningPage loop={currentLoop} stage={stage} />}
            {activeTab === 'sponsors' && <SponsorFlowPage loop={currentLoop} stage={stage} />}
            {activeTab === 'actions' && <ActionsPipelinePage loop={currentLoop} />}
            {activeTab === 'metrics' && <HealthMetricsPage loop={currentLoop} />}
            {activeTab === 'history' && <StrategyHistoryPage state={state} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── LOOP OVERVIEW PAGE ──────────────────────── */
function LoopOverview({ loop, state, stage }: any) {
  const stages = ['Collect', 'Diagnose', 'Plan', 'Act', 'Observe', 'Learn'];
  const currentStageIndex = stages.indexOf(stage);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-heading-lg text-[#ddffdc] font-medium mb-2">Current Loop Progress</h1>
        <p className="text-body text-[#8cab87]">Loop #{loop.loopNumber} • Observing agent workflow with sponsor coordination</p>
      </div>

      {/* Progress indicator */}
      <div className="bg-[#181818] rounded-cards border border-[#485346]/40 p-8">
        <div className="space-y-6">
          {stages.map((s, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const stageInfo = loop.stages[s as keyof typeof loop.stages];
            const sponsor = Array.isArray(stageInfo.sponsor) ? stageInfo.sponsor.join(', ') : stageInfo.sponsor;

            return (
              <div key={s} className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-cards border-2 flex items-center justify-center font-medium ${
                      isCurrent
                        ? 'bg-[#7fee64]/20 border-[#7fee64]'
                        : isCompleted
                          ? 'bg-[#7fee64]/10 border-[#7fee64]'
                          : 'bg-[#212525] border-[#485346]'
                    }`}
                  >
                    <span
                      className={isCurrent || isCompleted ? 'text-[#7fee64]' : 'text-[#677d64]'}
                    >
                      {idx + 1}
                    </span>
                  </div>
                  {idx < stages.length - 1 && (
                    <div
                      className="w-0.5 h-12 my-1"
                      style={{ backgroundColor: isCompleted ? '#7fee64' : '#485346' }}
                    />
                  )}
                </div>

                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-body-sm font-medium text-[#ddffdc]">{s}</h3>
                    <span className={`text-caption px-2 py-1 rounded-pills ${
                      isCurrent ? 'bg-[#7fee64]/10 text-[#7fee64]' :
                      isCompleted ? 'bg-[#7fee64]/10 text-[#7fee64]' :
                      'bg-[#212525] text-[#677d64]'
                    }`}>
                      {stageInfo.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="text-caption text-[#8cab87]">
                      <span className="text-[#677d64]">Sponsor:</span> {sponsor}
                    </p>
                    {isCurrent && (
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-[#7fee64] animate-pulse" />
                        <span className="text-caption text-[#7fee64]">Active</span>
                      </div>
                    )}
                  </div>

                  {isCurrent && (
                    <p className="text-caption text-[#677d64] mt-2">
                      Processing: {Math.round((Date.now() - stageInfo.startedAt) / 100) / 10}s elapsed
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#181818] rounded-cards border border-[#485346]/40 p-4">
          <p className="text-caption text-[#677d64] mb-2">Actions Proposed</p>
          <p className="text-heading-sm text-[#7fee64]">{loop.proposedActions.length}</p>
        </div>
        <div className="bg-[#181818] rounded-cards border border-[#485346]/40 p-4">
          <p className="text-caption text-[#677d64] mb-2">Actions Approved</p>
          <p className="text-heading-sm text-[#7fee64]">{loop.approvedActions.length}</p>
        </div>
        <div className="bg-[#181818] rounded-cards border border-[#485346]/40 p-4">
          <p className="text-caption text-[#677d64] mb-2">Actions Executed</p>
          <p className="text-heading-sm text-[#7fee64]">{loop.executedActions.length}</p>
        </div>
        <div className="bg-[#181818] rounded-cards border border-[#485346]/40 p-4">
          <p className="text-caption text-[#677d64] mb-2">Agent Messages</p>
          <p className="text-heading-sm text-[#7fee64]">{loop.agentMessages.length}</p>
        </div>
      </div>
    </div>
  );
}

/* ── AGENT REASONING PAGE ────────────────────── */
function AgentReasoningPage({ loop, stage }: any) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-heading-lg text-[#ddffdc] font-medium mb-2">Agent Reasoning Process</h1>
        <p className="text-body text-[#8cab87]">Watch how Planner, Critic, and Experts debate and reach consensus</p>
      </div>

      {/* Main reasoning timeline */}
      <div className="bg-[#181818] rounded-cards border border-[#485346]/40 p-8">
        <p className="text-caption text-[#677d64] uppercase tracking-[0.6px] font-medium mb-6">Multi-Agent Debate</p>
        <AgentReasoningTimeline reasoning={loop.reasoning} />
      </div>

      {/* Agent messages */}
      <div className="bg-[#181818] rounded-cards border border-[#485346]/40 p-8">
        <p className="text-caption text-[#677d64] uppercase tracking-[0.6px] font-medium mb-6">Agent Thoughts ({loop.agentMessages.length})</p>
        <ReasoningLog
          agentMessages={loop.agentMessages}
          sponsorMessages={[]}
          maxHeight="max-h-96"
        />
      </div>

      {/* Current stage focus */}
      <div className="bg-[#212525]/50 rounded-cards border border-[#485346]/40 p-6">
        <p className="text-caption text-[#677d64] uppercase tracking-[0.6px] font-medium mb-3">Current Stage</p>
        <p className="text-body text-[#ddffdc] font-medium">{stage}</p>
        <p className="text-caption text-[#8cab87] mt-2">
          {stage === 'Diagnose' && 'Agents analyzing health metrics and identifying patterns...'}
          {stage === 'Plan' && 'Multi-agent debate on proposed actions and refinements...'}
          {stage === 'Act' && 'Approved actions being authorized and executed...'}
          {stage === 'Collect' && 'Gathering unified health data from all sources...'}
          {stage === 'Observe' && 'Tracking outcomes and real-world impact...'}
          {stage === 'Learn' && 'Recording results and updating strategy database...'}
        </p>
      </div>
    </div>
  );
}

/* ── SPONSOR FLOW PAGE ─────────────────────── */
function SponsorFlowPage({ loop, stage }: any) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-heading-lg text-[#ddffdc] font-medium mb-2">Sponsor Coordination</h1>
        <p className="text-body text-[#8cab87]">Data flowing between Nexla, AWS, Zero.xyz, Pomerium, and Akash</p>
      </div>

      {/* Data flow visualization */}
      <div className="bg-[#181818] rounded-cards border border-[#485346]/40 p-8">
        <p className="text-caption text-[#677d64] uppercase tracking-[0.6px] font-medium mb-6">Live Data Flow</p>
        <OrchestrationDataFlow stage={stage} />
      </div>

      {/* Sponsor messages log */}
      <div className="bg-[#181818] rounded-cards border border-[#485346]/40 p-8">
        <p className="text-caption text-[#677d64] uppercase tracking-[0.6px] font-medium mb-6">Sponsor Messages ({loop.sponsorMessages.length})</p>
        <ReasoningLog
          agentMessages={[]}
          sponsorMessages={loop.sponsorMessages}
          stage={stage}
          maxHeight="max-h-96"
        />
      </div>

      {/* Sponsor status */}
      <div className="grid grid-cols-5 gap-4">
        {['Nexla', 'Zero.xyz', 'AWS', 'Pomerium', 'Akash'].map((sponsor) => (
          <div key={sponsor} className="bg-[#181818] rounded-cards border border-[#485346]/40 p-4 text-center">
            <p className="text-body-sm font-medium text-[#ddffdc] mb-2">{sponsor}</p>
            <div className="w-2 h-2 rounded-full bg-[#7fee64] mx-auto mb-2" />
            <p className="text-caption text-[#8cab87]">Online</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── ACTIONS PIPELINE PAGE ──────────────────── */
function ActionsPipelinePage({ loop }: any) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-heading-lg text-[#ddffdc] font-medium mb-2">Actions Pipeline</h1>
        <p className="text-body text-[#8cab87]">From proposal through authorization to execution</p>
      </div>

      {/* Pipeline stages */}
      <div className="space-y-6">
        {['Proposed', 'Approved', 'Executed'].map((stage, idx) => {
          const actions = stage === 'Proposed' ? loop.proposedActions :
                         stage === 'Approved' ? loop.approvedActions :
                         loop.executedActions;

          return (
            <div key={stage} className="bg-[#181818] rounded-cards border border-[#485346]/40 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-cards bg-[#212525] border border-[#485346]/40 flex items-center justify-center text-sm font-medium text-[#7fee64]">
                  {idx + 1}
                </div>
                <h3 className="text-body-sm font-medium text-[#ddffdc]">{stage} Actions</h3>
                <span className="text-caption text-[#8cab87]">({actions.length})</span>
              </div>

              <div className="space-y-2">
                {actions.length === 0 ? (
                  <p className="text-caption text-[#677d64]">No actions in this stage</p>
                ) : (
                  actions.map((action: any) => (
                    <div key={action.id} className="flex gap-3 p-3 bg-[#212525]/50 rounded-cards border border-[#485346]/20">
                      <div className="flex-1">
                        <p className="text-body-sm text-[#ddffdc] font-medium">{action.action}</p>
                        <p className="text-caption text-[#8cab87]">{action.rationale}</p>
                        <div className="flex gap-2 mt-2">
                          <span className={`text-caption px-2 py-0.5 rounded-pills ${
                            action.urgency === 'high' ? 'bg-[#aed2a4]/10 text-[#aed2a4]' :
                            action.urgency === 'medium' ? 'bg-[#9cbf93]/10 text-[#9cbf93]' :
                            'bg-[#485346]/20 text-[#677d64]'
                          }`}>
                            {action.urgency} urgency
                          </span>
                          <span className="text-caption text-[#677d64]">via {action.executor}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── HEALTH METRICS PAGE ────────────────────── */
function HealthMetricsPage({ loop }: any) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-heading-lg text-[#ddffdc] font-medium mb-2">Health Metrics</h1>
        <p className="text-body text-[#8cab87]">Before and after impact of executed actions</p>
      </div>

      <div className="bg-[#181818] rounded-cards border border-[#485346]/40 p-8">
        <RealTimeMetrics
          current={loop.healthMetrics}
          previous={loop.previousMetrics}
        />
      </div>

      {/* Improvement summary */}
      {loop.outcome && (
        <div className="bg-[#181818] rounded-cards border border-[#7fee64]/30 p-6">
          <p className="text-caption text-[#7fee64] uppercase tracking-[0.6px] font-medium mb-3">Loop Outcome</p>
          <p className="text-body-sm text-[#8cab87] mb-4">{loop.outcome.summary}</p>
          <div className="space-y-2">
            {Object.entries(loop.outcome.metricsImprovement).map(([key, value]: any) => (
              <div key={key} className="flex justify-between text-caption text-[#677d64]">
                <span className="capitalize">{key}</span>
                <span className="text-[#7fee64]">Improved ✓</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── STRATEGY HISTORY PAGE ─────────────────── */
function StrategyHistoryPage({ state }: any) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-heading-lg text-[#ddffdc] font-medium mb-2">Strategy History</h1>
        <p className="text-body text-[#8cab87]">Past loops and learning outcomes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#181818] rounded-cards border border-[#485346]/40 p-4">
          <p className="text-caption text-[#677d64] mb-2">Total Loops</p>
          <p className="text-heading-sm text-[#7fee64]">{state.stats.totalLoops}</p>
        </div>
        <div className="bg-[#181818] rounded-cards border border-[#485346]/40 p-4">
          <p className="text-caption text-[#677d64] mb-2">Actions Proposed</p>
          <p className="text-heading-sm text-[#7fee64]">{state.stats.totalActionsProposed}</p>
        </div>
        <div className="bg-[#181818] rounded-cards border border-[#485346]/40 p-4">
          <p className="text-caption text-[#677d64] mb-2">Actions Approved</p>
          <p className="text-heading-sm text-[#7fee64]">{state.stats.totalActionsApproved}</p>
        </div>
        <div className="bg-[#181818] rounded-cards border border-[#485346]/40 p-4">
          <p className="text-caption text-[#677d64] mb-2">Avg Improvement</p>
          <p className="text-heading-sm text-[#7fee64]">+{state.stats.averageRecoveryImprovement}%</p>
        </div>
      </div>

      {/* Previous loops */}
      <div className="bg-[#181818] rounded-cards border border-[#485346]/40 p-6">
        <p className="text-caption text-[#677d64] uppercase tracking-[0.6px] font-medium mb-6">Recent Loops</p>
        <div className="space-y-3">
          {state.previousLoops.slice(0, 5).map((loop: any, idx: number) => (
            <div key={loop.id} className="flex items-center justify-between p-3 bg-[#212525]/50 rounded-cards border border-[#485346]/20">
              <div>
                <p className="text-body-sm text-[#ddffdc] font-medium">Loop #{loop.loopNumber}</p>
                <p className="text-caption text-[#677d64]">{loop.outcome?.summary || 'Processing...'}</p>
              </div>
              <div className="text-right">
                <p className="text-body-sm font-medium text-[#8cab87]">{loop.outcome?.metricsImprovement?.recovery?.score ? `Recovery ${loop.outcome.metricsImprovement.recovery.score}%` : '—'}</p>
                <p className="text-caption text-[#677d64]">{loop.executedActions.length} actions executed</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── DATA SOURCES PAGE ──────────────────────── */
function DataSourcesPage() {
  const [nexlaDataset, setNexlaDataset] = useState<any>(null);
  const [connectionMode, setConnectionMode] = useState<'mock' | 'live'>('mock');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNexlaData = async () => {
      try {
        setLoading(true);

        // Check connection status
        const healthResponse = await fetch('/api/nexla/health');
        const healthData = await healthResponse.json();
        setConnectionMode(healthData.mode);

        // Fetch dataset
        const datasetResponse = await fetch('/api/nexla/dataset');
        const datasetData = await datasetResponse.json();

        if (datasetData.success) {
          setNexlaDataset(datasetData.data);
        }
      } catch (error) {
        console.error('Error fetching Nexla data:', error);
        setConnectionMode('mock');
      } finally {
        setLoading(false);
      }
    };

    fetchNexlaData();
  }, []);

  const dataSources = nexlaDataset?.sources || [
    {
      name: 'Whoop',
      icon: '⌚',
      category: 'Wearable',
      status: 'connected',
      lastSync: '2 min ago',
      dataPoints: ['HRV', 'Strain', 'Recovery', 'Sleep Quality'],
      color: '#7fee64',
      description: 'Real-time fitness metrics and recovery tracking'
    },
    {
      name: 'Apple Health',
      icon: '🍎',
      category: 'Mobile',
      status: 'connected',
      lastSync: '5 min ago',
      dataPoints: ['Steps', 'Active Calories', 'Workouts', 'Resting HR'],
      color: '#aed2a4',
      description: 'iPhone health data and activity tracking'
    },
    {
      name: 'Oura Ring',
      icon: '💍',
      category: 'Wearable',
      status: 'connected',
      lastSync: '3 min ago',
      dataPoints: ['Sleep Score', 'Readiness', 'Activity', 'Body Temperature'],
      color: '#9cbf93',
      description: 'Advanced sleep and readiness analytics'
    },
    {
      name: 'Google Calendar',
      icon: '📅',
      category: 'Schedule',
      status: 'connected',
      lastSync: '1 min ago',
      dataPoints: ['Events', 'Free Time Blocks', 'Meeting Duration', 'Context'],
      color: '#aed2a4',
      description: 'Schedule and time availability'
    },
    {
      name: 'Gmail',
      icon: '📧',
      category: 'Communication',
      status: 'connected',
      lastSync: '4 min ago',
      dataPoints: ['Email Metadata', 'Urgency', 'Stress Signals', 'Work Patterns'],
      color: '#9cbf93',
      description: 'Email patterns for contextual stress analysis'
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-heading-lg text-[#ddffdc] font-medium mb-2">Data Sources</h1>
          <p className="text-body text-[#8cab87]">Loading Nexla data...</p>
        </div>
        <div className="bg-[#181818] rounded-cards border border-[#485346]/40 p-8 text-center">
          <div className="inline-flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#7fee64] animate-pulse" />
            <span className="text-[#8cab87]">Connecting to Nexla...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-heading-lg text-[#ddffdc] font-medium">Data Sources</h1>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-pills ${
            connectionMode === 'live' ? 'bg-[#7fee64]/10' : 'bg-[#9cbf93]/10'
          }`}>
            <div className={`w-2 h-2 rounded-full ${connectionMode === 'live' ? 'bg-[#7fee64]' : 'bg-[#9cbf93]'}`} />
            <span className={`text-caption font-medium ${connectionMode === 'live' ? 'text-[#7fee64]' : 'text-[#9cbf93]'}`}>
              {connectionMode === 'live' ? '🔴 Live Nexla' : '⚪ Mock Data'}
            </span>
          </div>
        </div>
        <p className="text-body text-[#8cab87]">
          {connectionMode === 'live'
            ? 'Connected to real Nexla API - receiving live health data from all sources'
            : 'Using mock data - configure Nexla API for real data'}
        </p>
      </div>

      {/* Data flow diagram */}
      <div className="bg-[#181818] rounded-cards border border-[#485346]/40 p-8">
        <p className="text-caption text-[#677d64] uppercase tracking-[0.6px] font-medium mb-6">Complete Data Flow</p>

        <div className="flex items-center justify-between mb-8 px-4">
          {/* Sources */}
          <div className="flex flex-col gap-2">
            <div className="text-caption text-[#677d64] font-medium uppercase">Sources</div>
            <div className="flex gap-2">
              {['Whoop', 'Apple', 'Oura', 'Calendar', 'Gmail'].map((s) => (
                <div key={s} className="px-3 py-2 bg-[#212525] rounded-pills text-caption text-[#8cab87] border border-[#485346]/40">
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex-1 flex items-center justify-center px-8">
            <div className="flex-1 h-0.5 bg-gradient-to-r from-[#7fee64] to-transparent" />
            <div className="text-caption text-[#8cab87] px-4 whitespace-nowrap">Real-time sync</div>
            <div className="flex-1 h-0.5 bg-gradient-to-l from-[#7fee64] to-transparent" />
          </div>

          {/* Nexla */}
          <div className="flex flex-col gap-2">
            <div className="text-caption text-[#677d64] font-medium uppercase">Aggregation</div>
            <div className="px-4 py-2 bg-[#7fee64]/10 rounded-pills text-body-sm text-[#7fee64] border border-[#7fee64]/30 font-medium">
              Nexla Data Hub
            </div>
          </div>

          {/* Arrow */}
          <div className="flex-1 flex items-center justify-center px-8">
            <div className="flex-1 h-0.5 bg-gradient-to-r from-[#9cbf93] to-transparent" />
            <div className="text-caption text-[#8cab87] px-4 whitespace-nowrap">Unified context</div>
            <div className="flex-1 h-0.5 bg-gradient-to-l from-[#9cbf93] to-transparent" />
          </div>

          {/* AWS/Orchestration */}
          <div className="flex flex-col gap-2">
            <div className="text-caption text-[#677d64] font-medium uppercase">Processing</div>
            <div className="px-4 py-2 bg-[#9cbf93]/10 rounded-pills text-body-sm text-[#9cbf93] border border-[#9cbf93]/30 font-medium">
              AWS + Agents
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-[#212525]/50 rounded-cards p-4 text-caption text-[#8cab87]">
          <p>
            <span className="text-[#7fee64] font-medium">1. Collect:</span> All health data sources sync simultaneously to Nexla.
            <br/>
            <span className="text-[#7fee64] font-medium">2. Unify:</span> Nexla normalizes and combines data into a single health context.
            <br/>
            <span className="text-[#7fee64] font-medium">3. Process:</span> AWS Bedrock + Zero.xyz agents analyze patterns and recommend actions.
            <br/>
            <span className="text-[#7fee64] font-medium">4. Execute:</span> Pomerium authorizes and applies changes (calendar, notifications, etc.)
          </p>
        </div>
      </div>

      {/* Connected sources */}
      <div className="space-y-4">
        <h3 className="text-body-sm font-medium text-[#ddffdc]">Connected Sources</h3>

        {dataSources.map((source: any) => (
          <div key={source.name} className="bg-[#181818] rounded-cards border border-[#485346]/40 p-6 hover:border-[#485346] transition-all">
            <div className="flex gap-4 mb-4">
              {/* Icon and name */}
              <div className="flex items-center gap-3">
                <div className="text-4xl">{source.icon}</div>
                <div>
                  <p className="text-body-sm font-medium text-[#ddffdc]">{source.name}</p>
                  <p className="text-caption text-[#677d64]">{source.category}</p>
                </div>
              </div>

              {/* Status */}
              <div className="ml-auto">
                <div className="flex items-center gap-2 px-3 py-1 bg-[#7fee64]/10 rounded-pills">
                  <div className="w-2 h-2 rounded-full bg-[#7fee64]" />
                  <span className="text-caption text-[#7fee64] font-medium">Connected</span>
                </div>
                <p className="text-caption text-[#677d64] text-right mt-2">Last sync: {source.lastSync}</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-body-sm text-[#8cab87] mb-4">{source.description}</p>

            {/* Data points */}
            <div className="flex flex-wrap gap-2">
              {source.dataPoints.map((point: string) => (
                <span
                  key={point}
                  className="text-caption px-2 py-1 rounded-pills bg-[#212525] border"
                  style={{ borderColor: `${source.color}40`, color: source.color }}
                >
                  {point}
                </span>
              ))}
            </div>

            {/* Data flow indicator */}
            <div className="mt-4 pt-4 border-t border-[#485346]/20 flex items-center gap-2">
              <div className="text-caption text-[#677d64]">Flowing to:</div>
              <div className="text-caption text-[#7fee64] font-medium">Nexla</div>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-[#7fee64]/50 to-transparent" />
              <div className="text-caption text-[#9cbf93] font-medium">Agents</div>
            </div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="bg-[#212525]/50 rounded-cards border border-[#485346]/40 p-6 space-y-4">
        <h3 className="text-body-sm font-medium text-[#ddffdc]">How LifeOS Uses Your Data</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-caption text-[#677d64] font-medium">🔄 Continuous Sync</p>
            <p className="text-caption text-[#8cab87]">Data sources update every 1-5 minutes, providing real-time health context</p>
          </div>
          <div className="space-y-2">
            <p className="text-caption text-[#677d64] font-medium">🧠 AI Analysis</p>
            <p className="text-caption text-[#8cab87]">Agents analyze patterns: Is recovery low? Are you overbooked? Is sleep poor?</p>
          </div>
          <div className="space-y-2">
            <p className="text-caption text-[#677d64] font-medium">✅ Smart Actions</p>
            <p className="text-caption text-[#8cab87]">Move workouts, block screens, adjust plans—all authorized before execution</p>
          </div>
          <div className="space-y-2">
            <p className="text-caption text-[#677d64] font-medium">📊 Outcomes Tracked</p>
            <p className="text-caption text-[#8cab87]">Compare metrics before/after. Learn what works. Refine strategies daily</p>
          </div>
        </div>
      </div>
    </div>
  );
}
