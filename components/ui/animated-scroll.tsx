"use client";

import React, { useState, useEffect, useRef } from "react";
import { Globe, Check, BarChart2, ChevronDown, Loader2 } from "lucide-react";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ── Shared keyframes ──────────────────────────────────────────────────────────

const STYLES = `
  @keyframes scanLine {
    0%   { transform: translateY(-100%); opacity: 0; }
    10%  { opacity: 0.6; }
    90%  { opacity: 0.6; }
    100% { transform: translateY(400%); opacity: 0; }
  }
  @keyframes rowReveal {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes chipSlide {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes ringPop {
    0%   { transform: scale(0.92); opacity: 0.5; }
    60%  { transform: scale(1.04); opacity: 1; }
    100% { transform: scale(1);    opacity: 1; }
  }
  @keyframes dotPulse {
    0%, 100% { opacity: 0.3; transform: scale(0.7); }
    50%       { opacity: 1;   transform: scale(1); }
  }
`;

// ── Step 01: URL analysis ─────────────────────────────────────────────────────

const PROFILE_ROWS = [
  { label: "Brand",       value: "YourApp"          },
  { label: "Category",    value: "SaaS Tool"        },
  { label: "Audience",    value: "Teams & founders" },
  { label: "Competitors", value: "Notion, Linear"   },
];
const TYPED_URL = "yourapp.com";

