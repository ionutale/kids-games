<script>
  import { get } from 'svelte/store';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import PuzzleBoard from '$lib/glossary-puzzle/PuzzleBoard.svelte';
  import { resolveImage, revokeVM } from '$lib/glossary-puzzle/images.js';
  import { readSave, clearSave } from '$lib/glossary-puzzle/save.js';
  import { _ } from '$lib/stores/locale';
  import { MAX_LEVEL } from '$lib/ladder/progress.js';

  // Same async-resolution gate as the ladder route: a `photo:<uuid>` needs an
  // IndexedDB read, so nothing mounts until the final image is known. Precedence
  // is unchanged — a resolvable saved image wins, then `?image=`, else redirect.
  let state = $state({ image: null, initialPlaced: null, level: 1, ready: false });

  $effect(() => {
    const href = $page.url.href;
    let alive = true;
    (async () => {
      // Drop the previous board while the new URL resolves (see [level] route).
      state = { image: null, initialPlaced: null, level: 1, ready: false };
      const params = new URL(href).searchParams;
      const resume = params.get('resume') === '1';
      const requested = params.get('image');
      const saved = resume ? readSave() : null;
      if (resume) clearSave();
      const levelParam = saved && Number.isFinite(saved.level)
        ? String(saved.level)
        : params.get('level');
      const level = Math.min(MAX_LEVEL, Math.max(1, parseInt(levelParam, 10) || 1));
      // A storage failure (IndexedDB blocked/evicted) must degrade exactly like
      // an unresolvable photo: ignore the save, then try `?image=`, else redirect.
      let savedImage = null;
      if (saved?.imageId) {
        try {
          savedImage = await resolveImage(saved.imageId, get(_));
        } catch {
          savedImage = null;
        }
      }
      let image = savedImage;
      let initialPlaced = savedImage && Array.isArray(saved.placedIds) ? saved.placedIds : null;
      if (!image && requested) {
        try {
          image = await resolveImage(requested, get(_));
        } catch {
          image = null;
        }
        initialPlaced = null;
      }
      if (!alive) return;
      if (!image) { goto('/games/glossary-puzzle'); return; }
      state = { image, initialPlaced, level, ready: true };
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
      level={state.level}
      initialPlaced={state.initialPlaced}
      backHref="/games/glossary-puzzle"
      onWin={() => clearSave()}
    />
  {/key}
{/if}
