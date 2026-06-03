import { NextRequest, NextResponse } from "next/server";
import { runAudit } from "@/lib/audit-runner";
import { BrandProfile } from "@/types";
import { checkRateLimit, getIp } from "@/lib/ratelimit";

export const runtime = "edge";
export const maxDuration = 60;


export async function POST(req: NextRequest) {
  const allowed = await checkRateLimit(getIp(req), "audit");
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const { profile, customPrompts }: { profile: BrandProfile; customPrompts?: string[] } = await req.json();

    if (!profile?.brand_name) {
      return NextResponse.json({ error: "Brand profile is required" }, { status: 400 });
    }

    const result = await runAudit(profile, customPrompts);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Audit error:", err);
    return NextResponse.json({ error: "Failed to run audit. Please try again." }, { status: 500 });
  }
}
