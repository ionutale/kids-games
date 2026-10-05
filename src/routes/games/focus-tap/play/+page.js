import { redirect } from '@sveltejs/kit';
import { loadLevel } from '$lib/ladder/progress';

export function load() {
  redirect(307, `/games/focus-tap/play/${loadLevel('focus-tap')}`);
}
