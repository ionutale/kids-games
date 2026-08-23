import { redirect } from '@sveltejs/kit';
import { loadLevel } from '$lib/trainers/progress';

export function load() {
  redirect(307, `/games/quick-count/play/${loadLevel('quick-count')}`);
}
