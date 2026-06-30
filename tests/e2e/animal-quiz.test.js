import { test, expect } from '@playwright/test';

test.describe('Animal Quiz E2E', () => {
  test('loads and shows first animal', async ({ page }) => {
    await page.goto('/games/animal-quiz');
    await expect(page.locator('.quiz-title')).toBeVisible();
    await expect(page.locator('.big-emoji')).toBeVisible();
    await expect(page.locator('.opt-btn')).toHaveCount(3);
  });

  test('tapping correct answer shows confetti', async ({ page }) => {
    await page.goto('/games/animal-quiz');
    await page.waitForTimeout(300);
    const btns = page.locator('.opt-btn');
    const texts = [];
    for (let i = 0; i < 3; i++) {
      texts.push(await btns.nth(i).textContent());
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      const animalName = await page.evaluate(() => {
        const animals = [
          { emoji: '🐶', en: 'Dog' }, { emoji: '🐱', en: 'Cat' }, { emoji: '🐰', en: 'Rabbit' },
          { emoji: '🐻', en: 'Bear' }, { emoji: '🐸', en: 'Frog' }, { emoji: '🐵', en: 'Monkey' },
          { emoji: '🦊', en: 'Fox' }, { emoji: '🐯', en: 'Tiger' }, { emoji: '🐭', en: 'Mouse' },
          { emoji: '🐼', en: 'Panda' }, { emoji: '🐨', en: 'Koala' }, { emoji: '🦁', en: 'Lion' },
          { emoji: '🐮', en: 'Cow' }, { emoji: '🐷', en: 'Pig' }, { emoji: '🐙', en: 'Octopus' },
          { emoji: '🦋', en: 'Butterfly' }, { emoji: '🐝', en: 'Bee' }, { emoji: '🐧', en: 'Penguin' },
          { emoji: '🦉', en: 'Owl' }, { emoji: '🐘', en: 'Elephant' },
        ];
        const emoji = document.querySelector('.big-emoji')?.textContent?.trim();
        const a = animals.find(x => x.emoji === emoji);
        return a ? a.en : null;
      });

      if (animalName) {
        for (let i = 0; i < 3; i++) {
          if (texts[i] === animalName) {
            await btns.nth(i).click();
            await page.waitForTimeout(200);
            await expect(page.locator('.confetti-container')).toBeVisible();
            return;
          }
        }
      }
      await page.waitForTimeout(300);
    }
  });

  test('tapping wrong answer shakes the button', async ({ page }) => {
    await page.goto('/games/animal-quiz');
    await page.waitForTimeout(300);

    const animalName = await page.evaluate(() => {
      const animals = [
        { en: 'Dog' }, { en: 'Cat' }, { en: 'Rabbit' }, { en: 'Bear' }, { en: 'Frog' },
        { en: 'Monkey' }, { en: 'Fox' }, { en: 'Tiger' }, { en: 'Mouse' }, { en: 'Panda' },
        { en: 'Koala' }, { en: 'Lion' }, { en: 'Cow' }, { en: 'Pig' }, { en: 'Octopus' },
        { en: 'Butterfly' }, { en: 'Bee' }, { en: 'Penguin' }, { en: 'Owl' }, { en: 'Elephant' },
      ];
      const emoji = document.querySelector('.big-emoji')?.textContent?.trim();
      const animalsMap = {
        '🐶':'Dog','🐱':'Cat','🐰':'Rabbit','🐻':'Bear','🐸':'Frog','🐵':'Monkey',
        '🦊':'Fox','🐯':'Tiger','🐭':'Mouse','🐼':'Panda','🐨':'Koala','🦁':'Lion',
        '🐮':'Cow','🐷':'Pig','🐙':'Octopus','🦋':'Butterfly','🐝':'Bee',
        '🐧':'Penguin','🦉':'Owl','🐘':'Elephant',
      };
      return animalsMap[emoji] || null;
    });

    if (animalName) {
      const btn = page.locator('.opt-btn').filter({ hasNotText: animalName }).first();
      if (await btn.isVisible()) {
        await btn.click();
        await page.waitForTimeout(200);
        await expect(btn).toHaveClass(/shake/);
      }
    }
  });

  test('completing all 20 shows done screen', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/games/animal-quiz');

    const animalsMap = {
      '🐶':'Dog','🐱':'Cat','🐰':'Rabbit','🐻':'Bear','🐸':'Frog','🐵':'Monkey',
      '🦊':'Fox','🐯':'Tiger','🐭':'Mouse','🐼':'Panda','🐨':'Koala','🦁':'Lion',
      '🐮':'Cow','🐷':'Pig','🐙':'Octopus','🦋':'Butterfly','🐝':'Bee',
      '🐧':'Penguin','🦉':'Owl','🐘':'Elephant',
    };

    for (let round = 0; round < 20; round++) {
      await page.waitForTimeout(200);
      const emoji = await page.locator('.big-emoji').textContent();
      const correctName = animalsMap[emoji?.trim()];
      if (!correctName) break;

      const btns = page.locator('.opt-btn');
      for (let i = 0; i < 3; i++) {
        const text = await btns.nth(i).textContent();
        if (text === correctName) {
          await btns.nth(i).click();
          await page.waitForTimeout(1800);
          break;
        }
      }
    }

    await expect(page.locator('.done-text')).toBeVisible();
  });
});
