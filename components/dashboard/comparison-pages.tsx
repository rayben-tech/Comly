"use client";

import { useState, useEffect } from "react";
import { BrandProfile } from "@/types";
import {
  Copy, Download, Check, Loader2, Plus, X,
  RefreshCw, Trash2, Sparkles, ExternalLink, Lock,
} from "lucide-react";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function toHtml(md: string): string {
  return md
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^[-*] (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n\n/g, "</p>\n<p>");
}

const PLATFORM_TABS = [
  { id: "any",       label: "Any Platform" },
  { id: "webflow",   label: "Webflow" },
  { id: "wordpress", label: "WordPress" },
  { id: "framer",    label: "Framer" },
  { id: "notion",    label: "Notion" },
  { id: "ghost",     label: "Ghost" },
];

const PLATFORM_STEPS: Record<string, string[]> = {
  any: [
    "Copy the markdown or HTML above",
    "Create a new blog post or page on your website",
    "Set the URL slug to: /blog/[brand]-vs-[competitor]",
    "Paste the content and publish",
    "Add internal links from your homepage to this page",
    "Submit the URL to Google Search Console",
  ],
  webflow: [
    "Go to your CMS Collections → Blog Posts",
    "Create a new item",
    "Set the slug to: [brand]-vs-[competitor]",
    "Paste the content into your rich text field",
    "Publish and submit to Google Search Console",
  ],
  wordpress: [
    "Go to Posts → Add New",
    "Paste the content into the editor",
    "Set the permalink to: /blog/[brand]-vs-[competitor]",
    "Publish the post",
    "Submit URL to Google Search Console",
  ],
  framer: [
    "Open your Framer CMS collection",
    "Create a new post with slug: [brand]-vs-[competitor]",
    "Add the content to your template",
    "Publish your site",
  ],
  notion: [
    "Create a new page in your workspace",
    "Paste the content and format headings",
    "Click Share → Publish to web",
    "Copy the public URL and link to it from your main site",
  ],
  ghost: [
    "Go to Posts → New post",
    "Paste the content",
    "Set the URL slug: [brand]-vs-[competitor]",
    "Publish the post",
    "Submit to Google Search Console",
  ],
};

const TIMELINE = [
  { weeks: "Week 1–2",  label: "Page indexed by Google" },
  { weeks: "Week 2–4",  label: "AI models discover the page" },
  { weeks: "Week 4–6",  label: "Score improves on next Comly audit" },
  { weeks: "Week 6+",   label: "Consistent mentions in AI answers" },
];

interface TrackedUrl {
  url: string;
  status: "idle" | "checking" | "live" | "notfound";
}

interface Props {
  profile: BrandProfile;
  locked?: boolean;
  onGenerated?: () => void;
}

function matchesCompetitor(url: string, competitor: string): boolean {
  const urlNorm = url.toLowerCase().replace(/[^a-z0-9]/g, "");
  const compNorm = competitor.toLowerCase().replace(/[^a-z0-9]/g, "");
  const minLen = Math.max(3, Math.min(compNorm.length, 6));
  const hasCompName = urlNorm.includes(compNorm.slice(0, minLen));
  const hasVsContext = /(vs|versus|compar|alternative)/i.test(url);
  return hasVsContext && hasCompName;
}

