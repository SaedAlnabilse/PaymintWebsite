import api from '../config/api';

/**
 * Community API service — all community endpoints.
 *
 * CRITICAL: Community is tenant-global. Every call MUST send
 * X-Skip-Establishment-Header: true to avoid establishment scoping.
 *
 * DTO fields must match the backend exactly — forbidNonWhitelisted will
 * return a misleading 400 on any extra field.
 */

const skipHeader = { 'X-Skip-Establishment-Header': 'true' };

// ── Types (mirror API responses) ──

export interface CommunityCategory {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  type: 'DISCUSSION' | 'QA' | 'FEATURE_REQUEST' | 'ANNOUNCEMENT';
  visibility: 'PUBLIC' | 'MEMBERS';
  postingPolicy: 'ANYONE' | 'MEMBERS' | 'MODS_ONLY';
  topicCount: number;
}

export interface CommunityTopicListItem {
  id: string;
  title: string;
  slug: string;
  state: 'OPEN' | 'CLOSED' | 'LOCKED';
  isPinned: boolean;
  isAnnouncement: boolean;
  featureStatus?: string;
  replyCount: number;
  upvoteCount: number;
  viewCount: number;
  lastActivityAt: string;
  createdAt: string;
  bestReplyId?: string | null;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
    trustLevel: string;
  };
  category: {
    id: string;
    slug: string;
    name: string;
    color?: string;
  };
  tags?: { tag: { id: string; slug: string; name: string } }[];
  reactions?: { id: string; type: string }[];
}

export interface CommunityTopicDetail extends CommunityTopicListItem {
  body: string;
  bodyHtml: string;
  isHidden: boolean;
  authorId: string;
  editedAt?: string;
}

export interface CommunityReply {
  id: string;
  bodyHtml: string;
  isSolution: boolean;
  upvoteCount: number;
  createdAt: string;
  editedAt?: string;
  parentReplyId?: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
    trustLevel: string;
  };
  reactions?: { id: string; type: string }[];
}

export interface CommunityProfile {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  country?: string;
  businessType?: string;
  reputation: number;
  trustLevel: string;
  postCount: number;
  solutionCount: number;
  createdAt: string;
  badges: { badge: { id: string; slug: string; name: string; icon?: string; description?: string } }[];
}

