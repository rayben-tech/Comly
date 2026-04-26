"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { AuditResult, BrandProfile, PromptResult, CompetitorRanking } from "@/types";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/top-bar";
import { CompetitorsTable } from "@/components/dashboard/competitors-table";
import { DomainsTable } from "@/components/dashboard/domains-table";
import { PromptsPage } from "@/components/dashboard/prompts-page";
import { PromptsPerformance } from "@/components/dashboard/prompts-performance";
import { BrandPage } from "@/components/dashboard/brand-page";
import { ListiclesPage } from "@/components/dashboard/listicles-page";
import { LlmsTxtPage } from "@/components/dashboard/llms-txt-page";
import { ComparisonPagesPage } from "@/components/dashboard/comparison-pages";
import { HeroRewritePage } from "@/components/dashboard/hero-rewrite-page";
import { EmailCapture } from "@/components/email-capture";
import { Hash, Trophy, CheckCircle2, Sparkles, Radio, Lock, Code2, Star, MessageCircle, Swords } from "lucide-react";

const VisibilityChart = dynamic(
  () => import("@/components/dashboard/visibility-chart").then((m) => ({ default: m.VisibilityChart })),
  { ssr: false }
);
const ModelBreakdown = dynamic(
  () => import("@/components/dashboard/model-breakdown").then((m) => ({ default: m.ModelBreakdown })),
  { ssr: false }
);

interface AuditResultsProps {
  result: AuditResult;
  profile: BrandProfile;
  onReset: () => void;
  onRerun: () => void;
}

type Page = "overview" | "prompts" | "sources" | "brand" | "crawlers" | "competitor-playbook" | `fixes:${string}`;

interface MiniStatProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  color: string;
}

