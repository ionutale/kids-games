import { test, expect } from '@playwright/test';

test.describe('Angry Emoji E2E', () => {
  test('level select shows 20 levels with locked upper tiers', async ({ page }) => {
    await page.goto('/games/angry-emoji');
    await expect(page.getByTestId('angry-root').locator('.title')).toBeVisible();
    for (let n = 1; n <= 20; n++) {
      await expect(page.getByTestId(`level-${n}`)).toBeAttached();
    }
    await expect(page.getByTestId('level-1')).toBeEnabled();
    await expect(page.getByTestId('level-6')).toBeDisabled(); // tier 2 locked
    await expect(page.getByTestId('level-16')).toBeDisabled(); // tier 4 locked
  });

  test('launching a shot spawns a projectile and drains ammo', async ({ page }) => {
    await page.goto('/games/angry-emoji');
    await page.getByTestId('level-1').click();
    const stage = page.getByTestId('stage');
    await expect(stage).toBeVisible();
    const box = await stage.boundingBox();

    // drag from the sling area back-left, release to fire
    const sx = box.x + (150 / 900) * box.width;
    const sy = box.y + (500 / 620) * box.height;
    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.mouse.move(sx - 90, sy + 50, { steps: 8 });
    await page.mouse.up();
    const hud = page.locator('.hud-row .hud-item').nth(1);
    await expect(hud).toHaveText(/🐦\s*1/); // 2 → 1 shot used
  });

  test('exhausting shots ends the level with an end overlay', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/games/angry-emoji');
    await page.getByTestId('level-1').click();
    const stage = page.getByTestId('stage');
    const box = await stage.boundingBox();
    const sx = box.x + (150 / 900) * box.width;
    const sy = box.y + (500 / 620) * box.height;
    for (let shot = 0; shot < 2; shot++) {
      await page.mouse.move(sx, sy);
      await page.mouse.down();
      await page.mouse.move(sx - 60, sy + 40, { steps: 6 });
      await page.mouse.up();
      await page.waitForTimeout(3500); // settle
    }
    await expect(page.getByTestId('end-overlay')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.big-btn.primary')).toBeVisible(); // replay offered
  });

  test('best stars persist across reloads', async ({ page }) => {
    await page.goto('/games/angry-emoji');
    await page.evaluate(() =>
      localStorage.setItem('angry-emoji-levels', JSON.stringify({ 1: 3 }))
    );
    await page.reload();
    const stars = await page.getByTestId('level-1').locator('.mini-stars').textContent();
    expect(stars).toContain('★');
  });
});
