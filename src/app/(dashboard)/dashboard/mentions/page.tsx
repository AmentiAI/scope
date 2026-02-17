"use client"

import { useState } from "react"
import { api } from "@/lib/trpc/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AtSignIcon,
  SmileIcon,
  FrownIcon,
  MinusIcon,
  ExternalLinkIcon,
  HeartIcon,
  RepeatIcon,
  SearchIcon,
  UsersIcon,
  TrophyIcon,
  ZapIcon,
} from "lucide-react"
import { StatsCard } from "@/components/dashboard/StatsCard"

const SENTIMENT_CONFIG = {
  positive: {
    icon: SmileIcon,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    label: "Positive",
  },
  negative: {
    icon: FrownIcon,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    label: "Negative",
  },
  neutral: {
    icon: MinusIcon,
    color: "text-muted-foreground",
    bg: "bg-muted border-border",
    label: "Neutral",
  },
}

export default function MentionsPage() {
  const [search, setSearch] = useState("")
  const [sentiment, setSentiment] = useState<string>("all")

  const { data: accounts } = api.analytics.getAccounts.useQuery()
  const accountId = accounts?.[0]?.id

  const { data: mentionsData, isLoading } = api.community.getMentions.useQuery(
    {
      accountId: accountId!,
      sentiment: sentiment !== "all" ? (sentiment as any) : undefined,
      limit: 50,
    },
    { enabled: !!accountId }
  )
  const mentions = mentionsData?.mentions ?? []

  const { data: topMentioners = [] } = api.community.getTopMentioners.useQuery(
    { accountId: accountId!, limit: 5 },
    { enabled: !!accountId }
  )

  const { data: topFans = [] } = api.community.getTopFans.useQuery(
    { accountId: accountId!, limit: 5 },
    { enabled: !!accountId }
  )

  const { data: sentimentBreakdown } = api.community.getSentimentBreakdown.useQuery(
    { accountId: accountId! },
    { enabled: !!accountId }
  )

  const filtered = mentions.filter(
    (m: any) =>
      !search ||
      m.text.toLowerCase().includes(search.toLowerCase()) ||
      m.authorUsername?.toLowerCase().includes(search.toLowerCase())
  )

  const total = sentimentBreakdown?.total ?? 0
  const getSentCount = (s: string) =>
    sentimentBreakdown?.breakdown.find((b) => b.sentiment === s)?.count ?? 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Positive Mentions"
          value={getSentCount("positive")}
          icon={<SmileIcon className="h-4 w-4" />}
          description={total > 0 ? `${Math.round((getSentCount("positive") / total) * 100)}% of total` : ""}
        />
        <StatsCard
          title="Neutral Mentions"
          value={getSentCount("neutral")}
          icon={<MinusIcon className="h-4 w-4" />}
        />
        <StatsCard
          title="Negative Mentions"
          value={getSentCount("negative")}
          icon={<FrownIcon className="h-4 w-4" />}
        />
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        {/* Mentions feed */}
        <div className="xl:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search mentions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-card border-white/[0.08] h-9 text-sm"
              />
            </div>
            <div className="flex gap-1 p-1 rounded-lg bg-muted/50 border border-white/[0.06]">
              {["all", "positive", "neutral", "negative"].map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant="ghost"
                  className={`h-7 px-3 text-xs font-medium capitalize transition-all ${
                    sentiment === s
                      ? "bg-orange-500/20 text-orange-400"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setSentiment(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>

          {/* Feed */}
          <div className="rounded-xl border border-white/[0.06] bg-card overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Loading mentions…</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <AtSignIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No mentions found</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {filtered.map((m: any) => {
                  const sConf = SENTIMENT_CONFIG[m.sentiment as keyof typeof SENTIMENT_CONFIG] ?? SENTIMENT_CONFIG.neutral
                  const SIcon = sConf.icon
                  return (
                    <div key={m.id} className="flex gap-3 p-4 hover:bg-white/[0.02] transition-colors group">
                      {/* Sentiment icon */}
                      <div className={`shrink-0 mt-0.5 h-7 w-7 rounded-lg flex items-center justify-center border ${sConf.bg}`}>
                        <SIcon className={`h-3.5 w-3.5 ${sConf.color}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold">@{m.authorUsername ?? "unknown"}</span>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border ${sConf.bg} ${sConf.color}`}>
                            {sConf.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {m.publishedAt ? new Date(m.publishedAt).toLocaleDateString() : ""}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{m.text}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <HeartIcon className="h-3 w-3 text-pink-500" />
                            {m.likeCount ?? 0}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <RepeatIcon className="h-3 w-3 text-emerald-500" />
                            {m.retweetCount ?? 0}
                          </div>
                        </div>
                      </div>

                      <a
                        href={`https://twitter.com/i/web/status/${m.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                      >
                        <ExternalLinkIcon className="h-4 w-4 text-muted-foreground hover:text-orange-400 transition-colors" />
                      </a>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Top mentioners */}
          <div className="rounded-xl border border-white/[0.06] bg-card overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.04]">
              <UsersIcon className="h-4 w-4 text-orange-400" />
              <h3 className="text-sm font-semibold">Top Mentioners</h3>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {!topMentioners.length ? (
                <p className="p-4 text-xs text-muted-foreground text-center">No data yet</p>
              ) : topMentioners.map((u: any, i: number) => (
                <div key={u.username} className="flex items-center gap-3 px-4 py-3">
                  <div className="h-6 w-6 rounded-md bg-orange-500/10 flex items-center justify-center text-xs font-bold text-orange-400">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">@{u.username}</p>
                    <p className="text-[10px] text-muted-foreground">{u.mentionCount} mentions</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-white/10">
                    {u.followerCount?.toLocaleString()}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Top fans */}
          <div className="rounded-xl border border-white/[0.06] bg-card overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.04]">
              <TrophyIcon className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold">Top Fans</h3>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {!topFans.length ? (
                <p className="p-4 text-xs text-muted-foreground text-center">No data yet</p>
              ) : topFans.map((f: any, i: number) => (
                <div key={f.id ?? i} className="flex items-center gap-3 px-4 py-3">
                  <div className="h-6 w-6 rounded-md bg-amber-500/10 flex items-center justify-center text-xs font-bold text-amber-400">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">@{f.username}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">{f.engagementScore} pts</span>
                    </div>
                  </div>
                  <ZapIcon className="h-3 w-3 text-amber-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Sentiment breakdown */}
          {sentimentBreakdown && total > 0 && (
            <div className="rounded-xl border border-white/[0.06] bg-card p-5">
              <h3 className="text-sm font-semibold mb-4">Sentiment Breakdown</h3>
              <div className="space-y-3">
                {[
                  { label: "Positive", value: getSentCount("positive"), color: "bg-emerald-500" },
                  { label: "Neutral", value: getSentCount("neutral"), color: "bg-gray-500" },
                  { label: "Negative", value: getSentCount("negative"), color: "bg-red-500" },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{Math.round((value / total) * 100)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color}`}
                        style={{ width: `${Math.round((value / total) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
