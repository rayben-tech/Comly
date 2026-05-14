"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Check, ChevronDown } from "lucide-react";

function ComlyLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M50 4 C54 4 57 6 59.5 10 L93 68 C97 74 97 80 93.5 85 C90 90 84 93 77 93 L23 93 C16 93 10 90 6.5 85 C3 80 3 74 7 68 L40.5 10 C43 6 46 4 50 4Z"
        fill="#1a1a2e"
      />
      <path
        d="M28 72 C32 62 44 56 58 60 C66 62.5 70 67 68 70 C66 73 60 72 52 69 C44 66 36 68 32 74 C30 77 28 75 28 72Z"
        fill="url(#swooshGradSub)"
      />
      <defs>
        <linearGradient id="swooshGradSub" x1="28" y1="65" x2="70" y2="65" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5b21b6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const FEATURES = [
  "25 prompts tracked across 4 AI models",
  "All 4 AI models — ChatGPT, Claude, Gemini, Perplexity",
  "Visibility score + history & trends",
  "Competitor tracking — up to 5 competitors",
  "llms.txt generator, auto-updated weekly",
  "Comparison page generator",
  "Listicle generator — G2, Product Hunt, Capterra",
  "Hero rewrite suggestions",
  "Reddit & Quora engagement threads + AI reply drafts",
  "Email alerts on score changes",
  "CSV export",
  "Priority support",
];

const FAQS = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your account settings at any time — no questions asked. You keep access until the end of your billing period.",
  },
  {
    q: "What happens right after I subscribe?",
    a: "You get instant access to your full AI visibility dashboard. Run your first audit in under 60 seconds.",
  },
  {
    q: "Do I need a credit card to try it?",
    a: "The plan starts at $99/month. Enter your card details at checkout — you can cancel before your next billing date for a full refund.",
  },
];

function SubscribePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pendingUrl = searchParams.get("url") || "";

  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace(`/auth${pendingUrl ? `?url=${encodeURIComponent(pendingUrl)}` : ""}`);
        return;
      }
      setUserEmail(session.user.email ?? "");
      setUserName(session.user.user_metadata?.full_name ?? "");

      // If already paid, skip to dashboard
      const subRes = await fetch("/api/subscription/check", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const { isPaid } = await subRes.json();
      if (isPaid) {
        const dest = pendingUrl ? `/audit?url=${encodeURIComponent(pendingUrl)}` : "/audit";
        router.replace(dest);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCheckout() {
    setLoading(true);
    try {
      const dest = pendingUrl ? `/audit?url=${encodeURIComponent(pendingUrl)}` : "/audit";
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, userName, returnTo: dest }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f4f2] flex flex-col">
      {/* Minimal header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-[#e8e8e8] bg-white">
        <a href="/" className="flex items-center gap-2">
          <ComlyLogo size={26} />
          <span className="text-[15px] font-bold text-[#0a0a0a] tracking-tight">Comly</span>
        </a>
        <a href="/auth" className="text-[13px] text-[#6b6b6b] hover:text-[#0a0a0a] transition-colors">
          Already subscribed? <span className="font-semibold text-[#5B2D91]">Log in</span>
        </a>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center px-6 py-14">

        {/* Headline */}
        <div className="text-center mb-10 max-w-lg">
          <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-[#5B2D91] bg-[#5B2D91]/8 px-3 py-1 rounded-full mb-4">
            Early Access
          </span>
          <h1 className="text-[34px] font-extrabold text-[#0a0a0a] leading-tight mb-3">
            One plan. Full AI visibility.
          </h1>
          <p className="text-[15px] text-[#6b6b6b] leading-relaxed">
            Everything you need to track, understand, and improve how AI models talk about your brand.
          </p>
        </div>

        {/* Plan card */}
        <div className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl mb-10"
          style={{ background: "linear-gradient(135deg, #2d1060 0%, #5B2D91 50%, #7c3aed 100%)" }}>

          {/* Top: price + badge */}
          <div className="px-8 pt-8 pb-6 border-b border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-2">Early Access Plan</p>
                <div className="flex items-end gap-2">
                  <span className="text-[52px] font-black text-white leading-none">$99</span>
                  <span className="text-[16px] text-white/50 mb-2">/month</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full mt-2">
                  🔒 Price locked for early adopters
                </span>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-white py-4 font-extrabold text-[#5B2D91] hover:bg-white/90 active:scale-[0.98] transition-all text-[15px] shadow-xl shadow-black/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#5B2D91] border-t-transparent rounded-full animate-spin" />
                  Redirecting to checkout…
                </span>
              ) : "Get started →"}
            </button>
            <div className="flex items-center justify-center gap-3 text-white/30 text-[11px] mt-3">
              <span>✓ Cancel anytime</span>
              <span>·</span>
              <span>✓ Instant access</span>
            </div>
          </div>

          {/* Features grid */}
          <div className="px-8 py-6">
            <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-5">Everything included</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
                  <span className="text-[13px] text-white/75 leading-snug">{f}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 pt-5 border-t border-white/10 text-[12px] text-white/30">
              Plus: AI crawlability checker, source tracking, and all future tools at no extra cost.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="w-full max-w-2xl">
          <h2 className="text-[18px] font-bold text-[#0a0a0a] mb-4">Questions</h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-[14px] font-semibold text-[#0a0a0a]">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#aaaaaa] shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-[13px] text-[#6b6b6b] leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </main>
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
