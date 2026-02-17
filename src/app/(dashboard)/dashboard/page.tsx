"use client"

import Link from "next/link"
import {
  UsersIcon,
  TrendingUpIcon,
  AtSignIcon,
  ZapIcon,
  PlusCircleIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "lucide-react"
import { api } from "@/lib/trpc/client"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { FollowerChart } from "@/components/dashboard/FollowerChart"
import { TopTweetsTable } from "@/components/dashboard/TopTweetsTable"
import { Button } from "@/components/ui/button"

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
      <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-2xl animate-glow-pulse" />
          <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-600/10 border border-orange-500/20 flex items-center justify-center">
            <PlusCircleIcon className="h-10 w-10 text-orange-400" />
          </div>
        </div>
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-bold mb-2">Connect your Twitter account</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Link your account to start tracking growth, mentions, and engagement across your crypto community.
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white gap-2 h-10 px-6 font-semibold shadow-lg shadow-orange-500/20"
          asChild
        >
          <Link href="/dashboard/settings">
            Connect Twitter Account
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
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
    <div className="space-y-6 animate-fade-in">
      {/* Upgrade banner */}
      {subscription?.plan === "free" && (
        <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/5 border border-orange-500/20 px-5 py-3">
          <div className="flex items-center gap-3">
            <SparklesIcon className="h-4 w-4 text-orange-400 shrink-0" />
            <p className="text-sm text-orange-300 font-medium">
              You're on the <strong>Free plan</strong> — limited to 7-day history & 1 account.
            </p>
          </div>
          <Button
            size="sm"
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-white font-semibold h-8 px-4 shrink-0"
            asChild
          >
            <Link href="/dashboard/billing">Upgrade →</Link>
          </Button>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Total Followers"
          value={account?.followerCount ?? 0}
          change={
            snapshot?.followerDelta !== undefined && snapshot.followerDelta !== null
              ? (snapshot.followerDelta / Math.max((snapshot.followerCount - snapshot.followerDelta), 1)) * 100
              : undefined
          }
          icon={<UsersIcon className="h-4 w-4" />}
          loading={isLoading}
          highlight
        />
        <StatsCard
          title="Engagement Rate"
          value={snapshot ? `${((snapshot.engagementRate ?? 0) / 100).toFixed(2)}%` : "—"}
          icon={<TrendingUpIcon className="h-4 w-4" />}
          loading={isLoading}
        />
        <StatsCard
          title="Tweets (7 days)"
          value={stats?.tweetCount7d ?? 0}
          icon={<ZapIcon className="h-4 w-4" />}
          loading={isLoading}
        />
        <StatsCard
          title="Mentions (7 days)"
          value={stats?.mentionCount7d ?? 0}
          icon={<AtSignIcon className="h-4 w-4" />}
          loading={isLoading}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Follower chart — wider */}
        <div className="xl:col-span-3">
          <FollowerChart data={followerChartData} />
        </div>

        {/* Account summary */}
        <div className="xl:col-span-2 rounded-xl border border-white/[0.06] bg-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Account Overview</h3>
            <p className="text-xs text-muted-foreground mt-0.5">@{account?.username ?? "—"}</p>
          </div>

          <div className="space-y-3">
            {[
              { label: "Following", value: account?.followingCount?.toLocaleString() ?? "—" },
              { label: "Total Tweets", value: account?.tweetCount?.toLocaleString() ?? "—" },
              { label: "Listed", value: account?.listedCount?.toLocaleString() ?? "—" },
              {
                label: "Last Synced",
                value: account?.lastSyncedAt
                  ? new Date(account.lastSyncedAt).toLocaleDateString()
                  : "Never",
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-xs font-medium">{value}</span>
              </div>
            ))}

            <div className="flex items-center justify-between py-1.5">
              <span className="text-xs text-muted-foreground">Plan</span>
              <span className="text-xs font-semibold gradient-text capitalize">
                {subscription?.plan ?? "Free"}
              </span>
            </div>
          </div>

          {/* Quick actions */}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Link
              href="/dashboard/content"
              className="flex items-center justify-center gap-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 py-2 text-xs font-semibold text-orange-400 hover:bg-orange-500/15 transition-colors"
            >
              <ZapIcon className="h-3 w-3" />
              Write Tweet
            </Link>
            <Link
              href="/dashboard/analytics"
              className="flex items-center justify-center gap-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-white/[0.07] transition-colors"
            >
              <TrendingUpIcon className="h-3 w-3" />
              Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* Top tweets */}
      <TopTweetsTable tweets={topTweets} />
    </div>
  )
}
