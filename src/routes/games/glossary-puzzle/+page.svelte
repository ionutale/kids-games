<script>
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { _ } from '$lib/stores/locale';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import LadderBar from '$lib/ladder/LadderBar.svelte';
  import {
    PUZZLE_IMAGES,
    CATEGORY_ORDER,
    CATEGORY_META,
    buildImageList,
    photoToVM,
    revokeVM,
    levelConfig,
  } from '$lib/glossary-puzzle/images.js';
  import { listPhotos } from '$lib/glossary-puzzle/photos.js';
  import { loadSolved, badgeFor } from '$lib/glossary-puzzle/solved.js';
  import { readSave, clearSave, stashHandoff } from '$lib/glossary-puzzle/save.js';
  import PreviewOverlay from '$lib/glossary-puzzle/PreviewOverlay.svelte';
  import ParentGate from '$lib/glossary-puzzle/ParentGate.svelte';
  import PhotosManager from '$lib/glossary-puzzle/PhotosManager.svelte';
  import { loadLevel, loadMastered, MAX_LEVEL } from '$lib/ladder/progress.js';

  let images = $state([]);
  // Object URLs we own and must revoke. Kept as a plain (non-reactive) array:
  // only `images` drives rendering, this is bookkeeping for teardown.
  let ownedVMs = [];
  let activeCat = $state('all');
  let previewImage = $state(null);
  let managerOpen = $state(false);
  let solvedMap = $state({});
  let save = $state(null);
  let storeLevel = $state(1);
  let mastered = $state(false);

  let urlLevel = $derived.by(() => {
    const n = parseInt($page.url.searchParams.get('level'), 10);
    return Number.isFinite(n) && n >= 1 ? Math.min(MAX_LEVEL, n) : null;
  });

  // ?level= wins; otherwise the gallery picks up where the kid left off.
  let currentLevel = $derived(urlLevel ?? storeLevel);

  // Chips: All first, My Photos always, then only non-empty categories in
  // CATEGORY_ORDER (unknown categories appended so nothing is unreachable).
  const cats = $derived.by(() => {
    const present = new Set(images.map(i => i.category));
    const known = CATEGORY_ORDER.filter(c => c !== 'myPhotos' && present.has(c));
    const unknown = [...present].filter(c => c !== 'myPhotos' && !CATEGORY_ORDER.includes(c));
    return ['all', 'myPhotos', ...known, ...unknown];
  });

  const visibleImages = $derived(
    activeCat === 'all' ? images : images.filter(i => i.category === activeCat)
  );

  // Continue card only exists when the saved picture is still in the merged list.
  const resumeImage = $derived(save ? (images.find(i => i.id === save.imageId) ?? null) : null);
  const placedCount = $derived(save?.placedIds?.length ?? 0);
  const piecesTotal = $derived.by(() => {
    if (!save) return 0;
    const cfg = levelConfig(save.level);
    return cfg.cols * cfg.rows;
  });

  function catIcon(cat) {
    if (cat === 'all') return '✨';
    return CATEGORY_META[cat] || '🧩';
  }

  function catLabel(cat) {
    if (cat === 'all') return $_('all');
    if (CATEGORY_META[cat]) return $_(cat);
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  }

  function resolveSave() {
    const data = readSave();
    if (!data) {
      save = null;
      return;
    }
    // A save whose picture no longer resolves (e.g. deleted photo) is dropped.
    if (images.some(i => i.id === data.imageId)) {
      save = data;
    } else {
      clearSave();
      save = null;
    }
  }

  async function refresh() {
    let records = [];
    try {
      records = await listPhotos();
    } catch {
      records = [];
    }
    // Revoke the previous batch before minting the new one — no leaked URLs.
    for (const vm of ownedVMs) revokeVM(vm);
    ownedVMs = records.map(r => photoToVM(r, get(_)));
    images = buildImageList(PUZZLE_IMAGES, ownedVMs);
    resolveSave();
  }

  function openPreview(img) {
    previewImage = img;
  }

  function startResume() {
    if (!save) return;
    stashHandoff(save.placedIds || []);
    goto(`/games/glossary-puzzle/play/${save.level}?image=${save.imageId}&resume=1`);
  }

  function closeManager(changed) {
    managerOpen = false;
    if (changed) refresh();
  }

  onMount(() => {
    storeLevel = loadLevel('glossary-puzzle');
    mastered = loadMastered('glossary-puzzle');
    solvedMap = loadSolved();
    refresh();
  });

  onDestroy(() => {
    for (const vm of ownedVMs) revokeVM(vm);
  });
