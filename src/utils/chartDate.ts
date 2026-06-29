// Parses a chart X-axis value into a Date suitable for label formatting.
//
// The API returns the daily revenue series as plain calendar-day strings
// ("YYYY-MM-DD") already bucketed in the establishment's local timezone.
// `new Date('2026-04-14')` parses that as UTC midnight, and date-fns `format`
// then renders it in the *browser's* local timezone — so browsers west of UTC
// would show the previous day ("Apr 13" instead of "Apr 14"). Parsing the parts
// into a local Date keeps the rendered label on the correct calendar day.
//
// Any value that isn't a bare date-only string (e.g. an hourly "HH:00" label or
// a full timestamp) falls back to the native parser unchanged.
export const parseChartDate = (value: string): Date => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  return new Date(value);
};
