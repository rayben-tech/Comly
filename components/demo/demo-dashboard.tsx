"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Sidebar } from "@/components/dashboard/sidebar";
import { OverviewPanel } from "@/components/dashboard/overview-panel";
import { PromptsPage } from "@/components/dashboard/prompts-page";
import { DomainsTable } from "@/components/dashboard/domains-table";
import { ListiclesPage } from "@/components/dashboard/listicles-page";
import { LlmsTxtPage } from "@/components/dashboard/llms-txt-page";
import { ComparisonPagesPage } from "@/components/dashboard/comparison-pages";
import { HeroRewritePage } from "@/components/dashboard/hero-rewrite-page";
import { BrandPage } from "@/components/dashboard/brand-page";
import { EngagementThreadsPage } from "@/components/dashboard/engagement-threads";
import { QuoraThreadsPage } from "@/components/dashboard/quora-threads";
import { Radio, Swords, Sparkles, Lock, Code2 } from "lucide-react";
import {
  DEMO_PROFILE,
  DEMO_PROMPT_RESULTS,
  DEMO_COMPETITOR_RANKINGS,
  DEMO_AUDIT_RESULT,
  DEMO_THREADS,
  DEMO_QUORA_THREADS,
} from "@/lib/demo-data";

type Page =
  | "overview"
  | "prompts"
  | "sources"
  | "brand"
  | "crawlers"
  | "competitor-playbook"
  | "engagement-threads"
  | "quora-threads"
  | `fixes:${string}`;

