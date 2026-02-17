import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/lib/db";
import {
  twitterAccounts,
  twitterSnapshots,
  tweets,
  mentions,
  topFollowers,
  hashtagAnalytics,
} from "@/lib/db/schema";
import { and, eq, gte, desc, sql } from "drizzle-orm";
import { analyzeBestPostingTimes } from "@/lib/twitter/client";
import { inngest } from "@/lib/inngest/jobs";
import { subDays } from "date-fns";

export const analyticsRouter = createTRPCRouter({
  // ─── Get all connected Twitter accounts ───
  getAccounts: protectedProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(twitterAccounts)
      .where(eq(twitterAccounts.userId, ctx.userId));
  }),

  // ─── Get follower growth chart data ───
  getFollowerGrowth: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        days: z.number().default(30),
      })
    )
    .query(async ({ input, ctx }) => {
      await verifyAccountOwner(input.accountId, ctx.userId);

      const since = subDays(new Date(), input.days);

      return db
        .select({
          date: twitterSnapshots.date,
          followerCount: twitterSnapshots.followerCount,
          followerDelta: twitterSnapshots.followerDelta,
        })
        .from(twitterSnapshots)
        .where(
          and(
            eq(twitterSnapshots.accountId, input.accountId),
            gte(twitterSnapshots.date, since)
          )
        )
        .orderBy(twitterSnapshots.date);
    }),

  // ─── Get engagement chart data ───
  getEngagement: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        days: z.number().default(30),
      })
    )
    .query(async ({ input, ctx }) => {
      await verifyAccountOwner(input.accountId, ctx.userId);

      const since = subDays(new Date(), input.days);

      return db
        .select({
          date: twitterSnapshots.date,
          engagementRate: twitterSnapshots.engagementRate,
          avgLikes: twitterSnapshots.avgLikes,
          avgRetweets: twitterSnapshots.avgRetweets,
          avgReplies: twitterSnapshots.avgReplies,
          avgImpressions: twitterSnapshots.avgImpressions,
        })
        .from(twitterSnapshots)
        .where(
          and(
            eq(twitterSnapshots.accountId, input.accountId),
            gte(twitterSnapshots.date, since)
          )
        )
        .orderBy(twitterSnapshots.date);
    }),

  // ─── Get top performing tweets ───
  getTopTweets: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        days: z.number().default(30),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      await verifyAccountOwner(input.accountId, ctx.userId);

      const since = subDays(new Date(), input.days);

      return db
        .select()
        .from(tweets)
        .where(
          and(
            eq(tweets.accountId, input.accountId),
            gte(tweets.publishedAt, since)
          )
        )
        .orderBy(desc(tweets.engagementScore))
        .limit(input.limit);
    }),

  // ─── Get best posting times ───
  getBestPostingTimes: protectedProcedure
    .input(z.object({ accountId: z.string() }))
    .query(async ({ input, ctx }) => {
      await verifyAccountOwner(input.accountId, ctx.userId);

      const since = subDays(new Date(), 90);

      const recentTweets = await db
        .select({
          publishedAt: tweets.publishedAt,
          engagementScore: tweets.engagementScore,
        })
        .from(tweets)
        .where(
          and(
            eq(tweets.accountId, input.accountId),
            gte(tweets.publishedAt, since)
          )
        );

      return analyzeBestPostingTimes(recentTweets);
    }),

  // ─── Get mentions + sentiment ───
  getMentions: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        days: z.number().default(7),
        sentiment: z.enum(["positive", "negative", "neutral"]).optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      await verifyAccountOwner(input.accountId, ctx.userId);

      const since = subDays(new Date(), input.days);

      const conditions = [
        eq(mentions.accountId, input.accountId),
        gte(mentions.publishedAt, since),
      ];

      if (input.sentiment) {
        conditions.push(eq(mentions.sentiment, input.sentiment));
      }

      return db
        .select()
        .from(mentions)
        .where(and(...conditions))
        .orderBy(desc(mentions.publishedAt))
        .limit(input.limit);
    }),

  // ─── Sentiment overview ───
  getSentimentOverview: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        days: z.number().default(7),
      })
    )
    .query(async ({ input, ctx }) => {
      await verifyAccountOwner(input.accountId, ctx.userId);

      const since = subDays(new Date(), input.days);

      const result = await db
        .select({
          sentiment: mentions.sentiment,
          count: sql<number>`count(*)`,
        })
        .from(mentions)
        .where(
          and(
            eq(mentions.accountId, input.accountId),
            gte(mentions.publishedAt, since)
          )
        )
        .groupBy(mentions.sentiment);

      return result;
    }),

  // ─── Get top followers/superfans ───
  getTopFollowers: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      await verifyAccountOwner(input.accountId, ctx.userId);

      return db
        .select()
        .from(topFollowers)
        .where(eq(topFollowers.accountId, input.accountId))
        .orderBy(desc(topFollowers.engagementScore))
        .limit(input.limit);
    }),

  // ─── Get hashtag performance ───
  getHashtagPerformance: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        period: z.enum(["7d", "30d", "90d"]).default("30d"),
      })
    )
    .query(async ({ input, ctx }) => {
      await verifyAccountOwner(input.accountId, ctx.userId);

      return db
        .select()
        .from(hashtagAnalytics)
        .where(
          and(
            eq(hashtagAnalytics.accountId, input.accountId),
            eq(hashtagAnalytics.period, input.period)
          )
        )
        .orderBy(desc(hashtagAnalytics.avgEngagement))
        .limit(20);
    }),

  // ─── Dashboard summary stats ───
  getDashboardStats: protectedProcedure
    .input(z.object({ accountId: z.string() }))
    .query(async ({ input, ctx }) => {
      await verifyAccountOwner(input.accountId, ctx.userId);

      const [account] = await db
        .select()
        .from(twitterAccounts)
        .where(eq(twitterAccounts.id, input.accountId))
        .limit(1);

      const since7d = subDays(new Date(), 7);
      const since30d = subDays(new Date(), 30);

      // Get latest snapshot
      const [latestSnapshot] = await db
        .select()
        .from(twitterSnapshots)
        .where(eq(twitterSnapshots.accountId, input.accountId))
        .orderBy(desc(twitterSnapshots.date))
        .limit(1);

      // 7-day tweet count
      const [tweetCount7d] = await db
        .select({ count: sql<number>`count(*)` })
        .from(tweets)
        .where(
          and(
            eq(tweets.accountId, input.accountId),
            gte(tweets.publishedAt, since7d)
          )
        );

      // 7-day mention count
      const [mentionCount7d] = await db
        .select({ count: sql<number>`count(*)` })
        .from(mentions)
        .where(
          and(
            eq(mentions.accountId, input.accountId),
            gte(mentions.publishedAt, since7d)
          )
        );

      return {
        account,
        latestSnapshot,
        tweetCount7d: tweetCount7d?.count ?? 0,
        mentionCount7d: mentionCount7d?.count ?? 0,
      };
    }),

  // ─── Trigger manual sync ───
  triggerSync: protectedProcedure
    .input(z.object({ accountId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await verifyAccountOwner(input.accountId, ctx.userId);

      await inngest.send({
        name: "account/sync.requested",
        data: { accountId: input.accountId },
      });

      return { success: true };
    }),
});

// Helper: Verify account belongs to user
async function verifyAccountOwner(accountId: string, userId: string) {
  const [account] = await db
    .select({ id: twitterAccounts.id })
    .from(twitterAccounts)
    .where(
      and(
        eq(twitterAccounts.id, accountId),
        eq(twitterAccounts.userId, userId)
      )
    )
    .limit(1);

  if (!account) {
    throw new Error("Account not found or unauthorized");
  }
}
