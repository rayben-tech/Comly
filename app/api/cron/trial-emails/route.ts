import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendExpiryWarningEmail, sendTrialExpiredEmail } from "@/lib/email";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const now = Date.now();
  const h = 60 * 60 * 1000;

  // Fetch all trial subscriptions
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("email, user_id, trial_expires_at, plan, status")
    .not("trial_expires_at", "is", null)
    .neq("status", "active"); // skip paid users

  if (!subs?.length) return NextResponse.json({ warned: 0, expired: 0 });

  let warned = 0;
  let expired = 0;

  for (const sub of subs) {
    const expiresAt = new Date(sub.trial_expires_at).getTime();
    const msUntilExpiry = expiresAt - now;
    const msSinceExpiry = now - expiresAt;

    // Get brand name from audits table
    const { data: auditRow } = await supabase
      .from("audits")
      .select("brand_name, score")
      .eq("user_id", sub.user_id)
      .single();

    const brandName = auditRow?.brand_name ?? "your brand";
    const lastScore = auditRow?.score ?? 0;

    // "1 day left" — expires in 20–28h window
    if (msUntilExpiry > 20 * h && msUntilExpiry <= 28 * h) {
      await sendExpiryWarningEmail(sub.email, brandName);
      warned++;
      continue;
    }

    // "Trial expired" — expired 0–28h ago (fires once the day after expiry)
    if (msSinceExpiry >= 0 && msSinceExpiry < 28 * h) {
      await sendTrialExpiredEmail(sub.email, brandName, lastScore);
      expired++;
    }
  }

  console.log(`trial-emails: warned=${warned} expired=${expired}`);
  return NextResponse.json({ warned, expired });
}
