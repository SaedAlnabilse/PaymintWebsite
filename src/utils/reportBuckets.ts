import { format } from 'date-fns';
import { parseChartDate } from './chartDate';
import { getDateLocale } from './dateLocale';

/**
 * Time buckets in the report payloads (`dailyBreakdown`, peak hours) are
 * zero-filled by the API: every day in the range, and all 24 hours of the day,
 * are returned whether or not anything happened. The charts need that so their
 * axis stays evenly spaced; tabular exports do not.
 */

/**
 * Bucket size of the chronological series, as reported by the API. A range of
 * a day or less is hourly, up to a quarter is daily, longer is monthly.
 */
export type ReportGranularity = 'hour' | 'day' | 'month';

/** A zero-filled time bucket from a report payload. */
export interface ReportBucket {
  count?: number;
  refundCount?: number;
  revenue?: number;
  total?: number;
  tax?: number;
}

/** Below half a cent is a rounding artefact, not money. */
const MONEY_EPSILON = 0.005;

/**
 * Did anything actually happen in this bucket?
 *
 * Used to strip zero-fill padding out of exports. Without it a "Last 12
 * Months" export for a venue that opened last month is 378 rows of zeros
 * around 17 real ones, and the reader has to page through all of them.
 *
 * A refund-only bucket counts as activity: it sold nothing, so `count` is 0,
 * but money moved and the row belongs in the report.
 */
export const bucketHasActivity = (bucket: ReportBucket | null | undefined): boolean => {
  if (!bucket) return false;
  return (
    (bucket.count ?? 0) !== 0 ||
    (bucket.refundCount ?? 0) !== 0 ||
    Math.abs(bucket.revenue ?? bucket.total ?? 0) >= MONEY_EPSILON ||
    Math.abs(bucket.tax ?? 0) >= MONEY_EPSILON
  );
};

/**
 * Human label for a bucket key, matching its granularity.
 *
 * Month buckets are keyed by the first of the month ("2026-07-01") so every
 * client can parse and sort them like any other date — which means they read as
 * "Jul 1" unless the granularity is taken into account. Hour buckets ("13:00")
 * are already labels and pass straight through.
 */
export const formatBucketLabel = (
  value: string,
  granularity: ReportGranularity | undefined,
  localeTag: string,
): string => {
  if (!value) return '';
  if (granularity === 'hour' || value.includes(':')) return value;

  const date = parseChartDate(value);
  if (Number.isNaN(date.getTime())) return value;

  const locale = getDateLocale(localeTag);
  return granularity === 'month'
    ? format(date, 'MMM yyyy', { locale })
    : format(date, 'MMM d', { locale });
};
