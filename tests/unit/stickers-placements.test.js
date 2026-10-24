import { describe, it, expect } from 'vitest';
import {
  addPlacement,
  bringToFront,
  movePlacement,
  removePlacement,
  canAdd
} from '$lib/stickers/placements.js';

const a = { id: 'a', type: 'trex', x: 10, y: 10 };
const b = { id: 'b', type: 'fern', x: 20, y: 20 };
const c = { id: 'c', type: 'sun', x: 30, y: 30 };

describe('Stickers placements', () => {
  it('adds a placement at the end', () => {
    const next = addPlacement([a], b);
    expect(next).toEqual([a, b]);
    expect(next).not.toBe([a]);
  });

  it('blocks a placement at the soft cap', () => {
    const full = Array.from({ length: 80 }, (_, index) => ({ id: `p${index}`, type: 'trex', x: 50, y: 50 }));
    expect(canAdd(full)).toBe(false);
    expect(canAdd(full.slice(0, 79))).toBe(true);
    expect(addPlacement(full, a)).toHaveLength(80);
  });

  it('brings a sticker to the front without mutating the input', () => {
    const input = [a, b, c];
    expect(bringToFront(input, 'b')).toEqual([a, c, b]);
    expect(input).toEqual([a, b, c]);
  });

  it('keeps the array unchanged when the sticker is already on top', () => {
    expect(bringToFront([a, b, c], 'c')).toEqual([a, b, c]);
    expect(bringToFront([a, b, c], 'missing')).toEqual([a, b, c]);
  });

  it('moves only the requested sticker', () => {
    const input = [a, b];
    const next = movePlacement(input, 'b', 70, 30);
    expect(next).toEqual([a, { ...b, x: 70, y: 30 }]);
    expect(input[1]).toEqual(b);
  });

  it('removes a sticker by id', () => {
    expect(removePlacement([a, b, c], 'b')).toEqual([a, c]);
    expect(removePlacement([a, b, c], 'missing')).toEqual([a, b, c]);
  });
});
