import { TwitterApi } from "twitter-api-v2";

// App-level client (bearer token) for public data
export const twitterAppClient = new TwitterApi(
  process.env.TWITTER_BEARER_TOKEN!
);

// OAuth2 client for user auth
export const twitterOAuthClient = new TwitterApi({
  clientId: process.env.TWITTER_CLIENT_ID!,
  clientSecret: process.env.TWITTER_CLIENT_SECRET!,
});

// Create user-level client from stored tokens
export function getUserTwitterClient(accessToken: string) {
  return new TwitterApi(accessToken);
}

// ─────────────────────────────────────────────
// TWITTER DATA FETCHERS
// ─────────────────────────────────────────────

export async function fetchUserTweets(
  client: TwitterApi,
  userId: string,
  maxResults = 100
) {
  const timeline = await client.v2.userTimeline(userId, {
    max_results: maxResults,
    "tweet.fields": [
      "created_at",
      "public_metrics",
      "entities",
      "attachments",
      "referenced_tweets",
    ],
    exclude: ["replies"],
  });

  return timeline.data.data ?? [];
}

export async function fetchUserMentions(
  client: TwitterApi,
  userId: string,
  sinceId?: string
) {
  const mentions = await client.v2.userMentionTimeline(userId, {
    max_results: 100,
    since_id: sinceId,
    "tweet.fields": ["created_at", "public_metrics", "author_id"],
    "user.fields": ["name", "username", "profile_image_url", "public_metrics"],
    expansions: ["author_id"],
  });

  return {
    tweets: mentions.data.data ?? [],
    users: mentions.data.includes?.users ?? [],
  };
}

export async function fetchUserProfile(
  client: TwitterApi,
  username: string
) {
  const user = await client.v2.userByUsername(username, {
    "user.fields": [
      "id",
      "name",
      "username",
      "description",
      "profile_image_url",
      "public_metrics",
      "created_at",
    ],
  });

  return user.data;
}

export async function fetchFollowers(
  client: TwitterApi,
  userId: string,
  maxResults = 1000
) {
  const followers = await client.v2.followers(userId, {
    max_results: 1000,
    "user.fields": ["name", "username", "profile_image_url", "public_metrics"],
  });

  return followers.data ?? [];
}

// ─────────────────────────────────────────────
// ENGAGEMENT SCORE CALCULATOR
// ─────────────────────────────────────────────

export function calculateEngagementScore(tweet: {
  public_metrics?: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
    impression_count?: number;
    quote_count: number;
  };
}) {
  const m = tweet.public_metrics;
  if (!m) return 0;

  // Weighted engagement formula
  const score =
    m.like_count * 1 +
    m.retweet_count * 3 +
    m.reply_count * 2 +
    m.quote_count * 2;

  return score;
}

// Calculate engagement RATE (score / impressions)
export function calculateEngagementRate(
  engagementScore: number,
  impressions: number
): number {
  if (!impressions) return 0;
  // Store as basis points (1% = 100)
  return Math.round((engagementScore / impressions) * 10000);
}

// ─────────────────────────────────────────────
// BEST TIME TO POST ANALYSIS
// ─────────────────────────────────────────────

export function analyzeBestPostingTimes(
  tweets: Array<{
    publishedAt: Date;
    engagementScore: number;
  }>
) {
  const hourlyData: Record<number, { total: number; count: number }> = {};

  for (const tweet of tweets) {
    const hour = new Date(tweet.publishedAt).getUTCHours();
    if (!hourlyData[hour]) {
      hourlyData[hour] = { total: 0, count: 0 };
    }
    hourlyData[hour].total += tweet.engagementScore;
    hourlyData[hour].count += 1;
  }

  return Object.entries(hourlyData)
    .map(([hour, data]) => ({
      hour: parseInt(hour),
      avgEngagement: data.count > 0 ? Math.round(data.total / data.count) : 0,
      tweetCount: data.count,
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement);
}

// ─────────────────────────────────────────────
// SENTIMENT ANALYSIS (Simple keyword-based)
// ─────────────────────────────────────────────

const positiveWords = [
  "great", "amazing", "love", "awesome", "bullish", "moon", "pump",
  "gm", "wagmi", "alpha", "fire", "legendary", "based", "🚀", "💎", "🔥",
];
const negativeWords = [
  "bad", "terrible", "hate", "dump", "rug", "scam", "bearish",
  "rekt", "ngmi", "trash", "down", "sell", "crash", "💀", "🐻",
];

export function analyzeSentiment(text: string): {
  sentiment: "positive" | "negative" | "neutral";
  score: number;
} {
  const lower = text.toLowerCase();
  let score = 0;

  for (const word of positiveWords) {
    if (lower.includes(word)) score += 10;
  }
  for (const word of negativeWords) {
    if (lower.includes(word)) score -= 10;
  }

  score = Math.max(-100, Math.min(100, score));

  return {
    sentiment: score > 10 ? "positive" : score < -10 ? "negative" : "neutral",
    score,
  };
}
