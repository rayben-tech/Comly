import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const UNLIMITED_EMAIL = "rayanebenchaalal@gmail.com";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ isPaid: false });

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user?.email) return NextResponse.json({ isPaid: false });

  if (user.email === UNLIMITED_EMAIL) {
    return NextResponse.json({ isPaid: true });
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("email", user.email)
    .single();

  return NextResponse.json({
    isPaid: sub?.plan === "pro" && sub?.status === "active",
  });
}
