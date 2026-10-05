import { saveLevel, MAX_LEVEL } from '$lib/ladder/progress.js';

export function load({ params, url }) {
  // The grammar ladder ends at MAX_LEVEL; deeper links clamp instead of
  // persisting 11+ and looping the same exercises forever.
  const level = Math.min(MAX_LEVEL, Math.max(1, parseInt(params.n, 10) || 1));
  saveLevel('grammar', level);
  const seed = parseInt(url.searchParams.get('seed'), 10) || (Date.now() % 1000000);
  return { level, seed };
}
