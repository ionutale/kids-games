import { test, expect } from '@playwright/test';
import ANIMALS from '../../src/lib/animalQuizData.js';

// The app's detectLocale falls back to 'en' in Playwright's default browser,
// so the displayed option names are the English ones.
const emojiToEn = Object.fromEntries(ANIMALS.map(a => [a.emoji, a.en]));

async function correctButton(page) {
  const emoji = (await page.locator('.big-emoji').textContent())?.trim();
  const name = emojiToEn[emoji];
  if (!name) return null;
  return page.locator('.opt-btn').filter({ hasText: name }).first();
}

test.describe('Animal Quiz E2E', () => {
  test('loads and shows first animal', async ({ page }) => {
    await page.goto('/games/animal-quiz');
    await expect(page.locator('.quiz-title')).toBeVisible();
    await expect(page.locator('.big-emoji')).toBeVisible();
    await expect(page.locator('.opt-btn')).toHaveCount(3);
  });

  test('tapping correct answer shows confetti and highlights the button', async ({ page }) => {
    await page.goto('/games/animal-quiz');
    await page.waitForTimeout(300);

    const btn = await correctButton(page);
    if (!btn) return;

    await btn.click();
    await page.waitForTimeout(200);
    await expect(btn).toHaveClass(/correct/);
    await expect(page.locator('.confetti-container')).toBeVisible();
  });

  test('tapping wrong answer shakes the button', async ({ page }) => {
    await page.goto('/games/animal-quiz');
    await page.waitForTimeout(300);

    const emoji = (await page.locator('.big-emoji').textContent())?.trim();
    const name = emojiToEn[emoji];
    if (!name) return;

    const wrong = page.locator('.opt-btn').filter({ hasNotText: name }).first();
    if (await wrong.isVisible()) {
      await wrong.click();
      await page.waitForTimeout(200);
      await expect(wrong).toHaveClass(/shake/);
    }
  });

  test('completing all rounds shows done screen', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('/games/animal-quiz');

    for (let round = 0; round < ANIMALS.length; round++) {
      await page.waitForTimeout(200);
      const btn = await correctButton(page);
      if (!btn) break;
      await btn.click();
      await page.waitForTimeout(1800);
    }

    await expect(page.locator('.win-title')).toBeVisible();
  });
});
