"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
  TrendingUpIcon,
  FlameIcon,
  AtSignIcon,
  BrainIcon,
  HandshakeIcon,
  ChevronRightIcon,
} from "lucide-react"

export type ActivityType =
  | "follower_gain"
  | "viral_tweet"
  | "new_mention"
  | "agent_task"
  | "crm_deal"

export interface ActivityItem {
  id: string
  type: ActivityType
  description: string
  timestamp: Date
  href?: string
}

const ACTIVITY_ICONS: Record<ActivityType, React.ReactNode> = {
  follower_gain: <TrendingUpIcon className="h-3.5 w-3.5" />,
  viral_tweet: <FlameIcon className="h-3.5 w-3.5" />,
  new_mention: <AtSignIcon className="h-3.5 w-3.5" />,
  agent_task: <BrainIcon className="h-3.5 w-3.5" />,
  crm_deal: <HandshakeIcon className="h-3.5 w-3.5" />,
}

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  follower_gain: "text-green-400 bg-green-500/10 border-green-500/20",
  viral_tweet: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  new_mention: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  agent_task: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  crm_deal: "text-amber-400 bg-amber-500/10 border-amber-500/20",
}

// Mock data shown when no real data available
const MOCK_ITEMS: ActivityItem[] = [
  {
    id: "1",
    type: "follower_gain",
    description: "Gained 247 new followers today",
    timestamp: new Date(Date.now() - 1000 * 60 * 12),
  },
  {
    id: "2",
    type: "viral_tweet",
    description: 'Tweet about #Bitcoin hit 5K impressions',
    timestamp: new Date(Date.now() - 1000 * 60 * 34),
  },
  {
    id: "3",
    type: "new_mention",
    description: "@whale_trader mentioned you in a thread",
    timestamp: new Date(Date.now() - 1000 * 60 * 58),
  },
  {
    id: "4",
    type: "agent_task",
    description: "Agent posted 3 scheduled tweets",
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
  },
  {
    id: "5",
    type: "crm_deal",
    description: "Deal with @cryptofund moved to In Talks",
    timestamp: new Date(Date.now() - 1000 * 60 * 140),
  },
  {
    id: "6",
    type: "new_mention",
    description: "@defi_daily quoted your analysis",
    timestamp: new Date(Date.now() - 1000 * 60 * 200),
  },
  {
    id: "7",
    type: "follower_gain",
    description: "138 new followers from viral thread",
    timestamp: new Date(Date.now() - 1000 * 60 * 260),
  },
  {
    id: "8",
    type: "agent_task",
    description: "Competitor analysis complete",
    timestamp: new Date(Date.now() - 1000 * 60 * 320),
  },
]

interface ActivityFeedProps {
  items?: ActivityItem[]
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  const displayItems = (items && items.length > 0 ? items : MOCK_ITEMS).slice(0, 8)

  return (
    <div className="rounded-xl border border-white/[0.06] bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
        <div>
          <h3 className="text-sm font-semibold">Activity Feed</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Recent system events</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-green-400 font-medium">Live</span>
        </div>
      </div>

      {/* Feed items */}
      <div className="divide-y divide-white/[0.03]">
        {displayItems.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors"
          >
            {/* Icon */}
            <div
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${ACTIVITY_COLORS[item.type]}`}
            >
              {ACTIVITY_ICONS[item.type]}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-foreground/90 leading-snug">
                {item.description}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {formatDistanceToNow(item.timestamp, { addSuffix: true })}
              </p>
            </div>

            {/* Arrow */}
            {item.href && (
              <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0 mt-1" />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-white/[0.04]">
        <Link
          href="/dashboard/analytics"
          className="text-[12px] text-orange-400 hover:text-orange-300 font-medium transition-colors flex items-center gap-1"
        >
          View All Activity
          <ChevronRightIcon className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}
