"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import Lenis from "lenis";
import { AnimatePresence, motion } from "framer-motion";
import { AuditResult, BrandProfile, PromptResult, CompetitorRanking } from "@/types";
import { Sidebar } from "@/components/dashboard/sidebar";
import { CompetitorsTable } from "@/components/dashboard/competitors-table";
import { BrandSourcesPanel } from "@/components/dashboard/brand-sources-panel";
import { PromptsPage } from "@/components/dashboard/prompts-page";
import { PromptsPerformance } from "@/components/dashboard/prompts-performance";
import { ShareOfVoice } from "@/components/dashboard/share-of-voice";
import { OverviewPanel } from "@/components/dashboard/overview-panel";
import { BrandPage } from "@/components/dashboard/brand-page";
import { ListiclesPage } from "@/components/dashboard/listicles-page";
import { LlmsTxtPage } from "@/components/dashboard/llms-txt-page";
import { ComparisonPagesPage } from "@/components/dashboard/comparison-pages";
import { EngagementThreadsPage } from "@/components/dashboard/engagement-threads";
import { QuoraThreadsPage } from "@/components/dashboard/quora-threads";
import { CompetitorPlaybookPanel } from "@/components/dashboard/competitor-playbook-panel";
import { VisitorsPage } from "@/components/dashboard/visitors-page";
import { McpPage } from "@/components/dashboard/mcp-page";
import { EmailCapture } from "@/components/email-capture";
import { SpotlightTour, TourStep } from "@/components/tour/spotlight-tour";
import { Sparkles, Users, Swords, LayoutDashboard, MessageSquare, Globe, ListChecks, Tag, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { FaviconImg } from "@/components/ui/favicon-img";

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
  userId?: string;
  trialDaysLeft?: number;
}

type Page = "overview" | "prompts" | "sources" | "brand" | "mcp" | "visitors" | "competitor-playbook" | "engagement-threads" | "quora-threads" | `fixes:${string}`;



