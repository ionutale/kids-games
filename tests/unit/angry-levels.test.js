import { describe, it, expect } from 'vitest';
import { LEVELS, getLevel, WORLD_W, GROUND_Y } from '$lib/angry-emoji/levels.js';
import { levelMaxScore, starsFor } from '$lib/angry-emoji/score.js';
import { MATERIALS } from '$lib/angry-emoji/phys.js';

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
        if (MATERIALS[b.type]) void 0;
      }
    }
  });

  it('tier progression adds stone by tier 3 and a boss appears late', () => {
    expect(LEVELS.slice(10, 15).some((l) => l.blocks.some((b) => b.type === 'stone'))).toBe(true);
    const bossLevels = LEVELS.filter((l) => l.targets.some((t) => t.type === 'targetBoss'));
    expect(bossLevels.length).toBeGreaterThanOrEqual(2); // levels 19–20
  });

  it('all geometry sits inside the world and above the ground line', () => {
    for (const l of LEVELS) {
      for (const b of [...l.blocks, ...l.targets.map((t) => ({ x: t.x, y: t.y, w: 40, h: 48 }))]) {
        expect(b.x - b.w / 2).toBeGreaterThan(200); // right of the slingshot zone
        expect(b.x + b.w / 2).toBeLessThan(WORLD_W);
        expect(b.y).toBeLessThan(GROUND_Y);
      }
      expect(l.targets.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('getLevel clamps to the valid range', () => {
    expect(getLevel(0).level).toBe(1);
    expect(getLevel(25).level).toBe(20);
    expect(getLevel(7).level).toBe(7);
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
