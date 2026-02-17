import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { cryptoPayments, subscriptions, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { addMonths, addYears } from "date-fns";

const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET!;

interface NOWPaymentsIPN {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  actually_paid: number;
  order_id: string;
  order_description?: string;
  invoice_id?: string;
  created_at: string;
  updated_at: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-nowpayments-sig");

    // Verify signature
    if (IPN_SECRET && signature) {
      const hmac = crypto
        .createHmac("sha512", IPN_SECRET)
        .update(body)
        .digest("hex");

      if (hmac !== signature) {
        console.error("NOWPayments signature mismatch");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const data = JSON.parse(body) as NOWPaymentsIPN;
    console.log("NOWPayments IPN:", data);

    // Find the payment by invoice ID
    const [payment] = await db
      .select()
      .from(cryptoPayments)
      .where(eq(cryptoPayments.nowpaymentsInvoiceId, data.invoice_id ?? data.order_id))
      .limit(1);

    if (!payment) {
      console.error("Payment not found:", data.invoice_id ?? data.order_id);
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Map NOWPayments status to our status
    const statusMap: Record<string, typeof cryptoPayments.$inferInsert.status> = {
      waiting: "waiting",
      confirming: "confirming",
      confirmed: "confirmed",
      sending: "confirmed",
      finished: "finished",
      partially_paid: "waiting",
      expired: "expired",
      failed: "failed",
      refunded: "refunded",
    };

    const newStatus = statusMap[data.payment_status] ?? "pending";

    // Update payment status
    await db
      .update(cryptoPayments)
      .set({
        status: newStatus,
        nowpaymentsPaymentId: data.payment_id.toString(),
        cryptoAmount: data.actually_paid?.toString(),
        confirmedAt: newStatus === "finished" ? new Date() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(cryptoPayments.id, payment.id));

    // If payment is finished, activate subscription
    if (data.payment_status === "finished") {
      await activateCryptoSubscription(payment);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("NOWPayments webhook error:", error);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }
}

async function activateCryptoSubscription(
  payment: typeof cryptoPayments.$inferSelect
) {
  const now = new Date();
  const periodEnd =
    payment.billingPeriod === "annual"
      ? addYears(now, 1)
      : addMonths(now, 1);

  // Create or update subscription
  const subscriptionId = `crypto_${payment.id}`;

  await db
    .insert(subscriptions)
    .values({
      id: subscriptionId,
      userId: payment.userId,
      status: "active",
      plan: payment.plan,
      paymentMethod: "crypto",
      payCurrency: payment.currency,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
    })
    .onConflictDoUpdate({
      target: subscriptions.id,
      set: {
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        updatedAt: new Date(),
      },
    });

  // Update user's plan
  await db
    .update(users)
    .set({ plan: payment.plan, updatedAt: new Date() })
    .where(eq(users.id, payment.userId));

  console.log(`Activated ${payment.plan} subscription for user ${payment.userId} via crypto`);
}
