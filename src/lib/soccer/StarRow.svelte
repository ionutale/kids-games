<script>
  // The local best-star row for the current Soccer level. It lives on the
  // Soccer page, directly above the shared ladder (ADR 0001 addendum): the
  // shared LadderBar stays a plain level number for every game.
  import SoccerArt from './SoccerArt.svelte';

  let { best = 0, total = 3, label = '' } = $props();
</script>

<div
  class="star-row"
  data-testid="soccer-stars"
  data-best={best}
  role="img"
  aria-label={label}
>
  {#each Array(total) as _, i (i)}
    <span class="star" class:on={i < best}>
      <SoccerArt id={i < best ? 'star' : 'star-outline'} size={18} />
    </span>
  {/each}
</div>

<style>
  .star-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-height: 22px;
    padding: 1px 0;
  }
  .star {
    display: inline-flex;
    opacity: 0.92;
  }
  .star.on {
    filter: drop-shadow(0 0 5px rgba(242, 193, 78, 0.55));
  }
</style>
