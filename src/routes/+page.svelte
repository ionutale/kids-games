<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { _, locale } from '$lib/stores/locale';
  import SoundToggle from '$lib/components/SoundToggle.svelte';
  import FullscreenToggle from '$lib/components/FullscreenToggle.svelte';
  import AgeSelector from '$lib/components/AgeSelector.svelte';
  import Starfield from '$lib/components/ui/Starfield.svelte';
  import { loadLevel, loadMastered, MAX_LEVEL } from '$lib/ladder/progress.js';

  // `ladder: true` games show per-tile progress from the shared ladder store.
  const games = [
    { id: 'paint', icon: '🎨', key: 'paint', accent: '#FF8FB1', group: 'creative' },
    { id: 'stickers', icon: '🌟', key: 'stickers', accent: '#F0ABFC', group: 'creative' },
    { id: 'splash', icon: '🌈', key: 'splash', accent: '#6EE7B7', group: 'creative' },
    { id: 'memory', icon: '🧠', key: 'memory', accent: '#7FD8FF', group: 'puzzles', ladder: true },
    { id: 'puzzle', icon: '🧩', key: 'puzzle', accent: '#93C5FD', group: 'puzzles', ladder: true },
    { id: 'glossary-puzzle', icon: '🖼️', key: 'photoPuzzle', accent: '#5EEAD4', group: 'puzzles', ladder: true },
    { id: 'sorting', icon: '📦', key: 'sorting', accent: '#FCA5A5', group: 'puzzles', ladder: true },
    { id: 'category-sort', icon: '🗂️', key: 'categorySort', accent: '#F0ABFC', group: 'puzzles', ladder: true },
    { id: 'path-builder', icon: '🚩', key: 'pathBuilder', accent: '#FDBA74', group: 'puzzles', ladder: true },
    { id: 'pop', icon: '🫧', key: 'pop', accent: '#C4B5FD', group: 'arcade', ladder: true },
    { id: 'soccer', icon: '⚽', key: 'soccer', accent: '#FFE082', group: 'arcade', ladder: true },
    { id: 'animal-quiz', icon: '🐾', key: 'animalQuiz', accent: '#FDBA74', group: 'quizzes' },
    { id: 'food-quiz', icon: '🍎', key: 'foodQuiz', accent: '#FCA5A5', group: 'quizzes' },
    { id: 'vehicle-quiz', icon: '🚗', key: 'vehicleQuiz', accent: '#93C5FD', group: 'quizzes' },
    { id: 'color-shape-quiz', icon: '🔷', key: 'colorShapeQuiz', accent: '#C4B5FD', group: 'quizzes' },
    { id: 'clothes-quiz', icon: '👕', key: 'clothesQuiz', accent: '#F0ABFC', group: 'quizzes' },
    { id: 'toy-quiz', icon: '🧸', key: 'toyQuiz', accent: '#FDE68A', group: 'quizzes' },
    { id: 'instrument-quiz', icon: '🎸', key: 'instrumentQuiz', accent: '#6EE7B7', group: 'quizzes' },
    { id: 'grammar', icon: '🇮🇹', key: 'grammar', accent: '#86EFAC', group: 'quizzes', ladder: true },
    { id: 'focus-tap', icon: '🎯', key: 'focusTap', accent: '#F87171', group: 'brain', ladder: true },
    { id: 'quick-count', icon: '🔢', key: 'quickCount', accent: '#FDBA74', group: 'brain', ladder: true },
    { id: 'speed-match', icon: '🃏', key: 'speedMatch', accent: '#93C5FD', group: 'brain', ladder: true },
    { id: 'what-comes-next', icon: '🔁', key: 'whatComesNext', accent: '#6EE7B7', group: 'brain', ladder: true },
    { id: 'sequence-memory', icon: '🎵', key: 'sequenceMemory', accent: '#BA68C8', group: 'brain' },
    { id: 'emoji-math', icon: '➕', key: 'emojiMath', accent: '#81C784', group: 'brain' },
    { id: 'spot-the-difference', icon: '🔍', key: 'spotDiff', accent: '#7FD8FF', group: 'brain' },
  ];

  const GROUPS = [
    { id: 'creative', key: 'groupCreative', icon: '🎨' },
    { id: 'puzzles', key: 'groupPuzzles', icon: '🧩' },
    { id: 'arcade', key: 'groupArcade', icon: '⚽' },
    { id: 'quizzes', key: 'groupQuizzes', icon: '💬' },
    { id: 'brain', key: 'groupBrain', icon: '🧠' },
  ];

  let showSettings = $state(false);
  let lang = $derived($locale);
  let { setLang } = locale;

  // Read once on mount (localStorage is client-only); SSR renders dim strips.
  let progress = $state({});
  onMount(() => {
    const p = {};
    for (const g of games) {
      if (g.ladder) p[g.id] = { level: loadLevel(g.id), mastered: loadMastered(g.id) };
    }
    progress = p;
  });

  function toggleSettings() {
    showSettings = !showSettings;
  }

  function goToGame(id) {
    goto(`/games/${id}`);
  }
</script>

