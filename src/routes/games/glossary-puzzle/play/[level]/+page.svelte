<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import PuzzleBoard from '$lib/glossary-puzzle/PuzzleBoard.svelte';
  import { PUZZLE_IMAGES } from '$lib/glossary-puzzle/images.js';
  import { clearSave, takeHandoff } from '$lib/glossary-puzzle/save.js';

  let level = $derived(Math.max(1, parseInt($page.params.level, 10) || 1));
  let requestedId = $derived($page.url.searchParams.get('image'));
  let image = $derived(
    PUZZLE_IMAGES.find(i => i.id === requestedId)
    || PUZZLE_IMAGES[(level - 1) % PUZZLE_IMAGES.length]
  );

  // Resume handoff is consumed once, when this component first mounts
  // (resume links always arrive from the gallery, which mounts us fresh).
  let initialPlaced = $state(null);
  if ($page.url.searchParams.get('resume') === '1') {
    initialPlaced = takeHandoff();
    clearSave();
  }

  // Handoff applies only to the first mounted board; clear it so
  // subsequent in-game navigations (e.g. Next Level) start clean.
  $effect(() => { initialPlaced = null; });

  $effect(() => {
    if (!image) goto('/games/glossary-puzzle');
  });
</script>

<svelte:head>
  {#if image}<link rel="preload" as="image" href={image.file} />{/if}
</svelte:head>

{#if image}
  {#key $page.url.href}
    <PuzzleBoard
      {image}
      {level}
      {initialPlaced}
      backHref="/games/glossary-puzzle"
    />
  {/key}
{/if}
