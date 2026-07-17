"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  Activity, Brain, Moon, Zap, Target, TrendingUp, AlertCircle,
  CheckCircle, RefreshCw, Database, Cloud, Lock, Server,
  ArrowLeft, ChevronRight, Clock, BarChart2, GitBranch,
  Eye, Cpu, Shield, X, Play, Pause, RotateCcw, Home, Workflow,
  Settings, Sun, Moon as MoonIcon, ArrowRight, Gauge, Heart,
  Droplet, Wind, Smartphone,
} from "lucide-react";

/* ─── TYPES ──────────────────────────────────── */
type Stage = "collect"|"diagnose"|"plan"|"act"|"observe"|"learn";
type TabType = 'sources' | 'overview' | 'agents' | 'sponsors' | 'actions' | 'metrics' | 'history';
interface LogEntry { time: string; stage: Stage; message: string; sponsor: string; }
interface DataPoint { id: string; value: number; timestamp: Date; status: 'good' | 'warning' | 'critical'; }
interface Experiment { id:number; strategy:string; days:number; result:"success"|"failed"|"running"; metric:string; delta:string; }

/* ─── DATA ───────────────────────────────────── */
const STAGES: { id:Stage; label:string; icon:typeof Activity; sponsor:string }[] = [
  { id:"collect",  label:"Collect",  icon:Database,  sponsor:"Nexla"    },
  { id:"diagnose", label:"Diagnose", icon:Brain,     sponsor:"Zero.xyz" },
  { id:"plan",     label:"Plan",     icon:GitBranch, sponsor:"Zero.xyz" },
  { id:"act",      label:"Act",      icon:Zap,       sponsor:"Pomerium" },
  { id:"observe",  label:"Observe",  icon:Eye,       sponsor:"Nexla"    },
  { id:"learn",    label:"Learn",    icon:RefreshCw, sponsor:"AWS"      },
];

const MESSAGES: Record<Stage,string[]> = {
  collect:  ["🔄 Nexla: Syncing Apple Health data...", "📊 Oura Ring: Sleep score 71%", "📅 Calendar: 3 events today", "💬 Gmail: 12 unread messages", "🍎 Nutrition: 2200 cal consumed", "🌡️ Weather: 72°F, sunny"],
  diagnose: ["🧠 Zero.xyz: Analyzing patterns...", "📈 Recovery: Excellent (71%)", "⚡ Energy: Moderate (6.2/10)", "😴 Sleep quality: Good", "💪 Workout readiness: High", "✓ Diagnosis complete"],
  plan:     ["📝 Planner: Creating schedule...", "✅ Suggest: HIIT at 7am", "❌ Critic: Cancel - HRV low", "✓ Alternative: Light walk 7:30am", "🥗 Nutrition: +30g protein", "✓ Plan consensus reached"],
  act:      ["🔐 Pomerium: Authorizing changes...", "📅 Calendar: HIIT → Cancelled", "➕ Calendar: Walk added 7:30am", "🔔 Notifications: Magnesium reminder", "📵 Screen: Block after 10:30pm", "✓ All actions executed"],
  observe:  ["📊 Nexla: Collecting outcomes...", "😴 Sleep: 23% → 71% (+208%)", "❤️ HRV: 28ms → 51ms (+82%)", "🚶 Walk: Completed 22 min", "🥗 Protein: 134g target met", "✓ Observation complete"],
  learn:    ["💾 AWS: Recording strategy...", "📈 Screen block: Highly effective", "🎯 New insight: Consistency matters", "🔄 Strategy updated", "📚 Learning model improved", "✓ Loop iteration complete"],
};

const EXPERIMENTS: Experiment[] = [
  { id:1, strategy:"Early bedtime nudges",            days:3,  result:"failed",  metric:"Sleep score", delta:"+0%"  },
  { id:2, strategy:"Screen blocking after 10:30pm",   days:7,  result:"success", metric:"Sleep score", delta:"+31%" },
  { id:3, strategy:"Caffeine cutoff 1pm",             days:5,  result:"success", metric:"HRV",         delta:"+18%" },
  { id:4, strategy:"Post-workout protein timing",     days:4,  result:"failed",  metric:"Recovery",    delta:"+2%"  },
  { id:5, strategy:"20min morning walk on red days",  days:12, result:"success", metric:"Recovery",    delta:"+44%" },
  { id:6, strategy:"Alcohol cutoff 7pm",              days:2,  result:"running", metric:"Deep sleep",  delta:"…"    },
];

const DATA_SOURCES = [
  { name: 'Apple Health', icon: '🏥', category: 'Health Data', dataPoints: ['Heart Rate', 'Steps', 'Sleep', 'Workouts'] },
  { name: 'Oura Ring', icon: '⭕', category: 'Sleep & Recovery', dataPoints: ['Sleep Score', 'HRV', 'Temperature', 'Movement'] },
  { name: 'Google Calendar', icon: '📅', category: 'Schedule', dataPoints: ['Events', 'Duration', 'Attendees', 'Location'] },
  { name: 'Whoop', icon: '📊', category: 'Fitness', dataPoints: ['Strain', 'Recovery', 'Training', 'HR Data'] },
  { name: 'Strava', icon: '🚴', category: 'Activity Tracking', dataPoints: ['Running', 'Cycling', 'Distance', 'Elevation', 'Pace', 'Power'] },
  { name: 'Gmail', icon: '📧', category: 'Communications', dataPoints: ['Messages', 'Senders', 'Priority', 'Time'] },
];

