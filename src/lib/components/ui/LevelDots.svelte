<script>
  let { total = 10, current = 1, unlocked = 1 } = $props();
</script>

<div class="level-dots">
  {#each Array(total) as _, i}
    <span
      class="level-dot"
      class:current={current === i + 1}
      class:unlocked={i + 1 <= unlocked}
      class:locked={i + 1 > unlocked}
    ></span>
  {/each}
</div>

<style>
  .level-dots { display: flex; gap: 4px; align-items: center; }
  .level-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    transition: all 0.2s;
  }
  .level-dot.locked { background: rgba(255,255,255,0.18); }
  .level-dot.unlocked { background: var(--cyan); opacity: 0.4; }
  .level-dot.current {
    background: var(--cyan);
    opacity: 1;
    transform: scale(1.35);
    box-shadow: 0 0 6px rgba(127,216,255,0.85);
  }
</style>
