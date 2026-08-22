import { test, expect } from '@playwright/test';

test.describe('Glossary Puzzle E2E', () => {
  test('gallery loads with puzzle images', async ({ page }) => {
    await page.goto('/games/glossary-puzzle');
    await expect(page.locator('.gp-gallery')).toBeVisible();
    await expect(page.locator('.gp-image-card').first()).toBeVisible();
    await expect(page.locator('.back-btn')).toBeVisible();
  });

  test('level bar shows 10 levels, locked beyond unlocked', async ({ page }) => {
    await page.goto('/games/glossary-puzzle');
    await expect(page.locator('.level-btn')).toHaveCount(10);
    await expect(page.locator('.level-btn.locked')).toHaveCount(9);
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

  test('clicking image starts puzzle on its own URL', async ({ page }) => {
    await page.goto('/games/glossary-puzzle');
    await page.locator('.gp-image-card').first().click();
    await page.waitForURL(/\/games\/glossary-puzzle\/play\?image=/);
    await expect(page.locator('.gp-board')).toBeVisible();
    await expect(page.locator('.gp-tray')).toBeVisible();
  });

  test('level 1 link starts the level puzzle', async ({ page }) => {
    await page.goto('/games/glossary-puzzle');
    await page.locator('.level-btn').first().click();
    await page.waitForURL('/games/glossary-puzzle/play/1');
    await expect(page.locator('.gp-board')).toBeVisible();
    await expect(page.locator('.gp-board svg path')).toHaveCount(4);
    await expect(page.locator('.gp-tray-piece').first()).toBeVisible();
  });

  test('locked level link is blocked', async ({ page }) => {
    await page.goto('/games/glossary-puzzle');
    await page.locator('.level-btn').nth(9).click();
    await page.waitForTimeout(300);
    await expect(page).toHaveURL('/games/glossary-puzzle');
  });

  test('back button from play links to gallery', async ({ page }) => {
    await page.goto('/games/glossary-puzzle/play/1');
    await expect(page.locator('.gp-board')).toBeVisible();
    await expect(page.locator('.gp-exit-btn')).toHaveAttribute('href', '/games/glossary-puzzle');
  });

  test('drag and drop places a piece on its target cell', async ({ page }) => {
    await page.goto('/games/glossary-puzzle/play/1');
    await expect(page.locator('.gp-board')).toBeVisible();

    const board = await page.locator('.gp-board').boundingBox();
    expect(board).toBeTruthy();

    const cells = [
      [0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]
    ];

    for (const [fx, fy] of cells) {
      const trayPiece = await page.locator('.gp-tray-piece').first().boundingBox();
      const tx = trayPiece.x + trayPiece.width / 2;
      const ty = trayPiece.y + trayPiece.height / 2;

      await page.mouse.move(tx, ty);
      await page.mouse.down();
      await page.mouse.move(
        board.x + board.width * fx,
        board.y + board.height * fy,
        { steps: 8 }
      );
      await page.mouse.up();
      await page.waitForTimeout(250);
    }

    await expect(page.locator('.gp-board-piece')).toHaveCount(1);
    await expect(page.locator('.gp-tray-piece')).toHaveCount(3);
  });
});
