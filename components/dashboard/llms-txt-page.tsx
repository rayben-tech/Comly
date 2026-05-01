"use client";

import { useState, useEffect } from "react";
import { BrandProfile } from "@/types";
import {
  Copy, Download, Check, Loader2, Plus, X, CheckCircle2, Sparkles, ExternalLink,
} from "lucide-react";

function ClaudeLogo() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="20" rx="5" fill="#D97249"/>
      <g transform="translate(10,10)" fill="white">
        <ellipse rx="1.3" ry="4" transform="rotate(0)"/>
        <ellipse rx="1.3" ry="4" transform="rotate(60)"/>
        <ellipse rx="1.3" ry="4" transform="rotate(120)"/>
      </g>
    </svg>
  );
}

const PLATFORM_TABS = [
  { id: "any",       label: "Any Platform" },
  { id: "webflow",   label: "Webflow" },
  { id: "wordpress", label: "WordPress" },
  { id: "framer",    label: "Framer" },
  { id: "vercel",    label: "Vercel" },
  { id: "github",    label: "GitHub Pages" },
];

const PLATFORM_STEPS: Record<string, string[]> = {
  any: [
    'Click "Download again" above to get the file',
    "Rename file to exactly: llms.txt",
    "Upload to your website's root folder (same place as robots.txt)",
    "Verify it works: visit yoursite.com/llms.txt in your browser",
  ],
  webflow: [
    "Go to Webflow → Pages → Static Files",
    "Upload llms.txt",
    "Publish your site",
    "Verify: yoursite.com/llms.txt",
  ],
  wordpress: [
    "Use an FTP client or File Manager in cPanel",
    "Navigate to your WordPress root directory (public_html)",
    "Upload llms.txt to the root",
    "Verify: yoursite.com/llms.txt",
  ],
  framer: [
    "Go to Site Settings → General",
    'Scroll to "Custom Code" or "Files"',
    "Upload llms.txt",
    "Publish",
  ],
  vercel: [
    "Place llms.txt in your /public folder",
    "git add, commit, push",
    "Vercel deploys automatically",
    "Verify: yoursite.com/llms.txt",
  ],
  github: [
    "Add llms.txt to the root of your gh-pages branch",
    "Commit and push",
    "GitHub Pages deploys automatically",
    "Verify: yourusername.github.io/llms.txt",
  ],
};

interface TagPillsProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

function TagPills({ tags, onChange }: TagPillsProps) {
  const [input, setInput] = useState("");
  const [adding, setAdding] = useState(false);

  function addTag() {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) onChange([...tags, trimmed]);
    setInput("");
    setAdding(false);
  }

  return (
    <div className="flex flex-wrap gap-2 items-center min-h-[32px]">
      {tags.map((tag, i) => (
        <span
          key={i}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f3eeff] text-[12px] font-medium text-[#5B2D91]"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter((_, j) => j !== i))}
            className="text-[#5B2D91]/40 hover:text-[#5B2D91] transition-colors ml-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      {adding ? (
        <input
          autoFocus
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); addTag(); }
            if (e.key === "Escape") { setAdding(false); setInput(""); }
          }}
          onBlur={() => (input.trim() ? addTag() : setAdding(false))}
          className="border border-[#5B2D91]/40 rounded-full px-2.5 py-1 text-[12px] outline-none w-28 text-[#0a0a0a] placeholder:text-[#ccc]"
          placeholder="Add..."
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-[#d0d0d0] text-[12px] text-[#aaaaaa] hover:border-[#5B2D91]/40 hover:text-[#5B2D91] transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add
        </button>
      )}
    </div>
  );
}

interface FieldRowProps {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}

