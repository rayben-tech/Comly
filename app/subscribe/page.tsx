"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ChevronDown, Lock, Clock } from "lucide-react";

const FAQS = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your account settings at any time — no questions asked. You keep access until the end of your billing period.",
  },
  {
    q: "What happens right after I subscribe?",
    a: "You get instant access to your full AI visibility dashboard. Your audit results load automatically — no need to re-run anything.",
  },
  {
    q: "Do I need a credit card to try it?",
    a: "The plan starts at $99/month. Enter your card details at checkout — you can cancel before your next billing date.",
  },
];

function useCountdown(expiresAt: number | null) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = expiresAt - Date.now();
      if (diff <= 0) { setTimeLeft("expired"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${h}h ${m}m`);
    };
    tick();
    const iv = setInterval(tick, 30000);
    return () => clearInterval(iv);
  }, [expiresAt]);

  return timeLeft;
}

function SubscribePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pendingUrl = searchParams.get("url") || "";

  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);

  const timeLeft = useCountdown(expiresAt);
  const hasPendingAudit = Boolean(brandName && expiresAt && Date.now() < expiresAt);

  useEffect(() => {
    // Read pending audit from localStorage for contextual UI
    try {
      const raw = localStorage.getItem("comly_pending_audit");
      if (raw) {
        const { profile, expiresAt: exp } = JSON.parse(raw) as { profile: { brand_name: string }; expiresAt: number };
        if (Date.now() < exp) {
          setBrandName(profile?.brand_name || "");
          setExpiresAt(exp);
        }
      }
    } catch {}

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace(`/auth${pendingUrl ? `?url=${encodeURIComponent(pendingUrl)}` : ""}`);
        return;
      }
      setUserEmail(session.user.email ?? "");
      setUserName(session.user.user_metadata?.full_name ?? "");

      const subRes = await fetch("/api/subscription/check", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const { isPaid, isTrialing } = await subRes.json();
      if (isPaid || isTrialing) {
        router.replace(pendingUrl ? `/audit?url=${encodeURIComponent(pendingUrl)}` : "/audit");
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCheckout() {
    setLoading(true);
    setCheckoutError("");
    try {
      let dest = pendingUrl ? `/audit?url=${encodeURIComponent(pendingUrl)}` : "/audit";
      try {
        const raw = localStorage.getItem("comly_pending_audit");
        if (raw) {
          const { expiresAt: exp } = JSON.parse(raw) as { expiresAt: number };
          if (Date.now() < exp) dest = "/audit?resume=true";
        }
      } catch {}

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, userName, returnTo: dest }),
      });
      const text = await res.text();
      let data: { url?: string; error?: string } = {};
      try { data = JSON.parse(text); } catch { data = { error: `Server error (${res.status})` }; }
      if (data.url) {
        window.location.href = data.url;
      } else {
        setCheckoutError(data.error || "Checkout failed — please try again.");
        setLoading(false);
      }
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f0eff0] flex flex-col items-center justify-start px-6 py-10">

      {/* Headline */}
      <div className="text-center mb-6 max-w-xl">
        {hasPendingAudit ? (
          <>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full mb-3">
              <Clock className="w-3 h-3" />
              Results expire in {timeLeft}
            </div>
            <h1 className="text-[32px] font-extrabold text-[#0a0a0a] leading-tight">
              Your <span className="text-[#5B2D91]">{brandName}</span> audit is ready.
            </h1>
            <p className="text-[14px] text-[#6b6b6b] mt-2">Subscribe to unlock your AI visibility score and full report.</p>
          </>
        ) : (
          <>
            <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-[#5B2D91] bg-[#5B2D91]/8 px-3 py-1 rounded-full mb-3">
              Early Access
            </span>
            <h1 className="text-[32px] font-extrabold text-[#0a0a0a] leading-tight">
              One plan. Everything included.
            </h1>
            <p className="text-[14px] text-[#6b6b6b] mt-2">No feature tiers. No model limits.</p>
          </>
        )}
      </div>

      {/* Locked results card — only when pending audit exists */}
      {hasPendingAudit && (
        <div className="w-full max-w-4xl mb-4 bg-white border border-[#e8e8e8] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#f3eeff] flex items-center justify-center shrink-0">
            <Lock className="w-4.5 h-4.5 text-[#5B2D91]" style={{ width: 18, height: 18 }} />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-[#0a0a0a] mb-1">Locked: your {brandName} audit results</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {["AI visibility score", "25 AI responses across 4 models", "Competitor rankings", "Improvement recommendations"].map((item) => (
                <span key={item} className="text-[12px] text-[#6b7280] flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-[#5B2D91] inline-block" />
                  {item}
                </span>
              ))}
            </div>
          </div>
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full shrink-0">
            Expires in {timeLeft}
          </span>
        </div>
      )}

      {/* Pricing card */}
      <div
        className="w-full max-w-4xl rounded-3xl overflow-hidden border border-white/10 relative"
        style={{
          background: "linear-gradient(135deg, #5B2D91 0%, #3b1270 45%, #1a0a3d 100%)",
          boxShadow: "0 40px 100px rgba(91, 45, 145, 0.55), 0 20px 50px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255,255,255,0.06)",
        }}
      >
        <div className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, #a855f7, transparent 70%)" }} />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-[320px] h-[320px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }} />

        <div className="relative flex flex-col lg:flex-row">

          {/* Left: price + CTA */}
          <div className="lg:w-[300px] shrink-0 px-10 py-12 flex flex-col justify-between gap-8 border-b lg:border-b-0 lg:border-r border-white/10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-full px-3 py-1">
                <span className="text-[11px] font-semibold text-white/80 tracking-wide">All in One</span>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-full">For founders &amp; teams</span>
              </div>
              <div>
                <div className="flex items-start gap-2">
                  <span className="text-[16px] text-white/30 line-through mt-3 leading-none">$149</span>
                  <div className="flex items-end gap-1">
                    <span className="text-[68px] font-black text-white leading-none tracking-tight">$99</span>
                    <span className="text-[15px] text-white/40 pb-2">/mo</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full mt-2">
                  🔒 Price locked for early adopters
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full rounded-2xl bg-white py-4 font-extrabold text-[#5B2D91] hover:bg-white/90 active:scale-[0.98] transition-all text-[15px] shadow-xl shadow-black/30 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#5B2D91] border-t-transparent rounded-full animate-spin" />
                    Redirecting…
                  </span>
                ) : hasPendingAudit ? "Unlock my results →" : "Get started →"}
              </button>
              {checkoutError && (
                <p className="text-center text-[12px] text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{checkoutError}</p>
              )}
              <div className="flex items-center justify-center gap-3 text-white/30 text-[11px]">
                <span>✓ Cancel anytime</span>
                <span>·</span>
                <span>✓ Instant access</span>
              </div>
              <p className="text-center text-white/20 text-[11px]">
                Joined by 200+ founders tracking AI visibility
              </p>
            </div>
          </div>

          {/* Right: features */}
          <div className="flex-1 px-10 py-12">
            <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-5">Everything included</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3.5">
              {[
                { text: <><strong className="text-white">25 prompts</strong><span className="text-white/60"> tracked daily across 4 AI models</span></> },
                { text: <><strong className="text-white">All 4 AI models</strong><span className="text-white/60"> — ChatGPT, Claude, Perplexity, Gemini</span></> },
                { text: <><span className="text-white/60">Visibility score + </span><strong className="text-white">score history &amp; trends</strong></> },
                { text: <><strong className="text-white">Competitor tracking</strong><span className="text-white/60"> — up to 5 competitors</span></> },
                { text: <><strong className="text-white">llms.txt generator</strong><span className="text-white/60">, auto-updated weekly</span></> },
                { text: <><strong className="text-white">Comparison page</strong><span className="text-white/60"> generator</span></> },
                { text: <><strong className="text-white">Listicle generator</strong><span className="text-white/60"> — G2, Product Hunt, Capterra</span></> },
                { text: <><strong className="text-white">Hero rewrite</strong><span className="text-white/60"> suggestions</span></> },
                { text: <><strong className="text-white">Engagement Threads</strong><span className="text-white/60"> — Reddit &amp; reply drafts</span></> },
                { text: <><strong className="text-white">Email alerts</strong><span className="text-white/60"> on score changes</span></> },
                { text: <><span className="text-white/60">Export data as </span><strong className="text-white">CSV</strong></> },
                { text: <><strong className="text-white">Priority support</strong></> },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="shrink-0 mt-0.5 text-emerald-400 text-[13px]">✔</span>
                  <span className="text-[13px] leading-snug">{item.text}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 pt-4 border-t border-white/10 text-[12px] text-white/30">
              Plus: AI crawlability checker, source tracking, and all future tools at no extra cost.
            </p>
          </div>

        </div>
      </div>

      {/* FAQ */}
      <div className="w-full max-w-4xl mt-10">
        <h2 className="text-[16px] font-bold text-[#0a0a0a] mb-3">Questions</h2>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-[14px] font-semibold text-[#0a0a0a]">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-[#aaaaaa] shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-[13px] text-[#6b6b6b] leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-[12px] text-[#aaaaaa] mt-6">
          Already subscribed?{" "}
          <a href="/auth" className="text-[#5B2D91] hover:underline font-medium">Log in</a>
        </p>
      </div>

    </div>
  );
}

export default function SubscribePageWrapper() {
  return (
    <Suspense>
      <SubscribePage />
    </Suspense>
  );
}
