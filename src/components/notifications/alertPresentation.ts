export const BACKOFFICE_ALERT_KINDS = [
  'cash_shortage',
  'cash_overage',
  'cash_alert',
  'stock_critical',
  'stock_warning',
  'refund',
  'billing',
  'support',
  'account',
  'system',
] as const;

export type AdminPortalAlertKind = (typeof BACKOFFICE_ALERT_KINDS)[number];
export type BackofficeAlertKind = AdminPortalAlertKind;
export type BackofficeAlertScope = 'owner' | 'location' | 'brand';
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertCategory = 'cash' | 'stock' | 'refunds' | 'updates';

export type AlertIconName =
  | 'alert-triangle'
  | 'plus'
  | 'alert-circle'
  | 'alert-octagon'
  | 'package'
  | 'rotate-ccw'
  | 'credit-card'
  | 'life-buoy'
  | 'shield'
  | 'bell';

export type AlertKindLabelKey =
  | 'notifications.kind.shortage'
  | 'notifications.kind.overage'
  | 'notifications.kind.cashAlert'
  | 'notifications.kind.criticalStock'
  | 'notifications.kind.lowStock'
  | 'notifications.kind.refund'
  | 'notifications.kind.billingUpdate'
  | 'notifications.kind.supportUpdate'
  | 'notifications.kind.accountUpdate'
  | 'notifications.kind.systemUpdate';

interface AlertKindPresentation {
  icon: AlertIconName;
  labelKey: AlertKindLabelKey;
}

export interface AlertPresentation extends AlertKindPresentation {
  /** A translation key. `label` is retained for the `{ icon, tone, label }` API. */
  label: AlertKindLabelKey;
  /** Tone is deliberately driven by the server-normalized severity. */
  tone: AlertSeverity;
}

export interface PresentableAlert {
  alertKind: AdminPortalAlertKind;
  severity: AlertSeverity;
}

export interface DeepLinkAlert {
  alertKind: AdminPortalAlertKind;
  establishmentId?: string | null;
  item?: { id?: string | null } | null;
  rawMaterial?: { id?: string | null } | null;
}

export type EstablishmentSlugLookup = Readonly<
  Record<string, string | null | undefined>
>;

export interface AlertDeepLinkContext {
  establishmentSlugById?: EstablishmentSlugLookup;
}

export const ALERT_KIND_PRESENTATION: Readonly<
  Record<AdminPortalAlertKind, AlertKindPresentation>
> = {
  cash_shortage: {
    icon: 'alert-triangle',
    labelKey: 'notifications.kind.shortage',
  },
  cash_overage: {
    icon: 'plus',
    labelKey: 'notifications.kind.overage',
  },
  cash_alert: {
    icon: 'alert-circle',
    labelKey: 'notifications.kind.cashAlert',
  },
  stock_critical: {
    icon: 'alert-octagon',
    labelKey: 'notifications.kind.criticalStock',
  },
  stock_warning: {
    icon: 'package',
    labelKey: 'notifications.kind.lowStock',
  },
  refund: {
    icon: 'rotate-ccw',
    labelKey: 'notifications.kind.refund',
  },
  billing: {
    icon: 'credit-card',
    labelKey: 'notifications.kind.billingUpdate',
  },
  support: {
    icon: 'life-buoy',
    labelKey: 'notifications.kind.supportUpdate',
  },
  account: {
    icon: 'shield',
    labelKey: 'notifications.kind.accountUpdate',
  },
  system: {
    icon: 'bell',
    labelKey: 'notifications.kind.systemUpdate',
  },
};

const CASH_ALERT_KINDS: ReadonlySet<AdminPortalAlertKind> = new Set([
  'cash_shortage',
  'cash_overage',
  'cash_alert',
]);

const STOCK_ALERT_KINDS: ReadonlySet<AdminPortalAlertKind> = new Set([
  'stock_critical',
  'stock_warning',
]);

const UPDATE_ALERT_KINDS: ReadonlySet<AdminPortalAlertKind> = new Set([
  'billing',
  'support',
  'account',
  'system',
]);

export const isCashAlertKind = (kind: AdminPortalAlertKind): boolean =>
  CASH_ALERT_KINDS.has(kind);

export const isStockAlertKind = (kind: AdminPortalAlertKind): boolean =>
  STOCK_ALERT_KINDS.has(kind);

export const isRefundAlertKind = (kind: AdminPortalAlertKind): boolean =>
  kind === 'refund';

export const isUpdateAlertKind = (kind: AdminPortalAlertKind): boolean =>
  UPDATE_ALERT_KINDS.has(kind);

export const isAlertKindInCategory = (
  kind: AdminPortalAlertKind,
  category: AlertCategory,
): boolean => {
  switch (category) {
    case 'cash':
      return isCashAlertKind(kind);
    case 'stock':
      return isStockAlertKind(kind);
    case 'refunds':
      return isRefundAlertKind(kind);
    case 'updates':
      return isUpdateAlertKind(kind);
  }
};

export const TRIAL_NOTIFICATION_TYPES = [
  'TRIAL_EXPIRING',
  'TRIAL_EXPIRED',
] as const;

const TRIAL_NOTIFICATION_TYPE_SET: ReadonlySet<string> = new Set(
  TRIAL_NOTIFICATION_TYPES,
);

export const isTrialAlertType = (type?: string | null): boolean =>
  typeof type === 'string' && TRIAL_NOTIFICATION_TYPE_SET.has(type);

export const isTrialAlert = (alert: { type?: string | null }): boolean =>
  isTrialAlertType(alert.type);

export const getAlertPresentation = (
  alert: PresentableAlert,
): AlertPresentation => {
  const presentation = ALERT_KIND_PRESENTATION[alert.alertKind];

  return {
    ...presentation,
    label: presentation.labelKey,
    tone: alert.severity,
  };
};

const getLocationDestination = (
  alert: DeepLinkAlert,
): string | null => {
  if (isStockAlertKind(alert.alertKind)) {
    const rawMaterialId = alert.rawMaterial?.id?.trim();
    if (rawMaterialId) {
      return `inventory?rawMaterialId=${encodeURIComponent(rawMaterialId)}`;
    }

    const productId = alert.item?.id?.trim();
    return productId
      ? `products?productId=${encodeURIComponent(productId)}`
      : 'products';
  }
  if (isCashAlertKind(alert.alertKind)) return 'reports/cash-discrepancy';
  if (isRefundAlertKind(alert.alertKind)) return 'orders';
  return null;
};

/**
 * Resolves a link from a notifications child route.
 *
 * Location-scope links stay route-relative so they preserve the active
 * `:locationSlug`. Owner and brand links require the supplied account-level
 * establishment id-to-slug lookup; an unresolved target is intentionally not
 * clickable.
 */
export const resolveAlertDeepLink = (
  alert: DeepLinkAlert,
  scope: BackofficeAlertScope,
  context: AlertDeepLinkContext = {},
): string | null => {
  if (alert.alertKind === 'billing') return '/owner/billing';
  if (alert.alertKind === 'support') return '/support';
  if (alert.alertKind === 'account' || alert.alertKind === 'system') return null;

  const destination = getLocationDestination(alert);
  if (!destination) return null;

  if (scope === 'location') {
    return `../${destination}`;
  }

  const establishmentId = alert.establishmentId?.trim();
  if (!establishmentId) return null;

  const locationSlug = context.establishmentSlugById?.[establishmentId]?.trim();
  if (!locationSlug) return null;

  return `/dashboard/${encodeURIComponent(locationSlug)}/${destination}`;
};
