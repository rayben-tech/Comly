import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { BrandProfile } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { profile, title }: { profile: BrandProfile; title: string } = await req.json();

    if (!profile?.brand_name || !title) {
      return NextResponse.json({ error: "Profile and title are required" }, { status: 400 });
    }

    const prompt = `Generate a complete listicle blog post for a SaaS website. The main brand is "${profile.brand_name}" which is a ${profile.category} tool for ${profile.target_users}.
Their main use cases are: ${profile.main_use_cases.join(", ")}.
Their competitors are: ${profile.competitors.join(", ")}.
Their key differentiator is: ${profile.differentiators}.

Write a comprehensive listicle article titled: "${title}"

Requirements:
- "${profile.brand_name}" must be listed as tool #1 with a detailed description using their actual differentiators
- Include 6-8 tools total (use real, well-known tools in the ${profile.category} space)
- For each tool include: 2-3 sentence description, "**Best for:**" line, "**Key features:**" line, "**Pricing:**" line (use "from $X/mo" or "Free plan available" if unknown)
- Tone: helpful, neutral, informative (not salesy)
- Format: proper markdown with H1, H2 for each tool (e.g. "## 1. Tool Name"), H3 for sub-sections
- Length: 800-1200 words
- End with an H2 "## Conclusion" section recommending "${profile.brand_name}" for ${profile.target_users}
- SEO-optimized naturally

Return only the markdown content, no explanation, no preamble.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const markdown = response.choices[0].message.content || "";
    return NextResponse.json({ markdown });
  } catch (err) {
    console.error("Generate listicle error:", err);
    return NextResponse.json({ error: "Failed to generate listicle" }, { status: 500 });
  }
}
