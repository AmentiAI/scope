"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckIcon, BitcoinIcon, ZapIcon, CreditCardIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────

type Plan = "free" | "pro" | "agency";
type PayMethod = "stripe" | "bitcoin" | "solana";

interface PricingCardsProps {
  currentPlan?: Plan;
  returnUrl?: string;
}

// ─── Plan data ────────────────────────────────

const PLAN_DATA = {
  free: {
    name: "Free",
    description: "For getting started",
    monthlyPrice: 0,
    annualPrice: 0,
    color: "border-border",
    badge: null,
    features: [
      "1 Twitter account",
      "7-day history",
      "Basic analytics",
      "5 mention alerts/mo",
    ],
  },
  pro: {
    name: "Pro",
    description: "For serious builders",
    monthlyPrice: 29,
    annualPrice: 232, // $19.33/mo
    color: "border-orange-500",
    badge: "Most Popular",
    features: [
      "3 Twitter accounts",
      "90-day history",
      "Competitor tracking (5)",
      "50 mention alerts/mo",
      "Best post time analyzer",
      "Hashtag performance",
      "Top follower insights",
      "CSV exports",
    ],
  },
  agency: {
    name: "Agency",
    description: "For teams & power users",
    monthlyPrice: 99,
    annualPrice: 792, // $66/mo
    color: "border-purple-500",
    badge: "Best Value",
    features: [
      "10 Twitter accounts",
      "365-day history",
      "Competitor tracking (20)",
      "200 mention alerts/mo",
      "All Pro features",
      "White-label reports",
      "Priority support",
      "Team access (coming soon)",
    ],
  },
};

// ─── Payment method icons ─────────────────────

const PAY_METHOD_ICONS: Record<PayMethod, React.ReactNode> = {
  stripe: <CreditCardIcon className="h-4 w-4" />,
  bitcoin: (
    <span className="text-orange-500 font-bold text-sm">₿</span>
  ),
  solana: (
    <span className="text-purple-500 font-bold text-sm">◎</span>
  ),
};

const PAY_METHOD_LABELS: Record<PayMethod, string> = {
  stripe: "Card",
  bitcoin: "Bitcoin",
  solana: "Solana",
};

// ─── Main component ───────────────────────────

