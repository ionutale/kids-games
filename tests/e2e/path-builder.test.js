import { test, expect } from '@playwright/test';

const SCENE = '[data-testid="scene"]';
/** Mirrors BLOCKER_PAD in the scene model: the Road's visible half-width. */
const BLOCKER_PAD = 11;

function pointer(x, y, extra = {}) {
  return {
    pointerId: 7,
    pointerType: 'touch',
    isPrimary: true,
    clientX: x,
    clientY: y,
    buttons: 1,
    bubbles: true,
    cancelable: true,
    ...extra
  };
}

/** Map a scene-space point (0..620 × 0..1000) to viewport coordinates. */
async function sceneToClient(page, point) {
  return page.evaluate(({ x, y }) => {
    const svg = document.querySelector('[data-testid="scene"]');
    const ctm = svg.getScreenCTM();
    const mapped = new DOMPoint(x, y).matrixTransform(ctm);
    return { x: mapped.x, y: mapped.y };
  }, point);
}

/** Read a landmark's scene coordinates from its stable data hook. */
async function landmark(page, testid) {
  const node = page.getByTestId(testid);
  return {
    x: Number(await node.getAttribute('data-x')),
    y: Number(await node.getAttribute('data-y'))
  };
}

async function drawStroke(page, points) {
  const first = await sceneToClient(page, points[0]);
  await page.dispatchEvent(SCENE, 'pointerdown', pointer(first.x, first.y));
  let last = first;
  for (const point of points.slice(1)) {
    last = await sceneToClient(page, point);
    await page.dispatchEvent(':root', 'pointermove', pointer(last.x, last.y));
    await page.waitForTimeout(24);
  }
  await page.dispatchEvent(':root', 'pointerup', pointer(last.x, last.y));
  await page.waitForTimeout(120);
}

function lerp(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/** Last point of the drawn road, in scene space. */
async function roadTip(page) {
  return page.evaluate(() => {
    const d = document.querySelector('[data-testid="road"]').getAttribute('d') ?? '';
    const segments = d.trim().split('L');
    const last = segments[segments.length - 1];
    const [x, y] = last.split(' ').map(Number);
    return { x, y };
  });
}

async function roadPoints(page) {
  return page.evaluate(() => {
    const d = document.querySelector('[data-testid="road"]').getAttribute('d') ?? '';
    if (!d) return [];
    return d
      .trim()
      .split(/[ML]/)
      .filter(Boolean)
      .map((pair) => {
        const [x, y] = pair.trim().split(' ').map(Number);
        return { x, y };
      });
  });
}

/** Sample the Guide polyline rendered from the Scene. */
async function guideRoute(page) {
  const d = await page.getByTestId('guide').getAttribute('d');
  return d
    .trim()
    .split(/[ML]/)
    .filter(Boolean)
    .map((pair) => {
      const [x, y] = pair.trim().split(' ').map(Number);
      return { x, y };
    });
}

function segmentDistance(a, b, c) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((c.x - a.x) * dx + (c.y - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(c.x - (a.x + dx * t), c.y - (a.y + dy * t));
}

function blockersClearance(points, blockers) {
  let min = Infinity;
  for (const blocker of blockers) {
    for (let i = 1; i < points.length; i += 1) {
      min = Math.min(min, segmentDistance(points[i - 1], points[i], blocker) - blocker.r);
    }
  }
  return min;
}

/**
 * Push a smooth bulge into the Guide around one Star so the drawn road passes
 * wide of it while still staying clear of every Blocker.
 */
function detourAround(route, star, blockers, amount = 76) {
  let index = 0;
  route.forEach((p, i) => {
    if (Math.hypot(p.x - star.x, p.y - star.y) < Math.hypot(route[index].x - star.x, route[index].y - star.y)) {
      index = i;
    }
  });
  const a = route[Math.max(0, index - 1)];
  const b = route[Math.min(route.length - 1, index + 1)];
  let nx = -(b.y - a.y);
  let ny = b.x - a.x;
  const len = Math.hypot(nx, ny) || 1;
  nx /= len;
  ny /= len;

  const build = (side) =>
    route.map((p, i) => {
      const weight = Math.exp(-(((i - index) / 3.4) ** 2));
      return { x: p.x + nx * weight * amount * side, y: p.y + ny * weight * amount * side };
    });

  const options = [1, -1]
    .map(build)
    .filter((points) => points.every((p) => p.x > 16 && p.x < 604 && p.y > 16 && p.y < 984));
  options.sort((one, two) => blockersClearance(two, blockers) - blockersClearance(one, blockers));
  return options[0];
}

async function expectPortraitFit(page, width, height) {
  await page.setViewportSize({ width, height });
  await page.goto('/games/path-builder');
  await expect(page.getByTestId('scene')).toBeVisible();
  await expect(page.getByTestId('home')).toBeVisible();
  await expect(page.getByTestId('destination')).toBeVisible();

  const fit = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    board: document.querySelector('[data-testid="scene"]').getBoundingClientRect().toJSON()
  }));
  expect(fit.scrollWidth).toBeLessThanOrEqual(fit.innerWidth + 1);
  expect(fit.board.width).toBeGreaterThan(200);
  expect(fit.board.height).toBeGreaterThan(280);
}

