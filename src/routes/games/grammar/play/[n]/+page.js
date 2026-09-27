import { saveLevel } from '$lib/trainers/progress.js';

export function load({ params, url }) {
  // The grammar ladder ends at level 10; deeper links clamp instead of
  // persisting 11+ and looping the same exercises forever.
  const level = Math.min(10, Math.max(1, parseInt(params.n, 10) || 1));
  saveLevel('grammar', level);
  const seed = parseInt(url.searchParams.get('seed'), 10) || (Date.now() % 1000000);
  return { level, seed };
}
