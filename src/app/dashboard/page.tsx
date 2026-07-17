"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  Activity, Brain, Moon, Zap, Target, TrendingUp, AlertCircle,
  CheckCircle, RefreshCw, Database, Cloud, Lock, Server, ArrowLeft,
  ChevronRight, Clock, BarChart2, GitBranch, Eye, Cpu, Shield,
  X, Play, Pause, RotateCcw
} from "lucide-react";

/* ── TYPES ──────────────────────────────────────── */
type LoopStage = "collect" | "diagnose" | "plan" | "act" | "observe" | "learn";
interface LogEntry { time: string; stage: LoopStage; message: string; sponsor: string; }
interface Experiment { id: number; strategy: string; days: number; result: "success" | "failed" | "running"; metric: string; delta: string; }

/* ── DATA ───────────────────────────────────────── */
const STAGES: { id: LoopStage; label: string; icon: typeof Activity; sponsor: string; color: string }[] = [
  { id: "collect",  label: "Collect",  icon: Database,  sponsor: "Nexla",    color: "#9cbf93" },
  { id: "diagnose", label: "Diagnose", icon: Brain,     sponsor: "Zero.xyz", color: "#aed2a4" },
  { id: "plan",     label: "Plan",     icon: GitBranch, sponsor: "Zero.xyz", color: "#aed2a4" },
  { id: "act",      label: "Act",      icon: Zap,       sponsor: "Pomerium", color: "#7fee64" },
  { id: "observe",  label: "Observe",  icon: Eye,       sponsor: "Nexla",    color: "#9cbf93" },
  { id: "learn",    label: "Learn",    icon: RefreshCw, sponsor: "AWS",      color: "#aed2a4" },
];

const LOOP_MESSAGES: Record<LoopStage, string[]> = {
  collect:  ["Nexla pulling Oura sleep data…", "HRV stream: 28ms detected", "Calendar sync: HIIT 7am found", "Gmail scan: late meeting flagged", "Nutrition log: protein deficit -22g", "Weather: 18°C, clear — walk viable"],
  diagnose: ["Zero.xyz → Planner agent initialised", "Zero.xyz → Critic agent initialised", "Recovery score calculated: 23%", "Cortisol pattern: elevated overnight", "Sleep debt: 2.3h accumulated", "Diagnosis: sympathetic NS dominant"],
  plan:     ["Planner: keep HIIT workout", "Critic: BLOCK — HRV too low", "Planner: propose light walk instead", "Critic: APPROVE — 20min walk safe", "Nutrition: +30g protein target", "Consensus reached in 4 iterations"],
  act:      ["Pomerium: auth request → APPROVED", "Calendar: HIIT cancelled", "Calendar: 20min walk added 7:30am", "Alarm: moved to 7:30am", "Device: screen block set 10:30pm", "Notification: magnesium reminder 9pm"],
  observe:  ["Nexla: next-morning data incoming", "Sleep score: 23% → 71% (+208%)", "HRV: 28ms → 51ms recovered", "Screen block compliance: 94%", "Walk completed: ✓ 22 minutes", "Protein target met: 134g"],
  learn:    ["AWS DynamoDB: writing strategy log", "Screen blocking: HIGH efficacy → locked", "Early alarm: NEUTRAL → deprioritised", "New hypothesis: alcohol cutoff 7pm", "Strategy changelog updated", "Loop iteration complete ✓"],
};

const EXPERIMENTS: Experiment[] = [
  { id: 1, strategy: "Early bedtime nudges",          days: 3,  result: "failed",  metric: "Sleep score",   delta: "+0%" },
  { id: 2, strategy: "Screen blocking after 10:30pm", days: 7,  result: "success", metric: "Sleep score",   delta: "+31%" },
  { id: 3, strategy: "Caffeine cutoff 1pm",           days: 5,  result: "success", metric: "HRV",           delta: "+18%" },
  { id: 4, strategy: "Post-workout protein timing",   days: 4,  result: "failed",  metric: "Recovery",      delta: "+2%" },
  { id: 5, strategy: "20min morning walk on red days", days: 12, result: "success", metric: "Recovery",     delta: "+44%" },
  { id: 6, strategy: "Alcohol cutoff 7pm",            days: 2,  result: "running", metric: "Deep sleep",    delta: "…" },
];

