import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const {
      brand_name, description, category, target_users,
      use_cases, differentiators, competitors,
      pricing, url, blog_url, docs_url, twitter_url,
    } = await req.json();

    if (!brand_name) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    }

    const prompt = `Generate a complete llms.txt file for a SaaS website. This file follows the llms.txt standard and helps AI models understand the product.

Brand details:
- Name: ${brand_name}
- Description: ${description || "Not provided"}
- Category: ${category}
- Target users: ${target_users}
- Use cases: ${Array.isArray(use_cases) ? use_cases.join(", ") : use_cases}
- Key features: ${Array.isArray(differentiators) ? differentiators.join(", ") : differentiators}
- Competitors: ${Array.isArray(competitors) ? competitors.join(", ") : competitors}
- Pricing: ${pricing || "Not provided"}
- URL: ${url || "Not provided"}
${blog_url ? `- Blog: ${blog_url}` : ""}
${docs_url ? `- Docs: ${docs_url}` : ""}
${twitter_url ? `- Twitter: ${twitter_url}` : ""}

Requirements:
- Follow the official llms.txt format
- Use markdown formatting
- Be concise but comprehensive
- Include all sections: product description, use cases, target audience, features, competitors, pricing, links
- Write in third person
- Tone: clear, factual, professional
- Max 500 words

Return only the llms.txt content. No explanation, no preamble, just the file content.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content || "";
    return NextResponse.json({ content });
  } catch (err) {
    console.error("Generate llms.txt error:", err);
    return NextResponse.json({ error: "Failed to generate llms.txt" }, { status: 500 });
  }
}
