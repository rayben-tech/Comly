import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const apiKey = process.env.ABSTRACT_API_EMAIL_KEY;

    if (!apiKey) {
      // No key configured — allow signup to proceed
      return NextResponse.json({ valid: true });
    }

    const res = await fetch(
      `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${encodeURIComponent(email)}`
    );

    if (!res.ok) {
      // API error — fail open so real users aren't blocked
      return NextResponse.json({ valid: true });
    }

    const data = await res.json();
    const { deliverability, is_disposable_email } = data;

    if (is_disposable_email?.value === true) {
      return NextResponse.json({ valid: false, error: "Disposable email addresses are not allowed." });
    }

    if (deliverability === "UNDELIVERABLE") {
      return NextResponse.json({ valid: false, error: "This email address doesn't exist. Please use a valid email." });
    }

    // DELIVERABLE, RISKY, or UNKNOWN — allow through
    return NextResponse.json({ valid: true });
  } catch {
    // Fail open on any error
    return NextResponse.json({ valid: true });
  }
}
