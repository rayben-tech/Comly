import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 60;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const {
      brand_name, description, category, target_users,
      use_cases, differentiators, competitors, pricing,
      competitor, page_type,
    } = await req.json();

    const year = new Date().getFullYear();
    const month = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const useCaseStr = Array.isArray(use_cases) ? use_cases.join(", ") : use_cases || "";
    const compStr = Array.isArray(competitors) ? competitors.join(", ") : competitors || "";

    let userPrompt = "";

    if (page_type === "vs") {
      userPrompt = `Write a complete, detailed comparison page for a SaaS website comparing ${brand_name} vs ${competitor}.

Brand details:
- Name: ${brand_name}
- Description: ${description}
- Category: ${category}
- Target users: ${target_users}
- Key differentiators: ${differentiators || ""}
- Use cases: ${useCaseStr}
- Pricing: ${pricing || ""}
- Other competitors: ${compStr}

Write the full page in this exact markdown format:

# ${brand_name} vs ${competitor}: Which is better for ${target_users}?

*Last updated: ${month}*

[2-3 sentence intro about choosing between these two tools for ${target_users}]

## Quick verdict
[1-2 sentences: when to choose ${brand_name} vs when to choose ${competitor}]

## Side-by-side comparison

| Feature | ${brand_name} | ${competitor} |
|---------|--------------|--------------|
[6-8 rows comparing key features — use ✓ and ✗ where appropriate]

## ${brand_name} overview
[2-3 paragraphs about ${brand_name} based on the brand details above]

## ${competitor} overview
[2-3 paragraphs about ${competitor} based on general knowledge]

## Where ${brand_name} wins
[3-5 bullet points]

## Where ${competitor} wins
[2-3 bullet points — be fair]

## Pricing comparison

### ${brand_name}
[List pricing tiers from brand details]

### ${competitor}
[List known pricing for ${competitor}]

## Who should choose ${brand_name}?
[1-2 paragraphs]

## Who should choose ${competitor}?
[1-2 paragraphs]

## Conclusion
[2-3 sentences recommending ${brand_name} for the target audience]

[Try ${brand_name} free →](https://your-site.com)

Write the complete page. Be specific, accurate, and persuasive. Favor ${brand_name} but remain fair and credible.`;
    } else {
      userPrompt = `Write a complete "best alternatives to ${competitor}" page for a SaaS website. The brand being promoted is ${brand_name}.

Brand details:
- Name: ${brand_name}
- Description: ${description}
- Category: ${category}
- Target users: ${target_users}
- Key differentiators: ${differentiators || ""}
- Use cases: ${useCaseStr}
- Pricing: ${pricing || ""}
- Other known competitors: ${compStr}

Write the full page in this exact markdown format:

# Best ${competitor} Alternatives in ${year} (Free & Paid)

*Last updated: ${month}*

[2-3 sentence intro about why people look for ${competitor} alternatives]

## Why look for ${competitor} alternatives?
[3-5 bullet points of common reasons buyers switch from ${competitor}]

## The best ${competitor} alternatives

### 1. ${brand_name} — Best overall alternative
[2-3 paragraphs positioning ${brand_name} as the top choice. Highlight key differentiators.]

**Best for:** ${target_users}
**Pricing:** [from brand pricing details]
**Key advantage over ${competitor}:** [main differentiator]

### 2. [Second alternative — use a real competitor from the list or a well-known tool in ${category}]
[1-2 paragraphs]

### 3. [Third alternative]
[1-2 paragraphs]

## Comparison table

| Tool | Best for | Free plan | Starting price |
|------|----------|-----------|----------------|
[4-5 rows including ${brand_name} as row 1]

## How to choose the right ${competitor} alternative
[2-3 paragraphs with a decision framework]

## Conclusion
[2-3 sentences recommending ${brand_name} as the top alternative]

[Try ${brand_name} free →](https://your-site.com)

Write the complete page. Position ${brand_name} as #1. Be persuasive, specific, and credible.`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert SaaS content writer specializing in comparison pages that rank in both Google and AI search engines. Write complete, detailed comparison pages that are helpful to buyers and optimized for AI citations. Follow the provided format exactly.",
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content || "";
    return NextResponse.json({ content });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate comparison" },
      { status: 500 }
    );
  }
}
