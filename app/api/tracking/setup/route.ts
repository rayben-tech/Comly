import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const jwt = authHeader.replace("Bearer ", "");

    // User-scoped client so RLS auth.uid() resolves correctly
    const db = createClient(URL, ANON, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    const { data: { user }, error: authErr } = await db.auth.getUser(jwt);
    if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: existing } = await db
      .from("llm_tracking_tokens")
      .select("token")
      .eq("user_id", user.id)
      .single();

    if (existing?.token) return NextResponse.json({ token: existing.token });

    const { data: created, error: insertErr } = await db
      .from("llm_tracking_tokens")
      .insert({ user_id: user.id })
      .select("token")
      .single();

    if (insertErr || !created) throw insertErr;
    return NextResponse.json({ token: created.token });
  } catch (err) {
    console.error("tracking/setup error:", err);
    return NextResponse.json({ error: "Setup failed" }, { status: 500 });
  }
}
