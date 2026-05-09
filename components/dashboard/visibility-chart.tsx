"use client";

import { useState } from "react";
import {
  ComposedChart, Area, Line, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { PromptResult, CompetitorRanking } from "@/types";
import { TrendingUp, BarChart2 } from "lucide-react";

const LINE_COLORS = [
  "#7c3aed", "#ef4444", "#3b82f6", "#f59e0b", "#10b981", "#a855f7",
  "#ec4899", "#14b8a6", "#f97316", "#64748b", "#06b6d4", "#84cc16",
];

interface Props {
  promptResults: PromptResult[];
  competitorRankings: CompetitorRanking[];
  brandName: string;
  brandDomain?: string;
  dark?: boolean;
}

function buildVisibilitySeries(
  promptResults: PromptResult[],
  brandName: string,
  competitors: CompetitorRanking[]
) {
  // Use a rolling 3-prompt window so values go up and down naturally
  const windowSize = 3;
  const points = promptResults.map((_, i) => {
    const from = Math.max(0, i - windowSize + 1);
    const slice = promptResults.slice(from, i + 1);
    const obj: Record<string, number | string> = { label: `P${i + 1}` };
    obj[brandName] = Math.round((slice.filter((p) => p.mentioned).length / slice.length) * 100);
    competitors.forEach((comp) => {
      obj[comp.name] = Math.round(
        (slice.filter((p) => p.competitors_mentioned.some((m) => m.name.toLowerCase() === comp.name.toLowerCase())).length / slice.length) * 100
      );
    });
    return obj;
  });

  return points;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; stroke: string }>;
  label?: string;
  domainMap: Map<string, string>;
}

