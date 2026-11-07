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
    await page.locator('.ladder-step').nth(0).click();
    await page.waitForTimeout(300);
    await solveLevel(page);
  });

  test('play levels 1-10 sequentially as a real user', async ({ page }) => {
    test.setTimeout(300000);
    await page.goto('/games/sorting');

    for (let level = 0; level < 10; level++) {
      await page.locator('.ladder-step').nth(level).click();
      await page.waitForTimeout(300);

      for (let pass = 0; pass < 3; pass++) {
        const done = await solveLevel(page);
        if (done) break;
      }

      const wonOverlay = page.locator('.win-overlay');
      if (await wonOverlay.isVisible().catch(() => false)) {
        await page.getByTestId('replay').click();
        await page.waitForTimeout(300);
      }
    }
  });

  async function dragTo(page, item, basket) {
    const ib = await item.boundingBox();
    const bb = await basket.boundingBox();
    await page.mouse.move(ib.x + ib.width / 2, ib.y + ib.height / 2);
    await page.mouse.down();
    await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 10 });
    await page.mouse.up();
  }

  test('every basket shows a painted category sign', async ({ page }) => {
    await page.goto('/games/sorting');
    const category = await page.locator('.sorting-game').getAttribute('data-category');
    const baskets = page.locator('.basket');
    const count = await baskets.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const sign = baskets.nth(i).locator('.basket-sign');
      await expect(sign).toBeVisible();
      if (category === 'colors') {
        await expect(sign.locator('.sign-swatch')).toBeVisible();
      } else {
        await expect(sign.locator('.sign-shape')).toBeVisible();
      }
    }
  });

  test('dragging to the wrong basket brings the item back', async ({ page }) => {
    await page.goto('/games/sorting');
    const items = page.locator('.item');
    const item = items.first();
    const itemCat = Number(await item.getAttribute('data-cat'));
    const baskets = page.locator('.basket');
    const basketCount = await baskets.count();

    let wrongIdx = -1;
    for (let i = 0; i < basketCount; i++) {
      if (i !== itemCat) {
        wrongIdx = i;
        break;
      }
    }
    expect(wrongIdx, 'expected a basket that does not match the first item').toBeGreaterThanOrEqual(0);

    const before = await items.count();
    await dragTo(page, item, baskets.nth(wrongIdx));
    await expect(baskets.nth(wrongIdx)).toHaveClass(/wrong/, { timeout: 1000 });

    // the ghost glides back into its slot; the item is never consumed
    await page.waitForTimeout(450);
    await expect(items).toHaveCount(before);
    await expect(item).toBeVisible();
    await expect(baskets.nth(wrongIdx).locator('.basket-count')).toHaveText('0');
  });

  test('dragging to the right basket collects the item', async ({ page }) => {
    await page.goto('/games/sorting');
    const items = page.locator('.item');
    const item = items.first();
    const itemCat = Number(await item.getAttribute('data-cat'));
    const baskets = page.locator('.basket');
    const before = await items.count();

    await dragTo(page, item, baskets.nth(itemCat));
    await expect(items).toHaveCount(before - 1, { timeout: 3000 });
    await expect(baskets.nth(itemCat).locator('.basket-count')).toHaveText('1');
  });
});
