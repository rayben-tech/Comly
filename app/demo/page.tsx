"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const DemoDashboard = dynamic(
  () => import("@/components/demo/demo-dashboard").then((m) => ({ default: m.DemoDashboard })),
  { ssr: false }
);

export default function DemoPage() {
  return (
    <div className="flex flex-col h-screen bg-[#f7f7f5] overflow-hidden">
      {/* Banner */}
      <div className="shrink-0 flex items-center justify-between gap-4 px-5 py-2.5 bg-[#fffbe6] border-b border-[#f0e6b2]">
        <div className="flex items-center gap-2 min-w-0">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          <p className="text-[13px] text-[#92400e] truncate">
            You&apos;re viewing a live demo with sample data. Optimize pages are disabled.
          </p>
        </div>
      </div>

      {/* Full dashboard — demoMode restrictions already baked in */}
      <div className="flex-1 overflow-hidden">
        <DemoDashboard fullScreen />
      </div>
    </div>
  );
}
