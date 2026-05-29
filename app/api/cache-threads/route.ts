import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });

  const { platform, threads } = await req.json();
  if (!platform || !Array.isArray(threads)) return NextResponse.json({ ok: false }, { status: 400 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Read existing cache so we don't overwrite the other platform
  const { data: row } = await supabase
    .from("audits")
    .select("threads_cache")
    .eq("user_id", userId)
    .single();

  const existing = (row?.threads_cache ?? {}) as Record<string, unknown>;
  const updated  = {
    ...existing,
    [platform]: threads,
    cached_at: new Date().toISOString(),
  };

  await supabase
    .from("audits")
    .update({ threads_cache: updated })
    .eq("user_id", userId);

  return NextResponse.json({ ok: true });
}
