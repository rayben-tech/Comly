import { NextRequest, NextResponse } from "next/server";
import { BrandProfile } from "@/types";
import { openai } from "@/lib/openai";

export const maxDuration = 45;

interface RedditPost {
  id: string;
  subreddit: string;
  title: string;
  permalink: string;
  score: number;
  num_comments: number;
  url: string;
}

async function searchRedditNative(
  query: string
): Promise<Array<{ id: string; subreddit: string; title: string; url: string }>> {
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&type=link&limit=10&sort=relevance&t=year`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Comly/1.0 (AI visibility audit tool; contact hello@comly.ai)",
      "Accept": "application/json",
    },
  });

  if (!response.ok) return [];
  const data = await response.json();
  const children: { data: RedditPost }[] = data?.data?.children ?? [];

  return children
    .filter((child) => {
      const post = child.data;
      return post?.title?.length >= 10 && post?.subreddit && post?.permalink;
    })
    .map((child) => {
      const post = child.data;
      return {
        id: post.id,
        subreddit: `r/${post.subreddit}`,
        title: post.title.trim(),
        url: `https://www.reddit.com${post.permalink}`,
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
- "queries": array of 5 Reddit search queries (4-8 words each) that would surface real Reddit threads from people who need this product. Focus on pain points and problems the product solves. Write queries as natural phrases or questions people would actually post about. Do NOT include the product name.

Example for a project management tool: ["how do you track tasks across remote teams", "best way to manage project deadlines", "team productivity tools recommendations", "organize work across multiple departments", "struggling to keep sprints on track"]

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

    const queries = await getQueries(profile);
    console.log("[reddit] queries:", queries);
    if (queries.length === 0) return NextResponse.json({ threads: [] });

    // Run all searches in parallel
    const results = await Promise.allSettled(
      queries.map((q) => searchRedditNative(q))
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
    return NextResponse.json({ threads: threads.slice(0, 15) });
  } catch (e) {
    console.error("[reddit] top-level error:", e);
    return NextResponse.json({ threads: [] });
  }
}
