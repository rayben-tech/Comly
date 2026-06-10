"use client";

import React, { useState, useEffect, useRef } from "react";
import { Globe, Check, ChevronDown, Loader2, TrendingUp } from "lucide-react";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ── Step 01: paste URL → Wisp reads brand ─────────────────────────────────────

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
      <path fillRule="evenodd" clipRule="evenodd"
        d="M0 0V15.5L3.5 12L6 18L8.5 17L6 11H11.5L0 0Z" fill="white" />
      <path d="M0 0V15.5L3.5 12L6 18L8.5 17L6 11H11.5L0 0Z"
        stroke="#111111" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" />
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
      <div className="absolute z-20 pointer-events-none"
        style={{
          top: "12px", left: showCursor ? "88px" : "330px",
          opacity: showCursor ? 1 : 0,
          transform: isClicking ? "scale(0.8)" : "scale(1)",
          transition: "left 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.18s ease, transform 0.1s ease",
        }}>
        <CursorIcon />
      </div>

      <div className={`bg-white rounded-xl border shadow-sm flex items-center gap-2.5 px-4 py-3 transition-all duration-200 ${
        isClicking ? "border-[#5B2D91] shadow-[0_0_0_5px_rgba(91,45,145,0.18)]"
        : isFocused ? "border-[#5B2D91] shadow-[0_0_0_3px_rgba(91,45,145,0.08)]"
        : "border-[#e2e2e2]"}`}>
        <Globe className="w-4 h-4 text-[#bbbbbb] shrink-0" />
        <span className="flex-1 text-[13px] font-mono tracking-tight">
          {showUrl ? (
            <span className="text-[#0a0a0a]">
              {PASTED_URL}
              {phase === "pasted" && <span className="inline-block w-[2px] h-[14px] bg-[#5B2D91] ml-0.5 align-middle animate-pulse" />}
            </span>
          ) : (
            <span className="text-[#cccccc]">Paste your URL here…</span>
          )}
        </span>
        {scanning   && <Loader2 className="w-4 h-4 text-[#5B2D91] animate-spin shrink-0" />}
        {extracting && <Check   className="w-4 h-4 text-emerald-500 shrink-0" />}
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f3eeff] border border-[#e4d4ff] transition-all duration-300"
        style={{ opacity: scanning ? 1 : 0, transform: scanning ? "translateY(0)" : "translateY(-4px)" }}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#5B2D91] animate-pulse shrink-0" />
        <span className="text-[11px] font-medium text-[#5B2D91] flex-1">{CRAWL_MSGS[crawlIdx]}</span>
        <span className="text-[10px] font-bold text-[#5B2D91] bg-[#e4d4ff] px-1.5 py-0.5 rounded-full">{pagesCount}/4</span>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e2e2] shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[#f0f0f0] bg-[#fafafa] flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#aaaaaa]">Brand profile</p>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 transition-all duration-300"
            style={{ opacity: phase === "done" ? 1 : 0 }}>
            <Check className="w-3 h-3" /> Wisp ready
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
                    {rowChars[i] < value.length && <span className="inline-block w-[2px] h-[13px] bg-[#5B2D91] ml-0.5 align-middle" />}
                  </span>
                ) : (
                  <div className="w-full h-3 rounded-md bg-[#f0f0f0]" />
                )}
              </div>
              <div className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 transition-all duration-200"
                style={{ opacity: rowChars[i] >= value.length ? 1 : 0, transform: rowChars[i] >= value.length ? "scale(1)" : "scale(0.4)" }}>
                <Check className="w-2.5 h-2.5 text-emerald-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 02: Wisp scans sources, finds gaps ───────────────────────────────────

const SOURCES_DEMO = [
  { domain: "reddit.com", label: "r/SaaS",      title: "Best PM tool for remote teams?",           score: 94 },
  { domain: "quora.com",  label: "Quora",        title: "How do async teams avoid status meetings?", score: 88 },
  { domain: "reddit.com", label: "r/startups",   title: "ChatGPT keeps recommending Notion?",        score: 76 },
];

