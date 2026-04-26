"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Globe, Bell } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface StepData {
  num: string;
  title: string;
  subtitle: string;
  desc: string;
  color: string;
  visual: React.ReactNode;
}

const STEPS: StepData[] = [
  {
    num: "01",
    title: "Tell us about your brand",
    subtitle: "You",
    desc: "Paste your website URL. Comly automatically extracts your brand name, category, target users, competitors and use cases. Confirm or edit in seconds.",
    color: "rgba(91, 45, 145, 0.8)",
    visual: (
      <div className="space-y-2 w-full max-w-xs">
        <div className="flex items-center gap-2 border border-[#e5e5e5] rounded-xl px-3 py-2.5 bg-white/80">
          <Globe className="w-4 h-4 text-[#6b6b6b] shrink-0" />
          <span className="text-sm text-[#0a0a0a]">https://notion.so</span>
          <span className="ml-auto w-2 h-4 bg-[#5B2D91]/50 animate-pulse rounded-sm" />
        </div>
        <div className="bg-white/60 border border-[#e5e5e5] rounded-xl p-3 space-y-1.5">
          {[["Brand", "Notion"], ["Category", "Productivity"], ["Audience", "Teams, founders"]].map(([k, v]) => (
            <div key={k} className="flex items-center gap-2 text-xs">
              <span className="text-[#6b6b6b] w-16">{k}</span>
              <span className="font-medium text-[#0a0a0a]">{v}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    num: "02",
    title: "We run the AI audit",
    subtitle: "We",
    desc: "Our engine generates targeted prompts based on your brand profile and fires them at ChatGPT, Claude, Gemini and Perplexity. We record every mention, position and competitor that appears.",
    color: "rgba(110, 60, 180, 0.8)",
    visual: (
      <div className="space-y-3 w-full max-w-xs">
        <div className="flex items-center gap-2 bg-white/80 border border-[#e5e5e5] rounded-xl px-3 py-2">
          <span className="w-2 h-2 rounded-full bg-[#5B2D91] animate-pulse shrink-0" />
          <span className="text-xs font-medium text-[#0a0a0a]">Live</span>
          <span className="text-xs text-[#6b6b6b]">Running AI audit...</span>
        </div>
        <div className="h-2 bg-[#e5e5e5] rounded-full overflow-hidden">
          <div className="h-full bg-[#5B2D91] rounded-full transition-all" style={{ width: "70%" }} />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {["ChatGPT", "Claude", "Gemini", "Perplexity"].map((m) => (
            <div key={m} className="bg-white/80 border border-[#e5e5e5] rounded-lg px-2 py-1.5 text-center">
              <span className="text-[9px] text-[#6b6b6b]">{m}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    num: "03",
    title: "Get your score and fix list",
    subtitle: "You",
    desc: "See your visibility score, competitor ranking, and a prioritized to-do list. Generate your llms.txt in one click. Track improvement weekly.",
    color: "rgba(140, 80, 220, 0.8)",
    visual: (
      <div className="bg-white/80 border border-[#e5e5e5] rounded-xl p-4 space-y-3 w-full max-w-xs">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#6b6b6b]" />
          <span className="text-xs font-semibold text-[#0a0a0a]">New Audit Complete</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-black text-[#0a0a0a]">72</span>
          <span className="text-sm text-[#6b6b6b]">/100</span>
          <span className="text-xs font-semibold text-[#7C3AED] ml-auto">+12 vs last</span>
        </div>
        <div className="space-y-1.5">
          {["Add llms.txt to your site", "Improve product description", "Add more use cases"].map((fix, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px] text-[#6b6b6b]">
              <span className="w-4 h-4 rounded-full bg-[#5B2D91]/10 border border-[#5B2D91]/20 flex items-center justify-center text-[9px] text-[#5B2D91] shrink-0">{i + 1}</span>
              {fix}
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

interface CardProps {
  step: StepData;
  index: number;
  totalCards: number;
}

const GlassCard: React.FC<CardProps> = ({ step, index, totalCards }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const container = containerRef.current;
    if (!card || !container) return;

    const targetScale = 1 - (totalCards - index) * 0.05;

    gsap.set(card, { scale: 1, transformOrigin: "center top" });

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top center",
      end: "bottom center",
      scrub: 1,
      onUpdate: (self) => {
        const scale = gsap.utils.interpolate(1, targetScale, self.progress);
        gsap.set(card, { scale: Math.max(scale, targetScale), transformOrigin: "center top" });
      },
    });

    return () => { trigger.kill(); };
  }, [index, totalCards]);

  return (
    <div
      ref={containerRef}
      style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "sticky", top: 0 }}
    >
      <div
        ref={cardRef}
        style={{
          position: "relative",
          width: "min(700px, 90vw)",
          minHeight: "420px",
          borderRadius: "24px",
          isolation: "isolate",
          top: `calc(-5vh + ${index * 25}px)`,
          transformOrigin: "top",
        }}
      >
        {/* Electric border */}
        <div
          style={{
            position: "absolute",
            inset: "-2px",
            borderRadius: "26px",
            padding: "2px",
            background: `conic-gradient(from 0deg, transparent 0deg, ${step.color} 60deg, ${step.color.replace("0.8", "0.5")} 120deg, transparent 180deg, ${step.color.replace("0.8", "0.3")} 240deg, transparent 360deg)`,
            zIndex: -1,
          }}
        />

        {/* Glass card */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            minHeight: "420px",
            borderRadius: "24px",
            background: "linear-gradient(145deg, rgba(255,255,255,0.75), rgba(255,255,255,0.5))",
            backdropFilter: "blur(25px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.7)",
            boxShadow: "0 8px 40px rgba(91,45,145,0.12), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "48px",
          }}
        >
          {/* Glass reflections */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "55%", background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 50%, transparent 100%)", pointerEvents: "none", borderRadius: "24px 24px 0 0" }} />
          <div style={{ position: "absolute", top: "10px", left: "10px", right: "10px", height: "1.5px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)", borderRadius: "1px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, left: 0, width: "2px", height: "100%", background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 50%)", borderRadius: "24px 0 0 24px", pointerEvents: "none" }} />

          {/* Content */}
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-[#5B2D91]/30 text-[#5B2D91]">
                  Step {step.num}
                </span>
                <span className="text-[11px] font-semibold text-[#6b6b6b] uppercase tracking-wider">{step.subtitle}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-[#0a0a0a] leading-tight">{step.title}</h3>
              <p className="text-[15px] text-[#6b6b6b] leading-relaxed max-w-sm">{step.desc}</p>
            </div>
            <div className="shrink-0 flex items-center justify-center">{step.visual}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function HowItWorksCards() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    gsap.fromTo(wrapper, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "power2.out" });
  }, []);

  return (
    <div ref={wrapperRef} style={{ background: "#ffffff" }}>
      {/* Section heading */}
      <div className="text-center pt-24 pb-4 px-6">
        <p className="text-[11px] font-bold tracking-widest uppercase text-[#5B2D91] mb-4">HOW IT WORKS</p>
        <h2 className="text-[42px] font-bold tracking-tight text-[#0a0a0a]">How Comly works</h2>
        <p className="mt-3 text-lg text-[#6b6b6b]">3 steps to go from invisible to recommended</p>
      </div>

      {/* Stacked cards — tinted area so glass effect reads on white page */}
      <div style={{ background: "linear-gradient(180deg, #ffffff 0%, #f3eeff 30%, #ede4ff 100%)" }}>
        {STEPS.map((step, i) => (
          <GlassCard key={step.num} step={step} index={i} totalCards={STEPS.length} />
        ))}
      </div>

    </div>
  );
}
