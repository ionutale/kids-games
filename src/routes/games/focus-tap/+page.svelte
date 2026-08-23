<script>
  import { onMount, onDestroy } from 'svelte';
  import { _ } from '$lib/stores/locale';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import LevelBar from '$lib/components/ui/LevelBar.svelte';
  import BigButton from '$lib/components/ui/BigButton.svelte';
  import { loadLevel } from '$lib/trainers/progress';
  import { startTrainerMusic, stopTrainerMusic } from '$lib/sounds/trainerMusic';

  const level = loadLevel('focus-tap');

  onMount(() => {
    startTrainerMusic('focus-tap');
    return stopTrainerMusic;
  });
</script>

<GameShell accent="#F87171">
  <div class="landing">
    <div class="hero" aria-hidden="true">🎯 ⭐ 🍎 ⭐ 🐶 ⭐ 🎯</div>
    <h1 class="title">🎯 {$_('focusTap')}</h1>
    <p class="tagline">{$_('catchTarget', { e: '🍎' })}</p>
    <LevelBar
      current={level}
      count={10}
      maxUnlocked={10}
      hrefFor={(n) => `/games/focus-tap/play/${n}`}
    />
    <BigButton href={`/games/focus-tap/play/${level}`}>▶ {$_('play')}</BigButton>
  </div>
</GameShell>

<style>
  .landing {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 22px;
    padding: 16px;
  }
  .hero {
    font-size: 20px;
    letter-spacing: 10px;
    opacity: 0.9;
    animation: floaty 4s ease-in-out infinite;
  }
  .title {
    font-size: 30px;
    font-weight: 700;
    color: var(--gold);
    text-shadow: 0 0 14px var(--glow-gold);
    text-align: center;
  }
  .tagline {
    font-size: 18px;
    color: var(--text-lo);
    min-height: calc(var(--touch-min) * 0.6);
  }
</style>
