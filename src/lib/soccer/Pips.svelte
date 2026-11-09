<script>
  // Five ball pips replace digits: dim balls are shots already taken, gold
  // dots are goals. The whole capsule is one labelled image for screen readers.
  import SoccerArt from './SoccerArt.svelte';

  let { shotsLeft = 5, total = 5, goals = 0, label = '' } = $props();
</script>

<div
  class="pips"
  data-testid="soccer-pips"
  data-shots={shotsLeft}
  data-goals={goals}
  data-total={total}
  role="img"
  aria-label={label}
>
  <span class="shots" aria-hidden="true">
    {#each Array(total) as _, i (i)}
      <span class="pip" class:used={i >= shotsLeft}>
        <SoccerArt id="ball" size={13} />
      </span>
    {/each}
  </span>
  <span class="goals" aria-hidden="true">
    {#each Array(total) as _, i (i)}
      <span class="goal-dot" class:lit={i < goals}></span>
    {/each}
  </span>
</div>

<style>
  .pips {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 7px;
    border-radius: 12px;
    background: rgba(10, 18, 36, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.16);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
    max-width: 100%;
  }
  .shots,
  .goals {
    display: flex;
    align-items: center;
    gap: 2px;
  }
  .goals {
    gap: 3px;
  }
  .pip {
    display: inline-flex;
    opacity: 1;
    transition: opacity 0.2s ease;
  }
  .pip.used {
    opacity: 0.24;
  }
  .goal-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.16);
    border: 1px solid rgba(255, 255, 255, 0.22);
    transition: background 0.2s ease, box-shadow 0.2s ease;
  }
  .goal-dot.lit {
    background: #ffe082;
    border-color: #ffe082;
    box-shadow: 0 0 6px rgba(255, 224, 130, 0.85);
  }
</style>
