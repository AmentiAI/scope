"use client"

import { useState } from "react"
import { api } from "@/lib/trpc/client"
import { MentionsFeed } from "@/components/dashboard/MentionsFeed"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type SentimentFilter = "all" | "positive" | "negative" | "neutral"

export default function MentionsPage() {
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>("all")

  const { data: accounts } = api.analytics.getAccounts.useQuery()
  const accountId = accounts?.[0]?.id

  const { data: mentions = [], isLoading } = api.analytics.getMentions.useQuery(
    {
      accountId: accountId!,
      days: 7,
      sentiment: sentimentFilter === "all" ? undefined : sentimentFilter,
      limit: 50,
    },
    { enabled: !!accountId }
  )

  const { data: sentimentOverview = [] } = api.analytics.getSentimentOverview.useQuery(
    { accountId: accountId!, days: 7 },
    { enabled: !!accountId }
  )

  const sentimentCounts = sentimentOverview.reduce<Record<string, number>>((acc, item) => {
    if (item.sentiment) acc[item.sentiment] = Number(item.count)
    return acc
  }, {})

  const totalMentions = Object.values(sentimentCounts).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      {/* Sentiment summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", count: totalMentions, color: "text-foreground" },
          { label: "Positive", count: sentimentCounts.positive ?? 0, color: "text-green-500" },
          { label: "Negative", count: sentimentCounts.negative ?? 0, color: "text-red-500" },
          { label: "Neutral", count: sentimentCounts.neutral ?? 0, color: "text-muted-foreground" },
        ].map(({ label, count, color }) => (
          <Card key={label}>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${color}`}>{count.toLocaleString()}</p>
              {totalMentions > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {((count / totalMentions) * 100).toFixed(0)}% of total
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtered mentions feed */}
      <Tabs value={sentimentFilter} onValueChange={(v) => setSentimentFilter(v as SentimentFilter)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="positive">Positive</TabsTrigger>
          <TabsTrigger value="negative">Negative</TabsTrigger>
          <TabsTrigger value="neutral">Neutral</TabsTrigger>
        </TabsList>

        <TabsContent value={sentimentFilter} className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <MentionsFeed mentions={mentions} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
