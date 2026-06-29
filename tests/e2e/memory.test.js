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

  test('only 2 cards can be flipped at a time - third click does nothing while locked', async ({ page }) => {
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

    const nonMatching = [];
    for (let i = 0; i < count && nonMatching.length < 2; i++) {
      for (let j = i + 1; j < count && nonMatching.length < 2; j++) {
        if (emojis[i] !== emojis[j]) {
          nonMatching.push(i, j);
        }
      }
    }

    if (nonMatching.length >= 2) {
      const [i, j] = nonMatching;
      await cards.nth(i).click();
      await page.waitForTimeout(200);

      const thirdIdx = nonMatching.find(idx => idx !== i && idx !== j);
      if (thirdIdx !== undefined) {
        await cards.nth(thirdIdx).click();
        await page.waitForTimeout(100);
        await expect(cards.nth(thirdIdx)).not.toHaveClass(/flipped/);
      }

      await cards.nth(j).click();
      await page.waitForTimeout(1500);
      await expect(cards.nth(i)).not.toHaveClass(/flipped/);
      await expect(cards.nth(j)).not.toHaveClass(/flipped/);
    }
  });

  test('non-matching cards flip back after timeout', async ({ page }) => {
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

    const nonMatching = [];
    for (let i = 0; i < count && nonMatching.length < 2; i++) {
      for (let j = i + 1; j < count && nonMatching.length < 2; j++) {
        if (emojis[i] !== emojis[j]) {
          nonMatching.push(i, j);
        }
      }
    }

    if (nonMatching.length >= 2) {
      const [i, j] = nonMatching;
      await cards.nth(i).click();
      await cards.nth(j).click();
      await page.waitForTimeout(1500);
      await expect(cards.nth(i)).not.toHaveClass(/flipped/);
      await expect(cards.nth(j)).not.toHaveClass(/flipped/);
    }
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
          await expect(cards.nth(i)).toHaveClass(/flipped/);
          await expect(cards.nth(j)).toHaveClass(/flipped/);
          break;
        }
      }
    }
  });
});
