import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'node:url';

// Fixtures live next to the specs so the upload pipeline gets real bytes.
const PHOTO = fileURLToPath(new URL('../fixtures/photo.png', import.meta.url));
const NOT_A_PHOTO = fileURLToPath(new URL('../fixtures/not-a-photo.bin', import.meta.url));

// ParentGate unlocks only after a continuous 3s press, measured with rAF, so the
// hold has to burn real wall-clock time. These are the two probes either side of
// the threshold (1s must stay locked, 3.2s must unlock).
const HOLD_TOO_SHORT_MS = 1000;
const HOLD_UNLOCKS_MS = 3200;

// The gate handler lives on `.gp-gate` (the `.gp-lock-card` is just its wrapper),
// exactly like `GP-touch-pickup` dispatches on the element that owns the handler.
async function holdGate(page, ms) {
  const gate = page.locator('.gp-lock-card .gp-gate');
  const box = await gate.boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const init = {
    pointerId: 41,
    pointerType: 'touch',
    isPrimary: true,
    clientX: x,
    clientY: y,
    buttons: 1,
    bubbles: true,
    cancelable: true,
  };
  await gate.dispatchEvent('pointerdown', init);
  await page.waitForTimeout(ms);
  await gate.dispatchEvent('pointerup', init);
}

// Open the parent gate: the lock card only exists under the My Photos chip.
async function openManager(page) {
  await page.locator('.gp-cat-btn[data-cat="myPhotos"]').click();
  await expect(page.locator('.gp-lock-card')).toBeVisible();
  await holdGate(page, HOLD_UNLOCKS_MS);
  await expect(page.locator('.gp-photos-manager')).toBeVisible();
}

// Add the fixture photo and hand back the merged gallery id (`photo:<uuid>`).
async function addPhotoAndGetId(page) {
  await openManager(page);
  await page.locator('.gp-photos-input').setInputFiles(PHOTO);
  await expect(page.locator('.gp-photo-item')).toHaveCount(1);
  await page.locator('.gp-photos-close').click();
  await expect(page.locator('.gp-photos-manager')).toBeHidden();
  const card = page.locator('.gp-image-card[data-id^="photo:"]');
  await expect(card).toBeVisible();
  return card.getAttribute('data-id');
}

