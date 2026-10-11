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

describe('glossary-puzzle solved store', () => {
  it('returns an empty map when nothing is stored', async () => {
    const { loadSolved } = await import('$lib/glossary-puzzle/solved');
    expect(loadSolved()).toEqual({});
  });

  it('returns an empty map for corrupt JSON', async () => {
    const { loadSolved } = await import('$lib/glossary-puzzle/solved');
    localStorage.setItem('glossary-puzzle-solved', '{oops');
    expect(loadSolved()).toEqual({});
  });

  it('records the solved level per image', async () => {
    const { loadSolved, recordSolved } = await import('$lib/glossary-puzzle/solved');
    recordSolved('garden', 3);
    expect(loadSolved().garden).toBe(3);
  });

  it('keeps the highest level ever solved', async () => {
    const { loadSolved, recordSolved } = await import('$lib/glossary-puzzle/solved');
    recordSolved('garden', 3);
    recordSolved('garden', 2);
    expect(loadSolved().garden).toBe(3);
    recordSolved('garden', 5);
    expect(loadSolved().garden).toBe(5);
  });
});

describe('badgeFor', () => {
  it('shows a check when solved at or beyond the current level', async () => {
    const { badgeFor } = await import('$lib/glossary-puzzle/solved');
    expect(badgeFor({ garden: 3 }, 'garden', 3)).toBe('check');
    expect(badgeFor({ garden: 3 }, 'garden', 2)).toBe('check');
  });

  it('shows nothing when the current level is not yet solved', async () => {
    const { badgeFor } = await import('$lib/glossary-puzzle/solved');
    expect(badgeFor({ garden: 3 }, 'garden', 5)).toBe('none');
    expect(badgeFor({}, 'ocean', 1)).toBe('none');
  });

  it('shows gold at the top level', async () => {
    const { badgeFor } = await import('$lib/glossary-puzzle/solved');
    expect(badgeFor({ garden: 10 }, 'garden', 10)).toBe('gold');
  });
});
