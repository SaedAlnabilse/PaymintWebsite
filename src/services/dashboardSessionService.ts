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

export const getDashboardClientId = () => {
  const existing = localStorage.getItem(CLIENT_ID_KEY);
  if (existing) return existing;

  const clientId = createClientId();
  localStorage.setItem(CLIENT_ID_KEY, clientId);
  return clientId;
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
        clientId: getDashboardClientId(),
        sourceApp,
      },
    );

    return response.data;
  },

  async heartbeat(sessionId: string) {
    const response = await api.post<DashboardSessionEnterResult>(
      '/api/dashboard-sessions/heartbeat',
      {
        sessionId,
        clientId: getDashboardClientId(),
      },
    );

    return response.data;
  },

  async leave(sessionId: string) {
    await api.post(
      '/api/dashboard-sessions/leave',
      {
        sessionId,
        clientId: getDashboardClientId(),
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
