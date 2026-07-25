import { useEffect, useRef, useCallback, useState } from 'react';
import { realtimeService } from '../services/realtimeService';

export const CommunityRealtimeEvents = {
  TOPIC_CREATED: 'community.topic.created',
  REPLY_CREATED: 'community.reply.created',
  REACTION_CHANGED: 'community.reaction.changed',
  TOPIC_UPDATED: 'community.topic.updated',
  NOTIFICATION: 'community.notification',
} as const;

export type CommunityRealtimeEvent =
  (typeof CommunityRealtimeEvents)[keyof typeof CommunityRealtimeEvents];

interface UseCommunityRealtimeOptions {
  /** Join community:global */
  global?: boolean;
  /** Join community:topic:{id} */
  topicId?: string | null;
  /** Join community:user:{profileId} for personal notifications */
  profileId?: string | null;
  enabled?: boolean;
  onEvent?: (event: CommunityRealtimeEvent, payload: any) => void;
  onReconnect?: () => void;
}

/**
 * Subscribe to community socket rooms via the existing realtimeService singleton.
 * REST is the source of truth; sockets are best-effort deltas. On reconnect,
 * call onReconnect to refetch.
 */
export function useCommunityRealtime(options: UseCommunityRealtimeOptions) {
  const {
    global = false,
    topicId = null,
    profileId = null,
    enabled = true,
    onEvent,
    onReconnect,
  } = options;

  const [connected, setConnected] = useState(false);
  const onEventRef = useRef(onEvent);
  const onReconnectRef = useRef(onReconnect);
  onEventRef.current = onEvent;
  onReconnectRef.current = onReconnect;

  useEffect(() => {
    if (!enabled) return;

    realtimeService.initializeCommunity();

    const unsubStatus = realtimeService.onStatusChange((status) => {
      const isUp = status === 'connected';
      setConnected(isUp);
      if (isUp) {
        // Re-join rooms after reconnect + let caller refetch
        if (global) realtimeService.subscribeCommunityRoom('global');
        if (topicId) realtimeService.subscribeCommunityRoom('topic', { topicId });
        if (profileId)
          realtimeService.subscribeCommunityRoom('user', { profileId });
        onReconnectRef.current?.();
      }
    });

    // Initial join
    if (global) realtimeService.subscribeCommunityRoom('global');
    if (topicId) realtimeService.subscribeCommunityRoom('topic', { topicId });
    if (profileId) realtimeService.subscribeCommunityRoom('user', { profileId });

    const unsubs = Object.values(CommunityRealtimeEvents).map((evt) =>
      realtimeService.onCommunityEvent(evt, (payload) => {
        onEventRef.current?.(evt, payload);
      }),
    );

    return () => {
      if (global) realtimeService.unsubscribeCommunityRoom('global');
      if (topicId)
        realtimeService.unsubscribeCommunityRoom('topic', { topicId });
      if (profileId)
        realtimeService.unsubscribeCommunityRoom('user', { profileId });
      unsubs.forEach((u) => u());
      unsubStatus();
    };
  }, [enabled, global, topicId, profileId]);

  const refetchHint = useCallback(() => {
    onReconnectRef.current?.();
  }, []);

  return { connected, refetchHint };
}