function ts() { return new Date().toLocaleTimeString("en",{ hour:"2-digit", minute:"2-digit", second:"2-digit" }); }

/* ─── THEME TOGGLE ──────────────────────────── */
function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(isDarkMode);
  }, []);

  return (
    <button onClick={() => setIsDark(!isDark)} className="w-8 h-8 rounded-[8px] border border-[#ececec] flex items-center justify-center text-[#979799] hover:text-[#17191c]">
      {isDark ? <Sun size={13} /> : <MoonIcon size={13} />}
    </button>
  );
}

/* ─── HEADER ────────────────────────────────────── */
function DashHeader({ running, onToggle, onReset }:{ running:boolean; onToggle:()=>void; onReset:()=>void }) {
  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#ececec] h-16 flex items-center px-6 gap-4">
      <Link href="/" className="flex items-center gap-1.5 text-[#777b86] hover:text-[#17191c] text-[14px]">
        <ArrowLeft size={14} /><span className="hidden sm:block">Back</span>
      </Link>
      <div className="h-4 w-px bg-[#ececec]" />
      <div className="flex items-center gap-2 flex-1">
        <div className="w-5 h-5 rounded-[5px] bg-[#17191c] flex items-center justify-center">
          <Activity size={10} className="text-white" />
        </div>
        <span className="text-[#17191c] text-[15px] font-medium">LifeOS</span>
        <span className="text-[13px] text-[#979799] hidden sm:block">/ Autonomous Health Agent</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${running ? "bg-green-500 animate-pulse" : "bg-[#ececec]"}`} />
          <span className="text-[13px] text-[#777b86]">{running?"Live":"Paused"}</span>
        </div>
        <button onClick={onReset} className="w-8 h-8 rounded-[8px] border border-[#ececec] flex items-center justify-center text-[#979799] hover:text-[#17191c]">
          <RotateCcw size={13} />
        </button>
        <button onClick={onToggle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
            running ? "bg-[#f2f2f3] text-[#17191c]" : "bg-[#17191c] text-white"
          }`}>
          {running ? <><Pause size={11}/>Pause</> : <><Play size={11}/>Start</>}
        </button>
        <ThemeToggle />
      </div>
    </div>
  );
}

