import { describe, it, expect, beforeEach, vi } from 'vitest';

function stubLocalStorage() {
  const store = { 'kids-games-settings': JSON.stringify({ soundEnabled: true }) };
  vi.stubGlobal('localStorage', {
    getItem: vi.fn(key => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn(key => { delete store[key]; }),
    clear: vi.fn(() => { for (const key in store) delete store[key]; })
  });
}

function stubAudioContext() {
  const node = () => ({
    connect: vi.fn(function (dest) { return dest; }),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    gain: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    type: '',
    buffer: null
  });
  const ctx = {
    state: 'running',
    currentTime: 0,
    destination: {},
    createOscillator: vi.fn(node),
    createGain: vi.fn(node)
  };
  vi.stubGlobal('window', { AudioContext: class { constructor() { return ctx; } } });
  return ctx;
}

beforeEach(() => {
  vi.resetModules();
  stubLocalStorage();
});

describe('audioManager', () => {
  it('exports all expected functions', async () => {
    const mod = await import('$lib/sounds/audioManager');
    expect(typeof mod.playTap).toBe('function');
    expect(typeof mod.playPop).toBe('function');
    expect(typeof mod.playMatch).toBe('function');
    expect(typeof mod.playWin).toBe('function');
    expect(typeof mod.playError).toBe('function');
    expect(typeof mod.playSplash).toBe('function');
    expect(typeof mod.playGoal).toBe('function');
    expect(typeof mod.vibrate).toBe('function');
  });

  it('vibrate does not throw when navigator.vibrate is absent', async () => {
    const mod = await import('$lib/sounds/audioManager');
    expect(() => mod.vibrate(30)).not.toThrow();
  });

  it('tap/error/match/win/splash/goal do not throw when called', async () => {
    const mod = await import('$lib/sounds/audioManager');
    expect(() => mod.playTap()).not.toThrow();
    expect(() => mod.playPop()).not.toThrow();
    expect(() => mod.playMatch()).not.toThrow();
    expect(() => mod.playWin()).not.toThrow();
    expect(() => mod.playError()).not.toThrow();
    expect(() => mod.playSplash()).not.toThrow();
    expect(() => mod.playGoal()).not.toThrow();
  });

  it('synthesized sounds stay silent while muted and play after unmute', async () => {
    const ctx = stubAudioContext();
    const { settings } = await import('$lib/stores/settings');
    const { get } = await import('svelte/store');
    if (get(settings).soundEnabled) settings.toggleSound(); // mute

    const mod = await import('$lib/sounds/audioManager');
    mod.playTap();
    expect(ctx.createOscillator).not.toHaveBeenCalled();

    settings.toggleSound(); // unmute
    mod.playTap();
    expect(ctx.createOscillator).toHaveBeenCalled();
  });
});
