"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Loader2, Globe, User, Sparkles, Zap,
  ChevronLeft, ChevronRight, RotateCw, Bookmark,
  Building2, Tag, Users, Trophy, Search, Radio,
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
      <div className="rounded-xl border border-[#c8c8c8] overflow-hidden" style={{ boxShadow: "0 20px 60px rgba(91,45,145,0.28), 0 6px 20px rgba(0,0,0,0.10)" }}>
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
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${url}&sz=32`}
                    width={20} height={20} className="rounded-md shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
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
        { Icon: Trophy,     label: "Competitors", value: (profile.competitors ?? []).slice(0, 3).join(", ") || "—" },
        { Icon: Zap,        label: "Use cases",   value: (profile.main_use_cases ?? []).slice(0, 2).join(", ") || "—" },
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
          boxShadow: "0 0 0 4px rgba(91,45,145,0.08), 0 16px 50px rgba(91,45,145,0.22), 0 4px 16px rgba(0,0,0,0.08)",
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

// ── STEP 3 — Web Hunt ───────────────────────────────────────────────────────

function PromptsAnimation({ profile }: { profile: BrandProfile | null }) {
  const brand      = profile?.brand_name ?? "Your Brand";
  const competitor = (profile?.competitors ?? [])[0] ?? "a competitor";

  const SOURCES = [
    { domain: "reddit.com",           label: "Reddit",       relevant: 23 },
    { domain: "quora.com",            label: "Quora",        relevant: 11 },
    { domain: "g2.com",               label: "G2",           relevant:  8 },
    { domain: "producthunt.com",      label: "Product Hunt", relevant:  6 },
    { domain: "news.ycombinator.com", label: "Hacker News",  relevant:  9 },
    { domain: "trustpilot.com",       label: "Trustpilot",   relevant:  4 },
  ];

  const MENTIONS = [
    { text: `"What's the best alternative to ${competitor}?"`,              source: "Reddit · r/SaaS",      tag: "gap"        },
    { text: `"${brand} keeps coming up in every thread I read"`,            source: "Hacker News",           tag: "mention"    },
    { text: `"ChatGPT recommended ${competitor} three times this week"`,    source: "Quora",                 tag: "competitor" },
    { text: `"Tried ${brand} — pretty solid for our use case"`,             source: "G2 Review",             tag: "mention"    },
    { text: `"Why doesn't AI ever mention ${brand} in this category?"`,     source: "Reddit · r/startups",   tag: "gap"        },
  ];

  const [scannedCount, setScannedCount] = useState(0);
  const [mentionCount, setMentionCount] = useState(0);
  const [totalCount,   setTotalCount]   = useState(0);
  const [done,         setDone]         = useState(false);

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = [];
    SOURCES.forEach((_, i) => ts.push(setTimeout(() => setScannedCount(i + 1), 300 + i * 550)));
    MENTIONS.forEach((_, i) => ts.push(setTimeout(() => setMentionCount(i + 1), 600 + i * 480)));
    ts.push(setTimeout(() => setDone(true), 3800));

    const start = Date.now();
    const iv = setInterval(() => {
      const elapsed = Date.now() - start;
      setTotalCount(Math.min(Math.floor(elapsed / 1.9), 1867));
      if (elapsed >= 3600) clearInterval(iv);
    }, 30);

    return () => { ts.forEach(clearTimeout); clearInterval(iv); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      key="hunting"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#5B2D91]/10 flex items-center justify-center">
            <Radio className="w-3.5 h-3.5 text-[#5B2D91]" />
          </div>
          <span className="text-[14px] font-bold text-[#0a0a0a]">Wisp is scanning the web for you</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[#5B2D91] font-semibold bg-[#f3eeff] px-2.5 py-1 rounded-full">
          {!done && <Loader2 className="w-3 h-3 animate-spin" />}
          {done && <Check className="w-3 h-3" />}
          <span>{totalCount.toLocaleString()} pages scanned</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Sources */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#bbbbbb] mb-2">Sources checked</p>
          <div className="space-y-1.5">
            {SOURCES.map((s, i) => {
              const isDone   = scannedCount > i;
              const isActive = scannedCount === i;
              return (
                <div
                  key={s.domain}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 border transition-all duration-300 ${
                    isDone   ? "bg-white border-[#efefef]" :
                    isActive ? "bg-[#f3eeff] border-[#c4a0f0]" :
                               "bg-[#fafafa] border-[#f5f5f5] opacity-40"
                  }`}
                >
                  <img src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=32`} width={14} height={14} className="rounded-sm shrink-0" alt="" />
                  <span className="text-[11px] font-medium text-[#0a0a0a] flex-1">{s.label}</span>
                  {isDone ? (
                    <span className="text-[10px] font-bold text-emerald-600">{s.relevant} found</span>
                  ) : isActive ? (
                    <Loader2 className="w-3 h-3 text-[#5B2D91] animate-spin shrink-0" />
                  ) : (
                    <span className="text-[10px] text-[#cccccc]">—</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live mention feed */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#bbbbbb] mb-2">Live mentions</p>
          <div className="space-y-2">
            <AnimatePresence>
              {MENTIONS.slice(0, mentionCount).map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.22 }}
                  className="bg-white rounded-lg border border-[#f0f0f0] px-3 py-2 shadow-sm"
                >
                  <p className="text-[11px] text-[#0a0a0a] leading-snug line-clamp-2">{m.text}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px] text-[#aaaaaa]">{m.source}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      m.tag === "gap"        ? "bg-red-50 text-red-400"          :
                      m.tag === "competitor" ? "bg-orange-50 text-orange-500"    :
                                              "bg-emerald-50 text-emerald-600"
                    }`}>
                      {m.tag === "gap" ? "Gap" : m.tag === "competitor" ? "Competitor" : "Mention"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── STEP 4 — AI Visibility Test ────────────────────────────────────────────

function FiringAnimation({ profile }: { profile: BrandProfile | null }) {
  const brand    = profile?.brand_name ?? "Your Brand";
  const category = profile?.category   ?? "productivity tools";

  const MODELS = [
    { name: "ChatGPT",    domain: "chatgpt.com",        mentioned: false },
    { name: "Perplexity", domain: "perplexity.ai",      mentioned: false },
    { name: "Gemini",     domain: "gemini.google.com",  mentioned: false },
    { name: "Claude",     domain: "claude.ai",           mentioned: true  },
  ];

  const [tested,  setTested]  = useState(0);
  const [score,   setScore]   = useState(0);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = [];
    MODELS.forEach((_, i) => ts.push(setTimeout(() => setTested(i + 1), 600 + i * 1100)));
    const finishAt = 600 + MODELS.length * 1100 + 300;
    ts.push(setTimeout(() => {
      setAllDone(true);
      let s = 0;
      const iv = setInterval(() => {
        s++;
        setScore(s);
        if (s >= 34) clearInterval(iv);
      }, 22);
    }, finishAt));
    return () => ts.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      key="testing"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-full bg-[#5B2D91]/10 flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-[#5B2D91]" />
        </div>
        <span className="text-[14px] font-bold text-[#0a0a0a]">Wisp is testing your AI visibility</span>
      </div>

      {/* Query being tested */}
      <div className="bg-[#fafafa] border border-[#efefef] rounded-xl px-4 py-2.5 mb-5 flex items-center gap-2">
        <span className="text-[10px] text-[#aaaaaa] font-medium shrink-0 uppercase tracking-wide">Query</span>
        <span className="text-[12px] font-medium text-[#0a0a0a] italic">&ldquo;Best {category} tools for teams?&rdquo;</span>
      </div>

      {/* AI model cards 2×2 */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {MODELS.map((m, i) => {
          const isTested = tested > i;
          const isActive = tested === i;
          return (
            <div
              key={m.name}
              className={`rounded-xl border p-4 transition-all duration-400 ${
                isTested
                  ? m.mentioned
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-red-50/60 border-red-100"
                  : isActive
                    ? "bg-[#f3eeff] border-[#5B2D91]/30"
                    : "bg-[#fafafa] border-[#f0f0f0] opacity-50"
              }`}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${m.domain}&sz=32`}
                  width={20} height={20}
                  className="rounded-md shrink-0"
                  alt={m.name}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <span className="text-[13px] font-semibold text-[#0a0a0a] flex-1">{m.name}</span>
                {isActive && <Loader2 className="w-3.5 h-3.5 text-[#5B2D91] animate-spin" />}
              </div>
              {isTested && (
                <motion.p
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-[11px] font-semibold ${m.mentioned ? "text-emerald-600" : "text-red-400"}`}
                >
                  {m.mentioned ? `✓ ${brand} mentioned` : `✗ ${brand} not found`}
                </motion.p>
              )}
              {!isTested && !isActive && (
                <p className="text-[11px] text-[#cccccc]">Queued…</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Score reveal */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#5B2D91]/20 rounded-xl px-5 py-4 flex items-center gap-5"
            style={{ boxShadow: "0 0 0 4px rgba(91,45,145,0.06), 0 8px 28px rgba(91,45,145,0.12)" }}
          >
            <div className="text-center shrink-0">
              <p className="text-[42px] font-black text-[#5B2D91] leading-none">{score}</p>
              <p className="text-[10px] text-[#aaaaaa] font-medium">/ 100</p>
            </div>
            <div className="h-10 w-px bg-[#f0f0f0] shrink-0" />
            <div>
              <p className="text-[15px] font-bold text-[#0a0a0a]">AI Visibility Score</p>
              <p className="text-[12px] text-[#6b7280] mt-0.5 leading-relaxed">
                {brand} appears in 1 of 4 AI engines. Significant gaps found — Wisp is building your report.
              </p>
            </div>
            <div className="ml-auto">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-orange-500 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                Low visibility
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Step Indicator ───────────────────────────────────────────────────────────

const STEP_DEFS = [
  { label: "Reading", Icon: Globe },
  { label: "Mapping", Icon: User },
  { label: "Hunting", Icon: Search },
  { label: "Scoring", Icon: Zap },
];

const phaseToStep: Record<LoadingPhase, number> = {
  scraping: 1,
  extracting: 2,
  prompts: 3,
  firing: 4,
};

const stepDescriptions: Record<LoadingPhase, string> = {
  scraping: "Step 1 of 4 · Wisp is reading your website",
  extracting: "Step 2 of 4 · Wisp is mapping your brand",
  prompts: "Step 3 of 4 · Wisp is hunting for mentions across the web",
  firing: "Step 4 of 4 · Wisp is testing your AI visibility",
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
    <div className="min-h-screen bg-[#ddd5f5] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-[820px]">
        {/* Frame */}
        <div className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden" style={{ boxShadow: "0 25px 60px rgba(91,45,145,0.28), 0 8px 24px rgba(91,45,145,0.16), 0 2px 8px rgba(0,0,0,0.08)" }}>
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

