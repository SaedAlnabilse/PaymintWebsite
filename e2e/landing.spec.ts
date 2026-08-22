import { test, expect } from '@playwright/test';

test.describe('Landing Page Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Inject cookie consent to avoid the banner intercepting clicks
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'mintcom-cookie-consent',
        JSON.stringify({
          essential: true,
          analytics: true,
          marketing: true,
          functional: true,
        }),
      );
    });
  });

  test('should load the landing page and show key sections', async ({ page }) => {
    await page.goto('/');

    // Check for Logo (matches visible logo image in nav)
    await expect(page.locator('nav img[alt="Mintcom"]:visible').first()).toBeVisible();

    // Check for Hero Section primary CTA button
    const ctaButton = page.getByRole('button', { name: /Start Free Trial/i }).first();
    await expect(ctaButton).toBeAttached();
    await ctaButton.scrollIntoViewIfNeeded();
    await expect(ctaButton).toBeVisible();

    // Check for Footer
    await expect(page.locator('footer')).toBeAttached();
  });

  test('should navigate to legal pages', async ({ page }) => {
    await page.goto('/');

    // The footer "Privacy Policy" link navigates in the same tab
    const privacyLink = page.getByRole('link', { name: /Privacy Policy/i }).last();
    await privacyLink.scrollIntoViewIfNeeded();
    await privacyLink.click();

    await expect(page).toHaveURL(/\/legal\/privacy/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
