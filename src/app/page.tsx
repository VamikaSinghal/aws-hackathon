"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Activity, Brain, Zap, Moon, Shield, Database, Cloud, Lock,
  ArrowRight, ChevronDown, RefreshCw, Target, TrendingUp, AlertCircle,
  CheckCircle, Server, Cpu, GitBranch, Layers, Eye, BarChart2
} from "lucide-react";

/* ── NAV ─────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#212525]/95 backdrop-blur-md border-b border-[#1f2a33]" : "bg-transparent"}`}>
      <div className="max-w-page mx-auto flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7fee64, #18b759)" }}>
            <Activity size={14} className="text-black" />
          </div>
          <span className="font-display text-[#ddffdc] text-lg font-medium tracking-tight">LifeOS</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Problem", "Solution", "Architecture", "Sponsors"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="text-body-sm font-medium text-[#8cab87] hover:text-[#ddffdc] transition-colors">{l}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-body-sm text-[#859984] font-medium hidden sm:block">Sign in</span>
          <Link href="/dashboard" className="bg-[#7fee64] text-black text-body-sm font-medium px-4 py-2 rounded-pills hover:bg-[#9fff80] transition-colors">
            Launch App
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ── HERO ─────────────────────────────────────── */
function Hero() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(i);
  }, []);
  const phrases = ["Cancelled your workout.", "Moved your alarm.", "Blocked your screen.", "Adjusted your dinner.", "Updated your plan."];
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16 overflow-hidden bg-void-black">
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(127,238,100,0.08) 0%, transparent 70%)" }} />
      </div>

      {/* Eyebrow */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1.5 h-1.5 rounded-full bg-[#7fee64] animate-pulse" />
        <span className="font-body text-caption font-medium uppercase tracking-[0.6px] text-[#9cbf93]">Autonomous Health Agent</span>
      </div>

      {/* Headline */}
      <h1 className="font-display text-center max-w-4xl mb-6" style={{ fontSize: "clamp(42px,7vw,72px)", lineHeight: 1, letterSpacing: "-0.448px", fontWeight: 500 }}>
        <span className="text-[#7fee64]">Your health. </span>
        <span className="text-[#ddffdc]">On autopilot.</span>
      </h1>

      <p className="text-subheading text-[#aed2a4] text-center max-w-xl mb-4 font-body">
        LifeOS doesn't recommend. It acts. Every morning you wake up to a schedule already optimised for what your body actually did last night.
      </p>

      {/* Animated action ticker */}
      <div className="flex items-center gap-2 mb-10 h-8">
        <span className="text-[#8cab87] text-body-sm">Last night it</span>
        <div className="bg-[#181818] border border-[#485346] rounded-pills px-3 py-1 overflow-hidden">
          <span key={tick} className="text-[#7fee64] text-body-sm font-medium animate-loop-appear inline-block">
            {phrases[tick % phrases.length]}
          </span>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex items-center gap-3 mb-16">
        <Link href="/dashboard" className="bg-[#7fee64] text-black font-medium px-6 py-3 rounded-pills text-body hover:bg-[#9fff80] transition-colors flex items-center gap-2">
          Launch LifeOS <ArrowRight size={16} />
        </Link>
        <a href="#problem" className="border border-[#ddffdc] text-[#ddffdc] font-medium px-6 py-3 rounded-buttons text-body hover:bg-[#181818] transition-colors">
          See how it works
        </a>
      </div>

      {/* Hero visual — 3D Cube SVG */}
      <div className="relative animate-float">
        <div className="absolute inset-0 rounded-full blur-3xl animate-pulse-glow" style={{ background: "rgba(127,238,100,0.12)", transform: "scale(1.4)" }} />
        <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
          {/* Cube faces */}
          <polygon points="90,20 150,55 150,125 90,160 30,125 30,55" fill="#181818" stroke="#485346" strokeWidth="1" />
          <polygon points="90,20 150,55 90,90 30,55" fill="#212525" stroke="#7fee64" strokeWidth="0.8" strokeOpacity="0.6" />
          <polygon points="150,55 150,125 90,160 90,90" fill="#1a1a1a" stroke="#485346" strokeWidth="0.8" />
          <polygon points="30,55 90,90 90,160 30,125" fill="#141414" stroke="#485346" strokeWidth="0.8" />
          {/* Lime edges */}
          <line x1="90" y1="20" x2="150" y2="55" stroke="#7fee64" strokeWidth="1.5" strokeOpacity="0.8" />
          <line x1="90" y1="20" x2="30" y2="55" stroke="#7fee64" strokeWidth="1.5" strokeOpacity="0.8" />
          <line x1="90" y1="20" x2="90" y2="90" stroke="#7fee64" strokeWidth="1" strokeOpacity="0.4" />
          {/* Corner dots */}
          <circle cx="90" cy="20" r="3" fill="#7fee64" />
          <circle cx="150" cy="55" r="2" fill="#7fee64" fillOpacity="0.6" />
          <circle cx="30" cy="55" r="2" fill="#7fee64" fillOpacity="0.6" />
        </svg>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[#697368] animate-bounce">
        <ChevronDown size={18} />
      </div>
    </section>
  );
}

/* ── PROBLEM ──────────────────────────────────── */
function Problem() {
  const apps = [
    { name: "Whoop", action: "Shows HRV dashboard" },
    { name: "MyFitnessPal", action: "Logs your calories" },
    { name: "Calm", action: "Sends a reminder" },
    { name: "Apple Health", action: "Shows a chart" },
    { name: "Oura", action: "Gives a score" },
  ];
  return (
    <section id="problem" className="py-24 px-6 bg-[#000000]">
      <div className="max-w-page mx-auto">
        <div className="text-center mb-16">
          <span className="text-caption font-medium uppercase tracking-[0.6px] text-[#9cbf93] block mb-3">The Problem</span>
          <h2 className="font-display text-heading-lg text-[#ddffdc] mb-4">Every health app tells you.<br />None of them act.</h2>
          <p className="text-body text-[#8cab87] max-w-xl mx-auto">You're carrying 5 apps, 3 wearables, and a wellness routine that collapses the moment life happens. The problem isn't the data. It's that nothing does anything with it.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* App graveyard */}
          <div>
            <p className="text-body-sm text-[#677d64] uppercase tracking-[0.6px] font-medium mb-6">What every app does</p>
            <div className="space-y-3">
              {apps.map((app, i) => (
                <div key={app.name} className="flex items-center gap-3 p-4 bg-[#181818] rounded-cards border border-[#485346]/40"
                  style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="w-8 h-8 rounded-cards bg-[#212525] border border-[#485346]/40 flex items-center justify-center flex-shrink-0">
                    <Eye size={14} className="text-[#677d64]" />
                  </div>
                  <div>
                    <span className="text-body-sm text-[#ddffdc] font-medium">{app.name}</span>
                    <span className="text-body-sm text-[#677d64] ml-2">→ {app.action}</span>
                  </div>
                  <AlertCircle size={14} className="ml-auto text-[#677d64]" />
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-[#231c1c] border border-[#485346]/40 rounded-cards">
              <p className="text-body-sm text-[#8cab87]">
                <span className="text-[#ddffdc] font-medium">Result:</span> You wake up at 6am for a HIIT workout on 4 hours of sleep because no app connected those two facts and did anything about it.
              </p>
            </div>
          </div>

          {/* The 2am scenario */}
          <div>
            <p className="text-body-sm text-[#677d64] uppercase tracking-[0.6px] font-medium mb-6">What a human expert would do</p>
            <div className="bg-[#181818] rounded-cards border border-[#485346] overflow-hidden">
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#485346]/40">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                <span className="ml-2 text-caption text-[#677d64] font-mono">health_context.log</span>
              </div>
              <div className="p-6 font-mono text-body-sm space-y-2">
                <p><span className="text-[#677d64]">// last night</span></p>
                <p><span className="text-[#9cbf93]">sleep</span><span className="text-[#ddffdc]"> = </span><span className="text-[#7fee64]">"4h 52m"</span></p>
                <p><span className="text-[#9cbf93]">hrv</span><span className="text-[#ddffdc]"> = </span><span className="text-[#7fee64]">28</span><span className="text-[#677d64]">  // avg: 54</span></p>
                <p><span className="text-[#9cbf93]">recovery</span><span className="text-[#ddffdc]"> = </span><span className="text-[#7fee64]">"23%"</span><span className="text-[#677d64]">  // red zone</span></p>
                <p className="pt-2"><span className="text-[#677d64]">// calendar today</span></p>
                <p><span className="text-[#9cbf93]">workout</span><span className="text-[#ddffdc]"> = </span><span className="text-[#7fee64]">"7am HIIT"</span></p>
                <p className="pt-2"><span className="text-[#677d64]">// what a coach would say</span></p>
                <p><span className="text-[#ddffdc]">expert</span><span className="text-[#8cab87]">:</span><span className="text-[#7fee64]"> "Cancel the workout.</span></p>
                <p><span className="text-[#7fee64]">  Move the alarm. Add protein.</span></p>
                <p><span className="text-[#7fee64]">  Block screens by 10:30pm."</span><span className="animate-blink text-[#7fee64]">█</span></p>
              </div>
            </div>
            <p className="text-body-sm text-[#677d64] mt-4 text-center">Most people don't have a coach. LifeOS is that coach.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── SOLUTION ─────────────────────────────────── */
function Solution() {
  const actions = [
    { icon: Moon, label: "Sleep: 4h 52m → Recovery 23%", action: "Workout cancelled", color: "text-[#7fee64]" },
    { icon: Brain, label: "HRV: 28ms (avg: 54ms)", action: "High cortisol protocol activated", color: "text-[#9cbf93]" },
    { icon: Activity, label: "Alarm moved to 7:30am", action: "Calendar updated via Pomerium", color: "text-[#7fee64]" },
    { icon: Zap, label: "Screen blocked after 10:30pm", action: "Device policy applied", color: "text-[#aed2a4]" },
    { icon: Target, label: "+30g protein target set", action: "Nutrition plan updated", color: "text-[#9cbf93]" },
  ];
  return (
    <section id="solution" className="py-24 px-6 bg-[#181818]">
      <div className="max-w-page mx-auto">
        <div className="text-center mb-16">
          <span className="text-caption font-medium uppercase tracking-[0.6px] text-[#9cbf93] block mb-3">The Solution</span>
          <h2 className="font-display text-heading-lg text-[#ddffdc] mb-4">It doesn't recommend.<br /><span className="text-[#7fee64]">It acts.</span></h2>
          <p className="text-body text-[#8cab87] max-w-xl mx-auto">LifeOS runs a continuous agent loop while you sleep. By morning, your day is already rebuilt around what your body needs — not what you planned yesterday.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-3">
            {actions.map(({ icon: Icon, label, action, color }, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-[#212525] rounded-cards border border-[#485346]/40 hover:border-[#485346] transition-colors">
                <div className="w-9 h-9 rounded-cards bg-[#181818] border border-[#485346]/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={16} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm text-[#8cab87]">{label}</p>
                  <p className="text-body-sm font-medium text-[#ddffdc] mt-0.5">{action}</p>
                </div>
                <CheckCircle size={16} className="text-[#7fee64] flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-[#000000] rounded-cards border border-[#485346] p-8">
              <p className="text-caption text-[#677d64] uppercase tracking-[0.6px] font-medium mb-6">This morning's summary</p>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-body-sm text-[#8cab87]">Recovery score</span>
                    <span className="text-body-sm text-[#ddffdc] font-medium">23% → 71%</span>
                  </div>
                  <div className="h-1.5 bg-[#181818] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#7fee64]" style={{ width: "71%", transition: "width 1.5s ease" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-body-sm text-[#8cab87]">Sleep debt cleared</span>
                    <span className="text-body-sm text-[#ddffdc] font-medium">+2.1h banked</span>
                  </div>
                  <div className="h-1.5 bg-[#181818] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#9cbf93]" style={{ width: "58%", transition: "width 1.5s ease" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-body-sm text-[#8cab87]">Actions taken autonomously</span>
                    <span className="text-body-sm text-[#7fee64] font-medium">7 of 7</span>
                  </div>
                  <div className="h-1.5 bg-[#181818] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#7fee64]" style={{ width: "100%" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#000000] rounded-cards border border-[#7fee64]/30 p-6 glow-lime">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-[#7fee64] animate-pulse" />
                <span className="text-caption text-[#7fee64] uppercase tracking-[0.6px] font-medium">Agent running</span>
              </div>
              <p className="text-body-sm text-[#8cab87]">LifeOS has been operating for <span className="text-[#ddffdc]">23 days</span>. It's tried <span className="text-[#ddffdc]">14 strategies</span>, rejected 6 that didn't work, and your average sleep score has improved from <span className="text-[#ddffdc]">54 → 78</span>.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── WORKFLOW LOOP ────────────────────────────── */
function Workflow() {
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    { icon: Database, label: "Collect", desc: "Nexla ingests sleep, HRV, steps, calendar, Gmail — all sources unified into one health context object.", detail: "Oura → Nexla → clean JSON", color: "#9cbf93" },
    { icon: Brain, label: "Diagnose", desc: "AWS Bedrock + Zero.xyz run parallel sub-agents: Planner, Critic, Workout Expert, Nutrition Expert.", detail: "Recovery 23% → cortisol protocol", color: "#aed2a4" },
    { icon: GitBranch, label: "Plan", desc: "The Planner proposes actions. The Critic blocks unsafe ones. They debate until consensus.", detail: "HIIT blocked → light walk approved", color: "#9cbf93" },
    { icon: Zap, label: "Act", desc: "Pomerium authorizes every action. Calendar updated. Device policy applied. Alarm moved.", detail: "7 actions executed, 0 overrides", color: "#7fee64" },
    { icon: Eye, label: "Observe", desc: "Next morning, Nexla streams outcomes back. Did HRV recover? Did sleep improve?", detail: "HRV: 28 → 51ms (+82%)", color: "#9cbf93" },
    { icon: RefreshCw, label: "Learn", desc: "Strategy changelog updated. What worked gets locked in. What didn't gets discarded.", detail: "Screen blocking: high efficacy ✓", color: "#aed2a4" },
  ];

  useEffect(() => {
    const i = setInterval(() => setActiveStep(s => (s + 1) % steps.length), 2200);
    return () => clearInterval(i);
  }, []);

  return (
    <section id="workflow" className="py-24 px-6 bg-[#000000]">
      <div className="max-w-page mx-auto">
        <div className="text-center mb-16">
          <span className="text-caption font-medium uppercase tracking-[0.6px] text-[#9cbf93] block mb-3">The Loop</span>
          <h2 className="font-display text-heading-lg text-[#ddffdc] mb-4">Six steps.<br />Runs every night.</h2>
          <p className="text-body text-[#8cab87] max-w-lg mx-auto">The agent loop never stops. While you sleep, it's already rewriting tomorrow.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Loop steps */}
          <div className="space-y-3">
            {steps.map(({ icon: Icon, label, desc, detail, color }, i) => (
              <button key={i} onClick={() => setActiveStep(i)}
                className={`w-full text-left flex items-start gap-4 p-4 rounded-cards border transition-all duration-300 ${activeStep === i
                  ? "bg-[#181818] border-[#485346] loop-active"
                  : "bg-[#181818]/50 border-[#485346]/30 hover:border-[#485346]/60"}`}>
                <div className={`w-9 h-9 rounded-cards border flex items-center justify-center flex-shrink-0 transition-all duration-300 ${activeStep === i ? "bg-[#212525] border-[#7fee64]/40" : "bg-[#212525] border-[#485346]/40"}`}>
                  <Icon size={16} style={{ color: activeStep === i ? "#7fee64" : color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-body-sm font-medium text-[#ddffdc]">{String(i + 1).padStart(2, "0")} · {label}</span>
                    {activeStep === i && <div className="w-1.5 h-1.5 rounded-full bg-[#7fee64] animate-pulse" />}
                  </div>
                  <p className="text-body-sm text-[#677d64]">{desc}</p>
                  {activeStep === i && (
                    <p className="text-caption text-[#7fee64] font-mono mt-2 animate-loop-appear">{detail}</p>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Visual loop diagram */}
          <div className="flex justify-center">
            <div className="relative w-72 h-72">
              <svg viewBox="0 0 288 288" className="w-full h-full">
                {/* Outer ring */}
                <circle cx="144" cy="144" r="120" fill="none" stroke="#485346" strokeWidth="1" strokeDasharray="4 4" />
                {/* Progress arc */}
                <circle cx="144" cy="144" r="120" fill="none" stroke="#7fee64" strokeWidth="1.5"
                  strokeDasharray={`${(activeStep + 1) / steps.length * 753} 753`}
                  strokeLinecap="round" transform="rotate(-90 144 144)" style={{ transition: "stroke-dasharray 0.5s ease" }} />
                {/* Step dots */}
                {steps.map((_, i) => {
                  const angle = (i / steps.length) * 2 * Math.PI - Math.PI / 2;
                  const x = 144 + 120 * Math.cos(angle);
                  const y = 144 + 120 * Math.sin(angle);
                  return (
                    <circle key={i} cx={x} cy={y} r={i === activeStep ? 6 : 4}
                      fill={i <= activeStep ? "#7fee64" : "#485346"}
                      style={{ transition: "all 0.3s ease" }} />
                  );
                })}
                {/* Center */}
                <circle cx="144" cy="144" r="48" fill="#181818" stroke="#485346" strokeWidth="1" />
                <text x="144" y="138" textAnchor="middle" fill="#7fee64" fontSize="11" fontFamily="monospace" fontWeight="500">LOOP</text>
                <text x="144" y="154" textAnchor="middle" fill="#677d64" fontSize="10" fontFamily="monospace">step {activeStep + 1}/{steps.length}</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── ARCHITECTURE ─────────────────────────────── */
function Architecture() {
  const layers = [
    {
      label: "Data layer", color: "#9cbf93",
      items: ["Apple Health", "Oura Ring", "Google Calendar", "Gmail", "Cronometer API", "Weather API"],
      sponsor: "Nexla"
    },
    {
      label: "Agent layer", color: "#aed2a4",
      items: ["Planner agent", "Critic agent", "Workout expert", "Nutrition expert"],
      sponsor: "Zero.xyz"
    },
    {
      label: "Orchestration", color: "#7fee64",
      items: ["AWS Bedrock", "Lambda trigger", "DynamoDB strategy store", "Event routing"],
      sponsor: "AWS"
    },
    {
      label: "Security layer", color: "#9cbf93",
      items: ["Policy gate", "Calendar auth", "Gmail read scope", "Device policy"],
      sponsor: "Pomerium"
    },
    {
      label: "Compute layer", color: "#aed2a4",
      items: ["24/7 persistent loop", "Decentralized nodes", "Privacy-first storage", "No central server"],
      sponsor: "Akash"
    },
  ];
  return (
    <section id="architecture" className="py-24 px-6 bg-[#181818]">
      <div className="max-w-page mx-auto">
        <div className="text-center mb-16">
          <span className="text-caption font-medium uppercase tracking-[0.6px] text-[#9cbf93] block mb-3">Architecture</span>
          <h2 className="font-display text-heading-lg text-[#ddffdc] mb-4">Five layers.<br />One continuous loop.</h2>
          <p className="text-body text-[#8cab87] max-w-lg mx-auto">Every sponsor plays a structural role. Nothing is bolted on.</p>
        </div>
        <div className="space-y-3 max-w-3xl mx-auto">
          {layers.map(({ label, color, items, sponsor }, i) => (
            <div key={i} className="group flex items-start gap-4 p-6 bg-[#000000] rounded-cards border border-[#485346]/40 hover:border-[#485346] transition-all duration-300">
              <div className="flex-shrink-0 w-1 self-stretch rounded-full" style={{ background: color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-body-sm font-medium text-[#ddffdc]">{label}</span>
                  <span className="text-caption text-[#677d64] bg-[#181818] border border-[#485346]/40 rounded-pills px-2 py-0.5 font-mono">{sponsor}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map(item => (
                    <span key={item} className="text-caption text-[#8cab87] bg-[#181818] border border-[#485346]/30 rounded-pills px-3 py-1">{item}</span>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 w-8 h-8 rounded-cards border border-[#485346]/40 flex items-center justify-center text-[#677d64] group-hover:border-[#485346] group-hover:text-[#9cbf93] transition-all">
                <Layers size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── SPONSORS ─────────────────────────────────── */
function Sponsors() {
  const sponsors = [
    {
      name: "Nexla",
      color: "#7fee64",
      role: "Health data hub",
      icon: Database,
      what: "Nexla unifies every health data source — wearables, calendar, Gmail, nutrition APIs — into one structured context object the agent can reason over. Without Nexla, you're manually parsing Apple Health XML at 2am.",
      edge: "When Apple Health and Oura report conflicting sleep data, Nexla's conflict resolution picks the higher-fidelity source automatically.",
      usage: ["Apple Health connector", "Oura ring stream", "Google Calendar sync", "Gmail signal extraction", "Nutrition API normalization", "Outcome feedback loop"]
    },
    {
      name: "Zero.xyz",
      color: "#aed2a4",
      role: "Multi-agent planner",
      icon: Brain,
      what: "Zero unblocks AI agents from rate limits across model providers. We use it to run 4 specialized sub-agents in parallel — Planner, Critic, Workout Expert, Nutrition Expert — each hitting a different model endpoint without bottlenecks.",
      edge: "The Planner proposes a hard workout. The Critic blocks it citing HRV data. They iterate until consensus. That debate is the self-correction moment.",
      usage: ["Planner agent", "Critic agent", "Workout specialist", "Nutrition specialist", "Parallel model routing", "Rate limit bypass"]
    },
    {
      name: "AWS",
      color: "#9cbf93",
      role: "Orchestration backbone",
      icon: Cloud,
      what: "Bedrock hosts the underlying models. Lambda triggers the morning loop. DynamoDB stores the strategy history — every experiment the agent has tried and whether it worked.",
      edge: "DynamoDB TTL automatically expires failed strategies after 90 days, keeping the agent's memory lean and relevant rather than accumulating noise.",
      usage: ["Bedrock model inference", "Lambda cron trigger", "DynamoDB strategy store", "IAM role scoping"]
    },
    {
      name: "Pomerium",
      color: "#aed2a4",
      role: "Secure agent runtime",
      icon: Lock,
      what: "Every action the agent wants to take — cancel a calendar event, read a Gmail thread, push a device policy — goes through Pomerium's policy layer first. The agent cannot touch your personal data without authorization.",
      edge: "Policy rule: agent can CREATE calendar events but never DELETE. A bug cannot accidentally wipe your week. That one constraint is the difference between a tool and a liability.",
      usage: ["Calendar write gate", "Gmail read scope", "Device policy auth", "No-delete policy rule", "Audit log", "Zero-trust access"]
    },
    {
      name: "Akash",
      color: "#9cbf93",
      role: "Persistent decentralized compute",
      icon: Server,
      what: "LifeOS runs on Akash's decentralized compute network — 24/7, without interruption. Your biometric data never touches a company's central server. That's not just a feature; it's the architecture.",
      edge: "When one Akash node goes offline, the agent migrates to another in under 30 seconds with no data loss. The loop is never interrupted.",
      usage: ["24/7 agent runtime", "Decentralized nodes", "Privacy-first storage", "Automatic failover", "Lower cost vs EC2", "No single point of failure"]
    },
  ];

  return (
    <section id="sponsors" className="py-24 px-6 bg-[#000000]">
      <div className="max-w-page mx-auto">
        <div className="text-center mb-16">
          <span className="text-caption font-medium uppercase tracking-[0.6px] text-[#9cbf93] block mb-3">Sponsor Integrations</span>
          <h2 className="font-display text-heading-lg text-[#ddffdc] mb-4">Each sponsor owns<br />a structural layer.</h2>
          <p className="text-body text-[#8cab87] max-w-lg mx-auto">Not bolted on. Not checkboxes. Every sponsor solves a real architectural problem that would otherwise require months to build.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sponsors.map(({ name, color, role, icon: Icon, what, edge, usage }) => (
            <div key={name} className="bg-[#181818] rounded-cards border border-[#485346]/40 p-8 hover:border-[#485346] transition-all duration-300 flex flex-col gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-cards bg-[#212525] border border-[#485346]/40 flex items-center justify-center">
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-body-sm font-medium text-[#ddffdc]">{name}</p>
                    <p className="text-caption text-[#677d64]">{role}</p>
                  </div>
                </div>
                <p className="text-body-sm text-[#8cab87] leading-relaxed">{what}</p>
              </div>

              <div className="bg-[#212525] rounded-cards p-4 border border-[#485346]/30">
                <p className="text-caption text-[#677d64] uppercase tracking-[0.6px] font-medium mb-2">Edge case handled</p>
                <p className="text-body-sm text-[#9cbf93]">{edge}</p>
              </div>

              <div>
                <p className="text-caption text-[#677d64] uppercase tracking-[0.6px] font-medium mb-3">Used for</p>
                <div className="flex flex-wrap gap-2">
                  {usage.map(u => (
                    <span key={u} className="text-caption text-[#8cab87] bg-[#212525] border border-[#485346]/30 rounded-pills px-2 py-0.5">{u}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA ──────────────────────────────────────── */
function CTA() {
  return (
    <section className="py-24 px-6 bg-[#181818] border-t border-[#485346]/30">
      <div className="max-w-page mx-auto text-center">
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-[#7fee64] animate-pulse" />
          <span className="text-caption text-[#7fee64] font-medium uppercase tracking-[0.6px]">Agent online</span>
        </div>
        <h2 className="font-display text-heading-lg text-[#ddffdc] mb-4">Wake up to a better day.<br /><span className="text-[#7fee64]">Every day.</span></h2>
        <p className="text-body text-[#8cab87] max-w-md mx-auto mb-10">See your agent operating in real time. Watch it reason, act, and learn — loop by loop.</p>
        <Link href="/dashboard"
          className="inline-flex items-center gap-2 bg-[#7fee64] text-black font-medium px-8 py-4 rounded-pills text-body hover:bg-[#9fff80] transition-colors">
          Open LifeOS Dashboard <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}

/* ── FOOTER ───────────────────────────────────── */
function Footer() {
  return (
    <footer className="py-10 px-6 bg-[#000000] border-t border-[#485346]/20">
      <div className="max-w-page mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-sm flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7fee64, #18b759)" }}>
            <Activity size={10} className="text-black" />
          </div>
          <span className="font-display text-[#ddffdc] text-sm font-medium">LifeOS</span>
        </div>
        <p className="text-caption text-[#697368]">Built for the Loop Engineering Hackathon · tokens& SF 2025</p>
        <p className="text-caption text-[#697368]">Powered by Nexla · AWS · Zero.xyz · Pomerium · Akash</p>
      </div>
    </footer>
  );
}

/* ── PAGE ─────────────────────────────────────── */
export default function LandingPage() {
  return (
    <main>
      <Nav />
      <Hero />
      <Problem />
      <Solution />
      <Workflow />
      <Architecture />
      <Sponsors />
      <CTA />
      <Footer />
    </main>
  );
}