test.describe('Glossary Puzzle — My Photos', () => {
  test('gate: a 1s hold stays locked, a 3.2s hold opens the manager', async ({ page }) => {
    await page.goto('/games/glossary-puzzle');
    await page.locator('.gp-cat-btn[data-cat="myPhotos"]').click();
    await expect(page.locator('.gp-lock-card')).toBeVisible();

    await holdGate(page, HOLD_TOO_SHORT_MS);
    await expect(page.locator('.gp-photos-manager')).toBeHidden();

    await holdGate(page, HOLD_UNLOCKS_MS);
    await expect(page.locator('.gp-photos-manager')).toBeVisible();
  });

  test('add a photo, preview it, and start the puzzle', async ({ page }) => {
    await page.goto('/games/glossary-puzzle');
    await openManager(page);
    await page.locator('.gp-photos-input').setInputFiles(PHOTO);
    await expect(page.locator('.gp-photo-item')).toHaveCount(1);
    await page.locator('.gp-photos-close').click();
    await expect(page.locator('.gp-photos-manager')).toBeHidden();

    await page.locator('.gp-cat-btn[data-cat="myPhotos"]').click();
    const card = page.locator('.gp-image-card[data-id^="photo:"]');
    await expect(card).toBeVisible();
    await card.click();

    await expect(page.locator('.gp-preview')).toBeVisible();
    const href = await page.locator('.gp-preview-start').getAttribute('href');
    expect(href).toMatch(/\/play\/1\?image=photo/);
    const id = new URL(href, 'http://localhost').searchParams.get('image');
    expect(id).toMatch(/^photo:/);

    // the ✕ must sit above the picture and close the overlay
    await page.locator('.gp-preview-close').click();
    await expect(page.locator('.gp-preview')).toBeHidden();
  });

  test('a non-image file shows an error and adds nothing', async ({ page }) => {
    await page.goto('/games/glossary-puzzle');
    await openManager(page);
    const items = page.locator('.gp-photo-item');
    await expect(items).toHaveCount(0);

    await page.locator('.gp-photos-input').setInputFiles(NOT_A_PHOTO);
    await expect(page.locator('.gp-photos-error')).toBeVisible();
    await expect(items).toHaveCount(0);
  });

  test('resume continues a photo puzzle from the gallery', async ({ page }) => {
    await page.goto('/games/glossary-puzzle');
    const id = await addPhotoAndGetId(page);

    await page.goto(`/games/glossary-puzzle/play/1?image=${id}&place=0-0&debug=1`);
    await expect(page.locator('.gp-top-bar .hud-item')).toContainText('1/4');

    await page.goto('/games/glossary-puzzle');
    await expect(page.locator('.gp-resume-btn')).toBeVisible();
    await page.locator('.gp-resume-btn').click();
    await page.waitForURL(/resume=1/);
    await expect(page.locator('.gp-top-bar .hud-item')).toContainText('1/4');
  });

  test('solving a photo badges it, and a mastered builtin goes gold', async ({ page }) => {
    await page.goto('/games/glossary-puzzle');
    const id = await addPhotoAndGetId(page);

    await page.goto(`/games/glossary-puzzle/play/1?image=${id}&place=0-0,0-1,1-0,1-1&debug=1`);
    await expect(page.locator('.win-overlay')).toBeVisible({ timeout: 10000 });

    // Next Level ▶ must re-resolve the SAME photo on the L2 board: a fresh VM
    // (blob: URL) proves it is not a stale, already-revoked object URL.
    await page.locator('.gp-celebration-btn').nth(1).click();
    await page.waitForURL(/\/play\/2\?image=photo/);
    await expect(page.locator('.gp-board svg path')).toHaveCount(6);
    const trayHref = await page.locator('.gp-tray-piece svg image').first().getAttribute('href');
    expect(trayHref).toMatch(/^blob:/);

    // gallery: the solved photo shows the ✓ badge
    await page.goto('/games/glossary-puzzle');
    await expect(page.locator(`.gp-image-card[data-id="${id}"] .gp-badge-check`)).toBeVisible();

    // a builtin mastered at the top level shows the gold badge
    await page.evaluate(() =>
      localStorage.setItem('glossary-puzzle-solved', JSON.stringify({ garden: 10 }))
    );
    await page.goto('/games/glossary-puzzle?level=10');
    await expect(page.locator('.gp-image-card[data-id="garden"] .gp-badge-gold')).toBeVisible();
  });

  test('deleting the saved photo clears the continue card and degrades to a fallback', async ({ page }) => {
    await page.goto('/games/glossary-puzzle');
    const id = await addPhotoAndGetId(page);

    // a real save for the photo, as if the child placed one piece
    await page.goto(`/games/glossary-puzzle/play/1?image=${id}&place=0-0&debug=1`);
    await expect(page.locator('.gp-top-bar .hud-item')).toContainText('1/4');

    await page.goto('/games/glossary-puzzle');
    await expect(page.locator('.gp-resume-btn')).toBeVisible();

    await openManager(page);
    await expect(page.locator('.gp-photo-item')).toHaveCount(1);
    await page.locator('.gp-photo-del').click();
    await expect(page.locator('.gp-photo-item')).toHaveCount(0);
    await page.locator('.gp-photos-close').click();
    await expect(page.locator('.gp-photos-manager')).toBeHidden();

    // no dangling continue card, no crash
    await expect(page.locator('.gp-gallery')).toBeVisible();
    await expect(page.locator('.gp-resume-btn')).toHaveCount(0);

    // the deleted photo's resume URL renders the fallback image, save cleared
    await page.goto(`/games/glossary-puzzle/play/1?image=${id}&resume=1`);
    await expect(page.locator('.gp-board')).toBeVisible();
    await expect(page.locator('.gp-tray-piece')).toHaveCount(4);
    const trayHref = await page.locator('.gp-tray-piece svg image').first().getAttribute('href');
    expect(trayHref).toContain('01-garden.jpg');
    expect(await page.evaluate(() => localStorage.getItem('glossary-puzzle-save'))).toBeNull();
  });

  test('a character SVG builtin renders on the board and in the tray', async ({ page }) => {
    await page.goto('/games/glossary-puzzle/play/3?image=vc-train');
    await expect(page.locator('.gp-board')).toBeVisible();
    // L3 => 3x3 => 9 ghost outline paths
    await expect(page.locator('.gp-board svg path')).toHaveCount(9);
    const trayHref = await page.locator('.gp-tray-piece svg image').first().getAttribute('href');
    expect(trayHref).toContain('vc-train.svg');
  });
});
