"use client";

import { useState } from "react";
import { PromptResult } from "@/types";
import { MessageSquareQuote, ChevronDown, ChevronUp, FileText, ChevronRight } from "lucide-react";
import { PROMPT_MODELS } from "@/lib/prompt-models";

const PROMPT_LABELS: Record<number, string> = {
  0: "Discovery", 1: "Discovery", 2: "Discovery", 3: "Discovery",
  4: "Competitor", 5: "Competitor",
  6: "Direct Brand", 7: "Direct Brand",
  8: "Open Ended", 9: "Open Ended",
};

const LABEL_STYLES: Record<string, string> = {
  Discovery:      "bg-blue-50 text-blue-600",
  Competitor:     "bg-orange-50 text-orange-600",
  "Direct Brand": "bg-purple-50 text-purple-600",
  "Open Ended":   "bg-[#f7f7f5] text-[#6b6b6b]",
};

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

function ResponseCard({ result, index, brandName }: { result: PromptResult; index: number; brandName: string }) {
  const [expanded, setExpanded] = useState(false);
  const label = PROMPT_LABELS[index] ?? "Other";
  const model = PROMPT_MODELS[index] ?? PROMPT_MODELS[0];
  const preview = result.response_text.slice(0, 280);
  const isLong = result.response_text.length > 280;

  return (
    <div className="border border-[#e5e5e5] rounded-xl overflow-hidden">
      {/* Card header */}
      <div className="flex items-start gap-3 px-5 py-4 bg-[#fafafa] border-b border-[#f0f0f0]">
        <img
          src={`https://www.google.com/s2/favicons?domain=${model.domain}&sz=32`}
          alt={model.name}
          width={20}
          height={20}
          className="w-5 h-5 object-contain rounded-md shrink-0 mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[13px] font-semibold text-[#0a0a0a]">{model.name}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${LABEL_STYLES[label]}`}>
              {label}
            </span>
            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
              Mentioned
            </span>
          </div>
          <p className="text-[12px] text-[#6b6b6b] italic truncate">&ldquo;{result.prompt}&rdquo;</p>
        </div>
      </div>

      {/* Response text */}
      <div className="px-5 py-4">
        <p className="text-[13px] text-[#3a3a3a] leading-relaxed">
          {expanded
            ? highlightBrand(result.response_text, brandName)
            : highlightBrand(preview + (isLong ? "…" : ""), brandName)}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 flex items-center gap-1 text-[12px] font-semibold text-[#5B2D91] hover:text-[#4a2478] transition-colors"
          >
            {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</> : <><ChevronDown className="w-3.5 h-3.5" /> Read full response</>}
          </button>
        )}
      </div>
    </div>
  );
}

interface Props {
  promptResults: PromptResult[];
  brandName: string;
  onNavigate: (page: string) => void;
}

const PAGE_SIZE = 3;

export function ModelBreakdown({ promptResults, brandName, onNavigate }: Props) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const mentions = promptResults
    .map((r, i) => ({ ...r, originalIndex: i }))
    .filter((r) => r.mentioned && r.response_text);

  const displayed = mentions.slice(0, visibleCount);
  const hasMore = visibleCount < mentions.length;

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e5e5]">
        <div>
          <h3 className="text-base font-semibold text-[#0a0a0a]">What AI says about you</h3>
          <p className="text-[13px] text-[#6b6b6b] mt-0.5">
            {mentions.length > 0
              ? `${brandName} appeared in ${mentions.length} AI response${mentions.length !== 1 ? "s" : ""}`
              : `${brandName} was not mentioned in any AI responses`}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#5B2D91]/8 border border-[#5B2D91]/15">
          <MessageSquareQuote className="w-3.5 h-3.5 text-[#5B2D91]" />
          <span className="text-[12px] font-semibold text-[#5B2D91]">{mentions.length} mention{mentions.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Cards */}
      <div className="p-6 space-y-4">
        {mentions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-[14px] text-[#aaaaaa]">No AI responses mentioned {brandName} in this audit.</p>
            <p className="text-[13px] text-[#c0c0c0] mt-1">Try improving your llms.txt and brand description.</p>
          </div>
        ) : (
          <>
            {displayed.map((r) => (
              <ResponseCard
                key={r.originalIndex}
                result={r}
                index={r.originalIndex}
                brandName={brandName}
              />
            ))}
            {hasMore && (
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="w-full py-2.5 rounded-lg border border-[#e5e5e5] text-[13px] font-semibold text-[#6b6b6b] hover:bg-[#f7f7f5] hover:text-[#0a0a0a] transition-colors"
              >
                Show more ({mentions.length - visibleCount} remaining)
              </button>
            )}
            {visibleCount > PAGE_SIZE && (
              <button
                onClick={() => setVisibleCount(PAGE_SIZE)}
                className="w-full py-2.5 rounded-lg border border-[#e5e5e5] text-[13px] font-semibold text-[#6b6b6b] hover:bg-[#f7f7f5] hover:text-[#0a0a0a] transition-colors"
              >
                Show less
              </button>
            )}
          </>
        )}
      </div>

      {/* CTA */}
      <div className="px-5 pb-5 pt-4 border-t border-[#f0f0f0]">
        <button
          onClick={() => onNavigate("fixes:llms-txt")}
          className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl text-left transition-opacity active:opacity-80"
          style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-white leading-snug">Want to change what AI says about you?</p>
              <p className="text-[11px] text-white/70 mt-0.5">Generate your llms.txt file</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-white/70 shrink-0" />
        </button>
      </div>
    </div>
  );
}
