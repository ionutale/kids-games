import { test, expect } from '@playwright/test';

test.describe('Pop E2E', () => {
  test('loads and bubbles appear', async ({ page }) => {
    await page.goto('/games/pop');
    await page.waitForTimeout(3000);
    const count = await page.locator('.bubble').count();
    expect(count).toBeGreaterThan(0);
  });

  test('clicking a bubble pops it', async ({ page }) => {
    await page.goto('/games/pop');
    await page.waitForTimeout(3000);
    const bubble = page.locator('.bubble').first();
    await expect(bubble).toBeVisible();
    await bubble.click({ force: true });
  });

  test('game area has gradient background', async ({ page }) => {
    await page.goto('/games/pop');
    const bg = await page.locator('.pop-game').evaluate(el => getComputedStyle(el).background);
    expect(bg).toContain('gradient');
  });
});