test.describe('Path Builder — Forest Road', () => {
  test('drawing a road makes the fox walk it and solves the layout', async ({ page }) => {
    await page.goto('/games/path-builder');
    await expect(page.getByTestId('scene')).toBeVisible();

    const root = page.getByTestId('pb-root');
    await expect(root).toHaveAttribute('data-level', '1');
    await expect(root).toHaveAttribute('data-road', '1');
    // No press yet: the page starts in the explicit idle state.
    await expect(root).toHaveAttribute('data-state', 'idle');
    // The pointer-only board is not an application widget, and the game owns a
    // single live region (the status line) besides SvelteKit's route announcer.
    await expect(page.getByTestId('scene')).toHaveAttribute('role', 'img');
    await expect(page.getByTestId('pb-root').locator('[aria-live]')).toHaveCount(1);

    const home = await landmark(page, 'home');
    const dest = await landmark(page, 'destination');

    const before = await page.getByTestId('walker').getAttribute('data-x');
    await drawStroke(page, [
      home,
      lerp(home, dest, 0.22),
      lerp(home, dest, 0.45),
      lerp(home, dest, 0.7),
      dest
    ]);

    // The road persists after the finger lifts.
    expect((await roadPoints(page)).length).toBeGreaterThan(3);

    // The fox travels: its screen position changes during the walk.
    await expect
      .poll(async () => page.getByTestId('walker').getAttribute('data-x'), { timeout: 4000 })
      .not.toBe(before);

    // Arriving solves the layout and auto-advances to the next road. Catch the
    // solved state first: it only holds for the 1.5s auto-advance window.
    await expect(root).toHaveAttribute('data-state', 'solved', { timeout: 8000 });
    await expect(page.getByTestId('round-done')).toBeVisible();
    await expect(page.getByTestId('round-done')).toContainText('fox');
    await expect(root).toHaveAttribute('data-road', '2', { timeout: 6000 });
  });

  test('a stroke into a Rock stops at its drawn edge and never enters it', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('pathBuilderLevel', '3'));
    await page.goto('/games/path-builder');

    const blocker = page.getByTestId('blocker').first();
    await expect(blocker).toBeVisible();
    const center = {
      x: Number(await blocker.getAttribute('data-x')),
      y: Number(await blocker.getAttribute('data-y'))
    };
    const radius = Number(await blocker.getAttribute('data-r'));
    // The art is scaled so its drawn radius is the collision radius.
    expect(Number(await blocker.getAttribute('data-art')) / 2).toBeGreaterThan(radius);
    const home = await landmark(page, 'home');

    await drawStroke(page, [
      home,
      lerp(home, center, 0.45),
      lerp(home, center, 0.8),
      center
    ]);

    const tip = await roadTip(page);
    const distance = Math.hypot(tip.x - center.x, tip.y - center.y);
    expect(distance).toBeGreaterThan(radius + BLOCKER_PAD - 2);
    expect(distance).toBeLessThan(radius + BLOCKER_PAD + 8);

    const inside = (await roadPoints(page)).filter(
      (p) => Math.hypot(p.x - center.x, p.y - center.y) < radius
    );
    expect(inside).toEqual([]);
  });

  test('lifting at a Rock and drawing around it still completes the road', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('pathBuilderLevel', '3'));
    await page.goto('/games/path-builder');

    const blocker = page.getByTestId('blocker').first();
    await expect(blocker).toBeVisible();
    const center = {
      x: Number(await blocker.getAttribute('data-x')),
      y: Number(await blocker.getAttribute('data-y'))
    };
    const radius = Number(await blocker.getAttribute('data-r'));
    const home = await landmark(page, 'home');
    const dest = await landmark(page, 'destination');

    // Stroke straight into the rock and lift.
    await drawStroke(page, [home, lerp(home, center, 0.5), lerp(home, center, 0.85), center]);
    const tip = await roadTip(page);
    expect(Math.hypot(tip.x - center.x, tip.y - center.y)).toBeGreaterThan(radius + BLOCKER_PAD - 2);

    // The next stroke starts on that edge and goes around the rock. Before the
    // fix every later segment counted as a fresh hit and the road froze here.
    const startAngle = Math.atan2(tip.y - center.y, tip.x - center.x);
    const arcRadius = radius + BLOCKER_PAD + 26;

    const arcFor = (direction) =>
      Array.from({ length: 12 }, (_, i) => {
        const angle = startAngle + direction * ((i + 1) / 12) * (Math.PI * 1.1);
        return { x: center.x + Math.cos(angle) * arcRadius, y: center.y + Math.sin(angle) * arcRadius };
      });

    const options = [1, -1]
      .map((direction) => ({ direction, arc: arcFor(direction) }))
      .filter(({ arc }) => arc.every((p) => p.x > 20 && p.x < 600 && p.y > 20 && p.y < 980));
    expect(options.length).toBeGreaterThan(0);
    options.sort((one, two) => {
      const end = (arc) => Math.hypot(arc[arc.length - 1].x - dest.x, arc[arc.length - 1].y - dest.y);
      return end(one.arc) - end(two.arc);
    });
    const around = options[0].arc;

    await drawStroke(page, [tip, ...around, dest]);

    // The road continued past the rock and reached the cabin.
    await expect(page.getByTestId('round-done')).toBeVisible({ timeout: 8000 });
    const road = await roadPoints(page);
    expect(road.length).toBeGreaterThan(8);
    expect(
      road.filter((p) => Math.hypot(p.x - center.x, p.y - center.y) < radius)
    ).toEqual([]);
  });

  test('pressing near an earlier road point truncates the road there', async ({ page }) => {
    await page.goto('/games/path-builder');
    const home = await landmark(page, 'home');
    const dest = await landmark(page, 'destination');

    await drawStroke(page, [
      home,
      lerp(home, dest, 0.25),
      lerp(home, dest, 0.5),
      lerp(home, dest, 0.75)
    ]);
    const before = await roadPoints(page);
    expect(before.length).toBe(4);
    const target = before[1];

    // Press on the second point and pull away: everything after it is erased.
    const at = await sceneToClient(page, target);
    await page.dispatchEvent(SCENE, 'pointerdown', pointer(at.x, at.y));
    const away = await sceneToClient(page, { x: target.x + 44, y: target.y - 30 });
    await page.dispatchEvent(':root', 'pointermove', pointer(away.x, away.y));
    await page.dispatchEvent(':root', 'pointerup', pointer(away.x, away.y));
    await page.waitForTimeout(120);

    const after = await roadPoints(page);
    expect(after.length).toBe(3);
    expect(after[0]).toEqual(before[0]);
    expect(after[1]).toEqual(before[1]);
    expect(Math.hypot(after[2].x - target.x - 44, after[2].y - target.y + 30)).toBeLessThan(3);
    // The layout did not advance: the road is still being edited.
    await expect(page.getByTestId('pb-root')).toHaveAttribute('data-road', '1');
  });

  test('Redraw clears the road and sends the fox back Home', async ({ page }) => {
    await page.goto('/games/path-builder');
    const home = await landmark(page, 'home');
    const dest = await landmark(page, 'destination');

    await drawStroke(page, [home, lerp(home, dest, 0.3), lerp(home, dest, 0.55)]);
    await expect(page.getByTestId('road')).toHaveAttribute('data-points', '3');

    await page.locator('.pb-redraw').click();
    await expect(page.getByTestId('road')).toHaveAttribute('data-points', '0');
    const walker = page.getByTestId('walker');
    await expect.poll(async () => Number(await walker.getAttribute('data-x'))).toBeCloseTo(home.x, 0);
    await expect(page.getByTestId('pb-root')).toHaveAttribute('data-state', 'idle');
    await expect(page.getByTestId('pb-root')).toHaveAttribute('data-road', '1');

    // Playable again right away.
    await drawStroke(page, [home, lerp(home, dest, 0.5), dest]);
    await expect(page.getByTestId('round-done')).toBeVisible({ timeout: 6000 });
  });

  test('a press far from the tip continues the road instead of doing nothing', async ({ page }) => {
    await page.goto('/games/path-builder');
    const home = await landmark(page, 'home');
    const dest = await landmark(page, 'destination');

    await drawStroke(page, [home, lerp(home, dest, 0.3)]);
    expect((await roadPoints(page)).length).toBe(2);

    // Pull the road again from far away (well beyond CONTINUE_RADIUS) and
    // finish at the cabin. The start-anywhere rule bridges the gap.
    const far = lerp(home, dest, 0.62);
    const at = await sceneToClient(page, far);
    await page.dispatchEvent(SCENE, 'pointerdown', pointer(at.x, at.y));
    const end = await sceneToClient(page, dest);
    await page.dispatchEvent(':root', 'pointermove', pointer(end.x, end.y));
    await page.dispatchEvent(':root', 'pointerup', pointer(end.x, end.y));

    await expect(page.getByTestId('round-done')).toBeVisible({ timeout: 7000 });
    expect((await roadPoints(page)).length).toBeGreaterThan(2);
  });

  test('the ghost hand demonstrates the first road once per device', async ({ page }) => {
    await page.goto('/games/path-builder');
    await expect(page.getByTestId('ghost-hand')).toBeVisible({ timeout: 4000 });

    // Any press dismisses the demonstration and leaves the road playable.
    const home = await landmark(page, 'home');
    const at = await sceneToClient(page, home);
    await page.dispatchEvent(SCENE, 'pointerdown', pointer(at.x, at.y));
    await page.dispatchEvent(':root', 'pointerup', pointer(at.x, at.y));
    await expect(page.getByTestId('ghost-hand')).toHaveCount(0);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('path-builderGhostSeen')))
      .toBe('1');

    await page.reload();
    await expect(page.getByTestId('scene')).toBeVisible();
    await expect(page.getByTestId('ghost-hand')).toHaveCount(0);
  });

  test('a faint Guide appears after idle and disappears on a press', async ({ page }) => {
    await page.goto('/games/path-builder');
    await expect(page.getByTestId('scene')).toBeVisible();

    // ~6s without a completed road summons the Guide derived from the Scene.
    await expect(page.getByTestId('guide')).toBeVisible({ timeout: 9000 });

    const home = await landmark(page, 'home');
    const at = await sceneToClient(page, home);
    await page.dispatchEvent(SCENE, 'pointerdown', pointer(at.x, at.y));
    await expect(page.getByTestId('guide')).toHaveCount(0);
    await page.dispatchEvent(':root', 'pointerup', pointer(at.x, at.y));

    // The Guide never draws the road for the child.
    expect((await page.getByTestId('road').getAttribute('data-points'))).toBe('1');
  });

  test('reduced motion keeps the ghost and the Guide static and playable', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/games/path-builder');
    await expect(page.getByTestId('scene')).toBeVisible();

    // The ghost hand is shown still, not drifting along the route.
    const ghost = page.getByTestId('ghost-hand');
    await expect(ghost).toBeVisible({ timeout: 4000 });
    const still = await ghost.getAttribute('transform');
    await page.waitForTimeout(450);
    expect(await ghost.getAttribute('transform')).toBe(still);

    // The idle Guide is static too.
    const guide = page.getByTestId('guide');
    await expect(guide).toBeVisible({ timeout: 9000 });
    await expect(guide).toHaveClass(/still/);

    // And the game is still playable: draw the Guide route to solve.
    const route = await guideRoute(page);
    expect(route.length).toBeGreaterThan(5);
    await drawStroke(page, route);
    await expect(page.getByTestId('round-done')).toBeVisible({ timeout: 7000 });
    await expect(page.getByTestId('pb-root')).toHaveAttribute('data-road', '2', { timeout: 7000 });
  });

  test('late levels show required Stars and the ladder still switches', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('pathBuilderLevel', '9'));
    await page.goto('/games/path-builder');
    const root = page.getByTestId('pb-root');
    await expect(root).toHaveAttribute('data-level', '9');

    const stars = page.getByTestId('star');
    await expect(stars).toHaveCount(2);
    await expect(stars.first()).toHaveAttribute('data-required', 'true');
    await expect(page.locator('.ladder-step.active')).toHaveText('9');

    // The summary counts required Stars, not every Star.
    await expect(page.getByTestId('pb-summary')).toContainText('Stars needed: 2');
    await expect(page.getByTestId('pb-summary')).not.toContainText('Extra stars');

    await page.locator('.ladder-step').nth(3).click();
    await expect(root).toHaveAttribute('data-level', '4');
    await expect(root).toHaveAttribute('data-road', '1');
    await expect(page.getByTestId('pb-summary')).toContainText('4');
    // Level 4's Star is optional, so the summary says so instead of "needed".
    await expect(page.getByTestId('pb-summary')).toContainText('Extra stars: 1');
  });

  test('a late level solves along the Guide and gathers its required Stars', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('pathBuilderLevel', '6'));
    await page.goto('/games/path-builder');

    await expect(page.getByTestId('guide')).toBeVisible({ timeout: 9000 });
    const route = await guideRoute(page);
    expect(route.length).toBeGreaterThan(5);

    await drawStroke(page, route);
    await expect(page.getByTestId('round-done')).toBeVisible({ timeout: 7000 });
    await expect(page.getByTestId('pb-root')).toHaveAttribute('data-road', '2', { timeout: 7000 });
  });

  test('a missed required Star sends the fox home and keeps the road', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('pathBuilderLevel', '9'));
    await page.goto('/games/path-builder');

    await expect(page.getByTestId('guide')).toBeVisible({ timeout: 9000 });
    const route = await guideRoute(page);

    const blockers = await page.evaluate(() =>
      [...document.querySelectorAll('[data-testid="blocker"]')].map((node) => ({
        x: Number(node.getAttribute('data-x')),
        y: Number(node.getAttribute('data-y')),
        r: Number(node.getAttribute('data-r'))
      }))
    );
    const star = await page.evaluate(() => {
      const node = document.querySelector('[data-testid="star"][data-required="true"]');
      return { x: Number(node.getAttribute('data-x')), y: Number(node.getAttribute('data-y')) };
    });

    const detour = detourAround(route, star, blockers);
    expect(blockersClearance(detour, blockers)).toBeGreaterThan(BLOCKER_PAD + 5);
    expect(
      Math.min(...detour.map((p) => Math.hypot(p.x - star.x, p.y - star.y)))
    ).toBeGreaterThan(54);

    const home = await landmark(page, 'home');
    await drawStroke(page, detour);

    await expect(page.getByTestId('pb-root')).toHaveAttribute('data-state', 'missed', {
      timeout: 9000
    });
    const walker = page.getByTestId('walker');
    await expect
      .poll(async () => Number(await walker.getAttribute('data-x')))
      .toBeCloseTo(home.x, 0);
    expect((await roadPoints(page)).length).toBeGreaterThan(5);
    await expect(page.getByTestId('pb-root')).toHaveAttribute('data-road', '1');
  });

  test('completing all five roads announces the level and starts the next', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('/games/path-builder');
    const root = page.getByTestId('pb-root');

    for (let layout = 0; layout < 5; layout += 1) {
      if (layout > 0) await expect(root).toHaveAttribute('data-road', String(layout + 1));
      const home = await landmark(page, 'home');
      const dest = await landmark(page, 'destination');
      await drawStroke(page, [
        home,
        lerp(home, dest, 0.25),
        lerp(home, dest, 0.5),
        lerp(home, dest, 0.75),
        dest
      ]);
      await expect(root).toHaveAttribute('data-state', 'solved', { timeout: 8000 });
      if (layout < 4) {
        await page.getByTestId('round-done').getByRole('button', { name: /next road/i }).click();
      }
    }

    await expect(page.getByTestId('level-overlay')).toBeVisible({ timeout: 6000 });
    await expect(page.getByTestId('pb-status')).toContainText('Level 1 complete');
    await expect(root).toHaveAttribute('data-level', '2');
    await expect(root).toHaveAttribute('data-state', 'idle');
  });

  test('the sound toggle mutes the forest without errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/games/path-builder');
    await page.locator('.sound-btn').click();

    const home = await landmark(page, 'home');
    const dest = await landmark(page, 'destination');
    await drawStroke(page, [home, lerp(home, dest, 0.5), dest]);
    await page.locator('.sound-btn').click();
    await page.waitForTimeout(300);
    expect(errors).toEqual([]);
  });

  test('fits 320×568 portrait with no horizontal overflow', async ({ page }) => {
    await expectPortraitFit(page, 320, 568);
  });

  test('fits 390×844 portrait with no horizontal overflow', async ({ page }) => {
    await expectPortraitFit(page, 390, 844);
  });
});
