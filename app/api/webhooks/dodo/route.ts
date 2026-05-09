import { NextRequest, NextResponse } from "next/server";
import DodoPayments from "dodopayments";
import type {
  SubscriptionActiveWebhookEvent,
  SubscriptionCancelledWebhookEvent,
  SubscriptionRenewedWebhookEvent,
  PaymentFailedWebhookEvent,
} from "dodopayments/resources/webhooks/webhooks";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const dodo = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
    webhookKey: process.env.DODO_WEBHOOK_SECRET!,
    environment: "live_mode",
  });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const body = await req.text();

  let event: ReturnType<typeof dodo.webhooks.unwrap>;
  try {
    event = dodo.webhooks.unwrap(body, {
      headers: {
        "webhook-id": req.headers.get("webhook-id") ?? "",
        "webhook-signature": req.headers.get("webhook-signature") ?? "",
        "webhook-timestamp": req.headers.get("webhook-timestamp") ?? "",
      },
    });
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "subscription.active": {
        const { data } = event as SubscriptionActiveWebhookEvent;
        await supabase.from("subscriptions").upsert({
          email: data.customer.email,
          plan: "pro",
          status: "active",
          subscription_id: data.subscription_id,
          billing_period_end: data.next_billing_date,
          payment_failed: false,
          updated_at: new Date().toISOString(),
        }, { onConflict: "email" });
        break;
      }

      case "subscription.cancelled": {
        const { data } = event as SubscriptionCancelledWebhookEvent;
        await supabase.from("subscriptions").upsert({
          email: data.customer.email,
          plan: "free",
          status: "cancelled",
          updated_at: new Date().toISOString(),
        }, { onConflict: "email" });
        break;
      }

      case "subscription.renewed": {
        const { data } = event as SubscriptionRenewedWebhookEvent;
        await supabase.from("subscriptions").upsert({
          email: data.customer.email,
          status: "active",
          billing_period_end: data.next_billing_date,
          payment_failed: false,
          updated_at: new Date().toISOString(),
        }, { onConflict: "email" });
        break;
      }

      case "payment.failed": {
        const { data } = event as PaymentFailedWebhookEvent;
        await supabase.from("subscriptions").upsert({
          email: data.customer.email,
          payment_failed: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: "email" });
        break;
      }
    }
  } catch (err) {
    console.error(`Webhook DB error for ${event.type}:`, err);
    // Return 200 so Dodo doesn't retry on DB errors
  }

  return NextResponse.json({ received: true });
}