export function VisualStep01() {
  const [chars, setChars] = useState(0);
  const [phase, setPhase] = useState<"idle" | "scanning" | "done">("idle");
  const [rows,  setRows]  = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      while (alive) {
        setChars(0); setPhase("idle"); setRows(0);
        await sleep(500);
        for (let i = 1; i <= TYPED_URL.length && alive; i++) {
          setChars(i); await sleep(70);
        }
        await sleep(350);
        setPhase("scanning");
        await sleep(1600);
        setPhase("done");
        for (let i = 1; i <= PROFILE_ROWS.length && alive; i++) {
          setRows(i); await sleep(430);
        }
        await sleep(2400);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="w-full max-w-[440px] space-y-4">
      <style>{STYLES}</style>

      {/* URL bar */}
      <div
        className="flex items-center gap-3 rounded-2xl px-5 py-4 backdrop-blur-sm transition-all duration-500"
        style={{
          background:  phase === "scanning" ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.10)",
          border:      phase === "scanning" ? "1.5px solid rgba(255,255,255,0.5)" : "1.5px solid rgba(255,255,255,0.18)",
          boxShadow:   phase === "scanning" ? "0 0 28px rgba(255,255,255,0.10)" : "none",
        }}
      >
        <Globe className="w-5 h-5 text-white/55 shrink-0" />
        <span className="flex-1 text-[15px] text-white/90 font-mono tracking-tight">
          {TYPED_URL.slice(0, chars)}
          <span className="inline-block w-0.5 h-4 bg-white/70 ml-0.5 align-middle animate-pulse" />
        </span>
        <div className="w-6 h-6 shrink-0 flex items-center justify-center">
          {phase === "scanning" && <Loader2 className="w-5 h-5 text-white/60 animate-spin" />}
          {phase === "done"     && <Check   className="w-5 h-5 text-emerald-400" />}
        </div>
      </div>

      {/* Scanning label */}
      {phase === "scanning" && (
        <p className="text-center text-[11px] uppercase tracking-widest text-white/40 animate-pulse">
          Analyzing your site…
        </p>
      )}

      {/* Profile card */}
      <div
        className="rounded-2xl overflow-hidden backdrop-blur-sm"
        style={{ background: "rgba(255,255,255,0.09)", border: "1.5px solid rgba(255,255,255,0.16)" }}
      >
        {/* Scan line overlay */}
        {phase === "scanning" && (
          <div
            className="absolute left-0 right-0 h-[2px] pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
              animation: "scanLine 1.2s ease-in-out",
            }}
          />
        )}

        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">
            Brand profile
          </p>
          {phase === "done" && rows > 0 && (
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" /> Detected
            </span>
          )}
        </div>

        <div className="p-5 space-y-4">
          {PROFILE_ROWS.map(({ label, value }, i) => (
            <div
              key={label}
              className="flex items-center gap-3"
              style={{
                opacity:    i < rows ? 1 : 0.15,
                transform:  i < rows ? "translateY(0)" : "translateY(6px)",
                transition: "opacity 0.4s ease, transform 0.4s ease",
                transitionDelay: `${i * 0.05}s`,
              }}
            >
              <span className="text-white/40 text-sm w-24 shrink-0">{label}</span>
              {i < rows ? (
                <span className="font-semibold text-white/90 text-sm flex-1">{value}</span>
              ) : (
                <div className="flex-1 h-3 rounded-lg bg-white/10" />
              )}
              {i < rows && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 02: AI audit running ─────────────────────────────────────────────────

const LLM_MODELS = [
  { name: "ChatGPT",    accent: "#10a37f" },
  { name: "Claude",     accent: "#c86d3f" },
  { name: "Gemini",     accent: "#4285F4" },
  { name: "Perplexity", accent: "#a855f7" },
];
const TOTAL = 10;

export function VisualStep02() {
  const [fired,    setFired]    = useState(0);
  const [active,   setActive]   = useState<number | null>(null);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      while (alive) {
        setFired(0); setActive(null); setComplete(false);
        await sleep(700);
        for (let i = 0; i < TOTAL && alive; i++) {
          const m = i % LLM_MODELS.length;
          setActive(m);
          await sleep(240);
          setFired(i + 1);
          await sleep(520);
          setActive(null);
          await sleep(160);
        }
        if (alive) setComplete(true);
        await sleep(2200);
      }
    })();
    return () => { alive = false; };
  }, []);

  const progress = (fired / TOTAL) * 100;

  return (
    <div className="w-full max-w-[440px] space-y-4">

      {/* Status bar */}
      <div
        className="flex items-center gap-3 rounded-2xl px-5 py-4 backdrop-blur-sm"
        style={{ background: "rgba(255,255,255,0.10)", border: "1.5px solid rgba(255,255,255,0.18)" }}
      >
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{
            background: complete ? "#34d399" : "#34d399",
            boxShadow:  complete ? "none" : "0 0 0 4px rgba(52,211,153,0.25)",
            animation:  complete ? "none" : "dotPulse 1.2s ease-in-out infinite",
          }}
        />
        <span className="text-sm font-semibold text-white/90">
          {complete ? "Audit complete" : "Live audit running"}
        </span>
        {complete
          ? <Check className="w-4 h-4 text-emerald-400 ml-auto" />
          : <span className="text-xs text-white/35 ml-auto">Running…</span>
        }
      </div>

      {/* Progress bar */}
      <div
        className="rounded-2xl px-5 py-4 backdrop-blur-sm"
        style={{ background: "rgba(255,255,255,0.07)", border: "1.5px solid rgba(255,255,255,0.12)" }}
      >
        <div className="h-2.5 bg-white/12 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width:      `${progress}%`,
              background: "linear-gradient(90deg, rgba(255,255,255,0.55), rgba(255,255,255,0.9))",
            }}
          />
        </div>
      </div>

      {/* LLM model grid */}
      <div className="grid grid-cols-2 gap-3">
        {LLM_MODELS.map(({ name, accent }, i) => (
          <div
            key={name}
            className="rounded-2xl px-4 py-5 backdrop-blur-sm transition-all duration-300"
            style={{
              background:  active === i ? `${accent}22` : "rgba(255,255,255,0.07)",
              border:      active === i ? `1.5px solid ${accent}88` : "1.5px solid rgba(255,255,255,0.12)",
              boxShadow:   active === i ? `0 0 24px ${accent}33` : "none",
              transform:   active === i ? "scale(1.04)" : "scale(1)",
            }}
          >
            {/* Model indicator dot */}
            <div
              className="w-2 h-2 rounded-full mx-auto mb-3 transition-all duration-200"
              style={{
                background: active === i ? accent : "rgba(255,255,255,0.2)",
                boxShadow:  active === i ? `0 0 10px ${accent}` : "none",
              }}
            />
            <p className="text-[13px] font-semibold text-white/80 text-center">{name}</p>
            <p
              className="text-[10px] mt-1 text-center transition-opacity duration-150"
              style={{ opacity: active === i ? 1 : 0, color: accent }}
            >
              responding…
            </p>
          </div>
        ))}
      </div>

      {/* Bottom status */}
      <div
        className="flex items-center justify-center gap-2 text-sm transition-opacity duration-500"
        style={{ opacity: fired > 0 ? 1 : 0 }}
      >
        <Check className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-white/45">
          {complete ? "All responses collected" : "Collecting responses…"}
        </span>
      </div>
    </div>
  );
}

// ── Step 03: Score + fix list ─────────────────────────────────────────────────

const FIX_ITEMS = [
  { text: "Add llms.txt to your site",    priority: "High"   },
  { text: "Improve product description",  priority: "Medium" },
  { text: "Add more use cases",           priority: "Medium" },
];
const TARGET_SCORE = 72;

const PRIORITY_COLORS: Record<string, string> = {
  High:   "rgba(239,68,68,0.75)",
  Medium: "rgba(251,191,36,0.75)",
};

