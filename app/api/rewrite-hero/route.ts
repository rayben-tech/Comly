import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export const maxDuration = 60;

async function scrapePage(url: string, apiKey?: string, charLimit = 2500): Promise<string | null> {
  if (apiKey) {
    try {
      const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
        signal: AbortSignal.timeout(12000),
      });
      if (res.ok) {
        const data = await res.json();
        const md = data?.data?.markdown;
        if (data.success && md && md.trim().length > 100) return md.slice(0, charLimit);
      }
    } catch { /* fall through to HTML fallback */ }
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z]+;/gi, " ")
      .replace(/\s{2,}/g, " ")
      .trim()
      .slice(0, charLimit);
    return text.length > 100 ? text : null;
  } catch {
    return null;
  }
}

async function scrapeWebsiteContext(base: string, apiKey?: string): Promise<string> {
  const pagesToScrape: Array<{ label: string; urls: string[] }> = [
    { label: "Homepage",      urls: [base] },
    { label: "About page",    urls: [`${base}/about`, `${base}/about-us`] },
    { label: "Features page", urls: [`${base}/features`, `${base}/product`] },
    { label: "Pricing page",  urls: [`${base}/pricing`, `${base}/plans`] },
  ];

  const results = await Promise.allSettled(
    pagesToScrape.map(async ({ label, urls }) => {
      for (const url of urls) {
        const content = await scrapePage(url, apiKey, label === "Homepage" ? 3000 : 2500);
        if (content) return { label, content };
      }
      return null;
    })
  );

  const sections: string[] = [];
  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      sections.push(`### ${result.value.label}\n${result.value.content}`);
    }
  }

  return sections.length > 0
    ? `## Website content\n\n${sections.join("\n\n")}`
    : "";
}

export async function POST(req: NextRequest) {
  try {
    const {
      h1, subheadline,
      brand_name, category, target_users,
      use_cases, differentiators, competitors, url,
    } = await req.json();

    const useCaseStr = Array.isArray(use_cases) ? use_cases.join(", ") : use_cases || "";
    const compStr = Array.isArray(competitors) ? competitors.join(", ") : competitors || "";

    const base = url ? (url.startsWith("http") ? url : `https://${url}`).replace(/\/$/, "") : "";
    const apiKey = process.env.FIRECRAWL_API_KEY;

    const websiteContext = base ? await scrapeWebsiteContext(base, apiKey) : "";

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert SaaS copywriter specializing in AI/LLM-optimized content. You write clear, specific, category-driven copy that AI models can easily understand and cite.",
        },
        {
          role: "user",
          content: `Rewrite this SaaS hero copy to be fully optimized for AI/LLM readability and mentions.

Current copy:
H1: ${h1}
Subheadline: ${subheadline || "(none)"}

Brand details:
Name: ${brand_name}
Category: ${category}
Target users: ${target_users}
Use cases: ${useCaseStr}
Differentiators: ${differentiators || ""}
Competitors: ${compStr}
URL: ${url || ""}
${websiteContext ? `\n${websiteContext}` : ""}

Requirements:

H1 rules:
- Max 10 words
- Must include category + audience
- Format: "[What it does] for [Who]" — e.g. "AI visibility tracking for SaaS founders"
- No clever wordplay, no fluff
- Must match how buyers ask ChatGPT

Subheadline rules:
- Max 20 words
- One specific benefit or action
- No metaphors or vague claims
- Should complete the H1 story

TL;DR rules:
- 1-2 sentences, third person
- "[Brand] is a [category] tool that helps [target_users] [main_benefit]."
- Factual, clear, citable by AI

Meta description rules:
- 140-160 characters exactly
- Include: category, audience, main benefit
- End with a soft CTA

FAQ rules:
- 5 questions that mirror real ChatGPT queries buyers actually type
- Answers: clear, factual, 2-3 sentences each
- Cover: what/who/how/vs competitor/pricing

Return valid JSON only:
{
  "h1": "string",
  "subheadline": "string",
  "tldr": "string",
  "meta_description": "string",
  "faqs": [
    { "question": "string", "answer": "string" }
  ]
}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: 1500,
    });

    const data = JSON.parse(response.choices[0].message.content!);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to rewrite" },
      { status: 500 }
    );
  }
}
