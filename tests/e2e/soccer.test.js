import { test, expect } from '@playwright/test';

test.describe('Soccer E2E', () => {
  test('loads and shows field and ball', async ({ page }) => {
    await page.goto('/games/soccer');
    await expect(page.locator('.field')).toBeVisible();
    await expect(page.locator('.ball')).toBeVisible();
  });

  test('tapping field at goal area scores', async ({ page }) => {
    await page.goto('/games/soccer');
    const field = page.locator('.field');
    await expect(field).toBeVisible();
    const box = await field.boundingBox();
    const goalX = box.width * 0.88;
    const goalY = box.height * 0.14;
    await field.click({ position: { x: goalX, y: goalY } });
    await page.waitForTimeout(700);
    await expect(page.locator('.score-display')).toBeVisible();
  });

  test('scores increment on goal shots', async ({ page }) => {
    await page.goto('/games/soccer');
    const field = page.locator('.field');
    const box = await field.boundingBox();
    const goalX = box.width * 0.88;
    const goalY = box.height * 0.14;
    for (let i = 0; i < 3; i++) {
      await field.click({ position: { x: goalX, y: goalY } });
      await page.waitForTimeout(1200);
    }
    const scoreText = await page.locator('.score-display').textContent();
    expect(parseInt(scoreText.split('/')[0].replace('Score: ', ''))).toBeGreaterThanOrEqual(1);
  });

  test('tapping outside goal area does not score', async ({ page }) => {
    await page.goto('/games/soccer');
    const field = page.locator('.field');
    const box = await field.boundingBox();
    const missX = box.width * 0.3;
    const missY = box.height * 0.5;
    await field.click({ position: { x: missX, y: missY } });
    await page.waitForTimeout(1000);
    const scoreText = await page.locator('.score-display').textContent();
    const currentScore = parseInt(scoreText.split('/')[0].replace('Score: ', ''));
    expect(currentScore).toBe(0);
  });

  test('kid taps everywhere on the field', async ({ page }) => {
    await page.goto('/games/soccer');
    const field = page.locator('.field');
    const box = await field.boundingBox();
    for (let i = 0; i < 8; i++) {
      const rx = box.width * (0.1 + Math.random() * 0.8);
      const ry = box.height * (0.1 + Math.random() * 0.8);
      await field.click({ position: { x: rx, y: ry } });
      await page.waitForTimeout(600);
    }
    await expect(page.locator('.score-display')).toBeVisible();
  });
});
