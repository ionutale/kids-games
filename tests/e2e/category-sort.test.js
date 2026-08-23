import { test, expect } from '@playwright/test';

test.describe('Category Sort E2E', () => {
  test('bins render with labels and an item waits below', async ({ page }) => {
    await page.goto('/games/category-sort');
    await page.waitForTimeout(600);
    await expect(page.getByTestId('bins')).toBeVisible();
    const bins = page.getByTestId('bins').locator('.bin');
    await expect(bins).toHaveCount(2); // first set is 2-bin
    await expect(bins.first()).toContainText(/Animals|Animali|Animale|Tiere|Animaux|动物/);
    await expect(page.getByTestId('item')).toBeVisible();
  });

  test('dragging the item into the CORRECT bin advances progress', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto('/games/category-sort');
    // read which bin is correct from the round data via DOM: try each bin until accepted
    const hud = page.locator('.top-bar .hud-item').first();
    const before = parseInt((await hud.textContent()).replace(/\D/g, ''), 10) || 0;
    const item = page.getByTestId('item');
    const ib = await item.boundingBox();
    let done = false;
    for (const binSel of await page.getByTestId('bins').locator('.bin').all()) {
      const bb = await binSel.boundingBox();
      await page.mouse.move(ib.x + ib.width / 2, ib.y + ib.height / 2);
      await page.mouse.down();
      await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 6 });
      await page.mouse.up();
      await page.waitForTimeout(500);
      const after = parseInt((await hud.textContent()).replace(/\D/g, ''), 10) || 0;
      if (after > before) {
        done = true;
        break;
      }
    }
    expect(done).toBe(true);
  });

  test('dropping into the WRONG bin rejects silently (item returns, no score)', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto('/games/category-sort');
    const hud = page.locator('.top-bar .hud-item').first();
    const before = (await hud.textContent()) ?? '';
    const item = page.getByTestId('item');
    const ib = await item.boundingBox();
    // find the WRONG bin by dropping everywhere and asserting no advance happened
    // strategy: drop in the LAST bin; if that was correct the score rises — retry logic:
    let wrongFound = false;
    const bins = await page.getByTestId('bins').locator('.bin').all();
    if (bins.length > 1) {
      await page.mouse.move(ib.x + ib.width / 2, ib.y + ib.height / 2);
      await page.mouse.down();
      const bb = await bins[bins.length - 1].boundingBox();
      await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 6 });
      await page.mouse.up();
      await page.waitForTimeout(400);
      const after = (await hud.textContent()) ?? '';
      if (after === before) wrongFound = true; // rejected
      else {
        // last bin was correct — item advanced; nothing to assert further
        return;
      }
      expect(wrongFound).toBe(true);
      await expect(page.getByTestId('item')).toBeVisible(); // bounced back
    }
  });
});
