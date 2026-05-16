import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { runAudit } from "@/lib/audit-runner";
import { BrandProfile } from "@/types";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function isUnlimitedUser(email: string | undefined): boolean {
  const unlimitedEmails = (process.env.UNLIMITED_EMAILS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return !!email && unlimitedEmails.includes(email);
}

export async function GET(req: NextRequest) {
  // Vercel sends Authorization: Bearer <CRON_SECRET> on every cron invocation.
  // We verify it so the endpoint can't be triggered by outside callers.
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

  // Fetch every user who has a saved audit (one row per user)
  const { data: auditRows, error: auditErr } = await supabase
    .from("audits")
    .select("user_id, url, brand_name, profile")
    .eq("daily_reaudit", true);

  if (auditErr || !auditRows?.length) {
    console.log("daily-audit: no audit rows found", auditErr?.message);
    return NextResponse.json({ ran: 0, skipped: 0, failed: 0 });
  }

  let ran = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of auditRows) {
    try {
      // Get the user's email from auth.users
      const { data: { user }, error: userErr } = await supabase.auth.admin.getUserById(row.user_id);
      if (userErr || !user?.email) { skipped++; continue; }

      // Check if user is paid or unlimited
      const unlimited = isUnlimitedUser(user.email);
      if (!unlimited) {
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("status")
          .eq("email", user.email)
          .single();

        if (sub?.status !== "active") { skipped++; continue; }
      }

      // Ensure we have a valid profile
      const profile = row.profile as BrandProfile | null;
      if (!profile?.brand_name) { skipped++; continue; }

      // Run the audit
      const result = await runAudit(profile);

      // Upsert latest audit + append to history
      await supabase.from("audits").upsert(
        {
          user_id: row.user_id,
          url: row.url,
          brand_name: row.brand_name,
          score: result.score,
          profile: row.profile,
          results: result,
        },
        { onConflict: "user_id" }
      );

      await supabase.from("audit_history").insert({
        user_id: row.user_id,
        url: row.url,
        brand_name: row.brand_name,
        score: result.score,
        results: result,
      });

      console.log(`daily-audit: ✓ ${row.brand_name} (${user.email}) score=${result.score}`);
      ran++;
    } catch (err) {
      console.error(`daily-audit: ✗ user_id=${row.user_id}`, err);
      failed++;
    }
  }

  console.log(`daily-audit complete — ran=${ran} skipped=${skipped} failed=${failed}`);
  return NextResponse.json({ ran, skipped, failed });
}
