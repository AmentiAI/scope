# CryptoScope - Full Tech Stack Architecture
## NFT/Crypto Twitter Analytics SaaS

---

## Product Overview
Twitter analytics platform for crypto/NFT project owners and communities.

### Core Features (MVP)
1. Twitter account analytics (engagement, growth, best times)
2. Competitor tracking
3. Top engaged followers (superfans)
4. Tweet performance scoring
5. Mention/sentiment monitoring
6. Ordinals/NFT collection social tracker

### Pricing
- **Free:** 1 account, 7-day history, basic analytics
- **Pro ($29/mo or $232/yr):** 3 accounts, 90-day history, competitor tracking
- **Agency ($99/mo or $792/yr):** 10 accounts, 1-year history, API access, white label

### Payment Methods
- **Stripe** — Credit/debit cards, monthly or annual recurring billing
- **Bitcoin (BTC)** — One-time payment via NOWPayments (30 or 365 days access)
- **Solana (SOL)** — One-time payment via NOWPayments (30 or 365 days access)

> Crypto payments are processed by NOWPayments. User pays → webhook fires → subscription activates.

---

## Full Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Charts:** Recharts
- **Data Fetching:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React

### Backend
- **API:** Next.js API Routes (serverless)
- **Type Safety:** tRPC
- **Validation:** Zod
- **ORM:** Drizzle ORM

### Database
- **Primary:** Neon (Serverless Postgres)
- **Cache:** Upstash Redis (serverless)

### Auth
- **Provider:** Clerk (has Twitter OAuth built-in)

### Payments
- **Provider:** Stripe (subscriptions + webhooks)

### Background Jobs
- **Scheduler:** Inngest (serverless background jobs)
- **Use:** Cron jobs to fetch Twitter data hourly

### External APIs
- **Twitter:** twitter-api-v2 (npm package)
- **Email:** Resend + React Email

### Hosting & Infra
- **App:** Vercel
- **Database:** Neon (auto-scales)
- **Redis:** Upstash
- **CDN:** Vercel Edge Network

### Monitoring
- **Errors:** Sentry
- **Analytics:** Vercel Analytics
- **Uptime:** Better Uptime

---

## Project Structure

```
cryptoscope/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (sign-in, sign-up)
│   │   ├── (dashboard)/       # Protected dashboard pages
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── analytics/     # Twitter analytics
│   │   │   ├── competitors/   # Competitor tracking
│   │   │   ├── mentions/      # Mention monitoring
│   │   │   ├── followers/     # Top followers
│   │   │   └── settings/      # Account settings
│   │   ├── (marketing)/       # Public pages
│   │   │   ├── page.tsx       # Landing page
│   │   │   ├── pricing/       # Pricing page
│   │   │   └── blog/          # SEO blog
│   │   └── api/               # API routes
│   │       ├── trpc/          # tRPC handler
│   │       ├── webhooks/      # Stripe + Clerk webhooks
│   │       └── inngest/       # Background jobs
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── charts/            # Chart components
│   │   ├── dashboard/         # Dashboard-specific components
│   │   └── marketing/         # Landing page components
│   ├── lib/
│   │   ├── db/                # Neon + Drizzle setup
│   │   │   ├── index.ts       # DB connection
│   │   │   └── schema.ts      # All table schemas
│   │   ├── twitter/           # Twitter API client
│   │   ├── stripe/            # Stripe client + helpers
│   │   ├── redis/             # Upstash Redis client
│   │   └── inngest/           # Background job definitions
│   ├── server/
│   │   ├── api/               # tRPC routers
│   │   │   ├── root.ts
│   │   │   ├── routers/
│   │   │   │   ├── analytics.ts
│   │   │   │   ├── competitors.ts
│   │   │   │   ├── mentions.ts
│   │   │   │   └── billing.ts
│   │   └── context.ts         # tRPC context
│   └── types/                 # TypeScript types
├── drizzle/
│   └── migrations/            # DB migrations
├── emails/                    # React Email templates
├── public/                    # Static assets
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Environment Variables

```env
# Database
DATABASE_URL=                   # Neon connection string
DATABASE_URL_UNPOOLED=         # Neon direct connection (for migrations)

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Twitter API
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
TWITTER_BEARER_TOKEN=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=
STRIPE_AGENCY_PRICE_ID=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Inngest
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Resend (Email)
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://cryptoscope.io
```
