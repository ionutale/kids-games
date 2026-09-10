import { test, expect } from '@playwright/test';

/**
 * Regression suite for the 2026-08-24 user bug reports.
 * Written TDD-style: each test encodes the EXPECTED behavior and fails
 * against the buggy implementation until fixed.
 */

test.describe('R1 — Next Level buttons work everywhere (IT locale)', () => {
  const useIT = (page) =>
    page.addInitScript(() => localStorage.setItem('kids-games-locale', 'it'));

  test('focus-tap: Prossimo ▶ advances to the next round', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await useIT(page);
    await page.goto('/games/focus-tap/play/1?seed=42');
    for (let i = 0; i < 20 && !(await page.locator('.win-overlay').isVisible().catch(() => false)); i++) {
      const t = page.locator('[data-testid="target"]:not(.popping)').first();
      await t.waitFor({ state: 'visible', timeout: 4000 }).catch(() => {});
      await t.click({ force: true }).catch(() => {});
    }
    await expect(page.locator('.win-overlay')).toBeVisible({ timeout: 10000 });
    const nextBtn = page.locator('.win-overlay a', { hasText: 'Prossimo' });
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();
    await page.waitForURL(/\/play\/2/, { timeout: 8000 });
    expect(errors).toEqual([]);
  });

  test('quick-count: Prossimo ▶ advances after winning', async ({ page }) => {
    await useIT(page);
    await page.goto('/games/quick-count/play/1?seed=5');
    for (let i = 0; i < 15; i++) {
      if (await page.locator('.win-overlay').isVisible().catch(() => false)) break;
      const pill = page.getByTestId('correct-pill');
      await expect(pill).toBeVisible({ timeout: 15000 });
      await pill.click();
      await page.waitForTimeout(420);
    }
    await expect(page.locator('.win-overlay')).toBeVisible();
    await page.locator('.win-overlay a', { hasText: 'Prossimo' }).click();
    await page.waitForURL(/\/play\/2/, { timeout: 8000 });
  });

  test('speed-match: Prossimo ▶ advances after finishing the deck', async ({ page }) => {
    await useIT(page);
    await page.goto('/games/speed-match/play/1?seed=13');
    for (let i = 0; i < 25; i++) {
      if (await page.locator('.win-overlay').isVisible().catch(() => false)) break;
      const a = page.getByTestId('emoji-a');
      await expect(a).toBeVisible({ timeout: 10000 });
      const ta = (await a.textContent()) ?? '';
      const tb = (await page.getByTestId('emoji-b').textContent()) ?? '';
      await page.getByTestId(ta === tb ? 'same-btn' : 'diff-btn').click();
      await page.waitForTimeout(200);
    }
    await expect(page.locator('.win-overlay')).toBeVisible();
    await page.locator('.win-overlay a', { hasText: 'Prossimo' }).click();
    await page.waitForURL(/\/play\/2/, { timeout: 8000 });
  });
});

test.describe('R2 — Focus Tap explicit catch / wrong feedback', () => {
  test('wrong tap shows a visible wrong-fx marker on the distractor', async ({ page }) => {
    await page.goto('/games/focus-tap/play/1?seed=42');
    await expect(page.locator('[data-testid="target"]').first()).toBeVisible({ timeout: 12000 });
    let tapped = false;
    for (let i = 0; i < 12 && !tapped; i++) {
      const d = page.locator('[data-testid="distractor"]').first();
      if (await d.isVisible().catch(() => false)) {
        await d.click({ force: true });
        tapped = true;
        break;
      }
      await page.waitForTimeout(600);
    }
    expect(tapped).toBe(true);
    // the tapped distractor must carry an explicit visual "not this" state
    await expect(page.locator('[data-testid="distractor"].wrong-fx').first()).toBeVisible();
  });

  test('correct tap shows a visible catch-fx burst on the target cell', async ({ page }) => {
    await page.goto('/games/focus-tap/play/1?seed=42');
    const t = page.locator('[data-testid="target"]').first();
    await expect(t).toBeVisible({ timeout: 12000 });
    await t.click({ force: true });
    // burst marker appears at the caught position (fx layer), then fades
    await expect(page.locator('.catch-fx').first()).toBeVisible();
  });
});

test.describe('R3 — Speed Match window bar resets every card', () => {
  test('after answering card 1, the bar drains again (width < 95%)', async ({ page }) => {
    await page.goto('/games/speed-match/play/1?seed=13');
    const bar = page.locator('.window-bar');
    await expect(bar).toBeVisible();
    // answer first card correctly
    const a = page.getByTestId('emoji-a');
    await expect(a).toBeVisible();
    const ta = (await a.textContent()) ?? '';
    const tb = (await page.getByTestId('emoji-b').textContent()) ?? '';
    await page.getByTestId(ta === tb ? 'same-btn' : 'diff-btn').click();
    // new card appears with its own draining window
    await expect(page.getByTestId('emoji-a')).toBeVisible({ timeout: 3000 });
    await page.waitForTimeout(400); // give the drain transition time to progress
    const pct = await bar.evaluate((el) => {
      const w = getComputedStyle(el).width;
      const trackW = el.parentElement.getBoundingClientRect().width || 1;
      return (parseFloat(w) / trackW) * 100;
    });
    expect(pct).toBeLessThan(95);
  });
});
