export interface SubscriptionRecoveryState {
  subscriptionStatus?: string | null;
  cancelAtPeriodEnd?: boolean | null;
  currentPeriodEnd?: string | null;
  subscriptionEndDate?: string | null;
}

export const PAID_REACTIVATION_STATUSES = new Set([
  'CANCELED',
  'PAST_DUE',
  'SUSPENDED',
]);

export function normalizedSubscriptionStatus(
  state: SubscriptionRecoveryState,
): string {
  return (state.subscriptionStatus || '').toUpperCase();
}

/** A no-charge resume exists only while the already-paid subscription is ACTIVE. */
export function isActivePendingCancellation(
  state: SubscriptionRecoveryState,
  now = new Date(),
): boolean {
  if (
    normalizedSubscriptionStatus(state) !== 'ACTIVE' ||
    state.cancelAtPeriodEnd !== true
  ) {
    return false;
  }

  const rawPeriodEnd = state.currentPeriodEnd || state.subscriptionEndDate;
  if (!rawPeriodEnd) return false;

  const periodEnd = new Date(rawPeriodEnd);
  return !Number.isNaN(periodEnd.getTime()) && periodEnd > now;
}

export function requiresPaidReactivation(
  state: SubscriptionRecoveryState,
): boolean {
  const status = normalizedSubscriptionStatus(state);
  return (
    PAID_REACTIVATION_STATUSES.has(status) ||
    (status === 'ACTIVE' &&
      state.cancelAtPeriodEnd === true &&
      !isActivePendingCancellation(state))
  );
}
