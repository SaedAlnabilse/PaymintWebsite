import { describe, expect, it } from 'vitest';
import {
  isAccountPendingDeletionError,
  isLocationRecoveryPage,
  isLocationRecoveryRequest,
} from './recoveryRouting';

describe('recovery routing', () => {
  it.each([
    ['get', '/api/establishments/loc-1/deletion-status'],
    ['post', '/api/establishments/loc-1/cancel-deletion?from=email'],
    ['get', '/api/establishments/loc-1/stats'],
    ['get', 'https://example.test/api/establishments/loc-1/export/customers'],
    ['delete', '/api/establishments/loc-1/dissolve'],
  ])('recognizes %s %s as a recovery request', (method, url) => {
    expect(isLocationRecoveryRequest(url, method)).toBe(true);
  });

  it('does not exempt an ordinary locked-location API', () => {
    expect(
      isLocationRecoveryRequest('/api/establishments/loc-1/app-settings', 'get'),
    ).toBe(false);
  });

  it('keeps only location Settings routes mounted for recovery', () => {
    expect(isLocationRecoveryPage('/dashboard/cafe-one/settings')).toBe(true);
    expect(isLocationRecoveryPage('/dashboard/cafe-one/orders')).toBe(false);
    expect(isLocationRecoveryPage('/owner/billing')).toBe(false);
  });

  it('distinguishes account deletion locks from billing locks', () => {
    expect(
      isAccountPendingDeletionError({
        response: { status: 423, data: { code: 'ACCOUNT_PENDING_DELETION' } },
      }),
    ).toBe(true);
    expect(
      isAccountPendingDeletionError({
        response: { status: 423, data: { code: 'SUBSCRIPTION_REQUIRED' } },
      }),
    ).toBe(false);
  });
});

