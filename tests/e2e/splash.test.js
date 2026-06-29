import { test, expect } from '@playwright/test';

test.describe('Splash E2E', () => {
  test('loads with game area', async ({ page }) => {
    await page.goto('/games/splash');
    await expect(page.locator('.splash-game')).toBeVisible();
  });

  test('tapping creates burst effects', async ({ page }) => {
    await page.goto('/games/splash');
    await page.locator('.splash-game').click({ position: { x: 150, y: 300 } });
    await page.waitForTimeout(300);
    const count = await page.locator('.splash').count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('repeated tapping creates more effects', async ({ page }) => {
    await page.goto('/games/splash');
    const game = page.locator('.splash-game');
    for (let i = 0; i < 3; i++) {
      await game.click({ position: { x: 100 + i * 50, y: 200 + i * 50 } });
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(200);
    const count = await page.locator('.splash').count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('particles disappear after elimination timeout', async ({ page }) => {
    await page.goto('/games/splash');
    await page.locator('.splash-game').click({ position: { x: 150, y: 300 } });
    await page.waitForTimeout(4000);
    const count = await page.locator('.splash').count();
    expect(count).toBe(0);
  });

  test('dark gradient background', async ({ page }) => {
    await page.goto('/games/splash');
    const bg = await page.locator('.splash-game').evaluate(el => getComputedStyle(el).background);
    expect(bg).toContain('gradient');
  });
});
