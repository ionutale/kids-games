<script>
  // The one level picker/progress display for every ladder game.
  // Steps below `current` read as done; step 10 shows 🎓 once mastered.
  // Free play: nothing is ever locked.
  let { current = 1, count = 10, hrefFor = null, onchange = null, mastered = false } = $props();
</script>

<div class="ladder-bar">
  {#each Array(count) as _, i}
    {@const num = i + 1}
    {@const done = mastered || num < current}
    {#if hrefFor}
      <a
        class="ladder-step"
        class:active={current === num}
        class:done
        href={hrefFor(num)}
      >
        {mastered && num === count ? '🎓' : num}
      </a>
    {:else}
      <button
        class="ladder-step"
        class:active={current === num}
        class:done
        onclick={() => onchange?.(num)}
      >
        {mastered && num === count ? '🎓' : num}
      </button>
    {/if}
  {/each}
</div>

<style>
  .ladder-bar {
    display: flex;
    /* Center each row; `safe` avoids clipping if a row ever overflows. */
    justify-content: safe center;
    /* Ten 24px steps need 258px. A narrow win-card content box wraps onto a
       second row instead of squeezing every step below a tappable size. */
    flex-wrap: wrap;
    gap: 4px 2px;
    padding-bottom: calc(8px + var(--safe-bottom));
    padding-left: 2px;
    padding-right: 2px;
  }
  .ladder-step {
    /* 44px tall everywhere; on narrow phones the width grows to 44px and the
       row wraps rather than shrinking the touch target. */
    width: 32px;
    height: 44px;
    min-width: 24px;
    flex: 1 1 28px;
    max-width: 32px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    font-family: var(--font-display);
    color: var(--text-lo);
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .ladder-step.done {
    color: var(--mint);
    border-color: rgba(110, 231, 183, 0.35);
  }
  .ladder-step.active {
    color: #062033;
    background: var(--cyan);
    border-color: var(--cyan);
    box-shadow: 0 0 8px rgba(127,216,255,0.6);
  }
  /* Ten 44px steps cannot share a 320px row, so narrow phones wrap them onto
     two centered rows instead of shrinking below the 44px touch target. */
  @media (max-width: 360px) {
    .ladder-step {
      flex: 1 1 44px;
      min-width: 44px;
      max-width: 44px;
    }
  }
</style>
