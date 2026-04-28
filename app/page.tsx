"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, ArrowRight, Check, X, Menu, ChevronDown, Plus,
  BarChart3, TrendingUp, Target, Eye, Bell, Shield,
  ExternalLink, Search, RefreshCw, Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { HowItWorksAnimated } from "@/components/ui/animated-scroll";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { AnimatedText } from "@/components/ui/animated-underline-text-one";
import { useScroll } from "@/components/ui/use-scroll";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── COMLY LOGO ───────────────────────────────────────────────────────────────

function ComlyLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Rounded triangle body */}
      <path
        d="M50 4 C54 4 57 6 59.5 10 L93 68 C97 74 97 80 93.5 85 C90 90 84 93 77 93 L23 93 C16 93 10 90 6.5 85 C3 80 3 74 7 68 L40.5 10 C43 6 46 4 50 4Z"
        fill="#1a1a2e"
      />
      {/* Purple swoosh */}
      <path
        d="M28 72 C32 62 44 56 58 60 C66 62.5 70 67 68 70 C66 73 60 72 52 69 C44 66 36 68 32 74 C30 77 28 75 28 72Z"
        fill="#7c3aed"
      />
      <path
        d="M28 72 C32 62 44 56 58 60 C66 62.5 70 67 68 70 C66 73 60 72 52 69 C44 66 36 68 32 74 C30 77 28 75 28 72Z"
        fill="url(#swooshGrad)"
      />
      <defs>
        <linearGradient id="swooshGrad" x1="28" y1="65" x2="70" y2="65" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5b21b6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── BRAND FAVICON ────────────────────────────────────────────────────────────

function Logo({
  domain, name, size = 20, className = "",
}: { domain: string; name: string; size?: number; className?: string }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded font-bold text-white text-[10px] shrink-0 ${className}`}
        style={{ width: size, height: size, background: "#888" }}
      >
        {name[0]}
      </span>
    );
  }
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      alt={name}
      width={size}
      height={size}
      className={`object-contain rounded shrink-0 ${className}`}
      onError={() => setErr(true)}
    />
  );
}

// ─── LLM BADGE (hero) ─────────────────────────────────────────────────────────

function LLMBadge({ src, alt, style }: { src: string; alt: string; style: React.CSSProperties }) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  return (
    <div
      className="absolute hidden md:flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-[#e5e5e5] shadow-md"
      style={style}
    >
      <div className="relative w-8 h-8">
        {!loaded && <div className="absolute inset-0 rounded-lg shimmer" />}
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={32}
          height={32}
          className={`w-8 h-8 rounded-lg transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />
      </div>
    </div>
  );
}

// ─── FADE IN ON SCROLL ────────────────────────────────────────────────────────

