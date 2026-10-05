import { test, expect } from '@playwright/test';

async function solveRound(page, max = 45) {
  await expect(page.locator('[data-testid="target"]').first()).toBeVisible({ timeout: 15000 });
  for (let i = 0; i < max; i++) {
    if (await page.locator('.win-overlay').isVisible().catch(() => false)) return;
    const t = page.locator('[data-testid="target"]:not(.popping)').first();
    if (await t.isVisible().catch(() => false)) {
      await t.click({ force: true }).catch(() => {});
    }
    await page.waitForTimeout(400);
  }
}

test.describe('Focus Tap E2E', () => {
  test('landing shows hero + play link and the ladder bar', async ({ page }) => {
    await page.goto('/games/focus-tap');
    await expect(page.locator('.ladder-step')).toHaveCount(10);
    await expect(page.locator('.big-btn.primary')).toBeVisible();
    const href = await page.locator('.big-btn.primary').getAttribute('href');
    expect(href).toMatch(/\/games\/focus-tap\/play\/\d+/);
  });

  test('play route without level redirects to saved level', async ({ page }) => {
    await page.goto('/games/focus-tap/play');
    await page.waitForURL(/\/games\/focus-tap\/play\/\d+/);
  });

  test('full round: distractor silent, targets reach goal, win overlay, next level', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('/games/focus-tap/play/1?seed=42');

    // wait for stream to produce items
    await expect(page.locator('[data-testid="target"]').first()).toBeVisible({ timeout: 15000 });
    const counter = page.getByTestId('stream').locator('xpath=following-sibling::*').first();

    // find a distractor while at least one target floats; tap it; score unchanged
    let distractorTapped = false;
    for (let i = 0; i < 10 && !distractorTapped; i++) {
      const d = page.locator('[data-testid="distractor"]').first();
      if (await d.isVisible().catch(() => false)) {
        const before = await page.locator('.hud-item').nth(1).textContent();
        await d.click({ force: true, trial: false }).catch(() => {});
        await page.waitForTimeout(400);
        const after = await page.locator('.hud-item').nth(1).textContent();
        expect(after).toBe(before); // silent wobble never scores
        distractorTapped = true;
        break;
      }
      await page.waitForTimeout(700);
    }

    // tap targets until the win overlay appears (forced-target rule guarantees supply)
    await solveRound(page);

    await expect(page.locator('.win-overlay')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('next-level')).toBeVisible();

    await page.getByTestId('next-level').click();
    await page.waitForURL(/\/games\/focus-tap\/play\/2/);
  });

  test('Next Level loads a fresh round for the new level (no stale board)', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('/games/focus-tap/play/1?seed=42');
    await solveRound(page);
    await expect(page.locator('.win-overlay')).toBeVisible({ timeout: 10000 });

    await page.getByTestId('next-level').click();
    await page.waitForURL(/\/games\/focus-tap\/play\/2/);
    await expect(page.locator('.win-overlay')).toBeHidden();
    // level 2 goal is 8: a fresh round starts at 0/8
    await expect(page.locator('.hud-item').nth(1)).toHaveText(/0\/8/);
  });

  test('Replay restarts the current level with a fresh round', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('/games/focus-tap/play/2?seed=42');
    await solveRound(page);
    await expect(page.locator('.win-overlay')).toBeVisible({ timeout: 10000 });

    await page.getByTestId('replay').click();
    await expect(page.locator('.win-overlay')).toBeHidden();
    await expect(page.locator('.hud-item').nth(1)).toHaveText(/0\/8/);
    await expect(page).toHaveURL(/\/games\/focus-tap\/play\/2/);
  });

  test('playing a round saves its level', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/games/focus-tap/play/3?seed=7');
    await expect(page.locator('.hud-item').first()).toBeVisible();
    const saved = await page.evaluate(() => localStorage.getItem('focusTapLevel'));
    expect(saved).toBe('3');
  });

  test('tapping a distractor wobbles it in place instead of teleporting it', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/games/focus-tap/play/1?seed=42');

    // Wait until a distractor is floating in the middle band, where a reset of
    // the rise animation (the old bug) would move it by hundreds of pixels.
    await page.waitForFunction(() => {
      const el = document.querySelector('[data-testid="distractor"]');
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.top > 180 && r.bottom < window.innerHeight - 180;
    }, null, { timeout: 20000 });

    const d = page.locator('[data-testid="distractor"]').first();
    const before = await d.boundingBox();
    await d.click({ force: true });
    await page.waitForTimeout(150);
    const after = await d.boundingBox();
    expect(after).not.toBeNull();
    const beforeCy = before.y + before.height / 2;
    const afterCy = after.y + after.height / 2;
    expect(Math.abs(afterCy - beforeCy)).toBeLessThan(60);
  });

  test('the catch burst appears where the emoji was tapped', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/games/focus-tap/play/1?seed=42');
    await expect(page.locator('[data-testid="target"]').first()).toBeVisible({ timeout: 15000 });

    // Record the target's rect at pointerdown — the exact moment the burst is anchored.
    await page.evaluate(() => {
      window.__tapRect = null;
      document.addEventListener(
        'pointerdown',
        (e) => {
          const el = e.target && e.target.closest ? e.target.closest('[data-testid="target"]') : null;
          if (el && !window.__tapRect) window.__tapRect = el.getBoundingClientRect().toJSON();
        },
        true
      );
    });

    const t = page.locator('[data-testid="target"]:not(.popping)').first();
    await t.click({ force: true });

    const tapRect = await page.evaluate(() => window.__tapRect);
    expect(tapRect).not.toBeNull();
    const fx = page.locator('[data-testid="catch-fx"]');
    await expect(fx).toBeVisible({ timeout: 3000 });
    const fxBox = await fx.boundingBox();
    const targetCx = tapRect.left + tapRect.width / 2;
    const targetCy = tapRect.top + tapRect.height / 2;
    const fxCx = fxBox.x + fxBox.width / 2;
    const fxCy = fxBox.y + fxBox.height / 2;
    expect(Math.abs(fxCx - targetCx)).toBeLessThan(25);
    expect(Math.abs(fxCy - targetCy)).toBeLessThan(25);
  });
});
