"use client";

import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { PromptResult, CompetitorRanking } from "@/types";
import { TrendingUp, BarChart2 } from "lucide-react";

const LINE_COLORS = [
  "#5B2D91", "#ef4444", "#3b82f6", "#f59e0b", "#10b981", "#a855f7",
  "#ec4899", "#14b8a6", "#f97316", "#64748b", "#06b6d4", "#84cc16",
];

interface Props {
  promptResults: PromptResult[];
  competitorRankings: CompetitorRanking[];
  brandName: string;
  brandDomain?: string;
}

function buildVisibilitySeries(
  promptResults: PromptResult[],
  brandName: string,
  competitors: CompetitorRanking[]
) {
  // Start every brand at 0 (P0), then build up
  const zeroPoint: Record<string, number | string> = { label: "P0" };
  zeroPoint[brandName] = 0;
  competitors.forEach((c) => { zeroPoint[c.name] = 0; });

  const points = promptResults.map((_, i) => {
    const window = promptResults.slice(0, i + 1);
    const obj: Record<string, number | string> = { label: `P${i + 1}` };
    obj[brandName] = Math.round((window.filter((p) => p.mentioned).length / (i + 1)) * 100);
    competitors.forEach((comp) => {
      obj[comp.name] = Math.round(
        (window.filter((p) => p.competitors_mentioned.some((m) => m.name.toLowerCase() === comp.name.toLowerCase())).length / (i + 1)) * 100
      );
    });
    return obj;
  });

  return [zeroPoint, ...points];
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
    <div className="bg-[#5B2D91] rounded-xl px-4 py-3 shadow-2xl min-w-[200px]">
      <p className="text-[#aaaaaa] text-[12px] mb-2.5 font-medium">{label}</p>
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
              <span className="text-white text-[13px]">{entry.dataKey}</span>
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
    <div className="bg-[#5B2D91] rounded-xl px-3.5 py-2.5 shadow-2xl">
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
        <span className="text-white text-[13px]">{entry.name}</span>
      </div>
      <p className="text-[13px] font-semibold" style={{ color: entry.fill }}>{entry.value}%</p>
    </div>
  );
}

export function VisibilityChart({ promptResults, competitorRankings, brandName, brandDomain }: Props) {
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  const topCompetitors = competitorRankings.slice(0, 11);
  const allBrands = [brandName, ...topCompetitors.map((c) => c.name)];
  const allColors = LINE_COLORS.slice(0, allBrands.length);

  const domainMap = new Map<string, string>();
  if (brandDomain) domainMap.set(brandName, brandDomain);
  topCompetitors.forEach((c) => { if (c.domain) domainMap.set(c.name, c.domain); });

  const seriesData = buildVisibilitySeries(promptResults, brandName, topCompetitors);
  const lastPoint = seriesData[seriesData.length - 1];
  const finalValue = lastPoint ? (lastPoint[brandName] as number) : 0;
  const delta = finalValue; // delta from 0

  // Bar chart data: final visibility per brand
  const barData = allBrands.map((brand, i) => ({
    name: brand,
    value: lastPoint ? (lastPoint[brand] as number) : 0,
    color: allColors[i],
  }));

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <div>
          <h3 className="text-base font-semibold text-[#0a0a0a]">Visibility</h3>
          <p className="text-[13px] text-[#6b6b6b] mt-0.5">Mention rate across prompts</p>
        </div>
        <div className="flex items-center gap-0.5 bg-[#f7f7f5] border border-[#e5e5e5] rounded-lg p-0.5">
          <button
            onClick={() => setChartType("line")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${
              chartType === "line"
                ? "bg-white text-[#0a0a0a] shadow-sm border border-[#e5e5e5]"
                : "text-[#aaaaaa] hover:text-[#6b6b6b]"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Line
          </button>
          <button
            onClick={() => setChartType("bar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${
              chartType === "bar"
                ? "bg-white text-[#0a0a0a] shadow-sm border border-[#e5e5e5]"
                : "text-[#aaaaaa] hover:text-[#6b6b6b]"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Bar
          </button>
        </div>
      </div>

      {/* Big stat */}
      <div className="px-6 pb-4 flex items-end gap-3">
        <span className="text-[48px] font-bold text-[#0a0a0a] leading-none">{finalValue}%</span>
        <div className="mb-1.5">
          <span className={`text-base font-semibold ${delta >= 0 ? "text-emerald-500" : "text-red-400"}`}>
            {delta >= 0 ? "+" : ""}{delta}%
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 pb-2">
        {chartType === "line" ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={seriesData} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#f3f4f6" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#aaaaaa" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#aaaaaa" }}
                axisLine={false}
                tickLine={false}
                width={36}
                tickFormatter={(v) => `${v}%`}
                ticks={[0, 25, 50, 75, 100]}
                domain={[0, 100]}
              />
              <Tooltip
                content={(props) => (
                  <CustomTooltip {...(props as TooltipProps)} domainMap={domainMap} />
                )}
                cursor={{ stroke: "#e5e5e5", strokeWidth: 1 }}
              />
              {allBrands.map((brand, i) => (
                <Line
                  key={brand}
                  type="monotone"
                  dataKey={brand}
                  stroke={allColors[i]}
                  strokeWidth={brand === brandName ? 2.5 : 1.5}
                  strokeDasharray={brand === brandName ? undefined : "4 3"}
                  dot={false}
                  activeDot={{ r: 4, fill: allColors[i], stroke: "white", strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top: 5, right: 16, left: 0, bottom: 0 }} barSize={28}>
              <CartesianGrid vertical={false} stroke="#f3f4f6" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#aaaaaa" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#aaaaaa" }}
                axisLine={false}
                tickLine={false}
                width={36}
                tickFormatter={(v) => `${v}%`}
                ticks={[0, 25, 50, 75, 100]}
                domain={[0, 100]}
              />
              <Tooltip content={<BarTooltip domainMap={domainMap} />} cursor={{ fill: "#f7f7f5" }} />
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
                <img
                  src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
                  alt=""
                  width={16}
                  height={16}
                  className="w-4 h-4 rounded-sm shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: allColors[i] }} />
              <span className="text-[13px] text-[#6b6b6b]">{brand}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
