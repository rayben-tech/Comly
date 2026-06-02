import { NextRequest, NextResponse } from "next/server";

const FALLBACK = "#5B2D91";

function isUsableColor(hex: string): boolean {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  // reject near-white, near-black, or near-gray (saturated colors only)
  if (luma > 210 || luma < 20) return false;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max - min < 30) return false; // too gray / unsaturated
  return true;
}

function normalizeHex(raw: string): string | null {
  const s = raw.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(s)) return s;
  if (/^#[0-9a-fA-F]{3}$/.test(s)) {
    return "#" + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
  }
  return null;
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ color: FALLBACK });

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Comlybot/1.0)" },
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 86400 },
    });

    const html = await res.text();

    // Try <meta name="theme-color" content="..."> in either attribute order
    const patterns = [
      /<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']theme-color["']/i,
    ];

    for (const re of patterns) {
      const m = html.match(re);
      if (m) {
        const hex = normalizeHex(m[1]);
        if (hex && isUsableColor(hex)) {
          return NextResponse.json({ color: hex });
        }
      }
    }
  } catch {
    // network error or timeout — fall through to default
  }

  return NextResponse.json({ color: FALLBACK });
}
