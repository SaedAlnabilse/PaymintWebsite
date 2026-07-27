import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BackofficeAlertScopeError,
  dismiss as dismissAlert,
  fetchAlerts,
  fetchUnreadCount,
  isPersistentTrialAlert,
  markAllRead as markAllAlertsRead,
  markRead as markAlertRead,
  normalizeBackofficeEstablishmentIds,
  type BackofficeAlert,
  type BackofficeAlertCounts,
  type BackofficeAlertScope,
  type BackofficeAlertScopeParams,
  type BackofficeDismissResponse,
  type BackofficeMarkAllReadResponse,
} from '../services/backofficeAlertsApi';

export type BackofficeAlertsHookMode = 'feed' | 'count';

export interface UseBackofficeAlertsOptions {
  scope: BackofficeAlertScope;
  establishmentId?: string;
  establishmentIds?: readonly string[];
  enabled?: boolean;
  mode?: BackofficeAlertsHookMode;
  pageSize?: number;
  poll?: boolean;
}

export interface UseBackofficeAlertsResult {
  alerts: BackofficeAlert[];
  counts: BackofficeAlertCounts | null;
  total: number;
  unreadCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
  loadMore: () => Promise<void>;
  markRead: (alert: BackofficeAlert) => Promise<BackofficeAlert>;
  markAllRead: (
    selectedEstablishmentId?: string,
  ) => Promise<BackofficeMarkAllReadResponse>;
  dismiss: (alert: BackofficeAlert) => Promise<BackofficeDismissResponse>;
}

export const BACKOFFICE_ALERTS_PAGE_SIZE = 50;
export const BACKOFFICE_ALERTS_POLL_INTERVAL_MS = 60_000;
export const BACKOFFICE_ALERTS_SYNC_EVENT =
  'mintcom:backoffice-alerts-changed';

export type BackofficeAlertsMutation =
  | 'mark-read'
  | 'mark-all-read'
  | 'dismiss';

export interface BackofficeAlertsSyncEventDetail {
  sourceId: string;
  mutation: BackofficeAlertsMutation;
}

let hookInstanceSequence = 0;

const createHookInstanceId = (): string => {
  hookInstanceSequence += 1;
  return `backoffice-alerts-${hookInstanceSequence}`;
};

const emitBackofficeAlertsSync = (
  sourceId: string,
  mutation: BackofficeAlertsMutation,
) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<BackofficeAlertsSyncEventDetail>(
      BACKOFFICE_ALERTS_SYNC_EVENT,
      { detail: { sourceId, mutation } },
    ),
  );
};

interface HookState {
  alerts: BackofficeAlert[];
  counts: BackofficeAlertCounts | null;
  total: number;
  unreadCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;
}

type LoadKind = 'initial' | 'refresh' | 'more' | 'poll';
type FlatAlertCounts = Omit<BackofficeAlertCounts, 'byEstablishment'>;

const createEmptyState = (isLoading = false): HookState => ({
  alerts: [],
  counts: null,
  total: 0,
  unreadCount: 0,
  isLoading,
  isRefreshing: false,
  isLoadingMore: false,
  error: null,
});

const clampCount = (value: number): number => Math.max(0, value);

const normalizePageSize = (value?: number): number => {
  if (!Number.isFinite(value)) return BACKOFFICE_ALERTS_PAGE_SIZE;
  return Math.min(100, Math.max(1, Math.trunc(value!)));
};

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    const candidate = error as {
      message?: unknown;
      response?: { data?: { message?: unknown; error?: unknown } | string };
    };
    const responseData = candidate.response?.data;
    if (typeof responseData === 'string' && responseData.trim()) {
      return responseData;
    }
    if (
      typeof responseData === 'object' &&
      responseData !== null &&
      typeof responseData.message === 'string'
    ) {
      return responseData.message;
    }
    if (
      typeof responseData === 'object' &&
      responseData !== null &&
      typeof responseData.error === 'string'
    ) {
      return responseData.error;
    }
    if (typeof candidate.message === 'string' && candidate.message.trim()) {
      return candidate.message;
    }
  }
  return 'Failed to load notifications.';
};

const isUpdateAlert = (alert: BackofficeAlert): boolean =>
  alert.alertKind === 'billing' ||
  alert.alertKind === 'support' ||
  alert.alertKind === 'account' ||
  alert.alertKind === 'system';

