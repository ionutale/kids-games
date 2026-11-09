import { test, expect } from '@playwright/test';

const SETTINGS_KEY = 'kids-games-settings';

async function open(page, { age = 3, seed = 2, sound = true } = {}) {
  // Land on a static file first: same origin for localStorage, but no app boot
  // that could race our write with the settings store's onMount.
  await page.goto('/robots.txt');
  await page.evaluate(
    ({ key, ageLevel, soundEnabled }) => {
      localStorage.setItem(
        key,
        JSON.stringify({ soundEnabled, ageLevel, firstVisit: false, quizMode: null })
      );
    },
    { key: SETTINGS_KEY, ageLevel: age, soundEnabled: sound }
  );
  await page.goto(`/games/spot-the-difference?seed=${seed}`);
  await expect(page.getByTestId('panel-left')).toBeVisible({ timeout: 10000 });
  await expect(page.getByTestId('panel-left').locator('.prop').first()).toBeVisible({
    timeout: 10000
  });
  await expect(page.getByTestId('panel-right').locator('.prop').first()).toBeVisible({
    timeout: 10000
  });
}

async function setStoredAge(page, age) {
  await page.evaluate(
    ({ key, ageLevel }) => {
      const current = JSON.parse(localStorage.getItem(key) || '{}');
      localStorage.setItem(key, JSON.stringify({ ...current, ageLevel }));
    },
    { key: SETTINGS_KEY, ageLevel: age }
  );
  await page.reload();
}

async function readProps(page, side) {
  const panel = page.getByTestId(`panel-${side}`);
  const props = await panel.locator('.prop').evaluateAll((nodes) =>
    nodes.map((node) => ({
      id: Number(node.getAttribute('data-prop-id')),
      emoji: node.textContent?.trim() ?? '',
      x: Number(node.getAttribute('data-prop-x')),
      y: Number(node.getAttribute('data-prop-y')),
      scale: Number(node.getAttribute('data-scale')),
      diffType: node.getAttribute('data-diff-type')
    }))
  );
  return props;
}

/**
 * Diff the two rendered pictures the way the child does: a prop that vanished,
 * changed emoji, moved, or changed size. This reads the DOM, never Svelte state.
 */
async function readDiffs(page) {
  const left = await readProps(page, 'left');
  const right = await readProps(page, 'right');
  const rightById = new Map(right.map((prop) => [prop.id, prop]));
  const diffs = [];
  for (const prop of left) {
    const other = rightById.get(prop.id);
    if (!other) {
      diffs.push({ type: 'missing', id: prop.id, x: prop.x, y: prop.y });
    } else if (other.emoji !== prop.emoji) {
      diffs.push({ type: 'swap', id: prop.id, x: prop.x, y: prop.y });
    } else if (Math.abs(other.x - prop.x) > 0.01 || Math.abs(other.y - prop.y) > 0.01) {
      diffs.push({
        type: 'moved',
        id: prop.id,
        x: prop.x,
        y: prop.y,
        toX: other.x,
        toY: other.y
      });
    } else if (Math.abs(other.scale - prop.scale) > 0.001) {
      diffs.push({ type: 'size', id: prop.id, x: prop.x, y: prop.y });
    }
  }
  return diffs;
}

async function tapAt(page, side, x, y) {
  const box = await page.getByTestId(`panel-${side}`).boundingBox();
  expect(box).toBeTruthy();
  await page.mouse.click(box.x + (x / 100) * box.width, box.y + (y / 100) * box.height);
}

async function foundIds(page) {
  const ids = await page.locator('.ring').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-diff-id'))
  );
  return new Set(ids);
}

/** The unchanged prop farthest from every difference, so a wrong tap stays wrong. */
async function findMatchSpot(page) {
  const diffs = await readDiffs(page);
  const left = await readProps(page, 'left');
  const box = await page.getByTestId('panel-left').boundingBox();
  const changed = new Set(diffs.map((diff) => diff.id));
  let best = null;
  let bestDistance = -Infinity;
  for (const prop of left) {
    if (changed.has(prop.id)) continue;
    let nearest = Infinity;
    for (const diff of diffs) {
      const spots = [
        { x: diff.x, y: diff.y },
        ...(diff.type === 'moved' ? [{ x: diff.toX, y: diff.toY }] : [])
      ];
      for (const spot of spots) {
        const distance = Math.hypot(
          ((prop.x - spot.x) / 100) * box.width,
          ((prop.y - spot.y) / 100) * box.height
        );
        if (distance < nearest) nearest = distance;
      }
    }
    if (nearest > bestDistance) {
      bestDistance = nearest;
      best = prop;
    }
  }
  return best;
}

