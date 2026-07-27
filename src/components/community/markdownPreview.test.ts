import { describe, it, expect } from 'vitest';
import {
  renderMarkdownPreview,
  safePreviewUrl,
} from './MarkdownEditor';

/**
 * Editor preview escaping.
 *
 * The preview escaped `<` and `>` but not `"`, then dropped the link URL
 * straight into an `href` — so a draft link could close the attribute and add
 * its own (`[x](" onmouseover="...)`), and `javascript:` survived untouched.
 * Self-XSS on the author's own draft, but the helper is one refactor away from
 * rendering someone else's content.
 */
describe('safePreviewUrl', () => {
  it('allows http, https and mailto', () => {
    expect(safePreviewUrl('https://example.com/a?b=1')).toBe(
      'https://example.com/a?b=1',
    );
    expect(safePreviewUrl('http://example.com')).toBe('http://example.com');
    expect(safePreviewUrl('mailto:a@b.com')).toBe('mailto:a@b.com');
  });

  it('allows site-relative links but not protocol-relative ones', () => {
    expect(safePreviewUrl('/community/topics/1')).toBe('/community/topics/1');
    // `//evil.test` inherits the page scheme and leaves the site.
    expect(safePreviewUrl('//evil.test')).toBe('#');
  });

  it('rejects javascript: in any casing', () => {
    expect(safePreviewUrl('javascript:alert(1)')).toBe('#');
    expect(safePreviewUrl('JavaScript:alert(1)')).toBe('#');
    expect(safePreviewUrl('  javascript:alert(1)')).toBe('#');
  });

  it('rejects data: and other active schemes', () => {
    expect(safePreviewUrl('data:text/html,<script>alert(1)</script>')).toBe('#');
    expect(safePreviewUrl('vbscript:msgbox(1)')).toBe('#');
    expect(safePreviewUrl('file:///etc/passwd')).toBe('#');
  });

  it('rejects URLs containing whitespace used to smuggle a scheme', () => {
    expect(safePreviewUrl('java\tscript:alert(1)')).toBe('#');
    expect(safePreviewUrl('java\nscript:alert(1)')).toBe('#');
  });

  it('rejects quotes that would break out of the href attribute', () => {
    expect(safePreviewUrl('" onmouseover="alert(1)')).toBe('#');
    expect(safePreviewUrl("' onmouseover='alert(1)")).toBe('#');
  });
});

describe('renderMarkdownPreview', () => {
  it('renders ordinary formatting', () => {
    expect(renderMarkdownPreview('**bold**')).toContain(
      '<strong>bold</strong>',
    );
    expect(renderMarkdownPreview('*it*')).toContain('<em>it</em>');
    expect(renderMarkdownPreview('`code`')).toContain('<code>code</code>');
  });

  it('escapes raw HTML in the draft', () => {
    const out = renderMarkdownPreview('<script>alert(1)</script>');
    expect(out).not.toContain('<script>');
    expect(out).toContain('&lt;script&gt;');
  });

  it('neutralises a javascript: link', () => {
    const out = renderMarkdownPreview('[click](javascript:alert(1))');
    expect(out).not.toContain('javascript:');
    expect(out).toContain('href="#"');
  });

  it('does not let a link URL inject extra attributes', () => {
    const out = renderMarkdownPreview('[x](" onmouseover="alert(1))');
    expect(out).not.toContain('onmouseover="alert(1)"');
  });

  it('adds noopener noreferrer to preview links', () => {
    const out = renderMarkdownPreview('[x](https://example.com)');
    expect(out).toContain('rel="nofollow ugc noopener noreferrer"');
  });

  it('does not double-escape ampersands in a query string', () => {
    const out = renderMarkdownPreview('[x](https://example.com/?a=1&b=2)');
    expect(out).toContain('href="https://example.com/?a=1&amp;b=2"');
    expect(out).not.toContain('&amp;amp;');
  });
});
