import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Extract hero section copy from website content. Return valid JSON only.",
        },
        {
          role: "user",
          content: `Extract the hero section from this website content. The hero is the first section visitors see — it has the main headline (H1), a subtitle/subheadline, and often a CTA button.

Website content:
${content.slice(0, 8000)}

Return JSON only:
{
  "h1": "the main headline text",
  "subheadline": "the subtitle or subheadline text",
  "cta": "the primary CTA button text"
}

If you cannot find a field, return an empty string. Do not invent content.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const data = JSON.parse(response.choices[0].message.content!);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to extract hero" },
      { status: 500 }
    );
  }
}
