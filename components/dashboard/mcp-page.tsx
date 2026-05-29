"use client";

import { useState, useEffect } from "react";
import { Copy, Check, RefreshCw, Zap, Terminal, BookOpen } from "lucide-react";

const TOOLS = [
  { name: "get_visibility_score",   desc: "Your current score, grade, and plain-English summary" },
  { name: "get_prompt_results",     desc: "Every tested prompt — mentioned or not, position, competitors" },
  { name: "get_competitor_rankings",desc: "Which competitors AI mentions most in your category" },
];

export function McpPage() {
  const [apiKey,      setApiKey]      = useState<string | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [generating,  setGenerating]  = useState(false);
  const [copied,      setCopied]      = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/mcp-key")
      .then((r) => r.json())
      .then((d) => { setApiKey(d.key ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function generate(regenerate = false) {
    setGenerating(true);
    try {
      const res  = await fetch("/api/mcp-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerate }),
      });
      const data = await res.json();
      setApiKey(data.key);
    } finally {
      setGenerating(false);
    }
  }

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const configSnippet = apiKey
    ? JSON.stringify({
        mcpServers: {
          comly: {
            url: "https://trycomly.com/api/mcp",
            headers: { Authorization: `Bearer ${apiKey}` },
          },
        },
      }, null, 2)
    : "";

  return (
    <div className="p-6 space-y-6 max-w-2xl">

      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-[#0a0a0a]">MCP Server</h2>
        <p className="text-[13px] text-[#6b6b6b] mt-0.5">
          Connect Comly to Claude Desktop, Cursor, or any MCP-compatible AI tool.
        </p>
      </div>

      {/* What it does */}
      <div className="bg-[#faf7ff] border border-[#e4d4ff] rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#5B2D91]" />
          <p className="text-[13px] font-semibold text-[#0a0a0a]">Ask your AI assistant about your visibility</p>
        </div>
        <p className="text-[13px] text-[#6b6b6b] leading-relaxed">
          Once connected, you can ask Claude things like <span className="font-medium text-[#0a0a0a]">"What's my AI visibility score?"</span> or <span className="font-medium text-[#0a0a0a]">"Which prompts am I not appearing in?"</span> — and get live data from your Comly audit.
        </p>
        <div className="space-y-1.5">
          {TOOLS.map((t) => (
            <div key={t.name} className="flex items-start gap-2.5">
              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#5B2D91] shrink-0" />
              <div>
                <span className="text-[12px] font-mono font-semibold text-[#5B2D91]">{t.name}</span>
                <span className="text-[12px] text-[#6b6b6b]"> — {t.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Key */}
      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-5 space-y-3" style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
        <p className="text-[13px] font-semibold text-[#0a0a0a]">Your API key</p>

        {loading ? (
          <div className="h-9 bg-[#f7f7f5] rounded-lg animate-pulse" />
        ) : apiKey ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-3 px-3 py-2 bg-[#f7f7f5] rounded-lg border border-[#e5e5e5] min-w-0">
              <Terminal className="w-3.5 h-3.5 text-[#aaaaaa] shrink-0" />
              <code className="text-[12px] text-[#0a0a0a] truncate flex-1 select-all">{apiKey}</code>
            </div>
            <button
              onClick={() => copy(apiKey, "key")}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#e5e5e5] text-[12px] font-semibold text-[#666] hover:bg-[#f7f7f5] transition-colors"
            >
              {copied === "key" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied === "key" ? "Copied" : "Copy"}
            </button>
            <button
              onClick={() => generate(true)}
              disabled={generating}
              title="Regenerate key"
              className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg border border-[#e5e5e5] text-[#aaaaaa] hover:text-[#0a0a0a] hover:border-[#d0d0d0] disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generating ? "animate-spin" : ""}`} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => generate(false)}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-[13px] font-semibold disabled:opacity-50 transition-opacity"
            style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}
          >
            {generating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            {generating ? "Generating…" : "Generate API key"}
          </button>
        )}
        <p className="text-[11px] text-[#aaaaaa]">Keep this private. Regenerating invalidates the old key immediately.</p>
      </div>

      {/* Setup instructions */}
      {apiKey && (
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-5 space-y-4" style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#aaaaaa]" />
            <p className="text-[13px] font-semibold text-[#0a0a0a]">Connect to Claude Desktop</p>
          </div>

          <div className="space-y-2">
            <p className="text-[12px] text-[#6b6b6b]">
              Open your Claude Desktop config file and add:
            </p>
            <p className="text-[11px] text-[#aaaaaa] font-mono">
              macOS: <span className="text-[#0a0a0a]">~/Library/Application Support/Claude/claude_desktop_config.json</span>
            </p>
            <p className="text-[11px] text-[#aaaaaa] font-mono">
              Windows: <span className="text-[#0a0a0a]">%APPDATA%\Claude\claude_desktop_config.json</span>
            </p>
          </div>

          <div className="relative">
            <pre className="bg-[#0a0a0a] text-[#e5e5e5] text-[11px] rounded-xl p-4 overflow-x-auto leading-relaxed font-mono">
              {configSnippet}
            </pre>
            <button
              onClick={() => copy(configSnippet, "config")}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 text-white text-[11px] font-semibold hover:bg-white/20 transition-colors"
            >
              {copied === "config" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied === "config" ? "Copied" : "Copy"}
            </button>
          </div>

          <p className="text-[12px] text-[#6b6b6b]">
            Restart Claude Desktop after saving. You'll see <span className="font-mono font-semibold text-[#0a0a0a]">comly</span> in the MCP tools list.
          </p>
        </div>
      )}
    </div>
  );
}
