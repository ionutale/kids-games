<script>
  let { current = 1, count = 10, onchange, maxUnlocked = count, hrefFor = null } = $props();
</script>

<div class="level-bar">
  {#each Array(count) as _, i}
    {@const num = i + 1}
    {@const locked = num > maxUnlocked}
    {#if hrefFor}
      <a
        class="level-btn"
        class:active={current === num}
        class:locked={locked}
        aria-disabled={locked}
        href={locked ? undefined : hrefFor(num)}
        onclick={(e) => { if (locked) e.preventDefault(); }}
      >
        {num}
      </a>
    {:else}
      <button
        class="level-btn"
        class:active={current === num}
        class:locked={locked}
        disabled={locked}
        onclick={() => onchange?.(num)}
      >
        {num}
      </button>
    {/if}
  {/each}
</div>

<style>
  .level-bar {
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
  .level-bar::-webkit-scrollbar { display: none; }
  .level-btn {
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
  .level-btn.active {
    color: #062033;
    background: var(--cyan);
    border-color: var(--cyan);
    box-shadow: 0 0 8px rgba(127,216,255,0.6);
  }
  .level-btn.locked {
    opacity: 0.35;
    cursor: not-allowed;
  }
  .level-btn.locked:active { transform: none; }
</style>
