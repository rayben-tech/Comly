import { NextRequest, NextResponse } from "next/server";
import { BrandProfile } from "@/types";
import { openai } from "@/lib/openai";

export const maxDuration = 45;

function timeAgo(utc: number): string {
  const diff = Date.now() / 1000 - utc;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

async function getSearchConfig(profile: BrandProfile): Promise<{ subreddits: string[]; queries: string[] }> {
  const prompt = `You are helping find Reddit threads where potential users of a product are discussing problems it solves.

Product: ${profile.brand_name}
Description: ${profile.description}
Category: ${profile.category}
Target users: ${profile.target_users}
Competitors: ${profile.competitors.join(", ")}

Return a JSON object with:
- "subreddits": array of 4-6 subreddit names (no "r/" prefix) where the TARGET USERS of this product hang out and discuss related problems. Think about WHO uses this product and WHERE they talk online — not about the product category itself.
- "queries": array of 3 search queries that would find threads where people are discussing the exact problems this product solves. Be specific to the pain points, not the product name.

Example for a couples relationship app: subreddits like ["relationships", "relationship_advice", "marriage", "dating_advice", "ADHD_partners"] and queries like ["staying connected with partner busy life", "forgetting important things relationship", "relationship check in routine"].

Return ONLY valid JSON, no explanation.`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    max_tokens: 300,
  });

  const parsed = JSON.parse(res.choices[0].message.content ?? "{}");
  return {
    subreddits: Array.isArray(parsed.subreddits) ? parsed.subreddits.slice(0, 6) : [],
    queries: Array.isArray(parsed.queries) ? parsed.queries.slice(0, 3) : [],
  };
}

export async function POST(req: NextRequest) {
  try {
    const { profile }: { profile: BrandProfile } = await req.json();

    const { subreddits, queries } = await getSearchConfig(profile);

    if (subreddits.length === 0 || queries.length === 0) {
      return NextResponse.json({ threads: [] });
    }

    const subredditStr = subreddits.join("+");
    const allPosts: unknown[] = [];

    for (const query of queries) {
      try {
        // Search all of Reddit — subreddits used as soft context in query
        const subredditHint = subreddits.slice(0, 3).map(s => `subreddit:${s}`).join(" OR ");
        const fullQuery = `(${subredditHint}) ${query}`;
        const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(fullQuery)}&sort=relevance&t=year&limit=15`;
        const res = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Comly/1.0; +https://comly.app)",
            "Accept": "application/json",
          },
        });
        console.log(`[reddit] ${res.status} for query: ${query}`);
        if (!res.ok) {
          console.warn(`[reddit] failed body:`, await res.text().catch(() => ""));
          // Fallback: try without subreddit filter
          const fallbackUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&t=year&limit=10`;
          const fallback = await fetch(fallbackUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; Comly/1.0; +https://comly.app)",
              "Accept": "application/json",
            },
          });
          if (!fallback.ok) continue;
          const fd = await fallback.json();
          allPosts.push(...(fd?.data?.children ?? []));
          continue;
        }
        const data = await res.json();
        allPosts.push(...(data?.data?.children ?? []));
      } catch (e) {
        console.error(`[reddit] exception:`, e);
        continue;
      }
    }

    const seen = new Set<string>();
    const threads = [];

    for (const post of allPosts) {
      const p = (post as { data: Record<string, unknown> }).data;
      const id = p.id as string;
      if (seen.has(id)) continue;
      seen.add(id);

      threads.push({
        id,
        subreddit: `r/${p.subreddit as string}`,
        title: p.title as string,
        url: `https://reddit.com${p.permalink as string}`,
        upvotes: p.ups as number,
        comments: p.num_comments as number,
        age: timeAgo(p.created_utc as number),
      });
    }

    threads.sort((a, b) => b.upvotes - a.upvotes);
    return NextResponse.json({ threads: threads.slice(0, 10) });
  } catch {
    return NextResponse.json({ threads: [] });
  }
}
