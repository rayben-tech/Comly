import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { BrandProfile } from "@/types";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { thread, profile }: {
      thread: { title: string };
      profile: BrandProfile;
    } = await req.json();

    const prompt = `You are helping a founder write a genuine, helpful Quora answer that naturally recommends their product.

Brand: ${profile.brand_name}
Description: ${profile.description}
Category: ${profile.category}
Target users: ${profile.target_users}
Key differentiators: ${profile.differentiators}

Quora question:
"${thread.title}"

Write 3 different answer options. Each answer must:
- Sound like a knowledgeable person sharing a genuine recommendation, not a marketer
- Start with actual useful advice or context that answers the question
- Naturally mention ${profile.brand_name} as a tool worth trying, but only after providing value
- Be 3-5 sentences long
- Use a helpful, informative Quora tone (not casual Reddit slang, not formal corporate speak)
- End with a genuine recommendation to try ${profile.brand_name}

Return ONLY a valid JSON array of 3 strings, nothing else. Example format:
["answer one here", "answer two here", "answer three here"]`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 700,
    });

    const raw = response.choices[0].message.content ?? "[]";
    const content = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    const replies = JSON.parse(content);
    return NextResponse.json({ replies });
  } catch (err) {
    console.error("generate-quora-reply error:", err);
    return NextResponse.json({ replies: [] });
  }
}
