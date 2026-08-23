<script>
  import { onMount } from 'svelte';
  import { _ } from '$lib/stores/locale';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import LevelBar from '$lib/components/ui/LevelBar.svelte';
  import BigButton from '$lib/components/ui/BigButton.svelte';
  import { loadLevel } from '$lib/trainers/progress';
  import { startTrainerMusic, stopTrainerMusic } from '$lib/sounds/trainerMusic';

  let { trainerId = '', titleKey = '', tagline = '', hero = '', accent = '#7FD8FF', heroArt = '' } = $props();

  const level = $derived(loadLevel(trainerId));

  onMount(() => {
    startTrainerMusic(trainerId);
    return stopTrainerMusic;
  });
</script>

<GameShell {accent}>
  <div class="landing">
    {#if heroArt}
      <div class="hero hero-art" aria-hidden="true">
        <img src="/art/trainers/{trainerId}/hero-star.png" alt="" />
        <span>{hero}</span>
        <img src="/art/trainers/{trainerId}/hero-star.png" alt="" />
      </div>
    {:else if hero}
      <div class="hero" aria-hidden="true">{hero}</div>
    {/if}
    <h1 class="title">{titleKey}</h1>
    <p class="tagline">{tagline}</p>
    <LevelBar
      current={level}
      count={10}
      maxUnlocked={10}
      hrefFor={(n) => `/games/${trainerId}/play/${n}`}
    />
    <BigButton href={`/games/${trainerId}/play/${level}`}>▶ {$_('play')}</BigButton>
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
  .hero-art {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .hero-art img {
    width: 26px;
    height: 26px;
    filter: drop-shadow(0 0 6px var(--accent-glow));
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
