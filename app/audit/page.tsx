"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BrandProfile, AuditResult, AuditStep } from "@/types";
import { BrandProfileEditor } from "@/components/brand-profile-editor";
import { AuditResults } from "@/components/audit-results";
import { AuditLoadingView, LoadingPhase } from "@/components/audit-loading";
import { supabase, getUserAudit, saveAuditForUser } from "@/lib/supabase";

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
          You&apos;ve already audited 1 website for free
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
const UNLIMITED_IDS = (process.env.NEXT_PUBLIC_UNLIMITED_USER_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);

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

      // Check if user already has a saved audit
      const existing = await getUserAudit(session.user.id);
      if (existing && !UNLIMITED_IDS.includes(session.user.id)) {
        setProfile(existing.profile as BrandProfile);
        setAuditResult(existing.results as AuditResult);
        setIsRedirecting(true);
        setTimeout(() => {
          setIsRedirecting(false);
          setStep("results");
        }, 2500);
        return;
      }

      // Fallback: session completed but Supabase save may not have landed yet
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
      if (existing && !UNLIMITED_IDS.includes(session.user.id)) {
        setProfile(existing.profile as BrandProfile);
        setAuditResult(existing.results as AuditResult);
        setIsRedirecting(true);
        setTimeout(() => { setIsRedirecting(false); setStep("results"); }, 2500);
        return;
      }
    }

    setProfile(confirmedProfile);
    setIsAuditing(true);
    setLoadingPhase("prompts");
    setStep("auditing");

    // Switch to firing animation after showing prompts
    firingTimerRef.current = setTimeout(() => setLoadingPhase("firing"), 3800);

    // Min total: 3800ms prompts + 10400ms firing animations = 14200ms
    const MIN_AUDIT_MS = 14200;

    try {
      const auditData = await withMinDuration(
        fetch("/api/run-audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile: confirmedProfile }),
        }).then(async (r) => {
          const d = await r.json();
          if (!r.ok) throw new Error(d.error || "Failed to run audit");
          return d;
        }),
        MIN_AUDIT_MS
      );
      if (firingTimerRef.current) clearTimeout(firingTimerRef.current);
      setAuditResult(auditData);
      setLoadingPhase(null);
      setStep("results");
      // Save to Supabase so this account's one audit persists
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await saveAuditForUser(session.user.id, {
            url: normalizedUrl,
            brand_name: confirmedProfile.brand_name,
            score: auditData.score,
            profile: confirmedProfile,
            results: auditData,
          });
        }
      } catch (saveErr) {
        console.error("Supabase save failed:", saveErr);
      }
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ profile: confirmedProfile, auditResult: auditData })); } catch {}
    } catch (err) {
      if (firingTimerRef.current) clearTimeout(firingTimerRef.current);
      setError(err instanceof Error ? err.message : "Audit failed. Please try again.");
      setLoadingPhase(null);
      setStep("profile");
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

  if (isRedirecting) {
    return <RedirectingAnimation />;
  }

  // Active loading phase — show the new animated loading view
  if (loadingPhase) {
    return (
      <AuditLoadingView
        phase={loadingPhase}
        url={normalizedUrl || normalize(url)}
        profile={profile}
        heroData={heroData}
        onReset={handleReset}
      />
    );
  }

  if (step === "results" && auditResult && profile) {
    return <AuditResults result={auditResult} profile={profile} onReset={handleReset} onRerun={handleRerun} />;
  }

  if (step === "profile" && profile) {
    return (
      <BrandProfileEditor
        profile={profile}
        onConfirm={handleConfirmProfile}
        isAuditing={isAuditing}
        onReset={handleReset}
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-[#0a0a0a] font-semibold text-lg mb-2">Something went wrong</h2>
          <p className="text-[#6b7280] text-sm mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 bg-[#5B2D91] text-white rounded-lg text-sm font-semibold hover:bg-[#4a2475] transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#5B2D91] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function AuditPage() {
  return (
    <Suspense>
      <AuditFlow />
    </Suspense>
  );
}
