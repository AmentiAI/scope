import {
  pgTable,
  text,
  varchar,
  integer,
  bigint,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export const planEnum = pgEnum("plan", ["free", "pro", "agency"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "canceled",
  "past_due",
  "trialing",
  "inactive",
]);
export const jobStatusEnum = pgEnum("job_status", [
  "pending",
  "running",
  "completed",
  "failed",
]);
export const agentStatusEnum = pgEnum("agent_status", [
  "active",
  "paused",
  "disconnected",
]);
export const taskStatusEnum = pgEnum("task_status", [
  "queued",
  "running",
  "done",
  "failed",
  "cancelled",
]);
export const taskTypeEnum = pgEnum("task_type", [
  "post_tweet",
  "reply_mention",
  "dm_follower",
  "post_moltbook",
  "monitor_keywords",
  "analyze_competitors",
  "follow_user",
  "unfollow_user",
  "custom",
]);
export const crmContactStatusEnum = pgEnum("crm_contact_status", [
  "lead",
  "prospect",
  "active",
  "partner",
  "archived",
]);
export const crmDealStatusEnum = pgEnum("crm_deal_status", [
  "idea",
  "outreach",
  "in_talks",
  "agreed",
  "live",
  "completed",
  "dead",
]);
export const paymentMethodEnum = pgEnum("payment_method", [
  "stripe",
  "crypto",
]);
export const cryptoPaymentStatusEnum = pgEnum("crypto_payment_status", [
  "pending",
  "waiting",
  "confirming",
  "confirmed",
  "finished",
  "failed",
  "expired",
  "refunded",
]);

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────

export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 191 }).primaryKey(), // Clerk user ID
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }),
    avatarUrl: text("avatar_url"),
    plan: planEnum("plan").default("free").notNull(),
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    emailIdx: index("users_email_idx").on(t.email),
  })
);

