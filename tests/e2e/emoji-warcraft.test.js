import { test, expect } from '@playwright/test';

test.describe('Emoji Warcraft E2E', () => {
  test('level select screen loads', async ({ page }) => {
    await page.goto('/games/emoji-warcraft');
    await expect(page.locator('.ew-lvl-btn')).toHaveCount(5);
  });

  test('selecting a level starts the game', async ({ page }) => {
    await page.goto('/games/emoji-warcraft');
    await page.locator('.ew-lvl-btn').first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('.ew-map')).toBeVisible();
    await expect(page.locator('.ew-hud')).toBeVisible();
  });

  test('game map shows buildings and cells', async ({ page }) => {
    await page.goto('/games/emoji-warcraft');
    await page.locator('.ew-lvl-btn').first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('.ew-cell').first()).toBeVisible();
  });

  test('HUD shows resources', async ({ page }) => {
    await page.goto('/games/emoji-warcraft');
    await page.locator('.ew-lvl-btn').first().click();
    await page.waitForTimeout(500);
    const hud = page.locator('.ew-hud');
    await expect(hud).toBeVisible();
  });

  test('tap on town hall shows peasant train button', async ({ page }) => {
    await page.goto('/games/emoji-warcraft');
    await page.locator('.ew-lvl-btn').first().click();
    await page.waitForTimeout(500);
    const thCell = page.locator('.ew-cell').nth(10 * 12 + 1);
    await thCell.click();
    await page.waitForTimeout(200);
    const panel = page.locator('.ew-panel');
    await expect(panel).toBeVisible();
  });
});
