import { describe, it, expect, beforeEach, vi } from 'vitest';

beforeEach(() => {
  const store = {};
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { for (const key in store) delete store[key]; })
  });
});

describe('ladder progress store', () => {
  it('defaults to level 1 when nothing saved', async () => {
    const { loadLevel } = await import('$lib/ladder/progress');
    expect(loadLevel('focus-tap')).toBe(1);
  });

  it('round-trips saveLevel/loadLevel with camelCase keys', async () => {
    const { loadLevel, saveLevel } = await import('$lib/ladder/progress');
    saveLevel('focus-tap', 7);
    expect(localStorage.getItem('focusTapLevel')).toBe('7');
    expect(loadLevel('focus-tap')).toBe(7);
  });

  it('clamps below 1 and above MAX_LEVEL', async () => {
    const { loadLevel, saveLevel, MAX_LEVEL } = await import('$lib/ladder/progress');
    saveLevel('quick-count', -3);
    expect(loadLevel('quick-count')).toBe(1);
    saveLevel('quick-count', 42);
    expect(loadLevel('quick-count')).toBe(MAX_LEVEL);
    expect(localStorage.getItem('quickCountLevel')).toBe(String(MAX_LEVEL));
  });

  it('clamps previously-saved oversized levels on read', async () => {
    const { loadLevel, MAX_LEVEL } = await import('$lib/ladder/progress');
    localStorage.setItem('speedMatchLevel', '23');
    expect(loadLevel('speed-match')).toBe(MAX_LEVEL);
  });

  it('treats garbage as level 1', async () => {
    const { loadLevel } = await import('$lib/ladder/progress');
    localStorage.setItem('speedMatchLevel', 'not-a-number');
    expect(loadLevel('speed-match')).toBe(1);
  });

  it('migrates the legacy memory key once, then removes it', async () => {
    const { loadLevel } = await import('$lib/ladder/progress');
    localStorage.setItem('memory-unlocked-level', '6');
    expect(loadLevel('memory')).toBe(6);
    expect(localStorage.getItem('memory-unlocked-level')).toBe(null);
    expect(localStorage.getItem('memoryLevel')).toBe('6');
  });

  it('migrates the legacy path-builder key', async () => {
    const { loadLevel } = await import('$lib/ladder/progress');
    localStorage.setItem('path-builder-level', '4');
    expect(loadLevel('path-builder')).toBe(4);
    expect(localStorage.getItem('path-builder-level')).toBe(null);
    expect(localStorage.getItem('pathBuilderLevel')).toBe('4');
  });

  it('round-trips mastery flags per game', async () => {
    const { loadMastered, saveMastered } = await import('$lib/ladder/progress');
    expect(loadMastered('grammar')).toBe(false);
    saveMastered('grammar');
    expect(loadMastered('grammar')).toBe(true);
    expect(loadMastered('memory')).toBe(false);
  });
});
