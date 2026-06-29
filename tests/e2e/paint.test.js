import { test, expect } from '@playwright/test';

test.describe('Paint E2E', () => {
  test('loads with canvas and toolbar', async ({ page }) => {
    await page.goto('/games/paint');
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.locator('.color-btn')).toHaveCount(6);
  });

  test('switching to stamp mode works', async ({ page }) => {
    await page.goto('/games/paint');
    await page.locator('.action-btn').first().click();
    await expect(page.locator('.action-btn').first()).toHaveText('🖌️');
  });

  test('clear button is present', async ({ page }) => {
    await page.goto('/games/paint');
    await expect(page.locator('.action-btn').last()).toBeVisible();
  });

  test('color button gets active class on click', async ({ page }) => {
    await page.goto('/games/paint');
    await page.locator('.color-btn').nth(2).click();
    await expect(page.locator('.color-btn').nth(2)).toHaveClass(/active/);
  });

  test('size button gets active class on click', async ({ page }) => {
    await page.goto('/games/paint');
    await page.locator('.size-btn').nth(1).click();
    await expect(page.locator('.size-btn').nth(1)).toHaveClass(/active/);
  });

  test('brush modes exist', async ({ page }) => {
    await page.goto('/games/paint');
    await expect(page.locator('.size-btn')).toHaveCount(3);
  });
});
