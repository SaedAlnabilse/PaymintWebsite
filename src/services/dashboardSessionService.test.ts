import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../config/api';
import {
  dashboardSessionService,
  decrementDashboardTabCount,
  getDashboardClientId,
  incrementDashboardTabCount,
} from './dashboardSessionService';

vi.mock('../config/api', () => ({
  default: {
    post: vi.fn(),
  },
  extractErrorMessage: vi.fn((err) => err?.response?.data?.message || err?.message),
}));

describe('dashboardSessionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
  });

  it('generates and isolates client IDs per establishment in localStorage', () => {
    const clientIdA = getDashboardClientId('est-a');
    const clientIdB = getDashboardClientId('est-b');

    expect(clientIdA).toBeTruthy();
    expect(clientIdB).toBeTruthy();
    expect(clientIdA).not.toEqual(clientIdB);

    // Calling again returns the persisted ID for that establishment
    expect(getDashboardClientId('est-a')).toBe(clientIdA);
    expect(getDashboardClientId('est-b')).toBe(clientIdB);
  });

  it('tracks active tab counts per establishment accurately', () => {
    expect(incrementDashboardTabCount('est-a')).toBe(1);
    expect(incrementDashboardTabCount('est-a')).toBe(2);
    expect(incrementDashboardTabCount('est-b')).toBe(1);

    expect(decrementDashboardTabCount('est-a')).toBe(1);
    expect(decrementDashboardTabCount('est-a')).toBe(0);
    expect(decrementDashboardTabCount('est-b')).toBe(0);
  });

  it('passes scoped clientId to enter, heartbeat, and leave', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { session: { id: 'sess-1' } } });

    await dashboardSessionService.enter('est-1');
    const clientId1 = getDashboardClientId('est-1');

    expect(api.post).toHaveBeenLastCalledWith('/api/dashboard-sessions/enter', {
      establishmentId: 'est-1',
      clientId: clientId1,
      sourceApp: 'website',
    });

    await dashboardSessionService.heartbeat('sess-1', 'est-1');
    expect(api.post).toHaveBeenLastCalledWith('/api/dashboard-sessions/heartbeat', {
      sessionId: 'sess-1',
      clientId: clientId1,
    });

    await dashboardSessionService.leave('sess-1', 'est-1');
    expect(api.post).toHaveBeenLastCalledWith('/api/dashboard-sessions/leave', {
      sessionId: 'sess-1',
      clientId: clientId1,
    });
  });
});

