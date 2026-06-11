"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Loader2, Globe, User, Zap, Search, Radio, FileText, Sparkles,
  ChevronLeft, ChevronRight, RotateCw, Bookmark,
  Building2, Tag, Users, Trophy, MessageSquare,
} from "lucide-react";
import { BrandProfile } from "@/types";
import { WispGhost } from "@/components/ui/wisp-ghost";

// ── Types ────────────────────────────────────────────────────────────────────

export type LoadingPhase = "scraping" | "extracting" | "prompts" | "firing";

interface AuditLoadingProps {
  phase: LoadingPhase;
  url: string;
  profile: BrandProfile | null;
  heroData?: { title: string; description: string } | null;
  onReset: () => void;
}

type StepFn = (n: number) => void;

// ── Helpers ──────────────────────────────────────────────────────────────────

function brandFromUrl(url: string) {
  let slug: string;
  try { slug = new URL(url).hostname.replace("www.", "").split(".")[0]; }
  catch { slug = url.replace(/^https?:\/\//, "").split(".")[0]; }
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

function TypewriterText({ text, delay = 0, speed = 22 }: { text: string; delay?: number; speed?: number }) {
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
    }, speed);
    return () => clearInterval(iv);
  }, [started, text, speed]);

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

// ── Wisp character — floating, talks through every step ─────────────────────

const WISP_SPEECH: Record<number, string> = {
  1: "Hang tight — I'm reading through every page on your site…",
  2: "Now let me see where you're being talked about online…",
  3: "Here's exactly who you are, and who you're up against.",
  4: "Let me dig up the real questions people ask AI in your space…",
  5: "Turning those into the exact prompts I'll run…",
  6: "Asking every AI engine and putting your report together…",
};

