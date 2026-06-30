<script>
  import { onMount, onDestroy } from 'svelte';
  import { _ } from '$lib/stores/locale';
  import { loadPuzzleSounds, playPickup, playSnap, playVictory, playNudge } from '$lib/sounds/puzzleSounds.js';
  import Confetti from '$lib/components/Confetti.svelte';
  import { PUZZLE_IMAGES, getCategories, DIFFICULTIES } from '$lib/glossary-puzzle/images.js';
  import { generatePieces, piecePath } from '$lib/glossary-puzzle/pieces.js';

  let view = $state('gallery');
  let selectedCategory = $state(null);
  let selectedImage = $state(null);
  let diffKey = $state('easy');
  let pieces = $state([]);
  let placed = $state(new Set());
  let rows = $state(2);
  let cols = $state(2);
  let dragging = $state(null);
  let dragPos = $state({ x: 0, y: 0 });
  let dragOffset = $state({ x: 0, y: 0 });
  let celebrating = $state(false);
  let showDone = $state(false);
  let trayPieces = $state([]);
  let trayIndex = $state(0);
  let idleTimer = $state(null);
  let nudgeTarget = $state(null);
  let showNudge = $state(false);
  let savedState = $state(null);
  let exitPressCount = $state(0);
  let exitTimer = $state(null);
  let boardSize = $state(300);
  let soundsLoaded = $state(false);

  let difficulty = $derived(DIFFICULTIES[diffKey]);

  const TRAY_SIZE = 4;
  const STORAGE_KEY = 'glossary-puzzle-save';

  const categories = getCategories();
  let filteredImages = $derived(
    selectedCategory ? PUZZLE_IMAGES.filter(i => i.category === selectedCategory) : PUZZLE_IMAGES
  );

  function startPuzzle(image, dk) {
    selectedImage = image;
    diffKey = dk;
    const result = generatePieces(image, difficulty);
    pieces = result.pieces;
    rows = result.rows;
    cols = result.cols;
    placed = new Set();
    trayIndex = 0;
    refillTray();
    view = 'play';
    startIdleTimer();
    savedState = null;
    celebrating = false;
    showDone = false;
  }

  function refillTray() {
    const unplaced = pieces.filter(p => !placed.has(p.id));
    const start = trayIndex * TRAY_SIZE;
    trayPieces = unplaced.slice(start, start + TRAY_SIZE);
  }

  function onPieceDragStart(e, pieceId) {
    if (placed.has(pieceId)) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = document.querySelector('.gp-tray-piece')?.getBoundingClientRect();
    const ox = rect ? clientX - rect.left : 0;
    const oy = rect ? clientY - rect.top : 0;
    dragging = pieceId;
    dragOffset = { x: ox, y: oy };
    dragPos = { x: clientX, y: clientY };
    resetIdleTimer();
    if (soundsLoaded) playPickup();
  }

  function onPieceDragMove(e) {
    if (!dragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragPos = { x: clientX, y: clientY };
  }

  function onPieceDragEnd(e) {
    if (!dragging) return;
    const piece = pieces.find(p => p.id === dragging);
    if (!piece) { dragging = null; return; }

    const board = document.querySelector('.gp-board');
    if (!board) { dragging = null; return; }

    const boardRect = board.getBoundingClientRect();
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

    const relX = clientX - boardRect.left;
    const relY = clientY - boardRect.top;
    const cellW = boardRect.width / cols;
    const cellH = boardRect.height / rows;

    const correctCol = piece.correctCol;
    const correctRow = piece.correctRow;
    const targetX = correctCol * cellW + cellW / 2;
    const targetY = correctRow * cellH + cellH / 2;
    const dist = Math.sqrt(
      Math.pow(relX - targetX, 2) + Math.pow(relY - targetY, 2)
    );

    if (dist <= difficulty.snapRadius && !placed.has(piece.id)) {
      placed = new Set([...placed, piece.id]);
      if (soundsLoaded) playSnap();
      if (placed.size === pieces.length) {
        celebrating = true;
        if (soundsLoaded) playVictory();
        setTimeout(() => { showDone = true; celebrating = false; }, 2000);
      }
      refillTray();
    }

    dragging = null;
    nudgeTarget = null;
    showNudge = false;
    startIdleTimer();
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
    const data = {
      imageId: selectedImage?.id,
      difficulty: diffKey,
      placedIds: [...placed],
    };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }

  function loadProgress() {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try { savedState = JSON.parse(raw); } catch {}
  }

  function resumeSaved() {
    if (!savedState) return;
    const img = PUZZLE_IMAGES.find(i => i.id === savedState.imageId);
    if (!img || !DIFFICULTIES[savedState.difficulty]) { savedState = null; return; }
    selectedImage = img;
    diffKey = savedState.difficulty;
    const result = generatePieces(img, DIFFICULTIES[savedState.difficulty]);
    pieces = result.pieces;
    rows = result.rows;
    cols = result.cols;
    placed = new Set(savedState.placedIds.filter(id => pieces.some(p => p.id === id)));
    trayIndex = 0;
    refillTray();
    view = 'play';
    savedState = null;
    startIdleTimer();
  }

  function exitPuzzle() {
    if (placed.size > 0) saveProgress();
    view = 'gallery';
    pieces = [];
    placed = new Set();
    resetIdleTimer();
  }

  function handleExitPress() {
    exitPressCount++;
    if (exitPressCount >= 3) {
      exitPuzzle();
      exitPressCount = 0;
      if (exitTimer) clearTimeout(exitTimer);
    } else {
      if (exitTimer) clearTimeout(exitTimer);
      exitTimer = setTimeout(() => { exitPressCount = 0; }, 3000);
    }
  }

  function imageWidth() { return cols * 100; }
  function imageHeight() { return rows * 100; }
  function imageX(col) { return -col * 100; }
  function imageY(row) { return -row * 100; }
  let clipId = $derived(0);

  onMount(async () => {
    await loadPuzzleSounds();
    soundsLoaded = true;
    loadProgress();
  });

  onDestroy(() => {
    resetIdleTimer();
    if (exitTimer) clearTimeout(exitTimer);
  });
</script>

{#if view === 'gallery'}
  <div class="gp-gallery">
    <h2 class="gp-gallery-title">🧩 {$_('puzzle')}</h2>

    {#if savedState}
      <button class="gp-resume-btn" onclick={resumeSaved}>▶ {$_('replay')}</button>
    {/if}

    <div class="gp-categories">
      {#each categories as cat}
        <button class="gp-cat-btn" class:active={selectedCategory === cat.key} onclick={() => selectedCategory = selectedCategory === cat.key ? null : cat.key}>
          <span class="gp-cat-icon">{cat.icon}</span>
          <span class="gp-cat-name">{cat.name}</span>
        </button>
      {/each}
    </div>

    <div class="gp-diff-select">
      {#each Object.entries(DIFFICULTIES) as [key, d]}
        <button class="gp-diff-btn" class:active={diffKey === key} onclick={() => diffKey = key}>{d.label}</button>
      {/each}
    </div>

    <div class="gp-image-grid">
      {#each filteredImages as img}
        <button class="gp-image-card" onclick={() => startPuzzle(img, diffKey)}>
          <div class="gp-thumb" style:background-image="url({img.file})"></div>
          <span class="gp-thumb-name">{img.name}</span>
        </button>
      {/each}
    </div>
  </div>

{:else if view === 'play'}
  <div class="gp-play">
    <div class="gp-top-bar">
      <button class="gp-exit-btn" onclick={handleExitPress}>← {$_('back')}</button>
      <span class="gp-progress">{placed.size}/{pieces.length}</span>
    </div>

    <div class="gp-board-wrap">
      <div class="gp-board" style:width="{boardSize}px" style:height="{boardSize}px"
        ontouchmove={onPieceDragMove} ontouchend={onPieceDragEnd}
        onmousemove={onPieceDragMove} onmouseup={onPieceDragEnd}>

        <div class="gp-board-bg" style:background-image="url({selectedImage.file})"></div>

        {#each Array(rows) as _, r}
          {#each Array(cols) as _, c}
            {@const piece = pieces.find(p => p.correctRow === r && p.correctCol === c)}
            {@const isPlaced = piece && placed.has(piece.id)}
            <div class="gp-board-cell" style:width="{boardSize / cols}px" style:height="{boardSize / rows}px"
              class:nudge-target={showNudge && piece?.id === nudgeTarget}>
              {#if isPlaced}
                <div class="gp-placed-wrap" style:clip-path="url(#pp-{r}-{c})">
                  <img src={selectedImage.file} class="gp-piece-img"
                    style:width="{boardSize}px"
                    style:height="{boardSize}px"
                    style:margin-left="{-(c * boardSize / cols)}px"
                    style:margin-top="{-(r * boardSize / rows)}px">
                </div>
                <svg width="0" height="0" style="position:absolute">
                  <defs>
                    <clipPath id="pp-{r}-{c}"><path d={piecePath(piece.edges, 100)} /></clipPath>
                  </defs>
                </svg>
              {/if}
            </div>
          {/each}
        {/each}
      </div>
    </div>

    <div class="gp-tray" ontouchstart={(e) => { if (!dragging) e.preventDefault(); }}>
      {#each trayPieces as piece (piece.id)}
        <div class="gp-tray-piece" style={dragging === piece.id ? 'visibility:hidden' : ''}
          class:nudge-target={showNudge && piece.id === nudgeTarget}
          ontouchstart={(e) => onPieceDragStart(e, piece.id)} onmousedown={(e) => onPieceDragStart(e, piece.id)}>
          <svg viewBox="0 0 100 100" class="gp-piece-shape">
            <defs>
              <clipPath id="tp-{piece.id}"><path d={piecePath(piece.edges, 100)} /></clipPath>
            </defs>
            <image href={selectedImage.file} width={imageWidth()} height={imageHeight()} x={imageX(piece.correctCol)} y={imageY(piece.correctRow)} clip-path="url(#tp-{piece.id})" />
            <path d={piecePath(piece.edges, 100)} fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1" />
          </svg>
        </div>
      {/each}
    </div>

    {#if dragging}
      {@const dp = pieces.find(p => p.id === dragging)}
      {#if dp}
        <div class="gp-drag-ghost" style="position:fixed;left:{dragPos.x - dragOffset.x}px;top:{dragPos.y - dragOffset.y}px;z-index:1000;pointer-events:none;transform:scale(1.12);filter:drop-shadow(0 4px 12px rgba(0,0,0,0.3));">
          <svg viewBox="0 0 100 100" width="70" height="70">
            <defs><clipPath id="dg-{dp.id}"><path d={piecePath(dp.edges, 100)} /></clipPath></defs>
            <image href={selectedImage.file} width={imageWidth()} height={imageHeight()} x={imageX(dp.correctCol)} y={imageY(dp.correctRow)} clip-path="url(#dg-{dp.id})" />
            <path d={piecePath(dp.edges, 100)} fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="1" />
          </svg>
        </div>
      {/if}
    {/if}

    {#if celebrating}<Confetti />{/if}

    {#if showDone}
      <div class="gp-celebration">
        <p class="gp-celebration-text">🎉 {$_('puzzleDone')}</p>
        <button class="gp-celebration-btn" onclick={() => { view = 'gallery'; }}>◀ {$_('back')}</button>
        <button class="gp-celebration-btn" onclick={() => startPuzzle(selectedImage, diffKey)}>🔄 {$_('playAgain')}</button>
      </div>
    {/if}
  </div>
{/if}

<style>
  .gp-gallery { display: flex; flex-direction: column; align-items: center; flex: 1; padding: 12px; gap: 12px; overflow-y: auto; }
  .gp-gallery-title { font-size: 24px; }
  .gp-resume-btn { padding: 10px 24px; background: #4caf50; color: white; border-radius: 20px; font-weight: 700; font-size: 16px; }
  .gp-categories { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
  .gp-cat-btn { display: flex; flex-direction: column; align-items: center; padding: 8px 16px; background: white; border-radius: 14px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
  .gp-cat-btn.active { box-shadow: 0 0 0 3px var(--color-primary); }
  .gp-cat-icon { font-size: 28px; }
  .gp-cat-name { font-size: 12px; font-weight: 600; color: #666; }
  .gp-diff-select { display: flex; gap: 6px; }
  .gp-diff-btn { padding: 6px 18px; border-radius: 12px; font-size: 13px; font-weight: 600; background: rgba(255,255,255,0.7); color: #999; }
  .gp-diff-btn.active { background: var(--color-primary); color: white; }
  .gp-image-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; max-width: 360px; }
  .gp-image-card { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px; background: white; border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; }
  .gp-thumb { width: 100%; aspect-ratio: 1; background-size: cover; background-position: center; border-radius: 8px; }
  .gp-thumb-name { font-size: 13px; font-weight: 600; color: #666; }

  .gp-play { display: flex; flex-direction: column; align-items: center; flex: 1; }
  .gp-top-bar { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 6px 12px; flex-shrink: 0; }
  .gp-exit-btn { font-size: 14px; font-weight: 600; color: #999; padding: 4px 8px; }
  .gp-progress { font-size: 16px; font-weight: 700; color: var(--color-primary); }
  .gp-board-wrap { flex: 1; display: flex; align-items: center; justify-content: center; width: 100%; padding: 8px; }
  .gp-board { position: relative; display: flex; flex-wrap: wrap; border-radius: 8px; overflow: hidden; max-width: 100%; max-height: 100%; }
  .gp-board-bg { position: absolute; inset: 0; background-size: cover; opacity: 0.12; filter: grayscale(1); }
  .gp-board-cell { position: relative; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(0,0,0,0.04); box-sizing: border-box; }
  .gp-board-cell.nudge-target { animation: gpNudge 0.5s ease-in-out 3; }
  @keyframes gpNudge { 0%,100% { box-shadow: 0 0 0 rgba(255,215,0,0); } 50% { box-shadow: 0 0 12px rgba(255,215,0,0.6); } }
  .gp-placed-wrap { position: absolute; inset: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; background: white; }
  .gp-piece-img { max-width: none; position: absolute; }
  .gp-tray { display: flex; gap: 8px; padding: 8px; padding-bottom: calc(8px + var(--safe-bottom)); flex-shrink: 0; min-height: 80px; justify-content: center; flex-wrap: wrap; }
  .gp-tray-piece { width: 64px; height: 64px; cursor: grab; touch-action: none; }
  .gp-tray-piece:active { transform: scale(1.05); }
  .gp-tray-piece.nudge-target { animation: gpShake 0.4s ease-in-out 3; }
  @keyframes gpShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
  .gp-piece-shape { width: 100%; height: 100%; }
  .gp-celebration { position: fixed; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.3); z-index: 50; gap: 16px; }
  .gp-celebration-text { font-size: 32px; color: white; font-weight: 700; text-shadow: 0 2px 8px rgba(0,0,0,0.3); }
  .gp-celebration-btn { padding: 12px 28px; background: white; border-radius: 24px; font-size: 16px; font-weight: 600; color: var(--color-primary); }
</style>
