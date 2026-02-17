/**
 * CSV Export Utility
 * Functions to format data and trigger browser downloads
 */

// ─── Core export engine ──────────────────────────────────────────────────────

export function exportToCsv(rows: Record<string, unknown>[], filename: string): void {
  if (rows.length === 0) return

  const headers = Object.keys(rows[0])
  const csvLines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h]
          if (val === null || val === undefined) return ""
          const str = String(val)
          // Escape quotes and wrap in quotes if needed
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return str
        })
        .join(",")
    ),
  ]

  const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ─── Data formatters ─────────────────────────────────────────────────────────

export interface FollowerSnapshot {
  date: Date | string
  followerCount: number
  followerDelta?: number | null
  engagementRate?: number | null
  avgLikes?: number | null
  avgRetweets?: number | null
  avgReplies?: number | null
  avgImpressions?: number | null
}

export function analyticsToRows(snapshots: FollowerSnapshot[]): Record<string, unknown>[] {
  return snapshots.map((s) => ({
    Date: s.date instanceof Date ? s.date.toISOString().split("T")[0] : String(s.date),
    "Follower Count": s.followerCount,
    "Follower Delta": s.followerDelta ?? 0,
    "Engagement Rate (bps)": s.engagementRate ?? 0,
    "Avg Likes": s.avgLikes ?? 0,
    "Avg Retweets": s.avgRetweets ?? 0,
    "Avg Replies": s.avgReplies ?? 0,
    "Avg Impressions": s.avgImpressions ?? 0,
  }))
}

export interface TweetRow {
  id: string
  text: string
  likeCount: number
  retweetCount: number
  replyCount: number
  quoteCount?: number | null
  impressionCount?: number | null
  engagementScore?: number | null
  hashtags?: string[] | null
  publishedAt: Date | string
}

export function tweetsToRows(tweets: TweetRow[]): Record<string, unknown>[] {
  return tweets.map((t) => ({
    "Tweet ID": t.id,
    Text: t.text,
    Likes: t.likeCount,
    Retweets: t.retweetCount,
    Replies: t.replyCount,
    Quotes: t.quoteCount ?? 0,
    Impressions: t.impressionCount ?? 0,
    "Engagement Score": t.engagementScore ?? 0,
    Hashtags: (t.hashtags ?? []).join(" "),
    "Published At": t.publishedAt instanceof Date
      ? t.publishedAt.toISOString()
      : String(t.publishedAt),
  }))
}

export interface MentionRow {
  id: string
  authorUsername: string
  authorName?: string | null
  authorFollowerCount?: number | null
  text: string
  likeCount?: number | null
  retweetCount?: number | null
  sentiment?: string | null
  sentimentScore?: number | null
  publishedAt: Date | string
}

export function mentionsToRows(mentions: MentionRow[]): Record<string, unknown>[] {
  return mentions.map((m) => ({
    "Mention ID": m.id,
    Author: `@${m.authorUsername}`,
    "Author Name": m.authorName ?? "",
    "Author Followers": m.authorFollowerCount ?? 0,
    Text: m.text,
    Likes: m.likeCount ?? 0,
    Retweets: m.retweetCount ?? 0,
    Sentiment: m.sentiment ?? "neutral",
    "Sentiment Score": m.sentimentScore ?? 0,
    "Published At": m.publishedAt instanceof Date
      ? m.publishedAt.toISOString()
      : String(m.publishedAt),
  }))
}
