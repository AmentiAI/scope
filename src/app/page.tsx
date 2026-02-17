import Link from "next/link"
import {
  TelescopeIcon,
  TrendingUpIcon,
  UsersIcon,
  BrainIcon,
  ZapIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CheckIcon,
  StarIcon,
  BarChart3Icon,
  SwordsIcon,
  BellIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const features = [
  {
    icon: TrendingUpIcon,
    title: "Real-Time Analytics",
    description: "Track follower growth, engagement rates, impressions, and viral content detection with live data updates.",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
  },
  {
    icon: UsersIcon,
    title: "Creator CRM",
    description: "Manage your creator relationships with a full pipeline: from outreach to live collaborations, with activity tracking.",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: BrainIcon,
    title: "AI Agent Automation",
    description: "Connect Moltbook agents to automate replies, schedule tweets, monitor keywords, and DM campaigns 24/7.",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    icon: ZapIcon,
    title: "Content Studio",
    description: "Generate viral tweets in 5 tones (hype, alpha, educational, controversy, community) powered by OpenAI.",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: SwordsIcon,
    title: "Competitor Intelligence",
    description: "Track up to 20 competitors side-by-side. Get alerted when a rival has a growth spike before you miss it.",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
  },
  {
    icon: BellIcon,
    title: "Smart Alerts",
    description: "Milestone notifications, viral tweet alerts, negative sentiment spikes, and weekly performance reports via email.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
]

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Try it out",
    features: [
      "1 Twitter account",
      "7-day history",
      "Basic analytics",
      "5 CRM contacts",
      "Community access",
    ],
    cta: "Get Started",
    href: "/sign-up",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    description: "For serious creators",
    features: [
      "3 Twitter accounts",
      "90-day history",
      "Full analytics suite",
      "Unlimited CRM contacts",
      "1 AI Agent",
      "10 competitors tracked",
      "Email alerts",
      "Content Studio (AI)",
    ],
    cta: "Start Pro",
    href: "/sign-up",
    highlight: true,
  },
  {
    name: "Agency",
    price: "$99",
    period: "/mo",
    description: "For teams & agencies",
    features: [
      "Unlimited accounts",
      "Full history",
      "Everything in Pro",
      "10 AI Agents",
      "Team collaboration",
      "API access",
      "Priority support",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    href: "/sign-up",
    highlight: false,
  },
]

const testimonials = [
  {
    quote: "CryptoScope tripled my engagement tracking. I can see exactly which tweets are driving my ordinals community growth.",
    name: "0xBuilder",
    handle: "@0xbuilder",
    followers: "47K followers",
  },
  {
    quote: "The AI agent automation alone is worth 10x the price. My Moltbook agent runs my entire Twitter presence while I sleep.",
    name: "SatoshiDegen",
    handle: "@satoshidegen",
    followers: "128K followers",
  },
  {
    quote: "Finally a CRM that understands crypto creators. The deal pipeline for collabs is exactly what I needed.",
    name: "NFT_Maxi",
    handle: "@nft_maxi",
    followers: "89K followers",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-white/[0.04] bg-background/80 backdrop-blur-xl px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600">
            <TelescopeIcon className="h-4 w-4 text-white" />
          </div>
          <span className="text-[15px] font-bold tracking-tight">
            Crypto<span className="gradient-text">Scope</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link href="#testimonials" className="hover:text-foreground transition-colors">Reviews</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Sign in
          </Link>
          <Button
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-white font-semibold h-9 px-5"
            asChild
          >
            <Link href="/sign-up">Get Started Free</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center pt-40 pb-28 px-6 text-center overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 h-[600px] w-[900px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 left-1/4 h-[300px] w-[300px] bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />

        <Badge
          variant="outline"
          className="mb-6 gap-2 border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs px-4 py-1.5"
        >
          <StarIcon className="h-3 w-3" />
          Built for Crypto Creators & Ordinals Builders
        </Badge>

        <h1 className="relative text-5xl md:text-7xl font-black tracking-tight leading-[1.05] max-w-4xl mb-6">
          The CRM built for{" "}
          <span className="gradient-text">Crypto Creators</span>
        </h1>

        <p className="relative text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
          Track your Twitter growth, manage creator relationships, monitor competitors, and automate your community with AI agents — all in one platform.
        </p>

        <div className="relative flex flex-col sm:flex-row gap-4 items-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-white font-bold h-12 px-8 text-[15px] shadow-2xl shadow-orange-500/25 gap-2"
            asChild
          >
            <Link href="/sign-up">
              Start for Free
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-8 text-[15px] border-white/10 hover:bg-white/[0.06] text-muted-foreground hover:text-foreground gap-2"
            asChild
          >
            <Link href="/demo">
              Live Demo →
            </Link>
          </Button>
        </div>

        {/* Social proof */}
        <div className="relative flex items-center gap-3 mt-10 text-sm text-muted-foreground">
          <div className="flex -space-x-2">
            {["🦊", "🐉", "⚡", "🎯", "🔥"].map((emoji, i) => (
              <div
                key={i}
                className="h-7 w-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs"
              >
                {emoji}
              </div>
            ))}
          </div>
          <span>Join <strong className="text-foreground">2,400+</strong> crypto creators</span>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-white/[0.04] bg-white/[0.01] px-6 py-8">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "2,400+", label: "Active Creators" },
            { value: "140M+", label: "Tweets Analyzed" },
            { value: "98%", label: "Uptime SLA" },
            { value: "$0", label: "To Get Started" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-black gradient-text mb-1">{value}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-white/10 text-muted-foreground text-xs">
            <BarChart3Icon className="h-3 w-3 mr-1.5" />
            Everything You Need
          </Badge>
          <h2 className="text-4xl font-black tracking-tight mb-4">
            One platform, full control
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Stop juggling 10 different tools. CryptoScope puts analytics, CRM, AI automation, and competitor tracking in one place.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-white/[0.06] bg-card p-6 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${f.bg} mb-4`}>
                <f.icon className={`h-5 w-5 ${f.color}`} />
              </div>
              <h3 className="font-bold text-[15px] mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Crypto payments callout */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden gradient-border">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/5" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 p-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                <ShieldCheckIcon className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Pay with BTC or SOL</h3>
                <p className="text-sm text-muted-foreground">
                  Crypto-native payments accepted — Bitcoin & Solana via NOWPayments. 33% off annual plans.
                </p>
              </div>
            </div>
            <Button
              className="shrink-0 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-white font-semibold gap-2"
              asChild
            >
              <Link href="/sign-up">
                Get Started
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black tracking-tight mb-4">Simple, transparent pricing</h2>
          <p className="text-muted-foreground">
            No hidden fees. Pay with card, BTC, or SOL.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 border transition-all duration-300 ${
                plan.highlight
                  ? "border-orange-500/40 bg-gradient-to-b from-orange-500/10 to-card shadow-2xl shadow-orange-500/10 scale-105"
                  : "border-white/[0.06] bg-card hover:border-white/10"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 text-xs px-3">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-1">
                  {plan.name}
                </h3>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className="text-muted-foreground text-sm pb-1">{plan.period}</span>
                </div>
                <p className="text-xs text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="space-y-2.5 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <CheckIcon className="h-4 w-4 text-orange-400 shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full font-semibold h-10 ${
                  plan.highlight
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-white shadow-lg shadow-orange-500/20"
                    : "bg-white/[0.06] hover:bg-white/[0.10] text-foreground border border-white/10"
                }`}
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-6 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black tracking-tight mb-4">Loved by crypto builders</h2>
          <p className="text-muted-foreground">Real results from the community</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.handle} className="rounded-2xl border border-white/[0.06] bg-card p-6">
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-4 w-4 fill-orange-400 text-orange-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-500/30 to-amber-500/20 flex items-center justify-center text-sm font-bold text-orange-400">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.handle} · {t.followers}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-32 max-w-3xl mx-auto text-center">
        <div className="relative rounded-3xl overflow-hidden gradient-border p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/5" />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-40 bg-orange-500/20 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-4xl font-black tracking-tight mb-4">
              Ready to scale your<br />
              <span className="gradient-text">crypto presence?</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Join 2,400+ crypto creators using CryptoScope to grow faster.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-white font-bold h-12 px-10 text-[15px] shadow-2xl shadow-orange-500/30 gap-2"
              asChild
            >
              <Link href="/sign-up">
                Start for Free Today
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-4">No credit card required · BTC & SOL accepted</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-orange-500 to-amber-600">
              <TelescopeIcon className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-bold">
              Crypto<span className="gradient-text">Scope</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2025 CryptoScope. Built for the community.
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Discord</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
