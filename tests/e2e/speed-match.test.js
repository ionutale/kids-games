import { test, expect } from '@playwright/test';

test.describe('Speed Match E2E', () => {
  test('landing shows level bar and play link', async ({ page }) => {
    await page.goto('/games/speed-match');
    await expect(page.locator('.level-btn').first()).toBeVisible();
    const href = await page.locator('.big-btn.primary').getAttribute('href');
    expect(href).toMatch(/\/games\/speed-match\/play\/\d+/);
  });

  test('full deck: correct answers advance, deck completes, next level', async ({ page }) => {
    test.setTimeout(90000);
    // level 1 has the longest window (3.9s) — plenty of time to answer
    await page.goto('/games/speed-match/play/1?seed=13');

    for (let i = 0; i < 25; i++) {
      if (await page.locator('.win-overlay').isVisible().catch(() => false)) break;
      const a = page.getByTestId('emoji-a');
      await expect(a).toBeVisible({ timeout: 10000 });
      const textA = (await a.textContent()) ?? '';
      const textB = (await page.getByTestId('emoji-b').textContent()) ?? '';
      await page.getByTestId(textA === textB ? 'same-btn' : 'diff-btn').click();
      await page.waitForTimeout(250);
    }

    await expect(page.locator('.win-overlay')).toBeVisible();
    await page.getByTestId('next-level').click();
    await page.waitForURL(/\/games\/speed-match\/play\/2/);
  });

  test('wrong answer does not advance the card', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/games/speed-match/play/1?seed=1');

    const counter = page.locator('.hud-item').first();
    await expect(counter).toHaveText(/🃏\s*1\/\d+/);
    // find first card and press the WRONG button
    const textA = (await page.getByTestId('emoji-a').textContent()) ?? '';
    const textB = (await page.getByTestId('emoji-b').textContent()) ?? '';
    const sameCard = textA === textB;
    await page.getByTestId(sameCard ? 'diff-btn' : 'same-btn').click();
    await page.waitForTimeout(400);
    await expect(counter).toHaveText(new RegExp(`🃏\\s*1/`)); // still on card 1
  });

  test('playing a round saves its level', async ({ page }) => {
    await page.goto('/games/speed-match/play/5?seed=3');
    await expect(page.locator('[data-testid="board"]')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('speedMatchLevel'))).toBe('5');
  });
});
