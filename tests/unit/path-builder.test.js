import { describe, it, expect } from 'vitest';
import {
  W,
  H,
  LEVELS,
  LAYOUTS,
  DEST_RADIUS,
  STAR_RADIUS,
  BLOCKER_PAD,
  ROAD_HALF,
  dist,
  distanceToPath,
  segmentHitsCircle,
  clipSegmentToCircle,
  pathLength,
  pointAt,
  nearestRoadIndex,
  blockerHit,
  blockerArtSize,
  blockerArtRadius,
  roadReachesDestination,
  starCollected,
  requiredStarsCollected,
  hasRequiredStars,
  levelSpec,
  sceneFor,
  sceneSignature
} from '../../src/lib/path-builder/scene.js';

/** Coarse, route-independent walkability check: can a 6-unit grid walker get
 *  from `from` to `to` around the padded Blockers inside the Scene? */
function canReach(scene, from, to, step = 6) {
  const cols = Math.floor(W / step);
  const rows = Math.floor(H / step);
  const blocked = (cx, cy) => {
    const x = (cx + 0.5) * step;
    const y = (cy + 0.5) * step;
    if (x < 16 || x > W - 16 || y < 16 || y > H - 16) return true;
    return scene.blockers.some((b) => Math.hypot(x - b.x, y - b.y) <= b.r + BLOCKER_PAD);
  };
  const cellOf = (p) => [
    Math.min(cols - 1, Math.max(0, Math.floor(p.x / step))),
    Math.min(rows - 1, Math.max(0, Math.floor(p.y / step)))
  ];
  const [sx, sy] = cellOf(from);
  if (blocked(sx, sy)) return false;
  const seen = new Set([`${sx},${sy}`]);
  const queue = [[sx, sy]];
  while (queue.length) {
    const [cx, cy] = queue.shift();
    if (Math.hypot((cx + 0.5) * step - to.x, (cy + 0.5) * step - to.y) <= step) return true;
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ]) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
      const key = `${nx},${ny}`;
      if (seen.has(key) || blocked(nx, ny)) continue;
      seen.add(key);
      queue.push([nx, ny]);
    }
  }
  return false;
}

