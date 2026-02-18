"use client"

import { usePathname } from "next/navigation"
import { RefreshCwIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
const CLERK_PK = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const ClerkReady = CLERK_PK.startsWith("pk_") && !CLERK_PK.includes("placeholder");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const UserButton = ClerkReady ? require("@clerk/nextjs").UserButton : () => null;
import { CommandPalette } from "@/components/ui/command-palette"
import { NotificationsDrawer } from "@/components/layout/NotificationsDrawer"

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
        {/* ⌘K Command Palette */}
        <CommandPalette />

        {/* Refresh */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground border border-white/[0.06] bg-white/[0.03] rounded-lg"
          onClick={() => window.location.reload()}
        >
          <RefreshCwIcon className="h-3.5 w-3.5" />
        </Button>

        {/* Notifications */}
        <NotificationsDrawer />

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
