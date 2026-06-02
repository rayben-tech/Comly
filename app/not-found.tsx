import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6 overflow-hidden relative">
      {/* background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(91,45,145,0.22) 0%, transparent 70%)",
        }}
      />

      {/* giant blurred 404 behind content */}
      <div
        aria-hidden
        className="pointer-events-none select-none absolute inset-0 flex items-center justify-center"
      >
        <span
          className="font-black text-[32vw] leading-none"
          style={{
            color: "rgba(91,45,145,0.08)",
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: "-0.06em",
          }}
        >
          404
        </span>
      </div>

      {/* card */}
      <div className="relative z-10 text-center max-w-md w-full">
        {/* logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-10 group">
          <svg
            width="28"
            height="31"
            viewBox="0 0 100 110"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M50 4 C54 4 57 6 59.5 10 L93 68 C97 74 97 80 93.5 85 C90 90 84 93 77 93 L23 93 C16 93 10 90 6.5 85 C3 80 3 74 7 68 L40.5 10 C43 6 46 4 50 4Z"
              fill="#5B2D91"
            />
            <path
              d="M28 72 C32 62 44 56 58 60 C66 62.5 70 67 68 70 C66 73 60 72 52 69 C44 66 36 68 32 74 C30 77 28 75 28 72Z"
              fill="#ffffff"
            />
          </svg>
          <span
            className="text-white font-bold text-lg tracking-tight"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Comly
          </span>
        </Link>

        <div
          className="rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm px-8 py-10"
          style={{ boxShadow: "0 0 0 1px rgba(91,45,145,0.15), 0 24px 48px rgba(0,0,0,0.5)" }}
        >
          {/* pill */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Page not found
          </div>

          <h1
            className="text-white text-3xl font-black mb-3 leading-tight"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            You&apos;ve gone off the map
          </h1>

          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            This page doesn&apos;t exist — or it moved. Head back to the
            dashboard and keep auditing your AI visibility.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5B2D91] hover:bg-[#6d36ad] text-white text-sm font-semibold px-5 py-2.5 transition-colors"
            >
              Go to dashboard
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 text-sm font-medium px-5 py-2.5 transition-colors"
            >
              Back to home
            </Link>
          </div>
        </div>

        <p className="mt-6 text-gray-600 text-xs">
          Need help?{" "}
          <a
            href="mailto:hello@trycomly.com"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            hello@trycomly.com
          </a>
        </p>
      </div>
    </div>
  );
}
