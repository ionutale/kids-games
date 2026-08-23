<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import PuzzleBoard from '$lib/glossary-puzzle/PuzzleBoard.svelte';
  import { PUZZLE_IMAGES } from '$lib/glossary-puzzle/images.js';
  import { readSave, clearSave } from '$lib/glossary-puzzle/save.js';

  const params = $page.url.searchParams;
  const resume = params.get('resume') === '1';

  let saved = null;
  if (resume) {
    saved = readSave();
    clearSave();
  }

  const savedImage = saved && PUZZLE_IMAGES.find(i => i.id === saved.imageId);
  const image = savedImage || PUZZLE_IMAGES.find(i => i.id === params.get('image')) || null;
  const levelParam = saved && Number.isFinite(saved.level)
    ? String(saved.level)
    : params.get('level');
  const level = Math.max(1, parseInt(levelParam, 10) || 1);
  const initialPlaced = (saved && Array.isArray(saved.placedIds)) ? saved.placedIds : null;

  if (!image) {
    goto('/games/glossary-puzzle');
  }
</script>

<svelte:head>
  {#if image}<link rel="preload" as="image" href={image.file} />{/if}
</svelte:head>

{#if image}
  <PuzzleBoard
    {image}
    {level}
    {initialPlaced}
    backHref="/games/glossary-puzzle"
  />
{/if}
