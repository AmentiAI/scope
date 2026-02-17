"use client"

const tickerItems = [
  "🔥 @cryptodev just hit 50K followers",
  "⚡ 847 mentions tracked today",
  "📈 Top hashtag: #Bitcoin",
  "🚀 @defi_whale gained 1.2K followers this week",
  "💎 @btc_maxi's thread went viral — 12K impressions",
  "🤖 AI Agent posted 24 tweets today",
  "📊 Avg engagement up 18% this week",
  "🌊 #Ethereum trending in crypto Twitter",
  "🏆 @nft_creator reached top 10 in mentions",
  "⚡ 3 new CRM deals moved to In Talks",
]

export function LiveTicker() {
  const repeated = [...tickerItems, ...tickerItems]

  return (
    <div
      className="relative overflow-hidden border-y border-white/[0.04] bg-muted/30"
      style={{ height: "34px" }}
    >
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />

      {/* Scrolling track */}
      <div
        className="flex items-center gap-8 whitespace-nowrap h-full ticker-scroll"
      >
        {repeated.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground font-medium px-2"
          >
            {item}
            <span className="text-muted-foreground/30 select-none">•</span>
          </span>
        ))}
      </div>
    </div>
  )
}
