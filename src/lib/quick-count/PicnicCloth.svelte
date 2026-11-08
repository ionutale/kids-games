<script>
  // The checkered picnic cloth. Objects flash briefly, then disappear so the
  // child answers from memory. Decorative for screen readers.
  import { _ } from '#lib/stores/locale.js';

  let {
    phase = 'ready',
    objects = [],
    cells = [],
    reduced = false,
    readyLabel = $_('getReady')
  } = $props();

  const many = $derived(objects.length > 6);
  const few = $derived(objects.length <= 3);
</script>

<div class="cloth-wrap">
  <div
    class="cloth"
    class:lit={phase === 'flash'}
    class:calm={reduced}
    class:many
    class:few
    data-testid="cloth"
    data-phase={phase}
    data-count={objects.length}
    aria-hidden="true"
  >
    {#if phase === 'flash'}
      {#each objects as object, i (object.id)}
        <span
          class="obj"
          class:many
          style:left="{cells[i]?.x ?? 50}%"
          style:top="{cells[i]?.y ?? 50}%"
          data-testid="flashed-object"
        >
          {object.emoji}
        </span>
      {/each}
    {:else if phase === 'ready'}
      <span class="ready">{readyLabel}</span>
    {/if}
  </div>
</div>

<style>
  .cloth-wrap {
    flex: 1;
    min-height: 0;
    display: flex;
    padding: 0 2px;
  }
  .cloth {
    position: relative;
    flex: 1;
    min-height: 0;
    border-radius: 22px;
    border: 4px solid #8a5a34;
    background:
      repeating-linear-gradient(
        0deg,
        rgba(228, 87, 46, 0.32) 0 24px,
        rgba(255, 248, 236, 0.22) 24px 48px
      ),
      repeating-linear-gradient(
        90deg,
        rgba(228, 87, 46, 0.32) 0 24px,
        rgba(255, 248, 236, 0.22) 24px 48px
      ),
      #fff8ec;
    box-shadow: 0 12px 26px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    transition:
      border-color 0.2s,
      box-shadow 0.2s;
  }
  .cloth.lit {
    border-color: #f6b26b;
    box-shadow:
      0 0 26px rgba(246, 178, 107, 0.55),
      0 12px 26px rgba(0, 0, 0, 0.3);
  }
  .cloth.lit.calm {
    box-shadow: 0 12px 26px rgba(0, 0, 0, 0.3);
  }
  .obj {
    position: absolute;
    transform: translate(-50%, -50%);
    font-size: clamp(26px, 8.4vw, 40px);
    line-height: 1;
    animation: popIn 0.2s ease-out;
    filter: drop-shadow(0 3px 4px rgba(0, 0, 0, 0.2));
  }
  .cloth.few .obj {
    font-size: clamp(34px, 11vw, 52px);
  }
  .cloth.many .obj {
    font-size: clamp(20px, 6.4vw, 30px);
  }
  .cloth.calm .obj {
    animation: none;
  }
  .ready {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-size: clamp(16px, 4.6vw, 19px);
    font-weight: 700;
    color: #8a5a34;
    animation: floaty 1s ease-in-out infinite;
  }
  .cloth.calm .ready {
    animation: none;
  }
  @keyframes popIn {
    from {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.6);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }
</style>
