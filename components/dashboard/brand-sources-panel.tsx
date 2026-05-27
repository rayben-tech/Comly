"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { BrandProfile } from "@/types";

interface SourceResult {
  url: string;
  title: string;
  description: string;
  domain: string;
  category: "reddit" | "review" | "press" | "other";
}

const CATEGORY_LABELS: Record<SourceResult["category"], string> = {
  reddit: "Reddit",
  review: "Reviews & Listings",
  press:  "Press & Blogs",
  other:  "Other",
};

const CATEGORY_COLORS: Record<SourceResult["category"], string> = {
  reddit: "bg-orange-50 text-orange-600 border-orange-100",
  review: "bg-blue-50 text-blue-600 border-blue-100",
  press:  "bg-emerald-50 text-emerald-600 border-emerald-100",
  other:  "bg-[#f3eeff] text-[#5B2D91] border-[#e4d4ff]",
};

function cacheKey(brandName: string) {
  return `comly_brand_sources_${brandName.toLowerCase().replace(/\s+/g, "_")}`;
}

interface Props {
  profile: BrandProfile;
}

export function BrandSourcesPanel({ profile }: Props) {
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [sources, setSources] = useState<SourceResult[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  async function fetchSources() {
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/brand-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Search failed");
      setSources(json.sources);
      setStatus("done");
      try {
        localStorage.setItem(cacheKey(profile.brand_name), JSON.stringify({ data: json.sources, savedAt: Date.now() }));
      } catch {}
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  useEffect(() => {
    try {
      const cached = localStorage.getItem(cacheKey(profile.brand_name));
      if (cached) {
        const parsed = JSON.parse(cached) as { data?: SourceResult[]; savedAt: number };
        const d = parsed.data;
        if (Array.isArray(d) && d.length > 0 && Date.now() - parsed.savedAt < 7 * 24 * 60 * 60 * 1000) {
          setSources(d);
          setStatus("done");
          return;
        }
        localStorage.removeItem(cacheKey(profile.brand_name));
      }
    } catch {}
    fetchSources();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.brand_name]);

  const grouped = (["reddit", "review", "press", "other"] as const).reduce<Record<string, SourceResult[]>>((acc, cat) => {
    const items = sources.filter(r => r.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  return (
    <div className="p-6">
      <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-7 pb-5 border-b border-[#f0f0f0]">
          <h2 className="text-[18px] font-bold text-[#0a0a0a] mb-1">Sources</h2>
          <p className="text-[13px] text-[#6b6b6b]">
            The sources AI models pulled from when generating answers about {profile.brand_name} — these are the pages being cited.
          </p>
        </div>

        {/* Loading */}
        {status === "loading" && (
          <div className="px-8 py-10 flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-[#5B2D91] border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-[14px] font-semibold text-[#0a0a0a]">Searching the web…</p>
              <p className="text-[12px] text-[#9ca3af] mt-1">Finding where {profile.brand_name} is being talked about. Takes ~20 seconds.</p>
            </div>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="px-8 py-8 flex flex-col items-center gap-3 text-center">
            <p className="text-[13px] text-red-500">{errorMsg}</p>
            <button onClick={fetchSources} className="text-[13px] font-semibold text-[#5B2D91] hover:underline">
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        {status === "done" && (
          <div>
            {sources.length === 0 ? (
              <div className="px-8 py-10 text-center">
                <p className="text-[14px] text-[#6b6b6b]">No web mentions found for {profile.brand_name}.</p>
              </div>
            ) : (
              <div className="px-6 py-5 space-y-6">
                {Object.entries(grouped).map(([cat, items]) => (
                  <div key={cat}>
                    <p className="text-[11px] font-bold text-[#aaaaaa] uppercase tracking-wide mb-3">
                      {CATEGORY_LABELS[cat as SourceResult["category"]]}
                    </p>
                    <div className="space-y-2">
                      {items.map(r => (
                        <a
                          key={r.url}
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-3 p-3 rounded-xl border border-[#f0f0f0] hover:border-[#5B2D91]/20 hover:bg-[#faf7ff] transition-colors group"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${r.domain}&sz=32`}
                            alt={r.domain}
                            width={16} height={16}
                            className="w-4 h-4 rounded-sm shrink-0 mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-[13px] font-semibold text-[#0a0a0a] truncate group-hover:text-[#5B2D91] transition-colors">
                                {r.title || r.domain}
                              </p>
                              <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${CATEGORY_COLORS[cat as SourceResult["category"]]}`}>
                                {r.domain}
                              </span>
                            </div>
                            {r.description && (
                              <p className="text-[11px] text-[#9ca3af] leading-snug line-clamp-2">{r.description}</p>
                            )}
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-[#cccccc] group-hover:text-[#5B2D91] shrink-0 mt-0.5 transition-colors" />
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

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
