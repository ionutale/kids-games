import { test, expect } from '@playwright/test';

test.describe('Stickers — Dino Valley slice', () => {
  test('loads the full-bleed canvas and the 8-sticker shelf', async ({ page }) => {
    await page.goto('/games/stickers');

    await expect(page.locator('.stickers-world')).toBeVisible();
    await expect(page.locator('.dino-valley')).toBeVisible();
    await expect(page.locator('.shelf-sticker')).toHaveCount(8);
    await expect(page.locator('.placed-sticker')).toHaveCount(0);
  });

  test('loads a saved scene from localStorage', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('kids-games-stickers', JSON.stringify({
        version: 1,
        worlds: {
          'dino-valley': {
            placed: [{ id: 'p1', type: 'trex', x: 40, y: 60 }]
          }
        }
      }));
    });

    await page.goto('/games/stickers');

    await expect(page.locator('.placed-sticker')).toHaveCount(1);
    await expect(page.locator('.placed-sticker')).toHaveAttribute('data-sticker-type', 'trex');
  });
});
