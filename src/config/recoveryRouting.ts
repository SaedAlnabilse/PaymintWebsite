const LOCATION_SETTINGS_PATH = /^\/dashboard\/[^/]+\/settings\/?$/;

function normalizePath(url?: string): string {
  if (!url) return '';
  try {
    return new URL(url, 'https://mintcom.invalid').pathname.replace(/\/$/, '');
  } catch {
    return url.split('?')[0].replace(/\/$/, '');
  }
}

/** Requests intentionally available while a location is locked for deletion. */
export function isLocationRecoveryRequest(url?: string, method?: string): boolean {
  const path = normalizePath(url);
  const verb = (method || 'get').toLowerCase();

  return (
    (verb === 'get' &&
      /^\/api\/establishments\/[^/]+\/(deletion-status|stats)$/.test(path)) ||
    (verb === 'post' &&
      /^\/api\/establishments\/[^/]+\/cancel-deletion$/.test(path)) ||
    (verb === 'get' &&
      /^\/api\/establishments\/[^/]+\/export\/[^/]+$/.test(path)) ||
    (verb === 'delete' &&
      /^\/api\/establishments\/[^/]+\/dissolve$/.test(path))
  );
}

/** The Settings shell must stay mounted so its recovery-only Danger Zone can render. */
export function isLocationRecoveryPage(pathname: string): boolean {
  return LOCATION_SETTINGS_PATH.test(pathname);
}

export function isAccountPendingDeletionError(error: any): boolean {
  return (
    error?.response?.status === 423 &&
    error?.response?.data?.code === 'ACCOUNT_PENDING_DELETION'
  );
}

