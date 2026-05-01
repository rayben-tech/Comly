"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpRight } from "lucide-react";

const SEGMENTS = [
  { name: "UGC",        value: 35, color: "#3b82f6" },
  { name: "Editorial",  value: 30, color: "#1e3a8a" },
  { name: "Corporate",  value: 20, color: "#8b5cf6" },
  { name: "Competitor", value: 12, color: "#ec4899" },
  { name: "Others",     value: 3,  color: "#e5e5e5" },
];

const CustomTooltip = ({
  active, payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#5B2D91] rounded-xl px-3 py-2 shadow-xl">
      <p className="text-white text-[13px] font-semibold">{payload[0].name}</p>
      <p className="text-[#aaaaaa] text-[13px]">{payload[0].value}%</p>
    </div>
  );
};

export function DomainsDonut() {
  const topSegment = SEGMENTS[0];

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-6 py-5 border-b border-[#e5e5e5]">
        <div>
          <h3 className="text-base font-semibold text-[#0a0a0a]">Domains by Type</h3>
          <p className="text-[13px] text-[#6b6b6b] mt-0.5">Most used domains categorized by type</p>
        </div>
        <button className="w-7 h-7 flex items-center justify-center rounded-lg text-[#aaaaaa] hover:bg-[#f7f7f5] hover:text-[#0a0a0a] transition-colors">
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Chart + legend */}
      <div className="flex items-center gap-6 px-6 py-5">
        {/* Donut */}
        <div className="relative shrink-0" style={{ width: 120, height: 120 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={SEGMENTS}
                cx="50%"
                cy="50%"
                startAngle={90}
                endAngle={-270}
                innerRadius={38}
                outerRadius={56}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {SEGMENTS.map((seg) => (
                  <Cell key={seg.name} fill={seg.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-black text-[#0a0a0a] leading-none">{topSegment.value}%</span>
            <span className="text-[11px] text-[#aaaaaa] mt-0.5">{topSegment.name}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5">
          {SEGMENTS.map((seg) => (
            <div key={seg.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="text-[13px] text-[#6b6b6b]">{seg.name}</span>
              </div>
              <span className="text-[13px] font-semibold text-[#0a0a0a]">{seg.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
