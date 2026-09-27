import { describe, it, expect } from 'vitest';
import { levelConfig, tierFor, chooseSpawnItem, makeRoundState, nextSpawn } from '$lib/trainers/focusTap.js';
import { categoryOfEmoji, lookalikePartner } from '$lib/trainers/emojiSets.js';

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

describe('makeRoundState tier composition', () => {
  it('L3–5 distractors are same-category as the target', () => {
    for (const level of [3, 4, 5]) {
      for (let seed = 1; seed <= 40; seed++) {
        const state = makeRoundState(level, seed);
        expect(state.distractors.length).toBeGreaterThanOrEqual(2);
        for (const d of state.distractors) {
          expect(categoryOfEmoji(d)).toBe(categoryOfEmoji(state.target));
        }
      }
    }
  });

  it('L6+ distractors are lookalike or same-category — never the easier cross-category pool', () => {
    for (const level of [6, 8, 12, 30]) {
      for (let seed = 1; seed <= 60; seed++) {
        const state = makeRoundState(level, seed);
        expect(state.distractors.length).toBeGreaterThanOrEqual(2);
        const partner = lookalikePartner(state.target);
        for (const d of state.distractors) {
          const sameCategory = categoryOfEmoji(d) === categoryOfEmoji(state.target);
          expect(sameCategory || d === partner).toBe(true);
        }
      }
    }
  });

  it('prefers a lookalike target and guarantees its partner as a distractor when one exists', () => {
    let targetsWithPartner = 0;
    for (let seed = 1; seed <= 60; seed++) {
      const state = makeRoundState(6, seed);
      const partner = lookalikePartner(state.target);
      if (partner) {
        targetsWithPartner++;
        expect(state.distractors).toContain(partner);
      }
    }
    expect(targetsWithPartner).toBeGreaterThan(0);
  });
});

describe('nextSpawn lifecycle', () => {
  it('expires pieces that have floated off so the stream never locks up', () => {
    const state = makeRoundState(1, 42);
    let items = [];
    let idSeq = 0;
    let spawns = 0;
    for (let now = 0; now <= 60000; now += state.config.spawnMs) {
      const next = nextSpawn(state, items, idSeq, now);
      items = next.items;
      if (next.item) {
        idSeq += 1;
        spawns += 1;
      }
      expect(items.length).toBeLessThanOrEqual(state.config.maxItems);
    }
    // Before the fix the stream stopped after `maxItems` spawns and never resumed.
    expect(spawns).toBeGreaterThan(10);
  });

  it('still spawns immediately when no live target is on screen', () => {
    const state = makeRoundState(1, 7);
    const next = nextSpawn(state, [], 0, 1000);
    expect(next.item).not.toBeNull();
    expect(next.item.isTarget).toBe(true);
    expect(next.forced).toBe(true);
  });

  it('respects the cap when live pieces fill the screen', () => {
    const state = makeRoundState(1, 7);
    const now = 5000;
    const live = Array.from({ length: state.config.maxItems }, (_, i) => ({
      id: i,
      emoji: state.distractors[i % state.distractors.length],
      isTarget: false,
      x: 10,
      expiresAt: now + 10000
    }));
    const next = nextSpawn(state, live, 99, now);
    expect(next.item).toBeNull();
    expect(next.items.length).toBe(state.config.maxItems);
  });
});