const adjustFlatCountsForDismiss = (
  counts: FlatAlertCounts,
  alert: BackofficeAlert,
  direction: -1 | 1,
): FlatAlertCounts => {
  const next = {
    ...counts,
    total: clampCount(counts.total + direction),
  };

  if (!alert.isRead) {
    next.unread = clampCount(counts.unread + direction);
  }

  if (alert.alertKind === 'cash_shortage') {
    next.cashShortages = clampCount(counts.cashShortages + direction);
  } else if (alert.alertKind === 'cash_overage') {
    next.cashOverages = clampCount(counts.cashOverages + direction);
  } else if (alert.alertKind === 'cash_alert') {
    next.cashAlerts = clampCount((counts.cashAlerts || 0) + direction);
  } else if (alert.alertKind === 'stock_critical') {
    next.stockCritical = clampCount(counts.stockCritical + direction);
  } else if (alert.alertKind === 'stock_warning') {
    next.stockWarnings = clampCount(counts.stockWarnings + direction);
  } else if (alert.alertKind === 'refund') {
    next.refunds = clampCount(counts.refunds + direction);
  } else if (isUpdateAlert(alert)) {
    next.updates = clampCount((counts.updates || 0) + direction);
  }

  if (alert.alertKind === 'billing' && !alert.isRead) {
    next.billingUnread = clampCount(
      (counts.billingUnread || 0) + direction,
    );
  }

  return next;
};

const adjustCountsForDismiss = (
  counts: BackofficeAlertCounts | null,
  alert: BackofficeAlert,
  direction: -1 | 1,
): BackofficeAlertCounts | null => {
  if (!counts) return null;

  const next = adjustFlatCountsForDismiss(counts, alert, direction);
  const establishmentId = alert.establishmentId;
  if (!establishmentId || !counts.byEstablishment?.[establishmentId]) {
    return { ...next, byEstablishment: counts.byEstablishment };
  }

  return {
    ...next,
    byEstablishment: {
      ...counts.byEstablishment,
      [establishmentId]: adjustFlatCountsForDismiss(
        counts.byEstablishment[establishmentId],
        alert,
        direction,
      ),
    },
  };
};

const adjustCountsForRead = (
  counts: BackofficeAlertCounts | null,
  alert: BackofficeAlert,
  direction: -1 | 1,
): BackofficeAlertCounts | null => {
  if (!counts) return null;

  const next: BackofficeAlertCounts = {
    ...counts,
    unread: clampCount(counts.unread + direction),
  };
  if (alert.alertKind === 'billing') {
    next.billingUnread = clampCount(
      (counts.billingUnread || 0) + direction,
    );
  }

  const establishmentId = alert.establishmentId;
  const bucket = establishmentId
    ? counts.byEstablishment?.[establishmentId]
    : undefined;
  if (establishmentId && bucket) {
    next.byEstablishment = {
      ...counts.byEstablishment,
      [establishmentId]: {
        ...bucket,
        unread: clampCount(bucket.unread + direction),
        billingUnread:
          alert.alertKind === 'billing'
            ? clampCount((bucket.billingUnread || 0) + direction)
            : bucket.billingUnread,
      },
    };
  }

  return next;
};

const adjustAggregateUnread = (
  counts: BackofficeAlertCounts | null,
  direction: number,
  establishmentId?: string,
): BackofficeAlertCounts | null => {
  if (!counts || direction === 0) return counts;

  const next: BackofficeAlertCounts = {
    ...counts,
    unread: clampCount(counts.unread + direction),
  };
  const bucket = establishmentId
    ? counts.byEstablishment?.[establishmentId]
    : undefined;
  if (establishmentId && bucket) {
    next.byEstablishment = {
      ...counts.byEstablishment,
      [establishmentId]: {
        ...bucket,
        unread: clampCount(bucket.unread + direction),
      },
    };
  }
  return next;
};

const applyReadState = (
  state: HookState,
  alertId: string,
  isRead: boolean,
  serverAlert?: Partial<BackofficeAlert>,
): HookState => {
  const existing = state.alerts.find((alert) => alert.id === alertId);
  if (!existing) return state;

  const unreadDirection =
    existing.isRead === isRead ? 0 : isRead ? -1 : 1;
  const alerts = state.alerts.map((alert) =>
    alert.id === alertId ? { ...alert, ...serverAlert, isRead } : alert,
  );

  return {
    ...state,
    alerts,
    unreadCount:
      unreadDirection === 0
        ? state.unreadCount
        : clampCount(state.unreadCount + unreadDirection),
    counts:
      unreadDirection === 0
        ? state.counts
        : adjustCountsForRead(state.counts, existing, unreadDirection),
  };
};