describe('geometry', () => {
  it('measures distances and path length', () => {
    expect(dist({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
    const line = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 }
    ];
    expect(pathLength(line)).toBe(20);
    expect(pathLength([])).toBe(0);
  });

  it('detects a segment crossing a circle and misses a clear one', () => {
    const c = { x: 50, y: 50 };
    expect(segmentHitsCircle({ x: 0, y: 50 }, { x: 100, y: 50 }, c, 10)).toBe(true);
    expect(segmentHitsCircle({ x: 0, y: 0 }, { x: 100, y: 0 }, c, 10)).toBe(false);
    expect(segmentHitsCircle({ x: 50, y: 50 }, { x: 50, y: 90 }, c, 10)).toBe(true);
  });

  it('clips a segment exactly at the circle edge', () => {
    const c = { x: 50, y: 50 };
    const hit = clipSegmentToCircle({ x: 0, y: 50 }, { x: 100, y: 50 }, c, 10);
    expect(hit).not.toBeNull();
    expect(hit.x).toBeCloseTo(40, 5);
    expect(hit.y).toBeCloseTo(50, 5);
    expect(dist(hit, c)).toBeCloseTo(10, 5);
  });

  it('returns the start point for a segment that begins inside the circle', () => {
    const c = { x: 50, y: 50 };
    const hit = clipSegmentToCircle({ x: 50, y: 50 }, { x: 90, y: 50 }, c, 10);
    expect(hit).toEqual({ x: 50, y: 50 });
  });

  it('returns null when the segment never reaches the circle', () => {
    expect(
      clipSegmentToCircle({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 50 }, 10)
    ).toBeNull();
    expect(
      clipSegmentToCircle({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 50, y: 0 }, 5)
    ).toBeNull();
  });

  it('samples a polyline by normalized arc length', () => {
    const line = [
      { x: 0, y: 0 },
      { x: 100, y: 0 }
    ];
    expect(pointAt(line, 0).x).toBeCloseTo(0);
    expect(pointAt(line, 1).x).toBeCloseTo(100);
    expect(pointAt(line, 0.5).x).toBeCloseTo(50);
    expect(pointAt(line, 0.5).angle).toBeCloseTo(0);
    expect(pointAt([], 0.5)).toBeNull();
    expect(pointAt([{ x: 7, y: 9 }], 0.5)).toEqual({ x: 7, y: 9, angle: 0 });
  });

  it('clamps pointAt outside 0..1', () => {
    const line = [
      { x: 0, y: 0 },
      { x: 100, y: 0 }
    ];
    expect(pointAt(line, -1).x).toBeCloseTo(0);
    expect(pointAt(line, 2).x).toBeCloseTo(100);
  });

  it('finds the nearest earlier road point for truncation', () => {
    const road = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 200, y: 0 }
    ];
    expect(nearestRoadIndex(road, { x: 104, y: 2 }, 10)).toBe(1);
    expect(nearestRoadIndex(road, { x: 150, y: 0 }, 10)).toBe(-1);
    expect(nearestRoadIndex(road, { x: 0, y: 0 }, 10)).toBe(0);
  });

  it('finds the first Blocker a stroke would enter', () => {
    const blockers = [
      { x: 200, y: 50, r: 20, kind: 'rock' },
      { x: 120, y: 50, r: 20, kind: 'pond' }
    ];
    const hit = blockerHit(blockers, { x: 0, y: 50 }, { x: 300, y: 50 });
    expect(hit).toBe(blockers[1]);
    expect(blockerHit(blockers, { x: 0, y: 300 }, { x: 300, y: 300 })).toBeNull();
  });

  it('pads Blocker collision so the stroke stops before the art', () => {
    const blocker = { x: 100, y: 100, r: 30, kind: 'rock' };
    const hit = blockerHit([blocker], { x: 0, y: 100 }, { x: 200, y: 100 });
    const edge = clipSegmentToCircle({ x: 0, y: 100 }, { x: 200, y: 100 }, blocker, blocker.r + BLOCKER_PAD);
    expect(hit).toBe(blocker);
    expect(dist(edge, blocker)).toBeCloseTo(blocker.r + BLOCKER_PAD, 5);
  });

  it('lets a stroke resting on a Blocker edge slide along it or move away', () => {
    const blocker = { x: 100, y: 100, r: 40, kind: 'rock' };
    const edge = { x: 100 - (40 + BLOCKER_PAD), y: 100 };

    // Moving straight away from the rock.
    expect(blockerHit([blocker], edge, { x: edge.x - 40, y: 100 })).toBeNull();
    // Sliding tangentially along the rock's edge.
    expect(blockerHit([blocker], edge, { x: edge.x, y: edge.y + 70 })).toBeNull();
    // Pushing back into the rock is still refused.
    expect(blockerHit([blocker], edge, { x: 100, y: 100 })).toBe(blocker);
    // Cutting a chord through the rock is still refused.
    expect(blockerHit([blocker], edge, { x: 160, y: 160 })).toBe(blocker);
  });

  it('ties every Blocker art extent to its collision radius', () => {
    expect(BLOCKER_PAD).toBe(ROAD_HALF);
    for (const kind of ['rock', 'pond', 'hedge']) {
      const blocker = { x: 200, y: 200, r: 48, kind };
      // The drawn art reaches the collision circle, so the tip that stopped at
      // radius + BLOCKER_PAD leaves the Road's visible edge on the drawn edge.
      expect(blockerArtRadius(blocker)).toBeCloseTo(blocker.r, 5);
      expect(blockerArtSize(blocker) / 2).toBeGreaterThan(blocker.r);
      const edge = clipSegmentToCircle(
        { x: 0, y: 200 },
        { x: 400, y: 200 },
        blocker,
        blocker.r + BLOCKER_PAD
      );
      expect(dist(edge, blocker) - ROAD_HALF).toBeCloseTo(blockerArtRadius(blocker), 5);
    }
  });
});

