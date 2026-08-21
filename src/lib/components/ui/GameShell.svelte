<script>
  import BackButton from '$lib/components/BackButton.svelte';
  import SoundToggle from '$lib/components/SoundToggle.svelte';
  import Starfield from './Starfield.svelte';

  let { accent = '#7FD8FF', hudLeft = null, hudRight = null, children } = $props();

  const accentGlow = $derived(accent + '99');
</script>

<div class="game-shell night-bg" style:--accent={accent} style:--accent-glow={accentGlow}>
  <Starfield />
  <header class="top-bar">
    <BackButton />
    {#if hudLeft}{@render hudLeft()}{/if}
    {#if hudRight}{@render hudRight()}{:else}<SoundToggle />{/if}
  </header>
  <main class="playfield">
    {@render children?.()}
  </main>
</div>

<style>
  .game-shell {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    position: relative;
  }
  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    padding-top: calc(8px + var(--safe-top));
    z-index: 10;
    flex-shrink: 0;
  }
  .top-bar :global(.back-btn),
  .top-bar :global(.sound-btn) {
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
  }
  .playfield {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    z-index: 1;
  }
</style>
