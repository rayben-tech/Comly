"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Bot, Copy, Check, TrendingUp, Zap, Globe, X, Code2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { supabase } from "@/lib/supabase";
import { BrandProfile } from "@/types";

interface VisitRow  { source: string; type: string; created_at: string; page_url: string | null; }
interface ChartPoint { date: string; [source: string]: number | string; }
interface SparkPoint { v: number; }

const LLM_COLORS: Record<string, string> = {
  ChatGPT:    "#10a37f",
  Perplexity: "#20b2aa",
  Claude:     "#d97706",
  Gemini:     "#4285f4",
  Copilot:    "#0078d4",
};
const LLM_ICONS: Record<string, string> = {
  ChatGPT:    "https://www.google.com/s2/favicons?domain=chatgpt.com&sz=32",
  Perplexity: "https://www.google.com/s2/favicons?domain=perplexity.ai&sz=32",
  Claude:     "https://www.google.com/s2/favicons?domain=claude.ai&sz=32",
  Gemini:     "https://www.google.com/s2/favicons?domain=gemini.google.com&sz=32",
  Copilot:    "https://www.google.com/s2/favicons?domain=copilot.microsoft.com&sz=32",
};

function getScript(token: string) {
  return `<script>
(function(){
  var T='${token}';
  var V={'chatgpt.com':'ChatGPT','chat.openai.com':'ChatGPT','perplexity.ai':'Perplexity','claude.ai':'Claude','gemini.google.com':'Gemini','copilot.microsoft.com':'Copilot','bing.com':'Copilot'};
  var B={'GPTBot':'ChatGPT','ClaudeBot':'Claude','PerplexityBot':'Perplexity','anthropic-ai':'Claude','Googlebot-Extended':'Gemini'};
  var ua=navigator.userAgent,ref=document.referrer,src=null,type='visitor';
  for(var b in B){if(ua.indexOf(b)!==-1){src=B[b];type='bot';break;}}
  if(!src){for(var d in V){if(ref.indexOf(d)!==-1){src=V[d];break;}}}
  if(!src)return;
  fetch('https://www.trycomly.com/api/track',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:T,source:src,type:type,url:window.location.href}),keepalive:true}).catch(function(){});
})();
<\/script>`.trim();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#e8e8e8] rounded-xl shadow-lg px-4 py-3 text-[12px]">
      <p className="font-bold text-[#0a0a0a] mb-2">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <div key={p.name} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-[#6b6b6b]">{p.name}</span>
          <span className="font-semibold text-[#0a0a0a] ml-auto pl-4">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function Sparkline({ data, color }: { data: SparkPoint[]; color: string }) {
  return (
    <LineChart width={80} height={32} data={data}>
      <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
    </LineChart>
  );
}

const CARD = "bg-white border border-[#e5e5e5] rounded-2xl";
const CARD_STYLE = { border: "0.5px solid #e5e5e5", boxShadow: "0 8px 32px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)" };
const TH = "text-[11px] font-bold text-[#aaaaaa] uppercase tracking-wide pb-3 text-left";
const TD = "py-3 border-t border-[#f5f5f5]";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1], delay },
});

