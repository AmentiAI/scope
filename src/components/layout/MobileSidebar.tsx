"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as Dialog from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
import {
  LayoutDashboardIcon,
  TrendingUpIcon,
  AtSignIcon,
  UsersIcon,
  PencilIcon,
  BrainIcon,
  SwordsIcon,
  BellIcon,
  CreditCardIcon,
  SettingsIcon,
  MenuIcon,
  XIcon,
  TelescopeIcon,
  ZapIcon,
  ExternalLinkIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

const navItems = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
      { href: "/dashboard/analytics", label: "Analytics", icon: TrendingUpIcon },
      { href: "/dashboard/mentions", label: "Mentions", icon: AtSignIcon },
    ],
  },
  {
    label: "Creator Tools",
    items: [
      { href: "/dashboard/content", label: "Content Studio", icon: PencilIcon, badge: "AI" },
      { href: "/dashboard/crm", label: "Creator CRM", icon: UsersIcon },
      { href: "/dashboard/agents", label: "AI Agents", icon: BrainIcon },
      { href: "/dashboard/competitors", label: "Competitors", icon: SwordsIcon },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/dashboard/alerts", label: "Alerts", icon: BellIcon },
      { href: "/dashboard/billing", label: "Billing", icon: CreditCardIcon },
      { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
    ],
  },
]

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {/* Hamburger trigger */}
      <Dialog.Trigger asChild>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-muted-foreground hover:text-foreground transition-colors lg:hidden"
          aria-label="Open menu"
        >
          <MenuIcon className="h-4 w-4" />
        </button>
      </Dialog.Trigger>

      {/* Overlay */}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 lg:hidden" />

        {/* Slide-in panel */}
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[hsl(240_10%_4.5%)] border-r border-white/[0.04] shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-300 lg:hidden">
          {/* Logo + close */}
          <div className="flex h-16 items-center justify-between px-5 border-b border-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 glow-orange-sm">
                <TelescopeIcon className="h-4 w-4 text-white" />
              </div>
              <span className="text-[15px] font-bold tracking-tight">
                Crypto<span className="gradient-text">Scope</span>
              </span>
            </div>
            <Dialog.Close asChild>
              <button
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close menu"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            {navItems.map((section) => (
              <div key={section.label}>
                <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                          active
                            ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04] border border-transparent"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            active
                              ? "text-orange-400"
                              : "text-muted-foreground group-hover:text-foreground"
                          )}
                        />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <Badge className="h-4 px-1.5 text-[9px] font-bold bg-orange-500/20 text-orange-400 border-0">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Upgrade banner */}
          <div className="px-3 pb-4">
            <div className="relative rounded-xl overflow-hidden gradient-border">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-600/5" />
              <div className="relative p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <ZapIcon className="h-3.5 w-3.5 text-orange-400" />
                  <span className="text-xs font-semibold text-orange-400">Go Pro</span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-2.5 leading-relaxed">
                  Unlock unlimited accounts, AI agents & 90-day history.
                </p>
                <Link
                  href="/dashboard/billing"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-2 text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Upgrade Now
                  <ExternalLinkIcon className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
