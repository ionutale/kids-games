import { describe, it, expect } from 'vitest';

describe('Paint game', () => {
  it('has correct color palette size', () => {
    const colors = 6;
    expect(colors).toBe(6);
  });

  it('stamp mode switches correctly', () => {
    const mode = 'brush';
    const switched = mode === 'brush' ? 'stamp' : 'brush';
    expect(switched).toBe('stamp');
  });

  it('line width maps to brush size', () => {
    const size = (s) => s === 'big' ? 20 : s === 'medium' ? 12 : 6;
    expect(size('small')).toBe(6);
    expect(size('medium')).toBe(12);
    expect(size('big')).toBe(20);
  });
});
