import { env } from './env';

const PLACEHOLDER_DOWNLOAD_PATTERNS = [
  /your-cdn-url/i,
  /example\./i,
  /YOUR_/i,
  /placeholder/i,
  /mintcom-android\.apk\.apps\.googleusercontent\.com/i,
  /id0{6,}/i,
];

export const isSafeDownloadUrl = (value?: string): value is string => {
  if (!value) return false;

  const trimmed = value.trim();
  if (!trimmed || trimmed === '#') return false;
  if (PLACEHOLDER_DOWNLOAD_PATTERNS.some((pattern) => pattern.test(trimmed))) return false;

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:';
  } catch {
    // Same-origin static assets (installers, marketing videos)
    return trimmed.startsWith('/downloads/') || trimmed.startsWith('/videos/');
  }
};

/**
 * Hosts an `?ios=` / `?android=` override is allowed to send a visitor to.
 *
 * `isSafeDownloadUrl` only requires https, which is the right bar for
 * operator-set env config but not for a query parameter: that value comes from
 * whoever wrote the link. Accepting any https target would make the download
 * page an open redirect, lending this domain's credibility to a phishing page.
 */
const ALLOWED_REDIRECT_HOSTS = new Set([
  'apps.apple.com',
  'itunes.apple.com',
  'apple.com',
  'www.apple.com',
  'play.google.com',
  'samsung.com',
  'www.samsung.com',
  'galaxystore.samsung.com',
  'mintcompos.com',
  'www.mintcompos.com',
]);

/** Query-parameter overrides must be https *and* on a known store host. */
export const isAllowedRedirectTarget = (value?: string): value is string => {
  if (!isSafeDownloadUrl(value)) return false;
  try {
    return ALLOWED_REDIRECT_HOSTS.has(new URL(value.trim()).hostname.toLowerCase());
  } catch {
    // Same-origin `/downloads/` or `/videos/` path, already vetted above.
    return true;
  }
};

/** True when the URL should be played with a native <video> tag (not an embed iframe). */
export const isNativeVideoUrl = (url: string): boolean =>
  /\.(mp4|webm|ogg)(?:$|\?)/i.test(url) || url.startsWith('/videos/');

/** Built-in landing-page demo video shipped with the site. */
export const DEMO_VIDEO_URL = '/videos/mintcom-in-action.mp4';
export const DEMO_VIDEO_POSTER_URL = '/videos/mintcom-in-action-poster.jpg';

const readSafeDownloadUrl = (value?: string, fallback = '') =>
  isSafeDownloadUrl(value) ? value.trim() : fallback;

/** Fallback store URLs until specific app store links are configured via environment variables.
 *  TODO: Replace with real App Store / Play Store app links once the apps are published. */
export const DEFAULT_IOS_STORE_URL = 'https://www.apple.com';
export const DEFAULT_ANDROID_STORE_URL = 'https://www.samsung.com';

export const ANDROID_DOWNLOAD_URL = readSafeDownloadUrl(
  env.VITE_ANDROID_DOWNLOAD_URL,
  DEFAULT_ANDROID_STORE_URL
);

export const IOS_DOWNLOAD_URL = readSafeDownloadUrl(
  env.VITE_IOS_DOWNLOAD_URL,
  DEFAULT_IOS_STORE_URL
);

export const OWNER_ANDROID_DOWNLOAD_URL = readSafeDownloadUrl(
  env.VITE_OWNER_ANDROID_DOWNLOAD_URL,
  DEFAULT_ANDROID_STORE_URL
);

export const OWNER_IOS_DOWNLOAD_URL = readSafeDownloadUrl(
  env.VITE_OWNER_IOS_DOWNLOAD_URL,
  DEFAULT_IOS_STORE_URL
);

export type MobilePlatform = 'ios' | 'android' | 'other';

/**
 * Detects whether the current device is running iOS, Android, or desktop/other.
 */
export const detectMobilePlatform = (customUa?: string): MobilePlatform => {
  if (typeof navigator === 'undefined' && !customUa) return 'other';
  const ua = customUa || navigator.userAgent || navigator.vendor || (window as any).opera || '';

  // iOS detection: iPhone, iPad, iPod, or iPadOS on Mac with touch
  const isIOS =
    /iPad|iPhone|iPod/i.test(ua) ||
    (typeof navigator !== 'undefined' &&
      navigator.platform === 'MacIntel' &&
      navigator.maxTouchPoints > 1);

  if (isIOS) return 'ios';

  // Android detection
  const isAndroid = /Android/i.test(ua);
  if (isAndroid) return 'android';

  return 'other';
};

/**
 * Returns a smart redirection URL for QR code generation.
 * When scanned by iPhone -> redirects to App Store
 * When scanned by Android -> redirects to Play Store
 */
