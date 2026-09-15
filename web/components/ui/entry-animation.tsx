"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════
   SathyaMithra — ULTRA Cinematic Entry Animation v2
   Inspired by CASYUM 2K26 · Full particle + HUD + glitch
═══════════════════════════════════════════════════════════ */

// ─── Types ─────────────────────────────────────────────────
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number; opacity: number;
  color: string; pulse: number; pulseSpeed: number;
}

// ─── Constants ─────────────────────────────────────────────
const COLORS = [
  "99,102,241",   // indigo-500
  "20,184,166",   // teal-500
  "245,158,11",   // saffron-500
  "165,180,252",  // indigo-300
  "94,234,212",   // teal-300
  "252,211,77",   // saffron-300
  "167,139,250",  // violet-400
];

const TAGLINE = "Honest Guide to Every Benefit You Deserve";
const STATS = [
  { label: "Schemes", end: 1200, suffix: "+" },
  { label: "Citizens Helped", end: 48000, suffix: "+" },
  { label: "States Covered", end: 28, suffix: "" },
];

// ─── useTypewriter ──────────────────────────────────────────
function useTypewriter(text: string, active: boolean, speed = 38) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!active) { setDisplayed(""); return; }
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, active, speed]);
  return displayed;
}

// ─── useCounter ─────────────────────────────────────────────
function useCounter(end: number, active: boolean, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) { setVal(0); return; }
    const start = Date.now();
    const id = setInterval(() => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(eased * end));
      if (p >= 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [end, active, duration]);
  return val;
}

// ─── Particle Canvas ────────────────────────────────────────
function ParticleCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const raf = useRef(0);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouse = (e: MouseEvent) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMouse);

    // seed lightweight particles
    particles.current = Array.from({ length: 40 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2.8 + 0.4,
      opacity: Math.random() * 0.7 + 0.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const ps = particles.current;

      // draw connection lines
      for (let i = 0; i < ps.length; i++) {
        const a = ps[i];
        // mouse repulsion
        const dx = a.x - mouse.current.x;
        const dy = a.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          a.vx += (dx / dist) * 0.08;
          a.vy += (dy / dist) * 0.08;
        }
        // dampen
        a.vx *= 0.98; a.vy *= 0.98;
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0) a.x = canvas.width;
        if (a.x > canvas.width) a.x = 0;
        if (a.y < 0) a.y = canvas.height;
        if (a.y > canvas.height) a.y = 0;
        a.pulse += a.pulseSpeed;
        const alphaPulse = a.opacity * (0.7 + 0.3 * Math.sin(a.pulse));

        for (let j = i + 1; j < ps.length; j++) {
          const b = ps[j];
          const lx = a.x - b.x, ly = a.y - b.y;
          const d = Math.sqrt(lx * lx + ly * ly);
          if (d < 140) {
            const lineAlpha = (1 - d / 140) * 0.18;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${a.color},${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }

        // draw particle
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${a.color},${alphaPulse})`;
        ctx.fill();

        // glow halo on larger ones
        if (a.size > 1.8) {
          ctx.beginPath();
          ctx.arc(a.x, a.y, a.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${a.color},${alphaPulse * 0.15})`;
          ctx.fill();
        }
      }
      raf.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

// ─── Scan Lines ─────────────────────────────────────────────
function ScanLines() {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ opacity: 0.04 }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.8) 2px, rgba(255,255,255,0.8) 3px)",
          backgroundSize: "100% 4px",
        }}
      />
    </div>
  );
}

// ─── HUD Grid ───────────────────────────────────────────────
function HUDGrid() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.06 }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

// ─── Sweep Line ─────────────────────────────────────────────
function SweepLine({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    el.style.transform = "translateY(-100%)";
    const id = setTimeout(() => {
      el.style.transition = "transform 1.8s cubic-bezier(0.4,0,0.2,1)";
      el.style.transform = "translateY(110vh)";
    }, 50);
    return () => clearTimeout(id);
  }, [active]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        ref={ref}
        className="absolute left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(20,184,166,0.8) 30%, rgba(245,158,11,0.9) 50%, rgba(20,184,166,0.8) 70%, transparent 100%)",
          boxShadow: "0 0 20px rgba(20,184,166,0.6), 0 0 40px rgba(245,158,11,0.3)",
          top: 0,
        }}
      />
    </div>
  );
}

