import { makeRng } from '$lib/trainers/rng.js';

export function load({ url }) {
  const seed = parseInt(url.searchParams.get('seed'), 10) || null;
  return { seed };
}
