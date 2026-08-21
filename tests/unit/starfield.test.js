import { describe, it, expect } from 'vitest';

describe('Starfield star generation', () => {
  // Extracted pure function mirrors component logic
  function makeStars(count, seed = 42) {
    let s = seed;
    const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      top: rand() * 100,
      left: rand() * 100,
      size: 1 + rand() * 2,
      delay: rand() * 4,
      duration: 2 + rand() * 3
    }));
  }

  it('creates requested number of stars', () => {
    expect(makeStars(40)).toHaveLength(40);
  });

  it('keeps positions within bounds', () => {
    const stars = makeStars(200);
    stars.forEach(st => {
      expect(st.top).toBeGreaterThanOrEqual(0);
      expect(st.top).toBeLessThanOrEqual(100);
      expect(st.left).toBeGreaterThanOrEqual(0);
      expect(st.left).toBeLessThanOrEqual(100);
    });
  });
});
