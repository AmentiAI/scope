import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { MobileSidebar } from "@/components/layout/MobileSidebar"
import { TelescopeIcon } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile top bar — hidden on lg+ */}
      <div className="flex h-14 items-center justify-between border-b border-white/[0.04] bg-background/80 backdrop-blur-xl px-4 lg:hidden sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 glow-orange-sm">
            <TelescopeIcon className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-[14px] font-bold tracking-tight">
            Crypto<span className="gradient-text">Scope</span>
          </span>
        </div>
        <MobileSidebar />
      </div>

      {/* Main content — padded on desktop for sidebar */}
      <div className="lg:pl-60">
        {/* Desktop header */}
        <div className="hidden lg:block">
          <Header />
        </div>
        <main className="p-4 sm:p-6 max-w-[1400px]">
          {children}
        </main>
      </div>
    </div>
  )
}
