import { test, expect } from '@playwright/test';

const ROOT = '[data-testid="soccer-root"]';
const FIELD = '[data-testid="soccer-field"]';
const CALL = '[data-testid="soccer-callout"]';

async function fieldBox(page) {
  const box = await page.locator(FIELD).boundingBox();
  if (!box) throw new Error('soccer field has no box');
  return box;
}

/** The live open-side aim the route exposes for tests and aim aids. */
async function openAim(page) {
  const field = page.locator(FIELD);
  return {
    x: parseFloat(await field.getAttribute('data-open-x')),
    y: parseFloat(await field.getAttribute('data-open-y'))
  };
}

async function keeperX(page) {
  return parseFloat(await page.locator('.keeper').getAttribute('data-x'));
}

async function swipeTo(page, endFn) {
  const box = await fieldBox(page);
  const startX = box.x + box.width * 0.5;
  const startY = box.y + box.height * 0.7;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.waitForTimeout(25);
  // Read the moving keeper after the finger is down, so the end point is the
  // open side at nearly the release moment.
  const end = await endFn(box);
  await page.mouse.move(box.x + (end.x / 100) * box.width, box.y + (end.y / 100) * box.height, {
    steps: 5
  });
  await page.waitForTimeout(25);
  await page.mouse.up();
}

async function shootOpen(page) {
  // Read the open side right before the release so the patrolling keeper has
  // barely moved; the far corner room is much wider than that drift.
  await swipeTo(page, async () => openAim(page));
  await expect(page.locator(CALL)).toContainText('GOAL', { timeout: 4000 });
  await expect(page.locator(CALL)).toHaveCount(0, { timeout: 4000 });
}

async function shootAtKeeper(page) {
  await swipeTo(page, async () => ({ x: await keeperX(page), y: 10 }));
  // The dive now starts at release, before the ball reaches the keeper.
  await expect(page.locator('.keeper.diving')).toHaveCount(1);
  await expect(page.locator(CALL)).toContainText('SAVED', { timeout: 4000 });
  await expect(page.getByTestId('soccer-glove')).toBeVisible();
  await expect(page.locator('.keeper.diving')).toHaveCount(1);
  await expect(page.locator(CALL)).toHaveCount(0, { timeout: 4000 });
  await expect(page.getByTestId('soccer-glove')).toHaveCount(0);
}

async function shootWide(page) {
  await swipeTo(page, async () => ({ x: 4, y: 10 }));
  // A shot that never enters the mouth leaves the keeper standing.
  await expect(page.locator('.keeper.diving')).toHaveCount(0);
  await expect(page.locator(CALL)).toContainText('MISS', { timeout: 4000 });
  await expect(page.locator(CALL)).toHaveCount(0, { timeout: 4000 });
}

