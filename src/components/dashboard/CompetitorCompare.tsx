"use client"

import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface OwnProfile {
  username: string
  followerCount: number
  engagementRate: number
}

interface Competitor {
  username: string
  followerCount: number
  engagementRate: number
  followerDelta: number
}

interface CompetitorCompareProps {
  own: OwnProfile
  competitors: Competitor[]
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function FollowerBar({
  count,
  max,
  color,
}: {
  count: number
  max: number
  color: string
}) {
  const pct = max === 0 ? 0 : Math.min((count / max) * 100, 100)
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono w-14 text-right text-muted-foreground">
        {formatCount(count)}
      </span>
    </div>
  )
}

export function CompetitorCompare({ own, competitors }: CompetitorCompareProps) {
  const allCounts = [own.followerCount, ...competitors.map((c) => c.followerCount)]
  const maxFollowers = Math.max(...allCounts, 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Competitor Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        {competitors.length === 0 ? (
          <div className="flex h-20 items-center justify-center text-muted-foreground text-sm">
            Add competitors to compare.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 text-xs text-muted-foreground font-medium uppercase tracking-wide pb-1 border-b">
              <span>Account</span>
              <span className="w-28 text-right">Followers</span>
              <span className="w-20 text-right">Eng. Rate</span>
            </div>

            {/* Own account */}
            <div className="space-y-1.5">
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded font-medium">
                    You
                  </span>
                  <span className="font-medium text-sm">@{own.username}</span>
                </div>
                <div className="w-28" />
                <span className="w-20 text-right text-sm font-mono">
                  {(own.engagementRate / 100).toFixed(2)}%
                </span>
              </div>
              <FollowerBar count={own.followerCount} max={maxFollowers} color="bg-orange-500" />
            </div>

            {/* Competitors */}
            {competitors.map((comp) => (
              <div key={comp.username} className="space-y-1.5">
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center">
                  <span className="text-sm text-muted-foreground">@{comp.username}</span>
                  <div className="w-28 flex justify-end">
                    {comp.followerDelta !== 0 && (
                      <span
                        className={cn(
                          "text-xs flex items-center gap-0.5",
                          comp.followerDelta > 0 ? "text-green-500" : "text-red-500"
                        )}
                      >
                        {comp.followerDelta > 0 ? (
                          <ArrowUpIcon className="h-3 w-3" />
                        ) : (
                          <ArrowDownIcon className="h-3 w-3" />
                        )}
                        {Math.abs(comp.followerDelta).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <span className="w-20 text-right text-sm font-mono text-muted-foreground">
                    {(comp.engagementRate / 100).toFixed(2)}%
                  </span>
                </div>
                <FollowerBar count={comp.followerCount} max={maxFollowers} color="bg-blue-500" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
