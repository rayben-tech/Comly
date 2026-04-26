"use client";

import { Download, ChevronRight } from "lucide-react";
import { PromptResult } from "@/types";

interface TopBarProps {
  brandName: string;
  domain: string;
  score: number;
  totalMentions: number;
  promptResults: PromptResult[];
  onReset: () => void;
  onRerun: () => void;
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

export function TopBar({ brandName, domain, score, totalMentions, promptResults, onReset, onRerun }: TopBarProps) {
  const total = promptResults.length || 10;
  const visibilityPct = Math.round((totalMentions / total) * 100);
  const scoreColor = score >= 60 ? "#10b981" : score >= 30 ? "#f59e0b" : "#ef4444";

  return (
    <div className="bg-white border-b border-[#e8e8e8] shrink-0 flex items-center gap-3 px-6 h-[52px]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[13px]">
        <span className="text-[#aaaaaa] font-medium">Comly</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#d0d0d0]" />
        <div className="flex items-center gap-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
            alt={brandName}
            width={14}
            height={14}
            className="w-3.5 h-3.5 object-contain rounded-sm"
          />
          <span className="font-semibold text-[#0a0a0a]">{brandName}</span>
        </div>
      </div>

      <div className="w-px h-4 bg-[#e8e8e8] mx-1" />

      {/* Score badge */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-bold"
        style={{ background: `${scoreColor}14`, color: scoreColor }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: scoreColor }} />
        Score {score}/100
      </div>

      {/* Visibility */}
      <span className="text-[12px] text-[#aaaaaa] font-medium">
        Visibility <span className="text-[#0a0a0a] font-semibold">{visibilityPct}%</span>
      </span>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => exportCSV(brandName, score, promptResults)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white text-[13px] font-semibold transition-colors shadow-sm active:opacity-80"
          style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
      </div>
    </div>
  );
}
