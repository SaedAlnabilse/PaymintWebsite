import type { Account, Establishment } from '../types';

export const ACCOUNT_RECOVERY_PATH = '/account-restore';
export const MANUAL_DELETION_LOCK_REASON = 'PENDING_DELETION';

type AccountDeletionState = Pick<
  Account,
  'deletionRequestedAt' | 'deletionScheduledFor'
> | null | undefined;

export interface AccountDeletionLockPayload {
  deletionRequestedAt?: string | null;
  deletionScheduledFor?: string | null;
}

type EstablishmentDeletionState = Pick<
  Establishment,
  | 'deletionRequestedAt'
  | 'deletionScheduledFor'
  | 'deletionExportSentTo'
  | 'accessLockReason'
> | null | undefined;

export function hasPendingAccountDeletion(account: AccountDeletionState): boolean {
  return Boolean(account?.deletionRequestedAt && account?.deletionScheduledFor);
}

/**
 * Preserve a server-reported deletion lock before a hard recovery redirect.
 * This closes the stale-tab case where localStorage predates the delete request
 * and the recovery screen would otherwise immediately route away again.
 */
export function mergeAccountDeletionLock<T extends Record<string, unknown>>(
  account: T,
  payload: AccountDeletionLockPayload,
  observedAt = new Date().toISOString(),
): T & Required<AccountDeletionLockPayload> {
  return {
    ...account,
    deletionRequestedAt:
      payload.deletionRequestedAt ||
      (typeof account.deletionRequestedAt === 'string'
        ? account.deletionRequestedAt
        : observedAt),
    deletionScheduledFor:
      payload.deletionScheduledFor ||
      (typeof account.deletionScheduledFor === 'string'
        ? account.deletionScheduledFor
        : ''),
  };
}

export function getDeletionDeadline(
  deletionScheduledFor: string | null | undefined,
): Date | null {
  if (!deletionScheduledFor) return null;

  const deadline = new Date(deletionScheduledFor);
  return Number.isNaN(deadline.getTime()) ? null : deadline;
}

export function getDaysUntilDeletion(
  deletionScheduledFor: string | null | undefined,
  now = new Date(),
): number | null {
  const deadline = getDeletionDeadline(deletionScheduledFor);
  if (!deadline) return null;

  const remainingMs = deadline.getTime() - now.getTime();
  return Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
}

export function isManualEstablishmentDeletionPending(
  establishment: EstablishmentDeletionState,
): boolean {
  if (!establishment?.deletionRequestedAt || !establishment.deletionScheduledFor) {
    return false;
  }

  if (establishment.accessLockReason) {
    return establishment.accessLockReason === MANUAL_DELETION_LOCK_REASON;
  }

  // Compatibility for a pending-deletion response produced before
  // accessLockReason was exposed. Manual deletion always records the export
  // recipient; billing- and account-originated deletion do not.
  return Boolean(establishment.deletionExportSentTo);
}

export function getEstablishmentSlug(establishment: Establishment): string {
  const loginId = establishment.establishmentLoginId?.trim();
  return loginId || establishment.id;
}

export function buildLocationDeletionRecoveryPath(slug: string): string {
  return `/dashboard/${encodeURIComponent(slug)}/settings?section=danger-zone&restoreDeletion=1`;
}

export function isLocationDeletionRecoveryDeepLink(search: string): boolean {
  const params = new URLSearchParams(search);
  return (
    params.get('section') === 'danger-zone' ||
    params.get('restoreDeletion') === '1'
  );
}
