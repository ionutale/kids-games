import { describe, it, expect } from 'vitest';
import { TOWERS, upgradedStats } from '$lib/tower-defense/towers.js';
import { ENEMY_TYPES, scaledHealth } from '$lib/tower-defense/enemies.js';
import { MAPS, getPathCells } from '$lib/tower-defense/maps.js';

describe('Towers', () => {
  it('has 5 tower types', () => {
    expect(TOWERS.length).toBe(5);
  });

  it('each tower has required fields', () => {
    TOWERS.forEach(t => {
      expect(t.id).toBeTruthy();
      expect(t.cost).toBeGreaterThan(0);
      expect(t.damage).toBeGreaterThan(0);
      expect(t.range).toBeGreaterThan(0);
    });
  });

  it('upgrade stats scale correctly', () => {
    const arrow = TOWERS[0];
    const up1 = upgradedStats(arrow, 1);
    expect(up1.damage).toBeGreaterThan(arrow.damage);
    expect(up1.range).toBeGreaterThanOrEqual(arrow.range);
  });

  it('upgrade cost increases with level', () => {
    const arrow = TOWERS[0];
    const up1 = upgradedStats(arrow, 1);
    const up2 = upgradedStats(arrow, 2);
    expect(up1.upgradeCost).toBeLessThan(up2.upgradeCost);
  });
});

describe('Enemies', () => {
  it('has 4 enemy types', () => {
    expect(ENEMY_TYPES.length).toBe(4);
  });

  it('health scales with level', () => {
    expect(scaledHealth(20, 1)).toBe(20);
    expect(scaledHealth(20, 5)).toBeGreaterThan(20);
  });

  it('firstLevel increases', () => {
    for (let i = 1; i < ENEMY_TYPES.length; i++) {
      expect(ENEMY_TYPES[i].firstLevel).toBeGreaterThanOrEqual(ENEMY_TYPES[i - 1].firstLevel);
    }
  });
});

describe('Maps', () => {
  it('has 5 maps', () => {
    expect(MAPS.length).toBe(5);
  });

  it('each map has grid, startCoins, lives', () => {
    MAPS.forEach(m => {
      expect(m.grid).toBeGreaterThan(0);
      expect(m.startCoins).toBeGreaterThan(0);
      expect(m.lives).toBe(10);
    });
  });

  it('path has spawn and end', () => {
    MAPS.forEach(m => {
      const cells = getPathCells(m.layout);
      expect(cells.length).toBeGreaterThan(2);
    });
  });
});
