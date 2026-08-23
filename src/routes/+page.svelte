<script>
  import { goto } from '$app/navigation';
  import { _, locale } from '$lib/stores/locale';
  import SoundToggle from '$lib/components/SoundToggle.svelte';
  import FullscreenToggle from '$lib/components/FullscreenToggle.svelte';
  import AgeSelector from '$lib/components/AgeSelector.svelte';
  import Starfield from '$lib/components/ui/Starfield.svelte';

  const games = [
    { id: 'paint', icon: '🎨', key: 'paint', accent: '#FF8FB1' },
    { id: 'stickers', icon: '🌟', key: 'stickers', accent: '#F0ABFC' },
    { id: 'memory', icon: '🧠', key: 'memory', accent: '#7FD8FF' },
    { id: 'puzzle', icon: '🧩', key: 'puzzle', accent: '#93C5FD' },
    { id: 'pop', icon: '🫧', key: 'pop', accent: '#C4B5FD' },
    { id: 'soccer', icon: '⚽', key: 'soccer', accent: '#FFE082' },
    { id: 'sorting', icon: '📦', key: 'sorting', accent: '#FCA5A5' },
    { id: 'splash', icon: '🌈', key: 'splash', accent: '#6EE7B7' },
    { id: 'tower-defense', icon: '🛡️', key: 'towerDefense', accent: '#F87171' },
    { id: 'animal-quiz', icon: '🐾', key: 'animalQuiz', accent: '#FDBA74' },
    { id: 'glossary-puzzle', icon: '🧩', key: 'puzzle', accent: '#5EEAD4' },
    { id: 'focus-tap', icon: '🎯', key: 'focusTap', accent: '#F87171' },
  ];

  let showSettings = $state(false);
  let lang = $derived($locale);
  let { setLang } = locale;

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

  <div class="grid">
    {#each games as game, i (game.id)}
      <button
        class="game-btn glass"
        style:--accent={game.accent}
        style:animation-delay="{i * 0.07}s"
        onclick={() => goToGame(game.id)}
      >
        <span class="icon">{game.icon}</span>
        <span class="label">{$_(game.key)}</span>
      </button>
    {/each}
  </div>

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
    height: 100%;
    padding: 20px;
    gap: 24px;
    overflow-y: auto;
  }
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
  }
  .game-btn:active { transform: scale(0.94); animation-play-state: paused; }
  .game-btn:nth-child(2n) { animation-delay: 0.8s; }
  .game-btn:nth-child(3n) { animation-delay: 1.6s; }
  .icon { font-size: 42px; filter: drop-shadow(0 0 8px var(--accent)); }
  .label { font-size: 14px; font-weight: 600; color: var(--text-lo); }
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