export function DemoDashboard({ fullScreen = false }: { fullScreen?: boolean }) {
  const [activePage, setActivePage] = useState<Page>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  function nav(page: string) {
    setActivePage(page as Page);
  }

  return (
    <motion.div
      id="demo-dashboard-root"
      className={`relative flex overflow-hidden ${fullScreen ? "h-full" : "h-[860px]"}`}
      animate={{ backgroundColor: activePage === "engagement-threads" ? "#f5ddd0" : activePage === "quora-threads" ? "#f5b8b8" : "#ddd5f5" }}
      transition={{ duration: 0.55, ease: "easeInOut" }}
    >
      <motion.div
        animate={{ width: sidebarOpen ? 220 : 52 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="shrink-0 h-full overflow-hidden"
        style={{ minWidth: 0 }}
      >
        <Sidebar
          activePage={activePage}
          onNavigate={nav}
          profile={DEMO_PROFILE}
          demoMode
          collapsed={!sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpen={() => setSidebarOpen(true)}
        />
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.17, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* OVERVIEW */}
            {activePage === "overview" && (
              <OverviewPanel
                score={DEMO_AUDIT_RESULT.score}
                totalMentions={DEMO_AUDIT_RESULT.total_mentions}
                promptResults={DEMO_PROMPT_RESULTS}
                competitorRankings={DEMO_COMPETITOR_RANKINGS}
                profile={DEMO_PROFILE}
                domain="notion.so"
                onNavigate={nav}
                demoMode
              />
            )}

            {/* PROMPTS */}
            {activePage === "prompts" && (
              <PromptsPage promptResults={DEMO_PROMPT_RESULTS} profile={DEMO_PROFILE} />
            )}

            {/* SOURCES */}
            {activePage === "sources" && (
              <div className="p-6">
                <DomainsTable promptResults={DEMO_PROMPT_RESULTS} urlsOnly />
              </div>
            )}

            {/* FIXES */}
            {activePage === "fixes:listicles" && (
              <ListiclesPage profile={DEMO_PROFILE} onGenerated={() => {}} />
            )}
            {activePage === "fixes:llms-txt" && (
              <LlmsTxtPage profile={DEMO_PROFILE} onGenerated={() => {}} />
            )}
            {activePage === "fixes:comparison" && (
              <ComparisonPagesPage profile={DEMO_PROFILE} onGenerated={() => {}} />
            )}
            {activePage === "fixes:hero-rewrite" && (
              <HeroRewritePage profile={DEMO_PROFILE} onGenerated={() => {}} />
            )}

            {/* ENGAGEMENT THREADS */}
            {activePage === "engagement-threads" && <EngagementThreadsPage profile={DEMO_PROFILE} demoMode demoThreads={DEMO_THREADS} />}

            {/* QUORA THREADS */}
            {activePage === "quora-threads" && <QuoraThreadsPage profile={DEMO_PROFILE} demoMode demoThreads={DEMO_QUORA_THREADS} />}

            {/* BRAND */}
            {activePage === "brand" && (
              <BrandPage profile={DEMO_PROFILE} onSave={() => {}} />
            )}

            {/* CRAWLERS */}
            {activePage === "crawlers" && (
              <div className="p-6">
                <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden">
                  <div className="px-8 pt-8 pb-6 border-b border-[#f0f0f0]">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#f3eeff] flex items-center justify-center shrink-0">
                        <Radio className="w-5 h-5 text-[#5B2D91]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <h2 className="text-[18px] font-bold text-[#0a0a0a]">Crawlers</h2>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">Pro</span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#f3eeff] text-[#5B2D91]">Coming soon</span>
                        </div>
                        <p className="text-[14px] text-[#6b6b6b] leading-relaxed">
                          Know when AI tools like ChatGPT, Perplexity, or Claude stop by your site. Add a simple snippet and we&apos;ll quietly log each visit for you, live.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="px-8 py-6 border-b border-[#f0f0f0]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-3.5 h-3.5 text-[#aaaaaa]" />
                        <span className="text-[12px] font-semibold text-[#aaaaaa] uppercase tracking-wide">Snippet</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#aaaaaa]">
                        <Lock className="w-3 h-3" />Unlock with Pro
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
                  <div className="px-8 py-6">
                    <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-semibold text-white" style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}>
                      <Sparkles className="w-4 h-4" />
                      Upgrade to Pro — get early access
                    </button>
                    <p className="text-[11px] text-[#aaaaaa] text-center mt-2.5">We&apos;ll notify you as soon as Crawlers goes live.</p>
                  </div>
                </div>
              </div>
            )}

            {/* COMPETITOR PLAYBOOK */}
            {activePage === "competitor-playbook" && (
              <div className="p-6">
                <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden">
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
                  <div className="px-8 py-6 border-b border-[#f0f0f0]">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[12px] font-semibold text-[#aaaaaa] uppercase tracking-wide">
                        Your top competitors
                        <span className="ml-2 normal-case font-normal text-[#c0c0c0]">({DEMO_COMPETITOR_RANKINGS.slice(0, 3).length} analyzed)</span>
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#aaaaaa]">
                        <Lock className="w-3 h-3" />Analysis locked
                      </div>
                    </div>
                    <div className="space-y-3">
                      {DEMO_COMPETITOR_RANKINGS.slice(0, 3).map((comp) => (
                        <div key={comp.name} className="border border-[#f0f0f0] rounded-xl overflow-hidden">
                          <div className="flex items-center gap-3 px-4 py-3 bg-[#fafafa] border-b border-[#f0f0f0]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`https://www.google.com/s2/favicons?domain=${comp.domain}&sz=32`} alt={comp.name} width={20} height={20} className="w-5 h-5 rounded object-contain shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            <span className="text-[13px] font-semibold text-[#0a0a0a] flex-1">{comp.name}</span>
                            <span className="text-[11px] font-semibold text-[#ef4444] bg-red-50 px-2 py-0.5 rounded-full">{comp.mentions} mentions</span>
                          </div>
                          <div className="relative">
                            <div className="px-4 py-3 space-y-2.5 select-none blur-[4px] pointer-events-none">
                              <div>
                                <p className="text-[10px] font-semibold text-[#aaaaaa] uppercase tracking-wide mb-1">Why AI recommends them</p>
                                <p className="text-[12px] text-[#3a3a3a]">Trusted integrations, strong documentation, frequent mentions across developer forums and review sites.</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-semibold text-[#aaaaaa] uppercase tracking-wide mb-1">Prompts where they beat you</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {["Best tool for PM teams", "Top productivity tools", "Alternatives to Jira"].map((p) => (
                                    <span key={p} className="text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-500">{p}</span>
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
                  <div className="px-8 py-6">
                    <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-semibold text-white" style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}>
                      <Sparkles className="w-4 h-4" />
                      Upgrade to Pro — unlock your playbook
                    </button>
                    <p className="text-[11px] text-[#aaaaaa] text-center mt-2.5">We&apos;ll notify you as soon as Competitor Playbook goes live.</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
