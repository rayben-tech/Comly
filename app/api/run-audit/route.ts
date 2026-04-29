import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export const maxDuration = 60;
import { generateAuditPrompts } from "@/lib/generate-prompts";
import { calculateScore, calculateCompetitorRankings } from "@/lib/score";
import { normalizeBrand } from "@/lib/brand-normalizations";
import { BrandProfile, PromptResult } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { profile }: { profile: BrandProfile } = await req.json();

    if (!profile?.brand_name) {
      return NextResponse.json({ error: "Brand profile is required" }, { status: 400 });
    }

    const prompts = generateAuditPrompts(profile);

    const systemPrompt = `You are a neutral AI assistant answering product discovery queries honestly. Your process for each query is strictly two steps:

STEP 1 — Write the response_text. Imagine a real user typed this query with zero context about any brand being audited. Answer exactly as you would to that user: natural, honest, comprehensive. For list questions name 8-12 genuinely relevant brands. Only include a brand if it would naturally appear in an honest, unbiased answer. Do NOT let the audit context influence what you write.

STEP 2 — After writing the response, analyze what you actually wrote:
- mentioned: is "${profile.brand_name}" present in the response_text you just wrote? (boolean — look at your actual text)
- position: if mentioned, what rank/position (1 = first brand named) — else null
- competitors_mentioned: every real software brand you named, each with their correct primary domain and their position in the response (1 = first brand named, 2 = second, etc.)
- sources: 3-5 real domains an AI would cite for this query type — review sites, forums, publications. Format: { domain, title }

Critical rules:
- response_text is ground truth — mentioned/position must reflect what is actually in it, not what you wish were in it
- If "${profile.brand_name}" is not widely known or would not naturally appear in an honest answer, do not force it in
- Use only real, existing brands and correct primary domains
- Use current brand names and domains: "Bard" is now "Gemini" at gemini.google.com (not gemini.com which is a crypto exchange), "Bing Chat" is now "Microsoft Copilot" at copilot.microsoft.com
- response_text must read as a natural AI answer, not a metadata description
- Return ONLY valid JSON`;

    const userPrompt = `Answer the ${prompts.length} queries below as a neutral AI would. Generate each response_text first (unbiased), then analyze it.

Brand context — for analysis only, do NOT let this bias your response_text:
  Brand: "${profile.brand_name}"
  Category: ${profile.category}
  Target users: ${profile.target_users}

Queries:
${prompts.map((p, i) => `${i + 1}. ${p}`).join("\n")}

Return a JSON object with a "results" array of exactly ${prompts.length} items:
{
  "results": [
    {
      "query": "exact query text",
      "response_text": "natural AI response here...",
      "mentioned": false,
      "position": null,
      "competitors_mentioned": [{ "name": "Brand A", "domain": "branda.com", "position": 1 }],
      "sources": [{ "domain": "g2.com", "title": "G2 Software Reviews" }]
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 8000,
    });

    const parsed = JSON.parse(response.choices[0].message.content!);

    if (!parsed.results || !Array.isArray(parsed.results)) {
      throw new Error("Invalid response format from AI");
    }

    const promptResults: PromptResult[] = parsed.results.map(
      (r: {
        query: string;
        response_text: string;
        mentioned: boolean;
        position: number | null;
        competitors_mentioned: ({ name: string; domain: string } | string)[];
      }) => ({
        prompt: r.query || "",
        response_text: r.response_text || "",
        mentioned: Boolean(r.mentioned),
        position: r.position ?? null,
        competitors_mentioned: Array.isArray(r.competitors_mentioned)
          ? r.competitors_mentioned.map((c) => {
              const raw = typeof c === "string"
                ? { name: c, domain: "", position: null }
                : { name: String(c.name || ""), domain: String(c.domain || ""), position: c.position ?? null };
              const normalized = normalizeBrand(raw.name, raw.domain);
              return { ...normalized, position: raw.position };
            })
          : [],
        sources: Array.isArray(r.sources)
          ? r.sources.map((s: { domain: string; title: string }) => ({
              domain: String(s.domain || ""),
              title: String(s.title || ""),
            }))
          : [],
      })
    );

    const score = calculateScore(promptResults);
    const competitor_rankings = calculateCompetitorRankings(promptResults, profile.brand_name);
    const total_mentions = promptResults.filter((r) => r.mentioned).length;

    return NextResponse.json({
      score,
      total_mentions,
      prompt_results: promptResults,
      competitor_rankings,
    });
  } catch (err) {
    console.error("Audit error:", err);
    return NextResponse.json(
      { error: "Failed to run audit. Please try again." },
      { status: 500 }
    );
  }
}
