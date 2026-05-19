"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BrandProfile, AuditResult, AuditStep, PromptResult } from "@/types";
import { BrandProfileEditor } from "@/components/brand-profile-editor";
import { AuditResults } from "@/components/audit-results";
import { AuditLoadingView, LoadingPhase } from "@/components/audit-loading";
import { PromptReview } from "@/components/prompt-review";
import { supabase, getUserAudit, saveAuditForUser } from "@/lib/supabase";
import { generateAuditPrompts } from "@/lib/generate-prompts";
import { calculateScore, calculateCompetitorRankings } from "@/lib/score";

function RedirectingAnimation() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 2400;
    const iv = setInterval(() => {
      const pct = Math.min(((Date.now() - start) / duration) * 100, 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(iv);
    }, 30);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm p-10 flex flex-col items-center text-center max-w-sm w-full"
      >
        {/* Animated checkmark circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.25, 1] }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
          style={{ background: "linear-gradient(135deg, #5B2D91, #7c3aed)" }}
        >
          <motion.svg
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.45, ease: "easeOut" }}
            viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            className="w-8 h-8"
          >
            <motion.path
              d="M5 13l4 4L19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.45, ease: "easeOut" }}
            />
          </motion.svg>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-[#0a0a0a] font-bold text-lg mb-1.5"
        >
          Your plan is limited to 1 website audit
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-[#6b7280] text-sm mb-7 leading-relaxed"
        >
          Taking you back to your dashboard...
        </motion.p>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full"
        >
          <div className="h-1.5 bg-[#f3eeff] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#5B2D91] rounded-full"
              style={{ width: `${progress}%`, transition: "width 30ms linear" }}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

const SESSION_KEY = "comly_audit_session";

function withMinDuration<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.all([
    promise,
    new Promise<void>((resolve) => setTimeout(resolve, ms)),
  ]).then(([result]) => result);
}

function AuditFlow() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [step, setStep] = useState<AuditStep>("input");
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase | null>(null);
  const [url, setUrl] = useState("");
  const [normalizedUrl, setNormalizedUrl] = useState("");
  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [heroData, setHeroData] = useState<{ title: string; description: string } | null>(null);
  const [error, setError] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [reviewPrompts, setReviewPrompts] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const firingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auth guard + one-audit-per-account check
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        const paramUrl = searchParams.get("url") || sessionStorage.getItem("comly_pending_url") || "";
        const dest = paramUrl ? `/auth?url=${encodeURIComponent(paramUrl)}` : "/auth";
        router.replace(dest);
        return;
      }

      setUserId(session.user.id);
      const subCheck = await fetch("/api/subscription/check", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      }).then((r) => r.json()).catch(() => ({ isUnlimited: false }));
      const unlimited = Boolean(subCheck.isUnlimited);
      setIsUnlimited(unlimited);
      const existing = await getUserAudit(session.user.id);
      if (existing && !unlimited) {
        setProfile(existing.profile as BrandProfile);
        setAuditResult(existing.results as AuditResult);
        setIsRedirecting(true);
        setTimeout(() => {
          setIsRedirecting(false);
          setStep("results");
        }, 2500);
        return;
      }

      // For unlimited users: check if this is a refresh or same-URL revisit
      if (existing && unlimited) {
        const paramUrl = searchParams.get("url") || sessionStorage.getItem("comly_pending_url") || "";
        const norm = (u: string) => { let s = u.trim(); if (!s.startsWith("http")) s = "https://" + s; try { return new URL(s).origin + new URL(s).pathname; } catch { return s; } };
        const existingUrl = (existing.profile as BrandProfile)?.url ?? "";
        const isSameOrNoUrl = !paramUrl || norm(paramUrl) === norm(existingUrl);

        if (isSameOrNoUrl) {
          // Refresh or same-URL revisit — just show existing dashboard
          try { sessionStorage.removeItem("comly_pending_url"); } catch {}
          try { sessionStorage.removeItem(SESSION_KEY); } catch {}
          setProfile(existing.profile as BrandProfile);
          setAuditResult(existing.results as AuditResult);
          setStep("results");
          return;
        }

        // Different URL — run fresh audit
        try { sessionStorage.removeItem("comly_pending_url"); } catch {}
        try { sessionStorage.removeItem(SESSION_KEY); } catch {}
        setUrl(paramUrl);
        handleRunAuditWithUrl(paramUrl);
        return;
      }

      // No existing audit — fallback to sessionStorage cache (non-unlimited only)
      if (!unlimited) {
        try {
          const cached = sessionStorage.getItem(SESSION_KEY);
          if (cached) {
            const { profile: p, auditResult: r } = JSON.parse(cached);
            if (p && r) {
              setProfile(p);
              setAuditResult(r);
              setStep("results");
              return;
            }
          }
        } catch {}
      } else {
        try { sessionStorage.removeItem(SESSION_KEY); } catch {}
      }

      const paramUrl = searchParams.get("url") || sessionStorage.getItem("comly_pending_url") || "";
      if (paramUrl) {
        try { sessionStorage.removeItem("comly_pending_url"); } catch {}
        setUrl(paramUrl);
        handleRunAuditWithUrl(paramUrl);
      } else {
        router.push("/");
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function normalize(input: string): string {
    let u = input.trim();
    if (!u.startsWith("http://") && !u.startsWith("https://")) u = "https://" + u;
    return u;
  }

  async function handleRunAuditWithUrl(rawUrl: string) {
    const norm = normalize(rawUrl);
    setNormalizedUrl(norm);
    setError("");
    setLoadingPhase("scraping");
    setStep("scraping");
    try {
      // Scraping: minimum 5s so the browser animation plays fully
      const scrapeData = await withMinDuration(
        fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: norm }),
        }).then(async (r) => {
          const d = await r.json();
          if (!r.ok) throw new Error(d.error || "Failed to scrape website");
          if (d.title || d.description) {
            setHeroData({ title: d.title || "", description: d.description || "" });
          }
          return d;
        }),
        5000
      );

      setLoadingPhase("extracting");

      // Extracting: minimum 3.5s so all 5 profile rows animate in
      const extractData = await withMinDuration(
        fetch("/api/extract-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: scrapeData.content,
            url: norm,
            title: scrapeData.title,
            description: scrapeData.description,
          }),
        }).then(async (r) => {
          const d = await r.json();
          if (!r.ok) throw new Error(d.error || "Failed to analyze website");
          return d;
        }),
        3500
      );

      setProfile(extractData.profile);
      // Brief pause so profile animation is visible before editor
      setTimeout(() => {
        setLoadingPhase(null);
        setStep("profile");
      }, 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoadingPhase(null);
      setStep("input");
    }
  }

  async function handleRunAudit() {
    await handleRunAuditWithUrl(url);
  }

  async function handleConfirmProfile(confirmedProfile: BrandProfile) {
    // Hard guard: re-check before spending API budget
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const existing = await getUserAudit(session.user.id);
      if (existing && !isUnlimited) {
        setProfile(existing.profile as BrandProfile);
        setAuditResult(existing.results as AuditResult);
        setIsRedirecting(true);
        setTimeout(() => { setIsRedirecting(false); setStep("results"); }, 2500);
        return;
      }
    }

    setProfile(confirmedProfile);
    setLoadingPhase("prompts");
    setStep("auditing");

    // After prompts animation plays, transition to the review step
    firingTimerRef.current = setTimeout(() => {
      const prompts = generateAuditPrompts(confirmedProfile);
      setReviewPrompts(prompts);
      setLoadingPhase(null);
      setStep("review-prompts");
    }, 3800);
  }

  async function handleStartAudit(customPrompts: string[]) {
    if (!profile) return;
    setLoadingPhase("firing");
    setStep("auditing");
    setIsAuditing(true);

    const MIN_FIRING_MS = 11000;

    try {
      // Split into 3 parallel batches of ~8 prompts — each call finishes within 10s on Hobby plan
      const allPrompts = customPrompts.length > 0 ? customPrompts : generateAuditPrompts(profile);
      const batchSize = Math.ceil(allPrompts.length / 3);
      const batches = [
        allPrompts.slice(0, batchSize),
        allPrompts.slice(batchSize, batchSize * 2),
        allPrompts.slice(batchSize * 2),
      ].filter(b => b.length > 0);

      const callBatch = (batchPrompts: string[]) =>
        fetch("/api/run-audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile, customPrompts: batchPrompts }),
        }).then(async (r) => {
          const text = await r.text();
          let d: Record<string, unknown>;
          try { d = JSON.parse(text); } catch {
            throw new Error(`Server error (${r.status}): ${text.slice(0, 300)}`);
          }
          if (!r.ok) throw new Error((d.error as string) || "Failed to run audit");
          return (d as { prompt_results: PromptResult[] }).prompt_results;
        });

      const auditData = await withMinDuration(
        Promise.all(batches.map(callBatch)).then((batchResults) => {
          const promptResults = batchResults.flat();
          return {
            prompt_results: promptResults,
            score: calculateScore(promptResults),
            competitor_rankings: calculateCompetitorRankings(promptResults, profile!.brand_name),
            total_mentions: promptResults.filter(r => r.mentioned).length,
          };
        }),
        MIN_FIRING_MS
      );

      setAuditResult(auditData as AuditResult);
      setLoadingPhase(null);
      setStep("results");
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await saveAuditForUser(session.user.id, {
            url: normalizedUrl,
            brand_name: profile.brand_name,
            score: auditData.score,
            profile,
            results: auditData,
          });
        }
      } catch (saveErr) {
        console.error("Supabase save failed:", saveErr);
      }
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ profile, auditResult: auditData })); } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : "Audit failed. Please try again.");
      setLoadingPhase(null);
      setStep("auditing");
    } finally {
      setIsAuditing(false);
    }
  }

  function handleReset() {
    if (firingTimerRef.current) clearTimeout(firingTimerRef.current);
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
    setStep("input");
    setLoadingPhase(null);
    setUrl("");
    setNormalizedUrl("");
    setProfile(null);
    setHeroData(null);
    setAuditResult(null);
    setError("");
    router.push("/");
  }

  async function handleRerun() {
    if (!profile) return;
    handleConfirmProfile(profile);
  }

  const screenKey = isRedirecting
    ? "redirecting"
    : loadingPhase
    ? "loading"
    : step === "results" && auditResult && profile
    ? "results"
    : error
    ? "error"
    : step === "review-prompts" && reviewPrompts.length > 0
    ? "review"
    : step === "profile" && profile
    ? "profile"
    : "spinner";

  return (
    <AnimatePresence mode="wait">
      {screenKey === "redirecting" && (
        <motion.div key="redirecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <RedirectingAnimation />
        </motion.div>
      )}

      {screenKey === "loading" && (
        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
          <AuditLoadingView
            phase={loadingPhase!}
            url={normalizedUrl || normalize(url)}
            profile={profile}
            heroData={heroData}
            onReset={handleReset}
          />
        </motion.div>
      )}

      {screenKey === "results" && (
        <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <AuditResults result={auditResult!} profile={profile!} onReset={handleReset} onRerun={handleRerun} userId={userId ?? undefined} />
        </motion.div>
      )}

      {screenKey === "error" && (
        <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
          className="min-h-screen bg-[#fafaf8] flex flex-col items-center justify-center px-4"
        >
          <div className="max-w-md w-full text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-[#0a0a0a] font-semibold text-lg mb-2">Audit failed</h2>
            <p className="text-[#6b7280] text-sm mb-6 leading-relaxed">{error}</p>
            <div className="flex items-center justify-center gap-3">
              {profile && (
                <button
                  onClick={() => { setError(""); handleConfirmProfile(profile); }}
                  className="px-6 py-2.5 bg-[#5B2D91] text-white rounded-lg text-sm font-semibold hover:bg-[#4a2475] transition-colors"
                >
                  Try again
                </button>
              )}
              <button
                onClick={() => router.push("/")}
                className="px-6 py-2.5 bg-white border border-[#e5e5e5] text-[#6b7280] rounded-lg text-sm font-semibold hover:border-[#d0d0d0] transition-colors"
              >
                Go home
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {screenKey === "review" && (
        <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <PromptReview
            prompts={reviewPrompts}
            onConfirm={handleStartAudit}
            onReset={handleReset}
          />
        </motion.div>
      )}

      {screenKey === "profile" && (
        <motion.div
          key="profile"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <BrandProfileEditor
            profile={profile!}
            onConfirm={handleConfirmProfile}
            isAuditing={isAuditing}
            onReset={handleReset}
          />
        </motion.div>
      )}

      {screenKey === "spinner" && (
        <motion.div key="spinner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#5B2D91] border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function AuditPage() {
  return (
    <Suspense>
      <AuditFlow />
    </Suspense>
  );
}
