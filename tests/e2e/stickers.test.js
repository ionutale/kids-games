import { test, expect } from '@playwright/test';

test.describe('Stickers E2E', () => {
  test('loads with scene selector and sticker tray', async ({ page }) => {
    await page.goto('/games/stickers');
    await expect(page.locator('.scene-btn')).toHaveCount(4);
    await expect(page.locator('.sticker-btn').first()).toBeVisible();
  });

  test('clicking a sticker places it on the scene', async ({ page }) => {
    await page.goto('/games/stickers');
    await page.locator('.sticker-btn').first().click();
    await expect(page.locator('.placed-sticker')).toHaveCount(1);
  });

  test('changing scene clears stickers', async ({ page }) => {
    await page.goto('/games/stickers');
    await page.locator('.sticker-btn').first().click();
    await expect(page.locator('.placed-sticker')).toHaveCount(1);
    await page.locator('.scene-btn').nth(1).click();
    await expect(page.locator('.placed-sticker')).toHaveCount(0);
  });
});