function FieldRow({ label, optional, children }: FieldRowProps) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[#888]">
        {label}
        {optional && (
          <span className="text-[10px] font-normal text-[#aaaaaa] normal-case tracking-normal">optional</span>
        )}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-[#e5e5e5] rounded-lg px-3 py-2 text-[13px] text-[#0a0a0a] outline-none focus:border-[#5B2D91]/50 transition-colors placeholder:text-[#cccccc] bg-white";

function buildPreview(fields: {
  brandName: string; description: string; category: string;
  targetUsers: string; useCases: string[]; features: string[];
  competitors: string[]; pricing: string;
  websiteUrl: string; blogUrl: string; docsUrl: string; twitterUrl: string;
}): string {
  const { brandName, description, category, targetUsers, useCases, features, competitors, pricing, websiteUrl, blogUrl, docsUrl, twitterUrl } = fields;
  const n = brandName || "[Brand Name]";
  const lines = [
    `# ${n}`,
    "",
    `> ${description || `${n} helps you [what it does].`}`,
    "",
    "## Product",
    `${n} is a ${category || "[category]"} tool for ${targetUsers || "[target users]"}.`,
    "",
    "## Use Cases",
    ...(useCases.length > 0 ? useCases.map((u) => `- ${u}`) : ["- [use case 1]", "- [use case 2]"]),
    "",
    "## Target Audience",
    targetUsers || "[Describe your target users]",
    "",
    "## Key Features",
    ...(features.length > 0 ? features.map((f) => `- ${f}`) : ["- [feature 1]", "- [feature 2]"]),
    "",
    "## Competitors",
    `We are an alternative to: ${competitors.length > 0 ? competitors.join(", ") : "[competitor 1], [competitor 2]"}`,
    "",
    "## Pricing",
    ...(pricing ? pricing.split("\n") : ["- Free: [free tier]", "- Starter: $49/mo", "- Pro: $249/mo"]),
    "",
    "## Links",
    `- Homepage: ${websiteUrl || "[your URL]"}`,
    blogUrl ? `- Blog: ${blogUrl}` : `- Blog: ${websiteUrl || "[your URL]"}/blog`,
    ...(docsUrl ? [`- Docs: ${docsUrl}`] : []),
    ...(twitterUrl ? [`- Twitter: ${twitterUrl}`] : []),
  ];
  return lines.join("\n");
}

function CodeBlock({ content }: { content: string }) {
  return (
    <div className="bg-[#1a1a1a] rounded-xl p-4 overflow-x-auto">
      <pre className="font-mono text-[12px] leading-relaxed whitespace-pre-wrap break-words">
        {content.split("\n").map((line, i) => {
          if (line.startsWith("# "))  return <div key={i} className="text-[#79c0ff]">{line}</div>;
          if (line.startsWith("> "))  return <div key={i} className="text-[#888]">{line}</div>;
          if (line.startsWith("## ")) return <div key={i} className="text-[#f0883e]">{line}</div>;
          if (line.startsWith("- "))  return <div key={i} className="text-[#7ee787]">{line}</div>;
          if (line === "")            return <div key={i} className="h-[1em]" />;
          return <div key={i} className="text-[#e6edf3]">{line}</div>;
        })}
      </pre>
    </div>
  );
}

interface Props {
  profile: BrandProfile;
}

export function LlmsTxtPage({ profile }: Props) {
  const defaultFeatures = profile.differentiators
    ? profile.differentiators.split(/[,;]/).map((s) => s.trim()).filter(Boolean).slice(0, 5)
    : [];
  const defaultPricing = profile.pricing_tiers?.length
    ? profile.pricing_tiers.map((t) => `- ${t.plan}: ${t.price}`).join("\n")
    : "- Free: one-time audit\n- Starter: $49/mo\n- Pro: $249/mo";

  const [brandName, setBrandName]     = useState(profile.brand_name);
  const [description, setDescription] = useState(profile.description || "");
  const [category, setCategory]       = useState(profile.category);
  const [targetUsers, setTargetUsers] = useState(profile.target_users);
  const [useCases, setUseCases]       = useState<string[]>(profile.main_use_cases);
  const [features, setFeatures]       = useState<string[]>(defaultFeatures);
  const [competitors, setCompetitors] = useState<string[]>(profile.competitors);
  const [pricing, setPricing]         = useState(defaultPricing);
  const [websiteUrl, setWebsiteUrl]   = useState(profile.url || "");
  const [blogUrl, setBlogUrl]         = useState("");
  const [docsUrl, setDocsUrl]         = useState("");
  const [twitterUrl, setTwitterUrl]   = useState("");

  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [copied, setCopied]     = useState(false);
  const [activeTab, setActiveTab] = useState("any");

  // Existence check
  const [existingState, setExistingState] = useState<"idle" | "checking" | "found" | "not-found">("idle");
  const [existingContent, setExistingContent] = useState<string | null>(null);
  const [existingExpanded, setExistingExpanded] = useState(false);

  useEffect(() => {
    const domain = profile.url;
    if (!domain) return;
    setExistingState("checking");
    fetch("/api/check-existing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "llms-txt", domain }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.exists && data.content) {
          setExistingContent(data.content);
          setExistingState("found");
        } else {
          setExistingState("not-found");
        }
      })
      .catch(() => setExistingState("not-found"));
  }, [profile.url]);

  const previewContent = buildPreview({
    brandName, description, category, targetUsers,
    useCases, features, competitors, pricing,
    websiteUrl, blogUrl, docsUrl, twitterUrl,
  });

  function triggerDownload(content: string) {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "llms.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function generate(refineFrom?: string) {
    setLoading(true);
    setError("");
    setGeneratedContent(null);
    try {
      const res = await fetch("/api/generate-llms-txt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_name: brandName, description, category,
          target_users: targetUsers, use_cases: useCases,
          differentiators: features, competitors, pricing,
          url: websiteUrl, blog_url: blogUrl, docs_url: docsUrl, twitter_url: twitterUrl,
          ...(refineFrom ? { existing_content: refineFrom } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      setGeneratedContent(data.content);
      triggerDownload(data.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  }

  function copyText() {
    if (!generatedContent) return;
    navigator.clipboard.writeText(generatedContent).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const llmsUrl = `${(profile.url?.startsWith("http") ? profile.url : `https://${profile.url}`).replace(/\/$/, "")}/llms.txt`;
  const hasFile = existingState === "found" && !!existingContent;

  return (
    <div className="p-6 space-y-5">

      {/* ── TOP BANNER: already have llms.txt ────────────────── */}
      {existingState === "checking" && (
        <div className="bg-white border border-[#e5e5e5] rounded-xl px-5 py-4 flex items-center gap-3">
          <Loader2 className="w-4 h-4 animate-spin text-[#5B2D91] shrink-0" />
          <p className="text-[13px] text-[#6b6b6b]">Checking if you already have an llms.txt…</p>
        </div>
      )}

      {hasFile && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[17px] font-bold text-emerald-900">You already have an llms.txt</p>
            <a
              href={llmsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[13px] text-emerald-700 hover:underline mt-0.5 w-fit"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{llmsUrl}</span>
            </a>
          </div>
        </div>
      )}

      {/* Page header */}
      <div>
        <h1 className="text-[18px] font-bold text-[#0a0a0a]">
          {hasFile ? "Your llms.txt" : "llms.txt Generator"}
        </h1>
        <p className="text-[13px] text-[#6b6b6b] mt-1">
          {hasFile
            ? "Your AI-readable product file is live and being indexed by AI models"
            : "Create an AI-readable file that tells language models exactly what your product does"}
        </p>
      </div>

      {/* ── Education ────────────────────────────────────────── */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 space-y-5">
        <h2 className="text-[16px] font-bold text-[#0a0a0a]">What is llms.txt?</h2>

        <p className="text-[13px] text-[#6b6b6b] leading-relaxed">
          llms.txt is a simple text file you place at the root of your website — just like robots.txt
          but specifically for AI models.
        </p>

        {/* robots.txt vs llms.txt comparison */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-[#e5e5e5] rounded-xl overflow-hidden">
            <div className="bg-[#f7f7f5] px-3 py-2 border-b border-[#e5e5e5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#cccccc]" />
                <span className="text-[11px] font-semibold text-[#888]">robots.txt</span>
              </div>
              <span className="text-[10px] text-[#aaaaaa]">for search bots</span>
            </div>
            <div className="p-3 font-mono text-[11px] space-y-1 text-[#6b6b6b]">
              <div>User-agent: *</div>
              <div>Allow: /</div>
              <div>Sitemap: /sitemap.xml</div>
            </div>
            <div className="px-3 pb-2.5">
              <p className="text-[11px] text-[#aaaaaa]">Tells crawlers where to go</p>
            </div>
          </div>
          <div className="border-2 border-[#5B2D91]/30 rounded-xl overflow-hidden">
            <div className="bg-[#f3eeff] px-3 py-2 border-b border-[#5B2D91]/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#5B2D91]" />
                <span className="text-[11px] font-semibold text-[#5B2D91]">llms.txt</span>
              </div>
              <span className="text-[10px] text-[#5B2D91]/70">for AI models ✨</span>
            </div>
            <div className="p-3 font-mono text-[11px] space-y-1">
              <div className="text-[#79c0ff]"># YourBrand</div>
              <div className="text-[#888]">&gt; Helps [users] with [problem].</div>
              <div className="text-[#f0883e]">## Use Cases</div>
              <div className="text-[#7ee787]">- Automates workflows</div>
            </div>
            <div className="px-3 pb-2.5">
              <p className="text-[11px] text-[#5B2D91] font-medium">Tells AI what your product does</p>
            </div>
          </div>
        </div>

        <p className="text-[13px] text-[#6b6b6b] leading-relaxed">
          When AI models crawl your site, they read this file first to understand your brand, category,
          and use cases — making them more likely to recommend you accurately.
        </p>

        <div className="bg-[#1a1a1a] rounded-xl p-4 font-mono text-[12px] space-y-1">
          <div className="text-[#888]">yoursite.com/</div>
          <div className="text-[#888]">├── index.html</div>
          <div className="text-[#888]">├── robots.txt</div>
          <div className="flex items-center gap-3">
            <span className="text-[#7ee787]">└── llms.txt</span>
            <span className="text-[#555] text-[11px]">{hasFile ? "← you have this ✓" : "← add this"}</span>
          </div>
        </div>

        {/* Before / after AI response */}
        <div>
          <p className="text-[13px] font-semibold text-[#0a0a0a] mb-3">Why this works</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl overflow-hidden border border-red-100">
              <div className="bg-red-50 px-3 py-2 border-b border-red-100">
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide">Without llms.txt</span>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 flex items-center justify-center">
                    <ClaudeLogo />
                  </div>
                  <div className="bg-[#f7f7f5] rounded-lg px-2.5 py-2 flex-1">
                    <p className="text-[11px] text-[#6b6b6b] leading-snug italic">&ldquo;I&apos;m not sure exactly what [Brand] does — it might be a project tool...&rdquo;</p>
                  </div>
                </div>
                <p className="text-[10px] text-red-500 font-medium pl-7">Vague, possibly wrong</p>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden border border-emerald-200">
              <div className="bg-emerald-50 px-3 py-2 border-b border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">With llms.txt</span>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 flex items-center justify-center">
                    <ClaudeLogo />
                  </div>
                  <div className="bg-[#f3eeff] rounded-lg px-2.5 py-2 flex-1">
                    <p className="text-[11px] text-[#3a2060] leading-snug italic">&ldquo;[Brand] is a [category] tool for [target users] — it helps with [use case].&rdquo;</p>
                  </div>
                </div>
                <p className="text-[10px] text-emerald-600 font-medium pl-7">Accurate, citable ✓</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOUND: current file + refine ─────────────────────── */}
      {hasFile && (
        <>
          {/* Current file preview */}
          <div className="bg-white border border-[#e5e5e5] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between border-b border-[#f0f0f0]">
              <h2 className="text-[15px] font-bold text-[#0a0a0a]">How your llms.txt looks</h2>
              <button
                onClick={() => setExistingExpanded((v) => !v)}
                className="text-[12px] font-semibold text-[#5B2D91] hover:text-[#3a1a6e] transition-colors"
              >
                {existingExpanded ? "Hide" : "Show file"}
              </button>
            </div>
            {existingExpanded && (
              <div className="p-4">
                <CodeBlock content={existingContent!} />
              </div>
            )}
            {!existingExpanded && (
              <div className="px-5 py-3 text-[12px] text-[#aaaaaa]">
                Click "Show file" to preview your current llms.txt content
              </div>
            )}
          </div>

          {/* Refine CTA */}
          <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 space-y-3">
            <div>
              <h2 className="text-[15px] font-bold text-[#0a0a0a]">Want to improve your llms.txt?</h2>
              <p className="text-[13px] text-[#6b6b6b] mt-1">
                AI will review your existing file, fill any gaps, and optimize it for better AI citations — without replacing accurate information.
              </p>
            </div>

            <button
              onClick={() => generate(existingContent!)}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13px] font-semibold transition-opacity disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? "Refining your llms.txt…" : "Refine with AI →"}
            </button>

            {/* Result after refine */}
            {(generatedContent || error) && (
              <div className="pt-1">
                {error && (
                  <div className="text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>
                )}
                {generatedContent && (
                  <div className="space-y-3">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <p className="text-[13px] font-semibold text-emerald-800">Refined llms.txt downloaded</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={copyText}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-[12px] font-semibold text-[#666] hover:bg-[#f7f7f5] transition-colors"
                      >
                        {copied
                          ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!</>
                          : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                      </button>
                      <button
                        onClick={() => triggerDownload(generatedContent)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-[12px] font-semibold text-[#666] hover:bg-[#f7f7f5] transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download again
                      </button>
                    </div>
                    <CodeBlock content={generatedContent} />
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── NOT FOUND: generator form ────────────────────────── */}
      {!hasFile && (
        <>
          {/* Preview of what will be generated */}
          <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 space-y-4">
            <h2 className="text-[16px] font-bold text-[#0a0a0a]">What your llms.txt will contain</h2>
            <CodeBlock content={previewContent} />
          </div>

          {/* Generator form */}
          <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 space-y-5">
            <div>
              <h2 className="text-[16px] font-bold text-[#0a0a0a]">Generate your llms.txt</h2>
              <p className="text-[13px] text-[#6b6b6b] mt-0.5">Customized for your brand in one click</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FieldRow label="Brand name">
                  <input className={inputCls} value={brandName} onChange={(e) => setBrandName(e.target.value)} />
                </FieldRow>
                <FieldRow label="Category">
                  <input className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)} />
                </FieldRow>
              </div>

              <FieldRow label="One-line description">
                <input
                  className={inputCls}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={`e.g. ${profile.brand_name} helps SaaS founders track AI visibility`}
                />
              </FieldRow>

              <FieldRow label="Target users">
                <input className={inputCls} value={targetUsers} onChange={(e) => setTargetUsers(e.target.value)} />
              </FieldRow>

              <FieldRow label="Use cases">
                <TagPills tags={useCases} onChange={setUseCases} />
              </FieldRow>

              <FieldRow label="Key features / differentiators">
                <TagPills tags={features} onChange={setFeatures} />
              </FieldRow>

              <FieldRow label="Competitors">
                <TagPills tags={competitors} onChange={setCompetitors} />
              </FieldRow>

              <FieldRow label="Pricing tiers">
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={4}
                  value={pricing}
                  onChange={(e) => setPricing(e.target.value)}
                  placeholder={"- Free: one-time audit\n- Starter: $49/mo\n- Pro: $249/mo"}
                />
              </FieldRow>

              <div className="grid grid-cols-2 gap-4">
                <FieldRow label="Website URL">
                  <input
                    className={inputCls}
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yoursite.com"
                  />
                </FieldRow>
                <FieldRow label="Blog URL" optional>
                  <input className={inputCls} value={blogUrl} onChange={(e) => setBlogUrl(e.target.value)} placeholder="https://yoursite.com/blog" />
                </FieldRow>
                <FieldRow label="Docs URL" optional>
                  <input className={inputCls} value={docsUrl} onChange={(e) => setDocsUrl(e.target.value)} placeholder="https://docs.yoursite.com" />
                </FieldRow>
                <FieldRow label="Twitter / X URL" optional>
                  <input className={inputCls} value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} placeholder="https://x.com/yourbrand" />
                </FieldRow>
              </div>
            </div>

            <div>
              <button
                onClick={() => generate()}
                disabled={loading || !brandName.trim()}
                className="w-full h-11 rounded-xl text-white text-[14px] font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
                style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating your llms.txt...
                  </>
                ) : (
                  "Generate & Download llms.txt →"
                )}
              </button>
              {!loading && (
                <p className="text-[12px] text-[#aaaaaa] mt-2 text-center">
                  Your file will download automatically when ready
                </p>
              )}
            </div>
          </div>

          {/* Result */}
          {(generatedContent || error) && (
            <div className="bg-white border border-[#e5e5e5] rounded-2xl p-5">
              {error && (
                <div className="text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>
              )}
              {generatedContent && (
                <div className="space-y-3">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <p className="text-[13px] font-semibold text-emerald-800">Your llms.txt has been downloaded</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyText}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-[12px] font-semibold text-[#666] hover:bg-[#f7f7f5] transition-colors"
                    >
                      {copied
                        ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!</>
                        : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                    </button>
                    <button
                      onClick={() => triggerDownload(generatedContent)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-[12px] font-semibold text-[#666] hover:bg-[#f7f7f5] transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download again
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* How to publish */}
          <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 space-y-5">
            <h2 className="text-[14px] font-bold text-[#0a0a0a]">How to add llms.txt to your website</h2>

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
                After publishing, AI models will discover your llms.txt within 1–2 weeks during their
                next crawl cycle. Your visibility score will improve on your next Comly audit.
              </p>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
