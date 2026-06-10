"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, getUserAudit } from "@/lib/supabase";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Globe, ArrowRight, Check, X, Menu, ChevronDown, Plus,
  BarChart3, TrendingUp, Target, Eye, Bell, Shield,
  ExternalLink, Search, RefreshCw, Users, Zap,
  CheckCircle2, XCircle, AlertCircle, Loader2, User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { HowItWorksAnimated } from "@/components/ui/animated-scroll";
import dynamic from "next/dynamic";

const DemoDashboard = dynamic(
  () => import("@/components/demo/demo-dashboard").then((m) => ({ default: m.DemoDashboard })),
  { ssr: false }
);
import { SmoothScroll } from "@/components/smooth-scroll";
import { useScroll } from "@/components/ui/use-scroll";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── CYCLING AI NAME (hero headline) ─────────────────────────────────────────

function TypewriterPhrase() {
  const phrases = ["AI answers", "AI citations", "AI overviews", "ChatGPT", "Perplexity", "Claude"];
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIdx];
    if (!isDeleting && displayed === current) {
      const t = setTimeout(() => setIsDeleting(true), 1800);
      return () => clearTimeout(t);
    }
    if (isDeleting && displayed === "") {
      setIsDeleting(false);
      setPhraseIdx(i => (i + 1) % phrases.length);
      return;
    }
    const t = setTimeout(() => {
      setDisplayed(isDeleting
        ? displayed.slice(0, -1)
        : current.slice(0, displayed.length + 1)
      );
    }, isDeleting ? 55 : 90);
    return () => clearTimeout(t);
  }, [displayed, isDeleting, phraseIdx]);

  return (
    <span>
      {displayed}
      <span className="inline-block w-[3px] h-[0.85em] bg-[#0a0a0a] ml-[2px] align-middle" style={{ animation: "blink 1s step-end infinite" }} />
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </span>
  );
}

// ─── COMLY LOGO ───────────────────────────────────────────────────────────────

function ComlyLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Rounded triangle body */}
      <path
        d="M50 4 C54 4 57 6 59.5 10 L93 68 C97 74 97 80 93.5 85 C90 90 84 93 77 93 L23 93 C16 93 10 90 6.5 85 C3 80 3 74 7 68 L40.5 10 C43 6 46 4 50 4Z"
        fill="#1a1a2e"
      />
      <path
        d="M28 72 C32 62 44 56 58 60 C66 62.5 70 67 68 70 C66 73 60 72 52 69 C44 66 36 68 32 74 C30 77 28 75 28 72Z"
        fill="#7c3aed"
      />
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

function LLMBadge({ src, alt, style, depth = 0, rotate = 0, mouseOffset = { x: 0, y: 0 } }: {
  src: string; alt: string; style: React.CSSProperties;
  depth?: number; rotate?: number; mouseOffset?: { x: number; y: number };
}) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

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
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={40}
          height={40}
          className={`w-10 h-10 rounded-xl shadow-lg transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
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
    <div className="flex items-center gap-1.5 py-1 px-1">
      <style>{`@keyframes typingBounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}`}</style>
      <style>{`@keyframes msgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-white/50 inline-block"
          style={{ animation: `typingBounce 1.1s ease-in-out ${i * 0.18}s infinite` }}
        />
      ))}
    </div>
  );
}

// ─── MULTI-LLM CONVERSATION SHOWCASE ─────────────────────────────────────────

interface LLMItem { num: string; label: string; desc: string; highlight?: boolean; }
interface LLMConvoData {
  id: string; name: string; version: string; domain: string; bg: string;
  question: string; response: string; beforeItems: LLMItem[]; afterItems: LLMItem[];
}
interface LLMState {
  showUser: boolean; showTyping: boolean;
  responseText: string; shownItems: number; showPill: boolean;
}

const LLM_CONVOS: LLMConvoData[] = [
  {
    id: "chatgpt", name: "ChatGPT", version: "GPT-4o", domain: "chatgpt.com", bg: "#212121",
    question: "Best project management tool for remote teams?",
    response: "Here are the top project management tools for remote teams:",
    beforeItems: [
      { num: "1", label: "Asana", desc: "task tracking & workflow automation" },
      { num: "2", label: "Monday.com", desc: "enterprise work OS" },
      { num: "3", label: "Notion", desc: "all-in-one workspace" },
    ],
    afterItems: [
      { num: "1", label: "Your Brand", desc: "best-in-class for distributed teams", highlight: true },
      { num: "2", label: "Asana", desc: "task tracking & workflow automation" },
      { num: "3", label: "Monday.com", desc: "enterprise work OS" },
    ],
  },
  {
    id: "claude", name: "Claude", version: "Sonnet 4", domain: "claude.ai", bg: "#1c1c1e",
    question: "Best email marketing platform for e-commerce brands?",
    response: "For e-commerce email marketing, these platforms stand out:",
    beforeItems: [
      { num: "1", label: "Klaviyo", desc: "revenue-focused e-commerce email" },
      { num: "2", label: "Mailchimp", desc: "beginner-friendly all-in-one" },
      { num: "3", label: "Drip", desc: "e-commerce CRM & automation" },
    ],
    afterItems: [
      { num: "1", label: "Your Brand", desc: "top-rated for e-commerce growth", highlight: true },
      { num: "2", label: "Klaviyo", desc: "revenue-focused e-commerce email" },
      { num: "3", label: "Mailchimp", desc: "beginner-friendly all-in-one" },
    ],
  },
  {
    id: "gemini", name: "Gemini", version: "2.0 Flash", domain: "gemini.google.com", bg: "#1a1b2e",
    question: "Best CRM software for B2B sales teams?",
    response: "Here are the top CRM solutions for B2B sales teams:",
    beforeItems: [
      { num: "1", label: "Salesforce", desc: "enterprise-grade CRM leader" },
      { num: "2", label: "HubSpot", desc: "all-in-one sales & marketing" },
      { num: "3", label: "Pipedrive", desc: "pipeline-focused for SMBs" },
    ],
    afterItems: [
      { num: "1", label: "Your Brand", desc: "rising favorite for B2B teams", highlight: true },
      { num: "2", label: "HubSpot", desc: "all-in-one sales & marketing" },
      { num: "3", label: "Salesforce", desc: "enterprise-grade CRM leader" },
    ],
  },
  {
    id: "perplexity", name: "Perplexity", version: "Pro", domain: "perplexity.ai", bg: "#18181b",
    question: "Best product analytics tool for SaaS companies?",
    response: "The best product analytics platforms for SaaS:",
    beforeItems: [
      { num: "1", label: "Mixpanel", desc: "event-based product analytics" },
      { num: "2", label: "Amplitude", desc: "behavioral analytics at scale" },
      { num: "3", label: "Heap", desc: "auto-capture user interactions" },
    ],
    afterItems: [
      { num: "1", label: "Your Brand", desc: "top pick for SaaS analytics", highlight: true },
      { num: "2", label: "Mixpanel", desc: "event-based product analytics" },
      { num: "3", label: "Amplitude", desc: "behavioral analytics at scale" },
    ],
  },
];

