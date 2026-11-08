import { describe, it, expect, afterEach, vi } from 'vitest';
import { seedFromUrl, makeSeed } from '../../src/lib/game/seed.js';

function url(search = '') {
  return new URL(`http://localhost/games/example${search}`);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('seedFromUrl', () => {
  it('reads a numeric seed', () => {
    expect(seedFromUrl(url('?seed=123'))).toBe(123);
  });

  it('returns null without a seed', () => {
    expect(seedFromUrl(url())).toBeNull();
    expect(seedFromUrl(new URL('http://localhost/games/example?seed='))).toBeNull();
    expect(seedFromUrl(null)).toBeNull();
  });

  it('rejects text and floors decimals', () => {
    expect(seedFromUrl(url('?seed=abc'))).toBeNull();
    expect(seedFromUrl(url('?seed=1.7'))).toBe(1);
  });

  it('turns negatives positive and keeps zero usable', () => {
    expect(seedFromUrl(url('?seed=-5'))).toBe(5);
    expect(seedFromUrl(url('?seed=0'))).toBe(1);
  });
});

describe('makeSeed', () => {
  it('returns a positive integer', () => {
    const seed = makeSeed(1);
    expect(Number.isInteger(seed)).toBe(true);
    expect(seed).toBeGreaterThan(0);
  });

  it('differs for different prefixes at the same instant', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1000);
    expect(makeSeed(1)).not.toBe(makeSeed(2));
  });
});
