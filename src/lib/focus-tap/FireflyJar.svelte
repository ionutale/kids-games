<script>
  // The firefly jar: the only progress display. One firefly lights per catch;
  // the jar fills to the goal. Decorative for screen readers; the route owns the
  // live status that announces the count.
  let { caught = 0, goal = 7, reduced = false } = $props();

  const pct = $derived(Math.min(1, caught / Math.max(1, goal)));
  const dots = $derived(Array.from({ length: Math.max(0, Math.min(goal, 20)) }, (_, i) => i));
</script>

<div class="jar" class:calm={reduced} aria-hidden="true">
  <span class="lid"></span>
  <div class="glass">
    <span class="fill" style:height="{pct * 100}%"></span>
    {#each dots as i (i)}
      <span
        class="fly"
        class:on={i < caught}
        style:left="{10 + ((i * 47) % 74)}%"
        style:bottom="{5 + ((i * 31) % 70)}%"
      ></span>
    {/each}
    <span class="shine"></span>
  </div>
</div>

<style>
  .jar {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.35));
    pointer-events: none;
  }
  .lid {
    width: 42px;
    max-width: 78%;
    height: 9px;
    border-radius: 5px 5px 3px 3px;
    background: linear-gradient(180deg, #f6b26b, #c98445);
    border: 2px solid #3a271b;
    z-index: 2;
  }
  .glass {
    position: relative;
    width: 100%;
    aspect-ratio: 0.72;
    border-radius: 10px 10px 14px 14px;
    background: rgba(255, 255, 255, 0.12);
    border: 2px solid rgba(255, 255, 255, 0.6);
    overflow: hidden;
    box-shadow: inset 0 0 14px rgba(255, 227, 163, 0.18);
  }
  .fill {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, rgba(255, 227, 163, 0.24), rgba(134, 239, 172, 0.16));
    transition: height 0.3s ease-out;
  }
  .fly {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ffe3a3;
    opacity: 0.14;
    transition:
      opacity 0.25s,
      box-shadow 0.25s;
  }
  .fly.on {
    opacity: 1;
    box-shadow: 0 0 8px 2px rgba(255, 214, 140, 0.7);
  }
  .shine {
    position: absolute;
    top: 8px;
    left: 8px;
    width: 7px;
    height: 26px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.35);
    transform: rotate(8deg);
  }
  .calm .fill,
  .calm .fly {
    transition: none;
  }
</style>
