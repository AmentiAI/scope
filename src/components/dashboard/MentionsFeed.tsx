"use client"

import { formatDistanceToNow } from "date-fns"
import { HeartIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Mention {
  id: string
  authorUsername: string
  authorName: string | null
  authorAvatarUrl: string | null
  text: string
  likeCount: number | null
  sentiment: string | null
  publishedAt: Date | string
}

interface MentionsFeedProps {
  mentions: Mention[]
}

function sentimentVariant(sentiment: string | null): "default" | "secondary" | "destructive" | "outline" {
  if (sentiment === "positive") return "default"
  if (sentiment === "negative") return "destructive"
  return "secondary"
}

function sentimentLabel(sentiment: string | null): string {
  if (sentiment === "positive") return "Positive"
  if (sentiment === "negative") return "Negative"
  return "Neutral"
}

export function MentionsFeed({ mentions }: MentionsFeedProps) {
  if (mentions.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground text-sm rounded-lg border border-dashed">
        No mentions found for this period.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {mentions.map((mention) => (
        <div
          key={mention.id}
          className="flex gap-3 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
        >
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage
              src={mention.authorAvatarUrl ?? undefined}
              alt={mention.authorName ?? mention.authorUsername}
            />
            <AvatarFallback>
              {(mention.authorName ?? mention.authorUsername).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">
                {mention.authorName ?? mention.authorUsername}
              </span>
              <span className="text-muted-foreground text-xs">
                @{mention.authorUsername}
              </span>
              <Badge
                variant={sentimentVariant(mention.sentiment)}
                className={cn(
                  "text-xs py-0 h-5",
                  mention.sentiment === "positive" && "bg-green-600 hover:bg-green-700"
                )}
              >
                {sentimentLabel(mention.sentiment)}
              </Badge>
            </div>

            <p className="text-sm text-foreground/90 mt-1 leading-snug">
              {mention.text}
            </p>

            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(mention.publishedAt), { addSuffix: true })}
              </span>
              {mention.likeCount !== null && mention.likeCount > 0 && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <HeartIcon className="h-3 w-3 text-pink-500" />
                  {mention.likeCount}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
