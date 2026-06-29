import { describe, it, expect } from 'vitest';

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
});
