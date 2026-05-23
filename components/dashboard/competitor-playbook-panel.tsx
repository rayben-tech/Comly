"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Star, Newspaper, MessageCircle, Link } from "lucide-react";
import { BrandProfile, CompetitorRanking, MentionResult, CompetitorMentions } from "@/types";
import { FaviconImg } from "@/components/ui/favicon-img";

interface Props {
  competitorRankings: CompetitorRanking[];
  promptResults: never[];
  profile: BrandProfile;
  demoData?: CompetitorMentions[];
}

const CATEGORY_LABELS: Record<MentionResult["category"], string> = {
  reddit: "Reddit",
  review: "Reviews & Listings",
  press:  "Press & Blogs",
  other:  "Other",
};

const CATEGORY_ACTIONS: Record<MentionResult["category"], string> = {
  reddit: "Join thread →",
  review: "Submit listing →",
  press:  "Pitch outlet →",
  other:  "Get mentioned →",
};

const CATEGORY_ICONS: Record<MentionResult["category"], React.ReactNode> = {
  reddit: <MessageCircle className="w-3.5 h-3.5" style={{ color: "#ff4500" }} />,
  review: <Star          className="w-3.5 h-3.5" style={{ color: "#2563eb" }} />,
  press:  <Newspaper     className="w-3.5 h-3.5" style={{ color: "#059669" }} />,
  other:  <Link          className="w-3.5 h-3.5" style={{ color: "#5B2D91" }} />,
};

const CATEGORY_COLORS: Record<MentionResult["category"], string> = {
  reddit: "bg-orange-50 text-orange-600 border-orange-100",
  review: "bg-blue-50 text-blue-600 border-blue-100",
  press:  "bg-emerald-50 text-emerald-600 border-emerald-100",
  other:  "bg-[#f3eeff] text-[#5B2D91] border-[#e4d4ff]",
};

function cacheKey(brandName: string) {
  return `comly_playbook_${brandName.toLowerCase().replace(/\s+/g, "_")}`;
}

