# CryptoScope - Complete Build Order
## Ship in 4 Weeks

---

## Week 1: Foundation

### Day 1-2: Project Setup
```bash
# 1. Create Next.js project
npx create-next-app@latest cryptoscope --typescript --tailwind --app --src-dir

# 2. Install all dependencies
cd cryptoscope
npm install drizzle-orm @neondatabase/serverless drizzle-kit
npm install @clerk/nextjs
npm install @trpc/server @trpc/client @trpc/react-query @trpc/next
npm install @tanstack/react-query superjson zod
npm install twitter-api-v2
npm install stripe
npm install inngest
npm install @upstash/redis
npm install resend
npm install recharts
npm install nanoid date-fns
npm install lucide-react class-variance-authority clsx tailwind-merge

# 3. Install shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card badge avatar table tabs select dialog
```

### Day 2-3: Database Setup (Neon)

**Steps:**
1. Go to https://neon.tech → Create account → New project "cryptoscope"
2. Copy connection strings (pooled + direct)
3. Add to `.env.local`:
   ```
   DATABASE_URL=postgresql://... (pooled - for app)
   DATABASE_URL_UNPOOLED=postgresql://... (direct - for migrations)
   ```
4. Copy schema.ts into `src/lib/db/schema.ts`
5. Copy db/index.ts into `src/lib/db/index.ts`
6. Run: `npm run db:push` (pushes schema to Neon)

### Day 3-4: Auth Setup (Clerk)

**Steps:**
1. Go to https://clerk.com → Create app "CryptoScope"
2. Enable Twitter/X OAuth in Clerk dashboard
3. Copy keys to `.env.local`
4. Wrap app with ClerkProvider in `layout.tsx`
5. Create middleware.ts:
```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/pricing", "/sign-in(.*)", "/sign-up(.*)", "/api/webhooks(.*)"]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) auth().protect();
});

export const config = { matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"] };
```

### Day 4-5: tRPC Setup

**`src/server/api/trpc.ts`:**
```typescript
import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@clerk/nextjs/server";
import superjson from "superjson";
import { ZodError } from "zod";

const t = initTRPC.context<{ userId: string | null }>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { userId: ctx.userId } });
});
```

**`src/app/api/trpc/[trpc]/route.ts`:**
```typescript
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { auth } from "@clerk/nextjs/server";
import { appRouter } from "@/server/api/root";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      const { userId } = auth();
      return { userId };
    },
  });

export { handler as GET, handler as POST };
```

---

## Week 2: Core Features

### Day 6-7: Twitter OAuth + Account Connection

**Flow:**
1. User clicks "Connect Twitter Account"
2. Redirect to Twitter OAuth
3. On callback, store tokens in DB
4. Trigger initial sync via Inngest

**`src/app/api/auth/twitter/callback/route.ts`:**
```typescript
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { twitterOAuthClient } from "@/lib/twitter/client";
import { db, twitterAccounts } from "@/lib/db";
import { inngest } from "@/lib/inngest/jobs";
import { nanoid } from "nanoid";

export async function GET(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return Response.redirect("/sign-in");

  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // Exchange code for tokens
  const { client, accessToken, refreshToken, expiresIn } =
    await twitterOAuthClient.loginWithOAuth2({
      code: code!,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`,
      codeVerifier: state!, // stored in cookie/session
    });

  // Fetch user profile
  const { data: me } = await client.v2.me({
    "user.fields": ["id", "name", "username", "profile_image_url", "description", "public_metrics"],
  });

  // Store account
  await db.insert(twitterAccounts).values({
    id: me.id,
    userId,
    username: me.username,
    displayName: me.name,
    avatarUrl: me.profile_image_url,
    bio: me.description,
    accessToken,
    refreshToken,
    tokenExpiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
    followerCount: me.public_metrics?.followers_count ?? 0,
    followingCount: me.public_metrics?.following_count ?? 0,
    tweetCount: me.public_metrics?.tweet_count ?? 0,
  }).onConflictDoUpdate({
    target: twitterAccounts.id,
    set: { accessToken, refreshToken, userId, updatedAt: new Date() },
  });

  // Trigger initial sync
  await inngest.send({
    name: "account/sync.requested",
    data: { accountId: me.id },
  });

  return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
}
```

### Day 8-10: Dashboard Pages

**Pages to build:**
1. `/dashboard` - Overview with key stats
2. `/dashboard/analytics` - Charts (followers, engagement)
3. `/dashboard/tweets` - Top tweets table
4. `/dashboard/mentions` - Mentions feed + sentiment
5. `/dashboard/followers` - Top followers/superfans
6. `/dashboard/competitors` - Competitor comparison
7. `/settings` - Account settings, billing

**Key Components:**
- `<StatsCard>` - Metric with change indicator
- `<FollowerGrowthChart>` - Recharts LineChart
- `<EngagementChart>` - Recharts BarChart
- `<TweetTable>` - Best tweets list
- `<MentionsFeed>` - Mentions with sentiment badges
- `<TopFollowersList>` - Superfan leaderboard
- `<BestTimeHeatmap>` - Posting time grid

---

## Week 3: Stripe + Background Jobs

### Day 11-12: Stripe Integration

**Steps:**
1. Create Stripe account
2. Create 2 products: Pro ($29/mo) + Agency ($99/mo)
3. Copy price IDs to `.env.local`
4. Copy stripe/index.ts
5. Create webhook endpoint:
   ```
   /api/webhooks/stripe
   ```
6. Add Stripe webhook in Stripe dashboard pointing to your URL
7. Create `/pricing` page with checkout buttons

### Day 13-14: Inngest Background Jobs

**Steps:**
1. Create Inngest account at https://inngest.com
2. Copy API keys to `.env.local`
3. Create route handler:
   ```
   /api/inngest
   ```
4. Deploy jobs: syncTweets, syncMentions, takeDailySnapshot
5. Test via Inngest dev server: `npx inngest-cli@latest dev`

### Day 15: Clerk Webhook (sync users to DB)

**`/api/webhooks/clerk/route.ts`:**
```typescript
import { Webhook } from "svix";
import { db, users } from "@/lib/db";

