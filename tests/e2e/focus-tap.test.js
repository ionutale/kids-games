import { test, expect } from '@playwright/test';

function winOverlay(page) {
  return page.locator('.win-overlay');
}

async function jarState(page) {
  const jar = page.getByTestId('jar');
  return {
    count: Number(await jar.getAttribute('data-count')),
    goal: Number(await jar.getAttribute('data-goal'))
  };
}

function nextTarget(page) {
  return page.locator('[data-testid="target"]:not(.popping)').first();
}

async function solveRound(page, max = 90) {
  await expect(page.locator('[data-testid="target"]').first()).toBeVisible({ timeout: 15000 });
  for (let i = 0; i < max; i += 1) {
    if (await winOverlay(page).isVisible().catch(() => false)) return;
    const target = nextTarget(page);
    if (await target.isVisible().catch(() => false)) {
      await target.click({ force: true }).catch(() => {});
    }
    await page.waitForTimeout(250);
  }
}

test.describe('Focus Tap — Pond Catch E2E', () => {
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

  test('the pond renders the frog, the jar, the sign and the moon', async ({ page }) => {
    await page.goto('/games/focus-tap/play/3?seed=11');
    await expect(page.getByTestId('pond')).toBeVisible();
    await expect(page.getByTestId('stream')).toBeVisible();
    await expect(page.getByTestId('frog')).toBeVisible();
    await expect(page.getByTestId('jar')).toBeVisible();
    await expect(page.getByTestId('fireflies')).toBeVisible();
    await expect(page.locator('.moon')).toBeVisible();

    // The target is on the frog's wooden sign and repeated in the compact HUD.
    const hud = (await page.getByTestId('hud-target').textContent())?.trim();
    expect(hud).toBeTruthy();
    const sign = (await page.getByTestId('frog').locator('.sign').textContent())?.trim();
    expect(sign).toBeTruthy();
    expect(hud).toContain(sign);

    // The jar is the only progress display: no caught/goal digits anywhere.
    const { goal } = await jarState(page);
    expect(goal).toBe(9);
    await expect(page.getByTestId('jar-status')).toContainText('0 of 9');
    expect((await page.getByTestId('jar').textContent())?.trim()).toBe('');
    expect(await page.locator('.hud-item').count()).toBe(1);
    expect(await page.locator('.hud-item').first().textContent()).not.toMatch(/\d+\s*\/\s*\d+/);
  });

  test('tapping a target flicks the tongue, pops it and lights one firefly', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/games/focus-tap/play/1?seed=42');
    await expect(nextTarget(page)).toBeVisible({ timeout: 15000 });
    expect((await jarState(page)).count).toBe(0);

    // Record the transient tongue, which only lives for a few frames.
    await page.evaluate(() => {
      window.__tongueSeen = false;
      const observer = new MutationObserver(() => {
        if (document.querySelector('[data-testid="tongue"]')) window.__tongueSeen = true;
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });

    await nextTarget(page).click({ force: true });

    await expect(page.getByTestId('jar')).toHaveAttribute('data-count', '1');
    await expect(page.getByTestId('jar-status')).toContainText('1 of 7');
    await expect(page.getByTestId('catch-fx')).toBeVisible({ timeout: 2000 });
    await expect.poll(() => page.evaluate(() => window.__tongueSeen)).toBe(true);
  });

  test('tapping a distractor only wobbles it and never fills the jar', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/games/focus-tap/play/1?seed=42');
    await expect(page.locator('[data-testid="distractor"]').first()).toBeVisible({ timeout: 15000 });

    const before = (await jarState(page)).count;
    const distractor = page.locator('[data-testid="distractor"]').first();
    await distractor.click({ force: true });

    await expect(distractor).toHaveClass(/wrong/, { timeout: 1500 });
    await page.waitForTimeout(500);
    expect((await jarState(page)).count).toBe(before);
    await expect(page.getByTestId('catch-fx')).toHaveCount(0);
    await expect(page.getByTestId('tongue')).toHaveCount(0);
  });

  test('filling the jar ends the round and Next Level starts a fresh round', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('/games/focus-tap/play/1?seed=42');
    await solveRound(page);

    await expect(winOverlay(page)).toBeVisible({ timeout: 10000 });
    await expect(winOverlay(page).locator('.win-title')).toContainText('Jar full');
    const filled = await jarState(page);
    expect(filled.count).toBe(7);
    expect(filled.goal).toBe(7);
    await expect(page.getByTestId('next-level')).toBeVisible();

    await page.getByTestId('next-level').click();
    await page.waitForURL(/\/games\/focus-tap\/play\/2/);
    await expect(winOverlay(page)).toBeHidden();
    await expect(page.getByTestId('focus-tap')).toHaveAttribute('data-level', '2');
    const fresh = await jarState(page);
    expect(fresh.count).toBe(0);
    expect(fresh.goal).toBe(8);
    await expect(page.getByTestId('jar-status')).toContainText('0 of 8');
  });

  test('Replay restarts the current level with an empty jar', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('/games/focus-tap/play/2?seed=42');
    await solveRound(page);
    await expect(winOverlay(page)).toBeVisible({ timeout: 10000 });

    await page.getByTestId('replay').click();
    await expect(winOverlay(page)).toBeHidden();
    await expect(page).toHaveURL(/\/games\/focus-tap\/play\/2/);
    expect((await jarState(page)).count).toBe(0);
    await expect(page.getByTestId('jar-status')).toContainText('0 of 8');
  });

  test('playing a round saves its level', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/games/focus-tap/play/3?seed=7');
    await expect(page.getByTestId('pond')).toBeVisible();
    const saved = await page.evaluate(() => localStorage.getItem('focusTapLevel'));
    expect(saved).toBe('3');
  });

  test('a late level keeps the goal, tiers and a playable stream', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/games/focus-tap/play/10?seed=7');
    await expect(page.getByTestId('focus-tap')).toHaveAttribute('data-level', '10');
    await expect(nextTarget(page)).toBeVisible({ timeout: 15000 });
    const state = await jarState(page);
    expect(state.count).toBe(0);
    expect(state.goal).toBe(16);

    await nextTarget(page).click({ force: true });
    await expect(page.getByTestId('jar')).toHaveAttribute('data-count', '1');
  });

  test('reduced motion calms the fireflies and sparkle but stays playable', async ({ page }) => {
    test.setTimeout(60000);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/games/focus-tap/play/1?seed=42');
    await expect(page.getByTestId('pond')).toBeVisible();
    await expect(page.getByTestId('fireflies')).toHaveCount(0);

    await expect(nextTarget(page)).toBeVisible({ timeout: 15000 });
    await nextTarget(page).click({ force: true });
    await expect(page.getByTestId('jar')).toHaveAttribute('data-count', '1');
    await expect(page.getByTestId('catch-fx')).toHaveCount(0);
  });

  test('the sound toggle mutes the pond cues, not just page errors', async ({ page }) => {
    test.setTimeout(60000);
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript(() => {
      window.__tones = 0;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const create = Ctx.prototype.createOscillator;
      Ctx.prototype.createOscillator = function (...args) {
        window.__tones += 1;
        return create.apply(this, args);
      };
    });
    await page.goto('/games/focus-tap/play/1?seed=42');

    // An unmuted catch proves the counter sees the real pond cues.
    await expect(nextTarget(page)).toBeVisible({ timeout: 15000 });
    await nextTarget(page).click({ force: true });
    await expect.poll(() => page.evaluate(() => window.__tones), { timeout: 3000 }).toBeGreaterThan(0);

    await page.locator('.sound-btn').click();
    expect(
      await page.evaluate(() => JSON.parse(localStorage.getItem('kids-games-settings')).soundEnabled)
    ).toBe(false);

    await page.waitForTimeout(1000);
    await expect(nextTarget(page)).toBeVisible({ timeout: 15000 });
    const before = await page.evaluate(() => window.__tones);
    await nextTarget(page).click({ force: true });
    await expect(page.getByTestId('jar')).toHaveAttribute('data-count', '2');
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => window.__tones)).toBe(before);
    expect(errors).toEqual([]);
  });

  test('fits 320×568 and 390×844 without overflow', async ({ page }) => {
    test.setTimeout(60000);
    for (const viewport of [
      { width: 320, height: 568 },
      { width: 390, height: 844 }
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/games/focus-tap/play/1?seed=42');
      await expect(page.getByTestId('pond')).toBeVisible();
      await expect(page.getByTestId('frog')).toBeVisible();
      await expect(page.getByTestId('jar')).toBeVisible();
      await expect(page.getByTestId('hud-target')).toBeVisible();
      await expect(nextTarget(page)).toBeVisible({ timeout: 15000 });

      for (const testid of ['frog', 'jar']) {
        const box = await page.getByTestId(testid).boundingBox();
        expect(box).not.toBeNull();
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 0.5);
      }

      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      }));
      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
    }
  });
});
