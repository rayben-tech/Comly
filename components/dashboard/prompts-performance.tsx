"use client";

import { useState } from "react";
import { PromptResult } from "@/types";
import { Eye, Hash, ChevronUp, ChevronDown, ChevronsUpDown, ArrowUpRight } from "lucide-react";
import { PROMPT_MODELS } from "@/lib/prompt-models";

const PROMPT_LABELS = [
  "Discovery", "Discovery", "Discovery", "Discovery",
  "Competitor", "Competitor",
  "Direct Brand", "Direct Brand",
  "Open Ended", "Open Ended",
];

const LABEL_STYLES: Record<string, string> = {
  Discovery:      "bg-blue-50 text-blue-600",
  Competitor:     "bg-orange-50 text-orange-600",
  "Direct Brand": "bg-purple-50 text-purple-600",
  "Open Ended":   "bg-[#f7f7f5] text-[#6b6b6b]",
};


type SortKey = "none" | "visibility" | "position";
type SortDir = "asc" | "desc";

interface Props {
  promptResults: PromptResult[];
  brandName: string;
  brandDomain?: string;
  onNavigate: (page: string) => void;
}

export function PromptsPerformance({ promptResults, brandName, brandDomain, onNavigate }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("none");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [favErr, setFavErr] = useState(false);

  const rows = promptResults.map((r, i) => ({
    ...r,
    index: i,
    label: PROMPT_LABELS[i] ?? "Other",
    model: PROMPT_MODELS[i] ?? PROMPT_MODELS[0],
  }));

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = [...rows].sort((a, b) => {
    let diff = 0;
    if (sortKey === "visibility") diff = (a.mentioned ? 1 : 0) - (b.mentioned ? 1 : 0);
    else if (sortKey === "position") {
      if (a.position === null && b.position === null) diff = 0;
      else if (a.position === null) diff = 1;
      else if (b.position === null) diff = -1;
      else diff = b.position - a.position; // higher position number = worse, so desc = best first
    } else {
      // default: mentioned first, then by original index
      diff = (b.mentioned ? 1 : 0) - (a.mentioned ? 1 : 0) || a.index - b.index;
    }
    return sortKey === "position"
      ? (sortDir === "desc" ? -diff : diff) // for position, desc = lowest number first (best)
      : (sortDir === "desc" ? diff : -diff);
  });

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronsUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === "desc"
      ? <ChevronDown className="w-3 h-3 text-[#5B2D91]" />
      : <ChevronUp className="w-3 h-3 text-[#5B2D91]" />;
  }

  function ColHeader({ col, children }: { col: SortKey; children: React.ReactNode }) {
    return (
      <button
        onClick={() => toggleSort(col)}
        className={`flex items-center gap-1 mx-auto transition-colors hover:text-[#0a0a0a] ${sortKey === col ? "text-[#5B2D91]" : "text-[#aaaaaa]"}`}
      >
        {children}
        <SortIcon col={col} />
      </button>
    );
  }

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#f0f0f0] bg-[#fafafa]">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#aaaaaa]">Showing data for</span>
          {brandDomain && !favErr ? (
            <img
              src={`https://www.google.com/s2/favicons?domain=${brandDomain}&sz=32`}
              alt={brandName}
              width={16}
              height={16}
              className="w-4 h-4 rounded-sm"
              onError={() => setFavErr(true)}
            />
          ) : (
            <div className="w-4 h-4 rounded-sm bg-gradient-to-br from-[#5B2D91] to-[#8B5CF6] flex items-center justify-center text-white text-[8px] font-bold shrink-0">
              {brandName.charAt(0)}
            </div>
          )}
          <span className="text-[13px] font-semibold text-[#0a0a0a]">{brandName}</span>
        </div>
        <button
          onClick={() => onNavigate("prompts")}
          className="flex items-center gap-1 text-[12px] font-semibold text-[#5B2D91] hover:text-[#4a2478] transition-colors"
        >
          View all
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f0f0f0]">
              <th className="text-left px-6 py-3 text-[10px] font-bold text-[#aaaaaa] uppercase tracking-wider">
                Prompts
              </th>
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-center">
                <ColHeader col="visibility">Visibility</ColHeader>
              </th>
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-center">
                <ColHeader col="position">Position</ColHeader>
              </th>
              <th className="px-6 py-3 text-[10px] font-bold text-[#aaaaaa] uppercase tracking-wider text-right">
                Model
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f7f7f5]">
            {sorted.map((r) => (
                <tr key={r.index} className="hover:bg-[#fafafa] transition-colors">
                  {/* Prompt */}
                  <td className="px-6 py-3.5 max-w-0 w-[45%]">
                    <div className="flex items-start gap-2">
                      <span className={`shrink-0 mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${LABEL_STYLES[r.label]}`}>
                        {r.label}
                      </span>
                      <span className="text-[13px] text-[#0a0a0a] leading-snug">{r.prompt}</span>
                    </div>
                  </td>

                  {/* Visibility */}
                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold border ${
                      r.mentioned
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                        : "bg-[#f7f7f5] border-[#e5e5e5] text-[#bbbbbb]"
                    }`}>
                      <Eye className="w-3 h-3 shrink-0" />
                      {r.mentioned ? "100%" : "0%"}
                    </span>
                  </td>

                  {/* Position */}
                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    {r.position !== null ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold bg-[#f7f7f5] border border-[#e5e5e5] text-[#6b6b6b]">
                        <Hash className="w-3 h-3 text-[#aaaaaa] shrink-0" />
                        {r.position}
                      </span>
                    ) : (
                      <span className="text-[14px] text-[#d0d0d0] font-medium">—</span>
                    )}
                  </td>

                  {/* Model */}
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${r.model.domain}&sz=32`}
                        alt={r.model.name}
                        width={15}
                        height={15}
                        className="w-[15px] h-[15px] rounded-sm shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <span className="text-[12px] text-[#6b6b6b] font-medium">{r.model.name}</span>
                    </div>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
