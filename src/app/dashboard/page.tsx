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
    <div style={{ minHeight: "100vh", background: "var(--color-void-canvas)" }}>
      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--color-graphite)", backdropFilter: "blur(4px)", borderBottom: "1px solid var(--color-hairline)", height: "64px", display: "flex", alignItems: "center", padding: "0 24px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-ash)", textDecoration: "none", transition: "color 200ms" }}>
          <ArrowLeft size={16} />
          <span style={{ fontSize: "14px", fontWeight: 500 }}>Back</span>
        </Link>
        <div style={{ height: "16px", width: "1px", background: "var(--color-hairline)", opacity: 0.4, margin: "0 16px" }} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "20px", height: "20px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-dusk-violet)" }}>
            <Activity size={10} style={{ color: "var(--color-snow-white)" }} />
          </div>
          <span style={{ color: "var(--color-bone)", fontSize: "14px", fontWeight: 500 }}>LifeOS</span>
          <span style={{ color: "var(--color-slate)", fontSize: "13px" }}>/ Agent Dashboard</span>
        </div>

        {/* Header controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: running ? "var(--color-dusk-violet)" : "var(--color-slate)", animation: running ? "pulse 2s infinite" : "none" }} />
            <span style={{ fontSize: "13px", color: "var(--color-ash)" }}>
              {running ? 'Processing' : 'Ready'} • Loop #{currentLoop.loopNumber}
            </span>
          </div>

          <button
            onClick={handleStartLoop}
            disabled={running}
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", opacity: running ? 0.5 : 1 }}
          >
            <Play size={12} />
            Start
          </button>

          <button
            onClick={handleReset}
            style={{ width: "32px", height: "32px", borderRadius: "10px", border: "1px solid var(--color-hairline)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-slate)", background: "transparent", cursor: "pointer", transition: "all 200ms" }}
            title="Reset"
          >
            <RotateCcw size={14} />
          </button>

          <ThemeToggle />
        </div>
      </div>

      <div style={{ display: "flex" }}>
        {/* Sidebar */}
        <div style={{ width: "256px", borderRight: "1px solid var(--color-hairline)", background: "var(--color-graphite)", minHeight: "100vh", padding: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "12px",
                borderRadius: "10px",
                border: activeTab === item.id ? "1px solid var(--color-dusk-violet)" : "1px solid transparent",
                background: activeTab === item.id ? "rgba(107, 98, 242, 0.08)" : "transparent",
                cursor: "pointer",
                transition: "all 200ms",
                textAlign: "left",
              }}
            >
              <div style={{ color: activeTab === item.id ? "var(--color-dusk-violet)" : "var(--color-slate)" }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: activeTab === item.id ? "var(--color-dusk-violet)" : "var(--color-bone)", fontSize: "14px", fontWeight: 500, margin: "0 0 2px 0" }}>
                  {item.label}
                </p>
                <p style={{ color: "var(--color-slate)", fontSize: "12px", margin: 0 }}>{item.desc}</p>
              </div>
              {activeTab === item.id && <ChevronRight size={14} style={{ color: "var(--color-dusk-violet)" }} />}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, maxWidth: "1200px", margin: "0 auto", padding: "32px 24px", width: "100%" }}>
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
  );
}

