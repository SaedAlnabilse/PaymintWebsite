import { describe, expect, it } from 'vitest';
import {
  isActivePendingCancellation,
  requiresPaidReactivation,
} from './subscriptionRecovery';

describe('subscription recovery state', () => {
  it('permits no-charge resume only for an active pending cancellation', () => {
    expect(
      isActivePendingCancellation({
        subscriptionStatus: 'ACTIVE',
        cancelAtPeriodEnd: true,
        subscriptionEndDate: '2099-01-01T00:00:00.000Z',
      }),
    ).toBe(true);
    expect(
      isActivePendingCancellation({
        subscriptionStatus: 'CANCELED',
        cancelAtPeriodEnd: true,
      }),
    ).toBe(false);
  });

  it.each(['CANCELED', 'PAST_DUE', 'SUSPENDED'])(
    'requires payment for %s even with a stale cancellation flag',
    (subscriptionStatus) => {
      expect(
        requiresPaidReactivation({
          subscriptionStatus,
          cancelAtPeriodEnd: true,
        }),
      ).toBe(true);
    },
  );

  it('requires paid reactivation when the ACTIVE cancellation period has expired', () => {
    const expired = {
      subscriptionStatus: 'ACTIVE',
      cancelAtPeriodEnd: true,
      subscriptionEndDate: '2020-01-01T00:00:00.000Z',
    };

    expect(isActivePendingCancellation(expired)).toBe(false);
    expect(requiresPaidReactivation(expired)).toBe(true);
  });

  it('fails closed when an ACTIVE cancellation has no authoritative period end', () => {
    const missingDeadline = {
      subscriptionStatus: 'ACTIVE',
      cancelAtPeriodEnd: true,
    };

    expect(isActivePendingCancellation(missingDeadline)).toBe(false);
    expect(requiresPaidReactivation(missingDeadline)).toBe(true);
  });
});
