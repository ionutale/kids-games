import { test, expect } from '@playwright/test';
import { center, touchDrag, touchTap } from './helpers/touch.js';

const SETTINGS_KEY = 'kids-games-settings';
const PAINT_KEY = 'kids-games-paint';
const LOCALE_KEY = 'kids-games-locale';

// Dino Valley ships a 390x844 artboard; the studio displays it with
// preserveAspectRatio="xMidYMid slice", so tests can map art coords to client
// coords for any viewport without reading component internals.
const ART = { width: 390, height: 844 };

/**
 * The shared touch helper always starts a drag at the center of its item.
 * Region work needs an arbitrary start point, so this replays the exact same
 * pointer-event shape (touch, primary, window-level move/up) from `from`.
 */
const POINTER = (x, y) => ({
  pointerId: 11,
  pointerType: 'touch',
  isPrimary: true,
  clientX: x,
  clientY: y,
  buttons: 1,
  bubbles: true,
  cancelable: true
});

async function useAge(page, age = 3) {
  await page.addInitScript(
    ([key, level]) => {
      localStorage.setItem(
        key,
        JSON.stringify({ soundEnabled: false, ageLevel: level })
      );
    },
    [SETTINGS_KEY, age]
  );
}

async function openPaint(page) {
  await page.goto('/games/paint');
  const canvas = page.getByTestId('paint-canvas');
  await expect(page.locator('.studio')).toBeVisible();
  await expect(canvas).toBeVisible();
  await expect
    .poll(() => canvas.evaluate((el) => el.width))
    .toBeGreaterThan(1);
  return canvas;
}

function artToClient(artX, artY, width = 390, height = 844) {
  const scale = Math.max(width / ART.width, height / ART.height);
  return {
    x: (width - ART.width * scale) / 2 + artX * scale,
    y: (height - ART.height * scale) / 2 + artY * scale
  };
}

async function touchStroke(page, canvas, from, to, steps = 10) {
  await canvas.dispatchEvent('pointerdown', POINTER(from.x, from.y));
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    await page.dispatchEvent(
      ':root',
      'pointermove',
      POINTER(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t)
    );
  }
  await page.dispatchEvent(':root', 'pointerup', POINTER(to.x, to.y));
  await page.waitForTimeout(120);
}

async function tapAt(page, point) {
  await page.touchscreen.tap(point.x, point.y);
  await page.waitForTimeout(140);
}

/** Alpha of one canvas pixel; point is in viewport/client coordinates. */
async function alphaAt(canvas, point) {
  return canvas.evaluate((el, p) => {
    const rect = el.getBoundingClientRect();
    const dpr = el.width / rect.width;
    const px = Math.round((p.x - rect.left) * dpr);
    const py = Math.round((p.y - rect.top) * dpr);
    if (px < 0 || py < 0 || px >= el.width || py >= el.height) return 0;
    return el.getContext('2d').getImageData(px, py, 1, 1).data[3];
  }, point);
}

/** True when any pixel within `radius` CSS px of the point has paint. */
async function hasPaintNear(canvas, point, radius = 4) {
  return canvas.evaluate(
    (el, { p, r }) => {
      const rect = el.getBoundingClientRect();
      const dpr = el.width / rect.width;
      const cx = Math.round((p.x - rect.left) * dpr);
      const cy = Math.round((p.y - rect.top) * dpr);
      const span = Math.round(r * dpr);
      const ctx = el.getContext('2d');
      for (let dy = -span; dy <= span; dy += 1) {
        for (let dx = -span; dx <= span; dx += 1) {
          const px = cx + dx;
          const py = cy + dy;
          if (px < 0 || py < 0 || px >= el.width || py >= el.height) continue;
          if (ctx.getImageData(px, py, 1, 1).data[3] > 0) return true;
        }
      }
      return false;
    },
    { p: point, r: radius }
  );
}

async function inkCount(canvas) {
  return canvas.evaluate((el) => {
    const data = el.getContext('2d').getImageData(0, 0, el.width, el.height).data;
    let count = 0;
    for (let i = 3; i < data.length; i += 40) {
      if (data[i] > 20) count += 1;
    }
    return count;
  });
}

async function readPaint(page) {
  return page.evaluate((key) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, PAINT_KEY);
}

async function pickSheet(page, id) {
  await page.getByTestId('paper-chip').click();
  await expect(page.getByTestId('paper-tray')).toBeVisible();
  await page.getByTestId(`paper-${id}`).click();
  await expect(page.getByTestId('paper-tray')).toBeHidden();
}

async function openPalette(page) {
  await page.getByTestId('paint-dock').locator('.well').click();
  await expect(page.getByTestId('paint-palette')).toBeVisible();
}

async function fillRegion(page, artX, artY, width, height) {
  await page.getByTestId('paint-bucket').click();
  await tapAt(page, artToClient(artX, artY, width, height));
}

/** Geometry of the visible paper cards, in DOM order. */
async function trayCardBoxes(page) {
  return page.locator('.cards button').evaluateAll((nodes) =>
    nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return {
        id: node.dataset.testid,
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    })
  );
}

