import { NextRequest, NextResponse } from "next/server";
import { BrandProfile } from "@/types";

export const maxDuration = 60;

interface SearchResult {
  url: string;
  title: string;
  description: string;
}

async function firecrawlSearch(query: string, limit = 5): Promise<SearchResult[]> {
  const res = await fetch("https://api.firecrawl.dev/v1/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
    },
    body: JSON.stringify({ query, limit }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) return [];
  const data = await res.json();
  if (!data.success || !Array.isArray(data.data)) return [];

  return data.data.map((r: { url?: string; title?: string; description?: string }) => ({
    url: r.url || "",
    title: r.title || "",
    description: r.description || "",
  })).filter((r: SearchResult) => r.url);
}

function domainFrom(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}

function categorize(url: string): "reddit" | "review" | "press" | "other" {
  const d = domainFrom(url);
  if (d.includes("reddit.com")) return "reddit";
  if (["g2.com", "producthunt.com", "capterra.com", "trustpilot.com", "getapp.com", "trustradius.com", "softwareadvice.com"].some(s => d.includes(s))) return "review";
  if (["techcrunch.com", "forbes.com", "wired.com", "venturebeat.com", "indiehackers.com", "ycombinator.com", "theVerge.com", "zdnet.com", "cnet.com"].some(s => d.includes(s))) return "press";
  return "other";
}

export async function POST(req: NextRequest) {
  try {
    const { profile }: { profile: BrandProfile } = await req.json();

    if (!profile?.brand_name) {
      return NextResponse.json({ error: "Missing brand profile" }, { status: 400 });
    }

    const nameQuoted = `"${profile.brand_name}"`;

    const [redditResults, reviewResults, pressResults] = await Promise.allSettled([
      firecrawlSearch(`${nameQuoted} reddit`, 5),
      firecrawlSearch(`${nameQuoted} ${profile.category} review`, 5),
      firecrawlSearch(`${nameQuoted} ${profile.category}`, 5),
    ]);

    const reddit  = redditResults.status  === "fulfilled" ? redditResults.value  : [];
    const reviews = reviewResults.status  === "fulfilled" ? reviewResults.value  : [];
    const press   = pressResults.status   === "fulfilled" ? pressResults.value   : [];

    const allResults = [...reddit, ...reviews, ...press]
      .filter((r, i, arr) => arr.findIndex(x => x.url === r.url) === i)
      .map(r => ({
        ...r,
        domain: domainFrom(r.url),
        category: categorize(r.url),
      }));

    return NextResponse.json({ sources: allResults });
  } catch (err) {
    console.error("Brand sources error:", err);
    return NextResponse.json({ error: "Search failed. Please try again." }, { status: 500 });
  }
}
