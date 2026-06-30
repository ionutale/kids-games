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
  { id: 'tower-defense', name: 'Tower Defense' },
  { id: 'animal-quiz', name: 'Animal Quiz' },
];

test.describe('Direct navigation', () => {
  for (const game of games) {
    test(`navigating directly to /games/${game.id} loads correctly`, async ({ page }) => {
      const resp = await page.goto(`/games/${game.id}`, { waitUntil: 'networkidle' });
      expect(resp.status()).toBe(200);
      await expect(page).toHaveURL(`/games/${game.id}`);
      await expect(page.locator('.back-btn')).toBeVisible();
    });
  }
});
