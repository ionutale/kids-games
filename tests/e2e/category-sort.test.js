import { test, expect } from '@playwright/test';
import { touchDrag, touchTap, center } from './helpers/touch.js';

test.describe('Category Sort — Sorting Room', () => {
  async function levelOne(page) {
    await page.addInitScript(() => localStorage.setItem('categorySortLevel', '1'));
    await page.goto('/games/category-sort');
    await page.waitForSelector('.zone');
  }

  async function zoneFor(page, categoryId) {
    return page.locator(`.zone[data-cat="${categoryId}"]`);
  }

  test('renders category homes with illustrated signs and the whole round in a tray', async ({ page }) => {
    await levelOne(page);
    const zones = page.getByTestId('bins').locator('.zone');
    await expect(zones).toHaveCount(2);
    await expect(zones.first().locator('.zone-sign svg')).toBeVisible();
    await expect(zones.first().locator('.zone-name')).not.toBeEmpty();
    await expect(page.locator('.draggable')).toHaveCount(6);
  });

  test('dragging an item into its home collects it', async ({ page }) => {
    await levelOne(page);
    const item = page.locator('.draggable').first();
    const category = await item.getAttribute('data-cat');
    const zone = await zoneFor(page, category);

    await touchDrag(page, item, await center(zone));

    await expect(page.locator('.draggable')).toHaveCount(5);
    await expect(zone.locator('.zone-count')).toHaveText('1');
    await expect(zone.locator('.mini')).toHaveCount(1);
  });

  test('dragging into a wrong home springs the item back', async ({ page }) => {
    await levelOne(page);
    const item = page.locator('.draggable').first();
    const category = await item.getAttribute('data-cat');
    const zones = page.locator('.zone');
    const count = await zones.count();

    let wrong = null;
    for (let i = 0; i < count; i++) {
      if ((await zones.nth(i).getAttribute('data-cat')) !== category) {
        wrong = zones.nth(i);
        break;
      }
    }
    expect(wrong, 'expected a non-matching home').not.toBeNull();

    const before = await page.locator('.draggable').count();
    await touchDrag(page, item, await center(wrong));
    await expect(wrong).toHaveClass(/wrong/, { timeout: 1000 });

    await page.waitForTimeout(450);
    await expect(page.locator('.draggable')).toHaveCount(before);
    await expect(item).toBeVisible();
    await expect(wrong.locator('.zone-count')).toHaveText('0');
  });

  test('tap-to-place: tap an item, then its home', async ({ page }) => {
    await levelOne(page);
    const item = page.locator('.draggable').first();
    const category = await item.getAttribute('data-cat');
    const zone = await zoneFor(page, category);

    await touchTap(page, item);
    await expect(item).toHaveClass(/selected/);

    await touchTap(page, zone);
    await expect(page.locator('.draggable')).toHaveCount(5);
    await expect(zone.locator('.zone-count')).toHaveText('1');
  });

  test('the green home helper shows for the first five placements, then retires', async ({ page }) => {
    test.setTimeout(60000);
    await levelOne(page);

    for (let placed = 0; placed < 5; placed++) {
      const item = page.locator('.draggable').first();
      const category = await item.getAttribute('data-cat');
      await touchTap(page, item);
      await expect(item).toHaveClass(/selected/);

      const helper = page.locator('.zone.helper');
      await expect(helper).toHaveCount(1);
      await expect(helper.locator('.ok-mark')).toBeVisible();

      await touchTap(page, await zoneFor(page, category));
      await expect(page.locator('.draggable')).toHaveCount(5 - placed);
    }

    const last = page.locator('.draggable').first();
    await touchTap(page, last);
    await expect(last).toHaveClass(/selected/);
    await expect(page.locator('.zone.helper')).toHaveCount(0);
    await expect(page.locator('.ok-mark')).toHaveCount(0);
  });

  test('clearing the room wins and Next Level starts a fresh round', async ({ page }) => {
    await levelOne(page);

    for (let n = 0; n < 6; n++) {
      const item = page.locator('.draggable').first();
      const category = await item.getAttribute('data-cat');
      await touchTap(page, item);
      await touchTap(page, await zoneFor(page, category));
      await expect(page.locator('.draggable')).toHaveCount(5 - n, { timeout: 4000 });
    }

    await expect(page.locator('.win-overlay')).toBeVisible({ timeout: 6000 });
    await page.getByTestId('next-level').click();

    await expect(page.locator('.zone')).toHaveCount(2);
    await expect(page.locator('.draggable')).toHaveCount(6);
    await expect(page.locator('.zone-count').first()).toHaveText('0');
  });

  test('level switch grows the room to three homes', async ({ page }) => {
    await levelOne(page);
    await page.locator('.ladder-step').nth(4).click();
    await expect(page.locator('.zone')).toHaveCount(3);
    await expect(page.locator('.draggable')).toHaveCount(8);
  });
});
