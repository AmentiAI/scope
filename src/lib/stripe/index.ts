import Stripe from "stripe";
import { db, users, subscriptions } from "@/lib/db";
import { eq } from "drizzle-orm";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
  typescript: true,
});

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    priceId: null,
    limits: {
      accounts: 1,
      historyDays: 7,
      competitors: 0,
    },
  },
  pro: {
    name: "Pro",
    price: 2900, // $29.00 in cents
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    limits: {
      accounts: 3,
      historyDays: 90,
      competitors: 5,
    },
  },
  agency: {
    name: "Agency",
    price: 9900, // $99.00 in cents
    priceId: process.env.STRIPE_AGENCY_PRICE_ID!,
    limits: {
      accounts: 10,
      historyDays: 365,
      competitors: 20,
    },
  },
};

// Create or retrieve Stripe customer for a user
export async function getOrCreateStripeCustomer(userId: string, email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  // Create new customer
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

// Create checkout session
export async function createCheckoutSession(
  userId: string,
  email: string,
  priceId: string,
  returnUrl: string
) {
  const customerId = await getOrCreateStripeCustomer(userId, email);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${returnUrl}?success=true`,
    cancel_url: `${returnUrl}?canceled=true`,
    subscription_data: {
      metadata: { userId },
    },
  });

  return session;
}

// Create billing portal session
export async function createBillingPortal(userId: string, returnUrl: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user?.stripeCustomerId) {
    throw new Error("No Stripe customer found");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: returnUrl,
  });

  return session;
}

// Handle webhook events
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
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata.userId;
      if (!userId) break;

      const priceId = subscription.items.data[0]?.price.id;
      const plan = getPlanFromPriceId(priceId);

      await db
        .insert(subscriptions)
        .values({
          id: subscription.id,
          userId,
          status: subscription.status as any,
          plan,
          stripePriceId: priceId ?? "",
          currentPeriodStart: new Date(
            subscription.current_period_start * 1000
          ),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        })
        .onConflictDoUpdate({
          target: subscriptions.id,
          set: {
            status: subscription.status as any,
            currentPeriodEnd: new Date(
              subscription.current_period_end * 1000
            ),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            updatedAt: new Date(),
          },
        });

      // Update user's plan
      await db
        .update(users)
        .set({ plan, updatedAt: new Date() })
        .where(eq(users.id, userId));

      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata.userId;
      if (!userId) break;

      await db
        .update(subscriptions)
        .set({ status: "canceled", updatedAt: new Date() })
        .where(eq(subscriptions.id, subscription.id));

      await db
        .update(users)
        .set({ plan: "free", updatedAt: new Date() })
        .where(eq(users.id, userId));

      break;
    }
  }
}

function getPlanFromPriceId(priceId?: string): "free" | "pro" | "agency" {
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
  if (priceId === process.env.STRIPE_AGENCY_PRICE_ID) return "agency";
  return "free";
}
