<script>
  import { onMount } from 'svelte';
  import { settings } from '$lib/stores/settings';
  import { playPop, playWin } from '$lib/sounds/audioManager';

  const items = ['🫧', '🐟', '🦋', '⭐', '🌟', '💫', '🌸', '🍎'];
  let bubbles = $state([]);
  let interval = null;

  function spawnBubble() {
    const maxItems = $settings.ageLevel <= 2 ? 3 : $settings.ageLevel <= 3 ? 5 : $settings.ageLevel <= 4 ? 8 : 12;
    if (bubbles.length >= maxItems) return;
    bubbles = [...bubbles, {
      id: Date.now() + Math.random(),
      emoji: items[Math.floor(Math.random() * items.length)],
      x: 5 + Math.random() * 90,
      size: $settings.ageLevel <= 2 ? 50 + Math.random() * 20 : 36 + Math.random() * 16,
      speed: $settings.ageLevel <= 2 ? 3 + Math.random() * 2 : 5 + Math.random() * 3
    }];
  }

  function popBubble(id) {
    bubbles = bubbles.filter(b => b.id !== id);
    if ($settings.soundEnabled) playPop();
    if (navigator.vibrate) navigator.vibrate(20);
  }

  onMount(() => {
    const speed = $settings.ageLevel <= 2 ? 2000 : $settings.ageLevel <= 3 ? 1500 : $settings.ageLevel <= 4 ? 1000 : 700;
    interval = setInterval(spawnBubble, speed);
    return () => clearInterval(interval);
  });
</script>

<div class="pop-game">
  {#each bubbles as b (b.id)}
    <button
      class="bubble"
      style:left="{b.x}%"
      style:font-size="{b.size}px"
      style:--speed="{b.speed}s"
      onclick={() => popBubble(b.id)}
    >
      {b.emoji}
    </button>
  {/each}
</div>

<style>
  .pop-game {
    flex: 1;
    position: relative;
    overflow: hidden;
    background: linear-gradient(180deg, #e3f2fd 0%, #bbdefb 100%);
  }
  .bubble {
    position: absolute;
    transform: translateX(-50%);
    animation: float var(--speed) linear infinite;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
  }
  @keyframes float {
    0% { bottom: -60px; opacity: 0; }
    5% { opacity: 1; }
    90% { opacity: 1; }
    100% { bottom: 100%; opacity: 0; }
  }
</style>
