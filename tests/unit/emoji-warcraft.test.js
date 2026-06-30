import { describe, it, expect } from 'vitest';
import { createMap, bfs, MAP_W, MAP_H, T } from '$lib/emoji-warcraft/map.js';
import { BUILDINGS } from '$lib/emoji-warcraft/buildings.js';
import { UNIT_TYPES } from '$lib/emoji-warcraft/units.js';

describe('Map', () => {
  it('creates 12x12 grid', () => {
    const map = createMap();
    expect(map.length).toBe(12);
    expect(map[0].length).toBe(12);
  });

  it('bfs finds path between two empty cells', () => {
    const map = Array.from({ length: 12 }, () => Array(12).fill(T.EMPTY));
    const path = bfs(map, 0, 0, 11, 11);
    expect(path).not.toBeNull();
    expect(path[0]).toEqual([0, 0]);
    expect(path[path.length - 1]).toEqual([11, 11]);
  });

  it('bfs returns null for unreachable cells', () => {
    const map = Array.from({ length: 12 }, () => Array(12).fill(T.EMPTY));
    for (let c = 0; c < 12; c++) map[5][c] = T.WATER;
    const path = bfs(map, 0, 0, 11, 11);
    expect(path).toBeNull();
  });

  it('has gold and tree resources', () => {
    const map = createMap();
    const goldCount = map.flat().filter(c => c === T.GOLD).length;
    const treeCount = map.flat().filter(c => c === T.TREE).length;
    expect(goldCount).toBeGreaterThanOrEqual(4);
    expect(treeCount).toBeGreaterThanOrEqual(10);
  });
});

describe('Buildings', () => {
  it('has 6 building types', () => {
    expect(BUILDINGS.length).toBe(6);
  });

  it('each has emoji and HP', () => {
    BUILDINGS.forEach(b => {
      expect(b.emoji).toBeTruthy();
      expect(b.hp).toBeGreaterThan(0);
    });
  });

  it('Town Hall costs nothing', () => {
    const th = BUILDINGS.find(b => b.id === 'townHall');
    expect(th.cost.g).toBe(0);
    expect(th.cost.w).toBe(0);
  });

  it('Barracks costs 100g 50w', () => {
    const b = BUILDINGS.find(b => b.id === 'barracks');
    expect(b.cost.g).toBe(100);
    expect(b.cost.w).toBe(50);
  });
});

describe('Units', () => {
  it('has 4 unit types', () => {
    expect(UNIT_TYPES.length).toBe(4);
  });

  it('each has cost and attack', () => {
    UNIT_TYPES.forEach(u => {
      expect(u.emoji).toBeTruthy();
      expect(u.hp).toBeGreaterThan(0);
    });
  });

  it('Knight is fastest', () => {
    const knight = UNIT_TYPES.find(u => u.id === 'knight');
    expect(knight.speed).toBe(2);
  });

  it('Archer has range 2', () => {
    const archer = UNIT_TYPES.find(u => u.id === 'archer');
    expect(archer.range).toBe(2);
  });
});
