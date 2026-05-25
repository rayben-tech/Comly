"use client";

import { useRouter } from "next/navigation";
import { Lock, ChevronRight, ThumbsUp, MessageCircle, ArrowUpRight } from "lucide-react";
import { BrandProfile } from "@/types";
import { motion } from "framer-motion";

function getFakeScore(url: string): number {
  let hash = 0;
  for (const c of url) hash = (hash * 31 + c.charCodeAt(0)) % 100;
  return 35 + (hash % 31);
}

// Try to resolve a favicon domain from a competitor name
function compDomain(name: string): string {
  const map: Record<string, string> = {
    notion: "notion.so", asana: "asana.com", clickup: "clickup.com",
    monday: "monday.com", linear: "linear.app", jira: "atlassian.com",
    confluence: "confluence.com", trello: "trello.com", slack: "slack.com",
    figma: "figma.com", github: "github.com", gitlab: "gitlab.com",
    hubspot: "hubspot.com", salesforce: "salesforce.com", intercom: "intercom.com",
    zendesk: "zendesk.com", airtable: "airtable.com",
    basecamp: "basecamp.com", todoist: "todoist.com", webflow: "webflow.com",
    framer: "framer.com", shopify: "shopify.com", stripe: "stripe.com",
    chatgpt: "chatgpt.com", claude: "claude.ai", gemini: "gemini.google.com",
    perplexity: "perplexity.ai",
  };
  const key = name.toLowerCase().replace(/[\s.]+/g, "");
  return map[key] ?? `${key}.com`;
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

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

const card = {
  background: "#ffffff",
  border: "1px solid #e8e0f5",
  boxShadow: "0 4px 24px rgba(91,45,145,0.07)",
};

function ComlyLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg">
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

export function FakeResultsPreview({
  profile,
  url,
  onReset: _onReset,
}: {
  profile: BrandProfile;
  url: string;
  onReset: () => void;
}) {
  const router = useRouter();
  const score = getFakeScore(url);
  const mentions = Math.round(25 * score / 100);
  const avgPos = Math.max(3, Math.ceil((100 - score) / 18));
  const competitors = (profile.competitors ?? []).slice(0, 3).filter(Boolean);
  while (competitors.length < 3) competitors.push("Competitor");

  const compVis = [
    Math.min(97, score + 35),
    Math.min(92, score + 25),
    Math.min(88, score + 15),
  ];
  const R = 48;
  const circ = 2 * Math.PI * R;

  function unlock() { router.push("/subscribe"); }

  return (
    <div className="min-h-screen pb-24" style={{ background: "#f7f4fd" }}>

      {/* ── Comly branding header ── */}
      <div className="flex items-center justify-center gap-2.5 pt-6 pb-4">
        <ComlyLogo size={28} />
        <span className="font-bold text-[#0a0a0a] text-[17px] tracking-tight [font-family:var(--font-outfit)]">Comly</span>
      </div>

      {/* ── Hero title ── */}
      <div className="text-center pt-4 pb-10 px-6">
        <motion.h1 custom={0} initial="hidden" animate="visible" variants={fadeUp}
          className="text-[40px] sm:text-[54px] font-bold text-[#0a0a0a] leading-tight [font-family:var(--font-outfit)]">
          <span className="text-[#5B2D91]">{profile.brand_name}&apos;s</span>{" "}
          AI Visibility Report
        </motion.h1>
        <motion.p custom={1} initial="hidden" animate="visible" variants={fadeUp}
          className="text-[16px] mt-3 max-w-lg mx-auto leading-relaxed text-[#6b7280]">
          See where you rank, who&apos;s ahead, and how to close the gap.
        </motion.p>
      </div>

      <div className="max-w-4xl mx-auto px-6">

        {/* ── Score card ── */}
        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}
          className="rounded-2xl p-6 mb-10" style={card}>

          {/* Brand row */}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center bg-[#f3eeff] border border-[#e8e0f5]">
                <img src={`https://www.google.com/s2/favicons?domain=${url}&sz=32`}
                  width={32} height={32} alt={profile.brand_name} className="w-8 h-8 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
              <div>
                <p className="text-[16px] font-bold text-[#0a0a0a]">{profile.brand_name}</p>
                <p className="text-[12px] text-[#9ca3af]">{url}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold"
              style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" }}>
              <span className="w-2 h-2 rounded-full bg-[#22c55e] inline-block" />
              Visibility Score: {score}%
            </div>
          </div>

          {/* Score ring + visual stats */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-5">

            {/* Big score ring */}
            <div className="flex flex-col items-center shrink-0">
              <div className="relative">
                <svg width="120" height="120" className="-rotate-90" style={{ display: "block" }}>
                  <circle cx="60" cy="60" r={R} fill="none" stroke="#f0eeff" strokeWidth="10" />
                  <circle cx="60" cy="60" r={R} fill="none" stroke="#5B2D91" strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${circ * score / 100} ${circ}`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[34px] font-black text-[#0a0a0a] leading-none">{score}</span>
                  <span className="text-[11px] text-[#9ca3af] font-semibold">/100</span>
                </div>
              </div>
              <p className="text-[12px] font-semibold text-[#6b7280] mt-2">AI Visibility Score</p>
            </div>

            {/* Visual stat tiles */}
            <div className="flex-1 w-full space-y-3">

              {/* Prompts Hit — progress bar */}
              <div className="rounded-xl px-4 py-3 bg-[#faf5ff] border border-[#ede0ff]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] text-[#9ca3af] font-medium">Prompts Hit</span>
                  <span className="text-[15px] font-bold text-[#5B2D91]">{mentions}<span className="text-[11px] font-normal text-[#9ca3af]">/25</span></span>
                </div>
                <div className="h-2 bg-[#ede0ff] rounded-full overflow-hidden">
                  <div className="h-full bg-[#5B2D91] rounded-full transition-all"
                    style={{ width: `${(mentions / 25) * 100}%` }} />
                </div>
              </div>

              {/* Avg Position — gradient track */}
              <div className="rounded-xl px-4 py-3 bg-[#faf5ff] border border-[#ede0ff]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[12px] text-[#9ca3af] font-medium">Avg. Position</span>
                  <span className="text-[15px] font-bold text-[#5B2D91]">#{avgPos}</span>
                </div>
                <div className="relative h-2.5 rounded-full"
                  style={{ background: "linear-gradient(to right, #22c55e 0%, #84cc16 20%, #f59e0b 55%, #ef4444 100%)" }}>
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full bg-white border-[3px] border-[#5B2D91]"
                    style={{
                      left: `clamp(0px, calc(${Math.min(((avgPos - 1) / 7) * 100, 93)}% - 9px), calc(100% - 18px))`,
                      boxShadow: "0 2px 8px rgba(91,45,145,0.45)",
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] font-semibold text-[#22c55e]">#1 best</span>
                  <span className="text-[10px] font-semibold text-[#ef4444]">#8+ worst</span>
                </div>
              </div>

              {/* Competitors Ahead — avatar stack */}
              <div className="rounded-xl px-4 py-3 bg-[#faf5ff] border border-[#ede0ff]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] text-[#9ca3af] font-medium">Competitors Ahead</span>
                  <span className="text-[15px] font-bold text-[#5B2D91]">{competitors.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {competitors.map((c, i) => (
                      <div key={i} className="w-7 h-7 rounded-full overflow-hidden border-2 border-white bg-[#f3eeff] flex items-center justify-center"
                        style={{ marginLeft: i > 0 ? "-8px" : 0, zIndex: 3 - i }}>
                        <img src={`https://www.google.com/s2/favicons?domain=${compDomain(c)}&sz=32`}
                          width={28} height={28} className="w-full h-full object-contain"
                          onError={(e) => {
                            const t = e.target as HTMLImageElement;
                            t.style.display = "none";
                            const fb = t.nextElementSibling as HTMLElement | null;
                            if (fb) fb.style.display = "flex";
                          }} />
                        <span className="text-[9px] font-bold text-[#5B2D91] hidden items-center justify-center w-full h-full">
                          {c[0]?.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <span className="text-[11px] text-[#9ca3af]">ranking ahead of you</span>
                </div>
              </div>
            </div>
          </div>

          {/* Blurred mini trend chart */}
          <div className="pt-5 border-t border-[#f0ebff]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[13px] font-semibold text-[#0a0a0a]">Visibility Trend</span>
              <button onClick={unlock}
                className="flex items-center gap-1 text-[10px] font-bold text-[#5B2D91] bg-[#f3eeff] border border-[#ede0ff] px-2.5 py-1 rounded-full hover:bg-[#ede0ff] transition-colors">
                <Lock className="w-2.5 h-2.5" /> Track over time
              </button>
            </div>
            <div className="relative h-[80px] rounded-xl overflow-hidden" style={{ background: "#faf8ff", border: "1px solid #f0ebff" }}>
              {/* Decorative blurred chart */}
              <svg viewBox="0 0 100 80" preserveAspectRatio="none" className="absolute inset-0 w-full h-full"
                style={{ filter: "blur(2.5px)" }}>
                <defs>
                  <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5B2D91" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#5B2D91" stopOpacity={0} />
                  </linearGradient>
                </defs>
                {[20, 40, 60].map(y => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#e8e0f5" strokeWidth="0.5" />
                ))}
                <path d="M0,68 Q10,62 20,64 T40,52 T60,42 T80,34 T100,28 L100,80 L0,80 Z"
                  fill="url(#trendArea)" />
                <path d="M0,68 Q10,62 20,64 T40,52 T60,42 T80,34 T100,28"
                  fill="none" stroke="#5B2D91" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M0,50 Q10,46 20,48 T40,36 T60,26 T80,18 T100,12"
                  fill="none" stroke="#F4A535" strokeWidth="1.5" strokeDasharray="3 2" opacity={0.55} />
              </svg>
              {/* Lock overlay */}
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(250,248,255,0.45)" }}>
                <button onClick={unlock}
                  className="flex items-center gap-1.5 bg-white/95 rounded-lg px-3 py-1.5 border border-[#ede0ff] shadow-sm hover:shadow-md transition-shadow">
                  <Lock className="w-3 h-3 text-[#5B2D91]" />
                  <span className="text-[11px] font-bold text-[#5B2D91]">Unlock to track over time</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── How you compare ── */}
        <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
          <h2 className="text-[32px] sm:text-[42px] font-bold text-[#0a0a0a] text-center mb-1 [font-family:var(--font-outfit)]">
            How you compare
          </h2>
          <p className="text-center text-[15px] text-[#6b7280] mb-7">
            This is how you stack up against your competitors
          </p>

          <div className="rounded-2xl overflow-hidden" style={card}>
            <div className="overflow-x-auto">
              <div className="min-w-[520px]">

                <div className="grid grid-cols-[56px_1fr_160px_110px] px-6 py-3 text-[12px] font-semibold text-[#9ca3af]"
                  style={{ background: "#faf8ff", borderBottom: "1px solid #f0ebff" }}>
                  <span>Rank</span>
                  <span>Brand</span>
                  <span className="text-right">Visibility</span>
                  <span className="text-right pr-2">Avg. Position</span>
                </div>

                {/* Competitor rows — with real favicons */}
                {competitors.map((comp, i) => (
                  <div key={i} className="grid grid-cols-[56px_1fr_160px_110px] items-center px-6 py-5"
                    style={{ borderBottom: "1px solid #faf7ff" }}>
                    <span className="text-[18px] font-bold text-[#9ca3af]">{i + 1}</span>
                    <div className="flex items-center gap-3">
                      {/* Actual competitor favicon */}
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-[#f3eeff] border border-[#ede0ff] flex items-center justify-center">
                        <img src={`https://www.google.com/s2/favicons?domain=${compDomain(comp)}&sz=32`}
                          width={32} height={32} className="w-8 h-8 object-contain"
                          onError={(e) => {
                            const t = e.target as HTMLImageElement;
                            t.style.display = "none";
                            const fb = t.nextElementSibling as HTMLElement | null;
                            if (fb) fb.style.display = "flex";
                          }} />
                        <span className="text-[13px] font-bold text-[#5B2D91] hidden items-center justify-center w-full h-full">
                          {comp[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-[#0a0a0a]">{comp}</p>
                        <span className="text-[12px] font-medium text-[#22c55e]">↑ {compVis[i]}% visibility</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 h-2 rounded-full bg-[#f0ebff] overflow-hidden">
                          <div className="h-full rounded-full bg-[#22c55e] opacity-70"
                            style={{ width: `${compVis[i]}%` }} />
                        </div>
                        <span className="text-[13px] font-semibold text-[#22c55e] w-8">{compVis[i]}%</span>
                      </div>
                    </div>
                    <div className="text-right pr-2">
                      <span className="text-[15px] font-bold text-[#5B2D91]">#{i + 1}</span>
                      <p className="text-[10px] text-[#9ca3af]">avg. position</p>
                    </div>
                  </div>
                ))}

                {/* Your row */}
                <div className="grid grid-cols-[56px_1fr_160px_110px] items-center px-6 py-5 bg-[#f9f7ff]"
                  style={{ borderLeft: "4px solid #5B2D91", borderBottom: "1px solid #ede0ff" }}>
                  <span className="text-[18px] font-bold text-[#5B2D91]">{competitors.length + 1}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-[#ede0ff]">
                      <img src={`https://www.google.com/s2/favicons?domain=${url}&sz=32`}
                        width={40} height={40} className="w-full h-full object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-[14px] font-bold text-[#5B2D91]">{profile.brand_name}</p>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#ede9fe] text-[#5B2D91]">you</span>
                      </div>
                      <span className="text-[12px] font-medium text-[#f59e0b]">↑ {score}% visibility</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 h-2 rounded-full bg-[#f0ebff] overflow-hidden">
                        <div className="h-full rounded-full bg-[#5B2D91] opacity-70"
                          style={{ width: `${score}%` }} />
                      </div>
                      <span className="text-[13px] font-semibold text-[#5B2D91] w-8">{score}%</span>
                    </div>
                  </div>
                  <div className="text-right pr-2">
                    <span className="text-[15px] font-bold text-[#5B2D91]">#{competitors.length + 1}</span>
                    <p className="text-[10px] text-[#9ca3af]">avg. position</p>
                  </div>
                </div>

                {/* Locked rows */}
                {[competitors.length + 2, competitors.length + 3].map(rank => (
                  <div key={rank} className="grid grid-cols-[56px_1fr_auto] items-center px-6 py-4"
                    style={{ borderBottom: "1px solid #faf7ff" }}>
                    <span className="text-[18px] font-bold text-[#e8e0f5]">{rank}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#f5f0ff] shrink-0" style={{ filter: "blur(4px)" }} />
                      <div className="select-none" style={{ filter: "blur(5px)" }}>
                        <div className="h-4 rounded-full w-36 bg-[#ede0ff]" />
                        <div className="h-3 rounded-full w-24 bg-[#f3eeff] mt-2" />
                      </div>
                    </div>
                    <Lock className="w-4 h-4 text-[#ddd0f5] mr-2" />
                  </div>
                ))}

                <div className="px-6 py-5 flex justify-center" style={{ borderTop: "1px solid #f0ebff" }}>
                  <button onClick={unlock}
                    className="px-7 py-2.5 rounded-xl text-[14px] font-semibold border border-[#e8e0f5] text-[#6b7280] hover:border-[#5B2D91] hover:text-[#5B2D91] transition-colors bg-white">
                    See full comparison
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Where citations come from ── */}
        <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
          <h2 className="text-[32px] sm:text-[42px] font-bold text-[#0a0a0a] text-center mb-1 [font-family:var(--font-outfit)]">
            Where citations come from
          </h2>
          <p className="text-center text-[15px] text-[#6b7280] mb-7">
            AI platforms cite these sources when mentioning brands in your category
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
            {["reddit.com", "producthunt.com", "g2.com"].map(domain => (
              <div key={domain} className="flex flex-col items-center gap-3 py-5 px-3 rounded-2xl bg-white"
                style={{ border: "1px solid #e8e0f5", boxShadow: "0 2px 12px rgba(91,45,145,0.05)" }}>
                <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                  width={40} height={40} className="w-10 h-10 rounded-xl"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <span className="text-[12px] font-medium text-[#6b7280] text-center">
                  {domain.replace(".com", "")}
                </span>
              </div>
            ))}
            {[0, 1].map(i => (
              <div key={i} className="flex flex-col items-center gap-3 py-5 px-3 rounded-2xl bg-white"
                style={{ border: "1px solid #e8e0f5" }}>
                <div className="w-10 h-10 rounded-xl bg-[#f3eeff] border border-[#ede0ff] flex items-center justify-center">
                  <Lock className="w-4 h-4 text-[#c4b5fd]" />
                </div>
                <div className="h-3 rounded-full w-16 bg-[#ede0ff] select-none" style={{ filter: "blur(3px)" }} />
              </div>
            ))}
          </div>

          <div className="rounded-xl px-6 py-4 text-center text-[14px] bg-white mb-4"
            style={{ border: "1px solid #e8e0f5" }}>
            <span className="text-[#6b7280]">✦ Your brand appears in </span>
            <span className="font-bold text-[#0a0a0a]">{mentions} citations. </span>
            <span className="text-[#6b7280]">Competitors average </span>
            <span className="font-bold text-[#5B2D91]">{Math.round(mentions * 2.8)} citations.</span>
          </div>

          <div className="flex justify-center">
            <button onClick={unlock}
              className="px-7 py-2.5 rounded-xl text-[14px] font-semibold border border-[#e8e0f5] text-[#6b7280] hover:border-[#5B2D91] hover:text-[#5B2D91] transition-colors bg-white">
              See more sources
            </button>
          </div>
        </motion.div>

        {/* ── Articles & Listicles ── */}
        <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
          <h2 className="text-[32px] sm:text-[42px] font-bold text-[#0a0a0a] text-center mb-1 [font-family:var(--font-outfit)]">
            Articles &amp; Listicles
          </h2>
          <p className="text-center text-[15px] text-[#6b7280] mb-7">
            Humans love listicles — and AI models are trained on them. These shape every recommendation.
          </p>

          {/* Stat strip */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { value: "47",                               label: "Articles scanned",    color: "#5B2D91" },
              { value: String(Math.round(mentions * 0.5)), label: "Feature your brand",  color: "#22c55e" },
              { value: String(Math.round(mentions * 1.8)), label: "Feature competitors", color: "#f59e0b" },
            ].map(({ value, label, color }) => (
              <div key={label} className="rounded-xl p-4 text-center bg-white"
                style={{ border: "1px solid #e8e0f5", boxShadow: "0 2px 12px rgba(91,45,145,0.05)" }}>
                <p className="text-[24px] font-bold leading-none mb-1" style={{ color }}>{value}</p>
                <p className="text-[11px] text-[#9ca3af]">{label}</p>
              </div>
            ))}
          </div>

          {/* Article cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

            {/* Card 1 — G2, mentioned */}
            <div className="rounded-2xl overflow-hidden bg-white" style={{ border: "1px solid #e8e0f5", boxShadow: "0 4px 20px rgba(91,45,145,0.08)" }}>
              {/* Thumbnail */}
              <div className="relative h-[130px] flex items-center justify-center overflow-hidden"
                style={{ background: "linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #134e4a 100%)" }}>
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
                <div className="relative flex flex-col items-center gap-1.5">
                  <span className="text-[42px] leading-none">🏆</span>
                  <span className="text-[10px] font-black text-white/90 tracking-[0.2em] uppercase">Top 10 Picks</span>
                </div>
              </div>
              {/* Body */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <img src="https://www.google.com/s2/favicons?domain=g2.com&sz=32"
                    width={18} height={18} className="rounded-sm" alt="G2"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <span className="text-[11px] font-semibold text-[#6b7280]">g2.com</span>
                  <span className="text-[10px] text-[#d1d5db]">·</span>
                  <span className="text-[10px] text-[#9ca3af]">8 min read</span>
                </div>
                <div className="space-y-1.5 mb-3">
                  <div className="h-3.5 rounded-md bg-[#1a1a2e]/10" style={{ width: "90%" }} />
                  <div className="h-3 rounded-md bg-[#1a1a2e]/06" style={{ width: "65%", filter: "blur(2.5px)" }} />
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16a34a] bg-[#f0fdf4] border border-[#bbf7d0] px-2.5 py-1 rounded-full">
                  ✓ You&apos;re featured at #3
                </span>
              </div>
            </div>

            {/* Card 2 — TechRadar, not featured */}
            <div className="rounded-2xl overflow-hidden bg-white" style={{ border: "1px solid #e8e0f5", boxShadow: "0 4px 20px rgba(91,45,145,0.08)" }}>
              <div className="relative h-[130px] flex items-center justify-center overflow-hidden"
                style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 50%, #1e3a8a 100%)" }}>
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: "repeating-linear-gradient(45deg, white 0px, white 1px, transparent 1px, transparent 10px)", backgroundSize: "14px 14px" }} />
                <div className="relative flex flex-col items-center gap-1.5">
                  <span className="text-[42px] leading-none">⚡</span>
                  <span className="text-[10px] font-black text-white/90 tracking-[0.2em] uppercase">Best of 2025</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <img src="https://www.google.com/s2/favicons?domain=techradar.com&sz=32"
                    width={18} height={18} className="rounded-sm" alt="TechRadar"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <span className="text-[11px] font-semibold text-[#6b7280]">techradar.com</span>
                  <span className="text-[10px] text-[#d1d5db]">·</span>
                  <span className="text-[10px] text-[#9ca3af]">5 min read</span>
                </div>
                <div className="space-y-1.5 mb-3">
                  <div className="h-3.5 rounded-md bg-[#1a1a2e]/10" style={{ width: "85%" }} />
                  <div className="h-3 rounded-md bg-[#1a1a2e]/06" style={{ width: "58%", filter: "blur(2.5px)" }} />
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#ef4444] bg-[#fef2f2] border border-[#fecaca] px-2.5 py-1 rounded-full">
                  ✗ Not featured
                </span>
              </div>
            </div>

            {/* Card 3 — Capterra, locked */}
            <div className="rounded-2xl overflow-hidden bg-white relative" style={{ border: "1px solid #e8e0f5", boxShadow: "0 4px 20px rgba(91,45,145,0.08)" }}>
              <div className="relative h-[130px] flex items-center justify-center overflow-hidden"
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5B2D91 100%)", filter: "blur(1.5px)" }}>
                <div className="relative flex flex-col items-center gap-1.5">
                  <span className="text-[42px] leading-none">🎯</span>
                  <span className="text-[10px] font-black text-white/90 tracking-[0.2em] uppercase">Editor&apos;s Choice</span>
                </div>
              </div>
              <div className="p-4" style={{ filter: "blur(3px)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-[18px] h-[18px] rounded-sm bg-[#ede0ff]" />
                  <div className="h-2.5 rounded bg-[#ede0ff] w-20" />
                </div>
                <div className="space-y-1.5 mb-3">
                  <div className="h-3.5 rounded-md bg-[#ede0ff]" style={{ width: "88%" }} />
                  <div className="h-3 rounded-md bg-[#f3eeff]" style={{ width: "60%" }} />
                </div>
                <div className="h-7 rounded-full bg-[#ede0ff] w-28" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(250,248,255,0.55)" }}>
                <button onClick={unlock}
                  className="flex items-center gap-1.5 bg-white rounded-xl px-4 py-2 border border-[#ede0ff] shadow-md hover:shadow-lg transition-shadow">
                  <Lock className="w-3.5 h-3.5 text-[#5B2D91]" />
                  <span className="text-[12px] font-bold text-[#5B2D91]">Unlock article</span>
                </button>
              </div>
            </div>

            {/* Card 4 — Forbes, locked */}
            <div className="rounded-2xl overflow-hidden bg-white relative" style={{ border: "1px solid #e8e0f5", boxShadow: "0 4px 20px rgba(91,45,145,0.08)" }}>
              <div className="relative h-[130px] flex items-center justify-center overflow-hidden"
                style={{ background: "linear-gradient(135deg, #d97706 0%, #b45309 50%, #92400e 100%)", filter: "blur(1.5px)" }}>
                <div className="relative flex flex-col items-center gap-1.5">
                  <span className="text-[42px] leading-none">💼</span>
                  <span className="text-[10px] font-black text-white/90 tracking-[0.2em] uppercase">Industry Guide</span>
                </div>
              </div>
              <div className="p-4" style={{ filter: "blur(3px)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-[18px] h-[18px] rounded-sm bg-[#ede0ff]" />
                  <div className="h-2.5 rounded bg-[#ede0ff] w-16" />
                </div>
                <div className="space-y-1.5 mb-3">
                  <div className="h-3.5 rounded-md bg-[#ede0ff]" style={{ width: "92%" }} />
                  <div className="h-3 rounded-md bg-[#f3eeff]" style={{ width: "70%" }} />
                </div>
                <div className="h-7 rounded-full bg-[#ede0ff] w-32" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(250,248,255,0.55)" }}>
                <button onClick={unlock}
                  className="flex items-center gap-1.5 bg-white rounded-xl px-4 py-2 border border-[#ede0ff] shadow-md hover:shadow-lg transition-shadow">
                  <Lock className="w-3.5 h-3.5 text-[#5B2D91]" />
                  <span className="text-[12px] font-bold text-[#5B2D91]">Unlock article</span>
                </button>
              </div>
            </div>

          </div>

          {/* Footer callout */}
          <div className="rounded-xl px-6 py-4 flex items-center justify-between bg-white"
            style={{ border: "1px solid #e8e0f5" }}>
            <p className="text-[13px] font-semibold text-[#5B2D91]">
              {Math.round(mentions * 1.8 - mentions * 0.5)} articles feature competitors but not you
            </p>
            <button onClick={unlock} className="text-[13px] font-bold text-[#5B2D91] hover:underline whitespace-nowrap ml-4">
              See all articles →
            </button>
          </div>
        </motion.div>

        {/* ── Join the conversations ── */}
        <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
          <h2 className="text-[32px] sm:text-[42px] font-bold text-[#0a0a0a] text-center mb-1 [font-family:var(--font-outfit)]">
            Join the conversations
          </h2>
          <p className="text-center text-[15px] text-[#6b7280] mb-7">
            We found where your competitors are winning AI citations
          </p>

          <div className="rounded-2xl p-6 mb-4" style={card}>
            <div className="flex items-center gap-2 mb-3">
              {MODELS.slice(0, 2).map(m => (
                <img key={m.domain} src={`https://www.google.com/s2/favicons?domain=${m.domain}&sz=32`}
                  width={22} height={22} className="w-[22px] h-[22px] rounded-md"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              ))}
              <img src="https://www.google.com/s2/favicons?domain=reddit.com&sz=32"
                width={22} height={22} className="w-[22px] h-[22px] rounded-md" alt="Reddit" />
              <span className="text-[12px] text-[#9ca3af]">+ more platforms</span>
            </div>
            <p className="text-[16px] font-bold text-[#0a0a0a] mb-1">
              We&apos;ve found conversations where your brand can win
            </p>
            <p className="text-[13px] leading-relaxed text-[#6b7280]">
              <span className="font-semibold text-[#0a0a0a]">47 high-intent threads</span> are actively discussing your category.
              Engage directly to boost your AI citation rate.
            </p>
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { value: "47",  label: "Threads found",    emoji: "🔥" },
                { value: "124", label: "Posts analyzed",   emoji: "💬" },
                { value: "32×", label: "Visibility boost", emoji: "📈" },
              ].map(({ value, label, emoji }) => (
                <div key={label} className="rounded-xl p-4 text-center bg-[#faf5ff] border border-[#ede0ff]">
                  <div className="text-[20px] mb-1">{emoji}</div>
                  <p className="text-[26px] font-bold text-[#5B2D91] leading-none">{value}</p>
                  <p className="text-[11px] text-[#9ca3af] mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden" style={card}>
            {FAKE_THREADS.map(({ sub, votes, comments, domain }, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-5"
                style={{ borderBottom: i < FAKE_THREADS.length - 1 ? "1px solid #faf7ff" : "none" }}>
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                  <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                    width={40} height={40} alt={sub} className="w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-[#5B2D91] mb-1.5">{sub}</p>
                  <div className="h-3.5 rounded-full w-full bg-[#f0ebff] mb-2 select-none"
                    style={{ filter: "blur(2px)" }} />
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-[12px] text-[#9ca3af]">
                      <ThumbsUp className="w-3 h-3" /> {votes}
                    </span>
                    <span className="flex items-center gap-1.5 text-[12px] text-[#9ca3af]">
                      <MessageCircle className="w-3 h-3" /> {comments}
                    </span>
                  </div>
                </div>
                <button onClick={unlock}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold transition-all hover:border-[#5B2D91] hover:text-[#5B2D91]"
                  style={{ background: "#faf5ff", color: "#9ca3af", border: "1px solid #ede0ff" }}>
                  <Lock className="w-3 h-3" /> Engage
                </button>
              </div>
            ))}
            <div className="px-6 py-4 flex items-center justify-between bg-[#faf5ff]"
              style={{ borderTop: "1px solid #ede0ff" }}>
              <p className="text-[13px] font-semibold text-[#5B2D91]">44 more threads locked</p>
              <button onClick={unlock} className="text-[13px] font-bold text-[#5B2D91] hover:underline">
                Discover all opportunities →
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Bottom CTA card ── */}
        <motion.div custom={7} initial="hidden" animate="visible" variants={fadeUp} className="mb-6">
          <div className="rounded-2xl p-8 relative overflow-hidden text-white"
            style={{ background: "linear-gradient(135deg, #4a1d7a 0%, #5B2D91 50%, #7c3aed 100%)" }}>
            <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full pointer-events-none"
              style={{ background: "#9b6dff", opacity: 0.2, filter: "blur(55px)" }} />
            <div className="absolute -bottom-10 left-20 w-40 h-40 rounded-full pointer-events-none"
              style={{ background: "#ec4899", opacity: 0.15, filter: "blur(45px)" }} />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex-1 min-w-0">
                <p className="text-[22px] sm:text-[26px] font-bold leading-snug [font-family:var(--font-outfit)]">
                  Unlock your full AI visibility report
                </p>
                <p className="text-[13px] mt-1.5 text-white/70">
                  See all 25 AI responses, complete competitor data &amp; 47 engagement opportunities.
                </p>
              </div>
              <button onClick={unlock}
                className="shrink-0 flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-[#5B2D91] text-[14px] bg-white transition-all hover:bg-white/90 whitespace-nowrap shadow-lg">
                Unlock now <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

      </div>

      {/* ── Sticky CTA ── */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#e8e0f5] shadow-[0_-8px_40px_rgba(91,45,145,0.1)]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
          <div className="min-w-0">
            <p className="font-bold text-[#0a0a0a] text-sm">Your full report is ready</p>
            <p className="text-[11px] text-[#777] mt-0.5 hidden sm:block">
              All 25 AI responses · Full competitor rankings · 47 engagement threads
            </p>
          </div>
          <button onClick={unlock}
            className="shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}>
            Unlock full report <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
