"use client";

import { useState, useEffect } from "react";
import { BrandProfile } from "@/types";
import {
  Copy, Check, Loader2, ChevronRight, RefreshCw,
  Download, AlertCircle, ChevronLeft, ChevronDown,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeroData {
  h1: string;
  subheadline: string;
  cta: string;
}

interface AnalysisResult {
  scores: {
    category_clarity: number;
    audience_specificity: number;
    use_case_clarity: number;
    llm_alignment: number;
    summary_presence: number;
  };
  total: number;
  issues: string[];
  grade: "poor" | "average" | "good";
}

interface RewriteResult {
  h1: string;
  subheadline: string;
  tldr: string;
  meta_description: string;
  faqs: { question: string; answer: string }[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORM_TABS = [
  { id: "any", label: "Any Platform" },
  { id: "webflow", label: "Webflow" },
  { id: "wordpress", label: "WordPress" },
  { id: "framer", label: "Framer" },
  { id: "bubble", label: "Bubble" },
];

const PLATFORM_STEPS: Record<string, string[]> = {
  any: [
    "Find your main headline and replace it with the AI-optimized version above",
    "Replace your current subheadline with the rewritten version",
    "Add the TL;DR block just below your headline — a small gray text line works well",
    "Create a FAQ section below your hero or anywhere on the homepage",
    "Go to your site's SEO settings and replace the meta description",
  ],
  webflow: [
    "Open Webflow Designer",
    "Click on your H1 text element and replace with new copy",
    "Add a new Text Block for TL;DR below the headline",
    "Add a FAQ section using Webflow's accordion component or plain text",
    "Update meta in Page Settings → SEO tab",
    "Publish",
  ],
  wordpress: [
    "Go to Pages → Edit your homepage",
    "Click on your H1 block and replace the text",
    "Add a new Paragraph block for TL;DR below the headline",
    "Add a FAQ block (use any FAQ plugin or plain text)",
    "Update meta via Yoast or RankMath",
    "Update and publish",
  ],
  framer: [
    "Open your Framer project",
    "Click on your H1 text layer and replace with new copy",
    "Add a Text component for TL;DR below the headline",
    "Add a FAQ section below the hero",
    "Update meta in Page Settings",
    "Publish",
  ],
  bubble: [
    "Open your Bubble editor",
    "Click on your H1 text element and replace the static text content",
    "Add a Text element for TL;DR below the headline",
    "Create a Repeating Group for FAQs or add plain text FAQ elements",
    "Deploy your changes",
  ],
};

const TIMELINE = [
  { weeks: "Week 1–2", label: "Changes indexed by crawlers" },
  { weeks: "Week 2–4", label: "AI models read updated copy" },
  { weeks: "Week 4–6", label: "Score improves on next Comly audit" },
  { weeks: "Week 6+", label: "More accurate AI recommendations" },
];

const CRITERIA_META = [
  { key: "category_clarity",     label: "Category clarity",     description: "Does your H1 clearly state what category you're in?" },
  { key: "audience_specificity", label: "Audience specificity", description: "Does your copy say who the product is for?" },
  { key: "use_case_clarity",     label: "Use case clarity",     description: "Is it clear what problem you solve?" },
  { key: "llm_alignment",        label: "LLM prompt alignment", description: "Does your copy match how buyers ask questions in ChatGPT?" },
  { key: "summary_presence",     label: "Summary presence",     description: "Do you have a clear TL;DR or one-liner that AI can extract?" },
];

// ─── StepHeader ───────────────────────────────────────────────────────────────

function StepHeader({
  current,
  hasAnalysis,
  hasRewrite,
  onNavigate,
}: {
  current: 1 | 2 | 3;
  hasAnalysis: boolean;
  hasRewrite: boolean;
  onNavigate: (s: 1 | 2 | 3) => void;
}) {
  const steps: { n: 1 | 2 | 3; label: string }[] = [
    { n: 1, label: "Your Hero" },
    { n: 2, label: "Analysis" },
    { n: 3, label: "Rewrite" },
  ];

  function isReachable(n: 1 | 2 | 3) {
    if (n === 1) return true;
    if (n === 2) return hasAnalysis;
    if (n === 3) return hasRewrite;
    return false;
  }

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-xl px-5 py-3.5 flex items-center">
      {steps.map((s, i) => {
        const active = s.n === current;
        const done = s.n < current;
        const reachable = isReachable(s.n);
        return (
          <div key={s.n} className={`flex items-center ${i < steps.length - 1 ? "flex-1" : ""}`}>
            <button
              disabled={!reachable}
              onClick={() => reachable && onNavigate(s.n)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${
                active
                  ? "bg-[#5B2D91] text-white"
                  : reachable
                  ? "text-[#5B2D91] hover:bg-[#f3eeff] cursor-pointer"
                  : "text-[#cccccc] cursor-default"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  active ? "bg-white/20" : done ? "bg-[#5B2D91]" : reachable ? "bg-[#ede9fe]" : "bg-[#f0f0f0]"
                }`}
              >
                {done ? (
                  <Check className="w-3 h-3 text-white" />
                ) : (
                  <span className={`text-[11px] font-bold ${active ? "text-white" : reachable ? "text-[#5B2D91]" : "text-[#cccccc]"}`}>
                    {s.n}
                  </span>
                )}
              </div>
              <span className="text-[13px] font-semibold whitespace-nowrap">{s.label}</span>
            </button>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-[#e8e8e8] mx-2" />}
          </div>
        );
      })}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreRing({ score, grade }: { score: number; grade: "poor" | "average" | "good" }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(score, 100) / 100);
  const color = grade === "poor" ? "#dc2626" : grade === "average" ? "#f59e0b" : "#16a34a";
  const label =
    grade === "poor"
      ? "Poor — AI can't understand your product"
      : grade === "average"
      ? "Average — AI partially understands you"
      : "Good — AI understands your product";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#f0f0f0" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.7s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[30px] font-bold leading-none" style={{ color }}>{score}</span>
          <span className="text-[11px] text-[#aaaaaa]">/ 100</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[13px] font-semibold" style={{ color }}>{label}</p>
        <p className="text-[11px] text-[#aaaaaa] mt-0.5">AI Readability Score</p>
      </div>
    </div>
  );
}

function CriterionBar({ label, score, description }: { label: string; score: number; description: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-[#0a0a0a]">{label}</p>
        <span className="text-[13px] font-bold text-[#5B2D91]">{score}/20</span>
      </div>
      <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-[#5B2D91]"
          style={{ width: `${(score / 20) * 100}%`, transition: "width 0.5s ease" }}
        />
      </div>
      <p className="text-[12px] text-[#6b6b6b]">{description}</p>
    </div>
  );
}

function CopyBlock({
  label, original, rewritten, id, copied, onCopy, accentLeft = false,
}: {
  label: string;
  original?: string;
  rewritten: string;
  id: string;
  copied: string | null;
  onCopy: (text: string, id: string) => void;
  accentLeft?: boolean;
}) {
  return (
    <div className="space-y-2.5 p-5 border border-[#f0f0f0] rounded-xl">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-[#0a0a0a] uppercase tracking-wide">{label}</p>
        <button
          onClick={() => onCopy(rewritten, id)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#e5e5e5] text-[11px] font-semibold text-[#666] hover:bg-[#f7f7f5] transition-colors"
        >
          {copied === id
            ? <><Check className="w-3 h-3 text-emerald-500" /> Copied! ✓</>
            : <><Copy className="w-3 h-3" /> Copy</>
          }
        </button>
      </div>
      {original && (
        <div className="px-4 py-3 rounded-lg bg-[#fff5f5]" style={{ borderLeft: "2px solid #dc2626" }}>
          <p className="text-[13px] text-[#9a3030] line-through leading-relaxed">{original}</p>
        </div>
      )}
      <div
        className="px-4 py-3 rounded-lg"
        style={{
          background: accentLeft ? "#f3eeff" : "#f0fdf4",
          borderLeft: `2px solid ${accentLeft ? "#5B2D91" : "#16a34a"}`,
        }}
      >
        <p className="text-[13px] font-semibold text-[#0a0a0a] leading-relaxed">{rewritten}</p>
      </div>
    </div>
  );
}

function FaqBlock({
  faq, index, copied, onCopy,
}: {
  faq: { question: string; answer: string };
  index: number;
  copied: string | null;
  onCopy: (text: string, id: string) => void;
}) {
  const id = `faq-${index}`;
  return (
    <div className="border border-[#f0f0f0] rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-[13px] font-semibold text-[#0a0a0a]">{faq.question}</p>
          <p className="text-[13px] text-[#6b6b6b] leading-relaxed">{faq.answer}</p>
        </div>
        <button
          onClick={() => onCopy(`Q: ${faq.question}\nA: ${faq.answer}`, id)}
          className="shrink-0 flex items-center gap-1 px-2 py-1 rounded border border-[#e5e5e5] text-[11px] font-semibold text-[#888] hover:bg-[#f7f7f5] transition-colors mt-0.5"
        >
          {copied === id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
}

function BrowserMockup({
  url, topColor, topLabel, scoreLabel, children,
}: {
  url: string;
  topColor: string;
  topLabel: string;
  scoreLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-[#e5e5e5] shadow-sm flex flex-col">
      <div className="h-1" style={{ background: topColor }} />
      <div className="px-3 py-2 bg-[#f5f5f5] border-b border-[#ebebeb] flex items-center gap-2.5">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 bg-white rounded px-2.5 py-0.5 text-[10px] text-[#aaaaaa] truncate">{url}</div>
      </div>
      <div className="bg-white p-5 flex-1">
        <p className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: topColor }}>{topLabel}</p>
        {children}
      </div>
      <div className="px-4 py-2.5 bg-[#fafafa] border-t border-[#f0f0f0]">
        <p className="text-[12px] font-semibold text-[#3a3a3a]">{scoreLabel}</p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  profile: BrandProfile;
}

export function HeroRewritePage({ profile }: Props) {
  const domain = profile.url
    ? (() => { try { const u = profile.url.startsWith("http") ? profile.url : "https://" + profile.url; return new URL(u).hostname; } catch { return profile.url; } })()
    : "";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [eduOpen, setEduOpen] = useState(false);

  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [fetchingHero, setFetchingHero] = useState(false);
  const [useManual, setUseManual] = useState(false);
  const [manualH1, setManualH1] = useState("");
  const [manualSub, setManualSub] = useState("");

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");

  const [rewrite, setRewrite] = useState<RewriteResult | null>(null);
  const [rewriting, setRewriting] = useState(false);
  const [rewriteError, setRewriteError] = useState("");

  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("any");

  useEffect(() => {
    if (!profile.url) { setUseManual(true); return; }
    setFetchingHero(true);
    fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: profile.url }),
    })
      .then((r) => r.json())
      .then(async (scraped) => {
        if (scraped.error || !scraped.content) { setUseManual(true); return; }
        const res = await fetch("/api/extract-hero", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: scraped.content }),
        });
        const data = await res.json();
        if (data.h1) { setHeroData(data); } else { setUseManual(true); }
      })
      .catch(() => setUseManual(true))
      .finally(() => setFetchingHero(false));
  }, [profile.url]);

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const currentH1 = useManual ? manualH1 : (heroData?.h1 || "");
  const currentSub = useManual ? manualSub : (heroData?.subheadline || "");

  async function handleAnalyze() {
    if (!currentH1.trim()) return;
    setStep(2);
    setAnalyzing(true);
    setAnalysis(null);
    setAnalyzeError("");
    setRewrite(null);
    setRewriteError("");
    try {
      const res = await fetch("/api/analyze-hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          h1: currentH1,
          subheadline: currentSub,
          category: profile.category,
          target_users: profile.target_users,
          use_cases: profile.main_use_cases,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze");
      setAnalysis(data);
    } catch {
      setAnalyzeError("Something went wrong. Try analyzing again.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleRewrite() {
    setStep(3);
    setRewriting(true);
    setRewrite(null);
    setRewriteError("");
    try {
      const res = await fetch("/api/rewrite-hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          h1: currentH1,
          subheadline: currentSub,
          brand_name: profile.brand_name,
          category: profile.category,
          target_users: profile.target_users,
          use_cases: profile.main_use_cases,
          differentiators: profile.differentiators,
          competitors: profile.competitors,
          url: profile.url,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to rewrite");
      setRewrite(data);
    } catch {
      setRewriteError("Something went wrong. Try rewriting again.");
    } finally {
      setRewriting(false);
    }
  }

  function buildCopyAllText() {
    if (!rewrite) return "";
    return [
      `H1 (Main Headline):\n${rewrite.h1}`,
      `\nSubheadline:\n${rewrite.subheadline}`,
      `\nTL;DR Summary:\n${rewrite.tldr}`,
      `\nMeta Description:\n${rewrite.meta_description}`,
      `\nFAQ Section:\n${rewrite.faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}`,
    ].join("\n");
  }

  function downloadAll() {
    if (!rewrite) return;
    const text = [
      `# Hero Rewrite — ${profile.brand_name}`,
      ``,
      `## H1`,
      rewrite.h1,
      ``,
      `## Subheadline`,
      rewrite.subheadline,
      ``,
      `## TL;DR Summary`,
      rewrite.tldr,
      ``,
      `## Meta Description`,
      rewrite.meta_description,
      ``,
      `## FAQ Section`,
      ...rewrite.faqs.map((f) => `\n**Q: ${f.question}**\n${f.answer}`),
    ].join("\n");
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile.brand_name.toLowerCase().replace(/\s+/g, "-")}-hero-rewrite.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 space-y-5">

      {/* Page header */}
      <div>
        <h1 className="text-[18px] font-bold text-[#0a0a0a]">Hero Rewrite</h1>
        <p className="text-[13px] text-[#6b6b6b] mt-1">
          Optimize your hero copy so AI models can understand and recommend your product
        </p>
      </div>

      {/* Stepper */}
      <StepHeader
        current={step}
        hasAnalysis={!!analysis}
        hasRewrite={!!rewrite}
        onNavigate={setStep}
      />

      {/* ── STEP 1: Your Hero ─────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-4">

          {/* Collapsible education */}
          <div className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden">
            <button
              onClick={() => setEduOpen((v) => !v)}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#fafafa] transition-colors"
            >
              <div>
                <p className="text-[14px] font-bold text-[#0a0a0a]">Why your hero copy matters for AI</p>
                <p className="text-[12px] text-[#aaaaaa] mt-0.5">Learn what makes hero copy AI-readable</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#aaaaaa] transition-transform duration-200 ${eduOpen ? "rotate-180" : ""}`} />
            </button>

            {eduOpen && (
              <div className="px-6 pb-6 pt-5 space-y-5 border-t border-[#f0f0f0]">
                <p className="text-[13px] text-[#6b6b6b] leading-relaxed">
                  Your hero section is the first thing AI models read when they crawl your website. If it&apos;s
                  vague, clever or uses marketing fluff — AI won&apos;t understand what you do and won&apos;t recommend you.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#fff5f5] rounded-xl p-4 space-y-2.5">
                    <p className="text-[12px] font-bold text-[#dc2626] mb-3">What AI can&apos;t understand</p>
                    {[
                      "A better way to work together",
                      "Where ideas come to life",
                      "The workspace for the future",
                      "Organize your world",
                    ].map((t) => (
                      <div key={t} className="flex items-start gap-2">
                        <span className="text-[14px] shrink-0 leading-snug">❌</span>
                        <p className="text-[12px] text-[#9a3030] italic leading-snug">&ldquo;{t}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-[#f0fdf4] rounded-xl p-4 space-y-2.5">
                    <p className="text-[12px] font-bold text-[#16a34a] mb-3">What AI understands perfectly</p>
                    {[
                      "Project management tool for remote software teams",
                      "Note-taking app for students and researchers",
                      "CRM software for B2B sales teams",
                      "Email marketing platform for e-commerce brands",
                    ].map((t) => (
                      <div key={t} className="flex items-start gap-2">
                        <span className="text-[14px] shrink-0 leading-snug">✅</span>
                        <p className="text-[12px] text-[#166534] leading-snug">&ldquo;{t}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2×2 criterion cards */}
                <div>
                  <p className="text-[13px] font-semibold text-[#0a0a0a] mb-3">What makes a hero AI-friendly</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: "🏷️", title: "Clear category",       good: '"AI writing tool for lawyers"',          bad: '"The future of legal work"' },
                      { icon: "🎯", title: "Audience-first H1",     good: '"Best [tool] for [specific audience]"',  bad: '"Work better. Together."' },
                      { icon: "❓", title: "FAQ mirrors prompts",    good: '"Can I use this for X use case?"',       bad: 'Generic "How does it work?"' },
                      { icon: "📝", title: "TL;DR at the top",      good: '"One-line summary AI can extract"',      bad: 'No summary — AI has to guess' },
                    ].map((item, i) => (
                      <div key={i} className="border border-[#e5e5e5] rounded-xl p-3.5 space-y-2 bg-white">
                        <div className="flex items-center gap-2">
                          <span className="text-[18px]">{item.icon}</span>
                          <p className="text-[12px] font-bold text-[#0a0a0a]">{item.title}</p>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-start gap-1.5">
                            <span className="text-[11px] shrink-0">✅</span>
                            <p className="text-[11px] text-emerald-700 leading-snug font-medium">{item.good}</p>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <span className="text-[11px] shrink-0">❌</span>
                            <p className="text-[11px] text-red-500 leading-snug">{item.bad}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Hero input */}
          <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 space-y-5">
            <div>
              <h2 className="text-[16px] font-bold text-[#0a0a0a]">Your current hero copy</h2>
              <p className="text-[13px] text-[#6b6b6b] mt-0.5">
                We&apos;ll scan your website and grade your hero copy for AI readability
              </p>
            </div>

            {fetchingHero && (
              <div className="flex items-center gap-2.5 py-4">
                <Loader2 className="w-4 h-4 text-[#5B2D91] animate-spin" />
                <p className="text-[13px] text-[#6b6b6b]">Fetching your hero copy from {domain}...</p>
              </div>
            )}

            {!fetchingHero && !useManual && heroData && (
              <div className="space-y-3">
                <p className="text-[12px] text-[#aaaaaa] font-medium">Extracted from your website</p>
                <div className="bg-[#0f0f0f] rounded-xl p-5 space-y-4 font-mono">
                  <div>
                    <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1.5">H1</p>
                    <p className="text-[16px] font-bold text-white leading-snug">{heroData.h1 || "—"}</p>
                  </div>
                  {heroData.subheadline && (
                    <div>
                      <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1.5">Subheadline</p>
                      <p className="text-[13px] text-[#aaaaaa] leading-relaxed">{heroData.subheadline}</p>
                    </div>
                  )}
                  {heroData.cta && (
                    <div>
                      <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1.5">CTA</p>
                      <p className="text-[12px] text-[#7ee787]">[{heroData.cta}]</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setUseManual(true)}
                  className="text-[12px] text-[#aaaaaa] hover:text-[#666] transition-colors underline underline-offset-2"
                >
                  Enter manually instead
                </button>
              </div>
            )}

            {!fetchingHero && useManual && (
              <div className="space-y-3">
                <p className="text-[12px] text-[#aaaaaa] font-medium">
                  {profile.url ? "Could not extract hero automatically — paste it below" : "Paste your current hero copy"}
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-[12px] font-semibold text-[#0a0a0a] block mb-1.5">H1 (Main headline)</label>
                    <input
                      type="text"
                      value={manualH1}
                      onChange={(e) => setManualH1(e.target.value)}
                      placeholder="e.g. A better way to work together"
                      className="w-full border border-[#e5e5e5] rounded-lg px-3 py-2.5 text-[13px] text-[#0a0a0a] outline-none focus:border-[#5B2D91]/50 transition-colors placeholder:text-[#cccccc]"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-[#0a0a0a] block mb-1.5">Subheadline</label>
                    <input
                      type="text"
                      value={manualSub}
                      onChange={(e) => setManualSub(e.target.value)}
                      placeholder="e.g. The all-in-one workspace for your team"
                      className="w-full border border-[#e5e5e5] rounded-lg px-3 py-2.5 text-[13px] text-[#0a0a0a] outline-none focus:border-[#5B2D91]/50 transition-colors placeholder:text-[#cccccc]"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={fetchingHero || !currentH1.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-[14px] transition-opacity disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}
            >
              Analyze Hero <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Analysis ──────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 space-y-6">

            {analyzing && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#5B2D91]/20 border-t-[#5B2D91] animate-spin" />
                <p className="text-[13px] text-[#6b6b6b] font-medium">Analyzing your hero copy...</p>
              </div>
            )}

            {analyzeError && !analyzing && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {analyzeError}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAnalyze}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-[13px]"
                    style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Try again
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#e5e5e5] text-[13px] font-semibold text-[#666] hover:bg-[#f7f7f5] transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Edit hero
                  </button>
                </div>
              </div>
            )}

            {analysis && !analyzing && (
              <>
                <ScoreRing score={analysis.total} grade={analysis.grade} />

                <div className="space-y-4 pt-4 border-t border-[#f0f0f0]">
                  {CRITERIA_META.map((c) => (
                    <CriterionBar
                      key={c.key}
                      label={c.label}
                      score={analysis.scores[c.key as keyof typeof analysis.scores]}
                      description={c.description}
                    />
                  ))}
                </div>

                {analysis.issues?.length > 0 && (
                  <div className="space-y-2.5 pt-4 border-t border-[#f0f0f0]">
                    <p className="text-[11px] font-bold text-[#0a0a0a] uppercase tracking-wide">Issues found</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.issues.map((issue, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 text-[12px] font-medium text-red-700"
                        >
                          <span>❌</span>
                          {issue}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-[#f0f0f0] space-y-2">
                  <button
                    onClick={handleRewrite}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-[14px]"
                    style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}
                  >
                    Generate AI-Optimized Hero <ChevronRight className="w-4 h-4" />
                  </button>
                  <p className="text-[12px] text-[#aaaaaa] text-center">
                    Rewrite your hero copy based on the analysis above
                  </p>
                </div>
              </>
            )}
          </div>

          {!analyzing && (
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-[13px] text-[#aaaaaa] hover:text-[#555] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Edit hero copy
            </button>
          )}
        </div>
      )}

      {/* ── STEP 3: Rewrite ───────────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-5">

          {/* Generated copy */}
          <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 space-y-5">

            {rewriting && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#5B2D91]/20 border-t-[#5B2D91] animate-spin" />
                <p className="text-[13px] text-[#6b6b6b] font-medium">Rewriting for AI readability...</p>
              </div>
            )}

            {rewriteError && !rewriting && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {rewriteError}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleRewrite}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-[13px]"
                    style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Try again
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#e5e5e5] text-[13px] font-semibold text-[#666] hover:bg-[#f7f7f5] transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Back to analysis
                  </button>
                </div>
              </div>
            )}

            {rewrite && !rewriting && (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-[16px] font-bold text-[#0a0a0a]">Your AI-optimized hero copy</h2>
                    <p className="text-[13px] text-[#6b6b6b] mt-0.5">Ready to copy and implement</p>
                  </div>
                  <button
                    onClick={() => copyText(buildCopyAllText(), "all")}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-[12px] font-semibold text-[#666] hover:bg-[#f7f7f5] transition-colors"
                  >
                    {copied === "all" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy All
                  </button>
                </div>

                <CopyBlock label="H1 (Main Headline)" original={currentH1} rewritten={rewrite.h1} id="h1" copied={copied} onCopy={copyText} />
                <CopyBlock label="Subheadline" original={currentSub} rewritten={rewrite.subheadline} id="sub" copied={copied} onCopy={copyText} />
                <CopyBlock label="TL;DR Summary — Add this to your hero" rewritten={rewrite.tldr} id="tldr" copied={copied} onCopy={copyText} accentLeft />

                <div className="space-y-3 p-5 border border-[#f0f0f0] rounded-xl">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-[#0a0a0a] uppercase tracking-wide">FAQ Section — Add below your hero</p>
                    <button
                      onClick={() => copyText(rewrite.faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n"), "faqs")}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#e5e5e5] text-[11px] font-semibold text-[#666] hover:bg-[#f7f7f5] transition-colors"
                    >
                      {copied === "faqs"
                        ? <><Check className="w-3 h-3 text-emerald-500" /> Copied! ✓</>
                        : <><Copy className="w-3 h-3" /> Copy all</>
                      }
                    </button>
                  </div>
                  <div className="space-y-2">
                    {rewrite.faqs.map((faq, i) => (
                      <FaqBlock key={i} faq={faq} index={i} copied={copied} onCopy={copyText} />
                    ))}
                  </div>
                </div>

                <CopyBlock label="Meta Description (SEO + AI)" rewritten={rewrite.meta_description} id="meta" copied={copied} onCopy={copyText} />

                <div className="flex items-center gap-2 pt-2 border-t border-[#f0f0f0]">
                  <button
                    onClick={() => copyText(buildCopyAllText(), "all")}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-[14px]"
                    style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}
                  >
                    {copied === "all" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    Copy Everything →
                  </button>
                  <button
                    onClick={downloadAll}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#e5e5e5] text-[13px] font-semibold text-[#666] hover:bg-[#f7f7f5] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={handleRewrite}
                    disabled={rewriting}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#e5e5e5] text-[13px] font-semibold text-[#666] hover:bg-[#f7f7f5] transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Before / After */}
          {rewrite && (
            <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 space-y-5">
              <h2 className="text-[14px] font-bold text-[#0a0a0a]">See the difference</h2>
              <div className="grid grid-cols-2 gap-5">
                <BrowserMockup
                  url={domain || "yoursite.com"}
                  topColor="#dc2626"
                  topLabel="BEFORE"
                  scoreLabel={`❌ AI score: ${analysis?.total ?? "?"}/100`}
                >
                  <p className="text-[17px] font-bold text-[#0a0a0a] leading-tight mb-2">
                    {currentH1 || "Your headline"}
                  </p>
                  <p className="text-[13px] text-[#6b6b6b] mb-4 leading-relaxed">
                    {currentSub || "Your subheadline"}
                  </p>
                  <div className="inline-block px-4 py-2 rounded-lg bg-[#0a0a0a] text-white text-[12px] font-semibold">
                    {heroData?.cta || "Get started"}
                  </div>
                </BrowserMockup>

                <BrowserMockup
                  url={domain || "yoursite.com"}
                  topColor="#16a34a"
                  topLabel="AFTER"
                  scoreLabel="✓ Estimated AI score: 85+/100"
                >
                  <p className="text-[17px] font-bold text-[#0a0a0a] leading-tight mb-2">
                    {rewrite.h1}
                  </p>
                  <p className="text-[13px] text-[#6b6b6b] mb-2 leading-relaxed">
                    {rewrite.subheadline}
                  </p>
                  <p className="text-[11px] text-[#aaaaaa] italic mb-4 leading-relaxed">
                    {rewrite.tldr}
                  </p>
                  <div className="inline-block px-4 py-2 rounded-lg text-white text-[12px] font-semibold" style={{ background: "#5B2D91" }}>
                    {heroData?.cta || "Get started"}
                  </div>
                </BrowserMockup>
              </div>
            </div>
          )}

          {/* Implementation guide */}
          {rewrite && (
            <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 space-y-5">
              <h2 className="text-[14px] font-bold text-[#0a0a0a]">How to implement these changes</h2>

              <div className="flex flex-wrap gap-0 border-b border-[#f0f0f0] -mx-1">
                {PLATFORM_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-2 mx-1 text-[12px] font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-[#5B2D91] text-[#5B2D91]"
                        : "border-transparent text-[#888] hover:text-[#444]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {PLATFORM_STEPS[activeTab].map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#5B2D91]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[11px] font-bold text-[#5B2D91]">{i + 1}</span>
                    </div>
                    <span className="text-[13px] text-[#3a3a3a] leading-relaxed">{s}</span>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-[11px] font-bold text-[#aaaaaa] uppercase tracking-wide mb-5">Impact timeline</p>
                <div className="relative flex items-start justify-between">
                  <div className="absolute top-[10px] left-0 right-0 h-px bg-[#e5e5e5]" />
                  {TIMELINE.map((item, i) => (
                    <div key={i} className="relative flex flex-col items-center gap-2.5 flex-1">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 ${i === 0 ? "bg-[#5B2D91] border-[#5B2D91]" : "bg-white border-[#d0d0d0]"}`}>
                        {i === 0 && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div className="text-center px-1">
                        <p className="text-[10px] font-bold text-[#5B2D91] mb-0.5">{item.weeks}</p>
                        <p className="text-[11px] text-[#6b6b6b] leading-tight">{item.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#f3eeff] rounded-xl px-4 py-3.5 flex items-start gap-3">
                <span className="text-[18px] shrink-0">💡</span>
                <p className="text-[13px] text-[#3a2060] leading-relaxed">
                  <span className="font-semibold">The TL;DR and FAQ sections alone can improve your AI visibility score by 15–25 points.</span>{" "}
                  They&apos;re the format AI models extract and cite most frequently.
                </p>
              </div>
            </div>
          )}

          {!rewriting && (
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 text-[13px] text-[#aaaaaa] hover:text-[#555] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> View analysis
            </button>
          )}
        </div>
      )}

    </div>
  );
}
