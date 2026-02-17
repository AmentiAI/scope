"use client"

import { useState } from "react"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { format, parseISO } from "date-fns"
import { api } from "@/lib/trpc/client"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  TrendingUpIcon, HeartIcon, RepeatIcon, AtSignIcon,
  CalendarIcon, HashIcon, ClockIcon, DownloadIcon,
} from "lucide-react"
import { exportToCsv, analyticsToRows, type FollowerSnapshot } from "@/lib/export"

const RANGE_OPTIONS = [
  { label: "7D", value: 7 },
  { label: "30D", value: 30 },
  { label: "90D", value: 90 },
]

function SectionCard({ title, description, children }: {
  title: string; description?: string; children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/10 bg-card/95 backdrop-blur-xl px-4 py-3 shadow-2xl">
      <p className="text-[11px] text-muted-foreground mb-2">
        {label ? format(parseISO(label), "MMM d, yyyy") : label}
      </p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-6">
          <span className="text-xs text-muted-foreground capitalize">{p.name}</span>
          <span className="text-sm font-bold" style={{ color: p.color }}>
            {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(30)
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d")

  const { data: accounts } = api.analytics.getAccounts.useQuery()
  const accountId = accounts?.[0]?.id

  const { data: followerData = [], isLoading: flLoading } = api.analytics.getFollowerGrowth.useQuery(
    { accountId: accountId!, days },
    { enabled: !!accountId }
  )
  const { data: engagementData = [] } = api.analytics.getEngagement.useQuery(
    { accountId: accountId!, days },
    { enabled: !!accountId }
  )
  const { data: bestTimes } = api.analytics.getBestPostingTimes.useQuery(
    { accountId: accountId! },
    { enabled: !!accountId }
  )
  const { data: hashtags = [] } = api.analytics.getHashtagPerformance.useQuery(
    { accountId: accountId!, period },
    { enabled: !!accountId }
  )
  const { data: stats } = api.analytics.getDashboardStats.useQuery(
    { accountId: accountId! },
    { enabled: !!accountId }
  )

  const followerFormatted = followerData.map((d) => ({
    ...d,
    date: d.date instanceof Date ? d.date.toISOString() : String(d.date),
    label: d.date instanceof Date ? format(d.date, "MMM d") : d.date,
  }))

  const engFormatted = engagementData.map((d: any) => ({
    ...d,
    date: d.date instanceof Date ? d.date.toISOString() : String(d.date),
    label: d.date instanceof Date ? format(d.date, "MMM d") : d.date,
    rate: Number(((d.engagementRate ?? 0) / 100).toFixed(2)),
  }))

  const handleExport = () => {
    const snapshots: FollowerSnapshot[] = followerData.map((d) => ({
      date: d.date,
      followerCount: d.followerCount,
      followerDelta: (d as { followerDelta?: number }).followerDelta,
      engagementRate: (d as { engagementRate?: number }).engagementRate,
      avgLikes: (d as { avgLikes?: number }).avgLikes,
      avgRetweets: (d as { avgRetweets?: number }).avgRetweets,
    }))
    exportToCsv(
      analyticsToRows(snapshots),
      `cryptoscope-analytics-${days}d-${new Date().toISOString().split("T")[0]}`
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Range selector */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-muted-foreground">Analytics for @{accounts?.[0]?.username ?? "—"}</p>
        <div className="flex items-center gap-2">
          {/* Export button */}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-2 px-3 text-xs font-medium border border-white/[0.06] bg-white/[0.03] text-muted-foreground hover:text-foreground"
            onClick={handleExport}
            disabled={followerData.length === 0}
          >
            <DownloadIcon className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          {/* Range toggles */}
          <div className="flex gap-1 p-1 rounded-lg bg-muted/50 border border-white/[0.06]">
            {RANGE_OPTIONS.map((r) => (
              <Button
                key={r.value}
                size="sm"
                variant="ghost"
                className={`h-7 px-3 text-xs font-semibold transition-all ${
                  days === r.value
                    ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/25"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => {
                  setDays(r.value)
                  setPeriod(r.value === 7 ? "7d" : r.value === 30 ? "30d" : "90d")
                }}
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Total Followers"
          value={accounts?.[0]?.followerCount ?? 0}
          icon={<TrendingUpIcon className="h-4 w-4" />}
          loading={flLoading}
          highlight
        />
        <StatsCard
          title="Avg Likes/Tweet"
          value={stats?.latestSnapshot?.avgLikes ?? 0}
          icon={<HeartIcon className="h-4 w-4" />}
        />
        <StatsCard
          title="Avg Retweets"
          value={stats?.latestSnapshot?.avgRetweets ?? 0}
          icon={<RepeatIcon className="h-4 w-4" />}
        />
        <StatsCard
          title="Mentions (7d)"
          value={stats?.mentionCount7d ?? 0}
          icon={<AtSignIcon className="h-4 w-4" />}
        />
      </div>

      {/* Charts row */}
      <div className="grid xl:grid-cols-2 gap-6">
        {/* Follower growth */}
        <SectionCard title="Follower Growth" description={`Last ${days} days`}>
          {followerFormatted.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={followerFormatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="follGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "hsl(240 5% 45%)", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: "hsl(240 5% 45%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(249,115,22,0.2)", strokeWidth: 1 }} />
                <Area type="monotone" dataKey="followerCount" name="followers" stroke="#f97316" strokeWidth={2} fill="url(#follGrad)" dot={false} activeDot={{ r: 4, fill: "#f97316", stroke: "#0a0a0a", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        {/* Engagement rate */}
        <SectionCard title="Engagement Rate" description="Daily average (%)">
          {engFormatted.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={engFormatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "hsl(240 5% 45%)", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: "hsl(240 5% 45%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(168,85,247,0.2)", strokeWidth: 1 }} />
                <Area type="monotone" dataKey="rate" name="engagement" stroke="#a855f7" strokeWidth={2} fill="url(#engGrad)" dot={false} activeDot={{ r: 4, fill: "#a855f7", stroke: "#0a0a0a", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      {/* Bottom row */}
      <div className="grid xl:grid-cols-2 gap-6">
        {/* Best posting times */}
        <SectionCard
          title="Best Posting Times"
          description="Hours with highest average engagement"
        >
          {!bestTimes?.length ? (
            <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
              Not enough data yet
            </div>
          ) : (
            <div className="space-y-2">
              {bestTimes.slice(0, 5).map((t: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-20 shrink-0">
                    <ClockIcon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium">
                      {t.hour === 0 ? "12 AM" : t.hour < 12 ? `${t.hour} AM` : t.hour === 12 ? "12 PM" : `${t.hour - 12} PM`}
                    </span>
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
                      style={{ width: `${Math.min(100, (t.avgEngagement / (bestTimes[0]?.avgEngagement ?? 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {t.avgEngagement?.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Hashtag performance */}
        <SectionCard title="Top Hashtags" description="By tweet count">
          {!hashtags?.length ? (
            <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
              No hashtag data yet
            </div>
          ) : (
            <div className="space-y-2">
              {hashtags.slice(0, 6).map((tag: any) => (
                <div key={tag.hashtag} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                  <div className="flex items-center gap-2">
                    <HashIcon className="h-3.5 w-3.5 text-orange-400" />
                    <span className="text-sm font-medium">{tag.hashtag}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{tag.tweetCount} tweets</span>
                    <Badge variant="outline" className="text-[10px] border-white/10 text-muted-foreground">
                      {tag.avgEngagement?.toFixed(1)}% eng
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
