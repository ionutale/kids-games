<script>
  import { onMount } from 'svelte';

  let { emoji = false } = $props();

  let pieces = $state([]);
  let emojis = $state([]);

  onMount(() => {
    const count = 30;
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1 + Math.random() * 1.5,
        color: ['#FFB74D','#4FC3F7','#81C784','#E57373','#BA68C8','#FFD54F'][i % 6],
        rotation: Math.random() * 360,
        size: 6 + Math.random() * 6
      });
    }
    pieces = items;
    if (emoji) {
      const glyphs = ['🎉', '⭐', '✨', '🎊'];
      const eItems = [];
      for (let i = 0; i < 10; i++) {
        eItems.push({
          id: i,
          x: 8 + Math.random() * 84,
          delay: Math.random() * 0.6,
          duration: 1.4 + Math.random() * 1.2,
          glyph: glyphs[i % glyphs.length],
          size: 20 + Math.random() * 16
        });
      }
      emojis = eItems;
    }
  });
</script>

<div class="confetti-container">
  {#each pieces as p (p.id)}
    <div
      class="piece"
      style:left="{p.x}%"
      style:--delay="{p.delay}s"
      style:--duration="{p.duration}s"
      style:--color="{p.color}"
      style:--rotation="{p.rotation}deg"
      style:--size="{p.size}px"
    ></div>
  {/each}
  {#each emojis as em (em.id)}
    <span
      class="emoji-piece"
      style:left="{em.x}%"
      style:font-size="{em.size}px"
      style:animation-delay="{em.delay}s"
      style:animation-duration="{em.duration}s"
    >{em.glyph}</span>
  {/each}
</div>

<style>
  .confetti-container {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 100;
    overflow: hidden;
  }
  .piece {
    position: absolute;
    top: -20px;
    width: var(--size);
    height: var(--size);
    background: var(--color);
    border-radius: 2px;
    animation: fall var(--duration) ease-in forwards;
    animation-delay: var(--delay);
    transform: rotate(var(--rotation));
    opacity: 0;
  }
  @keyframes fall {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }
  .emoji-piece {
    position: absolute;
    top: -30px;
    animation: emojiFall linear forwards;
    opacity: 0;
  }
  @keyframes emojiFall {
    0% { transform: translateY(0) rotate(-12deg); opacity: 1; }
    100% { transform: translateY(105vh) rotate(14deg); opacity: 0.9; }
  }
</style>
