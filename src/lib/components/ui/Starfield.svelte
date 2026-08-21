<script>
  let { count = 40 } = $props();

  let s = 42;
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };

  // svelte-ignore state_referenced_locally -- stars are generated once; regenerating would reshuffle positions
  const stars = Array.from({ length: count }, (_, i) => ({
    id: i,
    top: rand() * 100,
    left: rand() * 100,
    size: 1 + rand() * 2,
    delay: rand() * 4,
    duration: 2 + rand() * 3
  }));
</script>

<div class="starfield" aria-hidden="true">
  {#each stars as st (st.id)}
    <span
      class="star"
      style:top="{st.top}%"
      style:left="{st.left}%"
      style:width="{st.size}px"
      style:height="{st.size}px"
      style:animation-delay="{st.delay}s"
      style:animation-duration="{st.duration}s"
    ></span>
  {/each}
</div>

<style>
  .starfield {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
  }
  .star {
    position: absolute;
    border-radius: 50%;
    background: #fff;
    animation: twinkle ease-in-out infinite;
  }
</style>