describe('road outcomes', () => {
  const scene = sceneFor(6, 0);

  it('reports a connected road only when it reaches the cabin', () => {
    const short = [
      { ...scene.home },
      { x: scene.home.x + 60, y: scene.home.y - 60 }
    ];
    const connected = [
      { ...scene.home },
      { ...scene.dest }
    ];
    expect(roadReachesDestination(scene, short)).toBe(false);
    expect(roadReachesDestination(scene, connected)).toBe(true);
    expect(roadReachesDestination(scene, [])).toBe(false);
    expect(roadReachesDestination(scene, [{ ...scene.dest }])).toBe(false);
    expect(DEST_RADIUS).toBeGreaterThan(0);
  });

  it('collects a star inside the forgiving radius only', () => {
    const star = scene.stars[0];
    expect(starCollected({ x: star.x, y: star.y }, star)).toBe(true);
    expect(starCollected({ x: star.x + STAR_RADIUS - 1, y: star.y }, star)).toBe(true);
    expect(starCollected({ x: star.x + STAR_RADIUS + 6, y: star.y }, star)).toBe(false);
    expect(STAR_RADIUS).toBeGreaterThanOrEqual(40);
  });

  it('solves only when every required star was gathered', () => {
    const required = scene.stars.filter((s) => s.required).map((s) => s.id);
    expect(scene.required).toBeGreaterThan(0);
    expect(hasRequiredStars(scene, [])).toBe(false);
    expect(hasRequiredStars(scene, required)).toBe(true);
    expect(requiredStarsCollected(scene, required)).toBe(scene.required);

    // An optional star never counts toward the required total.
    const early = sceneFor(3, 0);
    expect(early.required).toBe(0);
    expect(early.stars.length).toBeGreaterThan(0);
    expect(hasRequiredStars(early, [])).toBe(true);
    expect(requiredStarsCollected(early, [])).toBe(0);
  });
});

describe('level configuration', () => {
  it('ships ten levels with five layouts each', () => {
    expect(LEVELS).toBe(10);
    expect(LAYOUTS).toBe(5);
  });

  it('keeps early levels open and grows Blockers and required Stars', () => {
    expect(levelSpec(1).blockers).toBe(0);
    expect(levelSpec(2).blockers).toBe(0);
    for (let level = 3; level <= 5; level += 1) {
      expect(levelSpec(level).blockers).toBeGreaterThanOrEqual(1);
      expect(levelSpec(level).blockers).toBeLessThanOrEqual(2);
      expect(levelSpec(level).required).toBe(0);
    }
    for (let level = 6; level <= 10; level += 1) {
      const spec = levelSpec(level);
      expect(spec.required).toBeGreaterThanOrEqual(1);
      expect(spec.required).toBeLessThanOrEqual(2);
      expect(spec.stars).toBeGreaterThanOrEqual(spec.required);
    }
  });

  it('clamps out-of-range levels and layouts', () => {
    expect(levelSpec(0).level).toBe(1);
    expect(levelSpec(99).level).toBe(LEVELS);
    const low = sceneFor(-4, -2);
    expect(low.level).toBe(1);
    expect(low.layout).toBe(0);
    const high = sceneFor(99, 99);
    expect(high.level).toBe(LEVELS);
    expect(high.layout).toBe(LAYOUTS - 1);
  });
});

