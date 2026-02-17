"use client"

import { api } from "@/lib/trpc/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FollowerChart } from "@/components/dashboard/FollowerChart"
import { EngagementChart } from "@/components/dashboard/EngagementChart"
import { TopTweetsTable } from "@/components/dashboard/TopTweetsTable"
import { HashtagPerformance } from "@/components/dashboard/HashtagPerformance"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AnalyticsPage() {
  const { data: accounts } = api.analytics.getAccounts.useQuery()
  const accountId = accounts?.[0]?.id

  const { data: followerData = [], isLoading: followerLoading } =
    api.analytics.getFollowerGrowth.useQuery(
      { accountId: accountId!, days: 30 },
      { enabled: !!accountId }
    )

  const { data: engagementData = [], isLoading: engagementLoading } =
    api.analytics.getEngagement.useQuery(
      { accountId: accountId!, days: 30 },
      { enabled: !!accountId }
    )

  const { data: topTweets = [], isLoading: tweetsLoading } =
    api.analytics.getTopTweets.useQuery(
      { accountId: accountId!, days: 30, limit: 20 },
      { enabled: !!accountId }
    )

  const { data: bestTimes, isLoading: timesLoading } =
    api.analytics.getBestPostingTimes.useQuery(
      { accountId: accountId! },
      { enabled: !!accountId }
    )

  const { data: hashtags = [], isLoading: hashtagsLoading } =
    api.analytics.getHashtagPerformance.useQuery(
      { accountId: accountId!, period: "30d" },
      { enabled: !!accountId }
    )

  const followerChartData = followerData.map((d) => ({
    date: d.date instanceof Date ? d.date.toISOString() : String(d.date),
    followers: d.followerCount,
    delta: d.followerDelta ?? 0,
  }))

  const engagementChartData = engagementData.map((d) => ({
    date: d.date instanceof Date ? d.date.toISOString() : String(d.date),
    likes: d.avgLikes ?? 0,
    retweets: d.avgRetweets ?? 0,
    replies: d.avgReplies ?? 0,
  }))

  if (!accountId) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Connect a Twitter account to see analytics.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tweets">Tweets</TabsTrigger>
          <TabsTrigger value="timing">Timing</TabsTrigger>
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {followerLoading ? (
              <Skeleton className="h-72" />
            ) : (
              <FollowerChart data={followerChartData} />
            )}
            {engagementLoading ? (
              <Skeleton className="h-72" />
            ) : (
              <EngagementChart data={engagementChartData} />
            )}
          </div>
          {hashtagsLoading ? (
            <Skeleton className="h-72" />
          ) : (
            <HashtagPerformance hashtags={hashtags} />
          )}
        </TabsContent>

        {/* Tweets tab */}
        <TabsContent value="tweets" className="mt-6">
          {tweetsLoading ? (
            <Skeleton className="h-96" />
          ) : (
            <TopTweetsTable tweets={topTweets} />
          )}
        </TabsContent>

        {/* Timing tab */}
        <TabsContent value="timing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Best Posting Times
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timesLoading ? (
                <Skeleton className="h-48" />
              ) : !bestTimes ? (
                <p className="text-muted-foreground text-sm">
                  Not enough data yet. Post more tweets to unlock timing insights.
                </p>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Based on your last 90 days of tweet performance.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(bestTimes as Array<{ hour: number; avgEngagement: number; tweetCount?: number }>).slice(0, 8).map((slot) => (
                      <div
                        key={slot.hour}
                        className="rounded-lg border border-border p-3 text-center"
                      >
                        <p className="font-semibold text-lg">
                          {`${String(slot.hour).padStart(2, "0")}:00`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          avg score: {Number(slot.avgEngagement).toFixed(0)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
