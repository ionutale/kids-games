import { test, expect } from '@playwright/test';

const games = [
  { id: 'paint', name: 'Paint' },
  { id: 'stickers', name: 'Stickers' },
  { id: 'memory', name: 'Memory' },
  { id: 'puzzle', name: 'Puzzle' },
  { id: 'pop', name: 'Pop' },
  { id: 'soccer', name: 'Soccer' },
  { id: 'sorting', name: 'Sorting' },
  { id: 'splash', name: 'Splash' },
  { id: 'animal-quiz', name: 'Animal Quiz' },
];

test.describe('Direct navigation', () => {
  for (const game of games) {
    test(`navigating directly to /games/${game.id} loads correctly`, async ({ page }) => {
      const resp = await page.goto(`/games/${game.id}`, { waitUntil: 'networkidle' });
      expect(resp.status()).toBe(200);
      await expect(page).toHaveURL(`/games/${game.id}`);
      if (game.id === 'stickers') {
        await expect(page.locator('.stickers-world')).toBeVisible();
        await expect(page.getByTestId('back')).toBeVisible();
      } else {
        await expect(page.locator('.back-btn')).toBeVisible();
      }
    });
  }
});
