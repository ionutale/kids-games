import { redirect } from '@sveltejs/kit';
import { loadLevel } from '#lib/ladder/progress.js';

export function load() {
  redirect(307, `/games/grammar/play/${loadLevel('grammar')}`);
}
