"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  MessageCircle, ThumbsUp, Check, ExternalLink, Sparkles,
  Bookmark, X, CornerUpLeft, ArrowUpDown, Info, RefreshCw, Link,
} from "lucide-react";
import { BrandProfile } from "@/types";

interface Thread {
  id: string;
  subreddit: string;
  title: string;
  url: string;
  upvotes?: number;
  comments?: number;
  age?: string;
}

interface Props {
  profile: BrandProfile;
  demoMode?: boolean;
  demoThreads?: Thread[];
}

type FilterTab = "new" | "saved" | "replied" | "all";
type SortOption = "newest" | "oldest" | "relevance-high" | "relevance-low" | "upvotes" | "comments";

// ── helpers ────────────────────────────────────────────────────────────────

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}
function loadSet(key: string): Set<string> {
  try { const v = localStorage.getItem(key); return v ? new Set(JSON.parse(v)) : new Set(); }
  catch { return new Set(); }
}
function saveSet(key: string, set: Set<string>) {
  try { localStorage.setItem(key, JSON.stringify([...set])); } catch {}
}
function loadThreads(key: string): Thread[] {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : []; }
  catch { return []; }
}
function saveThreads(key: string, threads: Thread[]) {
  try { localStorage.setItem(key, JSON.stringify(threads)); } catch {}
}

// ── constants ──────────────────────────────────────────────────────────────

function fmt(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n); }

function extractKeyword(title: string): string {
  const stop = new Set(["a","an","the","is","are","was","were","be","to","for","of","in","on","at","by","with","and","or","but","if","i","me","my","we","our","you","your","he","she","it","they","what","which","who","this","that","how","why","where","just","now","still","one","can","should","would","could","when","do","does","has","have","did","will","not","any","some","vs","like","get","use","using","ever","else","its","also","more","than","very","need","want","anyone","someone","best","good","great","bad","new"]);
  const words = title.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 2 && !stop.has(w));
  return words.slice(0, 2).join(" ");
}

const RELEVANCE_ORDER: Record<string, number> = {
  "Pain point": 5, "Comparison": 4, "Recommendation": 3, "How-to": 2, "Discussion": 1,
};

