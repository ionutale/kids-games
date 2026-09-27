<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import PuzzleBoard from '$lib/glossary-puzzle/PuzzleBoard.svelte';
  import { PUZZLE_IMAGES } from '$lib/glossary-puzzle/images.js';
  import { readSave, clearSave, restorePlaced, takeHandoff } from '$lib/glossary-puzzle/save.js';

  let level = $derived(Math.max(1, parseInt($page.params.level, 10) || 1));
  let requestedId = $derived($page.url.searchParams.get('image'));
  // ?place= is a test/debug seam only: without debug=1 the ids are ignored.
  let placeIds = $derived(
    import.meta.env.DEV || $page.url.searchParams.get('debug') === '1'
      ? ($page.url.searchParams.get('place') || '').split(',').map(x => x.trim()).filter(Boolean)
      : []
  );
  let image = $derived(
    PUZZLE_IMAGES.find(i => i.id === requestedId)
    || PUZZLE_IMAGES[(level - 1) % PUZZLE_IMAGES.length]
  );

  // Resume handoff is consumed once, when this component first mounts.
  // Reloading the URL must not lose the stored save: only the handoff is
  // one-shot, the save is read as a fallback.
  let initialPlaced = $state(null);
  if ($page.url.searchParams.get('resume') === '1') {
    initialPlaced = restorePlaced({
      handoff: takeHandoff(),
      stored: readSave(),
      imageId: image?.id,
      level
    });
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
      {placeIds}
      backHref="/games/glossary-puzzle"
      onWin={() => clearSave()}
    />
  {/key}
{/if}
