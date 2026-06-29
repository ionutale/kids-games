import { test, expect } from '@playwright/test';

test.describe('Memory E2E', () => {
  test('loads with 8 cards for age 3', async ({ page }) => {
    await page.goto('/games/memory');
    await expect(page.locator('.card')).toHaveCount(8);
  });

  test('clicking a card flips it', async ({ page }) => {
    await page.goto('/games/memory');
    await page.locator('.card').first().click();
    await expect(page.locator('.card').first()).toHaveClass(/flipped/);
  });

  test('matched pair goes through showcase then becomes matched', async ({ page }) => {
    await page.goto('/games/memory');
    const cards = page.locator('.card');
    const count = await cards.count();

    await cards.nth(0).click();
    await page.waitForTimeout(150);

    let found = false;
    for (let j = 1; j < count && !found; j++) {
      await cards.nth(j).click();
      await page.waitForTimeout(300);

      const c = await cards.nth(0).getAttribute('class') || '';
      if (c.includes('showcasing')) {
        found = true;
        await expect(cards.nth(0)).toHaveClass(/showcasing/);
        await expect(cards.nth(j)).toHaveClass(/showcasing/);
        await page.waitForTimeout(3500);
        await expect(cards.nth(0)).toHaveClass(/matched/);
        await expect(cards.nth(j)).toHaveClass(/matched/);
        await expect(cards.nth(0)).not.toHaveClass(/showcasing/);
      } else {
        await page.waitForTimeout(1500);
      }
    }
  });

  test('non-matching cards flip back after timeout', async ({ page }) => {
    await page.goto('/games/memory');
    const cards = page.locator('.card');

    await cards.nth(0).click();
    await page.waitForTimeout(100);
    await cards.nth(1).click();
    await page.waitForTimeout(300);

    const c = await cards.nth(0).getAttribute('class') || '';
    if (!c.includes('showcasing')) {
      await page.waitForTimeout(1500);
      await expect(cards.nth(0)).not.toHaveClass(/flipped/);
      await expect(cards.nth(1)).not.toHaveClass(/flipped/);
    }
  });

  test('lock prevents extra flips during mismatch', async ({ page }) => {
    await page.goto('/games/memory');
    const cards = page.locator('.card');

    await cards.nth(0).click();
    await page.waitForTimeout(100);
    await cards.nth(1).click();
    await page.waitForTimeout(200);

    const c = await cards.nth(0).getAttribute('class') || '';
    if (!c.includes('showcasing')) {
      const c2before = await cards.nth(2).getAttribute('class') || '';
      const wasAlreadyFlipped = c2before.includes('flipped');
      await cards.nth(2).click();
      await page.waitForTimeout(100);
      const c2after = await cards.nth(2).getAttribute('class') || '';
      expect(c2after).toBe(c2before);
    }
  });
});
