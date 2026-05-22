import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  try {
    const { token, source, type, url } = await req.json();
    if (!token || !source) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400, headers: CORS });
    }

    await supabase.from("llm_visits").insert({
      token,
      source,
      type: type === "bot" ? "bot" : "visitor",
      page_url: url ?? null,
    });

    return NextResponse.json({ ok: true }, { headers: CORS });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500, headers: CORS });
  }
}
