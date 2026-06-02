import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt, buildUserPrompt, parseResults } from "@/lib/audit-runner";
import { openai } from "@/lib/openai";
import { BrandProfile } from "@/types";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { prompt, profile }: { prompt: string; profile: BrandProfile } = await req.json();
    if (!prompt?.trim() || !profile?.brand_name) {
      return NextResponse.json({ error: "Missing prompt or profile" }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: buildSystemPrompt(profile.brand_name) },
        { role: "user",   content: buildUserPrompt([prompt.trim()], profile) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 600,
    });

    const parsed = JSON.parse(response.choices[0].message.content!);
    const results = parseResults(parsed, profile.brand_name);
    if (!results[0]) throw new Error("No result returned from model");

    return NextResponse.json({ result: results[0] });
  } catch (err) {
    console.error("run-prompt error:", err);
    return NextResponse.json({ error: "Failed to run prompt. Please try again." }, { status: 500 });
  }
}
