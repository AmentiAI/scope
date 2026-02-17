// ─────────────────────────────────────────────
// NOWPayments integration — BTC & SOL
// Handles one-time crypto payments for plan periods.
// Crypto doesn't natively support recurring billing,
// so users pay upfront for 30 or 365 days.
// ─────────────────────────────────────────────

import crypto from "crypto";
import { db } from "@/lib/db";
import { users, subscriptions, cryptoPayments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PLANS, type Plan, type BillingPeriod, type CryptoInvoice } from "./types";

const BASE_URL = "https://api.nowpayments.io/v1";
const API_KEY = process.env.NOWPAYMENTS_API_KEY!;
const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET!;

// Crypto ticker symbols
export const CRYPTO_CURRENCIES: Record<"bitcoin" | "solana", string> = {
  bitcoin: "BTC",
  solana: "SOL",
};

// ─── Create a crypto invoice ─────────────────

export async function createCryptoInvoice(params: {
  userId: string;
  email: string;
  plan: Exclude<Plan, "free">;
  billingPeriod: BillingPeriod;
  currency: "bitcoin" | "solana";
  returnUrl: string;
  cancelUrl: string;
}): Promise<CryptoInvoice> {
  const planConfig = PLANS[params.plan];
  const priceUsd =
    params.billingPeriod === "annual"
      ? planConfig.priceUsd.annual
      : planConfig.priceUsd.monthly;

  const priceUsdDecimal = priceUsd / 100;
  const payCurrency = CRYPTO_CURRENCIES[params.currency];

  // Create NOWPayments invoice
  const res = await fetch(`${BASE_URL}/invoice`, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      price_amount: priceUsdDecimal,
      price_currency: "USD",
      pay_currency: payCurrency,
      order_id: `${params.userId}_${params.plan}_${params.billingPeriod}_${Date.now()}`,
      order_description: `CryptoScope ${planConfig.name} — ${params.billingPeriod === "annual" ? "Annual" : "Monthly"}`,
      success_url: params.returnUrl,
      cancel_url: params.cancelUrl,
      ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/nowpayments`,
      is_fixed_rate: true,        // Lock rate at invoice creation
      is_fee_paid_by_user: false, // We cover the processing fee
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `NOWPayments invoice creation failed: ${err.message ?? res.statusText}`
    );
  }

  const data = await res.json();

  // Store pending payment in DB
  const periodDays = params.billingPeriod === "annual" ? 365 : 30;
  const periodEnd = new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000);

  await db.insert(cryptoPayments).values({
    id: data.id?.toString() ?? crypto.randomUUID(),
    userId: params.userId,
    nowpaymentsInvoiceId: data.id?.toString(),
    plan: params.plan,
    billingPeriod: params.billingPeriod,
    currency: payCurrency,
    priceUsd: priceUsd,
    cryptoAmount: data.invoice_url ? null : null, // filled on payment status
    status: "pending",
    periodStart: new Date(),
    periodEnd,
    createdAt: new Date(),
  });

  return {
    invoiceId: data.id?.toString(),
    paymentId: data.id?.toString(),
    payAddress: data.invoice_url, // NOWPayments returns hosted invoice URL
    payAmount: "", // Determined at payment time
    payCurrency,
    priceUsd: priceUsdDecimal,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 60 min
    statusUrl: `${BASE_URL}/invoice/${data.id}`,
    qrCode: undefined, // Will be on the hosted page
  };
}

// ─── Get payment status ──────────────────────

export async function getPaymentStatus(paymentId: string) {
  const res = await fetch(`${BASE_URL}/payment/${paymentId}`, {
    headers: { "x-api-key": API_KEY },
  });

  if (!res.ok) throw new Error("Failed to fetch payment status");
  return res.json();
}

// ─── Verify IPN (webhook) signature ──────────

export function verifyNowPaymentsIPN(
  payload: Record<string, unknown>,
  receivedSignature: string
): boolean {
  // NOWPayments signs with HMAC-SHA512 of sorted JSON
  const sortedPayload = sortObjectKeys(payload);
  const jsonStr = JSON.stringify(sortedPayload);
  const hmac = crypto
    .createHmac("sha512", IPN_SECRET)
    .update(jsonStr)
    .digest("hex");
  return hmac === receivedSignature;
}

// ─── Handle confirmed payment ────────────────

export async function handleCryptoPaymentConfirmed(ipnData: {
  payment_id: string;
  order_id: string; // "userId_plan_period_timestamp"
  payment_status: string;
  pay_currency: string;
  price_amount: number;
  actually_paid: number;
}) {
  if (
    ipnData.payment_status !== "confirmed" &&
    ipnData.payment_status !== "finished"
  ) {
    return; // Not yet confirmed
  }

  const [userId, plan, billingPeriod] = ipnData.order_id.split("_") as [
    string,
    Exclude<Plan, "free">,
    BillingPeriod,
    string,
  ];

  if (!userId || !plan || !billingPeriod) {
    throw new Error(`Invalid order_id format: ${ipnData.order_id}`);
  }

  // Mark payment as confirmed
  await db
    .update(cryptoPayments)
    .set({
      status: "confirmed",
      nowpaymentsPaymentId: ipnData.payment_id,
      cryptoAmount: ipnData.actually_paid.toString(),
      confirmedAt: new Date(),
    })
    .where(eq(cryptoPayments.nowpaymentsInvoiceId, ipnData.payment_id));

  // Compute subscription period
  const periodDays = billingPeriod === "annual" ? 365 : 30;
  const periodStart = new Date();
  const periodEnd = new Date(
    Date.now() + periodDays * 24 * 60 * 60 * 1000
  );

  // Upsert subscription
  const subId = `crypto_${ipnData.payment_id}`;
  await db
    .insert(subscriptions)
    .values({
      id: subId,
      userId,
      status: "active",
      plan,
      paymentMethod: "crypto",
      payCurrency: ipnData.pay_currency,
      stripePriceId: null,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: true, // Crypto is always "until expiry"
    })
    .onConflictDoUpdate({
      target: subscriptions.id,
      set: {
        status: "active",
        plan,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        updatedAt: new Date(),
      },
    });

  // Update user's plan
  await db
    .update(users)
    .set({ plan, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

// ─── Helper: sort object keys recursively ────

function sortObjectKeys(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.keys(obj)
    .sort()
    .reduce(
      (acc, key) => {
        const val = obj[key];
        acc[key] =
          val && typeof val === "object" && !Array.isArray(val)
            ? sortObjectKeys(val as Record<string, unknown>)
            : val;
        return acc;
      },
      {} as Record<string, unknown>
    );
}

// ─── Get available crypto currencies from NOWPayments ────

export async function getAvailableCurrencies(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/currencies`, {
    headers: { "x-api-key": API_KEY },
  });
  if (!res.ok) return ["BTC", "SOL"]; // fallback
  const data = await res.json();
  return data.currencies ?? ["BTC", "SOL"];
}

// ─── Get estimated price (preview) ──────────

export async function getEstimatedPrice(
  amountUsd: number,
  currency: "BTC" | "SOL"
): Promise<{ amount: number; rate: number }> {
  const res = await fetch(
    `${BASE_URL}/estimate?amount=${amountUsd}&currency_from=USD&currency_to=${currency}`,
    { headers: { "x-api-key": API_KEY } }
  );

  if (!res.ok) {
    return { amount: 0, rate: 0 };
  }

  const data = await res.json();
  return {
    amount: data.estimated_amount ?? 0,
    rate: amountUsd / (data.estimated_amount || 1),
  };
}
