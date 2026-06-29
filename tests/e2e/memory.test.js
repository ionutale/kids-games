import { test, expect } from '@playwright/test';

test.describe('Memory E2E', () => {
  test('loads with cards', async ({ page }) => {
    await page.goto('/games/memory');
    const count = await page.locator('.card').count();
    expect(count).toBeGreaterThan(0);
  });

  test('clicking a card flips it', async ({ page }) => {
    await page.goto('/games/memory');
    await page.locator('.card').first().click();
    await expect(page.locator('.card').first()).toHaveClass(/flipped/);
  });

  test('level indicator shows current level', async ({ page }) => {
    await page.goto('/games/memory');
    await expect(page.locator('.level-label')).toHaveText(/Level/);
  });

  test('matched pair triggers win overlay with Next Level button', async ({ page }) => {
    await page.goto('/games/memory');
    const cards = page.locator('.card');
    const count = await cards.count();

    await cards.nth(0).click();
    await page.waitForTimeout(150);

    let foundMatch = false;
    for (let j = 1; j < count && !foundMatch; j++) {
      await cards.nth(j).click();
      await page.waitForTimeout(300);
      const c = await cards.nth(0).getAttribute('class') || '';
      if (c.includes('showcasing')) {
        foundMatch = true;
        await page.waitForTimeout(3500);
        await expect(page.locator('.win-overlay')).toBeVisible();
        await expect(page.locator('.next-btn')).toBeVisible();
      }
    }
  });

  test('level dots show progression', async ({ page }) => {
    await page.goto('/games/memory');
    await expect(page.locator('.level-dot')).toHaveCount(10);
  });
});
