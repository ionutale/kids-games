<script>
  import { onMount } from 'svelte';

  let particles = $state([]);

  onMount(() => {
    const count = 8;
    const items = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const dist = 40 + Math.random() * 30;
      items.push({
        id: i,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        size: 6 + Math.random() * 8,
        color: ['#FFB74D','#4FC3F7','#81C784','#E57373','#BA68C8','#FFD54F'][i % 6],
        delay: Math.random() * 0.1
      });
    }
    particles = items;
    setTimeout(() => particles = [], 600);
  });
</script>

{#each particles as p (p.id)}
  <div
    class="star"
    style:--dx="{p.dx}px"
    style:--dy="{p.dy}px"
    style:--size="{p.size}px"
    style:--color="{p.color}"
    style:--delay="{p.delay}s"
  ></div>
{/each}

<style>
  .star {
    position: absolute;
    inset: 0;
    width: var(--size);
    height: var(--size);
    background: var(--color);
    border-radius: 50%;
    margin: auto;
    animation: burst 0.5s ease-out forwards;
    animation-delay: var(--delay);
    pointer-events: none;
  }
  @keyframes burst {
    0% { transform: translate(0, 0) scale(1); opacity: 1; }
    100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
  }
</style>
