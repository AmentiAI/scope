// ─────────────────────────────────────────────
// Stripe integration — card / fiat payments
// Supports monthly + annual billing
// ─────────────────────────────────────────────

import Stripe from "stripe";
import { db } from "@/lib/db";
import { users, subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { type Plan, type BillingPeriod } from "./types";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
  typescript: true,
});

// Map plan + period → Stripe price ID (set in env)
export function getStripePriceId(
  plan: Exclude<Plan, "free">,
  period: BillingPeriod
): string {
  const key =
    `STRIPE_${plan.toUpperCase()}_${period.toUpperCase()}_PRICE_ID` as keyof NodeJS.ProcessEnv;
  const priceId = process.env[key];
  if (!priceId)
    throw new Error(`Missing env var: ${key}`);
  return priceId;
}

// Get or create Stripe customer
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string
) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  await db
    .update(users)
    .set({ stripeCustomerId: customer.id })
    .where(eq(users.id, userId));

  return customer.id;
}

// Create Stripe checkout session
export async function createStripeCheckout(params: {
  userId: string;
  email: string;
  plan: Exclude<Plan, "free">;
  billingPeriod: BillingPeriod;
  returnUrl: string;
}) {
  const customerId = await getOrCreateStripeCustomer(
    params.userId,
    params.email
  );
  const priceId = getStripePriceId(params.plan, params.billingPeriod);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${params.returnUrl}?success=true&method=stripe`,
    cancel_url: `${params.returnUrl}?canceled=true`,
    subscription_data: {
      metadata: { userId: params.userId, plan: params.plan },
    },
    allow_promotion_codes: true,
    billing_address_collection: "auto",
  });

  return session;
}

// Create billing portal (manage/cancel Stripe sub)
export async function createBillingPortal(userId: string, returnUrl: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user?.stripeCustomerId)
    throw new Error("No Stripe customer found for this user");

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: returnUrl,
  });

  return session;
}

// Handle Stripe webhook events
export async function handleStripeWebhook(
  payload: string,
  sig: string
): Promise<void> {
  const event = stripe.webhooks.constructEvent(
    payload,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata.userId;
      if (!userId) break;

      const priceId = sub.items.data[0]?.price.id;
      const plan = getPlanFromPriceId(priceId);

      await db
        .insert(subscriptions)
        .values({
          id: sub.id,
          userId,
          status: sub.status as "active" | "canceled" | "past_due" | "trialing" | "inactive",
          plan,
          paymentMethod: "stripe",
          stripePriceId: priceId ?? "",
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        })
        .onConflictDoUpdate({
          target: subscriptions.id,
          set: {
            status: sub.status as any,
            plan,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            updatedAt: new Date(),
          },
        });

      await db
        .update(users)
        .set({ plan, updatedAt: new Date() })
        .where(eq(users.id, userId));

      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata.userId;
      if (!userId) break;

      await db
        .update(subscriptions)
        .set({ status: "canceled", updatedAt: new Date() })
        .where(eq(subscriptions.id, sub.id));

      await db
        .update(users)
        .set({ plan: "free", updatedAt: new Date() })
        .where(eq(users.id, userId));

      break;
    }
  }
}

function getPlanFromPriceId(priceId?: string): Plan {
  const proMonthly = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
  const proAnnual = process.env.STRIPE_PRO_ANNUAL_PRICE_ID;
  const agencyMonthly = process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID;
  const agencyAnnual = process.env.STRIPE_AGENCY_ANNUAL_PRICE_ID;

  if (priceId === proMonthly || priceId === proAnnual) return "pro";
  if (priceId === agencyMonthly || priceId === agencyAnnual) return "agency";
  return "free";
}
