import { NextRequest, NextResponse } from "next/server";
import { BrandProfile } from "@/types";
import { openai } from "@/lib/openai";

export const maxDuration = 45;

interface FirecrawlSearchResult {
  url?: string;
  title?: string;
  description?: string;
}

async function searchReddit(
  query: string,
  apiKey: string
): Promise<Array<{ id: string; subreddit: string; title: string; url: string }>> {
  const response = await fetch("https://api.firecrawl.dev/v1/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query: `site:reddit.com ${query}`,
      limit: 5,
      lang: "en",
    }),
  });

  if (!response.ok) return [];
  const data = await response.json();
  if (!data.success || !Array.isArray(data.data)) return [];

  return (data.data as FirecrawlSearchResult[])
    .filter((r) => {
      const url = r.url || "";
      const title = (r.title || "").trim();
      if (!url.includes("reddit.com/r/")) return false;
      if (!url.includes("/comments/")) return false;
      if (title.length < 5) return false;
      return true;
    })
    .map((r) => {
      const url = (r.url || "").split("?")[0].split("#")[0];
      const subredditMatch = url.match(/reddit\.com\/r\/([^/]+)/);
      const subreddit = subredditMatch ? `r/${subredditMatch[1]}` : "r/reddit";
      const idMatch = url.match(/\/comments\/([a-z0-9]+)/);
      const id = idMatch ? idMatch[1] : Buffer.from(url).toString("base64").slice(0, 10);
      const title = (r.title || "").replace(/ : r\/\w+$/i, "").replace(/ - Reddit$/i, "").trim();
      return { id, subreddit, title, url };
    });
}

async function getQueries(profile: BrandProfile): Promise<string[]> {
  const prompt = `You are helping find Reddit threads where potential users of a product are discussing problems it solves.

Product: ${profile.brand_name}
Description: ${profile.description}
Category: ${profile.category}
Target users: ${profile.target_users}
Competitors: ${profile.competitors.join(", ")}

Return a JSON object with:
- "queries": array of 5 short search queries (3-6 words each) that would surface real Reddit threads from people who need this product. Focus on pain points and problems the product solves, not the product name or brand.

Example for a project management tool: ["manage remote team tasks", "track project deadlines team", "organize work across departments", "team productivity bottlenecks", "best tools track sprints"]

Return ONLY valid JSON.`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    max_tokens: 200,
  });

  const parsed = JSON.parse(res.choices[0].message.content ?? "{}");
  return Array.isArray(parsed.queries) ? parsed.queries.slice(0, 5) : [];
}

export async function POST(req: NextRequest) {
  try {
    const { profile }: { profile: BrandProfile } = await req.json();

    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      console.warn("[reddit] FIRECRAWL_API_KEY is not set");
      return NextResponse.json({ threads: [] });
    }

    const queries = await getQueries(profile);
    console.log("[reddit] queries:", queries);
    if (queries.length === 0) return NextResponse.json({ threads: [] });

    const allResults: Array<{ id: string; subreddit: string; title: string; url: string }> = [];

    for (const query of queries) {
      try {
        const results = await searchReddit(query, apiKey);
        console.log(`[reddit] "${query}" → ${results.length} results`);
        allResults.push(...results);
      } catch (e) {
        console.error(`[reddit] exception for "${query}":`, e);
        continue;
      }
    }

    const seen = new Set<string>();
    const threads = [];

    for (const result of allResults) {
      if (seen.has(result.url)) continue;
      seen.add(result.url);
      threads.push(result);
    }

    console.log(`[reddit] total unique threads: ${threads.length}`);
    return NextResponse.json({ threads: threads.slice(0, 10) });
  } catch (e) {
    console.error("[reddit] top-level error:", e);
    return NextResponse.json({ threads: [] });
  }
}
