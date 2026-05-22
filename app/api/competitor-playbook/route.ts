import { NextRequest, NextResponse } from "next/server";
import { BrandProfile, CompetitorRanking } from "@/types";

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
  if (["g2.com", "producthunt.com", "capterra.com", "trustpilot.com", "getapp.com", "trustradius.com"].some(s => d.includes(s))) return "review";
  if (["techcrunch.com", "forbes.com", "wired.com", "venturebeat.com", "indiehackers.com", "hackernews", "ycombinator.com"].some(s => d.includes(s))) return "press";
  return "other";
}

export async function POST(req: NextRequest) {
  try {
    const { competitors, profile }: {
      competitors: CompetitorRanking[];
      profile: BrandProfile;
    } = await req.json();

    if (!competitors?.length || !profile?.brand_name) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 });
    }

    const top3 = competitors.slice(0, 3);

    // 2 searches per competitor: Reddit/community + reviews/listings
    const results = await Promise.all(
      top3.map(async (comp) => {
        // Quote the name to avoid generic-word pollution (e.g. "Between" returns CRM results without quotes)
        // Include category in both queries to anchor the context
        const nameQuoted = `"${comp.name}"`;

        const [communityResults, reviewResults] = await Promise.allSettled([
          firecrawlSearch(`${nameQuoted} ${profile.category} reddit`, 5),
          firecrawlSearch(`${nameQuoted} ${profile.category} review app listing`, 5),
        ]);

        const community = communityResults.status === "fulfilled" ? communityResults.value : [];
        const reviews = reviewResults.status === "fulfilled" ? reviewResults.value : [];

        const allResults = [...community, ...reviews]
          .filter((r, i, arr) => arr.findIndex(x => x.url === r.url) === i) // dedupe
          .map(r => ({
            ...r,
            domain: domainFrom(r.url),
            category: categorize(r.url),
          }));

        return {
          name: comp.name,
          domain: comp.domain,
          mentions: comp.mentions,
          results: allResults,
        };
      })
    );

    return NextResponse.json({ competitors: results });
  } catch (err) {
    console.error("Competitor playbook error:", err);
    return NextResponse.json({ error: "Search failed. Please try again." }, { status: 500 });
  }
}
