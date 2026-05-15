"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, TrendingUp, Eye, ChevronsUpDown } from "lucide-react";
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer,
} from "recharts";
import { PromptResult, CompetitorRanking, BrandProfile } from "@/types";
import { getAuditHistory } from "@/lib/supabase";
import { PROMPT_MODELS } from "@/lib/prompt-models";

type TimeRange = "7d" | "yesterday" | "30d";
type HistoryEntry = { score: number; results: unknown; created_at: string };

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  "7d": "Last 7 days",
  "yesterday": "Yesterday",
  "30d": "Last month",
};

const COMP_COLORS = ["#1472E0", "#F4A535", "#e03b3b", "#7B4FFF", "#00A82D", "#ec4899"];

// Static data for the demo/landing page — never changes regardless of real audit state
const DEMO_CHART_DATA: Record<string, number | string | null>[] = [
  { label: "22 Apr", value: 62, Confluence: 80, Asana: 28, ClickUp: 58 },
  { label: "23 Apr", value: 55, Confluence: 74, Asana: 72, ClickUp: 52 },
  { label: "24 Apr", value: 48, Confluence: 68, Asana: 82, ClickUp: 44 },
  { label: "25 Apr", value: 58, Confluence: 76, Asana: 60, ClickUp: 68 },
  { label: "26 Apr", value: 72, Confluence: 82, Asana: 38, ClickUp: 78 },
  { label: "27 Apr", value: 65, Confluence: 72, Asana: 30, ClickUp: 70 },
  { label: "28 Apr", value: 52, Confluence: 60, Asana: 55, ClickUp: 55 },
  { label: "29 Apr", value: 44, Confluence: 55, Asana: 74, ClickUp: 40 },
  { label: "30 Apr", value: 58, Confluence: 66, Asana: 65, ClickUp: 30 },
  { label: "1 May",  value: 70, Confluence: 78, Asana: 42, ClickUp: 48 },
  { label: "2 May",  value: 78, Confluence: 86, Asana: 28, ClickUp: 62 },
  { label: "3 May",  value: 68, Confluence: 76, Asana: 20, ClickUp: 75 },
  { label: "4 May",  value: 56, Confluence: 62, Asana: 45, ClickUp: 80 },
  { label: "5 May",  value: 62, Confluence: 58, Asana: 68, ClickUp: 72 },
  { label: "6 May",  value: 72, Confluence: 64, Asana: 78, ClickUp: 60 },
];
const DEMO_COMP_NAMES = ["Confluence", "Asana", "ClickUp"];
const DEMO_MODEL_COVERAGE = [
  { name: "ChatGPT",    hit: 10, total: 15, indices: [] as number[], domain: "chatgpt.com",       color: "#10a37f" },
  { name: "Gemini",     hit:  8, total: 10, indices: [] as number[], domain: "gemini.google.com", color: "#4285F4" },
  { name: "Claude",     hit:  6, total:  9, indices: [] as number[], domain: "claude.ai",         color: "#d97706" },
  { name: "Perplexity", hit:  4, total:  6, indices: [] as number[], domain: "perplexity.ai",     color: "#1e6ef4" },
];

// 30-day demo: prepend 15 earlier points before the existing 15
const DEMO_30D_EXTRA: Record<string, number | string | null>[] = [
  { label: "7 Apr",  value: 45, Confluence: 70, Asana: 38, ClickUp: 52 },
  { label: "8 Apr",  value: 52, Confluence: 65, Asana: 50, ClickUp: 46 },
  { label: "9 Apr",  value: 48, Confluence: 74, Asana: 64, ClickUp: 57 },
  { label: "10 Apr", value: 40, Confluence: 80, Asana: 56, ClickUp: 62 },
  { label: "11 Apr", value: 62, Confluence: 70, Asana: 38, ClickUp: 74 },
  { label: "12 Apr", value: 70, Confluence: 58, Asana: 30, ClickUp: 66 },
  { label: "13 Apr", value: 60, Confluence: 64, Asana: 56, ClickUp: 50 },
  { label: "14 Apr", value: 50, Confluence: 72, Asana: 72, ClickUp: 42 },
  { label: "15 Apr", value: 54, Confluence: 76, Asana: 62, ClickUp: 36 },
  { label: "16 Apr", value: 66, Confluence: 84, Asana: 46, ClickUp: 52 },
  { label: "17 Apr", value: 74, Confluence: 80, Asana: 28, ClickUp: 64 },
  { label: "18 Apr", value: 66, Confluence: 72, Asana: 20, ClickUp: 70 },
  { label: "19 Apr", value: 58, Confluence: 66, Asana: 44, ClickUp: 76 },
  { label: "20 Apr", value: 62, Confluence: 74, Asana: 60, ClickUp: 68 },
  { label: "21 Apr", value: 70, Confluence: 80, Asana: 36, ClickUp: 57 },
];
const DEMO_30D_DATA = [...DEMO_30D_EXTRA, ...DEMO_CHART_DATA];

// Per-LLM scale factors — intentionally dramatic so filter changes are visually obvious
const MODEL_MULTIPLIERS: Record<string, { value: number; Confluence: number; Asana: number; ClickUp: number }> = {
  // ChatGPT: brand dominates, competitors lag
  ChatGPT:    { value: 1.30, Confluence: 0.72, Asana: 0.55, ClickUp: 0.80 },
  // Gemini: brand drops sharply, Confluence surges ahead
  Gemini:     { value: 0.68, Confluence: 1.25, Asana: 0.88, ClickUp: 0.72 },
  // Claude: brand is lowest, Asana leads the pack
  Claude:     { value: 0.50, Confluence: 0.80, Asana: 1.30, ClickUp: 0.75 },
  // Perplexity: tight race, ClickUp closes the gap
  Perplexity: { value: 1.12, Confluence: 0.90, Asana: 0.70, ClickUp: 1.22 },
};

