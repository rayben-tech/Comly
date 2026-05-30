import { NextRequest, NextResponse } from "next/server";
import { BrandProfile } from "@/types";
import { openai } from "@/lib/openai";

export const maxDuration = 45;

interface Thread {
  id: string;
  subreddit: string;
  title: string;
  url: string;
  upvotes?: number;
  comments?: number;
  age?: string;
}

// ─── Reddit direct API (primary) ─────────────────────────────────────────────

interface RedditPost {
  id: string;
  subreddit: string;
  title: string;
  permalink: string;
  num_comments: number;
  score: number;
  created_utc: number;
  is_self: boolean;
}

function opportunityScore(created_utc: number, num_comments: number, now: number): number {
  const ageHours = (now - created_utc) / 3600;
  const recency = Math.max(0, 1 - ageHours / (14 * 24)); // 1 = today, 0 = 14d ago
  const commentScore = 1 / (num_comments + 1);            // fewer comments = higher
  return recency * commentScore * 100;
}

async function searchRedditDirect(query: string): Promise<Thread[]> {
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=new&t=month&limit=25`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Comly/1.0 (AI visibility tool; contact: hello@trycomly.com)" },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`Reddit API ${res.status}`);

  const data = await res.json();
  const posts: RedditPost[] = (data?.data?.children ?? []).map((c: { data: RedditPost }) => c.data);
  const now = Date.now() / 1000;
  const fourteenDaysAgo = now - 14 * 24 * 60 * 60;

  function ageLabel(created_utc: number): string {
    const hours = (now - created_utc) / 3600;
    if (hours < 1)  return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Math.round(hours)}h`;
    return `${Math.round(hours / 24)}d`;
  }

  return posts
    .filter((p) =>
      p.created_utc > fourteenDaysAgo &&
      p.num_comments >= 3 &&
      p.num_comments <= 60 &&
      p.score >= 1
    )
    .map((p) => ({
      id: p.id,
      subreddit: `r/${p.subreddit}`,
      title: p.title,
      url: `https://www.reddit.com${p.permalink}`,
      upvotes: p.score,
      comments: p.num_comments,
      age: ageLabel(p.created_utc),
      _score: opportunityScore(p.created_utc, p.num_comments, now),
    }))
    .sort((a, b) => b._score - a._score)
    .map(({ _score: _s, ...t }) => t) as Thread[];
}

// ─── Serper fallback (no filtering) ──────────────────────────────────────────

interface SerperResult {
  title?: string;
  link?: string;
}

async function searchRedditViaSerper(query: string, apiKey: string): Promise<Thread[]> {
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ q: `site:reddit.com ${query}`, num: 10 }),
  });

  if (!res.ok) return [];

  const data = await res.json();
  const items: SerperResult[] = data.organic ?? [];

  return items
    .filter((item) => (item.link ?? "").includes("reddit.com/r/") && item.title)
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

// ─── Query generation ─────────────────────────────────────────────────────────

async function getQueries(profile: BrandProfile): Promise<string[]> {
  const prompt = `You are helping find Reddit threads where potential users of a product are discussing problems it solves.

Product: ${profile.brand_name}
Description: ${profile.description}
Category: ${profile.category}
Target users: ${profile.target_users}
Competitors: ${(profile.competitors ?? []).join(", ")}

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

  try {
    const parsed = JSON.parse(res.choices[0].message.content ?? "{}");
    return Array.isArray(parsed.queries) ? parsed.queries.slice(0, 8) : [];
  } catch {
    return [];
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { profile }: { profile: BrandProfile } = await req.json();
    const queries = await getQueries(profile);
    if (queries.length === 0) return NextResponse.json({ threads: [] });

    console.log("[reddit] queries:", queries);

    // ── Primary: Reddit direct API ──
    let usedFallback = false;
    let threads: Thread[] = [];

    try {
      const results = await Promise.allSettled(queries.map(searchRedditDirect));
      const all: Thread[] = [];
      for (const r of results) {
        if (r.status === "fulfilled") all.push(...r.value);
      }

      // Deduplicate by URL
      const seen = new Set<string>();
      for (const t of all) {
        if (!seen.has(t.url)) { seen.add(t.url); threads.push(t); }
      }

      console.log(`[reddit] direct API: ${threads.length} threads after filtering`);
    } catch (e) {
      console.warn("[reddit] direct API failed, will use Serper fallback:", e);
    }

    // ── Fallback: Serper (if Reddit returned nothing) ──
    if (threads.length === 0) {
      usedFallback = true;
      const apiKey = process.env.SERPER_API_KEY;

      if (apiKey) {
        const results = await Promise.allSettled(queries.map((q) => searchRedditViaSerper(q, apiKey)));
        const all: Thread[] = [];
        for (const r of results) {
          if (r.status === "fulfilled") all.push(...r.value);
        }

        const seen = new Set<string>();
        for (const t of all) {
          if (!seen.has(t.url)) { seen.add(t.url); threads.push(t); }
        }

        console.log(`[reddit] Serper fallback: ${threads.length} threads`);
      } else {
        console.warn("[reddit] SERPER_API_KEY not set, no fallback available");
      }
    }

    console.log(`[reddit] returning ${Math.min(threads.length, 25)} threads (fallback=${usedFallback})`);
    return NextResponse.json({ threads: threads.slice(0, 25) });
  } catch (e) {
    console.error("[reddit] top-level error:", e);
    return NextResponse.json({ threads: [] });
  }
}
