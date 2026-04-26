import { NextRequest, NextResponse } from "next/server";
import { saveEmailCapture, saveAudit } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email, url, score, profile, results } = await req.json();

    if (!email || !url) {
      return NextResponse.json(
        { error: "Email and URL are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    await saveEmailCapture({ email, url, score });

    if (profile && results) {
      await saveAudit({
        url,
        brand_name: profile.brand_name,
        score,
        profile,
        results,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Save email error:", err);
    return NextResponse.json(
      { error: "Failed to save. Please try again." },
      { status: 500 }
    );
  }
}
