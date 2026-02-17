"use client"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface HashtagData {
  hashtag: string
  tweetCount: number | null
  avgEngagement: number | null
  totalLikes: number | null
}

interface HashtagPerformanceProps {
  hashtags: HashtagData[]
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-border bg-background p-3 shadow-lg text-sm space-y-1">
      <p className="font-medium">#{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          <span className="text-muted-foreground">{entry.name}: </span>
          {Number(entry.value).toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export function HashtagPerformance({ hashtags }: HashtagPerformanceProps) {
  const data = hashtags
    .slice(0, 15)
    .map((h) => ({
      hashtag: h.hashtag.replace(/^#/, ""),
      avgEngagement: h.avgEngagement ?? 0,
      totalLikes: h.totalLikes ?? 0,
      tweetCount: h.tweetCount ?? 0,
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Hashtag Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
            No hashtag data yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(data.length * 36, 200)}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="hashtag"
                type="category"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={100}
                tickFormatter={(v) => `#${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="avgEngagement"
                name="Avg Engagement"
                fill="#f97316"
                radius={[0, 2, 2, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
