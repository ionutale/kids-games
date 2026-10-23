import { test, expect } from '@playwright/test';
import { getSplashBudget } from '../../src/lib/splash/budget.js';

async function useAge(page, age) {
  await page.addInitScript((level) => {
    localStorage.setItem('kids-games-settings', JSON.stringify({
      soundEnabled: false,
      ageLevel: level
    }));
  }, age);
}

async function touchDrag(page, { steps = 40, stepMs = 50 } = {}) {
  const area = page.locator('.splash-game');
  const box = await area.boundingBox();
  if (!box) throw new Error('splash surface not found');

  const x0 = box.x + box.width * 0.2;
  const y0 = box.y + box.height * 0.5;
  let last = { x: x0, y: y0 };

  await area.dispatchEvent('pointerdown', {
    pointerId: 9, pointerType: 'touch', isPrimary: true,
    clientX: x0, clientY: y0, buttons: 1, bubbles: true, cancelable: true
  });

  for (let i = 1; i <= steps; i++) {
    const progress = i / steps;
    const x = box.x + box.width * (0.2 + 0.6 * progress);
    const y = box.y + box.height * (0.5 + Math.sin(progress * Math.PI * 4) * 0.2);
    last = { x, y };
    await page.dispatchEvent(':root', 'pointermove', {
      pointerId: 9, pointerType: 'touch', isPrimary: true,
      clientX: x, clientY: y, buttons: 1, bubbles: true, cancelable: true
    });
    await page.waitForTimeout(stepMs);
  }

  await page.dispatchEvent(':root', 'pointerup', {
    pointerId: 9, pointerType: 'touch', isPrimary: true,
    clientX: last.x, clientY: last.y, buttons: 0, bubbles: true, cancelable: true
  });
}

test.describe('Splash E2E', () => {
  test('loads with game area', async ({ page }) => {
    await useAge(page, 3);
    await page.goto('/games/splash');
    await expect(page.locator('.splash-game')).toBeVisible();
  });

  test('a tap emits one age-3 burst', async ({ page }) => {
    const budget = getSplashBudget(3);
    await useAge(page, 3);
    await page.goto('/games/splash');

    await page.locator('.splash-game').click({ position: { x: 150, y: 300 } });
    await expect(page.locator('.splash')).toHaveCount(budget.perBurst);
  });

  test('a tap emits one age-2 burst', async ({ page }) => {
    const budget = getSplashBudget(2);
    await useAge(page, 2);
    await page.goto('/games/splash');

    await page.locator('.splash-game').click({ position: { x: 150, y: 300 } });
    await expect(page.locator('.splash')).toHaveCount(budget.perBurst);
  });

  test('a long age-3 drag stays within the cap', async ({ page }) => {
    const budget = getSplashBudget(3);
    await useAge(page, 3);
    await page.goto('/games/splash');

    await touchDrag(page);

    const count = await page.locator('.splash').count();
    expect(count).toBeLessThanOrEqual(budget.cap);
    expect(count).toBeGreaterThanOrEqual(Math.floor(budget.cap * 0.6));
  });

  test('a long age-2 drag stays within the cap', async ({ page }) => {
    const budget = getSplashBudget(2);
    await useAge(page, 2);
    await page.goto('/games/splash');

    await touchDrag(page, { steps: 40, stepMs: 50 });

    const count = await page.locator('.splash').count();
    expect(count).toBeLessThanOrEqual(budget.cap);
    expect(count).toBeGreaterThanOrEqual(Math.floor(budget.cap * 0.6));
  });

  test('particles disappear after their lifetime', async ({ page }) => {
    const budget = getSplashBudget(3);
    await useAge(page, 3);
    await page.goto('/games/splash');

    await page.locator('.splash-game').click({ position: { x: 150, y: 300 } });
    await expect(page.locator('.splash')).toHaveCount(0, {
      timeout: budget.lifetimeMs + 1000
    });
  });

  test('dark gradient background', async ({ page }) => {
    await useAge(page, 3);
    await page.goto('/games/splash');
    const bg = await page.locator('.game-shell').evaluate(el => getComputedStyle(el).background);
    expect(bg).toContain('gradient');
  });

  test('debug HUD appears only with ?debug=1', async ({ page }) => {
    await useAge(page, 3);

    await page.goto('/games/splash');
    await expect(page.locator('.debug-hud')).toHaveCount(0);

    await page.goto('/games/splash?debug=1');
    const hud = page.locator('.debug-hud');
    await expect(hud).toBeVisible();
    await expect(hud).toContainText('live 0/40');
    await expect(hud).toContainText(/FPS —/);

    await page.locator('.splash-game').click({ position: { x: 150, y: 300 } });

    await expect(hud).toContainText('live 3/40');
    await expect(hud).toContainText('peak 3/40');
    await expect(hud).toContainText(/FPS \d/);
  });
});

test.describe('Splash — touch input', () => {
  test('a single touch-tap creates one burst, not two', async ({ page }) => {
    const budget = getSplashBudget(3);
    await useAge(page, 3);
    await page.goto('/games/splash');
    await page.waitForTimeout(500);

    const area = page.locator('.splash-game');
    const box = await area.boundingBox();
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;

    await page.touchscreen.tap(x, y);
    await page.waitForTimeout(120);

    await expect(page.locator('.splash')).toHaveCount(budget.perBurst);
  });

  test('touch-drag sprinkles along the path and stays under the cap', async ({ page }) => {
    const budget = getSplashBudget(3);
    await useAge(page, 3);
    await page.goto('/games/splash');
    await page.waitForTimeout(500);

    await touchDrag(page, { steps: 20, stepMs: 50 });

    const count = await page.locator('.splash').count();
    expect(count).toBeGreaterThan(budget.perBurst);
    expect(count).toBeLessThanOrEqual(budget.cap);
  });
});
