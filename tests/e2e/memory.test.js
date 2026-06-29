import { test, expect } from '@playwright/test';

test.describe('Memory E2E', () => {
  test('loads with 8 cards for age 3', async ({ page }) => {
    await page.goto('/games/memory');
    await expect(page.locator('.card')).toHaveCount(8);
  });

  test('clicking a card flips it', async ({ page }) => {
    await page.goto('/games/memory');
    const card = page.locator('.card').first();
    await card.click();
    await expect(card).toHaveClass(/flipped/);
  });

  test('matching cards stay flipped', async ({ page }) => {
    await page.goto('/games/memory');
    const cards = page.locator('.card');
    const count = await cards.count();

    const emojis = [];
    for (let i = 0; i < count; i++) {
      await cards.nth(i).click();
      await page.waitForTimeout(100);
      const front = await cards.nth(i).locator('.card-front').textContent();
      emojis.push(front);
    }

    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        if (emojis[i] && emojis[i] === emojis[j]) {
          await cards.nth(i).click();
          await cards.nth(j).click();
          await page.waitForTimeout(400);
          break;
        }
      }
    }
  });
});
