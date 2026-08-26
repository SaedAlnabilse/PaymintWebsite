import type { TFunction } from 'i18next';

/**
 * Elapsed time of a shift in milliseconds.
 *
 * An open shift has no endTime, so it is measured against `now` — pass a
 * ticking value when the result is rendered so a live shift keeps counting up
 * instead of freezing at first paint.
 *
 * Returns null when the shift has no usable start/end, so callers can render a
 * placeholder rather than "0m" for missing data.
 */
export const getShiftDurationMs = (
    startTime?: string | Date | null,
    endTime?: string | Date | null,
    now: number = Date.now(),
): number | null => {
    if (!startTime) return null;

    const start = new Date(startTime).getTime();
    if (!Number.isFinite(start)) return null;

    const end = endTime ? new Date(endTime).getTime() : now;
    if (!Number.isFinite(end)) return null;

    // Clock skew between POS devices and the server can push endTime slightly
    // before startTime; a negative duration is never meaningful to an owner.
    return Math.max(end - start, 0);
};

/**
 * Human duration ("2h 15m" / "45m"). Anything under a minute collapses to
 * "<1m" so a one-second shift doesn't read as a zero-length one.
 */
export const formatDurationMs = (t: TFunction, ms: number | null): string => {
    if (ms === null) return '-';

    const totalMinutes = Math.floor(ms / 60_000);
    if (totalMinutes < 1) {
        return t('orders.reports.shifts.durationUnderMinute', { defaultValue: '<1m' });
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
        return t('orders.reports.shifts.durationMinutes', { minutes, defaultValue: '{{minutes}}m' });
    }
    return t('orders.reports.shifts.durationHoursMinutes', {
        hours,
        minutes,
        defaultValue: '{{hours}}h {{minutes}}m',
    });
};

/** Convenience wrapper for the common "row of a shift table" case. */
export const formatShiftDuration = (
    t: TFunction,
    startTime?: string | Date | null,
    endTime?: string | Date | null,
    now?: number,
): string => formatDurationMs(t, getShiftDurationMs(startTime, endTime, now));