const ALL_SHEET_IDS = [
  'blank',
  'dino-valley',
  'butterfly-garden',
  'under-the-sea',
  'farm',
  'space',
  'jungle',
  'arctic',
  'castle',
  'vehicles',
  'princesses',
  'snow',
  'ocean',
  'robot'
];
const AGE2_SHEET_IDS = ALL_SHEET_IDS.filter((id) => id !== 'butterfly-garden');

test.describe('Paint — full-bleed studio', () => {
  test.beforeEach(async ({ page }) => {
    await useAge(page);
  });

  test('loads full-bleed at 390x844 with paper, canvas, dock and chips', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`console: ${message.text()}`);
    });

    await openPaint(page);

    await expect(page.locator('.game-shell')).toHaveCount(0);

    const studio = await page.locator('.studio').boundingBox();
    expect(Math.round(studio.width)).toBe(390);
    expect(Math.round(studio.height)).toBe(844);
    const paper = await page.locator('.paper').boundingBox();
    expect(Math.round(paper.width)).toBe(390);
    expect(Math.round(paper.height)).toBe(844);

    const canvas = page.getByTestId('paint-canvas');
    const box = await canvas.boundingBox();
    expect(Math.round(box.width)).toBe(390);
    expect(Math.round(box.height)).toBe(844);

    // The paint canvas is capped at DPR 2 for memory; the backing store must
    // still be high-DPI sized, not CSS-sized.
    const backing = await canvas.evaluate((el) => ({
      width: el.width,
      height: el.height,
      cssWidth: el.getBoundingClientRect().width,
      cssHeight: el.getBoundingClientRect().height,
      dpr: window.devicePixelRatio
    }));
    expect(backing.width).toBe(Math.round(backing.cssWidth * Math.min(backing.dpr, 2)));
    expect(backing.height).toBe(Math.round(backing.cssHeight * Math.min(backing.dpr, 2)));

    await expect(page.getByTestId('paint-dock')).toBeVisible();
    await expect(page.getByTestId('back')).toBeVisible();
    await expect(page.getByTestId('paper-chip')).toBeVisible();
    await expect(page.getByTestId('paint-clear')).toBeVisible();
    await expect(page.locator('.sound-btn')).toBeVisible();

    // Blank paper: no bucket (coloring only), nothing to undo yet.
    await expect(page.getByTestId('paint-bucket')).toHaveCount(0);
    await expect(page.getByTestId('paint-undo')).toBeDisabled();

    expect(errors).toEqual([]);
  });

  test('draws, undoes, redraws, and keeps the blank sheet through reload and the hub', async ({ page }) => {
    const canvas = await openPaint(page);
    const start = await center(canvas);
    const end = { x: start.x + 120, y: start.y - 40 };
    const midpoint = { x: start.x + 60, y: start.y - 20 };

    await touchDrag(page, canvas, end);
    expect(await inkCount(canvas)).toBeGreaterThan(0);
    expect(await alphaAt(canvas, midpoint)).toBeGreaterThan(0);
    await expect(page.getByTestId('paint-undo')).toBeEnabled();

    await page.getByTestId('paint-undo').click();
    await expect.poll(() => inkCount(canvas)).toBe(0);
    await expect(page.getByTestId('paint-undo')).toBeDisabled();

    await touchDrag(page, canvas, end);
    expect(await inkCount(canvas)).toBeGreaterThan(0);

    await page.reload();
    const restored = page.getByTestId('paint-canvas');
    await expect.poll(() => alphaAt(restored, midpoint)).toBeGreaterThan(0);
    const saved = await readPaint(page);
    expect(saved.version).toBe(1);
    expect(saved.activeSheet).toBe('blank');
    expect(saved.sheets.blank.strokes.length).toBe(1);

    await page.getByTestId('back').click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto('/games/paint');
    const reentered = page.getByTestId('paint-canvas');
    await expect.poll(() => alphaAt(reentered, midpoint)).toBeGreaterThan(0);
  });

  test('eraser strokes persist through reload and leave the rest of the paint', async ({ page }) => {
    const canvas = await openPaint(page);
    const painted = { x: 140, y: 320 };
    const erased = { x: 230, y: 320 };
    const survivor = { x: 160, y: 320 };

    await touchStroke(page, canvas, painted, { x: 320, y: 320 });
    await expect.poll(() => alphaAt(canvas, erased)).toBeGreaterThan(0);
    await expect.poll(() => alphaAt(canvas, survivor)).toBeGreaterThan(0);

    await page.getByTestId('paint-eraser').click();
    await touchStroke(page, canvas, { x: 230, y: 270 }, { x: 230, y: 370 });

    await expect.poll(() => alphaAt(canvas, erased)).toBe(0);
    await expect.poll(() => alphaAt(canvas, survivor)).toBeGreaterThan(0);
    await expect.poll(() => alphaAt(canvas, { x: 300, y: 320 })).toBeGreaterThan(0);

    await page.reload();
    const restored = page.getByTestId('paint-canvas');
    await expect.poll(() => alphaAt(restored, erased)).toBe(0);
    await expect.poll(() => alphaAt(restored, survivor)).toBeGreaterThan(0);
    await expect(page.getByTestId('paint-undo')).toBeDisabled();

    const saved = await readPaint(page);
    const strokes = saved.sheets.blank.strokes;
    expect(strokes.some((stroke) => stroke.color === 'erase')).toBe(true);
    expect(strokes.some((stroke) => stroke.color !== 'erase')).toBe(true);
  });

  test('the clear card traps focus, cancels with Escape, and clears only the open sheet', async ({ page }) => {
    const canvas = await openPaint(page);
    const strokePoint = { x: 230, y: 320 };
    await touchStroke(page, canvas, { x: 140, y: 320 }, { x: 320, y: 320 });
    await expect.poll(() => alphaAt(canvas, strokePoint)).toBeGreaterThan(0);

    // Give another sheet its own artwork so "current sheet only" is provable.
    await pickSheet(page, 'dino-valley');
    await fillRegion(page, 303, 118);
    await expect(page.locator('[data-region="sun"]')).toHaveAttribute('fill', '#FF6B6B');
    await pickSheet(page, 'blank');
    await expect.poll(() => alphaAt(page.getByTestId('paint-canvas'), strokePoint)).toBeGreaterThan(0);

    const clearChip = page.getByTestId('paint-clear');
    await clearChip.click();
    await expect(page.getByTestId('clear-card')).toBeVisible();

    // Focus enters the card on the safe (cancel) action and cycles inside it.
    await expect(page.getByTestId('clear-cancel')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('clear-confirm')).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByTestId('clear-cancel')).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('clear-card')).toBeHidden();
    await expect(clearChip).toBeFocused();
    await expect.poll(() => alphaAt(page.getByTestId('paint-canvas'), strokePoint)).toBeGreaterThan(0);

    // Explicit cancel keeps the drawing too.
    await clearChip.click();
    await page.getByTestId('clear-cancel').click();
    await expect(page.getByTestId('clear-card')).toBeHidden();
    await expect.poll(() => alphaAt(page.getByTestId('paint-canvas'), strokePoint)).toBeGreaterThan(0);

    await clearChip.click();
    await page.getByTestId('clear-confirm').click();
    await expect(page.getByTestId('clear-card')).toBeHidden();
    await expect.poll(() => inkCount(page.getByTestId('paint-canvas'))).toBe(0);
    await expect(clearChip).toBeFocused();

    // The Dino Valley fill is untouched by clearing the blank sheet.
    await pickSheet(page, 'dino-valley');
    await expect(page.locator('[data-region="sun"]')).toHaveAttribute('fill', '#FF6B6B');

    await page.reload();
    await expect(page.locator('[data-outline="volcano"]')).toBeVisible();
    await pickSheet(page, 'blank');
    await expect.poll(() => inkCount(page.getByTestId('paint-canvas'))).toBe(0);
  });

  test('paper tray marks the current sheet, saves on switch, restores, and closes on Escape', async ({ page }) => {
    const canvas = await openPaint(page);
    const strokePoint = { x: 230, y: 320 };
    await touchStroke(page, canvas, { x: 140, y: 320 }, { x: 320, y: 320 });
    await expect.poll(() => alphaAt(canvas, strokePoint)).toBeGreaterThan(0);

    const paperChip = page.getByTestId('paper-chip');
    await paperChip.click();
    await expect(page.getByTestId('paper-tray')).toBeVisible();

    // The standard studio ships fourteen papers in a scrollable 2-column grid.
    const cards = await trayCardBoxes(page);
    expect(cards).toHaveLength(ALL_SHEET_IDS.length);
    expect(cards.map((card) => card.id)).toEqual(
      ALL_SHEET_IDS.map((id) => `paper-${id}`)
    );
    expect(cards[0].y).toBe(cards[1].y);
    expect(cards[2].y).toBeGreaterThan(cards[0].y);
    expect(cards[0].x).toBe(cards[2].x);
    expect(cards[1].x).toBe(cards[3].x);
    expect(cards[1].x).toBeGreaterThan(cards[0].x);
    for (const card of cards) {
      expect(card.width).toBeGreaterThanOrEqual(120);
      expect(card.x + card.width).toBeLessThanOrEqual(390);
      await expect(page.getByTestId(card.id)).toBeVisible();
    }

    const trayScroll = await page.locator('.cards').evaluate((el) => ({
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight
    }));
    expect(trayScroll.scrollHeight).toBeGreaterThan(trayScroll.clientHeight);
    const lastCard = page.getByTestId('paper-robot');
    await lastCard.scrollIntoViewIfNeeded();
    await expect(lastCard).toBeInViewport();

    await expect(page.getByTestId('paper-blank')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-testid="paper-blank"] .check')).toHaveCount(1);
    await expect(page.getByTestId('paper-blank')).toHaveAttribute('aria-label', 'Blank paper');
    await expect(page.getByTestId('paper-dino-valley')).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    await expect(page.locator('[data-testid="paper-dino-valley"] .check')).toHaveCount(0);
    await expect(page.getByTestId('paper-butterfly-garden')).toHaveAttribute(
      'aria-label',
      'Butterfly Garden'
    );
    await expect(page.getByTestId('paper-under-the-sea')).toHaveAttribute(
      'aria-label',
      'Under the Sea'
    );

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('paper-tray')).toBeHidden();
    await expect(paperChip).toBeFocused();

    await pickSheet(page, 'dino-valley');
    await expect(page.locator('[data-outline="volcano"]')).toBeVisible();
    let saved = await readPaint(page);
    expect(saved.activeSheet).toBe('dino-valley');
    expect(saved.sheets.blank.strokes.length).toBe(1);

    await paperChip.click();
    await expect(page.getByTestId('paper-dino-valley')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-testid="paper-dino-valley"] .check')).toHaveCount(1);
    await page.getByTestId('paper-blank').click();
    await expect(page.getByTestId('paper-tray')).toBeHidden();
    await expect.poll(() => alphaAt(page.getByTestId('paint-canvas'), strokePoint)).toBeGreaterThan(0);

    await pickSheet(page, 'dino-valley');
    await expect(page.locator('[data-outline="volcano"]')).toBeVisible();
    saved = await readPaint(page);
    expect(saved.activeSheet).toBe('dino-valley');
  });

  test('Dino Valley fills, clips brush strokes, layers stamps, and restores everything', async ({ page }) => {
    const canvas = await openPaint(page);
    await pickSheet(page, 'dino-valley');

    // Line art is vector, above the paint, and complete.
    await expect(page.locator('[data-outline="volcano"]')).toBeVisible();
    await expect(page.locator('[data-outline]')).toHaveCount(16);
    await expect(page.getByTestId('paint-bucket')).toBeVisible();
    await expect(page.locator('[data-region="sky"]')).toBeVisible();

    // Bucket fills the top-most region under the tap.
    await page.getByTestId('paint-bucket').click();
    await tapAt(page, artToClient(303, 110));
    await expect(page.locator('[data-region="sun"]')).toHaveAttribute('fill', '#FF6B6B');

    // A second region with a second colour.
    await openPalette(page);
    await page.getByTestId('paint-color').nth(1).click();
    await tapAt(page, artToClient(195, 380));
    await expect(page.locator('[data-region="lake"]')).toHaveAttribute('fill', '#FF9F43');

    // A sky stroke must stop at the volcano in front of the sky.
    await page.getByTestId('paint-brush').click();
    await touchStroke(
      page,
      canvas,
      artToClient(220, 120),
      artToClient(220, 330)
    );
    await expect.poll(() => alphaAt(canvas, artToClient(220, 170))).toBeGreaterThan(0);
    expect(await alphaAt(canvas, artToClient(220, 300))).toBe(0);

    // Stamps place as stickers above the line art, even over the meadow lines.
    await page.getByTestId('paint-stamp').click();
    await expect(page.getByTestId('paint-stamp-tray')).toBeVisible();
    await expect(page.locator('[data-testid="paint-stamp-tray"] button[data-stamp]')).toHaveCount(4);
    await page.locator('[data-stamp="heart"]').click();
    const stampTarget = await center(canvas);
    await touchTap(page, canvas);
    await expect(page.locator('.stamps .stamp')).toHaveCount(1);
    const stampBox = await page.locator('.stamps .stamp').boundingBox();
    expect(Math.abs(stampBox.x + stampBox.width / 2 - stampTarget.x)).toBeLessThan(3);
    expect(Math.abs(stampBox.y + stampBox.height / 2 - stampTarget.y)).toBeLessThan(3);
    const layers = await page.evaluate(() => ({
      stamps: Number.parseInt(getComputedStyle(document.querySelector('.stamps')).zIndex, 10),
      ink: Number.parseInt(getComputedStyle(document.querySelector('.ink')).zIndex, 10)
    }));
    expect(layers.stamps).toBeGreaterThan(layers.ink);

    // Eraser tap clears a fill but leaves the line art; undo restores the fill.
    const paperFill = await page.locator('[data-region="cloud-left"]').getAttribute('fill');
    await page.getByTestId('paint-eraser').click();
    await tapAt(page, artToClient(303, 110));
    await expect(page.locator('[data-region="sun"]')).toHaveAttribute('fill', paperFill);
    expect(await page.locator('[data-region="sun"]').getAttribute('fill')).not.toBe('#FF6B6B');

    await page.getByTestId('paint-undo').click();
    await expect(page.locator('[data-region="sun"]')).toHaveAttribute('fill', '#FF6B6B');
    await expect(page.locator('.stamps .stamp')).toHaveCount(1);

    await page.reload();
    await expect(page.locator('[data-outline="volcano"]')).toBeVisible();
    await expect(page.locator('[data-region="sun"]')).toHaveAttribute('fill', '#FF6B6B');
    await expect(page.locator('[data-region="lake"]')).toHaveAttribute('fill', '#FF9F43');
    await expect(page.locator('.stamps .stamp')).toHaveCount(1);
    const restoredCanvas = page.getByTestId('paint-canvas');
    await expect.poll(() => alphaAt(restoredCanvas, artToClient(220, 170))).toBeGreaterThan(0);
    expect(await alphaAt(restoredCanvas, artToClient(220, 300))).toBe(0);

    const saved = await readPaint(page);
    expect(saved.activeSheet).toBe('dino-valley');
    expect(saved.sheets['dino-valley'].fills).toEqual({ sun: '#FF6B6B', lake: '#FF9F43' });
    expect(saved.sheets['dino-valley'].strokes.length).toBeGreaterThan(0);
    expect(saved.sheets['dino-valley'].stamps).toHaveLength(1);
  });

  test('Butterfly Garden and Under the Sea fill, clip, and save alongside the other papers', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`console: ${message.text()}`);
    });

    const canvas = await openPaint(page);

    // Butterfly Garden: its own line art, a bucket fill, and a clipped stroke.
    await pickSheet(page, 'butterfly-garden');
    await expect(page.locator('[data-outline="flower-left"]')).toBeVisible();
    await expect(page.locator('[data-outline]')).toHaveCount(16);
    await expect(page.getByTestId('paint-bucket')).toBeVisible();

    await fillRegion(page, 70, 385);
    await expect(page.locator('[data-region="flower-left"]')).toHaveAttribute('fill', '#FF6B6B');

    // A sky stroke dragged down into the meadow paints above the shared line
    // and stops there: the meadow plane is never a paint target of this stroke.
    await page.getByTestId('paint-brush').click();
    await touchStroke(page, canvas, artToClient(365, 100), artToClient(365, 500));
    await expect.poll(() => alphaAt(canvas, artToClient(365, 170))).toBeGreaterThan(0);
    await expect.poll(() => alphaAt(canvas, artToClient(365, 315))).toBeGreaterThan(0);
    expect(await alphaAt(canvas, artToClient(365, 340))).toBe(0);
    expect(await alphaAt(canvas, artToClient(365, 500))).toBe(0);

    // Under the Sea: its own line art, one fish filled.
    await pickSheet(page, 'under-the-sea');
    await expect(page.locator('[data-outline="fish"]')).toBeVisible();
    await expect(page.locator('[data-outline]')).toHaveCount(12);
    await fillRegion(page, 220, 340);
    await expect(page.locator('[data-region="fish"]')).toHaveAttribute('fill', '#FF6B6B');

    // Dino Valley keeps its own sheet too, so all four papers hold art.
    await pickSheet(page, 'dino-valley');
    await expect(page.locator('[data-outline="volcano"]')).toBeVisible();
    await fillRegion(page, 303, 118);
    await expect(page.locator('[data-region="sun"]')).toHaveAttribute('fill', '#FF6B6B');

    // Back to Butterfly Garden: the fill and the clipped stroke survived the
    // two sheet switches, and the active paper is remembered.
    await pickSheet(page, 'butterfly-garden');
    await expect(page.getByTestId('paper-chip')).toHaveAttribute(
      'aria-label',
      'Paper: Butterfly Garden'
    );
    await expect(page.locator('[data-region="flower-left"]')).toHaveAttribute('fill', '#FF6B6B');
    await expect(page.locator('[data-region="fish"]')).toHaveCount(0);
    await expect.poll(() => alphaAt(canvas, artToClient(365, 170))).toBeGreaterThan(0);
    expect(await alphaAt(canvas, artToClient(365, 500))).toBe(0);

    let saved = await readPaint(page);
    expect(saved.version).toBe(1);
    expect(saved.activeSheet).toBe('butterfly-garden');
    expect(Object.keys(saved.sheets).sort()).toEqual(
      ['blank', 'butterfly-garden', 'dino-valley', 'under-the-sea'].sort()
    );
    expect(saved.sheets['butterfly-garden'].fills).toEqual({ 'flower-left': '#FF6B6B' });
    expect(saved.sheets['butterfly-garden'].strokes).toHaveLength(1);
    expect(saved.sheets['butterfly-garden'].strokes[0].region).toBe('sky');
    expect(saved.sheets['under-the-sea'].fills).toEqual({ fish: '#FF6B6B' });
    expect(saved.sheets['dino-valley'].fills).toEqual({ sun: '#FF6B6B' });

    // Reload restores the active sheet first, with its fill and stroke intact.
    await page.reload();
    const restored = page.getByTestId('paint-canvas');
    await expect(page.getByTestId('paper-chip')).toHaveAttribute(
      'aria-label',
      'Paper: Butterfly Garden'
    );
    await expect(page.locator('[data-outline="flower-left"]')).toBeVisible();
    await expect(page.locator('[data-region="flower-left"]')).toHaveAttribute('fill', '#FF6B6B');
    await expect.poll(() => alphaAt(restored, artToClient(365, 170))).toBeGreaterThan(0);
    expect(await alphaAt(restored, artToClient(365, 500))).toBe(0);

    // Then each other sheet reopens with its own artwork.
    await pickSheet(page, 'under-the-sea');
    await expect(page.locator('[data-region="fish"]')).toHaveAttribute('fill', '#FF6B6B');
    await pickSheet(page, 'dino-valley');
    await expect(page.locator('[data-region="sun"]')).toHaveAttribute('fill', '#FF6B6B');

    saved = await readPaint(page);
    expect(saved.activeSheet).toBe('dino-valley');
    expect(Object.keys(saved.sheets).sort()).toEqual(
      ['blank', 'butterfly-garden', 'dino-valley', 'under-the-sea'].sort()
    );
    expect(errors).toEqual([]);
  });

  test('a new Farm sheet fills and keeps its colour after reload', async ({ page }) => {
    await openPaint(page);
    await pickSheet(page, 'farm');
    await expect(page.locator('[data-outline="barn"]')).toBeVisible();
    await expect(page.locator('[data-region="barn"]')).toHaveAttribute('fill', '#FFFEFA');

    await fillRegion(page, 130, 400);
    await expect(page.locator('[data-region="barn"]')).toHaveAttribute('fill', '#FF6B6B');

    await page.reload();
    await expect(page.getByTestId('paint-canvas')).toBeVisible();
    await expect(page.locator('[data-outline="barn"]')).toBeVisible();
    await expect(page.locator('[data-region="barn"]')).toHaveAttribute('fill', '#FF6B6B');
    const saved = await readPaint(page);
    expect(saved.activeSheet).toBe('farm');
    expect(saved.sheets.farm.fills).toEqual({ barn: '#FF6B6B' });
  });

  test('age 2 reduces the studio and keeps bucket and brush working', async ({ page }) => {
    await useAge(page, 2);
    const canvas = await openPaint(page);

    await expect(page.locator('[data-testid="paint-brush"] .size-dot')).toHaveCount(2);

    await openPalette(page);
    await expect(page.getByTestId('paint-color')).toHaveCount(6);
    await expect(page.getByTestId('paint-color').first()).toHaveAttribute('aria-label', 'Coral');
    await expect(page.locator('[data-testid="paint-color"][aria-label="Bubblegum"]')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('paint-palette')).toBeHidden();

    await page.getByTestId('paint-stamp').click();
    await expect(page.getByTestId('paint-stamp-tray')).toBeVisible();
    await expect(page.locator('[data-testid="paint-stamp-tray"] button[data-stamp]')).toHaveCount(3);
    await expect(page.locator('[data-stamp="star"]')).toHaveCount(1);
    await expect(page.locator('[data-stamp="heart"]')).toHaveCount(1);
    await expect(page.locator('[data-stamp="flower"]')).toHaveCount(1);
    await expect(page.locator('[data-stamp="butterfly"]')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('paint-stamp-tray')).toBeHidden();

    await page.getByTestId('paper-chip').click();
    await expect(page.getByTestId('paper-tray')).toBeVisible();
    const age2Cards = await trayCardBoxes(page);
    expect(age2Cards).toHaveLength(AGE2_SHEET_IDS.length);
    expect(age2Cards.map((card) => card.id)).toEqual(
      AGE2_SHEET_IDS.map((id) => `paper-${id}`)
    );
    // Age 2 drops Butterfly Garden and now shows 13 papers; the odd final
    // card is centred under the last full row.
    await expect(page.getByTestId('paper-butterfly-garden')).toHaveCount(0);
    expect(age2Cards[0].y).toBe(age2Cards[1].y);
    expect(age2Cards[2].y).toBeGreaterThan(age2Cards[0].y);
    const lastAge2 = age2Cards[age2Cards.length - 1];
    expect(lastAge2.width).toBe(age2Cards[0].width);
    const lastCenter = lastAge2.x + lastAge2.width / 2;
    expect(Math.abs(lastCenter - 195)).toBeLessThan(8);
    for (const card of age2Cards) {
      expect(card.width).toBeGreaterThanOrEqual(120);
      await expect(page.getByTestId(card.id)).toBeVisible();
    }
    const age2Scroll = await page.locator('.cards').evaluate((el) => ({
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight
    }));
    expect(age2Scroll.scrollHeight).toBeGreaterThan(age2Scroll.clientHeight);
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('paper-tray')).toBeHidden();

    await pickSheet(page, 'dino-valley');

    // The bucket joins the dock on a coloring sheet: six age-2 targets, all 72px
    // except the 64px paint well.
    const dockButtons = page.getByTestId('paint-dock').locator('button');
    await expect(dockButtons).toHaveCount(6);
    const widths = await dockButtons.evaluateAll((items) =>
      items.map((item) => Math.round(item.getBoundingClientRect().width))
    );
    expect(widths[0]).toBe(64);
    expect(widths.slice(1)).toEqual([72, 72, 72, 72, 72]);

    await fillRegion(page, 303, 118);
    await expect(page.locator('[data-region="sun"]')).toHaveAttribute('fill', '#FF6B6B');

    await page.getByTestId('paint-brush').click();
    await touchStroke(page, canvas, artToClient(220, 120), artToClient(220, 330));
    await expect.poll(() => alphaAt(canvas, artToClient(220, 170))).toBeGreaterThan(0);
    expect(await alphaAt(canvas, artToClient(220, 300))).toBe(0);

    // Age 2 still gets Under the Sea, with the same bucket behavior, and each
    // sheet keeps its own fills when the studio switches papers.
    await pickSheet(page, 'under-the-sea');
    await expect(page.locator('[data-outline="fish"]')).toBeVisible();
    await fillRegion(page, 220, 340);
    await expect(page.locator('[data-region="fish"]')).toHaveAttribute('fill', '#FF6B6B');

    const age2Saved = await readPaint(page);
    expect(age2Saved.activeSheet).toBe('under-the-sea');
    expect(age2Saved.sheets['under-the-sea'].fills).toEqual({ fish: '#FF6B6B' });
    expect(age2Saved.sheets['dino-valley'].fills).toEqual({ sun: '#FF6B6B' });
  });

  test('resizing 390x844 to 340x700 keeps the blank paint', async ({ page }) => {
    const canvas = await openPaint(page);
    await touchStroke(page, canvas, { x: 140, y: 320 }, { x: 320, y: 320 });
    await expect.poll(() => alphaAt(canvas, { x: 230, y: 320 })).toBeGreaterThan(0);

    await page.setViewportSize({ width: 340, height: 700 });
    const resized = page.getByTestId('paint-canvas');
    await expect
      .poll(() => resized.evaluate((el) => Math.round(el.getBoundingClientRect().width)))
      .toBe(340);
    await expect.poll(() => hasPaintNear(resized, { x: (230 / 390) * 340, y: (320 / 844) * 700 })).toBe(true);
    expect(await inkCount(resized)).toBeGreaterThan(0);
  });

  test('resizing keeps Dino Valley art and remaps the bucket to the same region', async ({ page }) => {
    const canvas = await openPaint(page);
    await pickSheet(page, 'dino-valley');
    await fillRegion(page, 303, 118);
    await expect(page.locator('[data-region="sun"]')).toHaveAttribute('fill', '#FF6B6B');

    await page.getByTestId('paint-brush').click();
    await touchStroke(page, canvas, artToClient(220, 120), artToClient(220, 330));
    await expect.poll(() => alphaAt(canvas, artToClient(220, 170))).toBeGreaterThan(0);

    await page.setViewportSize({ width: 340, height: 700 });
    const resized = page.getByTestId('paint-canvas');
    await expect
      .poll(() => resized.evaluate((el) => Math.round(el.getBoundingClientRect().width)))
      .toBe(340);
    await expect(page.locator('[data-region="sun"]')).toHaveAttribute('fill', '#FF6B6B');
    await expect.poll(() => alphaAt(resized, artToClient(220, 170, 340, 700))).toBeGreaterThan(0);

    // Bucket taps still land on the sun after the artboard is letterboxed.
    await openPalette(page);
    await page.getByTestId('paint-color').nth(1).click();
    await page.getByTestId('paint-bucket').click();
    await tapAt(page, artToClient(303, 118, 340, 700));
    await expect(page.locator('[data-region="sun"]')).toHaveAttribute('fill', '#FF9F43');
    await expect(page.locator('[data-region="lake"]')).toHaveAttribute('fill', '#FFFEFA');
  });

  test('paints all six locales without leaking raw keys', async ({ page }) => {
    await openPaint(page);

    const addedLabels = {
      en: {
        farm: 'Farm',
        space: 'Space',
        jungle: 'Jungle',
        arctic: 'Arctic',
        castle: 'Castle',
        vehicles: 'Vehicles',
        princesses: 'Princesses',
        snow: 'Snow',
        ocean: 'Ocean',
        robot: 'Robot'
      },
      it: {
        farm: 'Fattoria',
        space: 'Spazio',
        jungle: 'Giungla',
        arctic: 'Artide',
        castle: 'Castello',
        vehicles: 'Veicoli',
        princesses: 'Principesse',
        snow: 'Neve',
        ocean: 'Oceano',
        robot: 'Robot'
      },
      ro: {
        farm: 'Fermă',
        space: 'Spațiu',
        jungle: 'Junglă',
        arctic: 'Arctic',
        castle: 'Castel',
        vehicles: 'Vehicule',
        princesses: 'Prințese',
        snow: 'Zăpadă',
        ocean: 'Ocean',
        robot: 'Robot'
      },
      de: {
        farm: 'Bauernhof',
        space: 'Weltraum',
        jungle: 'Dschungel',
        arctic: 'Arktis',
        castle: 'Schloss',
        vehicles: 'Fahrzeuge',
        princesses: 'Prinzessinnen',
        snow: 'Schnee',
        ocean: 'Ozean',
        robot: 'Roboter'
      },
      fr: {
        farm: 'Ferme',
        space: 'Espace',
        jungle: 'Jungle',
        arctic: 'Arctique',
        castle: 'Château',
        vehicles: 'Véhicules',
        princesses: 'Princesses',
        snow: 'Neige',
        ocean: 'Océan',
        robot: 'Robot'
      },
      zh: {
        farm: '农场',
        space: '太空',
        jungle: '丛林',
        arctic: '北极',
        castle: '城堡',
        vehicles: '车辆',
        princesses: '公主',
        snow: '雪',
        ocean: '海洋',
        robot: '机器人'
      }
    };

    const locales = [
      {
        code: 'en',
        clear: 'Clear sheet',
        eraser: 'Eraser',
        paper: 'Paper',
        blank: 'Blank paper',
        dino: 'Dino Valley',
        butterfly: 'Butterfly Garden',
        sea: 'Under the Sea',
        coral: 'Coral',
        star: 'Star'
      },
      {
        code: 'it',
        clear: 'Pulisci foglio',
        eraser: 'Gomma',
        paper: 'Carta',
        blank: 'Foglio bianco',
        dino: 'Valle dei Dinosauri',
        butterfly: 'Giardino delle Farfalle',
        sea: 'Sotto il mare',
        coral: 'Corallo',
        star: 'Stella'
      },
      {
        code: 'ro',
        clear: 'Curăță foaia',
        eraser: 'Radieră',
        paper: 'Hârtie',
        blank: 'Foaie albă',
        dino: 'Valea Dinozaurilor',
        butterfly: 'Grădina Fluturilor',
        sea: 'Sub mare',
        coral: 'Coral',
        star: 'Stea'
      },
      {
        code: 'de',
        clear: 'Blatt leeren',
        eraser: 'Radiergummi',
        paper: 'Papier',
        blank: 'Leeres Papier',
        dino: 'Dino-Tal',
        butterfly: 'Schmetterlingsgarten',
        sea: 'Unter dem Meer',
        coral: 'Koralle',
        star: 'Stern'
      },
      {
        code: 'fr',
        clear: 'Effacer la feuille',
        eraser: 'Gomme',
        paper: 'Papier',
        blank: 'Feuille blanche',
        dino: 'Vallée des dinosaures',
        butterfly: 'Jardin des papillons',
        sea: 'Sous la mer',
        coral: 'Corail',
        star: 'Étoile'
      },
      {
        code: 'zh',
        clear: '清空纸张',
        eraser: '橡皮擦',
        paper: '纸张',
        blank: '白纸',
        dino: '恐龙谷',
        butterfly: '蝴蝶花园',
        sea: '海底世界',
        coral: '珊瑚',
        star: '星星'
      }
    ];

    for (const locale of locales) {
      await page.evaluate(([key, code]) => localStorage.setItem(key, code), [LOCALE_KEY, locale.code]);
      await page.reload();
      await expect(page.getByTestId('paint-canvas')).toBeVisible();

      await expect(page.getByTestId('paint-clear')).toHaveAttribute('aria-label', locale.clear);
      await expect(page.getByTestId('paint-eraser')).toHaveAttribute('aria-label', locale.eraser);
      await expect(page.getByTestId('paper-chip')).toHaveAttribute(
        'aria-label',
        `${locale.paper}: ${locale.blank}`
      );

      await openPalette(page);
      await expect(page.getByTestId('paint-color').first()).toHaveAttribute('aria-label', locale.coral);
      await page.keyboard.press('Escape');

      await page.getByTestId('paint-stamp').click();
      await expect(page.locator('[data-stamp="star"]')).toHaveAttribute('aria-label', locale.star);
      await page.keyboard.press('Escape');

      await page.getByTestId('paper-chip').click();
      await expect(page.getByTestId('paper-blank')).toHaveAttribute('aria-label', locale.blank);
      await expect(page.getByTestId('paper-dino-valley')).toHaveAttribute('aria-label', locale.dino);
      await expect(page.getByTestId('paper-butterfly-garden')).toHaveAttribute(
        'aria-label',
        locale.butterfly
      );
      await expect(page.getByTestId('paper-under-the-sea')).toHaveAttribute(
        'aria-label',
        locale.sea
      );
      for (const [id, label] of Object.entries(addedLabels[locale.code])) {
        await expect(page.getByTestId(`paper-${id}`)).toHaveAttribute('aria-label', label);
      }
      await page.keyboard.press('Escape');
      await expect(page.getByTestId('paper-tray')).toBeHidden();
    }
  });

  test('a full draw/fill/stamp/erase/switch/clear flow logs no page or console errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`console: ${message.text()}`);
    });

    const canvas = await openPaint(page);
    await touchDrag(page, canvas, { x: 300, y: 460 });
    await pickSheet(page, 'dino-valley');
    await fillRegion(page, 303, 118);
    await fillRegion(page, 195, 380);
    await page.getByTestId('paint-brush').click();
    await touchStroke(page, canvas, artToClient(220, 120), artToClient(220, 330));
    await page.getByTestId('paint-stamp').click();
    await page.locator('[data-stamp="star"]').click();
    await tapAt(page, { x: 90, y: 700 });
    await page.getByTestId('paint-eraser').click();
    await tapAt(page, artToClient(303, 110));
    await page.getByTestId('paint-undo').click();
    await pickSheet(page, 'blank');
    await page.getByTestId('paint-clear').click();
    await page.getByTestId('clear-confirm').click();
    await expect(page.getByTestId('clear-card')).toBeHidden();
    await page.reload();
    await expect(page.getByTestId('paint-canvas')).toBeVisible();

    expect(errors).toEqual([]);
  });
});
