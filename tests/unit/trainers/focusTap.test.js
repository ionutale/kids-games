import { describe, it, expect } from 'vitest';
import { levelConfig, tierFor, chooseSpawnItem, makeRoundState } from '$lib/trainers/focusTap.js';

describe('tierFor', () => {
  it('maps levels to sneaky tiers', () => {
    expect(tierFor(1)).toBe('cross');
    expect(tierFor(2)).toBe('cross');
    expect(tierFor(3)).toBe('same');
    expect(tierFor(5)).toBe('same');
    expect(tierFor(6)).toBe('lookalike');
    expect(tierFor(30)).toBe('lookalike');
  });
});

describe('levelConfig', () => {
  it('matches the spec formulas at L1', () => {
    const c = levelConfig(1);
    expect(c.goal).toBe(7);
    expect(c.spawnMs).toBe(1700);
    expect(c.riseSec).toBeCloseTo(8.75);
    expect(c.maxItems).toBe(6);
    expect(c.targetChance).toBeCloseTo(0.35);
  });

  it('caps goal at 20 and floors spawn/rise at high levels', () => {
    const c = levelConfig(15);
    expect(c.goal).toBe(20);
    expect(c.spawnMs).toBe(600);
    expect(c.riseSec).toBeCloseTo(5.25);
    const c30 = levelConfig(30);
    expect(c30.spawnMs).toBe(600);
    expect(c30.riseSec).toBe(4);
  });
});

describe('makeRoundState + chooseSpawnItem', () => {
  it('creates a round with a target and distractors from the active tier', () => {
    const state = makeRoundState(1, 42);
    expect(state.config.goal).toBe(7);
    expect(typeof state.target).toBe('string');
    expect(state.distractors.length).toBeGreaterThanOrEqual(2);
    expect(state.distractors).not.toContain(state.target);
  });

  it('forced-target rule: no targets on screen ⇒ next spawn is target', () => {
    const state = makeRoundState(1, 7);
    for (let s = 0; s < 20; s++) {
      const item = chooseSpawnItem(state, 0, s); // 0 targets on screen
      expect(item.emoji).toBe(state.target);
      expect(item.isTarget).toBe(true);
    }
  });

  it('with targets on screen, spawns are mostly distractors but always valid emojis', () => {
    const state = makeRoundState(1, 11);
    let targets = 0;
    for (let s = 0; s < 200; s++) {
      const item = chooseSpawnItem(state, 1, s);
      const valid = item.isTarget ? item.emoji === state.target : !item.isTarget && item.emoji !== state.target;
      expect(valid).toBe(true);
      if (item.isTarget) targets++;
    }
    // ~35% target chance when not forced
    expect(targets).toBeGreaterThan(20);
    expect(targets).toBeLessThan(140);
  });
});
