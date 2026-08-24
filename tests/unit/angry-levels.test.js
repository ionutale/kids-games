import { describe, it, expect } from 'vitest';
import { LEVELS, getLevel, WORLD_W, GROUND_Y } from '$lib/angry-emoji/levels.js';
import { levelMaxScore, starsFor } from '$lib/angry-emoji/score.js';
import { MATERIALS, createWorld, addBody, step } from '$lib/angry-emoji/phys.js';

const TARGET_SIZE = { w: 40, h: 48 };
const EPS = 0.01;

function asBody(t) {
  return { x: t.x, y: t.y, ...TARGET_SIZE };
}

function overlaps(a, b, swingA = 0, swingB = 0) {
  const ox = Math.min(a.x + a.w / 2 + swingA, b.x + b.w / 2 + swingB) -
    Math.max(a.x - a.w / 2 - swingA, b.x - b.w / 2 - swingB);
  const oy = Math.min(a.y + a.h / 2, b.y + b.h / 2) - Math.max(a.y - a.h / 2, b.y - b.h / 2);
  return ox > EPS && oy > EPS;
}

describe('level definitions', () => {
  it('has exactly 20 levels in 4 sequential tiers', () => {
    expect(LEVELS.length).toBe(20);
    LEVELS.forEach((l, i) => {
      expect(l.level).toBe(i + 1);
      expect(l.tier).toBe(Math.min(4, Math.floor(i / 5) + 1));
    });
  });

  it('respects ammo bounds (1–3)', () => {
    for (const l of LEVELS) {
      expect(l.ammo).toBeGreaterThanOrEqual(1);
      expect(l.ammo).toBeLessThanOrEqual(3);
    }
  });

  it('tier 1 uses no stone', () => {
    for (const l of LEVELS.filter((x) => x.tier === 1)) {
      for (const b of l.blocks) {
        expect(MATERIALS[b.type]).toBeTruthy();
        expect(b.type).not.toBe('stone');
      }
    }
  });

  it('tier progression adds stone by tier 3 and a boss appears late', () => {
    expect(LEVELS.slice(10, 15).some((l) => l.blocks.some((b) => b.type === 'stone'))).toBe(true);
    const bossLevels = LEVELS.filter((l) => l.targets.some((t) => t.type === 'targetBoss'));
    expect(bossLevels.length).toBeGreaterThanOrEqual(2); // levels 18–20
    expect(bossLevels.every((l) => l.level >= 18)).toBe(true);
  });

  it('all geometry sits inside the world, right of the sling zone', () => {
    for (const l of LEVELS) {
      for (const b of [...l.blocks, ...l.targets.map(asBody)]) {
        expect(b.x - b.w / 2).toBeGreaterThan(200);
        expect(b.x + b.w / 2).toBeLessThan(WORLD_W);
        expect(b.y).toBeLessThan(GROUND_Y);
      }
      expect(l.targets.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('no two bodies overlap at spawn (patrol swing margins included)', () => {
    for (const l of LEVELS) {
      const all = [...l.blocks, ...l.targets.map(asBody)];
      for (let i = 0; i < all.length; i++) {
        for (let j = i + 1; j < all.length; j++) {
          const a = all[i];
          const b = all[j];
          const swingA = a.patrol?.amp ?? 0;
          const swingB = b.patrol?.amp ?? 0;
          expect(overlaps(a, b, swingA, swingB), `L${l.level} bodies ${i}/${j} overlap`).toBe(false);
        }
      }
    }
  });

  it('every hand-crafted layout spawns stable: nothing breaks or drifts', () => {
    for (const l of LEVELS) {
      const world = createWorld();
      addBody(world, { x: WORLD_W / 2, y: GROUND_Y + 20, w: WORLD_W * 2, h: 40, type: 'ground', isStatic: true });
      for (const b of l.blocks) addBody(world, b);
      for (const t of l.targets) addBody(world, { x: t.x, y: t.y, ...TARGET_SIZE, type: t.type });
      const spawned = new Map(world.bodies.map((b) => [b.id, { x: b.x, y: b.y }]));
      for (let i = 0; i < 240; i++) step(world, 1 / 60); // ~4s settle
      expect(world.broken, `L${l.level} broke something at spawn`).toBe(0);
      for (const b of world.bodies) {
        if (b.isStatic || b.broken) continue;
        const s = spawned.get(b.id);
        const disp = Math.hypot(b.x - s.x, b.y - s.y);
        if (b.patrol) {
          expect(
            Math.abs(b.y - (GROUND_Y - 23)) < 1,
            `L${l.level} patrol block fell or drifted vertically`
          ).toBe(true);
          continue;
        }
        // The engine's sequential-impulse resting contact keeps a residual
        // shimmer (~10–35px/s on mixed stacks — pre-existing, the old cube
        // towers measured up to 68px/s); what matters is that structures
        // hold together: nothing breaks and nothing wanders off its seat.
        expect(disp < 12, `L${l.level} ${b.type} displaced ${disp.toFixed(1)}px`).toBe(true);
        expect(Math.hypot(b.vx, b.vy) < 40, `L${l.level} ${b.type} still sliding fast`).toBe(true);
      }
    }
  });

  it('getLevel clamps to the valid range', () => {
    expect(getLevel(0).level).toBe(1);
    expect(getLevel(25).level).toBe(20);
    expect(getLevel(7).level).toBe(7);
  });

  it('tier 4 includes patrolling blocks, kept in bounds including their swing', () => {
    const t4 = LEVELS.filter((l) => l.tier === 4);
    expect(t4.every((l) => l.blocks.some((b) => b.patrol))).toBe(true);
    expect(t4.some((l) => l.blocks.filter((b) => b.patrol).length === 2)).toBe(true);
    for (const l of t4) {
      for (const b of l.blocks.filter((x) => x.patrol)) {
        expect(b.x - b.w / 2 - b.patrol.amp).toBeGreaterThan(200);
        expect(b.x + b.w / 2 + b.patrol.amp).toBeLessThan(WORLD_W);
      }
    }
  });

  it('patrol blocks never appear before tier 4', () => {
    const early = LEVELS.filter((l) => l.tier < 4);
    expect(early.some((l) => l.blocks.some((b) => b.patrol))).toBe(false);
  });

  it('thin shapes carry thickness-scaled hpScale, cubes do not', () => {
    for (const l of LEVELS) {
      for (const b of l.blocks) {
        expect(b.hpScale).toBeCloseTo(Math.min(b.w, b.h) / 46, 5);
      }
    }
  });

  it('tier 3 carries exactly one TNT crate between its towers', () => {
    for (const l of LEVELS.filter((x) => x.tier === 3)) {
      const tnts = l.blocks.filter((b) => b.type === 'tnt');
      expect(tnts.length).toBe(1);
    }
    expect(LEVELS.filter((x) => x.tier < 3).some((l) => l.blocks.some((b) => b.type === 'tnt'))).toBe(false);
  });

  it('tier 4 carries exactly two TNT crates', () => {
    for (const l of LEVELS.filter((x) => x.tier === 4)) {
      const tnts = l.blocks.filter((b) => b.type === 'tnt');
      expect(tnts.length).toBe(2);
    }
  });
});

describe('scoring & stars', () => {
  it('max score = targets×10 + blocks×5 + ammo×25', () => {
    const l = getLevel(1);
    const expected = l.targets.length * 10 + l.blocks.length * 5 + l.ammo * 25;
    expect(levelMaxScore(l)).toBe(expected);
  });

  it('star thresholds: 0★ without targets, then 1/2/3★ by ratio', () => {
    expect(starsFor(100, 100, 0)).toBe(0);
    expect(starsFor(10, 100, 1)).toBe(1);
    expect(starsFor(60, 100, 1)).toBe(2);
    expect(starsFor(90, 100, 1)).toBe(3);
    expect(starsFor(95, 100, 2)).toBe(3);
  });
});
