<script>
  import { onMount } from 'svelte';
  import { settings } from '$lib/stores/settings';
  import { playTap, playSplash } from '$lib/sounds/audioManager';
  import GameShell from '$lib/components/ui/GameShell.svelte';

  let canvasEl;
  let ctx = $state(null);
  let isDrawing = $state(false);
  let currentColor = $state('#FF6B6B');
  let currentSize = $state('big');
  let mode = $state('brush');
  let bursts = $state([]);

  const colors = ['#FF6B6B', '#4FC3F7', '#81C784', '#FFD54F', '#BA68C8', '#FF8A65'];
  const stamps = ['⭐', '❤️', '🐱', '🐶', '🦋', '🌻'];

  function init() {
    if (!canvasEl) return;
    ctx = canvasEl.getContext('2d');
    resize();
  }

  function resize() {
    if (!canvasEl || !ctx) return;
    const rect = canvasEl.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvasEl.width = rect.width * dpr;
    canvasEl.height = rect.height * dpr;
    canvasEl.style.width = rect.width + 'px';
    canvasEl.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);
  }

  onMount(() => {
    init();
    addEventListener('resize', resize);
    return () => removeEventListener('resize', resize);
  });

  // Pointer Events: unified mouse+touch input, pointer-id locked, rect cached
  // per stroke, window-level move/up so strokes survive leaving the canvas.
  let activePointer = null;
  let strokeRect = null;

  function getPos(e) {
    if (!canvasEl) return { x: 0, y: 0 };
    const rect = strokeRect ?? canvasEl.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function attachStroke() {
    window.addEventListener('pointermove', keepDrawing);
    window.addEventListener('pointerup', endDraw);
    window.addEventListener('pointercancel', endDraw);
  }
  function detachStroke() {
    window.removeEventListener('pointermove', keepDrawing);
    window.removeEventListener('pointerup', endDraw);
    window.removeEventListener('pointercancel', endDraw);
  }

  function startDraw(e) {
    e.preventDefault();
    if (activePointer !== null) return; // one finger at a time
    if (!ctx) return;
    activePointer = e.pointerId;
    strokeRect = canvasEl.getBoundingClientRect(); // cache once per stroke
    attachStroke();
    isDrawing = true;
    const pos = getPos(e);
    if (mode === 'stamp') {
      ctx.font = `${currentSize === 'big' ? 48 : 30}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(stamps[Math.floor(Math.random() * stamps.length)], pos.x, pos.y);
      const id = Date.now();
      bursts = [...bursts, { id, x: (pos.x / canvasEl.parentElement.getBoundingClientRect().width) * 100, y: (pos.y / canvasEl.parentElement.getBoundingClientRect().height) * 100 }];
      setTimeout(() => bursts = bursts.filter(b => b.id !== id), 600);
      if ($settings.soundEnabled) playSplash();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineWidth = currentSize === 'big' ? 20 : currentSize === 'medium' ? 12 : 6;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;
  }

  function keepDrawing(e) {
    e.preventDefault();
    if (e.pointerId !== activePointer) return; // ignore other fingers
    if (!isDrawing || mode === 'stamp' || !ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function endDraw(e) {
    if (e && e.pointerId !== undefined && e.pointerId !== activePointer) return;
    activePointer = null;
    strokeRect = null;
    detachStroke();
    if (isDrawing && $settings.soundEnabled) playTap();
    isDrawing = false;
  }

  function clearCanvas() {
    if (!ctx || !canvasEl) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvasEl.width / dpr, canvasEl.height / dpr);
  }

  function switchMode(newMode) {
    mode = newMode;
    if (mode === 'brush') {
      currentColor = colors[0];
    }
  }
</script>

<GameShell accent="#FF8FB1">
  <div class="paint-game">
    <div class="canvas-wrap">
      <canvas
        bind:this={canvasEl}
        class="draw-canvas"
        onpointerdown={startDraw}
      ></canvas>
    </div>

    <div class="toolbar">
      {#each colors as c}
        <button
          class="color-btn"
          style:background={c}
          class:active={currentColor === c}
          aria-label={c}
          onclick={() => { currentColor = c; mode = 'brush'; }}
        ></button>
      {/each}
    </div>

    <div class="bottom-bar">
      <button class="action-btn" onclick={() => switchMode(mode === 'brush' ? 'stamp' : 'brush')}>
        {mode === 'brush' ? '⭐' : '🖌️'}
      </button>
      {#if mode === 'brush'}
        {#each ['small', 'medium', 'big'] as s}
          <button class="size-btn" class:active={currentSize === s} onclick={() => currentSize = s}>
            {s === 'small' ? '─' : s === 'medium' ? '━' : '━━'}
          </button>
        {/each}
      {/if}
      <button class="action-btn" onclick={clearCanvas}>🗑️</button>
    </div>
  </div>
</GameShell>

<style>
  .paint-game {
    display: flex;
    flex-direction: column;
    flex: 1;
    position: relative;
    overflow: hidden;
  }
  .canvas-wrap {
    flex: 1;
    position: relative;
    margin: 8px;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid var(--panel-border);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
  }
  .draw-canvas {
    user-select: none;
    -webkit-touch-callout: none;
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none;
    cursor: crosshair;
    background: white;
  }
  .toolbar {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--panel-glass);
    border-top: 1px solid var(--panel-border);
    backdrop-filter: blur(6px);
    flex-shrink: 0;
  }
  .color-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 3px solid transparent;
  }
  .color-btn.active { border-color: var(--accent); }
  .bottom-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 8px 12px;
    padding-bottom: calc(8px + var(--safe-bottom));
    background: var(--panel-glass);
    border-top: 1px solid var(--panel-border);
    backdrop-filter: blur(6px);
    flex-shrink: 0;
  }
  .action-btn {
    font-size: 24px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    color: var(--text-lo);
  }
  .size-btn {
    font-size: 20px;
    padding: 4px 12px;
    border-radius: 8px;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    color: var(--text-lo);
  }
  .size-btn.active { color: var(--text-hi); font-weight: 700; background: rgba(255, 143, 177, 0.25); border-color: var(--accent); }
</style>