// ─── Ripple Rings ───────────────────────────────────────────
function RippleRings({ active }: { active: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: `${200 + i * 100}px`,
            height: `${200 + i * 100}px`,
            borderColor: i % 2 === 0
              ? `rgba(99,102,241,${0.15 - i * 0.025})`
              : `rgba(20,184,166,${0.12 - i * 0.02})`,
            animation: active
              ? `sm-ripple 3s ease-out ${i * 0.4}s infinite`
              : "none",
          }}
        />
      ))}
    </div>
  );
}

// ─── Glitch Text ────────────────────────────────────────────
function GlitchText({ text, active }: { text: string; active: boolean }) {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    if (!active) return;
    // random glitch bursts
    const fire = () => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 120);
    };
    const intervals = [
      setTimeout(fire, 200),
      setTimeout(fire, 600),
      setTimeout(fire, 900),
      setTimeout(fire, 1500),
    ];
    return () => intervals.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="relative select-none" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* base text */}
      <h1
        className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #a5b4fc 35%, #5eead4 65%, #fcd34d 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          letterSpacing: "-0.03em",
          filter: glitching ? "blur(0.5px)" : "none",
        }}
      >
        {text}
      </h1>
      {/* glitch clone — red shift */}
      {glitching && (
        <h1
          className="absolute inset-0 text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.9) 0%, rgba(99,102,241,0.9) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.03em",
            transform: `translate(${Math.random() > 0.5 ? 3 : -3}px, ${Math.random() > 0.5 ? 1 : -1}px)`,
            mixBlendMode: "screen",
            opacity: 0.7,
          }}
          aria-hidden
        >
          {text}
        </h1>
      )}
    </div>
  );
}

// ─── Stat Counter ───────────────────────────────────────────
function StatCounter({ label, end, suffix, active }: { label: string; end: number; suffix: string; active: boolean }) {
  const val = useCounter(end, active);
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="text-2xl sm:text-3xl font-extrabold tabular-nums"
        style={{
          background: "linear-gradient(135deg, #fcd34d, #f59e0b)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {val.toLocaleString("en-IN")}{suffix}
      </span>
      <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: "rgba(165,180,252,0.7)" }}>
        {label}
      </span>
    </div>
  );
}

// ─── Progress Bar ───────────────────────────────────────────
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-64 h-px rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, #6366f1, #14b8a6, #f59e0b)",
          boxShadow: "0 0 8px rgba(20,184,166,0.6)",
          transition: "width 0.1s linear",
        }}
      />
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────
type Phase = "idle" | "sweep" | "logo" | "brand" | "tagline" | "stats" | "exit" | "done";

