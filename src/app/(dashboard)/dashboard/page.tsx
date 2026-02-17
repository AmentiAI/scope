"use client"

import { useState } from "react"
import Link from "next/link"
import {
  UsersIcon,
  TrendingUpIcon,
  AtSignIcon,
  ZapIcon,
  PlusCircleIcon,
} from "lucide-react"
import { api } from "@/lib/trpc/client"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { FollowerChart } from "@/components/dashboard/FollowerChart"
import { TopTweetsTable } from "@/components/dashboard/TopTweetsTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  const { data: accounts, isLoading: accountsLoading } = api.analytics.getAccounts.useQuery()
  const selectedAccountId = accounts?.[0]?.id

  const { data: stats, isLoading: statsLoading } = api.analytics.getDashboardStats.useQuery(
    { accountId: selectedAccountId! },
    { enabled: !!selectedAccountId }
  )

  const { data: followerData = [] } = api.analytics.getFollowerGrowth.useQuery(
    { accountId: selectedAccountId!, days: 30 },
    { enabled: !!selectedAccountId }
  )

  const { data: topTweets = [] } = api.analytics.getTopTweets.useQuery(
    { accountId: selectedAccountId!, days: 30, limit: 10 },
    { enabled: !!selectedAccountId }
  )

  const { data: subscription } = api.billing.getSubscription.useQuery()

  const isLoading = accountsLoading || statsLoading
  const hasNoAccounts = !accountsLoading && (!accounts || accounts.length === 0)

  if (hasNoAccounts) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="h-16 w-16 rounded-full bg-orange-500/10 flex items-center justify-center">
          <PlusCircleIcon className="h-8 w-8 text-orange-500" />
        </div>
        <h2 className="text-xl font-semibold">Connect your Twitter account</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Link your Twitter account to start tracking your crypto community growth, mentions, and engagement.
        </p>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white" asChild>
          <Link href="/dashboard/settings">Connect Twitter Account</Link>
        </Button>
      </div>
    )
  }

  const snapshot = stats?.latestSnapshot
  const account = stats?.account

  const followerChartData = followerData.map((d) => ({
    date: d.date instanceof Date ? d.date.toISOString() : String(d.date),
    followers: d.followerCount,
    delta: d.followerDelta ?? 0,
  }))

  return (
    <div className="space-y-6">
      {/* Plan notice */}
      {subscription?.plan === "free" && (
        <div className="flex items-center justify-between bg-orange-500/10 border border-orange-500/20 rounded-lg px-4 py-3">
          <p className="text-sm text-orange-500 font-medium">
            You're on the Free plan — 7-day history only.
          </p>
          <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white" asChild>
            <Link href="/dashboard/billing">Upgrade</Link>
          </Button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Followers"
          value={account?.followerCount ?? 0}
          change={snapshot?.followerDelta !== undefined && snapshot.followerDelta !== null
            ? (snapshot.followerDelta / Math.max((snapshot.followerCount - snapshot.followerDelta), 1)) * 100
            : undefined}
          icon={<UsersIcon className="h-4 w-4" />}
          loading={isLoading}
        />
        <StatsCard
          title="Engagement Rate"
          value={snapshot ? `${((snapshot.engagementRate ?? 0) / 100).toFixed(2)}%` : "—"}
          icon={<TrendingUpIcon className="h-4 w-4" />}
          loading={isLoading}
        />
        <StatsCard
          title="Tweets (7d)"
          value={stats?.tweetCount7d ?? 0}
          icon={<ZapIcon className="h-4 w-4" />}
          loading={isLoading}
        />
        <StatsCard
          title="Mentions (7d)"
          value={stats?.mentionCount7d ?? 0}
          icon={<AtSignIcon className="h-4 w-4" />}
          loading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <FollowerChart data={followerChartData} />
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Account Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {account ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Username</span>
                  <span className="font-medium">@{account.username}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Following</span>
                  <span>{account.followingCount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Tweets</span>
                  <span>{account.tweetCount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Synced</span>
                  <span className="text-muted-foreground">
                    {account.lastSyncedAt
                      ? new Date(account.lastSyncedAt).toLocaleString()
                      : "Never"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="capitalize font-medium text-orange-500">
                    {subscription?.plan ?? "Free"}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">Loading account info…</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top tweets */}
      <TopTweetsTable tweets={topTweets} />
    </div>
  )
}