// ─────────────────────────────────────────────
// SUBSCRIPTIONS
// ─────────────────────────────────────────────

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id", { length: 191 }).primaryKey(), // Stripe sub ID or "crypto_<payment_id>"
  userId: varchar("user_id", { length: 191 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: subscriptionStatusEnum("status").notNull(),
  plan: planEnum("plan").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").default("stripe").notNull(),
  // Stripe-specific
  stripePriceId: varchar("stripe_price_id", { length: 255 }),
  // Crypto-specific
  payCurrency: varchar("pay_currency", { length: 10 }), // "BTC" | "SOL"
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────
// CRYPTO PAYMENTS (NOWPayments invoices)
// ─────────────────────────────────────────────

export const cryptoPayments = pgTable(
  "crypto_payments",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    userId: varchar("user_id", { length: 191 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    nowpaymentsInvoiceId: varchar("nowpayments_invoice_id", { length: 191 }),
    nowpaymentsPaymentId: varchar("nowpayments_payment_id", { length: 191 }),
    plan: planEnum("plan").notNull(),
    billingPeriod: varchar("billing_period", { length: 20 }).notNull(), // "monthly" | "annual"
    currency: varchar("currency", { length: 10 }).notNull(), // "BTC" | "SOL"
    priceUsd: integer("price_usd").notNull(), // cents
    cryptoAmount: varchar("crypto_amount", { length: 50 }), // actual paid amount in crypto
    status: cryptoPaymentStatusEnum("status").default("pending").notNull(),
    periodStart: timestamp("period_start").notNull(),
    periodEnd: timestamp("period_end").notNull(),
    confirmedAt: timestamp("confirmed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdIdx: index("crypto_payments_user_id_idx").on(t.userId),
    invoiceIdx: index("crypto_payments_invoice_idx").on(t.nowpaymentsInvoiceId),
    statusIdx: index("crypto_payments_status_idx").on(t.status),
  })
);

// ─────────────────────────────────────────────
// TWITTER ACCOUNTS (Connected by user)
// ─────────────────────────────────────────────

export const twitterAccounts = pgTable(
  "twitter_accounts",
  {
    id: varchar("id", { length: 191 }).primaryKey(), // Twitter user ID
    userId: varchar("user_id", { length: 191 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    username: varchar("username", { length: 50 }).notNull(),
    displayName: varchar("display_name", { length: 255 }),
    avatarUrl: text("avatar_url"),
    bio: text("bio"),
    // OAuth tokens (encrypted)
    accessToken: text("access_token"),
    accessTokenSecret: text("access_token_secret"),
    refreshToken: text("refresh_token"),
    tokenExpiresAt: timestamp("token_expires_at"),
    // Cached stats
    followerCount: integer("follower_count").default(0),
    followingCount: integer("following_count").default(0),
    tweetCount: integer("tweet_count").default(0),
    listedCount: integer("listed_count").default(0),
    isActive: boolean("is_active").default(true).notNull(),
    lastSyncedAt: timestamp("last_synced_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdIdx: index("twitter_accounts_user_id_idx").on(t.userId),
    usernameIdx: index("twitter_accounts_username_idx").on(t.username),
  })
);

// ─────────────────────────────────────────────
// TWITTER SNAPSHOTS (Daily stats snapshots)
// ─────────────────────────────────────────────

export const twitterSnapshots = pgTable(
  "twitter_snapshots",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    accountId: varchar("account_id", { length: 191 })
      .notNull()
      .references(() => twitterAccounts.id, { onDelete: "cascade" }),
    date: timestamp("date").notNull(), // UTC date
    followerCount: integer("follower_count").notNull(),
    followingCount: integer("following_count").notNull(),
    tweetCount: integer("tweet_count").notNull(),
    followerDelta: integer("follower_delta").default(0), // Change from prev day
    engagementRate: integer("engagement_rate").default(0), // Stored as basis points (1% = 100)
    avgLikes: integer("avg_likes").default(0),
    avgRetweets: integer("avg_retweets").default(0),
    avgReplies: integer("avg_replies").default(0),
    avgImpressions: integer("avg_impressions").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    accountDateIdx: uniqueIndex("snapshots_account_date_idx").on(
      t.accountId,
      t.date
    ),
  })
);

// ─────────────────────────────────────────────
// TWEETS
// ─────────────────────────────────────────────

export const tweets = pgTable(
  "tweets",
  {
    id: varchar("id", { length: 191 }).primaryKey(), // Twitter tweet ID
    accountId: varchar("account_id", { length: 191 })
      .notNull()
      .references(() => twitterAccounts.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    likeCount: integer("like_count").default(0).notNull(),
    retweetCount: integer("retweet_count").default(0).notNull(),
    replyCount: integer("reply_count").default(0).notNull(),
    quoteCount: integer("quote_count").default(0).notNull(),
    impressionCount: integer("impression_count").default(0),
    bookmarkCount: integer("bookmark_count").default(0),
    engagementScore: integer("engagement_score").default(0), // Calculated score
    isRetweet: boolean("is_retweet").default(false).notNull(),
    isReply: boolean("is_reply").default(false).notNull(),
    hasMedia: boolean("has_media").default(false).notNull(),
    hasLink: boolean("has_link").default(false).notNull(),
    hashtags: jsonb("hashtags").$type<string[]>().default([]),
    mentions: jsonb("mentions").$type<string[]>().default([]),
    publishedAt: timestamp("published_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    accountIdIdx: index("tweets_account_id_idx").on(t.accountId),
    publishedAtIdx: index("tweets_published_at_idx").on(t.publishedAt),
    engagementIdx: index("tweets_engagement_idx").on(t.engagementScore),
  })
);

// ─────────────────────────────────────────────
// COMPETITORS
// ─────────────────────────────────────────────

export const competitors = pgTable(
  "competitors",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    userId: varchar("user_id", { length: 191 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    twitterId: varchar("twitter_id", { length: 191 }).notNull(),
    username: varchar("username", { length: 50 }).notNull(),
    displayName: varchar("display_name", { length: 255 }),
    avatarUrl: text("avatar_url"),
    followerCount: integer("follower_count").default(0),
    followingCount: integer("following_count").default(0),
    tweetCount: integer("tweet_count").default(0),
    avgEngagementRate: integer("avg_engagement_rate").default(0),
    lastSyncedAt: timestamp("last_synced_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    userCompetitorIdx: uniqueIndex("competitors_user_twitter_idx").on(
      t.userId,
      t.twitterId
    ),
  })
);

// ─────────────────────────────────────────────
// COMPETITOR SNAPSHOTS
// ─────────────────────────────────────────────

export const competitorSnapshots = pgTable(
  "competitor_snapshots",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    competitorId: varchar("competitor_id", { length: 191 })
      .notNull()
      .references(() => competitors.id, { onDelete: "cascade" }),
    date: timestamp("date").notNull(),
    followerCount: integer("follower_count").notNull(),
    followerDelta: integer("follower_delta").default(0),
    engagementRate: integer("engagement_rate").default(0),
    tweetCount: integer("tweet_count").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    compDateIdx: uniqueIndex("comp_snapshots_comp_date_idx").on(
      t.competitorId,
      t.date
    ),
  })
);

// ─────────────────────────────────────────────
// MENTIONS
// ─────────────────────────────────────────────

export const mentions = pgTable(
  "mentions",
  {
    id: varchar("id", { length: 191 }).primaryKey(), // Twitter tweet ID
    accountId: varchar("account_id", { length: 191 })
      .notNull()
      .references(() => twitterAccounts.id, { onDelete: "cascade" }),
    authorId: varchar("author_id", { length: 191 }).notNull(),
    authorUsername: varchar("author_username", { length: 50 }).notNull(),
    authorName: varchar("author_name", { length: 255 }),
    authorAvatarUrl: text("author_avatar_url"),
    authorFollowerCount: integer("author_follower_count").default(0),
    text: text("text").notNull(),
    likeCount: integer("like_count").default(0),
    retweetCount: integer("retweet_count").default(0),
    replyCount: integer("reply_count").default(0),
    sentiment: varchar("sentiment", { length: 20 }), // positive | negative | neutral
    sentimentScore: integer("sentiment_score"), // -100 to 100
    publishedAt: timestamp("published_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    accountIdIdx: index("mentions_account_id_idx").on(t.accountId),
    publishedAtIdx: index("mentions_published_at_idx").on(t.publishedAt),
  })
);

// ─────────────────────────────────────────────
// TOP FOLLOWERS / SUPERFANS
// ─────────────────────────────────────────────

export const topFollowers = pgTable(
  "top_followers",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    accountId: varchar("account_id", { length: 191 })
      .notNull()
      .references(() => twitterAccounts.id, { onDelete: "cascade" }),
    followerId: varchar("follower_id", { length: 191 }).notNull(),
    followerUsername: varchar("follower_username", { length: 50 }).notNull(),
    followerName: varchar("follower_name", { length: 255 }),
    followerAvatarUrl: text("follower_avatar_url"),
    followerCount: integer("follower_count").default(0),
    engagementScore: integer("engagement_score").default(0), // How much they interact
    likeCount: integer("like_count").default(0),
    retweetCount: integer("retweet_count").default(0),
    replyCount: integer("reply_count").default(0),
    lastEngagedAt: timestamp("last_engaged_at"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    accountFollowerIdx: uniqueIndex("top_followers_account_follower_idx").on(
      t.accountId,
      t.followerId
    ),
    scoreIdx: index("top_followers_score_idx").on(t.engagementScore),
  })
);

// ─────────────────────────────────────────────
// HASHTAG ANALYTICS
// ─────────────────────────────────────────────

export const hashtagAnalytics = pgTable(
  "hashtag_analytics",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    accountId: varchar("account_id", { length: 191 })
      .notNull()
      .references(() => twitterAccounts.id, { onDelete: "cascade" }),
    hashtag: varchar("hashtag", { length: 100 }).notNull(),
    tweetCount: integer("tweet_count").default(0),
    totalLikes: integer("total_likes").default(0),
    totalRetweets: integer("total_retweets").default(0),
    totalImpressions: integer("total_impressions").default(0),
    avgEngagement: integer("avg_engagement").default(0),
    period: varchar("period", { length: 20 }).notNull(), // "7d" | "30d" | "90d"
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    accountHashtagIdx: uniqueIndex("hashtag_account_tag_period_idx").on(
      t.accountId,
      t.hashtag,
      t.period
    ),
  })
);

