"use client"

import { cn } from "@/lib/utils"
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { ReactNode } from "react"

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  icon: ReactNode
  loading?: boolean
  suffix?: string
  description?: string
  highlight?: boolean
}

function formatValue(v: string | number): string {
  if (typeof v === "string") return v
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`
  return v.toLocaleString()
}

export function StatsCard({
  title,
  value,
  change,
  icon,
  loading = false,
  suffix,
  description,
  highlight = false,
}: StatsCardProps) {
  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0
  const isNeutral = change !== undefined && change === 0

  return (
    <div
      className={cn(
        "stat-card relative rounded-xl border bg-card p-5 overflow-hidden shine",
        highlight && "gradient-border"
      )}
    >
      {/* Subtle bg glow for highlight cards */}
      {highlight && (
        <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-orange-500/10 blur-2xl pointer-events-none" />
      )}

      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            highlight
              ? "bg-gradient-to-br from-orange-500 to-amber-600 text-white"
              : "bg-muted text-muted-foreground"
          )}
        >
          {icon}
        </div>
      </div>

      {/* Value */}
      {loading ? (
        <Skeleton className="h-8 w-24 mb-2" />
      ) : (
        <div className="mb-2 animate-fade-in">
          <span className={cn("text-3xl font-bold tracking-tight", highlight && "gradient-text")}>
            {formatValue(value)}
          </span>
          {suffix && <span className="ml-1 text-sm text-muted-foreground">{suffix}</span>}
        </div>
      )}

      {/* Change indicator */}
      {loading ? (
        <Skeleton className="h-4 w-20" />
      ) : change !== undefined ? (
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "flex items-center gap-0.5 text-xs font-semibold rounded-full px-1.5 py-0.5",
              isPositive && "text-emerald-400 bg-emerald-500/10",
              isNegative && "text-red-400 bg-red-500/10",
              isNeutral && "text-muted-foreground bg-muted"
            )}
          >
            {isPositive && <TrendingUpIcon className="h-3 w-3" />}
            {isNegative && <TrendingDownIcon className="h-3 w-3" />}
            {isNeutral && <MinusIcon className="h-3 w-3" />}
            {isPositive && "+"}
            {change.toFixed(1)}%
          </div>
          <span className="text-xs text-muted-foreground">vs last period</span>
        </div>
      ) : description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}
