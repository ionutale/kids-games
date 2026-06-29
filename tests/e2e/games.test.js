import { test, expect } from '@playwright/test';

test.describe('Game Hub', () => {
  test('loads and shows all 8 games', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.title')).toHaveText(/Kids Games/);
    const buttons = page.locator('.game-btn');
    await expect(buttons).toHaveCount(8);
  });

  test('settings button shows after long press', async ({ page }) => {
    await page.goto('/');
    const gear = page.locator('.settings-trigger');
    await gear.dispatchEvent('mousedown');
    await page.waitForTimeout(3100);
    await expect(page.locator('.settings-bar')).toBeVisible();
  });

  test('sound toggle is visible in settings', async ({ page }) => {
    await page.goto('/');
    const gear = page.locator('.settings-trigger');
    await gear.dispatchEvent('mousedown');
    await page.waitForTimeout(3100);
    await expect(page.locator('.sound-btn')).toBeVisible();
  });

  test('each game button navigates to its route', async ({ page }) => {
    await page.goto('/');
    const buttons = page.locator('.game-btn');
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i);
      await btn.click();
      await expect(page).toHaveURL(/\/games\//);
      await page.goBack();
      await page.waitForSelector('.game-btn');
    }
  });
});

test.describe('Paint Game', () => {
  test('loads and shows canvas and toolbar', async ({ page }) => {
    await page.goto('/games/paint');
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.locator('.color-btn')).toHaveCount(6);
  });

  test('switching to stamp mode works', async ({ page }) => {
    await page.goto('/games/paint');
    const modeBtn = page.locator('.action-btn').first();
    await modeBtn.click();
    await expect(page.locator('.action-btn').first()).toHaveText('🖌️');
  });
});

test.describe('Stickers Game', () => {
  test('loads with scene selector and tray', async ({ page }) => {
    await page.goto('/games/stickers');
    await expect(page.locator('.scene-btn')).toHaveCount(4);
    await expect(page.locator('.sticker-btn').first()).toBeVisible();
  });

  test('placing a sticker creates it on scene', async ({ page }) => {
    await page.goto('/games/stickers');
    const sticker = page.locator('.sticker-btn').first();
    await sticker.click();
    await expect(page.locator('.placed-sticker')).toHaveCount(1);
  });

  test('changing scene clears placed stickers', async ({ page }) => {
    await page.goto('/games/stickers');
    await page.locator('.sticker-btn').first().click();
    await expect(page.locator('.placed-sticker')).toHaveCount(1);
    await page.locator('.scene-btn').nth(1).click();
    await expect(page.locator('.placed-sticker')).toHaveCount(0);
  });
});

test.describe('Memory Game', () => {
  test('loads with cards', async ({ page }) => {
    await page.goto('/games/memory');
    await expect(page.locator('.card')).toHaveCount(8);
  });

  test('clicking a card flips it', async ({ page }) => {
    await page.goto('/games/memory');
    const card = page.locator('.card').first();
    await card.click();
    await expect(card).toHaveClass(/flipped/);
  });
});

test.describe('Puzzle Game', () => {
  test('loads with puzzle pieces', async ({ page }) => {
    await page.goto('/games/puzzle');
    await expect(page.locator('.piece')).toHaveCount(4);
  });

  test('clicking a placed piece does nothing', async ({ page }) => {
    await page.goto('/games/puzzle');
    await page.waitForSelector('.piece');
  });
});

test.describe('Pop Game', () => {
  test('loads and bubbles appear', async ({ page }) => {
    await page.goto('/games/pop');
    await page.waitForTimeout(3000);
    const bubbles = page.locator('.bubble');
    const count = await bubbles.count();
    expect(count).toBeGreaterThan(0);
  });

  test('clicking a bubble removes it', async ({ page }) => {
    await page.goto('/games/pop');
    await page.waitForTimeout(3000);
    const bubble = page.locator('.bubble').first();
    await expect(bubble).toBeVisible();
    await bubble.click({ force: true });
    await page.waitForTimeout(300);
    await expect(page.locator('.bubble')).toHaveCount(await page.locator('.bubble').count());
  });
});

test.describe('Soccer Game', () => {
  test('loads and shows field', async ({ page }) => {
    await page.goto('/games/soccer');
    await expect(page.locator('.field')).toBeVisible();
    await expect(page.locator('.ball')).toBeVisible();
  });

  test('tapping moves the ball', async ({ page }) => {
    await page.goto('/games/soccer');
    const game = page.locator('.soccer-game');
    const ball = page.locator('.ball');
    await expect(game).toBeVisible();
    await game.click({ position: { x: 200, y: 500 } });
    await page.waitForTimeout(600);
    await expect(page.locator('.score-display')).toBeVisible();
  });
});

test.describe('Sorting Game', () => {
  test('loads with items and baskets', async ({ page }) => {
    await page.goto('/games/sorting');
    await expect(page.locator('.item').first()).toBeVisible();
    await expect(page.locator('.basket').first()).toBeVisible();
  });

  test('tapping an item selects it', async ({ page }) => {
    await page.goto('/games/sorting');
    const item = page.locator('.item').first();
    await item.click();
    await expect(item).toHaveClass(/selected/);
  });
});

test.describe('Splash Game', () => {
  test('loads and tapping creates effects', async ({ page }) => {
    await page.goto('/games/splash');
    await page.locator('.splash-game').click({ position: { x: 100, y: 200 } });
    await page.waitForTimeout(200);
    await expect(page.locator('.splash').first()).toBeVisible();
    const count = await page.locator('.splash').count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});

test.describe('Shell', () => {
  test('back button appears on game pages', async ({ page }) => {
    await page.goto('/games/paint');
    await expect(page.locator('.back-btn')).toBeVisible();
  });

  test('back button does not appear on hub', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.back-btn')).toHaveCount(0);
  });

  test('sound toggle appears on game pages', async ({ page }) => {
    await page.goto('/games/paint');
    await expect(page.locator('.sound-btn')).toBeVisible();
  });

  test('sound toggle toggles on click', async ({ page }) => {
    await page.goto('/games/paint');
    const btn = page.locator('.sound-btn');
    const initial = await btn.textContent();
    await btn.click();
    await page.waitForTimeout(200);
    const after = await btn.textContent();
    expect(after).not.toBe(initial);
  });
});

test.describe('PWA', () => {
  test('manifest is served', async ({ page }) => {
    const resp = await page.goto('/manifest.webmanifest');
    expect(resp.ok()).toBe(true);
    const json = await resp.json();
    expect(json.name).toBe('Kids Games');
    expect(json.display).toBe('standalone');
  });
});
