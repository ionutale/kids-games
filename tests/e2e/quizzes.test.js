import { test, expect } from '@playwright/test';

const QUIZZES = [
  { path: '/games/food-quiz', title: 'Food Quiz' },
  { path: '/games/vehicle-quiz', title: 'Vehicle Quiz' },
  { path: '/games/color-shape-quiz', title: 'Colors & Shapes' },
  { path: '/games/clothes-quiz', title: 'Clothes Quiz' },
  { path: '/games/toy-quiz', title: 'Toys Quiz' },
  { path: '/games/instrument-quiz', title: 'Instruments Quiz' }
];

test.describe('Quiz Collection E2E', () => {
  for (const quiz of QUIZZES) {
    test(`${quiz.path}: card, 3 options, wrong shakes, correct advances`, async ({ page }) => {
      await page.goto(quiz.path);
      await expect(page.locator('.quiz-title')).toContainText(quiz.title);
      await expect(page.getByTestId('quiz-emoji')).toBeVisible();
      // level 1 of the ladder = 2 options; higher levels add more
      expect(await page.locator('.opt-btn').count()).toBeGreaterThanOrEqual(2);
      await expect(page.getByTestId('quiz-progress')).toHaveText(/1 \/ \d+/);

      const wrong = page.locator('[data-testid^="wrong-opt-"]').first();
      await wrong.click();
      await expect(wrong).toHaveClass(/shake/);
      await expect(page.getByTestId('quiz-progress')).toHaveText(/1 \/ \d+/);

      // A second miss softly highlights the correct option — no child is stuck.
      await wrong.click();
      await expect(page.getByTestId('correct-opt')).toHaveClass(/hint/);

      await page.waitForTimeout(550);
      await page.getByTestId('correct-opt').click();
      await expect(page.getByTestId('correct-opt')).toHaveClass(/correct/);
      await expect(page.getByTestId('quiz-progress')).toHaveText(/2 \/ \d+/, { timeout: 4000 });
    });
  }

  test('the quiz ladder: short round, level picker + persistence, Next Level', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('/games/instrument-quiz');
    await expect(page.getByTestId('quiz-progress')).toHaveText('Level 1 · 1 / 4');
    expect(await page.locator('.opt-btn').count()).toBe(2);

    for (let i = 0; i < 10; i++) {
      if (await page.locator('.win-overlay').isVisible().catch(() => false)) break;
      await page.getByTestId('correct-opt').click({ force: true });
      await page.waitForTimeout(1700);
    }
    await expect(page.locator('.win-overlay')).toBeVisible();
    await expect(page.locator('.ladder-step')).toHaveCount(10);

    // pick a higher level straight from the done-screen picker
    await page.locator('.ladder-step').nth(4).click(); // level 5
    await expect(page.locator('.win-overlay')).toBeHidden();
    await expect(page.getByTestId('quiz-progress')).toHaveText('Level 5 · 1 / 6');

    // the level survives a reload
    await page.reload();
    await expect(page.getByTestId('quiz-progress')).toHaveText('Level 5 · 1 / 6');

    // finishing a round offers Next Level ▶
    for (let i = 0; i < 10; i++) {
      if (await page.locator('.win-overlay').isVisible().catch(() => false)) break;
      await page.getByTestId('correct-opt').click({ force: true });
      await page.waitForTimeout(1700);
    }
    await expect(page.locator('.win-overlay')).toBeVisible();
    await page.getByTestId('next-level').click();
    await expect(page.getByTestId('quiz-progress')).toHaveText('Level 6 · 1 / 6');
  });
});
