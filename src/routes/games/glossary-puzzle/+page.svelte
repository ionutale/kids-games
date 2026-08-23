<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { _ } from '$lib/stores/locale';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import LevelBar from '$lib/components/ui/LevelBar.svelte';
  import { PUZZLE_IMAGES, getCategories } from '$lib/glossary-puzzle/images.js';

  const STORAGE_KEY = 'glossary-puzzle-save';
  const HANDOFF_KEY = 'glossary-puzzle-handoff';

  let selectedCategory = $state(null);
  let hasSaved = $state(false);
  let savedLevel = $state(1);

  const categories = getCategories();
  let filteredImages = $derived(
    selectedCategory ? PUZZLE_IMAGES.filter(i => i.category === selectedCategory) : PUZZLE_IMAGES
  );

  let levelFromUrl = $derived.by(() => {
    const n = parseInt($page.url.searchParams.get('level'), 10);
    return Number.isFinite(n) && n >= 1 ? n : 1;
  });

  function readSaved() {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return data && PUZZLE_IMAGES.some(i => i.id === data.imageId) && Number.isFinite(parseInt(data.level, 10)) ? data : null;
    } catch {
      return null;
    }
  }

  function startResume() {
    const data = readSaved();
    if (!data) return;
    try {
      sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(data.placedIds || []));
    } catch {}
    goto(`/games/glossary-puzzle/play/${Math.max(1, parseInt(data.level, 10) || 1)}?image=${data.imageId}&resume=1`);
  }

  onMount(() => {
    hasSaved = !!readSaved();
  });
</script>

<GameShell accent="#5EEAD4">
  <div class="gp-gallery" style="--accent: #5EEAD4;">
    <h2 class="gp-gallery-title">🧩 {$_('puzzle')}</h2>

    <LevelBar current={levelFromUrl} hrefFor={(n) => `/games/glossary-puzzle/play/${n}`} />

    {#if hasSaved}
      <button class="gp-resume-btn" onclick={startResume}>▶ {$_('replay')}</button>
    {/if}

    <div class="gp-categories">
      {#each categories as cat}
        <button class="gp-cat-btn" class:active={selectedCategory === cat.key} onclick={() => selectedCategory = selectedCategory === cat.key ? null : cat.key}>
          <span class="gp-cat-icon">{cat.icon}</span>
          <span class="gp-cat-name">{cat.name}</span>
        </button>
      {/each}
    </div>

    <div class="gp-image-grid">
      {#each filteredImages as img}
        <a class="gp-image-card" href="/games/glossary-puzzle/play/{levelFromUrl}?image={img.id}">
          <div class="gp-thumb" style:background-image="url({img.file})"></div>
          <span class="gp-thumb-name">{img.name} · {$_('level')} {levelFromUrl}</span>
        </a>
      {/each}
    </div>
  </div>
</GameShell>

<style>
  .gp-gallery { display: flex; flex-direction: column; align-items: center; flex: 1; padding: 12px; gap: 12px; overflow-y: auto; }
  .gp-gallery-title { font-size: 24px; color: var(--gold); text-shadow: 0 0 14px var(--glow-gold); position: relative; z-index: 1; }
  .gp-resume-btn { padding: 10px 24px; background: var(--panel-glass); border: 1px solid var(--panel-border); backdrop-filter: blur(6px); color: var(--text-hi); border-radius: 20px; font-weight: 700; font-size: 16px; position: relative; z-index: 1; text-decoration: none; }
  .gp-resume-btn:active { background: rgba(94,234,212,0.25); border-color: var(--accent); }
  .gp-categories { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; position: relative; z-index: 1; }
  .gp-cat-btn { display: flex; flex-direction: column; align-items: center; padding: 8px 16px; background: var(--panel-glass); border: 1px solid var(--panel-border); border-radius: 14px; color: var(--text-hi); }
  .gp-cat-btn.active { background: rgba(94,234,212,0.25); border-color: var(--accent); }
  .gp-cat-icon { font-size: 28px; }
  .gp-cat-name { font-size: 12px; font-weight: 600; color: var(--text-lo); }
  .gp-image-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; max-width: 360px; position: relative; z-index: 1; }
  .gp-image-card { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px; background: var(--panel-glass); border: 1px solid var(--panel-border); border-radius: 14px; color: var(--text-hi); overflow: hidden; text-decoration: none; }
  .gp-thumb { width: 100%; aspect-ratio: 1; background-size: cover; background-position: center; border-radius: 8px; }
  .gp-thumb-name { font-size: 13px; font-weight: 600; color: var(--text-lo); }
</style>
