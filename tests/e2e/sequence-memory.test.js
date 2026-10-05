import { test, expect } from '@playwright/test';

// Watches the pad grid and records the order pads light up during a playback.
async function recordPlayback(page) {
  const seen = [];
  let idleFor = 0;
  const t0 = Date.now();
  // Half-speed gaps are 600ms, so an idle stretch must exceed that to mean "done".
  while (Date.now() - t0 < 20000 && idleFor < 1200) {
    const lit = await page.evaluate(
      () => document.querySelector('.pad.lit')?.getAttribute('data-testid') ?? null
    );
    if (lit) {
      if (seen[seen.length - 1] !== lit) seen.push(lit);
      idleFor = 0;
    } else if (seen.length > 0) {
      idleFor += 60;
    }
    await page.waitForTimeout(60);
  }
  return seen;
}

test.describe('Sequence Memory E2E', () => {
  test('start screen shows play button and 4 pads appear in-game', async ({ page }) => {
    await page.goto('/games/sequence-memory');
    await page.waitForTimeout(600);
    await expect(page.getByTestId('seq-root').locator('.title')).toBeVisible();
    await page.locator('.big-btn.primary').click();
    for (let i = 0; i < 4; i++) {
      await expect(page.getByTestId(`pad-${i}`)).toBeVisible();
    }
  });

  test('sequence plays then pads become tappable (listening state)', async ({ page }) => {
    await page.goto('/games/sequence-memory');
    await page.locator('.big-btn.primary').click();
    // round 1 = 2 steps × (600ms + 300ms) → listening within ~2s
    await expect(page.locator('[data-testid="status"]')).toHaveText('👆', { timeout: 5000 });
  });

  test('wrong tap twice ends the game with a replay screen', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/games/sequence-memory');
    await page.locator('.big-btn.primary').click();
    // wait for listening
    await expect(page.locator('[data-testid="status"]')).toHaveText('👆', { timeout: 6000 });
    // find which pad lit LAST during playback — tap the others to be wrong.
    // simpler: wait, then tap pad 0 repeatedly across the second-chance replay:
    // first wrong triggers second chance; second wrong ends the game.
    // keep tapping pad-0 whenever input is accepted; statistically a wrong tap
    // arrives quickly (3/4 per step), triggering second chance then game over.
    for (let i = 0; i < 25; i++) {
      if ((await page.locator('.win-title').isVisible().catch(() => false))) break;
      const status = (await page.locator('[data-testid="status"]').textContent().catch(() => '')) ?? '';
      if (status.includes('👆')) await page.getByTestId('pad-0').click();
      await page.waitForTimeout(900);
    }
    await expect(page.getByTestId('seq-root').locator('.win-title')).toBeVisible({ timeout: 10000 });
  });

  test('second chance replays the same sequence and the original answer still works', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/games/sequence-memory');
    await page.locator('.big-btn.primary').click();

    const first = await recordPlayback(page);
    expect(first.length).toBeGreaterThanOrEqual(2);
    await expect(page.locator('[data-testid="status"]')).toHaveText('👆', { timeout: 8000 });

    const wrongId = ['pad-0', 'pad-1', 'pad-2', 'pad-3'].find((id) => id !== first[0]);
    await page.getByTestId(wrongId).click();
    await page.waitForTimeout(300); // let the tapped pad's own feedback flash fade

    // During the half-speed second chance the child must be watching, not tapping.
    await expect(page.locator('[data-testid="status"]')).toHaveText('👀', { timeout: 5000 });

    const replay = await recordPlayback(page);
    expect(replay).toEqual(first);

    // The original sequence is still the answer after the replay.
    await expect(page.locator('[data-testid="status"]')).toHaveText('👆', { timeout: 10000 });
    for (const id of first) {
      await page.getByTestId(id).click();
      await page.waitForTimeout(120);
    }
    // Round completed: celebrate, then the next round starts playing.
    await expect(page.locator('[data-testid="status"]')).toHaveText(/🎉|👀/, { timeout: 5000 });
  });

  test('failing round 1 shows a score of 0, not 1', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/games/sequence-memory');
    await page.locator('.big-btn.primary').click();

    const first = await recordPlayback(page);
    const wrongA = ['pad-0', 'pad-1', 'pad-2', 'pad-3'].find((id) => id !== first[0]);
    await page.getByTestId(wrongA).click();
    await page.waitForTimeout(300); // let the tapped pad's own feedback flash fade

    const replay = await recordPlayback(page);
    expect(replay.length).toBeGreaterThanOrEqual(2);
    await expect(page.locator('[data-testid="status"]')).toHaveText('👆', { timeout: 10000 });
    const wrongB = ['pad-0', 'pad-1', 'pad-2', 'pad-3'].find((id) => id !== replay[0]);
    await page.getByTestId(wrongB).click();

    await expect(page.locator('.win-title')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('.win-title')).toHaveText('🎼 0');
  });
});
