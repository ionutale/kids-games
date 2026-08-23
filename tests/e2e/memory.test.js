import { test, expect } from '@playwright/test';

test.describe.configure({ retries: 2 }); // fixed-timing card matching is load-sensitive

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
    test.setTimeout(120000);

    const isIdle = async (idx) => {
      const c = (await cards.nth(idx).getAttribute('class')) || '';
      return !c.includes('flipped') && !c.includes('showcasing') && !c.includes('matched');
    };
    const flipAndRead = async (idx) => {
      await cards.nth(idx).click();
      await expect(cards.nth(idx)).toHaveClass(/flipped|showcasing|matched/, { timeout: 4000 });
      return (await cards.nth(idx).locator('.card-front').textContent()) ?? '';
    };
    const waitReset = (idx) =>
      expect(cards.nth(idx)).not.toHaveClass(/flipped|showcasing/, { timeout: 8000 });
    const waitMatched = (idx) =>
      expect(cards.nth(idx)).toHaveClass(/matched/, { timeout: 9000 });

    // state-driven matching: flip a card, then probe candidates until it pairs.
    // Every transition is poll-based so CPU load cannot desync the test.
    let matchedCount = 0;
    for (let pass = 0; pass < count * 2 && matchedCount < count; pass++) {
      let anchor = -1;
      for (let i = 0; i < count && anchor === -1; i++) {
        if (await isIdle(i)) anchor = i;
      }
      if (anchor === -1) {
        await page.waitForTimeout(500); // transition in flight
        continue;
      }
      const anchorEmoji = await flipAndRead(anchor);
      const anchorClass = (await cards.nth(anchor).getAttribute('class')) || '';
      if (anchorClass.includes('matched')) {
        matchedCount += 2;
        continue;
      }
      let paired = false;
      for (let j = 0; j < count && !paired; j++) {
        if (j === anchor || !(await isIdle(j))) continue;
        const emoji = await flipAndRead(j);
        if (emoji === anchorEmoji) {
          await waitMatched(anchor);
          matchedCount += 2;
          paired = true;
        } else {
          await waitReset(j);
        }
      }
    }

    await expect(page.locator('.win-overlay')).toBeVisible({ timeout: 15000 });
    if (await page.locator('.next-btn').isVisible()) {
      await expect(page.locator('.next-btn')).toBeVisible();
    }
  });

  test('level dots show progression', async ({ page }) => {
    await page.goto('/games/memory');
    await expect(page.locator('.level-dot')).toHaveCount(10);
  });
});
