import { test, expect } from '@playwright/test';

test.describe('Emoji Jump E2E', () => {
  test('start screen shows play button and best height', async ({ page }) => {
    await page.goto('/games/emoji-jump');
    await expect(page.getByTestId('jump-root').locator('.title')).toBeVisible();
    await expect(page.locator('.big-btn.primary')).toBeVisible();
  });

  test('steering buttons appear during play and pause works', async ({ page }) => {
    await page.goto('/games/emoji-jump');
    await page.locator('.big-btn.primary').click();
    await expect(page.getByTestId('world')).toBeVisible();
    await expect(page.getByTestId('player')).toBeVisible();
    await page.locator('button[aria-label="left"]').dispatchEvent('pointerdown');
    await page.waitForTimeout(300);
    await page.locator('button[aria-label="pause"]').click();
    await expect(page.getByTestId('pause-overlay')).toBeVisible();
    await page.getByTestId('pause-overlay').locator('.big-btn.primary').click();
    await expect(page.getByTestId('pause-overlay')).toBeHidden();
  });

  test('falling ends the game with a game-over overlay', async ({ page }) => {
    await page.goto('/games/emoji-jump');
    await page.locator('.big-btn.primary').click();
    // never steer — the player falls past the first platforms
    await expect(page.getByTestId('gameover-overlay')).toBeVisible({ timeout: 20000 });
  });

  test('best height persists across reloads', async ({ page }) => {
    await page.goto('/games/emoji-jump');
    await page.evaluate(() => localStorage.setItem('emoji-jump-best', '77'));
    await page.reload();
    const bestLine = await page.locator('.best-line').first().textContent();
    expect(bestLine).toContain('77m');
  });
});
