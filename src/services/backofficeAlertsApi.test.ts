import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../config/api';
import {
  BackofficeAlertScopeError,
  dismiss,
  fetchAlerts,
  fetchUnreadCount,
  markAllRead,
  markRead,
} from './backofficeAlertsApi';

vi.mock('../config/api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const skipAuthRedirectConfig = {
  headers: { 'X-Skip-Auth-Redirect': 'true' },
};

describe('backofficeAlertsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds a scoped, paginated owner query without leaking location ids', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        notifications: [],
        total: 0,
        unreadCount: 0,
        counts: {},
      },
    });

    await fetchAlerts({
      scope: 'owner',
      establishmentId: 'must-not-be-sent',
      establishmentIds: ['also-not-sent'],
      isRead: false,
      limit: 50,
      offset: 100,
      type: 'CASH_ALERT',
    });

    const [url, config] = vi.mocked(api.get).mock.calls[0];
    const query = new URL(url as string, 'https://mintcom.test').searchParams;
    expect(query.get('scope')).toBe('owner');
    expect(query.get('isRead')).toBe('false');
    expect(query.get('limit')).toBe('50');
    expect(query.get('offset')).toBe('100');
    expect(query.get('type')).toBe('CASH_ALERT');
    expect(query.has('establishmentId')).toBe(false);
    expect(query.has('establishmentIds')).toBe(false);
    expect(config).toEqual(skipAuthRedirectConfig);
  });

  it('requires an establishment id for a location scope before making a request', async () => {
    await expect(fetchUnreadCount({ scope: 'location' })).rejects.toBeInstanceOf(
      BackofficeAlertScopeError,
    );
    expect(api.get).not.toHaveBeenCalled();
  });

  it('short-circuits an empty brand without calling the API', async () => {
    await expect(
      fetchAlerts({ scope: 'brand', establishmentIds: [], limit: 50 }),
    ).resolves.toMatchObject({
      notifications: [],
      total: 0,
      unreadCount: 0,
    });
    await expect(
      fetchUnreadCount({ scope: 'brand', establishmentIds: [] }),
    ).resolves.toEqual({ count: 0 });
    await expect(
      markAllRead({ scope: 'brand', establishmentIds: [] }),
    ).resolves.toEqual({ updated: 0 });
    expect(api.get).not.toHaveBeenCalled();
    expect(api.patch).not.toHaveBeenCalled();
  });

  it('sends brand ids as a comma-separated query parameter', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { count: 3 } });

    await fetchUnreadCount({
      scope: 'brand',
      establishmentIds: ['location-a', 'location-a', 'location-b'],
    });

    const [url] = vi.mocked(api.get).mock.calls[0];
    const query = new URL(url as string, 'https://mintcom.test').searchParams;
    expect(query.get('scope')).toBe('brand');
    expect(query.get('establishmentIds')).toBe('location-a,location-b');
  });

  it('sends no PATCH body and opts out of auth redirects', async () => {
    vi.mocked(api.patch)
      .mockResolvedValueOnce({ data: { id: 'alert-1', isRead: true } })
      .mockResolvedValueOnce({ data: { updated: 2 } });

    await markRead('alert/1');
    await markAllRead({ scope: 'location', establishmentId: 'location-a' });

    expect(api.patch).toHaveBeenNthCalledWith(
      1,
      '/api/notifications/backoffice-alerts/alert%2F1/read',
      undefined,
      skipAuthRedirectConfig,
    );
    expect(api.patch).toHaveBeenNthCalledWith(
      2,
      '/api/notifications/backoffice-alerts/read-all?scope=location&establishmentId=location-a',
      undefined,
      skipAuthRedirectConfig,
    );
  });

  it('returns blocked dismiss responses for the caller to toast', async () => {
    vi.mocked(api.delete).mockResolvedValue({
      data: { message: 'This alert cannot be dismissed', blocked: true },
    });

    await expect(dismiss('trial-alert')).resolves.toEqual({
      message: 'This alert cannot be dismissed',
      blocked: true,
    });
    expect(api.delete).toHaveBeenCalledWith(
      '/api/notifications/backoffice-alerts/trial-alert',
      skipAuthRedirectConfig,
    );
  });
});
