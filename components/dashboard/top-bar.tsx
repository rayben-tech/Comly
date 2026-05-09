"use client";

import { Download, RefreshCw, PanelLeftOpen } from "lucide-react";
import { PromptResult } from "@/types";

interface TopBarProps {
  brandName: string;
  domain: string;
  score: number;
  totalMentions: number;
  promptResults: PromptResult[];
  onReset: () => void;
  onRerun: () => void;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

function exportCSV(brandName: string, score: number, promptResults: PromptResult[]) {
  const rows: string[][] = [
    ["Comly AI Visibility Audit"],
    ["Brand", brandName],
    ["Score", String(score)],
    ["Visibility", `${Math.round((promptResults.filter((r) => r.mentioned).length / promptResults.length) * 100)}%`],
    ["Date", new Date().toLocaleDateString()],
    [],
    ["#", "Prompt", "Mentioned", "Position", "Competitors Mentioned"],
    ...promptResults.map((r, i) => [
      String(i + 1),
      r.prompt,
      r.mentioned ? "Yes" : "No",
      r.position !== null ? String(r.position) : "—",
      r.competitors_mentioned.map((c) => c.name).join("; "),
    ]),
  ];
  const csv = rows
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `comly-audit-${brandName.toLowerCase().replace(/\s+/g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function TopBar({
  brandName,
  domain,
  score,
  totalMentions,
  promptResults,
  onRerun,
  sidebarOpen = true,
  onToggleSidebar,
}: TopBarProps) {
  const total = promptResults.length || 11;
  const visibilityPct = Math.round((totalMentions / total) * 100);
  const scoreColor = score >= 60 ? "#34d399" : score >= 30 ? "#fbbf24" : "#f87171";
  const scoreBg = score >= 60 ? "rgba(52,211,153,0.12)" : score >= 30 ? "rgba(251,191,36,0.12)" : "rgba(248,113,113,0.12)";
  const auditDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="bg-[#0d0d14] border-b border-[#1c1c2a] shrink-0 flex items-center gap-3 px-4 h-[52px]">

      {/* Sidebar open button — shown only when sidebar is collapsed */}
      {!sidebarOpen && (
        <button
          onClick={onToggleSidebar}
          title="Expand sidebar"
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-[#3e3e56] hover:text-[#c4b5fd] hover:bg-[#5B2D91]/10 transition-colors shrink-0"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      )}

      {/* Brand identity */}
      <div className="flex items-center gap-2 min-w-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
          alt={brandName}
          width={18}
          height={18}
          className="w-[18px] h-[18px] rounded-md object-contain shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <span className="text-[14px] font-bold text-[#e0e0f0] truncate">{brandName}</span>
        <span className="text-[#2e2e42] hidden sm:inline shrink-0">·</span>
        <span className="text-[12px] text-[#4e4e6a] hidden sm:inline shrink-0 whitespace-nowrap">
          Last analyzed {auditDate}
        </span>
      </div>

      {/* Score badge — pushed right */}
      <div className="ml-auto flex items-center gap-3 shrink-0">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-bold"
          style={{ background: scoreBg, color: scoreColor }}
        >
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: scoreColor }} />
          {score}/100
        </div>

        <span className="text-[12px] text-[#4e4e6a] hidden md:inline whitespace-nowrap">
          {visibilityPct}% visible
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onRerun}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#252536] text-[12px] font-semibold text-[#6e6e8a] hover:border-[#5B2D91]/50 hover:text-[#c4b5fd] transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Re-run</span>
          </button>
          <button
            onClick={() => exportCSV(brandName, score, promptResults)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white transition-opacity active:opacity-80"
            style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

    </div>
  );
}
