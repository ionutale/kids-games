<script>
  import { _ } from '#lib/stores/locale.js';
  import PaintStamp from './PaintStamp.svelte';

  /**
   * @type {{
   *   tools: { colors: any[], brushSizes: any[], stamps: any[] },
   *   color: any,
   *   brush: any,
   *   brushIndex: number,
   *   tool: 'brush' | 'bucket' | 'stamp' | 'eraser',
   *   stamp: any,
   *   showBucket: boolean,
   *   canUndo: boolean,
   *   isAge2?: boolean,
   *   oncolor: () => void,
   *   onbrush: () => void,
   *   onbucket: () => void,
   *   onstamp: () => void,
   *   oneraser: () => void,
   *   onundo: () => void
   * }}
   */
  let {
    tools,
    color,
    brush,
    brushIndex,
    tool,
    stamp,
    showBucket,
    canUndo,
    isAge2 = false,
    oncolor,
    onbrush,
    onbucket,
    onstamp,
    oneraser,
    onundo
  } = $props();

  let wellEl = $state(null);
  let stampEl = $state(null);

  const stampPreview = $derived(isAge2 ? 40 : 32);

  /** Keyboard focus returns here after the palette or stamp tray closes. */
  export function focusWell() {
    wellEl?.focus();
  }

  export function focusStamp() {
    stampEl?.focus();
  }
</script>

