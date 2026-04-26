import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { content, url, title, description } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const systemPrompt = `You are a brand analyst. Extract structured information from website content. Return ONLY valid JSON with no markdown formatting.`;

    const userPrompt = `Analyze this website content and extract brand information.

Website URL: ${url}
Page Title: ${title}
Meta Description: ${description}

Website Content:
${content}

Return a JSON object with EXACTLY these fields:
{
  "brand_name": "company name",
  "description": "2-3 sentence description of what the company does",
  "category": "software category (e.g., CRM, Email Marketing, Project Management)",
  "target_users": "who this is for (e.g., startups, enterprise teams, freelancers)",
  "main_use_cases": ["use case 1", "use case 2", "use case 3"],
  "competitors": ["competitor1", "competitor2", "competitor3"],
  "differentiators": "what makes this product unique",
  "pricing_tiers": [
    { "plan": "Free", "price": "$0/mo" },
    { "plan": "Pro", "price": "$12/mo" },
    { "plan": "Enterprise", "price": "Custom" }
  ]
}

For pricing_tiers: extract the ACTUAL plan names and prices from the website content. Use real numbers found on the page (e.g. "$9/mo", "$49/year"). If a plan has no public price, use "Custom". If no pricing is found, return an empty array.
For competitors, name 3 real well-known companies in the same space. If you cannot determine a field, provide your best guess based on the category and context.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const profile = JSON.parse(response.choices[0].message.content!);
    profile.url = url;

    return NextResponse.json({ profile });
  } catch (err) {
    console.error("Extract profile error:", err);
    return NextResponse.json(
      { error: "Failed to analyze website content. Please try again." },
      { status: 500 }
    );
  }
}
