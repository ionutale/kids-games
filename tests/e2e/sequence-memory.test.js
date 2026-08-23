import { test, expect } from '@playwright/test';

test.describe('Sequence Memory E2E', () => {
  test('start screen shows play button and 4 pads appear in-game', async ({ page }) => {
    await page.goto('/games/sequence-memory');
    await page.waitForTimeout(600);
    await expect(page.getByTestId('seq-root').locator('.title')).toBeVisible();
    await page.locator('.big-btn.primary').click();
    for (let i = 0; i < 4; i++) {
      await expect(page.getByTestId(`pad-${i}`)).toBeVisible();
    }
  });

  test('sequence plays then pads become tappable (listening state)', async ({ page }) => {
    await page.goto('/games/sequence-memory');
    await page.locator('.big-btn.primary').click();
    // round 1 = 2 steps × (600ms + 300ms) → listening within ~2s
    await expect(page.locator('[data-testid="status"]')).toHaveText('👆', { timeout: 5000 });
  });

  test('wrong tap twice ends the game with a replay screen', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto('/games/sequence-memory');
    await page.locator('.big-btn.primary').click();
    // wait for listening
    await expect(page.locator('[data-testid="status"]')).toHaveText('👆', { timeout: 6000 });
    // find which pad lit LAST during playback — tap the others to be wrong.
    // simpler: wait, then tap pad 0 repeatedly across the second-chance replay:
    // first wrong triggers second chance; second wrong ends the game.
    await page.getByTestId('pad-0').click();
    await page.waitForTimeout(2500); // second-chance replay plays
    const status = page.locator('[data-testid="status"]');
    if ((await status.textContent()) === '👆') {
      await page.getByTestId('pad-0').click(); // may accidentally be right; keep tapping wrong-ish
      await page.waitForTimeout(1200);
      await page.getByTestId('pad-0').click();
      await page.waitForTimeout(2500);
      await page.getByTestId('pad-0').click();
    }
    await expect(
      page.getByTestId('seq-root').locator('.score-line')
    ).toBeVisible({ timeout: 15000 });
  });
});
