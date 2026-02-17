// ─────────────────────────────────────────────
// Moltbook API Client
// Powers agent social actions on moltbook.com
// ─────────────────────────────────────────────

const MOLTBOOK_BASE = "https://moltbook.com/api";

export interface MoltbookPost {
  id: string;
  content: string;
  authorUsername: string;
  authorId: string;
  likes: number;
  reposts: number;
  createdAt: string;
  community?: string;
}

export interface MoltbookProfile {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  isVerified: boolean;
  twitterHandle?: string;
}

export interface MoltbookAgent {
  id: string;
  username: string;
  apiKey: string;
  isVerified: boolean;
  profileUrl: string;
}

// ─── Core API client ─────────────────────────

export class MoltbookClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = MOLTBOOK_BASE) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new MoltbookError(
        err.message ?? `Moltbook API error: ${res.status}`,
        res.status
      );
    }

    return res.json();
  }

  // ─── Identity ───────────────────────────────

  async getProfile(): Promise<MoltbookProfile> {
    return this.request<MoltbookProfile>("/agent/me");
  }

  async getAgentByUsername(username: string): Promise<MoltbookProfile> {
    return this.request<MoltbookProfile>(`/users/${username}`);
  }

  // ─── Posting ────────────────────────────────

  async createPost(params: {
    content: string;
    community?: string; // e.g. "crypto", "ordinals", "nfts"
    replyTo?: string;   // post ID to reply to
  }): Promise<MoltbookPost> {
    return this.request<MoltbookPost>("/posts", {
      method: "POST",
      body: JSON.stringify({
        content: params.content,
        community: params.community,
        replyToId: params.replyTo,
      }),
    });
  }

  async deletePost(postId: string): Promise<void> {
    await this.request(`/posts/${postId}`, { method: "DELETE" });
  }

  async repost(postId: string): Promise<void> {
    await this.request(`/posts/${postId}/repost`, { method: "POST" });
  }

  async likePost(postId: string): Promise<void> {
    await this.request(`/posts/${postId}/like`, { method: "POST" });
  }

  // ─── Feed / Discovery ───────────────────────

  async getFeed(params?: { limit?: number; before?: string }): Promise<MoltbookPost[]> {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set("limit", params.limit.toString());
    if (params?.before) qs.set("before", params.before);
    return this.request<MoltbookPost[]>(`/feed?${qs}`);
  }

  async getCommunityFeed(community: string, limit = 20): Promise<MoltbookPost[]> {
    return this.request<MoltbookPost[]>(`/m/${community}?limit=${limit}`);
  }

  async searchPosts(query: string, limit = 20): Promise<MoltbookPost[]> {
    const qs = new URLSearchParams({ q: query, limit: limit.toString() });
    return this.request<MoltbookPost[]>(`/search?${qs}`);
  }

  // ─── Agent-specific ─────────────────────────

  async verifyApiKey(): Promise<boolean> {
    try {
      await this.getProfile();
      return true;
    } catch {
      return false;
    }
  }

  async getPostById(postId: string): Promise<MoltbookPost> {
    return this.request<MoltbookPost>(`/posts/${postId}`);
  }

  async getRecentPosts(username: string, limit = 10): Promise<MoltbookPost[]> {
    return this.request<MoltbookPost[]>(`/users/${username}/posts?limit=${limit}`);
  }
}

// ─── Custom error class ──────────────────────

export class MoltbookError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "MoltbookError";
  }
}

// ─── Factory: create client from stored agent ─

export function createMoltbookClient(apiKey: string) {
  return new MoltbookClient(apiKey);
}

// ─── Verify & fetch agent info ───────────────

export async function verifyMoltbookAgent(apiKey: string): Promise<{
  valid: boolean;
  profile?: MoltbookProfile;
  error?: string;
}> {
  try {
    const client = new MoltbookClient(apiKey);
    const profile = await client.getProfile();
    return { valid: true, profile };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof MoltbookError ? err.message : "Failed to connect",
    };
  }
}
