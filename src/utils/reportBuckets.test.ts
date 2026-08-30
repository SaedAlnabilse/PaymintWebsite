import { describe, it, expect } from 'vitest';
import { bucketHasActivity, formatBucketLabel } from './reportBuckets';

/**
 * This predicate decides which rows reach an exported report, so the edge
 * cases matter: a refund-only day is real activity, and a rounding artefact
 * is not.
 */
describe('bucketHasActivity', () => {
  it('rejects the zero-fill padding the API returns for empty days', () => {
    expect(
      bucketHasActivity({
        count: 0,
        refundCount: 0,
        revenue: 0,
        tax: 0,
      }),
    ).toBe(false);
    expect(bucketHasActivity({})).toBe(false);
    expect(bucketHasActivity(null)).toBe(false);
    expect(bucketHasActivity(undefined)).toBe(false);
  });

  it('keeps a day that took orders', () => {
    expect(bucketHasActivity({ count: 2, revenue: 174, tax: 24 })).toBe(true);
    // Comped orders total zero but still happened.
    expect(bucketHasActivity({ count: 1, revenue: 0, tax: 0 })).toBe(true);
  });

  it('keeps a refund-only day, which sells nothing but still moves money', () => {
    expect(
      bucketHasActivity({ count: 0, refundCount: 1, revenue: -58, tax: -8 }),
    ).toBe(true);
  });

  it('treats sub-cent amounts as rounding artefacts, not activity', () => {
    expect(bucketHasActivity({ revenue: 0.004 })).toBe(false);
    expect(bucketHasActivity({ revenue: -0.004 })).toBe(false);
    expect(bucketHasActivity({ tax: 0.001 })).toBe(false);
    // Half a cent is the cut-off.
    expect(bucketHasActivity({ revenue: 0.005 })).toBe(true);
    expect(bucketHasActivity({ revenue: -0.005 })).toBe(true);
  });

  it('reads peak-hour buckets, which carry `total` instead of `revenue`', () => {
    expect(bucketHasActivity({ count: 0, total: 0 })).toBe(false);
    expect(bucketHasActivity({ count: 3, total: 90 })).toBe(true);
    expect(bucketHasActivity({ count: 0, total: 90 })).toBe(true);
  });

  it('strips a year of padding down to the days that traded', () => {
    // The reported case: "Last 12 Months" over a venue that opened recently.
    const days = Array.from({ length: 395 }, (_, i) => ({
      count: i >= 378 ? 4 : 0,
      revenue: i >= 378 ? 120 : 0,
      tax: i >= 378 ? 19.2 : 0,
    }));

    expect(days.filter(bucketHasActivity)).toHaveLength(17);
  });
});

describe('formatBucketLabel', () => {
  it('labels a month bucket by its month, not the 1st of it', () => {
    // The API keys months by the first of the month so they parse and sort
    // like any other date; only the label should differ.
    expect(formatBucketLabel('2026-07-01', 'month', 'en-US')).toBe('Jul 2026');
    expect(formatBucketLabel('2025-12-01', 'month', 'en-US')).toBe('Dec 2025');
  });

  it('labels a day bucket by its day', () => {
    expect(formatBucketLabel('2026-07-09', 'day', 'en-US')).toBe('Jul 9');
  });

  it('passes hour buckets through — they are already labels', () => {
    expect(formatBucketLabel('13:00', 'hour', 'en-US')).toBe('13:00');
    // Even without the granularity, a time-shaped key is left alone.
    expect(formatBucketLabel('13:00', undefined, 'en-US')).toBe('13:00');
  });

  it('returns unparseable values unchanged rather than "Invalid Date"', () => {
    expect(formatBucketLabel('', 'month', 'en-US')).toBe('');
    expect(formatBucketLabel('not-a-date', 'day', 'en-US')).toBe('not-a-date');
  });
});
