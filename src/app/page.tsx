import Link from "next/link"
import {
  TrendingUpIcon,
  UsersIcon,
  AtSignIcon,
  BarChart2Icon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const FEATURES = [
  {
    icon: TrendingUpIcon,
    title: "Follower Growth Tracking",
    description:
      "Monitor your daily follower gains and losses with beautiful charts. Understand what drives growth in your crypto community.",
  },
  {
    icon: UsersIcon,
    title: "Competitor Intelligence",
    description:
      "Track up to 20 competitor accounts. See their follower growth, engagement rates, and spot opportunities to outpace them.",
  },
  {
    icon: AtSignIcon,
    title: "Mention Monitoring",
    description:
      "Never miss a mention. Our AI analyzes sentiment so you instantly know if conversations are positive, negative, or neutral.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUpIcon className="h-6 w-6 text-orange-500" />
            <span className="text-lg font-bold">
              Crypto<span className="text-orange-500">Scope</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              asChild
            >
              <Link href="/sign-up">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-orange-500 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1 mb-8">
          <BarChart2Icon className="h-3.5 w-3.5" />
          Analytics for crypto builders
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
          Track Your{" "}
          <span className="text-orange-500">Crypto Twitter</span>{" "}
          Growth
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          The analytics platform built for NFT projects, ordinals communities, and crypto builders. 
          Know your followers, outpace competitors, and never miss a mention.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Button
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white h-12 px-8"
            asChild
          >
            <Link href="/sign-up">Get Started Free</Link>
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8" asChild>
            <Link href="/dashboard">View Demo</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[
            { value: "10K+", label: "Accounts tracked" },
            { value: "99.9%", label: "Uptime" },
            { value: "Real-time", label: "Data sync" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl font-bold text-orange-500">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 border-t border-b border-border py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            Everything you need to dominate crypto Twitter
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Built for the pace of the crypto industry. Real-time data, actionable insights.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="border-border/50 bg-background/60">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-3">
                    <Icon className="h-5 w-5 text-orange-500" />
                  </div>
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Simple, transparent pricing</h2>
        <p className="text-center text-muted-foreground mb-10">
          Start free. Upgrade when you&apos;re ready. Pay with card or crypto.
        </p>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              name: "Free",
              price: "$0",
              features: ["1 Twitter account", "7-day history", "Basic analytics"],
              cta: "Get Started",
              highlight: false,
            },
            {
              name: "Pro",
              price: "$29/mo",
              features: ["3 Twitter accounts", "90-day history", "Competitor tracking", "Sentiment analysis"],
              cta: "Start Pro",
              highlight: true,
            },
            {
              name: "Agency",
              price: "$99/mo",
              features: ["10 Twitter accounts", "365-day history", "20 competitors", "Priority support"],
              cta: "Go Agency",
              highlight: false,
            },
          ].map(({ name, price, features, cta, highlight }) => (
            <Card
              key={name}
              className={highlight ? "border-orange-500 shadow-lg shadow-orange-500/10" : "border-border/50"}
            >
              <CardHeader>
                <CardTitle>{name}</CardTitle>
                <p className="text-2xl font-bold">{price}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 mb-4">
                  {features.map((f) => (
                    <li key={f} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={
                    highlight
                      ? "w-full bg-orange-500 hover:bg-orange-600 text-white"
                      : "w-full"
                  }
                  variant={highlight ? "default" : "outline"}
                  asChild
                >
                  <Link href="/sign-up">{cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5 text-orange-500" />
            <span className="font-semibold">
              Crypto<span className="text-orange-500">Scope</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CryptoScope. Built for the onchain community.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/sign-in" className="hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link href="/sign-up" className="hover:text-foreground transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
