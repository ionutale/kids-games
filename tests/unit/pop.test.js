import { describe, it, expect } from 'vitest';
import {
  ROUND_SECONDS,
  SURPRISES,
  levelConfig,
  targetFor,
  typesFor,
  surpriseCountFor,
  surprisePoolFor,
  pickType,
  bubbleSize,
  popValue,
  miniKinds,
  jarPercent,
  jarIsFull,
  jarMiniSize
} from '../../src/lib/pop/config.js';

describe('Pop — the Rising Pond round', () => {
  it('is one 30-second round', () => {
    expect(ROUND_SECONDS).toBe(30);
  });

  it('maps levels to the jar target 6 → 15', () => {
    expect(targetFor(1)).toBe(6);
    expect(targetFor(2)).toBe(7);
    expect(targetFor(5)).toBe(10);
    expect(targetFor(10)).toBe(15);
  });

  it('is monotonic non-decreasing across levels 1..10', () => {
    let prev = 0;
    for (let level = 1; level <= 10; level += 1) {
      const target = targetFor(level);
      expect(target).toBeGreaterThanOrEqual(prev);
      prev = target;
    }
  });

  it('clamps out-of-range levels like the ladder does', () => {
    expect(targetFor(0)).toBe(6);
    expect(targetFor(99)).toBe(15);
    expect(levelConfig(0)).toEqual(levelConfig(1));
    expect(levelConfig(99)).toEqual(levelConfig(10));
  });
});

describe('Pop level configuration', () => {
  it('level 1 is the gentlest pond', () => {
    const config = levelConfig(1);
    expect(config.target).toBe(6);
    expect(config.spawnMs).toBeGreaterThanOrEqual(760);
    expect(config.fallSec).toBeGreaterThanOrEqual(8.5);
    expect(config.maxItems).toBeGreaterThanOrEqual(6);
    expect(config.types).toEqual(['normal']);
    expect(config.surprises).toBe(2);
  });

  it('level 10 is the busiest but still gentle', () => {
    const config = levelConfig(10);
    expect(config.target).toBe(15);
    expect(config.spawnMs).toBeLessThanOrEqual(520);
    expect(config.fallSec).toBeLessThanOrEqual(7);
    expect(config.maxItems).toBeGreaterThanOrEqual(10);
    expect(config.types).toEqual(['normal', 'giant', 'star']);
    expect(config.surprises).toBe(5);
  });

  it('spawns faster and rises faster as levels go up', () => {
    const l1 = levelConfig(1);
    const l5 = levelConfig(5);
    const l10 = levelConfig(10);
    expect(l5.spawnMs).toBeLessThan(l1.spawnMs);
    expect(l10.spawnMs).toBeLessThan(l5.spawnMs);
    expect(l5.fallSec).toBeLessThan(l1.fallSec);
    expect(l10.fallSec).toBeLessThan(l5.fallSec);
    expect(l10.maxItems).toBeGreaterThan(l1.maxItems);
  });

  it('keeps every fall duration sane on every level', () => {
    for (let level = 1; level <= 10; level += 1) {
      const config = levelConfig(level);
      expect(config.spawnMs).toBeGreaterThanOrEqual(480);
      expect(config.spawnMs).toBeLessThanOrEqual(800);
      expect(config.fallSec).toBeGreaterThanOrEqual(6);
      expect(config.fallSec).toBeLessThanOrEqual(10);
      expect(config.target).toBe(targetFor(level));
    }
  });
});

describe('Pop bubble types', () => {
  it('levels 1–2 use normal bubbles only', () => {
    expect(typesFor(1)).toEqual(['normal']);
    expect(typesFor(2)).toEqual(['normal']);
  });

  it('giant unlocks at level 3 and star at level 6', () => {
    expect(typesFor(3)).toEqual(['normal', 'giant']);
    expect(typesFor(5)).toEqual(['normal', 'giant']);
    expect(typesFor(6)).toEqual(['normal', 'giant', 'star']);
    expect(typesFor(10)).toEqual(['normal', 'giant', 'star']);
  });

  it('picks a star only when stars are unlocked', () => {
    expect(pickType(typesFor(10), () => 0.05)).toBe('star');
    expect(pickType(typesFor(6), () => 0.05)).toBe('star');
    expect(pickType(typesFor(2), () => 0.05)).toBe('normal');
    expect(pickType(typesFor(3), () => 0.05)).toBe('giant');
  });

  it('picks a giant in the middle band and normal everywhere else', () => {
    expect(pickType(typesFor(6), () => 0.2)).toBe('giant');
    expect(pickType(typesFor(6), () => 0.9)).toBe('normal');
    expect(pickType(typesFor(1), () => 0.2)).toBe('normal');
  });

  it('keeps normal bubbles large and giant/star fixed', () => {
    expect(bubbleSize('normal', () => 0)).toBe(48);
    expect(bubbleSize('normal', () => 1)).toBe(60);
    expect(bubbleSize('giant', () => 0.5)).toBe(86);
    expect(bubbleSize('star', () => 0.5)).toBe(56);
    expect(bubbleSize('mystery', () => 0.5)).toBeGreaterThanOrEqual(48);
  });
});

describe('Pop jar points and trinkets', () => {
  it('normal is one point; giant and star are two', () => {
    expect(popValue('normal')).toBe(1);
    expect(popValue('giant')).toBe(2);
    expect(popValue('star')).toBe(2);
  });

  it('pushes one mini per point so minis match the fill', () => {
    expect(miniKinds('normal', 'fish')).toEqual(['fish']);
    expect(miniKinds('giant', 'shell')).toEqual(['shell', 'shell']);
    expect(miniKinds('star', 'flower')).toEqual(['star', 'star']);
  });

  it('fills the jar by points and clamps at the target', () => {
    expect(jarPercent(0, 6)).toBe(0);
    expect(jarPercent(3, 6)).toBeCloseTo(0.5);
    expect(jarPercent(6, 6)).toBe(1);
    expect(jarPercent(9, 6)).toBe(1);
    expect(jarPercent(0, 0)).toBe(0);
    expect(jarIsFull(5, 6)).toBe(false);
    expect(jarIsFull(6, 6)).toBe(true);
    expect(jarIsFull(7, 6)).toBe(true);
    expect(jarMiniSize(10)).toBe(14);
    expect(jarMiniSize(11)).toBe(10);
    // Four 10px minis plus 1px gaps = 43px, inside the 46px content box at 360px.
    expect(4 * jarMiniSize(16) + 3).toBeLessThanOrEqual(46);
  });

  it('grows the surprise variety with the level', () => {
    expect(surpriseCountFor(1)).toBe(2);
    expect(surpriseCountFor(3)).toBe(3);
    expect(surpriseCountFor(5)).toBe(4);
    expect(surpriseCountFor(7)).toBe(5);
    expect(surpriseCountFor(10)).toBe(5);
    expect(surprisePoolFor(1)).toEqual(SURPRISES.slice(0, 2));
    expect(surprisePoolFor(10)).toEqual(SURPRISES);
    for (let level = 2; level <= 7; level += 1) {
      expect(surpriseCountFor(level)).toBeGreaterThanOrEqual(surpriseCountFor(level - 1));
    }
  });
});
