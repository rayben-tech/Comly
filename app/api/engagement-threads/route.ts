import { NextRequest, NextResponse } from "next/server";
import { BrandProfile } from "@/types";
import { openai } from "@/lib/openai";

export const maxDuration = 45;

interface SerperResult {
  title?: string;
  link?: string;
  snippet?: string;
}

async function searchRedditViaSerper(
  query: string,
  apiKey: string
): Promise<Array<{ id: string; subreddit: string; title: string; url: string }>> {
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: `site:reddit.com ${query}`,
      num: 10,
    }),
  });

  if (!res.ok) {
    console.error(`[reddit] Serper HTTP ${res.status} for: ${query}`);
    return [];
  }

  const data = await res.json();
  const items: SerperResult[] = data.organic ?? [];

  return items
    .filter((item) => {
      const url = item.link ?? "";
      return url.includes("reddit.com/r/") && item.title;
    })
    .map((item) => {
      const url = item.link!;
      const match = url.match(/reddit\.com\/(r\/[^/?#]+)/);
      const subreddit = match ? match[1] : "reddit";
      const parts = url.replace(/\/$/, "").split("/");
      const id = parts[parts.length - 1] || Math.random().toString(36).slice(2);
      return {
        id,
        subreddit,
        title: (item.title ?? "").replace(/ : r\/\w+$/i, "").replace(/ - Reddit$/i, "").trim(),
        url,
      };
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
- "queries": array of 8 Reddit search queries (4-8 words each). Mix these types:
  1. Pain point questions (2-3 queries) — problems the product solves
  2. Recommendation requests (2 queries) — "best tool for X", "looking for X software"
  3. Competitor comparisons (2 queries) — "vs", "alternative to", "switched from"
  4. Category/use-case (1-2 queries) — broad terms people in this space discuss

Do NOT include the product name. Write as natural phrases people actually post.

Example for a project management tool: ["struggling to keep remote team organized", "how track multiple projects simultaneously", "best project management tool small team", "looking for asana alternative", "notion vs clickup for teams", "switched from jira too complicated", "team productivity software recommendations", "manage client projects freelance"]

Return ONLY valid JSON.`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    max_tokens: 300,
  });

  const parsed = JSON.parse(res.choices[0].message.content ?? "{}");
  return Array.isArray(parsed.queries) ? parsed.queries.slice(0, 8) : [];
}

export async function POST(req: NextRequest) {
  try {
    const { profile }: { profile: BrandProfile } = await req.json();

    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
      console.warn("[reddit] SERPER_API_KEY not set");
      return NextResponse.json({ threads: [] });
    }

    const queries = await getQueries(profile);
    console.log("[reddit] queries:", queries);
    if (queries.length === 0) return NextResponse.json({ threads: [] });

    // Run all searches in parallel
    const results = await Promise.allSettled(
      queries.map((q) => searchRedditViaSerper(q, apiKey))
    );

    const allResults: Array<{ id: string; subreddit: string; title: string; url: string }> = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        console.log(`[reddit] query returned ${result.value.length} results`);
        allResults.push(...result.value);
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
    return NextResponse.json({ threads: threads.slice(0, 25) });
  } catch (e) {
    console.error("[reddit] top-level error:", e);
    return NextResponse.json({ threads: [] });
  }
}
