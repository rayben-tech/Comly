"use client";

import { PromptResult, CompetitorRanking } from "@/types";

const BRAND_COLOR = "#7c3aed";
const COMPETITOR_COLORS = ["#ef4444", "#3b82f6", "#f59e0b", "#10b981", "#a855f7", "#ec4899"];

interface Props {
  brandName: string;
  brandDomain?: string;
  totalMentions: number;
  promptResults: PromptResult[];
  competitorRankings: CompetitorRanking[];
  dark?: boolean;
}

export function ShareOfVoice({ brandName, brandDomain, totalMentions, promptResults, competitorRankings, dark = false }: Props) {
  const total = promptResults.length || 11;
  const brandVisibility = Math.round((totalMentions / total) * 100);

  const rows = [
    {
      name: brandName,
      domain: brandDomain || "",
      visibility: brandVisibility,
      isYou: true,
      color: BRAND_COLOR,
    },
    ...competitorRankings.slice(0, 5).map((c, i) => ({
      name: c.name,
      domain: c.domain,
      visibility: Math.round((c.mentions / total) * 100),
      isYou: false,
      color: COMPETITOR_COLORS[i % COMPETITOR_COLORS.length],
    })),
  ].sort((a, b) => b.visibility - a.visibility);

  const maxVis = Math.max(...rows.map((r) => r.visibility), 1);

  return (
    <div className={dark
      ? "bg-[#161622] border border-[#252535] rounded-2xl overflow-hidden"
      : "bg-white border border-[#e5e5e5] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.10)] overflow-hidden"
    }>
      <div className={`px-5 py-4 border-b ${dark ? "border-[#252535]" : "border-[#f0f0f0]"}`}>
        <h3 className={`text-[14px] font-semibold ${dark ? "text-[#e0e0f0]" : "text-[#0a0a0a]"}`}>Share of Voice</h3>
        <p className={`text-[12px] mt-0.5 ${dark ? "text-[#555570]" : "text-[#aaaaaa]"}`}>Your AI mentions vs competitors</p>
      </div>

      <div className="px-5 py-4 space-y-3.5">
        {rows.map((row) => {
          const barWidth = maxVis > 0 ? (row.visibility / maxVis) * 100 : 0;
          return (
            <div key={row.name}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  {row.domain ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${row.domain}&sz=16`}
                      alt={row.name}
                      width={14}
                      height={14}
                      className="w-[14px] h-[14px] rounded-sm shrink-0 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div
                      className="w-[14px] h-[14px] rounded-sm shrink-0 flex items-center justify-center text-white text-[8px] font-bold"
                      style={{ backgroundColor: row.color }}
                    >
                      {row.name.charAt(0)}
                    </div>
                  )}
                  <span className={`text-[12px] font-semibold truncate ${row.isYou ? "text-[#a78bfa]" : dark ? "text-[#c0c0d8]" : "text-[#0a0a0a]"}`}>
                    {row.name}
                  </span>
                  {row.isYou && (
                    <span className="shrink-0 text-[9px] font-bold bg-[#7c3aed]/15 text-[#a78bfa] px-1.5 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                </div>
                <span className={`text-[13px] font-bold shrink-0 ml-2 ${row.isYou ? "text-[#a78bfa]" : dark ? "text-[#e0e0f0]" : "text-[#0a0a0a]"}`}>
                  {row.visibility}%
                </span>
              </div>
              <div className={`h-1.5 rounded-full overflow-hidden ${dark ? "bg-[#252535]" : "bg-[#f0f0f0]"}`}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: row.color,
                    opacity: row.isYou ? 1 : 0.65,
                  }}
                />
              </div>
            </div>
          );
        })}

        {rows.length === 0 && (
          <p className={`text-[13px] py-4 text-center ${dark ? "text-[#555570]" : "text-[#aaaaaa]"}`}>No data yet.</p>
        )}
      </div>
    </div>
  );
}

