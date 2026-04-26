"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Supabase automatically handles the OAuth token from the URL hash.
    // We just need to wait for the session to be established, then redirect.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        subscription.unsubscribe();
        const pendingUrl = localStorage.getItem("comly_pending_url") || "";
        localStorage.removeItem("comly_pending_url");
        if (pendingUrl) {
          router.replace(`/audit?url=${encodeURIComponent(pendingUrl)}`);
        } else {
          router.replace("/audit");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#5B2D91] border-t-transparent rounded-full animate-spin" />
        <p className="text-[14px] text-[#6b6b6b]">Signing you in…</p>
      </div>
    </div>
  );
}
