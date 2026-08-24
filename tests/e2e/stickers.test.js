import { test, expect } from '@playwright/test';

test.describe('Stickers E2E', () => {
  test('loads with scene selector and sticker tray', async ({ page }) => {
    await page.goto('/games/stickers');
    await expect(page.locator('.scene-btn')).toHaveCount(4);
    await expect(page.locator('.sticker-btn').first()).toBeVisible();
  });

  test('clicking a sticker places it on the scene', async ({ page }) => {
    await page.goto('/games/stickers');
    await page.locator('.sticker-btn').first().click();
    await expect(page.locator('.placed-sticker')).toHaveCount(1);
  });

  test('stickers persist when changing scene', async ({ page }) => {
    await page.goto('/games/stickers');
    await page.locator('.sticker-btn').first().click();
    await expect(page.locator('.placed-sticker')).toHaveCount(1);
    await page.locator('.scene-btn').nth(1).click();
    await expect(page.locator('.placed-sticker')).toHaveCount(1);
  });

  test('clear button removes all stickers', async ({ page }) => {
    await page.goto('/games/stickers');
    await page.locator('.sticker-btn').first().click();
    await page.locator('.sticker-btn').nth(1).click();
    await expect(page.locator('.placed-sticker')).toHaveCount(2);
    await page.locator('.clear-btn').click();
    await expect(page.locator('.placed-sticker')).toHaveCount(0);
  });

  test('kid taps many stickers and changes scenes randomly', async ({ page }) => {
    await page.goto('/games/stickers');
    const stickerCount = await page.locator('.sticker-btn').count();
    const sceneCount = await page.locator('.scene-btn').count();
    let placedCount = 0;

    for (let round = 0; round < 3; round++) {
      const randomSticker = Math.floor(Math.random() * stickerCount);
      const btn = page.locator('.sticker-btn').nth(randomSticker);
      await btn.scrollIntoViewIfNeeded();
      await btn.click({ force: true });
      await page.waitForTimeout(200);

      const randomScene = Math.floor(Math.random() * sceneCount);
      await page.locator('.scene-btn').nth(randomScene).click();
      await page.waitForTimeout(100);
    }

    placedCount = await page.locator('.placed-sticker').count();
    expect(placedCount).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Stickers — touch input (legacy migration)', () => {
  test('touch-drag a placed sticker moves it to the drop point', async ({ page }) => {
    await page.goto('/games/stickers');
    await page.waitForTimeout(500);
    // place a sticker from the tray (tap)
    await page.touchscreen.tap(
      (await page.locator('.tray .sticker-btn, .tray button').first().boundingBox()).x +
        (await page.locator('.tray .sticker-btn, .tray button').first().boundingBox()).width / 2,
      (await page.locator('.tray .sticker-btn, .tray button').first().boundingBox()).y +
        (await page.locator('.tray .sticker-btn, .tray button').first().boundingBox()).height / 2
    );
    await page.waitForTimeout(150);
    const st = page.locator('.placed-sticker').first();
    await expect(st).toBeVisible();

    // touch-drag it to the right side of the scene
    const area = page.locator('.scene-area');
    const ab = await area.boundingBox();
    const from = await st.boundingBox();
    const fx = from.x + from.width / 2;
    const fy = from.y + from.height / 2;
    const tx = ab.x + ab.width * 0.85;
    const ty = ab.y + ab.height * 0.3;

    await st.dispatchEvent('pointerdown', { pointerId: 11, pointerType: 'touch', isPrimary: true, clientX: fx, clientY: fy, buttons: 1, bubbles: true, cancelable: true });
    for (let i = 1; i <= 8; i++) {
      const cx = fx + ((tx - fx) * i) / 8;
      const cy = fy + ((ty - fy) * i) / 8;
      await page.dispatchEvent(':root', 'pointermove', { pointerId: 11, pointerType: 'touch', isPrimary: true, clientX: cx, clientY: cy, buttons: 1, bubbles: true, cancelable: true });
      await page.waitForTimeout(25);
    }
    await page.dispatchEvent(':root', 'pointerup', { pointerId: 11, pointerType: 'touch', isPrimary: true, clientX: tx, clientY: ty, buttons: 1, bubbles: true, cancelable: true });
    await page.waitForTimeout(200);

    const moved = await st.boundingBox();
    const movedCenterX = moved.x + moved.width / 2;
    expect(Math.abs(movedCenterX - tx)).toBeLessThan(20);
  });
});
