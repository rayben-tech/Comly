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

export async function saveEmailCapture(data: {
  email: string;
  url: string;
  score: number;
}) {
  const { error } = await supabase.from("email_captures").insert(data);
  if (error) throw error;
}
