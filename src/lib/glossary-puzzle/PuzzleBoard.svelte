<script>
  import { onMount, onDestroy } from 'svelte';
  import { _ } from '$lib/stores/locale';
  import { loadPuzzleSounds, playPickup, playSnap, playVictory, playNudge } from '$lib/sounds/puzzleSounds.js';
  import Confetti from '$lib/components/Confetti.svelte';
  import HudPill from '$lib/components/ui/HudPill.svelte';
  import BigButton from '$lib/components/ui/BigButton.svelte';
  import WinOverlay from '$lib/components/ui/WinOverlay.svelte';
  import Starfield from '$lib/components/ui/Starfield.svelte';
  import { levelConfig } from '$lib/glossary-puzzle/images.js';
  import { generatePieces, VIRTUAL_W, VIRTUAL_H } from '$lib/glossary-puzzle/pieces.js';

  const STORAGE_KEY = 'glossary-puzzle-save';

  let { image, level = 1, backHref = '/games/glossary-puzzle', initialPlaced = null, onWin = () => {} } = $props();

  let pieces = $state([]);
  let placed = $state(new Set());
  let rows = $state(2);
  let cols = $state(2);
  let dragging = $state(null);
  let dragPos = $state({ x: 0, y: 0 });
  let celebrating = $state(false);
  let showDone = $state(false);
  let missHintId = $state(null);
  let idleTimer = $state(null);
  let nudgeTarget = $state(null);
  let showNudge = $state(false);
  let soundsLoaded = $state(false);
  let activePointer = $state(null);
  let boardEl = $state(null);
  let ghostStyle = $state({ left: 0, top: 0, width: 0, height: 0 });

  let snapRadius = $state(36);

  function init() {
    const result = generatePieces(levelConfig(level));
    pieces = result.pieces;
    rows = result.rows;
    cols = result.cols;
    snapRadius = result.snapRadius;
    if (initialPlaced) {
      placed = new Set(initialPlaced.filter(id => pieces.some(p => p.id === id)));
    } else {
      placed = new Set();
    }
    celebrating = false;
    showDone = false;
    missHintId = null;
    activePointer = null;
    startIdleTimer();
  }

  function getVirtualCoords(clientX, clientY) {
    if (!boardEl) return { x: 0, y: 0 };
    const r = boardEl.getBoundingClientRect();
    return {
      x: (clientX - r.left) * (VIRTUAL_W / r.width),
      y: (clientY - r.top) * (VIRTUAL_H / r.height),
    };
  }

  function updateGhostStyle() {
    if (!boardEl) return;
    const dp = pieces.find(p => p.id === dragging);
    if (!dp) return;
    const r = boardEl.getBoundingClientRect();
    ghostStyle = {
      left: (dragPos.x - dp.w / 2 - dp.padding) / VIRTUAL_W * r.width + r.left,
      top: (dragPos.y - dp.h / 2 - dp.padding) / VIRTUAL_H * r.height + r.top,
      width: dp.boxW / VIRTUAL_W * r.width,
      height: dp.boxH / VIRTUAL_H * r.height,
    };
  }

  function handlePointerDown(e, pieceId) {
    if (placed.has(pieceId) || activePointer !== null) return;
    const p = pieces.find(p => p.id === pieceId);
    if (!p) return;

    e.preventDefault();
    e.stopPropagation();
    try { e.target.setPointerCapture(e.pointerId); } catch {}

    activePointer = e.pointerId;
    dragging = pieceId;

    const v = getVirtualCoords(e.clientX, e.clientY);
    dragPos = { x: v.x, y: v.y };
    updateGhostStyle();
    resetIdleTimer();
    if (soundsLoaded) playPickup();
  }

  function handlePointerMove(e) {
    if (dragging === null || e.pointerId !== activePointer) return;
    const v = getVirtualCoords(e.clientX, e.clientY);
    dragPos = { x: v.x, y: v.y };
    updateGhostStyle();
  }

  function handlePointerUp(e) {
    if (dragging === null || e.pointerId !== activePointer) return;

    const piece = pieces.find(p => p.id === dragging);
    if (!piece) { dragging = null; activePointer = null; return; }

    const cx = dragPos.x;
    const cy = dragPos.y;
    const tx = piece.targetX + piece.w / 2;
    const ty = piece.targetY + piece.h / 2;
    const dist = Math.hypot(cx - tx, cy - ty);

    if (dist <= snapRadius && !placed.has(piece.id)) {
      placed = new Set([...placed, piece.id]);
      if (soundsLoaded) playSnap();
      if (placed.size === pieces.length) {
        celebrating = true;
        if (soundsLoaded) playVictory();
        onWin();
        setTimeout(() => { showDone = true; celebrating = false; }, 2000);
      }
    } else {
      missHintId = piece.id;
      setTimeout(() => { missHintId = null; }, 1500);
    }

    dragging = null;
    activePointer = null;
    nudgeTarget = null;
    showNudge = false;
    startIdleTimer();
  }

  function renderPieceSVG(piece, opts = {}) {
    const { isDragging = false } = opts;
    const clipId = `cp-${piece.id}`;
    const shId = `sh-${piece.id}`;
    return `<svg viewBox="0 0 ${piece.boxW} ${piece.boxH}" style="width:100%;height:100%;overflow:visible">
      <defs>
        <clipPath id="${clipId}">
          <path d="${piece.path}" transform="translate(${piece.padding}, ${piece.padding})" />
        </clipPath>
        <filter id="${shId}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="5" stdDeviation="4" floodOpacity="0.4" />
        </filter>
      </defs>
      <g filter="${isDragging ? `url(#${shId})` : 'none'}">
        <image href="${image.file}"
          x="${piece.padding - piece.targetX}" y="${piece.padding - piece.targetY}"
          width="${VIRTUAL_W}" height="${VIRTUAL_H}" preserveAspectRatio="xMidYMid slice"
          clip-path="url(#${clipId})" style="pointer-events:none;touch-action:none" />
        <path d="${piece.path}" transform="translate(${piece.padding}, ${piece.padding})"
          fill="none" stroke="${isDragging ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.15)'}" stroke-width="${isDragging ? 3 : 1.5}"
          style="pointer-events:none;touch-action:none" />
      </g>
    </svg>`;
  }

  function renderBoardLinesSVG() {
    const paths = pieces.map(p =>
      `<path d="${p.path}" transform="translate(${p.targetX}, ${p.targetY})" style="fill:none;stroke:rgba(0,0,0,0.18);stroke-width:1.5;stroke-linejoin:round" />`
    ).join('');
    return `<svg viewBox="0 0 ${VIRTUAL_W} ${VIRTUAL_H}" preserveAspectRatio="xMidYMid meet" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none">${paths}</svg>`;
  }

  function startIdleTimer() {
    resetIdleTimer();
    idleTimer = setTimeout(() => {
      if (placed.size === pieces.length) return;
      const unplaced = pieces.filter(p => !placed.has(p.id));
      if (unplaced.length === 0) return;
      const random = unplaced[Math.floor(Math.random() * unplaced.length)];
      nudgeTarget = random.id;
      showNudge = true;
      if (soundsLoaded) playNudge();
      setTimeout(() => { showNudge = false; }, 3000);
    }, 8000);
  }

  function resetIdleTimer() {
    if (idleTimer) clearTimeout(idleTimer);
    nudgeTarget = null;
    showNudge = false;
  }

  function saveProgress() {
    const data = { imageId: image.id, difficulty, placedIds: [...placed] };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }

  init();

  onMount(async () => {
    await loadPuzzleSounds();
    soundsLoaded = true;
  });

  onDestroy(() => {
    resetIdleTimer();
    if (placed.size > 0 && placed.size < pieces.length) saveProgress();
  });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="gp-play night-bg" style="--accent: #5EEAD4;"
  onpointermove={handlePointerMove}
  onpointerup={handlePointerUp}
  onpointercancel={handlePointerUp}>

  <Starfield count={30} />

  <div class="gp-top-bar">
    <a class="gp-exit-btn" href={backHref}>← {$_('back')}</a>
    <HudPill icon="🧩" label="{placed.size}/{pieces.length}" />
  </div>

  <div class="gp-board-wrap">
    <div class="gp-board" bind:this={boardEl}>

      <div class="gp-board-bg" style:background-image="url({image.file})"></div>
      {@html renderBoardLinesSVG()}

      {#each pieces as piece (piece.id)}
        {@const isPlaced = placed.has(piece.id)}
        {@const isDragged = dragging === piece.id}

        {#if isPlaced && !isDragged}
          <div class="gp-board-piece" style="left:{(piece.targetX - piece.padding) / VIRTUAL_W * 100}%;top:{(piece.targetY - piece.padding) / VIRTUAL_H * 100}%;width:{piece.boxW / VIRTUAL_W * 100}%;height:{piece.boxH / VIRTUAL_H * 100}%">
            {@html renderPieceSVG(piece)}
          </div>
        {/if}
      {/each}

      {#if missHintId}
        {@const mp = pieces.find(p => p.id === missHintId)}
        {#if mp}
          <div class="gp-miss-hint" style="left:{mp.targetX / VIRTUAL_W * 100}%;top:{mp.targetY / VIRTUAL_H * 100}%;width:{mp.w / VIRTUAL_W * 100}%;height:{mp.h / VIRTUAL_H * 100}%"></div>
        {/if}
      {/if}

      {#if celebrating}<Confetti />{/if}
    </div>
  </div>

  <div class="gp-tray">
    {#each pieces.filter(p => !placed.has(p.id) && dragging !== p.id) as piece (piece.id)}
      {@const isNudged = showNudge && nudgeTarget === piece.id}
      <div class="gp-tray-piece" class:gp-nudge-shake={isNudged}
        style="width:{piece.boxW / piece.boxH * 70}px;height:70px;flex-shrink:0"
        onpointerdown={(e) => handlePointerDown(e, piece.id)}>
        {@html renderPieceSVG(piece)}
      </div>
    {/each}
  </div>

  {#if dragging}
    {@const dp = pieces.find(p => p.id === dragging)}
    {#if dp}
      <div class="gp-drag-ghost" style="left:{ghostStyle.left}px;top:{ghostStyle.top}px;width:{ghostStyle.width}px;height:{ghostStyle.height}px">
        {@html renderPieceSVG(dp, { isDragging: true })}
      </div>
    {/if}
  {/if}

  {#if showDone}
    <WinOverlay title="🎉 {$_('puzzleDone')}">
      <BigButton variant="primary" class="gp-celebration-btn" onclick={() => init()}>🔄 {$_('playAgain')}</BigButton>
      <BigButton variant="primary" class="gp-celebration-btn" href="/games/glossary-puzzle/play/{level + 1}?image={image.id}">⚡ {$_('nextLevel')} ▶</BigButton>
      <BigButton variant="ghost" class="gp-celebration-btn" href={backHref}>◀ {$_('back')}</BigButton>
    </WinOverlay>
  {/if}
</div>

<style>
  .gp-play { display: flex; flex-direction: column; flex: 1; touch-action: none; user-select: none; -webkit-user-select: none; }
  .gp-top-bar { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 6px 12px; flex-shrink: 0; background: var(--panel-glass); backdrop-filter: blur(6px); position: relative; z-index: 1; }
  .gp-exit-btn { font-size: 14px; font-weight: 600; color: var(--text-hi); background: var(--panel-glass); border: 1px solid var(--panel-border); border-radius: 12px; padding: 4px 8px; text-decoration: none; display: inline-flex; align-items: center; }
  .gp-exit-btn:active { background: rgba(94,234,212,0.25); border-color: var(--accent); }
  .gp-board-wrap { flex: 1; display: flex; align-items: center; justify-content: center; width: 100%; padding: 8px; position: relative; z-index: 1; }
  .gp-board { position: relative; width: min(100%, calc(100vh - 180px)); aspect-ratio: 4/3; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.15); background: #f0f0f0; }
  .gp-board-bg { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0.12; filter: grayscale(1); }
  .gp-board-piece { position: absolute; }
  .gp-miss-hint { position: absolute; border-radius: 4px; background: rgba(255,215,0,0.15); border: 2px dashed rgba(255,215,0,0.5); animation: gpMissPulse 0.6s ease-in-out 3; pointer-events: none; }
  @keyframes gpMissPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
  .gp-drag-ghost { position: fixed; z-index: 100; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3)); transform: scale(1.08); transform-origin: center center; pointer-events: none; }
  .gp-tray { display: flex; gap: 6px; padding: 8px; padding-bottom: calc(8px + var(--safe-bottom)); flex-shrink: 0; min-height: 86px; overflow-x: auto; align-items: center; background: var(--panel-glass); backdrop-filter: blur(6px); border-top: 1px solid var(--panel-border); position: relative; z-index: 1; }
  .gp-tray-piece { cursor: grab; touch-action: none; flex-shrink: 0; }
  .gp-tray-piece:active { cursor: grabbing; }
  .gp-nudge-shake { animation: gpShake 0.4s ease-in-out 3; }
  @keyframes gpShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 50% { transform: translateX(4px); } }
</style>
