"use client"

import { usePathname } from "next/navigation"
import { PlusIcon } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { api } from "@/lib/trpc/client"

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/analytics": "Analytics",
  "/dashboard/competitors": "Competitors",
  "/dashboard/mentions": "Mentions",
  "/dashboard/billing": "Billing",
  "/dashboard/settings": "Settings",
}

export function Header() {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] ?? "Dashboard"

  const { data: accounts = [] } = api.analytics.getAccounts.useQuery()

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <h1 className="text-lg font-semibold">{title}</h1>

      <div className="flex items-center gap-3">
        {accounts.length > 0 ? (
          <Select defaultValue={accounts[0]?.id}>
            <SelectTrigger className="w-44 h-9 text-sm">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id}>
                  @{acc.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Button size="sm" variant="outline" asChild>
            <a href="/dashboard/settings">
              <PlusIcon className="h-4 w-4 mr-1.5" />
              Connect Account
            </a>
          </Button>
        )}

        {/* Mobile user button */}
        <div className="md:hidden">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  )
}
