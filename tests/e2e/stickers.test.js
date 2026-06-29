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

  test('stickers persist when changing scene', async ({ page }) => {
    await page.goto('/games/stickers');
    await page.locator('.sticker-btn').first().click();
    await expect(page.locator('.placed-sticker')).toHaveCount(1);
    await page.locator('.scene-btn').nth(1).click();
    await expect(page.locator('.placed-sticker')).toHaveCount(1);
  });

  test('clear button removes all stickers', async ({ page }) => {
    await page.goto('/games/stickers');
    await page.locator('.sticker-btn').first().click();
    await page.locator('.sticker-btn').nth(1).click();
    await expect(page.locator('.placed-sticker')).toHaveCount(2);
    await page.locator('.clear-btn').click();
    await expect(page.locator('.placed-sticker')).toHaveCount(0);
  });

  test('kid taps many stickers and changes scenes randomly', async ({ page }) => {
    await page.goto('/games/stickers');
    const stickerCount = await page.locator('.sticker-btn').count();
    const sceneCount = await page.locator('.scene-btn').count();
    let placedCount = 0;

    for (let round = 0; round < 3; round++) {
      const randomSticker = Math.floor(Math.random() * stickerCount);
      const btn = page.locator('.sticker-btn').nth(randomSticker);
      await btn.scrollIntoViewIfNeeded();
      await btn.click({ force: true });
      await page.waitForTimeout(200);

      const randomScene = Math.floor(Math.random() * sceneCount);
      await page.locator('.scene-btn').nth(randomScene).click();
      await page.waitForTimeout(100);
    }

    placedCount = await page.locator('.placed-sticker').count();
    expect(placedCount).toBeGreaterThanOrEqual(1);
  });
});
