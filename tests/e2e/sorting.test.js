import { test, expect } from '@playwright/test';

test.describe('Sorting E2E — play all levels', () => {
  async function solveLevel(page) {
    for (let attempt = 0; attempt < 50; attempt++) {
      const won = await page.locator('.win-overlay').isVisible().catch(() => false);
      if (won) return true;

      const itemCount = await page.locator('.item').count();
      if (itemCount === 0) return true;

      const baskets = page.locator('.basket');
      const numBaskets = await baskets.count();
      let sorted = false;

      for (let b = 0; b < numBaskets && !sorted; b++) {
        const itemsBefore = await page.locator('.item').count();
        if (itemsBefore === 0) return true;

        await page.locator('.item').first().click();
        await page.waitForTimeout(150);

        await baskets.nth(b).click();
        await page.waitForTimeout(600);

        const itemsAfter = await page.locator('.item').count();
        if (itemsAfter < itemsBefore) sorted = true;
      }
    }
    return false;
  }

  test('play level 1 correctly', async ({ page }) => {
    await page.goto('/games/sorting');
    await page.locator('.level-btn').nth(0).click();
    await page.waitForTimeout(300);
    await solveLevel(page);
  });

  test('play levels 1-10 sequentially as a real user', async ({ page }) => {
    test.setTimeout(300000);
    await page.goto('/games/sorting');

    for (let level = 0; level < 10; level++) {
      await page.locator('.level-btn').nth(level).click();
      await page.waitForTimeout(300);

      for (let pass = 0; pass < 3; pass++) {
        const done = await solveLevel(page);
        if (done) break;
      }

      const wonOverlay = page.locator('.win-overlay');
      if (await wonOverlay.isVisible().catch(() => false)) {
        await page.locator('.replay-btn').click();
        await page.waitForTimeout(300);
      }
    }
  });
});
