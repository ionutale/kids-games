<script>
  import { onMount } from 'svelte';

  let pieces = $state([]);

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
</style>
