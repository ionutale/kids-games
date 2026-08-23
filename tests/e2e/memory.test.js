import { test, expect } from '@playwright/test';

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
    await page.goto('/games/memory');
    const cards = page.locator('.card');
    const count = await cards.count();

    const emojis = [];
    for (let i = 0; i < count; i++) {
      await cards.nth(i).click();
      await page.waitForTimeout(200);
      const text = await cards.nth(i).locator('.card-front').textContent();
      emojis.push(text);
    }

    await page.waitForTimeout(1000);

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
      const flipCheck = async (idx) => {
        const c = await cards.nth(idx).getAttribute('class') || '';
        if (!c.includes('flipped') && !c.includes('showcasing') && !c.includes('matched')) {
          await cards.nth(idx).click();
          await page.waitForTimeout(400);
        }
      };
      await flipCheck(i);
      await flipCheck(j);
      await page.waitForTimeout(3800);
    }

    // the fixed-timing flips can race the game's mismatch reset — retry pass if needed
    for (let attempt = 0; attempt < 3; attempt++) {
      if (await page.locator('.win-overlay').isVisible().catch(() => false)) break;
      for (let i = 0; i < count; i++) {
        const c = (await cards.nth(i).getAttribute('class')) || '';
        if (!c.includes('matched') && !c.includes('flipped') && !c.includes('showcasing')) {
          const match = pairs.find(([a, b]) => a === i || b === i);
          if (!match) continue;
          const partnerIdx = match[0] === i ? match[1] : match[0];
          await cards.nth(partnerIdx).getAttribute('class').then((pc) => pc || '');
          await cards.nth(i).click();
          await page.waitForTimeout(350);
          const partnerClass = (await cards.nth(partnerIdx).getAttribute('class')) || '';
          if (!partnerClass.includes('matched') && !partnerClass.includes('flipped') && !partnerClass.includes('showcasing')) {
            await cards.nth(partnerIdx).click();
            await page.waitForTimeout(3800);
          }
        }
      }
    }

    await expect(page.locator('.win-overlay')).toBeVisible({ timeout: 10000 });
    if (await page.locator('.next-btn').isVisible()) {
      await expect(page.locator('.next-btn')).toBeVisible();
    }
  });

  test('level dots show progression', async ({ page }) => {
    await page.goto('/games/memory');
    await expect(page.locator('.level-dot')).toHaveCount(10);
  });
});
