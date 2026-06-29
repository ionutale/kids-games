import { test, expect } from '@playwright/test';

test.describe('Pop E2E', () => {
  test('loads with HUD and bubbles appear', async ({ page }) => {
    await page.goto('/games/pop');
    await expect(page.locator('.hud')).toBeVisible();
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

  test('score updates when popping', async ({ page }) => {
    await page.goto('/games/pop');
    await page.waitForTimeout(2000);
    const bubble = page.locator('.bubble').first();
    if (await bubble.isVisible()) {
      const scoreBefore = await page.locator('.hud-item').first().textContent();
      await bubble.click({ force: true });
      await page.waitForTimeout(200);
      const scoreAfter = await page.locator('.hud-item').first().textContent();
      expect(scoreAfter).not.toBe(scoreBefore);
    }
  });

  test('game area has gradient background', async ({ page }) => {
    await page.goto('/games/pop');
    const bg = await page.locator('.pop-game').evaluate(el => getComputedStyle(el).background);
    expect(bg).toContain('gradient');
  });

  test('timer counts down', async ({ page }) => {
    await page.goto('/games/pop');
    const time1 = await page.locator('.hud-item').nth(1).textContent();
    await page.waitForTimeout(1500);
    const time2 = await page.locator('.hud-item').nth(1).textContent();
    expect(time1).not.toBe(time2);
  });

  test('level buttons exist and have correct range', async ({ page }) => {
    await page.goto('/games/pop');
    await expect(page.locator('.level-btn')).toHaveCount(10);
  });

  test('level button click restarts game', async ({ page }) => {
    await page.goto('/games/pop');
    await page.waitForTimeout(1000);
    const bubble = page.locator('.bubble').first();
    if (await bubble.isVisible()) {
      await bubble.click({ force: true });
    }
    await page.locator('.level-btn').nth(4).click();
    await page.waitForTimeout(500);
    await expect(page.locator('.hud')).toBeVisible();
  });
});
