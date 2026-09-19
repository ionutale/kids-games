import { test, expect } from '@playwright/test';

async function solveRound(page, max = 10) {
  for (let i = 0; i < max; i++) {
    if (await page.locator('.win-overlay').isVisible().catch(() => false)) return;
    const opt = page.locator('[data-testid="correct-opt"]');
    await expect(opt).toBeVisible({ timeout: 10000 });
    await opt.click();
    await page.waitForTimeout(600); // slot fill + beat
  }
}

test.describe('What Comes Next E2E', () => {
  test('landing shows hero + play link without a level bar', async ({ page }) => {
    await page.goto('/games/what-comes-next');
    await expect(page.locator('.level-btn')).toHaveCount(0);
    const href = await page.locator('.big-btn.primary').getAttribute('href');
    expect(href).toMatch(/\/games\/what-comes-next\/play\/\d+/);
  });

  test('full round: solve prompts, win overlay, next level', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('/games/what-comes-next/play/1?seed=21');
    await solveRound(page);
    await expect(page.locator('.win-overlay')).toBeVisible();
    await page.getByTestId('next-level').click();
    await page.waitForURL(/\/games\/what-comes-next\/play\/2/);
  });

  test('Next Level loads a fresh round for the new level (no stale board)', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('/games/what-comes-next/play/1?seed=21');
    await solveRound(page);
    await expect(page.locator('.win-overlay')).toBeVisible();

    await page.getByTestId('next-level').click();
    await page.waitForURL(/\/games\/what-comes-next\/play\/2/);
    await expect(page.locator('.win-overlay')).toBeHidden();
    // level 2 goal is 6: a fresh board starts at 0/6
    await expect(page.locator('.hud-item').first()).toHaveText(/0\/6/);
  });

  test('Replay restarts the current level with a fresh round', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('/games/what-comes-next/play/2?seed=21');
    await solveRound(page);
    await expect(page.locator('.win-overlay')).toBeVisible();

    await page.getByTestId('replay').click();
    await expect(page.locator('.win-overlay')).toBeHidden();
    await expect(page.locator('.hud-item').first()).toHaveText(/0\/6/);
    await expect(page).toHaveURL(/\/games\/what-comes-next\/play\/2/);
  });

  test('wrong option does not advance progress and stays until correct', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/games/what-comes-next/play/1?seed=21');

    const counter = page.locator('.hud-item').first();
    await expect(counter).toBeVisible();
    const before = await counter.textContent();

    const wrong = page.locator('[data-testid^="wrong-opt-"]').first();
    if (await wrong.isVisible().catch(() => false)) {
      await wrong.click();
      await page.waitForTimeout(400);
      expect((await counter.textContent())).toBe(before);
      // correct option still available
      await expect(page.locator('[data-testid="correct-opt"]')).toBeEnabled();
    }
  });

  test('playing a round saves its level', async ({ page }) => {
    await page.goto('/games/what-comes-next/play/6?seed=8');
    await expect(page.locator('[data-testid="strip"]')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('whatComesNextLevel'))).toBe('6');
  });

  test('sound toggle mutes and unmutes the theme loop', async ({ page }) => {
    await page.addInitScript(() => {
      window.__audios = [];
      const Orig = window.Audio;
      window.Audio = class extends Orig {
        constructor(...args) {
          super(...args);
          this.__intendedPlay = false;
          window.__audios.push(this);
        }
        play() {
          this.__intendedPlay = true;
          const p = super.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
          return p;
        }
        pause() {
          this.__intendedPlay = false;
          return super.pause();
        }
      };
    });
    await page.goto('/games/what-comes-next/play/1?seed=21');

    const musicIntended = () =>
      page.evaluate(
        () => window.__audios.find((a) => a.src.includes('/sounds/music/'))?.__intendedPlay ?? null
      );
    await expect.poll(musicIntended).toBe(true);

    await page.locator('.sound-btn').click();
    await expect.poll(musicIntended).toBe(false);

    await page.locator('.sound-btn').click();
    await expect.poll(musicIntended).toBe(true);
  });
});
