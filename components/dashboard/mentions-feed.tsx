"use client";

import { useState } from "react";
import { PromptResult, BrandProfile } from "@/types";
import { ArrowRight } from "lucide-react";

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

const MODELS = [
  { name: "ChatGPT",    domain: "chatgpt.com" },
  { name: "Perplexity", domain: "perplexity.ai" },
  { name: "Claude",     domain: "claude.ai" },
  { name: "Gemini",     domain: "gemini.google.com" },
];

function recentDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ModelIcon({ domain, name }: { domain: string; name: string }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div className="w-6 h-6 rounded-full bg-[#5B2D91] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
        {name[0]}
      </div>
    );
  }
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
      alt={name}
      width={24}
      height={24}
      className="w-6 h-6 rounded-full object-contain border border-[#e5e5e5] shrink-0"
      onError={() => setErr(true)}
    />
  );
}

interface Props {
  promptResults: PromptResult[];
  profile: BrandProfile;
}

export function MentionsFeed({ promptResults, profile }: Props) {
  const mentions = promptResults
    .filter((r) => r.mentioned && r.response_text)
    .map((r, idx) => ({
      ...r,
      label: PROMPT_LABELS[promptResults.indexOf(r)] ?? "Other",
      model: MODELS[idx % MODELS.length],
      date: recentDate(idx + 1),
    }))
    .slice(0, 5);

  if (mentions.length === 0) {
    return (
      <div className="bg-white border border-[#e5e5e5] rounded-xl p-8 text-center">
        <p className="text-[14px] text-[#aaaaaa]">No mentions found in this audit.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e5e5]">
        <div>
          <h3 className="text-base font-semibold text-[#0a0a0a]">Your mentions</h3>
          <p className="text-[13px] text-[#6b6b6b] mt-0.5">
            {profile.brand_name} appeared in {mentions.length} AI responses
          </p>
        </div>
        <span className="text-[13px] text-[#aaaaaa]">Live feed from AI models</span>
      </div>

      {/* Feed */}
      <div className="divide-y divide-[#f7f7f5]">
        {mentions.map((m, idx) => {
          const preview = m.response_text.length > 160
            ? m.response_text.slice(0, 160).trimEnd() + "…"
            : m.response_text;

          return (
            <div
              key={idx}
              className="flex gap-3.5 px-6 py-4 hover:bg-[#fafafa] transition-colors cursor-pointer"
            >
              {/* Model icon */}
              <ModelIcon domain={m.model.domain} name={m.model.name} />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[14px] font-bold text-[#0a0a0a]">{m.model.name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${LABEL_STYLES[m.label]}`}>
                      {m.label}
                    </span>
                    {m.position && (
                      <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                        #{m.position}
                      </span>
                    )}
                  </div>
                  <span className="text-[13px] text-[#aaaaaa] shrink-0">{m.date}</span>
                </div>
                <p className="text-[13px] font-medium text-[#0a0a0a] mb-1 line-clamp-1">{m.prompt}</p>
                <p className="text-[13px] text-[#6b6b6b] leading-relaxed line-clamp-2">{preview}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-3.5 border-t border-[#f0f0f0] flex justify-end">
        <button className="flex items-center gap-1.5 text-[13px] font-semibold text-[#0a0a0a] hover:text-[#6b6b6b] transition-colors">
          View all mentions
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
