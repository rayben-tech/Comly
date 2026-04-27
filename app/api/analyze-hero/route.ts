import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { h1, subheadline, category, target_users, use_cases } = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert in GEO (Generative Engine Optimization) and AI readability analysis.",
        },
        {
          role: "user",
          content: `Analyze this SaaS hero copy for AI/LLM readability.
Grade it on these 5 criteria (0-20 each):
1. Category clarity — does H1 clearly state what category the product is in?
2. Audience specificity — does the copy say who the product is for?
3. Use case clarity — is it clear what problem it solves?
4. LLM prompt alignment — does the copy match how buyers ask questions in ChatGPT?
5. Summary presence — is there a clear TL;DR or one-liner that AI can extract?

Hero copy:
H1: ${h1}
Subheadline: ${subheadline || "(none)"}

Brand context:
Category: ${category}
Target users: ${target_users}
Use cases: ${Array.isArray(use_cases) ? use_cases.join(", ") : use_cases || ""}

Return valid JSON only, no explanation:
{
  "scores": {
    "category_clarity": number,
    "audience_specificity": number,
    "use_case_clarity": number,
    "llm_alignment": number,
    "summary_presence": number
  },
  "total": number,
  "issues": ["specific issue 1", "specific issue 2"],
  "grade": "poor"
}

grade must be exactly "poor" (total 0-40), "average" (41-70), or "good" (71-100).
total must equal the sum of the 5 scores.
issues should be 3-5 concise, specific problems found (e.g. "H1 is too vague — no category mentioned").`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const data = JSON.parse(response.choices[0].message.content!);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to analyze" },
      { status: 500 }
    );
  }
}
