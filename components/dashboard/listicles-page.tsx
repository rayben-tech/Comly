"use client";

import { useState } from "react";
import { BrandProfile } from "@/types";
import {
  FileText, ChevronRight, Copy, Download,
  RefreshCw, Loader2, Plus, X, Check, Sparkles, Globe, Search, Lock,
} from "lucide-react";

interface Suggestion {
  title: string;
  slug: string;
  description: string;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function buildSuggestions(profile: BrandProfile): Suggestion[] {
  const year = new Date().getFullYear();
  const comp0 = profile.competitors[0] || "similar tools";
  const useCase0 = profile.main_use_cases[0] || profile.category;
  return [
    {
      title: `Best ${profile.category} Tools for ${profile.target_users} in ${year}`,
      slug: `/blog/best-${slugify(profile.category)}-tools-${year}`,
      description: `A comprehensive listicle featuring the top tools in your category including ${profile.brand_name}.`,
    },
    {
      title: `Top Alternatives to ${comp0} in ${year}`,
      slug: `/blog/alternatives-to-${slugify(comp0)}`,
      description: `Compare ${profile.brand_name} against ${comp0} and other alternatives buyers should consider.`,
    },
    {
      title: `10 Tools for ${useCase0} in ${year}`,
      slug: `/blog/tools-for-${slugify(useCase0)}`,
      description: `A curated list of tools that help with ${useCase0}, featuring ${profile.brand_name} as the top pick.`,
    },
  ];
}

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i} className="font-semibold text-[#0a0a0a]">{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>
  );
}

