"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Loader2, Globe, User, Sparkles, Zap,
  ChevronLeft, ChevronRight, RotateCw, Bookmark,
  Building2, Tag, Users, Trophy,
} from "lucide-react";
import { BrandProfile } from "@/types";
import { PROMPT_MODELS } from "@/lib/prompt-models";

// ── Types ────────────────────────────────────────────────────────────────────

export type LoadingPhase = "scraping" | "extracting" | "prompts" | "firing";

interface AuditLoadingProps {
  phase: LoadingPhase;
  url: string;
  profile: BrandProfile | null;
  heroData?: { title: string; description: string } | null;
  onReset: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, 22);
    return () => clearInterval(iv);
  }, [started, text]);

  return <span>{displayed}<span className="opacity-0 select-none">|</span></span>;
}

// Reveals words one at a time; each new word starts purple and fades to dark.
function WordRevealText({ text, delay = 0 }: { text: string; delay?: number }) {
  const words = text.split(" ");
  const [visibleCount, setVisibleCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= words.length) clearInterval(iv);
    }, 85);
    return () => clearInterval(iv);
  }, [started, words.length]);

  return (
    <span>
      {words.map((word, i) =>
        i < visibleCount ? (
          <motion.span
            key={`w${i}`}
            initial={{ color: "#5B2D91" }}
            animate={{ color: "#0a0a0a" }}
            transition={{ duration: 0.65 }}
          >
            {word}{i < words.length - 1 ? " " : ""}
          </motion.span>
        ) : (
          <span key={`w${i}`} style={{ visibility: "hidden" }}>
            {word}{i < words.length - 1 ? " " : ""}
          </span>
        )
      )}
    </span>
  );
}

// ── Constants ────────────────────────────────────────────────────────────────

const EXTRACTION_PILLS = [
  "Homepage loaded",
  "Brand signal detected",
  "Category identified",
  "Audience mapped",
];

// ── STEP 1 — Scraping ────────────────────────────────────────────────────────

