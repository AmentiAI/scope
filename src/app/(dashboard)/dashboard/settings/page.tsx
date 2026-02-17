"use client"

import { api } from "@/lib/trpc/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Twitter,
  LinkIcon,
  UnlinkIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default function SettingsPage() {
  const { data: accounts = [], isLoading } = api.analytics.getAccounts.useQuery()

  const handleConnectTwitter = () => {
    // Clerk OAuth redirect for Twitter
    window.location.href = "/api/oauth/twitter"
  }

  const handleDisconnect = (accountId: string) => {
    if (confirm("Disconnect this Twitter account? All synced data will be removed.")) {
      // Would call a disconnect mutation
      console.log("Disconnecting", accountId)
    }
  }

  const handleDeleteAccount = () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action is permanent and cannot be undone."
      )
    ) {
      // Would call account deletion
      console.log("Delete account")
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Connected accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Twitter className="h-4 w-4 text-sky-500" />
            Connected Twitter Accounts
          </CardTitle>
          <CardDescription>
            Manage the Twitter accounts you&apos;re tracking.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <div className="border border-dashed rounded-lg p-6 text-center space-y-3">
              <p className="text-muted-foreground text-sm">
                No Twitter accounts connected yet.
              </p>
              <Button
                className="bg-sky-500 hover:bg-sky-600 text-white"
                onClick={handleConnectTwitter}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Connect Twitter Account
              </Button>
            </div>
          ) : (
            <>
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={account.avatarUrl ?? undefined} />
                    <AvatarFallback>
                      {account.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">@{account.username}</p>
                      {account.isActive ? (
                        <Badge className="text-xs h-5 bg-green-600 hover:bg-green-700">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs h-5">
                          Paused
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {account.followerCount?.toLocaleString()} followers ·{" "}
                      Last synced{" "}
                      {account.lastSyncedAt
                        ? formatDistanceToNow(new Date(account.lastSyncedAt), {
                            addSuffix: true,
                          })
                        : "never"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
                    onClick={() => handleDisconnect(account.id)}
                  >
                    <UnlinkIcon className="h-4 w-4 mr-1.5" />
                    Disconnect
                  </Button>
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={handleConnectTwitter}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Add Another Account
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Danger zone */}
      <Card className="border-red-500/30">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-red-500 flex items-center gap-2">
            <AlertTriangleIcon className="h-4 w-4" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanent and irreversible actions. Proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/20 bg-red-500/5">
            <div>
              <p className="font-medium text-sm">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