/* ── HELPERS ─────────────────────────────────────── */
function now() { return new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
function SponsorBadge({ name }: { name: string }) {
  return <span className="text-caption text-[#677d64] bg-[#212525] border border-[#485346]/30 rounded-pills px-2 py-0.5 font-mono">{name}</span>;
}
function StatusDot({ active }: { active: boolean }) {
  return <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? "bg-[#7fee64] animate-pulse" : "bg-[#485346]"}`} />;
}

/* ── NAV ─────────────────────────────────────────── */
function DashNav({ running, onToggle, onReset }: { running: boolean; onToggle: () => void; onReset: () => void }) {
  return (
    <nav className="sticky top-0 z-50 bg-[#212525]/95 backdrop-blur border-b border-[#1f2a33] h-14 flex items-center px-6 gap-4">
      <Link href="/" className="flex items-center gap-1.5 text-[#8cab87] hover:text-[#ddffdc] transition-colors text-body-sm">
        <ArrowLeft size={14} /> <span className="hidden sm:block">Back</span>
      </Link>
      <div className="h-4 w-px bg-[#485346]/40" />
      <div className="flex items-center gap-2 flex-1">
        <div className="w-5 h-5 rounded-sm flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7fee64,#18b759)" }}>
          <Activity size={10} className="text-black" />
        </div>
        <span className="font-display text-[#ddffdc] text-sm font-medium">LifeOS</span>
        <span className="text-caption text-[#677d64] hidden sm:block">/ Dashboard</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5">
          <StatusDot active={running} />
          <span className="text-caption text-[#8cab87]">{running ? "Agent running" : "Agent paused"}</span>
        </div>
        <button onClick={onReset} className="w-8 h-8 rounded-cards border border-[#485346]/40 flex items-center justify-center text-[#677d64] hover:text-[#9cbf93] hover:border-[#485346] transition-all">
          <RotateCcw size={13} />
        </button>
        <button onClick={onToggle} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pills text-caption font-medium transition-all ${running ? "bg-[#181818] border border-[#485346] text-[#8cab87] hover:text-[#ddffdc]" : "bg-[#7fee64] text-black hover:bg-[#9fff80]"}`}>
          {running ? <><Pause size={11} /> Pause</> : <><Play size={11} /> Run</>}
        </button>
      </div>
    </nav>
  );
}

