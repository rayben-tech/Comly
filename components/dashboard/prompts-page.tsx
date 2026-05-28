"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PromptResult, BrandProfile } from "@/types";
import { ChevronDown, CheckCircle2, XCircle, Plus, X, Clock } from "lucide-react";
import { PROMPT_MODELS } from "@/lib/prompt-models";

const PROMPT_LABELS = [
  "Direct Brand", // 00
  "Discovery",    // 01
  "Competitor",   // 02
  "Discovery",    // 03
  "Discovery",    // 04
  "Direct Brand", // 05
  "Discovery",    // 06
  "Open Ended",   // 07
  "Competitor",   // 08
  "Discovery",    // 09
  "Discovery",    // 10
  "Direct Brand", // 11
  "Competitor",   // 12
  "Discovery",    // 13
  "Discovery",    // 14
  "Discovery",    // 15
  "Open Ended",   // 16
  "Discovery",    // 17
  "Discovery",    // 18
  "Discovery",    // 19
  "Discovery",    // 20
  "Discovery",    // 21
  "Open Ended",   // 22
  "Open Ended",   // 23
  "Discovery",    // 24
];

const LABEL_STYLES: Record<string, { pill: string; dot: string; color: string }> = {
  Discovery:      { pill: "bg-blue-50 text-blue-600 border border-blue-100",      dot: "bg-blue-500",    color: "#3b82f6" },
  Competitor:     { pill: "bg-orange-50 text-orange-600 border border-orange-100", dot: "bg-orange-500",  color: "#f97316" },
  "Direct Brand": { pill: "bg-purple-50 text-purple-600 border border-purple-100", dot: "bg-purple-500",  color: "#a855f7" },
  "Open Ended":   { pill: "bg-[#f7f7f5] text-[#6b6b6b] border border-[#e5e5e5]",  dot: "bg-[#aaaaaa]",  color: "#aaaaaa" },
  Custom:         { pill: "bg-sky-50 text-sky-600 border border-sky-100",          dot: "bg-sky-500",     color: "#0ea5e9" },
  Other:          { pill: "bg-[#f7f7f5] text-[#6b6b6b] border border-[#e5e5e5]",  dot: "bg-[#aaaaaa]",  color: "#aaaaaa" },
};

type Filter = "all" | "mentioned" | "not-mentioned";

interface QueuedPrompt { id: string; text: string }

function storageKey(brandName: string) {
  return `comly_prompt_edits_${brandName.toLowerCase().replace(/\s+/g, "_")}`;
}
function loadEdits(brandName: string): { deleted: number[]; queued: QueuedPrompt[] } {
  if (typeof window === "undefined") return { deleted: [], queued: [] };
  try {
    const v = localStorage.getItem(storageKey(brandName));
    return v ? JSON.parse(v) : { deleted: [], queued: [] };
  } catch { return { deleted: [], queued: [] }; }
}
function saveEdits(brandName: string, deleted: number[], queued: QueuedPrompt[]) {
  try { localStorage.setItem(storageKey(brandName), JSON.stringify({ deleted, queued })); } catch {}
}

function highlightBrand(text: string, brandName: string) {
  if (!brandName) return text;
  const escaped = brandName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === brandName.toLowerCase()
      ? <mark key={i} className="bg-[#5B2D91]/10 text-[#5B2D91] font-semibold rounded px-0.5 not-italic">{part}</mark>
      : part
  );
}

interface Props {
  promptResults: PromptResult[];
  profile: BrandProfile;
  demoMode?: boolean;
}

