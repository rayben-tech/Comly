"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrandProfile } from "@/types";
import {
  TrendingUp, Search, RefreshCw, Globe, Code, Users,
  X, Plus, ArrowRight, Check,
} from "lucide-react";

// ─── COMLY LOGO ───────────────────────────────────────────────────────────────

function ComlyLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="comlySwsh" x1="8" y1="22" x2="24" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b0764" />
          <stop offset="55%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill="white" />
      <path d="M16 4C17.5 4 23 10.5 26.5 16.5C30 22.5 30.5 27 28.5 28.5C26.5 30 22 30 16 30C10 30 5.5 30 3.5 28.5C1.5 27 2 22.5 5.5 16.5C9 10.5 14.5 4 16 4Z" fill="#131320" />
      <path d="M9.5 23.5C10 20.5 14 18 18.5 19.2C22 20.1 24 21.5 23.5 23C23 24.5 19.5 24.5 15 24.5C12 24.5 9 25 9.5 23.5Z" fill="url(#comlySwsh)" />
    </svg>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getDomain(url: string): string {
  try { return new URL(url).hostname.replace("www.", ""); } catch { return url; }
}

// ─── TAG INPUT ────────────────────────────────────────────────────────────────

function TagInput({ tags, onChange, placeholder }: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
}) {
  const [adding, setAdding] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function commit() {
    const val = input.trim();
    if (val && !tags.includes(val)) onChange([...tags, val]);
    setInput("");
    setAdding(false);
  }

  return (
    <div className="flex flex-wrap gap-1.5 items-center min-h-[28px]">
      {tags.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 bg-white border border-[#e5e5e5] text-[#374151] text-xs font-medium px-2.5 py-1 rounded-full">
          {tag}
          <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))} className="text-[#9ca3af] hover:text-[#374151] transition-colors ml-0.5">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      {adding ? (
        <input
          ref={inputRef}
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); commit(); }
            if (e.key === "Escape") { setAdding(false); setInput(""); }
          }}
          onBlur={commit}
          placeholder={`Add ${placeholder}…`}
          className="text-xs border border-[#5B2D91] rounded-full px-2.5 py-1 outline-none w-36 bg-white"
        />
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="inline-flex items-center gap-1 text-xs text-[#6b6b6b] hover:text-[#0a0a0a] transition-colors font-medium">
          <Plus className="w-3 h-3" />
          Add {placeholder}
        </button>
      )}
    </div>
  );
}

// ─── TYPE CARD ────────────────────────────────────────────────────────────────

