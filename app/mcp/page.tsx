"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, ArrowRight, Zap, BarChart3, Users, MessageSquare } from "lucide-react";

// ── Logo ─────────────────────────────────────────────────────────────────────

function ComlyLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 4 C54 4 57 6 59.5 10 L93 68 C97 74 97 80 93.5 85 C90 90 84 93 77 93 L23 93 C16 93 10 90 6.5 85 C3 80 3 74 7 68 L40.5 10 C43 6 46 4 50 4Z" fill="#1a1a2e" />
      <path d="M28 72 C32 62 44 56 58 60 C66 62.5 70 67 68 70 C66 73 60 72 52 69 C44 66 36 68 32 74 C30 77 28 75 28 72Z" fill="#7c3aed" />
    </svg>
  );
}

// ── Copy button ───────────────────────────────────────────────────────────────

function CopyButton({ text, className = "" }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${className}`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ── Claude chat mockup ────────────────────────────────────────────────────────

function ChatMockup() {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Tool result card */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl shadow-lg overflow-hidden mb-3">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f0f0f0]">
          <ComlyLogo size={16} />
          <span className="text-[11px] font-bold text-[#0a0a0a]">get_visibility_score</span>
          <span className="ml-auto text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+ 72</span>
        </div>
        <div className="px-4 py-3 grid grid-cols-3 gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-[#aaaaaa]">Score</p>
            <p className="text-[15px] font-black text-[#0a0a0a]">72<span className="text-[10px] font-normal text-[#aaaaaa]">/100</span></p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-[#aaaaaa]">Grade</p>
            <p className="text-[15px] font-black text-[#5B2D91]">B+</p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-[#aaaaaa]">Mentions</p>
            <p className="text-[15px] font-black text-[#0a0a0a]">7/10</p>
          </div>
        </div>
      </div>

      {/* Claude chat window */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f0f0f0] bg-[#fafafa]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://www.google.com/s2/favicons?domain=claude.ai&sz=32" alt="Claude" width={14} height={14} className="w-3.5 h-3.5 rounded-sm" />
            <span className="text-[11px] font-semibold text-[#0a0a0a]">Claude · comly-mcp</span>
          </div>
        </div>

        <div className="px-4 py-4 space-y-3">
          {/* User message */}
          <div className="flex justify-end">
            <div className="bg-[#5B2D91] text-white text-[12px] rounded-2xl rounded-tr-sm px-3.5 py-2 max-w-[80%]">
              How's my brand doing on AI search this week?
            </div>
          </div>

          {/* Tool calls */}
          <div className="flex items-center gap-2 text-[10px] text-[#aaaaaa]">
            <ComlyLogo size={12} />
            <span className="font-mono">comly · <span className="text-[#5B2D91] font-semibold">get_visibility_score</span></span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[#aaaaaa]">
            <ComlyLogo size={12} />
            <span className="font-mono">comly · <span className="text-[#5B2D91] font-semibold">get_competitor_rankings</span></span>
          </div>

          {/* Assistant response */}
          <div className="flex gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://www.google.com/s2/favicons?domain=claude.ai&sz=32" alt="" width={20} height={20} className="w-5 h-5 rounded-full shrink-0 mt-0.5" />
            <div className="text-[12px] text-[#1a1a1a] leading-relaxed">
              Your AI visibility score is <span className="font-semibold text-[#5B2D91]">72/100 (B+)</span>. You appear in 7 of 10 audited prompts. Confluence leads with 85% mentions — you're close behind at #2.
            </div>
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 bg-[#f5f5f5] rounded-xl px-3 py-2 text-[11px] text-[#aaaaaa]">
              Ask Comly…
            </div>
            <button className="w-7 h-7 rounded-lg bg-[#0a0a0a] flex items-center justify-center shrink-0">
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Config snippet ────────────────────────────────────────────────────────────

const CLAUDE_CONFIG = `{
  "mcpServers": {
    "comly": {
      "url": "https://trycomly.com/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}`;

const CURSOR_CONFIG = `{
  "mcp": {
    "servers": {
      "comly": {
        "url": "https://trycomly.com/api/mcp",
        "headers": {
          "Authorization": "Bearer YOUR_API_KEY"
        }
      }
    }
  }
}`;

// ── Clients ───────────────────────────────────────────────────────────────────

const CLIENTS = [
  { name: "Claude",  domain: "claude.ai"    },
  { name: "Cursor",  domain: "cursor.sh"    },
  { name: "VS Code", domain: "code.visualstudio.com" },
  { name: "n8n",     domain: "n8n.io"       },
  { name: "Windsurf",domain: "codeium.com"  },
];

// ── Use cases ─────────────────────────────────────────────────────────────────

const USE_CASES = [
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Weekly visibility brief",
    desc: "Have Claude pull this week's score, summarize what changed, and draft a Slack-ready note every Monday morning.",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Competitor watch in Cursor",
    desc: "While you're coding, ask Cursor how a specific competitor's AI visibility compares to yours — without leaving the editor.",
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: "Prompt gap analysis",
    desc: "Ask Claude which prompts you're missing from and get a list of topics to write content about immediately.",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function McpLandingPage() {
  const [activeTab, setActiveTab] = useState<"claude" | "cursor">("claude");

  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#f0f0f0]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ComlyLogo size={26} />
            <span className="font-bold text-[15px] text-[#0a0a0a] tracking-tight">Comly</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[13px] text-[#6b6b6b] hover:text-[#0a0a0a] transition-colors hidden sm:block">
              Back to home
            </Link>
            <Link
              href="/audit"
              className="flex items-center gap-1.5 bg-[#5B2D91] text-white text-[13px] font-semibold px-4 py-2 rounded-full hover:bg-[#4a2478] transition-colors"
            >
              Get started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-20 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f5f0ff] to-white pointer-events-none" />
        <div className="relative max-w-5xl mx-auto">

          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#e4d4ff] bg-white text-[12px] font-semibold text-[#5B2D91] shadow-sm">
              <Zap className="w-3.5 h-3.5" />
              NOW LIVE · MCP SERVER
            </div>
          </div>

          {/* Headline */}
          <div className="text-center mb-6">
            <h1 className="text-[42px] sm:text-[56px] font-black text-[#0a0a0a] leading-[1.08] tracking-tight mb-4">
              Comly inside every<br />
              <span style={{ textDecoration: "underline", textDecorationColor: "#5B2D91", textUnderlineOffset: "6px", textDecorationThickness: "4px" }}>
                AI tool you use.
              </span>
            </h1>
            <p className="text-[16px] sm:text-[18px] text-[#6b6b6b] max-w-xl mx-auto leading-relaxed">
              Connect Comly's MCP server to Claude, Cursor, VS Code, and n8n.<br className="hidden sm:block" />
              Query your AI visibility data without leaving your workflow.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link
              href="/audit"
              className="flex items-center gap-2 bg-[#0a0a0a] text-white text-[14px] font-semibold px-6 py-3 rounded-full hover:bg-[#1a1a1a] transition-colors"
            >
              Get your API key <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#setup"
              className="flex items-center gap-2 border border-[#e5e5e5] text-[14px] font-semibold px-6 py-3 rounded-full hover:bg-[#f7f7f5] transition-colors text-[#0a0a0a]"
            >
              Read the docs
            </a>
          </div>

          {/* Chat mockup */}
          <ChatMockup />
        </div>
      </section>

      {/* Works with */}
      <section className="py-16 px-6 border-t border-[#f0f0f0]">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-[28px] sm:text-[36px] font-black text-[#0a0a0a] mb-3">Works with every MCP client</h2>
          <p className="text-[15px] text-[#6b6b6b] mb-10 max-w-lg mx-auto">
            Comly speaks the standard Model Context Protocol — any client that supports MCP can query your AI visibility data.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {CLIENTS.map(({ name, domain }) => (
              <div key={name} className="flex flex-col items-center gap-2 w-20">
                <div className="w-14 h-14 rounded-2xl border border-[#e5e5e5] bg-white flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} alt={name} width={28} height={28} className="w-7 h-7 object-contain" />
                </div>
                <span className="text-[12px] font-medium text-[#6b6b6b]">{name}</span>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-[#aaaaaa] mt-6">…and any future MCP-compatible client. No client-specific code on our side.</p>
        </div>
      </section>

      {/* 3 steps */}
      <section className="py-16 px-6 bg-[#fafafa] border-t border-[#f0f0f0]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[28px] sm:text-[36px] font-black text-[#0a0a0a] mb-3">Connect Comly in 3 steps</h2>
            <p className="text-[15px] text-[#6b6b6b]">No SDK, no glue code. Paste a URL, generate a key, ask a question.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                num: "1",
                title: "Add Comly to your client",
                desc: "Paste the Comly MCP server URL into Claude Desktop, Cursor, VS Code — anywhere MCP runs.",
                visual: (
                  <div className="bg-[#0a0a0a] rounded-xl p-3 font-mono text-[10px] text-[#e5e5e5] leading-relaxed">
                    <span className="text-[#7c3aed]">"mcpServers"</span>: {"{"}<br />
                    {"  "}<span className="text-[#7c3aed]">"comly"</span>: {"{"}<br />
                    {"    "}<span className="text-[#7c3aed]">"url"</span>: <span className="text-[#10b981]">".../api/mcp"</span><br />
                    {"  "}{"}"}{"}"}<br />
                    {"}"}
                  </div>
                ),
              },
              {
                num: "2",
                title: "Generate an API key",
                desc: "Go to your Comly dashboard → MCP Server. Generate your key and paste it into the config.",
                visual: (
                  <div className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#f3eeff] flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 text-[#5B2D91]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-[#aaaaaa] uppercase tracking-wide">API Key</p>
                      <p className="text-[11px] font-mono text-[#0a0a0a] truncate">cml_a3k…9z2</p>
                    </div>
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>
                ),
              },
              {
                num: "3",
                title: "Ask in plain English",
                desc: "\"How's my AI visibility this week?\" — your client picks the right tool and answers with live Comly data.",
                visual: (
                  <div className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden">
                    <div className="px-3 py-2 text-[11px] text-[#6b6b6b] border-b border-[#f0f0f0]">How's my brand this week?</div>
                    <div className="px-3 py-2 flex items-center gap-1.5">
                      <ComlyLogo size={12} />
                      <span className="text-[10px] font-mono text-[#5B2D91]">get_visibility_score</span>
                    </div>
                  </div>
                ),
              },
            ].map(({ num, title, desc, visual }) => (
              <div key={num} className="relative bg-white rounded-2xl border border-[#e5e5e5] p-5 shadow-sm">
                <div className="absolute -top-3.5 left-5 w-7 h-7 rounded-full bg-[#5B2D91] flex items-center justify-center text-white text-[12px] font-black shadow-md">
                  {num}
                </div>
                <div className="mt-3 mb-4">{visual}</div>
                <p className="text-[14px] font-bold text-[#0a0a0a] mb-1">{title}</p>
                <p className="text-[12px] text-[#6b6b6b] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Config snippet */}
      <section id="setup" className="py-16 px-6 border-t border-[#f0f0f0]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[28px] sm:text-[36px] font-black text-[#0a0a0a] mb-3">Drop this into your MCP client</h2>
            <p className="text-[15px] text-[#6b6b6b]">One JSON snippet. Restart your client. Ask Comly anything.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left: URL */}
            <div>
              <p className="text-[14px] font-bold text-[#0a0a0a] mb-2">Your MCP server URL</p>
              <p className="text-[13px] text-[#6b6b6b] mb-4 leading-relaxed">
                Point your client at this endpoint. Add your API key in the Authorization header and you're live.
              </p>
              <div className="flex items-center gap-2 bg-[#f7f7f5] border border-[#e5e5e5] rounded-xl px-4 py-3">
                <code className="text-[13px] font-mono text-[#0a0a0a] flex-1 select-all">
                  https://trycomly.com/api/mcp
                </code>
                <CopyButton
                  text="https://trycomly.com/api/mcp"
                  className="bg-[#0a0a0a] text-white hover:bg-[#1a1a1a] shrink-0"
                />
              </div>
              <p className="text-[12px] text-[#aaaaaa] mt-3">
                No account yet?{" "}
                <Link href="/audit" className="text-[#5B2D91] font-semibold hover:underline">
                  Create an account →
                </Link>
              </p>
            </div>

            {/* Right: JSON config */}
            <div>
              {/* Tab switcher */}
              <div className="flex items-center gap-1 border border-[#e5e5e5] rounded-xl p-1 bg-[#fafafa] mb-3 w-fit">
                {([
                  { id: "claude" as const, label: "Claude Desktop", domain: "claude.ai" },
                  { id: "cursor" as const, label: "Cursor",          domain: "cursor.sh" },
                ] as const).map(({ id, label, domain }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                      activeTab === id ? "bg-white shadow-sm text-[#0a0a0a] border border-[#e5e5e5]" : "text-[#6b6b6b] hover:text-[#0a0a0a]"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} alt="" width={14} height={14} className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              {/* File path hint */}
              <p className="text-[11px] text-[#aaaaaa] font-mono mb-2">
                {activeTab === "claude"
                  ? "Save to  claude_desktop_config.json"
                  : "Save to  ~/.cursor/mcp.json"}
              </p>

              {/* Code block */}
              <div className="relative">
                <pre className="bg-[#0a0a0a] text-[#e5e5e5] text-[12px] rounded-xl p-4 overflow-x-auto leading-relaxed font-mono">
                  {activeTab === "claude" ? CLAUDE_CONFIG : CURSOR_CONFIG}
                </pre>
                <CopyButton
                  text={activeTab === "claude" ? CLAUDE_CONFIG : CURSOR_CONFIG}
                  className="absolute top-3 right-3 bg-white/10 text-white hover:bg-white/20"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What you can build */}
      <section className="py-16 px-6 bg-[#fafafa] border-t border-[#f0f0f0]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-[28px] sm:text-[36px] font-black text-[#0a0a0a] mb-3">What you can build</h2>
            <p className="text-[15px] text-[#6b6b6b]">Same data as your dashboard, queryable from wherever you already work.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {USE_CASES.map(({ icon, title, desc }) => (
              <div key={title} className="bg-white border border-[#e5e5e5] rounded-2xl p-5 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#f3eeff] flex items-center justify-center text-[#5B2D91] mb-4">
                  {icon}
                </div>
                <p className="text-[14px] font-bold text-[#0a0a0a] mb-2">{title}</p>
                <p className="text-[12px] text-[#6b6b6b] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools list */}
      <section className="py-16 px-6 border-t border-[#f0f0f0]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-[28px] sm:text-[36px] font-black text-[#0a0a0a] mb-3">4 tools, zero setup</h2>
            <p className="text-[15px] text-[#6b6b6b]">Ask natural questions — your AI client picks the right tool automatically.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              { name: "get_visibility_score",    desc: "Your current score, grade, and plain-English summary",                             example: "What's my AI visibility score?" },
              { name: "get_prompt_results",      desc: "Every tested prompt — mentioned or not, position, competitors in response",        example: "Which prompts am I missing from?" },
              { name: "get_competitor_rankings", desc: "Which competitors AI mentions most in your category, ranked by mention count",     example: "Who are my top AI competitors?" },
              { name: "find_threads",            desc: "Reddit and Quora threads where potential customers ask about your category",       example: "Where should I engage on Reddit?" },
            ].map(({ name, desc, example }) => (
              <div key={name} className="bg-[#fafafa] border border-[#e5e5e5] rounded-2xl p-4">
                <p className="text-[12px] font-mono font-bold text-[#5B2D91] mb-1">{name}()</p>
                <p className="text-[12px] text-[#6b6b6b] mb-3 leading-relaxed">{desc}</p>
                <div className="flex items-center gap-2 bg-white border border-[#e5e5e5] rounded-lg px-3 py-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://www.google.com/s2/favicons?domain=claude.ai&sz=32" alt="" width={12} height={12} className="w-3 h-3 opacity-60" />
                  <span className="text-[11px] text-[#6b6b6b] italic">{example}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-[#f0f0f0]">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}>
            <ComlyLogo size={28} />
          </div>
          <h2 className="text-[28px] sm:text-[36px] font-black text-[#0a0a0a] mb-4">
            Start querying your<br />AI visibility data
          </h2>
          <p className="text-[15px] text-[#6b6b6b] mb-8 leading-relaxed">
            Run your first audit, generate an API key, and connect to Claude Desktop in under 2 minutes.
          </p>
          <Link
            href="/audit"
            className="inline-flex items-center gap-2 bg-[#5B2D91] text-white text-[15px] font-bold px-8 py-4 rounded-full hover:bg-[#4a2478] transition-colors shadow-lg"
          >
            Get started free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#f0f0f0] py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ComlyLogo size={20} />
            <span className="text-[13px] font-semibold text-[#0a0a0a]">Comly</span>
          </div>
          <div className="flex items-center gap-5 text-[12px] text-[#6b6b6b]">
            <Link href="/" className="hover:text-[#0a0a0a] transition-colors">Home</Link>
            <Link href="/privacy" className="hover:text-[#0a0a0a] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#0a0a0a] transition-colors">Terms</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
