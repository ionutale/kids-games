<script>
  import { _ } from '#lib/stores/locale.js';
  import PaintPaperThumb from './PaintPaperThumb.svelte';

  /**
   * @type {{
   *   sheets: Array<{ id: string, kind: string, titleKey: string }>,
   *   activeId: string,
   *   onselect: (id: string) => void,
   *   onclose: () => void
   * }}
   */
  let { sheets, activeId, onselect, onclose } = $props();

  // Land keyboard focus on the current paper and keep it visible in the
  // scrolling grid, so a 13-14 card collection never opens off-screen.
  function focusActive(node, active) {
    if (active) {
      queueMicrotask(() => {
        node.focus();
        node.scrollIntoView({ block: 'nearest' });
      });
    }
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

  <div class="tray" data-testid="paper-tray" role="dialog" aria-modal="true" aria-labelledby="paper-tray-title">
    <div class="head">
      <h2 id="paper-tray-title">{$_('paintPaper')}</h2>
      <button
        class="close"
        type="button"
        data-testid="paper-close"
        aria-label={$_('close')}
        onclick={onclose}
      >
        <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
          <path
            d="M9 9 23 23M23 9 9 23"
            fill="none"
            stroke="currentColor"
            stroke-width="2.8"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>

    <div class="cards">
      {#each sheets as sheet (sheet.id)}
        <button
          class="card"
          class:active={sheet.id === activeId}
          type="button"
          data-testid={`paper-${sheet.id}`}
          aria-pressed={sheet.id === activeId}
          aria-label={$_(sheet.titleKey)}
          use:focusActive={sheet.id === activeId}
          onclick={() => onselect(sheet.id)}
        >
          {#if sheet.id === activeId}
            <span class="tape" aria-hidden="true"></span>
            <span class="check" aria-hidden="true">✓</span>
          {/if}
          <span class="art" aria-hidden="true">
            <PaintPaperThumb sheetId={sheet.id} />
          </span>
          <span class="name">{$_(sheet.titleKey)}</span>
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .layer {
    position: absolute;
    inset: 0;
    z-index: 45;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .backdrop {
    position: absolute;
    inset: 0;
    border: 0;
    background: rgba(46, 36, 28, 0.42);
  }

  .tray {
    position: relative;
    display: flex;
    flex-direction: column;
    width: min(460px, calc(100% - 16px));
    max-height: calc(100dvh - var(--dock-space, 88px) - 20px);
    margin-bottom: calc(var(--dock-space, 88px) + 10px + var(--safe-bottom));
    padding: 16px 16px 18px;
    border-radius: 30px 30px 20px 20px;
    background: linear-gradient(180deg, #fff9ea 0%, #f8e9cb 100%);
    box-shadow:
      inset 0 2px 0 rgba(255, 255, 255, 0.95),
      0 5px 0 rgba(150, 113, 73, 0.22),
      0 18px 36px rgba(46, 36, 28, 0.32);
    animation: rise 0.15s ease-out;
  }

  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    padding: 0 4px;
  }

  h2 {
    color: #2b2118;
    font-size: 19px;
    font-weight: 700;
    letter-spacing: 0.2px;
  }

  .close {
    display: grid;
    place-items: center;
    width: var(--chip);
    height: var(--chip);
    border-radius: 50%;
    color: #3a2e28;
    background: #fffdf5;
    box-shadow: 0 3px 0 rgba(93, 76, 61, 0.18);
  }

  .close svg {
    width: 42%;
    height: 42%;
  }

  .close:active {
    transform: translateY(1px) scale(0.96);
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    flex: 1 1 auto;
    min-height: 0;
    padding: 4px 4px 10px;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    scrollbar-gutter: stable;
  }

  /* An odd final card (9 at ages 3-5, 13 at age 2) centres under the rows. */
  .cards .card:last-child:nth-child(odd) {
    grid-column: 1 / -1;
    width: calc(50% - 6px);
    justify-self: center;
  }

  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px 10px 12px;
    border-radius: 20px;
    text-align: left;
    color: #2b2118;
    background: #fffdf6;
    box-shadow:
      0 3px 0 rgba(93, 76, 61, 0.16),
      0 8px 16px rgba(27, 37, 55, 0.12);
    transition: transform 0.12s ease-out;
  }

  .card:active {
    transform: scale(0.98);
  }

  .card.active {
    box-shadow:
      0 0 0 3px #e8a13f,
      0 3px 0 rgba(93, 76, 61, 0.16),
      0 8px 16px rgba(27, 37, 55, 0.18);
  }

  .card:focus-visible {
    outline: 3px solid #2f6fb3;
    outline-offset: 3px;
  }

  .art {
    display: block;
    aspect-ratio: 3 / 4;
    overflow: hidden;
    border: 1px solid rgba(93, 76, 61, 0.16);
    border-radius: 12px;
    background: #fffdf6;
  }

  .name {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.2;
  }

  .check {
    position: absolute;
    top: 14px;
    right: 14px;
    z-index: 2;
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    color: #ffffff;
    font-size: 15px;
    font-weight: 700;
    background: #4caf50;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.22);
  }

  .tape {
    position: absolute;
    top: -7px;
    left: 50%;
    z-index: 2;
    width: 56px;
    height: 16px;
    border-radius: 2px;
    background: rgba(255, 224, 130, 0.9);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
    transform: translateX(-50%) rotate(-2deg);
  }

  @keyframes rise {
    from {
      opacity: 0;
      transform: translateY(18px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
