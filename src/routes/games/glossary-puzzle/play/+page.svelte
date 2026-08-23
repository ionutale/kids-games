<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import PuzzleBoard from '$lib/glossary-puzzle/PuzzleBoard.svelte';
  import { PUZZLE_IMAGES } from '$lib/glossary-puzzle/images.js';

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
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  const savedImage = saved && PUZZLE_IMAGES.find(i => i.id === saved.imageId);
  const image = savedImage || PUZZLE_IMAGES.find(i => i.id === params.get('image')) || null;
  const levelParam = saved && Number.isFinite(parseInt(saved.level, 10))
    ? String(parseInt(saved.level, 10))
    : params.get('level');
  const level = Math.max(1, parseInt(levelParam, 10) || 1);
  const initialPlaced = (saved && Array.isArray(saved.placedIds)) ? saved.placedIds : null;

  if (!image) {
    goto('/games/glossary-puzzle');
  }
</script>

{#if image}
  <PuzzleBoard
    {image}
    {level}
    {initialPlaced}
    backHref="/games/glossary-puzzle"
  />
{/if}
