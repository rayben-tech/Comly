import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function saveAudit(data: {
  url: string;
  brand_name: string;
  score: number;
  profile: object;
  results: object;
}) {
  const { error } = await supabase.from("audits").insert(data);
  if (error) throw error;
}

export async function saveAuditForUser(userId: string, data: {
  url: string;
  brand_name: string;
  score: number;
  profile: object;
  results: object;
}) {
  const { error } = await supabase.from("audits").upsert(
    { user_id: userId, ...data },
    { onConflict: "user_id" }
  );
  if (error) throw error;

  // Log to history (best-effort — never blocks the main save)
  await supabase.from("audit_history").insert({
    user_id: userId,
    url: data.url,
    brand_name: data.brand_name,
    score: data.score,
    results: data.results,
  }).then(({ error: e }) => {
    if (e) console.warn("audit_history insert failed:", e.message);
  });
}

export async function getUserAudit(userId: string) {
  const { data, error } = await supabase
    .from("audits")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) return null;
  return data as { url: string; brand_name: string; score: number; profile: object; results: object } | null;
}

export async function getAuditHistory(userId: string, timeRange: "7d" | "yesterday" | "30d") {
  const now = new Date();
  let since: Date;
  let until: Date | null = null;

  if (timeRange === "yesterday") {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    since = new Date(y.getFullYear(), y.getMonth(), y.getDate());
    until = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (timeRange === "30d") {
    since = new Date(now);
    since.setDate(since.getDate() - 30);
  } else {
    since = new Date(now);
    since.setDate(since.getDate() - 7);
  }

  const base = supabase
    .from("audit_history")
    .select("score, results, created_at")
    .eq("user_id", userId)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true });

  const { data, error } = await (until ? base.lt("created_at", until.toISOString()) : base);

  if (error) {
    // results column may not exist yet — retry without it
    const baseNR = supabase
      .from("audit_history")
      .select("score, created_at")
      .eq("user_id", userId)
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true });

    const { data: fbData, error: fbErr } = await (until ? baseNR.lt("created_at", until.toISOString()) : baseNR);
    if (fbErr) { console.warn("getAuditHistory error:", fbErr.message); return []; }
    return (fbData ?? []).map((d) => ({ score: d.score as number, results: null, created_at: d.created_at as string }));
  }

  return (data ?? []) as Array<{ score: number; results: unknown; created_at: string }>;
}

export async function saveEmailCapture(data: {
  email: string;
  url: string;
  score: number;
}) {
  const { error } = await supabase.from("email_captures").insert(data);
  if (error) throw error;
}
