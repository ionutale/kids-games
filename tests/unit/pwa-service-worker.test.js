import { describe, it, expect, vi } from 'vitest';
import { setupServiceWorker } from '../../src/lib/pwa/serviceWorker.js';

function harness(visibilityState = 'visible') {
  const reg = { update: vi.fn(async () => {}) };
  const nav = {
    serviceWorker: {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      register: vi.fn(async () => reg)
    }
  };
  const listeners = new Map();
  const win = {
    document: { visibilityState },
    addEventListener: vi.fn((type, cb) => listeners.set(type, cb)),
    removeEventListener: vi.fn((type) => listeners.delete(type))
  };
  const reload = vi.fn();
  return { nav, win, reg, reload, listeners };
}

async function flush() {
  await Promise.resolve();
  await Promise.resolve();
}

describe('setupServiceWorker', () => {
  it('is a no-op in dev', () => {
    const h = harness();
    const cleanup = setupServiceWorker({ isDev: true, nav: h.nav, win: h.win, reload: h.reload });

    expect(h.nav.serviceWorker.register).not.toHaveBeenCalled();
    cleanup();
  });

  it('registers the worker and checks for an update after activation', async () => {
    const h = harness();
    setupServiceWorker({ nav: h.nav, win: h.win, reload: h.reload });

    expect(h.nav.serviceWorker.register).toHaveBeenCalledWith('/sw.js', { scope: '/' });
    await flush();
    expect(h.reg.update).toHaveBeenCalledTimes(1);
  });

  it('checks for an update on focus/visibility and skips hidden tabs', async () => {
    const h = harness();
    setupServiceWorker({ nav: h.nav, win: h.win, reload: h.reload });
    await flush();

    h.listeners.get('focus')();
    expect(h.reg.update).toHaveBeenCalledTimes(2);

    h.win.document.visibilityState = 'hidden';
    h.listeners.get('visibilitychange')();
    expect(h.reg.update).toHaveBeenCalledTimes(2);
  });

  it('reloads exactly once when a new worker takes over', async () => {
    const h = harness();
    const cleanup = setupServiceWorker({ nav: h.nav, win: h.win, reload: h.reload });
    const onController = h.nav.serviceWorker.addEventListener.mock.calls.find(
      ([type]) => type === 'controllerchange'
    )[1];

    onController();
    onController();

    expect(h.reload).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it('cleans up its listeners', () => {
    const h = harness();
    const cleanup = setupServiceWorker({ nav: h.nav, win: h.win, reload: h.reload });
    cleanup();

    expect(h.nav.serviceWorker.removeEventListener).toHaveBeenCalledWith(
      'controllerchange',
      expect.any(Function)
    );
    expect(h.win.removeEventListener).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function)
    );
    expect(h.win.removeEventListener).toHaveBeenCalledWith('focus', expect.any(Function));
  });
});
