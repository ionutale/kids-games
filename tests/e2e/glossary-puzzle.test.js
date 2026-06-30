import { test, expect } from '@playwright/test';

test.describe('Glossary Puzzle E2E', () => {
  test('gallery loads with puzzle images', async ({ page }) => {
    await page.goto('/games/glossary-puzzle');
    await expect(page.locator('.gp-gallery')).toBeVisible();
    await expect(page.locator('.gp-image-card').first()).toBeVisible();
  });

  test('difficulty buttons work', async ({ page }) => {
    await page.goto('/games/glossary-puzzle');
    await expect(page.locator('.gp-diff-btn')).toHaveCount(3);
  });

  test('category filter works', async ({ page }) => {
    await page.goto('/games/glossary-puzzle');
    await page.locator('.gp-cat-btn').first().click();
    await page.waitForTimeout(200);
    await expect(page.locator('.gp-image-card').first()).toBeVisible();
  });

  test('clicking image starts puzzle', async ({ page }) => {
    await page.goto('/games/glossary-puzzle');
    await page.locator('.gp-image-card').first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('.gp-board')).toBeVisible();
    await expect(page.locator('.gp-tray')).toBeVisible();
  });

  test('board shows ghost cells', async ({ page }) => {
    await page.goto('/games/glossary-puzzle');
    await page.locator('.gp-image-card').first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('.gp-board-cell').first()).toBeVisible();
  });
});
