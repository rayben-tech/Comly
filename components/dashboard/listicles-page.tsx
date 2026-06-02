"use client";

import { useState } from "react";
import { BrandProfile } from "@/types";
import {
  FileText, ChevronRight, Copy, Download,
  RefreshCw, Loader2, Check, Sparkles, Globe, Search, X,
} from "lucide-react";

// ─── helpers ─────────────────────────────────────────────────────────────────

interface Suggestion { title: string; slug: string; description: string; }

function slugify(s: string) {
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

// ─── markdown → rich HTML ─────────────────────────────────────────────────────

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inlineMarkdown(text: string): string {
  return esc(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

interface Section { heading: string; number: string; body: string[]; }

function parseMarkdown(md: string): { title: string; intro: string[]; sections: Section[] } {
  const lines = md.split("\n");
  let title = "";
  const intro: string[] = [];
  const sections: Section[] = [];
  let current: Section | null = null;
  let pastTitle = false;

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!pastTitle && line.startsWith("# ")) {
      title = line.slice(2).trim();
      pastTitle = true;
      continue;
    }
    if (line.startsWith("## ")) {
      if (current) sections.push(current);
      const heading = line.slice(3).trim();
      // "1. Tool Name" or "Tool Name"
      const match = heading.match(/^(\d+)\.\s+(.+)$/);
      current = match
        ? { number: match[1], heading: match[2].trim(), body: [] }
        : { number: String(sections.length + 1), heading, body: [] };
    } else if (current) {
      current.body.push(line);
    } else if (pastTitle && line.trim()) {
      intro.push(line);
    }
  }
  if (current) sections.push(current);
  return { title, intro, sections };
}

function renderBodyToHtml(bodyLines: string[]): string {
  const out: string[] = [];
  let inUl = false;
  let buf: string[] = [];

  function flushUl() {
    if (buf.length) {
      out.push(`<ul>${buf.map(i => `<li>${inlineMarkdown(i)}</li>`).join("")}</ul>`);
      buf = [];
    }
    inUl = false;
  }

  for (const line of bodyLines) {
    const t = line.trim();
    if (!t) { flushUl(); continue; }
    if (t.startsWith("- ") || t.startsWith("* ")) {
      inUl = true;
      buf.push(t.slice(2));
    } else if (t.startsWith("### ")) {
      flushUl();
      out.push(`<h3>${inlineMarkdown(t.slice(4))}</h3>`);
    } else if (t.startsWith("**") && t.endsWith("**") && t.indexOf("**", 2) === t.length - 2) {
      flushUl();
      out.push(`<p class="meta-line"><strong>${inlineMarkdown(t.slice(2, -2))}</strong></p>`);
    } else {
      flushUl();
      out.push(`<p>${inlineMarkdown(t)}</p>`);
    }
  }
  flushUl();
  return out.join("\n");
}

function cleanMeta(s: string): string {
  return s.replace(/\*\*/g, "").replace(/#+\s*/g, "").replace(/^[-–—:]\s*/, "").trim();
}

function extractMeta(body: string[]) {
  const bestForIdx = body.findIndex(l => /best for/i.test(l));
  const pricingIdx = body.findIndex(l => /pricing/i.test(l));

  function getContent(idx: number, label: RegExp): string {
    if (idx === -1) return "";
    const inline = cleanMeta(body[idx].replace(label, ""));
    if (inline) return inline;
    // label was a standalone heading — grab the next non-empty line
    const next = body.slice(idx + 1).find(l => l.trim() && !l.match(/^#{1,3}\s/));
    return next ? cleanMeta(next) : "";
  }

  const bestFor = getContent(bestForIdx, /best for:?/i);
  const pricing = getContent(pricingIdx, /pricing:?/i) || "—";
  const exclude = new Set([bestForIdx, pricingIdx].filter(i => i !== -1));
  const bodyWithout = body.filter((_, i) => !exclude.has(i));
  return { bestFor, pricing, bodyWithout };
}

interface FaqItem { q: string; a: string; }

function parseFaq(body: string[]): FaqItem[] {
  const items: FaqItem[] = [];
  let currentQ = "";
  const answerBuf: string[] = [];

  const flush = () => {
    if (currentQ && answerBuf.length) {
      items.push({ q: currentQ, a: answerBuf.join(" ").trim() });
      answerBuf.length = 0;
    }
  };

  for (const line of body) {
    const t = line.trim();
    if (t.startsWith("### ")) {
      flush();
      currentQ = t.slice(4).replace(/\*\*/g, "").trim();
    } else if (currentQ && t && !t.startsWith("#")) {
      answerBuf.push(t.replace(/\*\*/g, "").replace(/^[*-]\s*/, "").trim());
    }
  }
  flush();
  return items;
}

function buildRichHtml(markdown: string, brandName: string, articleTitle: string): string {
  const { title, intro, sections } = parseMarkdown(markdown);
  const displayTitle = title || articleTitle;
  const dateStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const isoDate = new Date().toISOString().split("T")[0];

  const toolSections = sections.filter(s => !s.heading.toLowerCase().match(/^(conclusion|faq|frequently asked)/));
  const conclusionSection = sections.find(s => /^conclusion/i.test(s.heading));
  const faqSection = sections.find(s => /^faq|^frequently/i.test(s.heading));
  const faqItems = faqSection ? parseFaq(faqSection.body) : [];

  // ── JSON-LD schemas ──────────────────────────────────────────────────────────
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": displayTitle,
    "description": intro[0]?.replace(/\*\*/g, "").slice(0, 200) || displayTitle,
    "numberOfItems": toolSections.length,
    "itemListElement": toolSections.map((s, i) => {
      const { bestFor } = extractMeta(s.body);
      const firstSentence = s.body.find(l => l.trim() && !l.startsWith("**") && !l.startsWith("#"));
      return {
        "@type": "ListItem",
        "position": i + 1,
        "name": s.heading,
        "description": (bestFor || firstSentence || "").replace(/\*\*/g, "").slice(0, 200),
      };
    }),
  };

  const faqSchema = faqItems.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": { "@type": "Answer", "text": item.a },
    })),
  } : null;

  // ── HTML blocks ──────────────────────────────────────────────────────────────
  const introHtml = intro.length > 0
    ? intro.map(l => `<p>${inlineMarkdown(l)}</p>`).join("")
    : "";

  const itemBlocks = toolSections.map((s, i) => {
    const { bestFor, pricing, bodyWithout } = extractMeta(s.body);
    return `
    <section class="tool-section" id="tool-${i + 1}">
      <h2>${i + 1}. ${esc(s.heading)}</h2>
      <div class="tool-body">${renderBodyToHtml(bodyWithout)}</div>
      ${bestFor || (pricing && pricing !== "—") ? `
      <div class="tool-details">
        ${bestFor ? `<p><strong>Best for:</strong> ${esc(bestFor)}</p>` : ""}
        ${pricing && pricing !== "—" ? `<p><strong>Pricing:</strong> ${esc(pricing)}</p>` : ""}
      </div>` : ""}
    </section>`;
  }).join("");

  const tableRows = toolSections.map((s, i) => {
    const { bestFor, pricing } = extractMeta(s.body);
    return `<tr>
      <td><strong>${i + 1}. ${esc(s.heading)}</strong></td>
      <td>${esc(bestFor || "—")}</td>
      <td>${esc(pricing)}</td>
    </tr>`;
  }).join("");

  const conclusionHtml = conclusionSection
    ? `<section class="conclusion">
        <h2>Conclusion</h2>
        <div>${renderBodyToHtml(conclusionSection.body)}</div>
      </section>`
    : "";

  const faqHtml = faqItems.length > 0
    ? `<section class="faq-section">
        <h2>Frequently Asked Questions</h2>
        ${faqItems.map(item => `
        <div class="faq-item">
          <h3>${esc(item.q)}</h3>
          <p>${esc(item.a)}</p>
        </div>`).join("")}
      </section>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(displayTitle)}</title>
<meta name="description" content="${esc((intro[0]?.replace(/\*\*/g, "") || displayTitle).slice(0, 155))}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify(itemListSchema)}</script>
${faqSchema ? `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>` : ""}
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif; background: #fff; color: #111827; line-height: 1.7; font-size: 15px; -webkit-font-smoothing: antialiased; }

  .page { max-width: 760px; margin: 0 auto; padding: 48px 32px 80px; }

  /* header */
  .page-header { margin-bottom: 40px; padding-bottom: 28px; border-bottom: 2px solid #f3f4f6; }
  .page-meta { font-size: 12px; color: #9ca3af; margin-bottom: 12px; }
  .page-meta span { margin-right: 14px; }
  h1 { font-size: 34px; font-weight: 800; letter-spacing: -0.025em; color: #0a0a0a; line-height: 1.2; margin-bottom: 14px; }
  .page-intro p { font-size: 16px; color: #374151; line-height: 1.8; margin-bottom: 8px; }

  /* tool sections */
  .tool-section { margin-bottom: 44px; padding-bottom: 44px; border-bottom: 1px solid #f3f4f6; }
  .tool-section h2 { font-size: 22px; font-weight: 700; color: #0a0a0a; margin-bottom: 14px; letter-spacing: -0.015em; }
  .tool-body p { font-size: 15px; color: #374151; margin-bottom: 10px; line-height: 1.75; }
  .tool-body h3 { font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; margin: 18px 0 6px; }
  .tool-body ul { list-style: disc; padding-left: 20px; display: flex; flex-direction: column; gap: 5px; }
  .tool-body ul li { font-size: 14.5px; color: #374151; line-height: 1.65; }
  .tool-body .meta-line { font-size: 13px; color: #374151; background: #f3f4f6; border-radius: 6px; padding: 3px 9px; display: inline-block; margin: 2px 4px 2px 0; }

  /* tool details callout */
  .tool-details { margin-top: 14px; padding: 14px 18px; background: #f9fafb; border-left: 3px solid #d1d5db; border-radius: 0 8px 8px 0; display: flex; flex-wrap: wrap; gap: 6px 28px; }
  .tool-details p { font-size: 13.5px; color: #374151; line-height: 1.5; margin: 0; }
  .tool-details strong { color: #0a0a0a; }

  /* comparison table */
  .comparison-section { margin: 48px 0; }
  .comparison-section > h2 { font-size: 20px; font-weight: 700; color: #0a0a0a; margin-bottom: 16px; letter-spacing: -0.01em; }
  .table-wrap { border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
  table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  thead th { background: #f3f4f6; color: #374151; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; padding: 10px 16px; text-align: left; border-bottom: 1px solid #e5e7eb; }
  tbody td { padding: 11px 16px; border-bottom: 1px solid #f3f4f6; vertical-align: top; color: #374151; }
  tbody tr:last-child td { border-bottom: none; }
  tbody td:first-child { color: #0a0a0a; font-weight: 500; }

  /* conclusion */
  .conclusion { margin: 44px 0; padding: 24px 28px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; }
  .conclusion h2 { font-size: 18px; font-weight: 700; color: #0a0a0a; margin-bottom: 12px; }
  .conclusion p { font-size: 14.5px; color: #374151; line-height: 1.75; margin-bottom: 8px; }
  .conclusion p:last-child { margin-bottom: 0; }
  .conclusion ul { list-style: disc; padding-left: 20px; display: flex; flex-direction: column; gap: 5px; }
  .conclusion ul li { font-size: 14px; color: #374151; line-height: 1.65; }

  /* FAQ */
  .faq-section { margin: 48px 0; }
  .faq-section > h2 { font-size: 20px; font-weight: 700; color: #0a0a0a; margin-bottom: 20px; letter-spacing: -0.01em; }
  .faq-item { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #f3f4f6; }
  .faq-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
  .faq-item h3 { font-size: 15px; font-weight: 600; color: #0a0a0a; margin-bottom: 6px; line-height: 1.4; }
  .faq-item p { font-size: 14.5px; color: #374151; line-height: 1.75; }

  /* footer */
  .footer { margin-top: 56px; padding-top: 20px; border-top: 1px solid #f3f4f6; font-size: 12px; color: #9ca3af; display: flex; justify-content: space-between; }

  @media print {
    body { font-size: 13px; }
    .page { padding: 32px 24px 48px; }
    .tool-section { break-inside: avoid; }
    .faq-item { break-inside: avoid; }
  }
</style>
</head>
<body>
<div class="page">

  <header class="page-header">
    <div class="page-meta">
      <span>${esc(brandName)}</span>
      <span>${dateStr}</span>
      <span>${toolSections.length} tools compared</span>
    </div>
    <h1>${esc(displayTitle)}</h1>
    ${introHtml ? `<div class="page-intro">${introHtml}</div>` : ""}
  </header>

  ${itemBlocks}

  ${conclusionHtml}

  ${toolSections.length > 0 ? `
  <section class="comparison-section">
    <h2>Quick Comparison</h2>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Tool</th><th>Best for</th><th>Pricing</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>
  </section>` : ""}

  ${faqHtml}

  <footer class="footer">
    <span>Published by ${esc(brandName)} via Comly</span>
    <span>${dateStr}</span>
  </footer>

</div>
</body>
</html>`;
}

