// ─────────────────────────────────────────────
// NOWPayments IPN (Instant Payment Notification) webhook
// POST /api/webhooks/nowpayments
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { verifyNowPaymentsIPN, handleCryptoPaymentConfirmed } from "@/lib/payments/nowpayments";
import { db } from "@/lib/db";
import { cryptoPayments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// NOWPayments sends raw JSON body — must read as text for sig verification
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;
    
    // Verify IPN signature from x-nowpayments-sig header
    const signature = req.headers.get("x-nowpayments-sig");
    if (!signature) {
      console.error("[NOWPayments IPN] Missing signature header");
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    const isValid = verifyNowPaymentsIPN(body, signature);
    if (!isValid) {
      console.error("[NOWPayments IPN] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const paymentData = body as {
      payment_id: string;
      order_id: string;
      payment_status: string;
      pay_currency: string;
      price_amount: number;
      actually_paid: number;
    };

    console.log(`[NOWPayments IPN] Payment ${paymentData.payment_id} — status: ${paymentData.payment_status}`);

    // Update payment status in DB regardless of final state
    await db
      .update(cryptoPayments)
      .set({
        status: mapNowPaymentsStatus(paymentData.payment_status),
        nowpaymentsPaymentId: paymentData.payment_id,
        updatedAt: new Date(),
      })
      .where(eq(cryptoPayments.nowpaymentsInvoiceId, paymentData.payment_id));

    // Handle confirmed/finished payments — activate subscription
    if (
      paymentData.payment_status === "confirmed" ||
      paymentData.payment_status === "finished"
    ) {
      await handleCryptoPaymentConfirmed(paymentData);
      
      // TODO: Send confirmation email via Resend
      // await sendPaymentConfirmationEmail(paymentData.order_id.split("_")[0]);
      
      console.log(`[NOWPayments IPN] ✅ Payment confirmed — order: ${paymentData.order_id}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[NOWPayments IPN] Error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

function mapNowPaymentsStatus(
  status: string
): "pending" | "waiting" | "confirming" | "confirmed" | "finished" | "failed" | "expired" | "refunded" {
  const map: Record<string, "pending" | "waiting" | "confirming" | "confirmed" | "finished" | "failed" | "expired" | "refunded"> = {
    waiting: "waiting",
    confirming: "confirming",
    confirmed: "confirmed",
    sending: "confirming",
    partially_paid: "waiting",
    finished: "finished",
    failed: "failed",
    refunded: "refunded",
    expired: "expired",
  };
  return map[status] ?? "pending";
}