async function solveCurrentPuzzle(page) {
  const diffs = await readDiffs(page);
  for (let guard = 0; guard < 16; guard += 1) {
    const found = await foundIds(page);
    const remaining = diffs.filter((diff) => !found.has(String(diff.id)));
    if (!remaining.length) return;
    await tapAt(page, 'left', remaining[0].x, remaining[0].y);
    await page.waitForTimeout(140);
  }
  throw new Error('puzzle did not resolve');
}

test.describe('Spot the Difference — Twin Postcards', () => {
  test('renders two stacked harbor pictures with the cat and 9 props at age 3', async ({ page }) => {
    await open(page, { age: 3 });
    await expect(page.getByTestId('spot-root')).toHaveAttribute('data-age', '3');
    await expect(page.getByTestId('spot-root')).toHaveAttribute('data-step', '0');

    const leftBox = await page.getByTestId('panel-left').boundingBox();
    const rightBox = await page.getByTestId('panel-right').boundingBox();
    expect(rightBox.y).toBeGreaterThan(leftBox.y);

    await expect(page.getByTestId('panel-left')).toHaveAttribute('aria-label', 'Picture 1');
    await expect(page.getByTestId('panel-right')).toHaveAttribute('aria-label', 'Picture 2');
    await expect(page.getByTestId('panel-left').locator('.cat')).toBeVisible();
    await expect(page.getByTestId('panel-left').locator('.prop')).toHaveCount(9);
    await expect(page.getByTestId('spot-progress').locator('.token')).toHaveCount(2);
    await expect(page.getByTestId('spot-progress').locator('.slot')).toHaveCount(5);
    await expect(page.getByTestId('spot-progress')).not.toContainText(/\d/);
    await expect(page.getByTestId('spot-status')).toContainText('Found 0 of 2 differences');
    await expect(page.getByTestId('spot-status')).toContainText('Picture 1 of 5');
  });

  test('tapping a difference rings both pictures and fills one token', async ({ page }) => {
    await open(page, { age: 3, seed: 2 });
    const diffs = await readDiffs(page);
    expect(diffs.length).toBe(2);

    await tapAt(page, 'left', diffs[0].x, diffs[0].y);
    await expect(page.getByTestId('panel-left').locator('.ring')).toHaveCount(1);
    await expect(page.getByTestId('panel-right').locator('.ring')).toHaveCount(1);
    await expect(page.getByTestId('spot-progress').locator('.token.on')).toHaveCount(1);
    await expect(page.getByTestId('spot-root')).toHaveAttribute('data-found', '1');
    await expect(page.getByTestId('spot-status')).toContainText('Found 1 of 2 differences');

    // The cat reacts to the find, then settles.
    const cat = page.getByTestId('panel-left').locator('.cat');
    await expect(cat).toHaveAttribute('data-reacting', 'true');
    await expect(cat).toHaveAttribute('data-reacting', 'false', { timeout: 2500 });

    // Tapping the same, already-found spot is a silent no-op, not a wrong tap.
    await tapAt(page, 'left', diffs[0].x, diffs[0].y);
    await page.waitForTimeout(150);
    await expect(page.getByTestId('panel-left').locator('.wrong')).toHaveCount(0);
    await expect(page.getByTestId('spot-progress').locator('.token.on')).toHaveCount(1);
    await expect(page.getByTestId('spot-root')).toHaveAttribute('data-found', '1');
  });

  test('tapping a match only wobbles, never counts', async ({ page }) => {
    await open(page, { age: 3, seed: 2 });
    const match = await findMatchSpot(page);
    expect(match).toBeTruthy();

    await tapAt(page, 'left', match.x, match.y);
    await expect(page.getByTestId('panel-left').locator('.wrong')).toBeVisible();
    await expect(page.getByTestId('spot-progress').locator('.token.on')).toHaveCount(0);
    await expect(page.getByTestId('spot-root')).toHaveAttribute('data-found', '0');
    await page.waitForTimeout(500);
    await expect(page.getByTestId('panel-left').locator('.wrong')).toHaveCount(0);
  });

  test('a missing prop rings the empty spot in Picture 2 with a ghost ring', async ({ page }) => {
    await open(page, { age: 5, seed: 2 });
    const diffs = await readDiffs(page);
    const missing = diffs.find((diff) => diff.type === 'missing');
    expect(missing).toBeTruthy();

    // The prop is present on the left; tap it there.
    await tapAt(page, 'left', missing.x, missing.y);
    const ghost = page.getByTestId('panel-right').locator(`.ring[data-diff-id="${missing.id}"]`);
    await expect(ghost).toBeVisible();
    await expect(ghost).toHaveAttribute('data-ghost', 'true');
    const style = await ghost.getAttribute('style');
    expect(style).toContain('left:');
    await expect(page.getByTestId('spot-root')).toHaveAttribute('data-found', '1');
  });

  test('a moved prop counts from its old position and rings both spots', async ({ page }) => {
    await open(page, { age: 5, seed: 2 });
    const diffs = await readDiffs(page);
    const moved = diffs.find((diff) => diff.type === 'moved');
    expect(moved).toBeTruthy();

    // Tap the old position in Picture 2, where the prop no longer is.
    await tapAt(page, 'right', moved.x, moved.y);
    await expect(page.getByTestId('spot-root')).toHaveAttribute('data-found', '1');
    await expect(
      page.getByTestId('panel-right').locator(`.ring[data-diff-id="${moved.id}"]`)
    ).toHaveCount(2);
    await expect(
      page.getByTestId('panel-left').locator(`.ring[data-diff-id="${moved.id}"]`)
    ).toHaveCount(2);
  });

  test('after idling, one unfound difference pulses in both pictures', async ({ page }) => {
    test.setTimeout(30000);
    await open(page, { age: 3, seed: 2 });
    await expect(page.getByTestId('panel-left').locator('.hint')).toBeVisible({ timeout: 11000 });
    await expect(page.getByTestId('panel-right').locator('.hint')).toBeVisible();
    await expect(page.getByTestId('panel-left').locator('.hint')).toHaveCount(0, {
      timeout: 6000
    });
  });

  test('a full five-picture set reaches the album, persists and can replay', async ({ page }) => {
    test.setTimeout(120000);
    await open(page, { age: 3, seed: 2 });
    for (let i = 0; i < 5; i += 1) {
      // The set is flat: every picture keeps the age-3 prop and difference count.
      await expect(page.getByTestId('spot-root')).toHaveAttribute('data-age', '3');
      await expect(page.getByTestId('panel-left').locator('.prop')).toHaveCount(9);
      await expect(page.getByTestId('spot-progress').locator('.token')).toHaveCount(2);
      await solveCurrentPuzzle(page);
      await expect(page.getByTestId('postcard-toast')).toBeVisible({ timeout: 5000 });
      if (i < 4) {
        await expect(page.getByTestId('spot-root')).toHaveAttribute('data-step', String(i + 1), {
          timeout: 5000
        });
        await expect(page.getByTestId('spot-root')).toHaveAttribute('data-found', '0');
      }
    }

    await expect(page.getByTestId('set-complete')).toBeVisible({ timeout: 6000 });
    await expect(page.locator('[data-testid="set-complete"] .primary')).toBeFocused();
    await expect(page.getByTestId('postcard-album').locator('[data-testid="postcard"]')).toHaveCount(
      5
    );
    await expect(page.getByTestId('spot-progress').locator('.slot.done')).toHaveCount(5);

    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('spotPostcards') || '[]')
    );
    expect(stored).toHaveLength(5);
    expect(new Set(stored.map((card) => card.seed)).size).toBe(5);
    expect(stored.every((card) => card.age === 3 && typeof card.at === 'number')).toBe(true);

    await page.reload();
    const afterReload = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('spotPostcards') || '[]')
    );
    expect(afterReload).toHaveLength(5);
    await expect(page.getByTestId('panel-left').locator('.prop').first()).toBeVisible();

    await page.goto('/games/spot-the-difference?seed=9');
    for (let i = 0; i < 5; i += 1) {
      await solveCurrentPuzzle(page);
      if (i < 4) {
        await expect(page.getByTestId('spot-root')).toHaveAttribute('data-step', String(i + 1), {
          timeout: 5000
        });
      }
    }
    await expect(page.getByTestId('postcard-album').locator('[data-testid="postcard"]')).toHaveCount(
      10
    );

    await page.locator('[data-testid="set-complete"] .primary').click();
    await expect(page.getByTestId('set-complete')).toBeHidden();
    await expect(page.getByTestId('spot-root')).toHaveAttribute('data-step', '0');
    await expect(page.getByTestId('spot-root')).toHaveAttribute('data-solved', '0');
    await expect(page.getByTestId('spot-progress').locator('.slot.done')).toHaveCount(0);
  });

  test('a blocked postcard store still shows the session album on the set card', async ({ page }) => {
    test.setTimeout(120000);
    await page.addInitScript(() => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function setItem(key, value) {
        if (key === 'spotPostcards') throw new Error('storage blocked');
        return original.call(this, key, value);
      };
    });
    await open(page, { age: 3, seed: 2 });
    for (let i = 0; i < 5; i += 1) {
      await solveCurrentPuzzle(page);
      if (i < 4) {
        await expect(page.getByTestId('spot-root')).toHaveAttribute('data-step', String(i + 1), {
          timeout: 5000
        });
      }
    }

    await expect(page.getByTestId('set-complete')).toBeVisible({ timeout: 6000 });
    await expect(page.getByTestId('postcard-album').locator('[data-testid="postcard"]')).toHaveCount(
      5
    );
    expect(await page.evaluate(() => localStorage.getItem('spotPostcards'))).toBeNull();
  });

  test('the set-complete Back link returns to the hub', async ({ page }) => {
    test.setTimeout(120000);
    await open(page, { age: 3, seed: 2 });
    for (let i = 0; i < 5; i += 1) {
      await solveCurrentPuzzle(page);
      if (i < 4) {
        await expect(page.getByTestId('spot-root')).toHaveAttribute('data-step', String(i + 1), {
          timeout: 5000
        });
      }
    }
    await expect(page.getByTestId('set-complete')).toBeVisible({ timeout: 6000 });
    await page.getByTestId('spot-back').click();
    await expect(page.locator('.hub')).toBeVisible({ timeout: 8000 });
  });

  test('each age band gets its own prop and difference count', async ({ page }) => {
    await open(page, { age: 2, seed: 2 });
    await expect(page.getByTestId('spot-root')).toHaveAttribute('data-age', '3');
    await expect(page.getByTestId('panel-left').locator('.prop')).toHaveCount(9);
    await expect(page.getByTestId('spot-progress').locator('.token')).toHaveCount(2);

    await setStoredAge(page, 4);
    await expect(page.getByTestId('panel-left').locator('.prop').first()).toBeVisible();
    await expect(page.getByTestId('spot-root')).toHaveAttribute('data-age', '4');
    await expect(page.getByTestId('panel-left').locator('.prop')).toHaveCount(11);
    await expect(page.getByTestId('spot-progress').locator('.token')).toHaveCount(3);

    await setStoredAge(page, 5);
    await expect(page.getByTestId('panel-left').locator('.prop').first()).toBeVisible();
    await expect(page.getByTestId('spot-root')).toHaveAttribute('data-age', '5');
    await expect(page.getByTestId('panel-left').locator('.prop')).toHaveCount(12);
    await expect(page.getByTestId('spot-progress').locator('.token')).toHaveCount(4);
  });

  test('fits 320×568 and 390×844 without horizontal overflow', async ({ page }) => {
    for (const viewport of [
      { width: 320, height: 568 },
      { width: 390, height: 844 }
    ]) {
      await page.setViewportSize(viewport);
      await open(page, { age: 5, seed: 2 });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      );
      expect(overflow, `${viewport.width}x${viewport.height}`).toBeLessThanOrEqual(1);

      const left = await page.getByTestId('panel-left').boundingBox();
      const right = await page.getByTestId('panel-right').boundingBox();
      expect(left.height).toBeGreaterThan(100);
      expect(right.height).toBeGreaterThan(100);
      expect(right.y + right.height).toBeLessThanOrEqual(viewport.height + 1);
      expect(left.y + left.height).toBeLessThanOrEqual(right.y + 1);
    }
  });

  test('reduced motion stops the cat bob, hint pulse and ring pop', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, { age: 3, seed: 2 });
    const catAnimation = await page
      .getByTestId('panel-left')
      .locator('.cat')
      .evaluate((node) => getComputedStyle(node).animationName);
    expect(catAnimation).toBe('none');

    const diffs = await readDiffs(page);
    await tapAt(page, 'left', diffs[0].x, diffs[0].y);
    const ringAnimation = await page
      .getByTestId('panel-left')
      .locator('.ring')
      .first()
      .evaluate((node) => getComputedStyle(node).animationName);
    expect(ringAnimation).toBe('none');
    await expect(page.getByTestId('spot-root')).toHaveAttribute('data-found', '1');
    await page.waitForTimeout(150);
    await expect(page.getByTestId('panel-left').locator('.cat')).toHaveAttribute(
      'data-reacting',
      'false'
    );
  });

  test('muted sound still plays the whole loop without errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await open(page, { age: 3, seed: 2, sound: false });
    const diffs = await readDiffs(page);
    const match = await findMatchSpot(page);
    await tapAt(page, 'left', match.x, match.y);
    await page.waitForTimeout(200);
    await tapAt(page, 'left', diffs[0].x, diffs[0].y);
    await expect(page.getByTestId('spot-root')).toHaveAttribute('data-found', '1');
    expect(errors).toEqual([]);
  });
});