export function PricingCards({ currentPlan = "free", returnUrl }: PricingCardsProps) {
  const router = useRouter();
  const [annual, setAnnual] = useState(false);
  const [payMethod, setPayMethod] = useState<PayMethod>("stripe");
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);
  const [cryptoDialogOpen, setCryptoDialogOpen] = useState(false);
  const [cryptoInvoice, setCryptoInvoice] = useState<{
    invoiceUrl: string;
    amount: string;
    currency: string;
    expiresAt: string;
  } | null>(null);

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const successUrl = returnUrl ?? `${appUrl}/dashboard/billing?success=true`;
  const cancelUrl = `${appUrl}/dashboard/billing`;

  // tRPC mutations
  const createStripe = api.billing.createStripeCheckout.useMutation();
  const createCrypto = api.billing.createCryptoInvoice.useMutation();

  const handleUpgrade = async (plan: Exclude<Plan, "free">) => {
    setLoadingPlan(plan);

    try {
      if (payMethod === "stripe") {
        const { url } = await createStripe.mutateAsync({
          plan,
          billingPeriod: annual ? "annual" : "monthly",
          returnUrl: successUrl,
        });
        if (url) router.push(url);
      } else {
        // Crypto payment
        const invoice = await createCrypto.mutateAsync({
          plan,
          billingPeriod: annual ? "annual" : "monthly",
          currency: payMethod as "bitcoin" | "solana",
          returnUrl: successUrl,
          cancelUrl,
        });

        // Open hosted NOWPayments invoice page
        setCryptoInvoice({
          invoiceUrl: invoice.payAddress, // this is the hosted invoice URL from NOWPayments
          amount: `${invoice.priceUsd} USD`,
          currency: invoice.payCurrency,
          expiresAt: invoice.expiresAt.toISOString(),
        });
        setCryptoDialogOpen(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      alert(msg);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Billing period toggle */}
      <div className="flex items-center justify-center gap-4">
        <Label htmlFor="billing-toggle" className="text-sm font-medium">
          Monthly
        </Label>
        <Switch
          id="billing-toggle"
          checked={annual}
          onCheckedChange={setAnnual}
        />
        <Label htmlFor="billing-toggle" className="text-sm font-medium">
          Annual
          <Badge variant="secondary" className="ml-2 text-xs">
            Save 33%
          </Badge>
        </Label>
      </div>

      {/* Payment method selector */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm text-muted-foreground mr-2">Pay with:</span>
        {(["stripe", "bitcoin", "solana"] as PayMethod[]).map((method) => (
          <button
            key={method}
            onClick={() => setPayMethod(method)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all",
              payMethod === method
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/50"
            )}
          >
            {PAY_METHOD_ICONS[method]}
            {PAY_METHOD_LABELS[method]}
          </button>
        ))}
      </div>

      {/* Crypto notice */}
      {payMethod !== "stripe" && (
        <p className="text-center text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <ZapIcon className="h-3.5 w-3.5 text-yellow-500" />
            Crypto payments are one-time — access valid for{" "}
            {annual ? "365 days" : "30 days"} from payment confirmation.
          </span>
        </p>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {(Object.entries(PLAN_DATA) as [Plan, typeof PLAN_DATA.free][]).map(
          ([plan, data]) => {
            const isCurrent = currentPlan === plan;
            const price = annual
              ? plan === "free" ? 0 : Math.round((data as unknown as typeof PLAN_DATA.pro).annualPrice / 12)
              : data.monthlyPrice;
            const isPopular = data.badge;

            return (
              <Card
                key={plan}
                className={cn(
                  "relative flex flex-col border-2 transition-all",
                  data.color,
                  isPopular && "shadow-lg shadow-orange-500/10",
                  isCurrent && "ring-2 ring-primary ring-offset-2"
                )}
              >
                {data.badge && (
                  <Badge
                    className="absolute -top-3 left-1/2 -translate-x-1/2"
                    variant={plan === "pro" ? "default" : "secondary"}
                  >
                    {data.badge}
                  </Badge>
                )}

                <CardHeader>
                  <CardTitle className="text-xl">{data.name}</CardTitle>
                  <CardDescription>{data.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${price}</span>
                    <span className="text-muted-foreground ml-1">/mo</span>
                    {annual && plan !== "free" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Billed ${(data as unknown as typeof PLAN_DATA.pro).annualPrice}/yr
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-2">
                    {data.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckIcon className="h-4 w-4 text-green-500 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  {plan === "free" ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={isCurrent}
                    >
                      {isCurrent ? "Current Plan" : "Downgrade"}
                    </Button>
                  ) : (
                    <Button
                      className={cn(
                        "w-full",
                        plan === "pro" && "bg-orange-500 hover:bg-orange-600",
                        plan === "agency" && "bg-purple-600 hover:bg-purple-700"
                      )}
                      disabled={isCurrent || loadingPlan === plan}
                      onClick={() => handleUpgrade(plan as Exclude<Plan, "free">)}
                    >
                      {loadingPlan === plan ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin">⟳</span>
                          Loading...
                        </span>
                      ) : isCurrent ? (
                        "Current Plan"
                      ) : (
                        <span className="flex items-center gap-1.5">
                          {PAY_METHOD_ICONS[payMethod]}
                          Upgrade with {PAY_METHOD_LABELS[payMethod]}
                        </span>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          }
        )}
      </div>

      {/* Crypto payment dialog */}
      <Dialog open={cryptoDialogOpen} onOpenChange={setCryptoDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {payMethod === "bitcoin" ? (
                <span className="text-orange-500">₿</span>
              ) : (
                <span className="text-purple-500">◎</span>
              )}
              Pay with {payMethod === "bitcoin" ? "Bitcoin" : "Solana"}
            </DialogTitle>
            <DialogDescription>
              Complete your payment on the NOWPayments checkout page.
            </DialogDescription>
          </DialogHeader>

          {cryptoInvoice && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">{cryptoInvoice.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currency:</span>
                  <span className="font-medium">{cryptoInvoice.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires:</span>
                  <span className="font-medium text-yellow-600">
                    60 minutes
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                You'll be redirected to a secure NOWPayments page to complete
                your crypto payment. Once confirmed on-chain, your subscription
                activates automatically.
              </p>

              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                  onClick={() => {
                    window.open(cryptoInvoice.invoiceUrl, "_blank");
                    setCryptoDialogOpen(false);
                  }}
                >
                  Open Payment Page →
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCryptoDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