test.describe('Soccer — the Night Penalty', () => {
  test('opens as a night stadium with a goal, a net, a keeper, a striker and five pips', async ({
    page
  }) => {
    await page.goto('/games/soccer');
    const root = page.getByTestId('soccer-root');
    await expect(root).toHaveAttribute('data-level', '1');
    await expect(root).toHaveAttribute('data-state', 'playing');
    await expect(root).toHaveAttribute('data-shots', '5');
    await expect(root).toHaveAttribute('data-target', '3');
    await expect(page.locator(FIELD)).toBeVisible();
    await expect(page.locator('.goal')).toBeVisible();
    await expect(page.locator('.goal .net')).toBeVisible();
    await expect(page.locator('.keeper')).toBeVisible();
    await expect(page.locator('.keeper svg')).toBeVisible();
    await expect(page.locator('.striker svg')).toBeVisible();
    await expect(page.locator('.ball')).toBeVisible();
    await expect(page.locator('.pips')).toHaveCount(1);
    await expect(page.locator('.pips .pip')).toHaveCount(5);
    await expect(page.locator('.open-glow')).toHaveCount(1);
    await expect(page.getByTestId('soccer-hint')).toContainText('Swipe anywhere');
    await expect(page.locator('.ladder-step')).toHaveCount(10);
    await expect(page.locator('[data-testid="soccer-stars"] .star')).toHaveCount(3);
    await expect(page.locator('[data-testid="soccer-stars"] .star.on')).toHaveCount(0);
    await expect(page.getByTestId('soccer-status')).not.toBeEmpty();
  });

  test('the local star row sits above the shared ladder and the ladder has no stars', async ({
    page
  }) => {
    await page.goto('/games/soccer');
    const stars = await page.getByTestId('soccer-stars').boundingBox();
    const ladder = await page.locator('.ladder-bar').boundingBox();
    expect(stars.y + stars.height).toBeLessThanOrEqual(ladder.y + 1);
    await expect(page.locator('.ladder-bar .star')).toHaveCount(0);
    await expect(page.getByTestId('soccer-stars')).toHaveAttribute('aria-label', 'Best stars: 0 of 3');
  });

  test('a swipe into the open side scores, the net flashes and the pips update', async ({
    page
  }) => {
    await page.goto('/games/soccer');
    await shootOpen(page);
    const root = page.getByTestId('soccer-root');
    await expect(root).toHaveAttribute('data-goals', '1');
    await expect(root).toHaveAttribute('data-shots', '4');
    await expect(page.locator(CALL)).toHaveCount(0);
    await expect(page.locator('.pip.used')).toHaveCount(1);
    await expect(page.getByTestId('soccer-pips')).toHaveAttribute('data-goals', '1');
    await expect(page.getByTestId('soccer-pips')).toHaveAttribute('data-shots', '4');
  });

  test('a swipe at the keeper is a save and a wide swipe is a calm miss', async ({ page }) => {
    await page.goto('/games/soccer');
    await shootAtKeeper(page);
    await expect(page.getByTestId('soccer-root')).toHaveAttribute('data-goals', '0');
    await expect(page.getByTestId('soccer-root')).toHaveAttribute('data-shots', '4');
    await expect(page.locator('.keeper.diving')).toHaveCount(0);
    await shootWide(page);
    await expect(page.getByTestId('soccer-root')).toHaveAttribute('data-shots', '3');
  });

  test('a stationary tap does not spend a shot', async ({ page }) => {
    await page.goto('/games/soccer');
    const box = await fieldBox(page);
    // A tap on the pitch, far from the ball: no pointer travel, no shot.
    await page.touchscreen.tap(box.x + box.width * 0.5, box.y + box.height * 0.45);
    await page.waitForTimeout(350);
    const root = page.getByTestId('soccer-root');
    await expect(root).toHaveAttribute('data-shots', '5');
    await expect(root).toHaveAttribute('data-goals', '0');
    await expect(page.locator(CALL)).toHaveCount(0);
    await expect(page.locator('.reticle')).toHaveCount(0);
  });

  test('a fast second swipe during the outcome window is ignored', async ({ page }) => {
    await page.goto('/games/soccer');
    const root = page.getByTestId('soccer-root');

    await swipeTo(page, async () => openAim(page));
    await expect(page.locator(CALL)).toContainText('GOAL', { timeout: 4000 });
    await expect(root).toHaveAttribute('data-shots', '4');
    await expect(root).toHaveAttribute('data-goals', '1');

    // The keeper is still frozen in the outcome window: a second swipe must
    // not fire at that frozen keeper.
    await swipeTo(page, async () => openAim(page));
    await page.waitForTimeout(150);
    await expect(root).toHaveAttribute('data-shots', '4');
    await expect(root).toHaveAttribute('data-goals', '1');
    await expect(page.locator(CALL)).toContainText('GOAL');

    // Once the window closes, the next real swipe counts again.
    await expect(page.locator(CALL)).toHaveCount(0, { timeout: 4000 });
    await swipeTo(page, async () => openAim(page));
    await expect(page.locator(CALL)).toContainText('GOAL', { timeout: 4000 });
    await expect(root).toHaveAttribute('data-shots', '3');
    await expect(root).toHaveAttribute('data-goals', '2');
  });

  test('all five shots are played even after the target is reached', async ({ page }) => {
    await page.goto('/games/soccer');
    const root = page.getByTestId('soccer-root');

    await shootOpen(page);
    await shootOpen(page);
    await shootOpen(page);
    // The target of three is already reached, but the round is not over.
    await expect(root).toHaveAttribute('data-goals', '3');
    await expect(root).toHaveAttribute('data-shots', '2');
    await expect(root).toHaveAttribute('data-state', 'playing');
    await expect(page.getByTestId('soccer-win')).toHaveCount(0);

    await shootWide(page);
    await expect(root).toHaveAttribute('data-shots', '1');
    await expect(root).toHaveAttribute('data-state', 'playing');
    await shootWide(page);

    await expect(root).toHaveAttribute('data-shots', '0');
    await expect(root).toHaveAttribute('data-state', 'won', { timeout: 5000 });
    await expect(page.getByTestId('soccer-win')).toBeVisible();
    await expect(page.getByTestId('soccer-win').locator('.win-title')).toContainText(
      'What a shot'
    );
    await expect(page.getByTestId('next-level')).toBeVisible();
    await expect(page.getByTestId('replay')).toBeVisible();

    await page.getByTestId('next-level').click();
    await expect(root).toHaveAttribute('data-level', '2');
    await expect(root).toHaveAttribute('data-state', 'playing');
    await expect(root).toHaveAttribute('data-shots', '5');
  });

  test('five goals earn three stars, saved per level and kept after a reload', async ({
    page
  }) => {
    await page.goto('/games/soccer');
    for (let i = 0; i < 5; i += 1) await shootOpen(page);
    await expect(page.getByTestId('soccer-root')).toHaveAttribute('data-state', 'won', {
      timeout: 5000
    });
    await expect(page.getByTestId('soccer-root')).toHaveAttribute('data-best', '3');
    await expect(page.locator('[data-testid="soccer-stars"] .star.on')).toHaveCount(3);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('soccerStars')))).toEqual({
      1: 3
    });

    await page.reload();
    await expect(page.getByTestId('soccer-root')).toHaveAttribute('data-best', '3');
    await expect(page.locator('[data-testid="soccer-stars"] .star.on')).toHaveCount(3);
    await expect(page.getByTestId('soccer-root')).toHaveAttribute('data-state', 'playing');
    await expect(page.getByTestId('soccer-stars')).toHaveAttribute('aria-label', 'Best stars: 3 of 3');
  });

  test('a better round sets the best; a lower round never removes it', async ({ page }) => {
    await page.goto('/games/soccer');
    await shootOpen(page);
    await shootOpen(page);
    await shootOpen(page);
    await shootOpen(page);
    await shootWide(page);
    await expect(page.getByTestId('soccer-root')).toHaveAttribute('data-state', 'won', {
      timeout: 5000
    });
    await expect(page.getByTestId('soccer-root')).toHaveAttribute('data-best', '2');
    await expect(page.locator('[data-testid="soccer-stars"] .star.on')).toHaveCount(2);

    await page.getByTestId('replay').click();
    await expect(page.getByTestId('soccer-root')).toHaveAttribute('data-state', 'playing');
    await shootOpen(page);
    await shootOpen(page);
    await shootOpen(page);
    await shootWide(page);
    await shootWide(page);
    await expect(page.getByTestId('soccer-root')).toHaveAttribute('data-state', 'won', {
      timeout: 5000
    });
    await expect(page.getByTestId('soccer-root')).toHaveAttribute('data-best', '2');
  });

  test('missing the target shows the calm Good Try with try again and back', async ({ page }) => {
    await page.goto('/games/soccer');
    for (let i = 0; i < 5; i += 1) await shootWide(page);

    const root = page.getByTestId('soccer-root');
    await expect(root).toHaveAttribute('data-shots', '0');
    await expect(root).toHaveAttribute('data-state', 'good', { timeout: 5000 });
    const card = page.getByTestId('soccer-card');
    await expect(card).toBeVisible();
    await expect(card).toContainText('Good try');
    await expect(card).toContainText('You scored 0');
    await expect(page.getByTestId('soccer-win')).toHaveCount(0);
    await expect(page.locator('[data-testid="soccer-stars"] .star.on')).toHaveCount(0);
    await expect(page.getByTestId('soccer-back')).toHaveAttribute('href', '/');

    await card.getByRole('button', { name: 'Try Again' }).click();
    await expect(root).toHaveAttribute('data-state', 'playing');
    await expect(root).toHaveAttribute('data-shots', '5');
    await expect(page.getByTestId('soccer-card')).toHaveCount(0);
  });

  test('the ladder switches levels, saves the choice and resets the round', async ({ page }) => {
    await page.goto('/games/soccer');
    await page.locator('.ladder-step').nth(4).click();
    const root = page.getByTestId('soccer-root');
    await expect(root).toHaveAttribute('data-level', '5');
    await expect(root).toHaveAttribute('data-target', '4');
    await expect(root).toHaveAttribute('data-shots', '5');
    await expect(root).toHaveAttribute('data-best', '0');
    expect(await page.evaluate(() => localStorage.getItem('soccerLevel'))).toBe('5');
    await expect(page.locator('.open-glow')).toHaveCount(0);

    await page.locator('.ladder-step').nth(1).click();
    await expect(root).toHaveAttribute('data-level', '2');
    await expect(root).toHaveAttribute('data-target', '3');
    await expect(page.locator('.open-glow')).toHaveCount(1);
  });

  test('level 10 keeps the mastery moment and asks for five goals', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('soccerLevel', '10'));
    await page.goto('/games/soccer');
    const root = page.getByTestId('soccer-root');
    await expect(root).toHaveAttribute('data-level', '10');
    await expect(root).toHaveAttribute('data-target', '5');
    for (let i = 0; i < 5; i += 1) await shootOpen(page);

    await expect(root).toHaveAttribute('data-state', 'won', { timeout: 5000 });
    await expect(page.getByTestId('soccer-win')).toBeVisible();
    await expect(page.getByTestId('ladder-done')).toHaveText('🎓');
    await expect(page.getByTestId('next-level')).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('soccerMastered'))).toBe('1');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('soccerStars')))).toEqual({
      10: 3
    });
  });

  test('the reticle and dashed arc show the impact point while the finger drags', async ({
    page
  }) => {
    await page.goto('/games/soccer');
    const box = await fieldBox(page);
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.7);
    await page.mouse.down();
    await page.waitForTimeout(30);
    const aim = await openAim(page);
    await page.mouse.move(box.x + (aim.x / 100) * box.width, box.y + (aim.y / 100) * box.height, {
      steps: 4
    });
    await expect(page.locator('.reticle')).toBeVisible();
    await expect(page.locator('.aim path')).toBeVisible();
    const reticle = await page.locator('.reticle').boundingBox();
    const expectedX = box.x + (aim.x / 100) * box.width;
    const expectedY = box.y + (aim.y / 100) * box.height;
    expect(Math.abs(reticle.x + reticle.width / 2 - expectedX)).toBeLessThan(6);
    expect(Math.abs(reticle.y + reticle.height / 2 - expectedY)).toBeLessThan(6);
    await expect(page.getByTestId('soccer-aim')).toContainText('On target');
    await expect(page.getByTestId('soccer-aim')).toContainText('Aim:');

    // A wide drag is announced as off target, then the open side is on target.
    await page.mouse.move(box.x + box.width * 0.04, box.y + box.height * 0.1, { steps: 3 });
    await expect(page.getByTestId('soccer-aim')).toContainText('Off target');
    await page.mouse.move(box.x + (aim.x / 100) * box.width, box.y + (aim.y / 100) * box.height, {
      steps: 3
    });
    await expect(page.getByTestId('soccer-aim')).toContainText('On target');
    await page.mouse.up();
  });

  test('a touch swipe released outside the field still shoots', async ({ page }) => {
    await page.goto('/games/soccer');
    const box = await fieldBox(page);
    const x0 = box.x + box.width * 0.5;
    const y0 = box.y + box.height * 0.7;
    const aim = await openAim(page);

    await page.locator(FIELD).dispatchEvent('pointerdown', {
      pointerId: 13,
      pointerType: 'touch',
      isPrimary: true,
      clientX: x0,
      clientY: y0,
      buttons: 1,
      bubbles: true,
      cancelable: true
    });
    for (let i = 1; i <= 6; i += 1) {
      await page.dispatchEvent(':root', 'pointermove', {
        pointerId: 13,
        pointerType: 'touch',
        isPrimary: true,
        clientX: x0 + ((box.x + (aim.x / 100) * box.width - x0) * i) / 6,
        clientY: y0 + ((box.y + (aim.y / 100) * box.height - y0) * i) / 6,
        buttons: 1,
        bubbles: true,
        cancelable: true
      });
    }
    await expect(page.locator('.reticle')).toBeVisible();
    // Lift far above the field: the shot still fires from the released aim.
    await page.dispatchEvent(':root', 'pointerup', {
      pointerId: 13,
      pointerType: 'touch',
      isPrimary: true,
      clientX: box.x + (aim.x / 100) * box.width,
      clientY: box.y - 60,
      buttons: 1,
      bubbles: true,
      cancelable: true
    });
    await expect(page.getByTestId('soccer-root')).toHaveAttribute('data-shots', '4');
    await expect(page.locator(CALL)).toBeVisible({ timeout: 4000 });
  });

  test('reduced motion calms the floodlights and crowd, stops the ball spin and still plays', async ({
    page
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/games/soccer');
    await expect(page.locator('.stadium')).toHaveClass(/reduced/);
    const floodlight = await page
      .locator('.floodlight')
      .first()
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(floodlight).toBe('none');
    const crowd = await page
      .locator('.crowd')
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(crowd).toBe('none');

    await swipeTo(page, async () => openAim(page));
    const spun = await page.evaluate(async () => {
      const el = document.querySelector('.ball-spin');
      let seen = false;
      for (let i = 0; i < 25; i += 1) {
        if (el?.classList.contains('spin')) seen = true;
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      return seen;
    });
    expect(spun).toBe(false);
    await expect(page.locator(CALL)).toContainText('GOAL', { timeout: 4000 });
  });

  test('the ball spins during a normal shot', async ({ page }) => {
    await page.goto('/games/soccer');
    await swipeTo(page, async () => openAim(page));
    const spun = await page.evaluate(async () => {
      const el = document.querySelector('.ball-spin');
      let seen = false;
      for (let i = 0; i < 35; i += 1) {
        if (el?.classList.contains('spin')) seen = true;
        await new Promise((resolve) => setTimeout(resolve, 15));
      }
      return seen;
    });
    expect(spun).toBe(true);
  });

  test('a win after a fifth-shot miss gets the positive stadium cheer', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript(() => {
      window.__tones = 0;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const create = Ctx.prototype.createOscillator;
      Ctx.prototype.createOscillator = function (...args) {
        window.__tones += 1;
        return create.apply(this, args);
      };
    });
    await page.goto('/games/soccer');
    await shootOpen(page);
    await shootOpen(page);
    await shootOpen(page);
    await shootWide(page);

    // The fifth shot is a miss but the target was already reached.
    await swipeTo(page, async () => ({ x: 4, y: 10 }));
    await expect(page.locator(CALL)).toContainText('MISS', { timeout: 4000 });
    const atMiss = await page.evaluate(() => window.__tones);
    await expect(page.getByTestId('soccer-win')).toBeVisible({ timeout: 5000 });
    const atWin = await page.evaluate(() => window.__tones);

    // The miss itself is a noise-only whoosh; the only new tones belong to the
    // positive stadium cheer that opens the win card.
    expect(atWin).toBeGreaterThan(atMiss);
    expect(errors).toEqual([]);
  });

  test('the sound toggle mutes the stadium cues with no errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript(() => {
      window.__tones = 0;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const create = Ctx.prototype.createOscillator;
      Ctx.prototype.createOscillator = function (...args) {
        window.__tones += 1;
        return create.apply(this, args);
      };
    });
    await page.goto('/games/soccer');

    await shootWide(page);
    await expect
      .poll(() => page.evaluate(() => window.__tones), { timeout: 3000 })
      .toBeGreaterThan(0);

    await page.locator('.sound-btn').click();
    expect(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem('kids-games-settings')).soundEnabled
      )
    ).toBe(false);

    const before = await page.evaluate(() => window.__tones);
    await shootWide(page);
    expect(await page.evaluate(() => window.__tones)).toBe(before);
    expect(errors).toEqual([]);
  });

  test('fits 320×568 and 390×844 with the whole goal and striker visible', async ({ page }) => {
    for (const viewport of [
      { width: 320, height: 568 },
      { width: 390, height: 844 }
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/games/soccer');
      await expect(page.locator(FIELD)).toBeVisible();
      await expect(page.locator('.goal')).toBeVisible();
      await expect(page.locator('.keeper')).toBeVisible();
      await expect(page.locator('.striker svg')).toBeVisible();
      await expect(page.locator('.ball')).toBeVisible();
      await expect(page.locator('.ladder-bar')).toBeVisible();
      await expect(page.locator('.ladder-step')).toHaveCount(10);

      const box = await fieldBox(page);
      for (const selector of ['.goal', '.ball', '.striker']) {
        const el = await page.locator(selector).boundingBox();
        expect(el.x).toBeGreaterThanOrEqual(box.x - 1);
        expect(el.x + el.width).toBeLessThanOrEqual(box.x + box.width + 1);
        expect(el.y).toBeGreaterThanOrEqual(box.y - 1);
        expect(el.y + el.height).toBeLessThanOrEqual(box.y + box.height + 1);
      }

      const steps = page.locator('.ladder-step');
      const ladderTops = new Set();
      for (let i = 0; i < 10; i += 1) {
        const step = steps.nth(i);
        await expect(step).toBeVisible();
        const stepBox = await step.boundingBox();
        expect(stepBox.x).toBeGreaterThanOrEqual(0);
        expect(stepBox.x + stepBox.width).toBeLessThanOrEqual(viewport.width + 0.5);
        expect(stepBox.width).toBeGreaterThanOrEqual(24);
        ladderTops.add(Math.round(stepBox.y));
      }
      expect(ladderTops.size).toBe(1);

      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth
      }));
      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.innerWidth + 1);

      await shootOpen(page);
      await expect(page.getByTestId('soccer-root')).toHaveAttribute('data-goals', '1');
    }
  });

  test('leaving mid-round returns to the hub cleanly', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/games/soccer');
    await shootWide(page);
    await page.goto('/');
    await expect(page.locator('.hub')).toBeVisible();
    expect(errors).toEqual([]);
  });
});
