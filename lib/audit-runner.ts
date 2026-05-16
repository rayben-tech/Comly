import { openai } from "@/lib/openai";
import { generateAuditPrompts, OPENAI_INDICES, GEMINI_INDICES } from "@/lib/generate-prompts";
import { calculateScore, calculateCompetitorRankings } from "@/lib/score";
import { normalizeBrand } from "@/lib/brand-normalizations";
import { BrandProfile, PromptResult } from "@/types";

export interface AuditResult {
  score: number;
  total_mentions: number;
  prompt_results: PromptResult[];
  competitor_rankings: ReturnType<typeof calculateCompetitorRankings>;
}

type RawResult = {
  query: string;
  response_text: string;
  mentioned: boolean;
  position: number | null;
  competitors_mentioned: ({ name: string; domain: string; position?: number } | string)[];
  sources?: { domain: string; title: string }[];
};

export function buildSystemPrompt(brandName: string): string {
  return `You are a neutral AI assistant answering product discovery queries honestly. Your process for each query is strictly two steps:

STEP 1 — Write the response_text. Imagine a real user typed this query with zero context about any brand being audited. Answer exactly as you would to that user: natural, honest. Keep response_text to 2-3 sentences maximum. For list questions name 4-6 genuinely relevant brands. Only include a brand if it would naturally appear in an honest, unbiased answer. Do NOT let the audit context influence what you write.

STEP 2 — After writing the response, analyze what you actually wrote:
- mentioned: is "${brandName}" present in the response_text you just wrote? (boolean — look at your actual text)
- position: if mentioned, what rank/position (1 = first brand named) — else null
- competitors_mentioned: every real software brand you named, each with their correct primary domain and their position in the response (1 = first brand named, 2 = second, etc.)
- sources: 2-3 real domains an AI would cite for this query type — review sites, forums, publications. Format: { domain, title }

Critical rules:
- response_text is ground truth — mentioned/position must reflect what is actually in it, not what you wish were in it
- If "${brandName}" is not widely known or would not naturally appear in an honest answer, do not force it in
- Use only real, existing brands and correct primary domains
- Use current brand names: "Bard" is now "Gemini" at gemini.google.com, "Bing Chat" is now "Microsoft Copilot" at copilot.microsoft.com
- response_text must read as a natural AI answer, not a metadata description
- Return ONLY valid JSON`;
}

export function buildUserPrompt(prompts: string[], profile: BrandProfile): string {
  return `Answer the ${prompts.length} queries below as a neutral AI would. Generate each response_text first (unbiased), then analyze it.

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
}

export function parseResults(parsed: { results: RawResult[] }, brandName: string): PromptResult[] {
  return parsed.results.map((r) => ({
    prompt: r.query || "",
    response_text: r.response_text || "",
    mentioned: Boolean(r.mentioned),
    position: r.position ?? null,
    competitors_mentioned: Array.isArray(r.competitors_mentioned)
      ? r.competitors_mentioned.map((c) => {
          const raw =
            typeof c === "string"
              ? { name: c, domain: "", position: null }
              : { name: String(c.name || ""), domain: String(c.domain || ""), position: (c as { position?: number }).position ?? null };
          const normalized = normalizeBrand(raw.name, raw.domain);
          return { ...normalized, position: raw.position };
        })
      : [],
    sources: Array.isArray(r.sources)
      ? r.sources.map((s) => ({ domain: String(s.domain || ""), title: String(s.title || "") }))
      : [],
  }));
}

export async function callGemini(prompt: string): Promise<{ results: RawResult[] }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no text");
  return JSON.parse(text);
}

export async function runAudit(profile: BrandProfile, customPrompts?: string[]): Promise<AuditResult> {
  const usingCustom = Array.isArray(customPrompts) && customPrompts.length > 0;
  let openaiPrompts: string[];
  let geminiPrompts: string[];

  if (usingCustom) {
    const splitIdx = Math.ceil(customPrompts!.length * 0.6);
    openaiPrompts = customPrompts!.slice(0, splitIdx);
    geminiPrompts = customPrompts!.slice(splitIdx);
  } else {
    const allPrompts = generateAuditPrompts(profile);
    openaiPrompts = OPENAI_INDICES.map((i) => allPrompts[i]);
    geminiPrompts = GEMINI_INDICES.map((i) => allPrompts[i]);
  }

  const systemPrompt = buildSystemPrompt(profile.brand_name);

  const [openaiResult, geminiResult] = await Promise.allSettled([
    openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: buildUserPrompt(openaiPrompts, profile) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 6000,
    }).then((r) => JSON.parse(r.choices[0].message.content!) as { results: RawResult[] }),

    callGemini(`${systemPrompt}\n\n${buildUserPrompt(geminiPrompts, profile)}`),
  ]);

  if (openaiResult.status === "rejected") throw openaiResult.reason;

  const openaiParsed = openaiResult.value;
  if (!Array.isArray(openaiParsed.results)) throw new Error("Invalid OpenAI response format");

  let geminiParsed: { results: RawResult[] };
  if (geminiResult.status === "rejected") {
    console.warn("Gemini failed, falling back to OpenAI:", geminiResult.reason);
    geminiParsed = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: buildUserPrompt(geminiPrompts, profile) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000,
    }).then((r) => JSON.parse(r.choices[0].message.content!) as { results: RawResult[] });
  } else {
    geminiParsed = geminiResult.value;
  }

  if (!Array.isArray(geminiParsed.results)) throw new Error("Invalid Gemini response format");

  const openaiResults = parseResults(openaiParsed, profile.brand_name);
  const geminiResults = parseResults(geminiParsed, profile.brand_name);

  let promptResults: PromptResult[];
  if (usingCustom) {
    promptResults = [...openaiResults, ...geminiResults];
  } else {
    promptResults = new Array(25);
    OPENAI_INDICES.forEach((idx, j) => { promptResults[idx] = openaiResults[j]; });
    GEMINI_INDICES.forEach((idx, j) => { promptResults[idx] = geminiResults[j]; });
  }

  const score = calculateScore(promptResults);
  const competitor_rankings = calculateCompetitorRankings(promptResults, profile.brand_name);
  const total_mentions = promptResults.filter((r) => r.mentioned).length;

  return { score, total_mentions, prompt_results: promptResults, competitor_rankings };
}
