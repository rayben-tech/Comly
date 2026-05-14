"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        subscription.unsubscribe();

        const pendingUrl = localStorage.getItem("comly_pending_url") || "";
        localStorage.removeItem("comly_pending_url");

        const dest = pendingUrl ? `/audit?url=${encodeURIComponent(pendingUrl)}` : "/";

        try {
          const subRes = await fetch("/api/subscription/check", {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          const { isPaid } = await subRes.json();

          if (isPaid) {
            router.replace(dest);
            return;
          }

          // Not paid — send to /subscribe paywall
          const pendingUrlParam = pendingUrl ? `?url=${encodeURIComponent(pendingUrl)}` : "";
          router.replace(`/subscribe${pendingUrlParam}`);
        } catch {
          router.replace(dest);
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