// ─── preview modal ────────────────────────────────────────────────────────────

function PreviewModal({
  html,
  title,
  onClose,
  onRegenerate,
  loading,
}: {
  html: string;
  title: string;
  onClose: () => void;
  onRegenerate: () => void;
  loading: boolean;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  function downloadHtml() {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(title)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printPdf() {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 600);
  }

  function copyHtml() {
    navigator.clipboard.writeText(html).catch(() => {});
    setCopied("html");
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-[#e5e5e5] shrink-0">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[#0a0a0a] truncate">{title}</p>
          <p className="text-[11px] text-[#6b6b6b]">Preview — looks exactly like the download</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={copyHtml}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-[12px] font-semibold text-[#555] hover:bg-[#f7f7f5] transition-colors">
            {copied === "html" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            Copy HTML
          </button>
          <button onClick={downloadHtml}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-[12px] font-semibold text-[#555] hover:bg-[#f7f7f5] transition-colors">
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
          <button onClick={printPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-[12px] font-semibold transition-opacity"
            style={{ background: "linear-gradient(135deg,#5B2D91,#7c3aed)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Save as PDF
          </button>
          <button onClick={onRegenerate} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-[12px] font-semibold text-[#555] hover:bg-[#f7f7f5] transition-colors disabled:opacity-40">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Regenerate
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#f0f0f0] transition-colors text-[#6b6b6b]">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iframe preview */}
      <div className="flex-1 overflow-hidden bg-[#f0f0f0] px-6 py-6">
        <div className="h-full max-w-4xl mx-auto bg-white rounded-xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.2)]">
          <iframe
            srcDoc={html}
            className="w-full h-full border-0"
            title="Listicle preview"
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

interface Props { profile: BrandProfile; }

export function ListiclesPage({ profile }: Props) {
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [richHtml,         setRichHtml]         = useState<string | null>(null);
  const [loading,          setLoading]          = useState(false);
  const [activeTitle,      setActiveTitle]      = useState<string | null>(null);
  const [showModal,        setShowModal]        = useState(false);
  const [error,            setError]            = useState("");

  const suggestions = buildSuggestions(profile);

  async function generate(title: string) {
    setLoading(true);
    setActiveTitle(title);
    setGeneratedContent(null);
    setRichHtml(null);
    setError("");
    if (showModal) setShowModal(false);
    try {
      const listicleRes = await fetch("/api/generate-listicle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, title }),
      });
      const data = await listicleRes.json();
      if (!listicleRes.ok) throw new Error(data.error || "Failed to generate");
      setGeneratedContent(data.markdown);
      setRichHtml(buildRichHtml(data.markdown, profile.brand_name, title));
      setShowModal(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Preview modal */}
      {showModal && richHtml && activeTitle && (
        <PreviewModal
          html={richHtml}
          title={activeTitle}
          onClose={() => setShowModal(false)}
          onRegenerate={() => activeTitle && generate(activeTitle)}
          loading={loading}
        />
      )}

      <div className="p-6 space-y-5">

        {/* Page header */}
        <div>
          <h1 className="text-[18px] font-bold text-[#0a0a0a]">Listicle Pages Generator</h1>
          <p className="text-[13px] text-[#6b6b6b] mt-1">
            Create AI-friendly listicle pages that get you mentioned in ChatGPT and Perplexity
          </p>
        </div>

        {/* Education section */}
        <div className="bg-white border border-[#e5e5e5] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.10)] p-6 space-y-5">
          <h2 className="text-[16px] font-bold text-[#0a0a0a]">What are listicles?</h2>

          <div>
            <p className="text-[13px] text-[#6b6b6b] mb-3">Listicles are articles like:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { title: "Best note-taking apps for remote teams in 2026", slug: "/blog/best-note-taking-apps", items: ["Notion", "Obsidian", "Roam Research"] },
                { title: "Top alternatives to Notion", slug: "/blog/notion-alternatives", items: ["Coda", "Confluence", "ClickUp"] },
                { title: "10 tools for startup growth in 2026", slug: "/blog/tools-startup-growth", items: ["Linear", "Loom", "Intercom"] },
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
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { emoji: "📈", value: "3.2×", label: "more AI citations", sub: "vs pages without listicles", color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
              { emoji: "🎯", value: "10+",  label: "buyer queries hit",  sub: "per published listicle page", color: "#5B2D91", bg: "#f3eeff", border: "#e0d4f7" },
              { emoji: "⚡", value: "2–4 wks", label: "AI discovery time", sub: "after you publish & index", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
            ].map((stat, i) => (
              <div key={i} className="rounded-xl p-3 sm:p-4 border" style={{ background: stat.bg, borderColor: stat.border }}>
                <span className="text-[18px] sm:text-[22px]">{stat.emoji}</span>
                <p className="text-[20px] sm:text-[24px] font-bold mt-1.5 leading-none" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-[11px] sm:text-[12px] font-semibold text-[#0a0a0a] mt-1 leading-tight">{stat.label}</p>
                <p className="hidden sm:block text-[11px] text-[#6b6b6b] mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Generator section */}
        <div className="bg-white border border-[#e5e5e5] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.10)] p-6 space-y-4">
          <div>
            <h2 className="text-[16px] font-bold text-[#0a0a0a]">Generate your listicle pages</h2>
            <p className="text-[13px] text-[#6b6b6b] mt-0.5">We&apos;ll create ready-to-publish pages based on your brand profile</p>
            <p className="text-[12px] text-[#5B2D91] font-medium mt-1.5">✦ New listicle ideas added every week</p>
          </div>

          <div className="space-y-3">
            {suggestions.map((sug, i) => (
              <div key={i}
                className={`border rounded-xl p-5 transition-colors ${
                  activeTitle === sug.title && loading
                    ? "border-[#5B2D91]/30 bg-[#5B2D91]/[0.02]"
                    : "border-[#e5e5e5] hover:border-[#5B2D91]/20"
                }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#0a0a0a] leading-snug">{sug.title}</p>
                    <p className="text-[11px] text-[#5B2D91] font-mono mt-1.5 truncate">{sug.slug}</p>
                    <p className="text-[12px] text-[#6b6b6b] mt-1.5 leading-relaxed">{sug.description}</p>
                  </div>
                  <button onClick={() => generate(sug.title)} disabled={loading}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-white text-[12px] font-semibold transition-opacity disabled:opacity-40 shrink-0"
                    style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}>
                    {loading && activeTitle === sug.title
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Sparkles className="w-3.5 h-3.5" />}
                    Generate
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>
          )}

          {generatedContent && !loading && activeTitle && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-[13px] font-semibold text-emerald-800 truncate">{activeTitle} — ready</p>
              </div>
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#5B2D91] bg-white border border-[#5B2D91]/20 hover:bg-[#f3eeff] transition-colors shrink-0">
                Preview &amp; Download →
              </button>
            </div>
          )}
        </div>

        {/* How to publish */}
        <div className="bg-white border border-[#e5e5e5] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.10)] p-6 space-y-4">
          <h2 className="text-[14px] font-bold text-[#0a0a0a]">How to publish these pages</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Copy,     label: "Copy HTML",       sub: "from the preview above" },
              { icon: FileText, label: "Create a page",   sub: "in Webflow, WordPress, Notion…" },
              { icon: Globe,    label: "Paste & publish", sub: "make it live on your domain" },
              { icon: Search,   label: "Submit to GSC",   sub: "Google Search Console indexing" },
            ].map(({ icon: Icon, label, sub }, i) => (
              <div key={i} className="relative flex flex-col items-center text-center gap-2 px-2 pt-4 pb-3 border border-[#e5e5e5] rounded-xl bg-white">
                <div className="w-9 h-9 rounded-full bg-[#5B2D91] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                {i < 3 && <div className="absolute right-0 top-[26px] translate-x-1/2 w-3 h-px bg-[#d0d0d0] z-10" />}
                <div>
                  <p className="text-[12px] font-semibold text-[#0a0a0a]">{label}</p>
                  <p className="text-[11px] text-[#6b6b6b] mt-0.5 leading-snug">{sub}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-[#f3eeff] rounded-xl px-4 py-3.5 flex items-start gap-3">
            <span className="text-[18px] shrink-0">💡</span>
            <p className="text-[13px] text-[#3a2060] leading-relaxed">
              <span className="font-semibold">Pro tip:</span> Once published, your page will be discovered by AI models within 2–4 weeks as they crawl and index new content.
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
