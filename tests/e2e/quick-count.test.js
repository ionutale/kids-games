import { test, expect } from '@playwright/test';

test.describe('Quick Count E2E', () => {
  test('landing shows level bar and play link', async ({ page }) => {
    await page.goto('/games/quick-count');
    await expect(page.locator('.level-btn').first()).toBeVisible();
    const href = await page.locator('.big-btn.primary').getAttribute('href');
    expect(href).toMatch(/\/games\/quick-count\/play\/\d+/);
  });

  test('full round: answer prompts correctly, win overlay, next level', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('/games/quick-count/play/1?seed=5');

    for (let i = 0; i < 12; i++) {
      if (await page.locator('.win-overlay').isVisible().catch(() => false)) break;
      const pill = page.locator('[data-testid="correct-pill"]');
      await expect(pill).toBeVisible({ timeout: 20000 });
      await pill.click({ force: true });
      await page.waitForTimeout(450);
    }

    await expect(page.locator('.win-overlay')).toBeVisible();
    await page.getByTestId('next-level').click();
    await page.waitForURL(/\/games\/quick-count\/play\/2/);
  });

  test('wrong pill does not advance progress', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/games/quick-count/play/1?seed=5');

    await expect(page.locator('[data-testid="pills"]')).toBeVisible({ timeout: 20000 });
    const wrong = page.locator('[data-testid^="wrong-pill-"]').first();
    if (await wrong.isVisible().catch(() => false)) {
      const before = await page.locator('.hud-item').first().textContent();
      await wrong.click({ force: true });
      await page.waitForTimeout(400);
      const after = await page.locator('.hud-item').first().textContent();
      expect(after).toBe(before); // silent, no penalty
    }
  });

  test('playing a round saves its level', async ({ page }) => {
    await page.goto('/games/quick-count/play/4?seed=9');
    await expect(page.locator('[data-testid="board"]')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('quickCountLevel'))).toBe('4');
  });
});
