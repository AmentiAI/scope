"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BellIcon, UsersIcon, ZapIcon, AtSignIcon,
  TrendingUpIcon, BotIcon, CheckCheckIcon, XIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    type: "milestone",
    icon: UsersIcon,
    iconColor: "text-orange-400",
    iconBg: "bg-orange-500/10",
    title: "🎉 10,000 followers reached!",
    description: "Your account hit 10K followers — keep the momentum going!",
    time: "2 min ago",
    unread: true,
  },
  {
    id: "2",
    type: "viral",
    icon: ZapIcon,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
    title: "🔥 Viral tweet detected",
    description: "Your thread on ordinals got 847 likes and 203 retweets in 2 hours.",
    time: "18 min ago",
    unread: true,
  },
  {
    id: "3",
    type: "mention",
    icon: AtSignIcon,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
    title: "New high-value mention",
    description: "@cryptobuilder (89K followers) mentioned you in a thread.",
    time: "1 hr ago",
    unread: true,
  },
  {
    id: "4",
    type: "competitor",
    icon: TrendingUpIcon,
    iconColor: "text-red-400",
    iconBg: "bg-red-500/10",
    title: "Competitor spike alert",
    description: "@ordinalmaxi gained +1,200 followers in the last 24 hours.",
    time: "3 hr ago",
    unread: false,
  },
  {
    id: "5",
    type: "agent",
    icon: BotIcon,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10",
    title: "Agent task completed",
    description: "JarvisAI_01 completed keyword monitoring — 14 new leads found.",
    time: "5 hr ago",
    unread: false,
  },
]

export function NotificationsDrawer() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const unreadCount = notifications.filter((n) => n.unread).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-muted-foreground hover:text-foreground border border-white/[0.06] bg-white/[0.03] rounded-lg"
        >
          <BellIcon className="h-3.5 w-3.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-orange-500 text-[9px] font-bold text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-[380px] border-l border-white/[0.06] bg-background/95 backdrop-blur-xl p-0">
        <SheetHeader className="flex flex-row items-center justify-between px-5 py-4 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <SheetTitle className="text-[15px] font-semibold">Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Badge className="bg-orange-500/20 text-orange-400 border-0 text-xs h-5 px-1.5">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
              onClick={markAllRead}
            >
              <CheckCheckIcon className="h-3 w-3" />
              Mark all read
            </Button>
          )}
        </SheetHeader>

        <div className="overflow-y-auto h-[calc(100vh-73px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <BellIcon className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">All caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex gap-3 px-5 py-4 transition-colors group",
                    n.unread ? "bg-orange-500/[0.03]" : "hover:bg-white/[0.02]"
                  )}
                >
                  <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border border-white/[0.06]", n.iconBg)}>
                    <n.icon className={cn("h-4 w-4", n.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-xs font-semibold", n.unread ? "text-foreground" : "text-muted-foreground")}>
                        {n.title}
                      </p>
                      <button
                        onClick={() => dismiss(n.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      >
                        <XIcon className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      {n.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-muted-foreground/50">{n.time}</span>
                      {n.unread && (
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
