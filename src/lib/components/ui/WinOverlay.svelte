<script>
  import Confetti from '$lib/components/Confetti.svelte';
  import StarBurst from '$lib/components/StarBurst.svelte';
  import Starfield from './Starfield.svelte';

  let { title, subtitle = '', children } = $props();
</script>

<div class="win-overlay">
  <Starfield count={25} />
  <Confetti />
  <div class="win-card">
    <p class="win-burst">🎉 ✨ 🎉</p>
    <p class="win-title">{title}</p>
    {#if subtitle}<p class="win-sub">{subtitle}</p>{/if}
    <div class="win-actions">
      {@render children?.()}
    </div>
  </div>
</div>

<style>
  .win-overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(4,8,24,0.72);
  }
  .win-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 36px 44px;
    border-radius: 28px;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    backdrop-filter: blur(10px);
    animation: popIn 0.35s ease-out;
    max-width: 90vw;
  }
  .win-burst { font-size: 26px; letter-spacing: 8px; animation: floaty 2.4s ease-in-out infinite; }
  .win-title {
    font-size: 32px;
    font-weight: 700;
    color: var(--gold);
    text-shadow: 0 0 18px var(--glow-gold);
    text-align: center;
  }
  .win-sub { font-size: 16px; color: var(--text-lo); text-align: center; }
  .win-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 6px; }
</style>