export function PromptsPage({ promptResults, profile, demoMode }: Props) {
  const initialEdits = loadEdits(profile.brand_name);

  const [expanded,      setExpanded]      = useState<Record<string, boolean>>({});
  const [filter,        setFilter]        = useState<Filter>("all");
  const [catFilter,     setCatFilter]     = useState<string>("all");
  const [deletedIdx,    setDeletedIdx]    = useState<number[]>(initialEdits.deleted);
  const [queued,        setQueued]        = useState<QueuedPrompt[]>(initialEdits.queued);
  const [inputText,     setInputText]     = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const deletedSet   = new Set(deletedIdx);
  const slotsOpen    = deletedIdx.length - queued.length;
  const showAddInput = !demoMode && slotsOpen > 0;

  useEffect(() => {
    if (showAddInput) setTimeout(() => inputRef.current?.focus(), 50);
  }, [showAddInput]);

  function deleteStandard(i: number) {
    const next = [...deletedIdx, i];
    setDeletedIdx(next);
    saveEdits(profile.brand_name, next, queued);
  }

  function restoreStandard(i: number) {
    const next = deletedIdx.filter((d) => d !== i);
    setDeletedIdx(next);
    // if restoring frees no slot, queued stays; if queued > new slots, trim last
    const newSlots = next.length - queued.length;
    const nextQueued = newSlots < 0 ? queued.slice(0, next.length) : queued;
    setQueued(nextQueued);
    saveEdits(profile.brand_name, next, nextQueued);
  }

  function addQueued() {
    const text = inputText.trim();
    if (!text || slotsOpen <= 0) return;
    const next = [...queued, { id: `q_${Date.now()}`, text }];
    setQueued(next);
    saveEdits(profile.brand_name, deletedIdx, next);
    setInputText("");
  }

  function removeQueued(id: string) {
    const next = queued.filter((q) => q.id !== id);
    setQueued(next);
    saveEdits(profile.brand_name, deletedIdx, next);
  }

  const visibleResults = promptResults
    .map((r, i) => ({ ...r, index: i, label: PROMPT_LABELS[i] ?? "Other" }))
    .filter((r) => !deletedSet.has(r.index));

  const mentioned    = visibleResults.filter((r) => r.mentioned).length;
  const notMentioned = visibleResults.length - mentioned;

  const categories = ["Discovery", "Competitor", "Direct Brand", "Open Ended"] as const;
  const catCounts = Object.fromEntries(
    categories.map((cat) => {
      const count = visibleResults.filter((r) => r.label === cat).length;
      return [cat, count];
    })
  ) as Record<string, number>;

  const filteredStd = visibleResults.filter((r) => {
    const passesFilter = filter === "all" ? true : filter === "mentioned" ? r.mentioned : !r.mentioned;
    const passesCat    = catFilter === "all" ? true : catFilter === "Custom" ? false : r.label === catFilter;
    return passesFilter && passesCat;
  });

  // Queued prompts only show in "all" filter + "Custom" or "all" cat filter
  const filteredQueued = filter !== "not-mentioned" && (catFilter === "all" || catFilter === "Custom") ? queued : [];

  const totalVisible = filteredStd.length + filteredQueued.length;

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#0a0a0a]">Prompt Breakdown</h2>
          <p className="text-[13px] text-[#6b6b6b] mt-0.5">
            AI model responses to each audit query
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-semibold ${
            mentioned > notMentioned
              ? "bg-emerald-50 border-emerald-100 text-emerald-600"
              : "bg-red-50 border-red-100 text-red-500"
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {mentioned} mentioned
          </div>
          {queued.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-sky-50 border-sky-100 text-sky-600 text-[12px] font-semibold">
              <Clock className="w-3.5 h-3.5" />
              {queued.length} queued
            </div>
          )}
        </div>
      </div>

      {/* Queued prompts banner */}
      {queued.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-sky-50 border border-sky-100 rounded-xl text-[12px] text-sky-700">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          {queued.length === 1 ? "1 custom prompt" : `${queued.length} custom prompts`} queued — will run at the next daily audit
        </div>
      )}

      {/* Add custom prompt input — only visible when a slot is open */}
      <AnimatePresence initial={false}>
        {showAddInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="bg-white border border-[#5B2D91]/20 rounded-xl p-4 space-y-2" style={{ boxShadow: "0 4px 16px rgba(91,45,145,0.08)" }}>
              <p className="text-[11px] font-bold text-[#aaaaaa] uppercase tracking-widest">
                {slotsOpen === 1 ? "1 slot available — add your custom prompt" : `${slotsOpen} slots available — add a custom prompt`}
              </p>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addQueued(); }}
                  placeholder="e.g. What's the best tool for onboarding enterprise clients?"
                  className="flex-1 text-[13px] px-3 py-2 rounded-lg border border-[#e5e5e5] focus:outline-none focus:border-[#5B2D91]/40 placeholder:text-[#c0c0c0]"
                />
                <button
                  onClick={addQueued}
                  disabled={!inputText.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#5B2D91] text-white hover:bg-[#4a2478] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Queue
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category pill filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {([
          { key: "all", label: "All", count: visibleResults.length + queued.length },
          ...categories.map((cat) => ({ key: cat, label: cat, count: catCounts[cat] ?? 0 })),
          ...(queued.length > 0 ? [{ key: "Custom", label: "Custom", count: queued.length }] : []),
        ]).map(({ key, label, count }) => {
          const active = catFilter === key;
          return (
            <button
              key={key}
              onClick={() => setCatFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all border ${
                active
                  ? "bg-[#0a0a0a] text-white border-[#0a0a0a]"
                  : "bg-white text-[#6b6b6b] border-[#e5e5e5] hover:border-[#c0c0c0] hover:text-[#0a0a0a]"
              }`}
            >
              {label}
              <span className={`text-[12px] ${active ? "text-white/70" : "text-[#aaaaaa]"}`}>({count})</span>
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-1 bg-[#f7f7f5] border border-[#e5e5e5] rounded-lg p-0.5">
          {([
            { key: "all",           label: "All" },
            { key: "mentioned",     label: "Mentioned" },
            { key: "not-mentioned", label: "Not mentioned" },
          ] as { key: Filter; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${
                filter === key
                  ? "bg-white text-[#0a0a0a] shadow-sm border border-[#e5e5e5]"
                  : "text-[#6b6b6b] hover:text-[#0a0a0a]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt list */}
      <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={`${catFilter}-${filter}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        className="space-y-2"
      >

        {/* Standard results */}
        {filteredStd.map((r) => {
          const isOpen  = expanded[`std-${r.index}`] ?? false;
          const style   = LABEL_STYLES[r.label];
          const preview = r.response_text?.slice(0, 120);
          const model   = PROMPT_MODELS[r.index] ?? PROMPT_MODELS[0];

          return (
            <div
              key={`std-${r.index}`}
              className={`bg-white rounded-xl overflow-hidden transition-all border ${
                r.mentioned
                  ? isOpen ? "border-[#5B2D91]/20" : "border-[#e5e5e5]"
                  : "border-[#f0f0f0]"
              }`}
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)" }}
            >
              <button
                className="w-full flex items-start gap-4 px-5 py-4 text-left hover:bg-[#fafafa] transition-colors"
                onClick={() => setExpanded((p) => ({ ...p, [`std-${r.index}`]: !isOpen }))}
              >
                <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
                  <span className="text-[11px] font-bold text-[#aaaaaa]">{String(r.index + 1).padStart(2, "0")}</span>
                  {r.mentioned
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    : <XCircle className="w-4 h-4 text-[#d0d0d0]" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.pill}`}>{r.label}</span>
                    {r.mentioned ? (
                      <span className="text-[11px] font-semibold text-emerald-600">
                        Mentioned{r.position ? ` · ranked #${r.position}` : ""}
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#aaaaaa]">Not mentioned</span>
                    )}
                  </div>
                  <p className={`text-[13px] font-medium leading-snug ${r.mentioned ? "text-[#0a0a0a]" : "text-[#6b6b6b]"}`}>
                    &ldquo;{r.prompt}&rdquo;
                  </p>
                  {!isOpen && r.mentioned && preview && (
                    <p className="mt-1.5 text-[12px] text-[#aaaaaa] leading-relaxed line-clamp-1">{preview}…</p>
                  )}
                </div>

                {/* Delete button — only in non-demo mode */}
                {!demoMode && (
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteStandard(r.index); }}
                    className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-[#d0d0d0] hover:text-red-400 hover:bg-red-50 transition-colors"
                    title="Remove from next audit"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                  className="text-[#aaaaaa] shrink-0 mt-0.5"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="border-t border-[#f0f0f0] bg-[#fafafa]">
                    <div className="flex items-center gap-2.5 px-5 py-3 border-b border-[#f0f0f0]">
                      <img src={`https://www.google.com/s2/favicons?domain=${model.domain}&sz=32`} alt={model.name} width={18} height={18} className="w-[18px] h-[18px] rounded-md" />
                      <span className="text-[12px] font-semibold text-[#0a0a0a]">{model.name}</span>
                    </div>
                    <div className="px-5 py-4">
                      {r.response_text ? (
                        <p className="text-[13px] text-[#3a3a3a] leading-relaxed whitespace-pre-wrap">
                          {highlightBrand(r.response_text, profile.brand_name)}
                        </p>
                      ) : (
                        <p className="text-[13px] text-[#aaaaaa] italic">No response recorded.</p>
                      )}
                    </div>
                    {r.competitors_mentioned.length > 0 && (
                      <div className="px-5 pb-4">
                        <p className="text-[10px] font-bold text-[#aaaaaa] uppercase tracking-widest mb-2">Also mentioned</p>
                        <div className="flex flex-wrap gap-1.5">
                          {r.competitors_mentioned.map((c) => (
                            <span key={c.name} className={`text-[11px] px-2.5 py-1 rounded-full border font-semibold ${
                              c.name.toLowerCase() === profile.brand_name.toLowerCase()
                                ? "bg-[#5B2D91]/10 text-[#5B2D91] border-[#5B2D91]/20"
                                : "bg-white text-[#6b6b6b] border-[#e5e5e5]"
                            }`}>{c.name}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Queued (pending) custom prompts */}
        {filteredQueued.map((q, i) => (
          <div
            key={q.id}
            className="bg-white rounded-xl border border-sky-100 opacity-75"
            style={{ boxShadow: "0 4px 16px rgba(14,165,233,0.06)" }}
          >
            <div className="flex items-start gap-4 px-5 py-4">
              <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
                <span className="text-[11px] font-bold text-[#aaaaaa]">C{i + 1}</span>
                <Clock className="w-4 h-4 text-sky-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${LABEL_STYLES.Custom.pill}`}>Custom</span>
                  <span className="text-[11px] text-sky-500 font-medium">Queued for next audit</span>
                </div>
                <p className="text-[13px] font-medium text-[#6b6b6b] leading-snug">&ldquo;{q.text}&rdquo;</p>
              </div>
              <button
                onClick={() => removeQueued(q.id)}
                className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-[#d0d0d0] hover:text-red-400 hover:bg-red-50 transition-colors"
                title="Remove from queue"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {/* Deleted prompts — restore option */}
        {deletedIdx.length > 0 && filter === "all" && (
          <div className="pt-1">
            <p className="text-[11px] text-[#aaaaaa] px-1 mb-2">
              {deletedIdx.length} prompt{deletedIdx.length > 1 ? "s" : ""} removed from next audit
              {slotsOpen > 0 && ` · ${slotsOpen} slot${slotsOpen > 1 ? "s" : ""} open`}
            </p>
            <div className="space-y-1">
              {deletedIdx.map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-[#fafafa] border border-dashed border-[#e5e5e5] rounded-xl">
                  <span className="text-[11px] font-bold text-[#d0d0d0]">{String(i + 1).padStart(2, "0")}</span>
                  <p className="flex-1 text-[12px] text-[#c0c0c0] line-through truncate">{promptResults[i]?.prompt}</p>
                  <button
                    onClick={() => restoreStandard(i)}
                    className="shrink-0 text-[11px] font-semibold text-[#aaaaaa] hover:text-[#5B2D91] transition-colors"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredStd.length === 0 && filteredQueued.length === 0 && deletedIdx.length === 0 && (
          <div className="text-center py-14 bg-white border border-[#f0f0f0] rounded-xl">
            <p className="text-[14px] text-[#aaaaaa]">No prompts match this filter.</p>
          </div>
        )}
      </motion.div>
      </AnimatePresence>
    </div>
  );
}
