<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { _, locale } from '$lib/stores/locale';
  import SoundToggle from '$lib/components/SoundToggle.svelte';
  import AgeSelector from '$lib/components/AgeSelector.svelte';

  const games = [
    { id: 'paint', icon: '🎨', key: 'paint' },
    { id: 'stickers', icon: '🌟', key: 'stickers' },
    { id: 'memory', icon: '🧠', key: 'memory' },
    { id: 'puzzle', icon: '🧩', key: 'puzzle' },
    { id: 'pop', icon: '🫧', key: 'pop' },
    { id: 'soccer', icon: '⚽', key: 'soccer' },
    { id: 'sorting', icon: '📦', key: 'sorting' },
    { id: 'splash', icon: '🌈', key: 'splash' },
    { id: 'tower-defense', icon: '🛡️', key: 'towerDefense' },
    { id: 'animal-quiz', icon: '🐾', key: 'animalQuiz' },
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

  onMount(async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch {}
  });
</script>

<div class="hub">
  <h1 class="title">🎮 {$_('title')}</h1>

  <div class="grid">
    {#each games as game (game.id)}
      <button class="game-btn" onclick={() => goToGame(game.id)}>
        <span class="icon">{game.icon}</span>
        <span class="label">{$_(game.key)}</span>
      </button>
    {/each}
  </div>

  {#if showSettings}
    <div class="settings-bar">
      <SoundToggle />
      <AgeSelector />
      <button class="lang-btn en" class:active={$lang === 'en'} onclick={() => setLang('en')}>EN</button>
      <button class="lang-btn it" class:active={$lang === 'it'} onclick={() => setLang('it')}>IT</button>
      <button class="lang-btn ro" class:active={$lang === 'ro'} onclick={() => setLang('ro')}>RO</button>
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
  }
  .title {
    font-size: 32px;
    text-align: center;
    color: #333;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    width: 100%;
    max-width: 400px;
  }
  .game-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 20px 16px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    min-height: 110px;
    transition: transform 0.15s;
  }
  .game-btn:active { transform: scale(0.95); }
  .icon { font-size: 40px; }
  .label { font-size: 14px; font-weight: 600; color: #666; }
  .settings-trigger {
    font-size: 28px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: rgba(255,255,255,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.5;
  }
  .settings-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: white;
    border-radius: 24px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  }
  .close-settings {
    padding: 6px 16px;
    background: var(--color-primary);
    color: white;
    border-radius: 16px;
    font-weight: 600;
    font-size: 14px;
  }
  .lang-btn {
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    color: #999;
    background: rgba(255,255,255,0.6);
    letter-spacing: 0.5px;
  }
  .lang-btn.active {
    color: white;
    background: var(--color-primary);
  }
</style>
