import { test, expect } from '@playwright/test';

test.describe('Tower Defense E2E', () => {
  test('level select screen loads with 5 levels', async ({ page }) => {
    await page.goto('/games/tower-defense');
    await expect(page.locator('.td-menu')).toBeVisible();
    await expect(page.locator('.td-level-btn')).toHaveCount(5);
  });

  test('selecting a level starts the game map', async ({ page }) => {
    await page.goto('/games/tower-defense');
    await page.locator('.td-level-btn').first().click();
    await expect(page.locator('.td-map')).toBeVisible();
    await expect(page.locator('.td-hud')).toBeVisible();
  });

  test('tower tray shows 5 towers and start button', async ({ page }) => {
    await page.goto('/games/tower-defense');
    await page.locator('.td-level-btn').first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('.td-tower-btn')).toHaveCount(5);
    await expect(page.locator('.td-start-btn')).toBeVisible();
  });

  test('clicking start wave changes phase', async ({ page }) => {
    await page.goto('/games/tower-defense');
    await page.locator('.td-level-btn').first().click();
    await page.waitForTimeout(500);
    await page.locator('.td-start-btn').click();
    await page.waitForTimeout(500);
    await expect(page.locator('.td-wave-info')).toBeVisible();
  });

  test('placing a tower on spot works', async ({ page }) => {
    await page.goto('/games/tower-defense');
    await page.locator('.td-level-btn').first().click();
    await page.waitForTimeout(500);
    await page.locator('.td-tower-btn').first().click();
    const towerSpot = page.locator('.td-cell.tower-spot').first();
    if (await towerSpot.isVisible()) {
      await towerSpot.click();
      await page.waitForTimeout(200);
      await expect(page.locator('.td-cell.has-tower').first()).toBeVisible();
    }
  });

  test('HUD shows lives, coins, wave', async ({ page }) => {
    await page.goto('/games/tower-defense');
    await page.locator('.td-level-btn').first().click();
    await page.waitForTimeout(500);
    const hud = page.locator('.td-hud');
    const text = await hud.textContent();
    expect(text).toContain('❤️');
    expect(text).toContain('🪙');
    expect(text).toContain('🌊');
  });
});
