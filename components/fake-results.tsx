"use client";

import { useRouter } from "next/navigation";
import { Lock, TrendingDown, ChevronRight, RotateCcw, MessageCircle, ThumbsUp, Flame } from "lucide-react";
import { BrandProfile } from "@/types";
import { motion } from "framer-motion";

function getFakeScore(url: string): number {
  let hash = 0;
  for (const c of url) hash = (hash * 31 + c.charCodeAt(0)) % 100;
  return 35 + (hash % 31);
}

const MODELS = [
  { domain: "chatgpt.com",       name: "ChatGPT"    },
  { domain: "claude.ai",         name: "Claude"     },
  { domain: "gemini.google.com", name: "Gemini"     },
  { domain: "perplexity.ai",     name: "Perplexity" },
];

const FAKE_THREADS = [
  { sub: "r/SaaS",         votes: "3.1k", comments: 84, domain: "reddit.com" },
  { sub: "r/Entrepreneur", votes: "2.4k", comments: 57, domain: "reddit.com" },
  { sub: "r/startups",     votes: "1.8k", comments: 39, domain: "reddit.com" },
  { sub: "Quora",          votes: "942",  comments: 21, domain: "quora.com"  },
];

export function FakeResultsPreview({
  profile,
  url,
  onReset,
}: {
  profile: BrandProfile;
  url: string;
  onReset: () => void;
}) {
  const router = useRouter();
  const score = getFakeScore(url);
  const R = 56;
  const circ = 2 * Math.PI * R;
  const offset = circ - (score / 100) * circ;
  const ringColor = score >= 60 ? "#10b981" : "#f59e0b";
  const competitors = (profile.competitors ?? []).slice(0, 3).filter(Boolean);
  while (competitors.length < 3) competitors.push("Competitor");

  function unlock() { router.push("/subscribe"); }

  const card = "bg-white rounded-2xl border border-[#e2e2e2] shadow-sm overflow-hidden";

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(150deg, #ece6f8 0%, #e0d5f5 50%, #ede8fb 100%)" }}>

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-[#e2e2e2] px-6 h-[52px] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <img src={`https://www.google.com/s2/favicons?domain=${url}&sz=32`}
            width={16} height={16} className="rounded shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <span className="font-semibold text-[#0a0a0a] text-sm truncate">{profile.brand_name}</span>
          <span className="text-[#d0d0d0] shrink-0">·</span>
          <span className="text-[#aaaaaa] text-xs hidden md:block">{url}</span>
          <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
            Preview
          </span>
        </div>
        <div className="flex items-center gap-5 shrink-0">
          <button onClick={onReset} className="hidden sm:flex items-center gap-1.5 text-xs text-[#aaaaaa] hover:text-[#555] transition-colors">
            <RotateCcw className="w-3 h-3" /> Start over
          </button>
          <button onClick={unlock} className="flex items-center gap-1.5 text-sm font-bold text-[#5B2D91] hover:text-[#4a2475] transition-colors">
            <Lock className="w-3.5 h-3.5" /> Unlock full report <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-32">

        {/* Page title */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          className="mb-6">
          <h1 className="text-[28px] sm:text-[36px] font-extrabold text-[#0a0a0a] leading-tight [font-family:var(--font-outfit)]">
            <span className="text-[#5B2D91]">{profile.brand_name}&apos;s</span> AI Visibility Report
          </h1>
          <p className="text-sm text-[#777] mt-1">Audited across 4 AI models — 25 prompts fired</p>
        </motion.div>

        {/* ── 2-col grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">

          {/* LEFT COLUMN */}
          <div className="space-y-4">

            {/* Score card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}
              className={card}>
              <div className="px-5 pt-5 pb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#aaaaaa] mb-4">AI Visibility Score</p>
                <div className="flex items-center gap-5">
                  <div className="relative shrink-0">
                    <svg width="128" height="128" className="-rotate-90">
                      <circle cx="64" cy="64" r={R} fill="none" stroke="#f0eef8" strokeWidth="10" />
                      <circle cx="64" cy="64" r={R} fill="none" stroke={ringColor} strokeWidth="10"
                        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                        style={{ transition: "stroke-dashoffset 1.3s ease" }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[42px] font-black text-[#0a0a0a] leading-none">{score}</span>
                      <span className="text-[11px] text-[#aaaaaa] font-semibold">/100</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" /> Needs improvement
                    </p>
                    <p className="text-[12px] text-[#6b6b6b] leading-relaxed">
                      Your brand appears in <span className="font-bold text-[#0a0a0a]">{Math.round(score / 12)} of 25</span> AI responses.
                    </p>
                    <p className="text-[11px] text-[#aaaaaa]">{competitors.length} competitors rank ahead.</p>
                  </div>
                </div>
              </div>

              {/* Stats 2×2 */}
              <div className="grid grid-cols-2 gap-px bg-[#f0f0f0] border-t border-[#f0f0f0] mt-3">
                {[
                  { label: "Prompts Hit",   v: `${Math.round(score / 12)}/25` },
                  { label: "Avg. Position", v: "#4"    },
                  { label: "Models Cited",  v: "2/4"   },
                  { label: "Competitor Gap",v: "−31pt" },
                ].map(({ label, v }) => (
                  <div key={label} className="bg-white px-4 py-3 relative overflow-hidden">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#aaaaaa] mb-0.5">{label}</p>
                    <p className="text-[18px] font-black text-[#0a0a0a] select-none" style={{ filter: "blur(6px)" }}>{v}</p>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/95 rounded-md px-1.5 py-0.5 flex items-center gap-1 border border-[#ebebeb]">
                        <Lock className="w-2.5 h-2.5 text-[#5B2D91]" />
                        <span className="text-[9px] font-bold text-[#5B2D91]">Locked</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Models */}
              <div className="px-5 py-4 border-t border-[#f5f5f5]">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#aaaaaa] mb-3">Audited across</p>
                <div className="flex items-center gap-3">
                  {MODELS.map(({ domain, name }) => (
                    <div key={domain} className="flex flex-col items-center gap-1">
                      <div className="w-9 h-9 rounded-xl bg-[#fafafa] border border-[#eeeeee] flex items-center justify-center">
                        <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                          width={22} height={22} alt={name} className="rounded" />
                      </div>
                      <span className="text-[9px] text-[#aaaaaa]">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Fix plan */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}
              className={card}>
              <div className="px-5 py-4 border-b border-[#f5f5f5] flex items-center justify-between">
                <p className="font-bold text-[#0a0a0a] text-sm">Your Fix Plan</p>
                <div className="flex items-center gap-1 text-[10px] font-bold text-[#5B2D91]">
                  <Lock className="w-2.5 h-2.5" /> 8 actions
                </div>
              </div>
              <div className="p-4 space-y-2.5">
                {[
                  { w: "w-[88%]", impact: "+18%" },
                  { w: "w-[72%]", impact: "+12%" },
                  { w: "w-[60%]", impact: "+9%"  },
                  { w: "w-[48%]", impact: "+7%"  },
                ].map(({ w, impact }, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-[#e5e5e5] shrink-0" />
                    <div className="flex-1 h-2.5 bg-[#f0f0f0] rounded-full overflow-hidden" style={{ filter: "blur(3px)" }}>
                      <div className={`h-full ${w} bg-[#d4c4f0] rounded-full`} />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 shrink-0">{impact}</span>
                  </div>
                ))}
                <button onClick={unlock}
                  className="w-full mt-1 text-center text-[11px] font-bold text-[#5B2D91] py-2 rounded-lg border border-[#ede0ff] bg-[#faf5ff] hover:bg-[#f3eeff] transition-colors">
                  See all 8 fixes →
                </button>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">

            {/* Competitor rankings */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}
              className={card}>
              <div className="px-5 py-4 border-b border-[#f5f5f5] flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#0a0a0a] text-sm">Competitor Rankings</p>
                  <p className="text-[11px] text-[#888] mt-0.5">These brands rank ahead of you across all AI models</p>
                </div>
                <span className="text-[10px] font-bold bg-red-50 text-red-500 border border-red-100 px-2.5 py-1 rounded-full shrink-0">
                  {competitors.length} ahead
                </span>
              </div>
              <div className="divide-y divide-[#f5f5f5]">
                {competitors.map((comp, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                    <span className="text-[13px] font-bold text-[#cccccc] w-5 shrink-0 text-center">{i + 1}</span>
                    <div className="w-7 h-7 rounded-lg bg-[#f0f0f0] shrink-0" style={{ filter: "blur(4px)" }} />
                    <div className="flex-1" style={{ filter: "blur(5px)" }}>
                      <div className="h-3 bg-[#e8e8e8] rounded-full w-36" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-300" style={{ width: `${82 - i * 5}%`, filter: "blur(2px)" }} />
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-600 w-16 text-right tabular-nums" style={{ filter: "blur(5px)" }}>
                        {82 - i * 5}% visible
                      </span>
                    </div>
                    <Lock className="w-3 h-3 text-[#ddd] shrink-0" />
                  </div>
                ))}
                {/* Your row */}
                <div className="flex items-center gap-4 px-5 py-3.5 bg-[#fdfcff]" style={{ borderLeft: "3px solid #5B2D91" }}>
                  <span className="text-[13px] font-bold text-[#5B2D91] w-5 shrink-0 text-center">{competitors.length + 1}</span>
                  <img src={`https://www.google.com/s2/favicons?domain=${url}&sz=32`}
                    width={28} height={28} className="rounded-lg shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <div className="flex-1">
                    <span className="font-bold text-[#5B2D91] text-sm">{profile.brand_name}</span>
                    <span className="ml-2 text-[9px] bg-[#f3eeff] text-[#5B2D91] border border-[#ddd0f5] px-1.5 py-0.5 rounded-full font-bold align-middle">You</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: `${score}%` }} />
                    </div>
                    <span className="text-[11px] font-semibold text-amber-600 w-16 text-right tabular-nums">{score}% visible</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* What AI says */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }}
              className={card}>
              <div className="px-5 py-4 border-b border-[#f5f5f5] flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#0a0a0a] text-sm">What AI says about you</p>
                  <p className="text-[11px] text-[#888] mt-0.5">Responses from 25 prompts across all models</p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#5B2D91]">
                  <Lock className="w-3 h-3" /> 25 locked
                </div>
              </div>
              <div className="divide-y divide-[#f7f7f7]">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-start gap-3.5 px-5 py-3.5">
                    <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 mt-0.5 border border-[#eeeeee]">
                      <img src={`https://www.google.com/s2/favicons?domain=${MODELS[i].domain}&sz=32`}
                        width={28} height={28} alt={MODELS[i].name} />
                    </div>
                    <div className="flex-1 space-y-2" style={{ filter: "blur(5px)" }}>
                      <div className="h-2.5 bg-[#eeeeee] rounded-full w-full" />
                      <div className="h-2.5 bg-[#eeeeee] rounded-full w-[80%]" />
                      <div className="h-2.5 bg-[#eeeeee] rounded-full w-[55%]" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3.5 bg-[#faf5ff] border-t border-[#ede0ff] flex items-center gap-3">
                <Lock className="w-3.5 h-3.5 text-[#5B2D91] shrink-0" />
                <p className="text-[12px] font-semibold text-[#5B2D91] flex-1">22 more responses — see exactly where you rank</p>
                <button onClick={unlock} className="text-[11px] font-bold text-[#5B2D91] hover:underline shrink-0">Unlock →</button>
              </div>
            </motion.div>

            {/* Reddit threads */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}
              className={card}>
              <div className="px-5 py-4 border-b border-[#f5f5f5] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <p className="font-bold text-[#0a0a0a] text-sm">Sources &amp; Threads to Engage</p>
                  </div>
                  <p className="text-[11px] text-[#888] mt-0.5">Engage here to get cited by AI — your competitors already are</p>
                </div>
                <span className="text-[10px] font-bold bg-orange-50 text-orange-500 border border-orange-100 px-2.5 py-1 rounded-full shrink-0">
                  47 found
                </span>
              </div>
              <div className="divide-y divide-[#f7f7f7]">
                {FAKE_THREADS.map(({ sub, votes, comments, domain }, i) => (
                  <div key={i} className="flex items-center gap-3.5 px-5 py-3.5">
                    <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 border border-[#eeeeee]">
                      <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                        width={28} height={28} alt={sub} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-[#5B2D91] mb-0.5">{sub}</p>
                      <div style={{ filter: "blur(5px)" }} className="select-none pointer-events-none">
                        <div className="h-2.5 bg-[#eeeeee] rounded-full w-full" />
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-[10px] text-[#aaaaaa]">
                          <ThumbsUp className="w-2.5 h-2.5" /> {votes}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-[#aaaaaa]">
                          <MessageCircle className="w-2.5 h-2.5" /> {comments}
                        </span>
                      </div>
                    </div>
                    <button onClick={unlock}
                      className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-[11px] font-bold text-[#aaaaaa] hover:border-[#5B2D91] hover:text-[#5B2D91] transition-colors">
                      <Lock className="w-2.5 h-2.5" /> Engage
                    </button>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3.5 bg-[#faf5ff] border-t border-[#ede0ff] flex items-center justify-between">
                <p className="text-[12px] font-semibold text-[#5B2D91]">43 more threads locked</p>
                <button onClick={unlock} className="text-[11px] font-bold text-[#5B2D91] hover:underline">See all →</button>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* ── Sticky CTA ── */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#e2e2e2] shadow-[0_-8px_40px_rgba(91,45,145,0.1)]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
          <div className="min-w-0">
            <p className="font-bold text-[#0a0a0a] text-sm">Your full report is ready</p>
            <p className="text-[11px] text-[#777] mt-0.5 hidden sm:block">
              All 25 AI responses · Full competitor rankings · 47 threads · Personalized fix plan
            </p>
          </div>
          <button onClick={unlock}
            className="shrink-0 flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-white text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-150"
            style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}>
            <Lock className="w-3.5 h-3.5" />
            Unlock full report
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
