import { test, expect } from '@playwright/test';

const CELLS = [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]];

async function dragPieceHome(page, row, col) {
  const board = await page.locator('.gp-board').boundingBox();
  const fx = (col + 0.5) / 2;
  const fy = (row + 0.5) / 2;

  const piece = page.locator(`.gp-tray-piece:has([id="cp-${row}-${col}"])`);
  await expect(piece).toBeVisible();
  const box = await piece.boundingBox();

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(board.x + board.width * fx, board.y + board.height * fy, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(350);
}

test.describe('Glossary Puzzle E2E', () => {
  test('gallery loads with images and chrome', async ({ page }) => {
    await page.goto('/games/glossary-puzzle');
    await expect(page.locator('.gp-gallery')).toBeVisible();
    await expect(page.locator('.gp-image-card').first()).toBeVisible();
    await expect(page.locator('.back-btn')).toBeVisible();
  });

  test('level bar shows 10 open links reflecting ?level=', async ({ page }) => {
    await page.goto('/games/glossary-puzzle');
    await expect(page.locator('.level-btn')).toHaveCount(10);
    await expect(page.locator('.level-btn.locked')).toHaveCount(0);
    await expect(page.locator('.level-btn.active')).toHaveText('1');

    await page.goto('/games/glossary-puzzle?level=5');
    await expect(page.locator('.level-btn.active')).toHaveText('5');

    const href = await page.locator('.level-btn').nth(2).getAttribute('href');
    expect(href).toBe('/games/glossary-puzzle/play/3');
  });

  test('image cards carry the selected level', async ({ page }) => {
    await page.goto('/games/glossary-puzzle?level=4');
    const href = await page.locator('.gp-image-card').first().getAttribute('href');
    expect(href).toMatch(/\/play\/4\?image=/);
  });

  test('category filter works', async ({ page }) => {
    await page.goto('/games/glossary-puzzle');
    await page.locator('.gp-cat-btn').first().click();
    await page.waitForTimeout(200);
    await expect(page.locator('.gp-image-card').first()).toBeVisible();
  });

  test('level page renders its grid density and default image', async ({ page }) => {
    await page.goto('/games/glossary-puzzle/play/3');
    await expect(page.locator('.gp-board')).toBeVisible();
    // L3 => 3x3 => 9 ghost outline paths
    await expect(page.locator('.gp-board svg path')).toHaveCount(9);
    await expect(page.locator('.gp-exit-btn')).toHaveAttribute('href', '/games/glossary-puzzle');
  });

  test('free-play route honors image and level params', async ({ page }) => {
    await page.goto('/games/glossary-puzzle/play?image=ocean&level=2');
    await expect(page.locator('.gp-board')).toBeVisible();
    // L2 => 3x2 => 6 ghost paths
    await expect(page.locator('.gp-board svg path')).toHaveCount(6);
  });

  test('drag each piece to its home cell solves the puzzle deterministically', async ({ page }) => {
    await page.goto('/games/glossary-puzzle/play/1');
    await expect(page.locator('.gp-tray-piece').first()).toBeVisible();

    await dragPieceHome(page, 0, 0);
    await dragPieceHome(page, 0, 1);
    await dragPieceHome(page, 1, 0);
    await dragPieceHome(page, 1, 1);

    await expect(page.locator('.gp-tray-piece')).toHaveCount(0);
    await expect(page.locator('.win-overlay')).toBeVisible({ timeout: 10000 });
  });

  test('win dialog offers replay, next level (same image), and back link', async ({ page }) => {
    await page.goto('/games/glossary-puzzle/play/1?image=garden');
    await expect(page.locator('.gp-tray-piece').first()).toBeVisible();

    for (const [r, c] of [[0, 0], [0, 1], [1, 0], [1, 1]]) {
      await dragPieceHome(page, r, c);
    }

    await expect(page.locator('.win-overlay')).toBeVisible({ timeout: 10000 });
    const btns = page.locator('.gp-celebration-btn');
    await expect(btns).toHaveCount(3);

    const nextHref = await btns.nth(1).getAttribute('href');
    expect(nextHref).toBe('/games/glossary-puzzle/play/2?image=garden');

    const backHref = await btns.nth(2).getAttribute('href');
    expect(backHref).toBe('/games/glossary-puzzle');
  });

  test('next-level link increases difficulty on the same image', async ({ page }) => {
    await page.goto('/games/glossary-puzzle/play/1?image=garden');
    await expect(page.locator('.gp-tray-piece').first()).toBeVisible();

    for (const [r, c] of [[0, 0], [0, 1], [1, 0], [1, 1]]) {
      await dragPieceHome(page, r, c);
    }

    await expect(page.locator('.win-overlay')).toBeVisible({ timeout: 10000 });
    await page.locator('.gp-celebration-btn').nth(1).click();
    await page.waitForURL(/\/play\/2\?image=garden/);
    // L2 => 3x2 => 6 ghost paths
    await expect(page.locator('.gp-board svg path')).toHaveCount(6);
  });
});
