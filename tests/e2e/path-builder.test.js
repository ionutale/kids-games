import { test, expect } from '@playwright/test';

const SCENE = '[data-testid="scene"]';

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

test.describe('Path Builder — Forest Road', () => {
  test('drawing a road makes the fox walk it and solves the layout', async ({ page }) => {
    await page.goto('/games/path-builder');
    await expect(page.getByTestId('scene')).toBeVisible();

    const root = page.getByTestId('pb-root');
    await expect(root).toHaveAttribute('data-level', '1');
    await expect(root).toHaveAttribute('data-road', '1');

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

    // Arriving solves the layout and auto-advances to the next road.
    await expect(page.getByTestId('round-done')).toBeVisible({ timeout: 6000 });
    await expect(page.getByTestId('round-done')).toContainText('fox');
    await expect(root).toHaveAttribute('data-road', '2', { timeout: 6000 });
  });

  test('a stroke into a Rock stops at its edge and never enters it', async ({ page }) => {
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

    await drawStroke(page, [
      home,
      lerp(home, center, 0.45),
      lerp(home, center, 0.8),
      center
    ]);

    const tip = await roadTip(page);
    const distance = Math.hypot(tip.x - center.x, tip.y - center.y);
    expect(distance).toBeGreaterThan(radius - 1);
    expect(distance).toBeLessThan(radius + 16);

    const inside = (await roadPoints(page)).filter(
      (p) => Math.hypot(p.x - center.x, p.y - center.y) < radius
    );
    expect(inside).toEqual([]);
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

  test('late levels show required Stars and the ladder still switches', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('pathBuilderLevel', '9'));
    await page.goto('/games/path-builder');
    const root = page.getByTestId('pb-root');
    await expect(root).toHaveAttribute('data-level', '9');

    const stars = page.getByTestId('star');
    await expect(stars).toHaveCount(2);
    await expect(stars.first()).toHaveAttribute('data-required', 'true');
    await expect(page.locator('.ladder-step.active')).toHaveText('9');

    await page.locator('.ladder-step').nth(3).click();
    await expect(root).toHaveAttribute('data-level', '4');
    await expect(root).toHaveAttribute('data-road', '1');
    await expect(page.getByTestId('pb-summary')).toContainText('4');
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
    expect(blockersClearance(detour, blockers)).toBeGreaterThan(10);
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

  test('fits a small phone in portrait with no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
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
  });
});
