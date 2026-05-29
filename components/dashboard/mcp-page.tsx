"use client";

import { useState, useEffect } from "react";
import { Copy, Check, RefreshCw, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";

const CLIENTS = [
  {
    id: "claude",
    label: "Claude Desktop",
    domain: "claude.ai",
    config: (key: string) => JSON.stringify({
      mcpServers: {
        comly: {
          command: "npx",
          args: ["-y", "comly-mcp", key]
        }
      }
    }, null, 2),
  },
  {
    id: "cursor",
    label: "Cursor",
    domain: "cursor.sh",
    config: (key: string) => JSON.stringify({
      mcp: { servers: { comly: { url: "https://www.trycomly.com/api/mcp", headers: { Authorization: `Bearer ${key}` } } } }
    }, null, 2),
  },
  {
    id: "windsurf",
    label: "Windsurf",
    domain: "codeium.com",
    config: (key: string) => JSON.stringify({
      mcpServers: { comly: { serverUrl: "https://www.trycomly.com/api/mcp", headers: { Authorization: `Bearer ${key}` } } }
    }, null, 2),
  },
];

const EXAMPLE_PROMPTS = [
  "What's my AI visibility score this week?",
  "Which prompts am I not appearing in?",
  "Who are my top competitors in AI answers?",
  "What Reddit threads should I engage with today?",
];

const CLAUDE_STEPS = {
  win: [
    { n: "1", text: <>Press <kbd className="bg-[#f0f0f0] border border-[#d0d0d0] rounded px-1.5 py-0.5 text-[11px] font-mono">Windows + R</kbd> on your keyboard</> },
    { n: "2", text: <>Paste this path and press Enter: <code className="bg-[#f0f0f0] text-[#5B2D91] rounded px-1.5 py-0.5 text-[11px] font-mono select-all">%LOCALAPPDATA%\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude</code></> },
    { n: "3", text: <>Double-click <strong>claude_desktop_config.json</strong> to open it in Notepad</> },
    { n: "4", text: <>Press <kbd className="bg-[#f0f0f0] border border-[#d0d0d0] rounded px-1.5 py-0.5 text-[11px] font-mono">Ctrl+A</kbd> to select everything, then delete it</> },
    { n: "5", text: <>Paste the config you copied above, then press <kbd className="bg-[#f0f0f0] border border-[#d0d0d0] rounded px-1.5 py-0.5 text-[11px] font-mono">Ctrl+S</kbd> to save</> },
    { n: "6", text: <>Right-click the Claude icon in the bottom-right corner of your screen → <strong>Quit</strong>, then reopen Claude Desktop</> },
  ],
  mac: [
    { n: "1", text: <>Open <strong>Finder</strong> and press <kbd className="bg-[#f0f0f0] border border-[#d0d0d0] rounded px-1.5 py-0.5 text-[11px] font-mono">⌘ + Shift + G</kbd></> },
    { n: "2", text: <>Paste this path and press Enter: <code className="bg-[#f0f0f0] text-[#5B2D91] rounded px-1.5 py-0.5 text-[11px] font-mono select-all">~/Library/Application Support/Claude</code></> },
    { n: "3", text: <>Open <strong>claude_desktop_config.json</strong> with any text editor</> },
    { n: "4", text: <>Select all the text and replace it with the config you copied above, then save</> },
    { n: "5", text: <>Quit Claude Desktop from the menu bar and reopen it</> },
  ],
};

export function McpPage() {
  const [apiKey,     setApiKey]     = useState<string | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied,     setCopied]     = useState<string | null>(null);
  const [client,     setClient]     = useState("claude");
  const [os,         setOs]         = useState<"win" | "mac">("win");

  async function authHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      "Content-Type": "application/json",
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    };
  }

  useEffect(() => {
    const isMac = navigator.platform.toUpperCase().includes("MAC");
    setOs(isMac ? "mac" : "win");
    (async () => {
      const headers = await authHeaders();
      fetch("/api/mcp-key", { headers })
        .then((r) => r.json())
        .then((d) => { setApiKey(d.key ?? null); setLoading(false); })
        .catch(() => setLoading(false));
    })();
  }, []);

  async function generate(regenerate = false) {
    setGenerating(true);
    try {
      const headers = await authHeaders();
      const res  = await fetch("/api/mcp-key", { method: "POST", headers, body: JSON.stringify({ regenerate }) });
      const data = await res.json();
      setApiKey(data.key ?? null);
    } finally {
      setGenerating(false);
    }
  }

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const activeClient = CLIENTS.find((c) => c.id === client)!;
  const configSnippet = apiKey ? activeClient.config(apiKey) : "";

  return (
    <div className="p-6 max-w-2xl space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-[18px] font-bold text-[#0a0a0a]">MCP Server</h1>
        <p className="text-[13px] text-[#6b6b6b] mt-1">
          Connect Comly to Claude, Cursor, or any MCP-compatible tool and ask about your brand visibility in plain English.
        </p>
      </div>

      {/* Step 1 — API Key */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-[#5B2D91] text-white text-[11px] font-black flex items-center justify-center shrink-0">1</div>
          <p className="text-[14px] font-semibold text-[#0a0a0a]">Get your API key</p>
        </div>

        <div className="ml-9">
          {loading ? (
            <div className="h-11 bg-[#f5f5f5] rounded-xl animate-pulse" />
          ) : apiKey ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-[#fafafa] border border-[#e8e8e8] rounded-xl">
                <code className="flex-1 text-[12px] font-mono text-[#0a0a0a] truncate select-all">{apiKey}</code>
                <button onClick={() => copy(apiKey, "key")}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#e8e8e8] text-[12px] font-semibold text-[#444] hover:border-[#5B2D91] hover:text-[#5B2D91] transition-colors shadow-sm">
                  {copied === "key" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === "key" ? "Copied" : "Copy"}
                </button>
                <button onClick={() => generate(true)} disabled={generating} title="Regenerate"
                  className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-[#e8e8e8] text-[#aaaaaa] hover:text-[#0a0a0a] hover:border-[#d0d0d0] disabled:opacity-40 transition-colors shadow-sm">
                  <RefreshCw className={`w-3.5 h-3.5 ${generating ? "animate-spin" : ""}`} />
                </button>
              </div>
              <p className="text-[11px] text-[#aaaaaa]">Keep this private. Regenerating invalidates the old key immediately.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <button onClick={() => generate(false)} disabled={generating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13px] font-semibold disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md"
                style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}>
                {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>⚡</span>}
                {generating ? "Generating…" : "Generate API key"}
              </button>
              <p className="text-[11px] text-[#aaaaaa]">One key per account. Free to generate.</p>
            </div>
          )}
        </div>
      </div>

      {/* Step 2 — Config */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center shrink-0 transition-colors ${apiKey ? "bg-[#5B2D91] text-white" : "bg-[#f0f0f0] text-[#aaaaaa]"}`}>2</div>
          <p className={`text-[14px] font-semibold transition-colors ${apiKey ? "text-[#0a0a0a]" : "text-[#aaaaaa]"}`}>Copy your config</p>
        </div>

        <div className="ml-9 space-y-3">
          {/* Client tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#f5f5f5] rounded-xl w-fit">
            {CLIENTS.map((c) => (
              <button key={c.id} onClick={() => setClient(c.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                  client === c.id ? "bg-white shadow-sm text-[#0a0a0a] border border-[#e8e8e8]" : "text-[#6b6b6b] hover:text-[#0a0a0a]"
                }`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://www.google.com/s2/favicons?domain=${c.domain}&sz=32`} alt="" width={13} height={13} className="w-3.5 h-3.5" />
                {c.label}
              </button>
            ))}
          </div>

          {/* Node.js requirement for Claude Desktop */}
          {client === "claude" && (
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-3">
              <span className="text-amber-500 text-[13px] shrink-0 mt-0.5">⚠️</span>
              <p className="text-[12px] text-amber-800 leading-snug">
                <strong>Node.js required.</strong> If you don&apos;t have it yet,{" "}
                <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer"
                  className="underline font-semibold inline-flex items-center gap-0.5">
                  download it free at nodejs.org <ExternalLink className="w-3 h-3" />
                </a>{" "}
                — just install it like any other app, then come back here.
              </p>
            </div>
          )}

          {/* Code block */}
          <div className="relative">
            <pre className={`text-[11px] rounded-xl p-4 overflow-x-auto leading-relaxed font-mono transition-opacity ${apiKey ? "bg-[#0a0a0a] text-[#e5e5e5]" : "bg-[#f5f5f5] text-[#aaaaaa]"}`}>
              {apiKey ? configSnippet : JSON.stringify({ mcpServers: { comly: { command: "npx", args: ["-y", "comly-mcp", "YOUR_API_KEY"] } } }, null, 2)}
            </pre>
            {apiKey && (
              <button onClick={() => copy(configSnippet, "config")}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 text-white text-[11px] font-semibold hover:bg-white/20 transition-colors">
                {copied === "config" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied === "config" ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Step 3 — How to add it */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center shrink-0 transition-colors ${apiKey ? "bg-[#5B2D91] text-white" : "bg-[#f0f0f0] text-[#aaaaaa]"}`}>3</div>
          <p className={`text-[14px] font-semibold transition-colors ${apiKey ? "text-[#0a0a0a]" : "text-[#aaaaaa]"}`}>Add it to {activeClient.label}</p>
        </div>

        <div className="ml-9 space-y-2">
          {client === "claude" ? (
            <>
              {/* OS toggle */}
              <div className="flex items-center gap-1 p-1 bg-[#f5f5f5] rounded-lg w-fit mb-3">
                {(["win", "mac"] as const).map((o) => (
                  <button key={o} onClick={() => setOs(o)}
                    className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${os === o ? "bg-white shadow-sm text-[#0a0a0a] border border-[#e8e8e8]" : "text-[#6b6b6b] hover:text-[#0a0a0a]"}`}>
                    {o === "win" ? "🪟 Windows" : "🍎 Mac"}
                  </button>
                ))}
              </div>
              <div className="space-y-2.5">
                {CLAUDE_STEPS[os].map((step) => (
                  <div key={step.n} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#f0f0f0] text-[#6b6b6b] text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{step.n}</div>
                    <p className="text-[12px] text-[#444] leading-relaxed">{step.text}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-[12px] text-[#6b6b6b]">
              Paste the config into your <code className="font-mono font-semibold text-[#0a0a0a]">{client === "cursor" ? "~/.cursor/mcp.json" : "~/.codeium/windsurf/mcp_config.json"}</code> file, then restart {activeClient.label}.
            </p>
          )}
        </div>
      </div>

      {/* Step 4 — Try it */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center shrink-0 transition-colors ${apiKey ? "bg-[#5B2D91] text-white" : "bg-[#f0f0f0] text-[#aaaaaa]"}`}>4</div>
          <p className={`text-[14px] font-semibold transition-colors ${apiKey ? "text-[#0a0a0a]" : "text-[#aaaaaa]"}`}>Start asking</p>
        </div>

        <div className="ml-9 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {EXAMPLE_PROMPTS.map((p) => (
            <div key={p} className="flex items-start gap-2.5 bg-[#fafafa] border border-[#f0f0f0] rounded-xl px-3.5 py-3">
              <span className="text-[#5B2D91] mt-0.5 shrink-0 text-[13px]">"</span>
              <p className="text-[12px] text-[#444] leading-snug">{p}"</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
