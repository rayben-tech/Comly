import { NextRequest, NextResponse } from "next/server";
import DodoPayments from "dodopayments";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const dodo = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
    environment: "live_mode",
  });

  try {
    const { userEmail, returnTo } = await req.json() as { userEmail?: string; userName?: string; returnTo?: string };

    const origin = req.headers.get("origin") ?? "https://trycomly.com";
    const returnUrl = returnTo ? `${origin}${returnTo}` : `${origin}/`;

    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: process.env.NEXT_PUBLIC_DODO_PRODUCT_ID!, quantity: 1 }],
      ...(userEmail ? { customer: { email: userEmail } } : {}),
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.checkout_url });
  } catch (error) {
    console.error("Dodo checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
