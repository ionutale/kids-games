import { describe, it, expect, beforeEach, vi } from 'vitest';

beforeEach(() => {
  const store = { 'kids-games-settings': JSON.stringify({ soundEnabled: true }) };
  vi.stubGlobal('localStorage', {
    getItem: vi.fn(key => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn(key => { delete store[key]; }),
    clear: vi.fn(() => { for (const key in store) delete store[key]; })
  });
  vi.stubGlobal('Audio', class {
    constructor(src) {
      this.src = src ?? '';
      this.volume = 1;
      this.loop = false;
      this.playbackRate = 1;
      this.play = vi.fn(() => Promise.resolve());
      this.pause = vi.fn();
    }
  });
});

describe('trainerSounds', () => {
  it('exposes the six micro-events plus fanfare', async () => {
    const ts = await import('$lib/sounds/trainerSounds');
    for (const fn of ['playLevelTick', 'playFlashWhoosh', 'playReadyTick', 'playAdvancePop', 'playSlotChime', 'playSparkle', 'fanfare']) {
      expect(typeof ts[fn]).toBe('function');
    }
  });

  it('never throws without a user gesture / AudioContext', async () => {
    const ts = await import('$lib/sounds/trainerSounds');
    expect(() => ts.playLevelTick()).not.toThrow();
    expect(() => ts.playFlashWhoosh(0.5)).not.toThrow();
    expect(() => ts.playReadyTick()).not.toThrow();
    expect(() => ts.playAdvancePop()).not.toThrow();
    expect(() => ts.playSlotChime(1.3)).not.toThrow();
    expect(() => ts.playSparkle()).not.toThrow();
    expect(() => ts.fanfare(1.15)).not.toThrow();
  });
});

describe('trainerMusic', () => {
  it('starts looped playback at low volume and stop() pauses it', async () => {
    const { startTrainerMusic, stopTrainerMusic } = await import('$lib/sounds/trainerMusic');
    const audio = startTrainerMusic('focus-tap');
    expect(audio).toBeTruthy();
    expect(audio.loop).toBe(true);
    expect(audio.volume).toBeCloseTo(0.2);
    expect(audio.src).toContain('/sounds/music/focus-tap.mp3');
    expect(audio.play).toHaveBeenCalled();
    stopTrainerMusic();
    expect(audio.pause).toHaveBeenCalled();
  });

  it('starting twice does not stack two audios', async () => {
    const { startTrainerMusic } = await import('$lib/sounds/trainerMusic');
    const a = startTrainerMusic('quick-count');
    const b = startTrainerMusic('quick-count');
    expect(a).toBe(b);
  });

  it('is SSR-safe (no document/Audio needed)', async () => {
    const mod = await import('$lib/sounds/trainerMusic');
    expect(typeof mod.startTrainerMusic).toBe('function');
  });
});