function MarkdownPreview({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("# ")) {
      elements.push(
        <h1 key={i} className="text-[22px] font-bold text-[#0a0a0a] mb-4 mt-1 leading-tight">
          {renderInline(trimmed.slice(2))}
        </h1>
      );
    } else if (trimmed.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-[17px] font-bold text-[#0a0a0a] mt-8 mb-3 pb-2 border-b border-[#f0f0f0] leading-tight">
          {renderInline(trimmed.slice(3))}
        </h2>
      );
    } else if (trimmed.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-[14px] font-semibold text-[#0a0a0a] mt-4 mb-1.5">
          {renderInline(trimmed.slice(4))}
        </h3>
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const items: string[] = [];
      while (
        i < lines.length &&
        (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* "))
      ) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="space-y-1.5 my-3">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-[14px] text-[#3a3a3a] leading-relaxed">
              <span className="text-[#5B2D91] mt-0.5 shrink-0 font-bold">•</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    } else if (trimmed !== "") {
      elements.push(
        <p key={i} className="text-[14px] text-[#3a3a3a] leading-relaxed mb-3">
          {renderInline(trimmed)}
        </p>
      );
    }
    i++;
  }

  return <>{elements}</>;
}

function toHtml(md: string): string {
  return md
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^[-*] (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[^]*?<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n\n/g, "</p>\n<p>")
    .replace(/^(?!<[hup])/gm, "");
}

interface Props {
  profile: BrandProfile;
  locked?: boolean;
  onGenerated?: () => void;
}

export function ListiclesPage({ profile, locked, onGenerated }: Props) {
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTitle, setActiveTitle] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState("");

  const suggestions = buildSuggestions(profile);

  function triggerDownload(content: string, title: string) {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(title)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function generate(title: string) {
    setLoading(true);
    setActiveTitle(title);
    setGeneratedContent(null);
    setError("");
    try {
      const res = await fetch("/api/generate-listicle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, title }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      setGeneratedContent(data.markdown);
      triggerDownload(data.markdown, title);
      onGenerated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  function downloadMd() {
    if (!generatedContent) return;
    triggerDownload(generatedContent, activeTitle || "listicle");
  }

  const showPreview = loading || generatedContent || error;

  return (
    <div className="p-6 space-y-5">

      {/* Page header */}
      <div>
        <h1 className="text-[18px] font-bold text-[#0a0a0a]">Listicle Pages Generator</h1>
        <p className="text-[13px] text-[#6b6b6b] mt-1">
          Create AI-friendly listicle pages that get you mentioned in ChatGPT and Perplexity
        </p>
      </div>

      {/* ── SECTION 1: Education ─────────────────────────────────── */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 space-y-5">
        <h2 className="text-[16px] font-bold text-[#0a0a0a]">What are listicles?</h2>

        <div>
          <p className="text-[13px] text-[#6b6b6b] mb-3">Listicles are articles like:</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { title: "Best note-taking apps for remote teams in 2026", slug: "/blog/best-note-taking-apps", items: ["Notion", "Obsidian", "Roam Research"] },
              { title: "Top alternatives to Notion", slug: "/blog/notion-alternatives", items: ["Coda", "Confluence", "ClickUp"] },
              { title: "10 tools for startup growth in 2026", slug: "/blog/tools-startup-growth", items: ["Linear", "Loom", "Intercom"] },
            ].map((card, i) => (
              <div key={i} className="border border-[#e5e5e5] rounded-xl overflow-hidden bg-white shadow-sm">
                {/* Browser chrome */}
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
                {/* Article skeleton */}
                <div className="p-3 space-y-2">
                  <p className="text-[11px] font-bold text-[#0a0a0a] leading-tight">{card.title}</p>
                  <div className="space-y-1.5 pt-0.5">
                    {card.items.map((item, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-[#5B2D91] shrink-0 w-3">{j + 1}.</span>
                        <span className="text-[10px] text-[#3a3a3a]">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="h-1 rounded-full bg-[#5B2D91]/20 w-2/3 mt-1" />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[13px] text-[#6b6b6b] mt-3">Each one = a standalone page on your website</p>
        </div>

        {/* File tree */}
        <div className="bg-[#0f0f0f] rounded-xl p-4 font-mono text-[12px] space-y-1.5">
          {[
            "/blog/best-note-taking-apps-2026",
            "/blog/best-notion-alternatives",
            "/blog/tools-for-remote-teams",
          ].map((path) => (
            <div key={path} className="text-[#7ee787]">{path}</div>
          ))}
        </div>
        <p className="text-[13px] text-[#6b6b6b]">
          Each URL = one page that AI models can discover and cite when recommending tools
        </p>

        {/* Why this works */}
        <div>
          <p className="text-[13px] font-semibold text-[#0a0a0a] mb-3">Why this works</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { emoji: "📈", value: "3.2×", label: "more AI citations", sub: "vs pages without listicles", color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
              { emoji: "🎯", value: "10+", label: "buyer queries hit", sub: "per published listicle page", color: "#5B2D91", bg: "#f3eeff", border: "#e0d4f7" },
              { emoji: "⚡", value: "2–4 wks", label: "AI discovery time", sub: "after you publish & index", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
            ].map((stat, i) => (
              <div key={i} className="rounded-xl p-4 border" style={{ background: stat.bg, borderColor: stat.border }}>
                <span className="text-[22px]">{stat.emoji}</span>
                <p className="text-[24px] font-bold mt-2 leading-none" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-[12px] font-semibold text-[#0a0a0a] mt-1.5">{stat.label}</p>
                <p className="text-[11px] text-[#6b6b6b] mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Generator ─────────────────────────────────── */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[16px] font-bold text-[#0a0a0a]">Generate your listicle pages</h2>
            <p className="text-[13px] text-[#6b6b6b] mt-0.5">
              We&apos;ll create ready-to-publish pages based on your brand profile
            </p>
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
            You&apos;ve already generated a listicle for this audit. Upgrade to Pro for unlimited generations.
          </div>
        )}

        <div className="space-y-3">
          {suggestions.map((sug, i) => (
            <div
              key={i}
              className={`border rounded-xl p-5 transition-colors ${
                activeTitle === sug.title && (loading || generatedContent)
                  ? "border-[#5B2D91]/30 bg-[#5B2D91]/[0.02]"
                  : "border-[#e5e5e5] hover:border-[#5B2D91]/20"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#0a0a0a] leading-snug">{sug.title}</p>
                  <p className="text-[11px] text-[#5B2D91] font-mono mt-1.5 truncate">{sug.slug}</p>
                  <p className="text-[12px] text-[#6b6b6b] mt-1.5 leading-relaxed">{sug.description}</p>
                </div>
                <button
                  onClick={() => generate(sug.title)}
                  disabled={loading || locked}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-white text-[12px] font-semibold transition-opacity disabled:opacity-40 shrink-0"
                  style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}
                >
                  {loading && activeTitle === sug.title ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : locked ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  Generate
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom idea */}
        {!showCustomInput ? (
          <button
            onClick={() => setShowCustomInput(true)}
            className="flex items-center gap-2 text-[13px] font-semibold text-[#5B2D91] hover:text-[#4a2478] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add custom listicle idea
          </button>
        ) : (
          <div className="border border-[#e5e5e5] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-[#0a0a0a]">What topic do you want to rank for?</p>
              <button
                onClick={() => { setShowCustomInput(false); setCustomInput(""); }}
                className="text-[#aaaaaa] hover:text-[#666] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customInput.trim()) {
                    generate(customInput.trim());
                    setShowCustomInput(false);
                    setCustomInput("");
                  }
                }}
                placeholder="e.g. Best tools for ecommerce founders"
                className="flex-1 border border-[#e5e5e5] rounded-lg px-3 py-2 text-[13px] text-[#0a0a0a] outline-none focus:border-[#5B2D91]/50 transition-colors placeholder:text-[#cccccc]"
                autoFocus
              />
              <button
                onClick={() => {
                  if (customInput.trim() && !locked) {
                    generate(customInput.trim());
                    setShowCustomInput(false);
                    setCustomInput("");
                  }
                }}
                disabled={!customInput.trim() || loading || locked}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-[13px] font-semibold disabled:opacity-40 transition-opacity"
                style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}
              >
                Generate
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 3: Result ────────────────────────────────────── */}
      {showPreview && (
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-5">
          {loading && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#5B2D91]/20 border-t-[#5B2D91] animate-spin" />
              <p className="text-[13px] text-[#6b6b6b] font-medium">Writing your listicle...</p>
            </div>
          )}
          {error && !loading && (
            <div className="text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>
          )}
          {generatedContent && !loading && (
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-[13px] font-semibold text-emerald-800 truncate">{activeTitle} — downloaded</p>
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
                  onClick={() => activeTitle && generate(activeTitle)}
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

      {/* ── SECTION 4: How to publish ─────────────────────────────── */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 space-y-4">
        <h2 className="text-[14px] font-bold text-[#0a0a0a]">How to publish these pages</h2>

        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Copy,     label: "Copy markdown",   sub: "from the generated output above" },
            { icon: FileText, label: "Create a page",   sub: "in Webflow, WordPress, Notion…" },
            { icon: Globe,    label: "Paste & publish",  sub: "make it live on your domain" },
            { icon: Search,   label: "Submit to GSC",   sub: "Google Search Console indexing" },
          ].map(({ icon: Icon, label, sub }, i) => (
            <div key={i} className="relative flex flex-col items-center text-center gap-2 px-2 pt-4 pb-3 border border-[#e5e5e5] rounded-xl bg-white">
              <div className="w-9 h-9 rounded-full bg-[#5B2D91] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-white" />
              </div>
              {i < 3 && (
                <div className="absolute right-0 top-[26px] translate-x-1/2 w-3 h-px bg-[#d0d0d0] z-10" />
              )}
              <div>
                <p className="text-[12px] font-semibold text-[#0a0a0a]">{label}</p>
                <p className="text-[11px] text-[#6b6b6b] mt-0.5 leading-snug">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#f3eeff] rounded-xl px-4 py-3.5 flex items-start gap-3 mt-2">
          <span className="text-[18px] shrink-0">💡</span>
          <p className="text-[13px] text-[#3a2060] leading-relaxed">
            <span className="font-semibold">Pro tip:</span> Once published, your page will be discovered by AI models within 2–4 weeks as they crawl and index new content.
          </p>
        </div>
      </div>

    </div>
  );
}
