import { test, expect } from '@playwright/test';

test.describe('Spot the Difference E2E', () => {
  test('two grids render side by side (stacked) with cells', async ({ page }) => {
    await page.goto('/games/spot-the-difference');
    await page.waitForTimeout(600);
    await expect(page.getByTestId('grid-left')).toBeVisible();
    await expect(page.getByTestId('grid-right')).toBeVisible();
    const cells = await page.locator('[data-testid^="left-"]').count();
    expect(cells).toBeGreaterThanOrEqual(9); // 3×3 minimum
  });

  test('tapping a difference marks it in BOTH grids with a ring', async ({ page }) => {
    await page.goto('/games/spot-the-difference');
    // find a diff cell by comparing DOM text of left/right at same index
    const size = await page.locator('[data-testid="grid-left"] .cell').count();
    let diffIdx = -1;
    for (let i = 0; i < size; i++) {
      const l = await page.getByTestId(`left-${i}`).textContent();
      const r = await page.getByTestId(`right-${i}`).textContent();
      if (l !== r) {
        diffIdx = i;
        break;
      }
    }
    expect(diffIdx).toBeGreaterThanOrEqual(0);
    await page.getByTestId(`left-${diffIdx}`).click();
    await page.waitForTimeout(250);
    await expect(page.getByTestId(`right-${diffIdx}`)).toHaveClass(/found/, { timeout: 5000 });
  });

  test('tapping a matching cell shakes silently and does not mark', async ({ page }) => {
    await page.goto('/games/spot-the-difference');
    const size = await page.locator('[data-testid="grid-left"] .cell').count();
    let matchIdx = -1;
    for (let i = 0; i < size; i++) {
      const l = await page.getByTestId(`left-${i}`).textContent();
      const r = await page.getByTestId(`right-${i}`).textContent();
      if (l === r) {
        matchIdx = i;
        break;
      }
    }
    if (matchIdx >= 0) {
      await page.getByTestId(`left-${matchIdx}`).click();
      await expect(page.getByTestId(`left-${matchIdx}`)).toHaveClass(/wrong/, { timeout: 2000 });
    }
  });

  test('finding all differences shows the complete overlay with next puzzle', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/games/spot-the-difference');
    const size = await page.locator('[data-testid="grid-left"] .cell').count();
    for (let i = 0; i < size; i++) {
      const l = await page.getByTestId(`left-${i}`).textContent();
      const r = await page.getByTestId(`right-${i}`).textContent();
      if (l !== r) {
        await page.getByTestId(`left-${i}`).click();
        await page.waitForTimeout(250);
      }
    }
    await expect(page.getByTestId('complete-overlay')).toBeVisible({ timeout: 5000 });
    await page.locator('.big-btn.primary').click();
    await expect(page.getByTestId('complete-overlay')).toBeHidden();
  });
});
