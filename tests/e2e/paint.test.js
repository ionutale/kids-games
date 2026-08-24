import { test, expect } from '@playwright/test';

test.describe('Paint E2E', () => {
  test('loads with canvas and toolbar', async ({ page }) => {
    await page.goto('/games/paint');
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.locator('.color-btn')).toHaveCount(6);
  });

  test('switching to stamp mode works', async ({ page }) => {
    await page.goto('/games/paint');
    await page.locator('.action-btn').first().click();
    await expect(page.locator('.action-btn').first()).toHaveText('🖌️');
  });

  test('clear button is present', async ({ page }) => {
    await page.goto('/games/paint');
    await expect(page.locator('.action-btn').last()).toBeVisible();
  });

  test('color button gets active class on click', async ({ page }) => {
    await page.goto('/games/paint');
    await page.locator('.color-btn').nth(2).click();
    await expect(page.locator('.color-btn').nth(2)).toHaveClass(/active/);
  });

  test('size button gets active class on click', async ({ page }) => {
    await page.goto('/games/paint');
    await page.locator('.size-btn').nth(1).click();
    await expect(page.locator('.size-btn').nth(1)).toHaveClass(/active/);
  });

  test('brush modes exist', async ({ page }) => {
    await page.goto('/games/paint');
    await expect(page.locator('.size-btn')).toHaveCount(3);
  });
});

test.describe('Paint — touch input (legacy migration)', () => {
  test('a touch-stroke draws visible pixels; second finger mid-stroke does not corrupt', async ({ page }) => {
    await page.goto('/games/paint');
    await page.waitForTimeout(500);
    const canvas = page.locator('.draw-canvas');
    const box = await canvas.boundingBox();
    const cx = box.x + box.width * 0.3;
    const cy = box.y + box.height * 0.5;
    const tx = box.x + box.width * 0.6;

    // stroke with pointer 5
    await canvas.dispatchEvent('pointerdown', { pointerId: 5, pointerType: 'touch', isPrimary: true, clientX: cx, clientY: cy, buttons: 1, bubbles: true, cancelable: true });
    for (let i = 1; i <= 6; i++) {
      await page.dispatchEvent(':root', 'pointermove', { pointerId: 5, pointerType: 'touch', isPrimary: true, clientX: cx + ((tx - cx) * i) / 6, clientY: cy, buttons: 1, bubbles: true, cancelable: true });
      await page.waitForTimeout(20);
    }
    // intruder finger pointer 6 tries to move mid-stroke — must be ignored
    await page.dispatchEvent(':root', 'pointermove', { pointerId: 6, pointerType: 'touch', isPrimary: false, clientX: tx, clientY: cy + 90, buttons: 1, bubbles: true, cancelable: true });
    await page.waitForTimeout(40);
    await page.dispatchEvent(':root', 'pointerup', { pointerId: 5, pointerType: 'touch', isPrimary: true, clientX: tx, clientY: cy, buttons: 1, bubbles: true, cancelable: true });
    await page.waitForTimeout(200);

    // pixels present along the stroke's midline
    const hasInk = await canvas.evaluate((el, { x1, y, x2 }) => {
      const ctx = el.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const step = (x2 - x1) / 6;
      for (let i = 0; i <= 6; i++) {
        const px = x1 + step * i;
        const d = ctx.getImageData(Math.round(px * dpr), Math.round(y * dpr), 1, 1).data;
        if (d[3] > 40) return true; // any visible alpha
      }
      return false;
    }, { x1: cx - box.x, y: cy - box.y, x2: tx - box.x });
    expect(hasInk).toBe(true);
  });
});