const LLM_DOMAINS: Record<string, string> = {
  ChatGPT: "chatgpt.com",
  Gemini: "gemini.google.com",
  Claude: "claude.ai",
  Perplexity: "perplexity.ai",
};

function useCountUp(target: number, duration = 1000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const raf = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setValue(Math.round(p * target));
      if (p < 1) requestAnimationFrame(raf);
    };
    const id = requestAnimationFrame(raf);
    return () => cancelAnimationFrame(id);
  }, [target, duration]);
  return value;
}

function dayLabel(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

interface Props {
  score: number;
  totalMentions: number;
  promptResults: PromptResult[];
  competitorRankings: CompetitorRanking[];
  profile: BrandProfile;
  domain: string;
  onNavigate: (page: string) => void;
  userId?: string;
  demoMode?: boolean;
}

function ChartLockedPlaceholder() {
  const [tip, setTip] = useState(false);
  return (
    <div className="flex flex-col items-center justify-center h-[120px] gap-2 select-none">
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-semibold text-[#9ca3af]">
          Unlock line chart after 3 audits (3 days)
        </span>
        <div className="relative">
          <button
            onMouseEnter={() => setTip(true)}
            onMouseLeave={() => setTip(false)}
            className="w-4 h-4 rounded-full border border-[#d1d5db] text-[#9ca3af] text-[10px] font-bold flex items-center justify-center hover:border-[#5B2D91] hover:text-[#5B2D91] transition-colors"
          >
            i
          </button>
          {tip && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[200px] bg-[#1a1a2e] text-white text-[11px] leading-relaxed rounded-lg px-3 py-2 shadow-xl pointer-events-none z-50">
              Not enough data yet. Run your audit daily — the trend chart unlocks automatically after 3 audits.
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1a1a2e]" />
            </div>
          )}
        </div>
      </div>
      <div className="flex items-end gap-1 opacity-20">
        {[40, 55, 48, 62, 58, 70, 65].map((h, i) => (
          <div key={i} className="w-2 rounded-sm bg-[#5B2D91]" style={{ height: h * 0.6 }} />
        ))}
      </div>
    </div>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.35, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

export function OverviewPanel({
  score, totalMentions, promptResults, competitorRankings,
  profile, domain, onNavigate, userId, demoMode,
}: Props) {
  const brandName = profile.brand_name;
  const topComps = competitorRankings.slice(0, 3);
  const topCompNames = topComps.map(c => c.name);

  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [timeRangeOpen, setTimeRangeOpen] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [demoModelFilter, setDemoModelFilter] = useState<"all" | "ChatGPT" | "Gemini" | "Claude" | "Perplexity">("all");
  const [demoBrandFilter, setDemoBrandFilter] = useState<"all" | "Confluence" | "Asana" | "ClickUp">("all");
  const [modelDropOpen, setModelDropOpen] = useState(false);
  const [brandDropOpen, setBrandDropOpen] = useState(false);
  const [llmsTxtExists, setLlmsTxtExists] = useState(demoMode === true);

  useEffect(() => {
    if (demoMode || !userId) return;
    getAuditHistory(userId, timeRange).then(setHistory).catch(() => {});
  }, [userId, timeRange, demoMode]);

  useEffect(() => {
    if (demoMode || !domain) return;
    fetch("/api/verify-llms-txt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: domain }),
    })
      .then(r => r.json())
      .then(d => setLlmsTxtExists(d.live === true))
      .catch(() => {});
  }, [domain, demoMode]);

  // Most recent entry within the selected range
  const activeEntry = history.length > 0 ? history[history.length - 1] : null;
  const activeScore = activeEntry?.score ?? score;

  const activePromptResults: PromptResult[] = (() => {
    if (!activeEntry?.results) return promptResults;
    const r = activeEntry.results as { prompt_results?: PromptResult[] };
    return r.prompt_results ?? promptResults;
  })();

  const activeCompRankings: CompetitorRanking[] = (() => {
    if (!activeEntry?.results) return competitorRankings;
    const r = activeEntry.results as { competitor_rankings?: CompetitorRanking[] };
    return r.competitor_rankings ?? competitorRankings;
  })();

  const totalPrompts = activePromptResults.length || 11;
  const activeMentions = activePromptResults.filter(p => p.mentioned).length;

  const scoreDelta = history.length >= 2
    ? history[history.length - 1].score - history[history.length - 2].score
    : null;

  const animScore = useCountUp(activeScore);
  const rank = activeCompRankings.filter(c => c.mentions > activeMentions).length + 1;
  const animRank = useCountUp(rank, 800);

  const [chartRevealed, setChartRevealed] = useState(false);
  useEffect(() => {
    setChartRevealed(false);
    const t = setTimeout(() => setChartRevealed(true), 60);
    return () => clearTimeout(t);
  }, [activeEntry, timeRange]);

  const citationPct = Math.round((activeMentions / totalPrompts) * 100);

  const MODEL_META: Record<string, { color: string }> = {
    ChatGPT:    { color: "#10a37f" },
    Perplexity: { color: "#1e6ef4" },
    Claude:     { color: "#d97706" },
    Gemini:     { color: "#4285F4" },
  };

  const modelCoverage = demoMode
    ? DEMO_MODEL_COVERAGE
    : Object.entries(
        PROMPT_MODELS.reduce<Record<string, { hit: number; total: number; indices: number[] }>>((acc, m, i) => {
          if (activePromptResults[i] === undefined) return acc;
          if (!acc[m.name]) acc[m.name] = { hit: 0, total: 0, indices: [] };
          acc[m.name].total++;
          acc[m.name].indices.push(i);
          if (activePromptResults[i].mentioned) acc[m.name].hit++;
          return acc;
        }, {})
      ).map(([name, { hit, total, indices }]) => ({
        name, hit, total, indices,
        domain: PROMPT_MODELS.find(m => m.name === name)?.domain ?? "",
        color: MODEL_META[name]?.color ?? "#aaaaaa",
      }));

  const [modelBarWidths, setModelBarWidths] = useState<Record<string, number>>({});
  useEffect(() => {
    setModelBarWidths(Object.fromEntries(modelCoverage.map(m => [m.name, 0])));
    const t = setTimeout(() => {
      setModelBarWidths(Object.fromEntries(
        modelCoverage.map(m => [m.name, (m.hit / m.total) * 100])
      ));
    }, 400);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEntry, score, totalMentions]);

  const tableRows = [
    { name: brandName, domain, mentions: activeMentions, isYou: true },
    ...activeCompRankings.slice(0, 4).map(c => ({
      name: c.name, domain: c.domain || "", mentions: c.mentions, isYou: false,
    })),
  ].sort((a, b) => b.mentions - a.mentions);

  const aiMentions = activePromptResults.filter(p => p.response_text).slice(0, 2);

  const avgPos = (() => {
    const with_pos = activePromptResults.filter(p => p.position !== null);
    if (!with_pos.length) return null;
    return with_pos.reduce((s, p) => s + p.position!, 0) / with_pos.length;
  })();

  // Build chart data: start from first audit date (no empty padding on the left)
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const todayStr = todayDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  const rangeDays = timeRange === "30d" ? 30 : timeRange === "yesterday" ? 2 : 7;
  const fullRangeStart = new Date(todayDate);
  fullRangeStart.setDate(fullRangeStart.getDate() - (rangeDays - 1));

  // Start from max(range_start, first complete audit date) — no empty padding on the left
  let rangeStartDate = new Date(todayDate); // fallback: just today
  const firstCompleteEntry = history.find(h => h.results !== null) ?? history[0];
  if (firstCompleteEntry) {
    const firstAudit = new Date(firstCompleteEntry.created_at);
    firstAudit.setHours(0, 0, 0, 0);
    rangeStartDate = firstAudit > fullRangeStart ? firstAudit : fullRangeStart;
  }

  const allDates: Date[] = [];
  const cursor = new Date(rangeStartDate);
  while (cursor <= todayDate) {
    allDates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  // Index history by day label (keep latest per day)
  const historyMap = new Map<string, HistoryEntry>();
  history.forEach(entry => { historyMap.set(dayLabel(entry.created_at), entry); });

  const chartData = allDates.map(date => {
    const lbl = date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const entry = historyMap.get(lbl);
    const isToday = lbl === todayStr;

    if (entry && entry.results) {
      // Only plot days where we have full data (brand + competitors together)
      const pt: Record<string, number | string | null> = { label: lbl, value: entry.score };
      const r = entry.results as { prompt_results?: PromptResult[]; competitor_rankings?: CompetitorRanking[] };
      const tp = r.prompt_results?.length || 11;
      topCompNames.forEach(name => {
        const comp = r.competitor_rankings?.find(c => c.name.toLowerCase() === name.toLowerCase());
        pt[name] = comp ? Math.round((comp.mentions / tp) * 100) : 0;
      });
      return pt;
    } else if (isToday) {
      // Today always shows current audit data even if not yet saved to history
      const tp = promptResults.length || 11;
      const pt: Record<string, number | string | null> = { label: lbl, value: score };
      topCompNames.forEach(n => {
        const comp = competitorRankings.find(c => c.name === n);
        pt[n] = comp ? Math.round((comp.mentions / tp) * 100) : null;
      });
      return pt;
    } else {
      // Empty day — null keeps the x-axis label but leaves a gap in the line
      const pt: Record<string, number | string | null> = { label: lbl, value: null };
      topCompNames.forEach(name => { pt[name] = null; });
      return pt;
    }
  });

  const hasCompetitorData = history.some(h => h.results !== null) || topCompNames.length > 0;

  const activeDemoData = useMemo(() => {
    const base = timeRange === "yesterday" ? DEMO_CHART_DATA.slice(-2)
               : timeRange === "30d"       ? DEMO_30D_DATA
               :                            DEMO_CHART_DATA.slice(-7);
    if (demoModelFilter === "all") return base;
    const m = MODEL_MULTIPLIERS[demoModelFilter];
    return base.map(d => ({
      ...d,
      value:      typeof d.value      === "number" ? Math.min(100, Math.round(d.value      * m.value))      : d.value,
      Confluence: typeof d.Confluence === "number" ? Math.min(100, Math.round(d.Confluence * m.Confluence)) : d.Confluence,
      Asana:      typeof d.Asana      === "number" ? Math.min(100, Math.round(d.Asana      * m.Asana))      : d.Asana,
      ClickUp:    typeof d.ClickUp    === "number" ? Math.min(100, Math.round(d.ClickUp    * m.ClickUp))    : d.ClickUp,
    }));
  }, [timeRange, demoModelFilter]);

  const activeDemoCompNames = demoBrandFilter === "all" ? DEMO_COMP_NAMES : [demoBrandFilter];

  const finalChartData = demoMode ? activeDemoData : chartData;
  const finalTopCompNames = demoMode ? activeDemoCompNames : topCompNames;
  const finalHasCompetitorData = demoMode || hasCompetitorData;

  const showDots = finalChartData.filter(d => d.value !== null).length <= 3;
  const xInterval = finalChartData.length > 10 ? 3 : 0;

  return (
    <div className="bg-[#ddd5f5] min-h-full">

      {/* Welcome header */}
      <div className="px-6 pt-3 pb-2">
        <h1 className="text-[16px] font-bold text-[#0a0a0a]">Welcome back, {brandName} 👋</h1>
        <p className="text-[12px] text-[#6b7280] mt-0.5">
          Your AI visibility — {TIME_RANGE_LABELS[timeRange].toLowerCase()}.
        </p>
      </div>

      {/* Filter pills */}
      <div className="px-6 pb-2 flex items-center gap-2 flex-wrap">

        {/* Time range dropdown */}
        <div className="relative">
          {timeRangeOpen && (
            <div className="fixed inset-0 z-10" onClick={() => setTimeRangeOpen(false)} />
          )}
          <button
            onClick={() => setTimeRangeOpen(v => !v)}
            className="relative z-20 flex items-center gap-1 px-3 py-1 rounded-full bg-white text-[11px] text-[#6b7280] transition-colors"
            style={{ border: "0.5px solid #e5e5e5", boxShadow: "0 8px 32px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)" }}
          >
            📅 {TIME_RANGE_LABELS[timeRange]}
            <ChevronDown className="w-2.5 h-2.5 opacity-60 ml-0.5" />
          </button>
          <AnimatePresence>
            {timeRangeOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
                className="absolute z-30 top-full left-0 mt-1 bg-white border border-[#e5e5e5] rounded-xl shadow-lg overflow-hidden min-w-[140px]"
              >
                {(["7d", "yesterday", "30d"] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => { setTimeRange(range); setTimeRangeOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-[12px] transition-colors active:bg-[#f3eeff] active:text-[#5B2D91] ${timeRange === range ? "font-semibold text-[#5B2D91] bg-[#faf7ff]" : "text-[#6b7280] hover:bg-[#f7f7f5]"}`}
                  >
                    {TIME_RANGE_LABELS[range]}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Models filter */}
        <div className="relative">
          {modelDropOpen && <div className="fixed inset-0 z-10" onClick={() => setModelDropOpen(false)} />}
          <button
            onClick={() => { if (demoMode) setModelDropOpen(v => !v); }}
            className="relative z-20 flex items-center gap-1 px-3 py-1 rounded-full bg-white text-[11px] text-[#6b7280] transition-colors"
            style={{ border: "0.5px solid #e5e5e5", boxShadow: "0 8px 32px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)" }}
          >
            {demoModelFilter === "all" ? "All models" : demoModelFilter}
            <ChevronDown className="w-2.5 h-2.5 opacity-60 ml-0.5" />
          </button>
          <AnimatePresence>
            {modelDropOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
                className="absolute z-30 top-full left-0 mt-1 bg-white border border-[#e5e5e5] rounded-xl shadow-lg overflow-hidden min-w-[150px]"
              >
                {(["all", "ChatGPT", "Gemini", "Claude", "Perplexity"] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => { setDemoModelFilter(m); setModelDropOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-[12px] flex items-center gap-2 transition-colors active:bg-[#f3eeff] active:text-[#5B2D91] ${demoModelFilter === m ? "font-semibold text-[#5B2D91] bg-[#faf7ff]" : "text-[#6b7280] hover:bg-[#f7f7f5]"}`}
                  >
                    {m !== "all" && (
                      <img src={`https://www.google.com/s2/favicons?domain=${LLM_DOMAINS[m]}&sz=32`} className="w-3.5 h-3.5 rounded-sm shrink-0" alt="" />
                    )}
                    {m === "all" ? "All models" : m}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Brand / competitor filter */}
        <div className="relative">
          {brandDropOpen && <div className="fixed inset-0 z-10" onClick={() => setBrandDropOpen(false)} />}
          <button
            onClick={() => { if (demoMode) setBrandDropOpen(v => !v); }}
            className="relative z-20 flex items-center gap-1 px-3 py-1 rounded-full bg-white text-[11px] text-[#6b7280] transition-colors"
            style={{ border: "0.5px solid #e5e5e5", boxShadow: "0 8px 32px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)" }}
          >
            {demoBrandFilter === "all" ? "Brand" : `vs ${demoBrandFilter}`}
            <ChevronDown className="w-2.5 h-2.5 opacity-60 ml-0.5" />
          </button>
          <AnimatePresence>
            {brandDropOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
                className="absolute z-30 top-full left-0 mt-1 bg-white border border-[#e5e5e5] rounded-xl shadow-lg overflow-hidden min-w-[150px]"
              >
                {(["all", "Confluence", "Asana", "ClickUp"] as const).map(b => (
                  <button
                    key={b}
                    onClick={() => { setDemoBrandFilter(b); setBrandDropOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-[12px] flex items-center gap-2 transition-colors active:bg-[#f3eeff] active:text-[#5B2D91] ${demoBrandFilter === b ? "font-semibold text-[#5B2D91] bg-[#faf7ff]" : "text-[#6b7280] hover:bg-[#f7f7f5]"}`}
                  >
                    {b !== "all" && (
                      <img src={`https://www.google.com/s2/favicons?domain=${b.toLowerCase()}.com&sz=32`} className="w-3.5 h-3.5 rounded-sm shrink-0" alt="" />
                    )}
                    {b === "all" ? "All competitors" : b}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 3-column grid */}
      <div className="px-6 pb-3 grid grid-cols-1 md:grid-cols-[1fr_27%_28%] gap-[10px] items-stretch">

        {/* ── LEFT: Chart + Competitor Rankings ── */}
        <motion.div
          custom={0} initial="hidden" animate="visible" variants={cardVariants}
          className="bg-white rounded-xl p-4 flex flex-col gap-3"
          style={{ border: "0.5px solid #e5e5e5", boxShadow: "0 8px 32px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)" }}
        >
          {/* Card header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-[13px] font-bold text-[#0a0a0a]">Brand Visibility</h3>
              <p className="text-[11px] text-[#6b7280]">Track your visibility across AI answers</p>
            </div>
            <div className="flex items-center gap-5">
              <div>
                <div className="text-[28px] font-bold text-[#0a0a0a] leading-none">{animScore}%</div>
                <div className="mt-1">
                  {scoreDelta !== null ? (
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${scoreDelta >= 0 ? "bg-[#dcfce7] text-[#15803d]" : "bg-red-50 text-red-600"}`}>
                      {scoreDelta >= 0 ? "↑ +" : "↓ "}{scoreDelta}pts
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#f3eeff] text-[#5B2D91]">
                      First audit
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[24px] font-bold text-[#5B2D91] leading-none">#{animRank}</div>
                <div className="text-[10px] text-[#6b7280] mt-0.5">Your rank</div>
                {avgPos !== null && (
                  <div className="text-[10px] text-[#9ca3af] mt-0.5">avg #{Math.round(avgPos * 10) / 10}</div>
                )}
              </div>
            </div>
          </div>

          {/* Chart — locked placeholder when data is sparse, line chart when there's enough history */}
          {showDots && !demoMode ? (
            <ChartLockedPlaceholder />
          ) : (
            <div
              className="h-[120px] -mx-1"
              style={{
                clipPath: chartRevealed ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
                transition: "clip-path 1100ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={finalChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ovStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#cc6666" />
                      <stop offset="100%" stopColor="#5B2D91" />
                    </linearGradient>
                    <linearGradient id="ovFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5B2D91" stopOpacity={0.08} />
                      <stop offset="100%" stopColor="#5B2D91" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#f0f0f0" strokeWidth={0.5} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    interval={xInterval}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                    tickFormatter={(v) => `${v}%`}
                    ticks={[0, 25, 50, 75]}
                    domain={[0, 100]}
                  />
                  <RTooltip
                    contentStyle={{ background: "white", border: "0.5px solid #e5e5e5", borderRadius: 8, fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                    formatter={(v: number, name: string) => [`${v}%`, name === "value" ? brandName : name]}
                    labelStyle={{ color: "#6b7280", marginBottom: 2 }}
                  />
                  {finalHasCompetitorData && finalTopCompNames.map((name, i) => (
                    <Line
                      key={name}
                      type="monotone"
                      dataKey={name}
                      stroke={COMP_COLORS[i % COMP_COLORS.length]}
                      strokeWidth={1.5}
                      strokeDasharray="3 2"
                      strokeOpacity={0.65}
                      connectNulls={false}
                      dot={false}
                      activeDot={{ r: 3 }}
                      isAnimationActive
                      animationDuration={650}
                      animationEasing="ease-out"
                    />
                  ))}
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="url(#ovStroke)"
                    strokeWidth={2.5}
                    fill="url(#ovFill)"
                    connectNulls={false}
                    dot={false}
                    activeDot={{ r: 4, fill: "#5B2D91", stroke: "white", strokeWidth: 2 }}
                    isAnimationActive
                    animationDuration={650}
                    animationEasing="ease-out"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Chart legend — only shown with the line chart, not the sparse score card */}
          {!showDots && finalChartData.length > 0 && finalHasCompetitorData && finalTopCompNames.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: "#5B2D91" }} />
                <span className="text-[11px] font-semibold text-[#0a0a0a]">{brandName}</span>
              </div>
              {finalTopCompNames.map((name, i) => (
                <div key={name} className="flex items-center gap-1.5">
                  <div className="w-6 shrink-0" style={{ height: 1.5, background: COMP_COLORS[i % COMP_COLORS.length], opacity: 0.65 }} />
                  <span className="text-[11px] text-[#6b7280]">{name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="-mx-4 border-t border-[#f0f0f0]" />

          {/* Competitor Rankings */}
          <div>
            <p className="text-[12px] font-bold text-[#0a0a0a]">Competitor Rankings</p>
            <p className="text-[10px] text-[#9ca3af] mt-0.5">Based on AI citations</p>
          </div>
          <div className="space-y-0.5">
            {tableRows.map((row, i) => {
              const visPct = Math.round((row.mentions / totalPrompts) * 100);
              const maxVisPct = Math.max(...tableRows.map(r => Math.round((r.mentions / totalPrompts) * 100)), 1);
              return (
                <div
                  key={row.name}
                  className={`flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#fafafa] transition-colors ${row.isYou ? "bg-[#f9f7ff]" : ""}`}
                >
                  <span className="text-[11px] font-semibold text-[#9ca3af] w-5 shrink-0 text-center">{i + 1}</span>
                  {row.domain ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${row.domain}&sz=32`}
                      alt={row.name}
                      width={22} height={22}
                      className="w-[22px] h-[22px] rounded-md object-contain shrink-0"
                      onError={(e) => {
                        const t = e.target as HTMLImageElement;
                        t.style.display = "none";
                        const sib = t.nextElementSibling as HTMLElement | null;
                        if (sib) sib.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="w-[22px] h-[22px] rounded-md shrink-0 items-center justify-center text-white text-[9px] font-bold"
                    style={{
                      background: row.isYou ? "#5B2D91" : COMP_COLORS[i % COMP_COLORS.length],
                      display: row.domain ? "none" : "flex",
                    }}
                  >
                    {row.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    {row.domain ? (
                      <a
                        href={`https://${row.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-[12px] font-semibold truncate hover:underline ${row.isYou ? "text-[#5B2D91]" : "text-[#0a0a0a] hover:text-[#5B2D91]"}`}
                        onClick={e => e.stopPropagation()}
                      >
                        {row.name}
                      </a>
                    ) : (
                      <span className={`text-[12px] font-semibold truncate ${row.isYou ? "text-[#5B2D91]" : "text-[#0a0a0a]"}`}>
                        {row.name}
                      </span>
                    )}
                    {row.isYou && (
                      <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#ede9fe] text-[#5B2D91]">you</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-[52px] h-1.5 rounded-full bg-[#f0f0f0] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(visPct / maxVisPct) * 100}%`,
                          background: row.isYou ? "#5B2D91" : COMP_COLORS[i % COMP_COLORS.length],
                          opacity: 0.7,
                        }}
                      />
                    </div>
                    <span className={`text-[12px] font-bold w-8 text-right ${row.isYou ? "text-[#5B2D91]" : visPct >= 50 ? "text-[#16a34a]" : "text-[#0a0a0a]"}`}>
                      {visPct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── MIDDLE COLUMN ── */}
        <div className="flex flex-col gap-[10px] h-full">

          {/* AI Mentions */}
          <motion.div
            custom={1} initial="hidden" animate="visible" variants={cardVariants}
            className="bg-white rounded-xl p-4"
            style={{ border: "0.5px solid #e5e5e5", boxShadow: "0 8px 32px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)" }}
          >
            <h3 className="text-[12px] font-bold text-[#0a0a0a]">AI Mentions</h3>
            <p className="text-[10px] text-[#6b7280] mt-0.5">How often AI mentions your brand</p>

            <div className="flex items-center gap-4 mt-3">
              <div className="relative shrink-0 w-[80px] h-[80px]">
                <svg width="80" height="80" viewBox="0 0 80 80" style={{ display: "block" }}>
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#f0eeff" strokeWidth="9" />
                  <circle
                    cx="40" cy="40" r="30"
                    fill="none"
                    stroke="#5B2D91"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 30 * citationPct / 100} ${2 * Math.PI * 30}`}
                    transform="rotate(-90 40 40)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-[14px] font-black text-[#5B2D91]">{citationPct}%</span>
                </div>
              </div>

              <div>
                <p className="text-[13px] text-[#0a0a0a] leading-snug">
                  Cited in <span className="font-black">{activeMentions}</span> of{" "}
                  <span className="font-black">{totalPrompts}</span> answers
                </p>
                <div className="flex items-center gap-1.5 mt-2.5">
                  {[
                    { name: "ChatGPT",    domain: "chatgpt.com"       },
                    { name: "Claude",     domain: "claude.ai"         },
                    { name: "Perplexity", domain: "perplexity.ai"     },
                    { name: "Gemini",     domain: "gemini.google.com" },
                  ].map(m => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={m.domain}
                      src={`https://www.google.com/s2/favicons?domain=${m.domain}&sz=32`}
                      alt={m.name}
                      title={m.name}
                      width={18} height={18}
                      className="w-[18px] h-[18px] rounded-md object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Model Coverage */}
          <motion.div
            custom={2} initial="hidden" animate="visible" variants={cardVariants}
            className="bg-white rounded-xl overflow-hidden flex-1"
            style={{ border: "0.5px solid #e5e5e5", boxShadow: "0 8px 32px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)" }}
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-3">
              <h3 className="text-[12px] font-bold text-[#0a0a0a]">AI Model Coverage</h3>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[26px] font-bold text-[#0a0a0a] leading-none">
                  {Math.round((activeMentions / totalPrompts) * 100)}%
                </span>
                {scoreDelta !== null && (
                  <span className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${scoreDelta >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                    {scoreDelta >= 0 ? "↑" : "↓"} {Math.abs(scoreDelta)}%
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#6b7280] mt-0.5">overall mention rate across all models</p>
            </div>

            {/* Bar rows */}
            <div className="px-4 pb-3 space-y-3">
              {[...modelCoverage]
                .sort((a, b) => (b.hit / b.total) - (a.hit / a.total))
                .map((m) => {
                  const pct = Math.round((m.hit / m.total) * 100);
                  const w = modelBarWidths[m.name] ?? 0;
                  return (
                    <div key={m.name} className="flex items-center gap-2.5">
                      <span className="w-[72px] text-[11px] text-[#6b7280] shrink-0 text-right leading-tight truncate">{m.name}</span>
                      <div className="flex-1 h-[30px] rounded-full bg-[#f0f0f0] overflow-hidden relative">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{
                            width: `${w}%`,
                            background: m.color,
                            opacity: 0.9,
                            transition: "width 700ms ease-out",
                            minWidth: pct > 0 ? 36 : 0,
                          }}
                        />
                        {pct > 0 && (
                          <span
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-white"
                            style={{ opacity: w > 18 ? 1 : 0, transition: "opacity 300ms 500ms" }}
                          >
                            {pct}%
                          </span>
                        )}
                        {/* Favicon cap */}
                        {pct > 0 && (
                          <div
                            className="absolute top-1/2 -translate-y-1/2 w-[24px] h-[24px] rounded-full bg-white shadow-sm flex items-center justify-center transition-all duration-700"
                            style={{ left: `calc(${w}% - 26px)` }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`https://www.google.com/s2/favicons?domain=${m.domain}&sz=32`}
                              alt={m.name} width={14} height={14}
                              className="w-[14px] h-[14px] object-contain"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          </div>
                        )}
                      </div>
                      <span className="w-[28px] text-[11px] font-semibold text-[#0a0a0a] shrink-0">{m.hit}/{m.total}</span>
                    </div>
                  );
                })}
            </div>

            {/* X-axis */}
            <div className="px-4 pb-3 flex items-center gap-2.5">
              <div className="w-[72px] shrink-0" />
              <div className="flex-1 flex justify-between">
                {["0%", "25%", "50%", "75%", "100%"].map(l => (
                  <span key={l} className="text-[9px] text-[#aaaaaa]">{l}</span>
                ))}
              </div>
              <div className="w-[28px] shrink-0" />
            </div>

            {/* Insight footer */}
            <div className="mx-4 mb-4 rounded-lg bg-[#f7f7f5] border border-[#eeeeee] px-3 py-2.5 flex items-start gap-2">
              <TrendingUp className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#5B2D91]" />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[#0a0a0a] leading-snug">
                  {(() => {
                    const best = [...modelCoverage].sort((a, b) => (b.hit / b.total) - (a.hit / a.total))[0];
                    const missed = totalPrompts - activeMentions;
                    return best
                      ? `${best.name} leads at ${Math.round((best.hit / best.total) * 100)}% — ${missed} prompt${missed !== 1 ? "s" : ""} still uncovered`
                      : "Run more prompts to see model insights";
                  })()}
                </p>
                <p className="text-[10px] text-[#6b7280] mt-0.5 leading-snug">
                  {activeMentions} of {totalPrompts} prompts mention you across {modelCoverage.length} models
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex flex-col gap-[10px] h-full">

          {/* Improve AI Visibility */}
          <motion.div
            custom={3} initial="hidden" animate="visible" variants={cardVariants}
            className="bg-white rounded-xl overflow-hidden"
            style={{ border: "0.5px solid #e5e5e5", boxShadow: "0 8px 32px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)" }}
          >
            <div className="px-4 pt-4 pb-3">
              <h3 className="text-[12px] font-bold text-[#0a0a0a]">Improve AI Visibility</h3>
              <p className="text-[10px] text-[#6b7280] mt-0.5">Start here to rank higher</p>
            </div>

            {(llmsTxtExists
              ? [
                  { bg: "#fff0e6", logo: "reddit.com",      label: "Engage on Reddit",   sub: "10 threads ready for you",          impact: "",     impactBg: "",        impactFg: "",        page: "engagement-threads",  clickable: true, btnLabel: "View Threads →" },
                  { bg: "#e8f4fd", logo: "g2.com",          label: "Comparison Pages",   sub: "Outrank competitors in AI answers", impact: "High", impactBg: "#dcfce7", impactFg: "#15803d", page: "fixes:comparison",    clickable: true, btnLabel: "Create →"       },
                  { bg: "#f3eeff", logo: "producthunt.com", label: "Listicles",          sub: "G2, Product Hunt, Capterra",        impact: "Med",  impactBg: "#fef9c3", impactFg: "#854d0e", page: "fixes:listicles",     clickable: true, btnLabel: "View →"         },
                ]
              : [
                  { bg: "#fff0e6", logo: "reddit.com",  label: "Engage on Reddit",   sub: "10 threads ready for you",          impact: "",     impactBg: "",        impactFg: "",        page: "engagement-threads",  clickable: true, btnLabel: "View Threads →" },
                  { bg: "#e8f5e9", logo: "llmstxt.org", label: "Generate llms.txt",  sub: "Enhance how AI talks about you",    impact: "High", impactBg: "#dcfce7", impactFg: "#15803d", page: "fixes:llms-txt",      clickable: true, btnLabel: "Generate →"     },
                  { bg: "#e8f4fd", logo: "g2.com",      label: "Comparison Pages",   sub: "Outrank competitors in AI answers", impact: "High", impactBg: "#dcfce7", impactFg: "#15803d", page: "fixes:comparison",    clickable: true, btnLabel: "Create →"       },
                ]
            ).map((item) => (
              <div key={item.label} className="px-4 py-3" style={{ borderTop: "0.5px solid #f0f0f0" }}>
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 overflow-hidden" style={{ background: item.bg }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${item.logo}&sz=32`}
                      alt={item.label}
                      width={16} height={16}
                      className="w-4 h-4 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1 mb-0.5">
                      <p className="text-[12px] font-bold text-[#0a0a0a] leading-tight truncate">{item.label}</p>
                      {item.impact && (
                        <span
                          className="shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{ background: item.impactBg, color: item.impactFg }}
                        >
                          {item.impact} impact
                        </span>
                      )}
                    </div>
                    {item.sub && <p className="text-[10px] text-[#6b7280]">{item.sub}</p>}
                    {demoMode ? (
                      <button
                        disabled
                        title="Available on actual audit"
                        className="mt-1.5 text-[10px] font-semibold text-[#c4c4c4] rounded px-2 py-0.5 cursor-not-allowed"
                        style={{ border: "0.5px solid #eeeeee" }}
                      >
                        {item.btnLabel}
                      </button>
                    ) : (
                      <button
                        onClick={() => onNavigate(item.page)}
                        className="mt-1.5 text-[10px] font-semibold text-[#6b7280] rounded px-2 py-0.5 hover:text-[#5B2D91] hover:border-[#5B2D91] transition-colors"
                        style={{ border: "0.5px solid #e5e5e5", boxShadow: "0 8px 32px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)" }}
                      >
                        {item.btnLabel}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* What AI Says */}
          <motion.div
            custom={4} initial="hidden" animate="visible" variants={cardVariants}
            className="bg-white rounded-xl overflow-hidden flex-1"
            style={{ border: "0.5px solid #e5e5e5", boxShadow: "0 8px 32px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)" }}
          >
            <div className="px-4 pt-4 pb-3">
              <h3 className="text-[12px] font-bold text-[#0a0a0a]">What AI says about you</h3>
              <p className="text-[10px] text-[#6b7280] mt-0.5">From &apos;What is...&apos; and brand prompts</p>
            </div>

            {aiMentions.length === 0 ? (
              <p className="px-4 pb-4 text-[12px] text-[#9ca3af] italic">No responses recorded yet.</p>
            ) : (() => {
              const p = aiMentions[0];
              const raw = p.response_text || "";
              const truncated = raw.length > 180 ? raw.slice(0, 180) : raw;
              const hasMore = raw.length > 180;
              const escaped = brandName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              const parts = truncated.split(new RegExp(`(${escaped})`, "gi"));
              return (
                <div className="px-4 pb-4" style={{ borderTop: "0.5px solid #f0f0f0", paddingTop: 12 }}>
                  <p className="text-[10px] italic text-[#9ca3af] mb-1.5 truncate">{p.prompt}</p>
                  <p className="text-[12px] text-[#0a0a0a] leading-[1.6]">
                    {parts.map((part, j) =>
                      part.toLowerCase() === brandName.toLowerCase()
                        ? <span key={j} className="font-bold text-[#5B2D91]">{part}</span>
                        : part
                    )}
                    {hasMore && <span className="text-[#9ca3af]">…</span>}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10a37f]" />
                    <span className="text-[10px] text-[#9ca3af]">ChatGPT · Prompt #1</span>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        </div>

      </div>

      {/* ── Prompt Performance ── */}
      <motion.div
        custom={5} initial="hidden" animate="visible" variants={cardVariants}
        className="mx-6 mb-6 bg-white rounded-xl overflow-hidden"
        style={{ border: "0.5px solid #e5e5e5", boxShadow: "0 8px 32px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)" }}
      >
        {/* Card header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between" style={{ borderBottom: "0.5px solid #f0f0f0" }}>
          <div>
            <h3 className="text-[13px] font-bold text-[#0a0a0a]">Prompt Performance</h3>
            <p className="text-[11px] text-[#6b7280] mt-0.5">How each prompt performed across AI models</p>
          </div>
          <button
            onClick={() => onNavigate("prompts")}
            className="text-[11px] font-semibold text-[#5B2D91] hover:underline shrink-0"
          >
            Explore all prompts →
          </button>
        </div>

        {/* Table column headers */}
        <div className="grid grid-cols-[1fr_88px_96px_88px] px-5 py-2.5" style={{ borderBottom: "0.5px solid #f0f0f0" }}>
          <span className="text-[11px] font-semibold text-[#0a0a0a]">Prompts</span>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#6b7280]">
            Visibility <ChevronDown className="w-3 h-3 opacity-40" />
          </span>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#6b7280]">
            Model <ChevronsUpDown className="w-3 h-3 opacity-40" />
          </span>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#6b7280]">
            Position <ChevronsUpDown className="w-3 h-3 opacity-40" />
          </span>
        </div>

        {/* Table rows */}
        <div>
          {activePromptResults.slice(0, 6).map((r, i) => {
            const model = PROMPT_MODELS[i];
            const modelColor = MODEL_META[model?.name]?.color ?? "#aaaaaa";
            const visPct = r.mentioned
              ? Math.max(20, 100 - ((r.position ?? 1) - 1) * 20)
              : 0;
            return (
              <div
                key={i}
                className="grid grid-cols-[1fr_88px_96px_88px] items-center px-5 py-3 hover:bg-[#fafafa] transition-colors"
                style={{ borderTop: "0.5px solid #f5f5f5" }}
              >
                {/* Prompt text */}
                <p className="text-[12px] text-[#0a0a0a] leading-snug pr-5">{r.prompt}</p>

                {/* Visibility pill */}
                <div>
                  <span className="inline-flex items-center gap-1.5 bg-[#f5f5f5] rounded-lg px-2.5 py-1">
                    <Eye className="w-3 h-3 text-[#6b7280]" />
                    <span className="text-[11px] font-semibold text-[#0a0a0a]">{visPct}%</span>
                  </span>
                </div>

                {/* Model pill */}
                <div>
                  <span className="inline-flex items-center gap-1.5 bg-[#f5f5f5] rounded-lg px-2.5 py-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${model?.domain}&sz=32`}
                      alt={model?.name} width={12} height={12}
                      className="w-3 h-3 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <span className="text-[11px] font-medium" style={{ color: modelColor }}>{model?.name}</span>
                  </span>
                </div>

                {/* Position pill */}
                <div>
                  <span className="inline-flex items-center gap-1 bg-[#f5f5f5] rounded-lg px-2.5 py-1">
                    <span className="text-[10px] text-[#aaaaaa] font-medium">#</span>
                    <span className="text-[11px] font-semibold text-[#0a0a0a]">
                      {r.mentioned && r.position != null ? r.position : "—"}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        {activePromptResults.length > 6 && (
          <div className="px-5 py-3" style={{ borderTop: "0.5px solid #f0f0f0" }}>
            <button
              onClick={() => onNavigate("prompts")}
              className="w-full py-2 rounded-lg text-[12px] font-semibold text-[#5B2D91] hover:bg-[#f3eeff] transition-colors"
              style={{ border: "0.5px solid #e8d8ff" }}
            >
              Explore {activePromptResults.length - 6} more prompts →
            </button>
          </div>
        )}
      </motion.div>

    </div>
  );
}