// ─────────────────────────────────────────────
// SYNC JOBS (Track background job status)
// ─────────────────────────────────────────────

export const syncJobs = pgTable(
  "sync_jobs",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    accountId: varchar("account_id", { length: 191 }).references(
      () => twitterAccounts.id,
      { onDelete: "cascade" }
    ),
    jobType: varchar("job_type", { length: 50 }).notNull(), // "tweets" | "mentions" | "followers" | "snapshot"
    status: jobStatusEnum("status").default("pending").notNull(),
    errorMessage: text("error_message"),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    accountIdIdx: index("sync_jobs_account_id_idx").on(t.accountId),
    statusIdx: index("sync_jobs_status_idx").on(t.status),
  })
);

// ─────────────────────────────────────────────
// AGENTS (Connected Moltbook / OpenClaw agents)
// ─────────────────────────────────────────────

export const agents = pgTable(
  "agents",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    userId: varchar("user_id", { length: 191 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Moltbook identity
    moltbookAgentId: varchar("moltbook_agent_id", { length: 191 }).unique(),
    moltbookUsername: varchar("moltbook_username", { length: 100 }),
    moltbookApiKey: text("moltbook_api_key"), // encrypted in production
    moltbookProfileUrl: text("moltbook_profile_url"),
    // Linked Twitter account (agent posts on behalf of this account)
    twitterAccountId: varchar("twitter_account_id", { length: 191 })
      .references(() => twitterAccounts.id, { onDelete: "set null" }),
    // Agent config
    displayName: varchar("display_name", { length: 255 }).notNull(),
    persona: text("persona"), // personality/instructions for the agent
    status: agentStatusEnum("status").default("active").notNull(),
    // Capabilities (what this agent is allowed to do)
    canPostTweets: boolean("can_post_tweets").default(false).notNull(),
    canReplyMentions: boolean("can_reply_mentions").default(false).notNull(),
    canSendDms: boolean("can_send_dms").default(false).notNull(),
    canPostMoltbook: boolean("can_post_moltbook").default(true).notNull(),
    canFollowUsers: boolean("can_follow_users").default(false).notNull(),
    canAnalyze: boolean("can_analyze").default(true).notNull(),
    // Stats
    tasksCompleted: integer("tasks_completed").default(0).notNull(),
    tasksFailed: integer("tasks_failed").default(0).notNull(),
    lastActiveAt: timestamp("last_active_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdIdx: index("agents_user_id_idx").on(t.userId),
    moltbookIdIdx: index("agents_moltbook_id_idx").on(t.moltbookAgentId),
  })
);

// ─────────────────────────────────────────────
// AGENT TASKS (Work queue for agents)
// ─────────────────────────────────────────────

export const agentTasks = pgTable(
  "agent_tasks",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    agentId: varchar("agent_id", { length: 191 })
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 191 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: taskTypeEnum("type").notNull(),
    status: taskStatusEnum("status").default("queued").notNull(),
    // Task input (varies by type)
    input: jsonb("input").$type<Record<string, unknown>>().notNull(),
    // Task output / result
    output: jsonb("output").$type<Record<string, unknown>>(),
    errorMessage: text("error_message"),
    // Scheduling
    scheduledFor: timestamp("scheduled_for"), // null = run ASAP
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    // Recurrence
    isRecurring: boolean("is_recurring").default(false).notNull(),
    cronExpression: varchar("cron_expression", { length: 100 }), // "0 9 * * *" etc
    // Inngest job ID for tracking
    inngestEventId: varchar("inngest_event_id", { length: 191 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    agentIdIdx: index("agent_tasks_agent_id_idx").on(t.agentId),
    statusIdx: index("agent_tasks_status_idx").on(t.status),
    scheduledIdx: index("agent_tasks_scheduled_idx").on(t.scheduledFor),
  })
);

// ─────────────────────────────────────────────
// CRM CONTACTS
// ─────────────────────────────────────────────

export const crmContacts = pgTable(
  "crm_contacts",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    userId: varchar("user_id", { length: 191 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Identity
    twitterId: varchar("twitter_id", { length: 191 }),
    twitterUsername: varchar("twitter_username", { length: 50 }),
    twitterDisplayName: varchar("twitter_display_name", { length: 255 }),
    twitterAvatarUrl: text("twitter_avatar_url"),
    moltbookUsername: varchar("moltbook_username", { length: 100 }),
    email: varchar("email", { length: 255 }),
    // CRM metadata
    status: crmContactStatusEnum("status").default("lead").notNull(),
    tags: jsonb("tags").$type<string[]>().default([]),
    notes: text("notes"),
    followerCount: integer("follower_count").default(0),
    isInfluencer: boolean("is_influencer").default(false).notNull(),
    isNftCreator: boolean("is_nft_creator").default(false).notNull(),
    isBtcOrdinals: boolean("is_btc_ordinals").default(false).notNull(),
    // Interaction tracking
    lastInteractedAt: timestamp("last_interacted_at"),
    interactionCount: integer("interaction_count").default(0).notNull(),
    // Assigned agent (who manages this contact)
    assignedAgentId: varchar("assigned_agent_id", { length: 191 })
      .references(() => agents.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdIdx: index("crm_contacts_user_id_idx").on(t.userId),
    twitterIdIdx: index("crm_contacts_twitter_id_idx").on(t.twitterId),
    statusIdx: index("crm_contacts_status_idx").on(t.status),
  })
);

// ─────────────────────────────────────────────
// CRM PIPELINES (Collab / deal tracking)
// ─────────────────────────────────────────────

export const crmPipelines = pgTable("crm_pipelines", {
  id: varchar("id", { length: 191 }).primaryKey(),
  userId: varchar("user_id", { length: 191 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(), // "Collab Outreach", "Sponsorships", etc.
  description: text("description"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────
// CRM DEALS (Individual opportunities)
// ─────────────────────────────────────────────

export const crmDeals = pgTable(
  "crm_deals",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    userId: varchar("user_id", { length: 191 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    pipelineId: varchar("pipeline_id", { length: 191 })
      .references(() => crmPipelines.id, { onDelete: "cascade" }),
    contactId: varchar("contact_id", { length: 191 })
      .references(() => crmContacts.id, { onDelete: "set null" }),
    // Deal info
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    status: crmDealStatusEnum("status").default("idea").notNull(),
    value: integer("value"), // USD cents (optional, for revenue tracking)
    // Assigned agent (who handles this deal)
    assignedAgentId: varchar("assigned_agent_id", { length: 191 })
      .references(() => agents.id, { onDelete: "set null" }),
    // Dates
    expectedCloseAt: timestamp("expected_close_at"),
    closedAt: timestamp("closed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdIdx: index("crm_deals_user_id_idx").on(t.userId),
    statusIdx: index("crm_deals_status_idx").on(t.status),
  })
);

// ─────────────────────────────────────────────
// CRM ACTIVITIES (Timeline of interactions)
// ─────────────────────────────────────────────

export const crmActivities = pgTable(
  "crm_activities",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    userId: varchar("user_id", { length: 191 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    contactId: varchar("contact_id", { length: 191 })
      .references(() => crmContacts.id, { onDelete: "cascade" }),
    dealId: varchar("deal_id", { length: 191 })
      .references(() => crmDeals.id, { onDelete: "cascade" }),
    agentId: varchar("agent_id", { length: 191 })
      .references(() => agents.id, { onDelete: "set null" }),
    // Activity
    type: varchar("type", { length: 50 }).notNull(), // "note", "tweet", "dm", "reply", "moltbook_post", "task_completed", "status_change"
    title: varchar("title", { length: 255 }).notNull(),
    body: text("body"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    contactIdIdx: index("crm_activities_contact_id_idx").on(t.contactId),
    dealIdIdx: index("crm_activities_deal_id_idx").on(t.dealId),
    createdAtIdx: index("crm_activities_created_at_idx").on(t.createdAt),
  })
);

// ─────────────────────────────────────────────
// AGENT LOGS (Audit trail)
// ─────────────────────────────────────────────

export const agentLogs = pgTable(
  "agent_logs",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    agentId: varchar("agent_id", { length: 191 })
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    taskId: varchar("task_id", { length: 191 })
      .references(() => agentTasks.id, { onDelete: "set null" }),
    level: varchar("level", { length: 10 }).notNull(), // "info" | "warn" | "error"
    message: text("message").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    agentIdIdx: index("agent_logs_agent_id_idx").on(t.agentId),
    createdAtIdx: index("agent_logs_created_at_idx").on(t.createdAt),
  })
);

// ─────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────

export const usersRelations = relations(users, ({ many, one }) => ({
  twitterAccounts: many(twitterAccounts),
  competitors: many(competitors),
  cryptoPayments: many(cryptoPayments),
  agents: many(agents),
  crmContacts: many(crmContacts),
  crmPipelines: many(crmPipelines),
  crmDeals: many(crmDeals),
  subscription: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.userId],
  }),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  user: one(users, { fields: [agents.userId], references: [users.id] }),
  twitterAccount: one(twitterAccounts, {
    fields: [agents.twitterAccountId],
    references: [twitterAccounts.id],
  }),
  tasks: many(agentTasks),
  logs: many(agentLogs),
  assignedContacts: many(crmContacts),
  assignedDeals: many(crmDeals),
}));

export const agentTasksRelations = relations(agentTasks, ({ one, many }) => ({
  agent: one(agents, { fields: [agentTasks.agentId], references: [agents.id] }),
  user: one(users, { fields: [agentTasks.userId], references: [users.id] }),
  logs: many(agentLogs),
}));

export const crmContactsRelations = relations(crmContacts, ({ one, many }) => ({
  user: one(users, { fields: [crmContacts.userId], references: [users.id] }),
  assignedAgent: one(agents, {
    fields: [crmContacts.assignedAgentId],
    references: [agents.id],
  }),
  deals: many(crmDeals),
  activities: many(crmActivities),
}));

export const crmDealsRelations = relations(crmDeals, ({ one, many }) => ({
  user: one(users, { fields: [crmDeals.userId], references: [users.id] }),
  pipeline: one(crmPipelines, {
    fields: [crmDeals.pipelineId],
    references: [crmPipelines.id],
  }),
  contact: one(crmContacts, {
    fields: [crmDeals.contactId],
    references: [crmContacts.id],
  }),
  assignedAgent: one(agents, {
    fields: [crmDeals.assignedAgentId],
    references: [agents.id],
  }),
  activities: many(crmActivities),
}));

export const cryptoPaymentsRelations = relations(cryptoPayments, ({ one }) => ({
  user: one(users, {
    fields: [cryptoPayments.userId],
    references: [users.id],
  }),
}));

export const twitterAccountsRelations = relations(
  twitterAccounts,
  ({ one, many }) => ({
    user: one(users, {
      fields: [twitterAccounts.userId],
      references: [users.id],
    }),
    snapshots: many(twitterSnapshots),
    tweets: many(tweets),
    mentions: many(mentions),
    topFollowers: many(topFollowers),
    hashtagAnalytics: many(hashtagAnalytics),
    syncJobs: many(syncJobs),
  })
);

export const competitorsRelations = relations(competitors, ({ one, many }) => ({
  user: one(users, {
    fields: [competitors.userId],
    references: [users.id],
  }),
  snapshots: many(competitorSnapshots),
}));
