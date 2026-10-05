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
    justify-content: center;
    flex-wrap: nowrap;
    gap: 3px;
    padding-bottom: calc(8px + var(--safe-bottom));
    padding-left: 8px;
    padding-right: 8px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .ladder-bar::-webkit-scrollbar { display: none; }
  .ladder-step {
    width: 32px;
    height: 32px;
    min-width: 32px;
    flex: 0 0 auto;
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
</style>
