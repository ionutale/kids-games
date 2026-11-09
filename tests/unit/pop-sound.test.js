import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

function stubLocalStorage(soundEnabled = true) {
  const store = { 'kids-games-settings': JSON.stringify({ soundEnabled }) };
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { for (const key in store) delete store[key]; })
  });
}

/** A stubbed AudioContext that records every scheduled oscillator pitch. */
function stubAudioContext() {
  const frequencies = [];
  const node = () => {
    const frequency = {
      value: 0,
      setValueAtTime: vi.fn((value) => frequencies.push(value)),
      exponentialRampToValueAtTime: vi.fn()
    };
    return {
      connect: vi.fn(function (dest) { return dest; }),
      start: vi.fn(),
      stop: vi.fn(),
      frequency,
      gain: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      type: '',
      buffer: null
    };
  };
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
  return { ctx, frequencies };
}

beforeEach(() => {
  vi.resetModules();
  stubLocalStorage(true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Pop pond sound — swipe chain', () => {
  it('climbs the plop pitch through a chain and clamps it', async () => {
    const { chainFrequency } = await import('../../src/lib/pop/sound.js');

    expect(chainFrequency(0)).toBe(360);
    expect(chainFrequency(1)).toBeGreaterThan(chainFrequency(0));
    expect(chainFrequency(2)).toBeGreaterThan(chainFrequency(1));
    expect(chainFrequency(20)).toBe(chainFrequency(9));
    expect(chainFrequency(-3)).toBe(chainFrequency(0));
  });

  it('resets the chain when the finger lifts', async () => {
    const { frequencies } = stubAudioContext();
    const { createPondSound, chainFrequency } = await import('../../src/lib/pop/sound.js');
    const pond = createPondSound();

    pond.unlock();
    pond.pop();
    pond.pop();
    pond.reset();
    pond.pop();

    // Each pop schedules [chain plop, low water thump].
    expect(frequencies[0]).toBe(chainFrequency(0));
    expect(frequencies[2]).toBe(chainFrequency(1));
    expect(frequencies[4]).toBe(chainFrequency(0));
  });

  it('plays no cue at all while the sound toggle is muted', async () => {
    stubLocalStorage(false);
    const { ctx } = stubAudioContext();
    const { createPondSound } = await import('../../src/lib/pop/sound.js');
    const pond = createPondSound();

    pond.unlock();
    pond.pop();
    pond.spawn();
    pond.crack();
    pond.star();
    pond.chime();
    pond.nearEnd();

    expect(ctx.createOscillator).not.toHaveBeenCalled();
    expect(ctx.createBufferSource).not.toHaveBeenCalled();
  });
});
