"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Deep saturated jewel & neon tones for darker, high-contrast aesthetics
const PAGE_THEMES: Record<string, { p: string; s: string; a: string; c: string }> = {
  "/":            { p: "#10b981", s: "#059669", a: "#f59e0b", c: "#06b6d4" }, // Emerald & Saffron Gold
  "/schemes":     { p: "#3b82f6", s: "#1d4ed8", a: "#10b981", c: "#60a5fa" }, // Sapphire & Cyan
  "/find-scheme": { p: "#8b5cf6", s: "#6d28d9", a: "#f59e0b", c: "#ec4899" }, // Amethyst & Amber
  "/dashboard":   { p: "#10b981", s: "#0284c7", a: "#f59e0b", c: "#38bdf8" }, // Deep Emerald & Sky
  "/login":       { p: "#10b981", s: "#047857", a: "#f59e0b", c: "#06b6d4" }, // National Green & Gold
  "/register":    { p: "#10b981", s: "#047857", a: "#06b6d4", c: "#a855f7" }, // Green & Cyber Cyan
};

function getTheme(path: string) {
  if (PAGE_THEMES[path]) return PAGE_THEMES[path];
  for (const key of Object.keys(PAGE_THEMES)) {
    if (key !== "/" && path.startsWith(key)) return PAGE_THEMES[key];
  }
  return PAGE_THEMES["/"];
}

function hr(h: string) { return parseInt(h.slice(1, 3), 16); }
function hg(h: string) { return parseInt(h.slice(3, 5), 16); }
function hb(h: string) { return parseInt(h.slice(5, 7), 16); }

interface Citizen {
  id: string;
  type: "farmer" | "student" | "mother_child" | "senior" | "doctor" | "artisan";
  scheme: string;
  icon: string;
  x: number;
  yRatio: number;
  speed: number;
  dir: number;
  scale: number;
  walkCycle: number;
  strideSpeed: number;
  color: [number, number, number];
}

