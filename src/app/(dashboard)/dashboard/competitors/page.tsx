"use client"

import { useState } from "react"
import { api } from "@/lib/trpc/client"
import { CompetitorCompare } from "@/components/dashboard/CompetitorCompare"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PlusIcon, AlertCircleIcon } from "lucide-react"

export default function CompetitorsPage() {
  const [username, setUsername] = useState("")
  const [error, setError] = useState<string | null>(null)

  const { data: accounts } = api.analytics.getAccounts.useQuery()
  const accountId = accounts?.[0]?.id

  const { data: stats, isLoading: statsLoading } =
    api.analytics.getDashboardStats.useQuery(
      { accountId: accountId! },
      { enabled: !!accountId }
    )

  // Note: addCompetitor mutation would be added to the analytics router
  // For now we show the UI with placeholder
  const handleAddCompetitor = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return
    setError("Competitor tracking requires a Pro plan or higher.")
    setUsername("")
  }

  const ownAccount = stats?.account

  // Mock competitors based on snapshot data for display
  const competitors: Array<{
    username: string
    followerCount: number
    engagementRate: number
    followerDelta: number
  }> = []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Add competitor form */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Competitor
            </CardTitle>
            <CardDescription>
              Track any public Twitter account and compare against your growth.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCompetitor} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="competitor-username">Twitter Username</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      @
                    </span>
                    <Input
                      id="competitor-username"
                      placeholder="username"
                      className="pl-7"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <Button type="submit" size="icon" className="bg-orange-500 hover:bg-orange-600 text-white">
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md p-3">
                  <AlertCircleIcon className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Pro plan: 5 competitors · Agency plan: 20 competitors
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Comparison */}
        <div className="xl:col-span-2">
          {statsLoading || !ownAccount ? (
            <Skeleton className="h-64" />
          ) : (
            <CompetitorCompare
              own={{
                username: ownAccount.username,
                followerCount: ownAccount.followerCount ?? 0,
                engagementRate: 0,
              }}
              competitors={competitors}
            />
          )}
        </div>
      </div>

      {/* Competitor snapshots table */}
      {competitors.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-muted-foreground text-sm text-center">
              No competitors tracked yet. Add a competitor username above to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
