import { test, expect } from '@playwright/test';

test.describe('Angry Emoji E2E', () => {
  test('level select shows 20 levels with sequential per-level unlock', async ({ page }) => {
    await page.goto('/games/angry-emoji');
    await expect(page.getByTestId('angry-root').locator('.title')).toBeVisible();
    for (let n = 1; n <= 20; n++) {
      await expect(page.getByTestId(`level-${n}`)).toBeAttached();
    }
    await expect(page.getByTestId('level-1')).toBeEnabled();
    await expect(page.getByTestId('level-2')).toBeDisabled(); // needs level 1 cleared
    await expect(page.getByTestId('level-16')).toBeDisabled();
  });

  /** Drag-and-release a slingshot shot by WORLD-space offset (scale-aware). */
  async function dragShot(page, box, wdx, wdy) {
    const scale = box.width / 900; // screen px per world px
    const sx = box.x + (150 / 900) * box.width;
    const sy = box.y + (500 / 620) * box.height;
    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.mouse.move(sx + wdx * scale, sy + wdy * scale, { steps: 6 });
    await page.mouse.up();
  }

  test('launching a shot spawns a projectile and drains ammo', async ({ page }) => {
    await page.goto('/games/angry-emoji');
    await page.getByTestId('level-1').click();
    const stage = page.getByTestId('stage');
    await expect(stage).toBeVisible();
    const box = await stage.boundingBox();

    // drag from the sling back-left (in world units), release to fire
    await dragShot(page, box, -120, 60);
    await expect(page.locator('.body.bird')).toHaveCount(1); // projectile really spawned
    const hud = page.locator('.hud-row .hud-item').nth(1);
    await expect(hud).toHaveText(/🐦\s*0/); // level 1 carries exactly 1 shot — now spent
  });

  test('releasing a backward-aimed drag cancels silently without spending ammo', async ({ page }) => {
    await page.goto('/games/angry-emoji');
    await page.getByTestId('level-1').click();
    const stage = page.getByTestId('stage');
    const box = await stage.boundingBox();
    // drag to the RIGHT of the sling (world units) — aiming behind it, AB forbids
    await dragShot(page, box, 120, -50);
    // no projectile spawned and the shot was not spent
    await expect(page.locator('.body.bird')).toHaveCount(0);
    const hud = page.locator('.hud-row .hud-item').nth(1);
    await expect(hud).toHaveText(/🐦\s*1/); // level 1 has exactly 1 shot — still there
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

  test('mid-flight tap triggers the fire bird ability on tier 3', async ({ page }) => {
    test.setTimeout(60000);
    // unlock levels 1–10 so level 11 (tier 3 opener = fire bird) is playable
    await page.goto('/games/angry-emoji');
    await page.evaluate(() => {
      const stars = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [i + 1, 1]));
      localStorage.setItem('angry-emoji-levels', JSON.stringify(stars));
    });
    await page.reload();
    await page.getByTestId('level-11').click();
    const stage = page.getByTestId('stage');
    await expect(stage).toBeVisible();
    const box = await stage.boundingBox();

    // waiting bird shows the fire bird before the first launch
    await expect(page.locator('.waiting-bird')).toHaveText('🐦‍🔥');

    // launch at the towers…
    const sx = box.x + (150 / 900) * box.width;
    const sy = box.y + (500 / 620) * box.height;
    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.mouse.move(sx - 60, sy + 30, { steps: 6 });
    await page.mouse.up();

    // the launched fire bird is in flight
    await expect(page.locator('.body.birdFire')).toHaveCount(1);

    // …then tap mid-flight: must NOT start a second drag — it detonates the
    // bird, which removes itself from the board immediately. Tap as soon as
    // the bird crosses the corridor in front of the towers (x≈520–640 world)
    // so the blast reliably catches the wood tower regardless of latency.
    await page.waitForFunction(
      () => {
        const el = document.querySelector('.body.birdFire');
        return el && parseFloat(el.style.left) > 520 && parseFloat(el.style.left) < 640;
      },
      null,
      { timeout: 4000 }
    );
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await page.mouse.down();
    await page.mouse.up();
    await expect(page.locator('.body.birdFire')).toHaveCount(0, { timeout: 2000 });

    // ammo drained exactly once (the tap was an ability, not a shot)
    const hud = page.locator('.hud-row .hud-item').nth(1);
    await expect(hud).toHaveText(/🐦\s*1/, { timeout: 3000 });

    // the blast (or its follow-through) breaks something — score climbs past 0
    const scorePill = page.locator('.hud-row .hud-item').nth(0);
    await expect
      .poll(async () => Number((await scorePill.textContent()).replace(/\D/g, '')), {
        timeout: 10000
      })
      .toBeGreaterThan(0);

    // one shot still in hand → the level keeps waiting (correct behaviour);
    // exhaust it to bring up the end overlay
    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.mouse.move(sx - 60, sy + 30, { steps: 6 });
    await page.mouse.up();
    const hudShots = page.locator('.hud-row .hud-item').nth(1);
    await expect(hudShots).toHaveText(/🐦\s*0/, { timeout: 3000 });

    // game loop healthy: plays out to its end overlay
    await expect(page.getByTestId('end-overlay')).toBeVisible({ timeout: 30000 });
  });
});
