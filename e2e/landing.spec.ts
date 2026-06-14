import { test, expect } from '@playwright/test';

test.describe('Landing Page Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Inject cookie consent to avoid the banner intercepting clicks
    await page.addInitScript(() => {
      window.localStorage.setItem('mintcom-cookie-consent', JSON.stringify({
        essential: true,
        analytics: true,
        marketing: true,
        functional: true
      }));
    });
  });

  test('should load the landing page and show key sections', async ({ page }) => {
    await page.goto('/');

    // Check for Logo
    await expect(page.locator('nav img[alt="Mintcom"]').first()).toBeVisible();

    // Check for Hero Section primary CTA. For an unauthenticated visitor this is
    // a button labelled "Start Free Trial" (see Hero.tsx), not a link.
    await expect(page.getByRole('button', { name: /Start Free Trial/i }).first()).toBeVisible();

    // Check for Footer
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should navigate to legal pages', async ({ page }) => {
    await page.goto('/');

    // The footer "Privacy Policy" link navigates in the same tab.
    await page.getByRole('link', { name: /Privacy Policy/i }).last().click();

    await expect(page).toHaveURL(/\/legal\/privacy/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