/* ── GOAL CARD ───────────────────────────────────── */
function GoalCard() {
  const goals = [
    { label: "Lose 20 lbs", progress: 38, current: "7.6 lbs lost" },
    { label: "Increase energy", progress: 62, current: "Score: 6.2/10" },
    { label: "Improve sleep", progress: 71, current: "Avg 7.1h / 78 score" },
  ];
  return (
    <div className="bg-[#181818] rounded-cards border border-[#485346]/40 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Target size={15} className="text-[#9cbf93]" />
          <span className="text-body-sm font-medium text-[#ddffdc]">Goals</span>
        </div>
        <span className="text-caption text-[#677d64]">Day 23</span>
      </div>
      <div className="space-y-4">
        {goals.map(({ label, progress, current }) => (
          <div key={label}>
            <div className="flex justify-between mb-1.5">
              <span className="text-body-sm text-[#8cab87]">{label}</span>
              <span className="text-caption text-[#ddffdc] font-medium">{current}</span>
            </div>
            <div className="h-1 bg-[#212525] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-[#7fee64] transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── HEALTH SCORE ────────────────────────────────── */
function HealthScoreCard({ stage }: { stage: LoopStage }) {
  const score = stage === "observe" || stage === "learn" ? 71 : 23;
  const metrics = [
    { label: "HRV",      value: stage === "observe" || stage === "learn" ? "51ms" : "28ms", good: stage !== "collect" && stage !== "diagnose" },
    { label: "Sleep",    value: "7h 12m", good: true },
    { label: "Steps",    value: "8,240",  good: true },
    { label: "Recovery", value: stage === "observe" || stage === "learn" ? "71%" : "23%", good: stage === "observe" || stage === "learn" },
  ];
  return (
    <div className="bg-[#181818] rounded-cards border border-[#485346]/40 p-6">
      <div className="flex items-center gap-2 mb-5">
        <BarChart2 size={15} className="text-[#9cbf93]" />
        <span className="text-body-sm font-medium text-[#ddffdc]">Current Health Score</span>
        <SponsorBadge name="Nexla" />
      </div>
      <div className="flex items-center gap-6 mb-5">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="32" fill="none" stroke="#212525" strokeWidth="6" />
            <circle cx="40" cy="40" r="32" fill="none" stroke="#7fee64" strokeWidth="6"
              strokeDasharray={`${score / 100 * 201} 201`} strokeLinecap="round"
              style={{ transition: "stroke-dasharray 1s ease" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-[#ddffdc] text-lg font-medium leading-none">{score}</span>
            <span className="text-caption text-[#677d64]">/100</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 flex-1">
          {metrics.map(({ label, value, good }) => (
            <div key={label}>
              <p className="text-caption text-[#677d64] mb-0.5">{label}</p>
              <p className={`text-body-sm font-medium ${good ? "text-[#ddffdc]" : "text-[#8cab87]"}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── BOTTLENECK ──────────────────────────────────── */
function BottleneckCard({ stage }: { stage: LoopStage }) {
  const bottleneck = stage === "learn" || stage === "observe"
    ? { issue: "Sleep consistency", severity: "medium", detail: "Bedtime varies ±90min across weekdays. Circadian rhythm instability limiting HRV ceiling.", action: "Testing: fixed 10:30pm wind-down trigger" }
    : { issue: "Sleep debt accumulation", severity: "high", detail: "4h 52m last night. HRV crashed to 28ms. Sympathetic nervous system dominant. All training today would deepen the deficit.", action: "Immediate: cancel workout, prioritise recovery" };
  return (
    <div className={`bg-[#181818] rounded-cards border p-6 transition-all duration-500 ${bottleneck.severity === "high" ? "border-[#485346] glow-lime" : "border-[#485346]/40"}`}>
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle size={15} className={bottleneck.severity === "high" ? "text-[#7fee64]" : "text-[#9cbf93]"} />
        <span className="text-body-sm font-medium text-[#ddffdc]">Current Bottleneck</span>
        {bottleneck.severity === "high" && (
          <span className="text-caption text-black bg-[#7fee64] rounded-pills px-2 py-0.5 font-medium ml-auto">High</span>
        )}
      </div>
      <p className="text-body-sm font-medium text-[#ddffdc] mb-2">{bottleneck.issue}</p>
      <p className="text-body-sm text-[#8cab87] mb-3 leading-relaxed">{bottleneck.detail}</p>
      <div className="bg-[#212525] rounded-cards p-3 border border-[#485346]/30">
        <p className="text-caption text-[#677d64] uppercase tracking-[0.6px] mb-1">Agent response</p>
        <p className="text-body-sm text-[#9cbf93]">{bottleneck.action}</p>
      </div>
    </div>
  );
}

/* ── CURRENT EXPERIMENT ──────────────────────────── */
function ExperimentCard() {
  return (
    <div className="bg-[#181818] rounded-cards border border-[#485346]/40 p-6">
      <div className="flex items-center gap-2 mb-5">
        <Cpu size={15} className="text-[#9cbf93]" />
        <span className="text-body-sm font-medium text-[#ddffdc]">Current Experiment</span>
        <div className="ml-auto flex items-center gap-1.5">
          <StatusDot active={true} />
          <span className="text-caption text-[#7fee64]">Day 2</span>
        </div>
      </div>
      <div className="bg-[#212525] rounded-cards p-4 border border-[#485346]/30 mb-4">
        <p className="text-caption text-[#677d64] uppercase tracking-[0.6px] mb-2">Hypothesis</p>
        <p className="text-body-sm text-[#ddffdc] font-medium mb-1">Alcohol cutoff at 7pm</p>
        <p className="text-body-sm text-[#8cab87]">Predicts: +15% deep sleep, +8% HRV recovery. Based on pattern: 3/4 poor sleep nights correlate with evening drinks after 8pm.</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Metric", value: "Deep sleep" },
          { label: "Baseline", value: "1h 12m" },
          { label: "Target", value: "1h 23m" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#000000] rounded-cards p-3 text-center">
            <p className="text-caption text-[#677d64] mb-1">{label}</p>
            <p className="text-body-sm font-medium text-[#ddffdc]">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── SUGGESTED ACTIONS ───────────────────────────── */
function SuggestedActionsCard({ stage }: { stage: LoopStage }) {
  const allActions = [
    { done: stage === "act" || stage === "observe" || stage === "learn", label: "Cancel 7am HIIT workout", sponsor: "Pomerium", icon: X },
    { done: stage === "act" || stage === "observe" || stage === "learn", label: "Move alarm to 7:30am", sponsor: "Pomerium", icon: Clock },
    { done: stage === "act" || stage === "observe" || stage === "learn", label: "Add 20min walk at 7:30am", sponsor: "Pomerium", icon: Activity },
    { done: stage === "act" || stage === "observe" || stage === "learn", label: "Block screens after 10:30pm", sponsor: "Pomerium", icon: Shield },
    { done: false, label: "Eat ≥134g protein today", sponsor: "–", icon: Target },
    { done: false, label: "Last drink before 7pm", sponsor: "–", icon: Moon },
  ];
  return (
    <div className="bg-[#181818] rounded-cards border border-[#485346]/40 p-6">
      <div className="flex items-center gap-2 mb-5">
        <Zap size={15} className="text-[#9cbf93]" />
        <span className="text-body-sm font-medium text-[#ddffdc]">Suggested Actions</span>
        <SponsorBadge name="Pomerium" />
        <span className="ml-auto text-caption text-[#677d64]">{allActions.filter(a => a.done).length}/{allActions.length} done</span>
      </div>
      <div className="space-y-2.5">
        {allActions.map(({ done, label, sponsor, icon: Icon }) => (
          <div key={label} className={`flex items-center gap-3 p-3 rounded-cards border transition-all duration-300 ${done ? "bg-[#212525]/60 border-[#485346]/20" : "bg-[#212525] border-[#485346]/30"}`}>
            <div className={`w-6 h-6 rounded-cards flex items-center justify-center flex-shrink-0 transition-all duration-300 ${done ? "bg-[#7fee64]/20 border border-[#7fee64]/30" : "bg-[#181818] border border-[#485346]/40"}`}>
              {done ? <CheckCircle size={12} className="text-[#7fee64]" /> : <Icon size={11} className="text-[#677d64]" />}
            </div>
            <span className={`text-body-sm flex-1 transition-colors duration-300 ${done ? "text-[#677d64] line-through" : "text-[#8cab87]"}`}>{label}</span>
            {sponsor !== "–" && <SponsorBadge name={sponsor} />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── EXPERIMENT HISTORY ──────────────────────────── */
function ExperimentHistoryCard() {
  return (
    <div className="bg-[#181818] rounded-cards border border-[#485346]/40 p-6">
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp size={15} className="text-[#9cbf93]" />
        <span className="text-body-sm font-medium text-[#ddffdc]">Experiment History</span>
        <SponsorBadge name="AWS" />
      </div>
      <div className="space-y-2.5">
        {EXPERIMENTS.map(({ id, strategy, days, result, metric, delta }) => (
          <div key={id} className="flex items-start gap-3 p-3 bg-[#212525] rounded-cards border border-[#485346]/20">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${result === "success" ? "bg-[#7fee64]" : result === "running" ? "bg-[#9cbf93] animate-pulse" : "bg-[#677d64]"}`} />
            <div className="flex-1 min-w-0">
              <p className="text-body-sm text-[#ddffdc] font-medium leading-snug">{strategy}</p>
              <p className="text-caption text-[#677d64] mt-0.5">{days} days · {metric}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-body-sm font-medium font-mono ${result === "success" ? "text-[#7fee64]" : result === "running" ? "text-[#9cbf93]" : "text-[#677d64]"}`}>{delta}</p>
              <p className="text-caption text-[#677d64] capitalize">{result}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── AGENT LOOP PANEL ────────────────────────────── */
function AgentLoopPanel({ stage, logs }: { stage: LoopStage; logs: LogEntry[] }) {
  const stageIndex = STAGES.findIndex(s => s.id === stage);
  return (
    <div className="bg-[#000000] rounded-cards border border-[#485346] flex flex-col h-full min-h-[500px]">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-[#485346]/40">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
        </div>
        <span className="text-caption text-[#677d64] font-mono ml-2">agent_loop.live</span>
        <div className="ml-auto flex items-center gap-1.5">
          <StatusDot active={true} />
          <span className="text-caption text-[#7fee64] font-mono">RUNNING</span>
        </div>
      </div>

      {/* Stage progress */}
      <div className="px-5 py-4 border-b border-[#485346]/20">
        <div className="flex items-center gap-1">
          {STAGES.map(({ id, label, icon: Icon, color }, i) => (
            <div key={id} className="flex items-center gap-1 flex-1">
              <div className={`flex flex-col items-center gap-1 flex-1 transition-all duration-500 ${i === stageIndex ? "opacity-100" : i < stageIndex ? "opacity-60" : "opacity-25"}`}>
                <div className={`w-7 h-7 rounded-cards border flex items-center justify-center transition-all duration-300 ${i === stageIndex ? "border-[#7fee64]/60 bg-[#181818] loop-active" : i < stageIndex ? "border-[#485346]/60 bg-[#181818]" : "border-[#485346]/20 bg-transparent"}`}>
                  <Icon size={12} style={{ color: i <= stageIndex ? "#7fee64" : "#677d64" }} />
                </div>
                <span className="text-caption text-[#677d64] text-center leading-tight hidden sm:block" style={{ fontSize: "9px" }}>{label}</span>
              </div>
              {i < STAGES.length - 1 && (
                <div className={`h-px flex-shrink-0 w-3 transition-all duration-500 ${i < stageIndex ? "bg-[#7fee64]/40" : "bg-[#485346]/20"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Log stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-1.5 scrollbar-hide font-mono text-body-sm">
        {logs.length === 0 && (
          <p className="text-[#677d64] text-caption">Waiting for agent cycle to begin…<span className="animate-blink">█</span></p>
        )}
        {logs.map((log, i) => (
          <div key={i} className="flex items-start gap-2 animate-loop-appear">
            <span className="text-[#677d64] text-caption flex-shrink-0 mt-0.5 tabular-nums">{log.time}</span>
            <span className={`text-caption rounded-pills px-1.5 py-0.5 flex-shrink-0 font-mono ${
              log.stage === "act" ? "bg-[#7fee64]/15 text-[#7fee64]" :
              log.stage === "collect" ? "bg-[#9cbf93]/10 text-[#9cbf93]" :
              "bg-[#485346]/20 text-[#8cab87]"
            }`}>{log.stage}</span>
            <span className="text-[#8cab87] text-caption leading-relaxed">{log.message}</span>
          </div>
        ))}
        {logs.length > 0 && (
          <p className="text-[#7fee64] text-caption animate-blink">█</p>
        )}
      </div>

      {/* Current stage detail */}
      <div className="px-5 py-4 border-t border-[#485346]/20 bg-[#181818]/50">
        {(() => {
          const s = STAGES[stageIndex];
          return (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <s.icon size={13} style={{ color: "#7fee64" }} />
                <span className="text-body-sm font-medium text-[#ddffdc]">{s.label}</span>
                <SponsorBadge name={s.sponsor} />
              </div>
              <ChevronRight size={14} className="text-[#677d64]" />
            </div>
          );
        })()}
      </div>
    </div>
  );
}

/* ── PAGE ────────────────────────────────────────── */
export default function Dashboard() {
  const [running, setRunning] = useState(true);
  const [stageIndex, setStageIndex] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [msgIndex, setMsgIndex] = useState(0);
  const [iteration, setIteration] = useState(1);

  const stage = STAGES[stageIndex].id;

  const reset = useCallback(() => {
    setStageIndex(0); setLogs([]); setMsgIndex(0); setIteration(1); setRunning(false);
    setTimeout(() => setRunning(true), 100);
  }, []);

  useEffect(() => {
    if (!running) return;
    const messages = LOOP_MESSAGES[stage];
    if (msgIndex >= messages.length) {
      const timer = setTimeout(() => {
        const next = (stageIndex + 1) % STAGES.length;
        setStageIndex(next);
        setMsgIndex(0);
        if (next === 0) setIteration(i => i + 1);
      }, 600);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      setLogs(prev => [...prev.slice(-60), {
        time: now(),
        stage,
        message: messages[msgIndex],
        sponsor: STAGES[stageIndex].sponsor,
      }]);
      setMsgIndex(i => i + 1);
    }, 700);
    return () => clearTimeout(timer);
  }, [running, stage, stageIndex, msgIndex]);

  return (
    <div className="min-h-screen bg-[#000000]">
      <DashNav running={running} onToggle={() => setRunning(r => !r)} onReset={reset} />

      {/* Top bar */}
      <div className="border-b border-[#485346]/20 bg-[#181818]/30">
        <div className="max-w-page mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <StatusDot active={running} />
              <span className="text-body-sm text-[#8cab87]">Loop iteration <span className="text-[#ddffdc] font-medium font-mono">#{iteration}</span></span>
            </div>
            <div className="h-3 w-px bg-[#485346]/40 hidden sm:block" />
            <span className="text-body-sm text-[#677d64] hidden sm:block">Stage: <span className="text-[#9cbf93] font-medium capitalize">{stage}</span></span>
          </div>
          <div className="flex items-center gap-3">
            {["Nexla", "Zero.xyz", "AWS", "Pomerium", "Akash"].map(s => (
              <span key={s} className="text-caption text-[#677d64] font-mono hidden lg:block">{s}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-page mx-auto px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* Left — agent loop live */}
          <div className="xl:col-span-1">
            <AgentLoopPanel stage={stage} logs={logs} />
          </div>

          {/* Right — dashboard panels */}
          <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
            <GoalCard />
            <HealthScoreCard stage={stage} />
            <BottleneckCard stage={stage} />
            <ExperimentCard />
            <SuggestedActionsCard stage={stage} />
            <ExperimentHistoryCard />
          </div>
        </div>
      </div>
    </div>
  );
}
