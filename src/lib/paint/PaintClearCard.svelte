<script>
  import { onMount } from 'svelte';
  import { _ } from '#lib/stores/locale.js';

  /**
   * @type {{ onconfirm: () => void, oncancel: () => void }}
   */
  let { onconfirm, oncancel } = $props();

  let dialogEl = $state(null);
  let confirmEl = $state(null);
  let cancelEl = $state(null);

  onMount(() => {
    // Safer default for a destructive card: the child's clear needs a
    // deliberate second choice, not a stray Enter.
    cancelEl?.focus();
  });

  function onKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      oncancel();
      return;
    }

    if (event.key !== 'Tab') return;

    const first = confirmEl;
    const last = cancelEl;
    if (!first || !last) return;

    const activeElement = document.activeElement;
    const onCard = activeElement === dialogEl;

    if (event.shiftKey && (activeElement === first || onCard)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (activeElement === last || onCard)) {
      event.preventDefault();
      first.focus();
    }
  }
</script>

<div class="layer">
  <button
    class="backdrop"
    type="button"
    tabindex="-1"
    aria-label={$_('paintClearCancel')}
    onclick={oncancel}
  ></button>

  <div
    class="card"
    role="dialog"
    aria-modal="true"
    aria-labelledby="clear-card-title"
    data-testid="clear-card"
    tabindex="-1"
    bind:this={dialogEl}
    onkeydown={onKeydown}
  >
    <h2 id="clear-card-title">{$_('paintClearConfirm')}</h2>
    <div class="actions">
      <button
        class="yes"
        type="button"
        data-testid="clear-confirm"
        aria-label={$_('paintClear')}
        bind:this={confirmEl}
        onclick={onconfirm}
      >✓</button>
      <button
        class="no"
        type="button"
        data-testid="clear-cancel"
        aria-label={$_('paintClearCancel')}
        bind:this={cancelEl}
        onclick={oncancel}
      >✕</button>
    </div>
  </div>
</div>

<style>
  .layer {
    position: absolute;
    inset: 0;
    z-index: 50;
    display: grid;
    place-items: center;
  }

  .backdrop {
    position: absolute;
    inset: 0;
    border: 0;
    background: rgba(46, 36, 28, 0.42);
  }

  .card {
    position: relative;
    width: min(330px, calc(100vw - 48px));
    padding: 24px 22px 20px;
    border-radius: 26px;
    color: #2b2118;
    text-align: center;
    background: #fff8e8;
    box-shadow:
      inset 0 2px 0 rgba(255, 255, 255, 0.95),
      0 18px 40px rgba(27, 37, 55, 0.35),
      0 4px 0 rgba(93, 76, 61, 0.18);
  }

  .card:focus {
    outline: none;
  }

  h2 {
    margin-bottom: 18px;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.25;
  }

  .actions {
    display: flex;
    justify-content: center;
    gap: 18px;
  }

  .yes,
  .no {
    display: grid;
    place-items: center;
    width: 72px;
    height: 72px;
    border-radius: 50%;
    color: #ffffff;
    font-size: 34px;
    font-weight: 700;
    box-shadow:
      0 4px 0 rgba(93, 76, 61, 0.18),
      0 8px 16px rgba(27, 37, 55, 0.2);
  }

  .yes {
    background: #4caf50;
  }

  .no {
    background: #e57373;
  }

  .yes:active,
  .no:active {
    transform: translateY(1px) scale(0.96);
  }

  .yes:focus-visible,
  .no:focus-visible {
    outline: 3px solid #2f6fb3;
    outline-offset: 3px;
  }
</style>
