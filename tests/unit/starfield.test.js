import { describe, it, expect } from 'vitest';
import { makeStars } from '../../src/lib/components/ui/stars.js';

describe('Starfield star generation', () => {
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
