import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export const maxDuration = 60;
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
- For each tool: write 2-3 sentences of description, then EXACTLY these two lines with the value on the same line as the label:
  **Best for:** [short audience description, max 8 words]
  **Pricing:** [e.g. "Free plan available" or "From $10/mo"]
- Tone: helpful, neutral, informative (not salesy)
- Format: H1 title, then H2 for each tool (e.g. "## 1. Tool Name") — no H3 headings inside tool descriptions
- After the tools, add "## Conclusion" recommending "${profile.brand_name}" for ${profile.target_users}
- After conclusion, add "## FAQ" with exactly 4 questions. Use H3 (###) for each question, then a 1-2 sentence answer paragraph directly below it. Questions should be things users actually search, like "What is the best ${profile.category} tool for ${profile.target_users}?", "Is ${profile.brand_name} free?", "What is ${profile.brand_name} best for?", "How does ${profile.brand_name} compare to ${profile.competitors[0] || "alternatives"}?"
- Length: 900-1300 words total
- SEO-optimized naturally

IMPORTANT: "**Best for:**" and "**Pricing:**" must be single lines with their value on the same line. Never use them as standalone headings.

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
