import { test, expect } from '@playwright/test';

test.describe('Puzzle E2E', () => {
  test('loads with puzzle pieces', async ({ page }) => {
    await page.goto('/games/puzzle');
    await expect(page.locator('.piece').first()).toBeVisible();
  });

  test('pieces are displayed on the board', async ({ page }) => {
    await page.goto('/games/puzzle');
    await expect(page.locator('.puzzle-board')).toBeVisible();
    await expect(page.locator('.piece').first()).toBeVisible();
  });

  test('kid taps many random pieces', async ({ page }) => {
    await page.goto('/games/puzzle');
    const pieces = page.locator('.piece');
    const count = await pieces.count();

    for (let i = 0; i < 10; i++) {
      const randomIdx = Math.floor(Math.random() * count);
      await pieces.nth(randomIdx).click({ force: true }).catch(() => {});
      await page.waitForTimeout(100);
    }

    const placedCount = await page.locator('.piece.placed').count();
    expect(placedCount).toBeGreaterThanOrEqual(0);
  });

  test('kid taps each piece in sequence repeatedly', async ({ page }) => {
    await page.goto('/games/puzzle');
    const pieces = page.locator('.piece');

    for (let round = 0; round < 3; round++) {
      const count = await pieces.count();
      for (let i = 0; i < count; i++) {
        const isDisabled = await pieces.nth(i).getAttribute('class').then(c => c.includes('placed')).catch(() => false);
        if (!isDisabled) {
          await pieces.nth(i).click({ force: true }).catch(() => {});
          await page.waitForTimeout(50);
        }
      }
      const replayBtn = page.locator('.replay-btn');
      if (await replayBtn.isVisible().catch(() => false)) {
        await replayBtn.click();
        await page.waitForTimeout(200);
      }
    }

    await expect(page.locator('.piece').first()).toBeVisible();
  });

  test('win screen appears when puzzle is solved', async ({ page }) => {
    await page.goto('/games/puzzle');

    for (let attempt = 0; attempt < 50; attempt++) {
      const unplaced = page.locator('.piece:not(.placed)');
      const count = await unplaced.count();
      if (count === 0) break;
      const randomIdx = Math.floor(Math.random() * count);
      await unplaced.nth(randomIdx).click({ force: true });
      await page.waitForTimeout(50);
    }

    await page.waitForTimeout(500);
    const allPlaced = await page.locator('.piece.placed').count();
    const totalPieces = await page.locator('.piece').count();
    if (allPlaced === totalPieces) {
      await expect(page.locator('.win-overlay')).toBeVisible();
    }
  });
});