interface SchemeOrb {
  icon: string;
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  phase: number;
  pulseSpeed: number;
  color: [number, number, number];
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname  = usePathname();
  const themeRef  = useRef(getTheme(pathname || "/"));
  const mouseRef  = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    themeRef.current = getTheme(pathname || "/");
  }, [pathname]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rawCtx = canvas.getContext("2d", { alpha: true });
    if (!rawCtx) return;
    const ctx: CanvasRenderingContext2D = rawCtx;

    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    let resizeTimer: any;
    const resize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;
      }, 150);
    };
    window.addEventListener("resize", resize, { passive: true });

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };
    const onMouseLeave = () => {
      mouseRef.current.active = false;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave, { passive: true });

    // ── 1. Micro-Starfield (24 stars) ───────────────────────────────
    const STAR_COUNT = 24;
    const starColors = ["#ffffff", "#e0f2fe", "#fef3c7", "#dcfce7"];
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * (H * 0.7),
      r: 0.6 + Math.random() * 1.1,
      alpha: 0.15 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
      speed: 0.012 + Math.random() * 0.02,
      col: starColors[Math.floor(Math.random() * starColors.length)],
    }));

    // ── 2. Rotating Ashoka Dharma Chakras ───────────────────────────
    const wheels = [
      { x: W * 0.08, y: H * 0.22, r: 75,  sp: 0.0016, a: 0,   alpha: 0.22, isGold: true },
      { x: W * 0.92, y: H * 0.45, r: 90,  sp: -0.0012, a: 1.2, alpha: 0.18, isGold: false },
    ];

    function drawWheel(
      wx: number, wy: number, wr: number, ang: number, al: number,
      isGold: boolean, pr: number, pg: number, pb: number, ar: number, ag: number, ab: number
    ) {
      ctx.save();
      ctx.globalAlpha = al;
      const strokeCol = isGold ? `rgb(${ar},${ag},${ab})` : `rgb(${pr},${pg},${pb})`;
      ctx.strokeStyle = strokeCol;
      ctx.fillStyle = strokeCol;
      ctx.translate(wx, wy);
      ctx.rotate(ang);

      // Outer rim + concentric inner ring
      ctx.beginPath();
      ctx.arc(0, 0, wr, 0, Math.PI * 2);
      ctx.arc(0, 0, wr * 0.85, 0, Math.PI * 2);
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Center solar hub
      ctx.beginPath();
      ctx.arc(0, 0, wr * 0.18, 0, Math.PI * 2);
      ctx.fill();

      // Batched 24 spokes
      ctx.beginPath();
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        ctx.moveTo(Math.cos(a) * wr * 0.2, Math.sin(a) * wr * 0.2);
        ctx.lineTo(Math.cos(a) * wr * 0.85, Math.sin(a) * wr * 0.85);
      }
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.restore();
    }

    // ── 3. Live Moving Public Citizens (Representing Government Schemes) ──
    const CITIZEN_CONFIGS: Omit<Citizen, "x" | "walkCycle">[] = [
      {
        id: "farmer",
        type: "farmer",
        scheme: "Farmer · PM-KISAN",
        icon: "🌾",
        yRatio: 0.88,
        speed: 0.65,
        dir: 1,
        scale: 1.05,
        strideSpeed: 0.055,
        color: [34, 197, 94], // Emerald Green
      },
      {
        id: "student",
        type: "student",
        scheme: "Student · Vidya Lakshmi",
        icon: "🎓",
        yRatio: 0.86,
        speed: 0.85,
        dir: 1,
        scale: 0.95,
        strideSpeed: 0.075,
        color: [99, 102, 241], // Indigo
      },
      {
        id: "mother_child",
        type: "mother_child",
        scheme: "Family · Poshan Abhiyaan",
        icon: "👩‍👧",
        yRatio: 0.91,
        speed: 0.55,
        dir: -1,
        scale: 1.1,
        strideSpeed: 0.048,
        color: [244, 63, 94], // Rose / Pink
      },
      {
        id: "senior",
        type: "senior",
        scheme: "Senior · Atal Pension",
        icon: "👴",
        yRatio: 0.89,
        speed: 0.45,
        dir: -1,
        scale: 1.0,
        strideSpeed: 0.040,
        color: [245, 158, 11], // Saffron Gold
      },
      {
        id: "doctor",
        type: "doctor",
        scheme: "Medic · Ayushman Bharat",
        icon: "🏥",
        yRatio: 0.85,
        speed: 0.75,
        dir: 1,
        scale: 0.98,
        strideSpeed: 0.065,
        color: [6, 182, 212], // Cyan / Teal
      },
      {
        id: "artisan",
        type: "artisan",
        scheme: "Artisan · MUDRA Scheme",
        icon: "💼",
        yRatio: 0.90,
        speed: 0.70,
        dir: -1,
        scale: 1.02,
        strideSpeed: 0.060,
        color: [251, 146, 60], // Warm Amber
      },
    ];

    const citizens: Citizen[] = CITIZEN_CONFIGS.map((cfg, idx) => ({
      ...cfg,
      x: (W / (CITIZEN_CONFIGS.length + 1)) * (idx + 1) + (Math.random() * 80 - 40),
      walkCycle: Math.random() * Math.PI * 2,
    }));

    function drawCitizen(c: Citizen) {
      const s = c.scale;
      const cx = c.x;
      const bob = Math.abs(Math.sin(c.walkCycle * 2)) * (2.2 * s);
      const cy = H * c.yRatio - bob;
      const d = c.dir;
      const legA = Math.sin(c.walkCycle) * 0.4;
      const [r, g, b] = c.color;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(d, 1);

      // 1. Soft glowing aura around citizen
      ctx.beginPath();
      ctx.arc(0, -22 * s, 32 * s, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},0.09)`;
      ctx.fill();

      // 2. Legs
      const hipY = -12 * s;
      const legLen = 22 * s;

      // Back leg
      ctx.strokeStyle = `rgba(${r},${g},${b},0.60)`;
      ctx.lineWidth = 3.2 * s;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-2 * s, hipY);
      ctx.lineTo(-2 * s + Math.sin(-legA) * legLen, hipY + Math.cos(-legA) * legLen);
      ctx.stroke();

      // Front leg
      ctx.strokeStyle = `rgba(${r},${g},${b},0.92)`;
      ctx.beginPath();
      ctx.moveTo(3 * s, hipY);
      ctx.lineTo(3 * s + Math.sin(legA) * legLen, hipY + Math.cos(legA) * legLen);
      ctx.stroke();

      // 3. Torso
      ctx.strokeStyle = `rgba(${r},${g},${b},0.90)`;
      ctx.lineWidth = 5 * s;
      ctx.beginPath();
      ctx.moveTo(0, hipY);
      ctx.lineTo(0, -28 * s);
      ctx.stroke();

      // 4. Arms & Equipment
      const shoulderY = -26 * s;

      if (c.type === "farmer") {
        ctx.strokeStyle = `rgba(${r},${g},${b},0.92)`;
        ctx.lineWidth = 2.6 * s;
        ctx.beginPath();
        ctx.moveTo(0, shoulderY);
        ctx.lineTo(10 * s, shoulderY + 8 * s);
        ctx.stroke();

        // Sickle / Harvest sheaf
        ctx.strokeStyle = "rgba(245, 158, 11, 0.95)";
        ctx.lineWidth = 2.2 * s;
        ctx.beginPath();
        ctx.arc(12 * s, shoulderY + 4 * s, 7 * s, Math.PI * 0.6, Math.PI * 1.8);
        ctx.stroke();
      } else if (c.type === "student") {
        // Backpack
        ctx.fillStyle = `rgba(${r},${g},${b},0.8)`;
        ctx.fillRect(-8 * s, shoulderY + 2 * s, 6 * s, 12 * s);

        ctx.strokeStyle = `rgba(${r},${g},${b},0.92)`;
        ctx.lineWidth = 2.6 * s;
        ctx.beginPath();
        ctx.moveTo(0, shoulderY);
        ctx.lineTo(8 * s, shoulderY + 10 * s);
        ctx.stroke();
      } else if (c.type === "senior") {
        ctx.strokeStyle = `rgba(${r},${g},${b},0.92)`;
        ctx.lineWidth = 2.6 * s;
        ctx.beginPath();
        ctx.moveTo(0, shoulderY);
        ctx.lineTo(10 * s, shoulderY + 8 * s);
        ctx.stroke();

        // Cane to ground
        ctx.strokeStyle = "rgba(245, 158, 11, 0.90)";
        ctx.lineWidth = 2.0 * s;
        ctx.beginPath();
        ctx.moveTo(10 * s, shoulderY + 8 * s);
        ctx.lineTo(13 * s, hipY + legLen);
        ctx.stroke();
      } else if (c.type === "doctor") {
        // Stethoscope loop
        ctx.strokeStyle = "rgba(6, 182, 212, 0.95)";
        ctx.lineWidth = 1.8 * s;
        ctx.beginPath();
        ctx.arc(0, shoulderY + 3 * s, 4 * s, 0, Math.PI);
        ctx.stroke();

        ctx.strokeStyle = `rgba(${r},${g},${b},0.92)`;
        ctx.lineWidth = 2.6 * s;
        ctx.beginPath();
        ctx.moveTo(0, shoulderY);
        ctx.lineTo(8 * s, shoulderY + 12 * s);
        ctx.stroke();
      } else if (c.type === "mother_child") {
        // Mother's arm holding child's hand
        ctx.strokeStyle = `rgba(${r},${g},${b},0.92)`;
        ctx.lineWidth = 2.6 * s;
        ctx.beginPath();
        ctx.moveTo(0, shoulderY);
        ctx.lineTo(-14 * s, shoulderY + 14 * s);
        ctx.stroke();

        // Small child walking alongside
        const cs = 0.58;
        const childX = -18 * s;
        const childBob = Math.abs(Math.sin(c.walkCycle * 2.2)) * 1.5;
        const childY = (hipY + legLen) - (24 * s * cs) - childBob;

        // Child head
        ctx.fillStyle = `rgba(${r},${g},${b},0.95)`;
        ctx.beginPath();
        ctx.arc(childX, childY - 8 * s * cs, 4.5 * s * cs, 0, Math.PI * 2);
        ctx.fill();

        // Child body
        ctx.strokeStyle = `rgba(${r},${g},${b},0.92)`;
        ctx.lineWidth = 3.5 * s * cs;
        ctx.beginPath();
        ctx.moveTo(childX, childY - 5 * s * cs);
        ctx.lineTo(childX, childY + 10 * s * cs);
        ctx.stroke();

        // Child legs
        ctx.lineWidth = 2.2 * s * cs;
        ctx.beginPath();
        ctx.moveTo(childX, childY + 10 * s * cs);
        ctx.lineTo(childX + Math.sin(c.walkCycle) * 7 * s * cs, hipY + legLen);
        ctx.moveTo(childX, childY + 10 * s * cs);
        ctx.lineTo(childX - Math.sin(c.walkCycle) * 7 * s * cs, hipY + legLen);
        ctx.stroke();
      } else {
        // Artisan with tool briefcase
        ctx.strokeStyle = `rgba(${r},${g},${b},0.92)`;
        ctx.lineWidth = 2.6 * s;
        ctx.beginPath();
        ctx.moveTo(0, shoulderY);
        ctx.lineTo(6 * s, shoulderY + 12 * s);
        ctx.stroke();

        ctx.fillStyle = "rgba(245, 158, 11, 0.90)";
        ctx.fillRect(4 * s, shoulderY + 12 * s, 8 * s, 6 * s);
      }

      // 5. Head
      ctx.fillStyle = `rgba(${r},${g},${b},0.96)`;
      ctx.beginPath();
      ctx.arc(0, -34 * s, 6 * s, 0, Math.PI * 2);
      ctx.fill();

      // Headgear
      if (c.type === "farmer") {
        ctx.fillStyle = "rgba(245, 158, 11, 0.95)";
        ctx.beginPath();
        ctx.arc(0, -37 * s, 6.5 * s, Math.PI, 0);
        ctx.fill();
      } else if (c.type === "student") {
        ctx.fillStyle = "rgba(99, 102, 241, 0.95)";
        ctx.beginPath();
        ctx.moveTo(-8 * s, -39 * s);
        ctx.lineTo(0, -42 * s);
        ctx.lineTo(8 * s, -39 * s);
        ctx.lineTo(0, -36 * s);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();

      // 6. Floating Scheme Badge above citizen (always upright)
      ctx.save();
      const badgeY = cy - 52 * s;
      ctx.font = `bold ${Math.round(10.5 * s)}px system-ui, -apple-system, sans-serif`;
      const text = `${c.icon} ${c.scheme}`;
      const textMetrics = ctx.measureText(text);
      const pillW = textMetrics.width + 16 * s;
      const pillH = 20 * s;

      ctx.fillStyle = `rgba(15, 23, 42, 0.85)`;
      ctx.strokeStyle = `rgba(${r},${g},${b},0.65)`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect 
        ? ctx.roundRect(cx - pillW / 2, badgeY - pillH / 2, pillW, pillH, 8 * s)
        : ctx.rect(cx - pillW / 2, badgeY - pillH / 2, pillW, pillH);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = `rgba(248, 250, 252, 0.96)`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, cx, badgeY);
      ctx.restore();
    }

    // ── 4. Floating Government Scheme Benefit Orbs ──────────────────
    const SCHEME_ORB_ICONS = [
      { icon: "🌾", color: [34, 197, 94] as [number, number, number] },  // PM-KISAN
      { icon: "🎓", color: [99, 102, 241] as [number, number, number] }, // Vidya Lakshmi
      { icon: "🏥", color: [6, 182, 212] as [number, number, number] },  // Ayushman Bharat
      { icon: "🏠", color: [249, 115, 22] as [number, number, number] }, // PMAY Housing
      { icon: "💼", color: [168, 85, 247] as [number, number, number] }, // Mudra Loan
      { icon: "⚡", color: [245, 158, 11] as [number, number, number] }, // Saubhagya Solar
      { icon: "💧", color: [14, 165, 233] as [number, number, number] }, // Jal Jeevan
      { icon: "🛡️", color: [16, 185, 129] as [number, number, number] }, // Suraksha Bima
      { icon: "👵", color: [245, 158, 11] as [number, number, number] }, // Atal Pension
      { icon: "👩‍👧", color: [244, 63, 94] as [number, number, number] }, // Women & Child
    ];

    const orbs: SchemeOrb[] = SCHEME_ORB_ICONS.map((cfg, i) => ({
      icon: cfg.icon,
      color: cfg.color,
      x: (W / (SCHEME_ORB_ICONS.length + 1)) * (i + 1),
      y: H * 0.25 + Math.random() * (H * 0.45),
      r: 16 + Math.random() * 6,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(0.25 + Math.random() * 0.35),
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.025 + Math.random() * 0.02,
    }));

    function drawSchemeOrb(orb: SchemeOrb) {
      orb.phase += orb.pulseSpeed;
      orb.y += orb.vy + Math.sin(orb.phase) * 0.35;
      orb.x += orb.vx;

      // Wrap vertically
      if (orb.y < -40) {
        orb.y = H * 0.75 + Math.random() * 40;
        orb.x = Math.random() * W;
      }
      if (orb.x < -40) orb.x = W + 40;
      if (orb.x > W + 40) orb.x = -40;

      // Mouse deflection
      const mouse = mouseRef.current;
      if (mouse.active) {
        const dx = mouse.x - orb.x;
        const dy = mouse.y - orb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100 && dist > 2) {
          orb.x -= (dx / dist) * 1.5;
          orb.y -= (dy / dist) * 1.5;
        }
      }

      const [r, g, b] = orb.color;
      const pulse = 1 + 0.12 * Math.sin(orb.phase);

      // Glowing outer halo
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.r * 2.2 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},0.08)`;
      ctx.fill();

      // Translucent glass sphere
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.r * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(15, 23, 42, 0.70)`;
      ctx.strokeStyle = `rgba(${r},${g},${b},0.60)`;
      ctx.lineWidth = 1.4;
      ctx.fill();
      ctx.stroke();

      // Center emoji icon
      ctx.font = `${Math.round(orb.r * 1.05)}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(orb.icon, orb.x, orb.y);
    }

    // ── 5. Silhouetted Indian Horizon Ground Layer ───────────────────
    function drawHorizon() {
      const groundY = H * 0.94;

      // Distant rolling hills
      ctx.fillStyle = "rgba(4, 47, 46, 0.25)";
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, groundY - 15);
      ctx.quadraticCurveTo(W * 0.25, groundY - 35, W * 0.5, groundY - 20);
      ctx.quadraticCurveTo(W * 0.75, groundY - 40, W, groundY - 15);
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();

      // Foreground horizon line
      ctx.strokeStyle = "rgba(20, 184, 166, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(W, groundY);
      ctx.stroke();

      // Golden horizon glow
      ctx.fillStyle = "rgba(245, 158, 11, 0.05)";
      ctx.beginPath();
      ctx.rect(0, groundY - 10, W, 25);
      ctx.fill();
    }

    // ── 6. Delta-Time Throttled Render Loop (36 FPS Target) ─────────
    let animId = 0;
    let lastTime = 0;
    const interval = 1000 / 36; // 36 FPS smooth, zero-CPU ambient background

    function draw(now: number) {
      animId = requestAnimationFrame(draw);

      if (document.hidden) return;

      const elapsed = now - lastTime;
      if (elapsed < interval) return;
      lastTime = now - (elapsed % interval);

      ctx.clearRect(0, 0, W, H);

      const th = themeRef.current;
      const [pr, pg, pb] = [hr(th.p), hg(th.p), hb(th.p)];
      const [ar, ag, ab] = [hr(th.a), hg(th.a), hb(th.a)];

      // 1. Distant Starfield
      stars.forEach(s => {
        s.phase += s.speed;
        const currentAlpha = s.alpha * (0.6 + 0.4 * Math.sin(s.phase));
        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = s.col;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;

      // 2. Rotating Ashoka Chakras in cosmic sky
      wheels.forEach(w => {
        w.a += w.sp;
        drawWheel(w.x, w.y, w.r, w.a, w.alpha, w.isGold, pr, pg, pb, ar, ag, ab);
      });

      // 3. Floating Government Scheme Benefit Orbs
      orbs.forEach(orb => {
        drawSchemeOrb(orb);
      });

      // 4. Ground Horizon
      drawHorizon();

      // 5. Live Moving Citizens Walking on Ground
      citizens.forEach(c => {
        c.walkCycle += c.strideSpeed;
        c.x += c.speed * c.dir;

        // Wrap around screen edges
        if (c.dir > 0 && c.x > W + 80) {
          c.x = -80;
        } else if (c.dir < 0 && c.x < -80) {
          c.x = W + 80;
        }

        drawCitizen(c);
      });
    }

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{
        zIndex: 0,
        willChange: "transform",
        transform: "translateZ(0)",
      }}
    />
  );
}
