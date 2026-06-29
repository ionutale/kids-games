import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
beforeEach(() => {
  const store = {};
  vi.stubGlobal('localStorage', {
    getItem: vi.fn(key => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn(key => { delete store[key]; }),
    clear: vi.fn(() => { for (const key in store) delete store[key]; })
  });
});

const STORAGE_KEY = 'kids-games-settings';

describe('settings store', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('creates with default values when no stored data exists', async () => {
    const { settings } = await import('$lib/stores/settings');
    const unsub = settings.subscribe(v => {
      expect(v.soundEnabled).toBe(true);
      expect(v.ageLevel).toBe(3);
      expect(v.firstVisit).toBe(true);
    });
    unsub();
  });

  it('restores values from localStorage', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ soundEnabled: false, ageLevel: 5, firstVisit: false }));
    const { settings } = await import('$lib/stores/settings');
    const unsub = settings.subscribe(v => {
      expect(v.soundEnabled).toBe(false);
      expect(v.ageLevel).toBe(5);
      expect(v.firstVisit).toBe(false);
    });
    unsub();
  });

  it('toggleSound flips the boolean and persists', async () => {
    const { settings } = await import('$lib/stores/settings');
    settings.toggleSound();
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored.soundEnabled).toBe(false);
    settings.toggleSound();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).soundEnabled).toBe(true);
  });

  it('setAge updates age level and persists', async () => {
    const { settings } = await import('$lib/stores/settings');
    settings.setAge(2);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).ageLevel).toBe(2);
    settings.setAge(5);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).ageLevel).toBe(5);
  });

  it('markVisited sets firstVisit to false', async () => {
    const { settings } = await import('$lib/stores/settings');
    settings.markVisited();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).firstVisit).toBe(false);
  });
});
