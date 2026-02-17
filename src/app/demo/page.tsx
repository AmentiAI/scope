"use client"

/**
 * DEMO PAGE
 * Shows a fully interactive dashboard preview with mock data.
 * No auth required. Used on the landing page for "See it live" CTA.
 */

import Link from "next/link"
import { useState } from "react"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import {
  TelescopeIcon, UsersIcon, TrendingUpIcon, ZapIcon,
  AtSignIcon, HeartIcon, RepeatIcon, MessageCircleIcon,
  BotIcon, SwordsIcon, ArrowRightIcon, CheckIcon,
  ExternalLinkIcon, SparklesIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// ─── Mock data ────────────────────────────────────────────────────────────────

const followerData = Array.from({ length: 30 }, (_, i) => ({
  date: `Day ${i + 1}`,
  followers: 12400 + Math.round(Math.sin(i * 0.3) * 300 + i * 80 + Math.random() * 200),
  delta: Math.round(40 + Math.random() * 120),
}))

const engagementData = Array.from({ length: 14 }, (_, i) => ({
  date: `D${i + 1}`,
  rate: Number((2.1 + Math.sin(i * 0.5) * 0.8 + Math.random() * 0.4).toFixed(2)),
  likes: Math.round(120 + Math.random() * 200),
  retweets: Math.round(30 + Math.random() * 60),
}))

const topTweets = [
  { id: "1", text: "🧵 The secret to growing your crypto community: post consistently in the first 2 hours after US market open. Here's the data from 12 months of tracking →", likes: 1847, retweets: 423, score: 94 },
  { id: "2", text: "Ordinals are not just JPEGs. They're the first time Bitcoin has had actual on-chain data. The implications for DeFi are massive and most people are still sleeping on it.", likes: 1203, retweets: 287, score: 87 },
  { id: "3", text: "Hot take: The next 10x crypto communities will be built on engagement quality, not size. 10K engaged > 1M ghost followers. Here's how to measure it →", likes: 891, retweets: 198, score: 76 },
]

const competitors = [
  { handle: "@cryptobuilder", followers: "89.2K", growth: "+1.2K", trend: "up" },
  { handle: "@ordinalmaxi", followers: "45.7K", growth: "+340", trend: "up" },
  { handle: "@btcanalyst", followers: "127K", growth: "-89", trend: "down" },
]

const mentions = [
  { user: "@degentrader", text: "CryptoScope is 🔥 my analytics are finally making sense", sentiment: "positive", time: "2m ago" },
  { user: "@nftbuilder99", text: "this thread on engagement rates is insane, must read", sentiment: "positive", time: "14m ago" },
  { user: "@satoshi_degen", text: "not sure about this ordinals thesis tbh", sentiment: "neutral", time: "31m ago" },
  { user: "@web3founder", text: "thread is fire, saved for later research 🔖", sentiment: "positive", time: "1h ago" },
]

const agents = [
  { name: "JarvisAI_01", status: "active", tasksToday: 12, lastRun: "3 min ago" },
  { name: "ordmakerfun", status: "active", tasksToday: 7, lastRun: "18 min ago" },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function DemoNav({ active, setActive }: { active: string; setActive: (v: string) => void }) {
  const items = ["Dashboard", "Analytics", "Mentions", "Agents", "Competitors"]
  return (
    <nav className="flex gap-1 overflow-x-auto">
      {items.map((item) => (
        <button
          key={item}
          onClick={() => setActive(item)}
          className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            active === item
              ? "bg-orange-500/20 text-orange-400 border border-orange-500/25"
              : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
          }`}
        >
          {item}
        </button>
      ))}
    </nav>
  )
}

function StatCard({ title, value, change, icon: Icon, highlight }: any) {
  return (
    <div className={`rounded-xl border bg-card p-4 ${highlight ? "border-orange-500/30" : "border-white/[0.06]"}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{title}</span>
        <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${highlight ? "bg-gradient-to-br from-orange-500 to-amber-600" : "bg-muted"}`}>
          <Icon className={`h-3.5 w-3.5 ${highlight ? "text-white" : "text-muted-foreground"}`} />
        </div>
      </div>
      <div className={`text-2xl font-black mb-1 ${highlight ? "bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent" : ""}`}>
        {value}
      </div>
      {change && (
        <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
          <TrendingUpIcon className="h-3 w-3" />
          {change}
        </div>
      )}
    </div>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/10 bg-card/95 backdrop-blur-xl px-3 py-2 shadow-2xl text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span className="text-muted-foreground capitalize">{p.name}</span>
          <span className="font-bold" style={{ color: p.color }}>{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

function DashboardView() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Followers" value="14,829" change="+483 this week" icon={UsersIcon} highlight />
        <StatCard title="Engagement" value="3.4%" icon={TrendingUpIcon} />
        <StatCard title="Tweets (7d)" value="23" icon={ZapIcon} />
        <StatCard title="Mentions" value="847" icon={AtSignIcon} />
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-white/[0.06] bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold">Follower Growth</p>
              <p className="text-[10px] text-muted-foreground">30-day trend</p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-[10px]">+1,429 total</Badge>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={followerData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="demoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "hsl(240 5% 45%)", fontSize: 9 }} axisLine={false} tickLine={false} interval={6} />
              <YAxis tick={{ fill: "hsl(240 5% 45%)", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(249,115,22,0.2)", strokeWidth: 1 }} />
              <Area type="monotone" dataKey="followers" stroke="#f97316" strokeWidth={2} fill="url(#demoGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-card p-4">
          <p className="text-sm font-semibold mb-3">Top Tweets</p>
          <div className="space-y-3">
            {topTweets.map((t, i) => (
              <div key={t.id} className="flex gap-2">
                <div className="h-5 w-5 rounded-md bg-orange-500/10 flex items-center justify-center text-[10px] font-bold text-orange-400 shrink-0 mt-0.5">{i + 1}</div>
                <div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">{t.text}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-0.5 text-[10px] text-pink-500"><HeartIcon className="h-2.5 w-2.5" />{t.likes.toLocaleString()}</span>
                    <span className="flex items-center gap-0.5 text-[10px] text-emerald-500"><RepeatIcon className="h-2.5 w-2.5" />{t.retweets}</span>
                  </div>
                </div>
                <Badge className="shrink-0 text-[9px] px-1 h-4 bg-orange-500/10 text-orange-400 border-0 ml-auto">{t.score}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AnalyticsView() {
  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/[0.06] bg-card p-4">
          <p className="text-sm font-semibold mb-1">Engagement Rate</p>
          <p className="text-[10px] text-muted-foreground mb-3">Last 14 days</p>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={engagementData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="engGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "hsl(240 5% 45%)", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(240 5% 45%)", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="rate" name="engagement" stroke="#a855f7" strokeWidth={2} fill="url(#engGrad2)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-card p-4">
          <p className="text-sm font-semibold mb-1">Likes & Retweets</p>
          <p className="text-[10px] text-muted-foreground mb-3">Daily totals</p>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={engagementData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "hsl(240 5% 45%)", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(240 5% 45%)", fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="likes" name="likes" fill="#f97316" radius={[3, 3, 0, 0]} opacity={0.8} />
              <Bar dataKey="retweets" name="retweets" fill="#3b82f6" radius={[3, 3, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-card p-4">
        <p className="text-sm font-semibold mb-3">Best Posting Times</p>
        <div className="space-y-2">
          {[
            { time: "9 AM", pct: 92 }, { time: "12 PM", pct: 78 }, { time: "6 PM", pct: 85 },
            { time: "8 PM", pct: 71 }, { time: "11 PM", pct: 55 },
          ].map(({ time, pct }) => (
            <div key={time} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-12">{time}</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted">
                <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[10px] text-muted-foreground w-8 text-right">{pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MentionsView() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Positive", value: "71%", color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Neutral", value: "21%", color: "text-muted-foreground", bg: "bg-muted" },
          { label: "Negative", value: "8%", color: "text-red-400", bg: "bg-red-500/10" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-xl border border-white/[0.06] ${bg} p-3 text-center`}>
            <p className={`text-xl font-black ${color}`}>{value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-card overflow-hidden">
        {mentions.map((m) => (
          <div key={m.user} className="flex gap-3 p-3 border-b border-white/[0.04] last:border-0">
            <div className={`h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${m.sentiment === "positive" ? "bg-emerald-500/20 text-emerald-400" : m.sentiment === "negative" ? "bg-red-500/20 text-red-400" : "bg-muted text-muted-foreground"}`}>
              {m.sentiment === "positive" ? "+" : m.sentiment === "negative" ? "−" : "·"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold">{m.user}</span>
                <span className="text-[10px] text-muted-foreground">{m.time}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{m.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AgentsView() {
  return (
    <div className="space-y-3">
      {agents.map((agent) => (
        <div key={agent.name} className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <BotIcon className="h-4 w-4 text-orange-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{agent.name}</p>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {agent.tasksToday} tasks today · Last run {agent.lastRun}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] border-white/10">{agent.tasksToday} tasks</Badge>
          </div>
        </div>
      ))}
      <div className="rounded-xl border border-dashed border-white/10 p-6 text-center">
        <BotIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
        <p className="text-xs text-muted-foreground">Connect more agents to automate more</p>
      </div>
    </div>
  )
}

function CompetitorsView() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-white/[0.06] bg-card overflow-hidden">
        <div className="grid grid-cols-4 px-4 py-2 border-b border-white/[0.04] text-[10px] text-muted-foreground uppercase tracking-wider">
          <span>Account</span>
          <span className="text-right">Followers</span>
          <span className="text-right">Growth</span>
          <span className="text-right">Trend</span>
        </div>
        {competitors.map((c) => (
          <div key={c.handle} className="grid grid-cols-4 px-4 py-3 border-b border-white/[0.04] last:border-0 items-center">
            <span className="text-sm font-medium">{c.handle}</span>
            <span className="text-sm text-right">{c.followers}</span>
            <span className={`text-sm text-right font-semibold ${c.trend === "up" ? "text-emerald-400" : "text-red-400"}`}>{c.growth}</span>
            <div className="flex justify-end">
              <TrendingUpIcon className={`h-4 w-4 ${c.trend === "up" ? "text-emerald-400" : "text-red-400 rotate-180"}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main demo page ───────────────────────────────────────────────────────────

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState("Dashboard")

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <div className="sticky top-0 z-50 border-b border-white/[0.04] bg-background/95 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600">
              <TelescopeIcon className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold">
              Crypto<span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Scope</span>
              <Badge className="ml-2 text-[9px] bg-orange-500/20 text-orange-400 border-0">DEMO</Badge>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">This is a live preview with sample data</span>
            <Button
              size="sm"
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-white font-semibold h-8 px-4 gap-1.5"
              asChild
            >
              <Link href="/sign-up">
                Start Free
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Demo shell */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* CTA banner */}
        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/5 border border-orange-500/20 px-5 py-3 mb-6">
          <SparklesIcon className="h-4 w-4 text-orange-400 shrink-0" />
          <p className="text-sm text-orange-300 flex-1">
            <strong>Live demo</strong> — exploring mock data for @CryptoCreator with 14.8K followers.
            Sign up to connect your real account.
          </p>
          <Link href="/sign-up" className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 shrink-0">
            Get started <ArrowRightIcon className="h-3 w-3" />
          </Link>
        </div>

        {/* Dashboard shell */}
        <div className="rounded-2xl border border-white/[0.06] bg-card/50 overflow-hidden">
          {/* Fake sidebar + content */}
          <div className="flex">
            {/* Mini sidebar */}
            <div className="hidden lg:flex w-48 border-r border-white/[0.04] flex-col p-3 gap-1 shrink-0">
              {["Dashboard", "Analytics", "Mentions", "Agents", "Competitors"].map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                    activeTab === item
                      ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                  }`}
                >
                  {item === "Dashboard" && <LayoutDashboardIcon className="h-3.5 w-3.5" />}
                  {item === "Analytics" && <TrendingUpIcon className="h-3.5 w-3.5" />}
                  {item === "Mentions" && <AtSignIcon className="h-3.5 w-3.5" />}
                  {item === "Agents" && <BotIcon className="h-3.5 w-3.5" />}
                  {item === "Competitors" && <SwordsIcon className="h-3.5 w-3.5" />}
                  {item}
                </button>
              ))}
              {/* Upgrade banner */}
              <div className="mt-auto rounded-xl bg-orange-500/10 border border-orange-500/20 p-3 text-center">
                <p className="text-[10px] text-orange-400 font-semibold mb-1">Go Pro</p>
                <p className="text-[9px] text-muted-foreground mb-2">Real data · Agents · 90d history</p>
                <Link href="/sign-up" className="text-[10px] font-bold text-orange-400 hover:underline">Upgrade →</Link>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-5 min-w-0">
              {/* Mobile nav */}
              <div className="lg:hidden mb-4">
                <DemoNav active={activeTab} setActive={setActiveTab} />
              </div>

              {/* View */}
              <div className="animate-fade-in">
                {activeTab === "Dashboard" && <DashboardView />}
                {activeTab === "Analytics" && <AnalyticsView />}
                {activeTab === "Mentions" && <MentionsView />}
                {activeTab === "Agents" && <AgentsView />}
                {activeTab === "Competitors" && <CompetitorsView />}
              </div>
            </div>
          </div>
        </div>

        {/* Sign up prompt */}
        <div className="mt-8 rounded-2xl border border-white/[0.06] bg-card p-8 text-center">
          <h2 className="text-2xl font-black mb-2">
            Ready to see your <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">real data?</span>
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Connect your Twitter account and get live analytics, AI automation, and competitor tracking in minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-white font-bold h-11 px-8 gap-2 shadow-xl shadow-orange-500/20"
              asChild
            >
              <Link href="/sign-up">
                Get Started Free
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {["No credit card", "BTC & SOL accepted", "2-min setup"].map((f) => (
                <span key={f} className="flex items-center gap-1">
                  <CheckIcon className="h-3 w-3 text-emerald-400" />
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LayoutDashboardIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
}
