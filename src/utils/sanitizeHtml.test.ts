import { describe, it, expect } from 'vitest';
import { sanitizeCommunityHtml } from './sanitizeHtml';

/**
 * Second-layer sanitization for community HTML.
 *
 * The API sanitizes bodyHtml before storing it, but that was the *only* layer —
 * the value goes straight into dangerouslySetInnerHTML, so any regression in
 * the server rules (or a write path that skips MarkdownService) became stored
 * XSS. These pin the client-side net.
 */
describe('sanitizeCommunityHtml', () => {
  it('keeps the formatting a normal post uses', () => {
    const html =
      '<p><strong>Bold</strong> and <em>italic</em></p><ul><li>one</li></ul>';
    expect(sanitizeCommunityHtml(html)).toBe(html);
  });

  it('keeps ordinary links and images', () => {
    const out = sanitizeCommunityHtml(
      '<a href="https://example.com">x</a><img src="https://example.com/a.png" alt="a">',
    );
    expect(out).toContain('href="https://example.com"');
    expect(out).toContain('src="https://example.com/a.png"');
  });

  it('strips script tags', () => {
    const out = sanitizeCommunityHtml('<p>hi</p><script>alert(1)</script>');
    expect(out).toContain('<p>hi</p>');
    expect(out).not.toContain('script');
  });

  it('strips inline event handlers', () => {
    const out = sanitizeCommunityHtml('<img src="x" onerror="alert(1)">');
    expect(out).not.toContain('onerror');
  });

  it('strips javascript: URLs', () => {
    const out = sanitizeCommunityHtml('<a href="javascript:alert(1)">x</a>');
    expect(out).not.toContain('javascript:');
  });

  it('strips iframes and embedded objects', () => {
    const out = sanitizeCommunityHtml(
      '<iframe src="https://evil.test"></iframe><object data="x"></object>',
    );
    expect(out).not.toContain('iframe');
    expect(out).not.toContain('object');
  });

  it('strips form elements that could phish for credentials', () => {
    const out = sanitizeCommunityHtml(
      '<form action="https://evil.test"><input name="password"></form>',
    );
    expect(out).not.toContain('<form');
    expect(out).not.toContain('<input');
  });

  it('strips style attributes and tags used for UI redressing', () => {
    const out = sanitizeCommunityHtml(
      '<style>body{display:none}</style><p style="position:fixed">x</p>',
    );
    expect(out).not.toContain('<style');
    expect(out).not.toContain('style=');
  });

  // Regression: DOMPurify accepts `data:` on media tags via its internal
  // DATA_URI_TAGS branch, which bypasses ALLOWED_URI_REGEXP entirely. The
  // regexp-only configuration shipped first and let this through.
  it('strips data: URLs from img src', () => {
    const out = sanitizeCommunityHtml('<img src="data:image/png;base64,AAAA">');
    expect(out).not.toContain('data:');
  });

  it('strips data: URLs disguised with whitespace or control characters', () => {
    const out = sanitizeCommunityHtml(
      '<img src="da\u0009ta:image/svg+xml;base64,AAAA">',
    );
    expect(out).not.toContain('data:');
    expect(out).not.toMatch(/da\s*ta:/i);
  });

  it('strips data: URLs from anchors', () => {
    const out = sanitizeCommunityHtml('<a href="data:text/html,x">y</a>');
    expect(out).not.toContain('data:');
  });

  it('keeps https image sources while blocking data:', () => {
    const out = sanitizeCommunityHtml(
      '<img src="https://example.com/a.png"><img src="data:image/png;base64,AAAA">',
    );
    expect(out).toContain('https://example.com/a.png');
    expect(out).not.toContain('data:');
  });

  it('returns an empty string for non-string input rather than throwing', () => {
    expect(sanitizeCommunityHtml(null)).toBe('');
    expect(sanitizeCommunityHtml(undefined)).toBe('');
    expect(sanitizeCommunityHtml(42)).toBe('');
    expect(sanitizeCommunityHtml('')).toBe('');
  });
});
