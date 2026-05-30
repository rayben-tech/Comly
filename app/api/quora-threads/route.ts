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
Competitors: ${(profile.competitors ?? []).join(", ")}

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

  try {
    const parsed = JSON.parse(res.choices[0].message.content ?? "{}");
    return Array.isArray(parsed.queries) ? parsed.queries.slice(0, 4) : [];
  } catch {
    return [];
  }
}

async function generateFallbackQuestions(profile: BrandProfile): Promise<Array<{ title: string; url: string }>> {
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `Generate 8 realistic Quora questions that potential users of "${profile.brand_name}" (${profile.category}, for ${profile.target_users}) would ask. Focus on pain points and problems the product solves — not the product name itself.

Return JSON: { "questions": ["question 1", "question 2", ...] }
Make them natural Quora-style questions, 8-15 words each.`,
      }],
      response_format: { type: "json_object" },
      max_tokens: 300,
    });
    const parsed = JSON.parse(res.choices[0].message.content ?? "{}");
    const questions: string[] = Array.isArray(parsed.questions) ? parsed.questions.slice(0, 8) : [];
    return questions.map(q => ({
      title: q,
      url: `https://www.quora.com/search?q=${encodeURIComponent(q)}`,
    }));
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const { profile }: { profile: BrandProfile } = await req.json();

    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      console.warn("[quora] FIRECRAWL_API_KEY is not set");
      const fallback = await generateFallbackQuestions(profile);
      return NextResponse.json({
        threads: fallback.map(f => ({
          id: Buffer.from(f.url).toString("base64").slice(-24),
          title: f.title,
          url: f.url,
        })),
      });
    }

    const queries = await getQueries(profile);
    console.log("[quora] queries:", queries);
    if (queries.length === 0) {
      const fallback = await generateFallbackQuestions(profile);
      return NextResponse.json({
        threads: fallback.map(f => ({
          id: Buffer.from(f.url).toString("base64").slice(-24),
          title: f.title,
          url: f.url,
        })),
      });
    }

    // Run all searches in parallel to stay under Hobby 10s limit
    const searchResults = await Promise.allSettled(
      queries.map(q => searchQuora(q, apiKey).catch(() => []))
    );

    const allResults: Array<{ title: string; url: string }> = [];
    searchResults.forEach((r, i) => {
      if (r.status === "fulfilled") {
        console.log(`[quora] "${queries[i]}" → ${r.value.length} results`);
        allResults.push(...r.value);
      }
    });

    const seen = new Set<string>();
    const threads = [];

    for (const result of allResults) {
      if (seen.has(result.url)) continue;
      seen.add(result.url);
      threads.push({
        id: Buffer.from(result.url).toString("base64").slice(-24),
        title: result.title,
        url: result.url,
      });
    }

    // Quora restricts crawling so Firecrawl often returns nothing — fall back to AI-generated questions
    if (threads.length === 0) {
      console.log("[quora] no real results, using AI fallback");
      const fallback = await generateFallbackQuestions(profile);
      return NextResponse.json({
        threads: fallback.map(f => ({
          id: Buffer.from(f.url).toString("base64").slice(-24),
          title: f.title,
          url: f.url,
        })),
      });
    }

    return NextResponse.json({ threads: threads.slice(0, 10) });
  } catch {
    return NextResponse.json({ threads: [] });
  }
}
