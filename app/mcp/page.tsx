"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Copy, Check, Terminal, TrendingUp, ListChecks, Users2, MessageSquare } from "lucide-react";
import { useScroll } from "@/components/ui/use-scroll";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Logo ─────────────────────────────────────────────────────────────────────

function ComlyLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 4 C54 4 57 6 59.5 10 L93 68 C97 74 97 80 93.5 85 C90 90 84 93 77 93 L23 93 C16 93 10 90 6.5 85 C3 80 3 74 7 68 L40.5 10 C43 6 46 4 50 4Z" fill="#1a1a2e" />
      <path d="M28 72 C32 62 44 56 58 60 C66 62.5 70 67 68 70 C66 73 60 72 52 69 C44 66 36 68 32 74 C30 77 28 75 28 72Z" fill="#7c3aed" />
    </svg>
  );
}

// ── Floating client logo ──────────────────────────────────────────────────────

function FloatingLogo({ src, alt, style, depth = 0, rotate = 0, mouseOffset = { x: 0, y: 0 } }: {
  src: string; alt: string; style: React.CSSProperties;
  depth?: number; rotate?: number; mouseOffset?: { x: number; y: number };
}) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => { if (imgRef.current?.complete) setLoaded(true); }, []);
  return (
    <div
      className="absolute hidden md:block z-20"
      style={{
        ...style,
        transform: `translate(${mouseOffset.x * depth}px, ${mouseOffset.y * depth}px) rotate(${rotate}deg)`,
        transition: "transform 0.12s ease-out",
      }}
    >
      <div className="relative w-10 h-10">
        {!loaded && <div className="absolute inset-0 rounded-xl bg-white/20 animate-pulse" />}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={imgRef} src={src} alt={alt} width={40} height={40}
          className={`w-10 h-10 rounded-xl shadow-lg transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)} onError={() => setLoaded(true)} />
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useScroll(10);
  const [overPurple, setOverPurple] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById("mcp-purple");
      if (!section) return;
      const y = window.scrollY + 60;
      setOverPurple(y >= section.offsetTop && y < section.offsetTop + section.offsetHeight);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const links = [
    { label: "Home",     href: "/" },
    { label: "Features", href: "/#features" },
    { label: "Pricing",  href: "/#pricing" },
    { label: "MCP",      href: "/mcp" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 mx-auto w-full border-b border-transparent",
        "md:rounded-xl md:border",
        "md:[transition:max-width_500ms_cubic-bezier(0.4,0,0.2,1),top_500ms_cubic-bezier(0.4,0,0.2,1),background-color_300ms_ease,box-shadow_300ms_ease,border-color_300ms_ease]",
        overPurple && !menuOpen
          ? "bg-white/10 backdrop-blur-md border-white/15 md:top-4"
          : scrolled && !menuOpen
          ? "bg-white/95 supports-[backdrop-filter]:bg-white/80 border-[#e5e5e5] backdrop-blur-lg md:top-4 md:shadow-sm"
          : menuOpen
          ? "bg-white/95"
          : "bg-white border-transparent",
      )}
      style={{
        maxWidth: scrolled && !menuOpen ? "896px" : "1280px",
        transition: "max-width 500ms cubic-bezier(0.4,0,0.2,1), top 500ms cubic-bezier(0.4,0,0.2,1), background-color 300ms ease, box-shadow 300ms ease, border-color 300ms ease",
      }}
    >
      <nav
        className={cn(
          "flex h-14 w-full items-center justify-between",
          "px-6 [transition:padding_400ms_cubic-bezier(0.4,0,0.2,1)]",
          scrolled && "md:px-4",
        )}
      >
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <ComlyLogo size={28} />
          <span className={cn("font-bold text-base tracking-tight [font-family:var(--font-outfit)] transition-colors duration-300", overPurple ? "text-white" : "text-[#0a0a0a]")}>
            Comly
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={buttonVariants({ variant: "ghost", size: "sm", className: cn("transition-colors duration-300", overPurple ? "text-white/80 hover:text-white hover:bg-white/10" : "text-[#6b6b6b] hover:text-[#0a0a0a]", l.href === "/mcp" && !overPurple && "text-[#5B2D91] font-semibold") })}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/audit"
            className="flex items-center gap-1.5 bg-[#5B2D91] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#4a2478] transition-all hover:scale-[1.02]"
          >
            Get started <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <button
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-[#e5e5e5] text-[#0a0a0a] hover:bg-[#f7f7f5] transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <MenuToggleIcon open={menuOpen} className="w-5 h-5" duration={300} />
        </button>
      </nav>

      <div className={cn("fixed top-14 right-0 bottom-0 left-0 z-50 bg-white/95 backdrop-blur-lg md:hidden border-t border-[#e5e5e5] overflow-hidden", menuOpen ? "flex flex-col" : "hidden")}>
        <div
          data-slot={menuOpen ? "open" : "closed"}
          className="data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out flex h-full w-full flex-col justify-between gap-y-2 p-6"
        >
          <div className="grid gap-y-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className={buttonVariants({ variant: "ghost", className: "justify-start text-base text-[#0a0a0a]" })}>
                {l.label}
              </Link>
            ))}
          </div>
          <Link href="/audit" onClick={() => setMenuOpen(false)} className="w-full text-center bg-[#5B2D91] text-white text-sm font-semibold py-3 rounded-full hover:bg-[#4a2478] transition-colors">
            Get started →
          </Link>
        </div>
      </div>
    </header>
  );
}

// ── Copy button ───────────────────────────────────────────────────────────────

function CopyBtn({ text, className = "" }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${className}`}>
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ── Terminal mockup ───────────────────────────────────────────────────────────

function TerminalMockup() {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-[#0f0f10] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        {/* Window bar */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 text-[11px] text-white/30 font-mono">claude — comly mcp</span>
        </div>

        <div className="p-5 space-y-4 font-mono text-[12px]">
          {/* User prompt */}
          <div>
            <span className="text-white/30">{">"} </span>
            <span className="text-white">Which prompts is my brand missing from?</span>
          </div>

          {/* Tool call */}
          <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-[#5B2D91]/20 border border-[#5B2D91]/30">
            <ComlyLogo size={14} />
            <span className="text-[#a78bfa] text-[11px]">comly.get_prompt_results</span>
            <span className="text-white/30 text-[10px]">filter: "not_mentioned"</span>
          </div>

          {/* Result */}
          <div className="space-y-1.5">
            <div className="text-white/40 text-[10px] uppercase tracking-wider">5 gaps found</div>
            {[
              "Best AI writing tool for long-form content?",
              "Top productivity apps for remote teams in 2025?",
              "What tools do content marketers recommend?",
            ].map((prompt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[#ef4444] text-[10px]">✗</span>
                <span className="text-white/70 text-[11px]">{prompt}</span>
              </div>
            ))}
            <div className="text-white/30 text-[10px]">+ 2 more</div>
          </div>

          {/* Cursor blink */}
          <div className="flex items-center gap-1">
            <span className="text-white/30">{">"} </span>
            <span className="w-2 h-4 bg-[#7c3aed] rounded-sm animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Config ────────────────────────────────────────────────────────────────────

const CONFIGS: Record<string, { label: string; domain: string; file: string; code: string }> = {
  claude: {
    label: "Claude Desktop", domain: "claude.ai",
    file: "claude_desktop_config.json",
    code: `{
  "mcpServers": {
    "comly": {
      "url": "https://trycomly.com/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}`,
  },
  cursor: {
    label: "Cursor", domain: "cursor.sh",
    file: "~/.cursor/mcp.json",
    code: `{
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
}`,
  },
};

// ── Tools data ────────────────────────────────────────────────────────────────

const TOOLS = [
  {
    icon: <TrendingUp className="w-5 h-5" />,
    fn: "get_visibility_score()",
    headline: "Your score at a glance",
    desc: "Returns your current score (0–100), letter grade, how many prompts you appeared in, and a plain-English verdict on your visibility.",
    example: "\"What's my AI visibility score this week?\"",
  },
  {
    icon: <ListChecks className="w-5 h-5" />,
    fn: "get_prompt_results()",
    headline: "Every prompt, every model",
    desc: "Full list of tested prompts — whether you appeared, at what position, and which competitors showed up instead. Filter by mentioned or not.",
    example: "\"Which prompts am I not appearing in?\"",
  },
  {
    icon: <Users2 className="w-5 h-5" />,
    fn: "get_competitor_rankings()",
    headline: "Who's beating you",
    desc: "All competitors ranked by how often AI models mention them across your audit prompts. Includes average position.",
    example: "\"Who are my top competitors in AI search?\"",
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    fn: "find_threads()",
    headline: "Where your buyers are talking",
    desc: "Reddit and Quora threads where people ask questions your brand should be answering. Scoped to your niche and category.",
    example: "\"Where should I engage on Reddit today?\"",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function McpPage() {
  const [activeClient, setActiveClient] = useState<"claude" | "cursor">("claude");
  const cfg = CONFIGS[activeClient];
  const [heroMouse, setHeroMouse] = useState({ x: 0, y: 0 });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative pt-16 pb-4 px-6 overflow-hidden"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setHeroMouse({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
        }}
        onMouseLeave={() => setHeroMouse({ x: 0, y: 0 })}
      >
        {/* Floating client logos */}
        {[
          { src: "https://www.google.com/s2/favicons?domain=claude.ai&sz=64",                alt: "Claude",   style: { top: "12%", left:  "18%" }, depth: 26, rotate:  8  },
          { src: "https://www.google.com/s2/favicons?domain=cursor.sh&sz=64",                alt: "Cursor",   style: { top: "5%",  left:  "26%" }, depth: 16, rotate: -10 },
          { src: "https://www.google.com/s2/favicons?domain=code.visualstudio.com&sz=64",   alt: "VS Code",  style: { top: "12%", right: "18%" }, depth: 26, rotate: -8  },
          { src: "https://www.google.com/s2/favicons?domain=n8n.io&sz=64",                   alt: "n8n",      style: { top: "5%",  right: "26%" }, depth: 16, rotate:  10 },
        ].map(({ src, alt, style, depth, rotate }) => (
          <FloatingLogo key={alt} src={src} alt={alt} style={style} depth={depth} rotate={rotate} mouseOffset={heroMouse} />
        ))}

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h1 className="text-[44px] sm:text-[60px] font-black text-[#0a0a0a] leading-[1.06] tracking-tight mb-5">
              Your Comly data,<br />right where you think.
            </h1>
            <p className="text-[17px] text-[#6b6b6b] max-w-lg mx-auto leading-relaxed">
              Connect Comly to Claude, Cursor, or any MCP client.
              Ask about your AI visibility in plain English — get live answers without opening the dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
              <Link href="/audit" className="flex items-center gap-2 bg-[#5B2D91] text-white text-[14px] font-semibold px-6 py-3 rounded-full hover:bg-[#4a2478] transition-colors shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
                Get your API key <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#setup" className="text-[14px] font-semibold text-[#6b6b6b] hover:text-[#0a0a0a] transition-colors px-4 py-3">
                View setup guide ↓
              </a>
            </div>
          </div>

          <TerminalMockup />
        </div>
      </section>

      {/* ── PURPLE SECTION ───────────────────────────────────────────────── */}
      <section id="mcp-purple" className="py-24 px-6" style={{ background: "linear-gradient(to bottom, #ffffff 0%, #c9a3e8 18%, #a87be0 32%, #a87be0 68%, #c9a3e8 82%, #ffffff 100%)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/50 mb-4">Why it matters</p>
            <h2 className="text-[38px] sm:text-[48px] font-black text-white leading-tight tracking-tight">
              Stop switching tabs.<br />Just ask.
            </h2>
            <p className="mt-4 text-[16px] text-white/70 max-w-xl mx-auto leading-relaxed">
              Every time you want visibility data, you leave what you're doing. With the MCP server, your workflow stays uninterrupted.
            </p>
          </div>

          {/* Before / After cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {/* Before */}
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm">
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-5">Without MCP</p>
              <div className="space-y-3">
                {[
                  "Open browser, go to trycomly.com",
                  "Log in, wait for dashboard to load",
                  "Navigate to the right section",
                  "Copy the number you needed",
                  "Switch back to what you were doing",
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-bold text-white/40">{i + 1}</span>
                    </div>
                    <span className="text-[13px] text-white/60">{step}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-white/10">
                <span className="text-[12px] font-semibold text-white/40">~3 minutes of context switching</span>
              </div>
            </div>

            {/* After */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#5B2D91]/60 mb-5">With Comly MCP</p>
              <div className="bg-[#f7f7f7] rounded-xl p-4 font-mono text-[12px] mb-4">
                <span className="text-[#aaaaaa]">You: </span>
                <span className="text-[#0a0a0a]">How's my brand doing?</span>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#5B2D91]">
                  <ComlyLogo size={11} />
                  <span>comly.get_visibility_score</span>
                </div>
                <div className="mt-2 text-[#0a0a0a] leading-relaxed">
                  Score: <span className="font-bold text-[#5B2D91]">72/100 (B+)</span>. You appear in 7 of 10 prompts. Confluence is still ahead at #1.
                </div>
              </div>
              <div className="pt-3 border-t border-[#f0f0f0]">
                <span className="text-[12px] font-semibold text-emerald-600">~5 seconds, never left your editor</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOOLS ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-[32px] sm:text-[40px] font-black text-[#0a0a0a] mb-3">4 tools. All your data.</h2>
            <p className="text-[15px] text-[#6b6b6b] max-w-md mx-auto">
              Your Claude or Cursor agent automatically picks the right tool based on what you ask.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TOOLS.map(({ icon, fn, headline, desc, example }) => (
              <div key={fn} className="group bg-white border border-[#e8e8e8] rounded-2xl p-6 hover:border-[#5B2D91]/30 hover:shadow-md transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#f3eeff] flex items-center justify-center text-[#5B2D91] shrink-0">
                    {icon}
                  </div>
                  <div>
                    <p className="text-[11px] font-mono font-bold text-[#5B2D91] mb-0.5">{fn}</p>
                    <p className="text-[15px] font-bold text-[#0a0a0a]">{headline}</p>
                  </div>
                </div>
                <p className="text-[13px] text-[#6b6b6b] leading-relaxed mb-4">{desc}</p>
                <div className="flex items-center gap-2 bg-[#fafafa] border border-[#f0f0f0] rounded-xl px-3.5 py-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://www.google.com/s2/favicons?domain=claude.ai&sz=32" alt="" width={13} height={13} className="w-3.5 h-3.5 opacity-50 shrink-0" />
                  <span className="text-[12px] text-[#6b6b6b] italic">{example}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SETUP ────────────────────────────────────────────────────────── */}
      <section id="setup" className="py-24 px-6 bg-[#fafafa] border-t border-[#f0f0f0]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-[32px] sm:text-[40px] font-black text-[#0a0a0a] mb-3">Set up in 2 minutes</h2>
            <p className="text-[15px] text-[#6b6b6b]">Run your audit, grab your key, paste the config. Done.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

            {/* Left col: steps */}
            <div className="lg:col-span-2 space-y-6">
              {[
                { n: "1", title: "Run your first audit", desc: "Go to trycomly.com and audit your brand. Takes 60 seconds." },
                { n: "2", title: "Generate an API key", desc: "In the dashboard, go to MCP Server → Generate key. Copy it." },
                { n: "3", title: "Paste the config", desc: "Drop the JSON snippet into your client's config file and restart." },
              ].map(({ n, title, desc }) => (
                <div key={n} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#5B2D91] flex items-center justify-center text-white text-[13px] font-black shrink-0 shadow">
                    {n}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#0a0a0a]">{title}</p>
                    <p className="text-[13px] text-[#6b6b6b] mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <p className="text-[12px] text-[#aaaaaa] mb-3">Server URL</p>
                <div className="flex items-center gap-2 bg-white border border-[#e5e5e5] rounded-xl px-4 py-2.5">
                  <code className="text-[12px] font-mono text-[#0a0a0a] flex-1 select-all">trycomly.com/api/mcp</code>
                  <CopyBtn text="https://trycomly.com/api/mcp" className="bg-[#f0f0f0] text-[#0a0a0a] hover:bg-[#e5e5e5] shrink-0" />
                </div>
              </div>
            </div>

            {/* Right col: config snippet */}
            <div className="lg:col-span-3">
              {/* Client tabs */}
              <div className="flex items-center gap-1 p-1 bg-[#f0f0f0] rounded-xl mb-3 w-fit">
                {(Object.entries(CONFIGS) as [string, typeof CONFIGS[string]][]).map(([id, c]) => (
                  <button key={id} onClick={() => setActiveClient(id as "claude" | "cursor")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                      activeClient === id ? "bg-white shadow-sm text-[#0a0a0a] border border-[#e5e5e5]" : "text-[#6b6b6b] hover:text-[#0a0a0a]"
                    }`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://www.google.com/s2/favicons?domain=${c.domain}&sz=32`} alt="" width={14} height={14} className="w-3.5 h-3.5" />
                    {c.label}
                  </button>
                ))}
              </div>

              <p className="text-[11px] font-mono text-[#aaaaaa] mb-2">Save to <span className="text-[#6b6b6b]">{cfg.file}</span></p>

              <div className="relative">
                <pre className="bg-[#0a0a0a] text-[#e5e5e5] text-[12px] rounded-2xl p-5 overflow-x-auto leading-relaxed font-mono whitespace-pre">
                  {cfg.code}
                </pre>
                <CopyBtn text={cfg.code} className="absolute top-3.5 right-3.5 bg-white/10 text-white hover:bg-white/20" />
              </div>

              <p className="text-[12px] text-[#aaaaaa] mt-3">
                Restart your client after saving. You'll see <code className="font-mono text-[#5B2D91]">comly</code> in the tools list.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-[#f0f0f0]">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-[32px] sm:text-[40px] font-black text-[#0a0a0a] mb-4">
            Ready to ask Claude about your brand?
          </h2>
          <p className="text-[15px] text-[#6b6b6b] mb-8 leading-relaxed">
            Run a free audit, get your API key, and connect in under 2 minutes.
          </p>
          <Link href="/audit"
            className="inline-flex items-center gap-2 bg-[#5B2D91] text-white text-[15px] font-bold px-8 py-4 rounded-full hover:bg-[#4a2478] transition-colors shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
            Get started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#f0f0f0] py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <ComlyLogo size={20} />
            <span className="text-[13px] font-semibold text-[#0a0a0a]">Comly</span>
          </Link>
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
