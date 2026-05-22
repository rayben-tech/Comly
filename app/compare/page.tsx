import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

export const metadata = {
  title: "Comly vs Competitors — AI Visibility Tool Comparisons (2025)",
  description:
    "See how Comly compares to Profound, Otterly.ai, Peec AI, and Semrush for AI visibility tracking, llms.txt generation, and content tools.",
};

const COMPARISONS = [
  {
    slug: "comly-vs-profound",
    name: "Profound",
    domain: "profound.ai",
    tagline: "Enterprise AI answer monitoring",
    differentiator: "5× cheaper with 4 AI models and 5 content tools included",
    badge: "Enterprise alternative",
    badgeColor: "text-purple-700 bg-purple-50 border-purple-100",
  },
  {
    slug: "comly-vs-otterly",
    name: "Otterly.ai",
    domain: "otterly.ai",
    tagline: "AI mention tracking tool",
    differentiator: "Daily tracking (not monthly) + full content generation suite",
    badge: "Direct competitor",
    badgeColor: "text-blue-700 bg-blue-50 border-blue-100",
  },
  {
    slug: "comly-vs-peec-ai",
    name: "Peec AI",
    domain: "peec.ai",
    tagline: "AI search share-of-voice",
    differentiator: "Comly adds llms.txt + content tools to improve your score, not just measure it",
    badge: "Direct competitor",
    badgeColor: "text-blue-700 bg-blue-50 border-blue-100",
  },
  {
    slug: "comly-vs-semrush",
    name: "Semrush",
    domain: "semrush.com",
    tagline: "Traditional SEO platform",
    differentiator: "Semrush tracks Google. Comly tracks ChatGPT, Claude, Perplexity & Gemini",
    badge: "Different category",
    badgeColor: "text-amber-700 bg-amber-50 border-amber-100",
  },
];

function ComlyLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 1.1)} viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg">
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

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-[#f7f7f8]">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#e8e8e8]">
        <div className="max-w-4xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ComlyLogo size={22} />
            <span className="font-extrabold text-[#0a0a0a] text-[15px] tracking-tight">Comly</span>
          </Link>
          <Link
            href="/auth"
            className="bg-[#5B2D91] text-white text-[13px] font-bold px-4 py-2 rounded-xl hover:bg-[#4a2478] transition-colors"
          >
            Try Comly free →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-5 pt-14 pb-10 text-center">
        <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-[#5B2D91] bg-[#5B2D91]/8 px-3 py-1 rounded-full mb-4">
          Side-by-side comparisons
        </span>
        <h1 className="text-[36px] sm:text-[48px] font-black text-[#0a0a0a] leading-tight mb-4 tracking-tight">
          How does Comly compare?
        </h1>
        <p className="text-[15px] text-[#6b6b6b] max-w-xl mx-auto leading-relaxed">
          Detailed feature-by-feature breakdowns against every major AI visibility and SEO tool.
        </p>
      </section>

      {/* Comparison cards */}
      <section className="max-w-4xl mx-auto px-5 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {COMPARISONS.map((c) => (
            <Link
              key={c.slug}
              href={`/compare/${c.slug}`}
              className="group bg-white rounded-2xl border border-[#e8e8e8] p-6 shadow-sm hover:border-[#5B2D91]/30 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Favicon */}
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${c.domain}&sz=48`}
                    alt={c.name}
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                  <div>
                    <p className="text-[15px] font-bold text-[#0a0a0a]">Comly vs {c.name}</p>
                    <p className="text-[12px] text-[#aaaaaa]">{c.tagline}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.badgeColor} shrink-0`}>
                  {c.badge}
                </span>
              </div>
              <p className="text-[13px] text-[#6b6b6b] leading-relaxed mb-5">{c.differentiator}</p>
              <div className="flex items-center gap-1 text-[13px] font-semibold text-[#5B2D91] group-hover:gap-2 transition-all">
                See full comparison
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-4xl mx-auto px-5 pb-20">
        <div
          className="rounded-3xl overflow-hidden relative text-center py-12 px-8"
          style={{
            background: "linear-gradient(135deg, #5B2D91 0%, #3b1270 45%, #1a0a3d 100%)",
            boxShadow: "0 20px 60px rgba(91,45,145,0.35)",
          }}
        >
          <div className="pointer-events-none absolute -top-16 -right-16 w-[300px] h-[300px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #a855f7, transparent 70%)" }} />
          <h2 className="text-[28px] sm:text-[34px] font-extrabold text-white mb-3 relative leading-tight">
            See your AI visibility score in 5 minutes
          </h2>
          <p className="text-[14px] text-white/50 mb-7 relative max-w-md mx-auto">
            Track your brand across ChatGPT, Claude, Perplexity, and Gemini — plus get the tools to improve it.
          </p>
          <Link
            href="/auth"
            className="relative inline-flex items-center gap-2 bg-white text-[#5B2D91] font-extrabold text-[14px] px-7 py-3.5 rounded-2xl hover:bg-white/90 transition-colors shadow-lg shadow-black/20"
          >
            Try Comly free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="relative text-white/25 text-[12px] mt-3">$99/mo · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e8e8e8] bg-white py-7 px-5">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <ComlyLogo size={20} />
            <span className="font-extrabold text-[#0a0a0a] text-[14px]">Comly</span>
          </Link>
          <p className="text-[12px] text-[#aaaaaa]">© 2025 Comly. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="text-[12px] text-[#aaaaaa] hover:text-[#0a0a0a] transition-colors">Privacy</Link>
            <Link href="/terms" className="text-[12px] text-[#aaaaaa] hover:text-[#0a0a0a] transition-colors">Terms</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
