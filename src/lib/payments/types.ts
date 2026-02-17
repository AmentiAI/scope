// ─────────────────────────────────────────────
// Shared payment types across Stripe + Crypto
// ─────────────────────────────────────────────

export type Plan = "free" | "pro" | "agency";
export type PaymentMethod = "stripe" | "bitcoin" | "solana";
export type BillingPeriod = "monthly" | "annual";

export interface PlanConfig {
  name: string;
  priceUsd: {
    monthly: number; // USD cents
    annual: number; // USD cents (discounted)
  };
  limits: {
    accounts: number;
    historyDays: number;
    competitors: number;
    mentionAlerts: number;
  };
}

export const PLANS: Record<Exclude<Plan, "free">, PlanConfig> = {
  pro: {
    name: "Pro",
    priceUsd: {
      monthly: 2900, // $29
      annual: 27840, // $232/yr (~$19.33/mo, 33% off)
    },
    limits: {
      accounts: 3,
      historyDays: 90,
      competitors: 5,
      mentionAlerts: 50,
    },
  },
  agency: {
    name: "Agency",
    priceUsd: {
      monthly: 9900, // $99
      annual: 95040, // $792/yr (~$66/mo, 33% off)
    },
    limits: {
      accounts: 10,
      historyDays: 365,
      competitors: 20,
      mentionAlerts: 200,
    },
  },
};

export const FREE_LIMITS = {
  accounts: 1,
  historyDays: 7,
  competitors: 0,
  mentionAlerts: 5,
};

export interface CryptoInvoice {
  invoiceId: string;
  paymentId: string;
  payAddress: string;   // on-chain address to send to
  payAmount: string;    // exact amount in crypto
  payCurrency: string;  // "BTC" | "SOL"
  priceUsd: number;     // USD amount
  expiresAt: Date;      // invoice expiry (~60 mins)
  statusUrl: string;    // poll for status
  qrCode?: string;      // QR code URL (optional)
}

export interface PaymentConfirmation {
  paymentId: string;
  paymentMethod: PaymentMethod;
  plan: Plan;
  billingPeriod: BillingPeriod;
  periodStart: Date;
  periodEnd: Date;
  userId: string;
  amountUsd: number;
}
