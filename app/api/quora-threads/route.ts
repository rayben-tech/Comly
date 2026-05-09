import { NextRequest, NextResponse } from "next/server";
import { BrandProfile } from "@/types";
import { openai } from "@/lib/openai";

export const maxDuration = 45;

interface FirecrawlSearchResult {
  url?: string;
  title?: string;
  description?: string;
}

async function searchQuora(
  query: string,
  apiKey: string
): Promise<Array<{ title: string; url: string }>> {
  const response = await fetch("https://api.firecrawl.dev/v1/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query: `site:quora.com ${query}`,
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
      if (!url.startsWith("https://www.quora.com/")) return false;
      const path = url.replace("https://www.quora.com/", "");
      if (/^(about|policies|privacy|contact|help|legal|business|ads|tos|search|topic\/|profile\/|tag\/|q\/)/i.test(path)) return false;
      if (path.split("-").length < 3) return false;
      if (title.length < 10) return false;
      return true;
    })
    .map((r) => ({
      title: (r.title || "").replace(/ - Quora$/i, "").trim(),
      url: (r.url || "").split("?")[0].split("#")[0],
    }));
}

async function getQueries(profile: BrandProfile): Promise<string[]> {
  const prompt = `You are helping find Quora questions where potential users of a product are asking about problems it solves.

Product: ${profile.brand_name}
Description: ${profile.description}
Category: ${profile.category}
Target users: ${profile.target_users}
Competitors: ${profile.competitors.join(", ")}

Return a JSON object with:
- "queries": array of 4 short search queries (2-5 words each) that would surface real Quora questions from people who need this product. Focus on pain points and problems, not the product name.

Example for a project management tool: ["manage team tasks remotely", "track project deadlines", "organize work departments", "team productivity tips"]

Return ONLY valid JSON.`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    max_tokens: 200,
  });

  const parsed = JSON.parse(res.choices[0].message.content ?? "{}");
  return Array.isArray(parsed.queries) ? parsed.queries.slice(0, 4) : [];
}

export async function POST(req: NextRequest) {
  try {
    const { profile }: { profile: BrandProfile } = await req.json();

    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ threads: [] });
    }

    const queries = await getQueries(profile);
    if (queries.length === 0) return NextResponse.json({ threads: [] });

    const allResults: Array<{ title: string; url: string }> = [];

    for (const query of queries) {
      try {
        const results = await searchQuora(query, apiKey);
        allResults.push(...results);
      } catch {
        continue;
      }
    }

    const seen = new Set<string>();
    const threads = [];

    for (const result of allResults) {
      if (seen.has(result.url)) continue;
      seen.add(result.url);

      threads.push({
        id: Buffer.from(result.url).toString("base64").slice(0, 20),
        title: result.title,
        url: result.url,
      });
    }

    return NextResponse.json({ threads: threads.slice(0, 10) });
  } catch {
    return NextResponse.json({ threads: [] });
  }
}
