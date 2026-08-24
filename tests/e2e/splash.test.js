import { test, expect } from '@playwright/test';

test.describe('Splash E2E', () => {
  test('loads with game area', async ({ page }) => {
    await page.goto('/games/splash');
    await expect(page.locator('.splash-game')).toBeVisible();
  });

  test('tapping creates burst effects', async ({ page }) => {
    await page.goto('/games/splash');
    await page.locator('.splash-game').click({ position: { x: 150, y: 300 } });
    await page.waitForTimeout(300);
    const count = await page.locator('.splash').count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('repeated tapping creates more effects', async ({ page }) => {
    await page.goto('/games/splash');
    const game = page.locator('.splash-game');
    for (let i = 0; i < 3; i++) {
      await game.click({ position: { x: 100 + i * 50, y: 200 + i * 50 } });
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(200);
    const count = await page.locator('.splash').count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('particles disappear after elimination timeout', async ({ page }) => {
    await page.goto('/games/splash');
    await page.locator('.splash-game').click({ position: { x: 150, y: 300 } });
    await page.waitForTimeout(4000);
    const count = await page.locator('.splash').count();
    expect(count).toBe(0);
  });

  test('dark gradient background', async ({ page }) => {
    await page.goto('/games/splash');
    const bg = await page.locator('.game-shell').evaluate(el => getComputedStyle(el).background);
    expect(bg).toContain('gradient');
  });
});

test.describe('Splash — touch input (legacy migration)', () => {
  test('a single touch-tap creates splashes exactly ONCE (no double-fire)', async ({ page }) => {
    await page.goto('/games/splash');
    await page.waitForTimeout(500);
    const area = page.locator('.splash-game');
    const box = await area.boundingBox();
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;

    // one touch tap via CDP touchscreen (fires pointer events + compatibility mouse)
    await page.touchscreen.tap(x, y);
    await page.waitForTimeout(120);

    // a single tap must produce exactly ONE burst, not two (mousedown+touchstart)
    const burst = await page.locator('.splash').count();
    expect(burst).toBe(6); // ageLevel 3 → 6 splashes per burst
  });

  test('touch-drag sprinkles splashes along the path', async ({ page }) => {
    await page.goto('/games/splash');
    await page.waitForTimeout(500);
    const area = page.locator('.splash-game');
    const box = await area.boundingBox();
    const x0 = box.x + box.width * 0.2;
    const y0 = box.y + box.height * 0.5;
    const x1 = box.x + box.width * 0.8;
    const y1 = box.y + box.height * 0.5;

    await area.dispatchEvent('pointerdown', {
      pointerId: 9, pointerType: 'touch', isPrimary: true,
      clientX: x0, clientY: y0, buttons: 1, bubbles: true, cancelable: true
    });
    for (let i = 1; i <= 8; i++) {
      const cx = x0 + ((x1 - x0) * i) / 8;
      await page.dispatchEvent(':root', 'pointermove', {
        pointerId: 9, pointerType: 'touch', isPrimary: true,
        clientX: cx, clientY: y0, buttons: 1, bubbles: true, cancelable: true
      });
      await page.waitForTimeout(25);
    }
    await page.dispatchEvent(':root', 'pointerup', {
      pointerId: 9, pointerType: 'touch', isPrimary: true,
      clientX: x1, clientY: y1, buttons: 1, bubbles: true, cancelable: true
    });
    await page.waitForTimeout(150);
    const count = await page.locator('.splash').count();
    expect(count).toBeGreaterThan(6); // more than a single burst → drag sprinkled
  });
});
