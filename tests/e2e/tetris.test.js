import { test, expect } from '@playwright/test';

test.describe('Tetris E2E', () => {
  test('difficulty screen offers E/M/H and starts the game', async ({ page }) => {
    await page.goto('/games/tetris');
    await expect(page.getByTestId('tetris-root').locator('.title')).toBeVisible();
    const buttons = page.locator('.center-col .big-btn');
    await expect(buttons).toHaveCount(3);
    await buttons.first().click();
    await expect(page.getByTestId('board')).toBeVisible();
  });

  test('hard drop places a piece and score moves', async ({ page }) => {
    await page.goto('/games/tetris');
    await page.locator('.center-col .big-btn').nth(2).click(); // hard
    await expect(page.getByTestId('board')).toBeVisible();
    const hud = page.locator('.hud-item').first();
    const before = await hud.textContent();
    await page.getByTestId('controls').locator('button[aria-label="hard drop"]').click();
    await page.waitForTimeout(250);
    const after = await hud.textContent();
    expect(after).not.toBe(before); // hard-drop points landed
  });

  test('pause overlay appears and resumes', async ({ page }) => {
    await page.goto('/games/tetris');
    await page.locator('.center-col .big-btn').first().click();
    await expect(page.getByTestId('board')).toBeVisible();
    await page.getByTestId('controls').locator('button[aria-label="pause"]').click();
    await expect(page.getByTestId('pause-overlay')).toBeVisible();
    await page.getByTestId('pause-overlay').locator('.big-btn.primary').click();
    await expect(page.getByTestId('pause-overlay')).toBeHidden();
  });

  test('board renders a 10-wide grid and difficulty persists', async ({ page }) => {
    await page.goto('/games/tetris');
    await page.locator('.center-col .big-btn').nth(1).click();
    await expect(page.getByTestId('board')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('tetris-difficulty'))).toBe('medium');
    const cols = await page
      .getByTestId('board')
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    expect(cols).toBe(10);
  });
});
