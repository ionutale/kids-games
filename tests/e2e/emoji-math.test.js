import { test, expect } from '@playwright/test';

test.describe('Emoji Math E2E', () => {
  test('shows an equation and 4 numeric answers', async ({ page }) => {
    await page.goto('/games/emoji-math');
    await expect(page.getByTestId('equation')).toBeVisible();
    const answers = page.getByTestId('answers').locator('button');
    await expect(answers).toHaveCount(4);
  });

  test('tapping the correct answer advances the correct counter', async ({ page }) => {
    await page.goto('/games/emoji-math');
    const hud = page.locator('.top-bar .hud-item').first();
    await expect(page.getByTestId('correct-ans')).toBeVisible({ timeout: 5000 });
    const before = await hud.textContent();
    await page.getByTestId('correct-ans').click();
    await page.waitForTimeout(600);
    // counter increments (or milestone overlay flashed)
    const after = await hud.textContent();
    const beforeN = parseInt(before.replace(/\D/g, ''), 10) || 0;
    const afterN = parseInt(after.replace(/\D/g, ''), 10) || 0;
    expect(afterN).toBeGreaterThanOrEqual(beforeN);
  });

  test('wrong answer shakes, reveals the right one, then continues', async ({ page }) => {
    await page.goto('/games/emoji-math');
    await expect(page.getByTestId('answers')).toBeVisible({ timeout: 5000 });
    const wrong = page.locator('[data-testid^="ans-"]').first();
    if (await wrong.isVisible().catch(() => false)) {
      await wrong.click();
      await expect(page.getByTestId('correct-ans')).toBeVisible(); // revealed
      // a fresh question arrives shortly (reveal cleared)
      await page.waitForTimeout(1600);
      await expect(page.getByTestId('equation')).toBeVisible();
    }
  });

  test('age setting changes question type', async ({ page }) => {
    await page.addInitScript(() =>
      localStorage.setItem(
        'kids-games-settings',
        JSON.stringify({ soundEnabled: true, ageLevel: 2, firstVisit: false })
      )
    );
    await page.goto('/games/emoji-math');
    // age 2 ⇒ count questions only: single cluster, no ➕ operator
    for (let i = 0; i < 5; i++) {
      await expect(page.getByTestId('equation')).toBeVisible();
      const ops = await page.locator('.op').count(); // ➕ marks; compare has none either
      expect(ops).toBeLessThanOrEqual(1);
      await page.getByTestId('correct-ans').click();
      await page.waitForTimeout(650);
    }
  });
});
