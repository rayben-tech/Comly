import { NextRequest, NextResponse } from "next/server";

const COMPARISON_PATTERN = /vs[^a-z]|[^a-z]vs|versus|compar|alternative/i;

export async function POST(req: NextRequest) {
  const { type, domain } = await req.json();
  if (!domain) return NextResponse.json({ exists: false, urls: [] });

  const base = (domain.startsWith("http") ? domain : `https://${domain}`).replace(/\/$/, "");

  // ── llms.txt ─────────────────────────────────────────────────────────────
  if (type === "llms-txt") {
    try {
      const res = await fetch(`${base}/llms.txt`, {
        signal: AbortSignal.timeout(8000),
        headers: { "User-Agent": "Comly-Checker/1.0" },
      });
      if (!res.ok) return NextResponse.json({ exists: false });
      const content = await res.text();
      if (!content.trim() || content.trim().startsWith("<!")) {
        return NextResponse.json({ exists: false });
      }
      return NextResponse.json({ exists: true, content });
    } catch {
      return NextResponse.json({ exists: false });
    }
  }

  // ── comparison-pages ─────────────────────────────────────────────────────
  if (type === "comparison-pages") {
    const found: string[] = [];
    const apiKey = process.env.FIRECRAWL_API_KEY;

    if (apiKey) {
      try {
        const res = await fetch("https://api.firecrawl.dev/v1/map", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: base, limit: 500 }),
          signal: AbortSignal.timeout(15000),
        });
        if (res.ok) {
          const data = await res.json();
          const allUrls: string[] = data.links || [];
          found.push(...allUrls.filter((u) => COMPARISON_PATTERN.test(u)));
        }
      } catch { /* Firecrawl unavailable */ }
    }

    // Fallback: sitemap.xml
    if (found.length === 0) {
      try {
        const res = await fetch(`${base}/sitemap.xml`, {
          signal: AbortSignal.timeout(8000),
          headers: { "User-Agent": "Comly-Checker/1.0" },
        });
        if (res.ok) {
          const xml = await res.text();
          const locs = (xml.match(/<loc>([^<]+)<\/loc>/g) || []).map((m) =>
            m.replace(/<\/?loc>/g, "")
          );
          found.push(...locs.filter((u) => COMPARISON_PATTERN.test(u)));
        }
      } catch { /* sitemap unavailable */ }
    }

    return NextResponse.json({ urls: found });
  }

  return NextResponse.json({ exists: false, urls: [] });
}