function LLMChatWindow({ model, s, items, variant = "before" }: {
  model: LLMConvoData; s: LLMState; items: LLMItem[]; variant?: "before" | "after";
}) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/5 flex flex-col" style={{ background: model.bg, minHeight: 360 }}>
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5 bg-black/20">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-1.5 bg-white/6 rounded-md px-3 py-0.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/25"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span className="text-[9px] text-white/30">{model.domain}</span>
          </div>
        </div>
      </div>
      {/* Model header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5">
        <img src={`https://www.google.com/s2/favicons?domain=${model.domain}&sz=64`} width={22} height={22} className="rounded-full shrink-0" alt={model.name} />
        <span className="text-[13px] font-semibold text-white/90">{model.name}</span>
        <span className="text-[10px] text-white/35 bg-white/8 px-2 py-0.5 rounded-full border border-white/10">{model.version}</span>
      </div>
      {/* Messages */}
      <div className="flex-1 px-5 py-4 space-y-4">
        <div className="flex justify-end" style={{ opacity: s.showUser ? 1 : 0, transform: s.showUser ? "translateY(0)" : "translateY(8px)", transition: "opacity 0.35s ease, transform 0.35s ease" }}>
          <div className="bg-white/10 rounded-2xl rounded-tr-md px-4 py-2.5 max-w-[85%]">
            <p className="text-[13px] text-white/90 leading-relaxed">{model.question}</p>
          </div>
        </div>
        {(s.showTyping || s.responseText.length > 0) && (
          <div className="flex items-start gap-3" style={{ animation: "msgIn 0.3s ease" }}>
            <img src={`https://www.google.com/s2/favicons?domain=${model.domain}&sz=64`} width={24} height={24} className="rounded-full shrink-0 mt-0.5" alt={model.name} />
            <div className="flex-1 space-y-2 min-w-0">
              {s.showTyping ? <TypingIndicator /> : (
                <>
                  <p className="text-[13px] text-white/80 leading-relaxed">
                    {s.responseText}
                    {s.responseText.length < model.response.length && <span className="inline-block w-0.5 h-3 bg-white/60 ml-0.5 animate-pulse align-middle" />}
                  </p>
                  {s.shownItems > 0 && (
                    <ol className="space-y-1.5 mt-1">
                      {items.slice(0, s.shownItems).map((item) => (
                        item.highlight ? (
                          <li key={item.num} className="flex items-start gap-2 text-[12px]" style={{ animation: "msgIn 0.25s ease" }}>
                            <span className="text-[#a78bfa] font-bold shrink-0 mt-0.5">{item.num}.</span>
                            <div className="flex-1 bg-[#5B2D91]/20 border border-[#7c3aed]/30 rounded-lg px-2.5 py-1.5">
                              <span className="font-bold text-white">{item.label}</span>
                              <span className="text-white/50 text-[11px]"> {item.desc}</span>
                              <span className="ml-2 text-[9px] font-bold text-[#a78bfa] bg-[#5B2D91]/30 px-1.5 py-0.5 rounded-full align-middle">★ top pick</span>
                            </div>
                          </li>
                        ) : (
                          <li key={item.num} className="flex items-baseline gap-2 text-[12px] text-white/65" style={{ animation: "msgIn 0.25s ease" }}>
                            <span className="text-white/30 font-medium shrink-0">{item.num}.</span>
                            <span><strong className="text-white/80 font-semibold">{item.label}</strong><span className="text-white/40"> {item.desc}</span></span>
                          </li>
                        )
                      ))}
                    </ol>
                  )}
                  {s.shownItems >= items.length && (
                    <div className="flex items-center gap-3 pt-1">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-white/25"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-white/25"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 0-2-2h3"/></svg>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
        {s.showPill && (
          variant === "after" ? (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2" style={{ animation: "msgIn 0.4s ease" }}>
              <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <span className="text-[11px] text-emerald-400 font-medium">Cited as #1 recommendation</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2" style={{ animation: "msgIn 0.4s ease" }}>
              <svg className="w-3.5 h-3.5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
              <span className="text-[11px] text-red-400 font-medium">Your brand: not mentioned</span>
            </div>
          )
        )}
      </div>
      {/* Input bar */}
      <div className="px-4 pb-4 pt-1">
        <div className="bg-white/6 rounded-xl px-3.5 py-2.5 flex items-center gap-2 border border-white/5">
          <span className="text-[11px] text-white/25 flex-1">Message {model.name}…</span>
          <button className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/40"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function LLMConversations() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [s, setS] = useState<LLMState>({ showUser: false, showTyping: false, responseText: "", shownItems: 0, showPill: false });
  const [sAfter, setSAfter] = useState<LLMState>({ showUser: false, showTyping: false, responseText: "", shownItems: 0, showPill: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setInView(true); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    let alive = true;
    const model = LLM_CONVOS[activeIdx];
    const reset: LLMState = { showUser: false, showTyping: false, responseText: "", shownItems: 0, showPill: false };
    (async () => {
      setS(reset);
      setSAfter(reset);
      await chatSleep(500);
      if (!alive) return;
      setS(p => ({ ...p, showUser: true }));
      setSAfter(p => ({ ...p, showUser: true }));
      await chatSleep(900);
      if (!alive) return;
      setS(p => ({ ...p, showTyping: true }));
      setSAfter(p => ({ ...p, showTyping: true }));
      await chatSleep(1400);
      if (!alive) return;
      setS(p => ({ ...p, showTyping: false }));
      setSAfter(p => ({ ...p, showTyping: false }));
      for (let i = 1; i <= model.response.length && alive; i++) {
        const text = model.response.slice(0, i);
        setS(p => ({ ...p, responseText: text }));
        setSAfter(p => ({ ...p, responseText: text }));
        await chatSleep(16);
      }
      if (!alive) return;
      const maxItems = Math.max(model.beforeItems.length, model.afterItems.length);
      for (let i = 1; i <= maxItems && alive; i++) {
        setS(p => ({ ...p, shownItems: i }));
        setSAfter(p => ({ ...p, shownItems: i }));
        await chatSleep(380);
      }
      await chatSleep(350);
      if (!alive) return;
      setS(p => ({ ...p, showPill: true }));
      setSAfter(p => ({ ...p, showPill: true }));
      await chatSleep(2800);
      if (!alive) return;
      setActiveIdx(i => (i + 1) % LLM_CONVOS.length);
    })();
    return () => { alive = false; };
  }, [inView, activeIdx]);

  return (
    <div ref={ref}>
      {/* Model tab row */}
      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {LLM_CONVOS.map((model, i) => (
          <button
            key={model.id}
            onClick={() => { setActiveIdx(i); }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border font-medium transition-all duration-200 ${
              i === activeIdx
                ? "bg-[#0a0a0a] border-[#0a0a0a] text-white shadow-lg scale-[1.03]"
                : "bg-white border-[#e5e5e5] text-[#555] hover:border-[#bbb] hover:shadow-sm"
            }`}
          >
            <span className={`flex items-center justify-center w-[22px] h-[22px] rounded-full shrink-0 ${i === activeIdx ? "bg-white" : ""}`}>
              <img src={`https://www.google.com/s2/favicons?domain=${model.domain}&sz=32`} width={16} height={16} className="rounded-full" alt={model.name} />
            </span>
            <span className="text-[13px]">{model.name}</span>
          </button>
        ))}
      </div>
      {/* Side-by-side windows stacked on mobile, side by side on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-red-500">Before Comly</span>
            <div className="flex-1 h-px bg-red-200" />
          </div>
          <LLMChatWindow model={LLM_CONVOS[activeIdx]} s={s} items={LLM_CONVOS[activeIdx].beforeItems} variant="before" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">After Comly</span>
            <div className="flex-1 h-px bg-emerald-200" />
          </div>
          <LLMChatWindow model={LLM_CONVOS[activeIdx]} s={sAfter} items={LLM_CONVOS[activeIdx].afterItems} variant="after" />
        </div>
      </div>
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

const CYCLING_MODELS = [
  { name: "ChatGPT",    domain: "chatgpt.com"        },
  { name: "Claude",     domain: "claude.ai"           },
  { name: "Perplexity", domain: "perplexity.ai"       },
  { name: "Gemini",     domain: "gemini.google.com"   },
];

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
    a: "Your visibility score (0-100) shows how often ChatGPT mentions your brand across targeted prompts in your category. 0 means never mentioned, 100 means mentioned in every prompt.",
  },
  {
    q: "How fast do I get results?",
    a: "Your first audit is ready in about 60 seconds. We scrape your site, extract your brand profile, generate and run prompts, and return your score all automatically.",
  },
  {
    q: "Do I need to set up anything?",
    a: "No. Just paste your URL. Comly automatically detects your brand, category, competitors and use cases. You can edit any field before running the audit.",
  },
  {
    q: "How is this different from SEO tools?",
    a: "SEO tools track Google rankings. Comly tracks AI mentions. 50% of AI citations don't overlap with Google's top results meaning your Google ranking doesn't predict your AI visibility.",
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

function Navbar({ onCta, visible = true, user, hasAudit, overDark = false }: {
  onCta: () => void;
  visible?: boolean;
  user?: { email: string; avatar_url?: string; name?: string } | null;
  hasAudit?: boolean;
  overDark?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useScroll(10);

  const links = [
    { label: "Home",         href: "#hero" },
    { label: "Features",     href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "FAQ",          href: "#faq" },
    { label: "Pricing",      href: "#pricing" },
    { label: "MCP",          href: "/mcp" },
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
        scrolled && !menuOpen && overDark
          ? "bg-black/60 border-white/10 backdrop-blur-lg md:top-4"
          : scrolled && !menuOpen
          ? "bg-white/95 supports-[backdrop-filter]:bg-white/80 border-[#e5e5e5] backdrop-blur-lg md:top-4 md:shadow-sm"
          : menuOpen
          ? "bg-white/95"
          : "bg-transparent border-transparent",
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
          <WispGhost size={28} />
          <span className={cn("font-bold text-base tracking-tight [font-family:var(--font-outfit)]", overDark && scrolled ? "text-white" : "text-[#0a0a0a]")}>Comly</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={buttonVariants({ variant: "ghost", size: "sm", className: overDark && scrolled ? "text-white/60 hover:text-white" : "text-[#6b6b6b] hover:text-[#0a0a0a]" })}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          {user && hasAudit ? (
            <a
              href="/audit"
              className="flex items-center gap-1.5 bg-[#5B2D91] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#4a2478] transition-all hover:scale-[1.02]"
            >
              Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </a>
          ) : user ? (
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#e5e5e5] shrink-0">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name ?? user.email} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#5B2D91] flex items-center justify-center text-white text-sm font-bold">
                  {(user.name ?? user.email)[0].toUpperCase()}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onCta}
              className="flex items-center gap-1.5 bg-[#5B2D91] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#4a2478] transition-all hover:scale-[1.02]"
            >
              Get started <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
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
            {user && hasAudit ? (
              <a
                href="/audit"
                className="w-full text-center bg-[#5B2D91] text-white text-sm font-semibold py-3 rounded-full hover:bg-[#4a2478] transition-colors"
              >
                Dashboard →
              </a>
            ) : !user ? (
              <button
                onClick={() => { onCta(); setMenuOpen(false); }}
                className="w-full bg-[#5B2D91] text-white text-sm font-semibold py-3 rounded-full hover:bg-[#4a2478] transition-colors"
              >
                Get started →
              </button>
            ) : null}
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

// ─── DEMO FRAME (scales the 1440×860 dashboard to fit the landing-page container) ─

const CHROME_H = 44;

function DemoFrame({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.72);

  useEffect(() => {
    function update() {
      if (containerRef.current) {
        setScale(containerRef.current.offsetWidth / 1440);
      }
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const DASH_H = 860;

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: CHROME_H + Math.round(DASH_H * scale),
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow: "none",
        overflow: "hidden",
        position: "relative",
        background: "#f5f5f5",
      }}
    >
      {/* Browser chrome bar */}
      <div
        style={{
          height: CHROME_H,
          background: "#f0f0f0",
          borderBottom: "1px solid #ddd",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 14px",
          flexShrink: 0,
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 6, marginRight: 4 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
          ))}
        </div>
        {/* URL bar */}
        <div
          style={{
            flex: 1,
            height: 26,
            background: "white",
            border: "1px solid #ddd",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            paddingLeft: 10,
            paddingRight: 10,
            gap: 6,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span style={{ fontSize: 12, color: "#555", fontFamily: "system-ui, sans-serif", letterSpacing: 0 }}>
            trycomly.com/demo/dashboard
          </span>
        </div>
        {/* Open full preview button */}
        <a
          href="/demo"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 20,
            background: "#1a1a1a",
            color: "white",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "system-ui, sans-serif",
            textDecoration: "none",
            whiteSpace: "nowrap",
            flexShrink: 0,
            letterSpacing: "-0.01em",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
          Open full preview
        </a>
      </div>

      {/* Scaled dashboard */}
      <div
        style={{
          width: 1440,
          height: DASH_H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "absolute",
          top: CHROME_H,
          left: 0,
        }}
      >
        {children}
      </div>
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
          trycomly.com/dashboard
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar matches real sidebar layout */}
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
          {/* Footer Comly branding */}
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
          {/* Top bar matches real TopBar */}
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

            {/* Prompts performance table partially clipped to show depth */}
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
                          <span className="text-[#d0d0d0] text-[12px]">-</span>
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

function CyclingModel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(i => (i + 1) % CYCLING_MODELS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const current = CYCLING_MODELS[index];

  return (
    <div className="relative overflow-hidden h-[62px] md:h-[82px] w-full flex items-center justify-center mb-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.name}
          initial={{ y: 50, opacity: 0, filter: "blur(8px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -50, opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.42, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute flex items-center gap-3 text-[54px] md:text-[72px] font-extrabold leading-none tracking-tight text-[#0a0a0a]"
        >
          <img
            src={`https://www.google.com/s2/favicons?domain=${current.domain}&sz=64`}
            alt={current.name}
            width={48}
            height={48}
            className="rounded-xl shrink-0"
          />
          {current.name}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── FEATURE CARD HELPERS ────────────────────────────────────────────────────

function FeatureBullets({ items }: { items: string[] }) {
  return (
    <div className="space-y-3.5">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-[#f3eeff] border border-[#e4d4ff] flex items-center justify-center shrink-0 mt-0.5">
            <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3l2 2 4-4" stroke="#5B2D91" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span className="text-[14px] text-[#4b5563] leading-snug">{item}</span>
        </div>
      ))}
    </div>
  );
}

function FeatureCardShell({ title, badge, children }: { title: string; badge?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e8e8] shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0] bg-gradient-to-r from-[#fdfcff] to-white">
        <p className="text-[13px] font-semibold text-[#0a0a0a]">{title}</p>
        {badge}
      </div>
      {children}
    </div>
  );
}

// Row 1 LLM tab switcher
const MENTIONS_DATA = {
  "chatgpt.com": [
    { snippet: "For team productivity, I'd recommend checking out…", pos: 2, score: 74 },
    { snippet: "When asked about collaboration tools, this brand…", pos: 1, score: 88 },
    { snippet: "The most AI-friendly knowledge base right now is…", pos: 3, score: 61 },
  ],
  "claude.ai": [
    { snippet: "Teams looking for a wiki-style workspace should…",    pos: 1, score: 91 },
    { snippet: "For documentation-heavy teams, I would suggest…",    pos: 2, score: 79 },
    { snippet: "In my experience recommending knowledge tools, this…", pos: 1, score: 85 },
  ],
  "gemini.google.com": [
    { snippet: "When it comes to AI-first knowledge tools, this…",   pos: 2, score: 68 },
    { snippet: "In the productivity space, one standout option is…", pos: 1, score: 83 },
    { snippet: "For teams needing structured documentation, I'd say…", pos: 3, score: 57 },
  ],
  "perplexity.ai": [
    { snippet: "The leading knowledge management platforms are…",    pos: 3, score: 55 },
    { snippet: "Based on recent reviews, this tool excels at…",      pos: 2, score: 72 },
    { snippet: "Sources consistently point to this as a top pick…",  pos: 2, score: 69 },
  ],
};
const LLM_TABS = [
  { domain: "chatgpt.com",       name: "ChatGPT"    },
  { domain: "claude.ai",         name: "Claude"     },
  { domain: "gemini.google.com", name: "Gemini"     },
  { domain: "perplexity.ai",     name: "Perplexity" },
];

const DEMO_PROMPTS = [
  {
    idx: "01", domain: "chatgpt.com", model: "ChatGPT",
    label: "Discovery", labelStyle: "bg-blue-50 text-blue-600 border-blue-100",
    mentioned: true, rank: 2,
    prompt: "What are the best AI visibility tools for marketing teams?",
    response: "For marketing teams tracking AI mentions, Comly provides detailed visibility scores across ChatGPT, Gemini, Claude and Perplexity making it easy to see exactly where your brand shows up.",
    competitors: ["Semrush", "Ahrefs"],
  },
  {
    idx: "02", domain: "claude.ai", model: "Claude",
    label: "Direct Brand", labelStyle: "bg-purple-50 text-purple-600 border-purple-100",
    mentioned: true, rank: 1,
    prompt: "How does Comly help improve AI search visibility?",
    response: "Comly offers a full audit across ChatGPT, Claude, Gemini and Perplexity giving brands a visibility score and the exact steps to rank higher in AI-generated answers.",
    competitors: ["BrandMentions", "Mention"],
  },
  {
    idx: "03", domain: "gemini.google.com", model: "Gemini",
    label: "Discovery", labelStyle: "bg-blue-50 text-blue-600 border-blue-100",
    mentioned: true, rank: 3,
    prompt: "Best tools to track brand mentions in AI responses?",
    response: "Several platforms now focus on AI visibility. Comly stands out for tracking mentions in real AI responses and providing an actionable score.",
    competitors: ["Ahrefs"],
  },
  {
    idx: "04", domain: "perplexity.ai", model: "Perplexity",
    label: "Competitor", labelStyle: "bg-orange-50 text-orange-600 border-orange-100",
    mentioned: false, rank: null,
    prompt: "Which tools help companies rank in AI-generated answers?",
    response: "",
    competitors: [],
  },
  {
    idx: "05", domain: "chatgpt.com", model: "ChatGPT",
    label: "Discovery", labelStyle: "bg-blue-50 text-blue-600 border-blue-100",
    mentioned: true, rank: 2,
    prompt: "How do I get my brand recommended by AI assistants?",
    response: "Getting your brand recommended by AI starts with making sure your content is structured and specific. Tools like Comly help you audit how AI models currently perceive your brand and surface the gaps.",
    competitors: ["Clearscope", "Surfer SEO"],
  },
  {
    idx: "06", domain: "gemini.google.com", model: "Gemini",
    label: "Open Ended", labelStyle: "bg-[#f7f7f5] text-[#6b6b6b] border-[#e5e5e5]",
    mentioned: false, rank: null,
    prompt: "What's the future of AI-powered marketing analytics?",
    response: "",
    competitors: [],
  },
  {
    idx: "07", domain: "claude.ai", model: "Claude",
    label: "Discovery", labelStyle: "bg-blue-50 text-blue-600 border-blue-100",
    mentioned: true, rank: 1,
    prompt: "Top marketing tools that use AI for brand visibility?",
    response: "Among the tools focused specifically on AI visibility, Comly is one of the most purpose-built it tracks how your brand appears across major AI models and gives you a clear score.",
    competitors: ["Mention", "Brand24"],
  },
  {
    idx: "08", domain: "perplexity.ai", model: "Perplexity",
    label: "Direct Brand", labelStyle: "bg-purple-50 text-purple-600 border-purple-100",
    mentioned: true, rank: 1,
    prompt: "Is Comly worth it for small businesses?",
    response: "For small businesses that rely on inbound discovery, Comly provides a clear picture of whether AI models are recommending them and what to fix if they're not.",
    competitors: [],
  },
];

function BrandReconCard() {
  const competitors = ["Coda", "Confluence", "Obsidian", "Slite"];
  const mentions = [
    { text: "\"Best all-in-one workspace for remote teams\"", source: "Reddit · r/SaaS" },
    { text: "\"Notion is our default recommendation for async teams\"", source: "G2 Review" },
    { text: "\"Top pick for knowledge management in 2025\"", source: "ProductHunt" },
  ];
  return (
    <DemoScreenShell wispPeek="center">
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-[#f0f0f0]">
        <p className="text-[12px] font-semibold text-[#0a0a0a]">Brand Profile</p>
        <span className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 font-semibold px-2 py-0.5 rounded-full">
          <CheckCircle2 className="w-2.5 h-2.5" /> Scanned
        </span>
      </div>

      {/* Identity */}
      <div className="px-4 py-3 flex items-start gap-3 border-b border-[#f0f0f0]">
        <img src="https://www.google.com/s2/favicons?domain=notion.so&sz=64" width={40} height={40} className="rounded-xl shrink-0 shadow-sm" alt="Notion" />
        <div>
          <p className="text-[13px] font-semibold text-[#0a0a0a]">Notion</p>
          <p className="text-[11px] text-[#6b6b6b] leading-relaxed mt-0.5">All-in-one workspace for notes, docs, wikis and project management. Used by millions of teams.</p>
          <div className="flex gap-1.5 mt-1.5">
            <span className="text-[9px] bg-[#f5f5f5] text-[#555] px-1.5 py-0.5 rounded-full font-medium">Productivity</span>
            <span className="text-[9px] bg-[#f5f5f5] text-[#555] px-1.5 py-0.5 rounded-full font-medium">Knowledge Base</span>
          </div>
        </div>
      </div>

      {/* Competitors */}
      <div className="px-4 py-2.5 border-b border-[#f0f0f0]">
        <p className="text-[9px] font-bold uppercase tracking-widest text-[#aaaaaa] mb-1.5">Competitors detected</p>
        <div className="flex flex-wrap gap-1.5">
          {competitors.map(c => (
            <span key={c} className="flex items-center gap-1 text-[10px] bg-white border border-[#e5e5e5] text-[#0a0a0a] px-2 py-0.5 rounded-full font-medium shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <img src={`https://www.google.com/s2/favicons?domain=${c.toLowerCase().replace(".","")}.com&sz=32`} alt={c} width={10} height={10} className="rounded-sm" />
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Web mentions */}
      <div className="px-4 py-2.5">
        <p className="text-[9px] font-bold uppercase tracking-widest text-[#aaaaaa] mb-1.5">Brand mentions found</p>
        <div className="space-y-1.5">
          {mentions.map((m, i) => (
            <div key={i} className="bg-[#fafafa] rounded-lg px-2.5 py-1.5 border border-[#f0f0f0]">
              <p className="text-[10px] text-[#0a0a0a] leading-snug">{m.text}</p>
              <p className="text-[9px] text-[#aaaaaa] mt-0.5">{m.source}</p>
            </div>
          ))}
        </div>
      </div>
    </DemoScreenShell>
  );
}

function QuestionDiscoveryCard() {
  const questions = [
    { q: "What's the best AI automation tool for ops teams?",       source: "Reddit · r/automation", meta: "1.2k upvotes" },
    { q: "Is there a Zapier alternative with real AI agents?",       source: "Quora",                 meta: "89 answers"   },
    { q: "Which workflow tool handles complex multi-step tasks?",    source: "G2 Reviews",            meta: "47 mentions"  },
    { q: "What does Notion do that Confluence can't?",              source: "Product Hunt",           meta: "discussion"   },
    { q: "Best automation platform for non-technical founders?",     source: "Reddit · r/SaaS",       meta: "634 upvotes"  },
  ];
  return (
    <DemoScreenShell wispPeek="left">
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-[#f0f0f0]">
        <p className="text-[12px] font-semibold text-[#0a0a0a]">Questions Discovered</p>
        <span className="text-[10px] bg-[#7C22FF]/10 text-[#7C22FF] font-semibold px-2 py-0.5 rounded-full">23 found</span>
      </div>
      <p className="px-4 pt-2.5 pb-1 text-[9px] font-bold uppercase tracking-widest text-[#aaaaaa]">From reviews &amp; conversations across the web</p>
      <div className="px-3 pb-3 space-y-1.5">
        {questions.map((item, i) => (
          <div key={i} className="bg-[#fafafa] rounded-xl border border-[#f0f0f0] px-3 py-2">
            <p className="text-[11px] text-[#0a0a0a] font-medium leading-snug mb-1">&ldquo;{item.q}&rdquo;</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-[#7C22FF] font-semibold">{item.source}</span>
              <span className="text-[9px] text-[#aaaaaa]">· {item.meta}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-2.5 border-t border-[#f0f0f0] flex items-center justify-between">
        <span className="text-[10px] text-[#6b6b6b]">Prompts ready to fire</span>
        <span className="text-[11px] font-bold text-[#0a0a0a]">23 prompts · 18 sources</span>
      </div>
    </DemoScreenShell>
  );
}

function PromptTrackingScreenshot() {
  const [openSet, setOpenSet] = useState<Set<string>>(new Set(["02", "05"]));
  function toggle(idx: string) {
    setOpenSet((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }

  return (
    <DemoScreenShell wispPeek="center">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <p className="text-[12px] font-semibold text-[#0a0a0a]">Prompt Breakdown</p>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-semibold">
          <CheckCircle2 className="w-2.5 h-2.5" />
          7 / 25 mentioned
        </div>
      </div>

      {/* Scrollable prompt list */}
      <div className="overflow-y-auto max-h-[400px] px-3 pb-3 space-y-1.5" style={{ scrollbarWidth: "thin", scrollbarColor: "#e5e5e5 transparent" }}>
        {DEMO_PROMPTS.map((p) => {
          const isOpen = openSet.has(p.idx);
          return (
            <div
              key={p.idx}
              className={`rounded-xl border overflow-hidden transition-all cursor-pointer ${
                isOpen ? "border-[#5B2D91]/25 bg-white" : p.mentioned ? "border-[#e5e5e5] bg-white hover:bg-[#fafafa]" : "border-[#f0f0f0] bg-white hover:bg-[#fafafa]"
              }`}
              style={{ boxShadow: isOpen ? "0 2px 12px rgba(91,45,145,0.08)" : "0 1px 4px rgba(0,0,0,0.04)" }}
              onClick={() => toggle(p.idx)}
            >
              {/* Row header */}
              <div className="flex items-center gap-2.5 px-3 py-2.5">
                <div className="flex flex-col items-center gap-0.5 shrink-0">
                  <span className="text-[9px] font-bold text-[#cccccc]">{p.idx}</span>
                  {p.mentioned
                    ? <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    : <XCircle className="w-3 h-3 text-[#d0d0d0]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <img src={`https://www.google.com/s2/favicons?domain=${p.domain}&sz=32`} alt={p.model} width={11} height={11} className="rounded-sm shrink-0" />
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${p.labelStyle}`}>{p.label}</span>
                    {p.mentioned
                      ? <span className="text-[9px] font-semibold text-emerald-600">Mentioned · #{p.rank}</span>
                      : <span className="text-[9px] text-[#aaaaaa]">Not mentioned</span>}
                  </div>
                  <p className={`text-[11px] font-medium leading-snug truncate ${p.mentioned ? "text-[#0a0a0a]" : "text-[#6b6b6b]"}`}>
                    &ldquo;{p.prompt}&rdquo;
                  </p>
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className={`w-3 h-3 shrink-0 ${isOpen ? "text-[#5B2D91]" : "text-[#cccccc]"}`} />
                </motion.div>
              </div>

              {/* Expanded response */}
              <AnimatePresence initial={false}>
                {isOpen && p.response && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="border-t border-[#f0f0f0] bg-[#fafafa]">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-[#f0f0f0]">
                        <img src={`https://www.google.com/s2/favicons?domain=${p.domain}&sz=32`} alt={p.model} width={12} height={12} className="rounded-sm" />
                        <span className="text-[10px] font-semibold text-[#0a0a0a]">{p.model}</span>
                      </div>
                      <div className="px-3 py-2.5">
                        <p className="text-[11px] text-[#3a3a3a] leading-relaxed">
                          {p.response.split("Comly").map((part, i, arr) =>
                            i < arr.length - 1
                              ? <span key={i}>{part}<mark className="bg-[#5B2D91]/10 text-[#5B2D91] font-semibold rounded px-0.5 not-italic">Comly</mark></span>
                              : <span key={i}>{part}</span>
                          )}
                        </p>
                      </div>
                      {p.competitors.length > 0 && (
                        <div className="px-3 pb-2.5">
                          <p className="text-[9px] font-bold text-[#aaaaaa] uppercase tracking-widest mb-1">Also mentioned</p>
                          <div className="flex gap-1">
                            {p.competitors.map((c) => (
                              <span key={c} className="text-[9px] px-1.5 py-0.5 rounded-full border bg-white text-[#6b6b6b] border-[#e5e5e5] font-medium">{c}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </DemoScreenShell>
  );
}

function GapReportCard() {
  const competitors = [
    { name: "Notion",     domain: "notion.so",   pct: 78, you: false },
    { name: "Coda",       domain: "coda.io",     pct: 61, you: false },
    { name: "Your Brand", domain: "",            pct: 34, you: true  },
    { name: "Obsidian",   domain: "obsidian.md", pct: 28, you: false },
  ];
  const reasons = [
    { text: "No llms.txt found on your domain", icon: "✗" },
    { text: "Competitors have 3× more AI citations", icon: "✗" },
    { text: "Category page isn't AI-readable", icon: "✗" },
  ];
  return (
    <DemoScreenShell wispPeek="right">
      <div className="px-4 pt-4 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#aaaaaa]">AI Visibility</p>
            <p className="text-[15px] font-bold text-[#0a0a0a] leading-tight">Competitor Ranking</p>
          </div>
          <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            Invisible
          </span>
        </div>

        {/* Competitors */}
        <div className="space-y-1.5 mb-4">
          {competitors.map((c, i) => (
            <div key={c.name} className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 ${c.you ? "bg-[#5B2D91]/[0.07] border border-[#5B2D91]/15 shadow-[0_0_0_1px_rgba(91,45,145,0.08)]" : "bg-[#fafafa] border border-[#f0f0f0]"}`}>
              <span className="text-[10px] text-[#cccccc] w-3 shrink-0 font-semibold">{i + 1}</span>
              {c.domain ? (
                <img src={`https://www.google.com/s2/favicons?domain=${c.domain}&sz=32`} width={16} height={16} className="rounded-md shrink-0" alt="" />
              ) : (
                <span className="w-4 h-4 rounded-md bg-[#5B2D91] shrink-0 flex items-center justify-center text-white text-[8px] font-bold">Y</span>
              )}
              <span className={`text-[12px] flex-1 font-semibold ${c.you ? "text-[#5B2D91]" : "text-[#0a0a0a]"}`}>{c.name}</span>
              <div className="w-24 h-2 bg-[#efefef] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{
                  width: `${c.pct}%`,
                  background: c.you ? "linear-gradient(90deg,#a855f7,#5B2D91)" : "#d1d5db"
                }} />
              </div>
              <span className={`text-[11px] font-bold w-8 text-right ${c.you ? "text-[#5B2D91]" : "text-[#aaaaaa]"}`}>{c.pct}%</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-[#f0f0f0] mb-3" />

        {/* Reasons */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#bbbbbb] mb-2">Why you&apos;re invisible</p>
        <div className="space-y-1.5">
          {reasons.map((r, i) => (
            <div key={i} className="flex items-center gap-2 bg-red-50/60 border border-red-100 rounded-lg px-2.5 py-1.5">
              <span className="text-[10px] font-bold text-red-400 shrink-0">{r.icon}</span>
              <span className="text-[11px] text-[#666] leading-snug">{r.text}</span>
            </div>
          ))}
        </div>
      </div>
    </DemoScreenShell>
  );
}

function SourceTakeoverCard() {
  const sources = [
    { domain: "reddit.com",   label: "Reddit",   note: "r/automation · r/SaaS",        status: "Replying",   active: true  },
    { domain: "quora.com",    label: "Quora",    note: "B2B automation questions",      status: "Replying",   active: true  },
    { domain: "linkedin.com", label: "LinkedIn", note: "Thought-leadership post",       status: "Writing",    active: true  },
    { domain: "medium.com",   label: "Medium",   note: "Comparison article",            status: "Writing",    active: true  },
    { domain: "g2.com",       label: "G2",       note: "Review page optimisation",      status: "Queued",     active: false },
  ];
  return (
    <DemoScreenShell wispPeek="right">
      <div className="px-4 pt-3 pb-2 border-b border-[#f0f0f0]">
        <p className="text-[12px] font-semibold text-[#0a0a0a]">AI Sources Getting You In</p>
        <p className="text-[10px] text-[#6b6b6b] mt-0.5">Sources Wisp found in AI answers · now placing you inside each</p>
      </div>
      <div className="px-3 py-2.5 space-y-1.5">
        {sources.map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#f0f0f0] px-3 py-2 flex items-center gap-2.5">
            <img src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=32`} alt={s.label} width={14} height={14} className="rounded-sm shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-[#0a0a0a]">{s.label}</p>
              <p className="text-[9px] text-[#aaaaaa] truncate">{s.note}</p>
            </div>
            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border shrink-0 ${
              s.status === "Replying" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
              s.status === "Writing"  ? "bg-[#7C22FF]/10 text-[#7C22FF] border-[#7C22FF]/20" :
                                        "bg-[#f5f5f5] text-[#aaaaaa] border-[#e5e5e5]"
            }`}>{s.status}</span>
          </div>
        ))}
      </div>
      <div className="px-4 py-2 border-t border-[#f0f0f0] bg-[#fafafa] rounded-b-2xl">
        <p className="text-[10px] text-[#6b6b6b]"><span className="font-semibold text-[#7C22FF]">4 of 5</span> sources active Wisp is placing you inside each one</p>
      </div>
    </DemoScreenShell>
  );
}

function SourceInfiltratorCard() {
  const platforms = [
    {
      domain: "reddit.com", label: "Reddit",
      items: [
        { title: "Best AI automation tools for ops teams?",   sub: "r/automation · 2.1k upvotes", status: "Replying" },
        { title: "Zapier vs everything else in 2025",          sub: "r/SaaS · 847 upvotes",        status: "Queued"   },
      ],
    },
    {
      domain: "quora.com", label: "Quora",
      items: [
        { title: "What's the best workflow automation for B2B?", sub: "89 answers · trending", status: "Replying" },
        { title: "Is Zapier still worth it in 2025?",            sub: "34 answers",            status: "Queued"   },
      ],
    },
    {
      domain: "linkedin.com", label: "LinkedIn",
      items: [
        { title: "Drafting thought-leadership post on AI automation", sub: "Targeting: B2B ops · 12k reach est.", status: "Writing" },
      ],
    },
  ];
  return (
    <DemoScreenShell wispPeek="left-far">
      <div className="px-4 pt-3 pb-2 border-b border-[#f0f0f0]">
        <p className="text-[12px] font-semibold text-[#0a0a0a]">Source Infiltration</p>
        <p className="text-[10px] text-[#6b6b6b] mt-0.5">Wisp getting you placed where AI learns from</p>
      </div>
      <div className="px-3 py-2.5 space-y-3">
        {platforms.map((platform, pi) => (
          <div key={pi}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <img src={`https://www.google.com/s2/favicons?domain=${platform.domain}&sz=32`} alt={platform.label} width={12} height={12} className="rounded-sm" />
              <p className="text-[10px] font-bold text-[#0a0a0a]">{platform.label}</p>
            </div>
            <div className="space-y-1">
              {platform.items.map((item, ii) => (
                <div key={ii} className="flex items-start gap-2 bg-[#fafafa] rounded-lg border border-[#f0f0f0] px-2.5 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-[#0a0a0a] font-medium leading-snug truncate">{item.title}</p>
                    <p className="text-[9px] text-[#aaaaaa] mt-0.5">{item.sub}</p>
                  </div>
                  <span className={`text-[9px] font-semibold shrink-0 px-1.5 py-0.5 rounded-full border ${
                    item.status === "Replying" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                    item.status === "Writing"  ? "bg-[#7C22FF]/10 text-[#7C22FF] border-[#7C22FF]/20" :
                                                 "bg-[#f5f5f5] text-[#aaaaaa] border-[#e5e5e5]"
                  }`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DemoScreenShell>
  );
}

// Row 2 Animated competitor bars
const COMPETITOR_DATA = [
  { rank: 1, name: "Confluence", domain: "confluence.atlassian.com", pct: 85, pos: "1.2", you: false },
  { rank: 2, name: "Your brand", domain: "trycomly.com",             pct: 68, pos: "2.1", you: true  },
  { rank: 3, name: "Coda",       domain: "coda.io",                  pct: 62, pos: "2.8", you: false },
  { rank: 4, name: "Obsidian",   domain: "obsidian.md",              pct: 50, pos: "3.4", you: false },
];

const COMP_ROWS = [
  { name: "Asana",     domain: "asana.com",     vis: 78, color: "#ef4444", you: false },
  { name: "Monday",    domain: "monday.com",    vis: 63, color: "#f59e0b", you: false },
  { name: "ClickUp",   domain: "clickup.com",   vis: 51, color: "#7c3aed", you: false },
  { name: "Trello",    domain: "trello.com",    vis: 34, color: "#3b82f6", you: false },
  { name: "Jira",      domain: "atlassian.com", vis: 21, color: "#10b981", you: false },
];

function DemoScreenShell({ hint, hintSide = "left", wispPeek, children }: { hint?: string; hintSide?: "left" | "right"; wispPeek?: "center" | "left" | "left-far" | "right" | "right-far"; children: React.ReactNode }) {
  const wispStyle: React.CSSProperties = {
    position: "absolute",
    top: -40,
    height: 44,
    width: 78,
    overflow: "hidden",
    pointerEvents: "none",
    zIndex: 10,
    ...(wispPeek === "center"     && { left: "50%", transform: "translateX(-50%)" }),
    ...(wispPeek === "left"       && { left: 32 }),
    ...(wispPeek === "left-far"   && { left: 8 }),
    ...(wispPeek === "right"      && { right: 32 }),
    ...(wispPeek === "right-far"  && { right: 8 }),
  };
  return (
    <div className="relative">
      {wispPeek ? (
        <div style={wispStyle}>
          <WispGhost size={78} />
        </div>
      ) : hint ? (
        <div className={`absolute -top-6 ${hintSide === "left" ? "left-0" : "right-0"} flex items-center gap-1 pointer-events-none select-none z-10`}>
          {hintSide === "right" && <p className="text-[11.5px] text-[#5B2D91]/50 whitespace-nowrap" style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>{hint}</p>}
          <svg width="14" height="18" viewBox="0 0 14 18" fill="none" style={hintSide === "right" ? { transform: "scaleX(-1)" } : {}}>
            <path d="M2 1 Q2 15 11 15" stroke="#5B2D91" strokeWidth="1.2" strokeOpacity="0.4" fill="none" strokeLinecap="round"/>
            <path d="M8 12 L11 15 L8 18" stroke="#5B2D91" strokeWidth="1.2" strokeOpacity="0.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {hintSide === "left" && <p className="text-[11.5px] text-[#5B2D91]/50 whitespace-nowrap" style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>{hint}</p>}
        </div>
      ) : null}
      <div className="rounded-2xl border border-[#e0e0e0] shadow-[0_12px_48px_rgba(0,0,0,0.13)] overflow-hidden bg-white">
        <div className="bg-[#f5f5f5] border-b border-[#e0e0e0] px-3 py-2 flex items-center gap-2.5">
          <div className="flex gap-1.5 shrink-0">
            <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
            <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
            <div className="w-2 h-2 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 bg-white border border-[#e0e0e0] rounded px-2.5 py-0.5 text-[10px] text-[#aaaaaa] truncate">app.trycomly.com/audit</div>
        </div>
        {children}
      </div>
    </div>
  );
}

function CompetitorRankCard() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const maxVis = Math.max(...COMP_ROWS.map(r => r.vis));
  return (
    <DemoScreenShell wispPeek="right-far">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
        <div>
          <p className="text-[12px] font-semibold text-[#0a0a0a]">Competitors</p>
          <p className="text-[11px] text-[#6b6b6b] mt-0.5">Based on AI citations</p>
        </div>
        <span className="text-[11px] font-semibold text-[#6b6b6b] bg-[#f7f7f5] border border-[#e5e5e5] px-2.5 py-1 rounded-full">5 brands</span>
      </div>
      <div className="grid grid-cols-[16px_1fr_90px] gap-2 px-4 py-2 border-b border-[#f0f0f0] bg-[#fafafa]">
        <span className="text-[9px] font-bold text-[#aaaaaa] uppercase tracking-wide">#</span>
        <span className="text-[9px] font-bold text-[#aaaaaa] uppercase tracking-wide">Brand</span>
        <span className="text-[9px] font-bold text-[#aaaaaa] uppercase tracking-wide text-right">Visibility</span>
      </div>
      <div ref={ref} className="divide-y divide-[#f7f7f5]">
        {COMP_ROWS.map((row, i) => (
          <div key={row.name} className={`grid grid-cols-[16px_1fr_90px] gap-2 items-center px-4 py-2.5 hover:bg-[#fafafa] transition-colors ${row.you ? "bg-[#5B2D91]/[0.02]" : ""}`}>
            <span className={`text-[11px] font-semibold ${row.you ? "text-[#5B2D91]" : "text-[#aaaaaa]"}`}>{i + 1}</span>
            <div className="flex items-center gap-2 min-w-0">
              {row.you
                ? <div className="w-[22px] h-[22px] rounded-md shrink-0 border border-[#e4d4ff] overflow-hidden flex items-center justify-center bg-[#1a1a2e]"><ComlyLogo size={16} /></div>
                : <img src={`https://www.google.com/s2/favicons?domain=${row.domain}&sz=32`} width={22} height={22} className="rounded-md shrink-0 border border-[#e5e5e5]" alt={row.name} />
              }
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <a href={`https://${row.domain}`} target="_blank" rel="noopener noreferrer"
                    className={`text-[12px] font-semibold truncate hover:underline ${row.you ? "text-[#5B2D91]" : "text-[#0a0a0a]"}`}>{row.name}</a>
                  {row.you && <span className="shrink-0 text-[9px] font-bold bg-[#5B2D91]/10 text-[#5B2D91] px-1.5 py-0.5 rounded-full">You</span>}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-[12px] font-bold ${row.you ? "text-[#5B2D91]" : "text-[#0a0a0a]"}`}>{row.vis}%</span>
              <div className="mt-1 h-[3px] bg-[#f0f0f0] rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ backgroundColor: row.color }}
                  initial={{ width: 0 }} animate={{ width: inView ? `${(row.vis / maxVis) * 100}%` : 0 }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </DemoScreenShell>
  );
}

// Row 3 Reddit / Quora toggle
const THREADS = {
  reddit: [
    { sub: "r/SaaS",        title: "Best AI-powered tools for marketing teams?",          votes: "3.1k", comments: 52 },
    { sub: "r/Entrepreneur", title: "ChatGPT keeps recommending my competitor why?",   votes: "5.4k", comments: 89 },
    { sub: "r/startups",    title: "Which tools are AI models actually recommending?",    votes: "2.8k", comments: 41 },
  ],
  quora: [
    { sub: "Quora",         title: "Which tools help brands rank in ChatGPT responses?", votes: "1.8k", comments: 23 },
    { sub: "Quora",         title: "How do I get my product mentioned by AI models?",    votes: "3.2k", comments: 37 },
    { sub: "Quora",         title: "What makes a brand show up in Perplexity answers?",  votes: "1.1k", comments: 18 },
  ],
};

const DEMO_THREADS = {
  reddit: [
    { id: "t1", sub: "r/SaaS",         title: "Best AI-powered tools for marketing teams?",          votes: "3.1k", comments: 52, tag: "Recommendation", tagColor: "#f59e0b", tagBg: "#fffbeb", scoreLabel: "HIGH", scoreColor: "text-emerald-600 bg-emerald-50" },
    { id: "t2", sub: "r/Entrepreneur",  title: "ChatGPT keeps recommending my competitor why?",    votes: "5.4k", comments: 89, tag: "Pain point",      tagColor: "#ef4444", tagBg: "#fff1f2", scoreLabel: "HIGH", scoreColor: "text-emerald-600 bg-emerald-50" },
    { id: "t3", sub: "r/startups",      title: "Which tools are AI models actually recommending?",   votes: "2.8k", comments: 41, tag: "Recommendation", tagColor: "#f59e0b", tagBg: "#fffbeb", scoreLabel: "HIGH", scoreColor: "text-emerald-600 bg-emerald-50" },
    { id: "t4", sub: "r/marketing",     title: "How do I get my SaaS mentioned in ChatGPT answers?", votes: "1.9k", comments: 28, tag: "How-to",          tagColor: "#0ea5e9", tagBg: "#f0f9ff", scoreLabel: "MED",  scoreColor: "text-amber-600 bg-amber-50"   },
  ],
  quora: [
    { id: "q1", sub: "Quora", title: "Which tools help brands rank in ChatGPT responses?",  votes: "1.8k", comments: 23, tag: "Recommendation", tagColor: "#f59e0b", tagBg: "#fffbeb", scoreLabel: "HIGH", scoreColor: "text-emerald-600 bg-emerald-50" },
    { id: "q2", sub: "Quora", title: "How do I get my product mentioned by AI models?",     votes: "3.2k", comments: 37, tag: "How-to",          tagColor: "#0ea5e9", tagBg: "#f0f9ff", scoreLabel: "HIGH", scoreColor: "text-emerald-600 bg-emerald-50" },
    { id: "q3", sub: "Quora", title: "What makes a brand show up in Perplexity answers?",   votes: "1.1k", comments: 18, tag: "Discussion",      tagColor: "#6b7280", tagBg: "#f9fafb", scoreLabel: "MED",  scoreColor: "text-amber-600 bg-amber-50"   },
    { id: "q4", sub: "Quora", title: "AI vs SEO which drives more discovery in 2025?",    votes: "4.1k", comments: 64, tag: "Discussion",      tagColor: "#6b7280", tagBg: "#f9fafb", scoreLabel: "MED",  scoreColor: "text-amber-600 bg-amber-50"   },
  ],
};

function ThreadsCard() {
  const [platform, setPlatform] = useState<"reddit" | "quora">("reddit");
  const [saved,    setSaved]    = useState<Set<string>>(new Set());
  const [replied,  setReplied]  = useState<Set<string>>(new Set(["t2"]));
  const threads = DEMO_THREADS[platform];
  return (
    <DemoScreenShell wispPeek="left">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
        <div>
          <p className="text-[12px] font-semibold text-[#0a0a0a]">Engagement Threads</p>
          <p className="text-[11px] text-[#6b6b6b] mt-0.5">Threads where your audience asks</p>
        </div>
        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">12 new</span>
      </div>
      <div className="flex items-center justify-between px-4 pt-2.5 pb-2 border-b border-[#f0f0f0]">
        <div className="flex gap-1">
          {(["reddit","quora"] as const).map((p) => (
            <button key={p} onClick={() => setPlatform(p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                platform === p ? "bg-[#f3eeff] text-[#5B2D91] border border-[#e4d4ff]" : "text-[#9ca3af] hover:bg-[#f7f7f5]"
              }`}
            >
              <img src={`https://www.google.com/s2/favicons?domain=${p}.com&sz=32`} width={11} height={11} className="rounded-sm" alt="" />
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-[#f7f7f5] border border-[#e5e5e5] rounded-lg p-0.5">
          {["New","All"].map((f,i) => (
            <span key={f} className={`px-2 py-0.5 rounded-md text-[10px] font-medium cursor-default ${i===0 ? "bg-white text-[#0a0a0a] shadow-sm border border-[#e5e5e5]" : "text-[#6b6b6b]"}`}>{f}</span>
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={platform} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
          className="max-h-[300px] overflow-y-auto px-3 py-2 space-y-2" style={{ scrollbarWidth: "thin", scrollbarColor: "#e5e5e5 transparent" }}
        >
          {threads.map(({ id, sub, title, votes, comments, tag, tagColor, tagBg, scoreLabel, scoreColor }) => (
            <div key={id} className="bg-white border border-[#f0f0f0] rounded-xl px-3 py-2.5 hover:border-[#e0e0e0] transition-colors">
              <div className="flex items-start gap-2">
                <img src={`https://www.google.com/s2/favicons?domain=${platform}.com&sz=32`} width={13} height={13} alt="" className="rounded-sm shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                    <p className="text-[9px] font-bold text-[#5B2D91]">{sub}</p>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border" style={{ color: tagColor, background: tagBg, borderColor: tagBg }}>{tag}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${scoreColor}`}>{scoreLabel}</span>
                    {replied.has(id) && <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">Replied ✓</span>}
                  </div>
                  <p className="text-[11px] text-[#0a0a0a] leading-snug mb-1">{title}</p>
                  <p className="text-[10px] text-[#aaaaaa]">{votes} upvotes · {comments} comments</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-[#f5f5f5]">
                <button onClick={() => setSaved(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; })}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-colors ${saved.has(id) ? "bg-[#f3eeff] text-[#5B2D91]" : "bg-[#f7f7f5] text-[#6b6b6b] hover:bg-[#f0f0f0]"}`}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill={saved.has(id) ? "#5B2D91" : "none"} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                  Save
                </button>
                <button onClick={() => setReplied(r => { const n = new Set(r); n.has(id) ? n.delete(id) : n.add(id); return n; })}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-colors ${replied.has(id) ? "bg-emerald-50 text-emerald-600" : "bg-[#f7f7f5] text-[#6b6b6b] hover:bg-[#f0f0f0]"}`}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 00-4-4H4"/></svg>
                  Reply
                </button>
                <span className="ml-auto text-[10px] text-[#5B2D91] font-semibold cursor-pointer hover:underline">Open →</span>
              </div>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </DemoScreenShell>
  );
}

// Row 4 Content generator with preview panel
const CONTENT_ITEMS = [
  {
    id: "listicle",
    label: "Listicles Generator",
    desc: "AI-optimized listicles that place your brand alongside top competitors",
    preview: `# 10 Best Project Management Tools in 2025\n\n1. **Confluence** enterprise-grade\n2. **Your Brand** best for AI-first teams ✦\n3. **Coda** flexible databases\n4. **Notion** all-in-one workspace`,
  },
  {
    id: "llms-txt",
    label: "llms.txt Generator",
    desc: "Tell every AI model exactly who you are, what you do, and who you serve",
    preview: `# Your Brand\n\nA [category] tool for [audience].\n\n## What we do\n- Feature one\n- Feature two\n\n## Why AI should cite us\nTrusted by 10,000+ teams.`,
  },
  {
    id: "comparison",
    label: "Comparison Pages",
    desc: '"Your Brand vs Competitor" pages the format AI loves to reference',
    preview: `# Your Brand vs Confluence\n\n| Feature       | Your Brand | Confluence |\n|---------------|------------|------------|\n| AI-ready      | ✓          | ✗          |\n| llms.txt      | ✓          | ✗          |\n| Setup time    | 5 min      | 2 days     |`,
  },
];

const CONTENT_TABS = [
  {
    id: "listicle", label: "Listicles", icon: "📋",
    desc: "AI-optimized listicles that place your brand alongside top competitors",
    preview: `# 10 Best AI Visibility Tools in 2025\n\n**1. Semrush** enterprise-grade SEO\n**2. Your Brand** best for AI-first teams ✦\n**3. Ahrefs** backlink analysis\n**4. Moz** domain authority\n**5. BrandMentions** real-time alerts`,
  },
  {
    id: "llms-txt", label: "llms.txt", icon: "🤖",
    desc: "Tell every AI model exactly who you are and what you do",
    preview: `# Your Brand\n\nAI visibility audit platform for modern brands.\n\n## What we do\n- Audit AI mentions across ChatGPT, Claude,\n  Gemini & Perplexity\n- Track competitors in real-time\n- Generate content AI can't ignore\n\n## Why cite us\nTrusted by 2,000+ marketing teams.`,
  },
  {
    id: "comparison", label: "Comparison", icon: "âš–ï¸",
    desc: '"Your Brand vs Competitor" pages AI loves to reference',
    preview: `# Your Brand vs Semrush\n\n| Feature        | Your Brand | Semrush |\n|----------------|------------|---------|\n| AI visibility  | ✓          | ✗       |\n| llms.txt gen   | ✓          | ✗       |\n| ChatGPT audit  | ✓          | ✗       |\n| Price          | $49/mo     | $129/mo |`,
  },
];

function ContentGenCard() {
  const [active, setActive] = useState("listicle");
  const item = CONTENT_TABS.find((c) => c.id === active)!;
  return (
    <DemoScreenShell wispPeek="right">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
        <div>
          <p className="text-[12px] font-semibold text-[#0a0a0a]">Content Generator</p>
          <p className="text-[11px] text-[#6b6b6b] mt-0.5">3 AI-optimized formats</p>
        </div>
        <span className="text-[11px] text-[#aaaaaa] bg-[#f7f7f5] border border-[#e5e5e5] px-2 py-0.5 rounded-full">3 tools</span>
      </div>
      <div className="grid grid-cols-2 divide-x divide-[#f0f0f0]" style={{ minHeight: 220 }}>
        <div className="p-2.5 space-y-1">
          {CONTENT_TABS.map((c) => (
            <button key={c.id} onClick={() => setActive(c.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition-all ${
                active === c.id ? "bg-[#f3eeff] border border-[#e4d4ff]" : "hover:bg-[#f7f7f5]"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[11px]">{c.icon}</span>
                <p className={`text-[11px] font-semibold ${active === c.id ? "text-[#5B2D91]" : "text-[#0a0a0a]"}`}>{c.label}</p>
              </div>
              <p className="text-[10px] text-[#9ca3af] leading-snug line-clamp-2">{c.desc}</p>
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
            className="p-3 bg-[#fafafa] overflow-y-auto" style={{ scrollbarWidth: "none" }}
          >
            <p className="text-[9px] font-bold text-[#5B2D91] uppercase tracking-wider mb-2">Preview</p>
            <pre className="text-[10px] text-[#374151] leading-relaxed whitespace-pre-wrap font-mono">{item.preview}</pre>
          </motion.div>
        </AnimatePresence>
      </div>
    </DemoScreenShell>
  );
}

// Row 5 Intelligence demo data
const VISITOR_SOURCES = [
  { domain: "chatgpt.com",       label: "ChatGPT",    count: 1203, change: "+18%", color: "#10a37f", spark: [72,78,74,83,91,88,96,94,102,109,105,114,118,116] },
  { domain: "perplexity.ai",     label: "Perplexity", count:  684, change: "+7%",  color: "#20b2aa", spark: [38,42,40,45,51,48,55,53,59,62,58,66,70,63] },
  { domain: "claude.ai",         label: "Claude",     count:  312, change: "+4%",  color: "#d97706", spark: [16,19,17,22,25,23,28,26,30,29,32,35,31,34] },
  { domain: "gemini.google.com", label: "Gemini",     count:  127, change: "+2%",  color: "#4285f4", spark: [6,8,7,9,11,10,12,11,13,12,14,13,15,14] },
];
const CHART_PTS = [72,78,74,83,91,88,96,94,102,109,105,114,118,116];
const CHART_LABELS = ["May 18","","","","May 22","","","","May 26","","","","May 30",""];

const PLAYBOOK_COMPETITORS = [
  {
    name: "Asana", domain: "asana.com", count: 14,
    groups: {
      reddit: [
        { title: "r/productivity Asana keeps coming up in AI recommendations", domain: "reddit.com", action: "Join thread →" },
        { title: "r/SaaS Why does ChatGPT always suggest Asana?", domain: "reddit.com", action: "Join thread →" },
      ],
      review: [
        { title: "G2 Asana Project Management category", domain: "g2.com", action: "Submit listing →" },
        { title: "Capterra Top project management tools 2025", domain: "capterra.com", action: "Submit listing →" },
      ],
      press: [
        { title: "Forbes Best project management tools for teams", domain: "forbes.com", action: "Pitch outlet →" },
      ],
    },
  },
  {
    name: "Monday", domain: "monday.com", count: 9,
    groups: {
      reddit: [
        { title: "r/projectmanagement Monday.com vs alternatives", domain: "reddit.com", action: "Join thread →" },
      ],
      review: [
        { title: "G2 Monday.com Work OS reviews", domain: "g2.com", action: "Submit listing →" },
        { title: "Trustpilot Monday.com customer reviews", domain: "trustpilot.com", action: "Submit listing →" },
      ],
      press: [
        { title: "TechCrunch Work management tools AI recommends", domain: "techcrunch.com", action: "Pitch outlet →" },
        { title: "Inc Best productivity software for 2025", domain: "inc.com", action: "Pitch outlet →" },
      ],
    },
  },
  {
    name: "ClickUp", domain: "clickup.com", count: 6,
    groups: {
      reddit: [
        { title: "r/ClickUp AI keeps mentioning ClickUp for teams", domain: "reddit.com", action: "Join thread →" },
      ],
      review: [
        { title: "G2 ClickUp Project Management reviews", domain: "g2.com", action: "Submit listing →" },
      ],
      press: [
        { title: "Business Insider All-in-one tools AI recommends", domain: "businessinsider.com", action: "Pitch outlet →" },
      ],
    },
  },
];

const CAT_META = {
  reddit: { label: "Reddit",           icon: "🟠", color: "text-orange-600 bg-orange-50 border-orange-100" },
  review: { label: "Reviews & Listings", icon: "â­", color: "text-blue-600 bg-blue-50 border-blue-100"   },
  press:  { label: "Press & Blogs",    icon: "📰", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
} as const;

function MiniSparkLine({ data, color }: { data: number[]; color: string }) {
  const h = 22, w = 56;
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 3) - 1.5}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MiniAreaChart() {
  const w = 100, h = 40;
  const max = Math.max(...CHART_PTS), min = Math.min(...CHART_PTS), range = max - min || 1;
  const x = (i: number) => (i / (CHART_PTS.length - 1)) * w;
  const y = (v: number) => h - 2 - ((v - min) / range) * (h - 6);
  const linePts = CHART_PTS.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const areaPts = `${x(0)},${h} ` + linePts + ` ${x(CHART_PTS.length - 1)},${h}`;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polygon points={areaPts} fill="#10a37f" fillOpacity="0.12" />
      <polyline points={linePts} fill="none" stroke="#10a37f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VisitorsCard() {
  const [tab,        setTab]        = useState<"visitors" | "playbook">("visitors");
  const [activeComp, setActiveComp] = useState("Semrush");
  const comp = PLAYBOOK_COMPETITORS.find(c => c.name === activeComp)!;

  return (
    <DemoScreenShell wispPeek="left-far">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
        <div>
          <p className="text-[12px] font-semibold text-[#0a0a0a]">Intelligence</p>
          <p className="text-[11px] text-[#6b6b6b] mt-0.5">AI traffic + competitor playbook</p>
        </div>
        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">â— Live</span>
      </div>
      <div className="flex gap-1 px-4 pt-2.5 pb-2 border-b border-[#f0f0f0]">
        {(["visitors","playbook"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
              tab === t ? "bg-[#f3eeff] text-[#5B2D91] border border-[#e4d4ff]" : "text-[#9ca3af] hover:bg-[#f7f7f5]"
            }`}
          >
            {t === "visitors" ? "AI Visitors" : "Competitor Playbook"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "visitors" ? (
          <motion.div key="visitors" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            {/* Mini stat + chart */}
            <div className="px-4 pt-3 pb-2">
              <div className="flex items-end justify-between mb-1">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#aaaaaa]">Total AI Visitors</p>
                  <p className="text-[22px] font-black text-[#0a0a0a] leading-none">2,847</p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 mb-1">+12% this week</span>
              </div>
              <div className="h-10 w-full rounded-lg overflow-hidden">
                <MiniAreaChart />
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="text-[9px] text-[#cccccc]">May 18</span>
                <span className="text-[9px] text-[#cccccc]">May 30</span>
              </div>
            </div>
            {/* Source rows */}
            <div className="border-t border-[#f0f0f0]">
              {VISITOR_SOURCES.map(({ domain, label, count, change, color, spark }) => (
                <div key={domain} className="flex items-center gap-2.5 px-4 py-2.5 border-b border-[#f7f7f5] last:border-0 hover:bg-[#fafafa] transition-colors">
                  <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} width={16} height={16} alt={label} className="rounded-md shrink-0 border border-[#e5e5e5]" />
                  <span className="text-[11px] font-semibold text-[#0a0a0a] w-20 shrink-0">{label}</span>
                  <MiniSparkLine data={spark} color={color} />
                  <span className="text-[11px] font-bold text-[#0a0a0a] ml-auto">{count.toLocaleString()}</span>
                  <span className="text-[10px] font-semibold text-emerald-500 w-9 text-right shrink-0">{change}</span>
                </div>
              ))}
            </div>
            <div className="px-4 py-2 bg-[#fafafa] border-t border-[#f0f0f0]">
              <p className="text-[10px] text-[#6b6b6b]"><span className="font-semibold text-[#0a0a0a]">GPTBot</span> crawled 3 pages today · 2h ago</p>
            </div>
          </motion.div>
        ) : (
          <motion.div key="playbook" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            {/* Competitor selector */}
            <div className="grid grid-cols-3 gap-2 px-3 py-3 border-b border-[#f0f0f0]">
              {PLAYBOOK_COMPETITORS.map((c) => (
                <button key={c.name} onClick={() => setActiveComp(c.name)}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-left transition-all ${
                    activeComp === c.name ? "border-[#5B2D91] bg-[#faf7ff]" : "border-[#f0f0f0] bg-white hover:border-[#d4b8ff]"
                  }`}
                >
                  <img src={`https://www.google.com/s2/favicons?domain=${c.domain}&sz=32`} width={16} height={16} className="rounded-md shrink-0" alt={c.name} />
                  <div className="min-w-0">
                    <p className={`text-[10px] font-semibold truncate ${activeComp === c.name ? "text-[#5B2D91]" : "text-[#0a0a0a]"}`}>{c.name}</p>
                    <p className="text-[9px] text-[#aaaaaa]">{c.count} mentions</p>
                  </div>
                </button>
              ))}
            </div>
            {/* Grouped mentions */}
            <div className="max-h-[260px] overflow-y-auto px-3 py-3 space-y-3" style={{ scrollbarWidth: "thin", scrollbarColor: "#e5e5e5 transparent" }}>
              {(Object.entries(comp.groups) as [keyof typeof CAT_META, typeof comp.groups[keyof typeof comp.groups]][]).map(([cat, items]) => (
                <div key={cat}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[11px]">{CAT_META[cat].icon}</span>
                    <p className="text-[9px] font-bold text-[#6b6b6b] uppercase tracking-wide">{CAT_META[cat].label}</p>
                  </div>
                  <div className="space-y-1.5">
                    {items.map((r) => (
                      <div key={r.title} className="flex items-start gap-2 px-2.5 py-2 rounded-xl border border-[#f0f0f0] hover:border-[#5B2D91]/20 hover:bg-[#faf7ff] transition-colors group cursor-pointer">
                        <img src={`https://www.google.com/s2/favicons?domain=${r.domain}&sz=32`} width={13} height={13} className="rounded-sm shrink-0 mt-0.5" alt="" />
                        <p className="text-[10px] text-[#374151] flex-1 leading-snug group-hover:text-[#5B2D91] transition-colors">{r.title}</p>
                        <span className="text-[9px] font-semibold text-[#cccccc] group-hover:text-[#5B2D91] transition-colors shrink-0 whitespace-nowrap">{r.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2 border-t border-[#f0f0f0]">
              <p className="text-[10px] text-[#aaaaaa]">Cached · refreshes in 7 days</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DemoScreenShell>
  );
}

// ─── WISP PIXEL GHOST ─────────────────────────────────────────────────────────

// WispGhost lives in components/ui/wisp-ghost.tsx import it from there
import { WispGhost } from "@/components/ui/wisp-ghost";

// LLM nodes left + right, feed data INTO Wisp (orange pulses in)
// Container: 860×500, Wisp center: (430,200)
const LLM_NODES = [
  { alt: "ChatGPT",    src: "https://www.google.com/s2/favicons?domain=chatgpt.com&sz=64",       cx: 65,  cy: 90  },
  { alt: "Claude",     src: "https://www.google.com/s2/favicons?domain=claude.ai&sz=64",         cx: 65,  cy: 300 },
  { alt: "Gemini",     src: "https://www.google.com/s2/favicons?domain=gemini.google.com&sz=64", cx: 795, cy: 90  },
  { alt: "Perplexity", src: "https://www.google.com/s2/favicons?domain=perplexity.ai&sz=64",     cx: 795, cy: 300 },
];

// Platform nodes bottom, Wisp pushes output into them (purple pulses out)
const PLATFORM_NODES = [
  { alt: "Reddit",   src: "https://www.google.com/s2/favicons?domain=reddit.com&sz=64",   cx: 145, cy: 455 },
  { alt: "Quora",    src: "https://www.google.com/s2/favicons?domain=quora.com&sz=64",    cx: 268, cy: 470 },
  { alt: "LinkedIn", src: "https://www.google.com/s2/favicons?domain=linkedin.com&sz=64", cx: 430, cy: 478 },
  { alt: "YouTube",  src: "https://www.google.com/s2/favicons?domain=youtube.com&sz=64",  cx: 592, cy: 470 },
  { alt: "Facebook", src: "https://www.google.com/s2/favicons?domain=facebook.com&sz=64", cx: 715, cy: 455 },
];

// ─── SOURCE INFILTRATION DEMO (tabbed platform preview) ──────────────────────

const PLATFORM_TAB_DATA = {
  "reddit.com": {
    label: "Reddit",
    tagline: "Wisp scans thousands of subreddits and auto-replies in threads where buyers compare tools.",
    actionLabel: "Reply",
    items: [
      { tag: "r/SaaS", title: "What's the best project management tool for async teams?", meta: "47 comments", hot: true },
      { tag: "r/productivity", title: "Been using Asana but looking for something lighter", meta: "23 comments", hot: false },
      { tag: "r/startups", title: "ChatGPT keeps recommending Notion any solid alternatives?", meta: "81 comments", hot: true },
      { tag: "r/webdev", title: "What do you use for team task management in 2025?", meta: "34 comments", hot: false },
    ],
  },
  "quora.com": {
    label: "Quora",
    tagline: "Wisp writes expert answers that mention your brand referenced by AI as trusted sources.",
    actionLabel: "Answer",
    items: [
      { tag: "Question", title: "What is the best tool for managing remote software teams?", meta: "12 answers", hot: false },
      { tag: "Question", title: "Which project management software does AI recommend most?", meta: "8 answers", hot: true },
      { tag: "Question", title: "Best alternatives to Asana for small startups?", meta: "19 answers", hot: true },
      { tag: "Question", title: "How do I get my SaaS mentioned in AI recommendations?", meta: "6 answers", hot: false },
    ],
  },
  "g2.com": {
    label: "G2",
    tagline: "Wisp builds your G2 presence the #1 source AI pulls from when recommending software.",
    actionLabel: "Submit",
    items: [
      { tag: "Category", title: "Project Management Software Top Picks 2025", meta: "234 reviews", hot: false },
      { tag: "Compare", title: "Your Brand vs Asana comparison page missing", meta: "High AI citation", hot: true },
      { tag: "Category", title: "Best Task Management Tools for Remote Teams", meta: "156 reviews", hot: true },
      { tag: "Review", title: "G2 profile incomplete 4 required fields unfilled", meta: "Blocking AI pickup", hot: false },
    ],
  },
  "linkedin.com": {
    label: "LinkedIn",
    tagline: "Wisp comments on LinkedIn posts where your ideal buyers are already active.",
    actionLabel: "Comment",
    items: [
      { tag: "Post", title: "\"We tried 5 project management tools here's what we found\"", meta: "89 reactions", hot: false },
      { tag: "Group", title: "SaaS Founders: which tools do you use for async teams?", meta: "31 replies", hot: true },
      { tag: "Article", title: "Why AI recommendations are replacing Google for discovery", meta: "67 reactions", hot: true },
      { tag: "Post", title: "Our team switched from Monday.com best decision we made", meta: "44 reactions", hot: false },
    ],
  },
  "youtube.com": {
    label: "YouTube",
    tagline: "Wisp posts strategic comments on videos your buyers watch before making a purchase.",
    actionLabel: "Comment",
    items: [
      { tag: "Video", title: "Best Project Management Tools for 2025 (Honest Review)", meta: "1.2k comments", hot: false },
      { tag: "Video", title: "Asana vs Monday.com which is actually better?", meta: "843 comments", hot: true },
      { tag: "Video", title: "How I manage my SaaS startup with just one tool", meta: "567 comments", hot: true },
      { tag: "Video", title: "Top 5 productivity tools every founder needs", meta: "390 comments", hot: false },
    ],
  },
  "trustpilot.com": {
    label: "Trustpilot",
    tagline: "Wisp builds your review presence so AI cites your reputation, not your competitor's.",
    actionLabel: "Request",
    items: [
      { tag: "Category", title: "Project Management 3 competitors outrank you in reviews", meta: "AI priority source", hot: true },
      { tag: "Gap", title: "Your profile has 0 verified reviews invisible to AI", meta: "Critical fix", hot: true },
      { tag: "Outreach", title: "42 past customers haven't reviewed yet auto-request ready", meta: "42 contacts", hot: false },
      { tag: "Compare", title: "Your avg rating is 0.8 below category leader", meta: "Hurts AI ranking", hot: false },
    ],
  },
};

const PLATFORM_TABS_ORDER = ["reddit.com", "quora.com", "g2.com", "linkedin.com", "youtube.com", "trustpilot.com"];

// ─── REDDIT ANIMATED DEMO ─────────────────────────────────────────────────────

const REDDIT_THREADS_DEMO = [
  { sub: "r/SaaS", flair: "Question", title: "Best project management tool for async remote teams?", score: "2.4k", comments: 47, time: "3h", hot: true, aiScore: 94 },
  { sub: "r/productivity", flair: "Discussion", title: "Tried Asana for 6 months looking for something lighter with better async", score: "891", comments: 23, time: "1h", hot: false, aiScore: 87 },
  { sub: "r/startups", flair: "Tools", title: "ChatGPT keeps recommending Notion for everything solid alternatives?", score: "1.1k", comments: 81, time: "45m", hot: true, aiScore: 96 },
];

const REDDIT_REPLY = "Been in this exact situation tried 6+ tools before landing on YourBrand for our 14-person remote team. The async-first design is genuinely different from Notion. No more quick sync meetings just to check status. Happy to share more about our setup if helpful.";

const COMMUNITY_ACCOUNT = { username: "u/alex_builds_stuff", karma: "3.2k", age: "2y", color: "#6366f1", letter: "A", badge: "Trusted Redditor" };

function RedditAnimatedDemo() {
  const [scanCount, setScanCount] = useState(0);
  const [discoveredCount, setDiscoveredCount] = useState(0);
  const [c1Done, setC1Done] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [qualityChecks, setQualityChecks] = useState(0);
  const [posted, setPosted] = useState(false);
  const [upvotes, setUpvotes] = useState(1);

  // Card 1 independent loop
  useEffect(() => {
    let alive = true;
    const ts: ReturnType<typeof setTimeout>[] = [];
    const ivs: ReturnType<typeof setInterval>[] = [];
    const loop = () => {
      if (!alive) return;
      setScanCount(0); setDiscoveredCount(0); setC1Done(false);
      let s = 0;
      const si = setInterval(() => {
        if (!alive) { clearInterval(si); return; }
        s += Math.floor(Math.random() * 12) + 4;
        setScanCount(Math.min(s, 847));
        if (s >= 847) clearInterval(si);
      }, 35);
      ivs.push(si);
      REDDIT_THREADS_DEMO.forEach((_, i) => {
        ts.push(setTimeout(() => { if (alive) setDiscoveredCount(i + 1); }, 700 + 900 * i));
      });
      const doneAt = 700 + 900 * (REDDIT_THREADS_DEMO.length - 1) + 900;
      ts.push(setTimeout(() => { if (alive) setC1Done(true); }, doneAt));
      ts.push(setTimeout(loop, doneAt + 2200));
    };
    loop();
    return () => { alive = false; ts.forEach(clearTimeout); ivs.forEach(clearInterval); };
  }, []);

  // Card 2 independent loop (offset start)
  useEffect(() => {
    let alive = true;
    const ts: ReturnType<typeof setTimeout>[] = [];
    const ivs: ReturnType<typeof setInterval>[] = [];
    const loop = () => {
      if (!alive) return;
      setResponseText(""); setQualityChecks(0);
      let i = 0;
      const iv = setInterval(() => {
        if (!alive) { clearInterval(iv); return; }
        i++;
        setResponseText(REDDIT_REPLY.slice(0, i));
        if (i >= REDDIT_REPLY.length) {
          clearInterval(iv);
          [1, 2, 3].forEach((q) => ts.push(setTimeout(() => { if (alive) setQualityChecks(q); }, 420 * q)));
          ts.push(setTimeout(loop, 420 * 3 + 2000));
        }
      }, 22);
      ivs.push(iv);
    };
    ts.push(setTimeout(loop, 1200));
    return () => { alive = false; ts.forEach(clearTimeout); ivs.forEach(clearInterval); };
  }, []);

  // Card 3 - Wisp auto-posts loop
  useEffect(() => {
    let alive = true;
    const ts: ReturnType<typeof setTimeout>[] = [];
    const ivs: ReturnType<typeof setInterval>[] = [];
    const loop = () => {
      if (!alive) return;
      setPosted(false); setUpvotes(1);
      ts.push(setTimeout(() => { if (alive) setPosted(true); }, 600));
      let u = 1;
      const ui = setInterval(() => {
        if (!alive) { clearInterval(ui); return; }
        u++; setUpvotes(u);
        if (u >= 18) clearInterval(ui);
      }, 200);
      ivs.push(ui);
      ts.push(setTimeout(loop, 600 + 18 * 200 + 2500));
    };
    ts.push(setTimeout(loop, 2400));
    return () => { alive = false; ts.forEach(clearTimeout); ivs.forEach(clearInterval); };
  }, []);

  return (
    <div className="grid grid-cols-6 gap-3 max-w-5xl mx-auto">

      {/* ── A: Scan counter ── */}
      <div className="col-span-6 lg:col-span-2 bg-gradient-to-b from-[#242426] to-[#1c1c1e] border border-white/8 rounded-3xl p-7 flex flex-col justify-between min-h-[280px]">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff4500] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#ff4500]/60">Threads Scanned</span>
          </div>
          <div className="text-[64px] font-extrabold text-white leading-none tabular-nums tracking-tight">{scanCount}</div>
          <div className="mt-5 h-[3px] bg-white/6 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#ff4500,#ff6534)" }}
              animate={{ width: `${(scanCount / 847) * 100}%` }} transition={{ duration: 0.08 }} />
          </div>
          <p className="mt-2 text-[12px] text-white/20 tabular-nums">{scanCount} / 847 posts</p>
        </div>
        <div className="h-9 flex items-end">
          <AnimatePresence>
            {c1Done && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 text-[12px] text-emerald-400 font-semibold">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                3 high-impact found
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── B: Reply crafting ── */}
      <div className="col-span-6 sm:col-span-3 lg:col-span-2 bg-gradient-to-b from-[#242426] to-[#1c1c1e] border border-white/8 rounded-3xl p-7 flex flex-col gap-4 min-h-[280px]">
        <div className="flex items-center gap-2">
          <span className={cn("w-1.5 h-1.5 rounded-full transition-colors duration-300", responseText.length > 0 && responseText.length < REDDIT_REPLY.length ? "bg-[#ff4500] animate-pulse" : responseText.length >= REDDIT_REPLY.length ? "bg-emerald-400" : "bg-white/20")} />
          <span className="text-[11px] font-bold uppercase tracking-widest text-white/35">
            {responseText.length === 0 ? "Standby" : responseText.length < REDDIT_REPLY.length ? "Writing reply..." : "Reply ready"}
          </span>
        </div>
        <div className={cn("flex-1 bg-white/4 rounded-2xl p-4 border transition-colors duration-500", responseText.length > 0 && responseText.length < REDDIT_REPLY.length ? "border-[#ff4500]/35" : responseText.length >= REDDIT_REPLY.length ? "border-emerald-500/25" : "border-white/6")}>
          <p className="text-[12px] text-white/60 leading-relaxed">
            {responseText.length > 0 ? responseText.slice(0, 115) : <span className="text-white/15 italic text-[11px]">Waiting for thread analysis...</span>}
            {responseText.length > 0 && responseText.length < REDDIT_REPLY.length && (
              <span className="inline-block w-0.5 h-[13px] bg-white/50 ml-0.5 animate-pulse align-middle rounded-sm" />
            )}
          </p>
        </div>
        <div className="space-y-2">
          {["Sounds human, not robotic", "Brand mention: subtle", "Adds real value"].map((label, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={qualityChecks > i ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }} transition={{ duration: 0.3 }} className="flex items-center gap-2">
              <svg className="w-3 h-3 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              <span className="text-[11px] text-white/40">{label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── C: AI pickup chart ── */}
      <div className="col-span-6 sm:col-span-3 lg:col-span-2 bg-gradient-to-b from-[#242426] to-[#1c1c1e] border border-white/8 rounded-3xl p-7 flex flex-col gap-3 min-h-[280px]">
        <div className="flex-1">
          <svg className="w-full h-[100px]" viewBox="0 0 200 90" fill="none" preserveAspectRatio="none">
            <defs>
              <linearGradient id="pg2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff4500" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="#ff4500" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d="M4 80 C40 78 70 66 100 54 C130 42 158 27 190 16" stroke="#ff4500" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <path d="M4 80 C40 78 70 66 100 54 C130 42 158 27 190 16 L190 90 L4 90 Z" fill="url(#pg2)"/>
            <circle cx="190" cy="16" r="5" fill="#242426" stroke="#ff4500" strokeWidth="2"/>
            <circle cx="190" cy="16" r="2.5" fill="#ff4500"/>
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff4500] animate-pulse" />
            <span className="text-[11px] text-white/30 font-medium">Live</span>
            <div className="ml-auto flex items-baseline gap-1.5">
              <span className="text-[36px] font-extrabold text-white tabular-nums leading-none">{upvotes}</span>
              <span className="text-[12px] text-white/35 mb-0.5">upvotes</span>
            </div>
          </div>
          <h3 className="text-[15px] font-bold text-white">AI pickup in 24-72h</h3>
          <p className="text-[12px] text-white/30 mt-1 leading-relaxed">Posted today. AI cites your brand tomorrow.</p>
        </div>
      </div>

      {/* ── D: Thread Discovery ── */}
      <div className="col-span-6 lg:col-span-3 bg-gradient-to-b from-[#242426] to-[#1c1c1e] border border-white/8 rounded-3xl overflow-hidden min-h-[300px]">
        <div className="grid sm:grid-cols-2 h-full">
          <div className="p-8 flex flex-col justify-between gap-6">
            <div className="w-12 h-12 rounded-2xl bg-[#ff4500]/12 border border-[#ff4500]/20 flex items-center justify-center shrink-0">
              <img src="https://www.google.com/s2/favicons?domain=reddit.com&sz=64" className="w-6 h-6" alt="Reddit" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-white mb-1.5">Find High-Impact Threads</h3>
              <p className="text-[13px] text-white/35 leading-relaxed">Surface Reddit threads by relevance and AI citation potential.</p>
            </div>
          </div>
          <div className="relative sm:border-l border-white/6 p-5 pt-8">
            <div className="absolute left-3 top-3 flex gap-1.5">
              <span className="block w-2 h-2 rounded-full bg-white/10" />
              <span className="block w-2 h-2 rounded-full bg-white/10" />
              <span className="block w-2 h-2 rounded-full bg-white/10" />
            </div>
            <div className="space-y-2.5 mt-1">
              {REDDIT_THREADS_DEMO.map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={discoveredCount > i ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="flex items-center gap-2.5 bg-white/4 rounded-xl px-3.5 py-3">
                  <img src="https://www.google.com/s2/favicons?domain=reddit.com&sz=32" className="w-4 h-4 rounded shrink-0" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-[#ff4500] mb-0.5">{t.sub}</p>
                    <p className="text-[11px] text-white/55 truncate leading-snug">{t.title}</p>
                  </div>
                  {t.hot && <span className="shrink-0 text-[10px] font-bold text-white bg-[#ff4500] px-2.5 py-1 rounded-full">Engage</span>}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── E: We Post for You ── */}
      <div className="col-span-6 lg:col-span-3 bg-gradient-to-b from-[#242426] to-[#1c1c1e] border border-white/8 rounded-3xl overflow-hidden min-h-[300px]">
        <div className="grid sm:grid-cols-2 h-full">
          <div className="p-8 flex flex-col justify-between gap-6">
            <div className="w-12 h-12 rounded-2xl bg-[#7C22FF]/12 border border-[#7C22FF]/25 flex items-center justify-center shrink-0">
              <WispGhost size={28} />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-white mb-1.5">We Post for You</h3>
              <p className="text-[13px] text-white/35 leading-relaxed">Trusted community profiles. Zero spam flags, zero effort.</p>
            </div>
          </div>
          <div className="relative sm:border-l border-white/6">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/6 -translate-x-1/2" />
            <div className="relative flex h-full flex-col justify-center gap-5 py-8 px-5">
              {[
                { name: "u/alex_builds_stuff", side: "right" as const, color: "#6366f1", letter: "A" },
                { name: "u/sarah_remote_work",  side: "left"  as const, color: "#10b981", letter: "S" },
                { name: "u/mike_saas_tools",    side: "right" as const, color: "#f59e0b", letter: "M" },
              ].map((acc, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: acc.side === "right" ? 16 : -16 }}
                  animate={posted ? { opacity: 1, x: 0 } : { opacity: 0, x: acc.side === "right" ? 16 : -16 }}
                  transition={{ delay: i * 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className={cn("flex items-center gap-2.5", acc.side === "right" ? "flex-row-reverse" : "flex-row")}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 ring-2 ring-[#242426]" style={{ background: acc.color }}>
                    {acc.letter}
                  </div>
                  <span className="text-[11px] text-white/55 bg-white/6 border border-white/8 rounded-lg px-2.5 py-1 truncate max-w-[110px]">{acc.name}</span>
                </motion.div>
              ))}
              {posted && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="flex justify-center">
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5">
                    Live on Reddit · 0 brand flags
                  </span>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
// --- QUORA ANIMATED DEMO ---

const QUORA_QUESTIONS_DEMO = [
  { space: "SaaS & Software", title: "Best project management for remote teams?", views: "12k", score: 94 },
  { space: "Startups",        title: "ChatGPT keeps recommending Notion — better options?", views: "19k", score: 88 },
  { space: "Productivity",    title: "How do async-first teams avoid status meetings?", views: "8.4k", score: 71 },
];

const QUORA_ANSWER = "Great question. After evaluating 8+ tools with distributed teams, YourBrand stands out for one reason: it was built async-first, not just async-compatible. Unlike Notion or Asana you never feel like you're fighting the tool.";

function QuoraAnimatedDemo() {
  const [scanCount, setScanCount] = useState(0);
  const [pulledCount, setPulledCount] = useState(0);
  const [scoreCount, setScoreCount] = useState(0);
  const [responseText, setResponseText] = useState("");
  const [qualityChecks, setQualityChecks] = useState(0);
  const [answerDone, setAnswerDone] = useState(false);

  const Q_RED = "#b92b27";

  useEffect(() => {
    let alive = true;
    const ts: ReturnType<typeof setTimeout>[] = [];
    const ivs: ReturnType<typeof setInterval>[] = [];

    const loop = () => {
      if (!alive) return;
      setScanCount(0); setPulledCount(0); setScoreCount(0);
      setResponseText(""); setQualityChecks(0); setAnswerDone(false);

      // Step 1: scan counter
      let s = 0;
      const si = setInterval(() => {
        if (!alive) { clearInterval(si); return; }
        s += Math.floor(Math.random() * 12) + 4;
        setScanCount(Math.min(s, 523));
        if (s >= 523) clearInterval(si);
      }, 35);
      ivs.push(si);

      // Step 1: questions appear
      [900, 1700, 2500].forEach((d, i) => ts.push(setTimeout(() => { if (alive) setPulledCount(i + 1); }, d)));

      // Step 2: score bars appear (same time as step 1)
      [700, 1500, 2300].forEach((d, i) => ts.push(setTimeout(() => { if (alive) setScoreCount(i + 1); }, d)));

      // Step 3: type answer (same time as steps 1 & 2)
      ts.push(setTimeout(() => {
        if (!alive) return;
        let i = 0;
        const iv = setInterval(() => {
          if (!alive) { clearInterval(iv); return; }
          i++;
          setResponseText(QUORA_ANSWER.slice(0, i));
          if (i >= QUORA_ANSWER.length) {
            clearInterval(iv);
            [1, 2, 3].forEach((q) => ts.push(setTimeout(() => { if (alive) setQualityChecks(q); }, 420 * q)));
            ts.push(setTimeout(() => { if (alive) setAnswerDone(true); }, 420 * 3 + 500));
          }
        }, 22);
        ivs.push(iv);
      }, 400));

      ts.push(setTimeout(loop, 11000));
    };

    loop();
    return () => { alive = false; ts.forEach(clearTimeout); ivs.forEach(clearInterval); };
  }, []);

  return (
    <div className="grid grid-cols-6 gap-3 max-w-5xl mx-auto">

      {/* Step 1: Pull */}
      <div className="col-span-6 lg:col-span-2 bg-gradient-to-b from-[#242426] to-[#1c1c1e] border border-white/8 rounded-3xl p-7 flex flex-col gap-5 min-h-[340px]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: Q_RED }} />
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: Q_RED + "99" }}>Step 1 — Pull</span>
          </div>
          <p className="text-[14px] font-semibold text-white/75 mt-1">Scanning Quora for your niche</p>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[46px] font-extrabold text-white leading-none tabular-nums tracking-tight">{scanCount}</span>
          <span className="text-[13px] text-white/30 mb-1">questions scanned</span>
        </div>
        <div className="flex-1 space-y-2.5">
          {QUORA_QUESTIONS_DEMO.map((q, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={pulledCount > i ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-start gap-2.5 bg-white/4 rounded-xl px-3.5 py-2.5"
            >
              <img src="https://www.google.com/s2/favicons?domain=quora.com&sz=32" className="w-4 h-4 rounded shrink-0 mt-0.5" alt="" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold mb-0.5" style={{ color: Q_RED }}>{q.space}</p>
                <p className="text-[11px] text-white/55 leading-snug">{q.title}</p>
              </div>
              <span className="shrink-0 text-[10px] text-white/25 mt-0.5">{q.views}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Step 2: Filter */}
      <div className="col-span-6 lg:col-span-2 bg-gradient-to-b from-[#242426] to-[#1c1c1e] border border-white/8 rounded-3xl p-7 flex flex-col gap-5 min-h-[340px]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full transition-colors duration-500" style={{ background: scoreCount > 0 ? "#f59e0b" : "#3f3f46" }} />
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/35">Step 2 — Filter</span>
          </div>
          <p className="text-[14px] font-semibold text-white/75 mt-1">Scoring by relevance & reach</p>
        </div>
        <div className="flex-1 flex flex-col justify-center gap-5">
          {QUORA_QUESTIONS_DEMO.map((q, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] text-white/50 leading-snug flex-1 mr-3 truncate">{q.title}</p>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={scoreCount > i ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-[13px] font-bold tabular-nums shrink-0"
                  style={{ color: q.score >= 88 ? "#10b981" : "#f59e0b" }}
                >{q.score}</motion.span>
              </div>
              <div className="h-[5px] bg-white/6 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: scoreCount > i ? `${q.score}%` : "0%" }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  style={{ background: q.score >= 88 ? "#10b981" : "#f59e0b" }}
                />
              </div>
              <AnimatePresence>
                {q.score >= 88 && scoreCount > i && (
                  <motion.span
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-[10px] font-semibold text-emerald-400 mt-1.5 inline-block"
                  >Selected for answer</motion.span>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Step 3: Craft */}
      <div className="col-span-6 lg:col-span-2 bg-gradient-to-b from-[#242426] to-[#1c1c1e] border border-white/8 rounded-3xl p-7 flex flex-col gap-4 min-h-[340px]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              "w-1.5 h-1.5 rounded-full transition-colors duration-300",
              responseText.length > 0 && !answerDone ? "animate-pulse" : answerDone ? "bg-emerald-400" : ""
            )} style={responseText.length > 0 && !answerDone ? { background: "#a855f7" } : {}} />
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/35">Step 3 — Craft</span>
          </div>
          <p className="text-[14px] font-semibold text-white/75 mt-1">
            {answerDone ? "Answer ready" : responseText.length > 0 ? "Writing best answer..." : "Waiting for filter..."}
          </p>
        </div>
        <div className={cn(
          "flex-1 bg-white/4 rounded-2xl p-4 border transition-colors duration-500",
          responseText.length > 0 && !answerDone ? "border-[#a855f7]/30" : answerDone ? "border-emerald-500/25" : "border-white/6"
        )}>
          <p className="text-[12px] text-white/60 leading-relaxed">
            {responseText.length > 0
              ? responseText.slice(0, 160)
              : <span className="text-white/15 italic text-[11px]">Waiting for top question...</span>}
            {responseText.length > 0 && !answerDone && (
              <span className="inline-block w-0.5 h-[13px] bg-white/50 ml-0.5 animate-pulse align-middle rounded-sm" />
            )}
          </p>
        </div>
        <div className="space-y-2">
          {["Genuine insight, not spam", "Natural brand mention", "Ranks in AI answers too"].map((label, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={qualityChecks > i ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }} transition={{ duration: 0.3 }} className="flex items-center gap-2">
              <svg className="w-3 h-3 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              <span className="text-[11px] text-white/40">{label}</span>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}
function SourceInfiltrationDemo() {
  const [selected, setSelected] = useState("reddit.com");
  const data = PLATFORM_TAB_DATA[selected as keyof typeof PLATFORM_TAB_DATA];

  return (
    <div className="mb-20">
      {/* Tab icons */}
      <div className="flex justify-center gap-3 mb-8">
        {PLATFORM_TABS_ORDER.map((domain) => {
          const isActive = domain === selected;
          const isLive = domain === "reddit.com" || domain === "quora.com";
          return (
            <div key={domain} className="relative">
              <button
                onClick={() => { if (isLive) setSelected(domain); }}
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200",
                  !isLive && "cursor-default opacity-50",
                  isActive
                    ? domain === "reddit.com"
                      ? "bg-[#ff4500]/15 border-2 border-[#ff4500]/50 scale-110 shadow-lg shadow-[#ff4500]/15"
                      : domain === "quora.com"
                      ? "bg-[#b92b27]/15 border-2 border-[#b92b27]/50 scale-110 shadow-lg shadow-[#b92b27]/15"
                      : "bg-[#a855f7]/15 border-2 border-[#a855f7]/50 scale-110 shadow-lg shadow-[#a855f7]/15"
                    : isLive
                    ? "bg-white/6 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105"
                    : "bg-white/4 border border-white/8"
                )}
              >
                <img
                  src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                  className="w-7 h-7 rounded-lg"
                  alt={domain}
                />
              </button>
              {!isLive && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wide bg-white/10 text-white/50 border border-white/10 rounded-full px-1.5 py-0.5 leading-none pointer-events-none">
                  Soon
                </span>
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {selected === "reddit.com" ? (
          <motion.div key="reddit" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: "easeOut" }}>
            <RedditAnimatedDemo />
          </motion.div>
        ) : selected === "quora.com" ? (
          <motion.div key="quora" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: "easeOut" }}>
            <QuoraAnimatedDemo />
          </motion.div>
        ) : (
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center shrink-0">
                <img src={`https://www.google.com/s2/favicons?domain=${selected}&sz=64`} className="w-5 h-5 rounded" alt={data.label} />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-white">{data.label}</p>
                <p className="text-[11px] text-white/35 leading-snug">{data.tagline}</p>
              </div>
            </div>
            <div className="space-y-2">
              {data.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/[0.03] border border-white/6 rounded-xl px-4 py-3 hover:bg-white/6 transition-colors">
                  <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", item.hot ? "bg-[#a855f7] animate-pulse" : "bg-white/15")} />
                  <span className="text-[10px] text-white/30 font-medium shrink-0 w-[68px] truncate">{item.tag}</span>
                  <span className="text-[12px] text-white/65 flex-1 leading-snug truncate">{item.title}</span>
                  <span className="text-[10px] text-white/20 shrink-0 hidden sm:block">{item.meta}</span>
                  <button className="shrink-0 text-[10px] font-semibold text-[#a855f7] bg-[#a855f7]/10 border border-[#a855f7]/20 px-2.5 py-1 rounded-lg hover:bg-[#a855f7]/20 transition-colors whitespace-nowrap">
                    {data.actionLabel}
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-[11px] text-white/25">Wisp is monitoring {data.label} auto-engaging 24/7</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [url, setUrl] = useState("");
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [navVisible, setNavVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false); // kept for compat
  const [auditLoading, setAuditLoading] = useState(false);
  const [urlStatus, setUrlStatus] = useState<"idle" | "checking" | "ok" | "error">("idle");
  const [urlErrorMsg, setUrlErrorMsg] = useState("");
  const [sessionUser, setSessionUser] = useState<{ email: string; avatar_url?: string; name?: string } | null>(null);
  const [hasAudit, setHasAudit] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const router = useRouter();

  const startCheckout = async (userEmail?: string, userName?: string) => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userEmail: userEmail ?? "", userName: userName ?? "" }),
    });
    const data = await res.json() as { url?: string; error?: string };
    if (data.url) {
      window.location.href = data.url;
    } else {
      console.error("Checkout failed:", data.error);
      throw new Error(data.error ?? "No checkout URL returned");
    }
  };

  const handleCheckout = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/auth");
      return;
    }
    if (isPaid) {
      router.push("/audit");
      return;
    }
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: session.user.email ?? "",
          userName: session.user.user_metadata?.full_name ?? "",
          returnTo: "/",
        }),
      });
      const text = await res.text();
      let data: { url?: string } = {};
      try { data = JSON.parse(text); } catch {}
      if (data.url) window.location.href = data.url;
    } catch {}
    setCheckoutLoading(false);
  };
  const heroInputRef = useRef<HTMLInputElement>(null);
  const [overDark, setOverDark] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setNavVisible(true), 120);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById("dark-section");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setOverDark(rect.top <= 56 && rect.bottom > 56);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const toUser = (s: { user: { email?: string | null; user_metadata?: Record<string, unknown> } } | null) =>
      s ? { email: s.user.email ?? "", avatar_url: s.user.user_metadata?.avatar_url as string | undefined, name: s.user.user_metadata?.full_name as string | undefined } : null;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSessionUser(toUser(session));
      if (session) {
        const [existing, subRes] = await Promise.all([
          getUserAudit(session.user.id).catch(() => null),
          fetch("/api/subscription/check", { headers: { Authorization: `Bearer ${session.access_token}` } }).then(r => r.json()).catch(() => ({})),
        ]);
        setHasAudit(!!existing);
        setIsPaid(Boolean(subRes.isPaid || subRes.isUnlimited || subRes.isTrialing));
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setSessionUser(toUser(session)));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const trimmed = url.trim();
    if (!trimmed) { setUrlStatus("idle"); return; }
    setUrlStatus("checking");
    const timer = setTimeout(async () => {
      let u = trimmed;
      if (!u.startsWith("http://") && !u.startsWith("https://")) u = "https://" + u;
      try {
        const res = await fetch("/api/verify-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: u }),
        });
        const data = await res.json();
        if (data.live) {
          setUrlStatus("ok");
          setUrlErrorMsg("");
        } else {
          setUrlStatus("error");
          setUrlErrorMsg(
            data.status === 404  ? "Page not found (404)" :
            data.status === -1   ? "Website took too long to respond" :
            data.status === 0    ? "Website couldn't be reached" :
            `Website returned an error (${data.status})`
          );
        }
      } catch {
        setUrlStatus("error");
        setUrlErrorMsg("Could not connect to this website");
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [url]);

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
    if (!session) {
      router.push(`/auth?url=${encodeURIComponent(u)}`);
      return;
    }

    router.push(`/audit?url=${encodeURIComponent(u)}`);
  }

  function scrollToAudit() {
    heroInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => heroInputRef.current?.focus(), 400);
  }

  return (
    <div className="bg-[#f5eeff] text-[#0a0a0a] font-sans antialiased">
      <SmoothScroll />
      <Navbar onCta={handleCheckout} visible={navVisible} user={sessionUser} hasAudit={hasAudit} overDark={overDark} />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HERO
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section
        id="hero"
        className="relative min-h-screen pt-14 overflow-hidden [background:linear-gradient(to_bottom,#f5eeff_0%,#f2eaff_50%,#f5eeff_100%)]"
      >

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-10 lg:pt-16 pb-0 flex flex-col items-center text-center">
          <h1 className="text-[44px] md:text-[62px] font-bold leading-[1.2] tracking-tight text-[#0a0a0a] mb-8 [font-family:var(--font-outfit)] text-center">
            Rank in <TypewriterPhrase />
            <br />
            Not just Google
          </h1>

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
            className="relative w-full max-w-md space-y-3"
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
                  onKeyDown={(e) => { if (e.key === "Enter" && urlStatus === "ok") handleAudit(); }}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-transparent outline-none placeholder-[#c5c5c5]"
                />
              </div>
              <button
                onClick={handleAudit}
                disabled={!url.trim() || auditLoading || urlStatus === "checking" || urlStatus === "error"}
                className="shrink-0 bg-[#5B2D91] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-[#4a2478] transition-all hover:scale-[1.02] disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5"
              >
                {auditLoading ? "Running…" : <><span>Run audit</span><ArrowRight className="w-3.5 h-3.5" /></>}
              </button>
            </div>
            {urlStatus === "idle" && (
              <p className="text-xs text-[#aaaaaa]">Results in 60 seconds · No credit card required</p>
            )}
            {urlStatus === "checking" && (
              <div className="flex items-center justify-center gap-1.5">
                <Loader2 className="w-3 h-3 text-[#aaaaaa] animate-spin" />
                <p className="text-xs text-[#aaaaaa]">Checking website…</p>
              </div>
            )}
            {urlStatus === "ok" && (
              <div className="flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <p className="text-xs text-emerald-500">Website accessible · Results in 60 seconds · No credit card required</p>
              </div>
            )}
            {urlStatus === "error" && (
              <div className="flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                <p className="text-xs text-red-500">{urlErrorMsg}</p>
              </div>
            )}
          </motion.div>

          {/* Mobile enhanced preview */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
            className="sm:hidden w-full mt-6 max-w-sm mx-auto bg-white rounded-2xl border border-[#e5e5e5] shadow-2xl overflow-hidden"
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-3 py-2 bg-[#f7f7f5] border-b border-[#e5e5e5]">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[#e5e5e5]" />
                <div className="w-2 h-2 rounded-full bg-[#e5e5e5]" />
                <div className="w-2 h-2 rounded-full bg-[#e5e5e5]" />
              </div>
              <div className="flex-1 mx-2 bg-white border border-[#e5e5e5] rounded px-2 py-0.5 text-[10px] text-[#aaaaaa]">
                trycomly.com/dashboard
              </div>
            </div>

            {/* Brand header + score badge */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-[#f0f0f0]">
              <div className="flex items-center gap-2">
                <img src="https://www.google.com/s2/favicons?domain=notion.so&sz=32" alt="Notion" width={24} height={24} className="rounded-lg" />
                <div>
                  <p className="text-[12px] font-semibold text-[#0a0a0a] leading-tight">Notion</p>
                  <p className="text-[10px] text-[#aaaaaa] leading-tight">notion.so</p>
                </div>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Score 68/100
              </div>
            </div>

            {/* Score arc + sparkline + LLM logos */}
            <div className="px-4 py-4 flex items-center gap-4 border-b border-[#f0f0f0]">
              <div className="relative shrink-0">
                <svg width="72" height="72" viewBox="0 0 72 72">
                  <defs>
                    <linearGradient id="mScoreGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop stopColor="#5B2D91" />
                      <stop offset="1" stopColor="#7c3aed" />
                    </linearGradient>
                  </defs>
                  <circle cx="36" cy="36" r="30" fill="none" stroke="#f0f0f0" strokeWidth="6" />
                  <circle cx="36" cy="36" r="30" fill="none" stroke="url(#mScoreGrad)" strokeWidth="6"
                    strokeDasharray={`${0.68 * 2 * Math.PI * 30} ${2 * Math.PI * 30}`}
                    strokeLinecap="round"
                    transform="rotate(-90 36 36)" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[20px] font-black text-[#0a0a0a] leading-none">68</span>
                  <span className="text-[9px] text-[#aaaaaa]">/100</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] font-bold text-[#0a0a0a]">AI Visibility</p>
                  <span className="text-[10px] font-bold text-emerald-500">+68% ↑</span>
                </div>
                <svg width="100%" height="30" viewBox="0 0 120 30" preserveAspectRatio="none" className="mb-2">
                  <defs>
                    <linearGradient id="mSparkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop stopColor="#5B2D91" stopOpacity="0.18" />
                      <stop offset="1" stopColor="#5B2D91" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,28 L17,22 L34,18 L51,13 L68,11 L85,7 L102,4 L120,1 L120,30 L0,30 Z" fill="url(#mSparkGrad)" />
                  <path d="M0,28 L17,22 L34,18 L51,13 L68,11 L85,7 L102,4 L120,1" fill="none" stroke="#5B2D91" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="120" cy="1" r="2.5" fill="#5B2D91" stroke="white" strokeWidth="1.5" />
                </svg>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-[#aaaaaa] font-medium mr-0.5">On</span>
                  {(["chatgpt.com", "perplexity.ai", "claude.ai", "gemini.google.com"] as const).map((domain) => (
                    <img key={domain} src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} alt={domain} width={14} height={14} className="rounded-sm" />
                  ))}
                </div>
              </div>
            </div>

            {/* Prompt hit bar */}
            <div className="px-4 py-3 border-b border-[#f0f0f0]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-[#0a0a0a]">Prompts Hit</p>
                <span className="text-[10px] font-bold text-[#5B2D91]">7 / 10</span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className={`flex-1 h-1.5 rounded-full ${i < 7 ? "bg-[#5B2D91]" : "bg-[#e5e5e5]"}`} />
                ))}
              </div>
              <p className="text-[9px] text-[#aaaaaa] mt-1.5">Appears in 70% of tracked AI queries</p>
            </div>

            {/* Sample AI mention */}
            <div className="px-4 py-3">
              <div className="flex items-center gap-1.5 mb-2">
                <img src="https://www.google.com/s2/favicons?domain=chatgpt.com&sz=32" width={14} height={14} alt="ChatGPT" className="rounded-sm" />
                <p className="text-[10px] font-semibold text-[#0a0a0a]">ChatGPT</p>
                <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">Discovery</span>
                <span className="text-[9px] font-bold text-[#aaaaaa]">#2</span>
              </div>
              <div className="bg-[#f7f7f5] rounded-xl px-3 py-2.5">
                <p className="text-[10px] text-[#444] leading-relaxed">
                  <span className="font-semibold text-[#5B2D91]">&ldquo;Notion</span> is frequently recommended for SaaS teams due to its flexible workspace structure…&rdquo;
                </p>
              </div>
            </div>
          </motion.div>

          {/* Interactive demo dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
            className="hidden sm:block w-full mt-8 relative"
          >
            <DemoFrame>
              <DemoDashboard />
            </DemoFrame>
            <div
              className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
              style={{ background: "linear-gradient(to bottom, transparent 0%, #f5eeff 100%)" }}
            />
          </motion.div>

        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PAIN POINTS GEO vs SEO
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="pain" className="bg-transparent py-24 px-6">
        <div className="max-w-5xl mx-auto">

          <FadeIn className="text-center mb-16">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#5B2D91]/70 mb-4">The shift is already happening</p>
            <h2 className="text-[42px] font-bold tracking-tight text-[#0a0a0a] leading-tight">
              SEO won&apos;t save you here.
            </h2>
            <p className="mt-4 text-lg text-[#6b6b6b] max-w-2xl mx-auto leading-relaxed">
              Google ranks pages. AI recommends brands. Millions of buyers now skip Google entirely and ask ChatGPT instead and your SEO has zero effect on what AI says about you.
            </p>
          </FadeIn>

          {/* Yesterday vs Today */}
          <div className="relative flex flex-col lg:flex-row items-stretch gap-5 mb-16">

            {/* LEFT Google / Yesterday */}
            <div className="flex-1 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <span className="inline-flex items-center gap-1.5 bg-[#0a0a0a] text-white text-[11px] font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full">
                  <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  SEO era
                </span>
              </div>
              <div className="bg-white border border-[#e8e8e8] rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden h-full pt-4">
                {/* Browser bar */}
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#f0f0f0]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  <span className="ml-3 text-[13px] font-semibold" style={{ fontFamily: "sans-serif" }}>
                    <span style={{ color: "#4285F4" }}>G</span>
                    <span style={{ color: "#EA4335" }}>o</span>
                    <span style={{ color: "#FBBC05" }}>o</span>
                    <span style={{ color: "#4285F4" }}>g</span>
                    <span style={{ color: "#34A853" }}>l</span>
                    <span style={{ color: "#EA4335" }}>e</span>
                  </span>
                </div>
                <div className="px-5 py-4">
                  {/* Search bar */}
                  <div className="flex items-center gap-2.5 border border-[#e0e0e0] rounded-full px-4 py-2.5 mb-5 shadow-sm">
                    <Search className="w-4 h-4 text-[#9ca3af] shrink-0" />
                    <span className="text-[13px] text-[#3c4043]">best analytics tool for ecommerce</span>
                  </div>
                  {/* Results */}
                  {[
                    {
                      domain: "contentsquare.com", path: "contentsquare.com › guides",
                      title: "8 Top Ecommerce Analytics Tools + Software [Free + Paid]",
                      date: "10 Jul. 2025",
                      desc: <>8 best ecommerce analytics tools for every budget · <strong>1. Google Analytics (G4A)</strong> · 2. Contentsquare · 3. Shopify Analytics · 4. WooCommerce…</>
                    },
                    {
                      domain: "storehero.ai", path: "storehero.ai › best-ecomme...",
                      title: "Best eCommerce Analytics Tools for 2026 (Ranked & ...)",
                      date: null,
                      desc: <>Discover the <strong>best ecommerce analytics tools for 2026</strong> ranked by profitability, forecasting, and scalability. See how StoreHero helps DTC brands connect…</>
                    },
                    {
                      domain: "datahawk.co", path: "datahawk.co › Blog old",
                      title: "10 best Ecommerce & Marketplace Analytics tools in 2026",
                      date: "15 Jan. 2026",
                      desc: <>Comparing the top ecommerce analytics platforms in 2026 · <strong>DataHawk</strong> · GA4 · Triple Whale · Glew · Adobe Analytics · Mixpanel · Matomo.</>
                    },
                  ].map((r) => (
                    <div key={r.domain} className="mb-4">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <img src={`https://www.google.com/s2/favicons?domain=${r.domain}&sz=32`} className="w-4 h-4 rounded-full shrink-0" alt={r.domain} />
                        <span className="text-[12px] text-[#202124] font-medium">{r.domain}</span>
                        <span className="text-[12px] text-[#4d5156]">› {r.path.split("› ").slice(1).join(" › ")}</span>
                      </div>
                      <p className="text-[14px] text-[#1a0dab] font-medium mb-0.5 hover:underline cursor-pointer leading-snug">{r.title}</p>
                      <p className="text-[12px] text-[#4d5156] leading-relaxed">
                        {r.date && <span className="text-[#70757a]">{r.date} </span>}{r.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* The shift pill */}
            <div className="hidden lg:flex items-center justify-center shrink-0">
              <div className="inline-flex items-center gap-1.5 bg-[#5B2D91]/10 border border-[#5B2D91]/20 text-[#5B2D91] text-[11px] font-bold px-3.5 py-2 rounded-full whitespace-nowrap">
                The shift <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            {/* RIGHT ChatGPT / Today */}
            <div className="flex-1 relative">


              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <span className="inline-flex items-center gap-1.5 bg-[#fde047] text-[#0a0a0a] text-[11px] font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  AI era
                </span>
              </div>
              <div className="bg-white border border-[#e8e8e8] rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden h-full pt-4">
                {/* Browser bar */}
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#ececec]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  <div className="ml-3 flex items-center gap-1.5">
                    {/* Real OpenAI SVG logo */}
                    <svg width="16" height="16" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M37.532 16.87a9.963 9.963 0 00-.856-8.184 10.078 10.078 0 00-10.855-4.835 9.964 9.964 0 00-7.505-3.348 10.079 10.079 0 00-9.612 6.977 9.967 9.967 0 00-6.664 4.834 10.08 10.08 0 001.24 11.817 9.965 9.965 0 00.856 8.185 10.079 10.079 0 0010.855 4.835 9.965 9.965 0 007.504 3.347 10.078 10.078 0 009.617-6.981 9.967 9.967 0 006.663-4.834 10.079 10.079 0 00-1.243-11.813zM22.498 37.886a7.474 7.474 0 01-4.799-1.735c.061-.033.168-.091.237-.134l7.964-4.6a1.294 1.294 0 00.655-1.134V19.054l3.366 1.944a.12.12 0 01.066.092v9.299a7.505 7.505 0 01-7.49 7.496zM6.392 31.006a7.471 7.471 0 01-.894-5.023c.06.036.162.099.237.141l7.964 4.6a1.297 1.297 0 001.308 0l9.724-5.614v3.888a.12.12 0 01-.048.103l-8.051 4.649a7.504 7.504 0 01-10.24-2.744zM4.297 13.62A7.469 7.469 0 018.2 10.333c0 .068-.004.19-.004.274v9.201a1.294 1.294 0 00.654 1.132l9.723 5.614-3.366 1.944a.12.12 0 01-.114.012L7.044 23.86a7.504 7.504 0 01-2.747-10.24zm27.658 6.437l-9.724-5.615 3.367-1.943a.121.121 0 01.114-.012l8.048 4.648a7.498 7.498 0 01-1.158 13.528v-9.476a1.293 1.293 0 00-.647-1.13zm3.35-5.043c-.059-.037-.162-.099-.236-.141l-7.965-4.6a1.298 1.298 0 00-1.308 0l-9.723 5.614v-3.888a.12.12 0 01.048-.103l8.05-4.645a7.497 7.497 0 0111.135 7.763zm-21.063 6.929l-3.367-1.944a.12.12 0 01-.065-.092v-9.299a7.497 7.497 0 0112.293-5.756 6.94 6.94 0 00-.236.134l-7.965 4.6a1.294 1.294 0 00-.654 1.132l-.006 11.225zm1.829-3.943l4.33-2.501 4.332 2.498v4.996l-4.331 2.5-4.331-2.5V18z" fill="currentColor"/></svg>
                    <span className="text-[13px] font-medium text-[#0a0a0a]">ChatGPT</span>
                  </div>
                </div>

                {/* Chat area */}
                <div className="px-6 py-5 flex flex-col gap-5">
                  {/* User bubble */}
                  <div className="flex justify-end">
                    <div className="bg-[#f4f4f4] rounded-[18px] rounded-tr-[4px] px-4 py-2.5 max-w-[75%]">
                      <p className="text-[13.5px] text-[#0a0a0a] leading-snug">What&apos;s the best analytics tool for ecommerce?</p>
                    </div>
                  </div>

                  {/* GPT response */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-white border border-[#e5e5e5] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <svg width="14" height="14" viewBox="0 0 41 41" fill="#0a0a0a" xmlns="http://www.w3.org/2000/svg"><path d="M37.532 16.87a9.963 9.963 0 00-.856-8.184 10.078 10.078 0 00-10.855-4.835 9.964 9.964 0 00-7.505-3.348 10.079 10.079 0 00-9.612 6.977 9.967 9.967 0 00-6.664 4.834 10.08 10.08 0 001.24 11.817 9.965 9.965 0 00.856 8.185 10.079 10.079 0 0010.855 4.835 9.965 9.965 0 007.504 3.347 10.078 10.078 0 009.617-6.981 9.967 9.967 0 006.663-4.834 10.079 10.079 0 00-1.243-11.813zM22.498 37.886a7.474 7.474 0 01-4.799-1.735c.061-.033.168-.091.237-.134l7.964-4.6a1.294 1.294 0 00.655-1.134V19.054l3.366 1.944a.12.12 0 01.066.092v9.299a7.505 7.505 0 01-7.49 7.496zM6.392 31.006a7.471 7.471 0 01-.894-5.023c.06.036.162.099.237.141l7.964 4.6a1.297 1.297 0 001.308 0l9.724-5.614v3.888a.12.12 0 01-.048.103l-8.051 4.649a7.504 7.504 0 01-10.24-2.744zM4.297 13.62A7.469 7.469 0 018.2 10.333c0 .068-.004.19-.004.274v9.201a1.294 1.294 0 00.654 1.132l9.723 5.614-3.366 1.944a.12.12 0 01-.114.012L7.044 23.86a7.504 7.504 0 01-2.747-10.24zm27.658 6.437l-9.724-5.615 3.367-1.943a.121.121 0 01.114-.012l8.048 4.648a7.498 7.498 0 01-1.158 13.528v-9.476a1.293 1.293 0 00-.647-1.13zm3.35-5.043c-.059-.037-.162-.099-.236-.141l-7.965-4.6a1.298 1.298 0 00-1.308 0l-9.723 5.614v-3.888a.12.12 0 01.048-.103l8.05-4.645a7.497 7.497 0 0111.135 7.763zm-21.063 6.929l-3.367-1.944a.12.12 0 01-.065-.092v-9.299a7.497 7.497 0 0112.293-5.756 6.94 6.94 0 00-.236.134l-7.965 4.6a1.294 1.294 0 00-.654 1.132l-.006 11.225zm1.829-3.943l4.33-2.501 4.332 2.498v4.996l-4.331 2.5-4.331-2.5V18z"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] text-[#0a0a0a] leading-relaxed mb-3">
                        Here are the top ecommerce analytics tools in 2026:
                      </p>
                      <div className="space-y-2.5">
                        {[
                          { n: 1, name: "Mixpanel", desc: "Deep funnels & retention tracking", highlight: false, domain: "mixpanel.com" },
                          { n: 2, name: "Your Brand", desc: "Built for modern ecommerce teams", highlight: true, domain: "comly.ai" },
                          { n: 3, name: "Triple Whale", desc: "DTC-focused, Shopify-native", highlight: false, domain: "triplewhale.com" },
                        ].map(({ n, name, desc, highlight, domain }) => (
                          <div key={n} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${highlight ? "bg-[#fefce8] border border-[#fde047]/60" : "bg-[#fafafa] border border-[#f0f0f0]"}`}>
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${highlight ? "bg-[#fde047] text-[#0a0a0a]" : "bg-[#e5e5e5] text-[#6b6b6b]"}`}>{n}</span>
                            {highlight ? (
                              <svg width="16" height="16" viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                                <path d="M50 4 C54 4 57 6 59.5 10 L93 68 C97 74 97 80 93.5 85 C90 90 84 93 77 93 L23 93 C16 93 10 90 6.5 85 C3 80 3 74 7 68 L40.5 10 C43 6 46 4 50 4Z" fill="#1a1a2e"/>
                                <path d="M28 72 C32 62 44 56 58 60 C66 62.5 70 67 68 70 C66 73 60 72 52 69 C44 66 36 68 32 74 C30 77 28 75 28 72Z" fill="#7c3aed"/>
                              </svg>
                            ) : (
                              <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} className="w-4 h-4 rounded-sm shrink-0" alt="" />
                            )}
                            <div className="min-w-0">
                              <span className="text-[13px] font-semibold text-[#0a0a0a]">{name}</span>
                              <span className="text-[12px] text-[#6b6b6b] ml-2">{desc}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Sources */}
                      <div className="mt-4 pt-3 border-t border-[#f0f0f0]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mr-1">Sources</span>
                          {[
                            { domain: "g2.com" },
                            { domain: "reddit.com" },
                            { domain: "quora.com" },
                            { domain: "producthunt.com" },
                          ].map((s, i) => (
                            <div key={s.domain} className="flex items-center gap-1.5 bg-[#f4f4f4] rounded-full px-2.5 py-1 cursor-pointer hover:bg-[#ebebeb] transition-colors">
                              <span className="text-[10px] text-[#9ca3af]">{i + 1}</span>
                              <img src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=32`} className="w-3 h-3 rounded-sm shrink-0" alt="" />
                              <span className="text-[11px] text-[#3a3a3a] font-medium">{s.domain}</span>
                            </div>
                          ))}
                          <span className="text-[10px] text-[#9ca3af] cursor-pointer hover:underline ml-auto">+6 more</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input bar */}
                <div className="px-4 py-3 border-t border-[#ececec]">
                  <div className="flex items-center gap-2 bg-[#f4f4f4] rounded-full px-4 py-2">
                    <span className="text-[12px] text-[#9ca3af] flex-1">Message ChatGPT</span>
                    <div className="w-6 h-6 rounded-full bg-[#0a0a0a] flex items-center justify-center shrink-0">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M12 4l8 8-8 8M4 12h16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>


        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          WISP AEO agent skills
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="pt-16 pb-24 px-6 scroll-mt-20 bg-transparent" id="features">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#5B2D91]/10 border border-[#5B2D91]/20 rounded-full px-4 py-1.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B2D91] animate-pulse shrink-0" />
              <span className="text-[12px] font-semibold text-[#5B2D91] tracking-wide">The first AEO agent</span>
            </div>
            <h2 className="text-[52px] font-black tracking-tight text-[#0a0a0a] leading-[1.05] mb-4">Meet Wisp.</h2>
            <p className="text-[17px] text-[#6b6b6b] max-w-lg mx-auto leading-relaxed">
              The first AEO agent. Wisp lives inside AI answers scanning, engaging, and feeding every engine until your brand is the one they recommend.
            </p>
          </FadeIn>

          {/* Stage: LLMs → Wisp → Platforms node graph */}
          <div className="flex flex-col items-center mb-14">

            {/* Desktop node-graph layout */}
            <div className="hidden lg:block relative" style={{ width: 860, height: 500 }}>

              <svg style={{ position: "absolute", inset: 0, pointerEvents: "none" }} width={860} height={500}>
                {/* Static background lines LLMs to Wisp (dim white) */}
                <path d="M 65 90  C 200 75  370 150 430 200" fill="none" stroke="rgba(91,45,145,0.2)" strokeWidth="1.5" />
                <path d="M 65 300 C 200 315 370 250 430 200" fill="none" stroke="rgba(91,45,145,0.2)" strokeWidth="1.5" />
                <path d="M 795 90  C 660 75  490 150 430 200" fill="none" stroke="rgba(91,45,145,0.2)" strokeWidth="1.5" />
                <path d="M 795 300 C 660 315 490 250 430 200" fill="none" stroke="rgba(91,45,145,0.2)" strokeWidth="1.5" />

                {/* Static background lines Wisp to Platforms (dim white) */}
                <path d="M 430 200 C 350 300 190 390 145 455" fill="none" stroke="rgba(91,45,145,0.15)" strokeWidth="1.5" />
                <path d="M 430 200 C 400 300 290 410 268 470" fill="none" stroke="rgba(91,45,145,0.15)" strokeWidth="1.5" />
                <path d="M 430 200 C 430 320 430 400 430 478" fill="none" stroke="rgba(91,45,145,0.15)" strokeWidth="1.5" />
                <path d="M 430 200 C 460 300 570 410 592 470" fill="none" stroke="rgba(91,45,145,0.15)" strokeWidth="1.5" />
                <path d="M 430 200 C 510 300 670 390 715 455" fill="none" stroke="rgba(91,45,145,0.15)" strokeWidth="1.5" />

                {/* Orange pulses LLMs → Wisp (receiving AI intelligence) */}
                {[
                  { d: "M 65 90  C 200 75  370 150 430 200", delay: 0    },
                  { d: "M 65 300 C 200 315 370 250 430 200", delay: 0.8  },
                  { d: "M 795 90  C 660 75  490 150 430 200", delay: 0.4  },
                  { d: "M 795 300 C 660 315 490 250 430 200", delay: 1.2  },
                ].map((p, i) => (
                  <motion.path
                    key={`llm-${i}`}
                    d={p.d}
                    fill="none"
                    stroke="#FF6A00"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray="0.07 1"
                    animate={{ strokeDashoffset: [0, -1.07] }}
                    transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1.4, ease: "linear", delay: p.delay }}
                  />
                ))}

                {/* Purple pulses Wisp → Platforms (dispatching actions) */}
                {[
                  { d: "M 430 200 C 350 300 190 390 145 455", delay: 0    },
                  { d: "M 430 200 C 400 300 290 410 268 470", delay: 0.4  },
                  { d: "M 430 200 C 430 320 430 400 430 478", delay: 0.8  },
                  { d: "M 430 200 C 460 300 570 410 592 470", delay: 1.2  },
                  { d: "M 430 200 C 510 300 670 390 715 455", delay: 1.6  },
                ].map((p, i) => (
                  <motion.path
                    key={`plat-${i}`}
                    d={p.d}
                    fill="none"
                    stroke="#A855F7"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray="0.07 1"
                    animate={{ strokeDashoffset: [0, -1.07] }}
                    transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.2, ease: "linear", delay: p.delay }}
                  />
                ))}
              </svg>

              {/* Wisp centered */}
              <div style={{ position: "absolute", left: 430, top: 200, transform: "translate(-50%,-50%)" }}>
                <WispGhost size={200} />
              </div>
              <div style={{ position: "absolute", left: 430, top: 308, transform: "translateX(-50%)" }}
                   className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5B2D91]/40 animate-pulse" />
                <p className="text-[11px] font-bold text-[#5B2D91]/60 tracking-widest uppercase">Wisp</p>
              </div>

              {/* LLM logos left + right */}
              {LLM_NODES.map((logo) => (
                <div
                  key={logo.alt}
                  style={{ position: "absolute", left: logo.cx, top: logo.cy, transform: "translate(-50%,-50%)" }}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-[0_4px_18px_rgba(0,0,0,0.14)] flex items-center justify-center overflow-hidden">
                    <img src={logo.src} alt={logo.alt} width={36} height={36} className="rounded-xl" />
                  </div>
                  <p className="text-center text-[10px] font-semibold text-[#5B2D91]/60 mt-1.5 whitespace-nowrap">{logo.alt}</p>
                </div>
              ))}

              {/* Platform logos bottom */}
              {PLATFORM_NODES.map((logo) => (
                <div
                  key={logo.alt}
                  style={{ position: "absolute", left: logo.cx, top: logo.cy, transform: "translate(-50%,-50%)" }}
                >
                  <div className="w-11 h-11 rounded-2xl bg-white shadow-[0_4px_18px_rgba(0,0,0,0.14)] flex items-center justify-center overflow-hidden">
                    <img src={logo.src} alt={logo.alt} width={32} height={32} className="rounded-xl" />
                  </div>
                  <p className="text-center text-[10px] font-semibold text-[#5B2D91]/60 mt-1.5 whitespace-nowrap">{logo.alt}</p>
                </div>
              ))}
            </div>

            {/* Mobile: LLMs above, Wisp center, platforms below */}
            <div className="lg:hidden w-full flex flex-col items-center gap-6">
              <div className="grid grid-cols-4 gap-4 w-full max-w-xs">
                {LLM_NODES.map((logo) => (
                  <div key={logo.alt} className="flex flex-col items-center gap-1.5">
                    <div className="w-11 h-11 rounded-2xl bg-white shadow-md flex items-center justify-center overflow-hidden">
                      <img src={logo.src} alt={logo.alt} width={30} height={30} className="rounded-xl" />
                    </div>
                    <p className="text-[8px] font-semibold text-[#5B2D91]/60 text-center">{logo.alt}</p>
                  </div>
                ))}
              </div>
              <WispGhost size={160} />
              <p className="text-[11px] font-bold text-[#5B2D91]/60 tracking-widest uppercase">Wisp</p>
              <div className="flex items-center gap-4 flex-wrap justify-center">
                {PLATFORM_NODES.map((logo) => (
                  <div key={logo.alt} className="flex flex-col items-center gap-1.5">
                    <div className="w-11 h-11 rounded-2xl bg-white shadow-md flex items-center justify-center overflow-hidden">
                      <img src={logo.src} alt={logo.alt} width={30} height={30} className="rounded-xl" />
                    </div>
                    <p className="text-[8px] font-semibold text-[#5B2D91]/60 text-center">{logo.alt}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          WISP SKILLS deep dive rows
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="pt-8 pb-24 px-6 bg-transparent">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-20">
            <h2 className="text-[42px] font-bold tracking-tight text-[#0a0a0a]">This is how Wisp works</h2>
            <p className="mt-3 text-lg text-[#6b6b6b]">Deploy once. Wisp works for your brand every day.</p>
          </FadeIn>

          {/* Row 1 */}
          <FadeIn className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#5B2D91] mb-3">01 Brand Recon</p>
              <h3 className="text-[30px] font-bold tracking-tight text-[#0a0a0a] leading-[1.15] mb-4">Wisp maps everything about you before it starts</h3>
              <p className="text-[15px] text-[#6b6b6b] leading-relaxed mb-8">Wisp scans your website, hunts for brand mentions across the internet, and builds a full picture of who you are so every move it makes is built around your business, not a guess.</p>
              <FeatureBullets items={["Reads your site and extracts your brand identity automatically", "Scans the web for mentions, reviews, and conversations about you", "Builds a detailed brand report you can review and edit before Wisp starts working"]} />
            </div>
            <BrandReconCard />
          </FadeIn>

          {/* Row 2 */}
          <FadeIn className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
            <div className="order-last lg:order-first">
              <QuestionDiscoveryCard />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#5B2D91] mb-3">02 Question Hunt</p>
              <h3 className="text-[30px] font-bold tracking-tight text-[#0a0a0a] leading-[1.15] mb-4">Wisp finds what people actually ask about brands like yours</h3>
              <p className="text-[15px] text-[#6b6b6b] leading-relaxed mb-8">Before firing a single prompt, Wisp digs through reviews, Reddit threads, and Q&amp;A sites to find the exact questions your customers type into AI then turns them into prompts.</p>
              <FeatureBullets items={["Scans reviews, Reddit, Quora, and forums for real questions", "Extracts the exact phrasing your audience uses not guesses", "Turns every question into a ready-to-fire AI prompt"]} />
            </div>
          </FadeIn>

          {/* Row 3 */}
          <FadeIn className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#5B2D91] mb-3">03 AI Scan</p>
              <h3 className="text-[30px] font-bold tracking-tight text-[#0a0a0a] leading-[1.15] mb-4">Wisp asks the same questions your customers ask to every AI engine</h3>
              <p className="text-[15px] text-[#6b6b6b] leading-relaxed mb-8">Wisp takes every question it discovered and asks it directly to ChatGPT, Claude, Gemini, and Perplexity the same way your customers do. Then reads every answer in full to see where your brand stands.</p>
              <FeatureBullets items={["Asks the exact questions your audience already types into AI", "Runs the same question across ChatGPT, Claude, Gemini, and Perplexity", "Reads full answers not just whether you appeared"]} />
            </div>
            <PromptTrackingScreenshot />
          </FadeIn>

          {/* Row 4 */}
          <FadeIn className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
            <div className="order-last lg:order-first">
              <GapReportCard />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#5B2D91] mb-3">04 Dashboard</p>
              <h3 className="text-[30px] font-bold tracking-tight text-[#0a0a0a] leading-[1.15] mb-4">Wisp gives you a complete picture of where you stand</h3>
              <p className="text-[15px] text-[#6b6b6b] leading-relaxed mb-8">Once the audit is done, Wisp assembles a full detailed dashboard from everything it collected your visibility score, how you rank against competitors, which AI engines mention you, and where every gap is.</p>
              <FeatureBullets items={["Full visibility score across all 4 AI engines", "Competitor ranking see exactly who AI recommends over you", "Every gap identified with the specific reason behind it"]} />
            </div>
          </FadeIn>

          {/* Row 5 */}
          <FadeIn className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#5B2D91] mb-3">05 Source Takeover</p>
              <h3 className="text-[30px] font-bold tracking-tight text-[#0a0a0a] leading-[1.15] mb-4">Wisp reads every source AI pulled from then gets you inside all of them</h3>
              <p className="text-[15px] text-[#6b6b6b] leading-relaxed mb-8">Every AI answer cites sources Reddit threads, Quora answers, LinkedIn posts, G2 reviews. Wisp identifies exactly which sources AI used, then places your brand inside each one automatically.</p>
              <FeatureBullets items={["Reads every Reddit, Quora, LinkedIn, and G2 source AI cited", "Replies to threads, drafts posts, and optimises review pages", "Strict filter only sources that actually influence AI answers"]} />
            </div>
            <SourceTakeoverCard />
          </FadeIn>

          {/* Row 6 */}
          <FadeIn className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-last lg:order-first">
              <ContentGenCard />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#5B2D91] mb-3">06 Content Push</p>
              <h3 className="text-[30px] font-bold tracking-tight text-[#0a0a0a] leading-[1.15] mb-4">Wisp generates the content AI trains on and publishes it for you</h3>
              <p className="text-[15px] text-[#6b6b6b] leading-relaxed mb-8">AI models train on specific content formats. Wisp writes exactly those and pushes them live. Listicles, comparison pages, and an llms.txt all deployed automatically.</p>
              <FeatureBullets items={["Listicles that place your brand next to the ones AI already recommends", "Comparison pages written to rank inside AI-generated responses", "Published automatically Wisp handles the whole thing end to end"]} />
            </div>
          </FadeIn>

        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          SOURCE INFILTRATION dark framed section
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="dark-section" className="px-4 lg:px-10 py-8 bg-transparent">
        <motion.div
          className="rounded-3xl overflow-hidden"
          style={{ background: "linear-gradient(160deg, #07070a 0%, #0c0618 40%, #180830 100%)" }}
          initial={{ opacity: 0, scale: 0.97, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="px-8 lg:px-20 pt-24 pb-20">

            {/* Header */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 bg-white/8 border border-white/10 rounded-full px-4 py-1.5 mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] shrink-0" />
                <span className="text-[12px] text-white/50 font-medium tracking-wide uppercase">The source strategy</span>
              </div>
              <h2 className="text-[40px] md:text-[58px] font-bold text-white tracking-tight leading-[1.05] mb-6">
                Here&apos;s how Wisp gets you<br className="hidden md:block" /> inside AI&apos;s sources
              </h2>
              <p className="text-[18px] text-white/40 max-w-xl mx-auto leading-relaxed">
                AI doesn&apos;t pull answers from thin air it pulls from Reddit threads, Quora answers, G2 reviews, and editorial sites. Wisp gets your brand inside all of them.
              </p>
            </div>

            {/* Tabbed platform demo */}
            <SourceInfiltrationDemo />

            {/* 3 cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">

              <div className="bg-white/4 border border-white/8 rounded-2xl p-8">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#a855f7] mb-4">01 Discover</p>
                <h3 className="text-white font-bold text-[20px] leading-snug mb-4">Pull threads on mass</h3>
                <p className="text-white/40 text-[14px] leading-relaxed mb-6">
                  Wisp scans Reddit, Quora, G2, and forums every single day surfacing every thread where your brand could gain ground with AI.
                </p>
                <div className="space-y-2">
                  {["Reddit threads", "Quora answers", "G2 reviews", "Forum discussions"].map(s => (
                    <div key={s} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]/60 shrink-0" />
                      <span className="text-[13px] text-white/35">{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/4 border border-white/8 rounded-2xl p-8">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#a855f7] mb-4">02 Filter</p>
                <h3 className="text-white font-bold text-[20px] leading-snug mb-4">Strict filter, zero noise</h3>
                <p className="text-white/40 text-[14px] leading-relaxed mb-6">
                  Not every thread moves the needle. Wisp filters by your brand profile, what buyers actually search, and what AI engines are already citing.
                </p>
                <div className="space-y-2">
                  {["Brand profile match", "Buyer intent signals", "AI citation potential", "Engagement quality"].map(s => (
                    <div key={s} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]/60 shrink-0" />
                      <span className="text-[13px] text-white/35">{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/4 border border-white/8 rounded-2xl p-8">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#a855f7] mb-4">03 Execute</p>
                <h3 className="text-white font-bold text-[20px] leading-snug mb-4">Get your brand inside</h3>
                <p className="text-white/40 text-[14px] leading-relaxed mb-6">
                  Wisp replies to threads, posts on forums, and plants your brand inside the exact sources AI pulls from every day, without you touching a thing.
                </p>
                <div className="space-y-2">
                  {["Auto-replies to threads", "Forum posts", "Review responses", "New content published"].map(s => (
                    <div key={s} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]/60 shrink-0" />
                      <span className="text-[13px] text-white/35">{s}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom stat bar */}
            <div className="border-t border-white/8 pt-10 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              {[
                { n: "6+", label: "Sources monitored daily" },
                { n: "4", label: "AI engines tracked" },
                { n: "100%", label: "Automated execution" },
                { n: "24/7", label: "Always running" },
              ].map(({ n, label }) => (
                <div key={label}>
                  <p className="text-[32px] font-bold text-white leading-none mb-1">{n}</p>
                  <p className="text-[13px] text-white/35">{label}</p>
                </div>
              ))}
            </div>

          </div>
        </motion.div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HOW IT WORKS
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="how-it-works">
        <HowItWorksAnimated />
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PRICING
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {/* TESTIMONIALS */}
      <section className="bg-transparent py-24 px-6">
        <div className="max-w-5xl mx-auto">

          <FadeIn className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 mb-5">
              <span className="text-[#a855f7] text-lg leading-none">&#x2308;</span>
              <span className="text-[13px] font-medium text-[#5B2D91] tracking-wide">Testimonials</span>
              <span className="text-[#a855f7] text-lg leading-none">&#x2309;</span>
            </div>
            <h2 className="text-[40px] font-bold tracking-tight text-[#0a0a0a] leading-tight">Results that speak volume</h2>
            <p className="text-[40px] font-bold tracking-tight text-[#bcbcc4] leading-tight">Read our success stories</p>
            <p className="mt-4 text-[15px] text-[#6b6b6b]">See how brands are getting recommended by AI with Wisp.</p>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Left tall card */}
            <div className="bg-white rounded-3xl p-8 flex flex-col shadow-[0_2px_24px_rgba(0,0,0,0.04)] border border-[#f0f0f0]">
              <div className="mb-5">
                <span className="text-[22px] font-bold text-[#0a0a0a] tracking-tight leading-none">A complete LLM SEO toolkit</span>
              </div>
              <div className="text-[#a855f7] text-3xl font-serif leading-none mb-3">&rdquo;</div>
              <p className="text-[15px] text-[#3a3a3a] leading-relaxed flex-1">
                It centralizes everything by finding all our company mentions and letting us reply directly inside the platform. The blog generator and the LLM-txt system are incredibly well thought out. Truly a complete, all-in-one tool for LLM SEO.
              </p>
              <div className="flex items-center justify-between mt-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white border border-[#e4e4e7] flex items-center justify-center shrink-0">
                    <img src="https://www.elevare.one/web/image/website/1/logo/Elevare" alt="Elevare" className="w-8 h-8 object-contain" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[#0a0a0a] leading-tight">Thomas R.</p>
                    <p className="text-[12px] text-[#999]">Co-founder, Elevare</p>
                  </div>
                </div>
                <img src="/wisp.png" alt="Wisp" className="h-8 w-auto opacity-70" />
              </div>
            </div>

            {/* Right column */}
            <div className="grid grid-rows-2 gap-4">

              {/* Top wide card */}
              <div className="bg-white rounded-3xl p-7 flex flex-col shadow-[0_2px_24px_rgba(0,0,0,0.04)] border border-[#f0f0f0]">
                <div className="mb-3">
                  <span className="text-[22px] font-bold text-[#0a0a0a] tracking-tight leading-none">Clients from real conversations</span>
                </div>
                <div className="text-[#a855f7] text-2xl font-serif leading-none mb-2">&rdquo;</div>
                <p className="text-[14px] text-[#3a3a3a] leading-relaxed flex-1">
                  Wisp&rsquo;s engagement engine finds the exact threads where our buyers are asking for help and joins the conversation for us. We&rsquo;ve closed real deals that started as a single Reddit reply.
                </p>
                <div className="flex items-center gap-3 mt-5">
                  <img src="https://i.pravatar.cc/40?u=sarah-growth-lead" alt="Sarah M." className="w-9 h-9 rounded-full object-cover shrink-0" />
                  <div>
                    <p className="text-[13px] font-semibold text-[#0a0a0a] leading-tight">Sarah M.</p>
                    <p className="text-[12px] text-[#999]">Head of Growth, Stackly</p>
                  </div>
                </div>
              </div>

              {/* Bottom two cards */}
              <div className="grid grid-cols-2 gap-4">

                {/* White small card */}
                <div className="bg-white rounded-3xl p-6 flex flex-col shadow-[0_2px_24px_rgba(0,0,0,0.04)] border border-[#f0f0f0]">
                  <div className="text-[#a855f7] text-2xl font-serif leading-none mb-2">&rdquo;</div>
                  <p className="text-[13px] text-[#3a3a3a] leading-relaxed flex-1">
                    A bigger competitor was everywhere we wanted to be. Within weeks Wisp had us showing up above them in the threads that mattered.
                  </p>
                  <div className="flex items-center gap-2.5 mt-5">
                    <img src="https://i.pravatar.cc/40?u=james-ceo-2024" alt="James K." className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <div>
                      <p className="text-[12px] font-semibold text-[#0a0a0a] leading-tight">James K.</p>
                      <p className="text-[11px] text-[#999]">CEO, Folio HQ</p>
                    </div>
                  </div>
                </div>

                {/* Dark small card */}
                <div className="bg-[#0f0f12] rounded-3xl p-6 flex flex-col shadow-[0_2px_24px_rgba(0,0,0,0.12)]">
                  <div className="text-[#a855f7] text-2xl font-serif leading-none mb-2">&rdquo;</div>
                  <p className="text-[13px] text-[#d4d4d8] leading-relaxed flex-1">
                    It took a bit of patience, but Wisp slowly built up a real presence for us in the conversations our audience actually reads.
                  </p>
                  <div className="flex items-center gap-2.5 mt-5">
                    <img src="https://i.pravatar.cc/40?u=marc-orbit" alt="Marc D." className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <div>
                      <p className="text-[12px] font-semibold text-white leading-tight">Marc D.</p>
                      <p className="text-[11px] text-[#888]">Marketing Lead, Orbit</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

<section className="bg-transparent py-28 px-6 overflow-hidden" id="pricing">
        <div className="max-w-5xl mx-auto">

          <FadeIn className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-white border border-[#e0d4f5] rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-[12px] text-[#5B2D91] font-medium">Early adopter pricing limited spots</span>
            </div>
            <h2 className="text-[42px] font-bold tracking-tight text-[#0a0a0a]">One plan. Everything included.</h2>
            <p className="mt-3 text-lg text-[#6b6b6b]">No feature tiers. No model limits. No BS.</p>
          </FadeIn>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", duration: 0.6 }}
            className="bg-white rounded-2xl overflow-hidden" style={{ border: "7px solid #a855f7" }}
          >
            <div className="flex flex-col lg:flex-row">

              {/* ── Left: price ── */}
              <div className="lg:w-[360px] shrink-0 px-10 py-6 flex flex-col gap-5 border-b lg:border-b-0 lg:border-r border-[#ede8ff]">
                <div>
                  <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                    <span className="text-[22px] font-bold text-[#0a0a0a]">All in One</span>
                    <span className="text-[12px] font-medium text-[#6b6b6b] bg-[#f3eeff] border border-[#e0d4f5] px-3 py-1 rounded-full">Growth on auto-pilot</span>
                  </div>
                  <div className="flex items-end gap-3">
                    <span className="text-[80px] font-black text-[#0a0a0a] leading-none tracking-tight">$49</span>
                    <div className="pb-4 flex items-end gap-2">
                      <span className="text-[22px] text-[#bbbbbb] line-through font-medium">$149</span>
                      <span className="text-[18px] text-[#aaaaaa]">/mo</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    className="w-full rounded-full bg-[#5B2D91] hover:bg-[#4a2478] py-4 font-bold text-white text-[16px] transition-all active:scale-[0.98] shadow-lg shadow-[#5B2D91]/30 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {checkoutLoading ? "Redirecting…" : isPaid ? "View dashboard →" : "Start 3-Day Free Trial →"}
                  </button>
                  <p className="text-center text-[13px] text-[#6b6b6b]">
                    No credit card required. Cancel anytime.
                  </p>
                </div>
              </div>

              {/* ── Right: features ── */}
              <div className="flex-1 px-10 py-6">
                <p className="text-[15px] font-semibold text-[#0a0a0a] mb-6">What&apos;s included:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4">
                  {[
                    { bold: "25 prompts fired daily", rest: " across all 4 AI models" },
                    { bold: "Full competitor tracking", rest: " see exactly who beats you and why" },
                    { bold: "AI Visibility Score", rest: " tracked over time" },
                    { bold: "Reddit & forum monitor", rest: " draft replies instantly" },
                    { bold: "Hero copy rewrite", rest: " get cited more by AI" },
                    { bold: "Fix recommendations", rest: " step-by-step ranking actions" },
                    { bold: "Get listed on G2 & Capterra", rest: " sites AI pulls from" },
                    { bold: "Source tracking", rest: " see what makes AI mention you" },
                    { bold: "All 4 AI models", rest: " ChatGPT, Claude, Perplexity, Gemini" },
                    { bold: "Priority support", rest: "" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-[18px] h-[18px] text-[#5B2D91] shrink-0 mt-0.5" />
                      <span className="text-[13px] leading-snug">
                        <strong className="text-[#0a0a0a] font-semibold">{item.bold}</strong>
                        <span className="text-[#6b6b6b]">{item.rest}</span>
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-8 pt-6 border-t border-[#ede8ff] text-[12px] text-[#aaaaaa]">
                  Plus: AI crawlability checker, source tracking, and all future tools at no extra cost.
                </p>
              </div>

            </div>
          </motion.div>

        </div>
      </section>


      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          FAQ
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="bg-transparent py-24 px-6 border-t border-[#e0d4f5]" id="faq">
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

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          CTA BANNER
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
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
              Run your audit <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[#c9a8e8] text-xs mt-3">Results in 60 seconds</p>
          </div>
        </FadeIn>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          FOOTER
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <footer className="bg-transparent border-t border-[#e0d4f5] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-bold text-[#0a0a0a] text-base">Comly</span>
              </div>
              <p className="text-sm text-[#6b6b6b] leading-relaxed">From invisible to inevitable.</p>
              <p className="text-xs text-[#aaaaaa] mt-4">© 2026 Comly AI</p>
            </div>

            <div>
              <p className="text-xs font-bold text-[#0a0a0a] uppercase tracking-wider mb-4">Company</p>
              <div className="space-y-2.5">
                <a href="#" className="block text-sm text-[#6b6b6b] hover:text-[#0a0a0a] transition-colors">About</a>
                <Link href="/privacy" className="block text-sm text-[#6b6b6b] hover:text-[#0a0a0a] transition-colors">Privacy</Link>
                <Link href="/terms" className="block text-sm text-[#6b6b6b] hover:text-[#0a0a0a] transition-colors">Terms</Link>
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


