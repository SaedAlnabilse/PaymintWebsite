import { describe, expect, it } from 'vitest';

import {
  ALERT_KIND_PRESENTATION,
  BACKOFFICE_ALERT_KINDS,
  getAlertPresentation,
  isAlertKindInCategory,
  isCashAlertKind,
  isRefundAlertKind,
  isStockAlertKind,
  isTrialAlert,
  isTrialAlertType,
  isUpdateAlertKind,
  resolveAlertDeepLink,
  type AdminPortalAlertKind,
  type AlertSeverity,
  type BackofficeAlertScope,
} from './alertPresentation';

const expectedPresentations = {
  cash_shortage: ['alert-triangle', 'notifications.kind.shortage'],
  cash_overage: ['plus', 'notifications.kind.overage'],
  cash_alert: ['alert-circle', 'notifications.kind.cashAlert'],
  stock_critical: ['alert-octagon', 'notifications.kind.criticalStock'],
  stock_warning: ['package', 'notifications.kind.lowStock'],
  refund: ['rotate-ccw', 'notifications.kind.refund'],
  billing: ['credit-card', 'notifications.kind.billingUpdate'],
  support: ['life-buoy', 'notifications.kind.supportUpdate'],
  account: ['shield', 'notifications.kind.accountUpdate'],
  system: ['bell', 'notifications.kind.systemUpdate'],
} as const;

describe('alert presentation', () => {
  it.each(BACKOFFICE_ALERT_KINDS)(
    'maps %s to an icon and translation key',
    (alertKind) => {
      const [icon, labelKey] = expectedPresentations[alertKind];

      expect(ALERT_KIND_PRESENTATION[alertKind]).toEqual({ icon, labelKey });
      expect(
        getAlertPresentation({ alertKind, severity: 'info' }),
      ).toMatchObject({ icon, label: labelKey, labelKey });
    },
  );

  it.each<AlertSeverity>(['critical', 'warning', 'info'])(
    'uses the server severity as the %s tone',
    (severity) => {
      expect(
        getAlertPresentation({ alertKind: 'system', severity }).tone,
      ).toBe(severity);
    },
  );
});

describe('alert categories', () => {
  const expectedCategoryByKind: Record<
    AdminPortalAlertKind,
    'cash' | 'stock' | 'refunds' | 'updates'
  > = {
    cash_shortage: 'cash',
    cash_overage: 'cash',
    cash_alert: 'cash',
    stock_critical: 'stock',
    stock_warning: 'stock',
    refund: 'refunds',
    billing: 'updates',
    support: 'updates',
    account: 'updates',
    system: 'updates',
  };

  it.each(BACKOFFICE_ALERT_KINDS)(
    'places %s in exactly one category',
    (kind) => {
      const matchingCategories = (
        ['cash', 'stock', 'refunds', 'updates'] as const
      ).filter((category) => isAlertKindInCategory(kind, category));

      expect(matchingCategories).toEqual([expectedCategoryByKind[kind]]);
      expect(isCashAlertKind(kind)).toBe(expectedCategoryByKind[kind] === 'cash');
      expect(isStockAlertKind(kind)).toBe(expectedCategoryByKind[kind] === 'stock');
      expect(isRefundAlertKind(kind)).toBe(
        expectedCategoryByKind[kind] === 'refunds',
      );
      expect(isUpdateAlertKind(kind)).toBe(
        expectedCategoryByKind[kind] === 'updates',
      );
    },
  );
});

describe('trial alerts', () => {
  it.each(['TRIAL_EXPIRING', 'TRIAL_EXPIRED'])(
    'recognizes non-clearable type %s',
    (type) => {
      expect(isTrialAlertType(type)).toBe(true);
      expect(isTrialAlert({ type })).toBe(true);
    },
  );

  it.each([undefined, null, '', 'BILLING_UPDATE', 'trial_expired'])(
    'does not classify %s as a trial alert',
    (type) => {
      expect(isTrialAlertType(type)).toBe(false);
      expect(isTrialAlert({ type })).toBe(false);
    },
  );
});

describe('alert deep links', () => {
  const locationSlug = 'amman-main';
  const establishmentId = 'establishment-1';
  const context = {
    establishmentSlugById: { [establishmentId]: locationSlug },
  };

  const destinationByKind: Record<AdminPortalAlertKind, string | null> = {
    cash_shortage: 'reports/cash-discrepancy',
    cash_overage: 'reports/cash-discrepancy',
    cash_alert: 'reports/cash-discrepancy',
    stock_critical: 'products',
    stock_warning: 'products',
    refund: 'orders',
    billing: '/owner/billing',
    support: '/support',
    account: null,
    system: null,
  };

  it.each<BackofficeAlertScope>(['owner', 'location', 'brand'])(
    'resolves every alert kind for the %s scope',
    (scope) => {
      for (const alertKind of BACKOFFICE_ALERT_KINDS) {
        const destination = destinationByKind[alertKind];
        const actual = resolveAlertDeepLink(
          { alertKind, establishmentId },
          scope,
          context,
        );

        if (destination === null || destination.startsWith('/')) {
          expect(actual, alertKind).toBe(destination);
        } else if (scope === 'location') {
          expect(actual, alertKind).toBe(`../${destination}`);
        } else {
          expect(actual, alertKind).toBe(
            `/dashboard/${locationSlug}/${destination}`,
          );
        }
      }
    },
  );

  it.each<BackofficeAlertScope>(['owner', 'brand'])(
    'returns null for unresolved %s location targets',
    (scope) => {
      for (const alertKind of [
        'cash_shortage',
        'cash_overage',
        'cash_alert',
        'stock_critical',
        'stock_warning',
        'refund',
      ] as const) {
        expect(
          resolveAlertDeepLink({ alertKind, establishmentId }, scope),
          alertKind,
        ).toBeNull();
        expect(
          resolveAlertDeepLink({ alertKind }, scope, context),
          alertKind,
        ).toBeNull();
      }
    },
  );

  it('trims and URL-encodes a supplied location slug', () => {
    expect(
      resolveAlertDeepLink(
        { alertKind: 'refund', establishmentId },
        'owner',
        {
          establishmentSlugById: {
            [establishmentId]: '  Amman flagship / عمان  ',
          },
        },
      ),
    ).toBe('/dashboard/Amman%20flagship%20%2F%20%D8%B9%D9%85%D8%A7%D9%86/orders');
  });

  it('links a raw-material stock alert directly to its recipe material editor target', () => {
    expect(
      resolveAlertDeepLink(
        {
          alertKind: 'stock_warning',
          establishmentId,
          rawMaterial: { id: 'material / pistachios' },
        },
        'location',
        context,
      ),
    ).toBe('../inventory?rawMaterialId=material%20%2F%20pistachios');
  });

  it('links a product stock alert directly to its product editor target', () => {
    expect(
      resolveAlertDeepLink(
        {
          alertKind: 'stock_critical',
          establishmentId,
          item: { id: 'seasonal-spice-kit' },
        },
        'owner',
        context,
      ),
    ).toBe(
      '/dashboard/amman-main/products?productId=seasonal-spice-kit',
    );
  });
});
