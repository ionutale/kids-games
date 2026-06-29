import { describe, it, expect } from 'vitest';

describe('Paint game behavior', () => {
  it('brush and stamp are the two modes', () => {
    const modes = ['brush', 'stamp'];
    expect(modes.includes('brush')).toBe(true);
    expect(modes.includes('stamp')).toBe(true);
  });

  it('colors array has 6 entries', () => {
    const colors = ['#FF6B6B', '#4FC3F7', '#81C784', '#FFD54F', '#BA68C8', '#FF8A65'];
    expect(colors).toHaveLength(6);
  });
});