const mergeAlerts = (
  current: BackofficeAlert[],
  incoming: BackofficeAlert[],
): BackofficeAlert[] => {
  const byId = new Map(current.map((alert) => [alert.id, alert]));
  for (const alert of incoming) {
    byId.set(alert.id, alert);
  }
  return Array.from(byId.values());
};

export function useBackofficeAlerts({
  scope,
  establishmentId,
  establishmentIds,
  enabled = true,
  mode = 'feed',
  pageSize: requestedPageSize,
  poll = true,
}: UseBackofficeAlertsOptions): UseBackofficeAlertsResult {
  const pageSize = normalizePageSize(requestedPageSize);
  const locationId = establishmentId?.trim() || undefined;
  const brandIdsKey =
    scope === 'brand'
      ? normalizeBackofficeEstablishmentIds(establishmentIds).sort().join(',')
      : '';
  const stableBrandIds = useMemo(
    () => (brandIdsKey ? brandIdsKey.split(',') : []),
    [brandIdsKey],
  );
  const canFetch =
    enabled &&
    (scope === 'owner' ||
      (scope === 'location' && Boolean(locationId)) ||
      (scope === 'brand' && stableBrandIds.length > 0));

  const scopeParams = useMemo<BackofficeAlertScopeParams>(() => {
    if (scope === 'location') {
      return { scope, establishmentId: locationId };
    }
    if (scope === 'brand') {
      return { scope, establishmentIds: stableBrandIds };
    }
    return { scope };
  }, [locationId, scope, stableBrandIds]);

  const requestKey = `${scope}:${locationId || ''}:${brandIdsKey}:${mode}:${pageSize}:${String(
    enabled,
  )}`;
  const [state, setState] = useState<HookState>(() => createEmptyState());
  const [instanceId] = useState(createHookInstanceId);
  const stateRef = useRef(state);
  const requestKeyRef = useRef(requestKey);
  const requestIdRef = useRef(0);
  const requestInFlightRef = useRef(false);
  const pendingSyncRefreshRef = useRef(false);
  const mutationCountRef = useRef(0);
  const performFetchRef = useRef<(kind: LoadKind) => Promise<void>>(
    async () => undefined,
  );

  const updateState = useCallback(
    (updater: (current: HookState) => HookState) => {
      setState((current) => {
        const next = updater(current);
        stateRef.current = next;
        return next;
      });
    },
    [],
  );

  const flushPendingSyncRefresh = useCallback(() => {
    if (
      !pendingSyncRefreshRef.current ||
      requestInFlightRef.current ||
      mutationCountRef.current > 0
    ) {
      return;
    }
    pendingSyncRefreshRef.current = false;
    queueMicrotask(() => void performFetchRef.current('poll'));
  }, []);

  const performFetch = useCallback(
    async (kind: LoadKind): Promise<void> => {
      if (!canFetch) return;
      if (requestInFlightRef.current) return;
      if (kind === 'poll' && mutationCountRef.current > 0) return;

      requestInFlightRef.current = true;
      const requestId = ++requestIdRef.current;
      const activeRequestKey = requestKey;
      const append = kind === 'more';

      updateState((current) => ({
        ...current,
        isLoading: kind === 'initial',
        isRefreshing: kind === 'refresh',
        isLoadingMore: append,
        error: kind === 'poll' ? current.error : null,
      }));

      try {
        if (mode === 'count') {
          const response = await fetchUnreadCount(scopeParams);
          if (
            requestId !== requestIdRef.current ||
            activeRequestKey !== requestKeyRef.current
          ) {
            return;
          }
          updateState((current) => ({
            ...current,
            unreadCount: response.count,
            error: null,
          }));
          return;
        }

        const offset = append ? stateRef.current.alerts.length : 0;
        const response = await fetchAlerts({
          ...scopeParams,
          limit: pageSize,
          offset,
        });
        if (
          requestId !== requestIdRef.current ||
          activeRequestKey !== requestKeyRef.current
        ) {
          return;
        }

        updateState((current) => ({
          ...current,
          alerts: append
            ? mergeAlerts(current.alerts, response.notifications || [])
            : response.notifications || [],
          counts: response.counts || null,
          total: response.total || 0,
          unreadCount: response.unreadCount || 0,
          error: null,
        }));
      } catch (error) {
        if (
          requestId === requestIdRef.current &&
          activeRequestKey === requestKeyRef.current
        ) {
          updateState((current) => ({
            ...current,
            error: getErrorMessage(error),
          }));
        }
      } finally {
        if (
          requestId === requestIdRef.current &&
          activeRequestKey === requestKeyRef.current
        ) {
          requestInFlightRef.current = false;
          updateState((current) => ({
            ...current,
            isLoading: false,
            isRefreshing: false,
            isLoadingMore: false,
          }));
          flushPendingSyncRefresh();
        }
      }
    },
    [
      canFetch,
      flushPendingSyncRefresh,
      mode,
      pageSize,
      requestKey,
      scopeParams,
      updateState,
    ],
  );
  performFetchRef.current = performFetch;

  useEffect(() => {
    requestKeyRef.current = requestKey;
    requestIdRef.current += 1;
    requestInFlightRef.current = false;
    pendingSyncRefreshRef.current = false;
    updateState(() => createEmptyState(canFetch));

    if (canFetch) {
      void performFetch('initial');
    }

    return () => {
      requestIdRef.current += 1;
      requestInFlightRef.current = false;
      pendingSyncRefreshRef.current = false;
    };
  }, [canFetch, performFetch, requestKey, updateState]);

  useEffect(() => {
    if (!canFetch || typeof window === 'undefined') return;

    const onBackofficeAlertsSync = (event: Event) => {
      const detail = (event as CustomEvent<BackofficeAlertsSyncEventDetail>)
        .detail;
      if (!detail || detail.sourceId === instanceId) return;

      if (requestInFlightRef.current || mutationCountRef.current > 0) {
        pendingSyncRefreshRef.current = true;
        return;
      }
      void performFetchRef.current('poll');
    };

    window.addEventListener(
      BACKOFFICE_ALERTS_SYNC_EVENT,
      onBackofficeAlertsSync,
    );
    return () => {
      window.removeEventListener(
        BACKOFFICE_ALERTS_SYNC_EVENT,
        onBackofficeAlertsSync,
      );
    };
  }, [canFetch, instanceId]);

  useEffect(() => {
    if (!canFetch || !poll || typeof window === 'undefined') return;

    const pollIfVisible = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      void performFetch('poll');
    };
    const onVisibilityChange = () => {
      if (!document.hidden) pollIfVisible();
    };

    const intervalId = window.setInterval(
      pollIfVisible,
      BACKOFFICE_ALERTS_POLL_INTERVAL_MS,
    );
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [canFetch, performFetch, poll]);

  const refresh = useCallback(
    async () => performFetch('refresh'),
    [performFetch],
  );
  const retry = refresh;

  const loadMore = useCallback(async () => {
    if (
      mode !== 'feed' ||
      stateRef.current.isLoadingMore ||
      stateRef.current.alerts.length >= stateRef.current.total
    ) {
      return;
    }
    await performFetch('more');
  }, [mode, performFetch]);

  const markRead = useCallback(
    async (alert: BackofficeAlert): Promise<BackofficeAlert> => {
      if (alert.isRead) return alert;

      const persistentTrial = isPersistentTrialAlert(alert);
      updateState((current) => {
        const cleared = { ...current, error: null };
        return persistentTrial
          ? cleared
          : applyReadState(cleared, alert.id, true);
      });
      mutationCountRef.current += 1;

      try {
        const serverAlert = await markAlertRead(alert.id);
        const reconciled = { ...alert, ...serverAlert };
        updateState((current) =>
          applyReadState(
            current,
            alert.id,
            Boolean(serverAlert.isRead),
            serverAlert,
          ),
        );
        emitBackofficeAlertsSync(instanceId, 'mark-read');
        return reconciled;
      } catch (error) {
        updateState((current) => ({
          ...(persistentTrial
            ? current
            : applyReadState(current, alert.id, alert.isRead)),
          error: getErrorMessage(error),
        }));
        throw error;
      } finally {
        mutationCountRef.current = Math.max(0, mutationCountRef.current - 1);
        flushPendingSyncRefresh();
      }
    },
    [flushPendingSyncRefresh, instanceId, updateState],
  );

  const markAllRead = useCallback(
    async (
      selectedEstablishmentId?: string,
    ): Promise<BackofficeMarkAllReadResponse> => {
      const selectedLocationId = selectedEstablishmentId?.trim() || undefined;
      if (!canFetch) return { updated: 0 };

      if (
        scope === 'brand' &&
        selectedLocationId &&
        !stableBrandIds.includes(selectedLocationId)
      ) {
        throw new BackofficeAlertScopeError(
          'The selected establishment is not part of the active brand.',
        );
      }

      const targetLocationId =
        scope === 'location' ? locationId : selectedLocationId;
      const requestParams: BackofficeAlertScopeParams = targetLocationId
        ? { scope: 'location', establishmentId: targetLocationId }
        : scopeParams;
      const snapshot = stateRef.current;
      const affectedAlerts = snapshot.alerts.filter(
        (alert) =>
          !alert.isRead &&
          !isPersistentTrialAlert(alert) &&
          (!targetLocationId || alert.establishmentId === targetLocationId),
      );
      const affectedIds = new Set(affectedAlerts.map((alert) => alert.id));

      updateState((current) => {
        let counts = current.counts;
        for (const alert of affectedAlerts) {
          counts = adjustCountsForRead(counts, alert, -1);
        }
        return {
          ...current,
          alerts: current.alerts.map((alert) =>
            affectedIds.has(alert.id) ? { ...alert, isRead: true } : alert,
          ),
          counts,
          unreadCount: clampCount(
            current.unreadCount - affectedAlerts.length,
          ),
          error: null,
        };
      });
      mutationCountRef.current += 1;

      try {
        const result = await markAllAlertsRead(requestParams);
        const correction = affectedAlerts.length - result.updated;
        if (correction !== 0) {
          updateState((current) => ({
            ...current,
            unreadCount: clampCount(current.unreadCount + correction),
            counts: adjustAggregateUnread(
              current.counts,
              correction,
              targetLocationId,
            ),
          }));
        }
        emitBackofficeAlertsSync(instanceId, 'mark-all-read');
        return result;
      } catch (error) {
        updateState((current) => ({
          ...snapshot,
          isLoading: current.isLoading,
          isRefreshing: current.isRefreshing,
          isLoadingMore: current.isLoadingMore,
          error: getErrorMessage(error),
        }));
        throw error;
      } finally {
        mutationCountRef.current = Math.max(0, mutationCountRef.current - 1);
        flushPendingSyncRefresh();
      }
    },
    [
      canFetch,
      locationId,
      scope,
      scopeParams,
      stableBrandIds,
      flushPendingSyncRefresh,
      instanceId,
      updateState,
    ],
  );

  const dismiss = useCallback(
    async (alert: BackofficeAlert): Promise<BackofficeDismissResponse> => {
      const snapshot = stateRef.current;
      updateState((current) => ({
        ...current,
        alerts: current.alerts.filter((item) => item.id !== alert.id),
        counts: adjustCountsForDismiss(current.counts, alert, -1),
        total: clampCount(current.total - 1),
        unreadCount: alert.isRead
          ? current.unreadCount
          : clampCount(current.unreadCount - 1),
        error: null,
      }));
      mutationCountRef.current += 1;

      try {
        const result = await dismissAlert(alert.id);
        if (result.blocked) {
          updateState((current) => ({
            ...snapshot,
            isLoading: current.isLoading,
            isRefreshing: current.isRefreshing,
            isLoadingMore: current.isLoadingMore,
            error: null,
          }));
        } else {
          emitBackofficeAlertsSync(instanceId, 'dismiss');
        }
        return result;
      } catch (error) {
        updateState((current) => ({
          ...snapshot,
          isLoading: current.isLoading,
          isRefreshing: current.isRefreshing,
          isLoadingMore: current.isLoadingMore,
          error: getErrorMessage(error),
        }));
        throw error;
      } finally {
        mutationCountRef.current = Math.max(0, mutationCountRef.current - 1);
        flushPendingSyncRefresh();
      }
    },
    [flushPendingSyncRefresh, instanceId, updateState],
  );

  return {
    alerts: state.alerts,
    counts: state.counts,
    total: state.total,
    unreadCount: state.unreadCount,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    isLoadingMore: state.isLoadingMore,
    error: state.error,
    hasMore: mode === 'feed' && state.alerts.length < state.total,
    refresh,
    retry,
    loadMore,
    markRead,
    markAllRead,
    dismiss,
  };
}

export default useBackofficeAlerts;
