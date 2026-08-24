import { test, expect } from '@playwright/test';

/**
 * Cross-cutting e2e coverage — G1..G5 from docs/e2e-coverage-report.md.
 */

test.describe('G1 — hub navigation sweep', () => {
  const GAMES = [
    'animal-quiz', 'angry-emoji', 'category-sort', 'emoji-jump', 'emoji-math',
    'focus-tap', 'glossary-puzzle', 'memory', 'paint', 'path-builder', 'pop',
    'puzzle', 'quick-count', 'sequence-memory', 'soccer', 'sorting',
    'speed-match', 'splash', 'spot-the-difference', 'stickers', 'tetris',
    'tower-defense', 'what-comes-next'
  ];

  for (const game of GAMES) {
    test(`hub → ${game} → back`, async ({ page }) => {
      await page.goto('/');
      const tile = page.locator(`[data-game="${game}"]`);
      if (await tile.count()) {
        // tiles float + overflow the hub grid; programmatic click fires the real
        // Svelte onclick → actual client-side navigation
        await tile.evaluate((el) => el.click());
      } else {
        await page.goto(`/games/${game}`);
      }
      await expect(page.locator('.game-shell')).toBeVisible({ timeout: 10000 });
      // back to hub via the shell's back button
      await page.locator('.back-btn').first().click();
      await expect(page.locator('.hub')).toBeVisible({ timeout: 8000 });
    });
  }
});

test.describe('G2 — thin-spec games', () => {
  test('sequence-memory: best score persists across reload', async ({ page }) => {
    test.setTimeout(60000);
    // deterministic run: ?seed= makes the sequence reproducible
    const seed = 1234;
    await page.goto(`/games/sequence-memory?seed=${seed}`);
    await page.waitForTimeout(500);
    await page.locator('.big-btn.primary').click();

    // inline mulberry32 + round-1 sequence prediction (2 pads, no consecutive repeats)
    const mulberry = (s) => {
      let t = s >>> 0 || 1;
      return () => {
        t += 0x6d2b79f5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
      };
    };
    const round1 = [0, 0];
    {
      const rng = mulberry(seed + 1);
      let prev = -1;
      for (let i = 0; i < 2; i++) {
        let n;
        do { n = Math.floor(rng() * 4) % 4; } while (n === prev);
        round1[i] = n;
        prev = n;
      }
    }

    // play round 1 correctly
    await expect(page.locator('[data-testid="status"]')).toHaveText('👆', { timeout: 6000 });
    for (const pad of round1) {
      await page.getByTestId(`pad-${pad}`).click();
      await page.waitForTimeout(120);
      await expect(page.locator('[data-testid="status"]')).toHaveText('👆', { timeout: 5000 }).catch(() => {});
    }
    // round 2 starts; fail it deterministically: tap a pad that cannot be seq[0]
    await expect(page.locator('[data-testid="status"]')).toHaveText('👆', { timeout: 8000 });
    const rng2 = mulberry(seed + 2);
    const first2 = Math.floor(rng2() * 4) % 4;
    const wrongPad = (first2 + 1) % 4;
    await page.getByTestId(`pad-${wrongPad}`).click(); // wrong → second chance
    await page.waitForTimeout(2600); // half-speed replay
    const st = (await page.locator('[data-testid="status"]').textContent().catch(() => '')) ?? '';
    if (st.includes('👆')) {
      await page.getByTestId(`pad-${wrongPad}`).click(); // wrong again → game over
    }
    await expect(page.locator('.score-line')).toBeVisible({ timeout: 10000 });

    const best = await page.evaluate(() => parseInt(localStorage.getItem('sequence-memory-best') || '0', 10));
    expect(best).toBe(1); // completed round 1, failed round 2
    await page.reload();
    const shown = await page.locator('.best-line').first().textContent();
    expect(shown).toContain('1');
  });
});

test.describe('G3 — locale switching', () => {
  test('hub labels change EN ↔ IT', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.title')).toHaveText(/Kids Games/);

    await page.evaluate(() => localStorage.setItem('kids-games-locale', 'it'));
    await page.reload();
    await expect(page.locator('.title')).toHaveText(/Giochi Bambini/);

    await page.evaluate(() => localStorage.setItem('kids-games-locale', 'en'));
    await page.reload();
    await expect(page.locator('.title')).toHaveText(/Kids Games/);
  });
});

test.describe('G4 — sound toggle persistence', () => {
  test('toggle off survives a reload', async ({ page }) => {
    await page.goto('/');
    await page.locator('.settings-trigger').click();
    const soundBtn = page.locator('.sound-btn');
    await soundBtn.click();
    const state = await page.evaluate(() => JSON.parse(localStorage.getItem('kids-games-settings') || '{}'));
    expect(state.soundEnabled).toBe(false);

    await page.reload();
    await page.locator('.settings-trigger').click();
    // button reflects muted state (not the 🔊 glyph)
    await expect(page.locator('.sound-btn')).not.toContainText('🔊');
  });
});

test.describe('G5 — landscape smokes', () => {
  test.use({ viewport: { width: 844, height: 390 } });

  test('tetris: no horizontal overflow in landscape', async ({ page }) => {
    await page.goto('/games/tetris');
    await page.locator('.center-col .big-btn').first().click();
    await expect(page.getByTestId('board')).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(2);
  });

  test('emoji-jump: no horizontal overflow in landscape', async ({ page }) => {
    await page.goto('/games/emoji-jump');
    await page.locator('.big-btn.primary').click();
    await expect(page.getByTestId('world')).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(2);
  });
});