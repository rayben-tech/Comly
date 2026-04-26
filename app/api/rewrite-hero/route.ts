import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const {
      h1, subheadline,
      brand_name, category, target_users,
      use_cases, differentiators, competitors, url,
    } = await req.json();

    const useCaseStr = Array.isArray(use_cases) ? use_cases.join(", ") : use_cases || "";
    const compStr = Array.isArray(competitors) ? competitors.join(", ") : competitors || "";

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
