"use client";

import React, { useState, useEffect, useRef } from "react";
import { Globe, Check, BarChart2, ChevronDown, Loader2, TrendingUp } from "lucide-react";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ── Step 01: cursor click → paste URL → scrape → auto-fill brand profile ──────

const PASTED_URL = "yourapp.com";
const CRAWL_MSGS = [
  "Reading homepage…",
  "Scanning meta tags…",
  "Detecting brand signals…",
  "Identifying competitors…",
];
const PROFILE_ROWS = [
  { label: "Brand",       value: "YourApp"          },
  { label: "Category",    value: "SaaS Tool"        },
  { label: "Audience",    value: "Teams & founders" },
  { label: "Competitors", value: "Notion, Linear"   },
];

function CursorIcon() {
  return (
    <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0V15.5L3.5 12L6 18L8.5 17L6 11H11.5L0 0Z"
        fill="white"
      />
      <path
        d="M0 0V15.5L3.5 12L6 18L8.5 17L6 11H11.5L0 0Z"
        stroke="#111111"
        strokeWidth="1.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function VisualStep01() {
  const [phase,      setPhase]      = useState<"idle"|"moving"|"clicking"|"pasted"|"scanning"|"extracting"|"done">("idle");
  const [crawlIdx,   setCrawlIdx]   = useState(0);
  const [pagesCount, setPagesCount] = useState(0);
  const [rowChars,   setRowChars]   = useState([0, 0, 0, 0]);

  useEffect(() => {
    let alive = true;
    (async () => {
      while (alive) {
        setPhase("idle"); setCrawlIdx(0); setPagesCount(0); setRowChars([0,0,0,0]);
        await sleep(800);

        setPhase("moving");
        await sleep(620);

        setPhase("clicking");
        await sleep(260);

        setPhase("pasted");
        await sleep(480);

        setPhase("scanning");
        for (let m = 0; m < CRAWL_MSGS.length && alive; m++) {
          setCrawlIdx(m); setPagesCount(m + 1); await sleep(580);
        }

        setPhase("extracting");
        for (let row = 0; row < PROFILE_ROWS.length && alive; row++) {
          const val = PROFILE_ROWS[row].value;
          for (let c = 1; c <= val.length && alive; c++) {
            setRowChars(prev => prev.map((v, i) => i === row ? c : v));
            await sleep(36);
          }
          await sleep(160);
        }
        setPhase("done");
        await sleep(3000);
      }
    })();
    return () => { alive = false; };
  }, []);

  const showCursor = phase === "moving" || phase === "clicking";
  const isClicking = phase === "clicking";
  const isFocused  = ["clicking","pasted","scanning"].includes(phase);
  const showUrl    = ["pasted","scanning","extracting","done"].includes(phase);
  const scanning   = phase === "scanning";
  const extracting = phase === "extracting" || phase === "done";

  return (
    <div className="w-full max-w-[380px] space-y-3 relative">
      {/* Mouse cursor sliding in from right */}
      <div
        className="absolute z-20 pointer-events-none"
        style={{
          top: "12px",
          left: showCursor ? "88px" : "330px",
          opacity: showCursor ? 1 : 0,
          transform: isClicking ? "scale(0.8)" : "scale(1)",
          transition: "left 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.18s ease, transform 0.1s ease",
        }}
      >
        <CursorIcon />
      </div>

      {/* URL bar */}
      <div className={`bg-white rounded-xl border shadow-sm flex items-center gap-2.5 px-4 py-3 transition-all duration-200 ${
        isClicking
          ? "border-[#5B2D91] shadow-[0_0_0_5px_rgba(91,45,145,0.18)]"
          : isFocused
          ? "border-[#5B2D91] shadow-[0_0_0_3px_rgba(91,45,145,0.08)]"
          : "border-[#e2e2e2]"
      }`}>
        <Globe className="w-4 h-4 text-[#bbbbbb] shrink-0" />
        <span className="flex-1 text-[13px] font-mono tracking-tight">
          {showUrl ? (
            <span className="text-[#0a0a0a]">
              {PASTED_URL}
              {phase === "pasted" && (
                <span className="inline-block w-[2px] h-[14px] bg-[#5B2D91] ml-0.5 align-middle animate-pulse" />
              )}
            </span>
          ) : (
            <span className="text-[#cccccc]">Paste your URL here…</span>
          )}
        </span>
        {scanning   && <Loader2 className="w-4 h-4 text-[#5B2D91] animate-spin shrink-0" />}
        {extracting && <Check   className="w-4 h-4 text-emerald-500 shrink-0" />}
      </div>

      {/* Crawl status pill */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f3eeff] border border-[#e4d4ff] transition-all duration-300"
        style={{ opacity: scanning ? 1 : 0, transform: scanning ? "translateY(0)" : "translateY(-4px)" }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#5B2D91] animate-pulse shrink-0" />
        <span className="text-[11px] font-medium text-[#5B2D91] flex-1">{CRAWL_MSGS[crawlIdx]}</span>
        <span className="text-[10px] font-bold text-[#5B2D91] bg-[#e4d4ff] px-1.5 py-0.5 rounded-full">{pagesCount}/4</span>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-[#e2e2e2] shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[#f0f0f0] bg-[#fafafa] flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#aaaaaa]">Brand profile</p>
          <span
            className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 transition-all duration-300"
            style={{ opacity: phase === "done" ? 1 : 0 }}
          >
            <Check className="w-3 h-3" /> Auto-detected
          </span>
        </div>
        <div className="p-4 space-y-3">
          {PROFILE_ROWS.map(({ label, value }, i) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-[11px] text-[#aaaaaa] w-20 shrink-0">{label}</span>
              <div className="flex-1 h-5 flex items-center">
                {rowChars[i] > 0 ? (
                  <span className="text-[13px] font-semibold text-[#0a0a0a]">
                    {value.slice(0, rowChars[i])}
                    {rowChars[i] < value.length && (
                      <span className="inline-block w-[2px] h-[13px] bg-[#5B2D91] ml-0.5 align-middle" />
                    )}
                  </span>
                ) : (
                  <div className="w-full h-3 rounded-md bg-[#f0f0f0]" />
                )}
              </div>
              <div
                className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 transition-all duration-200"
                style={{
                  opacity:   rowChars[i] >= value.length ? 1 : 0,
                  transform: rowChars[i] >= value.length ? "scale(1)" : "scale(0.4)",
                }}
              >
                <Check className="w-2.5 h-2.5 text-emerald-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 02: Prompt fired → per-model streaming responses ─────────────────────

const PROMPT_ROUNDS = [
  {
    prompt: "Best tool for async team knowledge sharing?",
    responses: [
      { domain: "chatgpt.com",       name: "ChatGPT",    text: "YourApp is excellent for async teams…" },
      { domain: "claude.ai",         name: "Claude",     text: "Teams often prefer YourApp because…"   },
      { domain: "gemini.google.com", name: "Gemini",     text: "I'd suggest YourApp — it handles…"     },
      { domain: "perplexity.ai",     name: "Perplexity", text: "Sources show YourApp ranks #2 for…"    },
    ],
  },
  {
    prompt: "Which tools do fast-growing startups use?",
    responses: [
      { domain: "chatgpt.com",       name: "ChatGPT",    text: "For growing teams, YourApp and Notion…" },
      { domain: "claude.ai",         name: "Claude",     text: "Popular picks include YourApp, which…"  },
      { domain: "gemini.google.com", name: "Gemini",     text: "YourApp tops most startup tool lists…"  },
      { domain: "perplexity.ai",     name: "Perplexity", text: "YourApp is frequently cited in posts…"  },
    ],
  },
];

export function VisualStep02() {
  const [roundIdx,    setRoundIdx]    = useState(0);
  const [promptChars, setPromptChars] = useState(0);
  const [activeModel, setActiveModel] = useState<number | null>(null);
  const [modelChars,  setModelChars]  = useState([0, 0, 0, 0]);
  const [modelDone,   setModelDone]   = useState([false, false, false, false]);
  const [totalFired,  setTotalFired]  = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      let fired = 0;
      while (alive) {
        for (let r = 0; r < PROMPT_ROUNDS.length && alive; r++) {
          setRoundIdx(r);
          setPromptChars(0);
          setActiveModel(null);
          setModelChars([0, 0, 0, 0]);
          setModelDone([false, false, false, false]);

          const prompt = PROMPT_ROUNDS[r].prompt;
          for (let c = 1; c <= prompt.length && alive; c++) { setPromptChars(c); await sleep(32); }
          await sleep(280);

          for (let m = 0; m < 4 && alive; m++) {
            setActiveModel(m);
            await sleep(260);
            const text = PROMPT_ROUNDS[r].responses[m].text;
            for (let c = 1; c <= text.length && alive; c++) {
              setModelChars(prev => prev.map((v, i) => i === m ? c : v));
              await sleep(18);
            }
            setModelDone(prev => prev.map((v, i) => i === m ? true : v));
            fired++;
            setTotalFired(fired);
            setActiveModel(null);
            await sleep(180);
          }
          await sleep(1200);
        }
      }
    })();
    return () => { alive = false; };
  }, []);

  const round = PROMPT_ROUNDS[roundIdx];
  const TOTAL_PROMPTS = PROMPT_ROUNDS.length * 4;

  return (
    <div className="w-full max-w-[380px] space-y-3">
      {/* Prompt card */}
      <div className="bg-white rounded-xl border border-[#e2e2e2] shadow-sm px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-[#5B2D91] shrink-0 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B2D91]">Firing prompt</span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="h-1 w-16 bg-[#f0f0f0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5B2D91] rounded-full transition-all duration-500"
                style={{ width: `${(totalFired / TOTAL_PROMPTS) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-[#aaaaaa] tabular-nums">{totalFired}/{TOTAL_PROMPTS}</span>
          </div>
        </div>
        <p className="text-[13px] font-semibold text-[#0a0a0a] font-mono leading-snug">
          &ldquo;{round.prompt.slice(0, promptChars)}
          {promptChars < round.prompt.length && (
            <span className="inline-block w-[2px] h-[13px] bg-[#5B2D91] ml-0.5 align-middle" />
          )}
          &rdquo;
        </p>
      </div>

      {/* Model response rows */}
      <div className="bg-white rounded-xl border border-[#e2e2e2] shadow-sm overflow-hidden divide-y divide-[#f5f5f5]">
        {round.responses.map(({ domain, name, text }, i) => {
          const isActive = activeModel === i;
          const isDone   = modelDone[i];
          return (
            <div
              key={name}
              className={`flex items-start gap-3 px-4 py-3 transition-all duration-200 ${isActive ? "bg-[#fdfcff]" : ""}`}
              style={{ borderLeft: isActive ? "2px solid #5B2D91" : "2px solid transparent" }}
            >
              <img
                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                width={20} height={20} className="rounded-md shrink-0 mt-0.5" alt={name}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-[#0a0a0a]">{name}</p>
                <p className="text-[11px] leading-snug mt-0.5 font-mono text-[#6b6b6b]">
                  {modelChars[i] > 0 ? (
                    <>
                      {text.slice(0, modelChars[i])}
                      {isActive && <span className="inline-block w-[2px] h-[11px] bg-[#5B2D91] ml-0.5 align-middle" />}
                    </>
                  ) : isActive ? (
                    <span className="flex gap-1 items-center h-4">
                      {[0, 150, 300].map((d) => (
                        <span key={d} className="w-1 h-1 rounded-full bg-[#5B2D91] animate-bounce"
                          style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </span>
                  ) : (
                    <span className="text-[#cccccc]">Waiting…</span>
                  )}
                </p>
              </div>
              <div className="shrink-0 mt-0.5">
                {isDone ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <Check className="w-3 h-3 text-emerald-500" />
                  </div>
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 text-[#5B2D91] animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-[#e8e8e8]" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 03: Score reveal + per-model hits + fixes sliding in ─────────────────

const PREV_SCORE   = 60;
const TARGET_SCORE = 72;

const LLM_HITS = [
  { domain: "chatgpt.com",       name: "ChatGPT",    hits: 8, total: 10 },
  { domain: "claude.ai",         name: "Claude",     hits: 7, total: 10 },
  { domain: "gemini.google.com", name: "Gemini",     hits: 6, total: 10 },
  { domain: "perplexity.ai",     name: "Perplexity", hits: 4, total: 10 },
];

const FIX_ITEMS = [
  { text: "Listicles Generator", badge: "Generate", impact: "+12%" },
  { text: "llms.txt Generator",  badge: "Generate", impact: "+8%"  },
  { text: "Comparison Pages",    badge: "Create",   impact: "+6%"  },
  { text: "Reddit Threads",      badge: "Engage",   impact: "+5%"  },
];

export function VisualStep03() {
  const [score,    setScore]    = useState(PREV_SCORE);
  const [barsIn,   setBarsIn]   = useState(false);
  const [fixes,    setFixes]    = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      while (alive) {
        setScore(PREV_SCORE); setBarsIn(false); setFixes(0);
        await sleep(600);
        setBarsIn(true);

        const STEPS = 65;
        for (let i = 1; i <= STEPS && alive; i++) {
          const ease = 1 - Math.pow(1 - i / STEPS, 3);
          setScore(Math.round(PREV_SCORE + ease * (TARGET_SCORE - PREV_SCORE)));
          await sleep(20);
        }
        await sleep(350);

        for (let i = 1; i <= FIX_ITEMS.length && alive; i++) {
          setFixes(i); await sleep(360);
        }
        await sleep(3000);
      }
    })();
    return () => { alive = false; };
  }, []);

  const R = 38;
  const circ = 2 * Math.PI * R;
  const offset = circ - (score / 100) * circ;
  const ringColor = score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const delta = score - PREV_SCORE;

  return (
    <div className="w-full max-w-[380px] space-y-3">
      {/* Score card */}
      <div className="bg-white rounded-xl border border-[#e2e2e2] shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-[#5B2D91]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B2D91]">AI Visibility Score</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +{delta} this week
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Animated ring */}
          <div className="relative shrink-0">
            <svg width="92" height="92" className="-rotate-90">
              <circle cx="46" cy="46" r={R} fill="none" stroke="#f0f0f0" strokeWidth="7" />
              <circle cx="46" cy="46" r={R} fill="none" stroke={ringColor} strokeWidth="7"
                strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 20ms linear, stroke 500ms ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[26px] font-black text-[#0a0a0a] tabular-nums leading-none">{score}</span>
              <span className="text-[9px] text-[#aaaaaa] font-bold">/100</span>
            </div>
          </div>

          {/* Per-model hit bars */}
          <div className="flex-1 space-y-2">
            {LLM_HITS.map(({ domain, name, hits, total }, i) => (
              <div key={name} className="flex items-center gap-2">
                <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                  width={14} height={14} className="rounded-sm shrink-0" alt="" />
                <div className="flex-1 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: barsIn ? `${(hits / total) * 100}%` : "0%",
                      background: ringColor,
                      transitionDelay: `${i * 90}ms`,
                    }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-[#6b6b6b] w-8 text-right tabular-nums">{hits}/{total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixes card */}
      <div className="bg-white rounded-xl border border-[#e2e2e2] shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[#f0f0f0] bg-[#fafafa] flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#aaaaaa]">Recommended fixes</p>
          <span className="text-[10px] font-bold text-[#5B2D91]">{fixes}/{FIX_ITEMS.length} applied</span>
        </div>
        <div className="divide-y divide-[#f5f5f5]">
          {FIX_ITEMS.map(({ text, badge, impact }, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-2.5"
              style={{
                opacity:   i < fixes ? 1 : 0.18,
                transform: i < fixes ? "translateX(0)" : "translateX(-10px)",
                transition: "opacity 0.35s ease, transform 0.35s ease",
              }}
            >
              <div className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center border transition-all duration-200 ${
                i < fixes ? "bg-emerald-50 border-emerald-200 scale-100" : "border-[#e8e8e8] scale-75"
              }`}>
                {i < fixes && <Check className="w-2.5 h-2.5 text-emerald-500" />}
              </div>
              <span className="text-[12px] text-[#0a0a0a] font-medium flex-1">{text}</span>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full shrink-0">{impact}</span>
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-[#f3eeff] text-[#5B2D91] border border-[#e4d4ff] shrink-0">{badge}</span>
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
    panelBg: "linear-gradient(135deg, #f3eeff 0%, #e8d8ff 100%)",
    heading: "Tell us about your brand",
    description: "Paste your website URL. Comly automatically extracts your brand name, category, target users, competitors and use cases. Confirm or edit in seconds.",
    Visual: VisualStep01,
  },
  {
    num: "02",
    visualOnLeft: false,
    panelBg: "linear-gradient(135deg, #ede0ff 0%, #d4b8ff 100%)",
    heading: "We run the AI audit",
    description: "Our engine generates targeted prompts and fires them at ChatGPT, Claude, Gemini and Perplexity. We record every mention, position and competitor that appears.",
    Visual: VisualStep02,
  },
  {
    num: "03",
    visualOnLeft: true,
    panelBg: "linear-gradient(135deg, #fce8ff 0%, #f0c4ff 100%)",
    heading: "Score, fix, and get cited",
    description: "See your visibility score and prompts hit across all 4 LLMs. Use built-in tools — Listicles, llms.txt, Comparison Pages — then engage on Reddit & Quora so AI starts recommending you.",
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
        <p className="text-[11px] font-bold tracking-widest uppercase text-[#5B2D91] mb-4">HOW IT WORKS</p>
        <h2 className="text-[28px] sm:text-[42px] font-bold tracking-tight text-[#0a0a0a]">How Comly works</h2>
        <p className="mt-3 text-base sm:text-lg text-[#6b6b6b]">3 steps to go from invisible to recommended</p>
        <div className="mt-6 sm:mt-8 flex justify-center">
          <ChevronDown className="w-5 h-5 text-[#aaaaaa] animate-bounce" />
        </div>
      </div>

      {/* Mobile: stacked */}
      <div className="md:hidden px-4 pb-14 space-y-5">
        {STEPS.map((step) => {
          const VisualComp = step.Visual;
          return (
            <div key={step.num} className="rounded-3xl overflow-hidden shadow-lg border border-[#e8e8e8]">
              <div className="flex items-start justify-center px-5 pt-8 pb-6" style={{ background: step.panelBg }}>
                <VisualComp />
              </div>
              <div className="bg-white px-6 py-6">
                <p className="text-[10px] font-bold text-[#5B2D91] uppercase tracking-widest mb-2">Step {step.num}</p>
                <h3 className="text-xl font-bold text-[#0a0a0a] mb-2 leading-snug">{step.heading}</h3>
                <p className="text-sm text-[#6b6b6b] leading-relaxed">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: scroll-sticky */}
      <div ref={outerRef} id="how-it-works-steps" style={{ height: `${numPages * 100}vh` }} className="hidden md:block">
        <div className="sticky top-0 h-screen overflow-hidden bg-white">

          {/* Progress dots */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
            {STEPS.map((_, i) => (
              <div key={i} className="rounded-full transition-all duration-500"
                style={{
                  width:      currentPage === i + 1 ? "28px" : "8px",
                  height:     "8px",
                  background: currentPage === i + 1 ? "#0a0a0a" : "rgba(0,0,0,0.16)",
                }}
              />
            ))}
          </div>

          {STEPS.map((step, i) => {
            const idx        = i + 1;
            const isActive   = currentPage === idx;
            const leftTrans  = isActive ? "translateY(0)" : "translateY(100%)";
            const rightTrans = isActive ? "translateY(0)" : "translateY(-100%)";
            const VisualComp = step.Visual;

            const textPanel = (
              <div className="flex flex-col items-start justify-center h-full px-10 py-8 md:px-14 lg:px-20 bg-white">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#5B2D91] mb-4">Step {step.num}</p>
                <h3 className="text-3xl md:text-4xl lg:text-[46px] font-bold mb-5 leading-tight text-[#0a0a0a]">
                  {step.heading}
                </h3>
                <p className="text-base md:text-[17px] text-[#6b6b6b] leading-relaxed max-w-sm">
                  {step.description}
                </p>
              </div>
            );

            const visualPanel = (
              <div className="flex items-center justify-center h-full px-10 py-12 md:px-14 lg:px-16"
                style={{ background: step.panelBg }}>
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