function TypeCard({ title, subtitle, features, selected, onSelect, comingSoon }: {
  title: string; subtitle: string; features: string[];
  selected: boolean; onSelect: () => void; comingSoon?: boolean;
}) {
  return (
    <div onClick={onSelect} className={`relative flex-1 rounded-xl p-4 cursor-pointer select-none transition-all ${selected ? "border-2 border-[#5B2D91] bg-white shadow-sm" : "border-2 border-[#e5e5e5] bg-[#f0f0ee] hover:border-[#c5c5c5]"}`}>
      {comingSoon && <span className="absolute top-3 right-3 text-[9px] font-bold bg-[#ebebeb] text-[#9ca3af] px-2 py-0.5 rounded-full uppercase tracking-wide">Soon</span>}
      <div className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center mb-3 shrink-0 transition-colors ${selected ? "bg-[#5B2D91] border-[#5B2D91]" : "border-[#c5c5c5] bg-white"}`}>
        {selected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
      </div>
      <p className="font-bold text-[#0a0a0a] text-[15px] mb-1">{title}</p>
      <p className="text-xs text-[#6b6b6b] leading-relaxed mb-3">{subtitle}</p>
      <hr className="border-[#e5e5e5] mb-3" />
      <div className="space-y-2">
        {features.map((f) => (
          <div key={f} className="flex items-center gap-1.5">
            <Check className="w-3 h-3 text-[#6b6b6b] shrink-0" strokeWidth={2.5} />
            <span className="text-xs text-[#374151]">{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FIELD ────────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[#374151] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 text-sm bg-white border border-[#d1d5db] rounded-lg outline-none focus:border-[#5B2D91] transition-colors text-[#0a0a0a] placeholder-[#c5c5c5]";

// ─── SHOWCASE — SCENE 1: SCRAPING ─────────────────────────────────────────────

function Scene1({ url, brandName, category, targetUsers }: {
  url: string; brandName: string; category: string; targetUsers: string;
}) {
  const [showText, setShowText] = useState(false);
  const [chars, setChars] = useState(0);

  const lines = [
    `Brand: ${brandName || "Your Brand"}`,
    `Category: ${category || "Software"}`,
    `Audience: ${targetUsers?.split(",")[0]?.trim() || "SaaS teams"}`,
  ];
  const full = lines.join("\n");

  useEffect(() => {
    const t = setTimeout(() => setShowText(true), 1000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!showText || chars >= full.length) return;
    const t = setTimeout(() => setChars((c) => c + 1), 28);
    return () => clearTimeout(t);
  }, [showText, chars, full.length]);

  const displayedLines = full.slice(0, chars).split("\n");

  return (
    <div className="h-full flex flex-col gap-2.5">
      {/* Browser chrome */}
      <div className="bg-[#f3f4f6] rounded-lg border border-[#e5e5e5] px-3 py-2 flex items-center gap-2 shrink-0">
        <div className="flex gap-1 shrink-0">
          <div className="w-2 h-2 rounded-full bg-[#fc615d]" />
          <div className="w-2 h-2 rounded-full bg-[#fdbc40]" />
          <div className="w-2 h-2 rounded-full bg-[#35c759]" />
        </div>
        <div className="flex-1 bg-white rounded border border-[#e5e5e5] px-2 py-0.5 text-[10px] text-[#9ca3af] truncate">
          {url || "https://yoursite.com"}
        </div>
      </div>
      {/* Browser body */}
      <div className="flex-1 bg-[#fafafa] rounded-lg border border-[#f0f0f0] p-4 overflow-hidden">
        <AnimatePresence mode="wait">
          {!showText ? (
            <motion.div key="skeleton" exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-2.5 animate-pulse">
              <div className="h-2.5 bg-[#e5e7eb] rounded-full w-3/4" />
              <div className="h-2.5 bg-[#e5e7eb] rounded-full w-full" />
              <div className="h-2.5 bg-[#e5e7eb] rounded-full w-5/6" />
              <div className="h-2.5 bg-[#e5e7eb] rounded-full w-2/3" />
              <div className="h-2.5 bg-[#e5e7eb] rounded-full w-4/5" />
            </motion.div>
          ) : (
            <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-2">
              {displayedLines.map((line, i) => (
                <div key={i} className="flex items-start gap-2">
                  {line && <span className="text-[#5B2D91] text-[11px] shrink-0 mt-0.5">✓</span>}
                  <span className="font-mono text-[12px] text-[#374151]">
                    {line}
                    {i === displayedLines.length - 1 && chars < full.length && (
                      <span className="animate-pulse">|</span>
                    )}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── SHOWCASE — SCENE 2: PROMPTS ──────────────────────────────────────────────

function Scene2({ brandName, category, competitors }: {
  brandName: string; category: string; competitors: string[];
}) {
  const comp0 = competitors[0] || "Jasper";
  const cat = category?.split(" ")[0]?.toLowerCase() || "marketing";
  const prompts = [
    `What are the best ${cat} tools?`,
    `Alternatives to ${comp0} for bloggers?`,
    `Compare ${brandName || "your brand"} vs ${comp0}`,
    `Best SEO tools for entrepreneurs?`,
  ];

  return (
    <div className="h-full flex flex-col justify-center gap-2">
      {prompts.map((prompt, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.28, duration: 0.32, ease: "easeOut" }}
          className="rounded-lg px-3 py-2.5 bg-white text-[12px] text-[#374151] leading-snug"
          style={{ border: "1px solid #e5e5e5", borderLeft: "2.5px solid #5B2D91" }}
        >
          {prompt}
        </motion.div>
      ))}
    </div>
  );
}

// ─── SHOWCASE — SCENE 3: FIRING ───────────────────────────────────────────────

function Scene3() {
  const [promptNum, setPromptNum] = useState(1);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const id = setInterval(() => {
      setPromptNum((n) => (n < 10 ? n + 1 : 1));
      setProgress((p) => (p < 100 ? p + 10 : 10));
    }, 800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="h-full flex flex-col justify-center gap-6">
      {/* Split row */}
      <div className="flex items-center gap-4">
        {/* Left: prompt stack */}
        <div className="flex flex-col gap-1.5 shrink-0">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-[72px] h-6 rounded-md bg-[#5B2D91]/10 border border-[#5B2D91]/20 flex items-center px-2">
              <div className="w-full h-1 bg-[#5B2D91]/30 rounded-full" />
            </div>
          ))}
        </div>

        {/* Arrow track */}
        <div className="flex-1 relative flex items-center h-8">
          <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-[#5B2D91]/25" />
          <motion.div
            className="absolute"
            animate={{ x: [-8, 36], opacity: [0, 1, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowRight className="w-4 h-4 text-[#5B2D91]" />
          </motion.div>
        </div>

        {/* Right: ChatGPT */}
        <div className="w-14 h-14 bg-white rounded-xl border border-[#e5e5e5] flex items-center justify-center shrink-0">
          <img
            src="https://www.google.com/s2/favicons?domain=chatgpt.com&sz=32"
            alt="ChatGPT"
            width={26}
            height={26}
            className="rounded-md"
          />
        </div>
      </div>

      {/* Counter + progress */}
      <div>
        <p className="text-[12px] text-[#6b7280] mb-2">
          Firing prompt <span className="font-semibold text-[#5B2D91]">{promptNum}/10</span>...
        </p>
        <div className="h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#5B2D91] rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── SHOWCASE — SCENE 4: RESULTS ──────────────────────────────────────────────

function Scene4({ brandName, competitors }: { brandName: string; competitors: string[] }) {
  const comp0 = competitors[0] || "Jasper";
  const comp1 = competitors[1] || "Writesonic";
  const comp2 = competitors[2] || "Copy.ai";
  const brand = brandName || "Your Brand";

  const rows = [
    { name: comp0,  pct: 85, highlight: false },
    { name: comp1,  pct: 70, highlight: false },
    { name: brand,  pct: 42, highlight: true  },
    { name: comp2,  pct: 35, highlight: false },
  ];

  return (
    <div className="h-full flex flex-col justify-center gap-4">
      {/* Score */}
      <div className="flex items-baseline gap-1">
        <motion.span
          className="text-[44px] font-bold text-[#0a0a0a] leading-none"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
        >
          72
        </motion.span>
        <span className="text-[18px] text-[#9ca3af]">/100</span>
      </div>

      {/* Competitor bars */}
      <div className="space-y-1.5">
        {rows.map((row, i) => (
          <motion.div
            key={row.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 + 0.15 }}
            className={`px-2 py-1.5 rounded-lg ${row.highlight ? "bg-[#5B2D91]/[0.06]" : ""}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[11px] font-medium ${row.highlight ? "text-[#5B2D91]" : "text-[#374151]"}`}>
                {row.highlight ? "→ " : ""}{row.name}
              </span>
              <span className={`text-[11px] font-semibold ${row.highlight ? "text-[#5B2D91]" : "text-[#9ca3af]"}`}>
                {row.pct}%
              </span>
            </div>
            <div className="h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: row.highlight ? "#5B2D91" : "#d1d5db" }}
                initial={{ width: 0 }}
                animate={{ width: `${row.pct}%` }}
                transition={{ duration: 0.55, delay: i * 0.1 + 0.3, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── ANIMATED SHOWCASE ────────────────────────────────────────────────────────

const SCENES_META = [
  { title: "Scanning your website...",    subtitle: "Extracting brand profile automatically"    },
  { title: "Building targeted prompts...", subtitle: "10 queries based on your brand"            },
  { title: "Querying ChatGPT...",          subtitle: "Analyzing every mention and position"      },
  { title: "Audit complete!",              subtitle: "See your score and fix list"               },
];

function AnimatedShowcase({ profile }: { profile: BrandProfile }) {
  const [scene, setScene] = useState(0);
  const [paused, setPaused] = useState(false);
  const [timerKey, setTimerKey] = useState(0);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setScene((s) => (s + 1) % 4), 3000);
    return () => clearInterval(id);
  }, [paused, timerKey]);

  function goToScene(i: number) {
    setScene(i);
    setTimerKey((k) => k + 1);
  }

  const competitors = profile.competitors ?? [];

  return (
    <div>
      {/* Animated card */}
      <div
        className="bg-white border border-[#e5e5e5] rounded-xl p-5 overflow-hidden cursor-default"
        style={{ height: 280 }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={scene}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            {scene === 0 && (
              <Scene1
                url={profile.url || ""}
                brandName={profile.brand_name}
                category={profile.category}
                targetUsers={profile.target_users}
              />
            )}
            {scene === 1 && (
              <Scene2
                brandName={profile.brand_name}
                category={profile.category}
                competitors={competitors}
              />
            )}
            {scene === 2 && <Scene3 />}
            {scene === 3 && (
              <Scene4
                brandName={profile.brand_name}
                competitors={competitors}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Labels */}
      <div className="mt-3">
        <p className="text-[14px] font-semibold text-[#0a0a0a]">{SCENES_META[scene].title}</p>
        <p className="text-[12px] text-[#9ca3af] mt-0.5">{SCENES_META[scene].subtitle}</p>
      </div>

      {/* Dot indicators */}
      <div className="flex items-center gap-2 mt-3">
        {SCENES_META.map((_, i) => (
          <button key={i} onClick={() => goToScene(i)} className="flex items-center justify-center w-5 h-5">
            {i === scene ? (
              <div className="relative w-2.5 h-2.5">
                <div className="absolute inset-0 rounded-full bg-[#5B2D91]/30 animate-ping" />
                <div className="relative w-2.5 h-2.5 rounded-full bg-[#5B2D91]" />
              </div>
            ) : (
              <div className="w-2 h-2 rounded-full bg-[#d1d5db] hover:bg-[#9ca3af] transition-colors" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── COMPACT FEATURE GRID ─────────────────────────────────────────────────────

const COMPACT_FEATURES = [
  { icon: <TrendingUp className="w-3.5 h-3.5" />, title: "Visibility rankings",       desc: "Track brand share of voice against competitors"      },
  { icon: <Search     className="w-3.5 h-3.5" />, title: "Competitor intelligence",   desc: "See who AI recommends instead of you"                },
  { icon: <RefreshCw  className="w-3.5 h-3.5" />, title: "Weekly tracking",           desc: "Fresh audit data every week automatically"           },
  { icon: <Globe      className="w-3.5 h-3.5" />, title: "Diagnosis checklist",       desc: "Know exactly why you're invisible to AI"             },
  { icon: <Code       className="w-3.5 h-3.5" />, title: "llms.txt generator",        desc: "One-click generation of your llms.txt file"          },
  { icon: <Users      className="w-3.5 h-3.5" />, title: "SaaS-focused",              desc: "Built for SaaS founders, not agencies"               },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export interface BrandProfileEditorProps {
  profile: BrandProfile;
  onConfirm: (profile: BrandProfile) => void;
  isAuditing: boolean;
  onReset?: () => void;
}

export function BrandProfileEditor({ profile: initialProfile, onConfirm, isAuditing, onReset }: BrandProfileEditorProps) {
  const [profile, setProfile] = useState<BrandProfile>(initialProfile);
  const [selectedType, setSelectedType] = useState<"brand" | "agency">("brand");
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  const domain = getDomain(profile.url);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="flex min-h-screen">

        {/* ─ LEFT COLUMN ─ */}
        <div className="flex-1 overflow-y-auto py-10 px-6 md:px-10 lg:px-14 bg-white" style={{ maxWidth: 640 }}>
          <div className="max-w-[520px]">

            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5B2D91] mb-6">
              Comly — AI Visibility Audit
            </p>

            <div className="space-y-5">

              <Field label="Brand URL">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`} alt={domain} width={16} height={16} className="rounded-sm" />
                  </div>
                  <input type="url" value={profile.url} onChange={(e) => setProfile((p) => ({ ...p, url: e.target.value }))} className={`${inputCls} pl-9`} />
                </div>
              </Field>

              <Field label="Brand name">
                <input type="text" value={profile.brand_name} onChange={(e) => setProfile((p) => ({ ...p, brand_name: e.target.value }))} className={inputCls} />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Category">
                  <input type="text" value={profile.category} onChange={(e) => setProfile((p) => ({ ...p, category: e.target.value }))} className={inputCls} />
                </Field>
                <Field label="Target users">
                  <input type="text" value={profile.target_users} onChange={(e) => setProfile((p) => ({ ...p, target_users: e.target.value }))} className={inputCls} />
                </Field>
              </div>

              <Field label="Competitors">
                <div className="w-full px-3 py-2 bg-white border border-[#d1d5db] rounded-lg min-h-[46px] focus-within:border-[#5B2D91] transition-colors">
                  <TagInput tags={profile.competitors ?? []} onChange={(tags) => setProfile((p) => ({ ...p, competitors: tags }))} placeholder="competitor" />
                </div>
              </Field>

              <Field label="Main use cases">
                <div className="w-full px-3 py-2 bg-white border border-[#d1d5db] rounded-lg min-h-[46px] focus-within:border-[#5B2D91] transition-colors">
                  <TagInput tags={profile.main_use_cases ?? []} onChange={(tags) => setProfile((p) => ({ ...p, main_use_cases: tags }))} placeholder="use case" />
                </div>
              </Field>
            </div>

            <div className="mt-8 pb-10">
              <button
                onClick={() => onConfirm(profile)}
                disabled={isAuditing}
                className="w-full h-11 bg-[#5B2D91] text-white text-sm font-semibold rounded-lg hover:bg-[#4a2478] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5"
              >
                Run AI Audit
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center text-xs text-[#aaaaaa] mt-2.5">
                Takes about 60 seconds · No credit card required
              </p>
            </div>
          </div>
        </div>

        {/* ─ RIGHT COLUMN ─ */}
        <div className="hidden lg:flex flex-1 flex-col sticky top-0 overflow-y-auto items-center" style={{ height: "100vh" }}>
          <div className="p-6 py-10 w-full max-w-[520px]">

            <AnimatedShowcase profile={profile} />

            {/* Compact feature grid */}
            <div className="mt-6 bg-white border border-[#e5e5e5] rounded-xl overflow-hidden">
              <div className="grid grid-cols-2">
                {COMPACT_FEATURES.map((f, i) => {
                  const isLastRow = i >= COMPACT_FEATURES.length - 2;
                  const isRight = i % 2 === 1;
                  return (
                    <div
                      key={i}
                      className={`p-3.5 flex items-start gap-2.5 ${!isLastRow ? "border-b border-[#f3f4f6]" : ""} ${!isRight ? "border-r border-[#f3f4f6]" : ""}`}
                    >
                      <div className="text-[#9ca3af] shrink-0 mt-0.5">{f.icon}</div>
                      <div>
                        <p className="text-[12px] font-semibold text-[#0a0a0a] mb-0.5">{f.title}</p>
                        <p className="text-[11px] text-[#9ca3af] leading-snug">{f.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#5B2D91] text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2 whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  );
}
