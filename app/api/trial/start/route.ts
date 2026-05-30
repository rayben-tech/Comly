import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendWelcomeEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check if trial or subscription already exists
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("status, plan, trial_expires_at")
    .eq("email", user.email)
    .single();

  // Don't overwrite an active paid subscription
  if (existing?.plan === "pro" && existing?.status === "active") {
    return NextResponse.json({ alreadyPaid: true });
  }

  // Don't start a new trial if one already exists (even if expired)
  if (existing?.trial_expires_at) {
    return NextResponse.json({ trialExpiresAt: existing.trial_expires_at });
  }

  const trialExpiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from("subscriptions").upsert(
    {
      email: user.email,
      user_id: user.id,
      plan: "trial",
      status: "trial",
      trial_expires_at: trialExpiresAt,
    },
    { onConflict: "email" }
  );

  if (error) {
    console.error("Trial start error:", error);
    return NextResponse.json({ error: "Failed to start trial" }, { status: 500 });
  }

  // Fetch their latest audit to get score for welcome email
  const supabaseService = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: auditRow } = await supabaseService
    .from("audits")
    .select("score, brand_name")
    .eq("user_id", user.id)
    .single();

  if (auditRow?.score !== undefined) {
    await sendWelcomeEmail(user.email, auditRow.brand_name ?? "your brand", auditRow.score);
  }

  return NextResponse.json({ trialExpiresAt });
}
