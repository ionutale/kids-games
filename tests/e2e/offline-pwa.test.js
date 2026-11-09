import { test, expect } from '@playwright/test';

test.describe('PWA offline shell', () => {
  test('a deep link boots from the precached shell while offline', async ({ page, context }) => {
    test.setTimeout(120000);

    await page.goto('/');
    // The app reloads once when the new worker takes over; retry the check
    // across that navigation rather than racing it.
    await expect(async () => {
      expect(await page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
    }).toPass({ timeout: 30000 });

    await context.setOffline(true);
    try {
      const response = await page.goto('/games/focus-tap/play/1', {
        waitUntil: 'domcontentloaded'
      });
      expect(response?.fromServiceWorker()).toBe(true);
      await expect(page.locator('.game-shell')).toBeVisible({ timeout: 20000 });
      await expect(page.getByTestId('pond')).toBeVisible({ timeout: 20000 });
    } finally {
      await context.setOffline(false);
    }
  });
});