/* ── LOOP OVERVIEW PAGE ──────────────────────── */
function LoopOverview({ loop, state, stage }: any) {
  const stages = ['Collect', 'Diagnose', 'Plan', 'Act', 'Observe', 'Learn'];
  const currentStageIndex = stages.indexOf(stage);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <h2 style={{ marginBottom: "8px" }}>Current Loop Progress</h2>
        <p style={{ color: "var(--color-ash)", margin: 0 }}>Loop #{loop.loopNumber} • Observing agent workflow with sponsor coordination</p>
      </div>

      {/* Progress indicator */}
      <div className="card" style={{ padding: "32px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {stages.map((s, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const stageInfo = loop.stages[s as keyof typeof loop.stages];
            const sponsor = Array.isArray(stageInfo.sponsor) ? stageInfo.sponsor.join(', ') : stageInfo.sponsor;

            return (
              <div key={s} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      border: "2px solid",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 500,
                      borderColor: isCurrent || isCompleted ? "var(--color-dusk-violet)" : "var(--color-hairline)",
                      background: isCurrent ? "rgba(107, 98, 242, 0.1)" : isCompleted ? "rgba(107, 98, 242, 0.05)" : "var(--color-void-canvas)",
                    }}
                  >
                    <span style={{ color: isCurrent || isCompleted ? "var(--color-dusk-violet)" : "var(--color-slate)" }}>
                      {idx + 1}
                    </span>
                  </div>
                  {idx < stages.length - 1 && (
                    <div
                      style={{
                        width: "2px",
                        height: "48px",
                        margin: "4px 0",
                        background: isCompleted ? "var(--color-dusk-violet)" : "var(--color-hairline)",
                      }}
                    />
                  )}
                </div>

                <div style={{ flex: 1, paddingTop: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <h3 style={{ color: "var(--color-bone)", fontSize: "14px", fontWeight: 500, margin: 0 }}>{s}</h3>
                    <span style={{
                      fontSize: "12px",
                      padding: "4px 12px",
                      borderRadius: "9999px",
                      background: isCurrent || isCompleted ? "rgba(107, 98, 242, 0.1)" : "var(--color-graphite)",
                      color: isCurrent || isCompleted ? "var(--color-dusk-violet)" : "var(--color-slate)"
                    }}>
                      {stageInfo.status}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <p style={{ fontSize: "12px", color: "var(--color-ash)", margin: 0 }}>
                      <span style={{ color: "var(--color-slate)" }}>Sponsor:</span> {sponsor}
                    </p>
                    {isCurrent && (
                      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-dusk-violet)", animation: "pulse 2s infinite" }} />
                        <span style={{ fontSize: "12px", color: "var(--color-dusk-violet)" }}>Active</span>
                      </div>
                    )}
                  </div>

                  {isCurrent && (
                    <p style={{ fontSize: "12px", color: "var(--color-slate)", marginTop: "8px", margin: 0 }}>
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {[
          { label: "Actions Proposed", value: loop.proposedActions.length },
          { label: "Actions Approved", value: loop.approvedActions.length },
          { label: "Actions Executed", value: loop.executedActions.length },
          { label: "Agent Messages", value: loop.agentMessages.length },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ padding: "16px" }}>
            <p style={{ color: "var(--color-slate)", fontSize: "12px", margin: "0 0 8px 0" }}>{stat.label}</p>
            <p style={{ color: "var(--color-dusk-violet)", fontSize: "24px", fontWeight: 600, margin: 0 }}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── AGENT REASONING PAGE ────────────────────── */
function AgentReasoningPage({ loop, stage }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <h2 style={{ marginBottom: "8px" }}>Agent Reasoning Process</h2>
        <p style={{ color: "var(--color-ash)", margin: 0 }}>Watch how Planner, Critic, and Experts debate and reach consensus</p>
      </div>

      {/* Main reasoning timeline */}
      <div className="card" style={{ padding: "32px" }}>
        <p style={{ color: "var(--color-slate)", fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.6px", margin: "0 0 24px 0" }}>Multi-Agent Debate</p>
        <AgentReasoningTimeline reasoning={loop.reasoning} />
      </div>

      {/* Agent messages */}
      <div className="card" style={{ padding: "32px" }}>
        <p style={{ color: "var(--color-slate)", fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.6px", margin: "0 0 24px 0" }}>Agent Thoughts ({loop.agentMessages.length})</p>
        <ReasoningLog
          agentMessages={loop.agentMessages}
          sponsorMessages={[]}
          maxHeight="max-h-96"
        />
      </div>

      {/* Current stage focus */}
      <div className="card" style={{ padding: "24px", background: "rgba(107, 98, 242, 0.05)" }}>
        <p style={{ color: "var(--color-slate)", fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.6px", margin: "0 0 12px 0" }}>Current Stage</p>
        <p style={{ color: "var(--color-bone)", fontSize: "16px", fontWeight: 500, margin: "0 0 8px 0" }}>{stage}</p>
        <p style={{ color: "var(--color-ash)", fontSize: "13px", margin: 0 }}>
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
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <h2 style={{ marginBottom: "8px" }}>Sponsor Coordination</h2>
        <p style={{ color: "var(--color-ash)", margin: 0 }}>Data flowing between Nexla, AWS, Zero.xyz, Pomerium, and Akash</p>
      </div>

      {/* Data flow visualization */}
      <div className="card" style={{ padding: "32px" }}>
        <p style={{ color: "var(--color-slate)", fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.6px", margin: "0 0 24px 0" }}>Live Data Flow</p>
        <OrchestrationDataFlow stage={stage} />
      </div>

      {/* Sponsor messages log */}
      <div className="card" style={{ padding: "32px" }}>
        <p style={{ color: "var(--color-slate)", fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.6px", margin: "0 0 24px 0" }}>Sponsor Messages ({loop.sponsorMessages.length})</p>
        <ReasoningLog
          agentMessages={[]}
          sponsorMessages={loop.sponsorMessages}
          stage={stage}
          maxHeight="max-h-96"
        />
      </div>

      {/* Sponsor status */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px" }}>
        {['Nexla', 'Zero.xyz', 'AWS', 'Pomerium', 'Akash'].map((sponsor) => (
          <div key={sponsor} className="card" style={{ padding: "16px", textAlign: "center" }}>
            <p style={{ color: "var(--color-bone)", fontSize: "14px", fontWeight: 500, margin: "0 0 8px 0" }}>{sponsor}</p>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-dusk-violet)", margin: "0 auto 8px" }} />
            <p style={{ color: "var(--color-ash)", fontSize: "12px", margin: 0 }}>Online</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── ACTIONS PIPELINE PAGE ──────────────────── */
function ActionsPipelinePage({ loop }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <h2 style={{ marginBottom: "8px" }}>Actions Pipeline</h2>
        <p style={{ color: "var(--color-ash)", margin: 0 }}>From proposal through authorization to execution</p>
      </div>

      {/* Pipeline stages */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {['Proposed', 'Approved', 'Executed'].map((stage, idx) => {
          const actions = stage === 'Proposed' ? loop.proposedActions :
                         stage === 'Approved' ? loop.approvedActions :
                         loop.executedActions;

          return (
            <div key={stage} className="card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "var(--color-graphite)", border: "1px solid var(--color-hairline)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 500, color: "var(--color-dusk-violet)" }}>
                  {idx + 1}
                </div>
                <h3 style={{ color: "var(--color-bone)", fontSize: "14px", fontWeight: 500, margin: 0 }}>{stage} Actions</h3>
                <span style={{ color: "var(--color-ash)", fontSize: "13px" }}>({actions.length})</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {actions.length === 0 ? (
                  <p style={{ color: "var(--color-slate)", fontSize: "12px", margin: 0 }}>No actions in this stage</p>
                ) : (
                  actions.map((action: any) => (
                    <div key={action.id} className="card" style={{ padding: "12px", background: "rgba(212, 212, 212, 0.03)" }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: "var(--color-bone)", fontSize: "13px", fontWeight: 500, margin: 0 }}>{action.action}</p>
                        <p style={{ color: "var(--color-ash)", fontSize: "12px", margin: "4px 0 8px 0" }}>{action.rationale}</p>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <span style={{
                            fontSize: "12px",
                            padding: "2px 8px",
                            borderRadius: "9999px",
                            background: "rgba(107, 98, 242, 0.08)",
                            color: "var(--color-dusk-violet)"
                          }}>
                            {action.urgency} urgency
                          </span>
                          <span style={{ fontSize: "12px", color: "var(--color-slate)" }}>via {action.executor}</span>
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
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <h2 style={{ marginBottom: "8px" }}>Health Metrics</h2>
        <p style={{ color: "var(--color-ash)", margin: 0 }}>Before and after impact of executed actions</p>
      </div>

      <div className="card" style={{ padding: "32px" }}>
        <RealTimeMetrics
          current={loop.healthMetrics}
          previous={loop.previousMetrics}
        />
      </div>

      {/* Improvement summary */}
      {loop.outcome && (
        <div className="card" style={{ padding: "24px", background: "rgba(107, 98, 242, 0.06)", borderColor: "rgba(107, 98, 242, 0.2)" }}>
          <p style={{ color: "var(--color-dusk-violet)", fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.6px", margin: "0 0 12px 0" }}>Loop Outcome</p>
          <p style={{ color: "var(--color-ash)", fontSize: "14px", margin: "0 0 16px 0" }}>{loop.outcome.summary}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {Object.entries(loop.outcome.metricsImprovement).map(([key, value]: any) => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--color-slate)" }}>
                <span style={{ textTransform: "capitalize" }}>{key}</span>
                <span style={{ color: "var(--color-dusk-violet)" }}>Improved ✓</span>
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
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <h2 style={{ marginBottom: "8px" }}>Strategy History</h2>
        <p style={{ color: "var(--color-ash)", margin: 0 }}>Past loops and learning outcomes</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {[
          { label: "Total Loops", value: state.stats.totalLoops },
          { label: "Actions Proposed", value: state.stats.totalActionsProposed },
          { label: "Actions Approved", value: state.stats.totalActionsApproved },
          { label: "Avg Improvement", value: `+${state.stats.averageRecoveryImprovement}%` },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ padding: "16px" }}>
            <p style={{ color: "var(--color-slate)", fontSize: "12px", margin: "0 0 8px 0" }}>{stat.label}</p>
            <p style={{ color: "var(--color-dusk-violet)", fontSize: "24px", fontWeight: 600, margin: 0 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Previous loops */}
      <div className="card" style={{ padding: "24px" }}>
        <p style={{ color: "var(--color-slate)", fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.6px", margin: "0 0 24px 0" }}>Recent Loops</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {state.previousLoops.slice(0, 5).map((loop: any, idx: number) => (
            <div key={loop.id} className="card" style={{ padding: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(212, 212, 212, 0.03)" }}>
              <div>
                <p style={{ color: "var(--color-bone)", fontSize: "13px", fontWeight: 500, margin: 0 }}>Loop #{loop.loopNumber}</p>
                <p style={{ color: "var(--color-slate)", fontSize: "12px", margin: 0 }}>{loop.outcome?.summary || 'Processing...'}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ color: "var(--color-ash)", fontSize: "13px", fontWeight: 500, margin: 0 }}>{loop.outcome?.metricsImprovement?.recovery?.score ? `Recovery ${loop.outcome.metricsImprovement.recovery.score}%` : '—'}</p>
                <p style={{ color: "var(--color-slate)", fontSize: "12px", margin: 0 }}>{loop.executedActions.length} actions executed</p>
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
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        <div>
          <h2 style={{ marginBottom: "8px" }}>Data Sources</h2>
          <p style={{ color: "var(--color-ash)", margin: 0 }}>Loading Nexla data...</p>
        </div>
        <div className="card" style={{ padding: "32px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-dusk-violet)", animation: "pulse 2s infinite" }} />
            <span style={{ color: "var(--color-ash)" }}>Connecting to Nexla...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <h2 style={{ margin: 0 }}>Data Sources</h2>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 12px",
            borderRadius: "9999px",
            background: connectionMode === 'live' ? "rgba(107, 98, 242, 0.1)" : "rgba(155, 145, 255, 0.1)"
          }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: connectionMode === 'live' ? "var(--color-dusk-violet)" : "var(--color-slate)" }} />
            <span style={{
              fontSize: "12px",
              fontWeight: 500,
              color: connectionMode === 'live' ? "var(--color-dusk-violet)" : "var(--color-ash)"
            }}>
              {connectionMode === 'live' ? '🔴 Live Nexla' : '⚪ Mock Data'}
            </span>
          </div>
        </div>
        <p style={{ color: "var(--color-ash)", margin: 0 }}>
          {connectionMode === 'live'
            ? 'Connected to real Nexla API - receiving live health data from all sources'
            : 'Using mock data - configure Nexla API for real data'}
        </p>
      </div>

      {/* Data flow diagram */}
      <div className="card" style={{ padding: "32px" }}>
        <p style={{ color: "var(--color-slate)", fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.6px", margin: "0 0 24px 0" }}>Complete Data Flow</p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", padding: "0 16px" }}>
          {/* Sources */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "12px", color: "var(--color-slate)", fontWeight: 500, textTransform: "uppercase" }}>Sources</div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {['Whoop', 'Apple', 'Oura', 'Calendar', 'Gmail'].map((s) => (
                <div key={s} style={{ padding: "6px 12px", background: "var(--color-graphite)", borderRadius: "9999px", fontSize: "12px", color: "var(--color-ash)", border: "1px solid var(--color-hairline)" }}>
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 32px" }}>
            <div style={{ flex: 1, height: "2px", background: `linear-gradient(to right, var(--color-dusk-violet), transparent)` }} />
            <div style={{ fontSize: "12px", color: "var(--color-ash)", padding: "0 16px", whiteSpace: "nowrap" }}>Real-time sync</div>
            <div style={{ flex: 1, height: "2px", background: `linear-gradient(to left, var(--color-dusk-violet), transparent)` }} />
          </div>

          {/* Nexla */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "12px", color: "var(--color-slate)", fontWeight: 500, textTransform: "uppercase" }}>Aggregation</div>
            <div style={{ padding: "6px 16px", background: "rgba(107, 98, 242, 0.1)", borderRadius: "9999px", fontSize: "14px", color: "var(--color-dusk-violet)", border: "1px solid rgba(107, 98, 242, 0.3)", fontWeight: 500 }}>
              Nexla Data Hub
            </div>
          </div>

          {/* Arrow */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 32px" }}>
            <div style={{ flex: 1, height: "2px", background: `linear-gradient(to right, var(--color-dusk-violet), transparent)` }} />
            <div style={{ fontSize: "12px", color: "var(--color-ash)", padding: "0 16px", whiteSpace: "nowrap" }}>Unified context</div>
            <div style={{ flex: 1, height: "2px", background: `linear-gradient(to left, var(--color-dusk-violet), transparent)` }} />
          </div>

          {/* AWS/Orchestration */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "12px", color: "var(--color-slate)", fontWeight: 500, textTransform: "uppercase" }}>Processing</div>
            <div style={{ padding: "6px 16px", background: "rgba(107, 98, 242, 0.1)", borderRadius: "9999px", fontSize: "14px", color: "var(--color-dusk-violet)", border: "1px solid rgba(107, 98, 242, 0.3)", fontWeight: 500 }}>
              AWS + Agents
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ background: "rgba(107, 98, 242, 0.05)", borderRadius: "24px", padding: "16px", fontSize: "12px", color: "var(--color-ash)" }}>
          <p style={{ margin: 0 }}>
            <span style={{ color: "var(--color-dusk-violet)", fontWeight: 500 }}>1. Collect:</span> All health data sources sync simultaneously to Nexla.
            <br/>
            <span style={{ color: "var(--color-dusk-violet)", fontWeight: 500 }}>2. Unify:</span> Nexla normalizes and combines data into a single health context.
            <br/>
            <span style={{ color: "var(--color-dusk-violet)", fontWeight: 500 }}>3. Process:</span> AWS Bedrock + Zero.xyz agents analyze patterns and recommend actions.
            <br/>
            <span style={{ color: "var(--color-dusk-violet)", fontWeight: 500 }}>4. Execute:</span> Pomerium authorizes and applies changes (calendar, notifications, etc.)
          </p>
        </div>
      </div>

      {/* Connected sources */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <h3 style={{ color: "var(--color-bone)", fontSize: "14px", fontWeight: 500, margin: 0 }}>Connected Sources</h3>

        {dataSources.map((source: any) => (
          <div key={source.name} className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
              {/* Icon and name */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ fontSize: "32px" }}>{source.icon}</div>
                <div>
                  <p style={{ color: "var(--color-bone)", fontSize: "14px", fontWeight: 500, margin: 0 }}>{source.name}</p>
                  <p style={{ color: "var(--color-slate)", fontSize: "12px", margin: 0 }}>{source.category}</p>
                </div>
              </div>

              {/* Status */}
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 12px", background: "rgba(107, 98, 242, 0.1)", borderRadius: "9999px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-dusk-violet)" }} />
                  <span style={{ fontSize: "12px", color: "var(--color-dusk-violet)", fontWeight: 500 }}>Connected</span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--color-slate)", marginTop: "8px", margin: 0 }}>Last sync: {source.lastSync}</p>
              </div>
            </div>

            {/* Description */}
            <p style={{ color: "var(--color-ash)", fontSize: "13px", marginBottom: "12px", margin: 0 }}>{source.description}</p>

            {/* Data points */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
              {source.dataPoints.map((point: string) => (
                <span
                  key={point}
                  style={{
                    fontSize: "12px",
                    padding: "4px 8px",
                    borderRadius: "9999px",
                    background: "var(--color-graphite)",
                    border: "1px solid var(--color-hairline)",
                    color: "var(--color-ash)"
                  }}
                >
                  {point}
                </span>
              ))}
            </div>

            {/* Data flow indicator */}
            <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--color-hairline)", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ fontSize: "12px", color: "var(--color-slate)" }}>Flowing to:</div>
              <div style={{ fontSize: "12px", color: "var(--color-dusk-violet)", fontWeight: 500 }}>Nexla</div>
              <div style={{ flex: 1, height: "1px", background: `linear-gradient(to right, var(--color-dusk-violet), transparent)` }} />
              <div style={{ fontSize: "12px", color: "var(--color-dusk-violet)", fontWeight: 500 }}>Agents</div>
            </div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="card" style={{ padding: "24px", background: "rgba(107, 98, 242, 0.05)" }}>
        <h3 style={{ color: "var(--color-bone)", fontSize: "14px", fontWeight: 500, margin: "0 0 16px 0" }}>How LifeOS Uses Your Data</h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
          {[
            { emoji: "🔄", title: "Continuous Sync", desc: "Data sources update every 1-5 minutes, providing real-time health context" },
            { emoji: "🧠", title: "AI Analysis", desc: "Agents analyze patterns: Is recovery low? Are you overbooked? Is sleep poor?" },
            { emoji: "✅", title: "Smart Actions", desc: "Move workouts, block screens, adjust plans—all authorized before execution" },
            { emoji: "📊", title: "Outcomes Tracked", desc: "Compare metrics before/after. Learn what works. Refine strategies daily" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <p style={{ fontSize: "12px", color: "var(--color-slate)", fontWeight: 500, margin: 0 }}>{item.emoji} {item.title}</p>
              <p style={{ fontSize: "12px", color: "var(--color-ash)", margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
