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
type TabType = 'sources' | 'overview' | 'agents' | 'sponsors' | 'actions' | 'metrics' | 'diet' | 'history';
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
    { id: 'diet', label: 'Diet Suggestions', icon: Droplet, desc: 'Nutrition recommendations' },
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

/* ─── PROFESSIONAL DATA FLOW DIAGRAM ──────────────── */
function DataFlowDiagram() {
  const [animate, setAnimate] = useState(0);
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setAnimate(a => (a + 1) % 100), 50);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const stageTimer = setInterval(() => {
      setActiveStage(s => (s + 1) % 4);
    }, 4000);
    return () => clearInterval(stageTimer);
  }, []);

  const stages = [
    {
      id: 'ingest',
      name: 'Ingest',
      description: 'Collect from 6 sources',
      icon: '📥',
      color: '#3B82F6',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      dataPoints: ['Apple Health', 'Oura Ring', 'Strava', 'Google Calendar', 'Whoop', 'Gmail'],
      volume: '15 metrics/min'
    },
    {
      id: 'normalize',
      name: 'Unify',
      description: 'Normalize & combine',
      icon: '🔗',
      color: '#8B5CF6',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-300',
      dataPoints: ['Schema mapping', 'Data validation', 'Deduplication', 'Timestamp alignment'],
      volume: '1 unified dataset'
    },
    {
      id: 'analyze',
      name: 'Analyze',
      description: 'Multi-agent reasoning',
      icon: '🧠',
      color: '#F97316',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      dataPoints: ['Pattern detection', 'Trend analysis', 'Anomaly detection', 'Decision making'],
      volume: '4 agents active'
    },
    {
      id: 'execute',
      name: 'Execute',
      description: 'Authorize & apply',
      icon: '⚡',
      color: '#10B981',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      dataPoints: ['Calendar updates', 'Notifications', 'Device control', 'Logging'],
      volume: '4 actions/cycle'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h3 className="text-[20px] font-semibold text-[#17191c] mb-1">Data Flow Architecture</h3>
        <p className="text-[14px] text-[#777b86]">Real-time autonomous health data processing pipeline</p>
      </div>

      {/* Main Flow Diagram */}
      <div className="bg-gradient-to-br from-white to-[#f9f8ff] rounded-2xl border-2 border-[#e8e5f2] p-8 shadow-sm">
        {/* Data Sources Row */}
        <div className="mb-12">
          <p className="text-[12px] font-semibold text-[#6b62f2] uppercase tracking-wide mb-4">Stage 1: Data Sources</p>
          <div className="flex gap-3 flex-wrap">
            {['🏥 Apple Health', '⭕ Oura Ring', '📅 Calendar', '📊 Whoop', '🚴 Strava', '📧 Gmail'].map((source, i) => (
              <div key={i} className={`px-4 py-2 rounded-lg border-2 font-medium text-[12px] transition-all ${
                activeStage === 0
                  ? 'bg-blue-100 border-blue-300 text-blue-700 scale-105'
                  : 'bg-blue-50 border-blue-200 text-blue-600'
              }`}>
                {source}
              </div>
            ))}
          </div>
        </div>

        {/* Flow Between Stages */}
        {[0, 1, 2].map((stageIdx) => (
          <div key={stageIdx}>
            {/* Animated Arrow */}
            <div className="relative h-16 flex items-center justify-center mb-12">
              {/* Background Line */}
              <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                <defs>
                  <linearGradient id={`gradient-${stageIdx}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={stages[stageIdx].color} stopOpacity="0.3" />
                    <stop offset="50%" stopColor={stages[stageIdx].color} stopOpacity="1" />
                    <stop offset="100%" stopColor={stages[stageIdx + 1].color} stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                <line x1="5%" y1="50%" x2="95%" y2="50%" stroke={`url(#gradient-${stageIdx})`} strokeWidth="3" />
                {/* Arrow head */}
                <polygon points="95,50 85,45 85,55" fill={stages[stageIdx + 1].color} />
              </svg>

              {/* Moving dot */}
              <div
                className="absolute w-4 h-4 rounded-full bg-white border-2 shadow-lg"
                style={{
                  left: `${(animate / 100) * 90 + 5}%`,
                  borderColor: activeStage === stageIdx ? stages[stageIdx].color : '#e8e5f2',
                  boxShadow: activeStage === stageIdx ? `0 0 12px ${stages[stageIdx].color}` : 'none',
                  transition: 'none'
                }}
              />
            </div>

            {/* Stage Card */}
            <div className={`rounded-xl border-2 p-6 mb-12 transition-all duration-300 ${
              activeStage === stageIdx + 1
                ? `${stages[stageIdx + 1].bgColor} ${stages[stageIdx + 1].borderColor} scale-105`
                : `${stages[stageIdx + 1].bgColor} ${stages[stageIdx + 1].borderColor}`
            }`}>
              {/* Stage Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">{stages[stageIdx + 1].icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[14px] font-bold" style={{ color: stages[stageIdx + 1].color }}>
                      {stages[stageIdx + 1].name}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                      activeStage === stageIdx + 1
                        ? 'bg-white text-[#6b62f2]'
                        : 'bg-white/60 text-[#777b86]'
                    }`}>
                      {stages[stageIdx + 1].volume}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#777b86]">{stages[stageIdx + 1].description}</p>
                </div>
                {activeStage === stageIdx + 1 && (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/70 border border-white">
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: stages[stageIdx + 1].color }} />
                    <span className="text-[11px] font-medium text-[#17191c]">Active</span>
                  </div>
                )}
              </div>

              {/* Data Points */}
              <div className="flex flex-wrap gap-2">
                {stages[stageIdx + 1].dataPoints.map((point, i) => (
                  <span key={i} className={`text-[11px] px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    activeStage === stageIdx + 1
                      ? 'bg-white border-white/50 text-[#17191c]'
                      : 'bg-white/40 border-white/30 text-[#777b86]'
                  }`}>
                    {point}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Process Details Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((stage) => (
          <div
            key={stage.id}
            onClick={() => setActiveStage(stages.indexOf(stage))}
            className={`rounded-lg border-2 p-4 cursor-pointer transition-all transform ${
              activeStage === stages.indexOf(stage)
                ? `${stage.bgColor} ${stage.borderColor} scale-105 shadow-lg`
                : `${stage.bgColor} ${stage.borderColor} hover:scale-102`
            }`}
          >
            <div className="text-3xl mb-2">{stage.icon}</div>
            <p className="text-[13px] font-bold text-[#17191c] mb-1">{stage.name}</p>
            <p className="text-[11px] text-[#777b86]">{stage.description}</p>
            <div className="mt-3 pt-3 border-t border-white/30">
              <p className="text-[10px] font-semibold text-[#979799]">{stage.volume}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Data Volume & Latency Info */}
      <div className="grid grid-cols-3 gap-4 bg-[#f5f3ff] rounded-lg border border-[#e8e5f2] p-6">
        <div className="text-center">
          <p className="text-[24px] font-bold text-[#6b62f2] mb-1">6</p>
          <p className="text-[12px] text-[#777b86]">Data Sources</p>
          <p className="text-[11px] text-[#979799] mt-1">Real-time sync</p>
        </div>
        <div className="text-center border-l-2 border-r-2 border-[#e8e5f2]">
          <p className="text-[24px] font-bold text-[#6b62f2] mb-1">&lt;2s</p>
          <p className="text-[12px] text-[#777b86]">Total Latency</p>
          <p className="text-[11px] text-[#979799] mt-1">End-to-end</p>
        </div>
        <div className="text-center">
          <p className="text-[24px] font-bold text-[#6b62f2] mb-1">15</p>
          <p className="text-[12px] text-[#777b86]">Metrics/Cycle</p>
          <p className="text-[11px] text-[#979799] mt-1">Per loop</p>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg border border-[#ececec] p-4">
        <p className="text-[12px] font-semibold text-[#17191c] mb-3">📊 Data Flow Legend</p>
        <div className="grid grid-cols-2 gap-3 text-[11px]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span className="text-[#777b86]">Data flows through pipeline stages</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full animate-pulse bg-green-400"></div>
            <span className="text-[#777b86]">Currently active stage</span>
          </div>
          <div className="flex items-center gap-2">
            <span>➜</span>
            <span className="text-[#777b86]">Real-time data movement</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⏱️</span>
            <span className="text-[#777b86]">Latency under 2 seconds</span>
          </div>
        </div>
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

/* ─── PROFESSIONAL AGENT WORKFLOW VISUALIZATION ──────────────── */
function AgentWorkflowVisualization() {
  const [activeAgentIdx, setActiveAgentIdx] = useState(0);
  const [messageIdx, setMessageIdx] = useState(0);

  const agents = [
    {
      name: 'Data Collector',
      shortName: 'Collect',
      icon: '📥',
      role: 'Health Data Integration',
      color: '#3B82F6',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      textColor: 'text-blue-700',
      messages: [
        '✓ Connected to 6 health data sources',
        '✓ Apple Health: Sleep 7.2h, Heart Rate 62bpm',
        '✓ Oura Ring: HRV 28ms, Sleep Score 71%',
        '✓ Strava: 8.2km run, Avg Pace 7:10/km',
        '✓ Google Calendar: HIIT scheduled 7:00am',
        '✓ Data validation: 15 metrics collected'
      ]
    },
    {
      name: 'Planner Agent',
      shortName: 'Plan',
      icon: '📋',
      role: 'Strategic Decision Making',
      color: '#8B5CF6',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-300',
      textColor: 'text-purple-700',
      messages: [
        '🔍 Analyzing current health state...',
        '💪 HRV Status: LOW (28ms < 40ms threshold)',
        '😴 Sleep Quality: GOOD (71% score)',
        '🏃 Recovery Status: POOR (23% recovery)',
        '⚡ Option 1: HIIT Workout (HIGH intensity)',
        '🚶 Option 2: Light Walk (LOW intensity)',
        '😴 Option 3: Rest Day (RECOVERY focus)',
        '✓ Generated 3 strategic options'
      ]
    },
    {
      name: 'Critic Agent',
      shortName: 'Critique',
      icon: '🔍',
      role: 'Quality Assurance & Validation',
      color: '#F97316',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      textColor: 'text-orange-700',
      messages: [
        '⚖️ Evaluating Option 1: HIIT Workout',
        '❌ REJECTED - Rationale:',
        '  • HRV too low for high-intensity training',
        '  • Sympathetic nervous system dominant',
        '  • Risk: Deepens fatigue',
        '✅ Evaluating Option 2: Light 20min Walk',
        '✅ APPROVED - Rationale:',
        '  • Low-intensity activity suitable',
        '  • Promotes parasympathetic recovery',
        '  ✓ Consensus reached with Planner'
      ]
    },
    {
      name: 'Optimizer',
      shortName: 'Optimize',
      icon: '⚡',
      role: 'Action Generation & Execution Planning',
      color: '#10B981',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      textColor: 'text-green-700',
      messages: [
        '🎯 Building comprehensive action plan...',
        '📅 Action 1: Modify Calendar',
        '  • Cancel: HIIT Workout (7:00am)',
        '  • Add: Light Walk (7:30am, 20min)',
        '🔔 Action 2: Send Notifications',
        '  • Alert: Walk reminder at 7:15am',
        '  • Alert: Magnesium supplement at 9pm',
        '📵 Action 3: Screen Management',
        '  • Enable: Blue light filter after 9pm',
        '  • Block: All notifications after 10:30pm',
        '✓ 4 Actions Approved • Execution Ready'
      ]
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAgentIdx(prev => (prev + 1) % agents.length);
      setMessageIdx(0);
    }, 12000);
    return () => clearInterval(timer);
  }, [agents.length]);

  useEffect(() => {
    const currentAgent = agents[activeAgentIdx];
    if (messageIdx < currentAgent.messages.length) {
      const timer = setTimeout(() => {
        setMessageIdx(prev => prev + 1);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [messageIdx, activeAgentIdx, agents]);

  return (
    <div className="space-y-8">
      {/* Title Section */}
      <div>
        <h2 className="text-[24px] font-semibold text-[#17191c] mb-2">Multi-Agent Reasoning System</h2>
        <p className="text-[14px] text-[#777b86]">Real-time autonomous decision making through agent consensus</p>
      </div>

      {/* Visual Agent Pipeline */}
      <div className="bg-gradient-to-br from-white to-[#f9f8ff] rounded-2xl border border-[#e8e5f2] p-8 shadow-sm">
        {/* Agent Network Diagram */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            {/* Agent Nodes */}
            {agents.map((agent, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center">
                <button
                  onClick={() => { setActiveAgentIdx(idx); setMessageIdx(0); }}
                  className={`
                    relative w-20 h-20 rounded-full flex flex-col items-center justify-center
                    transition-all duration-300 cursor-pointer transform
                    ${activeAgentIdx === idx
                      ? `scale-110 shadow-xl`
                      : 'hover:scale-105 shadow-lg'
                    }
                  `}
                  style={{
                    backgroundColor: activeAgentIdx === idx ? agent.color : '#f5f3ff',
                    border: `3px solid ${activeAgentIdx === idx ? agent.color : '#e8e5f2'}`,
                    boxShadow: activeAgentIdx === idx
                      ? `0 0 20px ${agent.color}40`
                      : '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                >
                  <div className={`text-3xl ${activeAgentIdx === idx ? 'animate-pulse' : ''}`}>
                    {agent.icon}
                  </div>
                  {activeAgentIdx === idx && (
                    <div className="absolute inset-0 rounded-full animate-pulse"
                      style={{ border: `2px solid ${agent.color}`, opacity: 0.3 }} />
                  )}
                </button>

                {/* Agent Label */}
                <p className={`text-[12px] font-semibold mt-3 text-center leading-tight
                  ${activeAgentIdx === idx ? `text-[#17191c] font-bold` : 'text-[#777b86]'}
                `}>
                  {agent.shortName}
                </p>

                {/* Status Indicator */}
                <div className={`mt-2 px-2 py-1 rounded-full text-[11px] font-medium
                  ${activeAgentIdx === idx
                    ? 'bg-green-100 text-green-700'
                    : 'bg-[#f2f2f3] text-[#979799]'
                  }
                `}>
                  {activeAgentIdx === idx ? '⚙️ Active' : '✓ Ready'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-semibold text-[#17191c]">Reasoning Progress</p>
            <p className="text-[12px] text-[#6b62f2] font-semibold">{activeAgentIdx + 1}/4 Stages</p>
          </div>
          <div className="h-2 bg-[#e8e5f2] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#6b62f2] to-[#8B5CF6] transition-all duration-500 rounded-full"
              style={{ width: `${((activeAgentIdx + 1) / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Agent Details Panel */}
        <div className={`rounded-xl p-6 transition-all duration-500 ${agents[activeAgentIdx].bgColor} border-2 ${agents[activeAgentIdx].borderColor}`}>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center text-4xl"
                style={{ backgroundColor: agents[activeAgentIdx].color + '20', border: `2px solid ${agents[activeAgentIdx].color}` }}>
                {agents[activeAgentIdx].icon}
              </div>
              <div>
                <h3 className={`text-[18px] font-bold ${agents[activeAgentIdx].textColor}`}>
                  {agents[activeAgentIdx].name}
                </h3>
                <p className="text-[12px] text-[#777b86] mt-1">{agents[activeAgentIdx].role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#ececec]">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: agents[activeAgentIdx].color }} />
              <span className="text-[12px] font-medium text-[#17191c]">Processing</span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-3">
            {agents[activeAgentIdx].messages.slice(0, messageIdx).map((msg, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/60 backdrop-blur-sm border border-white/80"
                style={{
                  animationDelay: `${i * 100}ms`
                }}
              >
                <span className="text-[16px] flex-shrink-0 font-medium">
                  {msg.includes('✓') ? '✓' : msg.includes('✅') ? '✅' : msg.includes('❌') ? '❌' : msg.includes('•') ? '→' : '•'}
                </span>
                <span className="text-[13px] leading-relaxed text-[#17191c] font-medium">
                  {msg}
                </span>
              </div>
            ))}

            {messageIdx < agents[activeAgentIdx].messages.length && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/60 animate-pulse">
                <span className="text-[16px]">→</span>
                <span className="text-[13px] font-mono text-[#6b62f2]">Processing...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Confidence', value: '94%', icon: '📊', color: 'blue' },
          { label: 'Consensus', value: '4/4', icon: '✅', color: 'green' },
          { label: 'Analysis Time', value: '2.3s', icon: '⏱️', color: 'purple' },
          { label: 'Actions Ready', value: '4', icon: '⚡', color: 'orange' },
        ].map((metric, i) => (
          <div key={i} className="bg-white rounded-lg border border-[#ececec] p-4 hover:border-[#6b62f2] transition-all">
            <p className="text-[12px] text-[#979799] mb-2">{metric.label}</p>
            <p className="text-[24px] font-bold text-[#17191c]">{metric.value}</p>
            <p className="text-[20px] mt-2">{metric.icon}</p>
          </div>
        ))}
      </div>

      {/* Decision Summary */}
      <div className="bg-gradient-to-r from-[#f5f3ff] to-[#faf9ff] rounded-lg border border-[#e8e5f2] p-6">
        <h3 className="text-[14px] font-bold text-[#6b62f2] mb-4">🎯 Final Decision Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <span className="text-[20px]">📋</span>
            <div>
              <p className="text-[12px] text-[#979799]">Recommendation</p>
              <p className="text-[14px] font-semibold text-[#17191c]">Light 20min Walk at 7:30am</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[20px]">⚡</span>
            <div>
              <p className="text-[12px] text-[#979799]">Actions Generated</p>
              <p className="text-[14px] font-semibold text-[#17191c]">4 Approved • Ready to Execute</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[20px]">🔒</span>
            <div>
              <p className="text-[12px] text-[#979799]">Authorization</p>
              <p className="text-[14px] font-semibold text-[#17191c]">Pomerium Verified</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[20px]">📊</span>
            <div>
              <p className="text-[12px] text-[#979799]">Expected Outcome</p>
              <p className="text-[14px] font-semibold text-[#17191c]">+15% HRV Recovery</p>
            </div>
          </div>
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

function DietSuggestionPage() {
  const suggestions = [
    {
      meal: 'Breakfast',
      time: '7:00 AM',
      recommendation: 'Protein-rich meal with carbs',
      items: ['Eggs (3)', 'Oatmeal (1 cup)', 'Berries (½ cup)', 'Greek yogurt (½ cup)'],
      calories: 450,
      protein: 28,
      carbs: 45,
      fats: 12,
      reason: 'Supports morning energy and muscle recovery after workouts'
    },
    {
      meal: 'Mid-Morning Snack',
      time: '10:30 AM',
      recommendation: 'Light snack with hydration',
      items: ['Banana', 'Almonds (1 oz)', 'Water (16 oz)'],
      calories: 180,
      protein: 6,
      carbs: 22,
      fats: 9,
      reason: 'Maintains energy levels and prevents afternoon crashes'
    },
    {
      meal: 'Lunch',
      time: '12:30 PM',
      recommendation: 'Balanced macronutrients',
      items: ['Salmon (150g)', 'Brown rice (1 cup)', 'Broccoli (1.5 cups)', 'Olive oil drizzle'],
      calories: 650,
      protein: 42,
      carbs: 55,
      fats: 18,
      reason: 'High omega-3 content supports cognitive function and recovery'
    },
    {
      meal: 'Pre-Workout Snack',
      time: '4:00 PM',
      recommendation: 'Quick carbs & hydration',
      items: ['Apple', 'Honey (1 tbsp)', 'Coconut water (8 oz)'],
      calories: 140,
      protein: 0.5,
      carbs: 35,
      fats: 0.5,
      reason: 'Provides energy for evening workout sessions'
    },
    {
      meal: 'Dinner',
      time: '6:30 PM',
      recommendation: 'Lean protein with vegetables',
      items: ['Chicken breast (180g)', 'Sweet potato (medium)', 'Spinach salad (2 cups)', 'Vinaigrette'],
      calories: 520,
      protein: 46,
      carbs: 48,
      fats: 10,
      reason: 'Supports muscle repair and stable sleep without heavy digestion'
    },
    {
      meal: 'Evening Recovery',
      time: '8:00 PM',
      recommendation: 'Casein protein or dairy',
      items: ['Cottage cheese (¾ cup)', 'Blueberries (½ cup)'],
      calories: 160,
      protein: 20,
      carbs: 12,
      fats: 4,
      reason: 'Slow-digesting protein supports overnight muscle recovery'
    },
  ];

  const nutritionTarget = {
    calories: 2700,
    protein: 142,
    carbs: 217,
    fats: 73,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium text-[#17191c] mb-1">Diet Suggestions</h2>
        <p className="text-[14px] text-[#777b86]">Personalized nutrition recommendations based on your goals and activity</p>
      </div>

      {/* Daily Target */}
      <div className="bg-gradient-to-br from-[#f5f3ff] to-[#faf9ff] rounded-lg border border-[#e8e5f2] p-6">
        <div className="flex items-center gap-2 mb-5">
          <Target size={16} className="text-[#6b62f2]" />
          <span className="text-[15px] font-medium text-[#17191c]">Daily Nutrition Target</span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Calories', value: nutritionTarget.calories, unit: 'kcal', icon: '🔥' },
            { label: 'Protein', value: nutritionTarget.protein, unit: 'g', icon: '💪' },
            { label: 'Carbs', value: nutritionTarget.carbs, unit: 'g', icon: '🌾' },
            { label: 'Fats', value: nutritionTarget.fats, unit: 'g', icon: '🥑' },
          ].map(({ label, value, unit, icon }) => (
            <div key={label} className="bg-white rounded-lg p-4 border border-[#ececec] text-center">
              <p className="text-[28px] mb-1">{icon}</p>
              <p className="text-[18px] font-semibold text-[#17191c]">{value}</p>
              <p className="text-[12px] text-[#979799] mt-1">{label} ({unit})</p>
            </div>
          ))}
        </div>
      </div>

      {/* Meal Plans */}
      <div className="space-y-4">
        {suggestions.map(({ meal, time, recommendation, items, calories, protein, carbs, fats, reason }, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-[#ececec] p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[18px]">🍽️</span>
                  <span className="text-[16px] font-semibold text-[#17191c]">{meal}</span>
                  <span className="text-[12px] text-[#777b86] bg-[#f2f2f3] px-2 py-1 rounded">{time}</span>
                </div>
                <p className="text-[14px] text-[#777b86] font-medium">{recommendation}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[18px] font-semibold text-[#6b62f2]">{calories}</p>
                <p className="text-[11px] text-[#979799]">kcal</p>
              </div>
            </div>

            <div className="bg-[#fafafb] rounded-lg p-4 mb-4 border border-[#ececec]">
              <p className="text-[12px] text-[#979799] uppercase tracking-[0.5px] mb-2 font-medium">Recommended Items</p>
              <div className="flex flex-wrap gap-2">
                {items.map((item, i) => (
                  <span key={i} className="text-[13px] bg-white text-[#17191c] px-3 py-1.5 rounded-lg border border-[#ececec]">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Protein', value: protein, unit: 'g' },
                { label: 'Carbs', value: carbs, unit: 'g' },
                { label: 'Fats', value: fats, unit: 'g' },
              ].map(({ label, value, unit }) => (
                <div key={label} className="bg-[#f5f3ff] rounded-lg p-3 border border-[#e8e5f2]">
                  <p className="text-[11px] text-[#9b92d9] uppercase tracking-[0.5px] font-medium mb-1">{label}</p>
                  <p className="text-[16px] font-semibold text-[#6b62f2]">{value}g</p>
                </div>
              ))}
            </div>

            <div className="bg-[#e8f5ff] rounded-lg p-3 border border-[#b3d9ff]">
              <p className="text-[12px] text-[#0066cc] font-medium">💡 Why this meal:</p>
              <p className="text-[13px] text-[#003399] mt-1">{reason}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Hydration Guide */}
      <div className="bg-white rounded-lg border border-[#ececec] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Droplet size={16} className="text-[#6b62f2]" />
          <span className="text-[15px] font-medium text-[#17191c]">Hydration Guide</span>
        </div>
        <div className="space-y-3">
          {[
            { time: 'Morning (7am-9am)', amount: '500ml', note: 'Rehydrate after sleep' },
            { time: 'Mid-morning (10am)', amount: '300ml', note: 'Before snack' },
            { time: 'Lunch (12pm-1pm)', amount: '400ml', note: 'With meal' },
            { time: 'Pre-workout (4pm)', amount: '400ml', note: 'Prepare for exercise' },
            { time: 'Post-workout (6pm)', amount: '500ml', note: 'Recovery hydration' },
            { time: 'Evening (7pm-9pm)', amount: '300ml', note: 'Light hydration before bed' },
          ].map(({ time, amount, note }, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-[#fafafb] rounded-lg border border-[#ececec]">
              <div>
                <p className="text-[13px] font-medium text-[#17191c]">{time}</p>
                <p className="text-[12px] text-[#979799]">{note}</p>
              </div>
              <span className="text-[14px] font-semibold text-[#6b62f2]">{amount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dietary Notes */}
      <div className="bg-[#fff5f5] rounded-lg border border-[#ffcccc] p-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle size={16} className="text-red-600" />
          <span className="text-[15px] font-medium text-[#17191c]">Important Notes</span>
        </div>
        <ul className="space-y-2 text-[13px] text-[#663333]">
          <li>✓ Avoid caffeine after 2 PM to maintain sleep quality</li>
          <li>✓ Eat dinner at least 3 hours before bedtime</li>
          <li>✓ Space meals 3-4 hours apart for optimal digestion</li>
          <li>✓ Adjust portions based on workout intensity</li>
          <li>✓ Stay consistent with meal timing for circadian rhythm</li>
        </ul>
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
            {activeTab === 'diet' && <DietSuggestionPage />}
            {activeTab === 'history' && <HistoryPage />}
          </div>
        </div>
      </div>
    </div>
  );
}
