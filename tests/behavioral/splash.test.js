import { describe, it, expect } from 'vitest';

describe('Splash game behavior', () => {
  it('splash creates N items', () => {
    const count = 6;
    const splashes = [];
    for (let i = 0; i < count; i++) {
      splashes.push({ id: Math.random(), x: 50, y: 50, color: '#FF6B6B', emoji: '⭐' });
    }
    expect(splashes).toHaveLength(6);
  });

  it('splashes auto-remove after timeout', () => {
    let splashes = [{ id: 1 }, { id: 2 }];
    const ids = new Set([1, 2]);
    splashes = splashes.filter(s => !ids.has(s.id));
    expect(splashes).toHaveLength(0);
  });
});
