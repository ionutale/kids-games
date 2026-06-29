import { test, expect } from '@playwright/test';

test.describe('Sorting E2E', () => {
  test('loads with items and baskets', async ({ page }) => {
    await page.goto('/games/sorting');
    await expect(page.locator('.item').first()).toBeVisible();
    await expect(page.locator('.basket').first()).toBeVisible();
  });

  test('tapping an item selects it', async ({ page }) => {
    await page.goto('/games/sorting');
    const item = page.locator('.item').first();
    await item.click();
    await expect(item).toHaveClass(/selected/);
  });

  test('hint text shows instructions', async ({ page }) => {
    await page.goto('/games/sorting');
    const hint = page.locator('.hint');
    await expect(hint).toBeVisible();
  });
});
