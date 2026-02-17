"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  HomeIcon,
  BarChart2Icon,
  UsersIcon,
  AtSignIcon,
  CreditCardIcon,
  SettingsIcon,
  TrendingUpIcon,
  BotIcon,
  ContactIcon,
} from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon, group: "main" },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2Icon, group: "main" },
  { href: "/dashboard/competitors", label: "Competitors", icon: UsersIcon, group: "main" },
  { href: "/dashboard/mentions", label: "Mentions", icon: AtSignIcon, group: "main" },
  // Agent + CRM
  { href: "/dashboard/agents", label: "Agents", icon: BotIcon, group: "agents" },
  { href: "/dashboard/crm", label: "CRM", icon: ContactIcon, group: "agents" },
  // Account
  { href: "/dashboard/billing", label: "Billing", icon: CreditCardIcon, group: "account" },
  { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon, group: "account" },
]

const GROUP_LABELS: Record<string, string> = {
  main: "Analytics",
  agents: "Agents & CRM",
  account: "Account",
}

export function Sidebar() {
  const pathname = usePathname()
  const groups = ["main", "agents", "account"]

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-card border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
        <TrendingUpIcon className="h-5 w-5 text-orange-500" />
        <span className="text-base font-bold tracking-tight">
          Crypto<span className="text-orange-500">Scope</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-4 overflow-y-auto">
        {groups.map((group) => {
          const links = NAV_LINKS.filter((l) => l.group === group)
          return (
            <div key={group}>
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {GROUP_LABELS[group]}
              </p>
              <div className="space-y-0.5">
                {links.map(({ href, label, icon: Icon }) => {
                  const isActive =
                    href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(href)

                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-orange-500/10 text-orange-500"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive ? "text-orange-500" : "text-muted-foreground"
                        )}
                      />
                      {label}
                      {/* Agent active indicator */}
                      {href === "/dashboard/agents" && isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t border-border flex items-center gap-3">
        <UserButton
          afterSignOutUrl="/"
          appearance={{ elements: { avatarBox: "h-8 w-8" } }}
        />
        <span className="text-sm text-muted-foreground truncate">Account</span>
      </div>
    </aside>
  )
}
