import { test, expect } from '@playwright/test';

async function solveRound(page, max = 15) {
  for (let i = 0; i < max; i++) {
    if (await page.locator('.win-overlay').isVisible().catch(() => false)) return;
    const pill = page.locator('[data-testid="correct-pill"]');
    await expect(pill).toBeVisible({ timeout: 20000 });
    await pill.click({ force: true });
    await page.waitForTimeout(450);
  }
}

test.describe('Quick Count E2E', () => {
  test('landing shows hero + play link without a level bar', async ({ page }) => {
    await page.goto('/games/quick-count');
    await expect(page.locator('.level-btn')).toHaveCount(0);
    const href = await page.locator('.big-btn.primary').getAttribute('href');
    expect(href).toMatch(/\/games\/quick-count\/play\/\d+/);
  });

  test('full round: answer prompts correctly, win overlay, next level', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('/games/quick-count/play/1?seed=5');
    await solveRound(page);
    await expect(page.locator('.win-overlay')).toBeVisible();
    await page.getByTestId('next-level').click();
    await page.waitForURL(/\/games\/quick-count\/play\/2/);
  });

  test('Next Level loads a fresh round for the new level (no stale board)', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('/games/quick-count/play/1?seed=5');
    await solveRound(page);
    await expect(page.locator('.win-overlay')).toBeVisible();

    await page.getByTestId('next-level').click();
    await page.waitForURL(/\/games\/quick-count\/play\/2/);
    await expect(page.locator('.win-overlay')).toBeHidden();
    // level 2 goal is 7: a fresh round starts at 0/7
    await expect(page.locator('.hud-item').first()).toHaveText(/0\/7/);
  });

  test('Replay restarts the current level with a fresh round', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('/games/quick-count/play/2?seed=5');
    await solveRound(page);
    await expect(page.locator('.win-overlay')).toBeVisible();

    await page.getByTestId('replay').click();
    await expect(page.locator('.win-overlay')).toBeHidden();
    await expect(page.locator('.hud-item').first()).toHaveText(/0\/7/);
    await expect(page).toHaveURL(/\/games\/quick-count\/play\/2/);
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
