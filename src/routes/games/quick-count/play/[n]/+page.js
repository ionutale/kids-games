import { saveLevel, MAX_LEVEL } from '$lib/ladder/progress.js';

export function load({ params, url }) {
  const level = Math.min(MAX_LEVEL, Math.max(1, parseInt(params.n, 10) || 1));
  saveLevel('quick-count', level);
  const seed = parseInt(url.searchParams.get('seed'), 10) || (Date.now() % 1000000);
  return { level, seed };
}
