import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';

/**
 * Sends a GA4 `page_view` on every client-side route change.
 *
 * The first render is intentionally skipped: the initial `page_view` is already
 * emitted by `gtag('config', ...)` in index.html, so tracking it again here
 * would double-count the landing page. Every subsequent navigation is reported.
 *
 * Mounted once inside the router (see MaintenanceWrapper in App.tsx).
 */
export function usePageTracking() {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    trackPageView(`${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);
}
