import { test, expect } from '@playwright/test';

const ROOT = '[data-testid="pop-root"]';
const POND = '[data-testid="pop-pond"]';
const JAR = '[data-testid="pop-jar"]';

/** A touch-originated pointer event, matching the app's phone path. */
function PE(x, y, extra = {}) {
  return {
    pointerId: 7,
    pointerType: 'touch',
    isPrimary: true,
    clientX: x,
    clientY: y,
    buttons: 1,
    bubbles: true,
    cancelable: true,
    ...extra
  };
}

async function startRound(page) {
  const box = await page.getByTestId('pop-pond').boundingBox();
  if (!box) throw new Error('pond has no box');
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.getByTestId('pop-root')).toHaveAttribute('data-state', 'playing');
}

async function tapBubble(page, bubble) {
  const box = await bubble.boundingBox();
  if (!box) return false;
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  return true;
}

/**
 * The first bubble whose centre is actually inside the pond. Newly spawned
 * bubbles start below the clipped water edge, so tapping the raw `.first()`
 * can land on the level ladder underneath.
 */
async function bubbleInPond(page) {
  const pond = await page.getByTestId('pop-pond').boundingBox();
  const count = await page.locator('.bubble').count();
  for (let i = 0; i < count; i += 1) {
    const bubble = page.locator('.bubble').nth(i);
    const box = await bubble.boundingBox();
    if (!box) continue;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    if (cx > pond.x && cx < pond.x + pond.width && cy > pond.y + 8 && cy < pond.y + pond.height - 8) {
      return bubble;
    }
  }
  return null;
}

/** Swipe across the pond through the given viewport points. */
async function swipe(page, points) {
  await page.locator(POND).dispatchEvent('pointerdown', PE(points[0].x, points[0].y));
  for (const point of points.slice(1)) {
    await page.dispatchEvent(':root', 'pointermove', PE(point.x, point.y));
    await page.waitForTimeout(24);
  }
  const last = points[points.length - 1];
  await page.dispatchEvent(':root', 'pointerup', PE(last.x, last.y));
  await page.waitForTimeout(60);
}