/* ─── SIDEBAR ────────────────────────────────– */
function Sidebar({ activeTab, onTabChange }: { activeTab: TabType; onTabChange: (tab: TabType) => void }) {
  const navItems: Array<{ id: TabType; label: string; icon: typeof Activity; desc: string }> = [
    { id: 'sources', label: 'Data Sources', icon: Database, desc: 'Connected health apps' },
    { id: 'overview', label: 'Loop Overview', icon: Home, desc: 'Current stage & progress' },
    { id: 'agents', label: 'Agent Reasoning', icon: Brain, desc: 'Multi-agent debate' },
    { id: 'sponsors', label: 'Data Flow', icon: Workflow, desc: 'System architecture' },
    { id: 'actions', label: 'Actions', icon: Zap, desc: 'Proposed to executed' },
    { id: 'metrics', label: 'Metrics', icon: TrendingUp, desc: 'Real-time analytics' },
    { id: 'history', label: 'History', icon: CheckCircle, desc: 'Past experiments' },
  ];

  return (
    <div className="w-64 border-r border-[#ececec] bg-white min-h-screen p-6 flex flex-col gap-2 sticky top-16">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left ${
            activeTab === item.id
              ? "bg-[#f5f3ff] border border-[#6b62f2] text-[#6b62f2]"
              : "border border-transparent text-[#17191c] hover:bg-[#fafafb]"
          }`}
        >
          <item.icon size={18} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium leading-tight">{item.label}</p>
            <p className={`text-[12px] mt-0.5 ${activeTab === item.id ? "text-[#9b92d9]" : "text-[#979799]"}`}>{item.desc}</p>
          </div>
          {activeTab === item.id && <ChevronRight size={14} />}
        </button>
      ))}
    </div>
  );
}

/* ─── STAT CARD ──────────────────────────────– */
function StatCard({ icon: Icon, label, value, unit, trend, trendDir }: any) {
  return (
    <div className="bg-white rounded-lg border border-[#ececec] p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-[#f0eefd] rounded-lg">
          <Icon size={18} className="text-[#6b62f2]" />
        </div>
        {trend && (
          <span className={`text-[12px] font-medium px-2 py-1 rounded-full ${
            trendDir === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trendDir === 'up' ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <p className="text-[#979799] text-[12px] mb-1">{label}</p>
      <p className="text-[#17191c] text-[24px] font-semibold">{value}<span className="text-[14px] text-[#979799]">{unit}</span></p>
    </div>
  );
}

/* ─── FLOW DIAGRAM ──────────────────────────– */
function DataFlowDiagram() {
  const [animate, setAnimate] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setAnimate(a => (a + 1) % 100), 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white rounded-lg border border-[#ececec] p-6">
      <h3 className="text-[15px] font-medium text-[#17191c] mb-6">Data Flow Pipeline</h3>
      <div className="space-y-4">
        {/* Row 1: Data Sources */}
        <div className="flex items-center gap-3 justify-between mb-8">
          <div className="flex gap-2 flex-wrap">
            {['🏥', '⭕', '📅', '📊', '🚴', '📧'].map((icon, i) => (
              <div key={i} className="w-12 h-12 rounded-lg bg-[#f0eefd] flex items-center justify-center text-lg border border-[#e8e5f2]">
                {icon}
              </div>
            ))}
          </div>
          <div className="text-[12px] text-[#979799] font-medium">Health Data Sources</div>
        </div>

        {/* Arrow 1 */}
        <div className="relative h-12 flex items-center justify-center">
          <div className="w-full h-1 bg-gradient-to-r from-[#6b62f2] to-[#f0eefd]"></div>
          <div className="absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2">
            <div className="w-6 h-6 rounded-full bg-[#6b62f2] flex items-center justify-center">
              <ArrowRight size={14} className="text-white" style={{
                transform: `translateX(${animate * 0.5 - 25}%)`
              }} />
            </div>
          </div>
        </div>

        {/* Row 2: Processing */}
        <div className="flex gap-3 justify-center mb-8">
          <div className="p-4 bg-[#f5f3ff] rounded-lg border border-[#e8e5f2] text-center w-32">
            <Cloud size={18} className="mx-auto mb-2 text-[#6b62f2]" />
            <p className="text-[12px] font-medium text-[#6b62f2]">Nexla</p>
            <p className="text-[11px] text-[#777b86]">Unify Data</p>
          </div>
          <div className="p-4 bg-[#f5f3ff] rounded-lg border border-[#e8e5f2] text-center w-32">
            <Brain size={18} className="mx-auto mb-2 text-[#6b62f2]" />
            <p className="text-[12px] font-medium text-[#6b62f2]">Zero.xyz</p>
            <p className="text-[11px] text-[#777b86]">Analyze</p>
          </div>
          <div className="p-4 bg-[#f5f3ff] rounded-lg border border-[#e8e5f2] text-center w-32">
            <Cpu size={18} className="mx-auto mb-2 text-[#6b62f2]" />
            <p className="text-[12px] font-medium text-[#6b62f2]">AWS</p>
            <p className="text-[11px] text-[#777b86]">Learn</p>
          </div>
        </div>

        {/* Arrow 2 */}
        <div className="relative h-12 flex items-center justify-center">
          <div className="w-full h-1 bg-gradient-to-r from-[#f0eefd] to-[#6b62f2]"></div>
          <div className="absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2">
            <div className="w-6 h-6 rounded-full bg-[#6b62f2] flex items-center justify-center">
              <ArrowRight size={14} className="text-white" style={{
                transform: `translateX(${25 - animate * 0.5}%)`
              }} />
            </div>
          </div>
        </div>

        {/* Row 3: Actions */}
        <div className="flex items-center justify-center gap-3">
          <div className="p-4 bg-[#fff5e6] rounded-lg border border-[#ffe8cc] text-center flex-1">
            <Lock size={18} className="mx-auto mb-2 text-orange-600" />
            <p className="text-[12px] font-medium text-orange-600">Pomerium</p>
            <p className="text-[11px] text-[#777b86]">Authorize</p>
          </div>
          <ArrowRight size={18} className="text-[#6b62f2]" />
          <div className="p-4 bg-[#e6f9f0] rounded-lg border border-[#b3e5db] text-center flex-1">
            <CheckCircle size={18} className="mx-auto mb-2 text-green-600" />
            <p className="text-[12px] font-medium text-green-600">Execute</p>
            <p className="text-[11px] text-[#777b86]">Apply Changes</p>
          </div>
        </div>

        <p className="text-[12px] text-[#979799] text-center mt-4">Real-time data flow with multi-agent coordination</p>
      </div>
    </div>
  );
}

/* ─── REAL TIME METRICS ──────────────────────– */
function RealtimeMetrics() {
  const [metrics, setMetrics] = useState([
    { id: 1, name: 'Heart Rate', value: 62, unit: 'bpm', icon: Heart, trend: '-5', trendDir: 'down' as const },
    { id: 2, name: 'Sleep Quality', value: 71, unit: '%', icon: Moon, trend: '+28', trendDir: 'up' as const },
    { id: 3, name: 'HRV', value: 51, unit: 'ms', icon: TrendingUp, trend: '+82', trendDir: 'up' as const },
    { id: 4, name: 'Recovery', value: 85, unit: '%', icon: Gauge, trend: '+44', trendDir: 'up' as const },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(m => ({
        ...m,
        value: Math.max(30, Math.min(100, m.value + Math.random() * 6 - 3))
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4">
      {metrics.map(m => (
        <StatCard
          key={m.id}
          icon={m.icon}
          label={m.name}
          value={Math.round(m.value)}
          unit={m.unit}
          trend={m.trend}
          trendDir={m.trendDir}
        />
      ))}
    </div>
  );
}

/* ─── TIMELINE COMPONENT ────────────────────– */
function Timeline({ logs }: { logs: LogEntry[] }) {
  return (
    <div className="bg-white rounded-lg border border-[#ececec] p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={16} className="text-[#6b62f2]" />
        <h3 className="text-[15px] font-medium text-[#17191c]">Live Event Timeline</h3>
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-[12px] text-[#a3a6af] text-center py-8">Waiting for events...</p>
        ) : (
          logs.slice().reverse().map((log, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg bg-[#fafafb] border border-[#ececec] text-[12px] animate-pulse-slow">
              <span className="text-[#a3a6af] font-mono min-w-fit">{log.time}</span>
              <div className="flex-1">
                <span className="inline-block px-2 py-1 bg-[#e8e5f2] text-[#6b62f2] rounded font-medium mr-2 capitalize">{log.stage}</span>
                <span className="text-[#17191c]">{log.message}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─── STAGE PROGRESS ────────────────────────– */
function StageProgress({ currentStageIdx }: { currentStageIdx: number }) {
  return (
    <div className="bg-white rounded-lg border border-[#ececec] p-6">
      <h3 className="text-[15px] font-medium text-[#17191c] mb-6">Loop Stages</h3>
      <div className="space-y-3">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentStageIdx;
          const isCurrent = idx === currentStageIdx;
          const Icon = stage.icon;

          return (
            <div key={stage.id}>
              <div className="flex items-center gap-3 mb-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-[12px] transition-all ${
                  isCurrent ? 'bg-[#6b62f2] text-white animate-pulse' :
                  isCompleted ? 'bg-green-100 text-green-700' :
                  'bg-[#f2f2f3] text-[#979799]'
                }`}>
                  {isCompleted ? <CheckCircle size={14} /> : idx + 1}
                </div>
                <div className="flex-1">
                  <p className={`text-[14px] font-medium ${isCurrent ? 'text-[#6b62f2]' : isCompleted ? 'text-[#777b86] line-through' : 'text-[#17191c]'}`}>
                    {stage.label}
                  </p>
                  <p className="text-[11px] text-[#979799]">{stage.sponsor}</p>
                </div>
              </div>
              {idx < STAGES.length - 1 && (
                <div className={`ml-4 h-3 border-l-2 ${isCompleted || isCurrent ? 'border-[#6b62f2]' : 'border-[#ececec]'}`}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── TAB PAGES ──────────────────────────────── */
function DataSourcesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium text-[#17191c] mb-1">Connected Data Sources</h2>
        <p className="text-[14px] text-[#777b86]">Your health data is securely synchronized in real-time</p>
      </div>

      <div className="grid gap-4">
        {DATA_SOURCES.map((source) => (
          <div key={source.name} className="bg-white rounded-lg border border-[#ececec] p-5 hover:border-[#6b62f2] transition-all">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{source.icon}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-[#17191c]">{source.name}</p>
                    <p className="text-[12px] text-[#979799]">{source.category}</p>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[11px] font-medium">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    Connected
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {source.dataPoints.map(point => (
                    <span key={point} className="px-2 py-1 bg-[#f0eefd] text-[#6b62f2] text-[11px] rounded-full border border-[#e8e5f2]">
                      {point}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoopOverviewPage({ stageIdx, logs, iteration, running }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium text-[#17191c] mb-1">Autonomous Loop Progress</h2>
        <p className="text-[14px] text-[#777b86]">
          <span className="inline-flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${running ? 'bg-green-500 animate-pulse' : 'bg-[#ececec]'}`}></span>
            Loop #{iteration} {running ? '• Live' : '• Paused'}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Timeline logs={logs} />
        </div>
        <StageProgress currentStageIdx={stageIdx} />
      </div>
    </div>
  );
}

/* ─── AGENT WORKFLOW VISUALIZATION ──────────────── */
function AgentWorkflowVisualization() {
  const [activeAgentIdx, setActiveAgentIdx] = useState(0);
  const [messageIdx, setMessageIdx] = useState(0);

  const agents = [
    {
      name: 'Data Collector',
      icon: '📥',
      color: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      messages: [
        '📊 Received: Sleep 7.2h, HRV 28ms, Recovery 23%',
        '📅 Received: HIIT scheduled at 7am',
        '🌡️ Received: Weather 72°F, clear skies',
        '✓ Data collection complete - 15 data points'
      ]
    },
    {
      name: 'Planner Agent',
      icon: '📋',
      color: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      messages: [
        '🧠 Analyzing health status...',
        '💡 Option 1: Keep HIIT (high intensity)',
        '💡 Option 2: Light workout (low intensity)',
        '💡 Option 3: Rest day (recovery focus)',
        '✓ Generated 3 strategic options'
      ]
    },
    {
      name: 'Critic Agent',
      icon: '🔍',
      color: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      messages: [
        '⚖️ Evaluating Option 1: HIIT workout...',
        '❌ REJECT: HRV too low (28ms < 40ms threshold)',
        '✅ APPROVE: Option 2 - Light 20min walk safe',
        '✓ Reasoning: Recovery + low strain = optimal'
      ]
    },
    {
      name: 'Optimizer',
      icon: '⚡',
      color: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      messages: [
        '🎯 Building final recommendation...',
        '+ Add: 20min morning walk at 7:30am',
        '+ Add: Magnesium supplement 9pm',
        '+ Block: Screens after 10:30pm',
        '✓ Consensus reached - 4 actions approved'
      ]
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAgentIdx(prev => (prev + 1) % agents.length);
      setMessageIdx(0);
    }, 8000);
    return () => clearInterval(timer);
  }, [agents.length]);

  useEffect(() => {
    const currentAgent = agents[activeAgentIdx];
    if (messageIdx < currentAgent.messages.length) {
      const timer = setTimeout(() => {
        setMessageIdx(prev => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [messageIdx, activeAgentIdx, agents]);

  return (
    <div className="space-y-6">
      {/* Agent Flow Diagram */}
      <div className="bg-white rounded-lg border border-[#ececec] p-8">
        <h3 className="text-[15px] font-medium text-[#17191c] mb-8">Agent Reasoning Workflow</h3>

        {/* Visual Flow */}
        <div className="grid grid-cols-4 gap-4 mb-12">
          {agents.map((agent, idx) => (
            <div
              key={idx}
              onClick={() => { setActiveAgentIdx(idx); setMessageIdx(0); }}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all transform ${
                activeAgentIdx === idx
                  ? `${agent.borderColor} ${agent.color} ring-2 ring-offset-2 ring-[#6b62f2] scale-105`
                  : 'border-[#ececec] bg-[#fafafb] hover:border-[#6b62f2]'
              }`}
            >
              <div className="text-3xl mb-2">{agent.icon}</div>
              <p className={`text-[13px] font-semibold ${activeAgentIdx === idx ? agent.textColor : 'text-[#17191c]'}`}>
                {agent.name}
              </p>
              <div className={`w-full h-1 rounded-full mt-2 ${activeAgentIdx === idx ? agent.color : 'bg-[#ececec]'}`}></div>
            </div>
          ))}
        </div>

        {/* Animated Arrows Between Agents */}
        <div className="relative h-2 bg-gradient-to-r from-[#6b62f2] to-[#6b62f2] rounded-full mb-12 overflow-hidden">
          <div
            className="absolute h-full bg-white rounded-full animate-pulse"
            style={{
              width: '20%',
              left: `${(activeAgentIdx / (agents.length - 1)) * 80}%`,
              transition: 'left 0.3s ease'
            }}
          ></div>
        </div>

        {/* Current Agent Details */}
        <div className={`${agents[activeAgentIdx].color} border-2 ${agents[activeAgentIdx].borderColor} rounded-lg p-6`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">{agents[activeAgentIdx].icon}</div>
            <div>
              <p className={`text-[18px] font-semibold ${agents[activeAgentIdx].textColor}`}>
                {agents[activeAgentIdx].name}
              </p>
              <p className="text-[12px] text-[#777b86]">Processing...</p>
            </div>
          </div>

          {/* Message Stream */}
          <div className="space-y-2">
            {agents[activeAgentIdx].messages.slice(0, messageIdx).map((msg, i) => (
              <div key={i} className="flex items-start gap-2 p-2 bg-white rounded border-l-2 border-[#6b62f2] animate-slide-in">
                <span className="text-[14px] leading-relaxed text-[#17191c]">{msg}</span>
              </div>
            ))}
            {messageIdx < agents[activeAgentIdx].messages.length && (
              <div className="flex items-start gap-2 p-2 bg-white rounded border-l-2 border-[#6b62f2] animate-pulse">
                <span className="text-[14px] font-mono text-[#6b62f2]">█</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-2 gap-4">
        {agents.map((agent, idx) => (
          <div
            key={idx}
            onClick={() => { setActiveAgentIdx(idx); setMessageIdx(0); }}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              activeAgentIdx === idx
                ? `${agent.borderColor} ${agent.color}`
                : 'border-[#ececec] bg-white hover:border-[#6b62f2]'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">{agent.icon}</div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-[#17191c]">{agent.name}</p>
                <p className="text-[12px] text-[#979799] mt-1">
                  {activeAgentIdx === idx ? (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#6b62f2] animate-pulse"></span>
                      Active
                    </span>
                  ) : (
                    'Ready'
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Workflow Summary */}
      <div className="bg-[#f5f3ff] border border-[#e8e5f2] rounded-lg p-6">
        <h3 className="text-[15px] font-medium text-[#6b62f2] mb-4">📊 Consensus Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: '✅', label: 'Actions Approved', value: '4' },
            { icon: '⚖️', label: 'Evaluations', value: '3' },
            { icon: '💡', label: 'Options Generated', value: '3' },
            { icon: '⏱️', label: 'Processing Time', value: '2.3s' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="text-2xl">{item.icon}</div>
              <div>
                <p className="text-[12px] text-[#777b86]">{item.label}</p>
                <p className="text-[16px] font-semibold text-[#6b62f2]">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AgentReasoningPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium text-[#17191c] mb-1">Agent Reasoning System</h2>
        <p className="text-[14px] text-[#777b86]">Interactive multi-agent workflow with real-time reasoning</p>
      </div>

      <AgentWorkflowVisualization />
    </div>
  );
}

function DataFlowPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium text-[#17191c] mb-1">Data Flow Architecture</h2>
        <p className="text-[14px] text-[#777b86]">How data moves through the LifeOS system</p>
      </div>

      <DataFlowDiagram />

      <div className="grid grid-cols-2 gap-4">
        {[
          { step: '1', title: 'Ingest', desc: 'Data collected from multiple sources', color: 'bg-blue-50' },
          { step: '2', title: 'Unify', desc: 'Normalize and combine datasets', color: 'bg-purple-50' },
          { step: '3', title: 'Analyze', desc: 'Multi-agent analysis & debate', color: 'bg-pink-50' },
          { step: '4', title: 'Act', desc: 'Execute authorized actions', color: 'bg-green-50' },
        ].map((item) => (
          <div key={item.step} className={`${item.color} rounded-lg border border-[#ececec] p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-white border-2 border-[#6b62f2] flex items-center justify-center text-[12px] font-semibold text-[#6b62f2]">
                {item.step}
              </div>
              <p className="font-medium text-[#17191c]">{item.title}</p>
            </div>
            <p className="text-[12px] text-[#777b86]">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionsPage({ stage }: any) {
  const done = stage === "act" || stage === "observe" || stage === "learn";
  const items = [
    { label: "Cancel 7am HIIT workout", chip: "Pomerium", icon: X, done: done },
    { label: "Move alarm to 7:30am", chip: "Pomerium", icon: Clock, done: done },
    { label: "Add 20min walk at 7:30am", chip: "Pomerium", icon: Activity, done: done },
    { label: "Block screens after 10:30pm", chip: "Pomerium", icon: Shield, done: done },
    { label: "Eat ≥134g protein today", chip: "–", icon: Target, done: false },
    { label: "Last drink before 7pm", chip: "–", icon: Moon, done: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium text-[#17191c] mb-1">Suggested Actions</h2>
        <p className="text-[14px] text-[#777b86]">{items.filter(i => i.done).length} of {items.length} actions executed</p>
      </div>

      <div className="bg-white rounded-lg border border-[#ececec] p-6">
        <div className="space-y-2">
          {items.map(({ label, chip, icon: Icon, done: d }) => (
            <div key={label} className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
              d ? "bg-[#f0f9f4] border-green-200" : "bg-[#fafafb] border-[#ececec]"
            }`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                d ? "bg-green-500 border-green-500" : "border-[#ececec]"
              }`}>
                {d ? <CheckCircle size={12} className="text-white" /> : <Icon size={12} className="text-[#a3a6af]" />}
              </div>
              <span className={`font-[14px] flex-1 transition-all ${
                d ? "text-[#777b86] line-through" : "text-[#17191c]"
              }`}>{label}</span>
              {chip !== "–" && <span className="text-[11px] bg-[#e8e5f2] text-[#6b62f2] px-2 py-1 rounded-full font-medium">{chip}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricsPage({ stage }: any) {
  const goals = [
    { label: 'Lose 20 lbs', progress: 38, current: '7.6 lbs lost' },
    { label: 'Increase energy', progress: 62, current: 'Score: 6.2/10' },
    { label: 'Improve sleep', progress: 71, current: 'Avg 7.1h / 78' },
  ];

  const good = stage === "observe" || stage === "learn";
  const healthScore = good ? 71 : 23;
  const metrics = [
    { label: 'HRV', value: good ? '51ms' : '28ms', ok: good },
    { label: 'Sleep', value: '7h 12m', ok: true },
    { label: 'Steps', value: '8,240', ok: true },
    { label: 'Recovery', value: good ? '71%' : '23%', ok: good },
  ];

  const resolved = stage === "learn" || stage === "observe";
  const done = stage === "act" || stage === "observe" || stage === "learn";

  const actions = [
    { label: 'Cancel 7am HIIT workout', chip: 'Pomerium', icon: X, done: done },
    { label: 'Move alarm to 7:30am', chip: 'Pomerium', icon: Clock, done: done },
    { label: 'Add 20min walk at 7:30am', chip: 'Pomerium', icon: Activity, done: done },
    { label: 'Block screens after 10:30pm', chip: 'Pomerium', icon: Shield, done: done },
    { label: 'Eat ≥134g protein today', chip: '–', icon: Target, done: false },
    { label: 'Last drink before 7pm', chip: '–', icon: Moon, done: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium text-[#17191c] mb-1">Health Metrics & Analytics</h2>
        <p className="text-[14px] text-[#777b86]">Complete overview of your health and wellness factors</p>
      </div>

      {/* Goals Section */}
      <div className="bg-white rounded-lg border border-[#ececec] p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-[#6b62f2]" />
            <span className="text-[15px] font-medium text-[#17191c]">Goals</span>
          </div>
          <span className="text-[13px] text-[#979799]">Day 23 of 90</span>
        </div>
        <div className="space-y-4">
          {goals.map(({ label, progress, current }) => (
            <div key={label}>
              <div className="flex justify-between mb-2">
                <span className="text-[14px] text-[#777b86]">{label}</span>
                <span className="text-[13px] font-medium text-[#17191c]">{current}</span>
              </div>
              <div className="h-2 bg-[#f2f2f3] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#6b62f2] to-[#9b92d9] rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Health Score */}
      <div className="bg-white rounded-lg border border-[#ececec] p-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart2 size={16} className="text-[#6b62f2]" />
          <span className="text-[15px] font-medium text-[#17191c]">Current Health Score</span>
          <span className="text-[11px] bg-[#e8e5f2] text-[#6b62f2] px-2 py-0.5 rounded font-medium">Nexla</span>
        </div>
        <div className="flex items-center gap-8 mb-6">
          {/* Donut Chart */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#f2f2f3" strokeWidth="6" />
              <circle cx="40" cy="40" r="32" fill="none" stroke="#6b62f2" strokeWidth="6"
                strokeDasharray={`${healthScore / 100 * 201} 201`} strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s ease' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[28px] font-semibold text-[#17191c]">{healthScore}</span>
              <span className="text-[11px] text-[#979799]">/100</span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-6 flex-1">
            {metrics.map(({ label, value, ok }) => (
              <div key={label}>
                <p className="text-[12px] text-[#979799] mb-1">{label}</p>
                <p className={`text-[14px] font-medium ${ok ? 'text-[#17191c]' : 'text-[#a3a6af]'}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Current Bottleneck */}
      <div className={`bg-white rounded-lg border p-6 transition-all duration-500 ${
        resolved ? 'border-[#ececec]' : 'border-[#6b62f2]/30 bg-[#f5f3ff]'
      }`}>
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={16} className="text-[#6b62f2]" />
          <span className="text-[15px] font-medium text-[#17191c]">Current Bottleneck</span>
          {!resolved && <span className="ml-auto text-[12px] bg-[#6b62f2] text-white rounded px-2.5 py-0.5 font-medium">Critical</span>}
        </div>
        {resolved ? (
          <>
            <p className="text-[15px] font-medium text-[#17191c] mb-2">Sleep consistency improved</p>
            <p className="text-[14px] text-[#777b86] leading-relaxed mb-3">Bedtime now consistent ±30min. Circadian rhythm stabilizing. HRV ceiling improving.</p>
          </>
        ) : (
          <>
            <p className="text-[18px] font-semibold text-[#6b62f2] mb-2">Sleep debt accumulation</p>
            <p className="text-[14px] text-[#777b86] leading-relaxed mb-3">4h 52m last night. HRV crashed to 28ms. Sympathetic nervous system dominant. All training today deepens the deficit.</p>
          </>
        )}
        <div className={`rounded-lg p-3 border ${resolved ? 'bg-[#f0f9f4] border-green-200' : 'bg-[#fff5f5] border-red-200'}`}>
          <p className="text-[12px] text-[#979799] uppercase tracking-[0.5px] mb-1 font-medium">Agent response</p>
          <p className="text-[13px] text-[#17191c]">
            {resolved ? '✓ Testing: fixed 10:30pm wind-down trigger' : '⚠️ Immediate: cancel workout, prioritise recovery today'}
          </p>
        </div>
      </div>

      {/* Current Experiment */}
      <div className="bg-white rounded-lg border border-[#ececec] p-6">
        <div className="flex items-center gap-2 mb-5">
          <Cpu size={16} className="text-[#6b62f2]" />
          <span className="text-[15px] font-medium text-[#17191c]">Current Experiment</span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#6b62f2] animate-pulse" />
            <span className="text-[12px] text-[#777b86] font-medium">Day 2</span>
          </div>
        </div>

        {/* Hypothesis block */}
        <div className="bg-[#fbe1d1] rounded-lg p-4 mb-4 border border-[#f5ceb3]">
          <p className="text-[12px] text-[#5d2a1a] uppercase tracking-[0.5px] mb-2 font-medium">Hypothesis</p>
          <p className="text-[17px] font-semibold text-[#5d2a1a] mb-2 leading-snug">Alcohol cutoff at 7pm</p>
          <p className="text-[13px] text-[#5d2a1a] leading-relaxed opacity-90">Predicts +15% deep sleep, +8% HRV. Based on pattern: 3/4 poor sleep nights correlate with evening drinks after 8pm.</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Metric', value: 'Deep sleep' },
            { label: 'Baseline', value: '1h 12m' },
            { label: 'Target', value: '1h 23m' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#fafafb] rounded-lg p-3 text-center border border-[#ececec]">
              <p className="text-[11px] text-[#979799] mb-1">{label}</p>
              <p className="text-[14px] font-medium text-[#17191c]">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Actions */}
      <div className="bg-white rounded-lg border border-[#ececec] p-6">
        <div className="flex items-center gap-2 mb-5">
          <Zap size={16} className="text-[#6b62f2]" />
          <span className="text-[15px] font-medium text-[#17191c]">Suggested Actions</span>
          <span className="text-[11px] bg-[#e8e5f2] text-[#6b62f2] px-2 py-0.5 rounded font-medium">Pomerium</span>
          <span className="ml-auto text-[12px] text-[#979799] font-medium">{actions.filter(i => i.done).length}/{actions.length}</span>
        </div>
        <div className="space-y-2">
          {actions.map(({ label, chip, icon: Icon, done: d }) => (
            <div key={label} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              d ? 'bg-[#f0f9f4] border-green-200' : 'bg-[#fafafb] border-[#ececec]'
            }`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                d ? 'bg-green-500 border-green-500' : 'border-[#ececec]'
              }`}>
                {d ? <CheckCircle size={12} className="text-white" /> : <Icon size={12} className="text-[#a3a6af]" />}
              </div>
              <span className={`text-[14px] flex-1 transition-all ${d ? 'text-[#777b86] line-through' : 'text-[#17191c]'}`}>
                {label}
              </span>
              {chip !== '–' && <span className="text-[11px] bg-[#e8e5f2] text-[#6b62f2] px-2 py-0.5 rounded font-medium">{chip}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Experiment History */}
      <div className="bg-white rounded-lg border border-[#ececec] p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={16} className="text-[#6b62f2]" />
          <span className="text-[15px] font-medium text-[#17191c]">Experiment History</span>
          <span className="text-[11px] bg-[#e8e5f2] text-[#6b62f2] px-2 py-0.5 rounded font-medium">AWS</span>
        </div>
        <div className="space-y-2">
          {EXPERIMENTS.map(({ id, strategy, days, result, metric, delta }) => (
            <div key={id} className="flex items-start gap-3 p-3 bg-[#fafafb] rounded-lg border border-[#ececec]">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${
                result === 'success' ? 'bg-green-500' : result === 'running' ? 'bg-blue-500 animate-pulse' : 'bg-red-500'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-[#17191c] leading-snug">{strategy}</p>
                <p className="text-[12px] text-[#979799] mt-0.5">{days} days · {metric}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`font-mono text-[13px] font-semibold ${
                  result === 'success' ? 'text-green-600' : result === 'running' ? 'text-blue-600' : 'text-red-600'
                }`}>{delta}</p>
                <p className={`text-[12px] capitalize font-medium ${
                  result === 'success' ? 'text-green-600' : result === 'running' ? 'text-blue-600' : 'text-red-600'
                }`}>{result}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Progress */}
      <div className="bg-white rounded-lg border border-[#ececec] p-6">
        <h3 className="text-[15px] font-medium text-[#17191c] mb-4">Daily Progress</h3>
        <div className="space-y-4">
          {[
            { label: 'Sleep Goal', current: 7.2, target: 8, unit: 'hours' },
            { label: 'Activity Goal', current: 8240, target: 10000, unit: 'steps' },
            { label: 'Protein Goal', current: 112, target: 134, unit: 'g' },
            { label: 'Water Intake', current: 1.8, target: 2.5, unit: 'L' },
          ].map((goal) => (
            <div key={goal.label}>
              <div className="flex justify-between mb-2">
                <span className="text-[13px] font-medium text-[#17191c]">{goal.label}</span>
                <span className="text-[12px] text-[#6b62f2] font-semibold">{Math.round(goal.current / goal.target * 100)}%</span>
              </div>
              <div className="w-full bg-[#f2f2f3] rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#6b62f2] to-[#9b92d9] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, goal.current / goal.target * 100)}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-[#979799] mt-1">{goal.current} / {goal.target} {goal.unit}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium text-[#17191c] mb-1">Experiment History</h2>
        <p className="text-[14px] text-[#777b86]">Past experiments and their outcomes</p>
      </div>

      <div className="bg-white rounded-lg border border-[#ececec] p-6">
        <div className="space-y-2">
          {EXPERIMENTS.map(({ id, strategy, days, result, metric, delta }) => (
            <div key={id} className="flex items-start gap-3 p-4 bg-[#fafafb] rounded-lg border border-[#ececec]">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${
                result === "success" ? "bg-green-500" :
                result === "running" ? "bg-blue-500 animate-pulse" :
                "bg-red-500"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-[#17191c] leading-snug">{strategy}</p>
                <p className="text-[12px] text-[#979799] mt-1">{days} days • {metric}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`font-mono text-[14px] font-semibold ${
                  result === "success" ? "text-green-600" :
                  result === "running" ? "text-blue-600" :
                  "text-red-600"
                }`}>{delta}</p>
                <p className={`text-[12px] capitalize font-medium ${
                  result === "success" ? "text-green-600" :
                  result === "running" ? "text-blue-600" :
                  "text-red-600"
                }`}>{result}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ───────────────────────────────── */
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('sources');
  const [running, setRunning] = useState(true);
  const [stageIdx, setStageIdx] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [msgIdx, setMsgIdx] = useState(0);
  const [iteration, setIteration] = useState(1);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get('tab') as TabType | null;
      if (tabParam && ['sources', 'overview', 'agents', 'sponsors', 'actions', 'metrics', 'history'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const stage = STAGES[stageIdx].id;

  const reset = useCallback(() => {
    setStageIdx(0); setLogs([]); setMsgIdx(0); setIteration(1); setRunning(false);
    setTimeout(() => setRunning(true), 120);
  }, []);

  useEffect(() => {
    if (!running) return;
    const messages = MESSAGES[stage];
    if (msgIdx >= messages.length) {
      const t = setTimeout(() => {
        const next = (stageIdx + 1) % STAGES.length;
        setStageIdx(next); setMsgIdx(0);
        if (next === 0) setIteration(n => n + 1);
      }, 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setLogs(prev => [...prev.slice(-60), { time: ts(), stage, message: messages[msgIdx], sponsor: STAGES[stageIdx].sponsor }]);
      setMsgIdx(n => n + 1);
    }, 750);
    return () => clearTimeout(t);
  }, [running, stage, stageIdx, msgIdx]);

  return (
    <div className="min-h-screen bg-[#fafafb]">
      <DashHeader running={running} onToggle={() => setRunning(r => !r)} onReset={reset} />

      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex-1">
          <div className="border-b border-[#ececec] bg-white px-6 py-4 sticky top-16 z-40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${running ? 'bg-green-500 animate-pulse' : 'bg-[#ececec]'}`} />
                  <span className="text-[14px] text-[#777b86] font-medium">
                    Loop <span className="font-mono">#{ iteration}</span> • <span className="capitalize text-[#6b62f2] font-semibold">{stage}</span>
                  </span>
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-4 text-[12px] text-[#979799]">
                {['Nexla', 'Zero.xyz', 'AWS', 'Pomerium'].map(s => (
                  <div key={s} className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#6b62f2]"></div>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 max-w-6xl">
            {activeTab === 'sources' && <DataSourcesPage />}
            {activeTab === 'overview' && <LoopOverviewPage stageIdx={stageIdx} logs={logs} iteration={iteration} running={running} />}
            {activeTab === 'agents' && <AgentReasoningPage />}
            {activeTab === 'sponsors' && <DataFlowPage />}
            {activeTab === 'actions' && <ActionsPage stage={stage} />}
            {activeTab === 'metrics' && <MetricsPage stage={stage} />}
            {activeTab === 'history' && <HistoryPage />}
          </div>
        </div>
      </div>
    </div>
  );
}
