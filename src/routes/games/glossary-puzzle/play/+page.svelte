<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import PuzzleBoard from '$lib/glossary-puzzle/PuzzleBoard.svelte';
  import { PUZZLE_IMAGES, DIFFICULTIES } from '$lib/glossary-puzzle/images.js';

  const STORAGE_KEY = 'glossary-puzzle-save';

  const params = $page.url.searchParams;
  const resume = params.get('resume') === '1';

  let saved = null;
  if (resume && typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      saved = raw ? JSON.parse(raw) : null;
    } catch {
      saved = null;
    }
  }

  const savedImage = saved && PUZZLE_IMAGES.find(i => i.id === saved.imageId);
  const image = savedImage || PUZZLE_IMAGES.find(i => i.id === params.get('image')) || null;
  const difficulty = (saved && DIFFICULTIES[saved.difficulty]) ||
    (DIFFICULTIES[params.get('diff')] ? params.get('diff') : 'easy');
  const initialPlaced = saved?.placedIds || null;

  if (resume && typeof localStorage !== 'undefined') {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  if (!image) {
    goto('/games/glossary-puzzle');
  }
</script>

{#if image}
  <PuzzleBoard
    {image}
    {difficulty}
    {initialPlaced}
    backHref="/games/glossary-puzzle"
  />
{/if}
