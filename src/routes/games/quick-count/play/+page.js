import { redirect } from '@sveltejs/kit';
import { loadLevel } from '$lib/ladder/progress';

export function load() {
  redirect(307, `/games/quick-count/play/${loadLevel('quick-count')}`);
}