const DEMO_MODE_TOTALS = [
  { source: "ChatGPT",    count: 1203 },
  { source: "Perplexity", count: 684  },
  { source: "Gemini",     count: 521  },
  { source: "Claude",     count: 312  },
  { source: "Copilot",    count: 127  },
];
const DEMO_MODE_SRCS = DEMO_MODE_TOTALS.map(t => t.source);
const DEMO_MODE_TOTAL = 2847;
const DEMO_MODE_SPARKLINES: Record<string, SparkPoint[]> = {
  ChatGPT:    [{ v:72 },{ v:78 },{ v:74 },{ v:83 },{ v:91 },{ v:88 },{ v:96 },{ v:94 },{ v:102 },{ v:109 },{ v:105 },{ v:114 },{ v:118 },{ v:116 }],
  Perplexity: [{ v:38 },{ v:42 },{ v:40 },{ v:45 },{ v:51 },{ v:48 },{ v:55 },{ v:53 },{ v:59 },{ v:62 },{ v:58 },{ v:66 },{ v:70 },{ v:63 }],
  Gemini:     [{ v:28 },{ v:31 },{ v:29 },{ v:34 },{ v:38 },{ v:36 },{ v:42 },{ v:40 },{ v:45 },{ v:47 },{ v:44 },{ v:50 },{ v:53 },{ v:49 }],
  Claude:     [{ v:16 },{ v:19 },{ v:17 },{ v:22 },{ v:25 },{ v:23 },{ v:28 },{ v:26 },{ v:30 },{ v:29 },{ v:32 },{ v:35 },{ v:31 },{ v:34 }],
  Copilot:    [{ v:6  },{ v:8  },{ v:7  },{ v:9  },{ v:11 },{ v:10 },{ v:12 },{ v:11 },{ v:13 },{ v:12 },{ v:14 },{ v:13 },{ v:15 },{ v:14 }],
};
const DEMO_MODE_PAGES = [
  { path: "/blog/ai-seo-guide",   count: 423 },
  { path: "/pricing",             count: 312 },
  { path: "/features",            count: 287 },
  { path: "/",                    count: 241 },
  { path: "/templates",           count: 198 },
  { path: "/blog/ai-tools-2025",  count: 142 },
  { path: "/integrations",        count: 87  },
  { path: "/changelog",           count: 61  },
];
const DEMO_MODE_BOTS = [
  { source: "ChatGPT",    count: 8234, lastSeen: "2 hours ago"  },
  { source: "Claude",     count: 2891, lastSeen: "5 hours ago"  },
  { source: "Gemini",     count: 1847, lastSeen: "1 day ago"    },
  { source: "Perplexity", count: 623,  lastSeen: "3 days ago"   },
];
const DEMO_MODE_CRAWLED_PAGES = [
  { path: "/blog/ai-seo-guide",  count: 1842 },
  { path: "/",                   count: 1234 },
  { path: "/pricing",            count: 987  },
  { path: "/features",           count: 743  },
  { path: "/blog/ai-tools-2025", count: 621  },
  { path: "/integrations",       count: 487  },
  { path: "/templates",          count: 352  },
  { path: "/changelog",          count: 269  },
];

interface Props {
  userId?: string;
  profile: BrandProfile;
  demoMode?: boolean;
}

