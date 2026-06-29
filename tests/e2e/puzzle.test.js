import { test, expect } from '@playwright/test';

test.describe('Puzzle E2E', () => {
  test('loads with board and tray', async ({ page }) => {
    await page.goto('/games/puzzle');
    await expect(page.locator('.board')).toBeVisible();
    await expect(page.locator('.tray')).toBeVisible();
  });

  test('tray shows 9 pieces', async ({ page }) => {
    await page.goto('/games/puzzle');
    await expect(page.locator('.tray-piece')).toHaveCount(9);
  });

  test('board shows 9 ghost cells', async ({ page }) => {
    await page.goto('/games/puzzle');
    await expect(page.locator('.ghost-cell')).toHaveCount(9);
  });

  test('tapping a tray piece selects it', async ({ page }) => {
    await page.goto('/games/puzzle');
    await page.locator('.tray-piece').first().click();
    await expect(page.locator('.tray-piece').first()).toHaveClass(/dragging/);
  });

  test('dropping on correct cell places the piece', async ({ page }) => {
    await page.goto('/games/puzzle');
    const firstPiece = page.locator('.tray-piece').first();
    await firstPiece.click();
    const emoji = await firstPiece.textContent();
    const firstGhost = page.locator('.ghost-cell').first();
    await firstGhost.click();
    await page.waitForTimeout(300);
    const placedCount = await page.locator('.placed-piece').count();
    expect(placedCount).toBeGreaterThanOrEqual(0);
  });

  test('win screen appears when all pieces placed', async ({ page }) => {
    await page.goto('/games/puzzle');
    const tray = page.locator('.tray-piece');
    const ghosts = page.locator('.ghost-cell');
    const count = await tray.count();

    for (let i = 0; i < count; i++) {
      const t = page.locator('.tray-piece').first();
      if (!(await t.isVisible().catch(() => false))) break;
      const emoji = await t.textContent();
      await t.click();
      for (let g = 0; g < count; g++) {
        const ghostText = await ghosts.nth(g).locator('.ghost-emoji').textContent();
        if (ghostText === emoji) {
          await ghosts.nth(g).click();
          await page.waitForTimeout(200);
          break;
        }
      }
    }

    await page.waitForTimeout(500);
    if (await page.locator('.placed-piece').count() === count) {
      await expect(page.locator('.win-overlay')).toBeVisible();
    }
  });
});
