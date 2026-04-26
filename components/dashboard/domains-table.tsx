"use client";

import { useState, useMemo } from "react";
import { ExternalLink } from "lucide-react";
import { PromptResult } from "@/types";

type DomainType = "UGC" | "Editorial" | "Corporate";

const TYPE_STYLES: Record<DomainType, string> = {
  UGC:       "bg-blue-50 text-blue-600 border border-blue-100",
  Editorial: "bg-orange-50 text-orange-600 border border-orange-100",
  Corporate: "bg-purple-50 text-purple-600 border border-purple-100",
};

const UGC_DOMAINS      = ["reddit.com", "quora.com", "producthunt.com", "hackernews.com", "news.ycombinator.com", "stackoverflow.com", "discord.com", "twitter.com", "x.com"];
const EDITORIAL_DOMAINS = ["g2.com", "capterra.com", "techradar.com", "techcrunch.com", "getapp.com", "softwareadvice.com", "trustradius.com", "trustpilot.com", "Forbes.com", "wired.com", "zdnet.com"];

function classifyDomain(domain: string): DomainType {
  const d = domain.toLowerCase();
  if (UGC_DOMAINS.some((u) => d.includes(u))) return "UGC";
  if (EDITORIAL_DOMAINS.some((e) => d.includes(e))) return "Editorial";
  return "Corporate";
}

interface Props {
  promptResults: PromptResult[];
}

export function DomainsTable({ promptResults }: Props) {
  const [tab, setTab] = useState<"Domains" | "URLs">("Domains");

  const totalPrompts = promptResults.length || 1;

  const domains = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of promptResults) {
      const seen = new Set<string>();
      for (const s of (r.sources ?? [])) {
        if (s.domain && !seen.has(s.domain)) {
          seen.add(s.domain);
          map.set(s.domain, (map.get(s.domain) ?? 0) + 1);
        }
      }
    }
    return Array.from(map.entries())
      .map(([domain, count]) => ({ domain, pct: Math.round((count / totalPrompts) * 100) }))
      .sort((a, b) => b.pct - a.pct);
  }, [promptResults, totalPrompts]);

  const urls = useMemo(() => {
    const map = new Map<string, { domain: string; title: string; count: number }>();
    for (const r of promptResults) {
      for (const s of (r.sources ?? [])) {
        if (!s.domain || !s.title) continue;
        const key = `${s.domain}|${s.title}`;
        const entry = map.get(key) ?? { domain: s.domain, title: s.title, count: 0 };
        entry.count++;
        map.set(key, entry);
      }
    }
    return Array.from(map.values())
      .map((e) => ({ ...e, pct: Math.round((e.count / totalPrompts) * 100) }))
      .sort((a, b) => b.pct - a.pct);
  }, [promptResults, totalPrompts]);

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e5e5]">
        <div>
          <h3 className="text-base font-semibold text-[#0a0a0a]">Sources</h3>
          <p className="text-[13px] text-[#6b6b6b] mt-0.5">Domains that AI models frequently cite</p>
        </div>
        <div className="flex items-center gap-0.5 bg-[#f7f7f5] border border-[#e5e5e5] rounded-lg p-0.5">
          {(["Domains", "URLs"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                tab === t
                  ? "bg-white text-[#0a0a0a] shadow-sm border border-[#e5e5e5]"
                  : "text-[#aaaaaa] hover:text-[#6b6b6b]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "Domains" ? (
        <>
          <div className="grid grid-cols-[20px_1fr_80px_60px_80px] gap-3 px-6 py-2.5 border-b border-[#f0f0f0] bg-[#fafafa]">
            {["#", "Domain", "Type", "Used", "Avg. Citations"].map((h, i) => (
              <span key={h} className={`text-[10px] font-bold text-[#aaaaaa] uppercase tracking-wide ${i >= 3 ? "text-right" : ""}`}>
                {h}
              </span>
            ))}
          </div>
          <div className="divide-y divide-[#f7f7f5]">
            {domains.length === 0 ? (
              <p className="px-6 py-8 text-[13px] text-[#aaaaaa] text-center">No sources yet — run an audit first.</p>
            ) : (
              domains.map((row, i) => {
                const type = classifyDomain(row.domain);
                return (
                  <div key={row.domain} className="grid grid-cols-[20px_1fr_80px_60px_80px] gap-3 items-center px-6 py-3 hover:bg-[#fafafa] transition-colors">
                    <span className="text-[12px] font-semibold text-[#aaaaaa]">{i + 1}</span>
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${row.domain}&sz=32`}
                        alt=""
                        width={18}
                        height={18}
                        className="w-[18px] h-[18px] rounded-sm shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <span className="text-[13px] font-semibold text-[#0a0a0a] truncate">{row.domain}</span>
                    </div>
                    <div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TYPE_STYLES[type]}`}>
                        {type}
                      </span>
                    </div>
                    <span className="text-[13px] font-semibold text-[#6b6b6b] text-right">{row.pct}%</span>
                    <span className="text-[13px] font-semibold text-[#6b6b6b] text-right">{row.pct}%</span>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-[20px_1fr_100px] gap-3 px-6 py-2.5 border-b border-[#f0f0f0] bg-[#fafafa]">
            {["#", "Source", "Citations"].map((h, i) => (
              <span key={h} className={`text-[10px] font-bold text-[#aaaaaa] uppercase tracking-wide ${i === 2 ? "text-right" : ""}`}>
                {h}
              </span>
            ))}
          </div>
          <div className="divide-y divide-[#f7f7f5]">
            {urls.length === 0 ? (
              <p className="px-6 py-8 text-[13px] text-[#aaaaaa] text-center">No sources yet — run an audit first.</p>
            ) : (
              urls.map((row, i) => (
                <div key={`${row.domain}|${row.title}`} className="grid grid-cols-[20px_1fr_100px] gap-3 items-center px-6 py-3 hover:bg-[#fafafa] transition-colors">
                  <span className="text-[12px] font-semibold text-[#aaaaaa]">{i + 1}</span>
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${row.domain}&sz=32`}
                      alt=""
                      width={18}
                      height={18}
                      className="w-[18px] h-[18px] rounded-sm shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <div className="min-w-0">
                      <a
                        href={`https://${row.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 group"
                      >
                        <span className="text-[13px] font-semibold text-[#0a0a0a] truncate group-hover:text-[#5B2D91] transition-colors">{row.title}</span>
                        <ExternalLink className="w-3 h-3 text-[#aaaaaa] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                      <span className="text-[11px] text-[#aaaaaa] truncate block">{row.domain}</span>
                    </div>
                  </div>
                  <span className="text-[13px] font-semibold text-[#6b6b6b] text-right">{row.pct}%</span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
