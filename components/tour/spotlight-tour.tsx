"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X } from "lucide-react";

export interface TourStep {
  target: string;
  title: string;
  body: string;
  emoji?: string;
  position?: "top" | "bottom" | "left" | "right";
  onBefore?: () => void;
}

interface Rect { top: number; left: number; width: number; height: number }

const W = 316;
const PAD = 10;
const TH_EST = 190; // estimated tooltip height for positioning

function computeTip(rect: Rect, pos: TourStep["position"] = "bottom"): { top: number; left: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let top: number, left: number;

  if (pos === "bottom") {
    top = rect.top + rect.height + PAD + 14;
    left = rect.left + rect.width / 2 - W / 2;
  } else if (pos === "top") {
    top = rect.top - TH_EST - PAD - 14;
    left = rect.left + rect.width / 2 - W / 2;
  } else if (pos === "right") {
    top = rect.top + rect.height / 2 - TH_EST / 2;
    left = rect.left + rect.width + PAD + 14;
  } else {
    top = rect.top + rect.height / 2 - TH_EST / 2;
    left = rect.left - W - PAD - 14;
  }
  return {
    top: Math.max(16, Math.min(top, vh - TH_EST - 16)),
    left: Math.max(16, Math.min(left, vw - W - 16)),
  };
}

interface Props {
  steps: TourStep[];
  onComplete: () => void;
}

export function SpotlightTour({ steps, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [visible, setVisible] = useState(false);

  const current = steps[step];

  useEffect(() => {
    setVisible(false);
    if (current?.onBefore) current.onBefore();

    let cancelled = false;

    function tryFind(attempts: number) {
      if (cancelled) return;
      const el = document.querySelector<HTMLElement>(`[data-tour="${current?.target}"]`);
      if (!el) {
        if (attempts < 12) setTimeout(() => tryFind(attempts + 1), 250);
        return;
      }
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      setTimeout(() => {
        if (cancelled) return;
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        setVisible(true);
      }, 320);
    }

    const t = setTimeout(() => tryFind(0), 80);
    return () => { cancelled = true; clearTimeout(t); };
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function onResize() {
      const el = document.querySelector<HTMLElement>(`[data-tour="${current?.target}"]`);
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [current]);

  const next = () => {
    if (step < steps.length - 1) {
      setVisible(false);
      setTimeout(() => setStep(s => s + 1), 160);
    } else {
      onComplete();
    }
  };

  if (!current || !rect) return null;

  const spot = { top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2 };
  const tip = computeTip(rect, current.position);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={step}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999]"
          style={{ pointerEvents: "all" }}
          onClick={onComplete}
        >
          {/* Dim overlay via box-shadow on cutout */}
          <div
            className="absolute"
            style={{
              top: spot.top, left: spot.left,
              width: spot.width, height: spot.height,
              borderRadius: 14,
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)",
              pointerEvents: "none",
            }}
          />

          {/* Pulsing border ring */}
          <motion.div
            className="absolute"
            style={{
              top: spot.top, left: spot.left,
              width: spot.width, height: spot.height,
              borderRadius: 14,
              border: "2px solid #7c3aed",
              pointerEvents: "none",
            }}
            animate={{ opacity: [0.9, 0.3, 0.9] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22, delay: 0.1 }}
            className="absolute"
            style={{ top: tip.top, left: tip.left, width: W, pointerEvents: "all" }}
            onClick={e => e.stopPropagation()}
          >
            <div
              className="bg-white rounded-2xl overflow-hidden shadow-2xl"
              style={{ border: "1px solid #e5e5e5" }}
            >
              {/* Purple gradient top bar */}
              <div className="h-1.5" style={{ background: "linear-gradient(90deg, #5B2D91 0%, #a855f7 100%)" }} />

              <div className="px-5 pt-3.5 pb-5">
                {/* Step counter + close */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest">
                    Step {step + 1} of {steps.length}
                  </span>
                  <button
                    onClick={onComplete}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[#bbbbbb] hover:bg-[#f5f5f5] hover:text-[#555] transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {/* Emoji + title */}
                <div className="flex items-start gap-3 mb-2.5">
                  {current.emoji && (
                    <span className="text-[24px] leading-none mt-0.5 shrink-0">{current.emoji}</span>
                  )}
                  <p className="text-[15px] font-bold text-[#0a0a0a] leading-snug">
                    {current.title}
                  </p>
                </div>

                {/* Body */}
                <p className="text-[13px] text-[#555] leading-[1.68] mb-4">
                  {current.body}
                </p>

                {/* Progress bar dots */}
                <div className="flex items-center gap-1 mb-4">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: i === step ? 22 : 6,
                        height: 6,
                        background: i <= step ? "#5B2D91" : "#e5e5e5",
                        flexShrink: 0,
                      }}
                    />
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={onComplete}
                    className="text-[11px] text-[#bbbbbb] hover:text-[#6b7280] transition-colors"
                  >
                    Skip tour
                  </button>
                  <button
                    onClick={next}
                    className="flex items-center gap-1.5 text-[12px] font-bold text-white px-4 py-2 rounded-xl transition-opacity hover:opacity-90 active:scale-95"
                    style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}
                  >
                    {step < steps.length - 1 ? (
                      <>Next <ArrowRight className="w-3.5 h-3.5" /></>
                    ) : (
                      "Let's go 🚀"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