<div class="dock" class:age-2={isAge2} data-testid="paint-dock">
  <button
    class="tool well"
    type="button"
    style:--c={color.value}
    aria-label={$_(color.labelKey)}
    bind:this={wellEl}
    onclick={oncolor}
  >
    <span class="blob" aria-hidden="true"></span>
  </button>

  <button
    class="tool"
    class:active={tool === 'brush'}
    type="button"
    aria-pressed={tool === 'brush'}
    aria-label={`${$_('paintBrush')} · ${$_(brush.labelKey)}`}
    data-testid="paint-brush"
    onclick={onbrush}
  >
    <svg class="icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path
        d="M27.1 4.9a3.9 3.9 0 0 0-5.5 0L12 14.5l5.5 5.5 9.6-9.6a3.9 3.9 0 0 0 0-5.5z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M10.4 16.1c-2.7 2.7-2.2 5.2-4.3 7.3-1.1 1.1 1 3.2 2.1 2.1 2.1-2.1 4.6-1.6 7.3-4.3z"
        fill="currentColor"
      />
    </svg>
    <span class="sizes" aria-hidden="true">
      {#each tools.brushSizes as option, index}
        <span
          class="size-dot"
          class:on={index === brushIndex}
          style:--dot="{2 + option.size / 4}px"
        ></span>
      {/each}
    </span>
  </button>

  {#if showBucket}
    <button
      class="tool"
      class:active={tool === 'bucket'}
      type="button"
      aria-pressed={tool === 'bucket'}
      aria-label={$_('paintBucket')}
      data-testid="paint-bucket"
      onclick={onbucket}
    >
      <svg class="icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <path
          d="M10 12h13l-2.4 12.2a3 3 0 0 1-2.9 2.4h-2.4a3 3 0 0 1-2.9-2.4z"
          fill="currentColor"
        />
        <ellipse cx="16.5" cy="12" rx="6.5" ry="2.1" fill="none" stroke="#FFF6E2" stroke-width="2" />
        <path
          d="M11 9.6a5.8 5.8 0 0 1 11 0"
          fill="none"
          stroke="currentColor"
          stroke-width="2.1"
          stroke-linecap="round"
        />
        <path
          d="M25 15.5c1.1 1.7 1.9 3 1.9 3.9a1.9 1.9 0 1 1-3.8 0c0-.9.8-2.2 1.9-3.9z"
          fill="currentColor"
        />
      </svg>
    </button>
  {/if}

  <button
    class="tool stamp-tool"
    class:active={tool === 'stamp'}
    type="button"
    aria-pressed={tool === 'stamp'}
    aria-label={`${$_('paintStamp')} · ${$_(stamp.labelKey)}`}
    data-testid="paint-stamp"
    bind:this={stampEl}
    onclick={onstamp}
  >
    <PaintStamp type={stamp.type} size={stampPreview} />
  </button>

  <button
    class="tool"
    class:active={tool === 'eraser'}
    type="button"
    aria-pressed={tool === 'eraser'}
    aria-label={$_('paintEraser')}
    data-testid="paint-eraser"
    onclick={oneraser}
  >
    <svg class="icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <g transform="rotate(-38 16 16)">
        <rect x="6" y="12.4" width="20" height="9.4" rx="3.2" fill="currentColor" />
        <path d="M15 12.4v9.4" stroke="#FFF6E2" stroke-width="1.8" />
      </g>
    </svg>
  </button>

  <button
    class="tool"
    type="button"
    aria-label={$_('paintUndo')}
    data-testid="paint-undo"
    disabled={!canUndo}
    onclick={onundo}
  >
    <svg class="icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path
        d="M12 6.8 5.2 13.6 12 20.4"
        fill="none"
        stroke="currentColor"
        stroke-width="2.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M5.8 13.6H17a7.4 7.4 0 0 1 0 14.8h-4.4"
        fill="none"
        stroke="currentColor"
        stroke-width="2.6"
        stroke-linecap="round"
      />
    </svg>
  </button>
</div>

<style>
  .dock {
    position: absolute;
    left: 50%;
    bottom: calc(12px + var(--safe-bottom));
    z-index: 30;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 4px;
    width: max-content;
    max-width: calc(100vw - 16px);
    padding: 10px;
    border-radius: 28px;
    transform: translateX(-50%);
    background:
      repeating-linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.08) 0 2px,
        rgba(255, 255, 255, 0) 2px 9px
      ),
      linear-gradient(180deg, #cfae83 0%, #b88f63 46%, #9a7048 100%);
    box-shadow:
      inset 0 2px 0 rgba(255, 246, 224, 0.55),
      inset 0 -4px 8px rgba(74, 50, 30, 0.35),
      0 10px 22px rgba(74, 50, 30, 0.28),
      0 2px 0 rgba(255, 255, 255, 0.25);
  }

  .dock.age-2 {
    display: grid;
    grid-template-columns: repeat(3, var(--tool));
    justify-items: center;
    gap: 6px;
  }

  .tool {
    position: relative;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    width: var(--tool);
    height: var(--tool);
    padding: 0;
    border-radius: 50%;
    color: #3a2e28;
    background: linear-gradient(180deg, #fffdf4 0%, #f2e3c6 100%);
    box-shadow:
      inset 0 -3px 0 rgba(150, 113, 73, 0.25),
      inset 0 2px 0 rgba(255, 255, 255, 0.9),
      0 3px 0 rgba(90, 63, 38, 0.28);
    transition: transform 0.12s ease-out, box-shadow 0.12s ease-out;
  }

  .tool:active {
    transform: translateY(1px) scale(0.94);
  }

  .tool.active {
    box-shadow:
      inset 0 -3px 0 rgba(150, 113, 73, 0.25),
      inset 0 0 0 3px #e8a13f,
      0 3px 0 rgba(90, 63, 38, 0.28);
  }

  .tool:disabled {
    opacity: 0.42;
    box-shadow:
      inset 0 -3px 0 rgba(150, 113, 73, 0.18),
      0 3px 0 rgba(90, 63, 38, 0.2);
    cursor: default;
  }

  .tool:focus-visible {
    outline: 3px solid #2f6fb3;
    outline-offset: 2px;
  }

  .well {
    width: var(--well);
    height: var(--well);
  }

  .blob {
    width: 68%;
    height: 68%;
    border-radius: 50%;
    background:
      radial-gradient(circle at 32% 26%, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0) 46%),
      var(--c);
    box-shadow:
      inset -3px -4px 0 rgba(0, 0, 0, 0.13),
      0 2px 4px rgba(90, 63, 38, 0.25);
  }

  .icon {
    display: block;
    width: 24px;
    height: 24px;
    margin-top: -2px;
  }

  .sizes {
    position: absolute;
    left: 50%;
    bottom: 5px;
    display: flex;
    align-items: center;
    gap: 3px;
    transform: translateX(-50%);
  }

  .size-dot {
    width: var(--dot);
    height: var(--dot);
    border-radius: 50%;
    background: rgba(58, 46, 40, 0.24);
  }

  .size-dot.on {
    background: #3a2e28;
  }

  .stamp-tool :global(.paint-stamp) {
    filter: drop-shadow(0 1px 1px rgba(90, 63, 38, 0.25));
  }

  .age-2 .icon {
    width: 30px;
    height: 30px;
  }

  .age-2 .sizes {
    bottom: 8px;
  }
</style>