<div class="hub night-bg">
  <Starfield />
  <h1 class="title">🎮 {$_('title')}</h1>

  {#each GROUPS as group (group.id)}
    <section class="group">
      <h2 class="group-title">{group.icon} {$_(group.key)}</h2>
      <div class="grid">
        {#each games.filter((g) => g.group === group.id) as game, i (game.id)}
          {@const p = progress[game.id]}
          <button
            class="game-btn glass"
            data-game={game.id}
            style:--accent={game.accent}
            style:animation-delay="{i * 0.07}s"
            onclick={() => goToGame(game.id)}
          >
            {#if game.ladder && p?.mastered}<span class="tile-badge" aria-hidden="true">🎓</span>{/if}
            <span class="icon">{game.icon}</span>
            <span class="label">{$_(game.key)}</span>
            {#if game.ladder}
              <span class="mini-ladder" aria-hidden="true">
                {#each Array(MAX_LEVEL) as _, n}
                  <span
                    class="mini-dot"
                    class:done={p && p.level > n + 1}
                    class:current={p && p.level === n + 1}
                    class:mastered={p?.mastered}
                  ></span>
                {/each}
              </span>
            {/if}
          </button>
        {/each}
      </div>
    </section>
  {/each}

  {#if showSettings}
    <div class="settings-bar">
      <SoundToggle />
      <FullscreenToggle />
      <AgeSelector />
      <button class="lang-btn en" class:active={lang === 'en'} onclick={() => setLang('en')}>EN</button>
      <button class="lang-btn it" class:active={lang === 'it'} onclick={() => setLang('it')}>IT</button>
      <button class="lang-btn ro" class:active={lang === 'ro'} onclick={() => setLang('ro')}>RO</button>
      <button class="lang-btn de" class:active={lang === 'de'} onclick={() => setLang('de')}>DE</button>
      <button class="lang-btn fr" class:active={lang === 'fr'} onclick={() => setLang('fr')}>FR</button>
      <button class="lang-btn zh" class:active={lang === 'zh'} onclick={() => setLang('zh')}>中文</button>
      <button class="close-settings" onclick={() => showSettings = false}>{$_('done')}</button>
    </div>
  {:else}
    <button
      class="settings-trigger"
      onclick={toggleSettings}
      aria-label="Settings"
    >
      ⚙️
    </button>
  {/if}
</div>

<style>
  .hub {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    /* `safe` keeps the top reachable when the menu overflows a short viewport */
    justify-content: safe center;
    height: 100%;
    padding: 20px;
    gap: 18px;
    overflow-y: auto;
  }
  .group { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; z-index: 1; }
  .group-title { font-size: 16px; font-weight: 700; color: var(--text-hi); letter-spacing: 1px; text-shadow: 0 0 10px var(--accent, rgba(127,216,255,0.35)); }
  .title {
    font-size: 32px;
    font-weight: 700;
    text-align: center;
    color: var(--gold);
    text-shadow: 0 0 14px var(--glow-gold);
    z-index: 1;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    width: 100%;
    max-width: 400px;
    z-index: 1;
  }
  @media (min-width: 480px) { .grid { grid-template-columns: repeat(3, 1fr); max-width: 560px; } }
  @media (min-width: 768px) { .grid { grid-template-columns: repeat(4, 1fr); max-width: 720px; } }
  .game-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 20px 12px;
    min-height: 120px;
    border-radius: var(--radius-card);
    animation: floaty 5s ease-in-out infinite, popIn 0.4s ease-out backwards;
    transition: transform 0.15s;
    position: relative;
  }
  .game-btn:active { transform: scale(0.94); animation-play-state: paused; }
  .game-btn:nth-child(2n) { animation-delay: 0.8s; }
  .game-btn:nth-child(3n) { animation-delay: 1.6s; }
  .icon { font-size: 42px; filter: drop-shadow(0 0 8px var(--accent)); }
  .label { font-size: 14px; font-weight: 600; color: var(--text-lo); }
  .tile-badge { position: absolute; top: 6px; right: 8px; font-size: 17px; filter: drop-shadow(0 0 6px var(--glow-gold)); }
  .mini-ladder { display: flex; gap: 3px; }
  .mini-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,0.16); }
  .mini-dot.done { background: var(--mint); }
  .mini-dot.current { background: var(--cyan); box-shadow: 0 0 4px var(--cyan); }
  .mini-dot.mastered { background: var(--gold); }
  .settings-trigger {
    font-size: 28px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.75;
    z-index: 1;
  }
  .settings-bar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px 10px;
    max-width: calc(100vw - 24px);
    padding: 12px 16px;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    backdrop-filter: blur(10px);
    border-radius: 24px;
    z-index: 1;
  }
  .close-settings {
    padding: 8px 18px;
    min-height: var(--touch-min);
    background: var(--btn-gradient);
    color: #062033;
    border-radius: 18px;
    font-weight: 600;
    font-size: 14px;
  }
  .lang-btn {
    padding: 6px 12px;
    min-height: var(--touch-min);
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    color: var(--text-lo);
    background: transparent;
    border: 1px solid var(--panel-border);
    letter-spacing: 0.5px;
  }
  .lang-btn.active { color: #062033; background: var(--cyan); border-color: var(--cyan); }
</style>
