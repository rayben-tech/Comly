"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Copy, Check, Terminal, TrendingUp, ListChecks, Users2, MessageSquare } from "lucide-react";
import { useScroll } from "@/components/ui/use-scroll";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SmoothScroll } from "@/components/smooth-scroll";

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
      const section = document.getElementById("setup");
      if (!section) return;
      const rect = section.getBoundingClientRect();
      setOverPurple(rect.top <= 56 && rect.bottom > 56);
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

// ── FAQ item ─────────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-5">
      <button onClick={() => setOpen(!open)} className="w-full flex items-start justify-between gap-4 text-left group">
        <span className="text-[16px] font-semibold text-[#0a0a0a] leading-snug group-hover:text-[#5B2D91] transition-colors">{q}</span>
        <span className={`text-[#aaaaaa] text-[20px] leading-none shrink-0 mt-0.5 transition-transform duration-300 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {/* Grid-row trick — animates height smoothly without JS measurement */}
      <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows 300ms ease" }}>
        <div className="overflow-hidden">
          <p className="pt-3 text-[14px] text-[#6b6b6b] leading-relaxed">{a}</p>
        </div>
      </div>
    </div>
  );
}

// ── Chat mockup ───────────────────────────────────────────────────────────────

function ChatMockup() {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-[#1c1c1e] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 bg-[#2a2a2c] border-b border-white/5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          <div className="flex items-center gap-1.5 ml-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://www.google.com/s2/favicons?domain=claude.ai&sz=32" alt="Claude" width={13} height={13} className="w-3.5 h-3.5 rounded-sm" />
            <span className="text-[11px] text-white/40 font-medium">Claude · comly-mcp</span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* User turn 1 */}
          <div className="flex justify-end">
            <div className="bg-[#2a2a2c] text-white/90 text-[13px] rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%]">
              How's my brand doing on AI this week?
            </div>
          </div>

          {/* Tool call */}
          <div className="flex items-center gap-2 text-[11px] text-white/30 font-mono pl-1">
            <ComlyLogo size={12} />
            <span className="text-[#a78bfa]">comly.get_visibility_score</span>
          </div>

          {/* Claude reply 1 */}
          <div className="flex gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://www.google.com/s2/favicons?domain=claude.ai&sz=32" alt="" width={20} height={20} className="w-5 h-5 rounded-full shrink-0 mt-0.5" />
            <div className="text-[13px] text-white/80 leading-relaxed">
              Your score is <span className="text-white font-semibold">72/100 (B+)</span> — up from 58 last week. You appeared in <span className="text-white font-semibold">7 of 10 prompts</span>. Confluence leads at #1 but you moved past Coda to <span className="text-[#a78bfa] font-semibold">#2</span>.
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/5" />

          {/* User turn 2 */}
          <div className="flex justify-end">
            <div className="bg-[#2a2a2c] text-white/90 text-[13px] rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%]">
              Which prompts am I missing from?
            </div>
          </div>

          {/* Tool call 2 */}
          <div className="flex items-center gap-2 text-[11px] text-white/30 font-mono pl-1">
            <ComlyLogo size={12} />
            <span className="text-[#a78bfa]">comly.get_prompt_results</span>
            <span className="text-white/20">filter: not_mentioned</span>
          </div>

          {/* Claude reply 2 */}
          <div className="flex gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://www.google.com/s2/favicons?domain=claude.ai&sz=32" alt="" width={20} height={20} className="w-5 h-5 rounded-full shrink-0 mt-0.5" />
            <div className="text-[13px] text-white/80 leading-relaxed space-y-1.5">
              <p>You're absent from <span className="text-white font-semibold">3 prompts</span> worth targeting:</p>
              {[
                "Best AI writing tool for long-form content?",
                "Top productivity apps for remote teams?",
                "What tools do content marketers use?",
              ].map((p, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[#ef4444] shrink-0 mt-0.5">✗</span>
                  <span className="text-white/60 text-[12px]">{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Input bar */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 bg-[#2a2a2c] border border-white/10 rounded-xl px-3 py-2 text-[12px] text-white/20">
              Reply to Claude…
            </div>
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
      "url": "https://www.trycomly.com/api/mcp",
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
        "url": "https://www.trycomly.com/api/mcp",
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
      <SmoothScroll />
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
        {/* Floating client logos — close around the headline */}
        {[
          { src: "https://www.google.com/s2/favicons?domain=claude.ai&sz=64",              alt: "Claude",   style: { top: "4%",  left:  "19%" }, depth: 28, rotate:  8  },
          { src: "https://www.google.com/s2/favicons?domain=cursor.sh&sz=64",              alt: "Cursor",   style: { top: "20%", left:  "16%" }, depth: 18, rotate: -12 },
          { src: "https://www.google.com/s2/favicons?domain=n8n.io&sz=64",                 alt: "n8n",      style: { top: "36%", left:  "20%" }, depth: 14, rotate:  6  },
          { src: "https://www.google.com/s2/favicons?domain=code.visualstudio.com&sz=64", alt: "VS Code",  style: { top: "4%",  right: "19%" }, depth: 28, rotate: -8  },
          { src: "https://www.google.com/s2/favicons?domain=codeium.com&sz=64",            alt: "Windsurf", style: { top: "20%", right: "16%" }, depth: 18, rotate:  11 },
          { src: "https://www.google.com/s2/favicons?domain=chatgpt.com&sz=64",            alt: "ChatGPT",  style: { top: "36%", right: "20%" }, depth: 14, rotate: -6  },
        ].map(({ src, alt, style, depth, rotate }) => (
          <FloatingLogo key={alt} src={src} alt={alt} style={style} depth={depth} rotate={rotate} mouseOffset={heroMouse} />
        ))}

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center">
          {/* Headline */}
          <h1 className="text-[44px] sm:text-[62px] font-black text-[#0a0a0a] leading-[1.06] tracking-tight mb-5">
            Your Comly data,<br />right where you think.
          </h1>
          <p className="text-[17px] text-[#6b6b6b] max-w-lg leading-relaxed mb-8">
            Connect Comly to Claude, Cursor, or any MCP client.
            Ask about your AI visibility in plain English — live answers without opening the dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-16">
            <Link href="/audit" className="flex items-center gap-2 bg-[#5B2D91] text-white text-[14px] font-semibold px-6 py-3 rounded-full hover:bg-[#4a2478] transition-colors shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
              Get your API key <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#setup" className="text-[14px] font-semibold text-[#6b6b6b] hover:text-[#0a0a0a] transition-colors px-4 py-3">
              View setup guide ↓
            </a>
          </div>

          {/* Chat mockup */}
          <div className="w-full">
            <ChatMockup />
          </div>
        </div>
      </section>

      {/* ── WHAT YOU CAN BUILD ───────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#aaaaaa] mb-4">Use cases</p>
            <h2 className="text-[38px] sm:text-[48px] font-black text-[#0a0a0a] leading-tight tracking-tight">
              What you can build
            </h2>
            <p className="mt-4 text-[16px] text-[#6b6b6b] max-w-lg mx-auto leading-relaxed">
              Real workflows built with Comly MCP. Each takes minutes to set up and saves hours.
            </p>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

            {/* Card 1 — Team Slack bot */}
            <div className="group bg-white rounded-2xl border border-[#e8e8e8] overflow-hidden flex flex-col transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
              {/* Visual area — Slack mockup fills the zone */}
              <div className="bg-[#1a1a2e] px-5 pt-5 pb-0 overflow-hidden" style={{ minHeight: 210 }}>
                {/* Channel header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                  <span className="text-[11px] font-bold text-white/80">#ai-visibility</span>
                </div>
                {/* Messages */}
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0 text-white text-[10px] font-bold">A</div>
                    <div className="bg-white/10 rounded-xl rounded-tl-sm px-3 py-2 max-w-[85%]">
                      <p className="text-[10px] font-semibold text-white/50 mb-0.5">Alex · 9:14 AM</p>
                      <p className="text-[11px] text-white/90 leading-snug">@comly how is <span className="text-[#c4b5fd] font-semibold">Acme Inc</span> doing this week?</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#5B2D91] flex items-center justify-center shrink-0 shadow-md">
                      <ComlyLogo size={14} />
                    </div>
                    <div className="bg-[#5B2D91]/30 border border-[#5B2D91]/40 rounded-xl rounded-tl-sm px-3 py-2 max-w-[90%]">
                      <p className="text-[10px] font-semibold text-[#c4b5fd] mb-1">Comly · 9:14 AM</p>
                      <p className="text-[11px] text-white/90 leading-snug"><span className="text-white font-bold">72/100</span> — up 14 pts this week. 7/10 prompts hit. Confluence still leads at #1.</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Text area */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://www.google.com/s2/favicons?domain=n8n.io&sz=32" alt="n8n" width={20} height={20} className="w-5 h-5 rounded-md" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://www.google.com/s2/favicons?domain=slack.com&sz=32" alt="Slack" width={20} height={20} className="w-5 h-5 rounded-md" />
                </div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-[15px] font-bold text-[#0a0a0a] leading-snug">Team Slack bot</p>
                  <span className="text-[#cccccc] group-hover:text-[#5B2D91] transition-colors mt-0.5 shrink-0">→</span>
                </div>
                <p className="text-[13px] text-[#6b6b6b] leading-relaxed">Wire Comly into n8n + Slack so anyone on your team can ask about brand visibility directly in a channel — live answers, no dashboard.</p>
              </div>
            </div>

            {/* Card 2 — Reddit/Quora engagement queue */}
            <div className="group bg-white rounded-2xl border border-[#e8e8e8] overflow-hidden flex flex-col transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
              {/* Visual area */}
              <div className="bg-[#f5f0ff] overflow-hidden" style={{ minHeight: 210 }}>
                {/* Header */}
                <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#5B2D91]/60">Engage today</span>
                  <span className="text-[10px] font-semibold text-white bg-[#5B2D91] px-2 py-0.5 rounded-full">3 threads</span>
                </div>
                {/* Thread rows */}
                <div className="mx-4 bg-white rounded-xl border border-[#e8e8e8] overflow-hidden shadow-sm">
                  {[
                    { domain: "reddit.com", color: "#ff4500", sub: "r/SaaS",        title: "Best tool for AI search visibility?" },
                    { domain: "reddit.com", color: "#ff4500", sub: "r/Entrepreneur", title: "How do you track AI brand mentions?" },
                    { domain: "quora.com",  color: "#b92b27", sub: "Quora",          title: "How to appear in ChatGPT answers?" },
                  ].map((t, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-[#f5f5f5] last:border-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://www.google.com/s2/favicons?domain=${t.domain}&sz=32`} alt="" width={16} height={16} className="w-4 h-4 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] font-bold uppercase tracking-wide mb-0.5" style={{ color: t.color }}>{t.sub}</p>
                        <p className="text-[11px] font-medium text-[#0a0a0a] line-clamp-1">{t.title}</p>
                      </div>
                      <span className="text-[#d0d0d0] text-[11px] shrink-0">→</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Text area */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://www.google.com/s2/favicons?domain=claude.ai&sz=32" alt="Claude" width={20} height={20} className="w-5 h-5 rounded-md" />
                </div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-[15px] font-bold text-[#0a0a0a] leading-snug">Reddit & Quora engagement queue</p>
                  <span className="text-[#cccccc] group-hover:text-[#5B2D91] transition-colors mt-0.5 shrink-0">→</span>
                </div>
                <p className="text-[13px] text-[#6b6b6b] leading-relaxed">Ask Claude "What threads should I engage with today?" — it surfaces live discussions where your buyers are asking questions you should be answering.</p>
              </div>
            </div>

            {/* Card 3 — Agency client prep */}
            <div className="group bg-white rounded-2xl border border-[#e8e8e8] overflow-hidden flex flex-col transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
              {/* Visual area */}
              <div className="bg-[#f5f0ff] overflow-hidden" style={{ minHeight: 210 }}>
                <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#5B2D91]/60">Client brief</span>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">Call in 5 min</span>
                </div>
                <div className="mx-4 bg-white rounded-xl border border-[#e8e8e8] overflow-hidden shadow-sm">
                  {/* Score row */}
                  <div className="px-4 py-3 border-b border-[#f5f5f5]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-medium text-[#6b6b6b]">Acme Inc — AI Visibility</span>
                      <span className="text-[13px] font-black text-[#5B2D91]">72<span className="text-[10px] font-normal text-[#aaaaaa]">/100</span></span>
                    </div>
                    <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                      <div className="h-full bg-[#5B2D91] rounded-full" style={{ width: "72%" }} />
                    </div>
                  </div>
                  {/* Stats */}
                  {[
                    { label: "vs top competitor",  value: "−18 pts",          color: "#ef4444" },
                    { label: "New prompt gaps",    value: "3 this week",      color: "#f59e0b" },
                    { label: "Prompts answered",   value: "7 / 10",           color: "#10b981" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center justify-between px-4 py-2.5 border-b border-[#f5f5f5] last:border-0">
                      <span className="text-[10px] text-[#6b6b6b]">{label}</span>
                      <span className="text-[11px] font-bold" style={{ color }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Text area */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://www.google.com/s2/favicons?domain=claude.ai&sz=32" alt="Claude" width={20} height={20} className="w-5 h-5 rounded-md" />
                </div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-[15px] font-bold text-[#0a0a0a] leading-snug">Agency client call prep</p>
                  <span className="text-[#cccccc] group-hover:text-[#5B2D91] transition-colors mt-0.5 shrink-0">→</span>
                </div>
                <p className="text-[13px] text-[#6b6b6b] leading-relaxed">Before every client call, ask Claude "How visible is [client] vs their top competitor?" — instant AI visibility talking points without opening a single tab.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SETUP ────────────────────────────────────────────────────────── */}
      <section id="setup" className="py-24 px-6 bg-[#a87be0]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-[32px] sm:text-[40px] font-black text-white mb-3">Set up in 2 minutes</h2>
            <p className="text-[15px] text-white/70">Run your audit, grab your key, paste the config. Done.</p>
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
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-[13px] font-black shrink-0 shadow">
                    {n}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-white">{title}</p>
                    <p className="text-[13px] text-white/70 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <p className="text-[12px] text-white/60 mb-3">Server URL</p>
                <div className="flex items-center gap-2 bg-white border border-[#e5e5e5] rounded-xl px-4 py-2.5">
                  <code className="text-[12px] font-mono text-[#0a0a0a] flex-1 select-all">www.trycomly.com/api/mcp</code>
                  <CopyBtn text="https://www.trycomly.com/api/mcp" className="bg-[#f0f0f0] text-[#0a0a0a] hover:bg-[#e5e5e5] shrink-0" />
                </div>
              </div>
            </div>

            {/* Right col: config snippet */}
            <div className="lg:col-span-3">
              {/* Client tabs */}
              <div className="flex items-center gap-1 p-1 bg-white/20 rounded-xl mb-3 w-fit">
                {(Object.entries(CONFIGS) as [string, typeof CONFIGS[string]][]).map(([id, c]) => (
                  <button key={id} onClick={() => setActiveClient(id as "claude" | "cursor")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                      activeClient === id ? "bg-white shadow-sm text-[#0a0a0a] border border-white/30" : "text-white/70 hover:text-white"
                    }`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://www.google.com/s2/favicons?domain=${c.domain}&sz=32`} alt="" width={14} height={14} className="w-3.5 h-3.5" />
                    {c.label}
                  </button>
                ))}
              </div>

              <p className="text-[11px] font-mono text-white/50 mb-2">Save to <span className="text-white/70">{cfg.file}</span></p>

              <div className="relative">
                <pre className="bg-[#0a0a0a] text-[#e5e5e5] text-[12px] rounded-2xl p-5 overflow-x-auto leading-relaxed font-mono whitespace-pre">
                  {cfg.code}
                </pre>
                <CopyBtn text={cfg.code} className="absolute top-3.5 right-3.5 bg-white/10 text-white hover:bg-white/20" />
              </div>

              <p className="text-[12px] text-white/70 mt-3">
                Restart your client after saving. You'll see <code className="font-mono font-bold text-white">comly</code> in the tools list.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#aaaaaa] mb-4">FAQ</p>
            <h2 className="text-[38px] sm:text-[48px] font-black text-[#0a0a0a] leading-tight tracking-tight">
              Common questions
            </h2>
          </div>

          <div className="divide-y divide-[#f0f0f0]">
            {[
              {
                q: "Do I need to run an audit before using the MCP server?",
                a: "Yes — the MCP server reads from your latest audit. Run one audit at trycomly.com first, then generate your API key. The whole thing takes about 2 minutes.",
              },
              {
                q: "Which AI clients support MCP?",
                a: "Claude Desktop, Cursor, Windsurf, VS Code (with the Copilot MCP extension), n8n, and any other client that supports the Model Context Protocol. The list is growing fast.",
              },
              {
                q: "Is my brand data sent to the AI client?",
                a: "Your data stays on Comly's servers. The MCP server only returns what the AI client explicitly requests — a score, a list of prompts, or a set of threads. Nothing is pushed automatically.",
              },
              {
                q: "How often is the data updated?",
                a: "The MCP server always returns data from your most recent audit. Re-run an audit anytime to refresh your score, prompt results, and competitor rankings.",
              },
              {
                q: "Can I use one API key for multiple clients?",
                a: "Yes. Your API key works across any number of MCP clients simultaneously — Claude Desktop, Cursor, n8n, all at once.",
              },
              {
                q: "Is the MCP server included in my plan?",
                a: "Yes. MCP access is included with every Comly account. No extra cost, no separate subscription.",
              },
            ].map(({ q, a }) => (
              <FaqItem key={q} q={q} a={a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#a87be0]">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-[32px] sm:text-[40px] font-black text-white mb-4">
            Ready to ask Claude about your brand?
          </h2>
          <p className="text-[15px] text-white/70 mb-8 leading-relaxed">
            Run a free audit, get your API key, and connect in under 2 minutes.
          </p>
          <Link href="/audit"
            className="inline-flex items-center gap-2 bg-white text-[#5B2D91] text-[15px] font-bold px-8 py-4 rounded-full hover:bg-white/90 transition-colors shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
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
