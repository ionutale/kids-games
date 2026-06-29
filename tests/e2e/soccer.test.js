import { test, expect } from '@playwright/test';

test.describe('Soccer E2E', () => {
  test('loads and shows field and ball', async ({ page }) => {
    await page.goto('/games/soccer');
    await expect(page.locator('.field')).toBeVisible();
    await expect(page.locator('.ball')).toBeVisible();
  });

  test('tapping field kicks the ball', async ({ page }) => {
    await page.goto('/games/soccer');
    const game = page.locator('.soccer-game');
    await expect(game).toBeVisible();
    await game.click({ position: { x: 200, y: 500 } });
    await page.waitForTimeout(700);
    await expect(page.locator('.score-display')).toBeVisible();
  });

  test('scores increment on goal', async ({ page }) => {
    await page.goto('/games/soccer');
    const game = page.locator('.soccer-game');
    const box = await game.boundingBox();
    const goalX = box.width * 0.8;
    const goalY = box.height * 0.45;
    for (let i = 0; i < 3; i++) {
      await game.click({ position: { x: goalX, y: goalY } });
      await page.waitForTimeout(1200);
    }
    const scoreText = await page.locator('.score-display').textContent();
    expect(parseInt(scoreText.replace('Score: ', ''))).toBeGreaterThanOrEqual(1);
  });
});
