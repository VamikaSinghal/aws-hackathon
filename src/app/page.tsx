"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Activity, Brain, Zap, Moon, Database, Cloud, Lock,
  ArrowRight, RefreshCw, Target, AlertCircle, CheckCircle,
  Server, GitBranch, Eye, BarChart2, Layers,
} from "lucide-react";

/* ─── DESIGN TOKENS (inline for readability) ─────────────────────
   From DESIGN-5.md / Steep system
   ink-black   #17191c  — primary text + filled buttons
   paper-white #ffffff  — canvas
   mist-gray   #f2f2f3  — card surface
   fog-white   #fafafb  — alternate section bg
   slate-gray  #777b86  — muted / secondary text
   ash-gray    #979799  — tertiary labels
   blush-peach #fbe1d1  — ONE accent per page
   sienna-brown#5d2a1a  — text on peach
   border      #ececec  — hairline
──────────────────────────────────────────────────────────────────*/

/* ── NAV ───────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-white/90 backdrop-blur-md border-b border-[#ececec]" : "bg-transparent"
    }`}>
      <div className="max-w-page mx-auto flex items-center justify-between px-6 h-16">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[6px] bg-[#17191c] flex items-center justify-center">
            <Activity size={13} className="text-white" />
          </div>
          <span className="font-signifier text-[#17191c] text-lg tracking-tight">LifeOS</span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {["Problem","Solution","Architecture","Sponsors"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`}
              className="font-sohne text-[15px] text-[#17191c] hover:text-[#777b86]">
              {l}
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <span className="font-sohne text-[15px] text-[#777b86] hidden sm:block">Sign in</span>
          <Link href="/dashboard?tab=sources"
            className="font-sohne text-[15px] bg-[#17191c] text-white px-5 py-2 rounded-buttons hover:bg-[#2d2f33]">
            Launch App
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ── HERO ──────────────────────────────────────── */
function Hero() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick(t => t + 1), 2200);
    return () => clearInterval(i);
  }, []);
  const phrases = ["cancelled your workout.", "moved your alarm.", "blocked your screen.", "adjusted your dinner.", "updated your plan."];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-24 bg-white overflow-hidden">

      {/* Very subtle warm radial tint */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(251,225,209,0.18) 0%, transparent 70%)" }} />

      {/* Eyebrow */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-1.5 h-1.5 rounded-full bg-[#17191c]" />
        <span className="font-sohne text-[13px] uppercase tracking-[0.8px] text-[#17191c] font-semibold">LifeOS</span>
        <div className="w-1 h-1 rounded-full bg-[#979799]" />
        <span className="font-sohne text-[13px] uppercase tracking-[0.8px] text-[#979799]">Autonomous Health Agent</span>
      </div>

      {/* Display headline — Signifier, italic accent */}
      <h1 className="font-signifier text-center max-w-4xl mb-6"
        style={{ fontSize:"clamp(44px,7vw,90px)", lineHeight:1.1, letterSpacing:"-2px", fontWeight:400 }}>
        Your health,{" "}
        <em className="display-italic not-italic" style={{ fontStyle:"italic" }}>on autopilot.</em>
      </h1>

      <p className="font-sohne text-[18px] text-[#777b86] text-center max-w-[540px] mb-5 leading-relaxed">
        Autonomously optimize your health by continuously learning from your body. LifeOS acts, learns, and evolves — because better health shouldn't wait.
      </p>

      {/* Animated ticker */}
      <div className="flex items-center gap-2 mb-10 h-9">
        <span className="font-sohne text-[15px] text-[#979799]">Last night it</span>
        <div className="bg-[#f2f2f3] rounded-buttons px-4 py-1.5 overflow-hidden min-w-[220px] text-center">
          <span key={tick} className="font-sohne text-[15px] text-[#17191c] animate-ticker-in inline-block">
            {phrases[tick % phrases.length]}
          </span>
        </div>
      </div>

      {/* CTAs — pill filled + ghost pair */}
      <div className="flex items-center gap-3 mb-20">
        <Link href="/dashboard"
          className="font-sohne text-[16px] bg-[#17191c] text-white px-6 py-3 rounded-buttons hover:bg-[#2d2f33] flex items-center gap-2">
          Launch LifeOS <ArrowRight size={15} />
        </Link>
        <a href="#problem"
          className="font-sohne text-[16px] border border-[#17191c] text-[#17191c] bg-transparent px-6 py-3 rounded-buttons hover:bg-[#f2f2f3]">
          See how it works
        </a>
      </div>

      {/* Three floating product artifact cards */}
      <div className="relative w-full max-w-3xl h-48 hidden lg:block">

        {/* Left — sleep stat card */}
        <div className="absolute -left-4 top-0 w-52 bg-white rounded-el_cards shadow-artifact p-4">
          <p className="font-sohne text-[12px] text-[#979799] mb-2 uppercase tracking-[0.5px]">Last night</p>
          <div className="flex items-end gap-2 mb-3">
            <span className="font-signifier text-[32px] leading-none text-[#17191c]">4h 52m</span>
            <span className="font-sohne text-[13px] text-[#5d2a1a] mb-1">↓ 31%</span>
          </div>
          <div className="h-1 bg-[#f2f2f3] rounded-full overflow-hidden">
            <div className="h-full bg-[#17191c] rounded-full" style={{ width:"32%" }} />
          </div>
          <p className="font-sohne text-[12px] text-[#979799] mt-1.5">Recovery score: 23%</p>
        </div>

        {/* Center — action card */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-4 w-64 bg-white rounded-el_cards shadow-artifact p-4">
          <p className="font-sohne text-[12px] text-[#979799] mb-3 uppercase tracking-[0.5px]">Agent actions — today</p>
          {[
            { label:"7am HIIT cancelled", done: true },
            { label:"Alarm → 7:30am",     done: true },
            { label:"Screens off 10:30pm",done: true },
          ].map(a => (
            <div key={a.label} className="flex items-center gap-2 mb-1.5">
              <div className="w-4 h-4 rounded-full border border-[#ececec] flex items-center justify-center flex-shrink-0">
                {a.done && <div className="w-2 h-2 rounded-full bg-[#17191c]" />}
              </div>
              <span className="font-sohne text-[13px] text-[#17191c]">{a.label}</span>
            </div>
          ))}
        </div>

        {/* Right — HRV trend card */}
        <div className="absolute -right-4 top-2 w-48 bg-white rounded-el_cards shadow-artifact p-4">
          <p className="font-sohne text-[12px] text-[#979799] mb-2 uppercase tracking-[0.5px]">HRV trend</p>
          <p className="font-signifier text-[28px] leading-none text-[#17191c] mb-1">51<span className="text-[14px] font-sohne text-[#979799] ml-1">ms</span></p>
          <p className="font-sohne text-[12px] text-[#5d2a1a]">↑ 82% after agent</p>
          {/* Mini gestural line */}
          <svg viewBox="0 0 100 30" className="w-full mt-3" fill="none">
            <polyline points="0,25 20,22 40,18 50,26 65,10 80,8 100,4"
              stroke="#5d2a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </section>
  );
}

/* ── PROBLEM ───────────────────────────────────── */
function Problem() {
  const apps = [
    { name:"Whoop",        action:"Shows HRV dashboard" },
    { name:"MyFitnessPal", action:"Logs your calories"  },
    { name:"Calm",         action:"Sends a reminder"    },
    { name:"Apple Health", action:"Shows a chart"       },
    { name:"Oura",         action:"Gives a score"       },
  ];
  return (
    <section id="problem" className="py-24 px-6 bg-[#fafafb]">
      <div className="max-w-page mx-auto">
        <div className="text-center mb-16">
          <span className="font-sohne text-[13px] uppercase tracking-[0.8px] text-[#979799] block mb-4">The Problem</span>
          <h2 className="font-signifier mb-4" style={{ fontSize:"clamp(36px,5vw,64px)", lineHeight:1.2, letterSpacing:"-0.96px" }}>
            Every health app tells you.<br />
            <em style={{ fontStyle:"italic" }}>None of them act.</em>
          </h2>
          <p className="font-sohne text-[17px] text-[#777b86] max-w-xl mx-auto leading-relaxed">
            You're carrying 5 apps, 3 wearables, and a wellness routine that collapses the moment life happens. The problem isn't the data. It's that nothing does anything with it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* App graveyard */}
          <div>
            <p className="font-sohne text-[13px] text-[#979799] uppercase tracking-[0.6px] mb-5">What every app does</p>
            <div className="space-y-2">
              {apps.map((app) => (
                <div key={app.name} className="flex items-center gap-3 p-4 bg-white rounded-sm_cards border border-[#ececec]">
                  <Eye size={14} className="text-[#a3a6af] flex-shrink-0" />
                  <span className="font-sohne text-[15px] text-[#17191c]">{app.name}</span>
                  <span className="font-sohne text-[15px] text-[#979799] ml-1">→ {app.action}</span>
                  <AlertCircle size={13} className="ml-auto text-[#a3a6af]" />
                </div>
              ))}
            </div>
            <div className="mt-5 p-4 bg-[#fbe1d1] rounded-cards">
              <p className="font-sohne text-[15px] text-[#5d2a1a] leading-relaxed">
                <strong className="font-[500]">Result:</strong> You wake up at 6am for HIIT on 4 hours of sleep because no app connected those two facts and did anything about it.
              </p>
            </div>
          </div>

          {/* Terminal code card */}
          <div>
            <p className="font-sohne text-[13px] text-[#979799] uppercase tracking-[0.6px] mb-5">What a coach would do</p>
            <div className="bg-white rounded-cards border border-[#ececec] shadow-subtle overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#ececec]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#f2f2f3]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#f2f2f3]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#f2f2f3]" />
                <span className="font-mono text-[12px] text-[#979799] ml-2">health_context.log</span>
              </div>
              <div className="p-6 font-mono text-[13px] space-y-1.5 leading-relaxed">
                <p className="text-[#a3a6af]">// last night</p>
                <p><span className="text-[#777b86]">sleep</span><span className="text-[#17191c]"> = </span><span className="text-[#5d2a1a]">"4h 52m"</span></p>
                <p><span className="text-[#777b86]">hrv</span><span className="text-[#17191c]"> = </span><span className="text-[#5d2a1a]">28</span><span className="text-[#a3a6af]">  // avg: 54</span></p>
                <p><span className="text-[#777b86]">recovery</span><span className="text-[#17191c]"> = </span><span className="text-[#5d2a1a]">"23%"</span><span className="text-[#a3a6af]">  // red zone</span></p>
                <p className="pt-2 text-[#a3a6af]">// coach response</p>
                <p><span className="text-[#17191c]">agent</span><span className="text-[#777b86]">:</span><span className="text-[#5d2a1a]"> "Cancel HIIT. Move alarm.</span></p>
                <p><span className="text-[#5d2a1a]">  Add protein. Block screens."</span><span className="text-[#17191c] animate-blink">█</span></p>
              </div>
            </div>
            <p className="font-sohne text-[14px] text-[#979799] mt-3 text-center">Most people don't have a coach. LifeOS is that coach.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── SOLUTION ──────────────────────────────────── */
function Solution() {
  const actions = [
    { icon: Moon,          label:"Sleep: 4h 52m → Recovery 23%",    action:"Workout cancelled, recovery protocol activated" },
    { icon: Brain,         label:"HRV: 28ms (avg: 54ms)",           action:"High cortisol diagnosis, rest prescribed"       },
    { icon: Activity,      label:"Alarm moved to 7:30am",           action:"Calendar updated via Pomerium"                  },
    { icon: Zap,           label:"Screen blocked after 10:30pm",    action:"Device policy applied"                         },
    { icon: Target,        label:"+30g protein target set",          action:"Nutrition plan adjusted"                       },
  ];
  return (
    <section id="solution" className="py-24 px-6 bg-white">
      <div className="max-w-page mx-auto">
        <div className="text-center mb-16">
          <span className="font-sohne text-[13px] uppercase tracking-[0.8px] text-[#979799] block mb-4">The Solution</span>
          <h2 className="font-signifier mb-4" style={{ fontSize:"clamp(36px,5vw,64px)", lineHeight:1.2, letterSpacing:"-0.96px" }}>
            It doesn't recommend.<br />
            <em style={{ fontStyle:"italic" }}>It acts.</em>
          </h2>
          <p className="font-sohne text-[17px] text-[#777b86] max-w-xl mx-auto leading-relaxed">
            LifeOS runs a continuous loop while you sleep. By morning, your day is already rebuilt around what your body actually needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-2">
            {actions.map(({ icon: Icon, label, action }, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-[#fafafb] rounded-sm_cards border border-[#ececec] hover:bg-[#f2f2f3] transition-colors">
                <div className="w-8 h-8 rounded-[8px] bg-white border border-[#ececec] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={14} className="text-[#17191c]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sohne text-[14px] text-[#777b86]">{label}</p>
                  <p className="font-sohne text-[15px] font-[500] text-[#17191c] mt-0.5">{action}</p>
                </div>
                <CheckCircle size={15} className="text-[#17191c] flex-shrink-0 mt-1 opacity-70" />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {/* Progress card */}
            <div className="bg-white rounded-cards border border-[#ececec] shadow-subtle p-6">
              <p className="font-sohne text-[13px] text-[#979799] uppercase tracking-[0.6px] mb-5">This morning's outcome</p>
              {[
                { label:"Recovery score",          from:"23%", to:"71%", pct:71 },
                { label:"Sleep debt cleared",      from:"–",   to:"+2.1h", pct:58 },
                { label:"Actions taken autonomously", from:"0", to:"7 / 7", pct:100 },
              ].map(({ label, to, pct }) => (
                <div key={label} className="mb-4 last:mb-0">
                  <div className="flex justify-between mb-1.5">
                    <span className="font-sohne text-[14px] text-[#777b86]">{label}</span>
                    <span className="font-sohne text-[14px] font-[500] text-[#17191c]">{to}</span>
                  </div>
                  <div className="h-1 bg-[#f2f2f3] rounded-full overflow-hidden">
                    <div className="h-full bg-[#17191c] rounded-full transition-all duration-1000" style={{ width:`${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Peach editorial callout — ONE per page */}
            <div className="bg-[#fbe1d1] rounded-cards p-6">
              <p className="font-sohne text-[13px] text-[#5d2a1a] uppercase tracking-[0.6px] mb-3">23 days in</p>
              <p className="font-signifier text-[22px] text-[#5d2a1a] leading-snug mb-2" style={{ letterSpacing:"-0.3px" }}>
                14 strategies tried. 6 discarded. Sleep score{" "}
                <em style={{ fontStyle:"italic" }}>54 → 78.</em>
              </p>
              <p className="font-sohne text-[14px] text-[#5d2a1a] leading-relaxed opacity-80">
                The agent changed its own playbook every time something stopped working. No human intervention.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── WORKFLOW LOOP ─────────────────────────────── */
function Workflow() {
  const [active, setActive] = useState(0);
  const steps = [
    { icon: Database,  label:"Collect",  desc:"Nexla pulls sleep, HRV, steps, calendar, Gmail into one structured context object.",   detail:"Oura → Nexla → clean JSON",             sponsor:"Nexla"    },
    { icon: Brain,     label:"Diagnose", desc:"Zero.xyz runs 4 parallel sub-agents: Planner, Critic, Workout Expert, Nutrition Expert.",detail:"Recovery 23% → cortisol protocol",       sponsor:"Zero.xyz" },
    { icon: GitBranch, label:"Plan",     desc:"Planner proposes actions. Critic blocks unsafe ones. Consensus in 4 iterations.",       detail:"HIIT blocked → walk approved",          sponsor:"Zero.xyz" },
    { icon: Zap,       label:"Act",      desc:"Pomerium authorises each action. Calendar updated. Device policy applied. Alarm moved.", detail:"7 actions executed, 0 overrides",        sponsor:"Pomerium" },
    { icon: Eye,       label:"Observe",  desc:"Next morning Nexla streams outcomes. Did HRV recover? Did sleep improve?",              detail:"HRV: 28 → 51ms (+82%)",                 sponsor:"Nexla"    },
    { icon: RefreshCw, label:"Learn",    desc:"Strategy log updated in DynamoDB. What worked is locked in. What didn't is discarded.", detail:"Screen blocking: high efficacy ✓",       sponsor:"AWS"      },
  ];
  useEffect(() => {
    const i = setInterval(() => setActive(a => (a+1) % steps.length), 2400);
    return () => clearInterval(i);
  }, []);

  return (
    <section id="workflow" className="py-24 px-6 bg-[#fafafb]">
      <div className="max-w-page mx-auto">
        <div className="text-center mb-16">
          <span className="font-sohne text-[13px] uppercase tracking-[0.8px] text-[#979799] block mb-4">The Loop</span>
          <h2 className="font-signifier mb-4" style={{ fontSize:"clamp(36px,5vw,64px)", lineHeight:1.2, letterSpacing:"-0.96px" }}>
            Six steps.<br /><em style={{ fontStyle:"italic" }}>Runs every night.</em>
          </h2>
          <p className="font-sohne text-[17px] text-[#777b86] max-w-lg mx-auto">The agent loop never stops. While you sleep, it's already rewriting tomorrow.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Steps list */}
          <div className="space-y-2">
            {steps.map(({ icon: Icon, label, desc, detail, sponsor }, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`w-full text-left flex items-start gap-4 p-4 rounded-sm_cards border transition-all duration-200 ${
                  active === i ? "bg-white border-[#17191c]/20 shadow-subtle" : "bg-transparent border-transparent hover:bg-white hover:border-[#ececec]"
                }`}>
                <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 transition-all border ${
                  active === i ? "bg-[#17191c] border-[#17191c]" : "bg-white border-[#ececec]"
                }`}>
                  <Icon size={14} className={active === i ? "text-white" : "text-[#17191c]"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-sohne text-[14px] font-[500] text-[#17191c]">{String(i+1).padStart(2,"0")} · {label}</span>
                    <span className="font-sohne text-[12px] text-[#979799]">{sponsor}</span>
                    {active === i && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#17191c] animate-pulse" />}
                  </div>
                  <p className="font-sohne text-[14px] text-[#777b86] leading-relaxed">{desc}</p>
                  {active === i && (
                    <p className="font-mono text-[12px] text-[#5d2a1a] mt-1.5 animate-loop-appear">{detail}</p>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* SVG loop ring */}
          <div className="flex justify-center">
            <div className="relative w-64 h-64">
              <svg viewBox="0 0 256 256" className="w-full h-full">
                <circle cx="128" cy="128" r="108" fill="none" stroke="#ececec" strokeWidth="1" />
                <circle cx="128" cy="128" r="108" fill="none" stroke="#17191c" strokeWidth="1.5"
                  strokeDasharray={`${(active+1)/steps.length*679} 679`}
                  strokeLinecap="round" transform="rotate(-90 128 128)"
                  style={{ transition:"stroke-dasharray 0.5s ease" }} />
                {steps.map((_,i) => {
                  const a = (i/steps.length)*2*Math.PI - Math.PI/2;
                  return (
                    <circle key={i} cx={128+108*Math.cos(a)} cy={128+108*Math.sin(a)} r={i===active?5:3}
                      fill={i<=active?"#17191c":"#ececec"}
                      style={{ transition:"all 0.3s ease" }} />
                  );
                })}
                <circle cx="128" cy="128" r="44" fill="white" stroke="#ececec" strokeWidth="1" />
                <text x="128" y="124" textAnchor="middle" fill="#17191c" fontSize="11" fontFamily="ui-serif,serif" fontWeight="400">LOOP</text>
                <text x="128" y="138" textAnchor="middle" fill="#979799" fontSize="10" fontFamily="ui-sans-serif" >{active+1}/{steps.length}</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── ARCHITECTURE ──────────────────────────────── */
function Architecture() {
  const layers = [
    { label:"Data layer",      sponsor:"Nexla",    items:["Apple Health","Oura Ring","Google Calendar","Gmail","Cronometer API","Weather"] },
    { label:"Agent layer",     sponsor:"Zero.xyz", items:["Planner agent","Critic agent","Workout expert","Nutrition expert"] },
    { label:"Orchestration",   sponsor:"AWS",      items:["Bedrock model","Lambda trigger","DynamoDB store","IAM scoping"] },
    { label:"Security layer",  sponsor:"Pomerium", items:["Policy gate","Calendar auth","Gmail scope","No-delete rule"] },
    { label:"Compute layer",   sponsor:"Akash",    items:["24/7 persistent loop","Decentralized nodes","Privacy-first","Auto failover"] },
  ];
  return (
    <section id="architecture" className="py-24 px-6 bg-white">
      <div className="max-w-page mx-auto">
        <div className="text-center mb-16">
          <span className="font-sohne text-[13px] uppercase tracking-[0.8px] text-[#979799] block mb-4">Architecture</span>
          <h2 className="font-signifier mb-4" style={{ fontSize:"clamp(36px,5vw,64px)", lineHeight:1.2, letterSpacing:"-0.96px" }}>
            Five layers.<br /><em style={{ fontStyle:"italic" }}>One continuous loop.</em>
          </h2>
          <p className="font-sohne text-[17px] text-[#777b86] max-w-lg mx-auto">Every sponsor plays a structural role. Nothing is bolted on.</p>
        </div>
        <div className="space-y-2 max-w-2xl mx-auto">
          {layers.map(({ label, sponsor, items }, i) => (
            <div key={i} className="group flex items-start gap-4 p-5 bg-[#fafafb] rounded-sm_cards border border-transparent hover:border-[#ececec] hover:bg-white transition-all duration-200">
              <div className="flex-shrink-0 w-1 self-stretch rounded-full bg-[#17191c] opacity-10 group-hover:opacity-100 transition-opacity" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-sohne text-[15px] font-[500] text-[#17191c]">{label}</span>
                  <span className="font-mono text-[12px] text-[#979799] bg-white border border-[#ececec] rounded-buttons px-3 py-0.5">{sponsor}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {items.map(item => (
                    <span key={item} className="font-sohne text-[13px] text-[#777b86] bg-white border border-[#ececec] rounded-buttons px-3 py-0.5">{item}</span>
                  ))}
                </div>
              </div>
              <Layers size={14} className="flex-shrink-0 text-[#a3a6af] mt-1" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── SPONSORS ──────────────────────────────────── */
function Sponsors() {
  const sponsors = [
    { name:"Nexla",    role:"Health data hub",               icon:Database, what:"Nexla unifies every health data source — wearables, calendar, Gmail, nutrition APIs — into one structured context object the agent can reason over. Without Nexla, you're manually parsing Apple Health XML at 2am.", edge:"When Apple Health and Oura report conflicting sleep data, Nexla's conflict resolution picks the higher-fidelity source automatically.", usage:["Apple Health","Oura stream","Calendar sync","Gmail signals","Nutrition API","Outcome loop"] },
    { name:"Zero.xyz", role:"Multi-agent planner",           icon:Brain,    what:"Zero unblocks AI agents from rate limits across providers. We run 4 specialised sub-agents in parallel — Planner, Critic, Workout Expert, Nutrition Expert — each on a different model endpoint.", edge:"The Planner proposes a hard workout. The Critic blocks it citing HRV. They debate until consensus. That's the self-correction moment.", usage:["Planner agent","Critic agent","Workout expert","Nutrition expert","Rate bypass"] },
    { name:"AWS",      role:"Orchestration backbone",        icon:Cloud,    what:"Bedrock hosts the models. Lambda triggers the morning loop. DynamoDB stores the strategy history — every experiment the agent has tried and whether it worked.", edge:"DynamoDB TTL expires failed strategies after 90 days, keeping the agent's memory lean and relevant.", usage:["Bedrock inference","Lambda trigger","DynamoDB store","IAM scoping"] },
    { name:"Pomerium", role:"Secure agent runtime",          icon:Lock,     what:"Every action the agent wants to take — cancel a calendar event, read Gmail, push a device policy — goes through Pomerium's policy layer first.", edge:"Policy rule: agent can CREATE calendar events but never DELETE. A bug cannot accidentally wipe your week.", usage:["Calendar gate","Gmail scope","Device auth","No-delete rule","Audit log","Zero-trust"] },
    { name:"Akash",    role:"Persistent decentralised compute", icon:Server, what:"LifeOS runs on Akash's decentralised compute network 24/7. Your biometric data never touches a company's central server. That's not a feature — it's the architecture.", edge:"When one Akash node goes offline, the agent migrates in under 30 seconds. The loop is never interrupted.", usage:["24/7 runtime","Decentralised","Privacy-first","Auto failover","Lower cost"] },
  ];
  return (
    <section id="sponsors" className="py-24 px-6 bg-[#fafafb]">
      <div className="max-w-page mx-auto">
        <div className="text-center mb-16">
          <span className="font-sohne text-[13px] uppercase tracking-[0.8px] text-[#979799] block mb-4">Sponsor Integrations</span>
          <h2 className="font-signifier mb-4" style={{ fontSize:"clamp(36px,5vw,64px)", lineHeight:1.2, letterSpacing:"-0.96px" }}>
            Each sponsor owns<br />
            <em style={{ fontStyle:"italic" }}>a structural layer.</em>
          </h2>
          <p className="font-sohne text-[17px] text-[#777b86] max-w-lg mx-auto">Not bolted on. Not checkboxes. Every sponsor solves a real architectural problem.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sponsors.map(({ name, role, icon: Icon, what, edge, usage }) => (
            <div key={name} className="bg-white rounded-cards border border-[#ececec] p-6 flex flex-col gap-5 hover:shadow-subtle transition-all duration-200">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-[10px] bg-[#f2f2f3] flex items-center justify-center">
                    <Icon size={16} className="text-[#17191c]" />
                  </div>
                  <div>
                    <p className="font-sohne text-[15px] font-[500] text-[#17191c]">{name}</p>
                    <p className="font-sohne text-[13px] text-[#979799]">{role}</p>
                  </div>
                </div>
                <p className="font-sohne text-[14px] text-[#777b86] leading-relaxed">{what}</p>
              </div>
              <div className="bg-[#fafafb] rounded-sm_cards p-4 border border-[#ececec]">
                <p className="font-sohne text-[12px] text-[#979799] uppercase tracking-[0.5px] mb-1.5">Edge case handled</p>
                <p className="font-sohne text-[14px] text-[#17191c] leading-relaxed">{edge}</p>
              </div>
              <div>
                <p className="font-sohne text-[12px] text-[#979799] uppercase tracking-[0.5px] mb-2">Used for</p>
                <div className="flex flex-wrap gap-1.5">
                  {usage.map(u => (
                    <span key={u} className="font-sohne text-[12px] text-[#777b86] bg-[#f2f2f3] rounded-buttons px-2.5 py-0.5">{u}</span>
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

/* ── CTA ───────────────────────────────────────── */
function CTA() {
  return (
    <section className="py-24 px-6 bg-white border-t border-[#ececec]">
      <div className="max-w-page mx-auto text-center">
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-[#17191c]" />
          <span className="font-sohne text-[13px] uppercase tracking-[0.8px] text-[#979799]">Agent online</span>
        </div>
        <h2 className="font-signifier mb-4" style={{ fontSize:"clamp(36px,5vw,64px)", lineHeight:1.2, letterSpacing:"-0.96px" }}>
          Wake up to a better day.<br />
          <em style={{ fontStyle:"italic" }}>Every day.</em>
        </h2>
        <p className="font-sohne text-[17px] text-[#777b86] max-w-md mx-auto mb-10 leading-relaxed">See your agent operating in real time. Watch it reason, act, and learn — loop by loop.</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/dashboard"
            className="font-sohne text-[16px] bg-[#17191c] text-white px-8 py-3.5 rounded-buttons hover:bg-[#2d2f33] flex items-center gap-2">
            Open LifeOS Dashboard <ArrowRight size={16} />
          </Link>
          <a href="#problem"
            className="font-sohne text-[16px] border border-[#17191c] text-[#17191c] px-8 py-3.5 rounded-buttons hover:bg-[#f2f2f3]">
            Learn more →
          </a>
        </div>
      </div>
    </section>
  );
}

/* ── FOOTER ────────────────────────────────────── */
function Footer() {
  return (
    <footer className="py-10 px-6 bg-[#fafafb] border-t border-[#ececec]">
      <div className="max-w-page mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-[5px] bg-[#17191c] flex items-center justify-center">
            <Activity size={10} className="text-white" />
          </div>
          <span className="font-signifier text-[#17191c] text-[16px]">LifeOS</span>
        </div>
        <p className="font-sohne text-[14px] text-[#979799]">Built for the Loop Engineering Hackathon · tokens& SF 2025</p>
        <p className="font-sohne text-[14px] text-[#979799]">Nexla · AWS · Zero.xyz · Pomerium · Akash</p>
      </div>
    </footer>
  );
}

/* ── PAGE ──────────────────────────────────────── */
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
