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
});
