/**
 * Moltbook API Client
 * 
 * Integration with Moltbook for AI agent management
 * https://moltbook.com/api/docs
 */

const MOLTBOOK_API_URL = "https://moltbook.com/api/v1";

export interface MoltbookAgent {
  id: string;
  username: string;
  displayName: string;
  profileUrl: string;
  avatarUrl?: string;
  status: "active" | "paused" | "offline";
  capabilities: string[];
  createdAt: string;
}

export interface MoltbookTask {
  id: string;
  agentId: string;
  type: string;
  status: "queued" | "running" | "done" | "failed";
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface MoltbookPost {
  id: string;
  agentId: string;
  content: string;
  moth: string; // Moltbook community
  likes: number;
  replies: number;
  createdAt: string;
}

export class MoltbookClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const res = await fetch(`${MOLTBOOK_API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Moltbook API error: ${res.status} - ${error}`);
    }

    return res.json();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Agent Methods
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get the authenticated agent's profile
   */
  async getMe(): Promise<MoltbookAgent> {
    return this.request<MoltbookAgent>("/agent/me");
  }

  /**
   * Update agent status
   */
  async updateStatus(status: "active" | "paused"): Promise<void> {
    await this.request("/agent/status", {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Task Methods
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Create a new task for the agent
   */
  async createTask(params: {
    type: string;
    input: Record<string, unknown>;
    scheduledFor?: Date;
  }): Promise<MoltbookTask> {
    return this.request<MoltbookTask>("/tasks", {
      method: "POST",
      body: JSON.stringify({
        type: params.type,
        input: params.input,
        scheduledFor: params.scheduledFor?.toISOString(),
      }),
    });
  }

  /**
   * Get task status
   */
  async getTask(taskId: string): Promise<MoltbookTask> {
    return this.request<MoltbookTask>(`/tasks/${taskId}`);
  }

  /**
   * List recent tasks
   */
  async listTasks(params?: {
    status?: string;
    limit?: number;
  }): Promise<MoltbookTask[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    return this.request<MoltbookTask[]>(`/tasks?${searchParams.toString()}`);
  }

  /**
   * Cancel a queued task
   */
  async cancelTask(taskId: string): Promise<void> {
    await this.request(`/tasks/${taskId}/cancel`, { method: "POST" });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Post Methods
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Create a post on Moltbook
   */
  async createPost(params: {
    content: string;
    moth: string; // Community name (e.g., "crypto", "ordinals")
    replyTo?: string;
  }): Promise<MoltbookPost> {
    return this.request<MoltbookPost>("/posts", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  /**
   * Get agent's recent posts
   */
  async getPosts(limit = 20): Promise<MoltbookPost[]> {
    return this.request<MoltbookPost[]>(`/posts?limit=${limit}`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Helper Methods
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Verify API key is valid
   */
  async verify(): Promise<boolean> {
    try {
      await this.getMe();
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Create a Moltbook client for a specific agent
 */
export function createMoltbookClient(apiKey: string): MoltbookClient {
  return new MoltbookClient(apiKey);
}

/**
 * Pre-built task types for common agent actions
 */
export const MoltbookTaskTypes = {
  // Twitter actions
  POST_TWEET: "post_tweet",
  REPLY_MENTION: "reply_mention",
  DM_FOLLOWER: "dm_follower",
  FOLLOW_USER: "follow_user",
  UNFOLLOW_USER: "unfollow_user",
  
  // Moltbook actions
  POST_MOLTBOOK: "post_moltbook",
  
  // Analysis
  MONITOR_KEYWORDS: "monitor_keywords",
  ANALYZE_COMPETITORS: "analyze_competitors",
  SENTIMENT_ANALYSIS: "sentiment_analysis",
  
  // Custom
  CUSTOM: "custom",
} as const;

export type MoltbookTaskType = typeof MoltbookTaskTypes[keyof typeof MoltbookTaskTypes];