</script>

<GameShell accent="#5EEAD4">
  <div class="gp-gallery" style="--accent: #5EEAD4;">
    <h2 class="gp-gallery-title">🧩 {$_('puzzle')}</h2>

    <LadderBar current={currentLevel} {mastered} hrefFor={(n) => `/games/glossary-puzzle/play/${n}`} />

    {#if save && resumeImage}
      <button class="gp-resume-btn" type="button" onclick={startResume}>
        <img class="gp-resume-thumb" src={resumeImage.thumb} alt="" />
        <span class="gp-resume-ring" style="--p: {piecesTotal ? Math.round((placedCount / piecesTotal) * 100) : 0}">
          <span class="gp-resume-count">{placedCount}/{piecesTotal}</span>
        </span>
        <span class="gp-resume-text">
          <span class="gp-resume-label">▶ {$_('resume')}</span>
          <span class="gp-resume-name">{resumeImage.name}</span>
        </span>
      </button>
    {/if}

    <div class="gp-categories">
      {#each cats as cat}
        <button
          class="gp-cat-btn"
          class:active={activeCat === cat}
          data-cat={cat}
          type="button"
          onclick={() => (activeCat = activeCat === cat ? 'all' : cat)}
        >
          <span class="gp-cat-icon">{catIcon(cat)}</span>
          <span class="gp-cat-name">{catLabel(cat)}</span>
        </button>
      {/each}
    </div>

    {#if activeCat === 'myPhotos'}
      <div class="gp-lock-card">
        <ParentGate onpass={() => (managerOpen = true)}>
          <span class="gp-lock-inner">
            <span class="gp-lock-icon">🔒</span>
            <span class="gp-lock-title">{$_('addPhotos')}</span>
            <span class="gp-lock-hint">{$_('holdToAdd')}</span>
            <span class="gp-lock-sub">{$_('forGrownUps')}</span>
          </span>
        </ParentGate>
      </div>
    {/if}

    {#if activeCat === 'myPhotos' && visibleImages.length === 0}
      <p class="gp-photos-empty">{$_('noPhotos')}</p>
    {:else}
      <div class="gp-image-grid">
        {#each visibleImages as img (img.id)}
          {@const badge = badgeFor(solvedMap, img.id, currentLevel)}
          <button
            class="gp-image-card"
            data-id={img.id}
            data-cat={img.category}
            type="button"
            onclick={() => openPreview(img)}
          >
            <span class="gp-thumb">
              <img src={img.thumb} alt={img.name} loading="lazy" decoding="async" />
              {#if badge === 'check'}
                <span class="gp-badge-check" aria-label={$_('solved')}>✓</span>
              {:else if badge === 'gold'}
                <span class="gp-badge-gold" aria-label={$_('solved')}>🎓</span>
              {/if}
            </span>
            <span class="gp-thumb-name">{img.name}</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>
</GameShell>

{#if previewImage}
  <PreviewOverlay image={previewImage} level={currentLevel} onclose={() => (previewImage = null)} />
{/if}

{#if managerOpen}
  <PhotosManager onclose={closeManager} />
{/if}

<style>
  .gp-gallery { display: flex; flex-direction: column; align-items: center; flex: 1; padding: 12px; gap: 12px; overflow-y: auto; }
  .gp-gallery-title { font-size: 24px; color: var(--gold); text-shadow: 0 0 14px var(--glow-gold); position: relative; z-index: 1; }
  .gp-resume-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 44px;
    padding: 8px 18px 8px 8px;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    backdrop-filter: blur(6px);
    color: var(--text-hi);
    border-radius: 20px;
    font-weight: 700;
    font-size: 16px;
    position: relative;
    z-index: 1;
    text-decoration: none;
    cursor: pointer;
  }
  .gp-resume-btn:active { background: rgba(94,234,212,0.25); border-color: var(--accent); }
  .gp-resume-thumb { width: 52px; height: 52px; border-radius: 14px; object-fit: cover; flex: 0 0 auto; }
  .gp-resume-ring {
    position: relative;
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    flex: 0 0 auto;
    border-radius: 50%;
    background: conic-gradient(var(--accent) calc(var(--p, 0) * 1%), rgba(255,255,255,0.15) 0);
  }
  .gp-resume-ring::before { content: ''; position: absolute; inset: 4px; border-radius: 50%; background: #0b1430; }
  .gp-resume-count { position: relative; font-size: 12px; font-weight: 700; color: var(--text-hi); }
  .gp-resume-text { display: flex; flex-direction: column; align-items: flex-start; }
  .gp-resume-label { font-size: 16px; }
  .gp-resume-name { font-size: 12px; font-weight: 600; color: var(--text-lo); }
  .gp-categories { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; position: relative; z-index: 1; }
  .gp-cat-btn { display: flex; flex-direction: column; align-items: center; min-height: 44px; padding: 8px 16px; background: var(--panel-glass); border: 1px solid var(--panel-border); border-radius: 14px; color: var(--text-hi); cursor: pointer; }
  .gp-cat-btn.active { background: rgba(94,234,212,0.25); border-color: var(--accent); }
  .gp-cat-icon { font-size: 28px; }
  .gp-cat-name { font-size: 12px; font-weight: 600; color: var(--text-lo); }
  .gp-lock-card {
    width: 100%;
    max-width: 360px;
    position: relative;
    z-index: 1;
    padding: 8px;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    border-radius: 18px;
  }
  .gp-lock-inner { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 8px 12px; text-align: center; }
  .gp-lock-icon { font-size: 32px; }
  .gp-lock-title { font-size: 18px; font-weight: 700; color: var(--text-hi); }
  .gp-lock-hint { font-size: 14px; font-weight: 600; color: var(--accent); }
  .gp-lock-sub { font-size: 11px; color: var(--text-lo); }
  .gp-photos-empty { margin: 0; padding: 12px 0; font-size: 16px; color: var(--text-lo); text-align: center; position: relative; z-index: 1; }
  .gp-image-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; max-width: 360px; position: relative; z-index: 1; }
  .gp-image-card { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px; background: var(--panel-glass); border: 1px solid var(--panel-border); border-radius: 14px; color: var(--text-hi); overflow: hidden; text-decoration: none; font: inherit; cursor: pointer; }
  .gp-thumb { position: relative; display: block; width: 100%; border-radius: 8px; overflow: hidden; }
  .gp-thumb img { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover; background: rgba(0,0,0,0.25); }
  .gp-thumb-name { font-size: 13px; font-weight: 600; color: var(--text-lo); }
  .gp-badge-check { position: absolute; top: 6px; right: 6px; display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; font-size: 14px; font-weight: 700; color: #062033; background: #5EEAD4; box-shadow: 0 2px 8px rgba(0,0,0,0.4); }
  .gp-badge-gold { position: absolute; top: 6px; right: 6px; display: grid; place-items: center; width: 26px; height: 26px; border-radius: 50%; font-size: 14px; background: rgba(4,8,24,0.75); border: 2px solid var(--gold); box-shadow: 0 0 10px var(--glow-gold); }
</style>
