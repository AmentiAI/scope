"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  TwitterIcon,
  SwordsIcon,
  UsersIcon,
  BrainIcon,
  CalendarIcon,
  CheckCircle2Icon,
  XIcon,
  ChevronRightIcon,
  RocketIcon,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface Step {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  done: boolean
  href: string
}

interface OnboardingChecklistProps {
  hasTwitter?: boolean
  hasCompetitor?: boolean
  hasCrmContact?: boolean
  hasAgent?: boolean
  hasScheduledTweet?: boolean
}

const DISMISS_KEY = "cryptoscope_onboarding_dismissed"

export function OnboardingChecklist({
  hasTwitter = false,
  hasCompetitor = false,
  hasCrmContact = false,
  hasAgent = false,
  hasScheduledTweet = false,
}: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const val = localStorage.getItem(DISMISS_KEY)
    if (val === "true") setDismissed(true)
  }, [])

  const steps: Step[] = [
    {
      id: "twitter",
      icon: <TwitterIcon className="h-4 w-4" />,
      title: "Connect Twitter",
      description: "Link your Twitter account to start tracking growth",
      done: hasTwitter,
      href: "/dashboard/settings",
    },
    {
      id: "competitor",
      icon: <SwordsIcon className="h-4 w-4" />,
      title: "Add a Competitor",
      description: "Track rivals and benchmark your performance",
      done: hasCompetitor,
      href: "/dashboard/competitors",
    },
    {
      id: "crm",
      icon: <UsersIcon className="h-4 w-4" />,
      title: "Create CRM Contact",
      description: "Start managing your creator relationships",
      done: hasCrmContact,
      href: "/dashboard/crm",
    },
    {
      id: "agent",
      icon: <BrainIcon className="h-4 w-4" />,
      title: "Connect an Agent",
      description: "Automate your crypto creator workflow",
      done: hasAgent,
      href: "/dashboard/agents",
    },
    {
      id: "tweet",
      icon: <CalendarIcon className="h-4 w-4" />,
      title: "Schedule a Tweet",
      description: "Queue your first AI-powered tweet",
      done: hasScheduledTweet,
      href: "/dashboard/content",
    },
  ]

  const doneCount = steps.filter((s) => s.done).length
  const progressPct = (doneCount / steps.length) * 100

  // Don't render until mounted (avoid SSR mismatch with localStorage)
  if (!mounted) return null
  // Hide if dismissed or >= 3 steps done
  if (dismissed || doneCount >= 3) return null

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true")
    setDismissed(true)
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20">
            <RocketIcon className="h-4 w-4 text-orange-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Get Started</h3>
            <p className="text-[11px] text-muted-foreground">
              {doneCount} of {steps.length} complete
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={handleDismiss}
        >
          <XIcon className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Progress bar */}
      <div className="px-5 py-3 border-b border-white/[0.04]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-muted-foreground">Setup progress</span>
          <span className="text-[11px] font-semibold text-orange-400">
            {Math.round(progressPct)}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="px-3 py-3 space-y-0.5">
        {steps.map((step) => (
          <Link
            key={step.id}
            href={step.done ? "#" : step.href}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
              step.done
                ? "opacity-60 cursor-default"
                : "hover:bg-white/[0.04] cursor-pointer"
            }`}
          >
            {/* Icon / Check */}
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all ${
                step.done
                  ? "bg-gradient-to-br from-orange-500/30 to-amber-500/20 text-orange-400"
                  : "bg-muted text-muted-foreground group-hover:text-foreground"
              }`}
            >
              {step.done ? (
                <CheckCircle2Icon className="h-4 w-4 text-orange-400" />
              ) : (
                step.icon
              )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p
                className={`text-[13px] font-medium ${
                  step.done ? "line-through text-muted-foreground" : ""
                }`}
              >
                {step.title}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {step.description}
              </p>
            </div>

            {/* Arrow (only for incomplete steps) */}
            {!step.done && (
              <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0" />
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
