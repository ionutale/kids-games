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
      await expect(page.locator('.opt-btn')).toHaveCount(3);
      await expect(page.getByTestId('quiz-progress')).toHaveText(/1 \/ \d+/);

      const wrong = page.locator('[data-testid^="wrong-opt-"]').first();
      await wrong.click();
      await expect(wrong).toHaveClass(/shake/);
      await expect(page.getByTestId('quiz-progress')).toHaveText(/1 \/ \d+/);

      await page.waitForTimeout(550);
      await page.getByTestId('correct-opt').click();
      await expect(page.getByTestId('correct-opt')).toHaveClass(/correct/);
      await expect(page.getByTestId('quiz-progress')).toHaveText(/2 \/ \d+/, { timeout: 4000 });
    });
  }
});
