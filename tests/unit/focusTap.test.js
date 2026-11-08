import { describe, it, expect } from 'vitest';
import {
  levelConfig,
  tierFor,
  makeRoundState,
  chooseSpawnItem,
  nextSpawn,
  SPAWN_LIFETIME_GRACE_MS
} from '../../src/lib/trainers/focusTap.js';

// The Pond Catch reuses the trainer engine unchanged. This suite pins the
// contract the PRD and tickets promise: goal 6 + level (cap 20), the three
// tiers, the spawn/rise ramp and the six-item stream with a forced target.
describe('Focus Tap — pond round rules', () => {
  it('needs 6 + level catches, capped at 20', () => {
    expect(levelConfig(1).goal).toBe(7);
    expect(levelConfig(2).goal).toBe(8);
    expect(levelConfig(10).goal).toBe(16);
    expect(levelConfig(14).goal).toBe(20);
    expect(levelConfig(20).goal).toBe(20);
  });

  it('grows the goal monotonically across all ten ladder levels', () => {
    let previous = 0;
    for (let level = 1; level <= 10; level += 1) {
      const goal = levelConfig(level).goal;
      expect(goal).toBeGreaterThanOrEqual(previous);
      previous = goal;
    }
  });

  it('clamps out-of-range levels like the route does', () => {
    expect(levelConfig(0)).toEqual(levelConfig(1));
    expect(levelConfig(99).goal).toBe(20);
  });
});

describe('Focus Tap — tiers', () => {
  it('maps levels 1–2 to cross-category distractors', () => {
    expect(tierFor(1)).toBe('cross');
    expect(tierFor(2)).toBe('cross');
  });

  it('maps levels 3–5 to same-category distractors', () => {
    for (const level of [3, 4, 5]) expect(tierFor(level)).toBe('same');
  });

  it('maps levels 6–10 to lookalikes', () => {
    for (const level of [6, 7, 8, 9, 10]) expect(tierFor(level)).toBe('lookalike');
  });

  it('keeps one fixed target for the whole round', () => {
    const state = makeRoundState(7, 2026);
    expect(typeof state.target).toBe('string');
    for (let i = 0; i < 30; i += 1) {
      const item = chooseSpawnItem(state, 1, i);
      if (item.isTarget) expect(item.emoji).toBe(state.target);
      else expect(item.emoji).not.toBe(state.target);
    }
  });
});

describe('Focus Tap — stream spawns', () => {
  it('starts gentle at level 1 and speeds up by level 10', () => {
    const l1 = levelConfig(1);
    const l10 = levelConfig(10);
    expect(l1.spawnMs).toBe(1700);
    expect(l1.riseSec).toBeCloseTo(8.75);
    expect(l10.spawnMs).toBe(800);
    expect(l10.riseSec).toBeCloseTo(6.5);
    expect(l10.spawnMs).toBeLessThan(l1.spawnMs);
    expect(l10.riseSec).toBeLessThan(l1.riseSec);
  });

  it('never spawns faster than 600 ms or rises faster than 4 s', () => {
    for (let level = 1; level <= 10; level += 1) {
      const config = levelConfig(level);
      expect(config.spawnMs).toBeGreaterThanOrEqual(600);
      expect(config.riseSec).toBeGreaterThanOrEqual(4);
      expect(config.maxItems).toBe(6);
      expect(config.targetChance).toBeCloseTo(0.35);
    }
  });

  it('forces a target when the stream has none', () => {
    const state = makeRoundState(1, 42);
    const item = chooseSpawnItem(state, 0, 0);
    expect(item.isTarget).toBe(true);
    expect(item.emoji).toBe(state.target);
  });

  it('holds at most six items and stamps each with its rise expiry', () => {
    const state = makeRoundState(1, 42);
    const now = 1_000_000;
    let items = [];
    for (let i = 0; i < 20; i += 1) {
      const next = nextSpawn(state, items, i, now);
      items = next.items;
      expect(items.length).toBeLessThanOrEqual(6);
      if (next.item) {
        expect(next.item.expiresAt).toBe(now + state.config.riseSec * 1000 + SPAWN_LIFETIME_GRACE_MS);
      }
    }
    expect(items.length).toBe(6);
    const blocked = nextSpawn(state, items, 99, now);
    expect(blocked.item).toBeNull();
    expect(blocked.items.length).toBe(6);
  });

  it('prunes expired items before deciding the next spawn', () => {
    const state = makeRoundState(1, 42);
    const now = 1_000_000;
    const first = nextSpawn(state, [], 0, now);
    const stale = first.items;
    const later = now + state.config.riseSec * 1000 + SPAWN_LIFETIME_GRACE_MS + 1;
    const next = nextSpawn(state, stale, 1, later);
    expect(next.items.length).toBe(1);
    expect(next.items[0].id).not.toBe(stale[0].id);
  });
});
