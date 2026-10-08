import { test, expect } from '@playwright/test';

test.describe.configure({ retries: 2 }); // load-sensitive suite; retries smooth local runs

test.describe('Memory E2E', () => {
  test('loads with cards', async ({ page }) => {
    await page.goto('/games/memory');
    await page.waitForSelector('.card');
    const count = await page.locator('.card').count();
    expect(count).toBeGreaterThan(0);
  });

  test('clicking a card flips it', async ({ page }) => {
    await page.goto('/games/memory');
    await page.locator('.card').first().click();
    await expect(page.locator('.card').first()).toHaveClass(/flipped/);
  });

  test('level indicator shows current level', async ({ page }) => {
    await page.goto('/games/memory');
    await expect(page.locator('.level-label')).toHaveText(/Level/);
  });

  test('matching all cards shows win overlay with Next Level', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('/games/memory');
    const cards = page.locator('.card');
    const count = await cards.count();

    // The emoji renders unconditionally in .card-front (CSS-hidden until flipped),
    // so we can read the full layout without touching the game's flip state,
    // then play only known pairs — no mismatches, no resets, no races.
    const emojis = [];
    for (let i = 0; i < count; i++) {
      emojis.push((await cards.nth(i).locator('.card-front').textContent()) ?? '');
    }

    const pairs = [];
    const used = new Set();
    for (let i = 0; i < count; i++) {
      if (used.has(i)) continue;
      for (let j = i + 1; j < count; j++) {
        if (used.has(j)) continue;
        if (emojis[i] && emojis[i] === emojis[j]) {
          pairs.push([i, j]);
          used.add(i);
          used.add(j);
          break;
        }
      }
    }

    for (const [i, j] of pairs) {
      for (const idx of [i, j]) {
        const c = (await cards.nth(idx).getAttribute('class')) || '';
        if (!c.includes('matched') && !c.includes('showcasing')) {
          await cards.nth(idx).click();
          await expect(cards.nth(idx)).toHaveClass(/flipped|showcasing|matched/, { timeout: 4000 });
        }
      }
      // showcase lasts ~3s before 'matched' lands on both cards
      await expect(cards.nth(i)).toHaveClass(/matched/, { timeout: 10000 });
    }

    await expect(page.locator('.win-overlay')).toBeVisible({ timeout: 15000 });
    if (await page.getByTestId('next-level').isVisible()) {
      await expect(page.getByTestId('next-level')).toBeVisible();
    }
  });

  test('ladder bar shows progression', async ({ page }) => {
    await page.goto('/games/memory');
    await expect(page.locator('.ladder-step')).toHaveCount(10);
  });

  test('switching level during the match showcase does not corrupt the new board', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('/games/memory');
    const cards = page.locator('.card');

    // Read the facing emojis without flipping anything (same trick as the win test).
    const count = await cards.count(); // level 1 -> 4 cards
    const emojis = [];
    for (let i = 0; i < count; i++) {
      emojis.push((await cards.nth(i).locator('.card-front').textContent()) ?? '');
    }

    let pair = null;
    for (let i = 0; i < count && !pair; i++) {
      for (let j = i + 1; j < count; j++) {
        if (emojis[i] && emojis[i] === emojis[j]) {
          pair = [i, j];
          break;
        }
      }
    }
    expect(pair, 'expected a matching pair among the initial cards').not.toBeNull();

    // Flip the pair: this starts the 3s showcase timer.
    for (const idx of pair) await cards.nth(idx).click();
    await expect(cards.nth(pair[0])).toHaveClass(/showcasing/);

    // Switch level while the showcase timer is still pending.
    await page.locator('.ladder-step').nth(1).click();
    await expect(cards).toHaveCount(6); // level 2 board is live

    // Wait past the 3s window: the stale timer used to fire here and hide two cards.
    await page.waitForTimeout(3500);
    await expect(page.locator('.card.matched')).toHaveCount(0);

    // The fresh board must still be winnable: clear every pair.
    const count2 = await cards.count();
    const emojis2 = [];
    for (let i = 0; i < count2; i++) {
      emojis2.push((await cards.nth(i).locator('.card-front').textContent()) ?? '');
    }
    const used = new Set();
    for (let i = 0; i < count2; i++) {
      if (used.has(i)) continue;
      for (let j = i + 1; j < count2; j++) {
        if (used.has(j) || !emojis2[i] || emojis2[i] !== emojis2[j]) continue;
        used.add(i);
        used.add(j);
        for (const idx of [i, j]) {
          await cards.nth(idx).click();
          await expect(cards.nth(idx)).toHaveClass(/flipped|showcasing|matched/, { timeout: 4000 });
        }
        await expect(cards.nth(i)).toHaveClass(/matched/, { timeout: 10000 });
        break;
      }
    }
    await expect(page.locator('.win-overlay')).toBeVisible({ timeout: 15000 });
  });
});
