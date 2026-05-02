"use client";

import { useState } from "react";
import { PromptResult, BrandProfile } from "@/types";
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, SlidersHorizontal } from "lucide-react";
import { PROMPT_MODELS } from "@/lib/prompt-models";

const PROMPT_LABELS = [
  "Direct Brand", "Direct Brand",
  "Discovery", "Discovery", "Discovery",
  "Competitor", "Competitor", "Competitor",
  "Discovery",
  "Open Ended", "Open Ended",
];

const LABEL_STYLES: Record<string, { pill: string; dot: string; color: string }> = {
  Discovery:      { pill: "bg-blue-50 text-blue-600 border border-blue-100",      dot: "bg-blue-500",    color: "#3b82f6" },
  Competitor:     { pill: "bg-orange-50 text-orange-600 border border-orange-100", dot: "bg-orange-500",  color: "#f97316" },
  "Direct Brand": { pill: "bg-purple-50 text-purple-600 border border-purple-100", dot: "bg-purple-500",  color: "#a855f7" },
  "Open Ended":   { pill: "bg-[#f7f7f5] text-[#6b6b6b] border border-[#e5e5e5]",  dot: "bg-[#aaaaaa]",  color: "#aaaaaa" },
  Other:          { pill: "bg-[#f7f7f5] text-[#6b6b6b] border border-[#e5e5e5]",  dot: "bg-[#aaaaaa]",  color: "#aaaaaa" },
};

type Filter = "all" | "mentioned" | "not-mentioned";

function highlightBrand(text: string, brandName: string) {
  if (!brandName) return text;
  const escaped = brandName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === brandName.toLowerCase()
      ? <mark key={i} className="bg-[#5B2D91]/10 text-[#5B2D91] font-semibold rounded px-0.5 not-italic">{part}</mark>
      : part
  );
}

interface Props {
  promptResults: PromptResult[];
  profile: BrandProfile;
}

