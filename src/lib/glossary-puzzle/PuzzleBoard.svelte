<script>
  import { onMount, onDestroy } from 'svelte';
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { _ } from '$lib/stores/locale';
  import { loadPuzzleSounds, playPickup, playSnap, playVictory, playNudge, startDragLoop, stopDragLoop } from '$lib/sounds/puzzleSounds.js';
  import { vibrate } from '$lib/sounds/audioManager.js';
  import Confetti from '$lib/components/Confetti.svelte';
  import HudPill from '$lib/components/ui/HudPill.svelte';
  import BigButton from '$lib/components/ui/BigButton.svelte';
  import WinOverlay from '$lib/components/ui/WinOverlay.svelte';
  import Starfield from '$lib/components/ui/Starfield.svelte';
  import { levelConfig } from '$lib/glossary-puzzle/images.js';
  import { generatePieces, computeVisibleTray, isWithinSnapZone, TRAY_CAPACITY, VIRTUAL_W, VIRTUAL_H } from '$lib/glossary-puzzle/pieces.js';
  import { buildSaveData, writeSave } from '$lib/glossary-puzzle/save.js';
  import { pieceSvgHtml, boardLinesSvgHtml } from '$lib/glossary-puzzle/rendering.js';

  const GHOST_LIFT_PX = 26;
  const IDLE_MS = 8000;
  const NUDGE_MS = 3000;
  const GLIDE_MS = 160;

  let { image, level = 1, backHref = '/games/glossary-puzzle', initialPlaced = null, onWin = () => {} } = $props();

  let pieces = $state([]);
  let placed = $state(new Set());
  let rows = $state(2);
  let cols = $state(2);
  let trayQueue = $state([]);
  let dragging = $state(null);
  let dragPos = $state({ x: 0, y: 0 });
  let celebrating = $state(false);
  let showDone = $state(false);
  let missHintId = $state(null);
  let missTimer = null;
  let idleTimer = null;
  let nudgeTimer = null;
  let popTimer = null;
  let glideTimer = null;
  let nudgeTarget = $state(null);
  let showNudge = $state(false);
  let proximityId = $state(null);
  let justPlacedId = $state(null);
  let glidingPiece = $state(null);
  let glideBox = $state({ left: 0, top: 0, width: 0, height: 0 });
  let glideGo = $state(false);
  let soundsLoaded = $state(false);
  let activePointer = $state(null);
  let boardEl = $state(null);
  let ghostStyle = $state({ left: 0, top: 0, width: 0, height: 0 });

  let snapRadius = $state(36);
  let boardLinesHtml = $state('');

  let trayPieces = $derived(
    computeVisibleTray(trayQueue, placed, dragging)
      .filter(id => id !== glidingPiece)
      .map(id => pieces.find(p => p.id === id))
      .filter(Boolean)
  );
  let progress = $derived(pieces.length ? placed.size / pieces.length : 0);

  function init() {
    const result = generatePieces(levelConfig(level));
    result.pieces.forEach(p => {
      p.html = pieceSvgHtml(p, image.file);
      p.dragHtml = pieceSvgHtml(p, image.file, { isDragging: true });
    });
    pieces = result.pieces;
    rows = result.rows;
    cols = result.cols;
    snapRadius = result.snapRadius;
    boardLinesHtml = boardLinesSvgHtml(result.pieces);
    trayQueue = result.pieces.map(p => p.id);
    if (initialPlaced) {
      placed = new Set(initialPlaced.filter(id => pieces.some(p => p.id === id)));
    } else {
      placed = new Set();
    }
    celebrating = false;
    showDone = false;
    missHintId = null;
    proximityId = null;
    justPlacedId = null;
    glidingPiece = null;
    glideGo = false;
    activePointer = null;
    resetIdleTimers();
    scheduleIdleNudge();
  }

  function getVirtualCoords(clientX, clientY) {
    if (!boardEl) return { x: 0, y: 0 };
    const r = boardEl.getBoundingClientRect();
    return {
      x: (clientX - r.left) * (VIRTUAL_W / r.width),
      y: (clientY - r.top) * (VIRTUAL_H / r.height),
    };
  }

  function virtualLiftY() {
    if (!boardEl) return 0;
    const r = boardEl.getBoundingClientRect();
    return r.height ? GHOST_LIFT_PX * (VIRTUAL_H / r.height) : 0;
  }

  function updateGhostStyle() {
    if (!boardEl) return;
    const dp = pieces.find(p => p.id === dragging);
    if (!dp) return;
    const r = boardEl.getBoundingClientRect();
    ghostStyle = {
      left: (dragPos.x - dp.w / 2 - dp.padding) / VIRTUAL_W * r.width + r.left,
      top: (dragPos.y - dp.h / 2 - dp.padding) / VIRTUAL_H * r.height + r.top - GHOST_LIFT_PX,
      width: dp.boxW / VIRTUAL_W * r.width,
      height: dp.boxH / VIRTUAL_H * r.height,
    };
  }

  function handlePointerDown(e, pieceId) {
    if (placed.has(pieceId) || activePointer !== null || glidingPiece === pieceId) return;
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
    resetIdleTimers();
    scheduleIdleNudge();
    if (soundsLoaded) {
      playPickup();
      startDragLoop();
    }
  }

  function handlePointerMove(e) {
    if (dragging === null || e.pointerId !== activePointer) return;
    const dp = pieces.find(p => p.id === dragging);
    if (!dp) return;
    const v = getVirtualCoords(e.clientX, e.clientY);
    dragPos = { x: v.x, y: v.y };
    updateGhostStyle();
    const lift = virtualLiftY();
    proximityId = isWithinSnapZone(v.x, v.y - lift, dp, snapRadius)
      || isWithinSnapZone(v.x, v.y, dp, snapRadius) ? dp.id : null;
  }

  function handlePointerUp(e) {
    if (dragging === null || e.pointerId !== activePointer) return;

    if (soundsLoaded) stopDragLoop();
    const piece = pieces.find(p => p.id === dragging);
    proximityId = null;
    if (!piece) { dragging = null; activePointer = null; return; }

    // Toddler-friendly acceptance: visual (lifted) point or raw thumb anywhere
    // inside the piece's own expanded target zone counts as a snap.
    const lift = virtualLiftY();
    const vx = dragPos.x;
    const vy = dragPos.y - lift;
    const accepted = isWithinSnapZone(vx, vy, piece, snapRadius)
      || isWithinSnapZone(dragPos.x, dragPos.y, piece, snapRadius);

    if (accepted) {
      const tx = piece.targetX + piece.w / 2;
      const ty = piece.targetY + piece.h / 2;
      const farFromCenter = Math.hypot(vx - tx, vy - ty) > snapRadius;
      acceptPiece(piece, farFromCenter ? { x: vx, y: vy } : null);
    } else {
      trayQueue = [piece.id, ...trayQueue.filter(id => id !== piece.id)];
      missHintId = piece.id;
      clearTimeout(missTimer);
      missTimer = setTimeout(() => { missHintId = null; }, 1500);
    }

    dragging = null;
    activePointer = null;
    nudgeTarget = null;
    showNudge = false;
    resetIdleTimers();
    scheduleIdleNudge();
  }

  function centerBox(piece, cx, cy) {
    return {
      left: (cx - piece.w / 2 - piece.padding) / VIRTUAL_W * 100,
      top: (cy - piece.h / 2 - piece.padding) / VIRTUAL_H * 100,
      width: piece.boxW / VIRTUAL_W * 100,
      height: piece.boxH / VIRTUAL_H * 100,
    };
  }

  function acceptPiece(piece, fromPoint) {
    if (!fromPoint) { settlePiece(piece); return; }
    glidingPiece = piece.id;
    glideGo = false;
    glideBox = centerBox(piece, fromPoint.x, fromPoint.y);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      glideGo = true;
      glideBox = centerBox(piece, piece.targetX + piece.w / 2, piece.targetY + piece.h / 2);
    }));
    clearTimeout(glideTimer);
    glideTimer = setTimeout(() => settlePiece(piece), GLIDE_MS + 60);
  }

  function settlePiece(piece) {
    clearTimeout(glideTimer);
    glidingPiece = null;
    glideGo = false;
    placed = new Set([...placed, piece.id]);
    justPlacedId = piece.id;
    clearTimeout(popTimer);
    popTimer = setTimeout(() => { justPlacedId = null; }, 500);
    if (soundsLoaded) playSnap();
    vibrate(30);
    if (placed.size === pieces.length) startCelebration();
  }

  function startCelebration() {
    celebrating = true;
    if (soundsLoaded) playVictory();
    onWin();
    setTimeout(() => { showDone = true; celebrating = false; }, 2000);
  }

  function scheduleIdleNudge() {
    clearTimeout(idleTimer);
    if (placed.size >= pieces.length) return;
    idleTimer = setTimeout(fireIdleNudge, IDLE_MS);
  }

  function fireIdleNudge() {
    if (placed.size >= pieces.length || dragging !== null) { scheduleIdleNudge(); return; }
    const unplaced = pieces.filter(p => !placed.has(p.id));
    if (unplaced.length === 0) return;
    nudgeTarget = unplaced[Math.floor(Math.random() * unplaced.length)].id;
    showNudge = true;
    if (soundsLoaded) playNudge();
    clearTimeout(nudgeTimer);
    nudgeTimer = setTimeout(() => { showNudge = false; nudgeTarget = null; }, NUDGE_MS);
    idleTimer = setTimeout(fireIdleNudge, IDLE_MS + NUDGE_MS);
  }

  function resetIdleTimers() {
    clearTimeout(idleTimer);
    clearTimeout(nudgeTimer);
    nudgeTarget = null;
    showNudge = false;
  }

  function saveProgress() {
    if (placed.size > 0 && placed.size < pieces.length) {
      writeSave(buildSaveData(image.id, level, placed));
    }
  }

  init();

  onMount(async () => {
    await loadPuzzleSounds();
    soundsLoaded = true;
  });

  onDestroy(() => {
    resetIdleTimers();
    clearTimeout(missTimer);
    clearTimeout(popTimer);
    clearTimeout(glideTimer);
    stopDragLoop();
    saveProgress();
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

  <div class="gp-progress" aria-hidden="true">
    <div class="gp-progress-fill" style="width:{progress * 100}%"></div>
  </div>

  <div class="gp-board-wrap">
    <div class="gp-board" bind:this={boardEl}>

      <div class="gp-board-bg" style:background-image="url({image.file})"></div>
      {@html boardLinesHtml}

      {#each pieces as piece (piece.id)}
        {@const isPlaced = placed.has(piece.id)}
        {@const isDragged = dragging === piece.id}

        {#if isPlaced && !isDragged}
          <div class="gp-board-piece" class:gp-pop={justPlacedId === piece.id}
            style="left:{(piece.targetX - piece.padding) / VIRTUAL_W * 100}%;top:{(piece.targetY - piece.padding) / VIRTUAL_H * 100}%;width:{piece.boxW / VIRTUAL_W * 100}%;height:{piece.boxH / VIRTUAL_H * 100}%">
            {@html piece.html}
          </div>
        {/if}
      {/each}

      {#if proximityId !== null}
        {@const pp = pieces.find(p => p.id === proximityId)}
        {#if pp}
          <div class="gp-cell-highlight gp-proximity-glow"
            style="left:{pp.targetX / VIRTUAL_W * 100}%;top:{pp.targetY / VIRTUAL_H * 100}%;width:{pp.w / VIRTUAL_W * 100}%;height:{pp.h / VIRTUAL_H * 100}%"></div>
        {/if}
      {/if}

      {#if showNudge && nudgeTarget !== null}
        {@const np = pieces.find(p => p.id === nudgeTarget)}
        {#if np}
          <div class="gp-cell-highlight gp-nudge-target"
            style="left:{np.targetX / VIRTUAL_W * 100}%;top:{np.targetY / VIRTUAL_H * 100}%;width:{np.w / VIRTUAL_W * 100}%;height:{np.h / VIRTUAL_H * 100}%"></div>
        {/if}
      {/if}

      {#if missHintId}
        {@const mp = pieces.find(p => p.id === missHintId)}
        {#if mp}
          <div class="gp-cell-highlight gp-miss-hint"
            style="left:{mp.targetX / VIRTUAL_W * 100}%;top:{mp.targetY / VIRTUAL_H * 100}%;width:{mp.w / VIRTUAL_W * 100}%;height:{mp.h / VIRTUAL_H * 100}%"></div>
        {/if}
      {/if}

      {#if glidingPiece}
        {@const gp = pieces.find(p => p.id === glidingPiece)}
        {#if gp}
          <div class="gp-board-piece gp-glide-piece" class:gp-glide-go={glideGo}
            style="left:{glideBox.left}%;top:{glideBox.top}%;width:{glideBox.width}%;height:{glideBox.height}%">
            {@html gp.html}
          </div>
        {/if}
      {/if}

      {#if celebrating}<Confetti emoji />{/if}
    </div>
  </div>

  <div class="gp-tray">
    {#each trayPieces as piece, i (piece.id)}
      {@const isNudged = showNudge && nudgeTarget === piece.id}
      <div class="gp-tray-piece" class:gp-nudge-shake={isNudged}
        role="button" tabindex="-1" aria-label="{$_('puzzle')} {i + 1}"
        style="width:{piece.boxW / piece.boxH * 70}px;height:70px;flex-shrink:0"
        onpointerdown={(e) => handlePointerDown(e, piece.id)}
        in:fly={{ x: 80, duration: 260, easing: cubicOut }}>
        {@html piece.html}
      </div>
    {/each}
  </div>

  {#if dragging}
    {@const dp = pieces.find(p => p.id === dragging)}
    {#if dp}
      <div class="gp-drag-ghost" style="left:{ghostStyle.left}px;top:{ghostStyle.top}px;width:{ghostStyle.width}px;height:{ghostStyle.height}px">
        {@html dp.dragHtml}
      </div>
    {/if}
  {/if}

  {#if showDone}
    <WinOverlay title="🎉 {$_('puzzleDone')}" sound={false}>
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
  .gp-progress { width: calc(100% - 24px); height: 5px; margin: 0 auto; background: rgba(255,255,255,0.09); border-radius: 3px; overflow: hidden; position: relative; z-index: 1; flex-shrink: 0; }
  .gp-progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--gold)); border-radius: 3px; transition: width 0.35s ease; }
  .gp-board-wrap { flex: 1; display: flex; align-items: center; justify-content: center; width: 100%; padding: 8px; position: relative; z-index: 1; min-height: 0; }
  .gp-board { position: relative; width: min(100%, calc(100vh - 200px)); aspect-ratio: 4/3; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.15); background: #f0f0f0; }
  .gp-board-bg { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0.12; filter: grayscale(1); }
  .gp-board-piece { position: absolute; }
  .gp-cell-highlight { position: absolute; pointer-events: none; }
  .gp-miss-hint { border-radius: 4px; background: rgba(255,215,0,0.15); border: 2px dashed rgba(255,215,0,0.5); animation: gpMissPulse 0.6s ease-in-out 3; }
  @keyframes gpMissPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
  .gp-nudge-target { border-radius: 4px; background: rgba(94,234,212,0.10); border: 2px dashed rgba(94,234,212,0.6); animation: gpMissPulse 0.7s ease-in-out 4; }
  .gp-proximity-glow { border-radius: 8px; background: rgba(94,234,212,0.08); box-shadow: inset 0 0 18px rgba(94,234,212,0.45); animation: gpGlow 1s ease-in-out infinite; }
  @keyframes gpGlow { 0%,100% { opacity: 0.55; } 50% { opacity: 1; } }
  .gp-pop { animation: gpPop 0.45s ease-out; }
  @keyframes gpPop {
    0% { transform: scale(0.9); filter: drop-shadow(0 0 0 rgba(94,234,212,0)); }
    40% { transform: scale(1.08); filter: drop-shadow(0 0 14px rgba(94,234,212,0.9)); }
    100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(94,234,212,0)); }
  }
  .gp-glide-piece {
    z-index: 5;
    pointer-events: none;
  }
  .gp-glide-piece.gp-glide-go {
    transition: left 160ms cubic-bezier(0.22, 1, 0.36, 1), top 160ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .gp-drag-ghost { position: fixed; z-index: 100; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3)); transform: scale(1.12); transform-origin: center center; pointer-events: none; }
  .gp-tray { display: flex; gap: 6px; padding: 8px; padding-bottom: calc(8px + var(--safe-bottom)); flex-shrink: 0; min-height: 86px; align-items: center; justify-content: center; background: var(--panel-glass); backdrop-filter: blur(6px); border-top: 1px solid var(--panel-border); position: relative; z-index: 1; }
  .gp-tray-piece { cursor: grab; touch-action: none; flex-shrink: 0; }
  .gp-tray-piece:active { cursor: grabbing; }
  .gp-nudge-shake { animation: gpShake 0.4s ease-in-out 3; }
  @keyframes gpShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 50% { transform: translateX(4px); } }
</style>
