import { saveLevel } from '$lib/trainers/progress.js';

export function load({ params, url }) {
  const level = Math.max(1, parseInt(params.n, 10) || 1);
  saveLevel('speed-match', level);
  const seed = parseInt(url.searchParams.get('seed'), 10) || (Date.now() % 1000000);
  return { level, seed };
}
