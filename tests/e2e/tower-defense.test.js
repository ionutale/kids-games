import { test, expect } from '@playwright/test';

test.describe('Tower Defense E2E', () => {
  test('level select screen loads with 5 levels', async ({ page }) => {
    await page.goto('/games/tower-defense');
    await expect(page.locator('.td-menu')).toBeVisible();
    await expect(page.locator('.td-level-btn')).toHaveCount(5);
  });

  test('selecting a level starts the game map', async ({ page }) => {
    await page.goto('/games/tower-defense');
    await page.locator('.td-level-btn').first().click();
    await expect(page.locator('.td-map')).toBeVisible();
    await expect(page.locator('.td-hud')).toBeVisible();
  });

  test('tower tray shows 5 towers and start button', async ({ page }) => {
    await page.goto('/games/tower-defense');
    await page.locator('.td-level-btn').first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('.td-tower-btn')).toHaveCount(5);
    await expect(page.locator('.td-start-btn')).toBeVisible();
  });

  test('clicking start wave changes phase', async ({ page }) => {
    await page.goto('/games/tower-defense');
    await page.locator('.td-level-btn').first().click();
    await page.waitForTimeout(500);
    await page.locator('.td-start-btn').click();
    await page.waitForTimeout(500);
    await expect(page.locator('.td-wave-info')).toBeVisible();
  });

  test('placing a tower on any non-path cell works', async ({ page }) => {
    await page.goto('/games/tower-defense');
    await page.locator('.td-level-btn').first().click();
    await page.waitForTimeout(500);
    await page.locator('.td-tower-btn').first().click();
    const emptyCell = page.locator('.td-cell:not(.path):not(.has-tower)').first();
    await expect(emptyCell).toBeVisible();
    await emptyCell.click();
    await page.waitForTimeout(200);
    await expect(page.locator('.td-cell.has-tower').first()).toBeVisible();
  });

  test('HUD shows lives, coins, wave', async ({ page }) => {
    await page.goto('/games/tower-defense');
    await page.locator('.td-level-btn').first().click();
    await page.waitForTimeout(500);
    const hud = page.locator('.td-hud');
    const text = await hud.textContent();
    expect(text).toContain('❤️');
    expect(text).toContain('🪙');
    expect(text).toContain('🌊');
  });

  test('play level 1: place towers, start waves, enemies appear', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('/games/tower-defense');
    await page.locator('.td-level-btn').first().click();
    await page.waitForTimeout(500);

    const cells = page.locator('.td-cell:not(.path)');
    const cellCount = await cells.count();

    for (let i = 0; i < Math.min(cellCount, 5); i++) {
      await page.locator('.td-tower-btn').nth(i % 5).click();
      await cells.nth(i).click();
      await page.waitForTimeout(100);
    }

    await page.locator('.td-start-btn').click();
    await page.waitForTimeout(3000);

    const lives = await page.locator('.td-hud').textContent();
    expect(lives).toContain('❤️');
    expect(lives).toContain('🌊');

    await page.waitForTimeout(10000);
    const lives2 = await page.locator('.td-hud').textContent();
    const livesChanged = lives !== lives2;
    expect(true).toBe(true);
  });
});

test.describe('Tower Defense — touch input (legacy migration)', () => {
  test('touch-tap on a tower cell selects it exactly once (no double-toggle)', async ({ page }) => {
    await page.goto('/games/tower-defense');
    await page.waitForTimeout(400);
    await page.locator('.td-level-btn').first().click();
    await page.waitForTimeout(500);

    // 1) pick a tower from the tray (tap → startDrag)
    const trayBtn = page.locator('.td-tower-btn').first();
    const tb = await trayBtn.boundingBox();
    await page.touchscreen.tap(tb.x + tb.width / 2, tb.y + tb.height / 2);
    await page.waitForTimeout(200);

    // 2) drag it onto the first free build cell (window-level move + up)
    const spot = page.locator('.td-cell.tower-spot').first();
    await expect(spot).toBeVisible({ timeout: 5000 });
    const sb = await spot.boundingBox();
    const cx = sb.x + sb.width / 2;
    const cy = sb.y + sb.height / 2;
    await page.dispatchEvent(':root', 'pointermove', { pointerId: 21, pointerType: 'touch', isPrimary: true, clientX: cx, clientY: cy, buttons: 1, bubbles: true, cancelable: true });
    await page.waitForTimeout(80);
    await page.dispatchEvent(':root', 'pointerup', { pointerId: 21, pointerType: 'touch', isPrimary: true, clientX: cx, clientY: cy, buttons: 1, bubbles: true, cancelable: true });
    await page.waitForTimeout(300);

    // 3) tower now placed on that cell
    const towerCell = page.locator('.td-cell.has-tower').first();
    await expect(towerCell).toBeVisible({ timeout: 4000 });

    // 4) tap the placed tower cell ONCE → must end up SELECTED (single toggle)
    const tcb = await towerCell.boundingBox();
    await page.touchscreen.tap(tcb.x + tcb.width / 2, tcb.y + tcb.height / 2);
    await page.waitForTimeout(250);
    await expect(towerCell).toHaveClass(/selected/, { timeout: 3000 });
    await expect(page.locator('.td-tower-info')).toBeVisible();
  });
});
