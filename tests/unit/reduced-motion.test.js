import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

function stubMatchMedia(matches) {
  const listeners = [];
  const mq = {
    matches,
    addEventListener: vi.fn((type, cb) => listeners.push(cb)),
    removeEventListener: vi.fn(),
    addListener: vi.fn((cb) => listeners.push(cb)),
    removeListener: vi.fn()
  };
  vi.stubGlobal('window', { matchMedia: vi.fn(() => mq) });
  return { mq, listeners };
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('reduced motion', () => {
  it('reads the media query for imperative loops', async () => {
    stubMatchMedia(true);
    const { prefersReducedMotion } = await import('#lib/stores/reducedMotion.js');
    expect(prefersReducedMotion()).toBe(true);
  });

  it('exposes a readable store that starts from the query', async () => {
    stubMatchMedia(true);
    const { reducedMotion } = await import('#lib/stores/reducedMotion.js');
    const { get } = await import('svelte/store');
    const unsubscribe = reducedMotion.subscribe(() => {});

    expect(get(reducedMotion)).toBe(true);
    unsubscribe();
  });

  it('updates when the query changes', async () => {
    const { listeners } = stubMatchMedia(false);
    const { reducedMotion } = await import('#lib/stores/reducedMotion.js');
    const { get } = await import('svelte/store');
    const unsubscribe = reducedMotion.subscribe(() => {});

    listeners[0]?.({ matches: true });
    expect(get(reducedMotion)).toBe(true);
    unsubscribe();
  });

  it('defaults to false without matchMedia', async () => {
    vi.stubGlobal('window', {});
    const { prefersReducedMotion, reducedMotion } = await import('#lib/stores/reducedMotion.js');
    const { get } = await import('svelte/store');

    expect(prefersReducedMotion()).toBe(false);
    expect(get(reducedMotion)).toBe(false);
  });
});
