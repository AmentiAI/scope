"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { format, parseISO } from "date-fns"
import { TrendingUpIcon } from "lucide-react"

interface DataPoint {
  date: string
  followers: number
  delta: number
}

interface FollowerChartProps {
  data: DataPoint[]
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload as DataPoint

  return (
    <div className="rounded-xl border border-white/10 bg-card/95 backdrop-blur-xl px-4 py-3 shadow-2xl">
      <p className="text-[11px] text-muted-foreground mb-2">
        {label ? format(parseISO(label), "MMM d, yyyy") : ""}
      </p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-6">
          <span className="text-xs text-muted-foreground">Followers</span>
          <span className="text-sm font-bold text-white">
            {d?.followers?.toLocaleString() ?? 0}
          </span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-xs text-muted-foreground">Daily Gain</span>
          <span
            className={`text-sm font-semibold ${
              (d?.delta ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {(d?.delta ?? 0) >= 0 ? "+" : ""}
            {d?.delta ?? 0}
          </span>
        </div>
      </div>
    </div>
  )
}

export function FollowerChart({ data }: FollowerChartProps) {
  const isEmpty = !data || data.length === 0

  const totalGain = data.reduce((sum, d) => sum + (d.delta ?? 0), 0)
  const isPositive = totalGain >= 0

  // Format X axis dates
  const formatted = data.map((d) => ({
    ...d,
    label: d.date ? format(parseISO(d.date), "MMM d") : "",
  }))

  return (
    <div className="rounded-xl border border-white/[0.06] bg-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold">Follower Growth</h3>
          <p className="text-xs text-muted-foreground mt-0.5">30-day trend</p>
        </div>
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            isPositive
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          <TrendingUpIcon className="h-3 w-3" />
          {isPositive ? "+" : ""}{totalGain.toLocaleString()} total
        </div>
      </div>

      {isEmpty ? (
        <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
          No data yet — connect your Twitter account to start tracking
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="followerGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="70%" stopColor="#f97316" stopOpacity={0.05} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "hsl(240 5% 45%)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "hsl(240 5% 45%)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(249,115,22,0.2)", strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="followers"
              stroke="#f97316"
              strokeWidth={2}
              fill="url(#followerGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#f97316", stroke: "#1a0a00", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
