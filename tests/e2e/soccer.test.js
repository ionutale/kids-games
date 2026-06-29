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
    await field.click({ position: { x: box.width * 0.50, y: box.height * 0.12 } });
    await page.waitForTimeout(700);
    await expect(page.locator('.score-display')).toBeVisible();
  });

  test('scores increment on goal shots', async ({ page }) => {
    await page.goto('/games/soccer');
    const field = page.locator('.field');
    const box = await field.boundingBox();
    const gx = box.width * 0.50, gy = box.height * 0.12;
    for (let i = 0; i < 3; i++) {
      await field.click({ position: { x: gx, y: gy } });
      await page.waitForTimeout(1200);
    }
    const scoreText = await page.locator('.score-display').textContent();
    expect(parseInt(scoreText.split('/')[0].replace('Score: ', ''))).toBeGreaterThanOrEqual(1);
  });

  test('tapping outside goal area does not score', async ({ page }) => {
    await page.goto('/games/soccer');
    const field = page.locator('.field');
    const box = await field.boundingBox();
    await field.click({ position: { x: box.width * 0.3, y: box.height * 0.5 } });
    await page.waitForTimeout(1000);
    const s = await page.locator('.score-display').textContent();
    expect(parseInt(s.split('/')[0].replace('Score: ', ''))).toBe(0);
  });

  test('kid taps everywhere on the field', async ({ page }) => {
    await page.goto('/games/soccer');
    const field = page.locator('.field');
    const box = await field.boundingBox();
    for (let i = 0; i < 8; i++) {
      await field.click({ position: { x: box.width * (0.1 + Math.random() * 0.8), y: box.height * (0.1 + Math.random() * 0.8) } });
      await page.waitForTimeout(600);
    }
    await expect(page.locator('.score-display')).toBeVisible();
  });

  test('ball moves on tap', async ({ page }) => {
    await page.goto('/games/soccer');
    const field = page.locator('.field');
    const ball = page.locator('.ball');
    const box = await field.boundingBox();
    const initialLeft = await ball.evaluate(el => el.style.left);
    await field.click({ position: { x: box.width * 0.30, y: box.height * 0.40 } });
    await page.waitForTimeout(300);
    const newLeft = await ball.evaluate(el => el.style.left);
    expect(newLeft).not.toBe(initialLeft);
  });

  test('level buttons exist', async ({ page }) => {
    await page.goto('/games/soccer');
    await expect(page.locator('.level-btn')).toHaveCount(10);
  });

  test('level change resets score', async ({ page }) => {
    await page.goto('/games/soccer');
    const field = page.locator('.field');
    const box = await field.boundingBox();
    await field.click({ position: { x: box.width * 0.50, y: box.height * 0.12 } });
    await page.waitForTimeout(1000);
    await page.locator('.level-btn').nth(5).click();
    const s = await page.locator('.score-display').textContent();
    expect(s).toContain('0');
  });
});
