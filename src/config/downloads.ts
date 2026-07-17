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

/** True when the URL should be played with a native <video> tag (not an embed iframe). */
export const isNativeVideoUrl = (url: string): boolean =>
  /\.(mp4|webm|ogg)(?:$|\?)/i.test(url) || url.startsWith('/videos/');

/** Built-in landing-page demo video shipped with the site. */
export const DEMO_VIDEO_URL = '/videos/mintcom-in-action.mp4';
export const DEMO_VIDEO_POSTER_URL = '/videos/mintcom-in-action-poster.jpg';

const readSafeDownloadUrl = (value?: string, fallback = '') =>
  isSafeDownloadUrl(value) ? value.trim() : fallback;

/** Temporary placeholder until real App Store / Play Store (or beta) URLs are configured. */
const TEMP_STORE_PLACEHOLDER_URL = 'https://www.google.com';

export const ANDROID_DOWNLOAD_URL = readSafeDownloadUrl(
  env.VITE_ANDROID_DOWNLOAD_URL,
  TEMP_STORE_PLACEHOLDER_URL
);

export const IOS_DOWNLOAD_URL = readSafeDownloadUrl(
  env.VITE_IOS_DOWNLOAD_URL,
  TEMP_STORE_PLACEHOLDER_URL
);

export const OWNER_ANDROID_DOWNLOAD_URL = readSafeDownloadUrl(
  env.VITE_OWNER_ANDROID_DOWNLOAD_URL,
  TEMP_STORE_PLACEHOLDER_URL
);

export const OWNER_IOS_DOWNLOAD_URL = readSafeDownloadUrl(
  env.VITE_OWNER_IOS_DOWNLOAD_URL,
  TEMP_STORE_PLACEHOLDER_URL
);

export const ONBOARDING_VIDEO_URL = readSafeDownloadUrl(env.VITE_ONBOARDING_VIDEO_URL);

// Landing-page marketing video. Prefer env → onboarding embed → local demo MP4
// so the "Watch Video" CTA and features player always have something real to play.
export const HERO_VIDEO_URL = readSafeDownloadUrl(
  env.VITE_HERO_VIDEO_URL,
  ONBOARDING_VIDEO_URL || DEMO_VIDEO_URL
);

export const isDirectInstallerDownload = (url: string) => /\.(apk|ipa)(?:$|\?)/i.test(url);
