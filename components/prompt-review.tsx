"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Check, Globe, User, Sparkles, Zap, Loader2 } from "lucide-react";

const MAX_PROMPTS = 25;

const STEP_DEFS = [
  { label: "Scrape",   Icon: Globe     },
  { label: "Profile",  Icon: User      },
  { label: "Prompts",  Icon: Sparkles  },
  { label: "Audit",    Icon: Zap       },
];

function StepIndicator() {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-0">
        {STEP_DEFS.map(({ label, Icon }, i) => {
          const isDone   = i < 2; // Scrape + Profile done
          const isActive = i === 2; // Prompts active

          return (
            <div key={label} className="flex items-center">
              <div className="flex items-center gap-1.5">
                {isDone ? (
                  <motion.div
                    initial={{ scale: 0.7 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-[#5B2D91] flex items-center justify-center shrink-0"
                  >
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                ) : isActive ? (
                  <div className="w-5 h-5 rounded-full border-2 border-[#5B2D91] bg-[#f3eeff] flex items-center justify-center shrink-0">
                    <Loader2 className="w-2.5 h-2.5 text-[#5B2D91] animate-spin" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-[#e5e5e5] flex items-center justify-center shrink-0">
                    <Icon className="w-2.5 h-2.5 text-[#c5c5c5]" />
                  </div>
                )}
                <span className={`text-[12px] font-medium ${isDone || isActive ? "text-[#5B2D91]" : "text-[#c5c5c5]"}`}>
                  {label}
                </span>
              </div>

              {i < STEP_DEFS.length - 1 && (
                <div className="w-8 h-0.5 mx-2 bg-[#e5e5e5] overflow-hidden rounded-full">
                  <motion.div
                    className="h-full bg-[#5B2D91] rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: isDone ? "100%" : "0%" }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-[#aaaaaa]">Step 3 of 4 · Review audit prompts</p>
    </div>
  );
}

interface PromptReviewProps {
  prompts: string[];
  onConfirm: (prompts: string[]) => void;
  onReset: () => void;
}

export function PromptReview({ prompts: initial, onConfirm, onReset }: PromptReviewProps) {
  const [prompts, setPrompts]   = useState<string[]>(initial);
  const [newPrompt, setNewPrompt] = useState("");
  const [removed, setRemoved]   = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  const atMax = prompts.length >= MAX_PROMPTS;

  function removePrompt(idx: number) {
    setRemoved((prev) => { const n = new Set(prev); n.add(idx); return n; });
    setTimeout(() => {
      setPrompts((ps) => ps.filter((_, i) => i !== idx));
      setRemoved((prev) => { const n = new Set(prev); n.delete(idx); return n; });
    }, 220);
  }

  function addPrompt() {
    const text = newPrompt.trim();
    if (!text || atMax) return;
    setPrompts((ps) => [...ps, text]);
    setNewPrompt("");
    inputRef.current?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") addPrompt();
  }

  return (
    <div className="min-h-screen bg-[#ddd5f5] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-[820px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden"
          style={{ boxShadow: "0 25px 60px rgba(91,45,145,0.28), 0 8px 24px rgba(91,45,145,0.16), 0 2px 8px rgba(0,0,0,0.08)" }}
        >
          {/* Header — step indicator */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0] bg-[#fafafa]">
            <StepIndicator />
          </div>

          {/* Body */}
          <div className="p-8">
            {/* Title row */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-[18px] font-bold text-[#0a0a0a] mb-1">
                  Review your prompts
                </h2>
                <p className="text-[13px] text-[#6b7280] leading-relaxed max-w-lg">
                  These prompts will be fired at ChatGPT, Gemini, Claude and Perplexity to measure your AI visibility.
                  Remove any that don&apos;t fit your brand, or add up to {MAX_PROMPTS} total.
                </p>
              </div>
              <div className="shrink-0 ml-4 flex flex-col items-end gap-1">
                <span
                  className="text-[12px] font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    background: atMax ? "rgba(91,45,145,0.1)" : "rgba(91,45,145,0.07)",
                    color: atMax ? "#5B2D91" : "#9370b5",
                  }}
                >
                  {prompts.length} / {MAX_PROMPTS}
                </span>
                {atMax && (
                  <span className="text-[10.5px] text-[#aaaaaa]">Max reached</span>
                )}
              </div>
            </div>

            {/* Prompt grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <AnimatePresence>
                {prompts.map((prompt, i) => (
                  <motion.div
                    key={prompt + i}
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={
                      removed.has(i)
                        ? { opacity: 0, scale: 0.92, y: -6 }
                        : { opacity: 1, scale: 1, y: 0 }
                    }
                    exit={{ opacity: 0, scale: 0.92, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white border border-[#e8e8e8] rounded-lg p-3 flex items-start gap-2.5 group relative"
                    style={{ boxShadow: "0 8px 28px rgba(91,45,145,0.14), 0 2px 8px rgba(0,0,0,0.06)" }}
                  >
                    <span className="w-5 h-5 rounded-full bg-[#5B2D91] text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-[11.5px] text-[#0a0a0a] leading-snug flex-1 min-w-0">
                      {prompt}
                    </p>
                    <button
                      onClick={() => removePrompt(i)}
                      className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 mt-0.5"
                      title="Remove prompt"
                    >
                      <X className="w-3 h-3 text-[#aaaaaa] group-hover:text-red-400 transition-colors" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Add prompt row */}
            <div className="mb-6">
              {!atMax ? (
                <div
                  className="flex gap-2 items-center p-3 rounded-xl border border-dashed border-[#d0bfef] bg-[#faf8ff]"
                >
                  <Plus className="w-3.5 h-3.5 text-[#9b77cc] shrink-0" />
                  <input
                    ref={inputRef}
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Type a custom prompt and press Enter…"
                    className="flex-1 bg-transparent text-[12.5px] text-[#0a0a0a] placeholder-[#c0a8e0] focus:outline-none"
                  />
                  <button
                    onClick={addPrompt}
                    disabled={!newPrompt.trim()}
                    className="shrink-0 px-3 py-1 rounded-lg text-[11.5px] font-semibold text-white disabled:opacity-40 transition-opacity"
                    style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}
                  >
                    Add
                  </button>
                </div>
              ) : (
                <p className="text-[12px] text-[#aaaaaa] text-center py-2">
                  Delete a prompt to add a new one (max {MAX_PROMPTS}).
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[#f0f0f0]">
              <button
                onClick={onReset}
                className="text-[12.5px] text-[#aaaaaa] hover:text-[#6b7280] transition-colors"
              >
                ← Start over
              </button>

              <button
                onClick={() => onConfirm(prompts)}
                disabled={prompts.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13.5px] font-semibold transition-opacity disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}
              >
                Confirm &amp; run
                <span className="text-base leading-none">→</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