export function CompetitorPlaybookPanel({ competitorRankings, profile, demoData }: Props) {
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [mentionData, setMentionData] = useState<CompetitorMentions[]>([] as CompetitorMentions[]);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeComp, setActiveComp] = useState<string>("");
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    if (demoData) {
      setMentionData(demoData);
      setActiveComp(demoData[0]?.name ?? "");
      setStatus("done");
      return;
    }
    try {
      const cached = localStorage.getItem(cacheKey(profile.brand_name));
      if (cached) {
        const parsed = JSON.parse(cached) as { data?: CompetitorMentions[]; savedAt: number };
        const d = parsed.data;
        if (Array.isArray(d) && d.length > 0 && Date.now() - parsed.savedAt < 7 * 24 * 60 * 60 * 1000) {
          setMentionData(d);
          setActiveComp(d[0]?.name ?? "");
          setStatus("done");
          return;
        }
        localStorage.removeItem(cacheKey(profile.brand_name));
      }
    } catch {}
    handleGenerate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.brand_name]);

  async function handleGenerate() {
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/competitor-playbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitors: competitorRankings.slice(0, 3), profile }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Search failed");
      setMentionData(json.competitors);
      setActiveComp(json.competitors[0]?.name ?? "");
      setStatus("done");
      try {
        localStorage.setItem(cacheKey(profile.brand_name), JSON.stringify({ data: json.competitors, savedAt: Date.now() }));
      } catch {}
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  const active = mentionData?.find(c => c.name === activeComp) ?? null;

  const grouped = active
    ? (["reddit", "review", "press", "other"] as const).reduce<Record<string, MentionResult[]>>((acc, cat) => {
        const items = active.results.filter(r => r.category === cat);
        if (items.length) acc[cat] = items;
        return acc;
      }, {})
    : {};

  return (
    <div className="p-6">
      <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-[#f0f0f0]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#f3eeff] flex items-center justify-center shrink-0">
              <Swords className="w-5 h-5 text-[#5B2D91]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-1.5">
                <h2 className="text-[18px] font-bold text-[#0a0a0a]">Competitor Playbook</h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">Pro</span>
              </div>
              <p className="text-[14px] text-[#6b6b6b] leading-relaxed">
                Find every place your competitors are being mentioned online — Reddit threads, review sites, press — then get {profile.brand_name} cited in those same places.
              </p>
            </div>
          </div>
        </div>

        {/* Skeleton loading */}
        {status === "loading" && (
          <div className="px-6 py-5 space-y-6 animate-pulse">
            {/* Fake competitor cards */}
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#f0f0f0]">
                  <div className="w-6 h-6 rounded-md bg-[#f0f0f0] shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-[#f0f0f0] rounded w-3/4" />
                    <div className="h-2.5 bg-[#f5f5f5] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
            {/* Fake result rows */}
            {[5, 4, 6].map((count, gi) => (
              <div key={gi}>
                <div className="h-2.5 bg-[#f0f0f0] rounded w-24 mb-3" />
                <div className="space-y-2">
                  {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-[#f0f0f0]">
                      <div className="w-4 h-4 rounded-sm bg-[#f0f0f0] shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-[#f0f0f0] rounded" style={{ width: `${55 + (i * 13) % 35}%` }} />
                        <div className="h-2.5 bg-[#f5f5f5] rounded" style={{ width: `${70 + (i * 7) % 25}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-center text-[12px] text-[#aaaaaa]">Searching the web for competitor mentions…</p>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="px-8 py-8 flex flex-col items-center gap-3 text-center">
            <p className="text-[13px] text-red-500">{errorMsg}</p>
            <button onClick={handleGenerate} className="text-[13px] font-semibold text-[#5B2D91] hover:underline">
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        {status === "done" && mentionData.length > 0 && (
          <div>
            {/* Competitor cards */}
            <div className="grid grid-cols-3 gap-3 px-6 py-4 border-b border-[#f0f0f0]">
              {mentionData.map(c => (
                <motion.button
                  key={c.name}
                  onClick={() => setActiveComp(c.name)}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200 ${
                    activeComp === c.name
                      ? "border-[#5B2D91] bg-[#faf7ff] shadow-sm"
                      : "border-[#f0f0f0] bg-white hover:border-[#d4b8ff] hover:bg-[#fdf9ff]"
                  }`}
                >
                  <FaviconImg domain={c.domain || c.name} name={c.name} size={24} className="w-6 h-6 shrink-0 rounded-md" />
                  <div className="min-w-0 flex-1">
                    <p className={`text-[13px] font-semibold truncate transition-colors duration-200 ${activeComp === c.name ? "text-[#5B2D91]" : "text-[#0a0a0a]"}`}>
                      {c.name}
                    </p>
                    <p className="text-[11px] text-[#aaaaaa] mt-0.5">{c.results.length} mentions</p>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Mention results */}
            <AnimatePresence mode="wait">
              {active && (
              <motion.div
                key={activeComp}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                className="px-6 py-5 space-y-6"
              >
                {Object.entries(grouped).map(([cat, items], groupIndex) => (
                  <motion.div
                    key={cat}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: groupIndex * 0.055, ease: "easeOut" }}
                  >
                    <div className="flex items-center gap-1.5 mb-3">
                      {CATEGORY_ICONS[cat as MentionResult["category"]]}
                      <p className="text-[11px] font-bold text-[#6b6b6b] uppercase tracking-wide">
                        {CATEGORY_LABELS[cat as MentionResult["category"]]}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {items.map((r, itemIndex) => (
                        <motion.a
                          key={r.url}
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.15, delay: groupIndex * 0.055 + itemIndex * 0.03, ease: "easeOut" }}
                          className="flex items-start gap-3 p-3 rounded-xl border border-[#f0f0f0] hover:border-[#5B2D91]/20 hover:bg-[#faf7ff] transition-colors group"
                        >
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${r.domain}&sz=32`}
                            alt={r.domain}
                            width={16} height={16}
                            className="w-4 h-4 rounded-sm shrink-0 mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[#0a0a0a] truncate group-hover:text-[#5B2D91] transition-colors">
                              {r.title || r.domain}
                            </p>
                            <p className="text-[11px] text-[#aaaaaa] truncate mt-0.5">{r.domain}</p>
                            {r.description && (
                              <p className="text-[11px] text-[#9ca3af] leading-snug line-clamp-2 mt-0.5">{r.description}</p>
                            )}
                          </div>
                          <span className="shrink-0 text-[11px] font-semibold text-[#cccccc] group-hover:text-[#5B2D91] transition-colors whitespace-nowrap">
                            {CATEGORY_ACTIONS[cat as MentionResult["category"]]}
                          </span>
                        </motion.a>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
            </AnimatePresence>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-[#f0f0f0]">
              <p className="text-[11px] text-[#aaaaaa]">Cached · refreshes in 7 days</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
