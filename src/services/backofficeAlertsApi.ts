import api from '../config/api';

export type BackofficeAlertScope = 'owner' | 'location' | 'brand';

export type AdminPortalAlertKind =
  | 'cash_shortage'
  | 'cash_overage'
  | 'cash_alert'
  | 'stock_critical'
  | 'stock_warning'
  | 'refund'
  | 'billing'
  | 'support'
  | 'account'
  | 'system';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface BackofficeAlert {
  id: string;
  type: string;
  alertKind: AdminPortalAlertKind;
  severity: AlertSeverity;
  title: string;
  message: string;
  isRead: boolean;
  isDismissible?: boolean;
  createdAt: string;
  establishmentId?: string;
  establishment?: {
    id: string;
    name: string;
    currency?: string;
  } | null;
  employeeId?: string;
  employeeName?: string;
  employee?: {
    id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
  } | null;
  item?: {
    id: string;
    name: string;
    availableStock?: number;
    lowStockThresholdYellow?: number;
    lowStockThresholdRed?: number;
  } | null;
  rawMaterial?: {
    id: string;
    name: string;
    quantity?: number;
    unit?: string;
    lowStockThreshold?: number;
  } | null;
  amount?: number | null;
  expectedAmount?: number | null;
  actualAmount?: number | null;
  discrepancy?: number | null;
}

export interface BackofficeAlertCounts {
  total: number;
  unread: number;
  cashShortages: number;
  cashOverages: number;
  cashAlerts?: number;
  stockCritical: number;
  stockWarnings: number;
  refunds: number;
  updates?: number;
  billingUnread?: number;
  byEstablishment?: Record<
    string,
    Omit<BackofficeAlertCounts, 'byEstablishment'>
  >;
}

export interface BackofficeAlertsResponse {
  notifications: BackofficeAlert[];
  total: number;
  unreadCount: number;
  counts: BackofficeAlertCounts;
}

export interface BackofficeUnreadCountResponse {
  count: number;
}

export interface BackofficeMarkAllReadResponse {
  updated: number;
}

export interface BackofficeDismissResponse {
  message: string;
  deleted?: true;
  blocked?: true;
}

export interface BackofficeAlertScopeParams {
  scope: BackofficeAlertScope;
  establishmentId?: string;
  establishmentIds?: readonly string[];
  type?: string;
}

export interface FetchBackofficeAlertsParams
  extends BackofficeAlertScopeParams {
  isRead?: boolean;
  limit?: number;
  offset?: number;
}

export class BackofficeAlertScopeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BackofficeAlertScopeError';
  }
}

const BACKOFFICE_ALERTS_PATH = '/api/notifications/backoffice-alerts';
const SKIP_AUTH_REDIRECT_CONFIG = {
  headers: { 'X-Skip-Auth-Redirect': 'true' },
};

const emptyCounts = (): BackofficeAlertCounts => ({
  total: 0,
  unread: 0,
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

const emptyAlertsResponse = (): BackofficeAlertsResponse => ({
  notifications: [],
  total: 0,
  unreadCount: 0,
  counts: emptyCounts(),
});

const normalizeId = (value?: string): string | undefined => {
  const normalized = value?.trim();
  return normalized || undefined;
};

export const normalizeBackofficeEstablishmentIds = (
  values?: readonly string[],
): string[] =>
  Array.from(
    new Set((values || []).map((value) => value.trim()).filter(Boolean)),
  );

const hasEmptyBrandScope = (params: BackofficeAlertScopeParams): boolean =>
  params.scope === 'brand' &&
  normalizeBackofficeEstablishmentIds(params.establishmentIds).length === 0;

const buildQuery = (params: FetchBackofficeAlertsParams): string => {
  const query = new URLSearchParams();
  query.set('scope', params.scope);

  if (params.scope === 'location') {
    const establishmentId = normalizeId(params.establishmentId);
    if (!establishmentId) {
      throw new BackofficeAlertScopeError(
        'A location notification scope requires an establishmentId.',
      );
    }
    query.set('establishmentId', establishmentId);
  } else if (params.scope === 'brand') {
    const establishmentIds = normalizeBackofficeEstablishmentIds(
      params.establishmentIds,
    );
    if (establishmentIds.length > 0) {
      query.set('establishmentIds', establishmentIds.join(','));
    }
  }

  if (params.isRead !== undefined) {
    query.set('isRead', String(params.isRead));
  }
  if (params.limit !== undefined) {
    query.set('limit', String(params.limit));
  }
  if (params.offset !== undefined) {
    query.set('offset', String(params.offset));
  }
  if (params.type) {
    query.set('type', params.type);
  }

  return query.toString();
};

const withQuery = (
  path: string,
  params: FetchBackofficeAlertsParams,
): string => `${path}?${buildQuery(params)}`;

export const isPersistentTrialAlert = (
  alert: Pick<BackofficeAlert, 'type'>,
): boolean =>
  alert.type === 'TRIAL_EXPIRING' || alert.type === 'TRIAL_EXPIRED';

export async function fetchAlerts(
  params: FetchBackofficeAlertsParams,
): Promise<BackofficeAlertsResponse> {
  if (hasEmptyBrandScope(params)) {
    return emptyAlertsResponse();
  }

  const response = await api.get<BackofficeAlertsResponse>(
    withQuery(BACKOFFICE_ALERTS_PATH, params),
    SKIP_AUTH_REDIRECT_CONFIG,
  );
  return response.data;
}

export async function fetchUnreadCount(
  params: BackofficeAlertScopeParams,
): Promise<BackofficeUnreadCountResponse> {
  if (hasEmptyBrandScope(params)) {
    return { count: 0 };
  }

  const response = await api.get<BackofficeUnreadCountResponse>(
    withQuery(`${BACKOFFICE_ALERTS_PATH}/unread-count`, params),
    SKIP_AUTH_REDIRECT_CONFIG,
  );
  return response.data;
}

export async function markRead(id: string): Promise<BackofficeAlert> {
  // `undefined` is intentional: these PATCH endpoints reject request bodies.
  const response = await api.patch<BackofficeAlert>(
    `${BACKOFFICE_ALERTS_PATH}/${encodeURIComponent(id)}/read`,
    undefined,
    SKIP_AUTH_REDIRECT_CONFIG,
  );
  return response.data;
}

export async function markAllRead(
  params: BackofficeAlertScopeParams,
): Promise<BackofficeMarkAllReadResponse> {
  if (hasEmptyBrandScope(params)) {
    return { updated: 0 };
  }

  // `undefined` is intentional: these PATCH endpoints reject request bodies.
  const response = await api.patch<BackofficeMarkAllReadResponse>(
    withQuery(`${BACKOFFICE_ALERTS_PATH}/read-all`, params),
    undefined,
    SKIP_AUTH_REDIRECT_CONFIG,
  );
  return response.data;
}

export async function dismiss(
  id: string,
): Promise<BackofficeDismissResponse> {
  const response = await api.delete<BackofficeDismissResponse>(
    `${BACKOFFICE_ALERTS_PATH}/${encodeURIComponent(id)}`,
    SKIP_AUTH_REDIRECT_CONFIG,
  );
  return response.data;
}

export const backofficeAlertsApi = {
  fetchAlerts,
  fetchUnreadCount,
  markRead,
  markAllRead,
  dismiss,
};

export default backofficeAlertsApi;
