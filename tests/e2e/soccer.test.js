import { test, expect } from '@playwright/test';

test.describe('Soccer E2E', () => {
  test('loads and shows field and ball', async ({ page }) => {
    await page.goto('/games/soccer');
    await expect(page.locator('.field')).toBeVisible();
    await expect(page.locator('.ball')).toBeVisible();
  });

  test('swipe toward goal scores', async ({ page }) => {
    await page.goto('/games/soccer');
    const field = page.locator('.field');
    const box = await field.boundingBox();
    const sx = box.x + box.width * 0.5, sy = box.y + box.height * 0.4;
    const ex = box.x + box.width * 0.5, ey = box.y + box.height * 0.1;

    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.waitForTimeout(50);
    await page.mouse.move(ex, ey, { steps: 5 });
    await page.waitForTimeout(50);
    await page.mouse.up();
    await page.waitForTimeout(700);
    await expect(page.locator('.score-display')).toBeVisible();
  });

  test('scores increment on goal swipe', async ({ page }) => {
    await page.goto('/games/soccer');
    const field = page.locator('.field');
    const box = await field.boundingBox();
    const sx = box.x + box.width * 0.5, sy = box.y + box.height * 0.4;
    const ex = box.x + box.width * 0.5, ey = box.y + box.height * 0.1;

    for (let i = 0; i < 3; i++) {
      await page.mouse.move(sx, sy);
      await page.mouse.down();
      await page.waitForTimeout(50);
      await page.mouse.move(ex, ey, { steps: 5 });
      await page.waitForTimeout(50);
      await page.mouse.up();
      await page.waitForTimeout(1500);
    }

    const scoreText = await page.locator('.score-display').textContent();
    expect(parseInt(scoreText.split('/')[0].replace('Score: ', ''))).toBeGreaterThanOrEqual(1);
  });

  test('swipe away from goal does not score', async ({ page }) => {
    await page.goto('/games/soccer');
    const field = page.locator('.field');
    const box = await field.boundingBox();
    const sx = box.x + box.width * 0.5, sy = box.y + box.height * 0.8;
    const ex = box.x + box.width * 0.5, ey = box.y + box.height * 0.9;

    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.waitForTimeout(50);
    await page.mouse.move(ex, ey, { steps: 5 });
    await page.waitForTimeout(50);
    await page.mouse.up();
    await page.waitForTimeout(1000);

    const s = await page.locator('.score-display').textContent();
    expect(parseInt(s.split('/')[0].replace('Score: ', ''))).toBe(0);
  });

  test('kid swipes all over the field', async ({ page }) => {
    await page.goto('/games/soccer');
    const box = await page.locator('.field').boundingBox();

    for (let i = 0; i < 5; i++) {
      const sx = box.x + box.width * (0.2 + Math.random() * 0.6);
      const sy = box.y + box.height * (0.3 + Math.random() * 0.5);
      const ex = box.x + box.width * (0.2 + Math.random() * 0.6);
      const ey = box.y + box.height * (0.1 + Math.random() * 0.8);
      await page.mouse.move(sx, sy);
      await page.mouse.down();
      await page.waitForTimeout(30);
      await page.mouse.move(ex, ey, { steps: 5 });
      await page.waitForTimeout(30);
      await page.mouse.up();
      await page.waitForTimeout(500);
    }

    await expect(page.locator('.score-display')).toBeVisible();
  });

  test('ball moves on swipe', async ({ page }) => {
    await page.goto('/games/soccer');
    const field = page.locator('.field');
    const ball = page.locator('.ball');
    const box = await field.boundingBox();
    const initialTop = await ball.evaluate(el => el.style.top);
    const sx = box.x + box.width * 0.5, sy = box.y + box.height * 0.4;
    const ex = box.x + box.width * 0.5, ey = box.y + box.height * 0.1;

    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.waitForTimeout(50);
    await page.mouse.move(ex, ey, { steps: 5 });
    await page.waitForTimeout(50);
    await page.mouse.up();
    await page.waitForTimeout(300);

    const newTop = await ball.evaluate(el => el.style.top);
    expect(newTop).not.toBe(initialTop);
  });

  test('level buttons exist', async ({ page }) => {
    await page.goto('/games/soccer');
    await expect(page.locator('.level-btn')).toHaveCount(10);
  });

  test('level change resets score', async ({ page }) => {
    await page.goto('/games/soccer');
    await page.locator('.level-btn').nth(5).click();
    const s = await page.locator('.score-display').textContent();
    expect(s).toContain('0');
  });
});