export function VisualStep02() {
  const [scanCount,     setScanCount]     = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [showGap,       setShowGap]       = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      while (alive) {
        setScanCount(0); setQuestionCount(0); setShowGap(false);

        let s = 0;
        while (s < 847 && alive) {
          s += Math.floor(Math.random() * 22) + 8;
          setScanCount(Math.min(s, 847));
          await sleep(28);
        }

        for (let i = 0; i < SOURCES_DEMO.length && alive; i++) {
          await sleep(550);
          setQuestionCount(i + 1);
        }

        await sleep(700);
        if (alive) setShowGap(true);
        await sleep(3200);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="w-full max-w-[380px] space-y-3">
      <div className="bg-white rounded-xl border border-[#e2e2e2] shadow-sm px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-[#5B2D91] animate-pulse shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B2D91]">Wisp scanning</span>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-[12px] font-bold tabular-nums text-[#0a0a0a]">{scanCount}</span>
            <span className="text-[10px] text-[#aaa]">posts</span>
          </div>
        </div>
        <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
          <div className="h-full bg-[#5B2D91] rounded-full transition-all duration-200"
            style={{ width: `${(scanCount / 847) * 100}%` }} />
        </div>
        <div className="flex gap-2 mt-2.5">
          {[{ domain: "reddit.com" }, { domain: "quora.com" }].map(({ domain }) => (
            <div key={domain} className="flex items-center gap-1.5 bg-[#f5f5f5] rounded-full px-2.5 py-1">
              <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} width={12} height={12} className="rounded-sm" alt="" />
              <span className="text-[10px] text-[#6b6b6b] font-medium">{domain.replace(".com","")}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e2e2] shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 bg-[#fafafa] border-b border-[#f0f0f0] flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#aaaaaa]">Questions found</p>
          <span className="text-[10px] font-bold text-[#5B2D91]">{questionCount}/{SOURCES_DEMO.length}</span>
        </div>
        <div className="divide-y divide-[#f5f5f5]">
          {SOURCES_DEMO.map(({ domain, label, title, score }, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 transition-all duration-400"
              style={{
                opacity: questionCount > i ? 1 : 0.1,
                transform: questionCount > i ? "translateX(0)" : "translateX(-8px)",
              }}>
              <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                width={14} height={14} className="rounded-sm shrink-0 mt-0.5" alt="" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-[#5B2D91] mb-0.5">{label}</p>
                <p className="text-[11px] text-[#0a0a0a] leading-snug">{title}</p>
              </div>
              <span className="text-[11px] font-bold tabular-nums shrink-0 mt-0.5"
                style={{ color: score >= 88 ? "#10b981" : "#f59e0b" }}>{score}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="transition-all duration-500"
        style={{ opacity: showGap ? 1 : 0, transform: showGap ? "translateY(0)" : "translateY(5px)" }}>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-2.5">
          <span className="text-amber-500 text-[14px]">⚠</span>
          <p className="text-[11px] text-amber-700 font-medium leading-snug">3 gaps found — competitors are there, you're not</p>
        </div>
      </div>
    </div>
  );
}

// ── Step 03: Wisp answers → AI cites → score climbs ──────────────────────────

const REPLY_TEXT = "Been in this exact situation — tried 6+ tools before landing on YourBrand for our 14-person team. The async-first design is genuinely different from Notion. No sync meetings just to check status.";

const AI_CITATIONS = [
  { domain: "chatgpt.com",       name: "ChatGPT"    },
  { domain: "perplexity.ai",     name: "Perplexity" },
  { domain: "gemini.google.com", name: "Gemini"     },
];

const PREV_SCORE   = 58;
const TARGET_SCORE = 72;

export function VisualStep03() {
  const [phase,      setPhase]      = useState<"idle"|"typing"|"posted"|"citing"|"scored">("idle");
  const [replyChars, setReplyChars] = useState(0);
  const [citeCount,  setCiteCount]  = useState(0);
  const [score,      setScore]      = useState(PREV_SCORE);

  useEffect(() => {
    let alive = true;
    (async () => {
      while (alive) {
        setPhase("idle"); setReplyChars(0); setCiteCount(0); setScore(PREV_SCORE);
        await sleep(700);

        setPhase("typing");
        for (let c = 1; c <= REPLY_TEXT.length && alive; c++) {
          setReplyChars(c); await sleep(18);
        }

        setPhase("posted");
        await sleep(700);

        setPhase("citing");
        for (let i = 1; i <= AI_CITATIONS.length && alive; i++) {
          await sleep(750); if (alive) setCiteCount(i);
        }
        await sleep(400);

        setPhase("scored");
        const steps = 50;
        for (let i = 1; i <= steps && alive; i++) {
          const ease = 1 - Math.pow(1 - i / steps, 3);
          setScore(Math.round(PREV_SCORE + ease * (TARGET_SCORE - PREV_SCORE)));
          await sleep(22);
        }

        await sleep(3200);
      }
    })();
    return () => { alive = false; };
  }, []);

  const R    = 26;
  const circ = 2 * Math.PI * R;
  const offset = circ - (score / 100) * circ;
  const delta = score - PREV_SCORE;

  return (
    <div className="w-full max-w-[380px] space-y-3">
      <div className="bg-white rounded-xl border border-[#e2e2e2] shadow-sm px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <span className={`w-2 h-2 rounded-full shrink-0 transition-colors duration-300 ${
            phase === "typing" ? "bg-[#5B2D91] animate-pulse"
            : phase === "posted" || phase === "citing" || phase === "scored" ? "bg-emerald-500"
            : "bg-[#e0e0e0]"}`} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B2D91]">
            {phase === "idle" ? "Wisp standby"
            : phase === "typing" ? "Wisp writing reply..."
            : "Reply posted"}
          </span>
          {(phase === "posted" || phase === "citing" || phase === "scored") && (
            <span className="ml-auto text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              Live on Reddit
            </span>
          )}
        </div>
        <p className="text-[11px] text-[#6b6b6b] font-mono leading-relaxed min-h-[52px]">
          {replyChars > 0
            ? <>{REPLY_TEXT.slice(0, replyChars)}{phase === "typing" && <span className="inline-block w-[2px] h-[11px] bg-[#5B2D91] ml-0.5 align-middle" />}</>
            : <span className="text-[#ccc] italic">Crafting answer…</span>}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e2e2] shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 bg-[#fafafa] border-b border-[#f0f0f0]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#aaaaaa]">AI models now citing you</p>
        </div>
        <div className="divide-y divide-[#f5f5f5]">
          {AI_CITATIONS.map(({ domain, name }, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 transition-all duration-300"
              style={{
                opacity:   citeCount > i ? 1 : 0.12,
                transform: citeCount > i ? "translateX(0)" : "translateX(8px)",
              }}>
              <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                width={16} height={16} className="rounded-sm shrink-0" alt="" />
              <span className="text-[12px] font-semibold text-[#0a0a0a] flex-1">{name}</span>
              {citeCount > i
                ? <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">Citing you</span>
                : <span className="text-[9px] text-[#ccc]">Waiting…</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e2e2] shadow-sm px-4 py-3 flex items-center gap-4">
        <div className="relative shrink-0">
          <svg width="64" height="64" className="-rotate-90">
            <circle cx="32" cy="32" r={R} fill="none" stroke="#f0f0f0" strokeWidth="5" />
            <circle cx="32" cy="32" r={R} fill="none" stroke="#10b981" strokeWidth="5"
              strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 22ms linear" }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[18px] font-black text-[#0a0a0a] tabular-nums leading-none">{score}</span>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#5B2D91] mb-1">AI Visibility Score</p>
          <p className="text-[13px] font-semibold">
            {phase === "scored"
              ? <span className="text-emerald-600 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> +{delta} this week</span>
              : <span className="text-[#aaa]">Updating…</span>}
          </p>
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
    heading: "Connect your brand",
    description: "Paste your website URL. Wisp reads your homepage and auto-detects your brand, category, audience and competitors. No forms, no manual setup — ready in seconds.",
    Visual: VisualStep01,
  },
  {
    num: "02",
    visualOnLeft: false,
    panelBg: "linear-gradient(135deg, #ede0ff 0%, #d4b8ff 100%)",
    heading: "Wisp hunts for your gaps",
    description: "Wisp scans Reddit, Quora and other sources daily. It finds the exact questions your audience is asking — where competitors already have a presence and you don't.",
    Visual: VisualStep02,
  },
  {
    num: "03",
    visualOnLeft: true,
    panelBg: "linear-gradient(135deg, #fce8ff 0%, #f0c4ff 100%)",
    heading: "Wisp answers, AI cites you",
    description: "Wisp crafts genuine, helpful replies and posts them on Reddit. Within 24-48 hours, ChatGPT, Perplexity and Gemini start pulling those sources — and recommending your brand.",
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
      <div className="text-center pt-16 sm:pt-24 pb-8 sm:pb-10 px-6 bg-transparent">
        <p className="text-[11px] font-bold tracking-widest uppercase text-[#5B2D91] mb-4">HOW IT WORKS</p>
        <h2 className="text-[28px] sm:text-[42px] font-bold tracking-tight text-[#0a0a0a]">How Wisp works</h2>
        <p className="mt-3 text-base sm:text-lg text-[#6b6b6b]">3 steps to get your brand inside every AI answer</p>
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
        <div className="sticky top-0 h-screen overflow-hidden bg-[#f5eeff]">

          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
            {STEPS.map((_, i) => (
              <div key={i} className="rounded-full transition-all duration-500"
                style={{
                  width:      currentPage === i + 1 ? "28px" : "8px",
                  height:     "8px",
                  background: currentPage === i + 1 ? "#0a0a0a" : "rgba(0,0,0,0.16)",
                }} />
            ))}
          </div>

          {STEPS.map((step, i) => {
            const idx        = i + 1;
            const isActive   = currentPage === idx;
            const leftTrans  = isActive ? "translateY(0)" : "translateY(100%)";
            const rightTrans = isActive ? "translateY(0)" : "translateY(-100%)";
            const VisualComp = step.Visual;

            const textPanel = (
              <div className="flex flex-col items-start justify-center h-full px-10 py-8 md:px-14 lg:px-20 bg-transparent">
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
                <div className="absolute top-0 left-0 w-[42%] h-full transition-transform duration-[850ms] ease-in-out"
                  style={{ transform: leftTrans }}>
                  {step.visualOnLeft ? visualPanel : textPanel}
                </div>
                <div className="absolute top-0 left-[42%] w-[58%] h-full transition-transform duration-[850ms] ease-in-out"
                  style={{ transform: rightTrans }}>
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
