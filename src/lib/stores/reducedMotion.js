import { readable } from 'svelte/store';

const QUERY = '(prefers-reduced-motion: reduce)';

/** For imperative loops (rAF, timers) that CSS cannot reach. */
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(QUERY).matches;
}

/** Reactive form for Svelte templates: `$reducedMotion`. */
export const reducedMotion = readable(false, (set) => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
  const query = window.matchMedia(QUERY);
  set(query.matches);
  const onChange = (event) => set(event.matches);
  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', onChange);
  } else {
    query.addListener?.(onChange);
  }
  return () => {
    if (typeof query.removeEventListener === 'function') {
      query.removeEventListener('change', onChange);
    } else {
      query.removeListener?.(onChange);
    }
  };
});