export function VisualStep03() {
  const [score, setScore] = useState(0);
  const [fixes, setFixes] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      while (alive) {
        setScore(0); setFixes(0);
        await sleep(500);
        const STEPS = 50;
        for (let i = 1; i <= STEPS && alive; i++) {
          const ease = 1 - Math.pow(1 - i / STEPS, 3);
          setScore(Math.round(ease * TARGET_SCORE));
          await sleep(26);
        }
        await sleep(500);
        for (let i = 1; i <= FIX_ITEMS.length && alive; i++) {
          setFixes(i); await sleep(440);
        }
        await sleep(2600);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Circular SVG progress
  const R = 54;
  const circ = 2 * Math.PI * R;
  const offset = circ - (score / 100) * circ;
  const ringColor = score > 60 ? "#34d399" : score > 30 ? "#fbbf24" : "#f87171";

  return (
    <div className="w-full max-w-[440px] space-y-4">

      {/* Score card */}
      <div
        className="rounded-2xl p-6 backdrop-blur-sm"
        style={{ background: "rgba(255,255,255,0.10)", border: "1.5px solid rgba(255,255,255,0.18)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-white/50" />
            <span className="text-sm font-semibold text-white/80">AI Visibility Score</span>
          </div>
          <span className="text-xs font-bold text-emerald-400">+12 vs last ↑</span>
        </div>

        <div className="flex items-center gap-7">
          {/* Circular ring */}
          <div
            className="relative shrink-0"
            style={{ animation: score === TARGET_SCORE ? "ringPop 0.5s ease" : "none" }}
          >
            <svg width="128" height="128" className="-rotate-90">
              <circle cx="64" cy="64" r={R}
                fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="9" />
              <circle cx="64" cy="64" r={R}
                fill="none"
                stroke={ringColor}
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 26ms linear, stroke 600ms ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white tabular-nums leading-none">
                {score}
              </span>
              <span className="text-xs text-white/40 mt-0.5">/100</span>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex justify-between text-[11px] text-white/40 mb-1.5">
                <span>Visibility</span>
                <span>{score}%</span>
              </div>
              <div className="h-1.5 bg-white/12 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${score}%`, background: ringColor }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-white/40 mb-1.5">
                <span>Competitor rank</span>
                <span>#3</span>
              </div>
              <div className="h-1.5 bg-white/12 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-white/40" style={{ width: "33%" }} />
              </div>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">
              Mentioned in <span className="text-white/80 font-semibold">{score}%</span> of targeted prompts
            </p>
          </div>
        </div>
      </div>

      {/* Fix list */}
      <div
        className="rounded-2xl overflow-hidden backdrop-blur-sm"
        style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.12)" }}
      >
        <div className="px-5 py-3 border-b border-white/10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">
            Priority fix list
          </p>
        </div>
        <div className="p-5 space-y-3.5">
          {FIX_ITEMS.map(({ text, priority }, i) => (
            <div
              key={i}
              className="flex items-center gap-3 transition-all duration-350"
              style={{
                opacity:    i < fixes ? 1 : 0.12,
                transform:  i < fixes ? "translateY(0)" : "translateY(5px)",
                transition: "opacity 0.35s ease, transform 0.35s ease",
              }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border:     "1px solid rgba(255,255,255,0.2)",
                  color:      "rgba(255,255,255,0.7)",
                }}
              >
                {i + 1}
              </span>
              <span className="text-[13px] text-white/80 flex-1">{text}</span>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                style={{
                  background: `${PRIORITY_COLORS[priority]}22`,
                  color:       PRIORITY_COLORS[priority],
                  border:      `1px solid ${PRIORITY_COLORS[priority]}44`,
                }}
              >
                {priority}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step definitions ──────────────────────────────────────────────────────────

const STEPS = [
  {
    num: "01",
    visualOnLeft: true,
    gradient: "linear-gradient(135deg, #1a0533 0%, #5B2D91 60%, #9333ea 100%)",
    heading: "Tell us about your brand",
    description: "Paste your website URL. Comly automatically extracts your brand name, category, target users, competitors and use cases. Confirm or edit in seconds.",
    Visual: VisualStep01,
  },
  {
    num: "02",
    visualOnLeft: false,
    gradient: "linear-gradient(135deg, #1e0a3c 0%, #6d28d9 60%, #a78bfa 100%)",
    heading: "We run the AI audit",
    description: "Our engine generates targeted prompts and fires them at ChatGPT, Claude, Gemini and Perplexity. We record every mention, position and competitor that appears.",
    Visual: VisualStep02,
  },
  {
    num: "03",
    visualOnLeft: true,
    gradient: "linear-gradient(135deg, #170836 0%, #4c1d95 60%, #7c3aed 100%)",
    heading: "Get your score and fix list",
    description: "See your visibility score, competitor ranking, and a prioritized to-do list. Generate your llms.txt in one click and track your improvement weekly.",
    Visual: VisualStep03,
  },
] as const;

// ── Main export ───────────────────────────────────────────────────────────────

export function HowItWorksAnimated() {
  const [currentPage, setCurrentPage] = useState(1);
  const numPages = STEPS.length;
  const outerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const el = outerRef.current;
      if (!el) return;
      const scrollable = el.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const scrolled = Math.max(0, -el.getBoundingClientRect().top);
      const progress = Math.min(1, scrolled / scrollable);
      const page = Math.min(numPages, Math.floor(progress * numPages) + 1);
      setCurrentPage(page);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [numPages]);

  return (
    <div>
      {/* Section heading */}
      <div className="text-center pt-16 sm:pt-24 pb-8 sm:pb-10 px-6 bg-white">
        <p className="text-[11px] font-bold tracking-widest uppercase text-[#5B2D91] mb-4">
          HOW IT WORKS
        </p>
        <h2 className="text-[28px] sm:text-[42px] font-bold tracking-tight text-[#0a0a0a]">
          How Comly works
        </h2>
        <p className="mt-3 text-base sm:text-lg text-[#6b6b6b]">
          3 steps to go from invisible to recommended
        </p>
        <div className="mt-6 sm:mt-8 flex justify-center">
          <ChevronDown className="w-5 h-5 text-[#aaaaaa] animate-bounce" />
        </div>
      </div>

      {/* Mobile: stacked step cards */}
      <div className="md:hidden px-4 pb-14 space-y-5">
        {STEPS.map((step) => {
          const VisualComp = step.Visual;
          return (
            <div key={step.num} className="rounded-3xl overflow-hidden shadow-lg border border-white/10">
              <div
                className="flex items-start justify-center px-5 pt-8 pb-6"
                style={{ background: step.gradient }}
              >
                <VisualComp />
              </div>
              <div className="bg-white px-6 py-6">
                <p className="text-[10px] font-bold text-[#5B2D91] uppercase tracking-widest mb-2">
                  Step {step.num}
                </p>
                <h3 className="text-xl font-bold text-[#0a0a0a] mb-2 leading-snug">{step.heading}</h3>
                <p className="text-sm text-[#6b6b6b] leading-relaxed">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: scroll-driven sticky animation */}
      <div ref={outerRef} id="how-it-works-steps" style={{ height: `${numPages * 100}vh` }} className="hidden md:block">
        <div className="sticky top-0 h-screen overflow-hidden bg-white">

          {/* Progress dots */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-500"
                style={{
                  width:      currentPage === i + 1 ? "28px" : "8px",
                  height:     "8px",
                  background: currentPage === i + 1 ? "#0a0a0a" : "rgba(0,0,0,0.16)",
                }}
              />
            ))}
          </div>

          {/* Pages */}
          {STEPS.map((step, i) => {
            const idx = i + 1;
            const isActive = currentPage === idx;
            const leftTrans  = isActive ? "translateY(0)" : "translateY(100%)";
            const rightTrans = isActive ? "translateY(0)" : "translateY(-100%)";
            const VisualComp = step.Visual;

            const textPanel = (
              <div className="flex flex-col items-start justify-center h-full px-10 py-8 md:px-14 lg:px-20 bg-white">
                <h3 className="text-3xl md:text-4xl lg:text-[46px] font-bold mb-5 leading-tight text-[#0a0a0a]">
                  {step.heading}
                </h3>
                <p className="text-base md:text-[17px] text-[#6b6b6b] leading-relaxed max-w-sm">
                  {step.description}
                </p>
              </div>
            );

            const visualPanel = (
              <div
                className="flex items-center justify-center h-full px-10 py-12 md:px-14 lg:px-16"
                style={{
                  background: step.gradient,
                  backgroundImage: `${step.gradient}, url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(255,255,255,0.04)'/%3E%3C/svg%3E")`,
                  backgroundSize: "auto, 20px 20px",
                }}
              >
                <VisualComp />
              </div>
            );

            return (
              <div key={idx} className="absolute inset-0">
                <div
                  className="absolute top-0 left-0 w-[42%] h-full transition-transform duration-[850ms] ease-in-out"
                  style={{ transform: leftTrans }}
                >
                  {step.visualOnLeft ? visualPanel : textPanel}
                </div>
                <div
                  className="absolute top-0 left-[42%] w-[58%] h-full transition-transform duration-[850ms] ease-in-out"
                  style={{ transform: rightTrans }}
                >
                  {step.visualOnLeft ? textPanel : visualPanel}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
