"use client"

import { format } from "date-fns"
import { api } from "@/lib/trpc/client"
import { PricingCards } from "@/components/billing/PricingCards"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CheckCircleIcon, ClockIcon, XCircleIcon } from "lucide-react"

const STATUS_ICONS = {
  finished: <CheckCircleIcon className="h-4 w-4 text-green-500" />,
  confirmed: <CheckCircleIcon className="h-4 w-4 text-green-500" />,
  pending: <ClockIcon className="h-4 w-4 text-yellow-500" />,
  waiting: <ClockIcon className="h-4 w-4 text-yellow-500" />,
  confirming: <ClockIcon className="h-4 w-4 text-yellow-500" />,
  failed: <XCircleIcon className="h-4 w-4 text-red-500" />,
  expired: <XCircleIcon className="h-4 w-4 text-red-500" />,
  refunded: <XCircleIcon className="h-4 w-4 text-muted-foreground" />,
}

export default function BillingPage() {
  const { data: subscription, isLoading: subLoading } = api.billing.getSubscription.useQuery()
  const { data: paymentHistory = [], isLoading: historyLoading } =
    api.billing.getPaymentHistory.useQuery()

  const appUrl = typeof window !== "undefined" ? window.location.origin : ""
  const returnUrl = `${appUrl}/dashboard/billing?success=true`

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Current plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Current Plan</CardTitle>
          <CardDescription>Your active subscription details</CardDescription>
        </CardHeader>
        <CardContent>
          {subLoading ? (
            <Skeleton className="h-16" />
          ) : subscription ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg capitalize">{subscription.plan} Plan</span>
                  <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                    {subscription.status}
                  </Badge>
                  {subscription.paymentMethod === "crypto" && (
                    <Badge variant="outline" className="text-xs">
                      Crypto
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {subscription.cancelAtPeriodEnd
                    ? `Cancels on ${format(new Date(subscription.currentPeriodEnd), "MMMM d, yyyy")}`
                    : `Renews ${format(new Date(subscription.currentPeriodEnd), "MMMM d, yyyy")}`}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              You&apos;re on the Free plan. Upgrade below to unlock more features.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Pricing cards */}
      <PricingCards
        currentPlan={subscription?.plan ?? "free"}
        returnUrl={returnUrl}
      />

      {/* Payment history */}
      {paymentHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Crypto Payment History</CardTitle>
            <CardDescription>Your NOWPayments crypto transactions</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {historyLoading ? (
              <Skeleton className="h-32 m-6" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Date</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="pl-6 text-sm">
                        {format(new Date(payment.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="capitalize text-sm">{payment.plan}</TableCell>
                      <TableCell className="text-sm font-mono">{payment.currency}</TableCell>
                      <TableCell className="text-sm">
                        ${(payment.priceUsd / 100).toFixed(2)}
                        {payment.cryptoAmount && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({payment.cryptoAmount} {payment.currency})
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm capitalize">{payment.billingPeriod}</TableCell>
                      <TableCell className="pr-6">
                        <div className="flex items-center gap-1.5">
                          {STATUS_ICONS[payment.status as keyof typeof STATUS_ICONS] ?? null}
                          <span className="text-xs capitalize">{payment.status}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
