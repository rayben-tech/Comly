"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AlertCircle } from "lucide-react";

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
      <div className="hidden lg:flex w-[48%] relative bg-[#07070f] flex-col justify-end p-12 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {columnPositions.map((left, i) => (
            <div
              key={i}
              className="absolute bottom-0"
              style={{
                left: `${left}%`,
                width: "60px",
                height: `${columnHeights[i]}%`,
                transform: "translateX(-50%)",
                background: i % 3 === 0
                  ? "linear-gradient(to top, rgba(124,58,237,0.55) 0%, rgba(124,58,237,0.2) 45%, transparent 100%)"
                  : i % 3 === 1
                  ? "linear-gradient(to top, rgba(91,33,145,0.45) 0%, rgba(91,33,145,0.15) 45%, transparent 100%)"
                  : "linear-gradient(to top, rgba(167,85,247,0.35) 0%, rgba(167,85,247,0.1) 45%, transparent 100%)",
                filter: "blur(22px)",
                borderRadius: "50% 50% 0 0",
              }}
            />
          ))}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: "35%",
              background: "radial-gradient(ellipse 100% 60% at 50% 100%, rgba(109,40,217,0.3) 0%, transparent 70%)",
            }}
          />
        </div>
        <div className="relative z-10">
          <a href="/" className="flex items-center gap-2.5 mb-10">
            <ComlyLogo size={34} />
            <span className="text-[19px] font-bold text-white tracking-tight">Comly</span>
          </a>
          <h2 className="text-[30px] font-bold text-white leading-snug mb-3">
            AI Visibility Audit<br />for Modern Brands.
          </h2>
          <p className="text-[14px] text-white/45 leading-relaxed">
            Discover how AI models talk about your brand<br />and outrank your competitors.
          </p>
        </div>
      </div>

      {/* Right panel */}
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
