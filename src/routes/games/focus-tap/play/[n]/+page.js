import { loadLevel, saveLevel } from '$lib/trainers/progress';

export function load({ params, url }) {
  const level = Math.max(1, parseInt(params.n, 10) || 1);
  saveLevel('focus-tap', level);
  const seed = parseInt(url.searchParams.get('seed'), 10) || (Date.now() % 1000000);
  return { level, seed };
}
