import { test, expect } from '@playwright/test';

test.describe('What Comes Next E2E', () => {
  test('landing shows level bar and play link', async ({ page }) => {
    await page.goto('/games/what-comes-next');
    await expect(page.locator('.level-btn').first()).toBeVisible();
    const href = await page.locator('.big-btn.primary').getAttribute('href');
    expect(href).toMatch(/\/games\/what-comes-next\/play\/\d+/);
  });

  test('full round: solve prompts, win overlay, next level', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('/games/what-comes-next/play/1?seed=21');

    for (let i = 0; i < 10; i++) {
      if (await page.locator('.win-overlay').isVisible().catch(() => false)) break;
      const opt = page.locator('[data-testid="correct-opt"]');
      await expect(opt).toBeVisible({ timeout: 10000 });
      await opt.click();
      await page.waitForTimeout(600); // slot fill + beat
    }

    await expect(page.locator('.win-overlay')).toBeVisible();
    await page.getByTestId('next-level').click();
    await page.waitForURL(/\/games\/what-comes-next\/play\/2/);
  });

  test('wrong option does not advance progress and stays until correct', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/games/what-comes-next/play/1?seed=21');

    const counter = page.locator('.hud-item').first();
    await expect(counter).toBeVisible();
    const before = await counter.textContent();

    const wrong = page.locator('[data-testid^="wrong-opt-"]').first();
    if (await wrong.isVisible().catch(() => false)) {
      await wrong.click();
      await page.waitForTimeout(400);
      expect((await counter.textContent())).toBe(before);
      // correct option still available
      await expect(page.locator('[data-testid="correct-opt"]')).toBeEnabled();
    }
  });

  test('playing a round saves its level', async ({ page }) => {
    await page.goto('/games/what-comes-next/play/6?seed=8');
    await expect(page.locator('[data-testid="strip"]')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('whatComesNextLevel'))).toBe('6');
  });
});