function CustomTooltip({ active, payload, label, domainMap }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const sorted = [...payload].sort((a, b) => b.value - a.value);
  return (
    <div className="bg-[#1c1c2e] border border-[#353550] rounded-xl px-4 py-3 shadow-2xl min-w-[200px]">
      <p className="text-[#7070888] text-[12px] mb-2.5 font-medium">{label}</p>
      {sorted.map((entry) => {
        const domain = domainMap.get(entry.dataKey) || "";
        return (
          <div key={entry.dataKey} className="flex items-center justify-between gap-6 mb-1.5 last:mb-0">
            <div className="flex items-center gap-2">
              {domain && (
                <img
                  src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
                  alt=""
                  width={16}
                  height={16}
                  className="w-4 h-4 rounded-sm shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
              <span className="text-[#c0c0d8] text-[13px]">{entry.dataKey}</span>
            </div>
            <span className="text-[13px] font-semibold" style={{ color: entry.stroke }}>
              {entry.value}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

function BarTooltip({ active, payload, domainMap }: { active?: boolean; payload?: Array<{ name: string; value: number; fill: string }>; domainMap: Map<string, string> }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const domain = domainMap.get(entry.name) || "";
  return (
    <div className="bg-[#1c1c2e] border border-[#353550] rounded-xl px-3.5 py-2.5 shadow-2xl">
      <div className="flex items-center gap-2 mb-1">
        {domain && (
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
            alt=""
            width={14}
            height={14}
            className="w-3.5 h-3.5 rounded-sm"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
        <span className="text-[#c0c0d8] text-[13px]">{entry.name}</span>
      </div>
      <p className="text-[13px] font-semibold" style={{ color: entry.fill }}>{entry.value}%</p>
    </div>
  );
}

export function VisibilityChart({ promptResults, competitorRankings, brandName, brandDomain, dark = false }: Props) {
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  const topCompetitors = competitorRankings.slice(0, 3);
  const allBrands = [brandName, ...topCompetitors.map((c) => c.name)];
  const allColors = LINE_COLORS.slice(0, allBrands.length);

  const domainMap = new Map<string, string>();
  if (brandDomain) domainMap.set(brandName, brandDomain);
  topCompetitors.forEach((c) => { if (c.domain) domainMap.set(c.name, c.domain); });

  const seriesData = buildVisibilitySeries(promptResults, brandName, topCompetitors);
  const lastPoint = seriesData[seriesData.length - 1];
  const finalValue = lastPoint ? (lastPoint[brandName] as number) : 0;
  const delta = finalValue;

  const barData = allBrands.map((brand, i) => ({
    name: brand,
    value: lastPoint ? (lastPoint[brand] as number) : 0,
    color: allColors[i],
  }));

  const gridStroke = dark ? "#252535" : "#f3f4f6";
  const tickFill = dark ? "#44445a" : "#aaaaaa";
  const cursorFill = dark ? "#1e1e2e" : "#f7f7f5";

  return (
    <div className={dark
      ? "bg-[#161622] border border-[#252535] rounded-2xl overflow-hidden"
      : "bg-white border border-[#e5e5e5] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.10)] overflow-hidden"
    }>
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <div>
          <h3 className={`text-base font-semibold ${dark ? "text-[#e0e0f0]" : "text-[#0a0a0a]"}`}>Visibility</h3>
          <p className={`text-[13px] mt-0.5 ${dark ? "text-[#555570]" : "text-[#6b6b6b]"}`}>Mention rate across prompts</p>
        </div>
        <div className={`flex items-center gap-0.5 border rounded-lg p-0.5 ${dark ? "bg-[#1c1c2a] border-[#353548]" : "bg-[#f7f7f5] border-[#e5e5e5]"}`}>
          <button
            onClick={() => setChartType("line")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${
              chartType === "line"
                ? dark ? "bg-[#252535] text-[#e0e0f0] shadow-sm border border-[#353548]" : "bg-white text-[#0a0a0a] shadow-sm border border-[#e5e5e5]"
                : dark ? "text-[#555570] hover:text-[#9090a8]" : "text-[#aaaaaa] hover:text-[#6b6b6b]"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Line
          </button>
          <button
            onClick={() => setChartType("bar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${
              chartType === "bar"
                ? dark ? "bg-[#252535] text-[#e0e0f0] shadow-sm border border-[#353548]" : "bg-white text-[#0a0a0a] shadow-sm border border-[#e5e5e5]"
                : dark ? "text-[#555570] hover:text-[#9090a8]" : "text-[#aaaaaa] hover:text-[#6b6b6b]"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Bar
          </button>
        </div>
      </div>

      {/* Big stat */}
      <div className="px-6 pb-4 flex items-end gap-3">
        <span className={`text-[48px] font-bold leading-none ${dark ? "text-[#e0e0f0]" : "text-[#0a0a0a]"}`}>{finalValue}%</span>
        <div className="mb-1.5">
          <span className={`text-base font-semibold ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {delta >= 0 ? "+" : ""}{delta}%
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 pb-2">
        {chartType === "line" ? (
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={seriesData} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="brandAreaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity={dark ? 0.2 : 0.12} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={gridStroke} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: tickFill }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: tickFill }} axisLine={false} tickLine={false} width={36} tickFormatter={(v) => `${v}%`} ticks={[0, 25, 50, 75, 100]} domain={[0, 100]} />
              <Tooltip content={(props) => <CustomTooltip {...(props as TooltipProps)} domainMap={domainMap} />} cursor={{ stroke: dark ? "#353548" : "#e5e5e5", strokeWidth: 1 }} />
              {allBrands.slice(1).map((brand, i) => (
                <Line key={brand} type="monotone" dataKey={brand} stroke={allColors[i + 1]} strokeWidth={1} strokeDasharray="4 3" strokeOpacity={0.4} dot={false} activeDot={{ r: 3, fill: allColors[i + 1], stroke: dark ? "#161622" : "white", strokeWidth: 2 }} />
              ))}
              <Area type="monotone" dataKey={brandName} stroke={allColors[0]} strokeWidth={2.5} fill="url(#brandAreaFill)" dot={false} activeDot={{ r: 5, fill: allColors[0], stroke: dark ? "#161622" : "white", strokeWidth: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top: 5, right: 16, left: 0, bottom: 0 }} barSize={28}>
              <CartesianGrid vertical={false} stroke={gridStroke} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: tickFill }} axisLine={false} tickLine={false} width={36} tickFormatter={(v) => `${v}%`} ticks={[0, 25, 50, 75, 100]} domain={[0, 100]} />
              <Tooltip content={<BarTooltip domainMap={domainMap} />} cursor={{ fill: cursorFill }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      <div className="px-6 pb-4 flex items-center gap-4 flex-wrap">
        {allBrands.map((brand, i) => {
          const domain = domainMap.get(brand) || "";
          return (
            <div key={brand} className="flex items-center gap-1.5">
              {domain && (
                <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`} alt="" width={16} height={16} className="w-4 h-4 rounded-sm shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              )}
              <div className="rounded-full shrink-0" style={{ backgroundColor: allColors[i], width: brand === brandName ? 10 : 8, height: brand === brandName ? 10 : 8 }} />
              <span className={`text-[13px] ${brand === brandName ? "font-semibold" : ""} ${dark ? (brand === brandName ? "text-[#e0e0f0]" : "text-[#7070888]") : (brand === brandName ? "text-[#0a0a0a]" : "text-[#6b6b6b]")}`}>{brand}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

