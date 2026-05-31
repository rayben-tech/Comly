"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

function ComlyLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M50 4 C54 4 57 6 59.5 10 L93 68 C97 74 97 80 93.5 85 C90 90 84 93 77 93 L23 93 C16 93 10 90 6.5 85 C3 80 3 74 7 68 L40.5 10 C43 6 46 4 50 4Z"
        fill="#1a1a2e"
      />
      <path
        d="M28 72 C32 62 44 56 58 60 C66 62.5 70 67 68 70 C66 73 60 72 52 69 C44 66 36 68 32 74 C30 77 28 75 28 72Z"
        fill="#7c3aed"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
      <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
      <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
      <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
    </svg>
  );
}

const DEMO_URL = "spotify.com";
const DEMO_PROMPTS = [
  { text: "Best music streaming apps in 2025?",      model: "chatgpt.com"      },
  { text: "Spotify vs Apple Music — which wins?",    model: "claude.ai"         },
  { text: "Top apps AI recommends for music lovers?", model: "gemini.google.com" },
  { text: "How to discover new music with AI?",       model: "perplexity.ai"     },
];
const DEMO_MODELS = [
  { name: "ChatGPT",    domain: "chatgpt.com",      color: "#10a37f", mentioned: true  },
  { name: "Claude",     domain: "claude.ai",         color: "#d97706", mentioned: true  },
  { name: "Gemini",     domain: "gemini.google.com", color: "#4285f4", mentioned: true  },
  { name: "Perplexity", domain: "perplexity.ai",     color: "#20b2aa", mentioned: false },
];
const SCRAPE_STEPS = [
  { label: "Brand identified", value: "Spotify" },
  { label: "Category",         value: "Music Streaming" },
  { label: "Competitors",      value: "Apple Music, YouTube" },
  { label: "Prompts ready",    value: "25 queries" },
];

type Phase = "input" | "scraping" | "prompts" | "firing" | "score";

// Proper OS-style arrow cursor
function Cursor({ clicked = false }: { clicked?: boolean }) {
  return (
    <svg width="22" height="26" viewBox="0 0 22 26" fill="none" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))", transform: clicked ? "scale(0.88)" : "scale(1)", transition: "transform 0.08s" }}>
      <path d="M3.5 2.5 L3.5 21 L7.5 16.5 L10.5 23 L13.5 21.5 L10.5 15 L16.5 15 Z"
        fill="white" stroke="rgba(0,0,0,0.35)" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

