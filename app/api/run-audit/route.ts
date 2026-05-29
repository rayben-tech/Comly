import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { runAudit } from "@/lib/audit-runner";
import { BrandProfile } from "@/types";
import { checkRateLimit, getIp, userAuditRatelimit } from "@/lib/ratelimit";

export const maxDuration = 60;

async function getAuthUserId(req: NextRequest): Promise<string | null> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return null;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: { user } } = await supabase.auth.getUser(token);
    return user?.id ?? null;
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  const allowed = await checkRateLimit(getIp(req), "audit");
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  // Per-user daily limit: 1 audit per 23h for authenticated users
  const userId = await getAuthUserId(req);
  if (userId && userAuditRatelimit) {
    const { success } = await userAuditRatelimit.limit(`audit:${userId}`).catch(() => ({ success: true }));
    if (!success) {
      return NextResponse.json({ error: "You have already run an audit today. Your next audit will run automatically tomorrow." }, { status: 429 });
    }
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
