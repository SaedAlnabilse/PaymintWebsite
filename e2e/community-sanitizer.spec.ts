import { expect, test, type Page } from '@playwright/test';
import { build } from 'vite';

type SanitizerResult = {
  html: string;
  imageSources: Array<string | null>;
  linkTargets: Array<string | null>;
  scripts: number;
  eventHandlers: number;
};

let sanitizerBundle = '';

/**
 * Run the production sanitizer module inside the browser, then put its output
 * through the same HTML parser used by `dangerouslySetInnerHTML`.
 *
 * The test bundles the exact module consumed by TopicPage in memory, injects
 * it into a real browser page, and never duplicates its rules here. Keeping
 * the fixture independent from the app route keeps the assertion hermetic;
 * the repository's full Playwright config still starts Vite for other specs.
 */
async function sanitizeInBrowser(
  page: Page,
  input: string,
): Promise<SanitizerResult> {
  await page.addScriptTag({ content: sanitizerBundle });

  return page.evaluate(async (dirtyHtml) => {
    const { sanitizeCommunityHtml } = (
      window as typeof window & {
        MintcomCommunitySanitizer: {
          sanitizeCommunityHtml: (html: unknown) => string;
        };
      }
    ).MintcomCommunitySanitizer;
    const html = sanitizeCommunityHtml(dirtyHtml);
    const container = document.createElement('div');
    container.innerHTML = html;

    return {
      html,
      imageSources: Array.from(container.querySelectorAll('img'), (image) =>
        image.getAttribute('src'),
      ),
      linkTargets: Array.from(container.querySelectorAll('a'), (link) =>
        link.getAttribute('href'),
      ),
      scripts: container.querySelectorAll('script').length,
      eventHandlers: container.querySelectorAll(
        '[onerror], [onload], [onclick], [onmouseover]',
      ).length,
    };
  }, input);
}

test.describe('community HTML sanitizer in a real browser', () => {
  test.beforeAll(async () => {
    const result = await build({
      configFile: false,
      logLevel: 'silent',
      build: {
        write: false,
        minify: false,
        lib: {
          entry: 'src/utils/sanitizeHtml.ts',
          name: 'MintcomCommunitySanitizer',
          formats: ['iife'],
          fileName: 'community-sanitizer',
        },
      },
    });
    const outputs = (Array.isArray(result) ? result : [result]).flatMap(
      (buildResult) => buildResult.output,
    );
    sanitizerBundle =
      outputs.find((output) => output.type === 'chunk')?.code ?? '';
    expect(sanitizerBundle).not.toBe('');
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('about:blank');
  });

  test('blocks active content and data-image URLs at the rendered sink', async ({
    page,
  }) => {
    const result = await sanitizeInBrowser(
      page,
      [
        '<p>Allowed <strong>community text</strong></p>',
        '<script>window.__communityXss = true</script>',
        '<img src="data:image/svg+xml,<svg onload=alert(1)>" onerror="alert(2)">',
        '<img src="da\u000Ata:image/png;base64,AAAA">',
        '<a href="javascript:alert(3)" onclick="alert(4)">bad link</a>',
      ].join(''),
    );

    expect(result.html).toContain(
      '<p>Allowed <strong>community text</strong></p>',
    );
    expect(result.html.toLowerCase()).not.toContain('data:');
    expect(result.html.toLowerCase()).not.toContain('javascript:');
    expect(result.scripts).toBe(0);
    expect(result.eventHandlers).toBe(0);
    expect(result.imageSources).toEqual([null, null]);
    expect(result.linkTargets).toEqual([null]);
  });

  test('preserves approved HTTPS image and link URLs', async ({ page }) => {
    const result = await sanitizeInBrowser(
      page,
      '<img src="https://cdn.example.com/menu.png" alt="menu">' +
        '<a href="https://example.com/help">Help</a>',
    );

    expect(result.imageSources).toEqual([
      'https://cdn.example.com/menu.png',
    ]);
    expect(result.linkTargets).toEqual(['https://example.com/help']);
  });
});
