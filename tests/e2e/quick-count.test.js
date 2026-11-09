import { test, expect } from '@playwright/test';

const basket = (page) => page.getByTestId('basket');

async function basketCount(page) {
  return Number(await basket(page).getAttribute('data-count'));
}

async function solveRound(page, max = 20) {
  for (let i = 0; i < max; i += 1) {
    if (await page.locator('.win-overlay').isVisible().catch(() => false)) return;
    const pill = page.locator('[data-testid="correct-pill"]');
    await expect(pill).toBeVisible({ timeout: 20000 });
    await pill.click({ force: true });
    await page.waitForTimeout(600);
  }
}

test.describe('Quick Count E2E', () => {
  test('landing shows hero + play link and the ladder bar', async ({ page }) => {
    await page.goto('/games/quick-count');
    await expect(page.locator('.ladder-step')).toHaveCount(10);
    const href = await page.locator('.big-btn.primary').getAttribute('href');
    expect(href).toMatch(/\/games\/quick-count\/play\/\d+/);
  });

  test('full round: answer prompts correctly, win overlay, next level', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('/games/quick-count/play/1?seed=5');
    await solveRound(page);
    await expect(page.locator('.win-overlay')).toBeVisible();
    await expect(page.getByTestId('basket')).toHaveAttribute('data-goal', '6');
    await page.getByTestId('next-level').click();
    await page.waitForURL(/\/games\/quick-count\/play\/2/);
  });

  test('Next Level loads a fresh picnic basket for the new level', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('/games/quick-count/play/1?seed=5');
    await solveRound(page);
    await expect(page.locator('.win-overlay')).toBeVisible();

    await page.getByTestId('next-level').click();
    await page.waitForURL(/\/games\/quick-count\/play\/2/);
    await expect(page.locator('.win-overlay')).toBeHidden();
    await expect(basket(page)).toHaveAttribute('data-count', '0');
    await expect(basket(page)).toHaveAttribute('data-goal', '7');
  });

  test('Replay restarts the current level with an empty basket', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('/games/quick-count/play/2?seed=5');
    await solveRound(page);
    await expect(page.locator('.win-overlay')).toBeVisible();

    await page.getByTestId('replay').click();
    await expect(page.locator('.win-overlay')).toBeHidden();
    await expect(basket(page)).toHaveAttribute('data-count', '0');
    await expect(basket(page)).toHaveAttribute('data-goal', '7');
    await expect(page).toHaveURL(/\/games\/quick-count\/play\/2/);
  });

  test('wrong pill wobbles silently and does not advance', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/games/quick-count/play/1?seed=5');

    await expect(page.getByTestId('pills')).toBeVisible({ timeout: 20000 });
    const correctValue = await page.getByTestId('correct-pill').getAttribute('data-value');
    const before = await basketCount(page);
    const wrong = page.getByTestId('wrong-pill').first();
    await wrong.click({ force: true });
    await expect(wrong).toHaveClass(/wobble/);
    await page.waitForTimeout(450);

    expect(await basketCount(page)).toBe(before);
    await expect(page.getByTestId('correct-pill')).toHaveAttribute('data-value', correctValue);
  });

  test('flash shows one themed object repeated on the cloth', async ({ page }) => {
    await page.goto('/games/quick-count/play/1?seed=5');
    const cloth = page.getByTestId('cloth');
    await expect(cloth).toHaveAttribute('data-phase', 'flash', { timeout: 10000 });

    const objects = page.getByTestId('flashed-object');
    const count = await objects.count();
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(3);

    const emojis = await objects.allTextContents();
    expect(new Set(emojis.map((e) => e.trim())).size).toBe(1);
    await expect(cloth).toHaveAttribute('data-count', String(count));
    await expect(cloth).toHaveAttribute('data-phase', 'answer', { timeout: 10000 });

    await expect(page.getByTestId('question')).toHaveText('How many?');
    await expect(page.getByTestId('basket')).toHaveAttribute('aria-label', 'Berry basket: 0 of 6');
    const correct = page.getByTestId('correct-pill');
    const value = await correct.getAttribute('data-value');
    await expect(correct).toHaveAttribute('aria-label', `${value}, dots: ${value}`);
  });

  test('late level ramps the count, flash and goal', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/games/quick-count/play/7?seed=9');
    const board = page.getByTestId('board');
    await expect(board).toHaveAttribute('data-level', '7');
    await expect(board).toHaveAttribute('data-goal', '12');
    await expect(board).toHaveAttribute('data-flash-ms', '1950');

    await expect(page.getByTestId('cloth')).toHaveAttribute('data-phase', 'flash', {
      timeout: 10000
    });
    const count = await page.getByTestId('flashed-object').count();
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(8);

    const pill = page.getByTestId('correct-pill');
    await expect(pill).toBeVisible({ timeout: 10000 });
    await pill.click({ force: true });
    await expect(basket(page)).toHaveAttribute('data-count', '1');
  });

  test('playing a round saves its level', async ({ page }) => {
    await page.goto('/games/quick-count/play/4?seed=9');
    await expect(page.getByTestId('board')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('quickCountLevel'))).toBe('4');
  });

  test('double-tapping the correct pill scores exactly once', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/games/quick-count/play/1?seed=5');
    await expect(page.getByTestId('correct-pill')).toBeVisible({ timeout: 20000 });

    const before = await basketCount(page);
    await page.evaluate(() => {
      const pill = document.querySelector('[data-testid="correct-pill"]');
      pill.click();
      pill.click();
    });
    await page.waitForTimeout(250);

    expect(await basketCount(page)).toBe(before + 1);
  });

  test('320x568 fits without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/games/quick-count/play/1?seed=5');
    await expect(page.getByTestId('pills')).toBeVisible({ timeout: 20000 });

    const layout = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      pills: [...document.querySelectorAll('[data-testid="pills"] .pill')].map((el) => {
        const r = el.getBoundingClientRect();
        return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
      })
    }));

    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.innerWidth + 1);
    expect(layout.pills.length).toBe(3);
    for (const pill of layout.pills) {
      expect(pill.left).toBeGreaterThanOrEqual(0);
      expect(pill.right).toBeLessThanOrEqual(layout.innerWidth + 1);
      expect(pill.bottom).toBeLessThanOrEqual(layout.innerHeight + 1);
    }
  });

  test('390x844 keeps the pills clear of the bottom edge', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/games/quick-count/play/1?seed=5');
    await expect(page.getByTestId('pills')).toBeVisible({ timeout: 20000 });

    const bottom = await page.evaluate(() => {
      const pills = document.querySelector('[data-testid="pills"]');
      const r = pills.getBoundingClientRect();
      return { bottom: r.bottom, height: window.innerHeight };
    });
    expect(bottom.bottom).toBeLessThan(bottom.height);
  });

  test('reduced motion keeps the picnic calm and playable', async ({ page }) => {
    test.setTimeout(60000);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/games/quick-count/play/1?seed=5');

    await expect(page.getByTestId('board')).toHaveClass(/calm/);
    await expect(page.getByTestId('cloth')).toHaveAttribute('data-phase', 'flash', {
      timeout: 10000
    });
    await expect(page.getByTestId('cloth')).toHaveClass(/calm/);
    expect(
      await page.getByTestId('flashed-object').first().evaluate((el) => getComputedStyle(el).animationName)
    ).toBe('none');

    const before = await basketCount(page);
    await page.getByTestId('correct-pill').click({ force: true });
    await expect(basket(page)).toHaveAttribute('data-count', String(before + 1));

    const lastOn = page.locator('[data-testid="basket-berry"].on.pop');
    await expect(lastOn).toHaveCount(1);
    expect(await lastOn.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  });

  test('muted sound still plays the picnic with no errors', async ({ page }) => {
    test.setTimeout(60000);
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript(() => {
      localStorage.setItem('kids-games-settings', JSON.stringify({ soundEnabled: false }));
    });
    await page.goto('/games/quick-count/play/1?seed=5');

    const toggle = page.locator('.sound-btn');
    await expect(toggle).toHaveText('🔇');
    await page.getByTestId('correct-pill').click({ force: true });
    await expect(basket(page)).toHaveAttribute('data-count', '1');

    await toggle.click();
    await expect(toggle).toHaveText('🔊');
    expect(errors).toEqual([]);
  });
});
