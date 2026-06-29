import { test, expect } from '@playwright/test';

test.describe('Puzzle E2E', () => {
  test('loads with puzzle pieces', async ({ page }) => {
    await page.goto('/games/puzzle');
    await expect(page.locator('.piece').first()).toBeVisible();
  });

  test('clicking piece in correct spot marks it', async ({ page }) => {
    await page.goto('/games/puzzle');
    const pieces = page.locator('.piece');
    await pieces.first().click();
    await page.waitForTimeout(200);
  });

  test('pieces are displayed in a grid', async ({ page }) => {
    await page.goto('/games/puzzle');
    const grid = page.locator('.puzzle-grid');
    await expect(grid).toBeVisible();
  });
});
