/**
 * Fetch *every* page of a paginated list endpoint and return the full array.
 *
 * Many list endpoints return `{ items, total, limit, offset }` and cap how many
 * rows a single request yields (e.g. `/api/items` defaults to 500, max 2000).
 * A naive single `GET` therefore silently drops every row past that cap. This
 * helper loops over `offset` until all `total` rows have been retrieved, so the
 * caller gets the complete list and can keep paginating/filtering client-side.
 *
 * Endpoints that still return a bare array (legacy, no pagination) are handled
 * transparently: the first response is returned as-is.
 */

interface AxiosLikeClient {
  get: (url: string, config?: { params?: Record<string, unknown> }) => Promise<{ data: unknown }>;
}

interface PagedPayload<T> {
  items?: T[];
  total?: number;
  limit?: number;
  offset?: number;
}

const DEFAULT_PAGE_SIZE = 500;
// Hard stop so a bad `total` from the backend can never spin forever.
const MAX_PAGES = 1000;

export async function fetchAllPages<T = unknown>(
  api: AxiosLikeClient,
  url: string,
  params: Record<string, unknown> = {},
  pageSize: number = DEFAULT_PAGE_SIZE,
): Promise<T[]> {
  const all: T[] = [];
  let offset = 0;

  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await api.get(url, { params: { ...params, limit: pageSize, offset } });
    const data = res.data as PagedPayload<T> | T[];

    // Legacy bare-array endpoint: it returned everything in one shot.
    if (Array.isArray(data)) {
      return page === 0 ? data : [...all, ...data];
    }

    const batch = Array.isArray(data?.items) ? data.items : [];
    all.push(...batch);
    // Advance by the *actual* number of rows returned — the backend may clamp
    // `limit` below `pageSize`, so never assume a full page was served.
    offset += batch.length;

    // Stop on an empty page, or once we've collected every row `total` reports.
    // Do NOT stop on a short page: a short page can simply mean the server
    // capped the page size, not that the list is exhausted.
    if (batch.length === 0) break;
    if (typeof data?.total === 'number' && all.length >= data.total) break;
  }

  return all;
}
