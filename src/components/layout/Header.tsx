"use client"

import { usePathname } from "next/navigation"
import { BellIcon, SearchIcon, RefreshCwIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserButton } from "@clerk/nextjs"
import { Badge } from "@/components/ui/badge"

const pageMeta: Record<string, { title: string; description: string }> = {
  "/dashboard": { title: "Dashboard", description: "Your crypto creator overview" },
  "/dashboard/analytics": { title: "Analytics", description: "Deep dive into your growth metrics" },
  "/dashboard/mentions": { title: "Mentions", description: "Community sentiment & top fans" },
  "/dashboard/content": { title: "Content Studio", description: "AI-powered tweet generation & scheduling" },
  "/dashboard/crm": { title: "Creator CRM", description: "Manage relationships & deals" },
  "/dashboard/agents": { title: "AI Agents", description: "Moltbook automation control center" },
  "/dashboard/competitors": { title: "Competitors", description: "Track & outpace your rivals" },
  "/dashboard/alerts": { title: "Alerts", description: "Real-time notifications & triggers" },
  "/dashboard/billing": { title: "Billing", description: "Manage your plan & payments" },
  "/dashboard/settings": { title: "Settings", description: "Configure accounts & preferences" },
}

export function Header() {
  const pathname = usePathname()
  const meta = pageMeta[pathname] ?? { title: "Dashboard", description: "" }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/[0.04] bg-background/80 backdrop-blur-xl px-6">
      {/* Page title */}
      <div>
        <h1 className="text-[15px] font-semibold tracking-tight">{meta.title}</h1>
        <p className="text-[11px] text-muted-foreground">{meta.description}</p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2 px-3 text-muted-foreground hover:text-foreground border border-white/[0.06] bg-white/[0.03] rounded-lg hidden sm:flex"
        >
          <SearchIcon className="h-3.5 w-3.5" />
          <span className="text-xs">Search…</span>
          <Badge variant="outline" className="ml-1 h-4 px-1 text-[9px] border-white/10 text-muted-foreground/60">
            ⌘K
          </Badge>
        </Button>

        {/* Refresh */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground border border-white/[0.06] bg-white/[0.03] rounded-lg"
        >
          <RefreshCwIcon className="h-3.5 w-3.5" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-muted-foreground hover:text-foreground border border-white/[0.06] bg-white/[0.03] rounded-lg"
        >
          <BellIcon className="h-3.5 w-3.5" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-orange-500" />
        </Button>

        {/* User */}
        <div className="h-8 w-8 flex items-center justify-center">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-7 w-7 ring-1 ring-orange-500/20",
              },
            }}
          />
        </div>
      </div>
    </header>
  )
}
