import Link from "next/link"
import { type LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  ctaLabel?: string
  ctaHref?: string
  illustration?: React.ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaHref,
  illustration,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {illustration ? (
        <div className="mb-6">{illustration}</div>
      ) : (
        <div className="relative mb-6">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/10 blur-xl scale-150" />
          {/* Icon container */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/15 to-amber-500/10 border border-orange-500/20">
            <Icon className="h-7 w-7 text-orange-400" />
          </div>
        </div>
      )}

      <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-6">
        {description}
      </p>

      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:opacity-90 hover:shadow-orange-500/30 hover:-translate-y-0.5"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  )
}
