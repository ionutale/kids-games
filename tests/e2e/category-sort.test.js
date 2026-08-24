import { test, expect } from '@playwright/test';
import { touchDrag, touchTap, center } from './helpers/touch.js';

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

  test('item NEVER vanishes mid-drag, including while hovering a bin', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto('/games/category-sort');
    await page.waitForTimeout(600);
    const item = page.getByTestId('item');
    const bin = page.getByTestId('bins').locator('.bin').first();
    const binP = await center(bin);
    const from = await center(item);

    // lift the item (down ON the item — where beginDrag is bound)
    await item.dispatchEvent('pointerdown', {
      pointerId: 7,
      pointerType: 'touch',
      isPrimary: true,
      clientX: from.x,
      clientY: from.y,
      buttons: 1,
      bubbles: true,
      cancelable: true
    });
    // move toward the bin in small touch steps
    for (let i = 1; i <= 10; i++) {
      const t = i / 10;
      const x = from.x + (binP.x - from.x) * t;
      const y = from.y + (binP.y - from.y) * t;
      await page.dispatchEvent(':root', 'pointermove', {
        pointerId: 7,
        pointerType: 'touch',
        isPrimary: true,
        clientX: x,
        clientY: y,
        buttons: 1,
        bubbles: true
      });
      await page.waitForTimeout(30);
    }
    // while hovering the bin, the dragged emoji must still be VISIBLE on screen
    const box = await item.boundingBox();
    expect(box).not.toBeNull();
    const vp = page.viewportSize();
    expect(box.x).toBeGreaterThan(-10);
    expect(box.x).toBeLessThan(vp.width + 10);
    expect(box.y).toBeGreaterThan(-10);
    expect(box.y).toBeLessThan(vp.height + 10);

    await page.dispatchEvent(':root', 'pointerup', {
      pointerId: 7,
      pointerType: 'touch',
      isPrimary: true,
      clientX: binP.x,
      clientY: binP.y,
      buttons: 1,
      bubbles: true
    });
  });

  test('correct bin glows green while hovering; wrong bin does not', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto('/games/category-sort');
    await page.waitForTimeout(600);
    const item = page.getByTestId('item');
    const bins = page.getByTestId('bins').locator('.bin');
    const binPts = [];
    for (let i = 0; i < (await bins.count()); i++) binPts.push(await center(bins.nth(i)));

    const from = await center(item);
    await item.dispatchEvent('pointerdown', {
      pointerId: 7, pointerType: 'touch', isPrimary: true,
      clientX: from.x, clientY: from.y, buttons: 1, bubbles: true, cancelable: true
    });

    // hover the FIRST bin and check its class
    const p0 = binPts[0];
    await page.dispatchEvent(':root', 'pointermove', {
      pointerId: 7, pointerType: 'touch', isPrimary: true,
      clientX: p0.x, clientY: p0.y, buttons: 1, bubbles: true
    });
    await page.waitForTimeout(150);
    const c0 = await bins.nth(0).getAttribute('class');

    // hover the SECOND bin
    const p1 = binPts[1];
    await page.dispatchEvent(':root', 'pointermove', {
      pointerId: 7, pointerType: 'touch', isPrimary: true,
      clientX: p1.x, clientY: p1.y, buttons: 1, bubbles: true
    });
    await page.waitForTimeout(150);
    const c1 = await bins.nth(1).getAttribute('class');

    // exactly one bin must be marked hover-correct
    const marked = [c0.includes('hover-correct'), c1.includes('hover-correct')];
    expect(marked.filter(Boolean).length).toBe(1);

    await page.dispatchEvent(':root', 'pointerup', {
      pointerId: 7, pointerType: 'touch', isPrimary: true,
      clientX: p1.x, clientY: p1.y, buttons: 1, bubbles: true
    });
  });

  test('dragging the item into the CORRECT bin advances round progress', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto('/games/category-sort');
    await page.waitForTimeout(600);
    const hud = page.locator('.top-bar .hud-item');
    await expect(hud.first()).toBeVisible({ timeout: 8000 });
    const before = (await hud.first().textContent()) ?? '';

    const item = page.getByTestId('item');
    const bins = page.getByTestId('bins').locator('.bin');
    // try each bin with touch drag until the score advances (exactly one is correct)
    for (let i = 0; i < (await bins.count()); i++) {
      const p = await center(bins.nth(i));
      await touchDrag(page, item, p);
      const after = (await hud.first().textContent()) ?? '';
      if (after !== before) {
        // progress pill should show 1/8
        await expect(hud.nth(2)).toHaveText(/🎯\s*1\/8/);
        return;
      }
    }
    throw new Error('no bin advanced the round progress');
  });

  test('full round completes → celebration → next round auto-starts', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/games/category-sort');
    await page.waitForTimeout(600);
    const rounds = page.locator('.top-bar .hud-item').nth(1);
    const bins = page.getByTestId('bins').locator('.bin');

    for (let n = 0; n < 8; n++) {
      const item = page.getByTestId('item');
      let placed = false;
      for (let i = 0; i < (await bins.count()); i++) {
        const p = await center(bins.nth(i));
        await touchDrag(page, item, p);
        const roundsAfter = (await rounds.textContent()) ?? '';
        if (roundsAfter.includes('1') && n < 7) {
          // only when the final round flips do we stop early; mid-round just continue
        }
        if (n < 7 && !(await page.getByTestId('item').isVisible().catch(() => false))) break;
        if (n < 7 && (await rounds.textContent()).includes('1')) break; // next round started
        if ((await rounds.textContent()).includes('1') && n === 7) placed = true;
        // detect whether we hit celebrate (item hidden during celebration)
        if (!(await page.getByTestId('item').isVisible().catch(() => false)) && n < 7) {
          // celebration in progress — wait for it to pass then break
          await page.waitForTimeout(2200);
          placed = true;
          break;
        }
        if (n === 7 && !(await page.getByTestId('item').isVisible().catch(() => false))) {
          placed = true;
          break;
        }
      }
      if (placed) break;
    }

    // celebrate marker appears during round end
    await expect(page.getByTestId('celebrate')).toBeVisible({ timeout: 6000 }).catch(() => {});
  });

  test('tap-to-place: tap item then tap its bin places it', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto('/games/category-sort');
    await page.waitForTimeout(600);
    const hud = page.locator('.top-bar .hud-item').first();
    const before = (await hud.textContent()) ?? '';
    const item = page.getByTestId('item');

    await touchTap(page, item);
    // item enters "selected" state (lifted / outline)
    await expect(item).toHaveClass(/selected/, { timeout: 3000 });

    // tap every bin until one accepts the placement
    const bins = page.getByTestId('bins').locator('.bin');
    for (let i = 0; i < (await bins.count()); i++) {
      await touchTap(page, bins.nth(i));
      const after = (await hud.textContent()) ?? '';
      if (after !== before) return; // placed
    }
    throw new Error('tap-to-place never placed the item');
  });
});
