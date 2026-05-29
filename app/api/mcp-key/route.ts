import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function randomKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "cml_";
  for (let i = 0; i < 40; i++) key += chars[Math.floor(Math.random() * chars.length)];
  return key;
}

async function getUserId(req: NextRequest): Promise<string | null> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return null;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: { user } } = await supabase.auth.getUser(token);
  return user?.id ?? null;
}

// GET — return existing key
export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await supabase
    .from("mcp_keys")
    .select("key")
    .eq("user_id", userId)
    .single();

  return NextResponse.json({ key: data?.key ?? null });
}

// POST — generate (or regenerate) key
export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body  = await req.json().catch(() => ({}));
  const regen = body.regenerate === true;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: existing } = await supabase
    .from("mcp_keys")
    .select("key")
    .eq("user_id", userId)
    .single();

  if (existing && !regen) return NextResponse.json({ key: existing.key });

  const newKey = randomKey();

  if (existing) {
    await supabase.from("mcp_keys").update({ key: newKey }).eq("user_id", userId);
  } else {
    await supabase.from("mcp_keys").insert({ user_id: userId, key: newKey });
  }

  return NextResponse.json({ key: newKey });
}
