"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Sidebar } from "@/components/dashboard/sidebar";
import { OverviewPanel } from "@/components/dashboard/overview-panel";
import { PromptsPage } from "@/components/dashboard/prompts-page";
import { BrandSourcesPanel } from "@/components/dashboard/brand-sources-panel";
import { ListiclesPage } from "@/components/dashboard/listicles-page";
import { LlmsTxtPage } from "@/components/dashboard/llms-txt-page";
import { ComparisonPagesPage } from "@/components/dashboard/comparison-pages";
import { HeroRewritePage } from "@/components/dashboard/hero-rewrite-page";
import { BrandPage } from "@/components/dashboard/brand-page";
import { EngagementThreadsPage } from "@/components/dashboard/engagement-threads";
import { QuoraThreadsPage } from "@/components/dashboard/quora-threads";
import { CompetitorPlaybookPanel } from "@/components/dashboard/competitor-playbook-panel";
import { VisitorsPage } from "@/components/dashboard/visitors-page";
import {
  DEMO_PROFILE,
  DEMO_PROMPT_RESULTS,
  DEMO_COMPETITOR_RANKINGS,
  DEMO_AUDIT_RESULT,
  DEMO_THREADS,
  DEMO_QUORA_THREADS,
  DEMO_PLAYBOOK_DATA,
} from "@/lib/demo-data";

type Page =
  | "overview"
  | "prompts"
  | "sources"
  | "brand"
  | "visitors"
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
          demoUnlockedPages={["visitors", "competitor-playbook"]}
          collapsed={!sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpen={() => setSidebarOpen(true)}
        />
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ scrollBehavior: "smooth" }}>
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
              <BrandSourcesPanel profile={DEMO_PROFILE} />
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

            {/* VISITORS */}
            {activePage === "visitors" && (
              <VisitorsPage profile={DEMO_PROFILE} demoMode />
            )}

            {/* COMPETITOR PLAYBOOK */}
            {activePage === "competitor-playbook" && (
              <CompetitorPlaybookPanel
                competitorRankings={DEMO_COMPETITOR_RANKINGS}
                promptResults={[]}
                profile={DEMO_PROFILE}
                demoData={DEMO_PLAYBOOK_DATA}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
