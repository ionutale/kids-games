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

  test('tapping same item deselects it', async ({ page }) => {
    await page.goto('/games/sorting');
    const item = page.locator('.item').first();
    await item.click();
    await expect(item).toHaveClass(/selected/);
    await item.click();
    await expect(item).not.toHaveClass(/selected/);
  });

  test('level buttons exist', async ({ page }) => {
    await page.goto('/games/sorting');
    await expect(page.locator('.level-btn')).toHaveCount(10);
  });

  test('level change restarts game', async ({ page }) => {
    await page.goto('/games/sorting');
    await page.locator('.level-btn').nth(5).click();
    await page.waitForTimeout(200);
    await expect(page.locator('.item').first()).toBeVisible();
  });

  test('basket labels are visible', async ({ page }) => {
    await page.goto('/games/sorting');
    const labels = page.locator('.basket-label');
    await expect(labels.first()).toBeVisible();
    const count = await labels.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });
});
