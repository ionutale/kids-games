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

function stubAudioContext() {
  const node = () => ({
    connect: vi.fn(function (dest) { return dest; }),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    gain: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    type: '',
    Q: { value: 0 },
    buffer: null
  });
  const ctx = {
    state: 'running',
    currentTime: 0,
    sampleRate: 44100,
    destination: {},
    createOscillator: vi.fn(node),
    createGain: vi.fn(node),
    createBuffer: vi.fn((ch, len) => ({ getChannelData: () => new Float32Array(len) })),
    createBufferSource: vi.fn(node),
    createBiquadFilter: vi.fn(node)
  };
  vi.stubGlobal('window', { AudioContext: class { constructor() { return ctx; } } });
  return ctx;
}

async function settingsWith(soundEnabled) {
  const { settings } = await import('$lib/stores/settings');
  const { get } = await import('svelte/store');
  if (get(settings).soundEnabled !== soundEnabled) settings.toggleSound();
  return settings;
}

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

describe('mute gating (trainerSounds)', () => {
  it('synth micro-events stay silent while muted and sound after unmute', async () => {
    vi.resetModules();
    const ctx = stubAudioContext();
    const settings = await settingsWith(false);
    const ts = await import('$lib/sounds/trainerSounds');
    ts.playLevelTick();
    expect(ctx.createOscillator).not.toHaveBeenCalled();
    settings.toggleSound(); // unmute
    ts.playLevelTick();
    expect(ctx.createOscillator).toHaveBeenCalled();
  });

  it('fanfare does not play while muted', async () => {
    vi.resetModules();
    const plays = [];
    vi.stubGlobal('Audio', class {
      constructor() { plays.push('new'); }
      play() { plays.push('play'); return Promise.resolve(); }
    });
    await settingsWith(false);
    const ts = await import('$lib/sounds/trainerSounds');
    ts.fanfare();
    expect(plays).toEqual([]);
    const { settings } = await import('$lib/stores/settings');
    settings.toggleSound(); // restore for later tests sharing the module cache
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

describe('mute gating (trainerMusic)', () => {
  it('starts paused while muted and begins playback on unmute', async () => {
    vi.resetModules();
    const settings = await settingsWith(false);
    const { startTrainerMusic } = await import('$lib/sounds/trainerMusic');
    const audio = startTrainerMusic('focus-tap');
    expect(audio).toBeTruthy();
    expect(audio.play).not.toHaveBeenCalled();
    settings.toggleSound(); // unmute
    expect(audio.play).toHaveBeenCalled();
  });

  it('muting pauses the current track and unmuting resumes it', async () => {
    vi.resetModules();
    const settings = await settingsWith(true);
    const { startTrainerMusic, stopTrainerMusic } = await import('$lib/sounds/trainerMusic');
    const audio = startTrainerMusic('focus-tap');
    expect(audio.play).toHaveBeenCalledTimes(1);
    settings.toggleSound(); // mute
    expect(audio.pause).toHaveBeenCalled();
    settings.toggleSound(); // unmute
    expect(audio.play).toHaveBeenCalledTimes(2);
    stopTrainerMusic();
  });
});
