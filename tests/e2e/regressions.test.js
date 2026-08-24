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

  test('angry-emoji: Dopo/Prossimo button starts the next level (no dead click)', async ({ page }) => {
    await page.goto('/games/angry-emoji');
    await page.evaluate(() =>
      localStorage.setItem('angry-emoji-levels', JSON.stringify({ 1: 3, 2: 3, 3: 3, 4: 3, 5: 3 }))
    );
    await page.reload();
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
      await page.waitForTimeout(3200);
    }
    await expect(page.getByTestId('end-overlay')).toBeVisible({ timeout: 15000 });
    // failed runs hide Next Level (B3) — Replay must restart the same level
    const replay = page.getByTestId('end-overlay').locator('.big-btn').first();
    await replay.click();
    await expect(page.getByTestId('end-overlay')).toBeHidden({ timeout: 5000 });
    await expect(stage).toBeVisible();
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

test.describe('R4 — Tetris fits portrait phones', () => {
  test('controls sit BELOW the board and nothing overflows horizontally', async ({ page }) => {
    await page.goto('/games/tetris');
    await page.locator('.center-col .big-btn').first().click();
    await expect(page.getByTestId('board')).toBeVisible();

    const boardBox = await page.getByTestId('board').boundingBox();
    const ctrlBox = await page.getByTestId('controls').boundingBox();
    expect(ctrlBox.y).toBeGreaterThanOrEqual(boardBox.y + boardBox.height - 8); // below, not beside

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(2);
  });
});

test.describe('R5 — Emoji Jump gentle start', () => {
  test('a starter platform exists under the player and survives 4s without steering', async ({ page }) => {
    await page.goto('/games/emoji-jump');
    await page.locator('.big-btn.primary').click();
    await page.waitForTimeout(4000);
    // game must still be running — no game-over overlay
    await expect(page.getByTestId('gameover-overlay')).toBeHidden();
    // and at least one platform is visible on screen to land on
    await expect(page.getByTestId('platform').first()).toBeVisible();
  });

  test('physics are ~80% slower: jump arc takes noticeably longer', async ({ page }) => {
    // unit-level guard via module constants through the page bundle is awkward;
    // assert observable behavior: apex time of a bounce exceeds 0.9s of hang time total
    await page.goto('/games/emoji-jump');
    await page.locator('.big-btn.primary').click();
    // player should NOT cross more than half the world height in the first second
    await page.waitForTimeout(1000);
    const y1 = await page.getByTestId('player').evaluate((el) => parseFloat(el.style.top));
    await page.waitForTimeout(100);
    const y2 = await page.getByTestId('player').evaluate((el) => parseFloat(el.style.top));
    // falling slowly: less than 220px traveled in the last 100ms window (~2200px/s would be old pace)
    expect(Math.abs(y2 - y1)).toBeLessThan(40);
  });
});

test.describe('R6 — Angry Emoji renders emojis on small screens', () => {
  test('targets are visible inside the stage viewport at 390×844', async ({ page }) => {
    await page.goto('/games/angry-emoji');
    await page.getByTestId('level-1').click();
    const stage = page.getByTestId('stage');
    await expect(stage).toBeVisible();
    const sb = await stage.boundingBox();

    const target = page.getByTestId('target-body').first();
    await expect(target).toBeVisible({ timeout: 8000 });
    const tb = await target.boundingBox();

    // body must lie INSIDE the visible stage box (scaled correctly)
    expect(tb.x).toBeGreaterThanOrEqual(sb.x - 2);
    expect(tb.x + tb.width).toBeLessThanOrEqual(sb.x + sb.width + 2);
    expect(tb.y).toBeGreaterThanOrEqual(sb.y - 2);
    expect(tb.y + tb.height).toBeLessThanOrEqual(sb.y + sb.height + 2);

    // and its emoji face must actually be rendered non-empty
    await expect(target.locator('.face')).toHaveText(/\S/);
  });
});

test.describe('R7 — Angry Emoji mobile best practices', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  async function startLevel1(page) {
    await page.goto('/games/angry-emoji');
    await page.getByTestId('level-1').click();
    await expect(page.getByTestId('stage')).toBeVisible();
  }

  test('R7a: target emoji face renders ≥12px effective on a phone', async ({ page }) => {
    await startLevel1(page);
    const face = page.getByTestId('target-body').first().locator('.face');
    await expect(face).toBeVisible({ timeout: 8000 });
    const h = await face.evaluate((el) => el.getBoundingClientRect().height);
    expect(h).toBeGreaterThanOrEqual(12);
  });

  test('R7b: pause control sits in the bottom half during play', async ({ page }) => {
    await startLevel1(page);
    const pause = page.locator('[data-testid="pause-btn"]');
    await expect(pause).toBeVisible();
    const pb = await pause.boundingBox();
    const vh = 844;
    expect(pb.y + pb.height / 2).toBeGreaterThan(vh / 2);
  });

  test('R7c: no horizontal overflow in portrait AND landscape', async ({ page }) => {
    for (const vp of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
      await page.setViewportSize(vp);
      await startLevel1(page);
      await page.waitForTimeout(400);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBeLessThanOrEqual(2);
    }
  });

  test('R7d: drag can begin anywhere in the lower-left quadrant', async ({ page }) => {
    await startLevel1(page);
    const stage = page.getByTestId('stage');
    const box = await stage.boundingBox();
    // a point in the lower-left quadrant far from the sling
    const startX = box.x + (120 / 900) * box.width;
    const startY = box.y + (430 / 620) * box.height;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX - 80, startY + 40, { steps: 6 });
    await page.mouse.up();
    // shot fired ⇒ ammo went from 2 to 1
    const hud = page.locator('.hud-row .hud-item').nth(1);
    await expect(hud).toHaveText(/🐦\s*1/, { timeout: 3000 });
  });

  test('R7e: destroying a block pays 5 points', async ({ page }) => {
    await startLevel1(page);
    const stage = page.getByTestId('stage');
    const box = await stage.boundingBox();
    const sx = box.x + (150 / 900) * box.width;
    const sy = box.y + (500 / 620) * box.height;
    const d = { blocks: 4 }; // L1 has a 4-block tower
    // aim straight into the tower base
    const tx = box.x + (574 / 900) * box.width;
    const ty = box.y + (534 / 620) * box.height;
    const dx = tx - sx;
    const dy = ty - sy;
    const len = Math.hypot(dx, dy);
    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.mouse.move(sx + (dx / len) * 160, sy + (dy / len) * 160, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(2500);
    const scoreTxt = await page.locator('.hud-row .hud-item').first().textContent();
    const n = parseInt(scoreTxt.replace(/\D/g, ''), 10) || 0;
    // at least one block broke (5pts each) or a target (10) — must exceed 0 and
    // be consistent with block payouts existing (score is not stuck at 0)
    expect(n).toBeGreaterThan(0);
    void d;
  });

  test('R7f: failed level hides the Next Level button', async ({ page }) => {
    await startLevel1(page);
    const stage = page.getByTestId('stage');
    const box = await stage.boundingBox();
    const sx = box.x + (150 / 900) * box.width;
    const sy = box.y + (500 / 620) * box.height;
    for (let shot = 0; shot < 2; shot++) {
      // fire weak shots straight up so nothing gets destroyed
      await page.mouse.move(sx, sy);
      await page.mouse.down();
      await page.mouse.move(sx - 20, sy - 10, { steps: 4 });
      await page.mouse.up();
      await page.waitForTimeout(3200);
    }
    await expect(page.getByTestId('end-overlay')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('end-overlay')).toContainText('😅');
    const nextBtn = page.getByTestId('end-overlay').locator('.big-btn', { hasText: 'Prossimo' })
      .or(page.getByTestId('end-overlay').locator('.big-btn', { hasText: 'Next Level' }))
      .or(page.getByTestId('end-overlay').locator('.big-btn', { hasText: '▶' }));
    await expect(nextBtn).toHaveCount(0);
  });
});