export function VisitorsPage({ profile, demoMode }: Props) {
  const [tab,        setTab]        = useState<"visitors" | "crawlers">("visitors");
  const [token,      setToken]      = useState<string | null>(null);
  const [rawVisits,  setRawVisits]  = useState<VisitRow[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [modalCopied, setModalCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (demoMode) {
      setToken("demo_token_notion_xxxx1234");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        let { data: row } = await supabase
          .from("llm_tracking_tokens")
          .select("token")
          .eq("user_id", user.id)
          .single();

        if (!row) {
          const { data: created } = await supabase
            .from("llm_tracking_tokens")
            .insert({ user_id: user.id })
            .select("token")
            .single();
          row = created;
        }

        if (!row?.token) { setLoading(false); return; }
        setToken(row.token);

        const { data: visits } = await supabase
          .from("llm_visits")
          .select("source, type, created_at, page_url")
          .eq("token", row.token)
          .order("created_at", { ascending: true });

        setRawVisits(visits ?? []);
      } catch (e) {
        console.error("visitors-page error:", e);
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoMode]);

  const visitors = useMemo(() => rawVisits.filter(v => v.type !== "bot"), [rawVisits]);
  const bots     = useMemo(() => rawVisits.filter(v => v.type === "bot"),  [rawVisits]);

  const activeRows = tab === "visitors" ? visitors : bots;
  const isUnlocked = demoMode || rawVisits.length > 0;

  const totals = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of activeRows) map.set(v.source, (map.get(v.source) ?? 0) + 1);
    return Array.from(map.entries()).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count);
  }, [activeRows]);

  const totalCount = activeRows.length;
  const topSource  = totals[0] ?? null;

  const { chartData, sources } = useMemo(() => {
    const src = Array.from(new Set(activeRows.map(v => v.source)));
    const dayMap = new Map<string, Record<string, number>>();
    for (const v of activeRows) {
      const day = v.created_at.slice(0, 10);
      if (!dayMap.has(day)) dayMap.set(day, {});
      const d = dayMap.get(day)!;
      d[v.source] = (d[v.source] ?? 0) + 1;
    }
    const data: ChartPoint[] = Array.from(dayMap.entries()).map(([date, counts]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      ...counts,
    }));
    return { chartData: data, sources: src };
  }, [activeRows]);

  const sparklines = useMemo(() => {
    const days: string[] = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (13 - i));
      return d.toISOString().slice(0, 10);
    });
    const result: Record<string, SparkPoint[]> = {};
    for (const src of sources) {
      result[src] = days.map(day => ({
        v: activeRows.filter(v => v.source === src && v.created_at.slice(0, 10) === day).length,
      }));
    }
    return result;
  }, [activeRows, sources]);

  const topPages = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of activeRows) {
      try {
        const path = v.page_url ? new URL(v.page_url).pathname : "/";
        map.set(path, (map.get(path) ?? 0) + 1);
      } catch { map.set("/", (map.get("/") ?? 0) + 1); }
    }
    return Array.from(map.entries())
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [activeRows]);

  const botLastSeen = useMemo(() => {
    const map = new Map<string, string>();
    for (const v of bots) {
      const prev = map.get(v.source);
      if (!prev || v.created_at > prev) map.set(v.source, v.created_at);
    }
    return map;
  }, [bots]);

  const botTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of bots) map.set(v.source, (map.get(v.source) ?? 0) + 1);
    return Array.from(map.entries()).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count);
  }, [bots]);

  function copyModalScript() {
    if (!token) return;
    navigator.clipboard.writeText(getScript(token));
    setModalCopied(true);
    setTimeout(() => setModalCopied(false), 2000);
  }

  const DEMO_TOTALS = [
    { source: "ChatGPT", count: 47 },
    { source: "Perplexity", count: 23 },
    { source: "Gemini", count: 12 },
  ];
  const DEMO_CHART: ChartPoint[] = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      ChatGPT:    Math.floor(2 + Math.random() * 6),
      Perplexity: Math.floor(1 + Math.random() * 3),
      Gemini:     Math.floor(0 + Math.random() * 2),
    };
  });
  const DEMO_SPARKLINES: Record<string, SparkPoint[]> = {
    ChatGPT:    Array.from({ length: 14 }, () => ({ v: Math.floor(1 + Math.random() * 6) })),
    Perplexity: Array.from({ length: 14 }, () => ({ v: Math.floor(0 + Math.random() * 4) })),
    Gemini:     Array.from({ length: 14 }, () => ({ v: Math.floor(0 + Math.random() * 2) })),
  };
  const DEMO_PAGES = [
    { path: "/pricing", count: 23 },
    { path: "/features", count: 17 },
    { path: "/", count: 12 },
    { path: "/blog/ai-seo", count: 8 },
    { path: "/about", count: 5 },
  ];
  const DEMO_BOTS = [
    { source: "ChatGPT",    count: 312, lastSeen: "2 hours ago" },
    { source: "Claude",     count: 187, lastSeen: "5 hours ago" },
    { source: "Gemini",     count: 94,  lastSeen: "1 day ago"   },
    { source: "Perplexity", count: 61,  lastSeen: "3 days ago"  },
  ];
  const DEMO_CRAWLED_PAGES = [
    { path: "/",             count: 98 },
    { path: "/pricing",      count: 74 },
    { path: "/blog/ai-seo",  count: 53 },
    { path: "/features",     count: 41 },
    { path: "/about",        count: 29 },
  ];

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  const demoModeChart = useMemo<ChartPoint[]>(() => {
    const values = [
      [72, 38, 28, 16, 6], [78, 42, 31, 19, 8], [74, 40, 29, 17, 7],
      [83, 45, 34, 22, 9], [91, 51, 38, 25, 11],[88, 48, 36, 23, 10],
      [96, 55, 42, 28, 12],[94, 53, 40, 26, 11],[102,59, 45, 30, 13],
      [109,62, 47, 29, 12],[105,58, 44, 32, 14],[114,66, 50, 35, 13],
      [118,70, 53, 31, 15],[116,63, 49, 34, 14],
    ];
    return values.map((row, i) => {
      const d = new Date(); d.setDate(d.getDate() - (13 - i));
      const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return { date, ChatGPT: row[0]!, Perplexity: row[1]!, Gemini: row[2]!, Claude: row[3]!, Copilot: row[4]! };
    });
  }, []);

  const isPreview = demoMode || previewMode;

  const displayTotals    = isPreview ? DEMO_MODE_TOTALS : isUnlocked ? totals     : DEMO_TOTALS;
  const displayChart     = isPreview ? demoModeChart : isUnlocked ? chartData  : DEMO_CHART;
  const displaySrcs      = isPreview ? DEMO_MODE_SRCS    : isUnlocked ? sources    : ["ChatGPT", "Perplexity", "Gemini"];
  const displayTotal     = isPreview ? DEMO_MODE_TOTAL   : isUnlocked ? totalCount : 82;
  const displayTop       = isPreview ? DEMO_MODE_TOTALS[0]! : isUnlocked ? topSource  : { source: "ChatGPT", count: 47 };
  const displaySparks    = isPreview ? DEMO_MODE_SPARKLINES : isUnlocked ? sparklines : DEMO_SPARKLINES;
  const displayPages     = isPreview ? DEMO_MODE_PAGES   : isUnlocked ? topPages   : DEMO_PAGES;
  const displayBots      = isPreview ? DEMO_MODE_BOTS    : isUnlocked ? botTotals.map(({ source, count }) => ({
    source, count, lastSeen: timeAgo(botLastSeen.get(source) ?? new Date().toISOString()),
  })) : DEMO_BOTS;
  const displayCrawledPages = isPreview ? DEMO_MODE_CRAWLED_PAGES : isUnlocked ? topPages : DEMO_CRAWLED_PAGES;
  const totalBotCrawls   = isPreview ? 13595 : isUnlocked ? bots.length : 654;
  const botsDetected     = isPreview ? 4     : isUnlocked ? botTotals.length : 4;

  return (
    <>
    <div className="p-6 space-y-4">

      {/* Header card — animates in on mount */}
      <motion.div className={`${CARD} px-8 pt-7 pb-0`} style={CARD_STYLE} {...fadeUp(0)}>
        <div className="flex items-start justify-between gap-4 pb-5">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h2 className="text-[18px] font-bold text-[#0a0a0a]">Traffic</h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">Pro</span>
            </div>
            <p className="text-[13px] text-[#6b6b6b]">
              See real visits and bot crawls from AI tools for {profile.brand_name}.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!demoMode && !isUnlocked && (
              <button
                onClick={() => setPreviewMode(v => !v)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[12px] font-semibold transition-colors"
                style={previewMode
                  ? { borderColor: "#c4b5fd", background: "#f3eeff", color: "#5B2D91" }
                  : { borderColor: "#e5e5e5", background: "#fafafa", color: "#6b6b6b" }
                }
              >
                <Zap className="w-3.5 h-3.5" />
                {previewMode ? "Exit preview" : "Preview sample data"}
              </button>
            )}
            {token && (
              <button
                onClick={() => setModalOpen(true)}
                className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[12px] font-semibold transition-colors"
                style={isUnlocked
                  ? { borderColor: "#d1fae5", background: "#f0fdf4", color: "#059669" }
                  : { borderColor: "#e5e5e5", background: "#fafafa", color: "#6b6b6b" }
                }
              >
                {isUnlocked
                  ? <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Active · View script</>
                  : <><Code2 className="w-3.5 h-3.5" /> Get snippet</>
                }
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-[#f0f0f0]">
          {(["visitors", "crawlers"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 pb-4 px-1 mr-6 text-[13px] font-semibold border-b-2 transition-colors ${
                tab === t ? "border-[#5B2D91] text-[#5B2D91]" : "border-transparent text-[#aaaaaa] hover:text-[#6b6b6b]"
              }`}
            >
              {t === "visitors" ? <Users className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {loading ? (
        <motion.div className={`${CARD} py-16 flex justify-center`} style={CARD_STYLE} {...fadeUp(0.08)}>
          <div className="w-6 h-6 border-2 border-[#5B2D91] border-t-transparent rounded-full animate-spin" />
        </motion.div>
      ) : (
        <div className={`relative space-y-4 ${!isUnlocked ? "select-none" : ""}`}>

          {/* Blur overlay */}
          {!isUnlocked && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 backdrop-blur-[5px] bg-[#ddd5f5]/40 rounded-2xl">
              <div className="bg-white border border-[#e8e8e8] rounded-2xl px-8 py-6 shadow-lg text-center max-w-sm">
                <p className="text-[15px] font-bold text-[#0a0a0a] mb-1">Install the snippet to unlock</p>
                <p className="text-[13px] text-[#6b6b6b] leading-relaxed">
                  Paste the tracking script in your site&apos;s <code className="font-mono bg-[#f3eeff] text-[#5B2D91] px-1 rounded">&lt;head&gt;</code> and real visitor data will appear here.
                </p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}
                >
                  Get snippet
                </button>
                <p className="mt-3 text-[11px] text-[#aaaaaa] flex items-center gap-1.5 justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#aaaaaa] inline-block shrink-0" />
                  Data appears after your first AI-referred visit or crawl
                </p>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className={!isUnlocked ? "blur-[3px] pointer-events-none space-y-4" : "space-y-4"}
            >

              {tab === "visitors" ? (
                <>
                  {/* Visitors — 3 stat cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className={`${CARD} px-6 py-5`} style={CARD_STYLE}>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-[#aaaaaa] uppercase tracking-wide mb-3">
                        <Users className="w-3.5 h-3.5" />
                        AI Sessions
                      </div>
                      <p className="text-[30px] font-black text-[#0a0a0a] leading-none">{displayTotal.toLocaleString()}</p>
                      <p className="text-[12px] text-[#aaaaaa] mt-1.5">{displayTotals.length} AI source{displayTotals.length !== 1 ? "s" : ""}</p>
                    </div>
                    <div className={`${CARD} px-6 py-5`} style={CARD_STYLE}>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-[#aaaaaa] uppercase tracking-wide mb-3">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Top AI Source
                      </div>
                      {displayTop && (
                        <div className="flex items-center gap-2.5 mb-1.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={LLM_ICONS[displayTop.source] ?? ""} alt={displayTop.source} width={22} height={22} className="w-[22px] h-[22px] rounded-sm" />
                          <p className="text-[22px] font-black text-[#0a0a0a] leading-none">{displayTop.source}</p>
                        </div>
                      )}
                      <p className="text-[12px] text-[#aaaaaa]">{displayTop?.count ?? 0} sessions</p>
                    </div>
                    <div className={`${CARD} px-6 py-5`} style={CARD_STYLE}>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-[#aaaaaa] uppercase tracking-wide mb-3">
                        <Zap className="w-3.5 h-3.5" />
                        Sources Detected
                      </div>
                      <p className="text-[30px] font-black text-[#0a0a0a] leading-none">{displayTotals.length}</p>
                      <p className="text-[12px] text-[#aaaaaa] mt-1.5">
                        {displayTotals.length > 0 ? displayTotals.map(t => t.source).join(", ") : "None yet"}
                      </p>
                    </div>
                  </div>

                  {/* Chart + source breakdown */}
                  <div className="grid grid-cols-[1fr_280px] gap-4 items-stretch">
                    <div className={`${CARD} px-8 pt-6 pb-5`} style={CARD_STYLE}>
                      <p className="text-[12px] font-bold text-[#aaaaaa] uppercase tracking-wide mb-4">AI referral traffic</p>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={displayChart} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                          <defs>
                            {displaySrcs.map(src => (
                              <linearGradient key={src} id={`grad-${src}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor={LLM_COLORS[src] ?? "#5B2D91"} stopOpacity={0.25} />
                                <stop offset="95%" stopColor={LLM_COLORS[src] ?? "#5B2D91"} stopOpacity={0.02} />
                              </linearGradient>
                            ))}
                          </defs>
                          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#aaaaaa" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: "#aaaaaa" }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip content={<CustomTooltip />} />
                          {displaySrcs.map(src => (
                            <Area key={src} type="monotone" dataKey={src} stackId="1"
                              stroke={LLM_COLORS[src] ?? "#5B2D91"} strokeWidth={2} fill={`url(#grad-${src})`} />
                          ))}
                        </AreaChart>
                      </ResponsiveContainer>
                      <div className="flex items-center gap-4 mt-3">
                        {displaySrcs.map(src => (
                          <div key={src} className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: LLM_COLORS[src] ?? "#5B2D91" }} />
                            <span className="text-[11px] text-[#6b6b6b] font-medium">{src}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`${CARD} px-6 py-6 flex flex-col`} style={CARD_STYLE}>
                      <p className="text-[11px] font-bold text-[#aaaaaa] uppercase tracking-wide mb-4">By source</p>
                      <div className="space-y-4 flex-1">
                        {displayTotals.map(({ source, count }) => {
                          const pct = Math.round((count / Math.max(1, displayTotal)) * 100);
                          return (
                            <div key={source} className="flex items-center gap-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={LLM_ICONS[source] ?? ""} alt={source} width={18} height={18} className="w-[18px] h-[18px] rounded-sm shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[13px] font-semibold text-[#0a0a0a]">{source}</span>
                                  <span className="text-[13px] font-semibold text-[#6b6b6b]">{count}</span>
                                </div>
                                <div className="h-1.5 w-full bg-[#f0f0f0] rounded-full overflow-hidden">
                                  <div className="h-full rounded-full transition-all duration-700"
                                    style={{ width: `${pct}%`, backgroundColor: LLM_COLORS[source] ?? "#5B2D91" }} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {isUnlocked && totals.length === 0 && (
                          <p className="text-[13px] text-[#aaaaaa] text-center py-4">No traffic yet.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sources table + Top pages table */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`${CARD} px-6 py-6`} style={CARD_STYLE}>
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className={`${TH} w-full`}>Source</th>
                            <th className={`${TH} pr-4`}>Trend</th>
                            <th className={`${TH} text-right whitespace-nowrap`}>Sessions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayTotals.map(({ source, count }) => (
                            <tr key={source}>
                              <td className={TD}>
                                <div className="flex items-center gap-2.5">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={LLM_ICONS[source] ?? ""} alt={source} width={16} height={16} className="w-4 h-4 rounded-sm shrink-0" />
                                  <span className="text-[13px] font-semibold text-[#0a0a0a]">{source}</span>
                                </div>
                              </td>
                              <td className={`${TD} pr-2`}>
                                <Sparkline data={displaySparks[source] ?? Array.from({ length: 14 }, () => ({ v: 0 }))} color={LLM_COLORS[source] ?? "#5B2D91"} />
                              </td>
                              <td className={`${TD} text-right`}>
                                <span className="text-[13px] font-semibold text-[#0a0a0a]">{count}</span>
                              </td>
                            </tr>
                          ))}
                          {displayTotals.length === 0 && (
                            <tr><td colSpan={3} className="py-6 text-center text-[13px] text-[#aaaaaa]">No data yet.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className={`${CARD} px-6 py-6`} style={CARD_STYLE}>
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className={`${TH} w-full`}>Page</th>
                            <th className={`${TH} text-right whitespace-nowrap`}>Sessions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayPages.map(({ path, count }) => (
                            <tr key={path}>
                              <td className={TD}>
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <Globe className="w-3.5 h-3.5 text-[#cccccc] shrink-0" />
                                  <span className="text-[13px] font-medium text-[#0a0a0a] truncate">{path}</span>
                                </div>
                              </td>
                              <td className={`${TD} text-right`}>
                                <span className="text-[13px] font-semibold text-[#0a0a0a]">{count}</span>
                              </td>
                            </tr>
                          ))}
                          {displayPages.length === 0 && (
                            <tr><td colSpan={2} className="py-6 text-center text-[13px] text-[#aaaaaa]">No pages tracked yet.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Crawlers — 2 stat cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`${CARD} px-6 py-5`} style={CARD_STYLE}>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-[#aaaaaa] uppercase tracking-wide mb-3">
                        <Bot className="w-3.5 h-3.5" />
                        Total Crawls
                      </div>
                      <p className="text-[30px] font-black text-[#0a0a0a] leading-none">{totalBotCrawls.toLocaleString()}</p>
                      <p className="text-[12px] text-[#aaaaaa] mt-1.5">indexing events detected</p>
                    </div>
                    <div className={`${CARD} px-6 py-5`} style={CARD_STYLE}>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-[#aaaaaa] uppercase tracking-wide mb-3">
                        <Zap className="w-3.5 h-3.5" />
                        Bots Detected
                      </div>
                      <p className="text-[30px] font-black text-[#0a0a0a] leading-none">{botsDetected}</p>
                      <p className="text-[12px] text-[#aaaaaa] mt-1.5">
                        {displayBots.map(b => b.source).join(", ") || "None yet"}
                      </p>
                    </div>
                  </div>

                  {/* Bot table + Crawled pages — side by side */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`${CARD} px-6 py-6`} style={CARD_STYLE}>
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className={`${TH} w-full`}>Bot</th>
                            <th className={`${TH} text-right whitespace-nowrap pr-4`}>Crawls</th>
                            <th className={`${TH} text-right whitespace-nowrap`}>Last seen</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayBots.map(({ source, count, lastSeen }) => (
                            <tr key={source}>
                              <td className={TD}>
                                <div className="flex items-center gap-2.5">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={LLM_ICONS[source] ?? ""} alt={source} width={16} height={16} className="w-4 h-4 rounded-sm shrink-0" />
                                  <span className="text-[13px] font-semibold text-[#0a0a0a]">{source}Bot</span>
                                </div>
                              </td>
                              <td className={`${TD} text-right pr-4`}>
                                <span className="text-[13px] font-semibold text-[#0a0a0a]">{count}</span>
                              </td>
                              <td className={`${TD} text-right`}>
                                <span className="text-[12px] text-[#aaaaaa]">{lastSeen}</span>
                              </td>
                            </tr>
                          ))}
                          {displayBots.length === 0 && (
                            <tr><td colSpan={3} className="py-6 text-center text-[13px] text-[#aaaaaa]">No bots detected yet.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className={`${CARD} px-6 py-6`} style={CARD_STYLE}>
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className={`${TH} w-full`}>Most crawled pages</th>
                            <th className={`${TH} text-right whitespace-nowrap`}>Hits</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayCrawledPages.map(({ path, count }) => (
                            <tr key={path}>
                              <td className={TD}>
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <Globe className="w-3.5 h-3.5 text-[#cccccc] shrink-0" />
                                  <span className="text-[13px] font-medium text-[#0a0a0a] truncate">{path}</span>
                                </div>
                              </td>
                              <td className={`${TD} text-right`}>
                                <span className="text-[13px] font-semibold text-[#0a0a0a]">{count}</span>
                              </td>
                            </tr>
                          ))}
                          {displayCrawledPages.length === 0 && (
                            <tr><td colSpan={2} className="py-6 text-center text-[13px] text-[#aaaaaa]">No crawls recorded yet.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      )}


    </div>

      {/* Snippet modal */}
      <AnimatePresence>
        {modalOpen && token && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            >
              <div
                className="pointer-events-auto w-full max-w-lg bg-white rounded-2xl overflow-hidden"
                style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.1)" }}
              >
                <div className="flex items-start justify-between px-6 pt-6 pb-4">
                  <div>
                    <h3 className="text-[16px] font-bold text-[#0a0a0a]">Install tracking script</h3>
                    <p className="text-[13px] text-[#6b6b6b] mt-0.5">
                      Paste this before the closing <code className="font-mono bg-[#f3eeff] text-[#5B2D91] px-1 rounded text-[11px]">&lt;/head&gt;</code> tag on every page.
                    </p>
                  </div>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="ml-4 mt-0.5 p-1.5 rounded-lg text-[#aaaaaa] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="px-6 pb-6">
                  <div className="relative rounded-xl overflow-hidden">
                    <pre className="bg-[#0a0a0a] text-[#a78bfa] text-[11px] leading-relaxed px-5 py-4 font-mono overflow-x-auto whitespace-pre-wrap break-all">
                      {getScript(token)}
                    </pre>
                    <button
                      onClick={copyModalScript}
                      className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-colors"
                    >
                      {modalCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {modalCopied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="mt-4 w-full py-2.5 rounded-xl text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
