<script>
  import { onMount } from 'svelte';
  import { _ } from '$lib/stores/locale';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import LevelBar from '$lib/components/ui/LevelBar.svelte';
  import { PUZZLE_IMAGES, getCategories, DIFFICULTIES } from '$lib/glossary-puzzle/images.js';

  const STORAGE_KEY = 'glossary-puzzle-save';
  const LEVEL_STORAGE_KEY = 'glossary-puzzle-level-unlocked';

  let selectedCategory = $state(null);
  let diffKey = $state('easy');
  let hasSaved = $state(false);

  const categories = getCategories();
  let filteredImages = $derived(
    selectedCategory ? PUZZLE_IMAGES.filter(i => i.category === selectedCategory) : PUZZLE_IMAGES
  );

  function readUnlocked() {
    if (typeof localStorage === 'undefined') return 1;
    const stored = parseInt(localStorage.getItem(LEVEL_STORAGE_KEY));
    return stored >= 1 && stored <= 10 ? stored : 1;
  }

  let unlockedLevel = readUnlocked();

  function refreshSaved() {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { hasSaved = false; return; }
    try {
      const data = JSON.parse(raw);
      hasSaved = data && PUZZLE_IMAGES.some(i => i.id === data.imageId) && DIFFICULTIES[data.difficulty];
    } catch {
      hasSaved = false;
    }
  }

  onMount(refreshSaved);
</script>

<GameShell accent="#5EEAD4">
  <div class="gp-gallery" style="--accent: #5EEAD4;">
    <h2 class="gp-gallery-title">🧩 {$_('puzzle')}</h2>

    <LevelBar current={unlockedLevel} hrefFor={(n) => `/games/glossary-puzzle/play/${n}`} maxUnlocked={unlockedLevel} />

    {#if hasSaved}
      <a class="gp-resume-btn" href="/games/glossary-puzzle/play?resume=1">▶ {$_('replay')}</a>
    {/if}

    <div class="gp-categories">
      {#each categories as cat}
        <button class="gp-cat-btn" class:active={selectedCategory === cat.key} onclick={() => selectedCategory = selectedCategory === cat.key ? null : cat.key}>
          <span class="gp-cat-icon">{cat.icon}</span>
          <span class="gp-cat-name">{cat.name}</span>
        </button>
      {/each}
    </div>

    <div class="gp-diff-select">
      {#each Object.entries(DIFFICULTIES) as [key, d]}
        <button class="gp-diff-btn" class:active={diffKey === key} onclick={() => diffKey = key}>{d.label}</button>
      {/each}
    </div>

    <div class="gp-image-grid">
      {#each filteredImages as img}
        <a class="gp-image-card" href="/games/glossary-puzzle/play?image={img.id}&diff={diffKey}">
          <div class="gp-thumb" style:background-image="url({img.file})"></div>
          <span class="gp-thumb-name">{img.name}</span>
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
  .gp-diff-select { display: flex; gap: 6px; position: relative; z-index: 1; }
  .gp-diff-btn { padding: 6px 18px; border-radius: 12px; font-size: 13px; font-weight: 600; background: var(--panel-glass); border: 1px solid var(--panel-border); color: var(--text-hi); }
  .gp-diff-btn.active { background: rgba(94,234,212,0.25); border-color: var(--accent); }
  .gp-image-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; max-width: 360px; position: relative; z-index: 1; }
  .gp-image-card { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px; background: var(--panel-glass); border: 1px solid var(--panel-border); border-radius: 14px; color: var(--text-hi); overflow: hidden; text-decoration: none; }
  .gp-thumb { width: 100%; aspect-ratio: 1; background-size: cover; background-position: center; border-radius: 8px; }
  .gp-thumb-name { font-size: 13px; font-weight: 600; color: var(--text-lo); }
</style>
