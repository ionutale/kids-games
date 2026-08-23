import { describe, it, expect } from 'vitest';
import {
  nextPlatform,
  generateLadder,
  jumpVelocity,
  step,
  scoreFor,
  JUMP_V,
  GRAVITY,
  SPRING_BOUNCE,
  BAND_MID,
  BAND_DEEP,
  ENEMY_FIRST_M
} from '$lib/emoji-jump/engine.js';
import { makeRng } from '$lib/trainers/rng.js';

const JUMP_H = (JUMP_V * JUMP_V) / (2 * GRAVITY);

describe('platform generation', () => {
  it('keeps every gap within 1.5–3.5× jump height and reachable drift', () => {
    const r = makeRng(7);
    let prev = { id: 0, x: 160, y: 0, heightM: 0 };
    for (let i = 0; i < 1000; i++) {
      const p = nextPlatform(prev, r);
      const gap = prev.y - p.y;
      expect(gap).toBeGreaterThanOrEqual(1.5 * JUMP_H - 0.001);
      expect(gap).toBeLessThanOrEqual(3.5 * JUMP_H + 0.001);
      if (gap > 2 * JUMP_H) {
        expect(Math.abs(p.x - prev.x)).toBeLessThanOrEqual(150);
      }
      expect(p.x).toBeGreaterThanOrEqual(8);
      expect(p.x).toBeLessThanOrEqual(390 - 64 - 8);
      prev = p;
    }
  });

  it('is static-only below the mid band', () => {
    const r = makeRng(11);
    let prev = { id: 0, x: 160, y: 0, heightM: 0 };
    for (let i = 0; i < 60; i++) {
      const p = nextPlatform(prev, r);
      if (p.heightM < BAND_MID) expect(p.type).toBe('static');
      prev = p;
    }
  });

  it('never places enemies before ENEMY_FIRST_M', () => {
    const ladder = generateLadder(400, 99);
    for (const p of ladder) {
      if (p.enemy) expect(p.heightM).toBeGreaterThan(ENEMY_FIRST_M);
    }
  });

  it('deep band mixes in moving/breakable platforms', () => {
    const ladder = generateLadder(600, 42);
    const deep = ladder.filter((p) => p.heightM >= BAND_DEEP);
    expect(deep.length).toBeGreaterThan(50);
    expect(deep.some((p) => p.type === 'moving')).toBe(true);
    expect(deep.some((p) => p.type === 'breakable')).toBe(true);
  });

  it('springs stay rare (≤ ~10% observed over many ladders)', () => {
    let springs = 0;
    let total = 0;
    for (let s = 1; s <= 10; s++) {
      for (const p of generateLadder(300, s * 100)) {
        total++;
        if (p.spring) springs++;
      }
    }
    expect(springs / total).toBeLessThan(0.1);
  });
});

describe('jump physics', () => {
  it('normal bounce restores full jump velocity; spring multiplies by 2.5', () => {
    expect(jumpVelocity(false)).toBe(-JUMP_V);
    expect(jumpVelocity(true)).toBe(-JUMP_V * SPRING_BOUNCE);
  });

  it('lands on a platform when falling through its top', () => {
    const plats = [{ id: 1, x: 100, y: 200, w: 64, h: 14, type: 'static', broken: false }];
    const state = { x: 120, y: 170, vx: 0, vy: 300, shield: false, jetpackMs: 0 };
    let s2 = state; let events;
    for (let i = 0; i < 20 && !events?.bounced; i++) ({ state: s2, events } = step(s2, plats, 0, 1 / 60));
    expect(events.bounced).toBe(true);
    expect(s2.vy).toBe(-JUMP_V);
  });

  it('breakable bounces once then breaks', () => {
    const plats = [
      { id: 1, x: 100, y: 200, w: 64, h: 14, type: 'breakable', broken: false, spring: false }
    ];
    const state = { x: 120, y: 170, vx: 0, vy: 300, shield: false, jetpackMs: 0 };
    let events;
    let cur = state;
    for (let i = 0; i < 20 && !events?.broke; i++) ({ state: cur, events } = step(cur, plats, 0, 1 / 60));
    expect(events.broke).toBe(true);
    expect(events.bounced).toBe(true);
    expect(plats[0].broken).toBe(true);
  });

  it('jetpack drives upward and expires', () => {
    const state = { x: 100, y: 500, vx: 0, vy: 0, shield: false, jetpackMs: 800 };
    const { state: s2 } = step(state, [], 0, 1 / 30);
    expect(s2.jetpackMs).toBeLessThan(800);
    expect(s2.vy).toBe(-900);
  });
});

describe('enemies & shields & scoring', () => {
  function enemyScenario(shield) {
    return step(
      { x: 100, y: 176, vx: 0, vy: 100, shield, jetpackMs: 0 },
      [
        {
          id: 1,
          x: 90,
          y: 200,
          w: 64,
          h: 14,
          type: 'static',
          broken: false,
          spring: false,
          enemy: { x: 105, dir: 1 }
        }
      ],
      0,
      1 / 120
    );
  }

  it('enemy kills without shield', () => {
    const { events } = enemyScenario(false);
    expect(events.died).toBe(true);
    expect(events.hitEnemy).toBe(true);
  });

  it('shield absorbs one hit and is consumed', () => {
    const { state: s2, events } = enemyScenario(true);
    expect(events.died).toBe(false);
    expect(events.shieldUsed).toBe(true);
    expect(s2.shield).toBe(false);
  });

  it('score = meters + 50 per spring', () => {
    expect(scoreFor(123.4, 0)).toBe(123);
    expect(scoreFor(100, 2)).toBe(200);
  });
});