function FadeIn({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ─── CHAT CONVERSATION ANIMATIONS ────────────────────────────────────────────

const chatSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      <style>{`@keyframes typingBounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}`}</style>
      <style>{`@keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-white/40 inline-block"
          style={{ animation: `typingBounce 1.1s ease-in-out ${i * 0.18}s infinite` }}
        />
      ))}
    </div>
  );
}

const BEFORE_RESP = "The most popular project management tools for remote teams include:";
const BEFORE_ITEMS = ["Asana", "Trello", "Monday.com", "Notion", "ClickUp"];
const AFTER_RESP = "For distributed teams, these stand out:";
const AFTER_ITEMS = [
  { label: "Your Brand", highlight: true },
  { label: "Asana", highlight: false },
  { label: "Monday.com", highlight: false },
];

interface ChatState {
  showUser: boolean;
  showTyping: boolean;
  beforeText: string;
  afterText: string;
  beforeItems: number;
  afterItems: number;
  showPill: boolean;
}

function BeforeChat({ s }: { s: ChatState }) {
  const { showUser, showTyping, beforeText: responseText, beforeItems: shownItems, showPill } = s;
  const RESP = BEFORE_RESP;
  const ITEMS = BEFORE_ITEMS; 

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="w-2 h-2 rounded-full bg-red-400" />
        <span className="text-xs font-bold uppercase tracking-widest text-red-500">Before</span>
      </div>
      <div className="flex-1 bg-[#212121] rounded-2xl overflow-hidden shadow-xl border border-white/5">
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/10">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 text-[11px] text-white/30 font-medium">ChatGPT</span>
        </div>
        <div className="px-5 py-5 space-y-5 min-h-[300px]">
          {/* User bubble */}
          <div
            className="flex items-start gap-3 justify-end"
            style={{ opacity: showUser ? 1 : 0, transform: showUser ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.35s ease, transform 0.35s ease" }}
          >
            <div className="bg-[#2f2f2f] rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%]">
              <p className="text-[13px] text-white/90 leading-relaxed">What&apos;s the best project management tool for remote teams?</p>
            </div>
            <div className="w-7 h-7 rounded-full bg-[#5B2D91]/60 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[10px] font-bold text-white">Y</span>
            </div>
          </div>

          {/* AI response */}
          {(showTyping || responseText.length > 0) && (
            <div className="flex items-start gap-3" style={{ animation: "msgIn 0.3s ease" }}>
              <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mt-0.5 bg-white">
                <img src="https://www.google.com/s2/favicons?domain=chatgpt.com&sz=32" alt="ChatGPT" width={28} height={28} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-2.5">
                {showTyping ? (
                  <TypingIndicator />
                ) : (
                  <>
                    <p className="text-[13px] text-white/80 leading-relaxed">
                      {responseText}
                      {responseText.length < RESP.length && (
                        <span className="inline-block w-0.5 h-3.5 bg-white/60 ml-0.5 animate-pulse align-middle" />
                      )}
                    </p>
                    {shownItems > 0 && (
                      <ul className="space-y-1.5">
                        {ITEMS.slice(0, shownItems).map((t) => (
                          <li key={t} className="flex items-center gap-2 text-[13px] text-white/70" style={{ animation: "msgIn 0.3s ease" }}>
                            <span className="w-1 h-1 rounded-full bg-white/30 shrink-0" />{t}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Not mentioned pill */}
          {showPill && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2.5" style={{ animation: "msgIn 0.4s ease" }}>
              <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
              <span className="text-[12px] text-red-400 font-medium">Your brand: not mentioned</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AfterChat({ s }: { s: ChatState }) {
  const { showUser, showTyping, afterText: responseText, afterItems: shownItems, showPill } = s;
  const RESP = AFTER_RESP;
  const ITEMS = AFTER_ITEMS;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">After</span>
      </div>
      <div className="flex-1 bg-[#212121] rounded-2xl overflow-hidden shadow-xl border border-white/5">
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/10">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 text-[11px] text-white/30 font-medium">ChatGPT</span>
        </div>
        <div className="px-5 py-5 space-y-5 min-h-[300px]">
          {/* User bubble */}
          <div
            className="flex items-start gap-3 justify-end"
            style={{ opacity: showUser ? 1 : 0, transform: showUser ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.35s ease, transform 0.35s ease" }}
          >
            <div className="bg-[#2f2f2f] rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%]">
              <p className="text-[13px] text-white/90 leading-relaxed">What&apos;s the best project management tool for remote teams?</p>
            </div>
            <div className="w-7 h-7 rounded-full bg-[#5B2D91]/60 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[10px] font-bold text-white">Y</span>
            </div>
          </div>

          {/* AI response */}
          {(showTyping || responseText.length > 0) && (
            <div className="flex items-start gap-3" style={{ animation: "msgIn 0.3s ease" }}>
              <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mt-0.5 bg-white">
                <img src="https://www.google.com/s2/favicons?domain=chatgpt.com&sz=32" alt="ChatGPT" width={28} height={28} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-2.5">
                {showTyping ? (
                  <TypingIndicator />
                ) : (
                  <>
                    <p className="text-[13px] text-white/80 leading-relaxed">
                      {responseText}
                      {responseText.length < RESP.length && (
                        <span className="inline-block w-0.5 h-3.5 bg-white/60 ml-0.5 animate-pulse align-middle" />
                      )}
                    </p>
                    {shownItems > 0 && (
                      <ul className="space-y-1.5">
                        {ITEMS.slice(0, shownItems).map((item) => (
                          <li
                            key={item.label}
                            className={item.highlight
                              ? "flex items-center gap-2 bg-[#5B2D91]/20 border border-[#5B2D91]/30 rounded-lg px-3 py-2"
                              : "flex items-center gap-2 text-[13px] text-white/50 px-3"
                            }
                            style={{ animation: "msgIn 0.3s ease" }}
                          >
                            <span className={`shrink-0 rounded-full ${item.highlight ? "w-1.5 h-1.5 bg-[#a78bfa]" : "w-1 h-1 bg-white/20"}`} />
                            <span className={`text-[13px] ${item.highlight ? "text-white font-semibold" : ""}`}>{item.label}</span>
                            {item.highlight && (
                              <span className="ml-auto text-[10px] font-bold text-[#a78bfa] bg-[#5B2D91]/30 px-2 py-0.5 rounded-full">top recommendation</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Cited pill */}
          {showPill && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3.5 py-2.5" style={{ animation: "msgIn 0.4s ease" }}>
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <span className="text-[12px] text-emerald-400 font-medium">Cited as #1 choice</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BeforeAfterChats() {
  const [s, setS] = useState<ChatState>({
    showUser: false, showTyping: false,
    beforeText: "", afterText: "",
    beforeItems: 0, afterItems: 0,
    showPill: false,
  });

  useEffect(() => {
    let alive = true;
    const maxLen = Math.max(BEFORE_RESP.length, AFTER_RESP.length);
    const maxItems = Math.max(BEFORE_ITEMS.length, AFTER_ITEMS.length);
    (async () => {
      while (alive) {
        setS({ showUser: false, showTyping: false, beforeText: "", afterText: "", beforeItems: 0, afterItems: 0, showPill: false });
        await chatSleep(700);
        if (!alive) break;
        setS(p => ({ ...p, showUser: true }));
        await chatSleep(900);
        setS(p => ({ ...p, showTyping: true }));
        await chatSleep(1500);
        setS(p => ({ ...p, showTyping: false }));
        for (let i = 1; i <= maxLen && alive; i++) {
          const bt = BEFORE_RESP.slice(0, Math.min(i, BEFORE_RESP.length));
          const at = AFTER_RESP.slice(0, Math.min(i, AFTER_RESP.length));
          setS(p => ({ ...p, beforeText: bt, afterText: at }));
          await chatSleep(15);
        }
        for (let i = 1; i <= maxItems && alive; i++) {
          setS(p => ({ ...p, beforeItems: Math.min(i, BEFORE_ITEMS.length), afterItems: Math.min(i, AFTER_ITEMS.length) }));
          await chatSleep(300);
        }
        await chatSleep(350);
        setS(p => ({ ...p, showPill: true }));
        await chatSleep(3800);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <BeforeChat s={s} />
      <AfterChat s={s} />
    </div>
  );
}

// ─── WORD-BY-WORD ANIMATED HEADING ───────────────────────────────────────────

function AnimatedWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const words = text.split(" ");

  return (
    <h2 ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden leading-[1.2]">
          <motion.span
            className="inline-block mr-[0.27em]"
            initial={{ y: "110%", opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : { y: "110%", opacity: 0 }}
            transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </h2>
  );
}

// ─── COUNT UP ANIMATION ───────────────────────────────────────────────────────

function useCountUp(end: number, trigger: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let frame = 0;
    const total = 60;
    const id = setInterval(() => {
      frame++;
      if (frame >= total) { setCount(end); clearInterval(id); }
      else setCount(Math.round((frame / total) * end));
    }, 1000 / 60);
    return () => clearInterval(id);
  }, [end, trigger]);
  return count;
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

const HERO_COMPETITORS = [
  { name: "Confluence", domain: "confluence.atlassian.com", pct: 85 },
  { name: "Notion",     domain: "notion.so",                pct: 72, you: true },
  { name: "Coda",       domain: "coda.io",                  pct: 70 },
  { name: "Obsidian",   domain: "obsidian.md",              pct: 60 },
];

const TESTIMONIALS = [
  {
    quote: "ChatGPT wasn't mentioning us at all. Comly showed us exactly why and what to fix. Our score went from 20 to 68 in 3 weeks.",
    name: "James K.", role: "Founder at Pulseapp", initials: "JK", color: "#6366f1",
  },
  {
    quote: "I paste the URL and get a full audit in 60 seconds. The competitor ranking alone is worth it. Now I know exactly who AI is recommending instead of me.",
    name: "Sarah M.", role: "CEO at Flowdesk", initials: "SM", color: "#ec4899",
  },
  {
    quote: "The to-do list is genius. Generated our llms.txt in one click, created 2 comparison pages. Score jumped 30 points.",
    name: "Marc T.", role: "Founder at Traackr", initials: "MT", color: "#14b8a6",
  },
  {
    quote: "Finally a tool built for solo SaaS founders. No setup, no configuration. Just paste URL and see the truth about your AI visibility.",
    name: "Alex R.", role: "Founder at Buildify", initials: "AR", color: "#f59e0b",
  },
  {
    quote: "Didn't know ChatGPT was recommending my competitor 8 times before mentioning me once. Comly fixed that.",
    name: "Priya S.", role: "Growth at Stackly", initials: "PS", color: "#8b5cf6",
  },
  {
    quote: "Weekly tracking changed everything. I get an email when my score changes. It's like having an AI SEO analyst on the team.",
    name: "Tom L.", role: "Marketing at Devhub", initials: "TL", color: "#10b981",
  },
  {
    quote: "The checklist is so specific. Not 'improve your SEO' but 'you need a comparison page for this exact competitor'. That's actionable.",
    name: "Nina V.", role: "Co-founder at Loopify", initials: "NV", color: "#ef4444",
  },
  {
    quote: "Went from 0 mentions to being recommended 7 out of 10 times in ChatGPT in 6 weeks. Comly's fixes actually work.",
    name: "David K.", role: "Founder at Claritask", initials: "DK", color: "#0ea5e9",
  },
];

const FAQ_ITEMS = [
  {
    q: "What's a visibility score?",
    a: "Your visibility score (0–100) shows how often ChatGPT mentions your brand across targeted prompts in your category. 0 means never mentioned, 100 means mentioned in every prompt.",
  },
  {
    q: "How fast do I get results?",
    a: "Your first audit is ready in about 60 seconds. We scrape your site, extract your brand profile, generate and run prompts, and return your score — all automatically.",
  },
  {
    q: "Do I need to set up anything?",
    a: "No. Just paste your URL. Comly automatically detects your brand, category, competitors and use cases. You can edit any field before running the audit.",
  },
  {
    q: "How is this different from SEO tools?",
    a: "SEO tools track Google rankings. Comly tracks AI mentions. 50% of AI citations don't overlap with Google's top results — meaning your Google ranking doesn't predict your AI visibility.",
  },
  {
    q: "Why does my brand score low even if it's well known?",
    a: "AI models are trained on web data up to a cutoff date. If your brand isn't mentioned frequently in trusted sources (G2, Reddit, industry blogs), AI may not know you well. Comly shows you exactly which sources to target.",
  },
  {
    q: "Can I track multiple brands?",
    a: "The Pro plan supports multiple brands and workspaces. The Starter plan covers one brand with weekly tracking.",
  },
  {
    q: "What AI models do you track?",
    a: "Currently ChatGPT (v1). Claude, Perplexity and Gemini are coming in v2, launching within weeks of v1.",
  },
  {
    q: "How do I improve my score?",
    a: "Follow the to-do list Comly generates after your audit. Common fixes include: creating an llms.txt file, adding comparison pages, getting listed on G2, and improving your site's category positioning.",
  },
];

// ─── NAVBAR ───────────────────────────────────────────────────────────────────

function Navbar({ onCta, visible = true }: { onCta: () => void; visible?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useScroll(10);

  const links = [
    { label: "Home",         href: "#hero" },
    { label: "Features",     href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "FAQ",          href: "#faq" },
    { label: "Pricing",      href: "#pricing" },
  ];

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 mx-auto w-full border-b border-transparent",
        "md:rounded-xl md:border",
        "md:[transition:max-width_500ms_cubic-bezier(0.4,0,0.2,1),top_500ms_cubic-bezier(0.4,0,0.2,1),background-color_300ms_ease,box-shadow_300ms_ease,border-color_300ms_ease,padding_300ms_ease]",
        scrolled && !menuOpen
          ? "bg-white/95 supports-[backdrop-filter]:bg-white/80 border-[#e5e5e5] backdrop-blur-lg md:top-4 md:shadow-sm"
          : menuOpen
          ? "bg-white/95"
          : "bg-white border-transparent",
      )}
      style={{
        maxWidth: scrolled && !menuOpen ? "896px" : "1280px",
        transform: visible ? "none" : "translateY(-300%)",
        transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1), max-width 500ms cubic-bezier(0.4,0,0.2,1), top 500ms cubic-bezier(0.4,0,0.2,1), background-color 300ms ease, box-shadow 300ms ease, border-color 300ms ease, padding 300ms ease",
      }}
    >
      <nav
        className={cn(
          "flex h-14 w-full items-center justify-between",
          "px-6 [transition:padding_400ms_cubic-bezier(0.4,0,0.2,1)]",
          scrolled && "md:px-4",
        )}
      >
        {/* Logo */}
        <a href="#hero" className="flex items-center gap-2 shrink-0">
          <ComlyLogo size={28} />
          <span className="font-bold text-[#0a0a0a] text-base tracking-tight">Comly</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={buttonVariants({ variant: "ghost", size: "sm", className: "text-[#6b6b6b] hover:text-[#0a0a0a]" })}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onCta}
            className="flex items-center gap-1.5 bg-[#5B2D91] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#4a2478] transition-all hover:scale-[1.02]"
          >
            Try for free <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className={cn(
            "md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-[#e5e5e5] text-[#0a0a0a] hover:bg-[#f7f7f5] transition-colors",
          )}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <MenuToggleIcon open={menuOpen} className="w-5 h-5" duration={300} />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed top-14 right-0 bottom-0 left-0 z-50 bg-white/95 backdrop-blur-lg md:hidden border-t border-[#e5e5e5] overflow-hidden",
          menuOpen ? "flex flex-col" : "hidden",
        )}
      >
        <div
          data-slot={menuOpen ? "open" : "closed"}
          className="data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out flex h-full w-full flex-col justify-between gap-y-2 p-6"
        >
          <div className="grid gap-y-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className={buttonVariants({ variant: "ghost", className: "justify-start text-base text-[#0a0a0a]" })}
              >
                {l.label}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => { onCta(); setMenuOpen(false); }}
              className="w-full bg-[#5B2D91] text-white text-sm font-semibold py-3 rounded-full hover:bg-[#4a2478] transition-colors"
            >
              Try for free →
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── HERO FLOATING CARD ───────────────────────────────────────────────────────

function HeroDashboardCard() {
  return (
    <div className="hero-float bg-white border border-[#e5e5e5] rounded-2xl shadow-xl p-5 w-full max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Logo domain="notion.so" name="Notion" size={18} className="rounded-md" />
          <span className="text-sm font-semibold text-[#0a0a0a]">Notion</span>
        </div>
        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-medium">
          Live audit
        </span>
      </div>

      <div className="flex items-end gap-3 mb-2">
        <span className="text-5xl font-black text-[#0a0a0a] leading-none">72</span>
        <span className="text-lg text-[#6b6b6b] mb-1">/100</span>
        <span className="text-xs text-emerald-600 font-semibold mb-1.5 ml-auto">↑ +12 vs last week</span>
      </div>
      <div className="h-2 bg-[#f0f0f0] rounded-full overflow-hidden mb-5">
        <div className="h-full bg-[#5B2D91] rounded-full" style={{ width: "72%" }} />
      </div>

      <p className="text-[10px] font-semibold text-[#6b6b6b] uppercase tracking-wide mb-3">
        AI Competitor Ranking
      </p>
      <div className="space-y-2.5">
        {HERO_COMPETITORS.map((r, i) => (
          <div
            key={r.name}
            className={`flex items-center gap-2 ${
              r.you ? "bg-[#5B2D91]/[0.05] rounded-lg px-2 py-1 -mx-2" : ""
            }`}
          >
            <span className="text-[10px] text-[#6b6b6b] w-3">{i + 1}</span>
            <Logo domain={r.domain} name={r.name} size={14} />
            <span className="text-xs flex-1 text-[#0a0a0a] flex items-center gap-1.5">
              {r.name}
              {r.you && (
                <span className="text-[9px] bg-[#5B2D91] text-white px-1.5 py-0.5 rounded-full leading-none">
                  You
                </span>
              )}
            </span>
            <div className="w-16 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
              <div className="h-full bg-black rounded-full" style={{ width: `${r.pct}%` }} />
            </div>
            <span className="text-[10px] text-[#6b6b6b] w-7 text-right">{r.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────

function StatCard({
  number, suffix = "", label, sublabel, delay = 0,
}: { number: number; suffix?: string; label: string; sublabel: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const count = useCountUp(number, inView);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="bg-white border border-[#e5e5e5] rounded-2xl p-6 text-center hover:shadow-sm transition-all"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
      }}
    >
      <p className="text-4xl font-black text-[#0a0a0a] tracking-tight">
        {count}{suffix}
      </p>
      <p className="text-sm font-semibold text-[#0a0a0a] mt-2">{label}</p>
      <p className="text-xs text-[#6b6b6b] mt-0.5">{sublabel}</p>
    </div>
  );
}

// ─── BENTO VISUAL MOCKUPS ─────────────────────────────────────────────────────

function AuditVisual() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 border border-[#e5e5e5] rounded-xl px-3 py-2.5 bg-white">
        <Globe className="w-4 h-4 text-[#6b6b6b] shrink-0" />
        <span className="text-sm text-[#0a0a0a]">https://notion.so</span>
        <span className="ml-auto w-2 h-4 bg-black/60 animate-pulse rounded-sm" />
      </div>
      <div className="bg-[#5B2D91] text-white text-xs text-center py-2.5 rounded-xl font-medium">
        Run free audit →
      </div>
      <div className="flex items-center gap-2 bg-[#f7f7f5] border border-[#ebebeb] rounded-xl px-3 py-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <span className="text-xs text-[#6b6b6b]">Analyzing brand profile...</span>
      </div>
    </div>
  );
}

function CompetitorVisual() {
  const rows = [
    { name: "Confluence", domain: "confluence.atlassian.com", pct: 85 },
    { name: "Notion",     domain: "notion.so",                pct: 72, you: true },
    { name: "Coda",       domain: "coda.io",                  pct: 70 },
  ];
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={r.name} className={`flex items-center gap-2 ${r.you ? "bg-[#5B2D91]/[0.06] rounded-lg px-2 py-1 -mx-0.5" : ""}`}>
          <span className="text-[10px] text-[#6b6b6b] w-3">{i + 1}</span>
          <Logo domain={r.domain} name={r.name} size={14} />
          <span className="text-xs text-[#0a0a0a] flex-1 flex items-center gap-1">
            {r.name}
            {r.you && <span className="text-[9px] bg-[#5B2D91] text-white px-1 rounded-full">You</span>}
          </span>
          <span className="text-xs font-semibold">{r.pct}%</span>
        </div>
      ))}
    </div>
  );
}

function ScoreVisual() {
  return (
    <div className="flex flex-col items-center gap-1 py-2">
      <div className="relative">
        <svg width="96" height="60" viewBox="0 0 96 60">
          <path d="M 10 56 A 38 38 0 0 1 86 56" stroke="#f0f0f0" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M 10 56 A 38 38 0 0 1 86 56" stroke="#5B2D91" strokeWidth="7" fill="none" strokeLinecap="round"
            strokeDasharray="120 120" strokeDashoffset="33" />
        </svg>
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-3xl font-black text-[#0a0a0a] leading-none">
          72
        </span>
      </div>
      <span className="text-xs text-[#6b6b6b]">/ 100</span>
    </div>
  );
}

function TrendVisual() {
  const pts = [20, 28, 36, 42, 50, 58, 65, 72];
  const w = 160, h = 56, pad = 4;
  const mn = Math.min(...pts), mx = Math.max(...pts);
  const xs = pts.map((_, i) => pad + (i / (pts.length - 1)) * (w - pad * 2));
  const ys = pts.map((v) => h - pad - ((v - mn) / (mx - mn)) * (h - pad * 2));
  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-[#6b6b6b]">Score trend</span>
        <span className="text-xs font-bold text-emerald-600">↑ +28 pts</span>
      </div>
      <svg width="100%" height="56" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <path d={d} fill="none" stroke="#5B2D91" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="3.5" fill="#5B2D91" />
      </svg>
    </div>
  );
}

function TodoVisual() {
  const items = [
    { text: "Add llms.txt to root domain",   done: false },
    { text: "Create comparison pages",        done: false },
    { text: "Update meta descriptions",       done: true  },
    { text: "Submit to G2 & Capterra",        done: false },
  ];
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${item.done ? "bg-[#5B2D91] border-[#5B2D91]" : "border-[#e5e5e5]"}`}>
            {item.done && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
          </div>
          <span className={`text-xs ${item.done ? "line-through text-[#6b6b6b]" : "text-[#0a0a0a]"}`}>
            {item.text}
          </span>
        </div>
      ))}
      <div className="mt-3 border border-[#5B2D91] rounded-xl py-1.5 text-xs font-medium text-center text-[#5B2D91] hover:bg-[#f5f0fa] transition-colors cursor-pointer">
        Generate fix →
      </div>
    </div>
  );
}

