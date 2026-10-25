<script>
  import { _ } from '$lib/stores/locale';

  /**
   * @type {{
   *   colors: any[],
   *   selectedId: string,
   *   onselect: (color: any) => void,
   *   onclose: () => void
   * }}
   */
  let { colors, selectedId, onselect, onclose } = $props();

  // Keyboard users land on the current pot when the palette opens.
  function focusSelected(node, active) {
    if (active) queueMicrotask(() => node.focus());
  }
</script>

<div class="layer">
  <button
    class="backdrop"
    type="button"
    tabindex="-1"
    aria-label={$_('close')}
    onclick={onclose}
  ></button>

  <div class="palette" data-testid="paint-palette" role="group">
    {#each colors as color (color.id)}
      <button
        class="pot-btn"
        class:selected={color.id === selectedId}
        type="button"
        data-testid="paint-color"
        aria-pressed={color.id === selectedId}
        aria-label={$_(color.labelKey)}
        use:focusSelected={color.id === selectedId}
        onclick={() => onselect(color)}
      >
        <span class="pot" style:--c={color.value} aria-hidden="true"></span>
      </button>
    {/each}
  </div>
</div>

<style>
  .layer {
    position: absolute;
    inset: 0;
    z-index: 40;
    pointer-events: none;
  }

  .backdrop {
    position: absolute;
    inset: 0;
    border: 0;
    background: rgba(58, 46, 40, 0.06);
    pointer-events: auto;
  }

  .palette {
    position: absolute;
    left: 50%;
    bottom: calc(var(--dock-space) + var(--safe-bottom));
    display: grid;
    grid-template-columns: repeat(4, auto);
    gap: 10px;
    width: max-content;
    max-width: calc(100vw - 16px);
    padding: 16px 18px 18px;
    border-radius: 34px 34px 22px 22px;
    transform: translateX(-50%);
    pointer-events: auto;
    background:
      radial-gradient(circle at 18% 16%, rgba(255, 255, 255, 0.22) 0 3px, transparent 4px),
      radial-gradient(circle at 76% 70%, rgba(255, 255, 255, 0.16) 0 2px, transparent 3px),
      linear-gradient(180deg, #d9b98f 0%, #bd9468 58%, #a87f55 100%);
    box-shadow:
      inset 0 2px 0 rgba(255, 246, 224, 0.55),
      inset 0 -5px 10px rgba(74, 50, 30, 0.3),
      0 12px 24px rgba(74, 50, 30, 0.28);
    animation: rise 0.15s ease-out;
  }

  .pot-btn {
    display: grid;
    place-items: center;
    width: min(var(--pot), calc((100vw - 76px) / 4));
    height: min(var(--pot), calc((100vw - 76px) / 4));
    padding: 0;
    border-radius: 50%;
  }

  .pot {
    display: block;
    width: 78%;
    height: 78%;
    border-radius: 50%;
    background:
      radial-gradient(circle at 32% 26%, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0) 46%),
      var(--c);
    box-shadow:
      inset -4px -5px 0 rgba(0, 0, 0, 0.14),
      0 3px 6px rgba(74, 50, 30, 0.28),
      0 0 0 3px rgba(255, 253, 245, 0.92);
    transition: transform 0.12s ease-out, box-shadow 0.12s ease-out;
  }

  .pot-btn.selected .pot {
    transform: scale(1.04);
    box-shadow:
      inset -4px -5px 0 rgba(0, 0, 0, 0.14),
      0 3px 6px rgba(74, 50, 30, 0.28),
      0 0 0 4px #fffdf5,
      0 0 0 8px #e8a13f;
  }

  .pot-btn:active .pot {
    transform: scale(0.93);
  }

  .pot-btn:focus-visible {
    outline: 3px solid #2f6fb3;
    outline-offset: 4px;
    border-radius: 50%;
  }

  @keyframes rise {
    from {
      opacity: 0;
      transform: translate(-50%, 14px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
</style>
