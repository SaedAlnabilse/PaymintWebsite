import api, { extractErrorMessage } from '../config/api';

export const DASHBOARD_SESSION_ACTIVE_CODE = 'DASHBOARD_SESSION_ACTIVE';
export const DASHBOARD_SESSION_KICKED_CODE = 'DASHBOARD_SESSION_KICKED';
export const DASHBOARD_SESSION_ENDED_CODE = 'DASHBOARD_SESSION_ENDED';

const CLIENT_ID_KEY = 'mintcom.dashboard.clientId';

export interface DashboardSession {
  id: string;
  establishmentId: string;
  clientId: string;
  actorId: string;
  actorType: string;
  actorName: string;
  displayName?: string;
  actorEmail?: string | null;
  sourceApp?: string | null;
  status: string;
  lastSeenAt: string;
  expiresAt: string;
  createdAt: string;
}

export interface DashboardSessionConflict {
  code: typeof DASHBOARD_SESSION_ACTIVE_CODE;
  message: string;
  activeSession: DashboardSession;
  canKick: boolean;
}

export interface DashboardSessionEnterResult {
  session: DashboardSession;
  ttlMs: number;
}

export interface DashboardSessionKickPayload {
  code: typeof DASHBOARD_SESSION_KICKED_CODE;
  establishmentId: string;
  sessionId: string;
  clientId: string;
  actorName: string;
  kickedByName: string;
  message: string;
  timestamp: string;
}

const createClientId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `web-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const TAB_COUNT_PREFIX = 'mintcom.dashboard.tabCount.';

export const incrementDashboardTabCount = (establishmentId: string): number => {
  try {
    const key = `${TAB_COUNT_PREFIX}${establishmentId}`;
    const count = parseInt(localStorage.getItem(key) || '0', 10) + 1;
    localStorage.setItem(key, String(count));
    return count;
  } catch {
    return 1;
  }
};

export const decrementDashboardTabCount = (establishmentId: string): number => {
  try {
    const key = `${TAB_COUNT_PREFIX}${establishmentId}`;
    const count = Math.max(0, parseInt(localStorage.getItem(key) || '1', 10) - 1);
    if (count === 0) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, String(count));
    }
    return count;
  } catch {
    return 0;
  }
};

export const getDashboardClientId = (establishmentId?: string) => {
  const key = establishmentId
    ? `${CLIENT_ID_KEY}.${establishmentId}`
    : CLIENT_ID_KEY;

  try {
    if (typeof localStorage !== 'undefined') {
      const existing = localStorage.getItem(key);
      if (existing) return existing;

      const clientId = createClientId();
      localStorage.setItem(key, clientId);
      return clientId;
    }
  } catch {
    // ignore
  }

  return createClientId();
};


const isResponseCode = (error: any, code: string) =>
  error?.response?.data?.code === code;

export const isDashboardSessionConflict = (
  error: any,
): error is { response: { data: DashboardSessionConflict } } =>
  error?.response?.status === 409 &&
  isResponseCode(error, DASHBOARD_SESSION_ACTIVE_CODE);

export const isDashboardSessionEnded = (error: any) =>
  error?.response?.status === 423 &&
  (isResponseCode(error, DASHBOARD_SESSION_KICKED_CODE) ||
    isResponseCode(error, DASHBOARD_SESSION_ENDED_CODE));

export const getDashboardSessionErrorMessage = (error: any) =>
  extractErrorMessage(error) ||
  'This dashboard session has ended. Please log in again.';

export const dashboardSessionService = {
  async enter(establishmentId: string, sourceApp = 'website') {
    const response = await api.post<DashboardSessionEnterResult>(
      '/api/dashboard-sessions/enter',
      {
        establishmentId,
        clientId: getDashboardClientId(establishmentId),
        sourceApp,
      },
    );

    return response.data;
  },

  async heartbeat(sessionId: string, establishmentId?: string) {
    const response = await api.post<DashboardSessionEnterResult>(
      '/api/dashboard-sessions/heartbeat',
      {
        sessionId,
        clientId: getDashboardClientId(establishmentId),
      },
    );

    return response.data;
  },

  async leave(sessionId: string, establishmentId?: string) {
    await api.post(
      '/api/dashboard-sessions/leave',
      {
        sessionId,
        clientId: getDashboardClientId(establishmentId),
      },
    );
  },

  async kick(establishmentId: string, sessionId?: string) {
    const response = await api.post('/api/dashboard-sessions/kick', {
      establishmentId,
      sessionId,
    });

    return response.data;
  },
};

