import { test, expect } from '@playwright/test';
import { center, touchDrag, touchTap } from './helpers/touch.js';

const SAVE_KEY = 'kids-games-stickers';

async function useAge(page, age = 3) {
  await page.addInitScript((level) => {
    localStorage.setItem('kids-games-settings', JSON.stringify({
      soundEnabled: false,
      ageLevel: level
    }));
  }, age);
}

async function canvasPoint(page, fx = 0.5, fy = 0.5) {
  const box = await page.locator('.play-area').boundingBox();
  return { x: box.x + box.width * fx, y: box.y + box.height * fy };
}

async function shelfPoint(page) {
  const box = await page.locator('.shelf').boundingBox();
  return { x: box.x + box.width * 0.5, y: box.y + box.height * 0.5 };
}

async function dragShelfSticker(page, type, point) {
  await touchDrag(page, page.locator(`.shelf-sticker[data-sticker-type="${type}"]`), point);
}

async function dragPlacedSticker(page, point, placed = page.locator('.placed-sticker').first()) {
  await touchDrag(page, placed, point);
}

test.beforeEach(async ({ page }) => {
  await useAge(page);
});

test.describe('Stickers — Dino Valley slice', () => {
  test('loads the full-bleed canvas and the 8-sticker shelf', async ({ page }) => {
    await page.goto('/games/stickers');

    await expect(page.locator('.stickers-world')).toBeVisible();
    await expect(page.locator('.dino-valley')).toBeVisible();
    await expect(page.locator('.shelf-sticker')).toHaveCount(8);
    await expect(page.locator('.placed-sticker')).toHaveCount(0);
  });

  test('loads a saved scene from localStorage', async ({ page }) => {
    await page.addInitScript(({ key }) => {
      localStorage.setItem(key, JSON.stringify({
        version: 1,
        worlds: {
          'dino-valley': {
            placed: [{ id: 'p1', type: 'trex', x: 40, y: 60 }]
          }
        }
      }));
    }, { key: SAVE_KEY });

    await page.goto('/games/stickers');

    await expect(page.locator('.placed-sticker')).toHaveCount(1);
    await expect(page.locator('.placed-sticker')).toHaveAttribute('data-sticker-type', 'trex');
  });

  test('keeps one placement when saved ids collide', async ({ page }) => {
    await page.addInitScript(({ key }) => {
      localStorage.setItem(key, JSON.stringify({
        version: 1,
        worlds: {
          'dino-valley': {
            placed: [
              { id: 'dup', type: 'trex', x: 40, y: 60 },
              { id: 'dup', type: 'fern', x: 20, y: 80 }
            ]
          }
        }
      }));
    }, { key: SAVE_KEY });

    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto('/games/stickers');

    await expect(page.locator('.placed-sticker')).toHaveCount(1);
    expect(pageErrors).toEqual([]);
  });
});

