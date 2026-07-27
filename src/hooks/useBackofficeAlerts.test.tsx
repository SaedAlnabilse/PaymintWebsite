import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  dismiss as dismissAlert,
  fetchAlerts,
  fetchUnreadCount,
  markAllRead as markAllAlertsRead,
  markRead as markAlertRead,
  type BackofficeAlert,
  type BackofficeAlertCounts,
  type BackofficeAlertsResponse,
} from '../services/backofficeAlertsApi';
import {
  BACKOFFICE_ALERTS_POLL_INTERVAL_MS,
  BACKOFFICE_ALERTS_SYNC_EVENT,
  useBackofficeAlerts,
} from './useBackofficeAlerts';

vi.mock('../services/backofficeAlertsApi', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../services/backofficeAlertsApi')>();
  return {
    ...actual,
    fetchAlerts: vi.fn(),
    fetchUnreadCount: vi.fn(),
    markRead: vi.fn(),
    markAllRead: vi.fn(),
    dismiss: vi.fn(),
  };
});

const makeCounts = (
  total: number,
  unread: number,
): BackofficeAlertCounts => ({
  total,
  unread,
  cashShortages: 0,
  cashOverages: 0,
  cashAlerts: 0,
  stockCritical: 0,
  stockWarnings: 0,
  refunds: 0,
  updates: 0,
  billingUnread: 0,
  byEstablishment: {},
});

const makeAlert = (
  id: string,
  overrides: Partial<BackofficeAlert> = {},
): BackofficeAlert => ({
  id,
  type: 'STOCK_ALERT_RED',
  alertKind: 'stock_critical',
  severity: 'critical',
  title: `Alert ${id}`,
  message: 'Needs attention',
  isRead: false,
  isDismissible: true,
  createdAt: '2026-07-26T10:00:00.000Z',
  establishmentId: 'location-a',
  ...overrides,
});

const makeResponse = (
  notifications: BackofficeAlert[],
  total = notifications.length,
): BackofficeAlertsResponse => ({
  notifications,
  total,
  unreadCount: notifications.filter((alert) => !alert.isRead).length,
  counts: makeCounts(
    total,
    notifications.filter((alert) => !alert.isRead).length,
  ),
});

