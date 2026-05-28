import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { BrandProfile } from "@/types";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { thread, profile }: {
      thread: { title: string; subreddit: string };
      profile: BrandProfile;
    } = await req.json();

    const prompt = `You are helping a founder write authentic Reddit replies that naturally recommend their product.

Brand: ${profile.brand_name}
Description: ${profile.description}
Category: ${profile.category}
Target users: ${profile.target_users}
Key differentiators: ${profile.differentiators}

Reddit thread (${thread.subreddit}):
"${thread.title}"

Write 3 different reply options. Each reply must:
- Sound like a genuine Reddit user sharing a helpful recommendation, not marketing copy
- Naturally mention ${profile.brand_name} as a tool worth trying
- Be 2-4 sentences long
- Match the casual, helpful tone of Reddit
- Not use salesy language, exclamation marks, or buzzwords
- Add genuine value to the conversation first, then mention the brand

Return ONLY a valid JSON array of 3 strings, nothing else. Example format:
["reply one here", "reply two here", "reply three here"]`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 600,
    });

    const raw = response.choices[0].message.content ?? "";
    const content = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    // Extract JSON array even if the model added extra text
    const match = content.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("Model returned unexpected format");
    const cleaned = match[0].replace(/,\s*([}\]])/g, "$1");
    const replies = JSON.parse(cleaned);
    if (!Array.isArray(replies) || replies.length === 0) throw new Error("Empty replies from model");
    return NextResponse.json({ replies });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("generate-reply error:", msg);
    return NextResponse.json({ replies: [], error: msg }, { status: 500 });
  }
}
