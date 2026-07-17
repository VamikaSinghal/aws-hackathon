"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Activity, Brain, Zap, Moon, Database, Cloud, Lock,
  ArrowRight, ChevronDown, RefreshCw, Target, Eye, Layers, Server
} from "lucide-react";

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav className={`nav-floating ${scrolled ? "opacity-100" : "opacity-80"}`}>
      <a href="#" className="text-sm font-medium opacity-85 hover:opacity-100 transition-opacity">Home</a>
      <a href="#problem" className="text-sm font-medium opacity-85 hover:opacity-100 transition-opacity">Problem</a>
      <a href="#solution" className="text-sm font-medium opacity-85 hover:opacity-100 transition-opacity">Solution</a>
      <a href="#loop" className="text-sm font-medium opacity-85 hover:opacity-100 transition-opacity">Loop</a>
      <Link href="/dashboard" className="btn-primary">Launch</Link>
    </nav>
  );
}

function Hero() {
  return (
    <section style={{
      background: "var(--gradient-hero)",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "80px 24px",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Animated background glow orbs */}
      <div style={{
        position: "absolute",
        top: "10%",
        left: "10%",
        width: "300px",
        height: "300px",
        background: "radial-gradient(circle, rgba(107, 98, 242, 0.3) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(60px)",
        animation: "float 8s ease-in-out infinite"
      }} />
      <div style={{
        position: "absolute",
        bottom: "15%",
        right: "10%",
        width: "400px",
        height: "400px",
        background: "radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(80px)",
        animation: "float 10s ease-in-out infinite reverse"
      }} />

      <div style={{ textAlign: "center", maxWidth: "900px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "32px", background: "rgba(255, 255, 255, 0.1)", padding: "8px 16px", borderRadius: "9999px", backdropFilter: "blur(10px)", border: "1px solid rgba(255, 255, 255, 0.2)" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-snow-white)", animation: "pulse 2s infinite" }} />
          <span style={{ color: "var(--color-snow-white)", fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.6px" }}>
            Autonomous Health Agent
          </span>
        </div>

        <h1 style={{
          color: "var(--color-snow-white)",
          marginBottom: "24px",
          fontSize: "clamp(48px, 8vw, 80px)",
          lineHeight: 1,
          letterSpacing: "-2.52px",
          fontWeight: 700,
          textShadow: "0 20px 40px rgba(0,0,0,0.3)"
        }}>
          Your health.<br /><span style={{ background: "linear-gradient(90deg, #fff, #e0e7ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>On autopilot.</span>
        </h1>

        <p style={{ color: "var(--color-bone)", maxWidth: "640px", margin: "0 auto 48px", fontSize: "18px", lineHeight: 1.6, opacity: 0.95 }}>
          LifeOS doesn't recommend. It acts. Every morning you wake up to a schedule already optimized for what your body actually did last night.
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "80px", flexWrap: "wrap" }}>
          <Link href="/dashboard" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "16px", padding: "14px 32px", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)" }}>
            Launch LifeOS <ArrowRight size={18} />
          </Link>
          <a href="#problem" className="btn-ghost" style={{ fontSize: "16px", padding: "12px 28px" }}>See how it works</a>
        </div>

        <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          {/* Animated rings */}
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" style={{ position: "absolute" }}>
            <defs>
              <style>{`
                @keyframes rotate-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse-ring { 0%, 100% { r: 60; opacity: 0.2; } 50% { r: 80; opacity: 0.05; } }
                .ring-1 { animation: pulse-ring 3s ease-in-out infinite; }
                .ring-2 { animation: pulse-ring 3s ease-in-out infinite 0.5s; }
                .ring-3 { animation: pulse-ring 3s ease-in-out infinite 1s; }
              `}</style>
            </defs>
            <circle cx="100" cy="100" r="60" fill="none" stroke="var(--color-dusk-violet)" strokeWidth="2" className="ring-1" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="var(--color-snow-white)" strokeWidth="1.5" className="ring-2" strokeOpacity="0.4" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="var(--color-dusk-violet)" strokeWidth="1" className="ring-3" strokeOpacity="0.3" />
            <circle cx="100" cy="100" r="8" fill="var(--color-dusk-violet)" />
          </svg>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)", animation: "bounce 2s infinite", color: "var(--color-snow-white)" }}>
        <ChevronDown size={24} strokeWidth={1.5} />
      </div>
    </section>
  );
}

function Problem() {
  const apps = [
    { name: "Whoop", action: "Shows HRV dashboard" },
    { name: "MyFitnessPal", action: "Logs your calories" },
    { name: "Calm", action: "Sends a reminder" },
    { name: "Apple Health", action: "Shows a chart" },
    { name: "Oura", action: "Gives a score" },
  ];

  return (
    <section id="problem" style={{ padding: "80px 24px", background: "var(--color-void-canvas)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <span style={{ color: "var(--color-dusk-violet)", fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: "12px" }}>
            The Problem
          </span>
          <h2 style={{ fontSize: "48px", marginBottom: "16px" }}>Every health app tells you.<br />None of them act.</h2>
          <p style={{ color: "var(--color-ash)", maxWidth: "640px", margin: "0 auto" }}>
            You're carrying 5 apps, 3 wearables, and a wellness routine that collapses the moment life happens. The problem isn't the data. It's that nothing does anything with it.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))", gap: "32px", maxWidth: "1200px", margin: "0 auto" }}>
          <div>
            <p style={{ color: "var(--color-slate)", fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "24px" }}>
              What every app does
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {apps.map((app) => (
                <div key={app.name} className="card" style={{ padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ color: "var(--color-bone)", fontSize: "14px", fontWeight: 500 }}>{app.name}</span>
                    <span style={{ color: "var(--color-slate)", fontSize: "14px", marginLeft: "8px" }}>→ {app.action}</span>
                  </div>
                  <Eye size={14} style={{ color: "var(--color-slate)" }} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <p style={{ color: "var(--color-slate)", fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "24px" }}>
              What a human expert would do
            </p>
            <div className="panel-frosted" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", lineHeight: 1.6, padding: "24px" }}>
              <p style={{ color: "var(--color-slate)", margin: 0, marginBottom: "8px" }}>// last night</p>
              <p style={{ color: "var(--color-dusk-violet)", margin: 0 }}>sleep = <span style={{ color: "var(--color-bone)" }}>"4h 52m"</span></p>
              <p style={{ color: "var(--color-dusk-violet)", margin: 0 }}>hrv = <span style={{ color: "var(--color-bone)" }}>28</span>  <span style={{ color: "var(--color-slate)" }}>// avg: 54</span></p>
              <p style={{ color: "var(--color-dusk-violet)", margin: 0, marginBottom: "12px" }}>recovery = <span style={{ color: "var(--color-bone)" }}>"23%"</span>  <span style={{ color: "var(--color-slate)" }}>// red zone</span></p>
              <p style={{ color: "var(--color-slate)", margin: 0, marginBottom: "8px" }}>// what a coach would say</p>
              <p style={{ color: "var(--color-bone)", margin: 0 }}>expert: <span style={{ color: "var(--color-dusk-violet)" }}>"Cancel the workout.</span></p>
              <p style={{ color: "var(--color-dusk-violet)", margin: 0 }}>Move the alarm. Add protein. Block screens by 10:30pm."</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Solution() {
  const actions = [
    { icon: Moon, label: "Sleep: 4h 52m → Recovery 23%", action: "Workout cancelled" },
    { icon: Brain, label: "HRV: 28ms (avg: 54ms)", action: "High cortisol protocol activated" },
    { icon: Activity, label: "Alarm moved to 7:30am", action: "Calendar updated" },
    { icon: Zap, label: "Screen blocked after 10:30pm", action: "Device policy applied" },
  ];

  return (
    <section id="solution" style={{ padding: "80px 24px", background: "var(--color-graphite)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <span style={{ color: "var(--color-dusk-violet)", fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: "12px" }}>
            The Solution
          </span>
          <h2 style={{ fontSize: "48px", marginBottom: "16px" }}>It doesn't recommend.<br /><span style={{ color: "var(--color-dusk-violet)" }}>It acts.</span></h2>
          <p style={{ color: "var(--color-ash)", maxWidth: "640px", margin: "0 auto" }}>
            LifeOS runs a continuous agent loop while you sleep. By morning, your day is already rebuilt around what your body needs.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))", gap: "32px", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {actions.map(({ icon: Icon, label, action }, i) => (
              <div key={i} className="card" style={{ padding: "16px" }}>
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={16} style={{ color: "var(--color-dusk-violet)" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "var(--color-ash)", fontSize: "13px", margin: 0, marginBottom: "4px" }}>{label}</p>
                    <p style={{ color: "var(--color-bone)", fontSize: "14px", fontWeight: 500, margin: 0 }}>{action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="card-dark" style={{ padding: "24px" }}>
              <p style={{ color: "var(--color-slate)", fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.6px", margin: "0 0 16px 0" }}>
                This morning's summary
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  { label: "Recovery score", values: "23% → 71%" },
                  { label: "Sleep debt cleared", values: "+2.1h banked" },
                  { label: "Actions taken", values: "7 of 7" },
                ].map((item, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ color: "var(--color-ash)", fontSize: "13px" }}>{item.label}</span>
                      <span style={{ color: "var(--color-bone)", fontSize: "13px", fontWeight: 500 }}>{item.values}</span>
                    </div>
                    <div style={{ height: "4px", background: "var(--color-graphite)", borderRadius: "999px", overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "var(--color-dusk-violet)", width: `${i === 0 ? 71 : i === 1 ? 58 : 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/demo" className="btn-ghost" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", textDecoration: "none", color: "inherit" }}>
              Explore live demo <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Loop() {
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    { icon: Database, label: "Collect", desc: "Nexla ingests sleep, HRV, steps, calendar — unified into one health context." },
    { icon: Brain, label: "Diagnose", desc: "AWS Bedrock + Zero.xyz run parallel agents: Planner, Critic, Experts." },
    { icon: Layers, label: "Plan", desc: "The Planner proposes. The Critic evaluates. They debate until consensus." },
    { icon: Zap, label: "Act", desc: "Pomerium authorizes every action. Calendar updated. Device policy applied." },
    { icon: Eye, label: "Observe", desc: "Next morning, Nexla streams outcomes back. Did metrics improve?" },
    { icon: RefreshCw, label: "Learn", desc: "Strategy changelog updated. What worked gets locked in." },
  ];

  useEffect(() => {
    const i = setInterval(() => setActiveStep(s => (s + 1) % steps.length), 2200);
    return () => clearInterval(i);
  }, []);

  return (
    <section id="loop" style={{ padding: "80px 24px", background: "var(--color-void-canvas)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <span style={{ color: "var(--color-dusk-violet)", fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: "12px" }}>
            The Loop
          </span>
          <h2 style={{ fontSize: "48px", marginBottom: "16px" }}>Six steps.<br />Runs every night.</h2>
          <p style={{ color: "var(--color-ash)", maxWidth: "640px", margin: "0 auto" }}>
            The agent loop never stops. While you sleep, it's already rewriting tomorrow.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))", gap: "32px", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {steps.map(({ icon: Icon, label, desc }, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className="card"
                style={{
                  padding: "16px",
                  textAlign: "left",
                  background: activeStep === i ? "rgba(212,212,212,0.08)" : "rgba(212,212,212,0.05)",
                  cursor: "pointer",
                  border: "none",
                  fontFamily: "inherit",
                  transition: "all 200ms ease",
                }}
              >
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={14} style={{ color: activeStep === i ? "var(--color-dusk-violet)" : "var(--color-slate)" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "var(--color-bone)", fontSize: "13px", fontWeight: 500, margin: 0, marginBottom: "2px" }}>
                      {String(i + 1).padStart(2, "0")} · {label}
                    </p>
                    <p style={{ color: "var(--color-slate)", fontSize: "12px", margin: 0 }}>{desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
            <svg viewBox="0 0 240 240" width="240" height="240" style={{ opacity: 0.6 }}>
              <circle cx="120" cy="120" r="100" fill="none" stroke="var(--color-hairline)" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="120" cy="120" r="100" fill="none" stroke="var(--color-dusk-violet)" strokeWidth="1.5"
                strokeDasharray={`${(activeStep + 1) / steps.length * 628} 628`}
                strokeLinecap="round" transform="rotate(-90 120 120)" style={{ transition: "stroke-dasharray 0.5s ease" }} />
              {steps.map((_, i) => {
                const angle = (i / steps.length) * 2 * Math.PI - Math.PI / 2;
                const x = 120 + 100 * Math.cos(angle);
                const y = 120 + 100 * Math.sin(angle);
                return (
                  <circle key={i} cx={x} cy={y} r={i === activeStep ? 4 : 3}
                    fill={i <= activeStep ? "var(--color-dusk-violet)" : "var(--color-hairline)"}
                    style={{ transition: "all 0.3s ease" }} />
                );
              })}
              <circle cx="120" cy="120" r="40" fill="var(--color-void-canvas)" stroke="var(--color-hairline)" strokeWidth="1" />
              <text x="120" y="116" textAnchor="middle" fill="var(--color-dusk-violet)" fontSize="10" fontFamily="var(--font-dm-sans)" fontWeight="500">LOOP</text>
              <text x="120" y="130" textAnchor="middle" fill="var(--color-slate)" fontSize="9" fontFamily="var(--font-dm-sans)">step {activeStep + 1}/{steps.length}</text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

function Sponsors() {
  const sponsors = [
    { name: "Nexla", role: "Data hub", icon: Database },
    { name: "Zero.xyz", role: "Agent planning", icon: Brain },
    { name: "AWS", role: "Orchestration", icon: Cloud },
    { name: "Pomerium", role: "Security", icon: Lock },
    { name: "Akash", role: "Decentralized compute", icon: Server },
  ];

  return (
    <section style={{ padding: "80px 24px", background: "var(--color-graphite)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <span style={{ color: "var(--color-dusk-violet)", fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: "12px" }}>
            Sponsors
          </span>
          <h2 style={{ fontSize: "48px", marginBottom: "16px" }}>Five structural layers.<br />Not bolted on.</h2>
          <p style={{ color: "var(--color-ash)", maxWidth: "640px", margin: "0 auto" }}>
            Each sponsor solves a real architectural problem that would otherwise require months to build.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px", maxWidth: "1200px", margin: "0 auto" }}>
          {sponsors.map(({ name, role, icon: Icon }) => (
            <div key={name} className="card" style={{ padding: "24px", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                <Icon size={28} style={{ color: "var(--color-dusk-violet)" }} />
              </div>
              <p style={{ color: "var(--color-bone)", fontSize: "14px", fontWeight: 500, margin: "0 0 4px 0" }}>{name}</p>
              <p style={{ color: "var(--color-slate)", fontSize: "12px", margin: 0 }}>{role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section style={{ padding: "80px 24px", background: "var(--color-void-canvas)" }}>
      <div className="container">
        <div style={{ textAlign: "center" }}>
          <h2 style={{ marginBottom: "12px" }}>Wake up to a better day.<br /><span style={{ color: "var(--color-dusk-violet)" }}>Every day.</span></h2>
          <p style={{ color: "var(--color-ash)", maxWidth: "640px", margin: "0 auto 32px" }}>
            See your agent operating in real time. Watch it reason, act, and learn.
          </p>
          <Link href="/dashboard" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            Open LifeOS <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ padding: "40px 24px", background: "var(--color-graphite)", borderTop: "1px solid var(--color-hairline)", textAlign: "center" }}>
      <div className="container">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
          <Activity size={14} style={{ color: "var(--color-dusk-violet)" }} />
          <span style={{ color: "var(--color-bone)", fontSize: "14px", fontWeight: 500 }}>LifeOS</span>
        </div>
        <p style={{ color: "var(--color-slate)", fontSize: "12px", margin: "0 0 4px 0" }}>Built with Nexla · AWS · Zero.xyz · Pomerium · Akash</p>
        <p style={{ color: "var(--color-slate)", fontSize: "12px", margin: 0 }}>Loop Engineering Hackathon 2025</p>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <main>
      <Nav />
      <Hero />
      <Problem />
      <Solution />
      <Loop />
      <Sponsors />
      <CTA />
      <Footer />
    </main>
  );
}
