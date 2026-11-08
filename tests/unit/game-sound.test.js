import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

function stubLocalStorage() {
  const store = { 'kids-games-settings': JSON.stringify({ soundEnabled: true }) };
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
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
    sampleRate: 44100,
    destination: {},
    createOscillator: vi.fn(node),
    createGain: vi.fn(node),
    createBuffer: vi.fn((_ch, len) => ({ getChannelData: () => new Float32Array(len) })),
    createBufferSource: vi.fn(node),
    createBiquadFilter: vi.fn(node),
    resume: vi.fn(),
    suspend: vi.fn(() => Promise.resolve())
  };
  vi.stubGlobal('window', { AudioContext: class { constructor() { return ctx; } } });
  return ctx;
}

beforeEach(() => {
  vi.resetModules();
  stubLocalStorage();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('createGameSound', () => {
  it('plays a registered cue through the shared context', async () => {
    const ctx = stubAudioContext();
    const { createGameSound } = await import('../../src/lib/sounds/gameSound.js');
    const sound = createGameSound({ ping: ({ tone }) => tone({ freq: 440, dur: 0.05 }) });

    sound.unlock();
    sound.play('ping');

    expect(ctx.createOscillator).toHaveBeenCalledTimes(1);
  });

  it('stays silent while muted and plays after unmute', async () => {
    const ctx = stubAudioContext();
    const { settings } = await import('../../src/lib/stores/settings.js');
    const { get } = await import('svelte/store');
    if (get(settings).soundEnabled) settings.toggleSound();

    const { createGameSound } = await import('../../src/lib/sounds/gameSound.js');
    const sound = createGameSound({ ping: ({ tone }) => tone({ freq: 440 }) });
    sound.unlock();
    sound.play('ping');
    expect(ctx.createOscillator).not.toHaveBeenCalled();

    settings.toggleSound();
    sound.play('ping');
    expect(ctx.createOscillator).toHaveBeenCalled();
  });

  it('cancels delayed cues on stop', async () => {
    const ctx = stubAudioContext();
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const { createGameSound } = await import('../../src/lib/sounds/gameSound.js');
    const sound = createGameSound({
      late: ({ after, tone }) => after(50, () => tone({ freq: 300 }))
    });

    sound.play('late');
    sound.stop();
    vi.advanceTimersByTime(100);

    expect(ctx.createOscillator).not.toHaveBeenCalled();
  });

  it('ignores cues after dispose and suspends the shared context', async () => {
    const ctx = stubAudioContext();
    const { createGameSound } = await import('../../src/lib/sounds/gameSound.js');
    const sound = createGameSound({ ping: ({ tone }) => tone({ freq: 440 }) });

    sound.unlock();
    sound.play('ping');
    sound.dispose();
    sound.play('ping');

    expect(ctx.createOscillator).toHaveBeenCalledTimes(1);
    expect(ctx.suspend).toHaveBeenCalled();
  });

  it('resumes a suspended context on unlock', async () => {
    const ctx = stubAudioContext();
    ctx.state = 'suspended';
    const { createGameSound } = await import('../../src/lib/sounds/gameSound.js');
    const sound = createGameSound({});

    sound.unlock();

    expect(ctx.resume).toHaveBeenCalled();
  });

  it('plays a noise cue through the shared context', async () => {
    const ctx = stubAudioContext();
    const { createGameSound } = await import('../../src/lib/sounds/gameSound.js');
    const sound = createGameSound({
      whoosh: ({ noise }) => noise({ dur: 0.05, vol: 0.02 })
    });

    sound.unlock();
    sound.play('whoosh');

    expect(ctx.createBufferSource).toHaveBeenCalledTimes(1);
  });

  it('does not throw when there is no AudioContext', async () => {
    vi.stubGlobal('window', {});
    const { createGameSound } = await import('../../src/lib/sounds/gameSound.js');
    const sound = createGameSound({ ping: ({ tone }) => tone({ freq: 440 }) });

    expect(() => sound.play('ping')).not.toThrow();
  });
});
