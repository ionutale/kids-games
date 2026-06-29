<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import SoundToggle from '$lib/components/SoundToggle.svelte';
  import AgeSelector from '$lib/components/AgeSelector.svelte';

  const games = [
    { id: 'paint', icon: '🎨', label: 'Paint' },
    { id: 'stickers', icon: '🌟', label: 'Stickers' },
    { id: 'memory', icon: '🧠', label: 'Memory' },
    { id: 'puzzle', icon: '🧩', label: 'Puzzle' },
    { id: 'pop', icon: '🫧', label: 'Pop' },
    { id: 'soccer', icon: '⚽', label: 'Soccer' },
    { id: 'sorting', icon: '📦', label: 'Sorting' },
    { id: 'splash', icon: '🌈', label: 'Splash' }
  ];

  let showSettings = $state(false);
  let settingsTimer = null;

  function onSettingsPress() {
    settingsTimer = setTimeout(() => {
      showSettings = true;
    }, 3000);
  }

  function cancelSettings() {
    if (settingsTimer) clearTimeout(settingsTimer);
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
  <h1 class="title">🎮 Kids Games</h1>

  <div class="grid">
    {#each games as game (game.id)}
      <button class="game-btn" onclick={() => goToGame(game.id)}>
        <span class="icon">{game.icon}</span>
        <span class="label">{game.label}</span>
      </button>
    {/each}
  </div>

  {#if showSettings}
    <div class="settings-bar">
      <SoundToggle />
      <AgeSelector />
      <button class="close-settings" onclick={() => showSettings = false}>Done</button>
    </div>
  {:else}
    <button
      class="settings-trigger"
      ontouchstart={onSettingsPress}
      ontouchend={cancelSettings}
      onmousedown={onSettingsPress}
      onmouseup={cancelSettings}
      onmouseleave={cancelSettings}
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
</style>
