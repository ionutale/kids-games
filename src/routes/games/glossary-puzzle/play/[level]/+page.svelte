<script>
  import { get } from 'svelte/store';
  import { page } from '$app/stores';
  import PuzzleBoard from '$lib/glossary-puzzle/PuzzleBoard.svelte';
  import { PUZZLE_IMAGES, resolveImage, revokeVM } from '$lib/glossary-puzzle/images.js';
  import { readSave, clearSave, restorePlaced, takeHandoff } from '$lib/glossary-puzzle/save.js';
  import { _ } from '$lib/stores/locale';
  import { MAX_LEVEL } from '$lib/ladder/progress.js';

  // The ladder ends at MAX_LEVEL; deeper links clamp.
  let level = $derived(Math.min(MAX_LEVEL, Math.max(1, parseInt($page.params.level, 10) || 1)));
  // ?place= is a test/debug seam only: without debug=1 the ids are ignored.
  let placeIds = $derived(
    import.meta.env.DEV || $page.url.searchParams.get('debug') === '1'
      ? ($page.url.searchParams.get('place') || '').split(',').map(x => x.trim()).filter(Boolean)
      : []
  );

  // Image resolution is async — a `photo:<uuid>` id is read from IndexedDB — so
  // the board must not mount until it settles. A photo resume that first rendered
  // the builtin fallback would never remount (the {#key} is the URL, unchanged).
  let state = $state({ image: null, initialPlaced: null, ready: false });

  $effect(() => {
    const href = $page.url.href;
    let alive = true;
    (async () => {
      // Drop the previous board while the new URL resolves, so a stale photo VM
      // (whose object URLs the cleanup just revoked) can never be remounted.
      state = { image: null, initialPlaced: null, ready: false };
      const params = new URL(href).searchParams;
      const requested = params.get('image');
      const lvl = Math.min(MAX_LEVEL, Math.max(1, parseInt($page.params.level, 10) || 1));
      const resume = params.get('resume') === '1';
      const vm = requested?.startsWith('photo:') ? await resolveImage(requested, get(_)) : null;
      if (!alive) return;
      const image = vm
        ?? PUZZLE_IMAGES.find(i => i.id === requested)
        ?? PUZZLE_IMAGES[(lvl - 1) % PUZZLE_IMAGES.length];
      // Resume is a per-navigation, consume-once decision: the handoff is taken
      // (and removed) exactly once here, never on a re-render.
      const initialPlaced = resume
        ? restorePlaced({ handoff: takeHandoff(), stored: readSave(), imageId: image?.id, level: lvl })
        : null;
      state = { image, initialPlaced, ready: true };
    })();
    return () => { alive = false; revokeVM(state.image); }; // cancel stale resolution
  });
</script>

<svelte:head>
  {#if state.image && state.image.source !== 'photo'}
    <link rel="preload" as="image" href={state.image.file} />
  {/if}
</svelte:head>

{#if state.ready && state.image}
  {#key $page.url.href}
    <PuzzleBoard
      image={state.image}
      {level}
      initialPlaced={state.initialPlaced}
      {placeIds}
      backHref="/games/glossary-puzzle"
      onWin={() => clearSave()}
    />
  {/key}
{/if}