test.describe('Stickers — drag, save, reset', () => {
  test('drags a sticker from the shelf to the canvas', async ({ page }) => {
    await page.goto('/games/stickers');
    const target = await canvasPoint(page, 0.5, 0.55);

    await dragShelfSticker(page, 'trex', target);

    await expect(page.locator('.placed-sticker')).toHaveCount(1);
    const box = await page.locator('.placed-sticker').boundingBox();
    expect(Math.abs(box.x + box.width / 2 - target.x)).toBeLessThan(20);
    expect(Math.abs(box.y + box.height / 2 - target.y)).toBeLessThan(20);
  });

  test('tapping the shelf does not place a sticker', async ({ page }) => {
    await page.goto('/games/stickers');

    await touchTap(page, page.locator('.shelf-sticker[data-sticker-type="trex"]'));

    await expect(page.locator('.placed-sticker')).toHaveCount(0);
  });

  test('a shelf nudge under the threshold does not place a sticker', async ({ page }) => {
    await page.goto('/games/stickers');
    const button = page.locator('.shelf-sticker[data-sticker-type="trex"]');
    const from = await center(button);

    await touchDrag(page, button, { x: from.x, y: from.y - 5 });

    await expect(page.locator('.placed-sticker')).toHaveCount(0);
  });

  test('moves a placed sticker', async ({ page }) => {
    await page.goto('/games/stickers');
    await dragShelfSticker(page, 'trex', await canvasPoint(page, 0.4, 0.5));
    await expect(page.locator('.placed-sticker')).toHaveCount(1);

    const target = await canvasPoint(page, 0.68, 0.4);
    await dragPlacedSticker(page, target);

    const box = await page.locator('.placed-sticker').boundingBox();
    expect(Math.abs(box.x + box.width / 2 - target.x)).toBeLessThan(20);
    expect(Math.abs(box.y + box.height / 2 - target.y)).toBeLessThan(20);
  });

  test('a 3px tap on a placed sticker keeps its position', async ({ page }) => {
    await page.goto('/games/stickers');
    await dragShelfSticker(page, 'trex', await canvasPoint(page, 0.5, 0.5));

    const sticker = page.locator('.placed-sticker').first();
    const before = await sticker.boundingBox();
    const from = await center(sticker);
    await touchDrag(page, sticker, { x: from.x + 3, y: from.y });
    const after = await sticker.boundingBox();

    expect(Math.abs(after.x - before.x)).toBeLessThan(1);
    expect(Math.abs(after.y - before.y)).toBeLessThan(1);
    await expect(page.locator('.placed-sticker')).toHaveCount(1);
  });

  test('clamps an out-of-range saved position on load', async ({ page }) => {
    await page.addInitScript(({ key }) => {
      localStorage.setItem(key, JSON.stringify({
        version: 1,
        worlds: {
          'dino-valley': {
            placed: [{ id: 'edge', type: 'trex', x: 0, y: 100 }]
          }
        }
      }));
    }, { key: SAVE_KEY });

    await page.goto('/games/stickers');
    const play = await page.locator('.play-area').boundingBox();
    const box = await page.locator('.placed-sticker').first().boundingBox();

    expect(box.x).toBeGreaterThanOrEqual(play.x - 1);
    expect(box.x + box.width).toBeLessThanOrEqual(play.x + play.width + 1);
    expect(box.y).toBeGreaterThanOrEqual(play.y - 1);
    expect(box.y + box.height).toBeLessThanOrEqual(play.y + play.height + 1);
  });

  test('clamps a sticker fully inside the play area at the edge', async ({ page }) => {
    await page.goto('/games/stickers');
    const play = await page.locator('.play-area').boundingBox();

    await dragShelfSticker(page, 'trex', {
      x: play.x + 2,
      y: play.y + play.height - 2
    });

    const box = await page.locator('.placed-sticker').first().boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(play.x - 1);
    expect(box.x + box.width).toBeLessThanOrEqual(play.x + play.width + 1);
    expect(box.y).toBeGreaterThanOrEqual(play.y - 1);
    expect(box.y + box.height).toBeLessThanOrEqual(play.y + play.height + 1);
  });

  test('drags a placed sticker back to the shelf to peel it', async ({ page }) => {
    await page.goto('/games/stickers');
    await dragShelfSticker(page, 'trex', await canvasPoint(page, 0.5, 0.5));
    await expect(page.locator('.placed-sticker')).toHaveCount(1);

    await dragPlacedSticker(page, await shelfPoint(page));

    await expect(page.locator('.placed-sticker')).toHaveCount(0);
  });

  test('reload restores the scene', async ({ page }) => {
    await page.goto('/games/stickers');
    await dragShelfSticker(page, 'trex', await canvasPoint(page, 0.5, 0.5));
    await expect(page.locator('.placed-sticker')).toHaveCount(1);

    await page.reload();

    await expect(page.locator('.placed-sticker')).toHaveCount(1);
  });

  test('reset asks first, cancel keeps, confirm clears', async ({ page }) => {
    await page.goto('/games/stickers');
    await dragShelfSticker(page, 'trex', await canvasPoint(page, 0.5, 0.5));
    await expect(page.locator('.placed-sticker')).toHaveCount(1);

    await page.getByTestId('reset').click();
    await expect(page.getByTestId('reset-card')).toBeVisible();
    await page.getByTestId('reset-cancel').click();
    await expect(page.getByTestId('reset-card')).toBeHidden();
    await expect(page.locator('.placed-sticker')).toHaveCount(1);

    await page.getByTestId('reset').click();
    await page.getByTestId('reset-confirm').click();
    await expect(page.getByTestId('reset-card')).toBeHidden();
    await expect(page.locator('.placed-sticker')).toHaveCount(0);

    await page.reload();
    await expect(page.locator('.placed-sticker')).toHaveCount(0);
  });

  test('reset card takes focus, cycles, and Escape keeps the scene', async ({ page }) => {
    await page.goto('/games/stickers');
    await dragShelfSticker(page, 'trex', await canvasPoint(page, 0.5, 0.5));

    const reset = page.getByTestId('reset');
    await reset.focus();
    await page.keyboard.press('Enter');

    await expect(page.getByTestId('reset-card')).toBeVisible();
    await expect(page.getByTestId('reset-confirm')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByTestId('reset-cancel')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('reset-confirm')).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('reset-card')).toBeHidden();
    await expect(page.locator('.placed-sticker')).toHaveCount(1);
    await expect(reset).toBeFocused();
  });

  test('tapping the reset backdrop keeps the scene', async ({ page }) => {
    await page.goto('/games/stickers');
    await dragShelfSticker(page, 'trex', await canvasPoint(page, 0.5, 0.5));

    await page.getByTestId('reset').click();
    await expect(page.getByTestId('reset-card')).toBeVisible();

    await page.locator('.reset-backdrop').click({ position: { x: 10, y: 10 } });

    await expect(page.getByTestId('reset-card')).toBeHidden();
    await expect(page.locator('.placed-sticker')).toHaveCount(1);
  });

  test('back saves and returns to the hub', async ({ page }) => {
    await page.goto('/games/stickers');
    await dragShelfSticker(page, 'trex', await canvasPoint(page, 0.5, 0.5));
    await expect(page.locator('.placed-sticker')).toHaveCount(1);

    await page.getByTestId('back').click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto('/games/stickers');
    await expect(page.locator('.placed-sticker')).toHaveCount(1);
  });

  test('age 2 uses the larger shelf and placed sizes', async ({ page }) => {
    await useAge(page, 2);
    await page.goto('/games/stickers');

    await expect(page.locator('.shelf-sticker')).toHaveCount(8);
    const shelfWidth = await page
      .locator('.shelf-sticker')
      .first()
      .evaluate((el) => Math.round(el.getBoundingClientRect().width));
    expect(shelfWidth).toBe(72);

    await dragShelfSticker(page, 'trex', await canvasPoint(page, 0.5, 0.5));
    await expect(page.locator('.placed-sticker')).toHaveCount(1);

    const placedWidth = await page
      .locator('.placed-sticker')
      .first()
      .evaluate((el) => Math.round(el.getBoundingClientRect().width));
    expect(placedWidth).toBe(110);
  });

  test('the soft cap shows a full cue and peeling makes room', async ({ page }) => {
    await page.addInitScript(({ key }) => {
      const placed = Array.from({ length: 80 }, (_, index) => ({
        id: `p${index}`,
        type: 'trex',
        x: 20 + (index % 10) * 6,
        y: 20 + Math.floor(index / 10) * 7
      }));
      localStorage.setItem(key, JSON.stringify({ version: 1, worlds: { 'dino-valley': { placed } } }));
    }, { key: SAVE_KEY });

    await page.goto('/games/stickers');

    await expect(page.locator('.placed-sticker')).toHaveCount(80);
    await expect(page.getByTestId('shelf-full')).toBeVisible();

    await dragShelfSticker(page, 'trex', await canvasPoint(page, 0.5, 0.5));
    await expect(page.locator('.placed-sticker')).toHaveCount(80);

    await dragPlacedSticker(page, await shelfPoint(page), page.locator('.placed-sticker').last());
    await expect(page.locator('.placed-sticker')).toHaveCount(79);
    await expect(page.getByTestId('shelf-full')).toBeHidden();

    await dragShelfSticker(page, 'trex', await canvasPoint(page, 0.5, 0.5));
    await expect(page.locator('.placed-sticker')).toHaveCount(80);
    await expect(page.getByTestId('shelf-full')).toBeVisible();
  });

  test('a horizontal shelf swipe scrolls and places nothing', async ({ page }) => {
    await page.goto('/games/stickers');

    const shelf = page.locator('.shelf-scroll');
    const box = await shelf.boundingBox();
    const start = { x: box.x + box.width - 30, y: box.y + box.height / 2 };
    const end = { x: box.x + 30, y: start.y };
    const cdp = await page.context().newCDPSession(page);

    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: start.x, y: start.y }]
    });
    for (let i = 1; i <= 8; i++) {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: start.x + ((end.x - start.x) * i) / 8, y: start.y }]
      });
      await page.waitForTimeout(16);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });

    await expect.poll(() => shelf.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    await expect(page.locator('.placed-sticker')).toHaveCount(0);
  });

  test('places and peels without page or console errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`console: ${message.text()}`);
    });

    await page.goto('/games/stickers');
    await dragShelfSticker(page, 'trex', await canvasPoint(page, 0.5, 0.55));
    await dragShelfSticker(page, 'fern', await canvasPoint(page, 0.3, 0.4));
    await expect(page.locator('.placed-sticker')).toHaveCount(2);

    await dragPlacedSticker(page, await shelfPoint(page), page.locator('.placed-sticker').first());
    await expect(page.locator('.placed-sticker')).toHaveCount(1);

    expect(errors).toEqual([]);
  });
});