export function ComparisonPagesPage({ profile, locked, onGenerated }: Props) {
  const competitors = profile.competitors.slice(0, 5);
  const brandSlug = slugify(profile.brand_name);

  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("any");
  const [trackedUrls, setTrackedUrls] = useState<TrackedUrl[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Existence check: map of competitor → existing URL on their site
  const [existingUrls, setExistingUrls] = useState<Record<string, string>>({});
  const [checkState, setCheckState] = useState<"idle" | "checking" | "done">("idle");

  useEffect(() => {
    const domain = profile.url;
    if (!domain || competitors.length === 0) return;
    setCheckState("checking");
    fetch("/api/check-existing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "comparison-pages", domain }),
    })
      .then((r) => r.json())
      .then((data) => {
        const urls: string[] = data.urls || [];
        const matched: Record<string, string> = {};
        for (const comp of competitors) {
          const found = urls.find((u) => matchesCompetitor(u, comp));
          if (found) matched[comp] = found;
        }
        setExistingUrls(matched);
        setCheckState("done");
      })
      .catch(() => setCheckState("done"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.url]);

  function triggerDownload(content: string, title: string) {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(title)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function generate(competitor: string, type: "vs" | "alternatives", existing_content?: string) {
    const key = `${type}:${competitor}`;
    const title = `${profile.brand_name} vs ${competitor}`;
    setLoading(true);
    setActiveKey(key);
    setGeneratedContent(null);
    setError("");
    setGeneratedTitle(title);
    try {
      const res = await fetch("/api/generate-comparison", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_name: profile.brand_name,
          description: profile.description,
          category: profile.category,
          target_users: profile.target_users,
          use_cases: profile.main_use_cases,
          differentiators: profile.differentiators,
          competitors: profile.competitors,
          pricing: profile.pricing_tiers?.map((t) => `${t.plan}: ${t.price}`).join(", ") || "",
          competitor,
          page_type: type,
          ...(existing_content ? { existing_content } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      setGeneratedContent(data.content);
      triggerDownload(data.content, title);
      onGenerated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  }

  function downloadMd() {
    if (!generatedContent) return;
    triggerDownload(generatedContent, generatedTitle);
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  async function addTrackedUrl() {
    const url = urlInput.trim();
    if (!url) return;
    setTrackedUrls((prev) => [...prev, { url, status: "checking" }]);
    setUrlInput("");
    try {
      const res = await fetch("/api/verify-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setTrackedUrls((prev) =>
        prev.map((t) => t.url === url ? { ...t, status: data.live ? "live" : "notfound" } : t)
      );
    } catch {
      setTrackedUrls((prev) =>
        prev.map((t) => t.url === url ? { ...t, status: "notfound" } : t)
      );
    }
  }

  function handleRegenerate() {
    if (!activeKey) return;
    const colonIdx = activeKey.indexOf(":");
    const type = activeKey.slice(0, colonIdx) as "vs" | "alternatives";
    const comp = activeKey.slice(colonIdx + 1);
    generate(comp, type);
  }

  const showResult = loading || !!generatedContent || !!error;

  return (
    <div className="p-6 space-y-5">

      {/* Page header */}
      <div>
        <h1 className="text-[18px] font-bold text-[#0a0a0a]">Comparison Pages Generator</h1>
        <p className="text-[13px] text-[#6b6b6b] mt-1">
          Create high-converting pages that get you mentioned when buyers compare tools in AI
        </p>
      </div>

      {/* ── SECTION 1: Education ─────────────────────────────── */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 space-y-5">
        <h2 className="text-[16px] font-bold text-[#0a0a0a]">What are comparison pages?</h2>

        <p className="text-[13px] text-[#6b6b6b] leading-relaxed">
          Comparison pages are dedicated pages on your website that compare your product directly against competitors.
        </p>

        {/* Mini VS page card mockups */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { a: "Notion", b: "Coda",       slug: "/blog/notion-vs-coda" },
            { a: "Notion", b: "Obsidian",   slug: "/blog/notion-vs-obsidian" },
            { a: "Notion", b: "Confluence", slug: "/blog/notion-vs-confluence" },
          ].map((card, i) => (
            <div key={i} className="border border-[#e5e5e5] rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="bg-[#f7f7f5] px-3 py-2 border-b border-[#e5e5e5] flex items-center gap-2">
                <div className="flex gap-1 shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ffbd2e]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#27c93f]" />
                </div>
                <div className="flex-1 min-w-0 bg-white border border-[#e5e5e5] rounded text-[9px] text-[#aaaaaa] px-1.5 py-0.5 truncate text-center">
                  yoursite.com{card.slug}
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold text-[#5B2D91]">{card.a}</span>
                  <span className="text-[9px] font-bold text-[#aaaaaa] bg-[#f0f0f0] px-1.5 py-0.5 rounded">VS</span>
                  <span className="text-[11px] font-bold text-[#0a0a0a]">{card.b}</span>
                </div>
                {["Pricing", "Features", "Best for"].map((row, j) => (
                  <div key={j} className="flex items-center gap-1 mb-1.5">
                    <div className="flex-1 h-1.5 rounded-full bg-[#5B2D91]/25" />
                    <span className="text-[8px] text-[#aaaaaa] shrink-0 px-1">{row}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-[#f0f0f0]" />
                  </div>
                ))}
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="h-1 rounded-full bg-[#5B2D91] w-3/5" />
                  <span className="text-[8px] text-[#5B2D91] font-bold">Winner</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[13px] text-[#6b6b6b] leading-relaxed">
          These pages are one of the most powerful ways to get mentioned in AI answers. When someone asks ChatGPT
          &ldquo;which is better, X or Y?&rdquo; — AI pulls directly from comparison pages like these.
        </p>

        <div className="bg-[#0f0f0f] rounded-xl p-4 font-mono text-[12px] space-y-1.5">
          <div className="text-[#888]">yoursite.com/</div>
          <div className="text-[#7ee787]">├── /blog/notion-vs-coda</div>
          <div className="text-[#7ee787]">├── /blog/notion-vs-obsidian</div>
          <div className="text-[#7ee787]">└── /blog/notion-vs-confluence</div>
        </div>

        {/* AI query flow */}
        <div>
          <p className="text-[13px] font-semibold text-[#0a0a0a] mb-3">Why this works</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { emoji: "💬", label: "Buyer asks",      sub: '"Which is better, X or Y?"',           bg: "#f7f7f5", border: "#e5e5e5",  text: "#6b6b6b" },
              { emoji: "🔍", label: "AI searches",     sub: "scans for comparison pages",            bg: "#fffbeb", border: "#fde68a",  text: "#92400e" },
              { emoji: "📄", label: "Finds your page", sub: "/blog/you-vs-competitor",               bg: "#f3eeff", border: "#d4b8f0",  text: "#5B2D91" },
              { emoji: "✅", label: "Cites you",       sub: "recommends your brand in the answer",   bg: "#f0fdf4", border: "#bbf7d0",  text: "#166534" },
            ].map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center gap-1.5 px-2 py-3 rounded-xl border" style={{ background: step.bg, borderColor: step.border }}>
                <span className="text-[20px]">{step.emoji}</span>
                <p className="text-[11px] font-bold" style={{ color: step.text }}>{step.label}</p>
                <p className="text-[10px] leading-snug" style={{ color: step.text, opacity: 0.8 }}>{step.sub}</p>
                {i < 3 && (
                  <span className="absolute -right-2.5 top-1/2 -translate-y-1/2 text-[14px] text-[#aaaaaa] z-10 font-bold">›</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Suggested comparisons ────────────────── */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[16px] font-bold text-[#0a0a0a]">Your suggested comparison pages</h2>
            <p className="text-[13px] text-[#6b6b6b] mt-0.5">One "vs" page per competitor detected in your audit</p>
          </div>
          {locked && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#f7f7f5] border border-[#e5e5e5] shrink-0">
              <Lock className="w-3 h-3 text-[#aaaaaa]" />
              <span className="text-[11px] text-[#aaaaaa] font-medium">1 / 1 used</span>
            </div>
          )}
        </div>
        {locked && !generatedContent && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#fafaf8] border border-[#e5e5e5] text-[13px] text-[#888]">
            <Lock className="w-4 h-4 shrink-0 text-[#bbb]" />
            You&apos;ve already generated a comparison page for this audit. Upgrade to Pro for unlimited generations.
          </div>
        )}

        {checkState === "checking" && (
          <div className="flex items-center gap-2 text-[13px] text-[#aaaaaa]">
            <Loader2 className="w-4 h-4 animate-spin text-[#5B2D91]" />
            Checking your site for existing comparison pages…
          </div>
        )}

        {competitors.length === 0 ? (
          <p className="text-[13px] text-[#aaaaaa]">No competitors found in your audit. Add a custom comparison below.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {competitors.map((comp) => {
              const card = {
                key: `vs:${comp}`,
                title: `${profile.brand_name} vs ${comp}`,
                slug: `/blog/${brandSlug}-vs-${slugify(comp)}`,
                description: `Compare ${profile.brand_name} directly against ${comp} — features, pricing, and use cases`,
                comp,
              };
              const isActive = activeKey === card.key && (loading || !!generatedContent);
              const existingUrl = existingUrls[comp];

              return (
                <div
                  key={card.key}
                  className={`border rounded-xl p-5 transition-colors ${
                    isActive
                      ? "border-[#5B2D91]/30 bg-[#5B2D91]/[0.02]"
                      : existingUrl
                      ? "border-emerald-200 bg-emerald-50/30"
                      : "border-[#e5e5e5] hover:border-[#5B2D91]/30"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-[28px] leading-none shrink-0 mt-0.5">⚖️</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[14px] font-bold text-[#0a0a0a] leading-snug">{card.title}</p>
                        {existingUrl && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            <Check className="w-3 h-3" />
                            Already live
                          </span>
                        )}
                      </div>
                      {existingUrl ? (
                        <a
                          href={existingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] text-emerald-700 hover:underline mt-1 truncate"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{existingUrl}</span>
                        </a>
                      ) : (
                        <p className="text-[11px] text-[#5B2D91] font-mono mt-1 truncate">{card.slug}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-[12px] text-[#6b6b6b] leading-relaxed mb-4">
                    {existingUrl
                      ? `Your existing page was found. Refine it with AI to improve its structure, depth, and AI-search ranking.`
                      : card.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f59e0b18] text-[#f59e0b]">
                      HIGH IMPACT
                    </span>
                    {existingUrl ? (
                      <button
                        onClick={() => generate(card.comp, "vs", `Existing comparison page URL: ${existingUrl}`)}
                        disabled={loading || locked}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-[12px] font-semibold transition-opacity disabled:opacity-40"
                        style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}
                      >
                        {loading && activeKey === card.key
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : locked ? <Lock className="w-3.5 h-3.5" />
                          : <Sparkles className="w-3.5 h-3.5" />}
                        Refine →
                      </button>
                    ) : (
                      <button
                        onClick={() => generate(card.comp, "vs")}
                        disabled={loading || locked}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-[12px] font-semibold transition-opacity disabled:opacity-40"
                        style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}
                      >
                        {loading && activeKey === card.key
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : locked ? <Lock className="w-3.5 h-3.5" />
                          : null}
                        Generate →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Custom comparison */}
        {!showCustomInput ? (
          <button
            onClick={() => !locked && setShowCustomInput(true)}
            disabled={locked}
            className="flex items-center gap-2 text-[13px] font-semibold text-[#5B2D91] hover:text-[#4a2478] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Create custom comparison
          </button>
        ) : (
          <div className="border border-[#e5e5e5] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-[#0a0a0a]">Compare {profile.brand_name} vs</p>
              <button
                onClick={() => { setShowCustomInput(false); setCustomInput(""); }}
                className="text-[#aaaaaa] hover:text-[#666] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customInput.trim() && !locked) {
                    generate(customInput.trim(), "vs");
                    setShowCustomInput(false);
                    setCustomInput("");
                  }
                }}
                placeholder="e.g. HubSpot"
                className="flex-1 border border-[#e5e5e5] rounded-lg px-3 py-2 text-[13px] text-[#0a0a0a] outline-none focus:border-[#5B2D91]/50 transition-colors placeholder:text-[#cccccc]"
              />
              <button
                onClick={() => {
                  if (customInput.trim() && !locked) {
                    generate(customInput.trim(), "vs");
                    setShowCustomInput(false);
                    setCustomInput("");
                  }
                }}
                disabled={!customInput.trim() || loading || locked}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-[13px] font-semibold disabled:opacity-40 transition-opacity"
                style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}
              >
                Generate →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 3: Result ────────────────────────────────── */}
      {showResult && (
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-5">
          {loading && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#5B2D91]/20 border-t-[#5B2D91] animate-spin" />
              <p className="text-[13px] text-[#6b6b6b] font-medium">Writing your comparison page...</p>
            </div>
          )}
          {error && !loading && (
            <div className="text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>
          )}
          {generatedContent && !loading && (
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-[13px] font-semibold text-emerald-800 truncate">{generatedTitle} — downloaded</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => copyText(generatedContent, "md")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-[12px] font-semibold text-[#666] hover:bg-[#f7f7f5] transition-colors"
                >
                  {copied === "md" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Markdown
                </button>
                <button
                  onClick={() => copyText(toHtml(generatedContent), "html")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-[12px] font-semibold text-[#666] hover:bg-[#f7f7f5] transition-colors"
                >
                  {copied === "html" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy HTML
                </button>
                <button
                  onClick={downloadMd}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-[12px] font-semibold text-[#666] hover:bg-[#f7f7f5] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download again
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-[12px] font-semibold text-[#666] hover:bg-[#f7f7f5] transition-colors ml-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SECTION 4: How to publish ────────────────────────── */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 space-y-5">
        <h2 className="text-[14px] font-bold text-[#0a0a0a]">How to publish comparison pages</h2>

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
          {PLATFORM_STEPS[activeTab].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#5B2D91]/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[11px] font-bold text-[#5B2D91]">{i + 1}</span>
              </div>
              <span className="text-[13px] text-[#3a3a3a] leading-relaxed">{step}</span>
            </div>
          ))}
        </div>

        <div className="bg-[#f3eeff] rounded-xl px-4 py-3.5 flex items-start gap-3">
          <span className="text-[18px] shrink-0">💡</span>
          <p className="text-[13px] text-[#3a2060] leading-relaxed">
            <span className="font-semibold">Publish one comparison page per week.</span> Start with your
            biggest competitor first — that&apos;s where the most buying intent is.
          </p>
        </div>

        {/* Impact timeline */}
        <div>
          <p className="text-[11px] font-bold text-[#aaaaaa] uppercase tracking-wide mb-5">Impact timeline</p>
          <div className="relative flex items-start justify-between">
            <div className="absolute top-[10px] left-0 right-0 h-px bg-[#e5e5e5]" />
            {TIMELINE.map((item, i) => (
              <div key={i} className="relative flex flex-col items-center gap-2.5 flex-1">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 ${
                    i === 0
                      ? "bg-[#5B2D91] border-[#5B2D91]"
                      : "bg-white border-[#d0d0d0]"
                  }`}
                >
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
      </div>

      {/* ── SECTION 5: Track published pages ────────────────── */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-[14px] font-bold text-[#0a0a0a]">Track published pages</h2>
          <p className="text-[13px] text-[#6b6b6b] mt-0.5">Add your published URLs to track if AI is citing them</p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addTrackedUrl(); }}
            placeholder="https://yoursite.com/blog/brand-vs-competitor"
            className="flex-1 border border-[#e5e5e5] rounded-lg px-3 py-2 text-[13px] text-[#0a0a0a] outline-none focus:border-[#5B2D91]/50 transition-colors placeholder:text-[#cccccc]"
          />
          <button
            onClick={addTrackedUrl}
            disabled={!urlInput.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#5B2D91] text-[13px] font-semibold text-[#5B2D91] hover:bg-[#5B2D91]/5 disabled:opacity-40 transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Add URL
          </button>
        </div>

        {trackedUrls.length > 0 && (
          <div className="space-y-2">
            {trackedUrls.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[#f0f0f0] bg-[#fafafa]">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-[13px] text-[#5B2D91] font-medium truncate hover:underline"
                >
                  {item.url}
                </a>
                <div className="shrink-0 flex items-center gap-2">
                  {item.status === "checking" && (
                    <span className="flex items-center gap-1.5 text-[12px] text-[#aaaaaa]">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Checking...
                    </span>
                  )}
                  {item.status === "live" && (
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3" />
                      Live
                    </span>
                  )}
                  {item.status === "notfound" && (
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      <X className="w-3 h-3" />
                      Not found
                    </span>
                  )}
                  <button
                    onClick={() => setTrackedUrls((prev) => prev.filter((_, j) => j !== i))}
                    className="text-[#cccccc] hover:text-[#888] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
