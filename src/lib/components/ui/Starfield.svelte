<script>
  import { makeStars } from './stars.js';

  let { count = 40 } = $props();

  // svelte-ignore state_referenced_locally -- stars are generated once; regenerating would reshuffle positions
  const stars = makeStars(count);
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
