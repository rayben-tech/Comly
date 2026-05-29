import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function isUnlimitedUser(email: string | undefined, userId: string | undefined): boolean {
  const unlimitedEmails = (process.env.UNLIMITED_EMAILS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const unlimitedIds = (process.env.UNLIMITED_USER_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (email && unlimitedEmails.includes(email)) return true;
  if (userId && unlimitedIds.includes(userId)) return true;
  return false;
}

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ isPaid: false, isUnlimited: false });

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ isPaid: false, isUnlimited: false });

  if (isUnlimitedUser(user.email, user.id)) {
    return NextResponse.json({ isPaid: true, isUnlimited: true });
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status, trial_expires_at")
    .eq("email", user.email)
    .single();

  const isPaid = sub?.plan === "pro" && sub?.status === "active";

  let isTrialing = false;
  let trialDaysLeft = 0;
  let trialStatus: "none" | "active" | "expired" = "none";

  if (sub?.trial_expires_at) {
    const expiresAt = new Date(sub.trial_expires_at).getTime();
    const now = Date.now();
    if (!isPaid && expiresAt > now) {
      isTrialing = true;
      trialStatus = "active";
      trialDaysLeft = Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)));
    } else {
      trialStatus = isPaid ? "none" : "expired";
    }
  }

  return NextResponse.json({
    isPaid,
    isUnlimited: false,
    isTrialing,
    trialDaysLeft,
    trialStatus,
  });
}
