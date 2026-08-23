import { test, expect } from '@playwright/test';

test.describe('Path Builder E2E', () => {
  test('grid renders with start flag and goal', async ({ page }) => {
    await page.goto('/games/path-builder');
    await page.waitForTimeout(600);
    const grid = page.getByTestId('grid');
    await expect(grid).toBeVisible();
    await expect(grid.locator('.cell', { hasText: '🚩' }).first()).toBeVisible();
    await expect(grid.locator('.cell', { hasText: '🏁' }).first()).toBeVisible();
  });

  test('tapping cells adjacent to the tip extends the blue path', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto('/games/path-builder');
    const grid = page.getByTestId('grid');
    // find the start (🚩) and tap a valid empty neighbor
    let sr = -1;
    let sc = -1;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const t = await grid.getByTestId(`cell-${r}-${c}`).textContent();
        if (t === '🚩') {
          sr = r;
          sc = c;
        }
      }
    }
    expect(sr).toBeGreaterThanOrEqual(0);
    // try the 4 neighbors until one is empty and becomes part of the path
    const candidates = [
      [sr - 1, sc],
      [sr + 1, sc],
      [sr, sc - 1],
      [sr, sc + 1]
    ];
    let extended = false;
    for (const [r, c] of candidates) {
      if (r < 0 || c < 0 || r > 3 || c > 3) continue;
      const cell = grid.getByTestId(`cell-${r}-${c}`);
      const txt = (await cell.textContent()) ?? '';
      if (txt !== '') continue; // occupied (obstacle/goal)
      await cell.click();
      await page.waitForTimeout(250);
      try {
        await expect(cell).toHaveClass(/path-cell/, { timeout: 2000 });
        extended = true;
        break;
      } catch {
        // this neighbor may have been an obstacle rendered as empty text — try next
      }
    }
    expect(extended).toBe(true);
  });

  test('hint button lights a suggestion cell', async ({ page }) => {
    await page.goto('/games/path-builder');
    await page.getByTestId('pb-root').locator('.big-btn.ghost').click();
    await expect(page.locator('.cell', { hasText: '💡' }).first()).toBeVisible({ timeout: 2000 });
  });
});
