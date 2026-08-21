<script>
  let { current = 1, count = 10, onchange } = $props();
</script>

<div class="level-bar">
  {#each Array(count) as _, i}
    <button
      class="level-btn"
      class:active={current === i + 1}
      onclick={() => onchange?.(i + 1)}
    >
      {i + 1}
    </button>
  {/each}
</div>

<style>
  .level-bar {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 4px;
    padding-bottom: calc(8px + var(--safe-bottom));
  }
  .level-btn {
    width: 34px;
    height: 32px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    font-family: var(--font-display);
    color: var(--text-lo);
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
  }
  .level-btn.active {
    color: #062033;
    background: var(--cyan);
    border-color: var(--cyan);
    box-shadow: 0 0 8px rgba(127,216,255,0.6);
  }
</style>
