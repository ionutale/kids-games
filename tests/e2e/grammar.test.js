import { test, expect } from '@playwright/test';

async function solveRound(page, max = 12) {
  for (let i = 0; i < max; i++) {
    if (await page.locator('.win-overlay').isVisible().catch(() => false)) return;
    const opt = page.getByTestId('correct-opt');
    await expect(opt).toBeVisible({ timeout: 5000 });
    await opt.click();
    await page.waitForTimeout(1350);
  }
}

test.describe('Italian Grammar E2E', () => {
  test('landing shows hero + play link without a level bar', async ({ page }) => {
    await page.goto('/games/grammar');
    await expect(page.locator('.level-btn')).toHaveCount(0);
    const href = await page.locator('.big-btn.primary').getAttribute('href');
    expect(href).toMatch(/\/games\/grammar\/play\/\d+/);
  });

  test('prompt card with 3 options; wrong shakes without advancing; correct advances', async ({ page }) => {
    await page.goto('/games/grammar/play/1?seed=7');
    await expect(page.getByTestId('prompt')).toBeVisible();
    await expect(page.locator('.opt')).toHaveCount(3);
    const hud = page.locator('.hud-item').first();
    await expect(hud).toHaveText(/1\/5/);

    const wrong = page.locator('[data-testid^="wrong-opt-"]').first();
    await wrong.click();
    await expect(wrong).toHaveClass(/shake/);
    await expect(hud).toHaveText(/1\/5/);

    await page.waitForTimeout(450);
    await page.getByTestId('correct-opt').click();
    await expect(page.getByTestId('correct-opt')).toHaveClass(/correct/);
    await expect(hud).toHaveText(/2\/5/, { timeout: 4000 });
  });

  test('win → Next Level loads a fresh L2 round; Replay restarts', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('/games/grammar/play/1?seed=7');
    await solveRound(page);
    await expect(page.locator('.win-overlay')).toBeVisible();

    await page.getByTestId('next-level').click();
    await page.waitForURL(/\/games\/grammar\/play\/2/);
    await expect(page.locator('.win-overlay')).toBeHidden();
    await expect(page.locator('.hud-item').first()).toHaveText(/1\/6/);

    await solveRound(page);
    await expect(page.locator('.win-overlay')).toBeVisible();
    await page.getByTestId('replay').click();
    await expect(page.locator('.win-overlay')).toBeHidden();
    await expect(page.locator('.hud-item').first()).toHaveText(/1\/6/);
    await expect(page).toHaveURL(/\/games\/grammar\/play\/2/);
  });

  test('picture exercise shows the scene and sentence options', async ({ page }) => {
    await page.goto('/games/grammar/play/8?seed=3');
    await expect(page.getByTestId('scene')).toBeVisible();
    await expect(page.locator('.opt')).toHaveCount(3);
    const first = await page.locator('.opt').first().textContent();
    expect((first ?? '').trim().split(' ').length).toBeGreaterThan(1);
  });

  test('level 7 imperatives name their subject', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/games/grammar/play/7?seed=11');
    for (let i = 0; i < 3; i++) {
      await expect(page.getByTestId('prompt')).toBeVisible({ timeout: 5000 });
      const prompt = (await page.getByTestId('prompt').textContent()) ?? '';
      expect(prompt).toMatch(/\((tu|noi|voi)\)/);
      await page.getByTestId('correct-opt').click();
      await page.waitForTimeout(1350);
    }
  });

  test('level 10 is the end of the ladder: no Next Level, but Replay and Back', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('/games/grammar/play/10?seed=5');
    await solveRound(page);
    await expect(page.locator('.win-overlay')).toBeVisible();
    await expect(page.getByTestId('next-level')).toHaveCount(0);
    await expect(page.getByTestId('replay')).toBeVisible();
  });

  test('a deep-linked level above 10 clamps instead of persisting 11+', async ({ page }) => {
    await page.goto('/games/grammar/play/999?seed=2');
    await expect(page.getByTestId('grammar-root')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('grammarLevel'))).toBe('10');
  });

  test('playing a round saves its level', async ({ page }) => {
    await page.goto('/games/grammar/play/4?seed=1');
    await expect(page.getByTestId('grammar-root')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('grammarLevel'))).toBe('4');
  });
});