function AuditAnimationFlow() {
  const [phase,          setPhase]          = useState<Phase>("input");
  const [typedUrl,       setTypedUrl]       = useState("");
  const [cursorStage,    setCursorStage]    = useState(0); // 0=off, 1=hover-input, 2=clicked, 3=hover-btn, 4=btn-clicked
  const [inputFocused,   setInputFocused]   = useState(false);
  const [scrapeStep,     setScrapeStep]     = useState(0);
  const [visiblePrompts, setVisiblePrompts] = useState(0);
  const [firedModels,    setFiredModels]    = useState(0);
  const [score,          setScore]          = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function t(fn: () => void, ms: number) { const id = setTimeout(fn, ms); timers.current.push(id); }
  function clearAll() { timers.current.forEach(clearTimeout); timers.current = []; }

  useEffect(() => {
    clearAll();
    setTypedUrl(""); setCursorStage(0); setInputFocused(false);
    setScrapeStep(0); setVisiblePrompts(0); setFiredModels(0); setScore(0);
    if (phase !== "input") return;

    t(() => setCursorStage(1), 500);              // cursor glides to input
    t(() => { setCursorStage(2); setInputFocused(true); }, 1100); // click + focus
    t(() => setCursorStage(1), 1250);             // release click

    let i = 0;
    t(() => {
      const iv = setInterval(() => {
        i++;
        setTypedUrl(DEMO_URL.slice(0, i));
        if (i >= DEMO_URL.length) {
          clearInterval(iv);
          t(() => setCursorStage(3), 400);        // move to button
          t(() => setCursorStage(4), 900);        // click button
          t(() => setPhase("scraping"), 1200);
        }
      }, 80);
      timers.current.push(iv as unknown as ReturnType<typeof setTimeout>);
    }, 1400);
    return clearAll;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase === "input" ? "input" : ""]);

  useEffect(() => {
    if (phase !== "scraping") return; clearAll(); let s = 0;
    const iv = setInterval(() => { s++; setScrapeStep(s); if (s >= SCRAPE_STEPS.length) { clearInterval(iv); t(() => setPhase("prompts"), 500); } }, 540);
    return () => { clearInterval(iv); clearAll(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase !== "prompts") return; clearAll(); let p = 0;
    const iv = setInterval(() => { p++; setVisiblePrompts(p); if (p >= DEMO_PROMPTS.length) { clearInterval(iv); t(() => setPhase("firing"), 700); } }, 480);
    return () => { clearInterval(iv); clearAll(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase !== "firing") return; clearAll(); let m = 0;
    const iv = setInterval(() => { m++; setFiredModels(m); if (m >= DEMO_MODELS.length) { clearInterval(iv); t(() => setPhase("score"), 600); } }, 550);
    return () => { clearInterval(iv); clearAll(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase !== "score") return; clearAll(); let s = 0;
    const iv = setInterval(() => { s += 2; setScore(Math.min(s, 74)); if (s >= 74) { clearInterval(iv); t(() => setPhase("input"), 2800); } }, 20);
    return () => { clearInterval(iv); clearAll(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Cursor positions for each stage
  const cursorPos = [
    { x: 220, y: -20, opacity: 0 },   // 0: off-screen
    { x: 110, y: 52,  opacity: 1 },   // 1: over input
    { x: 110, y: 52,  opacity: 1 },   // 2: click (same pos, just scale)
    { x: 110, y: 115, opacity: 1 },   // 3: over button
    { x: 110, y: 115, opacity: 1 },   // 4: click button
  ][cursorStage];

  const w = "rgba(255,255,255,";
  const p = "rgba(124,58,237,";

  return (
    <div className="w-full max-w-[300px] mx-auto select-none">
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(15,10,30,0.85)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(20px)", boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.1)" }}>

        {/* Chrome bar */}
        <div className="flex items-center gap-2 px-3.5 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 rounded-md px-2.5 py-0.5 text-[10px]" style={{ background: "rgba(255,255,255,0.06)", color: w+"0.35)" }}>trycomly.com</div>
        </div>

        {/* Content */}
        <div className="px-4 pt-4 pb-3" style={{ minHeight: 246 }}>
          <AnimatePresence mode="wait">

            {/* ── INPUT ── */}
            {phase === "input" && (
              <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }} className="relative">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: w+"0.28)" }}>Enter your website URL</p>

                {/* Input field */}
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-3 transition-all duration-300"
                  style={{ background: inputFocused ? p+"0.1)" : w+"0.05)", border: `1px solid ${inputFocused ? p+"0.55)" : w+"0.1)"}`, boxShadow: inputFocused ? `0 0 0 3px ${p+"0.12)"}` : "none" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
                  <span className="font-medium text-[13px] flex-1 tracking-wide" style={{ color: w+"0.9)" }}>
                    {typedUrl}
                    {inputFocused && typedUrl.length < DEMO_URL.length && (
                      <motion.span animate={{ opacity: [1,0,1] }} transition={{ duration: 0.9, repeat: Infinity }}>|</motion.span>
                    )}
                  </span>
                </div>

                {/* Run Audit button */}
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: typedUrl.length === DEMO_URL.length ? 1 : 0, y: typedUrl.length === DEMO_URL.length ? 0 : 4, scale: cursorStage === 4 ? 0.96 : 1 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl"
                  style={{ background: "linear-gradient(135deg,#5B2D91,#7c3aed)", boxShadow: cursorStage === 4 ? "0 2px 8px rgba(124,58,237,0.4)" : "0 6px 20px rgba(124,58,237,0.45)" }}
                >
                  <span className="text-white font-semibold text-[13px]">Run Audit</span>
                  <motion.span animate={{ x: cursorStage >= 3 ? 2 : 0 }} className="text-white/70 text-[13px]">→</motion.span>
                </motion.div>

                {/* Cursor */}
                <motion.div className="absolute pointer-events-none z-20" style={{ top: 0, left: 0 }}
                  animate={{ x: cursorPos.x, y: cursorPos.y, opacity: cursorPos.opacity }}
                  transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}>
                  <Cursor clicked={cursorStage === 2 || cursorStage === 4} />
                </motion.div>
              </motion.div>
            )}

            {/* ── SCRAPING ── */}
            {phase === "scraping" && (
              <motion.div key="scraping" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                <div className="flex items-center gap-2.5 mb-4 px-3 py-2.5 rounded-xl" style={{ background: p+"0.08)", border: `1px solid ${p+"0.2)"}` }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 rounded-full border-2 shrink-0" style={{ borderColor: p+"0.25)", borderTopColor: "#a78bfa" }} />
                  <p className="text-[12px] font-semibold" style={{ color: w+"0.85)" }}>Scanning <span style={{ color: "#a78bfa" }}>spotify.com</span>…</p>
                </div>
                <div className="space-y-2">
                  {SCRAPE_STEPS.map(({ label, value }, i) => (
                    <motion.div key={label} initial={{ opacity: 0, x: -12 }} animate={{ opacity: i < scrapeStep ? 1 : 0.18, x: 0 }} transition={{ duration: 0.3, delay: i * 0.03 }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg" style={{ background: i < scrapeStep ? w+"0.04)" : "transparent", border: `1px solid ${i < scrapeStep ? w+"0.08)" : "transparent"}` }}>
                      <div className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                        style={{ background: i < scrapeStep ? "rgba(16,185,129,0.18)" : w+"0.04)", border: `1px solid ${i < scrapeStep ? "rgba(16,185,129,0.4)" : w+"0.08)"}` }}>
                        {i < scrapeStep
                          ? <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>
                              <svg width="7" height="5" viewBox="0 0 8 6" fill="none"><path d="M1 3l2 2 4-4" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </motion.div>
                          : <div className="w-1.5 h-1.5 rounded-full" style={{ background: w+"0.2)" }} />}
                      </div>
                      <span className="text-[11px] flex-1" style={{ color: i < scrapeStep ? w+"0.8)" : w+"0.2)" }}>{label}</span>
                      {i < scrapeStep && <span className="text-[10px] font-medium" style={{ color: "#a78bfa" }}>{value}</span>}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── PROMPTS ── */}
            {phase === "prompts" && (
              <motion.div key="prompts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: w+"0.28)" }}>Running prompts</p>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: p+"0.12)", color: "#a78bfa", border: `1px solid ${p+"0.2)"}` }}>{visiblePrompts}/{DEMO_PROMPTS.length}</span>
                </div>
                <div className="space-y-1.5">
                  {DEMO_PROMPTS.map(({ text, model }, i) => (
                    <motion.div key={text} initial={{ opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: i < visiblePrompts ? 1 : 0, y: i < visiblePrompts ? 0 : 10, scale: i < visiblePrompts ? 1 : 0.97 }} transition={{ duration: 0.28, ease: [0.25,0.1,0.25,1] }}>
                      <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg" style={{ background: w+"0.04)", border: `1px solid ${w+"0.07)"}` }}>
                        <img src={`https://www.google.com/s2/favicons?domain=${model}&sz=32`} width={12} height={12} className="rounded-sm shrink-0 opacity-60" alt="" />
                        <span className="text-[10.5px] flex-1 truncate" style={{ color: w+"0.6)" }}>{text}</span>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                          className="w-2.5 h-2.5 rounded-full border-2 shrink-0" style={{ borderColor: p+"0.2)", borderTopColor: "#a78bfa" }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── FIRING ── */}
            {phase === "firing" && (
              <motion.div key="firing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: w+"0.28)" }}>Collecting AI responses</p>
                <div className="space-y-2">
                  {DEMO_MODELS.map((m, i) => {
                    const done = i < firedModels;
                    return (
                      <motion.div key={m.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22, delay: i * 0.04 }}>
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-400"
                          style={{ background: done ? `${m.color}14` : w+"0.04)", border: `1px solid ${done ? m.color+"40" : w+"0.07)"}` }}>
                          <img src={`https://www.google.com/s2/favicons?domain=${m.domain}&sz=32`} width={16} height={16} className="rounded-md shrink-0" alt={m.name} style={{ opacity: done ? 1 : 0.35 }} />
                          <span className="text-[12px] font-medium flex-1" style={{ color: done ? w+"0.9)" : w+"0.3)" }}>{m.name}</span>
                          {done ? (
                            <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 350, damping: 18 }}>
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: m.mentioned ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${m.mentioned ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}` }}>
                                <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
                                  {m.mentioned
                                    ? <path d="M1 4l2 2 4-4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    : <path d="M2 2l4 4M6 2L2 6" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>}
                                </svg>
                                <span className="text-[9px] font-semibold" style={{ color: m.mentioned ? "#10b981" : "#ef4444" }}>{m.mentioned ? "Mentioned" : "Missed"}</span>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-3 h-3 rounded-full border-2 shrink-0" style={{ borderColor: w+"0.08)", borderTopColor: w+"0.3)" }} />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── SCORE ── */}
            {phase === "score" && (
              <motion.div key="score" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.38, ease: [0.25,0.1,0.25,1] }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: w+"0.28)" }}>AI Visibility Score</p>
                    <p className="text-[11px] mt-0.5" style={{ color: w+"0.38)" }}>spotify.com · just audited</p>
                  </div>
                  <motion.div initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 14 }}
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-[15px] shrink-0"
                    style={{ background: "linear-gradient(135deg,#5B2D91,#7c3aed)", boxShadow: "0 6px 20px rgba(124,58,237,0.55)" }}>
                    B+
                  </motion.div>
                </div>
                <div className="flex items-end gap-1 mb-2.5">
                  <motion.span className="font-black leading-none" style={{ fontSize: 52, color: "white" }}>{score}</motion.span>
                  <span className="text-[22px] font-light mb-1.5" style={{ color: w+"0.25)" }}>/100</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: w+"0.07)" }}>
                  <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#5B2D91,#a78bfa,#c084fc)", width: `${score}%` }} />
                </div>
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                  className="grid grid-cols-2 gap-1.5">
                  {DEMO_MODELS.map((m) => (
                    <div key={m.name} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg" style={{ background: w+"0.04)", border: `1px solid ${w+"0.07)"}` }}>
                      <img src={`https://www.google.com/s2/favicons?domain=${m.domain}&sz=32`} width={11} height={11} className="rounded-sm shrink-0" alt="" />
                      <span className="text-[9.5px] flex-1" style={{ color: w+"0.55)" }}>{m.name}</span>
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: m.mentioned ? "#10b981" : "#ef4444" }} />
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="pb-3.5 flex items-center justify-center gap-1.5">
          {(["input","scraping","prompts","firing","score"] as Phase[]).map((p) => (
            <motion.div key={p} animate={{ width: phase === p ? 20 : 6, background: phase === p ? "#7c3aed" : "rgba(255,255,255,0.12)" }}
              transition={{ duration: 0.3 }} className="h-1.5 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

function AuthFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pendingUrl = searchParams.get("url") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const dest = pendingUrl ? `/audit?url=${encodeURIComponent(pendingUrl)}` : "/audit";
        router.replace(dest);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGoogle() {
    setError("");
    setLoading(true);
    if (pendingUrl) localStorage.setItem("comly_pending_url", pendingUrl);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `https://www.trycomly.com/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  const columnPositions = [8, 20, 33, 46, 59, 72, 85];
  const columnHeights = [55, 75, 45, 80, 60, 70, 50];

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-[48%] relative bg-[#07070f] flex-col overflow-hidden">
        {/* Glow columns */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {columnPositions.map((left, i) => (
            <div key={i} className="absolute bottom-0" style={{
              left: `${left}%`, width: "60px", height: `${columnHeights[i]}%`,
              transform: "translateX(-50%)",
              background: i % 3 === 0
                ? "linear-gradient(to top, rgba(124,58,237,0.55) 0%, rgba(124,58,237,0.2) 45%, transparent 100%)"
                : i % 3 === 1
                ? "linear-gradient(to top, rgba(91,33,145,0.45) 0%, rgba(91,33,145,0.15) 45%, transparent 100%)"
                : "linear-gradient(to top, rgba(167,85,247,0.35) 0%, rgba(167,85,247,0.1) 45%, transparent 100%)",
              filter: "blur(22px)", borderRadius: "50% 50% 0 0",
            }} />
          ))}
          <div className="absolute bottom-0 left-0 right-0" style={{
            height: "35%",
            background: "radial-gradient(ellipse 100% 60% at 50% 100%, rgba(109,40,217,0.3) 0%, transparent 70%)",
          }} />
        </div>

        {/* Animation — middle of panel */}
        <div className="flex-1 flex items-center justify-center px-10 pt-12 pb-4 relative z-10">
          <AuditAnimationFlow />
        </div>

      </div>

      {/* Right panel — unchanged */}
      <div className="flex-1 flex items-center justify-center bg-[#f4f4f2] px-6 py-12">
        <div className="w-full max-w-[370px]">
          {/* Mobile logo */}
          <a href="/" className="lg:hidden flex items-center gap-2 mb-8">
            <ComlyLogo size={26} />
            <span className="text-[15px] font-bold text-[#0a0a0a] tracking-tight">Comly</span>
          </a>

          <div className="mb-8">
            <div className="hidden lg:block mb-4">
              <ComlyLogo size={40} />
            </div>
            <h1 className="text-[24px] font-bold text-[#0a0a0a] mb-1">Get Started</h1>
            <p className="text-[13.5px] text-[#6b6b6b]">Sign in to continue your audit</p>
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-[#e0e0e0] bg-white hover:bg-[#fafafa] text-[14px] font-medium text-[#0a0a0a] transition-colors disabled:opacity-60 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-[#5B2D91] border-t-transparent rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100 mt-4">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span className="text-[12.5px] text-red-600">{error}</span>
            </div>
          )}

          {/* Social proof */}
          <div className="flex items-center justify-center gap-2.5 mt-5">
            <div className="flex -space-x-2">
              {["elevare.one","thelawgpt.com","clibu.com"].map((domain, i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-[#f4f4f2] overflow-hidden bg-white shrink-0">
                  <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} width={24} height={24} className="w-full h-full object-cover" alt="" />
                </div>
              ))}
            </div>
            <p className="text-[12px] text-[#6b6b6b]">
              Join <span className="font-semibold text-[#0a0a0a]">100+</span> brands already tracking AI visibility
            </p>
          </div>

          {/* What you get */}
          <div className="mt-5 px-4 py-4 rounded-xl bg-white border border-[#ebebeb] shadow-[0_1px_4px_rgba(0,0,0,0.04)] space-y-2.5">
            {[
              { icon: "✦", text: "Your AI visibility score across 4 models" },
              { icon: "✦", text: "See which prompts mention you — and which don't" },
              { icon: "✦", text: "Competitor rankings & actionable fixes" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-start gap-2.5">
                <span className="text-[#5B2D91] text-[10px] mt-0.5 shrink-0">{icon}</span>
                <p className="text-[12.5px] text-[#4b5563] leading-snug">{text}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-[11.5px] text-[#b0b0b0] mt-6">
            By continuing, you agree to our{" "}
            <a href="#" className="text-[#5B2D91] hover:underline">Terms</a>
            {" "}and{" "}
            <a href="#" className="text-[#5B2D91] hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthFlow />
    </Suspense>
  );
}