export function EntryAnimation({ onComplete }: { onComplete?: () => void }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);

  const handleSkip = useCallback(() => {
    setPhase("done");
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        handleSkip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSkip]);

  useEffect(() => {
    // Graceful, slightly slower cinematic timeline (~2.9s total)
    const T = (fn: () => void, ms: number) => setTimeout(fn, ms);
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(T(() => setPhase("sweep"),    60));
    timers.push(T(() => setPhase("logo"),     400));
    timers.push(T(() => setPhase("brand"),    950));
    timers.push(T(() => setPhase("tagline"), 1550));
    timers.push(T(() => setPhase("stats"),   2200));
    timers.push(T(() => setPhase("exit"),    2900));
    timers.push(T(() => { setPhase("done"); onComplete?.(); }, 3350));

    // progress ticker
    let p = 0;
    const pId = setInterval(() => {
      p = Math.min(p + 100 / 28, 98);
      setProgress(p);
    }, 100);
    timers.push(T(() => { setProgress(100); clearInterval(pId); }, 2850));

    return () => { timers.forEach(clearTimeout); clearInterval(pId); };
  }, [onComplete]);

  const typewriter = useTypewriter(TAGLINE, phase === "tagline" || phase === "stats" || phase === "exit", 25);

  if (phase === "done") return null;

  const isExiting = phase === "exit";

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 30% 30%, #1e1b4b 0%, #0f0d2e 40%, #042f2e 100%)",
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? "scale(1.04)" : "scale(1)",
        transition: isExiting ? "opacity 0.4s ease-out, transform 0.4s ease-out" : "none",
        pointerEvents: isExiting ? "none" : "all",
      }}
    >
      {/* 1-Click Skip Intro Button */}
      <button
        onClick={handleSkip}
        className="absolute top-5 right-5 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white/90 hover:text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all shadow-lg active:scale-95 cursor-pointer"
      >
        <span>Skip Intro</span>
        <span className="text-[10px] opacity-70 bg-black/30 px-1.5 py-0.5 rounded font-mono">Esc</span>
      </button>

      {/* Layers */}
      <ParticleCanvas active={phase !== "idle"} />
      <HUDGrid />
      <ScanLines />
      <SweepLine active={phase === "sweep" || phase === "logo"} />
      <RippleRings active={phase === "logo" || phase === "brand" || phase === "tagline" || phase === "stats"} />

      {/* Big background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)", filter: "blur(30px)" }} />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 65%)", filter: "blur(40px)" }} />
        <div className="absolute -top-40 -left-40 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 65%)", filter: "blur(40px)" }} />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4 text-center">

        {/* Logo emblem */}
        <div
          style={{
            opacity: phase === "idle" || phase === "sweep" ? 0 : 1,
            transform: phase === "idle" || phase === "sweep"
              ? "scale(0.3) rotate(-30deg)" : "scale(1) rotate(0deg)",
            transition: "opacity 0.6s cubic-bezier(0.34,1.56,0.64,1), transform 0.6s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <div className="relative flex items-center justify-center">
            {/* Outer pulsing ring */}
            <div className="absolute w-56 h-56 sm:w-60 sm:h-60 rounded-full animate-ping"
              style={{ background: "rgba(22,163,74,0.12)", animationDuration: "2.4s" }} />

            {/* Rotating dashes rings */}
            <div className="absolute w-52 h-52 sm:w-56 sm:h-56 rounded-full border-2 border-dashed"
              style={{ borderColor: "rgba(20,184,166,0.4)", animation: "sm-ring-spin 9s linear infinite" }} />
            <div className="absolute w-44 h-44 sm:w-48 sm:h-48 rounded-full border"
              style={{ borderColor: "rgba(245,158,11,0.35)", animation: "sm-ring-spin 6s linear infinite reverse" }} />

            {/* Core emblem — official Sathyamithra logo */}
            <div
              className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full flex items-center justify-center overflow-hidden bg-white shadow-2xl p-1"
              style={{
                boxShadow: "0 0 60px rgba(22,163,74,0.65), 0 0 120px rgba(245,158,11,0.35), inset 0 0 15px rgba(22,163,74,0.2)",
                border: "3px solid rgba(245,158,11,0.75)",
              }}
            >
              {/* Shimmer top edge */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1.5 rounded-full z-10"
                style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.95), transparent)" }} />

              {/* Logo image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-square.png"
                alt="Sathyamithra"
                className="w-full h-full object-cover rounded-full"
                style={{ filter: "drop-shadow(0 0 8px rgba(0,0,0,0.15))" }}
              />
            </div>

            {/* Orbiting dot — teal */}
            <div className="absolute w-3.5 h-3.5 rounded-full"
              style={{
                background: "#14b8a6", boxShadow: "0 0 12px rgba(20,184,166,1), 0 0 24px rgba(20,184,166,0.5)",
                animation: "sm-orbit-outer 4s linear infinite",
              }} />
            {/* Orbiting dot — saffron (inner, faster) */}
            <div className="absolute w-2 h-2 rounded-full"
              style={{
                background: "#f59e0b", boxShadow: "0 0 8px rgba(245,158,11,1)",
                animation: "sm-orbit-inner 2.5s linear infinite reverse",
              }} />
          </div>
        </div>

        {/* Brand name with glitch */}
        <div
          style={{
            opacity: phase === "idle" || phase === "sweep" || phase === "logo" ? 0 : 1,
            transform: phase === "idle" || phase === "sweep" || phase === "logo"
              ? "translateY(24px) scale(0.95)" : "translateY(0) scale(1)",
            transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.34,1.3,0.64,1)",
          }}
        >
          <GlitchText text="Sathyamithra" active={phase === "brand" || phase === "tagline" || phase === "stats"} />

          {/* Underline gradient bar */}
          <div className="mt-3 h-0.5 w-full rounded-full overflow-hidden">
            <div className="h-full w-full"
              style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.6) 20%, rgba(20,184,166,0.8) 50%, rgba(245,158,11,0.6) 80%, transparent 100%)",
                animation: "sm-shimmer 2s ease-in-out infinite",
              }} />
          </div>
        </div>

        {/* Typewriter tagline */}
        <div
          style={{
            opacity: phase === "tagline" || phase === "stats" || phase === "exit" ? 1 : 0,
            transform: phase === "tagline" || phase === "stats" || phase === "exit"
              ? "translateY(0)" : "translateY(14px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
            minHeight: "32px",
          }}
        >
          <p className="text-base sm:text-lg font-medium tracking-[0.18em] uppercase"
            style={{ color: "rgba(165,180,252,0.9)" }}>
            {typewriter}
            <span className="inline-block w-0.5 h-4 ml-0.5 align-middle animate-pulse"
              style={{ background: "rgba(20,184,166,0.9)" }} />
          </p>
        </div>

        {/* Stats row */}
        <div
          style={{
            opacity: phase === "stats" || phase === "exit" ? 1 : 0,
            transform: phase === "stats" || phase === "exit" ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease 0.1s, transform 0.6s cubic-bezier(0.34,1.3,0.64,1) 0.1s",
          }}
        >
          <div className="flex items-center gap-10 sm:gap-16">
            {STATS.map((s, i) => (
              <React.Fragment key={s.label}>
                <StatCounter label={s.label} end={s.end} suffix={s.suffix} active={phase === "stats" || phase === "exit"} />
                {i < STATS.length - 1 && (
                  <div className="w-px h-10 self-center"
                    style={{ background: "linear-gradient(180deg, transparent, rgba(99,102,241,0.4), transparent)" }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Progress + badge */}
        <div
          style={{
            opacity: phase === "stats" || phase === "exit" ? 1 : phase === "tagline" ? 0.6 : 0,
            transition: "opacity 0.5s ease",
          }}
          className="flex flex-col items-center gap-3"
        >
          <ProgressBar progress={progress} />
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
            style={{
              background: "rgba(20,184,166,0.08)",
              border: "1px solid rgba(20,184,166,0.2)",
              color: "#5eead4",
              backdropFilter: "blur(8px)",
            }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#14b8a6", boxShadow: "0 0 6px #14b8a6", animation: "pulse 1.2s ease-in-out infinite" }} />
            <span>Powered by AI · Verified Sources · {Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* ── HUD CORNERS ── */}
      {/* Top-left bracket */}
      <div className="absolute top-6 left-6 pointer-events-none" style={{ opacity: 0.5 }}>
        <div className="w-6 h-6 border-t-2 border-l-2" style={{ borderColor: "#6366f1" }} />
        <p className="mt-2 text-[10px] font-mono tracking-widest uppercase" style={{ color: "rgba(99,102,241,0.8)" }}>
          SATHYAMITHRA v2.0
        </p>
      </div>
      {/* Top-right bracket */}
      <div className="absolute top-6 right-6 pointer-events-none flex flex-col items-end" style={{ opacity: 0.5 }}>
        <div className="w-6 h-6 border-t-2 border-r-2 self-end" style={{ borderColor: "#14b8a6" }} />
        <p className="mt-2 text-[10px] font-mono tracking-widest uppercase" style={{ color: "rgba(20,184,166,0.8)" }}>
          GOV · AI · CITIZEN
        </p>
      </div>
      {/* Bottom-left bracket */}
      <div className="absolute bottom-6 left-6 pointer-events-none" style={{ opacity: 0.4 }}>
        <p className="mb-2 text-[10px] font-mono" style={{ color: "rgba(245,158,11,0.8)" }}>
          SYS:INIT → MATCHING ENGINE ONLINE
        </p>
        <div className="w-6 h-6 border-b-2 border-l-2" style={{ borderColor: "rgba(245,158,11,0.6)" }} />
      </div>
      {/* Bottom-right bracket */}
      <div className="absolute bottom-6 right-6 pointer-events-none flex flex-col items-end" style={{ opacity: 0.4 }}>
        <p className="mb-2 text-[10px] font-mono" style={{ color: "rgba(165,180,252,0.8)" }}>
          AUTH:OK · DB:READY · AI:LOADED
        </p>
        <div className="w-6 h-6 border-b-2 border-r-2 self-end" style={{ borderColor: "rgba(165,180,252,0.5)" }} />
      </div>

      {/* Side decorations — left vertical text */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ opacity: 0.2 }}>
        <p className="text-[10px] font-mono tracking-[0.4em] uppercase" style={{
          color: "#6366f1", writingMode: "vertical-rl", transform: "rotate(180deg)"
        }}>CITIZEN WELFARE PLATFORM</p>
      </div>
      {/* right vertical text */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ opacity: 0.2 }}>
        <p className="text-[10px] font-mono tracking-[0.4em] uppercase" style={{
          color: "#14b8a6", writingMode: "vertical-rl"
        }}>GOVERNMENT OF INDIA · AI GUIDED</p>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes sm-ring-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes sm-orbit-outer {
          from { transform: rotate(0deg) translateX(72px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(72px) rotate(-360deg); }
        }
        @keyframes sm-orbit-inner {
          from { transform: rotate(0deg) translateX(50px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(50px) rotate(-360deg); }
        }
        @keyframes sm-ripple {
          0%   { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes sm-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
