"use client"

import { HeartIcon, RepeatIcon, MessageCircleIcon, EyeIcon, ExternalLinkIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Tweet {
  id: string
  text: string
  likeCount: number
  retweetCount: number
  replyCount: number
  quoteCount?: number
  impressionCount?: number | null
  bookmarkCount?: number | null
  engagementScore: number | null
  publishedAt: Date | string | null
  isRetweet?: boolean
  mediaUrls?: string[] | null
  hashtags?: string[] | null
  mentionedUsers?: string[] | null
  isThread?: boolean
  threadPosition?: number | null
  createdAt?: Date
  updatedAt?: Date
  accountId?: string
}

function StatPill({ icon, value, className }: { icon: React.ReactNode; value: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-1 text-xs text-muted-foreground", className)}>
      {icon}
      <span>
        {value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value}
      </span>
    </div>
  )
}

function scoreToColor(score: number) {
  if (score >= 80) return "text-orange-400 bg-orange-500/10 border-orange-500/20"
  if (score >= 50) return "text-amber-400 bg-amber-500/10 border-amber-500/20"
  if (score >= 20) return "text-blue-400 bg-blue-500/10 border-blue-500/20"
  return "text-muted-foreground bg-muted border-border"
}

export function TopTweetsTable({ tweets }: { tweets: Tweet[] }) {
  if (!tweets.length) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-card p-8 text-center">
        <MessageCircleIcon className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No tweets tracked yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Connect your account to start tracking performance</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
        <div>
          <h3 className="text-sm font-semibold">Top Performing Tweets</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Last 30 days</p>
        </div>
        <Badge variant="outline" className="text-xs border-white/10 text-muted-foreground">
          {tweets.length} tweets
        </Badge>
      </div>

      {/* Table */}
      <div className="divide-y divide-white/[0.04]">
        {tweets.map((tweet, idx) => (
          <div
            key={tweet.id}
            className="flex items-start gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors group"
          >
            {/* Rank */}
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground mt-0.5">
              {idx + 1}
            </div>

            {/* Tweet text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground/90 leading-relaxed line-clamp-2">
                {tweet.text}
              </p>
              <div className="flex items-center gap-4 mt-2.5">
                <StatPill
                  icon={<HeartIcon className="h-3 w-3 text-pink-500" />}
                  value={tweet.likeCount}
                />
                <StatPill
                  icon={<RepeatIcon className="h-3 w-3 text-emerald-500" />}
                  value={tweet.retweetCount}
                />
                <StatPill
                  icon={<MessageCircleIcon className="h-3 w-3 text-blue-500" />}
                  value={tweet.replyCount}
                />
                {tweet.impressionCount != null && (
                  <StatPill
                    icon={<EyeIcon className="h-3 w-3" />}
                    value={tweet.impressionCount}
                  />
                )}
                <span className="text-[10px] text-muted-foreground/50">
                  {tweet.publishedAt ? new Date(tweet.publishedAt).toLocaleDateString() : ""}
                </span>
              </div>
            </div>

            {/* Score + link */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <Badge
                variant="outline"
                className={cn("text-[10px] font-semibold px-2", scoreToColor(tweet.engagementScore ?? 0))}
              >
                {tweet.engagementScore ?? 0}
              </Badge>
              <a
                href={`https://twitter.com/i/web/status/${tweet.id}`}
                target="_blank"
                rel="noreferrer"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ExternalLinkIcon className="h-3.5 w-3.5 text-muted-foreground hover:text-orange-400 transition-colors" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
