<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { _ } from '$lib/stores/locale';
  import PuzzleBoard from '$lib/glossary-puzzle/PuzzleBoard.svelte';
  import { PUZZLE_IMAGES, LEVELS } from '$lib/glossary-puzzle/images.js';

  const LEVEL_STORAGE_KEY = 'glossary-puzzle-level-unlocked';

  function readUnlocked() {
    if (typeof localStorage === 'undefined') return 1;
    const stored = parseInt(localStorage.getItem(LEVEL_STORAGE_KEY));
    return stored >= 1 && stored <= 10 ? stored : 1;
  }

  function saveUnlocked() {
    const next = Math.min(unlocked + 1, 10);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LEVEL_STORAGE_KEY, String(next));
    }
  }

  const unlocked = readUnlocked();
  const level = parseInt($page.params.level, 10) || 1;
  const cfg = LEVELS[level - 1];
  const image = cfg ? PUZZLE_IMAGES.find(i => i.id === cfg.imageId) : null;
  const locked = level > unlocked || !cfg || !image;
  const nextHref = level < 10 ? `/games/glossary-puzzle/play/${level + 1}` : null;

  if (!cfg || !image) {
    goto('/games/glossary-puzzle');
  }
</script>

{#if locked && cfg && image}
  <a class="locked-screen" href="/games/glossary-puzzle">🔒 {$_('levelLocked')}</a>
{:else if cfg && image}
  <PuzzleBoard
    {image}
    difficulty={cfg.difficulty}
    {nextHref}
    backHref="/games/glossary-puzzle"
    onWin={saveUnlocked}
  />
{/if}

<style>
  .locked-screen {
    text-decoration: none;
    color: var(--text-lo);
    font-size: 20px;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
