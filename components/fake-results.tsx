"use client";

import { useRouter } from "next/navigation";
import { Lock, TrendingDown, ChevronRight, RotateCcw, ArrowUpRight, MessageCircle, ThumbsUp } from "lucide-react";
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
  { sub: "r/SaaS",         votes: "3.1k", comments: 84,  domain: "reddit.com" },
  { sub: "r/Entrepreneur", votes: "2.4k", comments: 57,  domain: "reddit.com" },
  { sub: "r/startups",     votes: "1.8k", comments: 39,  domain: "reddit.com" },
  { sub: "Quora",          votes: "942",  comments: 21,  domain: "quora.com"  },
];

function BlurRow({ children, height = "h-2.5" }: { children?: React.ReactNode; height?: string }) {
  return (
    <div className={`${height} bg-[#eeeeee] rounded-full`} style={{ filter: "blur(2px)" }}>
      {children}
    </div>
  );
}

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
  const R = 44;
  const circ = 2 * Math.PI * R;
  const offset = circ - (score / 100) * circ;
  const ringColor = score >= 60 ? "#10b981" : "#f59e0b";
  const competitors = (profile.competitors ?? []).slice(0, 3).filter(Boolean);
  while (competitors.length < 3) competitors.push("Competitor");

  function unlock() { router.push("/subscribe"); }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #f3eeff 0%, #ede0ff 40%, #f7f3ff 100%)" }}>

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#e5e5e5] px-5 h-[52px] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={`https://www.google.com/s2/favicons?domain=${url}&sz=32`}
            width={18} height={18} className="rounded shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <span className="font-semibold text-[#0a0a0a] text-sm truncate">{profile.brand_name}</span>
          <span className="text-[#cccccc] shrink-0 hidden sm:block">·</span>
          <span className="text-[#aaaaaa] text-xs truncate hidden sm:block">{url}</span>
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full">
            Preview
          </span>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <button onClick={onReset} className="hidden sm:flex items-center gap-1.5 text-xs text-[#aaaaaa] hover:text-[#6b6b6b] transition-colors">
            <RotateCcw className="w-3 h-3" /> Start over
          </button>
          <button onClick={unlock} className="flex items-center gap-1.5 text-sm font-bold text-[#5B2D91] hover:text-[#4a2475] transition-colors">
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Unlock full report</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-2xl mx-auto px-4 pt-10 pb-40 space-y-4">

        {/* Headline */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-[24px] sm:text-[30px] font-extrabold text-[#0a0a0a] leading-tight [font-family:var(--font-outfit)]">
            <span className="text-[#5B2D91]">{profile.brand_name}&apos;s</span> AI Visibility Report
          </h1>
          <p className="text-sm text-[#6b6b6b] mt-1.5">
            Audited across ChatGPT, Claude, Gemini &amp; Perplexity — 25 prompts fired
          </p>
        </motion.div>

        {/* ── Score card ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

              {/* Ring */}
              <div className="flex flex-col items-center shrink-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#aaaaaa] mb-3">AI Visibility Score</p>
                <div className="relative">
                  <svg width="110" height="110" className="-rotate-90">
                    <circle cx="55" cy="55" r={R} fill="none" stroke="#f0f0f0" strokeWidth="8" />
                    <circle cx="55" cy="55" r={R} fill="none" stroke={ringColor} strokeWidth="8"
                      strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                      style={{ transition: "stroke-dashoffset 1.2s ease" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[32px] font-black text-[#0a0a0a] leading-none">{score}</span>
                    <span className="text-[10px] text-[#aaaaaa] font-bold">/100</span>
                  </div>
                </div>
                <p className="text-[11px] text-amber-600 font-semibold mt-2 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" /> Needs improvement
                </p>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px self-stretch bg-[#f0f0f0]" />

              {/* Stats + models */}
              <div className="flex-1 w-full space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Prompts Hit",   value: "8 / 25"  },
                    { label: "Avg. Position", value: "#4"      },
                    { label: "Models Tracked",value: "4"       },
                    { label: "Competitor Gap", value: "−31pts" },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-[#fafafa] rounded-xl border border-[#f0f0f0] px-3.5 py-3 relative overflow-hidden">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-[#aaaaaa] mb-1">{label}</p>
                      <div style={{ filter: "blur(5px)" }} className="select-none pointer-events-none">
                        <p className="text-[18px] font-black text-[#0a0a0a]">{value}</p>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/95 rounded-lg px-2 py-1 flex items-center gap-1 border border-[#e8e8e8] shadow-sm">
                          <Lock className="w-2.5 h-2.5 text-[#5B2D91]" />
                          <span className="text-[10px] font-semibold text-[#5B2D91]">Locked</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Models */}
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#aaaaaa] mb-2.5">Audited across</p>
                  <div className="flex items-center gap-4">
                    {MODELS.map(({ domain, name }) => (
                      <div key={domain} className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 rounded-xl overflow-hidden bg-[#f7f7f7] border border-[#eee] flex items-center justify-center">
                          <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                            width={24} height={24} alt={name} className="rounded" />
                        </div>
                        <span className="text-[9px] text-[#aaaaaa] font-medium">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Competitor Rankings ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#f5f5f5] flex items-center justify-between">
            <div>
              <p className="font-bold text-[#0a0a0a] text-[14px]">Competitor Rankings</p>
              <p className="text-[11px] text-[#6b6b6b] mt-0.5">These brands rank ahead of you in AI responses</p>
            </div>
            <span className="text-[10px] font-bold bg-red-50 text-red-500 border border-red-100 px-2.5 py-1 rounded-full shrink-0">
              {competitors.length} ahead
            </span>
          </div>
          <div className="divide-y divide-[#f7f7f7]">
            {competitors.map((comp, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <span className="text-[12px] font-bold text-[#cccccc] w-4 shrink-0">{i + 1}</span>
                <div className="w-6 h-6 rounded bg-[#f0f0f0] shrink-0" style={{ filter: "blur(3px)" }} />
                <div className="flex-1 space-y-1" style={{ filter: "blur(5px)" }}>
                  <div className="h-3 bg-[#e8e8e8] rounded-full w-32" />
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 tabular-nums" style={{ filter: "blur(4px)" }}>
                  {82 - i * 5}% visibility
                </span>
                <Lock className="w-3 h-3 text-[#dddddd] shrink-0" />
              </div>
            ))}
            {/* Your row */}
            <div className="flex items-center gap-4 px-5 py-3.5 bg-[#fdfcff]"
              style={{ borderLeft: "3px solid #5B2D91" }}>
              <span className="text-[12px] font-bold text-[#5B2D91] w-4 shrink-0">{competitors.length + 1}</span>
              <img src={`https://www.google.com/s2/favicons?domain=${url}&sz=32`}
                width={22} height={22} className="rounded shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <div className="flex-1">
                <span className="text-[13px] font-bold text-[#5B2D91]">{profile.brand_name}</span>
                <span className="ml-2 text-[9px] bg-[#f3eeff] text-[#5B2D91] border border-[#ddd0f5] px-1.5 py-0.5 rounded-full font-bold">You</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${score}%` }} />
                </div>
                <span className="text-[11px] font-semibold text-amber-600 tabular-nums">{score}%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── What AI says ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#f5f5f5] flex items-center justify-between">
            <div>
              <p className="font-bold text-[#0a0a0a] text-[14px]">What AI says about you</p>
              <p className="text-[11px] text-[#6b6b6b] mt-0.5">Responses from 25 fired prompts</p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#5B2D91]">
              <Lock className="w-3 h-3" /> 25 locked
            </div>
          </div>
          <div className="p-5 space-y-4">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 mt-0.5 border border-[#f0f0f0]">
                  <img src={`https://www.google.com/s2/favicons?domain=${MODELS[i].domain}&sz=32`}
                    width={28} height={28} alt={MODELS[i].name} />
                </div>
                <div className="flex-1 space-y-1.5" style={{ filter: "blur(5px)" }}>
                  <div className="h-2.5 bg-[#eeeeee] rounded-full w-full" />
                  <div className="h-2.5 bg-[#eeeeee] rounded-full w-[85%]" />
                  <div className="h-2.5 bg-[#eeeeee] rounded-full w-[60%]" />
                </div>
              </div>
            ))}
            <div className="mt-1 rounded-xl border border-[#ede0ff] bg-[#faf5ff] px-4 py-3.5 flex items-center gap-3">
              <Lock className="w-4 h-4 text-[#5B2D91] shrink-0" />
              <div className="flex-1">
                <p className="text-[12px] font-bold text-[#0a0a0a]">23 more AI responses locked</p>
                <p className="text-[11px] text-[#6b6b6b]">See exactly where you appear — and where you don&apos;t</p>
              </div>
              <button onClick={unlock} className="shrink-0 text-[11px] font-bold text-[#5B2D91] hover:underline whitespace-nowrap">
                Unlock →
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Reddit / Sources ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#f5f5f5] flex items-center justify-between">
            <div>
              <p className="font-bold text-[#0a0a0a] text-[14px]">Sources &amp; Threads to Engage</p>
              <p className="text-[11px] text-[#6b6b6b] mt-0.5">Communities where your competitors are getting cited — engage to rank higher</p>
            </div>
            <span className="text-[10px] font-bold bg-[#f3eeff] text-[#5B2D91] border border-[#ddd0f5] px-2.5 py-1 rounded-full shrink-0">
              47 found
            </span>
          </div>
          <div className="divide-y divide-[#f7f7f7]">
            {FAKE_THREADS.map(({ sub, votes, comments, domain }, i) => (
              <div key={i} className="flex items-start gap-3.5 px-5 py-3.5">
                <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 mt-0.5 border border-[#f0f0f0]">
                  <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                    width={28} height={28} alt={sub} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-[#5B2D91] mb-0.5">{sub}</p>
                  <div style={{ filter: "blur(5px)" }} className="select-none pointer-events-none">
                    <div className="h-2.5 bg-[#eeeeee] rounded-full w-full mb-1" />
                    <div className="h-2.5 bg-[#eeeeee] rounded-full w-3/4" />
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-[10px] text-[#aaaaaa]">
                      <ThumbsUp className="w-2.5 h-2.5" /> {votes}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-[#aaaaaa]">
                      <MessageCircle className="w-2.5 h-2.5" /> {comments}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 mt-1">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#e5e5e5] text-[10px] font-bold text-[#aaaaaa] cursor-not-allowed">
                    <Lock className="w-2.5 h-2.5" /> Engage
                  </div>
                </div>
              </div>
            ))}
            <div className="px-5 py-3.5 flex items-center gap-3 bg-[#faf5ff]">
              <ArrowUpRight className="w-4 h-4 text-[#5B2D91] shrink-0" />
              <p className="text-[12px] font-bold text-[#5B2D91] flex-1">
                43 more threads &amp; sources locked — engage to get cited by AI
              </p>
              <button onClick={unlock} className="shrink-0 text-[11px] font-bold text-[#5B2D91] hover:underline whitespace-nowrap">
                Unlock →
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Fix plan ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}
          className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#f5f5f5] flex items-center justify-between">
            <div>
              <p className="font-bold text-[#0a0a0a] text-[14px]">Your Fix Plan</p>
              <p className="text-[11px] text-[#6b6b6b] mt-0.5">Personalized actions ranked by AI visibility impact</p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#5B2D91]">
              <Lock className="w-3 h-3" /> 8 actions
            </div>
          </div>
          <div className="p-5 space-y-3">
            {[
              { impact: "+18%", w: "w-[85%]" },
              { impact: "+12%", w: "w-[72%]" },
              { impact: "+9%",  w: "w-[60%]" },
              { impact: "+7%",  w: "w-[48%]" },
            ].map(({ impact, w }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-[#e5e5e5] shrink-0" />
                <div className="flex-1" style={{ filter: "blur(4px)" }}>
                  <div className={`h-2.5 bg-[#eeeeee] rounded-full ${w}`} />
                </div>
                <span className="text-[10px] font-bold text-emerald-600 shrink-0">{impact}</span>
              </div>
            ))}
            <div className="mt-1 rounded-xl border border-[#ede0ff] bg-[#faf5ff] px-4 py-3 flex items-center gap-3">
              <Lock className="w-3.5 h-3.5 text-[#5B2D91] shrink-0" />
              <p className="text-[11px] text-[#6b6b6b] flex-1">4 more high-impact fixes — tools like llms.txt generator, comparison pages &amp; more</p>
              <button onClick={unlock} className="shrink-0 text-[11px] font-bold text-[#5B2D91] hover:underline whitespace-nowrap">
                Unlock →
              </button>
            </div>
          </div>
        </motion.div>

      </div>

      {/* ── Sticky CTA ── */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#e5e5e5] shadow-[0_-8px_40px_rgba(91,45,145,0.12)]">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-bold text-[#0a0a0a] text-[14px] leading-tight">Your full report is ready</p>
            <p className="text-[11px] text-[#6b6b6b] mt-0.5 hidden sm:block">
              All 25 AI responses, competitor rankings, 47 threads &amp; your personalized fix plan
            </p>
          </div>
          <button
            onClick={unlock}
            className="shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
            style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}
          >
            <Lock className="w-3.5 h-3.5" />
            Unlock full report
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
