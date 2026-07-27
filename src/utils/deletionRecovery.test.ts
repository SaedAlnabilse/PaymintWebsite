import { describe, expect, it } from 'vitest';
import {
  hasPendingAccountDeletion,
  mergeAccountDeletionLock,
} from './deletionRecovery';

describe('account deletion recovery state', () => {
  it('merges a server deletion lock into stale cached account state', () => {
    const merged = mergeAccountDeletionLock(
      { id: 'account-1', deletionRequestedAt: null },
      {
        deletionRequestedAt: '2026-07-01T00:00:00.000Z',
        deletionScheduledFor: '2026-07-31T00:00:00.000Z',
      },
    );

    expect(merged).toMatchObject({
      id: 'account-1',
      deletionRequestedAt: '2026-07-01T00:00:00.000Z',
      deletionScheduledFor: '2026-07-31T00:00:00.000Z',
    });
    expect(hasPendingAccountDeletion(merged)).toBe(true);
  });
});
