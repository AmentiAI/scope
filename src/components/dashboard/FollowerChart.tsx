"use client"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
} from "recharts"
import { format, parseISO } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DataPoint {
  date: string
  followers: number
  delta: number
}

interface FollowerChartProps {
  data: DataPoint[]
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null

  const date = label ? format(new Date(label), "MMM d, yyyy") : ""
  const followers = payload[0]?.value ?? 0
  const delta = payload[0]?.payload?.delta ?? 0

  return (
    <div className="rounded-lg border border-border bg-background p-3 shadow-lg text-sm">
      <p className="font-medium mb-1">{date}</p>
      <p className="text-foreground">
        <span className="text-muted-foreground">Followers: </span>
        {Number(followers).toLocaleString()}
      </p>
      <p className={delta >= 0 ? "text-green-500" : "text-red-500"}>
        {delta >= 0 ? "+" : ""}
        {delta.toLocaleString()} today
      </p>
    </div>
  )
}

export function FollowerChart({ data }: FollowerChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    dateLabel: d.date,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Follower Growth</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
            No data available yet. Sync your account to see growth.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="dateLabel"
                tickFormatter={(v) => {
                  try {
                    return format(new Date(v), "MMM d")
                  } catch {
                    return v
                  }
                }}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)}
                width={48}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="followers"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#f97316" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