function WispWorker({ step }: { step: number }) {
  return (
    <div className="flex items-start gap-4 mb-6">
      {/* Floating Wisp with glow + orbiting sparks */}
      <div className="relative shrink-0 w-[64px] h-[64px]">
        <motion.div
          className="absolute inset-0 rounded-full bg-[#7C22FF]/30 blur-2xl"
          animate={{ scale: [1, 1.35, 1], opacity: [0.45, 0.7, 0.45] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-[#9b4dff]"
            style={{ marginTop: -3, marginLeft: -3 }}
            animate={{
              x: [0, Math.cos(i * 2.1) * 34, 0],
              y: [0, Math.sin(i * 2.1) * 34, 0],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.7, ease: "easeInOut" }}
          />
        ))}
        <motion.div
          className="relative flex items-center justify-center w-full h-full"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <WispGhost size={48} />
        </motion.div>
      </div>

      {/* Speech bubble — retypes each step so it feels like Wisp is talking */}
      <div className="relative flex-1 pt-1.5">
        <div className="relative inline-block max-w-full bg-white border border-[#ece6f7] rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-[0_4px_16px_rgba(91,45,145,0.10)]">
          <div className="absolute -left-1.5 top-3 w-3 h-3 bg-white border-l border-b border-[#ece6f7] rotate-45" />
          <p className="relative text-[13px] font-medium text-[#2a2a2a] leading-snug">
            <AnimatePresence mode="wait">
              <motion.span
                key={step}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <TypewriterText text={WISP_SPEECH[step] ?? ""} speed={18} />
              </motion.span>
            </AnimatePresence>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Constants ────────────────────────────────────────────────────────────────

const EXTRACTION_PILLS = [
  "Homepage loaded",
  "Brand signal detected",
  "Category identified",
  "Audience mapped",
];

// ── STEP 1 — Reading the website ─────────────────────────────────────────────

function ScrapingAnimation({ url, heroData, onStep }: { url: string; heroData?: { title: string; description: string } | null; onStep: StepFn }) {
  const [showContent, setShowContent] = useState(false);
  const [scanPct, setScanPct] = useState(0);
  const [pills, setPills] = useState<{ id: number; text: string }[]>([]);

  const brandLabel = brandFromUrl(url);
  const h1Text = heroData?.title ? heroData.title.slice(0, 72) : `${brandLabel} — Built for modern teams`;
  const subText = heroData?.description ? heroData.description.slice(0, 110) : "The all-in-one platform to help your team move faster.";

  useEffect(() => { onStep(1); }, [onStep]);

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

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!heroData) return;
    const t = setTimeout(() => setShowContent(true), 1500);
    return () => clearTimeout(t);
  }, [heroData]);

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
      <div className="rounded-xl border border-[#c8c8c8] overflow-hidden" style={{ boxShadow: "0 20px 60px rgba(91,45,145,0.28), 0 6px 20px rgba(0,0,0,0.10)" }}>
        {/* Chrome bar */}
        <div className="bg-[#e8e8e8] border-b border-[#d0d0d0] px-4 py-2.5 flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" style={{ boxShadow: "0 0 0 0.5px rgba(0,0,0,0.15)" }} />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" style={{ boxShadow: "0 0 0 0.5px rgba(0,0,0,0.12)" }} />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" style={{ boxShadow: "0 0 0 0.5px rgba(0,0,0,0.12)" }} />
          </div>
          <div className="flex items-center shrink-0">
            <div className="w-7 h-6 flex items-center justify-center text-[#a0a0a0]"><ChevronLeft className="w-4 h-4" /></div>
            <div className="w-7 h-6 flex items-center justify-center text-[#c0c0c0]"><ChevronRight className="w-4 h-4" /></div>
            <div className="w-7 h-6 flex items-center justify-center text-[#6b6b6b]"><RotateCw className="w-3.5 h-3.5" /></div>
          </div>
          <div className="flex-1 flex items-center gap-2 bg-white border border-[#d0d0d0] rounded-md px-3 h-7" style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06)" }}>
            <Globe className="w-3 h-3 text-[#888] shrink-0" />
            <span className="text-[11px] text-[#4a4a4a] truncate flex-1 font-medium">{url}</span>
            <Loader2 className="w-[11px] h-[11px] text-[#5B2D91] animate-spin shrink-0" />
          </div>
          <div className="w-6 flex items-center justify-center text-[#a0a0a0] shrink-0"><Bookmark className="w-3.5 h-3.5" /></div>
        </div>

        {/* Browser body */}
        <div className="relative bg-white overflow-hidden">
          <AnimatePresence mode="wait">
            {!showContent ? (
              <motion.div key="skel" exit={{ opacity: 0 }} transition={{ duration: 0.45 }} className="p-5 space-y-4">
                <div className="shimmer-purple h-11 rounded-lg w-full" />
                <div className="flex gap-5 py-0.5">
                  <div className="flex-[3] space-y-3 py-1">
                    <div className="shimmer-purple h-4 rounded w-[60%]" />
                    <div className="shimmer-purple h-4 rounded w-[80%]" />
                    <div className="shimmer-purple h-4 rounded w-[40%]" />
                    <div className="shimmer-purple h-9 w-28 rounded-lg mt-2" />
                  </div>
                  <div className="flex-[2]"><div className="shimmer-purple h-[120px] rounded-xl" /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((i) => <div key={i} className="shimmer-purple h-16 rounded-xl" />)}
                </div>
              </motion.div>
            ) : (
              <motion.div key="real" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="p-5 space-y-4">
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="h-11 bg-white border border-[#f0f0f0] rounded-lg flex items-center gap-3 px-4 shadow-sm">
                  <img src={`https://www.google.com/s2/favicons?domain=${url}&sz=32`} width={20} height={20} className="rounded-md shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <span className="text-[13px] font-bold text-[#0a0a0a]">{brandLabel}</span>
                  <div className="flex-1" />
                  {["Product", "Pricing", "Docs"].map((l) => <span key={l} className="text-[11px] text-[#aaaaaa] font-medium">{l}</span>)}
                  <div className="w-[72px] h-7 rounded-md bg-[#5B2D91]" />
                </motion.div>

                <div className="flex gap-5">
                  <div className="flex-[3] space-y-2.5">
                    <div className="text-[14px] font-bold text-[#0a0a0a] leading-snug"><TypewriterText text={h1Text} delay={0.1} /></div>
                    <div className="text-[12px] text-[#6b7280]"><TypewriterText text={subText} delay={0.45} /></div>
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }} className="flex items-center gap-2 pt-0.5">
                      <div className="h-8 w-[116px] rounded-lg bg-[#5B2D91] flex items-center justify-center shrink-0"><span className="text-[11px] text-white font-semibold">Get started free</span></div>
                      <div className="h-8 w-[80px] rounded-lg border border-[#e5e5e5] flex items-center justify-center shrink-0"><span className="text-[11px] text-[#6b6b6b] font-medium">Learn more</span></div>
                    </motion.div>
                  </div>
                  <motion.div className="flex-[2]" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }}>
                    <div className="h-[120px] rounded-xl bg-gradient-to-br from-[#f3eeff] via-[#e8d5ff] to-[#d9bbff] flex items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-[#5B2D91]/20 flex items-center justify-center"><div className="w-6 h-6 rounded-xl bg-[#5B2D91]" /></div>
                    </div>
                  </motion.div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[{ val: "10k+", label: "Users" }, { val: "50+", label: "Integrations" }, { val: "99.9%", label: "Uptime" }].map(({ val, label }, i) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + i * 0.12 }} className="bg-[#fafafa] border border-[#f0f0f0] rounded-xl px-3 py-2.5">
                      <p className="text-[15px] font-bold text-[#0a0a0a]">{val}</p>
                      <p className="text-[11px] text-[#aaaaaa] mt-0.5">{label}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scan line */}
          <motion.div
            className="absolute left-0 right-0 h-16 pointer-events-none"
            style={{ background: "linear-gradient(180deg, rgba(124,34,255,0) 0%, rgba(124,34,255,0.10) 50%, rgba(124,34,255,0) 100%)" }}
            animate={{ top: ["-10%", "100%"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />

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

      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-[#6b7280]">Reading your website...</span>
          <span className="text-[11px] font-bold text-[#5B2D91]">{scanPct}%</span>
        </div>
        <div className="h-[3px] bg-[#f3eeff] rounded-full overflow-hidden">
          <div className="h-full bg-[#5B2D91] rounded-full" style={{ width: `${scanPct}%`, transition: "width 80ms linear" }} />
        </div>
      </div>
    </motion.div>
  );
}

// ── STEP 2+3 — Find mentions online, then build profile ─────────────────────

function MentionSearch({ brand }: { brand: string }) {
  const RESULTS = [
    { domain: "reddit.com",           crumb: "reddit.com › r/SaaS",          title: `${brand} — honest review after 6 months`,            snip: `"Been running ${brand} for half a year now and honestly it's been solid for our team…"`, tag: "Reddit" },
    { domain: "medium.com",           crumb: "medium.com",                    title: `Is ${brand} worth it in 2025? A deep dive`,           snip: `A breakdown of ${brand}'s features, pricing and how it stacks up against the alternatives…`,  tag: "Blog" },
    { domain: "trustpilot.com",       crumb: "trustpilot.com › review",       title: `${brand} Reviews | Read Customer Reviews`,            snip: `See what customers are saying about ${brand}. Rated 4.3 out of 5 based on 200+ reviews…`,     tag: "Trustpilot" },
    { domain: "news.ycombinator.com", crumb: "news.ycombinator.com",          title: `Show HN: Why we switched to ${brand}`,                snip: `Discussion · ${brand} keeps coming up whenever people compare tools in this category…`,        tag: "Hacker News" },
  ];

  const [shown, setShown] = useState(0);
  const [found, setFound] = useState(0);

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = [];
    RESULTS.forEach((_, i) => ts.push(setTimeout(() => setShown(i + 1), 350 + i * 520)));
    const start = Date.now();
    const iv = setInterval(() => {
      setFound(Math.min(Math.floor((Date.now() - start) / 70), 24));
      if (Date.now() - start >= 1700) clearInterval(iv);
    }, 40);
    return () => { ts.forEach(clearTimeout); clearInterval(iv); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div key="mentions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="w-full">
      {/* Search bar */}
      <div className="flex items-center gap-3 bg-white border border-[#e3e3e3] rounded-full px-4 py-2.5 shadow-[0_4px_18px_rgba(0,0,0,0.06)] mb-3">
        <Search className="w-4 h-4 text-[#5B2D91] shrink-0" />
        <span className="text-[13px] text-[#1a1a1a] flex-1 font-medium">{brand} reviews</span>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5B2D91] bg-[#f3eeff] px-2.5 py-1 rounded-full shrink-0">
          <Radio className="w-3 h-3" />
          {found} mentions found
        </span>
      </div>

      {/* Results */}
      <div className="space-y-2.5">
        <AnimatePresence>
          {RESULTS.slice(0, shown).map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white border border-[#f0f0f0] rounded-xl px-4 py-3 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-1">
                <img src={`https://www.google.com/s2/favicons?domain=${r.domain}&sz=32`} width={15} height={15} className="rounded-sm shrink-0" alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <span className="text-[11px] text-[#5b7c3a] truncate">{r.crumb}</span>
                <span className="ml-auto text-[9px] font-bold text-[#5B2D91] bg-[#f3eeff] px-1.5 py-0.5 rounded-full shrink-0">{r.tag}</span>
              </div>
              <p className="text-[13.5px] font-semibold text-[#1a0dab] leading-snug">{r.title}</p>
              <p className="text-[11.5px] text-[#6b7280] leading-snug mt-0.5 line-clamp-2">{r.snip}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ProfileCard({ profile }: { profile: BrandProfile | null }) {
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
    const t = setTimeout(() => setAllDone(true), 2200);
    return () => clearTimeout(t);
  }, [profile]);

  return (
    <motion.div key="profile" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="w-full">
      <div className="flex items-center justify-center gap-2 mb-4">
        <p className="text-xs font-bold text-[#5B2D91] uppercase tracking-widest">Brand profile detected</p>
        <AnimatePresence>
          {allDone && (
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.35, 1], opacity: 1 }} transition={{ duration: 0.3, ease: "easeOut" }}>
              <div className="w-4 h-4 rounded-full bg-[#5B2D91] flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white" /></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="rounded-xl p-6 bg-white border" style={{ borderColor: "rgba(91,45,145,0.3)", boxShadow: "0 0 0 4px rgba(91,45,145,0.08), 0 16px 50px rgba(91,45,145,0.22), 0 4px 16px rgba(0,0,0,0.08)" }}>
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
              <motion.div key={row.label} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.25, duration: 0.35 }} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#5B2D91]/10 flex items-center justify-center shrink-0"><row.Icon className="w-3.5 h-3.5 text-[#5B2D91]" /></div>
                <span className="text-[12px] text-[#6b7280] w-20 shrink-0 font-medium">{row.label}</span>
                <span className="text-[13px] font-medium flex-1 leading-snug"><WordRevealText text={row.value} delay={i * 0.25 + 0.1} /></span>
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.35, 1], opacity: 1 }} transition={{ delay: i * 0.25 + 0.5, duration: 0.3, ease: "easeOut" }} className="shrink-0">
                  <div className="w-5 h-5 rounded-full bg-[#5B2D91]/10 flex items-center justify-center"><Check className="w-3 h-3 text-[#5B2D91]" /></div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function MentionsThenProfile({ url, profile, onStep }: { url: string; profile: BrandProfile | null; onStep: StepFn }) {
  const [sub, setSub] = useState(0);
  const brand = brandFromUrl(url);

  useEffect(() => {
    onStep(2);
    const t = setTimeout(() => { setSub(1); onStep(3); }, 2700);
    return () => clearTimeout(t);
  }, [onStep]);

  return (
    <motion.div key="extracting" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }} className="w-full">
      <AnimatePresence mode="wait">
        {sub === 0 ? <MentionSearch brand={brand} /> : <ProfileCard profile={profile} />}
      </AnimatePresence>
    </motion.div>
  );
}