export const getSmartDownloadRedirectUrl = (options?: {
  appType?: 'owner' | 'pos';
  androidUrl?: string;
  iosUrl?: string;
}): string => {
  // Never use localhost/127.0.0.1 for QR codes because physical phones cannot reach it.
  // Always resolve to the real public site URL for QR scanning.
  const PUBLIC_SITE_URL = 'https://mintcompos.com';

  const resolveOrigin = (): string => {
    // 1. If running in a browser on a real domain, use that
    if (
      typeof window !== 'undefined' &&
      window.location.origin &&
      !window.location.hostname.includes('localhost') &&
      !window.location.hostname.includes('127.0.0.1')
    ) {
      return window.location.origin;
    }

    // 2. If VITE_SITE_URL is set and is NOT localhost, use it
    const siteUrl = env.VITE_SITE_URL;
    if (
      siteUrl &&
      !siteUrl.includes('localhost') &&
      !siteUrl.includes('127.0.0.1')
    ) {
      return siteUrl;
    }

    // 3. Fallback to hardcoded production URL
    return PUBLIC_SITE_URL;
  };

  const origin = resolveOrigin();

  const params = new URLSearchParams();
  if (options?.appType) {
    params.set('app', options.appType);
  }
  if (
    options?.androidUrl &&
    isSafeDownloadUrl(options.androidUrl) &&
    options.androidUrl !== ANDROID_DOWNLOAD_URL &&
    options.androidUrl !== OWNER_ANDROID_DOWNLOAD_URL &&
    options.androidUrl !== DEFAULT_ANDROID_STORE_URL
  ) {
    params.set('android', options.androidUrl);
  }
  if (
    options?.iosUrl &&
    isSafeDownloadUrl(options.iosUrl) &&
    options.iosUrl !== IOS_DOWNLOAD_URL &&
    options.iosUrl !== OWNER_IOS_DOWNLOAD_URL &&
    options.iosUrl !== DEFAULT_IOS_STORE_URL
  ) {
    params.set('ios', options.iosUrl);
  }

  const query = params.toString();
  return `${origin}/download-app${query ? `?${query}` : ''}`;
};

/**
 * Returns both the native app store URI (for direct store app launch)
 * and web URL fallback for iOS / Android.
 */
export const getPlatformStoreUrl = (
  platform: 'ios' | 'android',
  customUrl?: string,
  appType: 'owner' | 'pos' = 'owner'
): { webUrl: string; nativeUrl: string } => {
  if (platform === 'ios') {
    const configured =
      customUrl && isAllowedRedirectTarget(customUrl)
        ? customUrl
        : (appType === 'pos' ? IOS_DOWNLOAD_URL : OWNER_IOS_DOWNLOAD_URL);

    // If configured with a real App Store link
    if (configured && isSafeDownloadUrl(configured) && configured !== DEFAULT_IOS_STORE_URL) {
      const native = configured.replace(/^https?:\/\//i, 'itms-apps://');
      return { webUrl: configured, nativeUrl: native };
    }

    // Default: opens Apple website (replace with real App Store link when app is published)
    return {
      webUrl: 'https://www.apple.com',
      nativeUrl: 'https://www.apple.com',
    };
  } else {
    const configured =
      customUrl && isAllowedRedirectTarget(customUrl)
        ? customUrl
        : (appType === 'pos' ? ANDROID_DOWNLOAD_URL : OWNER_ANDROID_DOWNLOAD_URL);

    // If configured with a real Google Play Store link
    if (configured && isSafeDownloadUrl(configured) && configured !== DEFAULT_ANDROID_STORE_URL) {
      const packageMatch = configured.match(/id=([a-zA-Z0-9._]+)/);
      const native = packageMatch ? `market://details?id=${packageMatch[1]}` : configured;
      return { webUrl: configured, nativeUrl: native };
    }

    // Default: opens Samsung website (replace with real Play Store link when app is published)
    return {
      webUrl: 'https://www.samsung.com',
      nativeUrl: 'https://www.samsung.com',
    };
  }
};

export const ONBOARDING_VIDEO_URL = readSafeDownloadUrl(env.VITE_ONBOARDING_VIDEO_URL);

// Landing-page marketing video. Prefer env → onboarding embed → local demo MP4
// so the "Watch Video" CTA and features player always have something real to play.
export const HERO_VIDEO_URL = readSafeDownloadUrl(
  env.VITE_HERO_VIDEO_URL,
  ONBOARDING_VIDEO_URL || DEMO_VIDEO_URL
);

export const isDirectInstallerDownload = (url: string) => /\.(apk|ipa)(?:$|\?)/i.test(url);
