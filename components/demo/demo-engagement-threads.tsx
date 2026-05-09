"use client";

import { useState } from "react";
import { MessageCircle, ThumbsUp, Bookmark, X, Sparkles } from "lucide-react";
import { DEMO_THREADS } from "@/lib/demo-data";

function fmt(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export function DemoEngagementThreadsPage() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const visible = DEMO_THREADS.filter((t) => !dismissed.has(t.id));

  function toggleSave(id: string) {
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-[18px] font-bold text-[#0a0a0a]">Engagement Threads</h2>
        <p className="text-[13px] text-[#6b7280] mt-0.5">
          Reddit threads where you can mention Notion to boost AI citations.
        </p>
      </div>

      {/* Stats pills */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-1.5 bg-white border border-[#e8e8e8] rounded-full px-3 py-1.5 shadow-sm">
          <span className="text-[11px] font-semibold text-[#0a0a0a]">{visible.length} threads</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-[#e8e8e8] rounded-full px-3 py-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#10b981] shrink-0" />
          <span className="text-[11px] font-semibold text-[#0a0a0a]">High relevance</span>
        </div>
        {saved.size > 0 && (
          <div className="flex items-center gap-1.5 bg-[#f3eeff] border border-[#e8d8ff] rounded-full px-3 py-1.5">
            <Bookmark className="w-3 h-3 text-[#5B2D91]" />
            <span className="text-[11px] font-semibold text-[#5B2D91]">{saved.size} saved</span>
          </div>
        )}
      </div>

      {/* Thread list */}
      <div className="space-y-3">
        {visible.map((thread) => (
          <div
            key={thread.id}
            className="bg-white border border-[#e8e8e8] rounded-xl p-4 hover:border-[#d0c8f0] transition-colors"
          >
            <div className="flex items-start gap-3">
              {/* Reddit icon */}
              <div className="w-8 h-8 rounded-lg bg-[#fff0e6] flex items-center justify-center shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://www.google.com/s2/favicons?domain=reddit.com&sz=32"
                  width={16}
                  height={16}
                  className="w-4 h-4"
                  alt="Reddit"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[#5B2D91] mb-0.5">{thread.subreddit}</p>
                    <p className="text-[13px] font-medium text-[#0a0a0a] leading-snug">{thread.title}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-[11px] text-[#9ca3af]">
                        <ThumbsUp className="w-3 h-3" />
                        {fmt(thread.upvotes)}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-[#9ca3af]">
                        <MessageCircle className="w-3 h-3" />
                        {thread.comments}
                      </span>
                      <span className="text-[11px] text-[#9ca3af]">{thread.age}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => toggleSave(thread.id)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                        saved.has(thread.id)
                          ? "bg-[#f3eeff] text-[#5B2D91]"
                          : "bg-[#f7f7f5] text-[#9ca3af] hover:text-[#5B2D91]"
                      }`}
                      title="Save"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDismissed((d) => new Set(Array.from(d).concat(thread.id)))}
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#f7f7f5] text-[#9ca3af] hover:text-[#ef4444] transition-colors"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}
                    >
                      <Sparkles className="w-3 h-3" />
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