export interface CommunityTag {
  id: string;
  slug: string;
  name: string;
  topicCount: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ── API methods ──

export const communityApi = {
  // Categories
  async getCategories(): Promise<CommunityCategory[]> {
    const res = await api.get('/api/community/categories', { headers: skipHeader });
    return res.data;
  },

  async getCategory(slug: string): Promise<CommunityCategory> {
    const res = await api.get(`/api/community/categories/${slug}`, { headers: skipHeader });
    return res.data;
  },

  // Topics
  async getTopics(params: {
    category?: string;
    tag?: string;
    sort?: string;
    page?: number;
    limit?: number;
    state?: string;
    solved?: string;
    author?: string;
  } = {}): Promise<PaginatedResponse<CommunityTopicListItem>> {
    const res = await api.get('/api/community/topics', {
      params,
      headers: skipHeader,
    });
    return res.data;
  },

  async getTopic(id: string): Promise<CommunityTopicDetail> {
    const res = await api.get(`/api/community/topics/${id}`, { headers: skipHeader });
    return res.data;
  },

  async getReplies(
    topicId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<CommunityReply>> {
    const res = await api.get(`/api/community/topics/${topicId}/replies`, {
      params: { page, limit },
      headers: skipHeader,
    });
    return res.data;
  },

  // Profiles
  async getProfile(username: string): Promise<CommunityProfile> {
    const res = await api.get(`/api/community/profiles/${username}`, { headers: skipHeader });
    return res.data;
  },

  // Tags
  async getTags(): Promise<CommunityTag[]> {
    const res = await api.get('/api/community/tags', { headers: skipHeader });
    return res.data;
  },

  async getTopicsByTag(
    slug: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<CommunityTopicListItem>> {
    const res = await api.get(`/api/community/tags/${slug}/topics`, {
      params: { page, limit },
      headers: skipHeader,
    });
    return res.data;
  },

  // Search
  async search(params: {
    query: string;
    category?: string;
    tag?: string;
    solved?: string;
    author?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<any>> {
    const res = await api.get('/api/community/search', {
      params: { q: params.query, ...params },
      headers: skipHeader,
    });
    return res.data;
  },

  // Trending + Unanswered (right rail)
  async getTrending(limit = 5): Promise<CommunityTopicListItem[]> {
    const res = await api.get('/api/community/topics/meta/trending', {
      params: { limit },
      headers: skipHeader,
    });
    return res.data;
  },

  async getUnanswered(limit = 5): Promise<CommunityTopicListItem[]> {
    const res = await api.get('/api/community/topics/meta/unanswered', {
      params: { limit },
      headers: skipHeader,
    });
    return res.data;
  },

  // Feature requests board
  async getFeatureRequests(params: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<CommunityTopicListItem>> {
    const res = await api.get('/api/community/feature-requests', {
      params,
      headers: skipHeader,
    });
    return res.data;
  },

  // ── Write methods (Phase 2) ──
  // DTOs use forbidNonWhitelisted — bodies must match DTOs exactly.

  async createTopic(data: {
    title: string;
    body: string;
    categoryId: string;
    tags?: string[];
  }): Promise<{ id: string; slug: string }> {
    const res = await api.post('/api/community/topics', data, { headers: skipHeader });
    return res.data;
  },

  async updateTopic(id: string, data: {
    title?: string;
    body?: string;
    tags?: string[];
  }): Promise<void> {
    await api.patch(`/api/community/topics/${id}`, data, { headers: skipHeader });
  },

  async deleteTopic(id: string): Promise<void> {
    await api.delete(`/api/community/topics/${id}`, { headers: skipHeader });
  },

  async setSolution(topicId: string, replyId: string): Promise<void> {
    await api.post(`/api/community/topics/${topicId}/solution`, { replyId }, { headers: skipHeader });
  },

  async createReply(topicId: string, data: {
    body: string;
    parentReplyId?: string;
  }): Promise<{ id: string }> {
    const res = await api.post(`/api/community/topics/${topicId}/replies`, data, { headers: skipHeader });
    return res.data;
  },

  async updateReply(id: string, body: string): Promise<void> {
    await api.patch(`/api/community/replies/${id}`, { body }, { headers: skipHeader });
  },

  async deleteReply(id: string): Promise<void> {
    await api.delete(`/api/community/replies/${id}`, { headers: skipHeader });
  },

  async toggleReaction(data: {
    targetType: string;
    targetId: string;
    type: string;
  }): Promise<{ reacted: boolean; upvoteCount: number }> {
    const res = await api.post('/api/community/reactions', data, { headers: skipHeader });
    return res.data;
  },

  async toggleFollow(data: {
    targetType: string;
    topicId?: string;
    categoryId?: string;
    tagId?: string;
  }): Promise<{ following: boolean }> {
    const res = await api.post('/api/community/follows', data, { headers: skipHeader });
    return res.data;
  },

  async toggleBookmark(topicId: string): Promise<{ bookmarked: boolean }> {
    const res = await api.post('/api/community/bookmarks', { topicId }, { headers: skipHeader });
    return res.data;
  },

  // ── Notifications + prefs (Phase 3) ──

  async getNotifications(page = 1, limit = 20): Promise<{
    data: Array<{
      id: string;
      type: string;
      title: string;
      body: string;
      topicId?: string;
      replyId?: string;
      isRead: boolean;
      createdAt: string;
    }>;
    unreadCount: number;
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const res = await api.get('/api/community/notifications', {
      params: { page, limit },
      headers: skipHeader,
    });
    return res.data;
  },

  async markNotificationsRead(body: { ids?: string[]; all?: boolean }): Promise<void> {
    await api.post('/api/community/notifications/read', body, { headers: skipHeader });
  },

  async getPrefs(): Promise<{
    emailDigest: string;
    pushEnabled: boolean;
    notifyReply: boolean;
    notifyMention: boolean;
    notifySolution: boolean;
    notifyStatus: boolean;
  }> {
    const res = await api.get('/api/community/profiles/me/prefs', { headers: skipHeader });
    return res.data;
  },

  async updatePrefs(data: {
    emailDigest?: string;
    pushEnabled?: boolean;
    notifyReply?: boolean;
    notifyMention?: boolean;
    notifySolution?: boolean;
    notifyStatus?: boolean;
  }): Promise<void> {
    await api.patch('/api/community/profiles/me/prefs', data, { headers: skipHeader });
  },

  // ── Moderation (Phase 4) ──

  async createReport(data: {
    targetType: string;
    topicId?: string;
    replyId?: string;
    profileId?: string;
    reason: string;
    details?: string;
  }): Promise<{ id: string | null; status: string }> {
    const res = await api.post('/api/community/reports', data, { headers: skipHeader });
    return res.data;
  },

  async getModerationQueue(page = 1, limit = 20): Promise<{
    data: any[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const res = await api.get('/api/community/moderation/queue', {
      params: { page, limit },
      headers: skipHeader,
    });
    return res.data;
  },

  async performModAction(data: {
    action: string;
    targetType: string;
    topicId?: string;
    replyId?: string;
    profileId?: string;
    reason?: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ ok: boolean }> {
    const res = await api.post('/api/community/moderation/action', data, { headers: skipHeader });
    return res.data;
  },

  // ── Reputation / leaderboard (Phase 5) ──

  async getLeaderboard(limit = 10): Promise<
    Array<{
      rank: number;
      id: string;
      username: string;
      displayName: string;
      avatar?: string;
      reputation: number;
      trustLevel: string;
      postCount: number;
      solutionCount: number;
    }>
  > {
    const res = await api.get('/api/community/leaderboard', {
      params: { limit },
      headers: skipHeader,
    });
    return res.data;
  },

  async getProfileStats(username: string): Promise<{
    reputation: number;
    trustLevel: string;
    postCount: number;
    solutionCount: number;
    rank: number;
    badges: Array<{ badge: { id: string; slug: string; name: string; icon?: string; description?: string } }>;
  } | null> {
    const res = await api.get(`/api/community/profiles/${username}/stats`, {
      headers: skipHeader,
    });
    return res.data;
  },
};