describe('scene generation', () => {
  it('puts the cottage and cabin on opposite sides, always in bounds', () => {
    for (let level = 1; level <= LEVELS; level += 1) {
      for (let layout = 0; layout < LAYOUTS; layout += 1) {
        const scene = sceneFor(level, layout);
        expect(scene.home.x, `L${level}/${layout} home x`).toBeLessThan(W / 2);
        expect(scene.dest.x, `L${level}/${layout} dest x`).toBeGreaterThan(W / 2);
        expect(scene.home.y, `L${level}/${layout} home below dest`).toBeGreaterThan(scene.dest.y);
        for (const p of [scene.home, scene.dest]) {
          expect(p.x).toBeGreaterThan(60);
          expect(p.x).toBeLessThan(W - 60);
          expect(p.y).toBeGreaterThan(60);
          expect(p.y).toBeLessThan(H - 60);
        }
      }
    }
  });

  it('grows the home-to-cabin distance with the level', () => {
    const first = dist(levelSpec(1).home, levelSpec(1).dest);
    const last = dist(levelSpec(10).home, levelSpec(10).dest);
    expect(last).toBeGreaterThan(first + 50);
  });

  it('never lets a Blocker cover the suggested route or the buildings', () => {
    for (let level = 1; level <= LEVELS; level += 1) {
      for (let layout = 0; layout < LAYOUTS; layout += 1) {
        const scene = sceneFor(level, layout);
        for (const blocker of scene.blockers) {
          const nearest = distanceToPath(scene.route, blocker);
          expect(nearest, `L${level}/${layout} ${blocker.kind} route clearance`).toBeGreaterThan(
            blocker.r + BLOCKER_PAD
          );
          expect(dist(blocker, scene.home)).toBeGreaterThan(blocker.r + 40);
          expect(dist(blocker, scene.dest)).toBeGreaterThan(blocker.r + 40);
        }
      }
    }
  });

  it('places every Star on the valid guide route and requires a subset', () => {
    for (let level = 1; level <= LEVELS; level += 1) {
      for (let layout = 0; layout < LAYOUTS; layout += 1) {
        const scene = sceneFor(level, layout);
        expect(scene.required).toBeLessThanOrEqual(scene.stars.length);
        for (const star of scene.stars) {
          const nearest = distanceToPath(scene.route, star);
          expect(nearest, `L${level}/${layout} star on route`).toBeLessThan(0.001);
          expect(star.required).toBe(scene.stars.indexOf(star) < scene.required);
        }
      }
    }
  });

  it('keeps every Blocker inside the scene', () => {
    for (let level = 1; level <= LEVELS; level += 1) {
      for (let layout = 0; layout < LAYOUTS; layout += 1) {
        const scene = sceneFor(level, layout);
        for (const blocker of scene.blockers) {
          expect(blocker.x - blocker.r).toBeGreaterThanOrEqual(10);
          expect(blocker.x + blocker.r).toBeLessThanOrEqual(W - 10);
          expect(blocker.y - blocker.r).toBeGreaterThanOrEqual(110);
          expect(blocker.y + blocker.r).toBeLessThanOrEqual(H - 80);
        }
      }
    }
  });

  it('never fully seals the scene: an independent corridor reaches every goal', () => {
    for (let level = 1; level <= LEVELS; level += 1) {
      for (let layout = 0; layout < LAYOUTS; layout += 1) {
        const scene = sceneFor(level, layout);
        const label = `L${level}/${layout}`;

        // A grid walker that knows nothing about the suggested route must still
        // get from the cottage to the cabin.
        expect(canReach(scene, scene.home, scene.dest), `${label} corridor`).toBe(true);

        // Every required Star sits on that open corridor, both ways.
        for (const star of scene.stars.filter((s) => s.required)) {
          expect(canReach(scene, scene.home, star), `${label} star from home`).toBe(true);
          expect(canReach(scene, star, scene.dest), `${label} star to cabin`).toBe(true);
        }
      }
    }
  });

  it('keeps the suggested route clear of every Blocker', () => {
    for (let level = 1; level <= LEVELS; level += 1) {
      for (let layout = 0; layout < LAYOUTS; layout += 1) {
        const scene = sceneFor(level, layout);
        for (const blocker of scene.blockers) {
          const crosses = scene.route.some((p, i) => {
            if (i === 0) return false;
            return segmentHitsCircle(scene.route[i - 1], p, blocker, blocker.r + BLOCKER_PAD);
          });
          expect(crosses, `L${level}/${layout} route blocked`).toBe(false);
        }
        expect(roadReachesDestination(scene, scene.route)).toBe(true);
        expect(hasRequiredStars(scene, scene.stars.map((s) => s.id))).toBe(true);
      }
    }
  });

  it('is deterministic per level and layout', () => {
    expect(sceneFor(4, 2)).toEqual(sceneFor(4, 2));
    expect(sceneFor(7, 0)).not.toEqual(sceneFor(7, 1));
  });

  it('gives every level five visibly different layouts', () => {
    for (let level = 1; level <= LEVELS; level += 1) {
      const layouts = Array.from({ length: LAYOUTS }, (_, layout) => sceneFor(level, layout));
      const signatures = new Set(layouts.map((scene) => sceneSignature(scene)));
      // The signature covers Home/Destination placement, the route, the
      // clearing, the Blockers, the Stars and the forest dressing, so it proves
      // the five roads differ on screen rather than only in route points.
      expect(signatures.size, `L${level} visible scenes`).toBe(LAYOUTS);

      const homes = new Set(layouts.map((s) => `${Math.round(s.home.x)},${Math.round(s.home.y)}`));
      const dens = new Set(layouts.map((s) => `${Math.round(s.dest.x)},${Math.round(s.dest.y)}`));
      expect(homes.size, `L${level} Home spots`).toBeGreaterThan(1);
      expect(dens.size, `L${level} cabin spots`).toBeGreaterThan(1);
    }
  });

  it('reaches the Destination with the guide route and collects its Stars', () => {
    for (let level = 1; level <= LEVELS; level += 1) {
      const scene = sceneFor(level, 2);
      expect(roadReachesDestination(scene, scene.route)).toBe(true);
      const collected = scene.stars
        .filter((star) => scene.route.some((p) => starCollected(p, star)))
        .map((star) => star.id);
      expect(hasRequiredStars(scene, collected)).toBe(true);
    }
  });
});
