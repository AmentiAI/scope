"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { ArrowUpDownIcon, HeartIcon, Repeat2Icon, MessageSquareIcon } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Tweet {
  id: string
  text: string
  likeCount: number
  retweetCount: number
  replyCount: number
  engagementScore: number | null
  publishedAt: Date | string
}

interface TopTweetsTableProps {
  tweets: Tweet[]
}

type SortKey = "engagementScore" | "likeCount" | "retweetCount"

export function TopTweetsTable({ tweets }: TopTweetsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("engagementScore")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const sorted = [...tweets].sort((a, b) => {
    const aVal = (a[sortKey] as number | null) ?? 0
    const bVal = (b[sortKey] as number | null) ?? 0
    return sortDir === "asc" ? aVal - bVal : bVal - aVal
  })

  const truncate = (text: string, maxLen = 120) =>
    text.length > maxLen ? text.slice(0, maxLen) + "…" : text

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Top Tweets</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {tweets.length === 0 ? (
          <div className="flex h-24 items-center justify-center text-muted-foreground text-sm p-6">
            No tweets found for this period.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Tweet</TableHead>
                <TableHead className="w-24 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 flex items-center gap-1 ml-auto"
                    onClick={() => toggleSort("likeCount")}
                  >
                    <HeartIcon className="h-3 w-3 text-pink-500" />
                    <ArrowUpDownIcon className="h-3 w-3 opacity-50" />
                  </Button>
                </TableHead>
                <TableHead className="w-24 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 flex items-center gap-1 ml-auto"
                    onClick={() => toggleSort("retweetCount")}
                  >
                    <Repeat2Icon className="h-3 w-3 text-blue-500" />
                    <ArrowUpDownIcon className="h-3 w-3 opacity-50" />
                  </Button>
                </TableHead>
                <TableHead className="w-24 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 flex items-center gap-1 ml-auto"
                    onClick={() => toggleSort("engagementScore")}
                  >
                    Score
                    <ArrowUpDownIcon className="h-3 w-3 opacity-50" />
                  </Button>
                </TableHead>
                <TableHead className="w-28 text-right pr-6">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((tweet) => (
                <TableRow key={tweet.id}>
                  <TableCell className="pl-6 max-w-sm">
                    <p className="text-sm text-foreground leading-snug">
                      {truncate(tweet.text)}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="flex items-center justify-end gap-1 text-sm">
                      <HeartIcon className="h-3 w-3 text-pink-500" />
                      {tweet.likeCount.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="flex items-center justify-end gap-1 text-sm">
                      <Repeat2Icon className="h-3 w-3 text-blue-500" />
                      {tweet.retweetCount.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono text-sm text-orange-500">
                      {(tweet.engagementScore ?? 0).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground pr-6">
                    {formatDistanceToNow(new Date(tweet.publishedAt), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
