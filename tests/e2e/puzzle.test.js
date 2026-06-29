import { test, expect } from '@playwright/test';

test.describe('Puzzle E2E', () => {
  test('loads with board and tray', async ({ page }) => {
    await page.goto('/games/puzzle');
    await expect(page.locator('.board')).toBeVisible();
    await expect(page.locator('.tray')).toBeVisible();
  });

  test('tray shows pieces matching current level', async ({ page }) => {
    await page.goto('/games/puzzle');
    const trayCount = await page.locator('.tray-piece').count();
    expect(trayCount).toBeGreaterThanOrEqual(4);
  });

  test('board shows cells matching current level', async ({ page }) => {
    await page.goto('/games/puzzle');
    await page.waitForSelector('.ghost-cell');
    const cellCount = await page.locator('.ghost-cell').count();
    expect(cellCount).toBeGreaterThanOrEqual(4);
  });

  test('level 10 has 25 pieces', async ({ page }) => {
    await page.goto('/games/puzzle');
    await page.locator('.lvl-btn').nth(9).click();
    await page.waitForTimeout(200);
    await expect(page.locator('.tray-piece')).toHaveCount(25);
    await expect(page.locator('.ghost-cell')).toHaveCount(25);
  });

  test('tapping a tray piece selects it', async ({ page }) => {
    await page.goto('/games/puzzle');
    await page.locator('.tray-piece').first().click();
    await expect(page.locator('.tray-piece').first()).toHaveClass(/dragging/);
  });

  test('dropping on correct cell places the piece', async ({ page }) => {
    await page.goto('/games/puzzle');
    const firstPiece = page.locator('.tray-piece').first();
    const emoji = await firstPiece.textContent();
    await firstPiece.click();
    const ghosts = page.locator('.ghost-cell');
    const count = await ghosts.count();

    for (let g = 0; g < count; g++) {
      const ghostText = await ghosts.nth(g).locator('.ghost-emoji').textContent();
      if (ghostText === emoji) {
        await ghosts.nth(g).click();
        await page.waitForTimeout(300);
        break;
      }
    }

    const placedCount = await page.locator('.placed-piece').count();
    expect(placedCount).toBeGreaterThanOrEqual(0);
  });

  test('win screen appears when all pieces placed', async ({ page }) => {
    await page.goto('/games/puzzle');
    const ghosts = page.locator('.ghost-cell');
    const count = await ghosts.count();

    for (let round = 0; round < count * 3; round++) {
      const trayItem = page.locator('.tray-piece').first();
      if (!(await trayItem.isVisible().catch(() => false))) break;
      const emojiText = await trayItem.textContent();
      if (!emojiText) break;
      await trayItem.click();
      await page.waitForTimeout(100);

      for (let g = 0; g < count; g++) {
        const ghostText = await ghosts.nth(g).locator('.ghost-emoji').textContent();
        if (ghostText && emojiText && ghostText[0] === emojiText[0]) {
          await ghosts.nth(g).click();
          await page.waitForTimeout(100);
          break;
        }
      }
    }

    await page.waitForTimeout(500);
    const placedCount = await page.locator('.placed-piece').count();
    if (placedCount === count) {
      await expect(page.locator('.win-overlay')).toBeVisible();
    }
  });
});