async function centerOf(page, locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('no box');
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function filled(page) {
  return Number(await page.locator(JAR).getAttribute('data-filled'));
}

test.describe('Pop — the Rising Pond', () => {
  test('opens as a calm pond with a jar, a moon and the ladder', async ({ page }) => {
    await page.goto('/games/pop');
    const root = page.getByTestId('pop-root');
    await expect(root).toHaveAttribute('data-state', 'ready');
    await expect(root).toHaveAttribute('data-level', '1');
    await expect(root).toHaveAttribute('data-target', '6');
    await expect(page.getByTestId('pop-pond')).toBeVisible();
    await expect(page.getByTestId('pop-jar')).toBeVisible();
    await expect(page.getByTestId('pop-moon')).toBeVisible();
    await expect(page.getByTestId('pop-hint')).toContainText('Tap the pond');
    await expect(page.locator('.ladder-step')).toHaveCount(10);
    await expect(page.locator(JAR)).toHaveAttribute('aria-label', /Jar: 0 of 6/);
    // No digits are drawn on the play surface: the only live region is the
    // screen-reader status, and the moon carries no visible label.
    await expect(root.locator('[role="status"]')).toHaveCount(1);
    await expect(page.getByTestId('pop-status')).toHaveText(/Tap the pond/);
  });

  test('the first tap starts the round and bubbles rise carrying surprises', async ({ page }) => {
    await page.goto('/games/pop');
    await expect(page.locator('.bubble')).toHaveCount(0);
    await startRound(page);
    await expect(page.locator('.bubble')).toHaveCount(3);
    await expect(page.getByTestId('pop-hint')).toContainText('Tap or swipe');
    // Bubbles rise: a bubble's top moves up over half a second.
    const first = page.locator('.bubble').first();
    const before = await first.getAttribute('data-id');
    const y1 = (await first.boundingBox()).y;
    await page.waitForTimeout(600);
    const y2 = (await first.boundingBox()).y;
    expect(y2).toBeLessThan(y1);
    expect(await first.getAttribute('data-id')).toBe(before);
  });

  test('tapping a bubble bursts it, leaves a ripple and fills the jar', async ({ page }) => {
    await page.goto('/games/pop');
    await startRound(page);
    const bubble = await bubbleInPond(page);
    await expect(bubble).toBeVisible();
    const id = await bubble.getAttribute('data-id');
    await tapBubble(page, bubble);
    await expect(page.locator(`.bubble[data-id="${id}"]`)).toHaveCount(0);
    const count = await filled(page);
    expect(count).toBeGreaterThanOrEqual(1);
    await expect(page.getByTestId('pop-status')).toContainText(`Jar: ${count} of 6`);
    await expect(page.locator(JAR)).toHaveAttribute('aria-label', new RegExp(`Jar: ${count} of 6`));
    expect(await page.getByTestId('ripple').count()).toBeGreaterThanOrEqual(1);
    await expect(page.getByTestId('ripple')).toHaveCount(0, { timeout: 1500 });
  });

  test('a swipe pops every bubble the finger crosses in one chain', async ({ page }) => {
    await page.goto('/games/pop');
    await startRound(page);
    await expect(page.locator('.bubble')).toHaveCount(3);
    const first = page.locator('.bubble').nth(0);
    const second = page.locator('.bubble').nth(1);
    const a = await centerOf(page, first);
    const b = await centerOf(page, second);
    await swipe(page, [
      a,
      { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      b
    ]);
    expect(await filled(page)).toBeGreaterThanOrEqual(2);
    await expect(page.getByTestId('pop-status')).toHaveText(/Jar: [2-6] of 6/);
  });

  test('a giant bubble cracks on the first tap and bursts on the second', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('popLevel', '3'));
    await page.goto('/games/pop?seed=7');
    await startRound(page);

    const giant = page.locator('.bubble[data-type="giant"]').first();
    await expect(giant).toBeVisible();
    const id = await giant.getAttribute('data-id');
    const before = await filled(page);

    await tapBubble(page, giant);
    await page.waitForTimeout(120);
    const cracked = page.locator(`.bubble[data-id="${id}"]`);
    await expect(cracked).toHaveAttribute('data-cracked', 'true');
    expect(await filled(page)).toBe(before);

    await tapBubble(page, cracked);
    await page.waitForTimeout(120);
    await expect(page.locator(`.bubble[data-id="${id}"]`)).toHaveCount(0);
    expect(await filled(page)).toBe(before + 2);
  });

  test('a star bubble leaves a sticker on the jar and counts two', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('popLevel', '6'));
    await page.goto('/games/pop?seed=7');
    await startRound(page);

    const star = page.locator('.bubble[data-type="star"]').first();
    await expect(star).toBeVisible();
    await tapBubble(page, star);
    await page.waitForTimeout(120);
    await expect(page.locator(JAR)).toHaveAttribute('data-sticker', 'true');
    await expect(page.getByTestId('pop-sticker')).toBeVisible();
    expect(await filled(page)).toBe(2);
  });

  test('filling the jar wins the level with the ladder actions', async ({ page }) => {
    await page.goto('/games/pop');
    await startRound(page);

    const win = page.getByTestId('pop-win');
    for (let i = 0; i < 80; i += 1) {
      if (await win.isVisible()) break;
      const bubble = await bubbleInPond(page);
      if (bubble) await tapBubble(page, bubble);
      await page.waitForTimeout(130);
    }

    await expect(win).toBeVisible();
    await expect(win.locator('.win-title')).toContainText('Jar full');
    await expect(win.getByTestId('next-level')).toBeVisible();
    await expect(win.getByTestId('replay')).toBeVisible();
    await page.getByTestId('next-level').click();
    await expect(page.getByTestId('pop-root')).toHaveAttribute('data-level', '2');
    await expect(page.getByTestId('pop-root')).toHaveAttribute('data-state', 'ready');
  });

  test('when the moon sets first the calm Good Try card offers try again or back', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-01-01T00:00:00') });
    await page.goto('/games/pop');
    await startRound(page);
    await page.clock.runFor(31_000);

    const card = page.getByTestId('pop-card');
    await expect(card).toBeVisible();
    await expect(card).toContainText('Good try');
    await expect(page.locator('.win-overlay')).toHaveCount(0);
    await expect(page.locator(JAR)).toHaveAttribute('data-sticker', 'false');
    await expect(page.getByTestId('pop-back')).toBeVisible();
    await expect(page.getByTestId('pop-jar')).not.toHaveAttribute('data-filled', '6');

    await card.getByRole('button', { name: 'Try Again' }).click();
    await expect(page.getByTestId('pop-root')).toHaveAttribute('data-state', 'playing');
    await expect(page.getByTestId('pop-card')).toHaveCount(0);
  });

  test('the Good Try card clears a star sticker collected earlier', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-01-01T00:00:00') });
    await page.addInitScript(() => localStorage.setItem('popLevel', '6'));
    await page.goto('/games/pop?seed=7');
    await startRound(page);

    const star = page.locator('.bubble[data-type="star"]').first();
    await expect(star).toBeVisible();
    await tapBubble(page, star);
    await expect(page.locator(JAR)).toHaveAttribute('data-sticker', 'true');
    expect(await filled(page)).toBe(2);

    await page.clock.runFor(31_000);
    await expect(page.getByTestId('pop-card')).toBeVisible();
    await expect(page.locator(JAR)).toHaveAttribute('data-sticker', 'false');
    await expect(page.getByTestId('pop-sticker')).toHaveCount(0);
  });

  test('level 10 shows the mastered ladder, target 15 and a mastery win', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('popLevel', '10');
      localStorage.setItem('popMastered', '1');
    });
    await page.goto('/games/pop');
    const root = page.getByTestId('pop-root');
    await expect(root).toHaveAttribute('data-level', '10');
    await expect(root).toHaveAttribute('data-target', '15');
    await expect(page.locator('.ladder-step').nth(9)).toHaveText('🎓');
    await expect(page.getByTestId('pop-types')).toContainText('Giant bubble');
    await expect(page.getByTestId('pop-types')).toContainText('Star bubble');

    await startRound(page);
    const win = page.getByTestId('pop-win');
    for (let i = 0; i < 160; i += 1) {
      if (await win.isVisible()) break;
      const bubble = await bubbleInPond(page);
      if (bubble) await tapBubble(page, bubble);
      await page.waitForTimeout(90);
    }

    await expect(win).toBeVisible();
    await expect(win.locator('.win-title')).toContainText('Jar full');
    await expect(win.getByTestId('ladder-done')).toHaveText('🎓');
    await expect(win.getByTestId('next-level')).toHaveCount(0);
    await expect(win.getByTestId('replay')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('popMastered'))).toBe('1');
  });

  test('reduced motion keeps the win card usable but drops the celebration layers', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/games/pop');
    await startRound(page);

    const win = page.getByTestId('pop-win');
    for (let i = 0; i < 120; i += 1) {
      if (await win.isVisible()) break;
      const bubble = await bubbleInPond(page);
      if (bubble) await tapBubble(page, bubble);
      await page.waitForTimeout(110);
    }

    await expect(win).toBeVisible();
    await expect(win.locator('.win-title')).toContainText('Jar full');
    await expect(win.locator('.confetti-container')).toBeHidden();
    await expect(win.locator('.starfield')).toBeVisible();
    await expect(win.getByTestId('replay')).toBeVisible();
  });

  test('picking a level saves it, resets to ready and unlocks the later types', async ({ page }) => {
    await page.goto('/games/pop');
    await page.locator('.ladder-step').nth(5).click();
    await expect(page.getByTestId('pop-root')).toHaveAttribute('data-level', '6');
    await expect(page.getByTestId('pop-root')).toHaveAttribute('data-state', 'ready');
    await expect(page.getByTestId('pop-root')).toHaveAttribute('data-target', '11');
    expect(await page.evaluate(() => localStorage.getItem('popLevel'))).toBe('6');
    await expect(page.getByTestId('pop-types')).toContainText('Star bubble');

    await page.locator('.ladder-step').nth(2).click();
    await expect(page.getByTestId('pop-root')).toHaveAttribute('data-level', '3');
    await expect(page.getByTestId('pop-root')).toHaveAttribute('data-target', '8');
    await expect(page.getByTestId('pop-types')).toContainText('Giant bubble');
    await expect(page.getByTestId('pop-types')).not.toContainText('Star bubble');
  });

  test('the sound toggle mutes the pond cues, not just page errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    // Count scheduled oscillators so muting is proven, not assumed.
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
    await page.goto('/games/pop');
    await startRound(page);

    // An unmuted spawn cue proves the counter sees real pond sound.
    await expect.poll(() => page.evaluate(() => window.__tones), { timeout: 2500 }).toBeGreaterThan(0);

    await page.locator('.sound-btn').click();
    expect(
      await page.evaluate(() => JSON.parse(localStorage.getItem('kids-games-settings')).soundEnabled)
    ).toBe(false);

    const before = await page.evaluate(() => window.__tones);
    let bubble = null;
    for (let i = 0; i < 25 && !bubble; i += 1) {
      bubble = await bubbleInPond(page);
      if (!bubble) await page.waitForTimeout(100);
    }
    expect(bubble).not.toBeNull();
    await tapBubble(page, bubble);
    expect(await filled(page)).toBeGreaterThanOrEqual(1);
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => window.__tones)).toBe(before);
    expect(errors).toEqual([]);
  });

  test('reduced motion calms the fireflies, bobbing and ripples but stays playable', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/games/pop');
    await startRound(page);
    await expect(page.locator('.bubble')).toHaveCount(3);
    await expect(page.getByTestId('fireflies')).toHaveCount(0);
    const animation = await page
      .locator('.bubble')
      .first()
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(animation).toBe('none');

    await tapBubble(page, page.locator('.bubble').first());
    expect(await filled(page)).toBeGreaterThanOrEqual(1);
    await expect(page.getByTestId('ripple')).toHaveCount(0);
  });

  test('fits 320×568 and 390×844 with reachable bubbles and no overflow', async ({ page }) => {
    for (const viewport of [
      { width: 320, height: 568 },
      { width: 390, height: 844 }
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/games/pop');
      await expect(page.getByTestId('pop-pond')).toBeVisible();
      await expect(page.getByTestId('pop-jar')).toBeVisible();
      await expect(page.getByTestId('pop-moon')).toBeVisible();
      await expect(page.locator('.ladder-bar')).toBeVisible();
      await expect(page.locator('.ladder-step')).toHaveCount(10);
      const steps = page.locator('.ladder-step');
      const ladderTops = new Set();
      for (let i = 0; i < 10; i += 1) {
        const step = steps.nth(i);
        await expect(step).toBeVisible();
        const box = await step.boundingBox();
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 0.5);
        expect(box.width).toBeGreaterThanOrEqual(24);
        ladderTops.add(Math.round(box.y));
      }
      // The game header has room for one row; only a narrow win card wraps.
      expect(ladderTops.size).toBe(1);

      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth
      }));
      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.innerWidth + 1);

      await startRound(page);
      await expect(page.locator('.bubble')).toHaveCount(3);
      const pond = await page.getByTestId('pop-pond').boundingBox();
      for (let i = 0; i < 3; i += 1) {
        const box = await page.locator('.bubble').nth(i).boundingBox();
        const cx = box.x + box.width / 2;
        const cy = box.y + box.height / 2;
        expect(cx).toBeGreaterThan(pond.x);
        expect(cx).toBeLessThan(pond.x + pond.width);
        expect(cy).toBeGreaterThan(pond.y);
        expect(cy).toBeLessThan(pond.y + pond.height);
      }
    }
  });

  test('leaving the pond mid-round returns to the hub cleanly', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/games/pop');
    await startRound(page);
    await page.goto('/');
    await expect(page.locator('.hub')).toBeVisible();
    expect(errors).toEqual([]);
  });
});