describe('useBackofficeAlerts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchUnreadCount).mockResolvedValue({ count: 0 });
    vi.mocked(markAllAlertsRead).mockResolvedValue({ updated: 0 });
    vi.mocked(dismissAlert).mockResolvedValue({
      message: 'Deleted',
      deleted: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: false,
    });
  });

  it('loads offset pages and keeps the brand request stable when ids reorder', async () => {
    const firstPage = [makeAlert('a'), makeAlert('b')];
    const secondPage = [makeAlert('c')];
    vi.mocked(fetchAlerts)
      .mockResolvedValueOnce(makeResponse(firstPage, 3))
      .mockResolvedValueOnce(makeResponse(secondPage, 3));

    const { result, rerender } = renderHook(
      (props: { ids: string[] }) =>
        useBackofficeAlerts({
          scope: 'brand',
          establishmentIds: props.ids,
          pageSize: 2,
          poll: false,
        }),
      { initialProps: { ids: ['location-b', 'location-a'] } },
    );

    await waitFor(() => expect(result.current.alerts).toHaveLength(2));
    expect(fetchAlerts).toHaveBeenLastCalledWith({
      scope: 'brand',
      establishmentIds: ['location-a', 'location-b'],
      limit: 2,
      offset: 0,
    });

    rerender({ ids: ['location-a', 'location-b'] });
    expect(fetchAlerts).toHaveBeenCalledTimes(1);

    await act(async () => result.current.loadMore());
    expect(fetchAlerts).toHaveBeenLastCalledWith({
      scope: 'brand',
      establishmentIds: ['location-a', 'location-b'],
      limit: 2,
      offset: 2,
    });
    expect(result.current.alerts.map((alert) => alert.id)).toEqual([
      'a',
      'b',
      'c',
    ]);
    expect(result.current.hasMore).toBe(false);
  });

  it('uses only unread-count polling for count mode and pauses while hidden', async () => {
    vi.useFakeTimers();
    vi.mocked(fetchUnreadCount).mockResolvedValue({ count: 4 });

    renderHook(() =>
      useBackofficeAlerts({ scope: 'owner', mode: 'count' }),
    );
    await act(async () => Promise.resolve());
    expect(fetchUnreadCount).toHaveBeenCalledTimes(1);
    expect(fetchAlerts).not.toHaveBeenCalled();

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: true,
    });
    await act(async () => {
      vi.advanceTimersByTime(BACKOFFICE_ALERTS_POLL_INTERVAL_MS);
      await Promise.resolve();
    });
    expect(fetchUnreadCount).toHaveBeenCalledTimes(1);

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: false,
    });
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
      await Promise.resolve();
    });
    expect(fetchUnreadCount).toHaveBeenCalledTimes(2);
    expect(fetchAlerts).not.toHaveBeenCalled();
  });

  it('does not optimistically mark persistent trial alerts read', async () => {
    const trial = makeAlert('trial', {
      type: 'TRIAL_EXPIRING',
      alertKind: 'billing',
      isDismissible: false,
    });
    vi.mocked(fetchAlerts).mockResolvedValue(makeResponse([trial]));

    let resolveMarkRead!: (alert: BackofficeAlert) => void;
    vi.mocked(markAlertRead).mockReturnValue(
      new Promise((resolve) => {
        resolveMarkRead = resolve;
      }),
    );

    const { result } = renderHook(() =>
      useBackofficeAlerts({ scope: 'owner', poll: false }),
    );
    await waitFor(() => expect(result.current.alerts).toHaveLength(1));

    let markPromise!: Promise<BackofficeAlert>;
    act(() => {
      markPromise = result.current.markRead(trial);
    });
    expect(result.current.alerts[0].isRead).toBe(false);
    expect(result.current.unreadCount).toBe(1);

    resolveMarkRead({ ...trial, isRead: false });
    await act(async () => markPromise);
    expect(result.current.alerts[0].isRead).toBe(false);
    expect(result.current.unreadCount).toBe(1);
  });

  it('keeps trial alerts unread during mark-all and scopes a selected location', async () => {
    const normal = makeAlert('normal');
    const trial = makeAlert('trial', {
      type: 'TRIAL_EXPIRED',
      alertKind: 'billing',
      isDismissible: false,
    });
    vi.mocked(fetchAlerts).mockResolvedValue(makeResponse([normal, trial]));
    vi.mocked(markAllAlertsRead).mockResolvedValue({ updated: 1 });

    const { result } = renderHook(() =>
      useBackofficeAlerts({ scope: 'owner', poll: false }),
    );
    await waitFor(() => expect(result.current.alerts).toHaveLength(2));

    await act(async () => result.current.markAllRead('location-a'));
    expect(markAllAlertsRead).toHaveBeenCalledWith({
      scope: 'location',
      establishmentId: 'location-a',
    });
    expect(result.current.alerts.find((alert) => alert.id === 'normal')?.isRead).toBe(
      true,
    );
    expect(result.current.alerts.find((alert) => alert.id === 'trial')?.isRead).toBe(
      false,
    );
    expect(result.current.unreadCount).toBe(1);
  });

  it('refreshes other hook instances after a mutation without refreshing the source', async () => {
    const alert = makeAlert('shared');
    vi.mocked(fetchAlerts).mockResolvedValue(makeResponse([alert]));
    vi.mocked(fetchUnreadCount)
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });
    vi.mocked(markAlertRead).mockResolvedValue({ ...alert, isRead: true });

    const { result } = renderHook(() => ({
      feed: useBackofficeAlerts({ scope: 'owner', poll: false }),
      count: useBackofficeAlerts({
        scope: 'owner',
        mode: 'count',
        poll: false,
      }),
    }));
    await waitFor(() => {
      expect(result.current.feed.alerts).toHaveLength(1);
      expect(result.current.count.unreadCount).toBe(1);
    });

    await act(async () => result.current.feed.markRead(alert));

    await waitFor(() => expect(result.current.count.unreadCount).toBe(0));
    expect(fetchUnreadCount).toHaveBeenCalledTimes(2);
    expect(fetchAlerts).toHaveBeenCalledTimes(1);
  });

  it('emits sync events for successful read-all and delete mutations', async () => {
    const alert = makeAlert('event');
    vi.mocked(fetchAlerts).mockResolvedValue(makeResponse([alert]));
    vi.mocked(markAllAlertsRead).mockResolvedValue({ updated: 1 });
    vi.mocked(dismissAlert).mockResolvedValue({
      message: 'Deleted',
      deleted: true,
    });
    const mutations: string[] = [];
    const listener = (event: Event) => {
      mutations.push(
        (event as CustomEvent<{ mutation: string }>).detail.mutation,
      );
    };
    window.addEventListener(BACKOFFICE_ALERTS_SYNC_EVENT, listener);

    const { result } = renderHook(() =>
      useBackofficeAlerts({ scope: 'owner', poll: false }),
    );
    await waitFor(() => expect(result.current.alerts).toHaveLength(1));
    await act(async () => result.current.markAllRead());
    await act(async () => result.current.dismiss({ ...alert, isRead: true }));

    window.removeEventListener(BACKOFFICE_ALERTS_SYNC_EVENT, listener);
    expect(mutations).toEqual(['mark-all-read', 'dismiss']);
  });

  it('restores an optimistically dismissed row when the API blocks deletion', async () => {
    const alert = makeAlert('blocked', { isDismissible: false });
    vi.mocked(fetchAlerts).mockResolvedValue(makeResponse([alert]));
    vi.mocked(dismissAlert).mockResolvedValue({
      message: 'This notification cannot be dismissed',
      blocked: true,
    });
    const listener = vi.fn();
    window.addEventListener(BACKOFFICE_ALERTS_SYNC_EVENT, listener);

    const { result } = renderHook(() =>
      useBackofficeAlerts({ scope: 'owner', poll: false }),
    );
    await waitFor(() => expect(result.current.alerts).toHaveLength(1));

    let response;
    await act(async () => {
      response = await result.current.dismiss(alert);
    });
    expect(response).toEqual({
      message: 'This notification cannot be dismissed',
      blocked: true,
    });
    expect(result.current.alerts).toEqual([alert]);
    expect(result.current.total).toBe(1);
    expect(result.current.unreadCount).toBe(1);
    expect(listener).not.toHaveBeenCalled();
    window.removeEventListener(BACKOFFICE_ALERTS_SYNC_EVENT, listener);
  });
});
