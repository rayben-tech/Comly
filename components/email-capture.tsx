"use client";

import { useState } from "react";
import { BrandProfile, AuditResult } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

interface EmailCaptureProps {
  profile: BrandProfile;
  result: AuditResult;
}

export function EmailCapture({ profile, result }: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/save-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, url: profile.url, score: result.score, profile, results: result }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); return; }
      setSubmitted(true);
    } catch {
      setError("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-xl p-6 text-center">
        <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <p className="font-semibold text-gray-900">You&apos;re on the list!</p>
        <p className="text-sm text-gray-500 mt-1">
          Weekly AI visibility reports will be sent to <span className="text-gray-700 font-medium">{email}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <form onSubmit={handleSubmit} className="flex gap-2 w-full sm:w-auto ml-auto">
          <Input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full sm:w-52"
            required
          />
          <Button type="submit" disabled={loading || !email.trim()} className="shrink-0">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
          </Button>
        </form>
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}
