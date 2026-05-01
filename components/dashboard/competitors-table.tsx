"use client";

import { useState, useEffect, useRef } from "react";
import { PromptResult, CompetitorRanking } from "@/types";
import { Trophy } from "lucide-react";

const BRAND_COLORS = [
  "#5B2D91", "#ef4444", "#3b82f6", "#f59e0b", "#10b981", "#a855f7",
];

const MAX_COMPETITORS = 10;

function BrandAvatar({ name, domain, color }: { name: string; domain: string; color: string }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setStatus(imgRef.current.naturalWidth > 0 ? "loaded" : "error");
    }
  }, []);

  const showFallback = status === "error" || !domain;

  if (showFallback) {
    return (
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold text-white shrink-0"
        style={{ backgroundColor: color }}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className="w-8 h-8 rounded-lg shrink-0 relative border border-[#e5e5e5] overflow-hidden bg-white">
      {status === "loading" && (
        <div className="absolute inset-0 bg-[#f7f7f5] animate-pulse" />
      )}
      <img
        ref={imgRef}
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
        alt={name}
        width={32}
        height={32}
        className={`w-8 h-8 object-contain transition-opacity duration-300 ${status === "loaded" ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
      />
    </div>
  );
}

interface BrandRow {
  name: string;
  domain: string;
  visibility: number;
  position: number | null;
  isYou: boolean;
  colorIdx: number;
}

interface Props {
  competitorRankings: CompetitorRanking[];
  promptResults: PromptResult[];
  brandName: string;
  brandUrl?: string;
  totalMentions: number;
  specifiedCompetitors?: string[];
}

function domainFromUrl(url: string): string {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function CompetitorsTable({ competitorRankings, promptResults, brandName, brandUrl, totalMentions, specifiedCompetitors }: Props) {
  const totalPrompts = promptResults.length || 10;

  const mentionedWithPos = promptResults.filter((p) => p.mentioned && p.position !== null);
  const brandAvgPos = mentionedWithPos.length > 0
    ? mentionedWithPos.reduce((s, p) => s + p.position!, 0) / mentionedWithPos.length
    : null;

  const brandVisibility = Math.round((totalMentions / totalPrompts) * 100);

  const brandDomain = brandUrl ? domainFromUrl(brandUrl) : "";

  const rankedRows: BrandRow[] = competitorRankings.slice(0, MAX_COMPETITORS).map((c, i) => ({
    name: c.name,
    domain: c.domain,
    visibility: Math.round((c.mentions / totalPrompts) * 100),
    position: c.avg_position,
    isYou: false,
    colorIdx: (i + 1) % BRAND_COLORS.length,
  }));

  // Always include specified competitors even if they got 0 mentions
  const rankedNames = new Set(rankedRows.map((r) => r.name.toLowerCase()));
  const zeroRows: BrandRow[] = (specifiedCompetitors ?? [])
    .filter((name) => !rankedNames.has(name.toLowerCase()))
    .map((name, i) => ({
      name,
      domain: "",
      visibility: 0,
      position: null,
      isYou: false,
      colorIdx: (rankedRows.length + i + 1) % BRAND_COLORS.length,
    }));

  const isSpecified = (name: string) =>
    specifiedCompetitors?.some((s) => s.toLowerCase() === name.toLowerCase()) ?? false;

  const allRows: BrandRow[] = [
    {
      name: brandName,
      domain: brandDomain,
      visibility: brandVisibility,
      position: brandAvgPos !== null ? Math.round(brandAvgPos * 10) / 10 : null,
      isYou: true,
      colorIdx: 0,
    },
    ...rankedRows,
    ...zeroRows,
  ]
    .filter((r) => r.isYou || r.visibility > 0 || isSpecified(r.name))
    .sort((a, b) => b.visibility - a.visibility);

  const rows = allRows;
  const maxVis = Math.max(...allRows.map((r) => r.visibility), 1);

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-6 py-5 border-b border-[#e5e5e5]">
        <div>
          <h3 className="text-base font-semibold text-[#0a0a0a]">Competitors</h3>
          <p className="text-[13px] text-[#6b6b6b] mt-0.5">{brandName} vs. the field</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f7f7f5] border border-[#e5e5e5]">
          <Trophy className="w-3.5 h-3.5 text-[#6b6b6b]" />
          <span className="text-[12px] font-semibold text-[#6b6b6b]">{allRows.length} brands</span>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[20px_minmax(0,1fr)_120px] gap-3 px-6 py-2.5 border-b border-[#f0f0f0] bg-[#fafafa]">
        <span className="text-[10px] font-bold text-[#aaaaaa] uppercase tracking-wide">#</span>
        <span className="text-[10px] font-bold text-[#aaaaaa] uppercase tracking-wide">Brand</span>
        <span className="text-[10px] font-bold text-[#aaaaaa] uppercase tracking-wide text-right">Visibility</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#f7f7f5]">
        {rows.map((row, i) => {
          const color = BRAND_COLORS[row.colorIdx];
          const barWidth = maxVis > 0 ? (row.visibility / maxVis) * 100 : 0;

          return (
            <div
              key={row.name}
              className={`grid grid-cols-[20px_minmax(0,1fr)_120px] gap-3 items-center px-6 py-3 hover:bg-[#fafafa] transition-colors ${
                row.isYou ? "bg-[#5B2D91]/[0.02]" : ""
              }`}
            >
              <span className={`text-[12px] font-semibold ${row.isYou ? "text-[#5B2D91]" : "text-[#aaaaaa]"}`}>
                {i + 1}
              </span>

              <div className="min-w-0 flex items-center gap-2.5">
                <BrandAvatar name={row.name} domain={row.domain} color={color} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    {row.domain ? (
                      <a
                        href={`https://${row.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-[13px] font-semibold truncate hover:underline ${row.isYou ? "text-[#5B2D91]" : "text-[#0a0a0a]"}`}
                      >
                        {row.name}
                      </a>
                    ) : (
                      <span className={`text-[13px] font-semibold truncate ${row.isYou ? "text-[#5B2D91]" : "text-[#0a0a0a]"}`}>
                        {row.name}
                      </span>
                    )}
                    {row.isYou && (
                      <span className="shrink-0 text-[10px] font-bold bg-[#5B2D91]/10 text-[#5B2D91] px-1.5 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-[13px] font-bold ${row.isYou ? "text-[#5B2D91]" : "text-[#0a0a0a]"}`}>
                  {row.visibility}%
                </span>
                <div className="mt-1.5 h-[3px] bg-[#f0f0f0] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${barWidth}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