function MonitorVisual() {
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-400" />
        <span className="text-sm font-semibold text-[#0a0a0a]">Monitoring...</span>
      </div>
      <span className="text-xs text-[#6b6b6b]">
        Next audit in <span className="font-semibold text-[#0a0a0a]">23h 59m</span>
      </span>
      <div className="flex flex-wrap justify-center gap-1.5">
        {["ChatGPT", "Claude", "Perplexity", "Gemini"].map((m) => (
          <span key={m} className="text-[9px] bg-[#f7f7f5] border border-[#e5e5e5] px-2 py-0.5 rounded-full text-[#6b6b6b]">
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── CSS BAR ──────────────────────────────────────────────────────────────────

function CssBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="mb-2.5">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-[#6b6b6b]">{label}</span>
        <span className="text-xs font-semibold text-[#0a0a0a]">{pct}%</span>
      </div>
      <div className="h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

// ─── TESTIMONIAL CARD ─────────────────────────────────────────────────────────

function TestimonialCard({ t }: { t: typeof TESTIMONIALS[number] }) {
  const dotIdx = t.quote.indexOf(".");
  const bold = dotIdx !== -1 ? t.quote.slice(0, dotIdx + 1) : t.quote;
  const rest  = dotIdx !== -1 ? t.quote.slice(dotIdx + 1) : "";
  return (
    <div className="flex-shrink-0 w-80 bg-white border border-[#e5e5e5] rounded-2xl p-6">
      <p className="text-sm text-[#0a0a0a] leading-relaxed mb-4">
        <span className="font-semibold">{bold}</span>
        <span className="text-[#6b6b6b]">{rest}</span>
      </p>
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ background: t.color }}
        >
          {t.initials}
        </div>
        <div>
          <p className="text-xs font-semibold text-[#0a0a0a]">{t.name}</p>
          <p className="text-[10px] text-[#6b6b6b]">{t.role}</p>
        </div>
      </div>
    </div>
  );
}

// ─── FAQ ITEM ─────────────────────────────────────────────────────────────────

function FAQItem({
  q, a, isOpen, toggle, index,
}: { q: string; a: string; isOpen: boolean; toggle: () => void; index: number }) {
  return (
    <motion.div
      className="rounded-xl border transition-colors duration-200 overflow-hidden"
      style={{
        borderColor: isOpen ? "rgba(91,45,145,0.25)" : "#ebebeb",
        background: isOpen ? "rgba(91,45,145,0.03)" : "#fff",
      }}
    >
      <button
        onClick={toggle}
        className="w-full flex items-start gap-4 px-5 py-4 text-left group"
      >
        <span className="text-[11px] font-bold text-[#5B2D91]/50 mt-0.5 w-5 shrink-0 tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className={`flex-1 text-[15px] font-semibold leading-snug transition-colors duration-150 ${isOpen ? "text-[#5B2D91]" : "text-[#0a0a0a] group-hover:text-[#5B2D91]"}`}>
          {q}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 mt-0.5"
        >
          <Plus className={`w-4 h-4 transition-colors duration-150 ${isOpen ? "text-[#5B2D91]" : "text-[#aaaaaa]"}`} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-sm text-[#6b6b6b] leading-relaxed px-5 pb-5 pl-14">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── PRICE FEATURE ────────────────────────────────────────────────────────────

function PriceFeature({ text, included }: { text: string; included: boolean }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className={`mt-0.5 shrink-0 ${included ? "text-[#5B2D91]" : "text-[#c5c5c5]"}`}>
        {included
          ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
          : <X className="w-3.5 h-3.5" />}
      </div>
      <span className={`text-sm ${included ? "text-[#0a0a0a]" : "text-[#aaaaaa]"}`}>{text}</span>
    </div>
  );
}

// ─── HERO DASHBOARD PREVIEW ───────────────────────────────────────────────────

function HeroDashboardPreview() {
  const mentions = [
    { model: "ChatGPT", modelDomain: "chatgpt.com", label: "Discovery", color: "bg-blue-50 text-blue-600", prompt: "Best project management tools for SaaS startups?", preview: "Notion is frequently recommended for SaaS teams due to its flexible workspace structure…", position: 2, date: "Apr 20" },
    { model: "Perplexity", modelDomain: "perplexity.ai", label: "Competitor", color: "bg-orange-50 text-orange-600", prompt: "Notion vs Confluence for a remote team?", preview: "Notion stands out as the more flexible option, offering databases, docs and wikis in one place…", position: 1, date: "Apr 19" },
    { model: "Claude", modelDomain: "claude.ai", label: "Direct Brand", color: "bg-purple-50 text-purple-600", prompt: "What is Notion and is it good for startups?", preview: "Notion is an all-in-one workspace tool that combines notes, wikis, databases and task management…", position: null, date: "Apr 18" },
  ];

  const trendPts = [0, 18, 28, 38, 42, 52, 60, 68];
  const w = 260, h = 60, pad = 4;
  const mn = 0, mx = 100;
  const xs = trendPts.map((_, i) => pad + (i / (trendPts.length - 1)) * (w - pad * 2));
  const ys = trendPts.map((v) => h - pad - ((v - mn) / (mx - mn)) * (h - pad * 2));
  const linePath = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const areaPath = `${linePath} L${xs[xs.length - 1]},${h} L${xs[0]},${h} Z`;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-white text-left" style={{ fontSize: "12px" }}>
      {/* Browser bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#f7f7f5] border-b border-[#e5e5e5]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#e5e5e5]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#e5e5e5]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#e5e5e5]" />
        </div>
        <div className="flex-1 mx-4 bg-white border border-[#e5e5e5] rounded-md px-3 py-1 text-[11px] text-[#aaaaaa]">
          app.comly.io/dashboard
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar — matches real sidebar layout */}
        <aside className="w-[160px] shrink-0 border-r border-[#ebebeb] flex flex-col bg-white">
          {/* Brand header */}
          <div className="px-3 py-3 border-b border-[#f0f0f0] flex items-center gap-2">
            <img src="https://www.google.com/s2/favicons?domain=notion.so&sz=64" alt="Notion" width={20} height={20} className="rounded-lg object-contain shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-[#0a0a0a] truncate leading-tight">Notion&apos;s dashboard</p>
              <p className="text-[9px] text-[#aaaaaa] truncate">notion.so</p>
            </div>
          </div>
          {/* Search */}
          <div className="px-2.5 py-2">
            <div className="flex items-center gap-1.5 px-2 bg-[#f7f7f5] border border-[#ebebeb] rounded-md h-6">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#cccccc" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <span className="text-[9px] text-[#cccccc]">Quick Actions</span>
            </div>
          </div>
          {/* Nav */}
          <div className="px-2 flex-1 overflow-hidden">
            <p className="text-[8px] font-bold text-[#cccccc] uppercase tracking-[0.14em] px-1.5 mb-1">Pages</p>
            {[
              { label: "Overview", active: true },
              { label: "Prompts",  active: false },
              { label: "Sources",  active: false },
            ].map(({ label, active }) => (
              <div key={label} className={`flex items-center gap-1.5 px-2 py-1 rounded-md mb-0.5 text-[10px] font-medium ${active ? "bg-[#5B2D91] text-white" : "text-[#666]"}`}>
                <div className={`w-1.5 h-1.5 rounded-sm shrink-0 ${active ? "bg-white/60" : "bg-[#e0e0e0]"}`} />
                {label}
              </div>
            ))}
            {/* Fixes */}
            <div className="flex items-center justify-between px-2 py-1 rounded-md text-[10px] font-medium text-[#666] mb-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-sm bg-[#e0e0e0] shrink-0" />
                Fixes
              </div>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </div>
            {/* Crawlers Pro */}
            <div className="flex items-center justify-between px-2 py-1 rounded-md text-[10px] font-medium text-[#666] mb-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-sm bg-[#e0e0e0] shrink-0" />
                Crawlers
              </div>
              <span className="text-[8px] font-semibold px-1 py-0.5 rounded-full bg-amber-50 text-amber-600">Pro</span>
            </div>
            {/* Competitor Playbook Pro */}
            <div className="flex items-center justify-between px-2 py-1 rounded-md text-[10px] font-medium text-[#666] mb-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-sm bg-[#e0e0e0] shrink-0" />
                <span className="truncate">Competitor</span>
              </div>
              <span className="text-[8px] font-semibold px-1 py-0.5 rounded-full bg-amber-50 text-amber-600">Pro</span>
            </div>
            {/* Brand */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium text-[#666]">
              <div className="w-1.5 h-1.5 rounded-sm bg-[#e0e0e0] shrink-0" />
              Brand
            </div>
          </div>
          {/* Footer — Comly branding */}
          <div className="px-2 pb-2 pt-2 border-t border-[#f0f0f0]">
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md">
              <svg width="16" height="16" viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <path d="M50 4 C54 4 57 6 59.5 10 L93 68 C97 74 97 80 93.5 85 C90 90 84 93 77 93 L23 93 C16 93 10 90 6.5 85 C3 80 3 74 7 68 L40.5 10 C43 6 46 4 50 4Z" fill="#1a1a2e" />
                <path d="M28 72 C32 62 44 56 58 60 C66 62.5 70 67 68 70 C66 73 60 72 52 69 C44 66 36 68 32 74 C30 77 28 75 28 72Z" fill="url(#swooshGradHero)" />
                <defs>
                  <linearGradient id="swooshGradHero" x1="28" y1="65" x2="70" y2="65" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#5b21b6" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div>
                <p className="text-[10px] font-semibold text-[#0a0a0a]">Comly</p>
                <p className="text-[9px] text-[#aaaaaa]">Free plan</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar — matches real TopBar */}
          <div className="bg-white border-b border-[#e8e8e8] shrink-0 flex items-center gap-2 px-3 h-[36px]">
            <div className="flex items-center gap-1 text-[10px]">
              <span className="text-[#aaaaaa] font-medium">Comly</span>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
              <img src="https://www.google.com/s2/favicons?domain=notion.so&sz=16" alt="" width={10} height={10} className="rounded-sm" />
              <span className="font-semibold text-[#0a0a0a]">Notion</span>
            </div>
            <div className="w-px h-3 bg-[#e8e8e8]" />
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-600">
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              Score 68/100
            </div>
            <span className="text-[9px] text-[#aaaaaa]">Visibility <span className="text-[#0a0a0a] font-semibold">70%</span></span>
            <div className="ml-auto">
              <div className="flex items-center gap-1 px-2 py-1 rounded text-white text-[9px] font-semibold" style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}>
                Export
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden p-3 flex flex-col gap-3">

            {/* Stat cards row */}
            <div className="grid grid-cols-4 gap-2 shrink-0">
              {[
                { label: "Prompts Hit",       value: "7 / 10",     sym: "✓", color: "#10b981" },
                { label: "Direct Awareness",  value: "Recognized", sym: "✦", color: "#5B2D91" },
                { label: "Avg. Position",     value: "#2",         sym: "#", color: "#f59e0b" },
                { label: "Top Competitor",    value: "Confluence", sym: "↑", color: "#ef4444" },
              ].map(({ label, value, sym, color }) => (
                <div key={label} className="bg-white border border-[#e5e5e5] rounded-xl p-2 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-[11px] font-bold" style={{ background: `${color}18`, color }}>
                    {sym}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[7px] font-bold text-[#aaaaaa] uppercase tracking-wide leading-tight">{label}</p>
                    <p className="text-[10px] font-bold text-[#0a0a0a] leading-tight truncate">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-5 gap-3 flex-1 min-h-0 overflow-hidden">

              {/* Left col: chart + what AI says */}
              <div className="col-span-3 flex flex-col gap-3 min-h-0">
                {/* Visibility chart */}
                <div className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden shrink-0">
                  <div className="flex items-center px-3 pt-2.5 pb-1 gap-1">
                    {["Visibility", "Sentiment", "Position"].map((t, i) => (
                      <span key={t} className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${i === 0 ? "bg-[#5B2D91] text-white" : "text-[#6b6b6b]"}`}>{t}</span>
                    ))}
                  </div>
                  <div className="px-3 pb-1">
                    <span className="text-[20px] font-bold text-[#0a0a0a] leading-none">68%</span>
                    <span className="text-[10px] font-semibold text-emerald-500 ml-2">+68%</span>
                  </div>
                  <div className="px-2 pb-2">
                    <svg width="100%" height="60" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#5B2D91" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#5B2D91" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d={areaPath} fill="url(#hg)" />
                      <path d={linePath} fill="none" stroke="#5B2D91" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="3" fill="#5B2D91" stroke="white" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>

                {/* What AI says about you */}
                <div className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden flex-1 min-h-0 flex flex-col">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-[#e5e5e5] shrink-0">
                    <div>
                      <p className="text-[10px] font-semibold text-[#0a0a0a]">What AI says about you</p>
                      <p className="text-[9px] text-[#6b6b6b]">Notion appeared in 7 AI responses</p>
                    </div>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-[#5B2D91]/20" style={{ background: "#5B2D9108" }}>
                      <span className="text-[9px] font-semibold text-[#5B2D91]">7 mentions</span>
                    </div>
                  </div>
                  <div className="divide-y divide-[#f7f7f5] overflow-hidden">
                    {mentions.map((m, i) => (
                      <div key={i} className="flex gap-2 px-3 py-2">
                        <img src={`https://www.google.com/s2/favicons?domain=${m.modelDomain}&sz=16`} alt="" width={14} height={14} className="w-3.5 h-3.5 rounded-full border border-[#e5e5e5] shrink-0 mt-0.5" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className="text-[10px] font-bold text-[#0a0a0a]">{m.model}</span>
                            <span className={`text-[8px] font-semibold px-1 py-0.5 rounded-full ${m.color}`}>{m.label}</span>
                            {m.position && <span className="text-[8px] font-bold bg-indigo-50 text-indigo-600 px-1 py-0.5 rounded-full">#{m.position}</span>}
                            <span className="ml-auto text-[9px] text-[#aaaaaa] shrink-0">{m.date}</span>
                          </div>
                          <p className="text-[9px] font-medium text-[#0a0a0a] truncate">{m.prompt}</p>
                          <p className="text-[9px] text-[#6b6b6b] line-clamp-1">{m.preview}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-3 pb-2.5 pt-2 border-t border-[#f0f0f0] mt-auto shrink-0">
                    <div className="flex items-center justify-between px-2.5 py-2 rounded-lg text-white" style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}>
                      <span className="text-[9px] font-semibold">Want to change what AI says about you?</span>
                      <span className="text-[9px] font-bold opacity-80">→ llms.txt</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right col: competitors */}
              <div className="col-span-2 flex flex-col gap-3 min-h-0">
                <div className="bg-white border border-[#e5e5e5] rounded-xl p-3 flex-1 min-h-0 overflow-hidden">
                  <p className="text-[10px] font-semibold text-[#0a0a0a] mb-2">Competitor Ranking</p>
                  <div className="space-y-2">
                    {[
                      { name: "Confluence", domain: "confluence.atlassian.com", pct: 85, color: "#3b82f6" },
                      { name: "Notion",     domain: "notion.so",                pct: 68, color: "#5B2D91", you: true },
                      { name: "Coda",       domain: "coda.io",                  pct: 62, color: "#8b5cf6" },
                      { name: "Obsidian",   domain: "obsidian.md",              pct: 50, color: "#ec4899" },
                    ].map((r, i) => (
                      <div key={r.name} className={`flex items-center gap-1.5 ${r.you ? "bg-[#5B2D91]/[0.05] rounded-lg px-1.5 py-0.5 -mx-1" : ""}`}>
                        <span className="text-[8px] text-[#aaaaaa] w-3">{i + 1}</span>
                        <img src={`https://www.google.com/s2/favicons?domain=${r.domain}&sz=16`} alt="" width={11} height={11} className="rounded-sm shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        <span className="text-[9px] flex-1 text-[#0a0a0a] flex items-center gap-1">
                          {r.name}
                          {r.you && <span className="text-[7px] bg-[#5B2D91] text-white px-1 rounded-full">You</span>}
                        </span>
                        <div className="w-10 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.color }} />
                        </div>
                        <span className="text-[8px] text-[#6b6b6b] w-5 text-right">{r.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Prompts performance table — partially clipped to show depth */}
            <div className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden shrink-0">
              <div className="flex items-center justify-between px-3 py-2 bg-[#fafafa] border-b border-[#f0f0f0]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-[#aaaaaa]">Showing data for</span>
                  <img src="https://www.google.com/s2/favicons?domain=notion.so&sz=16" alt="" width={10} height={10} className="rounded-sm" />
                  <span className="text-[9px] font-semibold text-[#0a0a0a]">Notion</span>
                </div>
                <span className="text-[9px] font-semibold text-[#5B2D91]">View all →</span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f0f0f0]">
                    <th className="text-left px-3 py-1.5 text-[8px] font-bold text-[#aaaaaa] uppercase tracking-wider">Prompts</th>
                    <th className="px-3 py-1.5 text-[8px] font-bold text-[#aaaaaa] uppercase text-center">Visibility</th>
                    <th className="px-3 py-1.5 text-[8px] font-bold text-[#aaaaaa] uppercase text-center">Position</th>
                    <th className="px-3 py-1.5 text-[8px] font-bold text-[#aaaaaa] uppercase text-right">Model</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f7f7f5]">
                  {[
                    { label: "Discovery",    lc: "bg-blue-50 text-blue-600",       prompt: "Best project management tools for SaaS startups?", mentioned: true,  pos: 2,    model: "ChatGPT",   md: "chatgpt.com" },
                    { label: "Competitor",   lc: "bg-orange-50 text-orange-600",   prompt: "Notion vs Confluence for a remote team?",           mentioned: true,  pos: 1,    model: "Perplexity",md: "perplexity.ai" },
                    { label: "Direct Brand", lc: "bg-purple-50 text-purple-600",   prompt: "What is Notion and is it good for startups?",       mentioned: true,  pos: null, model: "Claude",    md: "claude.ai" },
                    { label: "Open Ended",   lc: "bg-[#f7f7f5] text-[#6b6b6b]",   prompt: "Top AI-powered productivity tools for teams?",      mentioned: false, pos: null, model: "Gemini",    md: "gemini.google.com" },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-[#fafafa] transition-colors">
                      <td className="px-3 py-2 max-w-0 w-[45%]">
                        <div className="flex items-start gap-1.5">
                          <span className={`shrink-0 text-[7px] font-semibold px-1 py-0.5 rounded-full mt-0.5 ${row.lc}`}>{row.label}</span>
                          <span className="text-[9px] text-[#0a0a0a] line-clamp-1">{row.prompt}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-semibold ${row.mentioned ? "bg-emerald-50 text-emerald-700" : "bg-[#f7f7f5] text-[#bbbbbb]"}`}>
                          {row.mentioned ? "100%" : "0%"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        {row.pos ? (
                          <span className="text-[9px] font-semibold text-[#6b6b6b] bg-[#f7f7f5] px-1.5 py-0.5 rounded">#{row.pos}</span>
                        ) : (
                          <span className="text-[#d0d0d0] text-[12px]">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <img src={`https://www.google.com/s2/favicons?domain=${row.md}&sz=16`} alt="" width={10} height={10} className="rounded-sm" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          <span className="text-[9px] text-[#6b6b6b]">{row.model}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [url, setUrl] = useState("");
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [navVisible, setNavVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const heroInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setNavVisible(true), 120);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    function onScroll() {
      const stepsEl = document.getElementById("how-it-works-steps");
      if (!stepsEl) return;
      const top = stepsEl.offsetTop;
      const bottom = top + stepsEl.offsetHeight - window.innerHeight;
      const y = window.scrollY;
      setNavVisible(y < top || y > bottom);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleAudit() {
    if (!url.trim()) return;
    let u = url.trim();
    if (!u.startsWith("http://") && !u.startsWith("https://")) u = "https://" + u;
    try { sessionStorage.setItem("comly_pending_url", u); } catch {}
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      router.push(`/audit?url=${encodeURIComponent(u)}`);
    } else {
      router.push(`/auth?url=${encodeURIComponent(u)}`);
    }
  }

  function scrollToAudit() {
    heroInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => heroInputRef.current?.focus(), 400);
  }

  return (
    <div className="bg-white text-[#0a0a0a] font-sans antialiased">
      <Navbar onCta={scrollToAudit} visible={navVisible} />

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════════════════ */}
      <section
        id="hero"
        className="relative min-h-screen pt-14 overflow-hidden [background:linear-gradient(to_bottom,#ffffff_0%,#ffffff_20%,#d4b8f5_50%,#a87be0_100%)]"
      >

        {/* LLM logos */}
        {[
          { src: "https://www.google.com/s2/favicons?domain=chatgpt.com&sz=64", alt: "ChatGPT", style: { top: "6%", left: "22%" } },
          { src: "https://www.google.com/s2/favicons?domain=claude.ai&sz=64", alt: "Claude", style: { top: "16%", left: "16%" } },
          { src: "https://www.google.com/s2/favicons?domain=gemini.google.com&sz=64", alt: "Gemini", style: { top: "6%", right: "22%" } },
          { src: "https://www.google.com/s2/favicons?domain=perplexity.ai&sz=64", alt: "Perplexity", style: { top: "16%", right: "16%" } },
        ].map(({ src, alt, style }) => (
          <LLMBadge key={alt} src={src} alt={alt} style={style} />
        ))}

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 lg:py-16 flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[54px] md:text-[72px] font-extrabold leading-[1.0] tracking-tight text-[#0a0a0a]"
          >
            Be the brand
          </motion.h1>
          <AnimatedText
            text="AI recommends"
            textClassName="text-[54px] md:text-[72px] font-extrabold leading-[1.0] tracking-tight text-[#0a0a0a]"
            underlineClassName="text-[#9E7AFF]"
            underlineDuration={1.5}
            className="mb-6"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-[#6b6b6b] leading-relaxed max-w-xl mb-10"
          >
            Comly helps you track your AI visibility and get recommended to millions searching for tools every day.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full max-w-md space-y-3"
          >
            <div className="flex gap-2 bg-white border border-[#e5e5e5] rounded-2xl p-1.5 shadow-sm">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b6b]" />
                <input
                  ref={heroInputRef}
                  type="url"
                  placeholder="https://yourcompany.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAudit(); }}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-transparent outline-none placeholder-[#c5c5c5]"
                />
              </div>
              <button
                onClick={handleAudit}
                disabled={!url.trim()}
                className="shrink-0 bg-[#5B2D91] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-[#4a2478] transition-all hover:scale-[1.02] disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5"
              >
                Try free <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-[#aaaaaa]">Results in 60 seconds</p>
          </motion.div>

          {/* Mobile simplified preview */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
            className="sm:hidden w-full mt-6 max-w-sm mx-auto bg-white rounded-2xl border border-[#e5e5e5] shadow-lg overflow-hidden"
          >
            <div className="px-5 py-4 flex items-center justify-between border-b border-[#f0f0f0]">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#aaaaaa]">AI Visibility Score</p>
                <p className="text-3xl font-black text-[#0a0a0a]">68<span className="text-lg text-[#aaaaaa] font-normal">/100</span></p>
              </div>
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}>
                <span className="text-white font-black text-lg">B+</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px bg-[#f0f0f0]">
              {([
                { label: "Prompts Hit",    value: "7 / 10",     color: "#10b981" },
                { label: "Avg. Position",  value: "#2",         color: "#f59e0b" },
                { label: "AI Models",      value: "4 tracked",  color: "#5B2D91" },
                { label: "Top Competitor", value: "Confluence", color: "#ef4444" },
              ] as const).map(({ label, value, color }) => (
                <div key={label} className="bg-white px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: "#aaaaaa" }}>{label}</p>
                  <p className="text-[15px] font-bold" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Desktop full preview */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
            className="hidden sm:block w-full mt-6"
          >
            <ContainerScroll>
              <HeroDashboardPreview />
            </ContainerScroll>
          </motion.div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          BENTO GRID — FEATURES
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#f7f7f5] py-24 px-6" id="features">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-14">
            <h2 className="text-[42px] font-bold tracking-tight text-[#0a0a0a]">
              Everything you need to dominate AI search
            </h2>
            <p className="mt-3 text-lg text-[#6b6b6b]">Five tools. One dashboard. Zero guesswork.</p>
          </FadeIn>

          <div className="grid grid-cols-6 gap-3">

            {/* Card 1 — top-left: Score big stat */}
            <FadeIn delay={0} className="col-span-full lg:col-span-2">
              <Card className="relative h-full overflow-hidden hover:shadow-md transition-all duration-200">
                <CardContent className="relative flex flex-col items-center justify-center py-10 px-6 h-full text-center">
                  <div className="relative flex items-center justify-center mb-6">
                    <svg className="text-[#e5e5e5] absolute inset-0 w-full h-full" viewBox="0 0 254 104" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M112.891 97.7022C140.366 97.0802 171.004 94.6715 201.087 87.5116C210.43 85.2881 219.615 82.6412 228.284 78.2473C232.198 76.3179 235.905 73.9942 239.348 71.3124C241.85 69.2557 243.954 66.7571 245.555 63.9408C249.34 57.3235 248.281 50.5341 242.498 45.6109C239.033 42.7237 235.228 40.2703 231.169 38.3054C219.443 32.7209 207.141 28.4382 194.482 25.534C184.013 23.1927 173.358 21.7755 162.64 21.2989C161.376 21.3512 160.113 21.181 158.908 20.796C158.034 20.399 156.857 19.1682 156.962 18.4535C157.115 17.8927 157.381 17.3689 157.743 16.9139C158.104 16.4588 158.555 16.0821 159.067 15.8066C160.14 15.4683 161.274 15.3733 162.389 15.5286C179.805 15.3566 196.626 18.8373 212.998 24.462C220.978 27.2494 228.798 30.4747 236.423 34.1232C240.476 36.1159 244.202 38.7131 247.474 41.8258C254.342 48.2578 255.745 56.9397 251.841 65.4892C249.793 69.8582 246.736 73.6777 242.921 76.6327C236.224 82.0192 228.522 85.4602 220.502 88.2924C205.017 93.7847 188.964 96.9081 172.738 99.2109C153.442 101.949 133.993 103.478 114.506 103.79C91.1468 104.161 67.9334 102.97 45.1169 97.5831C36.0094 95.5616 27.2626 92.1655 19.1771 87.5116C13.839 84.5746 9.1557 80.5802 5.41318 75.7725C-0.54238 67.7259 -1.13794 59.1763 3.25594 50.2827C5.82447 45.3918 9.29572 41.0315 13.4863 37.4319C24.2989 27.5721 37.0438 20.9681 50.5431 15.7272C68.1451 8.8849 86.4883 5.1395 105.175 2.83669C129.045 0.0992292 153.151 0.134761 177.013 2.94256C197.672 5.23215 218.04 9.01724 237.588 16.3889C240.089 17.3418 242.498 18.5197 244.933 19.6446C246.627 20.4387 247.725 21.6695 246.997 23.615C246.455 25.1105 244.814 25.5605 242.63 24.5811C230.322 18.9961 217.233 16.1904 204.117 13.4376C188.761 10.3438 173.2 8.36665 157.558 7.52174C129.914 5.70776 102.154 8.06792 75.2124 14.5228C60.6177 17.8788 46.5758 23.2977 33.5102 30.6161C26.6595 34.3329 20.4123 39.0673 14.9818 44.658C12.9433 46.8071 11.1336 49.1622 9.58207 51.6855C4.87056 59.5336 5.61172 67.2494 11.9246 73.7608C15.2064 77.0494 18.8775 79.925 22.8564 82.3236C31.6176 87.7101 41.3848 90.5291 51.3902 92.5804C70.6068 96.5773 90.0219 97.7419 112.891 97.7022Z" fill="currentColor" />
                    </svg>
                    <span className="relative text-5xl font-bold text-[#0a0a0a] px-8">68%</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-[#0a0a0a]">Visibility Score</h2>
                  <p className="text-sm text-[#6b6b6b] mt-2">One clear number that shows exactly where you stand in AI recommendations.</p>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Card 2 — top-middle: LLM tracking */}
            <FadeIn delay={0.05} className="col-span-full sm:col-span-3 lg:col-span-2">
              <Card className="relative h-full overflow-hidden hover:shadow-md transition-all duration-200">
                <CardContent className="pt-6">
                  <div className="relative mx-auto flex aspect-square size-28 rounded-full border border-[#e5e5e5] items-center justify-center before:absolute before:-inset-2 before:rounded-full before:border before:border-[#f0f0f0]">
                    <div className="grid grid-cols-2 gap-1.5 p-3">
                      {[
                        { domain: "chatgpt.com", name: "ChatGPT" },
                        { domain: "perplexity.ai", name: "Perplexity" },
                        { domain: "claude.ai", name: "Claude" },
                        { domain: "gemini.google.com", name: "Gemini" },
                      ].map((m) => (
                        <img key={m.name} src={`https://www.google.com/s2/favicons?domain=${m.domain}&sz=32`} alt={m.name} width={22} height={22} className="rounded-md" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 space-y-1.5 text-center">
                    <h2 className="text-lg font-semibold text-[#0a0a0a]">4 LLMs tracked</h2>
                    <p className="text-sm text-[#6b6b6b]">ChatGPT, Perplexity, Claude and Gemini — all in one dashboard, updated weekly.</p>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Card 3 — top-right: Fast audit */}
            <FadeIn delay={0.1} className="col-span-full sm:col-span-3 lg:col-span-2">
              <Card className="relative h-full overflow-hidden hover:shadow-md transition-all duration-200">
                <CardContent className="pt-6">
                  <div className="px-2">
                    <div className="flex items-center justify-between mb-2 text-[11px] text-[#6b6b6b]">
                      <span className="font-semibold text-[#0a0a0a]">Audit progress</span>
                      <span className="text-emerald-600 font-semibold">Done in 60s</span>
                    </div>
                    <svg className="w-full" viewBox="0 0 386 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="386" height="80" rx="8" fill="#f7f7f5" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M3 80C3 80 14 60 35 55C56 50 66 49 66 49C66 49 80 49 92 49C104 49 101 38 109 38C117 38 117 57 125 57C133 57 142 47 154 49C166 51 187 57 194 57C201 57 205 38 213 38C221 38 238 59 244 57C250 55 258 36 265 36C271 36 283 54 286 54C294 54 300 44 305 44C312 44 322 40 334 38C346 37 347 50 362 49C374 48 383 65 383 65L383 80Z" fill="url(#fg1)" />
                      <path className="text-[#5B2D91]" d="M3 75C3 75 15 57 36 52C57 47 67 46 67 46C67 46 80 46 91 46C103 46 100 35 108 35C116 35 117 53 125 53C133 53 142 43 153 46C165 48 186 53 193 53C200 53 205 35 213 35C221 35 238 55 244 53C250 51 258 32 265 32C271 32 283 51 286 51C294 51 300 41 305 41C312 41 321 37 333 35C345 33 347 47 362 46C377 45 383 63 383 63" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      <defs>
                        <linearGradient id="fg1" x1="3" y1="35" x2="3" y2="80" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#5B2D91" stopOpacity="0.12" />
                          <stop offset="1" stopColor="#5B2D91" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="mt-10 space-y-1.5 text-center">
                    <h2 className="text-lg font-semibold text-[#0a0a0a]">Audit in 60 seconds</h2>
                    <p className="text-sm text-[#6b6b6b]">Paste your URL. We scrape, analyze, score and return your full report automatically.</p>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Card 4 — bottom-left: Competitor intelligence + chart */}
            <FadeIn delay={0.15} className="col-span-full lg:col-span-3">
              <Card className="relative h-full overflow-hidden hover:shadow-md transition-all duration-200">
                <CardContent className="grid sm:grid-cols-2 pt-6 h-full">
                  <div className="relative z-10 flex flex-col justify-between space-y-10">
                    <div className="relative flex aspect-square size-11 rounded-full border border-[#e5e5e5] items-center justify-center before:absolute before:-inset-2 before:rounded-full before:border before:border-[#f0f0f0]">
                      <Search className="w-4 h-4 text-[#0a0a0a]" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-lg font-semibold text-[#0a0a0a]">Competitor Intelligence</h2>
                      <p className="text-sm text-[#6b6b6b]">See who AI recommends instead of you, how often, and exactly what to do about it.</p>
                    </div>
                  </div>
                  <div className="relative mt-6 sm:ml-6 border-l border-t border-[#f0f0f0] rounded-tl-xl overflow-hidden">
                    <div className="absolute left-3 top-2 flex gap-1">
                      <span className="block w-2 h-2 rounded-full border border-[#e5e5e5]" />
                      <span className="block w-2 h-2 rounded-full border border-[#e5e5e5]" />
                      <span className="block w-2 h-2 rounded-full border border-[#e5e5e5]" />
                    </div>
                    <div className="pt-7 px-3 pb-3 space-y-2">
                      {[
                        { name: "Confluence", domain: "confluence.atlassian.com", pct: 85, color: "#3b82f6" },
                        { name: "Notion",     domain: "notion.so",                pct: 68, color: "#5B2D91", you: true },
                        { name: "Coda",       domain: "coda.io",                  pct: 62, color: "#8b5cf6" },
                        { name: "Obsidian",   domain: "obsidian.md",              pct: 50, color: "#ec4899" },
                      ].map((r, i) => (
                        <div key={r.name} className={`flex items-center gap-2 ${r.you ? "bg-[#5B2D91]/[0.05] rounded-md px-1.5 py-0.5 -mx-1" : ""}`}>
                          <span className="text-[10px] text-[#aaaaaa] w-3">{i + 1}</span>
                          <img src={`https://www.google.com/s2/favicons?domain=${r.domain}&sz=16`} alt="" width={12} height={12} className="rounded-sm shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          <span className="text-xs flex-1 text-[#0a0a0a] flex items-center gap-1">
                            {r.name}
                            {r.you && <span className="text-[9px] bg-[#5B2D91] text-white px-1 rounded-full">You</span>}
                          </span>
                          <div className="w-14 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.color }} />
                          </div>
                          <span className="text-[10px] text-[#6b6b6b] w-7 text-right">{r.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Card 5 — bottom-right: Weekly tracking + AI models */}
            <FadeIn delay={0.2} className="col-span-full lg:col-span-3">
              <Card className="relative h-full overflow-hidden hover:shadow-md transition-all duration-200">
                <CardContent className="grid sm:grid-cols-2 pt-6 h-full">
                  <div className="relative z-10 flex flex-col justify-between space-y-10">
                    <div className="relative flex aspect-square size-11 rounded-full border border-[#e5e5e5] items-center justify-center before:absolute before:-inset-2 before:rounded-full before:border before:border-[#f0f0f0]">
                      <RefreshCw className="w-4 h-4 text-[#0a0a0a]" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-lg font-semibold text-[#0a0a0a]">Weekly automated tracking</h2>
                      <p className="text-sm text-[#6b6b6b]">Get score alerts by email whenever your AI visibility changes. Never miss a shift.</p>
                    </div>
                  </div>
                  <div className="before:bg-[#f0f0f0] relative mt-6 before:absolute before:inset-0 before:mx-auto before:w-px sm:-my-6 sm:-mr-6">
                    <div className="relative flex h-full flex-col justify-center space-y-5 py-6">
                      {[
                        { label: "Score improved +12pts", sub: "ChatGPT · Apr 20", color: "text-emerald-600", dot: "bg-emerald-500" },
                        { label: "New competitor detected", sub: "Perplexity · Apr 19", color: "text-orange-500", dot: "bg-orange-400" },
                        { label: "Weekly report ready", sub: "All models · Apr 14", color: "text-[#5B2D91]", dot: "bg-[#5B2D91]" },
                      ].map((item, i) => (
                        <div key={i} className={`relative flex items-center gap-3 ${i % 2 === 0 ? "w-[calc(50%+4rem)] justify-end" : "ml-[calc(50%-1rem)]"}`}>
                          {i % 2 === 0 ? (
                            <>
                              <div className="text-right">
                                <p className={`text-xs font-semibold ${item.color}`}>{item.label}</p>
                                <p className="text-[10px] text-[#aaaaaa]">{item.sub}</p>
                              </div>
                              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ring-4 ring-white ${item.dot}`} />
                            </>
                          ) : (
                            <>
                              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ring-4 ring-white ${item.dot}`} />
                              <div>
                                <p className={`text-xs font-semibold ${item.color}`}>{item.label}</p>
                                <p className="text-[10px] text-[#aaaaaa]">{item.sub}</p>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          WHY THIS MATTERS — before / after
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#f7f7f5] py-28 px-6">
        <div className="max-w-5xl mx-auto">

          {/* Heading */}
          <FadeIn className="text-center mb-16">
            <AnimatedWords
              text="From invisible to inevitable."
              className="text-[42px] md:text-[52px] font-bold tracking-tight text-[#0a0a0a] leading-[1.1]"
            />
            <p className="mt-4 text-lg text-[#6b6b6b] max-w-xl mx-auto leading-relaxed">
              The same question. Two very different answers. This is what earning a seat at the table looks like.
            </p>
          </FadeIn>

          {/* Before / After cards */}
          <BeforeAfterChats />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works">
        <HowItWorksAnimated />
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          PRICING
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-28 px-6 overflow-hidden" id="pricing">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-20">
            <h2 className="text-[42px] font-bold tracking-tight text-[#0a0a0a]">Simple pricing, no hidden fees</h2>
            <p className="mt-3 text-lg text-[#6b6b6b]">Start free. Upgrade when you&apos;re ready.</p>
          </FadeIn>

          {/* Staggered cards */}
          <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:items-end md:gap-0">

            {/* ── Free (left, tilted back) ── */}
            <motion.div
              initial={{ opacity: 0, y: 40, rotate: isMobile ? 0 : -6 }}
              whileInView={{ opacity: 1, y: 0, rotate: isMobile ? 0 : -6 }}
              viewport={{ once: true }}
              transition={{ type: "spring", duration: 0.6, delay: 0 }}
              className="relative z-10 w-full sm:w-72 rounded-2xl border border-[#e5e5e5] bg-white px-8 py-10 shadow-sm transition-transform hover:scale-105 md:-mr-4"
            >
              <div className="mb-1 text-base font-bold text-[#5B2D91]">Free</div>
              <div className="mb-1 text-4xl font-extrabold text-[#0a0a0a]">$0</div>
              <div className="mb-5 text-sm text-[#aaaaaa]">One audit, forever free</div>
              <ul className="mb-7 space-y-2.5 text-sm text-[#6b6b6b]">
                {["Full visibility audit", "Score out of 100", "Competitor ranking (one snapshot)", "To-do list with fixes", "llms.txt generator (one-time)"].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-emerald-500 shrink-0 mt-0.5">✔</span>{f}
                  </li>
                ))}
                {["Weekly automated tracking", "Score history", "Email alerts"].map((f) => (
                  <li key={f} className="flex items-start gap-2 opacity-30">
                    <span className="shrink-0 mt-0.5">✕</span>{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => heroInputRef.current?.focus()}
                className="w-full rounded-xl bg-[#5B2D91]/80 py-2.5 font-semibold text-white hover:bg-[#5B2D91] transition text-sm"
              >
                Run free audit →
              </button>
            </motion.div>

            {/* ── Starter (center, featured, elevated) ── */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", duration: 0.7, delay: 0.1 }}
              className="relative z-20 w-full sm:w-80 scale-105 rounded-3xl border-2 border-[#7c3aed]/60 bg-gradient-to-b from-[#5B2D91] to-[#3b1a70] px-10 py-14 text-white shadow-2xl shadow-[#5B2D91]/30 transition-transform hover:scale-[1.07] md:-mt-8"
            >
              {/* Best Deal badge */}
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-white px-5 py-1.5 text-[11px] font-extrabold text-[#5B2D91] shadow-lg whitespace-nowrap"
              >
                Most Popular
              </motion.div>
              <div className="mb-1 text-base font-bold text-white/70">Starter</div>
              <div className="mb-1 text-5xl font-black tracking-tight">$49<span className="text-xl font-normal text-white/50">/mo</span></div>
              <div className="mb-6 text-sm text-white/50">For growing SaaS founders</div>
              <ul className="mb-8 space-y-2.5 text-sm">
                {["Everything in Free", "Weekly automated audits", "Score history & trends", "Competitor tracking", "Email alerts on score changes", "llms.txt generator (weekly updated)", "ChatGPT tracking"].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-emerald-300 shrink-0 mt-0.5">✔</span>{f}
                  </li>
                ))}
              </ul>
              <button disabled className="w-full rounded-xl bg-white/10 border border-white/20 py-2.5 font-bold text-white/50 cursor-not-allowed text-sm">
                Coming soon
              </button>
              <p className="text-[11px] text-white/40 text-center mt-2">Early adopters get lifetime pricing lock 🔒</p>
            </motion.div>

            {/* ── Pro (right, tilted back) ── */}
            <motion.div
              initial={{ opacity: 0, y: 40, rotate: isMobile ? 0 : 6 }}
              whileInView={{ opacity: 1, y: 0, rotate: isMobile ? 0 : 6 }}
              viewport={{ once: true }}
              transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
              className="relative z-10 w-full sm:w-72 rounded-2xl border border-[#e5e5e5] bg-white px-8 py-10 shadow-sm transition-transform hover:scale-105 md:-ml-4"
            >
              <div className="mb-1 text-base font-bold text-[#5B2D91]">Pro</div>
              <div className="mb-1 text-4xl font-extrabold text-[#0a0a0a]">$249<span className="text-lg font-normal text-[#aaaaaa]">/mo</span></div>
              <div className="mb-5 text-sm text-[#aaaaaa]">For teams serious about AI</div>
              <ul className="mb-7 space-y-2.5 text-sm text-[#6b6b6b]">
                {["Everything in Starter", "4 AI models (ChatGPT, Claude, Perplexity, Gemini)", "Advanced competitor intelligence", "Sentiment analysis per mention", "Priority support", "Monthly strategy call", "Done-with-you implementation"].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-emerald-400 shrink-0 mt-0.5">✔</span>{f}
                  </li>
                ))}
              </ul>
              <button disabled className="w-full rounded-xl bg-[#5B2D91]/10 border border-[#5B2D91]/20 py-2.5 font-semibold text-[#5B2D91]/40 cursor-not-allowed text-sm">
                Coming soon
              </button>
            </motion.div>

          </div>

          <div className="mt-16 text-center">
            <p className="text-sm text-[#aaaaaa]">All plans include a free audit. No credit card required to start.</p>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════════
          FAQ
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-24 px-6 border-t border-[#f0f0f0]" id="faq">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20">

            {/* Left: heading */}
            <FadeIn className="lg:col-span-2 lg:sticky lg:top-32 lg:self-start">
              <p className="text-[11px] font-bold tracking-widest uppercase text-[#5B2D91] mb-4">FAQ</p>
              <h2 className="text-[36px] font-bold tracking-tight text-[#0a0a0a] leading-tight">
                Questions &<br />answers
              </h2>
              <p className="mt-4 text-[#6b6b6b] leading-relaxed">
                Everything you need to know about Comly and AI visibility.
              </p>
              <div className="mt-8 inline-flex items-center gap-2 text-sm text-[#5B2D91] font-semibold hover:opacity-70 transition-opacity cursor-pointer">
                <span>Still have questions?</span>
                <span>→</span>
              </div>
            </FadeIn>

            {/* Right: accordion */}
            <FadeIn delay={0.1} className="lg:col-span-3">
              <div className="space-y-3">
                {FAQ_ITEMS.map((item, i) => (
                  <FAQItem
                    key={i}
                    index={i}
                    q={item.q}
                    a={item.a}
                    isOpen={openFAQ === i}
                    toggle={() => setOpenFAQ(openFAQ === i ? null : i)}
                  />
                ))}
              </div>
            </FadeIn>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════════════════════════════════════ */}
      <section
        className="bg-[#5B2D91] py-28 px-6 relative overflow-hidden"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%23ffffff0d' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: "40px 40px",
        }}
      >
        <FadeIn className="max-w-2xl mx-auto text-center space-y-7">
          <h2 className="text-[48px] md:text-[56px] font-bold tracking-tight text-white leading-tight">
            Stop being invisible<br />to AI.
          </h2>
          <p className="text-[#c9a8e8] text-lg leading-relaxed">
            Millions of buyers ask ChatGPT for tools every day.<br />
            Make sure your brand is the answer.
          </p>
          <div>
            <button
              onClick={scrollToAudit}
              className="inline-flex items-center gap-2 bg-white text-[#0a0a0a] text-sm font-bold px-7 py-3.5 rounded-full hover:bg-gray-100 transition-all hover:scale-[1.02]"
            >
              Run your free audit <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[#c9a8e8] text-xs mt-3">Results in 60 seconds</p>
          </div>
        </FadeIn>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════════════ */}
      <footer className="bg-white border-t border-[#e5e5e5] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <ComlyLogo size={26} />
                <span className="font-bold text-[#0a0a0a] text-base">Comly</span>
              </div>
              <p className="text-sm text-[#6b6b6b] leading-relaxed">From invisible to inevitable.</p>
              <p className="text-xs text-[#aaaaaa] mt-4">© 2026 Comly AI</p>
            </div>

            <div>
              <p className="text-xs font-bold text-[#0a0a0a] uppercase tracking-wider mb-4">Company</p>
              <div className="space-y-2.5">
                {["About", "Contact", "Privacy", "Terms"].map((l) => (
                  <a key={l} href="#" className="block text-sm text-[#6b6b6b] hover:text-[#0a0a0a] transition-colors">
                    {l}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-[#0a0a0a] uppercase tracking-wider mb-4">Product</p>
              <div className="space-y-2.5">
                {([
                  ["Features",     "#features"],
                  ["How it works", "#how-it-works"],
                  ["Pricing",      "#pricing"],
                  ["Live Demo",    "#hero"],
                ] as [string, string][]).map(([l, h]) => (
                  <a key={l} href={h} className="block text-sm text-[#6b6b6b] hover:text-[#0a0a0a] transition-colors">
                    {l}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-[#0a0a0a] uppercase tracking-wider mb-4">Follow</p>
              <a
                href="https://x.com/FlippedRay"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[#6b6b6b] hover:text-[#0a0a0a] transition-colors"
              >
                Twitter / X <ExternalLink className="w-3 h-3" />
              </a>
              <p className="text-xs text-[#aaaaaa] mt-6">Built for the Digital Architect.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
