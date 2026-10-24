import { test, expect } from '@playwright/test';

const SETTINGS_KEY = 'kids-games-settings';
const SAVE_KEY = 'kids-games-stickers';

async function useAge(page, age = 3) {
  await page.addInitScript((level) => {
    localStorage.setItem('kids-games-settings', JSON.stringify({
      soundEnabled: false,
      ageLevel: level
    }));
  }, age);
}

function pointer(pointerId, x, y, buttons) {
  return {
    pointerId,
    pointerType: 'touch',
    isPrimary: true,
    clientX: x,
    clientY: y,
    buttons,
    bubbles: true,
    cancelable: true
  };
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
  const button = page.locator(`.shelf-sticker[data-sticker-type="${type}"]`);
  const box = await button.boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;

  await button.dispatchEvent('pointerdown', pointer(21, x, y, 1));
  await page.dispatchEvent(':root', 'pointermove', pointer(21, x, y - 12, 1));
  await page.dispatchEvent(':root', 'pointermove', pointer(21, point.x, point.y, 1));
  await page.dispatchEvent(':root', 'pointerup', pointer(21, point.x, point.y, 0));
}

async function dragPlacedSticker(page, point, placed = page.locator('.placed-sticker').first()) {
  const box = await placed.boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;

  await placed.dispatchEvent('pointerdown', pointer(22, x, y, 1));
  await page.dispatchEvent(':root', 'pointermove', pointer(22, point.x, point.y, 1));
  await page.dispatchEvent(':root', 'pointerup', pointer(22, point.x, point.y, 0));
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

    await page.locator('.shelf-sticker[data-sticker-type="trex"]').click();

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
});
