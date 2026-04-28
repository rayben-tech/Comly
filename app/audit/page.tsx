"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BrandProfile, AuditResult, AuditStep } from "@/types";
import { BrandProfileEditor } from "@/components/brand-profile-editor";
import { AuditResults } from "@/components/audit-results";
import { AuditLoadingView, LoadingPhase } from "@/components/audit-loading";
import { supabase, getUserAudit, saveAuditForUser } from "@/lib/supabase";

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
      if (existing) {
        setProfile(existing.profile as BrandProfile);
        setAuditResult(existing.results as AuditResult);
        setStep("results");
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
      } catch {}
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