export function AuditResults({ result, profile: initialProfile, onReset, onRerun, userId, trialDaysLeft }: AuditResultsProps) {
  const [activePage, setActivePage] = useState<Page>("overview");
  const [profile, setProfile] = useState<BrandProfile>(initialProfile);
  const [moreOpen, setMoreOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showTour, setShowTour] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = scrollRef.current;
    if (!wrapper) return;
    const lenis = new Lenis({
      wrapper,
      content: wrapper.firstElementChild as HTMLElement,
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    let rafId: number;
    function raf(time: number) { lenis.raf(time); rafId = requestAnimationFrame(raf); }
    rafId = requestAnimationFrame(raf);
    return () => { lenis.destroy(); cancelAnimationFrame(rafId); };
  }, []);

  useEffect(() => {
    // Only show on desktop (sidebar must be visible for tour steps 4-5)
    if (window.innerWidth < 1024) return;
    if (!localStorage.getItem("comly_tour_done")) {
      setSidebarOpen(true); // ensure sidebar is expanded so nav items are targetable
      const t = setTimeout(() => setShowTour(true), 900);
      return () => clearTimeout(t);
    }
  }, []);

  const TOUR_STEPS: TourStep[] = [
    {
      target: "tour-score",
      emoji: "📊",
      title: "Your AI Visibility Score",
      body: "Your score out of 100. It shows how often ChatGPT, Claude, Gemini, and Perplexity recommend your brand when users ask relevant questions. Higher = more free AI traffic.",
      position: "bottom",
    },
    {
      target: "tour-competitors",
      emoji: "🏆",
      title: "Competitor Rankings",
      body: "See exactly where you rank vs your competitors in real AI answers. Your goal is to reach #1 — before your competitors find this tool.",
      position: "right",
    },
    {
      target: "tour-prompts-nav",
      emoji: "💬",
      title: "Prompt Results",
      body: "The exact questions we asked AI about your industry — and how it responded. Each unanswered prompt is a missed customer. This tells you which ones to fix first.",
      position: "right",
      onBefore: () => setActivePage("prompts"),
    },
    {
      target: "tour-sources-nav",
      emoji: "🌐",
      title: "Top Sources",
      body: "The pages AI cites when talking about your brand. More high-authority pages citing you = higher score. This shows you exactly where to invest your content efforts.",
      position: "right",
      onBefore: () => setActivePage("sources"),
    },
    {
      target: "tour-reddit-header",
      emoji: "🔴",
      title: "Reddit — Your AI growth engine",
      body: "When you reply to Reddit threads, AI models learn to associate your brand with those topics. It's the highest-leverage free action you can take — and we find the threads for you.",
      position: "bottom",
      onBefore: () => setActivePage("engagement-threads"),
    },
    {
      target: "tour-reddit-thread",
      emoji: "⭐",
      title: "The Opportunity Score",
      body: "Each thread is scored 0–99. HIGH = recent thread, few replies, high relevance. Those are your best shots at getting cited by AI. Start there every time.",
      position: "right",
    },
    {
      target: "tour-content",
      emoji: "📝",
      title: "Content Generator",
      body: "Three tools that generate listicles, llms.txt files, and comparison pages — the exact content AI models crawl and cite. Publish them and, with time, AI starts reading and recommending you more.",
      position: "right",
      onBefore: () => { window.dispatchEvent(new CustomEvent("comly:tour:open-content")); },
    },
    {
      target: "tour-listicles-nav",
      emoji: "📋",
      title: "Listicles Generator",
      body: "'Top 10 tools for X' pages are the #1 content type AI cites in recommendations. We write them for your brand in 30 seconds — fully optimized.",
      position: "right",
      onBefore: () => { window.dispatchEvent(new CustomEvent("comly:tour:open-content")); setActivePage("fixes:listicles"); },
    },
    {
      target: "tour-llms-txt-nav",
      emoji: "🤖",
      title: "llms.txt Generator",
      body: "A special file that tells AI exactly what your brand does, who it's for, and what makes it stand out. Think of it as meta tags — but for ChatGPT and Claude.",
      position: "right",
      onBefore: () => { window.dispatchEvent(new CustomEvent("comly:tour:open-content")); setActivePage("fixes:llms-txt"); },
    },
    {
      target: "tour-comparison-nav",
      emoji: "⚔️",
      title: "Comparison Pages",
      body: "'Brand A vs Brand B' pages are searched by buyers who are ready to choose. We generate them targeting your top competitors so AI recommends you when users compare.",
      position: "right",
      onBefore: () => { window.dispatchEvent(new CustomEvent("comly:tour:open-content")); setActivePage("fixes:comparison"); },
    },
  ];
  const { score, total_mentions, prompt_results = [], competitor_rankings = [] } = result;
  const domain = profile.url
    ? (() => { try { const u = profile.url.startsWith("http") ? profile.url : "https://" + profile.url; return new URL(u).hostname; } catch { return profile.url; } })()
    : profile.brand_name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "") + ".com";

  const scoreColor = score >= 60 ? "#10b981" : score >= 30 ? "#f59e0b" : "#ef4444";

  return (
    <motion.div
      className="flex h-screen overflow-hidden"
      animate={{ backgroundColor: activePage === "engagement-threads" ? "#f5ddd0" : activePage === "quora-threads" ? "#f5b8b8" : "#ddd5f5" }}
      transition={{ duration: 0.55, ease: "easeInOut" }}
    >
      <motion.div
        animate={{ width: sidebarOpen ? 220 : 52 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:block overflow-hidden shrink-0"
        style={{ minWidth: 0 }}
      >
        <Sidebar
          activePage={activePage}
          onNavigate={(p) => setActivePage(p as Page)}
          profile={profile}
          collapsed={!sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpen={() => setSidebarOpen(true)}
          trialDaysLeft={trialDaysLeft}
        />
      </motion.div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div ref={scrollRef} className="flex-1 overflow-y-auto pb-14 lg:pb-0">
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
              score={score}
              totalMentions={total_mentions}
              promptResults={prompt_results}
              competitorRankings={competitor_rankings}
              profile={profile}
              domain={domain}
              onNavigate={(p) => setActivePage(p as Page)}
              userId={userId}
            />
          )}

          {activePage === "prompts" && (
            <PromptsPage promptResults={prompt_results} profile={profile} />
          )}

          {activePage === "sources" && (
            <BrandSourcesPanel profile={profile} />
          )}

          {activePage === "fixes:listicles" && (
            <ListiclesPage profile={profile} />
          )}

          {activePage === "fixes:llms-txt" && (
            <LlmsTxtPage profile={profile} />
          )}

          {activePage === "fixes:comparison" && (
            <ComparisonPagesPage profile={profile} competitorRankings={competitor_rankings} />
          )}

          {activePage === "engagement-threads" && (
            <EngagementThreadsPage profile={profile} />
          )}

          {activePage === "quora-threads" && (
            <QuoraThreadsPage profile={profile} />
          )}

          {activePage.startsWith("fixes:") && activePage !== "fixes:listicles" && activePage !== "fixes:llms-txt" && activePage !== "fixes:comparison" && (
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

          {activePage === "mcp" && (
            <McpPage />
          )}

          {activePage === "visitors" && (
            <VisitorsPage userId={userId} profile={profile} />
          )}

          {activePage === "competitor-playbook" && (
            <CompetitorPlaybookPanel
              competitorRankings={result.competitor_rankings}
              promptResults={result.prompt_results}
              profile={profile}
            />
          )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile more sheet backdrop */}
        {moreOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40"
            onClick={() => setMoreOpen(false)}
          />
        )}

        {/* Mobile more sheet */}
        {moreOpen && (
          <div className="lg:hidden fixed inset-x-0 bottom-14 z-50 bg-white border-t border-[#e8e8e8] shadow-2xl rounded-t-2xl max-h-[70vh] overflow-y-auto">
            <div className="px-4 py-4 space-y-1">
              <p className="text-[10px] font-bold text-[#cccccc] uppercase tracking-widest px-2 pb-1">Optimize</p>
              {([
                { id: "engagement-threads", label: "Reddit",  favicon: "reddit.com" },
                { id: "quora-threads",      label: "Quora",   favicon: "quora.com"  },
              ] as const).map(({ id, label, favicon }) => (
                <button
                  key={id}
                  onClick={() => { setActivePage(id as Page); setMoreOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium text-left transition-colors",
                    activePage === id ? "bg-[#5B2D91]/[0.06] text-[#5B2D91]" : "text-[#333] active:bg-[#ddd5f5]"
                  )}
                >
                  <img src={`https://www.google.com/s2/favicons?domain=${favicon}&sz=32`} className="w-4 h-4 rounded-sm shrink-0" alt="" />
                  <span>{label}</span>
                </button>
              ))}

              <p className="text-[10px] font-bold text-[#cccccc] uppercase tracking-widest px-2 pb-1 pt-3">Fixes</p>
              {([
                { id: "fixes:listicles",       label: "Listicles Generator", badge: ""    },
                { id: "fixes:llms-txt",        label: "llms.txt Generator",  badge: ""    },
                { id: "fixes:comparison",      label: "Comparison Pages",    badge: ""    },
                { id: "fixes:hero-rewrite",    label: "Hero Rewrite",        badge: ""    },
              ] as const).map(({ id, label, badge }) => (
                <button
                  key={id}
                  onClick={() => { setActivePage(id as Page); setMoreOpen(false); }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl text-[14px] font-medium text-left transition-colors",
                    activePage === id ? "bg-[#5B2D91]/[0.06] text-[#5B2D91]" : "text-[#333] active:bg-[#ddd5f5]"
                  )}
                >
                  <span>{label}</span>
                  {badge && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">{badge}</span>}
                </button>
              ))}

              <p className="text-[10px] font-bold text-[#cccccc] uppercase tracking-widest px-2 pb-1 pt-3">Other</p>
              {([
                { id: "visitors",            label: "Visitors",            badge: "Pro", Icon: Users  },
                { id: "competitor-playbook", label: "Competitor Playbook", badge: "Pro", Icon: Swords },
                { id: "brand",               label: "Brand",               badge: "",    Icon: Tag    },
              ] as const).map(({ id, label, badge, Icon }) => (
                <button
                  key={id}
                  onClick={() => { setActivePage(id as Page); setMoreOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium text-left transition-colors",
                    activePage === id ? "bg-[#5B2D91]/[0.06] text-[#5B2D91]" : "text-[#333] active:bg-[#ddd5f5]"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0 text-[#bbb]" />
                  <span className="flex-1">{label}</span>
                  {badge && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">{badge}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-[#e8e8e8] flex items-stretch h-14">
          {([
            { id: "overview", label: "Overview", Icon: LayoutDashboard },
            { id: "prompts",  label: "Prompts",  Icon: MessageSquare   },
            { id: "sources",  label: "Sources",  Icon: Globe           },
            { id: "fixes:listicles", label: "Fixes", Icon: ListChecks  },
          ] as const).map(({ id, label, Icon }) => {
            const active = !moreOpen && (activePage === id || (id === "fixes:listicles" && activePage.startsWith("fixes:")));
            return (
              <button
                key={id}
                onClick={() => { setActivePage(id as Page); setMoreOpen(false); }}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                  active ? "text-[#5B2D91]" : "text-[#aaaaaa]"
                )}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            );
          })}
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
              moreOpen || ["visitors", "competitor-playbook", "brand"].includes(activePage) ? "text-[#5B2D91]" : "text-[#aaaaaa]"
            )}
          >
            <Menu className="w-5 h-5" />
            More
          </button>
        </nav>
      </div>

      {/* Spotlight onboarding tour — shown once per browser, desktop only */}
      {showTour && (
        <SpotlightTour
          steps={TOUR_STEPS}
          onComplete={() => {
            setShowTour(false);
            localStorage.setItem("comly_tour_done", "1");
            window.dispatchEvent(new CustomEvent("comly:tour:close-content"));
            setActivePage("overview");
          }}
        />
      )}
    </motion.div>
  );
}

