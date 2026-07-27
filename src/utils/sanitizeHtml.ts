import DOMPurify from 'dompurify';

/**
 * Client-side sanitizer for server-rendered community HTML.
 *
 * The API already sanitizes `bodyHtml` with sanitize-html before storing it,
 * and that remains the primary control. This is the second layer: without it, a
 * single regression in the server rule set — or any path that writes bodyHtml
 * without going through MarkdownService — becomes stored XSS on every reader's
 * session, since the value is injected via dangerouslySetInnerHTML.
 *
 * The allow-list mirrors the server's so legitimate posts render identically.
 */
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'ul', 'ol', 'li',
  'blockquote', 'code', 'pre', 'a', 'img',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'del', 's',
];

const ALLOWED_ATTR = [
  'href', 'title', 'rel', 'target',
  'src', 'alt', 'loading',
  'class', 'align',
];

const URL_ATTRIBUTES = ['src', 'href', 'xlink:href', 'action', 'formaction'];

/**
 * Strip `data:` URLs from every URL-bearing attribute.
 *
 * DOMPurify does NOT honour ALLOWED_URI_REGEXP for `data:` on media tags: its
 * `_isValidAttribute` has an explicit branch that accepts a `data:` value on
 * src/href when the tag is in its internal DATA_URI_TAGS set (img, audio,
 * video, source, image, track), and there is no config flag to remove entries
 * from that set. Verified: `<img src="data:image/png;base64,AAAA">` survived
 * the regexp-only configuration unchanged.
 *
 * A hook is therefore the only reliable way to enforce it. Registered once at
 * module load — DOMPurify hooks are global, and this module is the only caller.
 */
let hookRegistered = false;

function normalizeUrlForSchemeCheck(value: string): string {
  return Array.from(value)
    .filter((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return codePoint > 0x20 && codePoint !== 0x7f;
    })
    .join('')
    .toLowerCase();
}

function ensureDataUriHook() {
  if (hookRegistered) return;
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    const element = node as Element;
    if (typeof element.getAttribute !== 'function') return;
    for (const attribute of URL_ATTRIBUTES) {
      const value = element.getAttribute(attribute);
      if (!value) continue;
      // Strip whitespace and control characters first: browsers ignore them
      // when resolving a URL, so `da\nta:` would otherwise slip through.
      const normalized = normalizeUrlForSchemeCheck(value);
      if (normalized.startsWith('data:')) {
        element.removeAttribute(attribute);
      }
    }
  });
  hookRegistered = true;
}

/**
 * Sanitize community HTML for rendering.
 *
 * Returns a string safe to pass to dangerouslySetInnerHTML. Never throws — an
 * unexpected input yields an empty string rather than unsanitized markup.
 */
export function sanitizeCommunityHtml(html: unknown): string {
  if (typeof html !== 'string' || html.length === 0) {
    return '';
  }

  ensureDataUriHook();

  try {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      // Restricts schemes to http/https/mailto for anchors. NOTE: this alone
      // does NOT stop `data:` on img/audio/video — DOMPurify bypasses this
      // regexp for those tags. The afterSanitizeAttributes hook above is what
      // actually enforces it.
      ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
      // Anchors/embeds that could retarget the page or exfiltrate the session.
      FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form'],
      FORBID_ATTR: ['style', 'srcset', 'formaction', 'ping'],
      // Reject `<template>`/mXSS shenanigans by returning a plain string.
      RETURN_TRUSTED_TYPE: false,
    });
  } catch {
    return '';
  }
}
