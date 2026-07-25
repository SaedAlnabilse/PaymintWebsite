/**
 * Community type definitions — shared across pages/components.
 * These mirror the API response shapes from communityApi.ts.
 */

export type {
  CommunityCategory,
  CommunityTopicListItem,
  CommunityTopicDetail,
  CommunityReply,
  CommunityProfile,
  CommunityTag,
  PaginatedResponse,
} from '../services/communityApi';

// Feature request status (for feature-request board)
export const FeatureStatus = {
  OPEN: 'OPEN',
  UNDER_REVIEW: 'UNDER_REVIEW',
  PLANNED: 'PLANNED',
  IN_PROGRESS: 'IN_PROGRESS',
  SHIPPED: 'SHIPPED',
  DECLINED: 'DECLINED',
} as const;

export type FeatureStatusType =
  (typeof FeatureStatus)[keyof typeof FeatureStatus];

// Trust levels
export const TrustLevel = {
  NEW: 'NEW',
  MEMBER: 'MEMBER',
  TRUSTED: 'TRUSTED',
  LEADER: 'LEADER',
} as const;

// Topic state
export const TopicState = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  LOCKED: 'LOCKED',
} as const;
