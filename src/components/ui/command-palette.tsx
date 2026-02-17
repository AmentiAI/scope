"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "cmdk"
import {
  LayoutDashboardIcon,
  TrendingUpIcon,
  AtSignIcon,
  PencilIcon,
  UsersIcon,
  BrainIcon,
  SwordsIcon,
  BellIcon,
  CreditCardIcon,
  SettingsIcon,
  ZapIcon,
  PlusCircleIcon,
  SearchIcon,
  TelescopeIcon,
  ExternalLinkIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_COMMANDS = [
  { label: "Dashboard", icon: LayoutDashboardIcon, href: "/dashboard", shortcut: "G D" },
  { label: "Analytics", icon: TrendingUpIcon, href: "/dashboard/analytics", shortcut: "G A" },
  { label: "Mentions", icon: AtSignIcon, href: "/dashboard/mentions" },
  { label: "Content Studio", icon: PencilIcon, href: "/dashboard/content" },
  { label: "Creator CRM", icon: UsersIcon, href: "/dashboard/crm" },
  { label: "AI Agents", icon: BrainIcon, href: "/dashboard/agents" },
  { label: "Competitors", icon: SwordsIcon, href: "/dashboard/competitors" },
  { label: "Alerts", icon: BellIcon, href: "/dashboard/alerts" },
  { label: "Billing", icon: CreditCardIcon, href: "/dashboard/billing" },
  { label: "Settings", icon: SettingsIcon, href: "/dashboard/settings" },
]

const QUICK_ACTIONS = [
  { label: "Write a tweet", icon: ZapIcon, href: "/dashboard/content?mode=tweet" },
  { label: "Add competitor", icon: PlusCircleIcon, href: "/dashboard/competitors?add=true" },
  { label: "Add CRM contact", icon: UsersIcon, href: "/dashboard/crm?add=true" },
  { label: "Connect Twitter account", icon: ExternalLinkIcon, href: "/api/auth/twitter" },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  // Open on ⌘K or Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const run = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router]
  )

  return (
    <>
      {/* Trigger button (used in Header) */}
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:flex items-center gap-2 h-8 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
      >
        <SearchIcon className="h-3.5 w-3.5" />
        <span>Search…</span>
        <span className="ml-2 flex gap-0.5">
          <kbd className="inline-flex h-4 items-center rounded border border-white/10 bg-white/[0.06] px-1 text-[10px] font-medium text-muted-foreground/60">⌘</kbd>
          <kbd className="inline-flex h-4 items-center rounded border border-white/10 bg-white/[0.06] px-1 text-[10px] font-medium text-muted-foreground/60">K</kbd>
        </span>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="flex items-center border-b border-white/[0.06] px-4">
          <TelescopeIcon className="h-4 w-4 text-orange-400 shrink-0 mr-2" />
          <CommandInput
            placeholder="Search pages, actions, accounts…"
            className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <CommandList className="max-h-[400px] overflow-y-auto p-2">
          <CommandEmpty>
            <div className="flex flex-col items-center py-8 text-muted-foreground">
              <SearchIcon className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">No results found</p>
            </div>
          </CommandEmpty>

          <CommandGroup heading="Quick Actions">
            {QUICK_ACTIONS.map((action) => (
              <CommandItem
                key={action.label}
                onSelect={() => run(action.href)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer hover:bg-orange-500/10 data-[selected=true]:bg-orange-500/10"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10">
                  <action.icon className="h-3.5 w-3.5 text-orange-400" />
                </div>
                <span className="font-medium">{action.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator className="my-1 h-px bg-white/[0.04]" />

          <CommandGroup heading="Navigate">
            {NAV_COMMANDS.map((cmd) => (
              <CommandItem
                key={cmd.label}
                onSelect={() => run(cmd.href)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm cursor-pointer hover:bg-white/[0.04] data-[selected=true]:bg-white/[0.04]"
              >
                <cmd.icon className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-muted-foreground">{cmd.label}</span>
                {cmd.shortcut && (
                  <span className="text-[10px] text-muted-foreground/40">{cmd.shortcut}</span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>

        <div className="border-t border-white/[0.04] px-4 py-2 flex items-center gap-4 text-[10px] text-muted-foreground/40">
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> select</span>
          <span><kbd className="font-mono">esc</kbd> close</span>
        </div>
      </CommandDialog>
    </>
  )
}
