import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendWelcomeEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return NextResponse.json({ ok: false });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user?.email) return NextResponse.json({ ok: false });

  let score: number | undefined;
  let brand_name: string | undefined;
  try {
    const body = await req.json();
    score = typeof body.score === "number" ? body.score : undefined;
    brand_name = typeof body.brand_name === "string" ? body.brand_name : undefined;
  } catch {}

  if (score === undefined || !brand_name) return NextResponse.json({ ok: false });

  await sendWelcomeEmail(user.email, brand_name, score);
  return NextResponse.json({ ok: true });
}
