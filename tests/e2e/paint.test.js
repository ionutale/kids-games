import { test, expect } from '@playwright/test';

test.describe('Paint E2E', () => {
  test('loads with canvas and toolbar', async ({ page }) => {
    await page.goto('/games/paint');
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.locator('.color-btn')).toHaveCount(6);
  });

  test('switching to stamp mode works', async ({ page }) => {
    await page.goto('/games/paint');
    const modeBtn = page.locator('.action-btn').first();
    await modeBtn.click();
    await expect(page.locator('.action-btn').first()).toHaveText('🖌️');
  });

  test('clear button is present', async ({ page }) => {
    await page.goto('/games/paint');
    await expect(page.locator('.action-btn').last()).toBeVisible();
  });
});