export function PromptsPage({ promptResults, profile }: Props) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [filter, setFilter] = useState<Filter>("all");

  const mentioned = promptResults.filter((r) => r.mentioned).length;
  const notMentioned = promptResults.length - mentioned;

  const categories = ["Discovery", "Competitor", "Direct Brand", "Open Ended"] as const;
  const catStats = categories.map((cat) => {
    const indices = PROMPT_LABELS.reduce<number[]>((acc, l, i) => (l === cat ? [...acc, i] : acc), []);
    const total = indices.length;
    const hit = indices.filter((i) => promptResults[i]?.mentioned).length;
    return { cat, hit, total };
  });

  const filtered = promptResults
    .map((r, i) => ({ ...r, index: i, label: PROMPT_LABELS[i] ?? "Other" }))
    .filter((r) =>
      filter === "all" ? true :
      filter === "mentioned" ? r.mentioned :
      !r.mentioned
    );

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#0a0a0a]">Prompt Breakdown</h2>
          <p className="text-[13px] text-[#6b6b6b] mt-0.5">
            AI model responses to each audit query
          </p>
        </div>
        <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-semibold ${
          mentioned > notMentioned
            ? "bg-emerald-50 border-emerald-100 text-emerald-600"
            : "bg-red-50 border-red-100 text-red-500"
        }`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          {mentioned} mentioned
        </div>
      </div>

      {/* Category stats */}
      <div className="grid grid-cols-4 gap-3">
        {catStats.map(({ cat, hit, total }) => {
          const style = LABEL_STYLES[cat];
          return (
            <div key={cat} className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-3">
              <div className="flex items-center gap-1.5 mb-2">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
                <span className="text-[11px] font-bold text-[#aaaaaa] uppercase tracking-wide truncate">{cat}</span>
              </div>
              <p className="text-[22px] font-bold text-[#0a0a0a] leading-none">
                {hit}<span className="text-[14px] font-semibold text-[#aaaaaa]"> hits</span>
              </p>
              <div className="mt-2 h-1 bg-[#f0f0f0] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: total > 0 ? `${(hit / total) * 100}%` : "0%", backgroundColor: style.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="w-3.5 h-3.5 text-[#aaaaaa] shrink-0" />
        <div className="flex items-center gap-1 bg-[#f7f7f5] border border-[#e5e5e5] rounded-lg p-0.5">
          {([
            { key: "all",           label: "All" },
            { key: "mentioned",     label: "Mentioned" },
            { key: "not-mentioned", label: "Not mentioned" },
          ] as { key: Filter; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${
                filter === key
                  ? "bg-white text-[#0a0a0a] shadow-sm border border-[#e5e5e5]"
                  : "text-[#6b6b6b] hover:text-[#0a0a0a]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt list */}
      <div className="space-y-2">
        {filtered.map((r) => {
          const isOpen = expanded[r.index] ?? false;
          const style = LABEL_STYLES[r.label];
          const preview = r.response_text?.slice(0, 120);

          return (
            <div
              key={r.index}
              className={`bg-white rounded-xl overflow-hidden transition-all border ${
                r.mentioned
                  ? isOpen ? "border-[#5B2D91]/20 shadow-sm" : "border-[#e5e5e5]"
                  : "border-[#f0f0f0]"
              }`}
            >
              <button
                className="w-full flex items-start gap-4 px-5 py-4 text-left hover:bg-[#fafafa] transition-colors"
                onClick={() => setExpanded((p) => ({ ...p, [r.index]: !isOpen }))}
              >
                {/* Index + status */}
                <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
                  <span className="text-[11px] font-bold text-[#aaaaaa]">
                    {String(r.index + 1).padStart(2, "0")}
                  </span>
                  {r.mentioned
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    : <XCircle className="w-4 h-4 text-[#d0d0d0]" />
                  }
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.pill}`}>
                      {r.label}
                    </span>
                    {r.mentioned ? (
                      <span className="text-[11px] font-semibold text-emerald-600">
                        Mentioned{r.position ? ` · ranked #${r.position}` : ""}
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#aaaaaa]">Not mentioned</span>
                    )}
                  </div>
                  <p className={`text-[13px] font-medium leading-snug ${r.mentioned ? "text-[#0a0a0a]" : "text-[#6b6b6b]"}`}>
                    &ldquo;{r.prompt}&rdquo;
                  </p>
                  {/* Response preview — only when not expanded and mentioned */}
                  {!isOpen && r.mentioned && preview && (
                    <p className="mt-1.5 text-[12px] text-[#aaaaaa] leading-relaxed line-clamp-1">
                      {preview}…
                    </p>
                  )}
                </div>

                {/* Chevron */}
                <div className="text-[#aaaaaa] shrink-0 mt-0.5">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Expanded panel */}
              {isOpen && (
                <div className="border-t border-[#f0f0f0] bg-[#fafafa]">
                  {/* Model header */}
                  {(() => {
                    const model = PROMPT_MODELS[r.index] ?? PROMPT_MODELS[0];
                    return (
                      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-[#f0f0f0]">
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${model.domain}&sz=32`}
                          alt={model.name}
                          width={18}
                          height={18}
                          className="w-[18px] h-[18px] rounded-md"
                        />
                        <span className="text-[12px] font-semibold text-[#0a0a0a]">{model.name}</span>
                      </div>
                    );
                  })()}

                  {/* Response body */}
                  <div className="px-5 py-4">
                    {r.response_text ? (
                      <p className="text-[13px] text-[#3a3a3a] leading-relaxed whitespace-pre-wrap">
                        {highlightBrand(r.response_text, profile.brand_name)}
                      </p>
                    ) : (
                      <p className="text-[13px] text-[#aaaaaa] italic">No response recorded.</p>
                    )}
                  </div>

                  {/* Also mentioned */}
                  {r.competitors_mentioned.length > 0 && (
                    <div className="px-5 pb-4">
                      <p className="text-[10px] font-bold text-[#aaaaaa] uppercase tracking-widest mb-2">
                        Also mentioned
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {r.competitors_mentioned.map((c) => (
                          <span
                            key={c.name}
                            className={`text-[11px] px-2.5 py-1 rounded-full border font-semibold ${
                              c.name.toLowerCase() === profile.brand_name.toLowerCase()
                                ? "bg-[#5B2D91]/10 text-[#5B2D91] border-[#5B2D91]/20"
                                : "bg-white text-[#6b6b6b] border-[#e5e5e5]"
                            }`}
                          >
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-14 bg-white border border-[#f0f0f0] rounded-xl">
            <p className="text-[14px] text-[#aaaaaa]">No prompts match this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
