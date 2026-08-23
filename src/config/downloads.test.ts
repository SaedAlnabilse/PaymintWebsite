import { describe, expect, it } from 'vitest';
import { getPlatformStoreUrl, isAllowedRedirectTarget, isSafeDownloadUrl } from './downloads';

describe('download redirect targets', () => {
  it.each([
    'https://apps.apple.com/app/id123456789',
    'https://play.google.com/store/apps/details?id=com.mintcom.pos',
    'https://www.apple.com',
    'https://mintcompos.com/downloads/mintcom.apk',
    '/downloads/mintcom.apk',
  ])('accepts the known store target %s', (url) => {
    expect(isAllowedRedirectTarget(url)).toBe(true);
  });

  it.each([
    'https://evil.com',
    'https://play.google.com.evil.com/store',
    'https://apps.apple.com.attacker.net/app/id1',
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'http://play.google.com/store',
  ])('rejects the untrusted target %s', (url) => {
    expect(isAllowedRedirectTarget(url)).toBe(false);
  });

  it('is stricter than isSafeDownloadUrl, which only enforces https', () => {
    // Guards the open-redirect fix: an arbitrary https host passes the plain
    // safety check but must never be used as a redirect destination.
    expect(isSafeDownloadUrl('https://evil.com')).toBe(true);
    expect(isAllowedRedirectTarget('https://evil.com')).toBe(false);
  });

  it('ignores an attacker-supplied ?android= override and falls back', () => {
    const { webUrl, nativeUrl } = getPlatformStoreUrl('android', 'https://evil.com');
    expect(webUrl).not.toContain('evil.com');
    expect(nativeUrl).not.toContain('evil.com');
  });

  it('ignores an attacker-supplied ?ios= override and falls back', () => {
    const { webUrl, nativeUrl } = getPlatformStoreUrl('ios', 'https://evil.com');
    expect(webUrl).not.toContain('evil.com');
    expect(nativeUrl).not.toContain('evil.com');
  });

  it('still honours a legitimate store override', () => {
    const { webUrl } = getPlatformStoreUrl(
      'android',
      'https://play.google.com/store/apps/details?id=com.mintcom.pos',
    );
    expect(webUrl).toBe('https://play.google.com/store/apps/details?id=com.mintcom.pos');
  });
});