function getRelevanceTag(title: string): { label: string; color: string; bg: string; border: string } {
  const t = title.toLowerCase();
  if (/\bvs\b|versus|compar|alternative|better than|difference between/.test(t))
    return { label: "Comparison",     color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe" };
  if (/recommend|best\b|which|what.*tool|suggest|looking for/.test(t))
    return { label: "Recommendation", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" };
  if (/how to|how do|tutorial|guide|step|setup|configur/.test(t))
    return { label: "How-to",         color: "#0ea5e9", bg: "#f0f9ff", border: "#bae6fd" };
  if (/problem|issue|struggl|can't|cannot|don.t know|fix|broken|fail|not work/.test(t))
    return { label: "Pain point",     color: "#ef4444", bg: "#fff1f2", border: "#fecdd3" };
  return   { label: "Discussion",    color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb" };
}

function getThreadScore(title: string, comments?: number): { score: number; label: "HIGH" | "MED" | "LOW" } {
  const tag = getRelevanceTag(title);
  const base = RELEVANCE_ORDER[tag.label] ?? 1;
  // base 1-5 → map to 40-90
  let score = 30 + base * 12;
  // fewer comments = higher opportunity
  if (comments != null) {
    if (comments <= 15)  score += 8;
    else if (comments <= 40) score += 3;
    else if (comments > 80)  score -= 8;
  }
  score = Math.min(99, Math.max(20, score));
  const label = score >= 75 ? "HIGH" : score >= 55 ? "MED" : "LOW";
  return { score, label };
}

const FILTERS: { id: FilterTab; label: string }[] = [
  { id: "new",     label: "New"     },
  { id: "saved",   label: "Saved"   },
  { id: "replied", label: "Replied" },
  { id: "all",     label: "All"     },
];

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "newest",         label: "Newest first"      },
  { id: "oldest",         label: "Oldest first"      },
  { id: "relevance-high", label: "Highest relevance" },
  { id: "relevance-low",  label: "Lowest relevance"  },
  { id: "upvotes",        label: "Most upvotes"      },
  { id: "comments",       label: "Most comments"     },
];

const HOW_IT_WORKS = [
  { icon: <MessageCircle className="w-4 h-4" />, color: "#ff4500", bg: "#ff45001a", title: "We find the threads",      desc: "Scanned from Reddit based on your category and competitors." },
  { icon: <Sparkles      className="w-4 h-4" />, color: "#5B2D91", bg: "#f3eeff",   title: "Write or auto-generate", desc: "Type your own reply or hit Magic write for an AI-drafted response tailored to the thread." },
  { icon: <Check         className="w-4 h-4" />, color: "#10b981", bg: "#f0fdf4",   title: "One-click engage",    desc: "Reply is copied to clipboard and the Reddit thread opens instantly." },
];

// ── component ─────────────────────────────────────────────────────────────

export function EngagementThreadsPage({ profile, demoMode, demoThreads }: Props) {
  const [threads,      setThreads]      = useState<Thread[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [error,        setError]        = useState(false);
  const [lastRefreshed,setLastRefreshed]= useState<number>(() => {
    if (typeof window === "undefined") return 0;
    return Number(localStorage.getItem(`comly_reddit_refreshed_${slugify(profile.brand_name)}`) ?? 0);
  });
  const [showHiW,   setShowHiW]   = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [sortOption,   setSortOption]   = useState<SortOption>("newest");
  const [sortOpen,     setSortOpen]     = useState(false);
  const [sortPos,      setSortPos]      = useState({ top: 0, right: 0 });

  const slug = slugify(profile.brand_name);

  const [dismissed, setDismissed] = useState<Set<string>>(() =>
    typeof window !== "undefined" ? loadSet(`comly_reddit_dismissed_${slug}`) : new Set()
  );
  const [saved, setSaved] = useState<Set<string>>(() =>
    typeof window !== "undefined" ? loadSet(`comly_reddit_saved_${slug}`) : new Set()
  );
  const [repliedTo, setRepliedTo] = useState<Set<string>>(() =>
    typeof window !== "undefined" ? loadSet(`comly_reddit_replied_${slug}`) : new Set()
  );

  const [activeThread,      setActiveThread]      = useState<Thread | null>(null);
  const [replyText,         setReplyText]         = useState("");
  const [isGenerating,      setIsGenerating]      = useState(false);
  const [magicError,        setMagicError]        = useState("");
  const [copied,            setCopied]            = useState(false);
  const [generatedReplies,  setGeneratedReplies]  = useState<string[]>([]);

  const sortBtnRef  = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── init: load threads from localStorage, auto-fetch if empty ──────────
  useEffect(() => {
    if (demoMode && demoThreads) {
      setThreads(demoThreads);
      setLoading(false);
      return;
    }

    const cached = loadThreads(`comly_reddit_threads_${slug}`);
    const cacheValid = cached.length > 0 && cached.some(t => t.subreddit && t.subreddit !== "reddit");
    if (cacheValid) {
      setThreads(cached);
      setLoading(false);
    } else {
      if (cached.length > 0) localStorage.removeItem(`comly_reddit_threads_${slug}`);
      setLoading(true);
      setError(false);
      fetch("/api/engagement-threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      })
        .then(r => r.json())
        .then(d => {
          const t = d.threads ?? [];
          setThreads(t);
          saveThreads(`comly_reddit_threads_${slug}`, t);
          if (!demoMode && t.length) {
            fetch("/api/cache-threads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ platform: "reddit", threads: t }) }).catch(() => {});
          }
          setLoading(false);
        })
        .catch(() => { setError(true); setLoading(false); });
    }
  }, [profile.brand_name]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── persist state ───────────────────────────────────────────────────────
  useEffect(() => {
    saveSet(`comly_reddit_saved_${slug}`, saved);
  }, [saved, slug]);

  useEffect(() => {
    saveSet(`comly_reddit_replied_${slug}`, repliedTo);
  }, [repliedTo, slug]);

  useEffect(() => {
    saveSet(`comly_reddit_dismissed_${slug}`, dismissed);
  }, [dismissed, slug]);

  // ── how-it-works first-time ─────────────────────────────────────────────
  useEffect(() => {
    if (!localStorage.getItem("comly_reddit_hiw_seen")) {
      setShowHiW(true);
      localStorage.setItem("comly_reddit_hiw_seen", "1");
    }
  }, []);

  // ── actions ─────────────────────────────────────────────────────────────
  async function handleRefresh() {
    setRefreshing(true);
    setError(false);
    try {
      const res = await fetch("/api/engagement-threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      const d = await res.json();
      const t = d.threads ?? [];
      setThreads(t);
      saveThreads(`comly_reddit_threads_${slug}`, t);
      if (t.length) {
        fetch("/api/cache-threads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ platform: "reddit", threads: t }) }).catch(() => {});
      }
      const now = Date.now();
      setLastRefreshed(now);
      localStorage.setItem(`comly_reddit_refreshed_${slug}`, String(now));
    } catch {
      // silently keep existing threads
    } finally {
      setRefreshing(false);
    }
  }

  const canRefresh = Date.now() - lastRefreshed > 24 * 60 * 60 * 1000;

  function openReplyPanel(thread: Thread) {
    setActiveThread(thread);
    setReplyText("");
    setMagicError("");
    setCopied(false);
    setGeneratedReplies([]);
  }

  function insertFormatting(before: string, after: string = before) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const sel   = replyText.slice(start, end);
    const next  = replyText.slice(0, start) + before + sel + after + replyText.slice(end);
    setReplyText(next);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + sel.length);
    }, 0);
  }

  function getMagicWriteCount(): number {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const raw = localStorage.getItem(`comly_magic_write_${today}`);
      return raw ? parseInt(raw, 10) : 0;
    } catch { return 0; }
  }

  function incrementMagicWriteCount() {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const count = getMagicWriteCount();
      localStorage.setItem(`comly_magic_write_${today}`, String(count + 1));
    } catch {}
  }

  async function magicWrite() {
    if (!activeThread) return;
    if (!demoMode && getMagicWriteCount() >= 5) {
      setMagicError("You've used all 5 Magic write credits for today. Come back tomorrow.");
      return;
    }
    setIsGenerating(true);
    setMagicError("");
    setGeneratedReplies([]);
    try {
      if (demoMode) {
        await new Promise(r => setTimeout(r, 900));
        setGeneratedReplies([
          `We actually made this exact switch at our company last year. The biggest win was having docs, tasks, and wikis in one place — way less context switching. Setup took a weekend but team adoption was surprisingly fast.`,
          `Depends on what your team actually needs. For a living knowledge base that people enjoy writing in, ${profile.brand_name} wins hands down. Confluence works but it tends to collect dust because the UX gets in the way of actually writing.`,
          `Honest take: the tool doesn't matter as much as who owns it. We tried both and the difference was always whether someone was actively maintaining it. That said, ${profile.brand_name} has lower friction for non-technical contributors which helped a lot.`,
        ]);
        return;
      }
      const res  = await fetch("/api/generate-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thread: { title: activeThread.title, subreddit: activeThread.subreddit }, profile }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Request failed");
      const replies = Array.isArray(data.replies) ? data.replies.filter(Boolean) : [];
      if (!replies.length) throw new Error("No reply was generated. Try again.");
      setGeneratedReplies(replies);
      incrementMagicWriteCount();
    } catch (err) {
      setMagicError(err instanceof Error ? err.message : "Could not generate reply. Try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function engage() {
    if (!replyText.trim() || !activeThread) return;
    await navigator.clipboard.writeText(replyText);
    setCopied(true);
    setRepliedTo(prev => new Set([...prev, activeThread.id]));
    window.open(activeThread.url, "_blank");
    setTimeout(() => setCopied(false), 3000);
  }

  function toggleSave(id: string) {
    setSaved(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }
  function toggleReplied(id: string) {
    setRepliedTo(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }
  function dismiss(id: string) {
    setDismissed(prev => new Set([...prev, id]));
  }

  function openSortDropdown() {
    if (sortBtnRef.current) {
      const r = sortBtnRef.current.getBoundingClientRect();
      setSortPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
    }
    setSortOpen(true);
  }

  // ── derived data ────────────────────────────────────────────────────────
  const allVisible = threads.filter(t => !dismissed.has(t.id));
  const newCount   = allVisible.filter(t => !repliedTo.has(t.id)).length;

  const filtered =
    activeFilter === "new"     ? allVisible.filter(t => !repliedTo.has(t.id)) :
    activeFilter === "saved"   ? allVisible.filter(t => saved.has(t.id)) :
    activeFilter === "replied" ? allVisible.filter(t => repliedTo.has(t.id)) :
    allVisible;

  const displayed = (() => {
    const arr = [...filtered];
    const rel = (t: Thread) => RELEVANCE_ORDER[getRelevanceTag(t.title).label] ?? 0;
    switch (sortOption) {
      case "oldest":         return arr.reverse();
      case "relevance-high": return arr.sort((a, b) => rel(b) - rel(a));
      case "relevance-low":  return arr.sort((a, b) => rel(a) - rel(b));
      case "upvotes":        return arr.sort((a, b) => (b.upvotes ?? 0) - (a.upvotes ?? 0));
      case "comments":       return arr.sort((a, b) => (b.comments ?? 0) - (a.comments ?? 0));
      default:               return arr;
    }
  })();

  const currentSortLabel = SORT_OPTIONS.find(o => o.id === sortOption)?.label ?? "Newest first";

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-5">
      <div className="bg-white border border-[#e5e5e5] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.10)] overflow-hidden">

        {/* Header */}
        <div data-tour="tour-reddit-header" className="px-6 pt-6 pb-5 border-b border-[#f0f0f0]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#ff45001a" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://www.google.com/s2/favicons?domain=reddit.com&sz=64" alt="Reddit" width={20} height={20} className="w-5 h-5 object-contain" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] font-bold text-[#0a0a0a]">Posts</h2>
                <button onClick={() => setShowHiW(true)} title="How it works" className="text-[#cccccc] hover:text-[#5B2D91] transition-colors">
                  <Info className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">Pro</span>
              </div>
              <p className="text-[12px] text-[#aaaaaa] mt-0.5">Real-time matched posts</p>
            </div>
            {!demoMode && (
              <button
                onClick={canRefresh ? handleRefresh : undefined}
                disabled={refreshing || loading || !canRefresh}
                title={!canRefresh ? "You can refresh once per day" : undefined}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e8e8e8] text-[11px] text-[#6b6b6b] hover:bg-[#f5f5f5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing…" : canRefresh ? "Refresh" : "Refreshed today"}
              </button>
            )}
          </div>

          {/* Filter tabs + sort */}
          <div className="flex items-center gap-1">
            {FILTERS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveFilter(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                  activeFilter === id ? "bg-[#f0f0f0] text-[#0a0a0a]" : "text-[#aaaaaa] hover:text-[#6b6b6b] hover:bg-[#fafafa]"
                }`}
              >
                {label}
                {id === "new" && newCount > 0 && (
                  <span className="min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center text-white" style={{ background: "#ff4500" }}>
                    {newCount > 9 ? "9+" : newCount}
                  </span>
                )}
              </button>
            ))}
            <div className="ml-auto">
              <button
                ref={sortBtnRef}
                onClick={openSortDropdown}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e8e8e8] text-[11px] text-[#6b6b6b] hover:bg-[#f5f5f5] transition-colors"
              >
                <ArrowUpDown className="w-3 h-3" />
                <span>Sort</span>
                <span className="text-[#bbbbbb]">{currentSortLabel}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Thread list */}
        <div className="px-4 pb-5 pt-3 space-y-2">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white border border-[#eeeeee] rounded-xl p-4 flex items-start gap-3 animate-pulse">
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-2.5 bg-[#f0f0f0] rounded w-1/4" />
                  <div className="h-3.5 bg-[#f0f0f0] rounded w-3/4" />
                  <div className="h-2.5 bg-[#f0f0f0] rounded w-1/3" />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {[0,1,2,3].map(j => <div key={j} className="w-7 h-7 bg-[#f0f0f0] rounded-lg" />)}
                </div>
              </div>
            ))
          ) : error && threads.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[13px] font-medium text-[#6b6b6b]">Could not load threads right now.</p>
              <button onClick={handleRefresh} className="mt-3 text-[12px] text-[#5B2D91] hover:underline">Try again</button>
            </div>
          ) : displayed.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[13px] font-medium text-[#6b6b6b]">
                {activeFilter === "saved"   ? "No saved posts yet." :
                 activeFilter === "replied" ? "No replied posts yet." :
                 "No threads found for your niche yet."}
              </p>
              {(activeFilter === "new" || activeFilter === "all") && (
                <button onClick={handleRefresh} className="mt-3 text-[12px] text-[#5B2D91] hover:underline">Refresh to find threads</button>
              )}
            </div>
          ) : (
            displayed.map((t, idx) => {
              const relevance  = getRelevanceTag(t.title);
              const keyword    = extractKeyword(t.title);
              const isSaved    = saved.has(t.id);
              const isReplied  = repliedTo.has(t.id);
              const { score, label: scoreLabel } = getThreadScore(t.title, t.comments);
              const scoreColor =
                scoreLabel === "HIGH" ? { text: "#10b981", bg: "#f0fdf4", border: "#a7f3d0" } :
                scoreLabel === "MED"  ? { text: "#f59e0b", bg: "#fffbeb", border: "#fde68a" } :
                                        { text: "#9ca3af", bg: "#f9fafb", border: "#e5e7eb" };

              return (
                <div key={t.id} data-tour={idx === 0 ? "tour-reddit-thread" : undefined} className="group bg-white border border-[#eeeeee] rounded-2xl p-4 flex items-start gap-3 hover:border-[#d8d8d8] hover:shadow-sm transition-all">

                  {/* Score badge */}
                  <div className="shrink-0 w-[46px] flex flex-col items-center justify-center rounded-xl py-2.5 px-1 border"
                    style={{ background: scoreColor.bg, borderColor: scoreColor.border }}>
                    <span className="text-[20px] font-black leading-none" style={{ color: scoreColor.text }}>{score}</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest mt-0.5" style={{ color: scoreColor.text }}>{scoreLabel}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://www.google.com/s2/favicons?domain=reddit.com&sz=32" alt="" width={12} height={12} className="w-3 h-3 opacity-60" />
                      <span className="text-[11px] font-bold" style={{ color: "#ff4500" }}>{t.subreddit}</span>
                      {t.age && (
                        <>
                          <span className="text-[10px] text-[#cccccc]">·</span>
                          <span className="text-[10px] text-[#aaaaaa]">{t.age} ago</span>
                        </>
                      )}
                    </div>

                    <p className="text-[13.5px] font-semibold text-[#0a0a0a] leading-snug mb-2.5">{t.title}</p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: relevance.color, background: relevance.bg, border: `1px solid ${relevance.border}` }}>
                        {relevance.label}
                      </span>
                      {t.upvotes != null && (
                        <span className="flex items-center gap-1 text-[10px] text-[#aaaaaa]">
                          <ThumbsUp className="w-2.5 h-2.5" /> {fmt(t.upvotes)}
                        </span>
                      )}
                      {t.comments != null && (
                        <span className="flex items-center gap-1 text-[10px] text-[#aaaaaa]">
                          <MessageCircle className="w-2.5 h-2.5" /> {t.comments}
                        </span>
                      )}
                      {keyword && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "#fdf2ff", color: "#a855f7", border: "1px solid #e9d5ff" }}>
                          {keyword}
                        </span>
                      )}
                      {isReplied && (
                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                          <Check className="w-2.5 h-2.5" /> Replied
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions — always visible on mobile, fade in on hover for desktop */}
                  <div className="shrink-0 flex items-center gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleReplied(t.id)}
                      title={isReplied ? "Unmark as replied" : "Mark as replied"}
                      className={`p-1.5 rounded-lg transition-colors ${isReplied ? "text-emerald-600 bg-emerald-50" : "text-[#cccccc] hover:text-[#0a0a0a] hover:bg-[#f5f5f5]"}`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleSave(t.id)}
                      title="Save thread"
                      className={`p-1.5 rounded-lg transition-colors ${isSaved ? "text-amber-500 bg-amber-50" : "text-[#cccccc] hover:text-[#0a0a0a] hover:bg-[#f5f5f5]"}`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openReplyPanel(t)}
                      title="Draft a reply"
                      className="p-1.5 rounded-lg text-[#5B2D91] bg-[#f3eeff] hover:bg-[#e8d8ff] transition-colors"
                    >
                      <CornerUpLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => dismiss(t.id)}
                      title="Dismiss"
                      className="p-1.5 rounded-lg text-[#cccccc] hover:text-[#ef4444] hover:bg-red-50 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Sort dropdown */}
      {sortOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[55]" onClick={() => setSortOpen(false)}>
          <div
            className="fixed bg-white border border-[#e5e5e5] rounded-xl shadow-xl py-1.5 min-w-[190px]"
            style={{ top: sortPos.top, right: sortPos.right }}
            onClick={e => e.stopPropagation()}
          >
            {SORT_OPTIONS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => { setSortOption(id); setSortOpen(false); }}
                className={`w-full text-left px-4 py-2 text-[12px] transition-colors hover:bg-[#f5f5f5] ${
                  sortOption === id ? "font-semibold text-[#5B2D91]" : "text-[#3a3a3a]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}

      {/* How it works modal */}
      {showHiW && typeof document !== "undefined" && createPortal(
        <div className={`${demoMode ? "absolute" : "fixed"} inset-0 z-[60] flex items-center justify-center p-4`}>
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowHiW(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[460px] p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://www.google.com/s2/favicons?domain=reddit.com&sz=64" alt="" width={20} height={20} className="w-5 h-5" />
                <h3 className="text-[15px] font-bold text-[#0a0a0a]">How Reddit Posts works</h3>
              </div>
              <button onClick={() => setShowHiW(false)} className="text-[#aaaaaa] hover:text-[#0a0a0a] text-xl leading-none">×</button>
            </div>
            <div className="space-y-4">
              {HOW_IT_WORKS.map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg, color: s.color }}>
                    {s.icon}
                  </div>
                  <div className="pt-0.5">
                    <p className="text-[13px] font-semibold text-[#0a0a0a]">{s.title}</p>
                    <p className="text-[12px] text-[#6b6b6b] mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowHiW(false)}
              className="mt-6 w-full py-2.5 rounded-xl text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #ff4500, #ff6534)" }}
            >
              Got it
            </button>
          </div>
        </div>,
        (demoMode && document.getElementById("demo-dashboard-root")) || document.body
      )}

      {/* Reply slide-in panel */}
      {activeThread && typeof document !== "undefined" && createPortal(
        <div className={`${demoMode ? "absolute" : "fixed"} inset-0 z-50 flex`}>
          <div className="flex-1 bg-black/30" onClick={() => setActiveThread(null)} />
          <div className="w-[440px] bg-white h-full flex flex-col shadow-2xl">

            {/* Panel header */}
            <div className="px-5 py-4 border-b border-[#f0f0f0] shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold" style={{ color: "#ff4500" }}>{activeThread.subreddit}</p>
                  <p className="text-[13px] font-semibold text-[#0a0a0a] mt-0.5 leading-snug">{activeThread.title}</p>
                </div>
                <button onClick={() => setActiveThread(null)} className="text-[#aaaaaa] hover:text-[#0a0a0a] shrink-0 text-xl leading-none mt-0.5">×</button>
              </div>
              <a href={activeThread.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] text-[#aaaaaa] hover:text-[#5B2D91] transition-colors">
                <ExternalLink className="w-3 h-3" /> View on Reddit
              </a>
            </div>

            {/* Editor body */}
            <div className="flex-1 px-5 py-4 flex flex-col min-h-0">
              <p className="text-[10px] font-bold text-[#aaaaaa] uppercase tracking-widest mb-3 shrink-0">Your reply</p>

              {/* Editor card */}
              <div className="flex-1 flex flex-col rounded-xl border border-[#e5e5e5] overflow-hidden focus-within:border-[#5B2D91]/40 transition-colors min-h-0">

                {/* Toolbar */}
                <div className="flex items-center gap-0.5 px-3 py-2 border-b border-[#f0f0f0] bg-[#fafafa] shrink-0">
                  <button title="Heading" onClick={() => insertFormatting("# ", "")}
                    className="w-7 h-7 rounded-md text-[12px] font-bold text-[#6b6b6b] hover:bg-[#eeeeee] hover:text-[#0a0a0a] transition-colors flex items-center justify-center">H</button>
                  <button title="Bold" onClick={() => insertFormatting("**")}
                    className="w-7 h-7 rounded-md text-[12px] font-bold text-[#6b6b6b] hover:bg-[#eeeeee] hover:text-[#0a0a0a] transition-colors flex items-center justify-center">B</button>
                  <button title="Italic" onClick={() => insertFormatting("*")}
                    className="w-7 h-7 rounded-md text-[12px] italic text-[#6b6b6b] hover:bg-[#eeeeee] hover:text-[#0a0a0a] transition-colors flex items-center justify-center">I</button>
                  <button title="Strikethrough" onClick={() => insertFormatting("~~")}
                    className="w-7 h-7 rounded-md text-[12px] line-through text-[#6b6b6b] hover:bg-[#eeeeee] hover:text-[#0a0a0a] transition-colors flex items-center justify-center">S</button>
                  <button title="Underline (not supported on Reddit)" disabled
                    className="w-7 h-7 rounded-md text-[12px] underline text-[#cccccc] flex items-center justify-center cursor-not-allowed">U</button>
                  <button title="Link" onClick={() => insertFormatting("[", "](url)")}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-[#6b6b6b] hover:bg-[#eeeeee] hover:text-[#0a0a0a] transition-colors">
                    <Link className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex-1" />

                  {/* Magic write */}
                  {!demoMode && (
                    <button onClick={magicWrite} disabled={isGenerating}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#5B2D91] bg-[#f3eeff] hover:bg-[#e8d8ff] disabled:opacity-60 transition-colors">
                      {isGenerating ? (
                        <div className="w-3 h-3 border border-[#5B2D91] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      {isGenerating ? "Writing…" : generatedReplies.length > 0 ? "Regenerate" : "Magic write"}
                    </button>
                  )}
                </div>

                {/* Magic write error */}
                {magicError && (
                  <div className="px-4 py-2 bg-red-50 border-b border-red-100">
                    <p className="text-[11px] text-red-500">{magicError}</p>
                  </div>
                )}

                {/* Generated reply options */}
                {generatedReplies.length > 0 && (
                  <div className="px-3 pt-3 pb-2 border-b border-[#f0f0f0] space-y-2 shrink-0">
                    <p className="text-[10px] font-bold text-[#aaaaaa] uppercase tracking-widest px-1">Pick a reply</p>
                    {generatedReplies.map((reply, i) => (
                      <button
                        key={i}
                        onClick={() => { setReplyText(reply); setGeneratedReplies([]); setTimeout(() => textareaRef.current?.focus(), 0); }}
                        className="w-full text-left rounded-lg border border-[#e5e5e5] px-3 py-2.5 hover:border-[#5B2D91]/50 hover:bg-[#faf7ff] transition-all group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[12px] text-[#1a1a1a] leading-snug line-clamp-3 flex-1">{reply}</p>
                          <span className="shrink-0 text-[10px] font-bold text-[#5B2D91] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mt-0.5">Use →</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Write your reply here, or click Magic write to generate one with AI…"
                  className="flex-1 resize-none p-4 text-[13px] text-[#1a1a1a] placeholder:text-[#c0c0c0] focus:outline-none leading-relaxed bg-white min-h-[80px]"
                />

                {/* Char count */}
                <div className="px-4 py-2 border-t border-[#f5f5f5] bg-[#fafafa] shrink-0">
                  <span className="text-[10px] text-[#cccccc]">{replyText.length} chars</span>
                </div>
              </div>
            </div>

            {/* Engage button */}
            <div className="px-5 pb-6 pt-3 border-t border-[#f0f0f0] shrink-0">
              <button
                onClick={engage}
                disabled={!replyText.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #ff4500, #ff6534)" }}
              >
                {copied ? (
                  <><Check className="w-4 h-4" /> Copied! Reddit is opening…</>
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://www.google.com/s2/favicons?domain=reddit.com&sz=32" alt="" width={14} height={14} className="w-3.5 h-3.5" />
                    Engage on Reddit
                  </>
                )}
              </button>
              <p className="text-[10px] text-[#aaaaaa] text-center mt-2">
                Reply is copied to your clipboard · Paste it in the comment box
              </p>
            </div>

          </div>
        </div>,
        (demoMode && document.getElementById("demo-dashboard-root")) || document.body
      )}
    </div>
  );
}