export async function POST(req: Request) {
  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  const evt = wh.verify(payload, headers) as any;

  if (evt.type === "user.created") {
    await db.insert(users).values({
      id: evt.data.id,
      email: evt.data.email_addresses[0]?.email_address,
      name: `${evt.data.first_name} ${evt.data.last_name}`.trim(),
      avatarUrl: evt.data.image_url,
    }).onConflictDoNothing();
  }

  return Response.json({ received: true });
}
```

---

## Week 4: Polish + Launch

### Day 16-17: Landing Page

**Sections:**
1. Hero - "Twitter Analytics Built for Crypto & NFT Projects"
2. Features - 6 key features with icons
3. Screenshots - Dashboard preview
4. Pricing - Free / Pro / Agency cards
5. Testimonials (placeholder initially)
6. FAQ
7. CTA - "Start for Free"

### Day 18: Email Integration (Resend)

**Emails to build:**
- Welcome email (on signup)
- Weekly analytics digest
- Mention alert (high-impact mention)

### Day 19: Redis Caching

**Add caching to expensive queries:**
```typescript
import { Redis } from "@upstash/redis";
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Cache follower growth for 1 hour
const cacheKey = `growth:${accountId}:${days}d`;
const cached = await redis.get(cacheKey);
if (cached) return cached;
// ... fetch from DB
await redis.setex(cacheKey, 3600, result);
```

### Day 20: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add all env vars via Vercel dashboard
# or: vercel env add

# Connect custom domain
vercel domains add cryptoscope.io
```

**Neon + Vercel integration:**
- Go to Vercel → Integrations → Neon → Connect
- Auto-populates DATABASE_URL

---

## Revenue Milestones

| Users | MRR |
|-------|-----|
| 10 Pro | $290 |
| 50 Pro | $1,450 |
| 100 Pro | $2,900 |
| 50 Pro + 10 Agency | $2,440 |
| 200 Pro + 30 Agency | $8,770 |

**Target: $5k MRR in 60 days post-launch**

---

## Customer Acquisition Strategy

1. **Twitter:** Post about building in public, demo the tool daily
2. **Reddit:** r/NFT, r/CryptoCurrency, r/bitcoinart
3. **Crypto Discord servers:** Post in #tools channels
4. **Product Hunt:** Launch day for spike in signups
5. **Influencer outreach:** DM 50 NFT/crypto projects directly
6. **Cold email:** Find NFT project emails, send personalized pitch
7. **Your existing network:** @SigNullBTC + @ordmakerfun audiences

---

## Key Services & Costs (Monthly)

| Service | Cost |
|---------|------|
| Vercel (Pro) | $20/mo |
| Neon (Launch) | $19/mo |
| Clerk (Pro) | $25/mo |
| Upstash Redis | $10/mo |
| Inngest | Free tier → $25/mo |
| Twitter API (Basic) | $100/mo |
| Domain | $12/year |
| **Total** | **~$180/mo** |

**Break even at ~7 Pro subscribers.**
