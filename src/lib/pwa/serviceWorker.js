/**
 * Production-only PWA service-worker registration.
 *
 * Registers `/sw.js`, checks for a new worker when the tab becomes visible or
 * focused (long-lived/installed sessions otherwise only see a new shell when
 * the browser happens to re-check), and reloads once when a new worker takes
 * over. Returns a cleanup function.
 */
export function setupServiceWorker({
  isDev = false,
  nav = typeof navigator !== 'undefined' ? navigator : null,
  win = typeof window !== 'undefined' ? window : null,
  reload = () => win?.location?.reload(),
  url = '/sw.js',
  scope = '/'
} = {}) {
  if (isDev || !nav?.serviceWorker || typeof nav.serviceWorker.register !== 'function') {
    return () => {};
  }

  let registration = null;
  let refreshing = false;
  let disposed = false;

  const onControllerChange = () => {
    if (refreshing || disposed) return;
    refreshing = true;
    reload();
  };

  const checkForUpdate = () => {
    if (disposed || !registration) return;
    const visibility = win?.document?.visibilityState;
    if (visibility && visibility !== 'visible') return;
    try {
      const result = registration.update?.();
      if (result?.catch) result.catch(() => {});
    } catch {}
  };

  nav.serviceWorker.addEventListener?.('controllerchange', onControllerChange);
  win?.addEventListener?.('visibilitychange', checkForUpdate);
  win?.addEventListener?.('focus', checkForUpdate);

  nav.serviceWorker
    .register(url, { scope })
    .then((reg) => {
      registration = reg;
      checkForUpdate();
    })
    .catch(() => {});

  return () => {
    disposed = true;
    nav.serviceWorker.removeEventListener?.('controllerchange', onControllerChange);
    win?.removeEventListener?.('visibilitychange', checkForUpdate);
    win?.removeEventListener?.('focus', checkForUpdate);
  };
}