function ScrapingAnimation({ url, heroData }: { url: string; heroData?: { title: string; description: string } | null }) {
  const [showContent, setShowContent] = useState(false);
  const [scanPct, setScanPct] = useState(0);
  const [pills, setPills] = useState<{ id: number; text: string }[]>([]);

  const brandSlug = (() => {
    try { return new URL(url).hostname.replace("www.", "").split(".")[0]; }
    catch { return url.replace(/^https?:\/\//, "").split(".")[0]; }
  })();
  const brandLabel = brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1);

  const h1Text = heroData?.title ? heroData.title.slice(0, 72) : `${brandLabel} — Built for modern teams`;
  const subText = heroData?.description ? heroData.description.slice(0, 110) : "The all-in-one platform to help your team move faster.";

  // Smooth progress counter 0 → 91% over ~9.5s
  useEffect(() => {
    const start = Date.now();
    const dur = 9500;
    const iv = setInterval(() => {
      const pct = Math.min(Math.floor(((Date.now() - start) / dur) * 91), 91);
      setScanPct(pct);
      if (pct >= 91) clearInterval(iv);
    }, 80);
    return () => clearInterval(iv);
  }, []);

  // Reveal when heroData arrives (min 1.5s), hard fallback at 3s
  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!heroData) return;
    const t = setTimeout(() => setShowContent(true), 1500);
    return () => clearTimeout(t);
  }, [heroData]);

  // Floating pills after content shows (one every 800ms, starting 300ms after reveal)
  useEffect(() => {
    if (!showContent) return;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let count = 0;
    const fire = () => {
      if (count >= EXTRACTION_PILLS.length) return;
      const id = count;
      setPills((prev) => [...prev, { id, text: EXTRACTION_PILLS[id] }]);
      count++;
      if (count < EXTRACTION_PILLS.length) {
        const t = setTimeout(fire, 800);
        timeouts.push(t);
      }
    };
    const t = setTimeout(fire, 300);
    timeouts.push(t);
    return () => timeouts.forEach(clearTimeout);
  }, [showContent]);

  return (
    <motion.div
      key="scraping"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {/* Browser mockup */}
      <div className="rounded-xl border border-[#c8c8c8] shadow-2xl overflow-hidden">
        {/* Chrome bar */}
        <div className="bg-[#e8e8e8] border-b border-[#d0d0d0] px-4 py-2.5 flex items-center gap-2.5">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" style={{ boxShadow: "0 0 0 0.5px rgba(0,0,0,0.15)" }} />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" style={{ boxShadow: "0 0 0 0.5px rgba(0,0,0,0.12)" }} />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" style={{ boxShadow: "0 0 0 0.5px rgba(0,0,0,0.12)" }} />
          </div>
          {/* Nav buttons */}
          <div className="flex items-center shrink-0">
            <div className="w-7 h-6 flex items-center justify-center text-[#a0a0a0]">
              <ChevronLeft className="w-4 h-4" />
            </div>
            <div className="w-7 h-6 flex items-center justify-center text-[#c0c0c0]">
              <ChevronRight className="w-4 h-4" />
            </div>
            <div className="w-7 h-6 flex items-center justify-center text-[#6b6b6b]">
              <RotateCw className="w-3.5 h-3.5" />
            </div>
          </div>
          {/* URL bar */}
          <div
            className="flex-1 flex items-center gap-2 bg-white border border-[#d0d0d0] rounded-md px-3 h-7"
            style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06)" }}
          >
            <Globe className="w-3 h-3 text-[#888] shrink-0" />
            <span className="text-[11px] text-[#4a4a4a] truncate flex-1 font-medium">{url}</span>
            <Loader2 className="w-[11px] h-[11px] text-[#5B2D91] animate-spin shrink-0" />
          </div>
          {/* Bookmark */}
          <div className="w-6 flex items-center justify-center text-[#a0a0a0] shrink-0">
            <Bookmark className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Browser body */}
        <div className="relative bg-white overflow-hidden">
          <AnimatePresence mode="wait">
            {!showContent ? (
              <motion.div
                key="skel"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
                className="p-5 space-y-4"
              >
                {/* Navbar skeleton */}
                <div className="shimmer-purple h-11 rounded-lg w-full" />
                {/* Hero skeleton */}
                <div className="flex gap-5 py-0.5">
                  <div className="flex-[3] space-y-3 py-1">
                    <div className="shimmer-purple h-4 rounded w-[60%]" />
                    <div className="shimmer-purple h-4 rounded w-[80%]" />
                    <div className="shimmer-purple h-4 rounded w-[40%]" />
                    <div className="shimmer-purple h-9 w-28 rounded-lg mt-2" />
                  </div>
                  <div className="flex-[2]">
                    <div className="shimmer-purple h-[120px] rounded-xl" />
                  </div>
                </div>
                {/* Card skeletons */}
                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="shimmer-purple h-16 rounded-xl" />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="real"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="p-5 space-y-4"
              >
                {/* Fake navbar */}
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="h-11 bg-white border border-[#f0f0f0] rounded-lg flex items-center gap-3 px-4 shadow-sm"
                >
                  <div className="w-5 h-5 rounded-md bg-[#5B2D91] shrink-0" />
                  <span className="text-[13px] font-bold text-[#0a0a0a]">{brandLabel}</span>
                  <div className="flex-1" />
                  {["Product", "Pricing", "Docs"].map((l) => (
                    <span key={l} className="text-[11px] text-[#aaaaaa] font-medium">{l}</span>
                  ))}
                  <div className="w-[72px] h-7 rounded-md bg-[#5B2D91]" />
                </motion.div>

                {/* Hero */}
                <div className="flex gap-5">
                  <div className="flex-[3] space-y-2.5">
                    <div className="text-[14px] font-bold text-[#0a0a0a] leading-snug">
                      <TypewriterText text={h1Text} delay={0.1} />
                    </div>
                    <div className="text-[12px] text-[#6b7280]">
                      <TypewriterText text={subText} delay={0.45} />
                    </div>
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0 }}
                      className="flex items-center gap-2 pt-0.5"
                    >
                      <div className="h-8 w-[116px] rounded-lg bg-[#5B2D91] flex items-center justify-center shrink-0">
                        <span className="text-[11px] text-white font-semibold">Get started free</span>
                      </div>
                      <div className="h-8 w-[80px] rounded-lg border border-[#e5e5e5] flex items-center justify-center shrink-0">
                        <span className="text-[11px] text-[#6b6b6b] font-medium">Learn more</span>
                      </div>
                    </motion.div>
                  </div>
                  <motion.div
                    className="flex-[2]"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35 }}
                  >
                    <div className="h-[120px] rounded-xl bg-gradient-to-br from-[#f3eeff] via-[#e8d5ff] to-[#d9bbff] flex items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-[#5B2D91]/20 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-xl bg-[#5B2D91]" />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: "10k+", label: "Users" },
                    { val: "50+", label: "Integrations" },
                    { val: "99.9%", label: "Uptime" },
                  ].map(({ val, label }, i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + i * 0.12 }}
                      className="bg-[#fafafa] border border-[#f0f0f0] rounded-xl px-3 py-2.5"
                    >
                      <p className="text-[15px] font-bold text-[#0a0a0a]">{val}</p>
                      <p className="text-[11px] text-[#aaaaaa] mt-0.5">{label}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating extraction pills */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {pills.map((pill) => (
              <motion.div
                key={pill.id}
                className="absolute bg-[#5B2D91] text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap"
                style={{ bottom: 20, left: `${8 + pill.id * 22}%` }}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 1, 1, 0], y: [0, -25, -65, -95] }}
                transition={{ duration: 2.8, times: [0, 0.12, 0.65, 1], ease: "easeOut" }}
              >
                {pill.text}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress bar with counter */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-[#6b7280]">Scanning website...</span>
          <span className="text-[11px] font-bold text-[#5B2D91]">{scanPct}%</span>
        </div>
        <div className="h-[3px] bg-[#f3eeff] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#5B2D91] rounded-full"
            style={{ width: `${scanPct}%`, transition: "width 80ms linear" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ── STEP 2 — Profile ─────────────────────────────────────────────────────────

function ProfileAnimation({ profile }: { profile: BrandProfile | null }) {
  const [allDone, setAllDone] = useState(false);

  const ROWS = profile
    ? [
        { Icon: Building2, label: "Brand",       value: profile.brand_name },
        { Icon: Tag,        label: "Category",    value: profile.category },
        { Icon: Users,      label: "Audience",    value: profile.target_users },
        { Icon: Trophy,     label: "Competitors", value: profile.competitors.slice(0, 3).join(", ") },
        { Icon: Zap,        label: "Use cases",   value: profile.main_use_cases.slice(0, 2).join(", ") },
      ]
    : [];

  useEffect(() => {
    if (!profile) return;
    // 5 rows × 0.3s stagger + 0.6s checkmark + 0.3s buffer ≈ 2.4s
    const t = setTimeout(() => setAllDone(true), 2400);
    return () => clearTimeout(t);
  }, [profile]);

  return (
    <motion.div
      key="extracting"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <p className="text-xs font-bold text-[#5B2D91] uppercase tracking-widest">
          Brand profile detected
        </p>
        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.35, 1], opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="w-4 h-4 rounded-full bg-[#5B2D91] flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Card with purple glow border */}
      <div
        className="rounded-xl p-6 bg-white border"
        style={{
          borderColor: "rgba(91,45,145,0.3)",
          boxShadow: "0 0 0 4px rgba(91,45,145,0.05), 0 8px 40px rgba(91,45,145,0.08)",
        }}
      >
        {!profile ? (
          <div className="space-y-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full shimmer shrink-0" />
                <div className="w-16 h-3 shimmer rounded" />
                <div className="flex-1 h-3 shimmer rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {ROWS.map((row, i) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.3, duration: 0.35 }}
                className="flex items-center gap-3"
              >
                {/* Icon in purple circle */}
                <div className="w-7 h-7 rounded-full bg-[#5B2D91]/10 flex items-center justify-center shrink-0">
                  <row.Icon className="w-3.5 h-3.5 text-[#5B2D91]" />
                </div>
                {/* Label */}
                <span className="text-[12px] text-[#6b7280] w-20 shrink-0 font-medium">
                  {row.label}
                </span>
                {/* Value with word-reveal + purple→dark highlight */}
                <span className="text-[13px] font-medium flex-1 leading-snug">
                  <WordRevealText text={row.value} delay={i * 0.3 + 0.12} />
                </span>
                {/* Bouncy purple checkmark */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.35, 1], opacity: 1 }}
                  transition={{ delay: i * 0.3 + 0.6, duration: 0.3, ease: "easeOut" }}
                  className="shrink-0"
                >
                  <div className="w-5 h-5 rounded-full bg-[#5B2D91]/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#5B2D91]" />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── STEP 3 — Prompts ─────────────────────────────────────────────────────────

function PromptsAnimation({ profile }: { profile: BrandProfile | null }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [done, setDone] = useState(false);

  const prompts = profile
    ? [
        `What are the best ${profile.category.toLowerCase()} tools?`,
        `Compare top ${profile.category.toLowerCase()} solutions`,
        `Best tools for ${profile.target_users.split(",")[0]?.trim() ?? "teams"}`,
        `${profile.competitors[0] ?? "top tool"} alternatives`,
        `Is ${profile.brand_name} good for ${profile.main_use_cases[0]?.toLowerCase() ?? "teams"}?`,
        `${profile.brand_name} vs ${profile.competitors[1] ?? "competition"}`,
        `Top ${profile.category.toLowerCase()} recommendations 2024`,
        `${profile.main_use_cases[1] ?? "workflow"} tools for startups`,
        `What is ${profile.brand_name} used for?`,
        `Best ${profile.category.toLowerCase()} for ${profile.target_users.split(",")[0]?.trim() ?? "teams"}`,
      ]
    : Array.from({ length: 11 }, (_, i) => `Generating prompt ${i + 1}...`);

  useEffect(() => {
    let count = 0;
    const iv = setInterval(() => {
      count++;
      setVisibleCount(count);
      if (count >= 11) {
        clearInterval(iv);
        setTimeout(() => setDone(true), 400);
      }
    }, 320);
    return () => clearInterval(iv);
  }, []);

  return (
    <motion.div
      key="prompts"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="flex items-center justify-center gap-2 mb-3 h-6">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.p
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-sm font-bold text-[#5B2D91]"
            >
              11 prompts ready ✓
            </motion.p>
          ) : (
            <motion.div key="loading" exit={{ opacity: 0 }} className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-[#5B2D91] animate-spin" />
              <p className="text-sm text-[#6b7280]">Generating {visibleCount}/11 targeted prompts...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {prompts.map((prompt, i) => (
          <AnimatePresence key={i}>
            {i < visibleCount && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-white border border-[#e5e5e5] rounded-lg p-3 flex items-start gap-2.5 shadow-sm"
              >
                <span className="w-5 h-5 rounded-full bg-[#5B2D91] text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-[11px] text-[#0a0a0a] leading-snug line-clamp-2">{prompt}</p>
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>
    </motion.div>
  );
}

// ── STEP 4 — Firing ──────────────────────────────────────────────────────────

function FiringAnimation({ profile }: { profile: BrandProfile | null }) {
  const [firedCount, setFiredCount] = useState(0);
  const [showResponse, setShowResponse] = useState(false);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    let count = 0;
    const fire = () => {
      if (count >= 11) { setAllDone(true); return; }
      count++;
      setFiredCount(count);
      setShowResponse(true);
      setTimeout(() => setShowResponse(false), 700);
      if (count < 11) setTimeout(fire, 950);
      else setTimeout(() => setAllDone(true), 900);
    };
    const t = setTimeout(fire, 400);
    return () => clearTimeout(t);
  }, []);

  const stackSize = Math.max(0, 11 - firedCount);
  const progress = (firedCount / 11) * 100;

  return (
    <motion.div
      key="firing"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="flex items-center gap-6">
        {/* Left — prompt stack */}
        <div className="flex-1 relative h-44 flex items-center justify-center">
          {Array.from({ length: Math.min(stackSize, 5) }).map((_, i) => (
            <div
              key={`${firedCount}-${i}`}
              className="absolute left-0 right-0 bg-white border border-[#e5e5e5] rounded-lg px-3 py-2.5 text-[11px] text-[#6b7280] shadow-sm"
              style={{
                transform: `translateY(${i * -5}px) scale(${1 - i * 0.025})`,
                zIndex: 5 - i,
                opacity: 1 - i * 0.18,
              }}
            >
              Prompt {firedCount + i + 1} of 11
            </div>
          ))}
          {stackSize === 0 && (
            <div className="text-xs text-[#6b7280] italic">All prompts fired</div>
          )}
        </div>

        {/* Center — animated arrow */}
        <div className="relative w-14 flex items-center justify-center">
          <motion.div
            key={firedCount}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 10, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="absolute flex items-center"
          >
            <div className="h-0.5 w-8 bg-[#5B2D91]" />
            <div className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[6px] border-l-[#5B2D91]" />
          </motion.div>
        </div>

        {/* Right — current model + response */}
        <div className="flex-1 flex flex-col items-center gap-2">
          {(() => {
            const model = PROMPT_MODELS[Math.max(0, firedCount - 1)];
            return (
              <motion.div
                key={model.name}
                animate={firedCount > 0 ? { borderColor: ["#e5e5e5", "#5B2D91", "#e5e5e5"] } : {}}
                transition={{ duration: 0.4 }}
                className="bg-white border border-[#e5e5e5] rounded-xl p-3 w-full text-center"
              >
                <motion.img
                  key={model.domain}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  src={`https://www.google.com/s2/favicons?domain=${model.domain}&sz=32`}
                  alt={model.name}
                  className="w-6 h-6 mx-auto mb-1 rounded"
                />
                <motion.p
                  key={model.name + "-label"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs font-semibold text-[#0a0a0a]"
                >
                  {model.name}
                </motion.p>
              </motion.div>
            );
          })()}


          <div className="h-8 flex items-center justify-center w-full">
            <AnimatePresence>
              {showResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-1.5 text-[11px] text-[#16a34a] bg-green-50 border border-green-200 rounded-lg px-2.5 py-1 w-full justify-center"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] shrink-0" />
                  Response received
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4 space-y-1.5">
        <div className="flex justify-between text-[11px] text-[#6b7280]">
          <span>Firing prompt {Math.min(firedCount + 1, 10)} / 10</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-[#f3eeff] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#5B2D91] rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35 }}
          />
        </div>

        <AnimatePresence>
          {allDone && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm font-semibold text-[#16a34a] pt-1"
            >
              Audit complete! Building your report...
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Step Indicator ───────────────────────────────────────────────────────────

const STEP_DEFS = [
  { label: "Scrape", Icon: Globe },
  { label: "Profile", Icon: User },
  { label: "Prompts", Icon: Sparkles },
  { label: "Audit", Icon: Zap },
];

const phaseToStep: Record<LoadingPhase, number> = {
  scraping: 1,
  extracting: 2,
  prompts: 3,
  firing: 4,
};

const stepDescriptions: Record<LoadingPhase, string> = {
  scraping: "Step 1 of 4 · Reading your website",
  extracting: "Step 2 of 4 · Detecting your brand profile",
  prompts: "Step 3 of 4 · Generating audit prompts",
  firing: "Step 4 of 4 · Firing prompts at AI models",
};

function StepIndicator({ phase }: { phase: LoadingPhase }) {
  const current = phaseToStep[phase];

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-0">
        {STEP_DEFS.map(({ label, Icon }, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < current;
          const isActive = stepNum === current;

          return (
            <div key={label} className="flex items-center">
              <div className="flex items-center gap-1.5">
                {isDone ? (
                  <motion.div
                    initial={{ scale: 0.7 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-[#5B2D91] flex items-center justify-center shrink-0"
                  >
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                ) : isActive ? (
                  <div className="w-5 h-5 rounded-full border-2 border-[#5B2D91] bg-[#f3eeff] flex items-center justify-center shrink-0">
                    <Loader2 className="w-2.5 h-2.5 text-[#5B2D91] animate-spin" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-[#e5e5e5] flex items-center justify-center shrink-0">
                    <Icon className="w-2.5 h-2.5 text-[#c5c5c5]" />
                  </div>
                )}
                <span className={`text-[12px] font-medium ${isDone || isActive ? "text-[#5B2D91]" : "text-[#c5c5c5]"}`}>
                  {label}
                </span>
              </div>

              {i < STEP_DEFS.length - 1 && (
                <div className="w-8 h-0.5 mx-2 bg-[#e5e5e5] overflow-hidden rounded-full">
                  <motion.div
                    className="h-full bg-[#5B2D91] rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: isDone ? "100%" : "0%" }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-[#aaaaaa]">{stepDescriptions[phase]}</p>
    </div>
  );
}

// ── Main Export ──────────────────────────────────────────────────────────────

export function AuditLoadingView({ phase, url, profile, heroData, onReset }: AuditLoadingProps) {
  return (
    <div className="min-h-screen bg-[#f7f7f5] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-[820px]">
        {/* Frame */}
        <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden">
          {/* Frame header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0] bg-[#fafafa]">
            <StepIndicator phase={phase} />
          </div>

          {/* Animation zone */}
          <div className="p-8 min-h-[480px] flex items-center justify-center">
            <div className="w-full">
              <AnimatePresence mode="wait">
                {phase === "scraping"   && <ScrapingAnimation url={url} heroData={heroData} />}
                {phase === "extracting" && <ProfileAnimation profile={profile} />}
                {phase === "prompts"    && <PromptsAnimation profile={profile} />}
                {phase === "firing"     && <FiringAnimation profile={profile} />}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
