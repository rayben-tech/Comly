import { NextRequest, NextResponse } from "next/server";
import DodoPayments from "dodopayments";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const dodo = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
    environment: "test_mode",
  });

  try {
    const { userEmail, userName } = await req.json() as { userEmail?: string; userName?: string };

    const origin = req.headers.get("origin") ?? "https://trycomly.com";

    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: process.env.NEXT_PUBLIC_DODO_PRODUCT_ID!, quantity: 1 }],
      ...(userEmail ? { customer: { email: userEmail, name: userName ?? "" } } : {}),
      return_url: `${origin}/auth`,
    });

    return NextResponse.json({ url: session.checkout_url });
  } catch (error) {
    console.error("Dodo checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
