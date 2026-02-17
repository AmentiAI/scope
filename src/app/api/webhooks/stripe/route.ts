import { NextRequest, NextResponse } from "next/server";
import { handleStripeWebhook } from "@/lib/payments/stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature")!;
  try {
    await handleStripeWebhook(payload, sig);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Stripe Webhook]", err);
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
