<script>
  import { _ } from '$lib/stores/locale';
  import PaintStamp from './PaintStamp.svelte';

  /**
   * @type {{
   *   stamps: any[],
   *   selectedType: string,
   *   size: number,
   *   onselect: (stamp: any) => void,
   *   onclose: () => void
   * }}
   */
  let { stamps, selectedType, size, onselect, onclose } = $props();

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

  <div class="tray" data-testid="paint-stamp-tray" role="group">
    {#each stamps as stamp (stamp.type)}
      <button
        class="stamp-btn"
        class:selected={stamp.type === selectedType}
        type="button"
        aria-pressed={stamp.type === selectedType}
        aria-label={$_(stamp.labelKey)}
        data-stamp={stamp.type}
        use:focusSelected={stamp.type === selectedType}
        onclick={() => onselect(stamp)}
      >
        <PaintStamp type={stamp.type} size={size} />
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

  .tray {
    position: absolute;
    left: 50%;
    bottom: calc(var(--dock-space) + var(--safe-bottom));
    display: flex;
    align-items: center;
    gap: 8px;
    width: max-content;
    max-width: calc(100vw - 16px);
    padding: 12px 14px;
    border-radius: 28px;
    transform: translateX(-50%);
    pointer-events: auto;
    background: linear-gradient(180deg, #fff8e8 0%, #f6e7c8 100%);
    box-shadow:
      inset 0 2px 0 rgba(255, 255, 255, 0.9),
      0 5px 0 rgba(150, 113, 73, 0.28),
      0 14px 26px rgba(74, 50, 30, 0.26);
    animation: rise 0.15s ease-out;
  }

  .stamp-btn {
    display: grid;
    place-items: center;
    width: var(--stamp-btn);
    height: var(--stamp-btn);
    padding: 0;
    border-radius: 18px;
    background: rgba(255, 253, 245, 0.75);
    transition: transform 0.12s ease-out, box-shadow 0.12s ease-out;
  }

  .stamp-btn:active {
    transform: scale(0.94);
  }

  .stamp-btn.selected {
    background: #fffdf5;
    box-shadow: 0 0 0 3px #e8a13f;
  }

  .stamp-btn:focus-visible {
    outline: 3px solid #2f6fb3;
    outline-offset: 3px;
  }

  .stamp-btn :global(.paint-stamp) {
    filter: drop-shadow(0 3px 3px rgba(90, 63, 38, 0.22));
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
