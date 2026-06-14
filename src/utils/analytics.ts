import { env } from '../config/env';

const GA_MEASUREMENT_ID = env.VITE_GA_MEASUREMENT_ID?.trim();
const META_PIXEL_ID = env.VITE_META_PIXEL_ID?.trim();

const isConfiguredValue = (value?: string) => {
  if (!value) return false;

  const normalized = value.trim();
  if (!normalized) return false;

  const upper = normalized.toUpperCase();
  return upper !== 'NULL' && !/^G-?X+$/.test(upper) && !/^X+$/.test(upper);
};

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: ((...args: any[]) => void) & { callMethod?: (...args: any[]) => void; queue?: any[] };
    _fbq?: unknown;
  }
}

type ConsentValue = 'granted' | 'denied';

const getGtag = () => {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || ((...args: any[]) => {
    window.dataLayer.push(args);
  });

  return window.gtag;
};

const updateGoogleConsent = (prefs: { analytics: boolean; marketing: boolean }) => {
  const gtag = getGtag();
  const analyticsStorage: ConsentValue = prefs.analytics ? 'granted' : 'denied';
  const marketingStorage: ConsentValue = prefs.marketing ? 'granted' : 'denied';

  gtag('consent', 'update', {
    analytics_storage: analyticsStorage,
    ad_storage: marketingStorage,
    ad_user_data: marketingStorage,
    ad_personalization: marketingStorage,
  });
};

/**
 * Initialize Google Analytics (GA4)
 */
const loadGoogleAnalytics = () => {
  if (!isConfiguredValue(GA_MEASUREMENT_ID)) {
    console.info('[Analytics] Google Analytics is disabled - no measurement ID configured.');
    return;
  }

  if (document.getElementById('ga-script')) return; // Already loaded

  console.log('📊 Initializing Google Analytics...');

  // 1. Load the script tag
  const script = document.createElement('script');
  script.id = 'ga-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // 2. Initialize the command queue
  const gtag = getGtag();
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID);
};

/**
 * Initialize Meta/Facebook Pixel
 */
const loadMarketingPixel = () => {
  if (!isConfiguredValue(META_PIXEL_ID)) {
    console.info('[Analytics] Meta Pixel is disabled - no pixel ID configured.');
    return;
  }

  if (document.getElementById('meta-pixel-script')) return;

  console.log('🎯 Initializing Marketing Pixels...');

  // Build the fbq command queue programmatically instead of injecting inline
  // script text. This keeps the Content-Security-Policy free of
  // `script-src 'unsafe-inline'`: the only thing we load is the external
  // fbevents.js (already allow-listed in connect-src/script-src).
  if (!window.fbq) {
    const fbq = function (this: unknown, ...args: any[]) {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
      } else {
        fbq.queue!.push(args);
      }
    } as Window['fbq'];
    fbq.queue = [];
    if (!window._fbq) window._fbq = fbq;
    window.fbq = fbq;
  }

  const script = document.createElement('script');
  script.id = 'meta-pixel-script';
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
};

/**
 * Remove scripts (if user revokes consent)
 * Note: This doesn't delete existing cookies, but stops new tracking.
 */
const removeScript = (id: string) => {
  const script = document.getElementById(id);
  if (script) {
    script.remove();
    console.log(`🚫 specific script [${id}] removed.`);
  }
};

export const updateConsentState = (prefs: { analytics: boolean; marketing: boolean; functional: boolean }) => {
  console.group('🍪 Cookie Consent Update');
  
  // 1. Analytics
  if (prefs.analytics) {
    loadGoogleAnalytics();
  } else {
    removeScript('ga-script');
    // Optional: reload page to ensure clean state if critical
  }

  updateGoogleConsent(prefs);

  // 2. Marketing
  if (prefs.marketing) {
    loadMarketingPixel();
  } else {
    removeScript('meta-pixel-script');
  }

  // 3. Functional (Example: Chat Widget)
  if (prefs.functional) {
    // Logic to enable complex interactive features (e.g. Chatbots that save history)
    console.log('✨ Functional cookies enabled');
  }

  console.log('Current Preferences:', prefs);
  console.groupEnd();
};