function MiniStat({ label, value, sub, icon: Icon, color }: MiniStatProps) {
  return (
    <div className="bg-white border border-[#e8e8e8] rounded-xl px-5 py-4 flex items-center gap-4">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}12` }}
      >
        <Icon className="w-4.5 h-4.5" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#aaaaaa" }}>{label}</p>
        <p className="text-[20px] font-bold leading-none" style={{ color: "#0a0a0a" }}>{value}</p>
        <p className="text-[11px] mt-0.5 truncate" style={{ color: "#aaaaaa" }}>{sub}</p>
      </div>
    </div>
  );
}

function buildStats(
  score: number,
  totalMentions: number,
  promptResults: PromptResult[],
  competitorRankings: CompetitorRanking[]
) {
  const total = promptResults.length || 10;
  const visibilityPct = Math.round((totalMentions / total) * 100);
  const mentionedWithPos = promptResults.filter((p) => p.mentioned && p.position !== null);
  const avgPos =
    mentionedWithPos.length > 0
      ? Math.round((mentionedWithPos.reduce((s, p) => s + p.position!, 0) / mentionedWithPos.length) * 10) / 10
      : null;
  const topComp = competitorRankings[0]?.name ?? "—";
  const topCompMentions = competitorRankings[0]?.mentions ?? 0;
  return { visibilityPct, avgPos, topComp, topCompMentions, total };
}


export function AuditResults({ result, profile: initialProfile, onReset, onRerun }: AuditResultsProps) {
  const [activePage, setActivePage] = useState<Page>("overview");
  const [profile, setProfile] = useState<BrandProfile>(initialProfile);
  const { score, total_mentions, prompt_results, competitor_rankings } = result;
  const { avgPos, topComp, topCompMentions, total } = buildStats(
    score, total_mentions, prompt_results, competitor_rankings
  );

  const domain = profile.url
    ? (() => { try { const u = profile.url.startsWith("http") ? profile.url : "https://" + profile.url; return new URL(u).hostname; } catch { return profile.url; } })()
    : profile.brand_name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "") + ".com";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#f0ebff" }}>
      <Sidebar
        activePage={activePage}
        onNavigate={(p) => setActivePage(p as Page)}
        profile={profile}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar
          brandName={profile.brand_name}
          domain={domain}
          score={score}
          totalMentions={total_mentions}
          promptResults={prompt_results}
          onReset={onReset}
          onRerun={onRerun}
        />

        <div className="flex-1 overflow-y-auto">

          {/* OVERVIEW */}
          {activePage === "overview" && (
            <div className="p-6 space-y-5">

              {/* Stat cards row */}
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
                <MiniStat
                  label="Prompts Hit"
                  value={`${total_mentions} / ${total}`}
                  sub="prompts your brand appeared in"
                  icon={CheckCircle2}
                  color="#10b981"
                />
                <MiniStat
                  label="Direct Awareness"
                  value={prompt_results[0]?.mentioned ? "Recognized" : "Not recognized"}
                  sub={`"What is ${profile.brand_name}?"`}
                  icon={Sparkles}
                  color={prompt_results[0]?.mentioned ? "#5B2D91" : "#aaaaaa"}
                />
                <MiniStat
                  label="Avg. Position"
                  value={avgPos !== null ? `#${avgPos}` : "—"}
                  sub={avgPos !== null ? "when mentioned" : "Not mentioned"}
                  icon={Hash}
                  color="#f59e0b"
                />
                <MiniStat
                  label="Top Competitor"
                  value={topComp}
                  sub={`${topCompMentions} mentions`}
                  icon={Trophy}
                  color="#ef4444"
                />
              </div>

              {/* Two-column grid */}
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
                <div className="xl:col-span-3 space-y-5">
                  <VisibilityChart
                    promptResults={prompt_results}
                    competitorRankings={competitor_rankings}
                    brandName={profile.brand_name}
                    brandDomain={domain}
                  />
                  <ModelBreakdown
                    promptResults={prompt_results}
                    brandName={profile.brand_name}
                    onNavigate={(p) => setActivePage(p as Page)}
                  />
                </div>
                <div className="xl:col-span-2 space-y-5">
                  <CompetitorsTable
                    competitorRankings={competitor_rankings}
                    promptResults={prompt_results}
                    brandName={profile.brand_name}
                    brandUrl={profile.url}
                    totalMentions={total_mentions}
                  />
                </div>
              </div>

              <PromptsPerformance
                promptResults={prompt_results}
                brandName={profile.brand_name}
                brandDomain={domain}
                onNavigate={(p) => setActivePage(p as Page)}
              />

            </div>
          )}

          {activePage === "prompts" && (
            <PromptsPage promptResults={prompt_results} profile={profile} />
          )}

          {activePage === "sources" && (
            <div className="p-6">
              <DomainsTable promptResults={prompt_results} />
            </div>
          )}

          {activePage === "fixes:listicles" && (
            <ListiclesPage profile={profile} />
          )}

          {activePage === "fixes:llms-txt" && (
            <LlmsTxtPage profile={profile} />
          )}

          {activePage === "fixes:comparison" && (
            <ComparisonPagesPage profile={profile} />
          )}

          {activePage === "fixes:hero-rewrite" && (
            <HeroRewritePage profile={profile} />
          )}

          {activePage === "fixes:g2-checklist" && (
            <div className="p-6 max-w-2xl mx-auto">
              <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden">
                <div className="px-8 pt-8 pb-6 border-b border-[#f0f0f0]">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                      <Star className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <h2 className="text-[18px] font-bold text-[#0a0a0a]">G2 Checklist</h2>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">Pro</span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#f3eeff] text-[#5B2D91]">Coming soon</span>
                      </div>
                      <p className="text-[14px] text-[#6b6b6b] leading-relaxed">
                        When buyers ask ChatGPT or Perplexity to recommend tools in your category, a complete G2 page with strong reviews is one of the top signals they cite. Make sure yours is ready.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Blurred checklist preview */}
                <div className="px-8 py-6 border-b border-[#f0f0f0]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[12px] font-semibold text-[#aaaaaa] uppercase tracking-wide">Your G2 checklist</span>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#aaaaaa]">
                      <Lock className="w-3 h-3" />
                      Unlock with Pro
                    </div>
                  </div>
                  <div className="relative rounded-xl overflow-hidden border border-[#f0f0f0]">
                    <div className="bg-[#fafafa] px-5 py-4 space-y-3 select-none blur-[3px] pointer-events-none">
                      {["Claimed & verified G2 profile", "10+ recent reviews (last 6 months)", "All product features filled in", "Competitive comparisons enabled", "Category leader badge embedded on site", "Responded to every review publicly"].map((item) => (
                        <div key={item} className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded border-2 border-[#d0d0d0] shrink-0" />
                          <span className="text-[13px] text-[#3a3a3a]">{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                      <div className="flex items-center gap-2 bg-white border border-[#e8e8e8] rounded-lg px-4 py-2 shadow-sm">
                        <Lock className="w-3.5 h-3.5 text-[#5B2D91]" />
                        <span className="text-[13px] font-semibold text-[#0a0a0a]">Available on Pro</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-8 py-6 border-b border-[#f0f0f0]">
                  <p className="text-[12px] font-semibold text-[#aaaaaa] uppercase tracking-wide mb-4">What you&apos;ll get</p>
                  <div className="space-y-3">
                    {[
                      { icon: "📋", text: "Step-by-step G2 optimization checklist tailored to your software category" },
                      { icon: "⭐", text: "Review generation scripts to collect more authentic, AI-visible reviews" },
                      { icon: "🏆", text: "Tips to rank higher in G2 category pages that AI tools frequently cite" },
                      { icon: "🔗", text: "Badge integration guide to add social proof directly to your site" },
                    ].map(({ icon, text }) => (
                      <div key={text} className="flex items-start gap-3">
                        <span className="text-[16px] shrink-0 mt-0.5">{icon}</span>
                        <p className="text-[13px] text-[#3a3a3a] leading-snug">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-8 py-6">
                  <button
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
                    style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}
                  >
                    <Sparkles className="w-4 h-4" />
                    Upgrade to Pro — get early access
                  </button>
                  <p className="text-[11px] text-[#aaaaaa] text-center mt-2.5">We&apos;ll notify you as soon as G2 Checklist goes live.</p>
                </div>
              </div>
            </div>
          )}

          {activePage === "fixes:reddit-exposure" && (
            <div className="p-6 max-w-2xl mx-auto">
              <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden">
                <div className="px-8 pt-8 pb-6 border-b border-[#f0f0f0]">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#ff450012" }}>
                      <MessageCircle className="w-5 h-5" style={{ color: "#ff4500" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <h2 className="text-[18px] font-bold text-[#0a0a0a]">Reddit Exposure</h2>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">Pro</span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#f3eeff] text-[#5B2D91]">Coming soon</span>
                      </div>
                      <p className="text-[14px] text-[#6b6b6b] leading-relaxed">
                        Reddit is one of the most-cited sources by AI tools like Perplexity and ChatGPT. Find the subreddits where your buyers live and make sure your brand shows up in the conversations AI learns from.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Blurred Reddit thread preview */}
                <div className="px-8 py-6 border-b border-[#f0f0f0]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[12px] font-semibold text-[#aaaaaa] uppercase tracking-wide">Reddit thread preview</span>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#aaaaaa]">
                      <Lock className="w-3 h-3" />
                      Unlock with Pro
                    </div>
                  </div>
                  <div className="relative rounded-xl overflow-hidden border border-[#f0f0f0]">
                    <div className="bg-[#fafafa] px-5 py-4 select-none blur-[3px] pointer-events-none space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-[#ff4500]">r/startuptools</span>
                        <span className="text-[11px] text-[#aaaaaa]">• Posted by u/founder_dev</span>
                      </div>
                      <p className="text-[13px] font-semibold text-[#0a0a0a]">&ldquo;Best AI SEO tools in 2024? Looking for something that tracks LLM visibility&rdquo;</p>
                      <div className="flex items-center gap-3 text-[11px] text-[#aaaaaa]">
                        <span>↑ 847 points</span>
                        <span>92 comments</span>
                      </div>
                      <div className="border-t border-[#f0f0f0] pt-3 space-y-2">
                        {["u/seo_pro: I've been using [Brand] for a few months now, it's solid", "u/growth_hacker: Tried a few — [Brand] has the best prompt tracking by far", "u/startup_cto: [Brand] is legit, they have a free tier too"].map((c) => (
                          <p key={c} className="text-[12px] text-[#6b6b6b]">{c}</p>
                        ))}
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                      <div className="flex items-center gap-2 bg-white border border-[#e8e8e8] rounded-lg px-4 py-2 shadow-sm">
                        <Lock className="w-3.5 h-3.5 text-[#5B2D91]" />
                        <span className="text-[13px] font-semibold text-[#0a0a0a]">Available on Pro</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-8 py-6 border-b border-[#f0f0f0]">
                  <p className="text-[12px] font-semibold text-[#aaaaaa] uppercase tracking-wide mb-4">What you&apos;ll get</p>
                  <div className="space-y-3">
                    {[
                      { icon: "🎯", text: "Subreddit map — the exact communities your ideal buyers are already in" },
                      { icon: "✍️", text: "Post and comment templates that drive authentic, AI-indexed engagement" },
                      { icon: "📈", text: "Track which Reddit threads AI tools are actively pulling from for your keywords" },
                      { icon: "🔍", text: "Monitor your brand mentions across Reddit in real time" },
                    ].map(({ icon, text }) => (
                      <div key={text} className="flex items-start gap-3">
                        <span className="text-[16px] shrink-0 mt-0.5">{icon}</span>
                        <p className="text-[13px] text-[#3a3a3a] leading-snug">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-8 py-6">
                  <button
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
                    style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}
                  >
                    <Sparkles className="w-4 h-4" />
                    Upgrade to Pro — get early access
                  </button>
                  <p className="text-[11px] text-[#aaaaaa] text-center mt-2.5">We&apos;ll notify you as soon as Reddit Exposure goes live.</p>
                </div>
              </div>
            </div>
          )}

          {activePage.startsWith("fixes:") && activePage !== "fixes:listicles" && activePage !== "fixes:llms-txt" && activePage !== "fixes:comparison" && activePage !== "fixes:hero-rewrite" && activePage !== "fixes:g2-checklist" && activePage !== "fixes:reddit-exposure" && (
            <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#f3eeff] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#5B2D91]" />
              </div>
              <p className="text-[15px] font-semibold text-[#0a0a0a]">Coming soon</p>
              <p className="text-[13px] text-[#aaaaaa]">This fix is being built. Check back soon.</p>
            </div>
          )}

          {activePage === "brand" && (
            <BrandPage profile={profile} onSave={setProfile} />
          )}

          {activePage === "crawlers" && (
            <div className="p-6 max-w-2xl mx-auto">
              <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="px-8 pt-8 pb-6 border-b border-[#f0f0f0]">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#f3eeff] flex items-center justify-center shrink-0">
                      <Radio className="w-5 h-5 text-[#5B2D91]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <h2 className="text-[18px] font-bold text-[#0a0a0a]">Crawlers</h2>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                          Pro
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#f3eeff] text-[#5B2D91]">
                          Coming soon
                        </span>
                      </div>
                      <p className="text-[14px] text-[#6b6b6b] leading-relaxed">
                        Know when AI tools like ChatGPT, Perplexity, or Claude stop by your site. Add a simple snippet and we&apos;ll quietly log each visit for you, live.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Snippet preview — blurred/locked */}
                <div className="px-8 py-6 border-b border-[#f0f0f0]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-3.5 h-3.5 text-[#aaaaaa]" />
                      <span className="text-[12px] font-semibold text-[#aaaaaa] uppercase tracking-wide">Snippet</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#aaaaaa]">
                      <Lock className="w-3 h-3" />
                      Unlock with Pro
                    </div>
                  </div>
                  <div className="relative rounded-xl overflow-hidden">
                    <pre className="bg-[#0a0a0a] text-[#a78bfa] text-[12px] leading-relaxed px-5 py-4 font-mono select-none blur-[3px] pointer-events-none">
{`<script>
  (function(c,o,m,l,y){
    c[y]=c[y]||function(){(c[y].q=c[y].q||[])
    .push(arguments)};var s=o.createElement('script');
    s.async=1;s.src=m;o.head.appendChild(s);
  })(window,document,'https://cdn.comly.ai/tracker.js','comly');
  comly('init', 'YOUR_SITE_ID');
</script>`}
                    </pre>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                      <div className="flex items-center gap-2 bg-white/90 border border-[#e8e8e8] rounded-lg px-4 py-2 shadow-sm">
                        <Lock className="w-3.5 h-3.5 text-[#5B2D91]" />
                        <span className="text-[13px] font-semibold text-[#0a0a0a]">Available on Pro</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What you'll get */}
                <div className="px-8 py-6 border-b border-[#f0f0f0]">
                  <p className="text-[12px] font-semibold text-[#aaaaaa] uppercase tracking-wide mb-4">What you&apos;ll get</p>
                  <div className="space-y-3">
                    {[
                      { icon: "🤖", text: "Live log of every AI crawler visit — ChatGPT, Perplexity, Claude, Gemini & more" },
                      { icon: "📊", text: "Visit frequency and timing so you know how often AI tools re-index your content" },
                      { icon: "🔔", text: "Alerts when a new AI crawler discovers your site for the first time" },
                      { icon: "📄", text: "See which pages are being crawled and which are being ignored" },
                    ].map(({ icon, text }) => (
                      <div key={text} className="flex items-start gap-3">
                        <span className="text-[16px] shrink-0 mt-0.5">{icon}</span>
                        <p className="text-[13px] text-[#3a3a3a] leading-snug">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="px-8 py-6">
                  <button
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
                    style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}
                  >
                    <Sparkles className="w-4 h-4" />
                    Upgrade to Pro — get early access
                  </button>
                  <p className="text-[11px] text-[#aaaaaa] text-center mt-2.5">We&apos;ll notify you as soon as Crawlers goes live.</p>
                </div>
              </div>
            </div>
          )}

          {activePage === "competitor-playbook" && (
            <div className="p-6 max-w-2xl mx-auto">
              <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden">

                {/* Header */}
                <div className="px-8 pt-8 pb-6 border-b border-[#f0f0f0]">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#f3eeff] flex items-center justify-center shrink-0">
                      <Swords className="w-5 h-5 text-[#5B2D91]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <h2 className="text-[18px] font-bold text-[#0a0a0a]">Competitor Playbook</h2>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">Pro</span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#f3eeff] text-[#5B2D91]">Coming soon</span>
                      </div>
                      <p className="text-[14px] text-[#6b6b6b] leading-relaxed">
                        See exactly where LLMs recommend your competitors instead of you — the prompts they win, the sources that back them up, and the specific reasons AI chooses them. Then fix it.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Real competitor cards — names visible, analysis blurred */}
                <div className="px-8 py-6 border-b border-[#f0f0f0]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[12px] font-semibold text-[#aaaaaa] uppercase tracking-wide">
                      Your top competitors
                      <span className="ml-2 normal-case font-normal text-[#c0c0c0]">({competitor_rankings.slice(0, 3).length} analyzed)</span>
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#aaaaaa]">
                      <Lock className="w-3 h-3" />
                      Analysis locked
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(competitor_rankings.slice(0, 3).length > 0 ? competitor_rankings.slice(0, 3) : [
                      { name: "Competitor A", domain: "", mentions: 6 },
                      { name: "Competitor B", domain: "", mentions: 4 },
                      { name: "Competitor C", domain: "", mentions: 2 },
                    ]).map((comp) => (
                      <div key={comp.name} className="border border-[#f0f0f0] rounded-xl overflow-hidden">
                        {/* Visible: name + mention count */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-[#fafafa] border-b border-[#f0f0f0]">
                          {comp.domain ? (
                            <img
                              src={`https://www.google.com/s2/favicons?domain=${comp.domain}&sz=32`}
                              alt={comp.name}
                              width={20} height={20}
                              className="w-5 h-5 rounded object-contain shrink-0"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          ) : (
                            <div className="w-5 h-5 rounded bg-gradient-to-br from-[#5B2D91] to-[#8B5CF6] flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                              {comp.name.charAt(0)}
                            </div>
                          )}
                          <span className="text-[13px] font-semibold text-[#0a0a0a] flex-1">{comp.name}</span>
                          <span className="text-[11px] font-semibold text-[#ef4444] bg-red-50 px-2 py-0.5 rounded-full">
                            {comp.mentions} mention{comp.mentions !== 1 ? "s" : ""}
                          </span>
                        </div>

                        {/* Locked: analysis rows */}
                        <div className="relative">
                          <div className="px-4 py-3 space-y-2.5 select-none blur-[4px] pointer-events-none">
                            <div>
                              <p className="text-[10px] font-semibold text-[#aaaaaa] uppercase tracking-wide mb-1">Why AI recommends them</p>
                              <p className="text-[12px] text-[#3a3a3a]">Trusted integrations, strong documentation, frequent mentions across developer forums and review sites.</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold text-[#aaaaaa] uppercase tracking-wide mb-1">Prompts where they beat you</p>
                              <div className="flex flex-wrap gap-1.5">
                                {["Best tool for SEO teams", "Top AI visibility tools", "Alternatives to agency SEO"].map((p) => (
                                  <span key={p} className="text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-500">{p}</span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold text-[#aaaaaa] uppercase tracking-wide mb-1">Key sources backing them</p>
                              <div className="flex gap-2">
                                {["g2.com", "producthunt.com", "techcrunch.com"].map((d) => (
                                  <span key={d} className="text-[11px] text-[#6b6b6b] bg-[#f7f7f5] px-2 py-0.5 rounded">{d}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex items-center gap-2 bg-white border border-[#e8e8e8] rounded-lg px-3 py-1.5 shadow-sm">
                              <Lock className="w-3 h-3 text-[#5B2D91]" />
                              <span className="text-[12px] font-semibold text-[#0a0a0a]">Unlock with Pro</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* What you'll get */}
                <div className="px-8 py-6 border-b border-[#f0f0f0]">
                  <p className="text-[12px] font-semibold text-[#aaaaaa] uppercase tracking-wide mb-4">What you&apos;ll get</p>
                  <div className="space-y-3">
                    {[
                      { icon: "🎯", text: "Every prompt where a competitor was mentioned and you weren't — with the full AI response" },
                      { icon: "🧠", text: "The exact language AI uses to describe each competitor: their strengths, use cases, and why they're trusted" },
                      { icon: "🔗", text: "The sources and domains that give each competitor their authority in AI eyes" },
                      { icon: "📋", text: "A gap analysis: what they have that you don't, and a concrete action plan to close it" },
                    ].map(({ icon, text }) => (
                      <div key={text} className="flex items-start gap-3">
                        <span className="text-[16px] shrink-0 mt-0.5">{icon}</span>
                        <p className="text-[13px] text-[#3a3a3a] leading-snug">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="px-8 py-6">
                  <button
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
                    style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}
                  >
                    <Sparkles className="w-4 h-4" />
                    Upgrade to Pro — unlock your playbook
                  </button>
                  <p className="text-[11px] text-[#aaaaaa] text-center mt-2.5">We&apos;ll notify you as soon as Competitor Playbook goes live.</p>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
