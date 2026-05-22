import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const jwt = authHeader.replace("Bearer ", "");

    const db = createClient(URL, ANON, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    const { data: { user }, error: authErr } = await db.auth.getUser(jwt);
    if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: tokenRow } = await db
      .from("llm_tracking_tokens")
      .select("token")
      .eq("user_id", user.id)
      .single();

    if (!tokenRow) return NextResponse.json({ visitors: [], bots: [], total: 0 });

    const { data: visits } = await db
      .from("llm_visits")
      .select("source, type")
      .eq("token", tokenRow.token);

    if (!visits?.length) return NextResponse.json({ visitors: [], bots: [], total: 0 });

    const visitorMap = new Map<string, number>();
    const botMap = new Map<string, number>();

    for (const v of visits) {
      const map = v.type === "bot" ? botMap : visitorMap;
      map.set(v.source, (map.get(v.source) ?? 0) + 1);
    }

    const toArr = (m: Map<string, number>) =>
      Array.from(m.entries())
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      visitors: toArr(visitorMap),
      bots: toArr(botMap),
      total: visits.length,
    });
  } catch (err) {
    console.error("tracking/visits error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