// ── STEP 4+5 — Research questions, then refine into prompts ─────────────────

function QuestionResearch({ profile }: { profile: BrandProfile | null }) {
  const category   = profile?.category ?? "productivity tools";
  const audience   = profile?.target_users ?? "teams";
  const competitor = (profile?.competitors ?? [])[0] ?? "the market leader";
  const brand      = profile?.brand_name ?? "your brand";

  const QUESTIONS = [
    { q: `What's the best ${category} for ${audience}?`,    src: "Quora",          meta: "89 answers"   },
    { q: `Any good alternatives to ${competitor}?`,         src: "Reddit · r/SaaS", meta: "47 comments"  },
    { q: `Which ${category} does AI recommend most?`,       src: "Quora",          meta: "124 answers"  },
    { q: `Is ${brand} actually worth it?`,                  src: "Reddit",         meta: "23 comments"  },
  ];

  const [shown, setShown] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = [];
    QUESTIONS.forEach((_, i) => ts.push(setTimeout(() => setShown(i + 1), 250 + i * 400)));
    const start = Date.now();
    const iv = setInterval(() => {
      setCount(Math.min(Math.floor((Date.now() - start) / 1.4), 1240));
      if (Date.now() - start >= 1700) clearInterval(iv);
    }, 35);
    return () => { ts.forEach(clearTimeout); clearInterval(iv); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div key="research" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#5B2D91]/10 flex items-center justify-center"><MessageSquare className="w-3.5 h-3.5 text-[#5B2D91]" /></div>
          <span className="text-[13px] font-bold text-[#0a0a0a]">Real questions people ask in your niche</span>
        </div>
        <span className="text-[11px] font-semibold text-[#5B2D91] bg-[#f3eeff] px-2.5 py-1 rounded-full">{count.toLocaleString()} found</span>
      </div>

      <div className="space-y-2.5">
        <AnimatePresence>
          {QUESTIONS.slice(0, shown).map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="flex items-center gap-3 bg-white border border-[#f0f0f0] rounded-xl px-4 py-3 shadow-sm">
              <div className="w-7 h-7 rounded-full bg-[#f3eeff] flex items-center justify-center shrink-0"><MessageSquare className="w-3.5 h-3.5 text-[#5B2D91]" /></div>
              <p className="text-[13px] text-[#1a1a1a] font-medium flex-1 leading-snug">{item.q}</p>
              <div className="text-right shrink-0">
                <p className="text-[11px] font-semibold text-[#5B2D91]">{item.src}</p>
                <p className="text-[10px] text-[#aaaaaa]">{item.meta}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function PromptWriting({ profile }: { profile: BrandProfile | null }) {
  const category   = profile?.category ?? "productivity tools";
  const audience   = profile?.target_users ?? "teams";
  const competitor = (profile?.competitors ?? [])[0] ?? "the market leader";

  const PROMPTS = [
    `Best ${category} for ${audience} in 2025?`,
    `Top alternatives to ${competitor}?`,
    `Which ${category} would you recommend, and why?`,
  ];

  const [writeIdx, setWriteIdx] = useState(0);
  const [doneIdx, setDoneIdx] = useState(0);

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = [];
    PROMPTS.forEach((p, i) => {
      const typeMs = Math.min(p.length * 16 + 150, 900);
      const startAt = i * 750;
      ts.push(setTimeout(() => setWriteIdx(i + 1), startAt));
      ts.push(setTimeout(() => setDoneIdx(i + 1), startAt + typeMs));
    });
    return () => ts.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div key="writing" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="w-full">
      <div className="rounded-xl bg-white border overflow-hidden" style={{ borderColor: "rgba(91,45,145,0.22)", boxShadow: "0 16px 50px rgba(91,45,145,0.18), 0 4px 16px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#f0f0f0] bg-[#faf8ff]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#5B2D91]/10 flex items-center justify-center"><FileText className="w-3.5 h-3.5 text-[#5B2D91]" /></div>
            <span className="text-[13px] font-bold text-[#0a0a0a]">Refined into AI prompts</span>
          </div>
          <span className="text-[11px] font-semibold text-[#5B2D91] bg-[#f3eeff] px-2.5 py-1 rounded-full">{doneIdx} / {PROMPTS.length} ready</span>
        </div>

        <div className="p-5 space-y-2.5">
          {PROMPTS.map((p, i) => {
            if (i >= writeIdx) {
              return (
                <div key={i} className="flex items-center gap-3 opacity-30">
                  <span className="w-6 h-6 rounded-md bg-[#f3f0fa] text-[#bbb] text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <div className="h-2.5 rounded bg-[#f0eef7] flex-1" style={{ maxWidth: `${55 + ((i * 13) % 35)}%` }} />
                </div>
              );
            }
            const isDone = i < doneIdx;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className={`flex items-center gap-3 rounded-lg px-2.5 py-2 -mx-2.5 transition-colors duration-300 ${isDone ? "" : "bg-[#f7f3ff]"}`}>
                <span className={`w-6 h-6 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 ${isDone ? "bg-[#5B2D91]/10 text-[#5B2D91]" : "bg-[#5B2D91] text-white"}`}>{i + 1}</span>
                <span className="text-[13px] text-[#1a1a1a] font-medium flex-1 leading-snug">{isDone ? p : <TypewriterText text={p} speed={16} />}</span>
                {isDone ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ duration: 0.3 }} className="w-5 h-5 rounded-full bg-[#5B2D91]/10 flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-[#5B2D91]" /></motion.div>
                ) : (
                  <Loader2 className="w-3.5 h-3.5 text-[#5B2D91] animate-spin shrink-0" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
      <p className="text-center text-[11px] text-[#9b8bbf] mt-3">These are the exact prompts Wisp will run against every AI engine.</p>
    </motion.div>
  );
}

function QuestionsThenPrompts({ profile, onStep }: { profile: BrandProfile | null; onStep: StepFn }) {
  const [sub, setSub] = useState(0);

  useEffect(() => {
    onStep(4);
    const t = setTimeout(() => { setSub(1); onStep(5); }, 2400);
    return () => clearTimeout(t);
  }, [onStep]);

  return (
    <motion.div key="prompts" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }} className="w-full">
      <AnimatePresence mode="wait">
        {sub === 0 ? <QuestionResearch profile={profile} /> : <PromptWriting profile={profile} />}
      </AnimatePresence>
    </motion.div>
  );
}

// ── STEP 6 — Ask the engines, then build the report (network graph) ─────────

function AskingEngines() {
  const MODELS = [
    { name: "ChatGPT",    domain: "chatgpt.com" },
    { name: "Perplexity", domain: "perplexity.ai" },
    { name: "Gemini",     domain: "gemini.google.com" },
    { name: "Claude",     domain: "claude.ai" },
  ];
  const [asked, setAsked] = useState(0);

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = [];
    MODELS.forEach((_, i) => ts.push(setTimeout(() => setAsked(i + 1), 500 + i * 650)));
    return () => ts.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div key="asking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg bg-[#5B2D91]/10 flex items-center justify-center"><Sparkles className="w-3.5 h-3.5 text-[#5B2D91]" /></div>
        <span className="text-[13px] font-bold text-[#0a0a0a]">Running your prompts across every AI engine</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {MODELS.map((m, i) => {
          const isAsked = asked > i;
          const isActive = asked === i;
          return (
            <div key={m.name} className={`rounded-xl border p-4 flex items-center gap-3 transition-all duration-300 ${isAsked ? "bg-[#f6f2ff] border-[#5B2D91]/25" : isActive ? "bg-[#f3eeff] border-[#5B2D91]/30" : "bg-[#fafafa] border-[#f0f0f0] opacity-50"}`}>
              <img src={`https://www.google.com/s2/favicons?domain=${m.domain}&sz=32`} width={22} height={22} className="rounded-md shrink-0" alt={m.name} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <span className="text-[13px] font-semibold text-[#0a0a0a] flex-1">{m.name}</span>
              {isAsked ? (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 text-[11px] font-semibold text-[#5B2D91]">
                  <Check className="w-3.5 h-3.5" /> Asked
                </motion.span>
              ) : isActive ? (
                <span className="flex items-center gap-1 text-[11px] font-medium text-[#5B2D91]"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Asking…</span>
              ) : (
                <span className="text-[11px] text-[#cccccc]">Queued</span>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// Compact version of the "Meet Wisp" network graph for the building-report step.
const GRAPH_W = 660, GRAPH_H = 384;
const CX = 330, CY = 158;
const REPORT_LLM = [
  { alt: "ChatGPT",    domain: "chatgpt.com",       cx: 52,  cy: 56  },
  { alt: "Claude",     domain: "claude.ai",         cx: 52,  cy: 250 },
  { alt: "Gemini",     domain: "gemini.google.com", cx: 608, cy: 56  },
  { alt: "Perplexity", domain: "perplexity.ai",     cx: 608, cy: 250 },
];
const REPORT_PLATFORM = [
  { alt: "Reddit",   domain: "reddit.com",   cx: 118, cy: 322 },
  { alt: "Quora",    domain: "quora.com",    cx: 224, cy: 334 },
  { alt: "LinkedIn", domain: "linkedin.com", cx: 330, cy: 338 },
  { alt: "YouTube",  domain: "youtube.com",  cx: 436, cy: 334 },
  { alt: "Facebook", domain: "facebook.com", cx: 542, cy: 322 },
];

function curveTo(nx: number, ny: number) {
  const mx = (nx + CX) / 2;
  const my = (ny + CY) / 2;
  const cx = mx + (CY - my) * 0.14;
  const cy = my + (CX - mx) * 0.14;
  return `M ${nx} ${ny} Q ${cx} ${cy} ${CX} ${CY}`;
}
function curveFrom(nx: number, ny: number) {
  const mx = (nx + CX) / 2;
  const my = (ny + CY) / 2;
  const cx = mx + (CY - my) * 0.14;
  const cy = my + (CX - mx) * 0.14;
  return `M ${CX} ${CY} Q ${cx} ${cy} ${nx} ${ny}`;
}

function BuildingReport() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const iv = setInterval(() => {
      setPct(Math.min(Math.floor(((Date.now() - start) / 8000) * 96), 96));
      if (Date.now() - start >= 8000) clearInterval(iv);
    }, 90);
    return () => clearInterval(iv);
  }, []);

  return (
    <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className="w-full flex flex-col items-center">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Loader2 className="w-4 h-4 text-[#5B2D91] animate-spin" />
        <span className="text-[15px] font-bold text-[#0a0a0a]">Building your report…</span>
      </div>
      <p className="text-[12px] text-[#8b7bb0] mb-3 text-center">Wisp is connecting every AI engine and source into your visibility report.</p>

      {/* Progress bar — above the graph so it never collides with nodes */}
      <div className="w-full max-w-[340px] mb-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-[#6b7280]">Compiling results</span>
          <span className="text-[11px] font-bold text-[#5B2D91]">{pct}%</span>
        </div>
        <div className="h-[3px] bg-[#f3eeff] rounded-full overflow-hidden">
          <div className="h-full bg-[#5B2D91] rounded-full" style={{ width: `${pct}%`, transition: "width 90ms linear" }} />
        </div>
      </div>

      {/* Graph */}
      <div className="relative mx-auto" style={{ width: GRAPH_W, height: GRAPH_H, maxWidth: "100%" }}>
        <svg style={{ position: "absolute", inset: 0, pointerEvents: "none" }} width={GRAPH_W} height={GRAPH_H}>
          {/* static links */}
          {REPORT_LLM.map((n) => <path key={`sl-${n.alt}`} d={curveTo(n.cx, n.cy)} fill="none" stroke="rgba(91,45,145,0.16)" strokeWidth={1.5} />)}
          {REPORT_PLATFORM.map((n) => <path key={`sp-${n.alt}`} d={curveFrom(n.cx, n.cy)} fill="none" stroke="rgba(91,45,145,0.13)" strokeWidth={1.5} />)}

          {/* orange pulses: engines → Wisp */}
          {REPORT_LLM.map((n, i) => (
            <motion.path key={`ol-${n.alt}`} d={curveTo(n.cx, n.cy)} fill="none" stroke="#FF6A00" strokeWidth={2.5} strokeLinecap="round" pathLength={1} strokeDasharray="0.07 1" animate={{ strokeDashoffset: [0, -1.07] }} transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1.2, ease: "linear", delay: i * 0.35 }} />
          ))}
          {/* purple pulses: Wisp → platforms */}
          {REPORT_PLATFORM.map((n, i) => (
            <motion.path key={`pp-${n.alt}`} d={curveFrom(n.cx, n.cy)} fill="none" stroke="#A855F7" strokeWidth={2.5} strokeLinecap="round" pathLength={1} strokeDasharray="0.07 1" animate={{ strokeDashoffset: [0, -1.07] }} transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.0, ease: "linear", delay: i * 0.3 }} />
          ))}
        </svg>

        {/* White mask disc — hides the line convergence behind Wisp */}
        <div
          style={{
            position: "absolute", left: CX, top: CY, width: 150, height: 150,
            transform: "translate(-50%,-50%)",
            background: "radial-gradient(circle, #ffffff 32%, rgba(255,255,255,0.9) 52%, rgba(255,255,255,0) 72%)",
          }}
        />

        {/* Wisp centered, bobbing */}
        <motion.div style={{ position: "absolute", left: CX, top: CY, transform: "translate(-50%,-50%)" }} animate={{ y: [0, -6, 0] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}>
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#7C22FF]/25 blur-2xl scale-[1.6]" />
            <div className="relative"><WispGhost size={100} /></div>
          </div>
        </motion.div>

        {/* nodes */}
        {[...REPORT_LLM, ...REPORT_PLATFORM].map((n) => (
          <div key={n.alt} style={{ position: "absolute", left: n.cx, top: n.cy, transform: "translate(-50%,-50%)" }}>
            <div className="w-11 h-11 rounded-2xl bg-white shadow-[0_4px_18px_rgba(0,0,0,0.14)] flex items-center justify-center overflow-hidden">
              <img src={`https://www.google.com/s2/favicons?domain=${n.domain}&sz=64`} alt={n.alt} width={28} height={28} className="rounded-xl" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
            <p className="text-center text-[10px] font-semibold text-[#5B2D91]/60 mt-1 whitespace-nowrap">{n.alt}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function FiringThenReport({ onStep, onGraph }: { profile: BrandProfile | null; onStep: StepFn; onGraph: (v: boolean) => void }) {
  const [sub, setSub] = useState(0);

  useEffect(() => {
    onStep(6);
    const t = setTimeout(() => setSub(1), 3300);
    return () => { clearTimeout(t); onGraph(false); };
  }, [onStep, onGraph]);

  useEffect(() => {
    if (sub === 1) onGraph(true);
  }, [sub, onGraph]);

  return (
    <motion.div key="firing" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }} className="w-full">
      <AnimatePresence mode="wait">
        {sub === 0 ? <AskingEngines /> : <BuildingReport />}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Step Indicator ───────────────────────────────────────────────────────────

const STEP_DEFS = [
  { label: "Reading",     Icon: Globe },
  { label: "Listening",   Icon: Radio },
  { label: "Profiling",   Icon: User },
  { label: "Researching", Icon: Search },
  { label: "Writing",     Icon: FileText },
  { label: "Building",    Icon: Sparkles },
];

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center w-full">
      <div className="flex items-center gap-0">
        {STEP_DEFS.map(({ label, Icon }, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < step;
          const isActive = stepNum === step;
          return (
            <div key={label} className="flex items-center">
              <div className="flex items-center gap-1.5">
                {isDone ? (
                  <motion.div initial={{ scale: 0.7 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full bg-[#5B2D91] flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-white" /></motion.div>
                ) : isActive ? (
                  <div className="w-5 h-5 rounded-full border-2 border-[#5B2D91] bg-[#f3eeff] flex items-center justify-center shrink-0"><Loader2 className="w-2.5 h-2.5 text-[#5B2D91] animate-spin" /></div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-[#e5e5e5] flex items-center justify-center shrink-0"><Icon className="w-2.5 h-2.5 text-[#c5c5c5]" /></div>
                )}
                <span className={`text-[11px] font-medium ${isDone || isActive ? "text-[#5B2D91]" : "text-[#c5c5c5]"}`}>{label}</span>
              </div>
              {i < STEP_DEFS.length - 1 && (
                <div className="w-5 h-0.5 mx-1.5 bg-[#e5e5e5] overflow-hidden rounded-full">
                  <motion.div className="h-full bg-[#5B2D91] rounded-full" initial={{ width: "0%" }} animate={{ width: isDone ? "100%" : "0%" }} transition={{ duration: 0.4 }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Export ──────────────────────────────────────────────────────────────

export function AuditLoadingView({ phase, url, profile, heroData, onReset }: AuditLoadingProps) {
  const [storyStep, setStoryStep] = useState(1);
  const [graphMode, setGraphMode] = useState(false);

  return (
    <div className="min-h-screen bg-[#ddd5f5] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-[820px]">
        <div className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden" style={{ boxShadow: "0 25px 60px rgba(91,45,145,0.28), 0 8px 24px rgba(91,45,145,0.16), 0 2px 8px rgba(0,0,0,0.08)" }}>
          {/* Frame header */}
          <div className="px-6 py-4 border-b border-[#f0f0f0] bg-[#fafafa]">
            <StepIndicator step={storyStep} />
          </div>

          {/* Animation zone */}
          <div className="p-8 min-h-[540px]">
            {!graphMode && <WispWorker step={storyStep} />}

            <div className="w-full">
              <AnimatePresence mode="wait">
                {phase === "scraping"   && <ScrapingAnimation key="s" url={url} heroData={heroData} onStep={setStoryStep} />}
                {phase === "extracting" && <MentionsThenProfile key="e" url={url} profile={profile} onStep={setStoryStep} />}
                {phase === "prompts"    && <QuestionsThenPrompts key="p" profile={profile} onStep={setStoryStep} />}
                {phase === "firing"     && <FiringThenReport key="f" profile={profile} onStep={setStoryStep} onGraph={setGraphMode} />}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
