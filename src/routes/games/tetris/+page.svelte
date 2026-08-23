<script>
  import { onMount, onDestroy } from 'svelte';
  import { _ } from '$lib/stores/locale';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import HudPill from '$lib/components/ui/HudPill.svelte';
  import BigButton from '$lib/components/ui/BigButton.svelte';
  import Confetti from '$lib/components/Confetti.svelte';
  import { playTap, playMatch } from '$lib/sounds/audioManager.js';
  import { playSlotChime, fanfare } from '$lib/sounds/trainerSounds.js';
  import { spawn, randomType } from '$lib/tetris/pieces.js';
  import {
    DIFFICULTIES,
    createBoard,
    stepInterval,
    collide,
    placePiece,
    rotatePiece,
    ghostY,
    clearLines,
    softDropScore,
    hardDropScore,
    bestPlacement,
    isGameOver,
    LINES_PER_LEVEL
  } from '$lib/tetris/engine.js';

  const ROWS = 20;
  const COLS = 10;

  let screen = $state('difficulty'); // difficulty | playing | paused | gameOver
  let difficulty = $state(
    (typeof localStorage !== 'undefined' && localStorage.getItem('tetris-difficulty')) || 'medium'
  );
  let board = $state(createBoard());
  let piece = $state(null);
  let held = $state(null);
  let holdUsed = $state(false);
  let hintCells = $state(null);
  let score = $state(0);
  let linesTotal = $state(0);
  let level = $state(1);
  let best = $state(0);
  let newBest = $state(false);
  let levelFlash = $state(false);

  let raf = null;
  let lastTs = 0;
  let acc = 0;
  let softDropping = false;
  let pointerId = null;
  let dragStartX = 0;
  let dragMoved = false;
  let dragDownTs = 0;
  let boardEl;

  const config = $derived(DIFFICULTIES[difficulty] ?? DIFFICULTIES.medium);
  const interval = $derived(stepInterval(level, difficulty));
  const ghostCells = $derived(
    screen === 'playing' && config.ghost && piece && !collide(board, piece, 0, 0)
      ? { y: ghostY(board, piece), cells: piece.cells, x: piece.x }
      : null
  );

  function bestKey() {
    return `tetris-best-${difficulty}`;
  }

  function loadBest() {
    best = parseInt(localStorage.getItem(bestKey()) || '0', 10) || 0;
    newBest = false;
  }

  function saveBest() {
    if (score > best) {
      best = score;
      localStorage.setItem(bestKey(), String(best));
      if (!newBest && score > 0) {
        newBest = true;
        fanfare(1.3);
      }
    }
  }

  function nextPiece() {
    const p = spawn(randomType(), Math.floor(COLS / 2) - 1, 0);
    if (isGameOver(board, p)) {
      finish();
      return null;
    }
    return p;
  }

  function startGame() {
    localStorage.setItem('tetris-difficulty', difficulty);
    loadBest();
    board = createBoard();
    score = 0;
    linesTotal = 0;
    level = 1;
    held = null;
    holdUsed = false;
    hintCells = null;
    newBest = false;
    piece = nextPiece();
    if (!piece) return;
    acc = 0;
    lastTs = 0;
    screen = 'playing';
  }

  function finish() {
    saveBest();
    piece = null;
    screen = 'gameOver';
  }

  function lockPiece() {
    playTap();
    placePiece(board, piece);
    piece = null;
    hintCells = null;
    holdUsed = false;

    const before = Math.floor(linesTotal / LINES_PER_LEVEL);
    const { lines, points } = clearLines(board, level);
    if (lines > 0) {
      score += points;
      linesTotal += lines;
      if (lines === 4) fanfare(1.0);
      else playMatch();
    }
    const after = Math.floor(linesTotal / LINES_PER_LEVEL);
    if (after > before) {
      level += after - before;
      playSlotChime();
      levelFlash = true;
      setTimeout(() => (levelFlash = false), 1000);
    }
    saveBest();
    if (screen === 'playing') piece = nextPiece();
  }

  function move(dx) {
    if (screen !== 'playing' || !piece || collide(board, piece, dx, 0)) return;
    piece = { ...piece, x: piece.x + dx };
    hintCells = null;
  }

  function rotate(dir) {
    if (screen !== 'playing' || !piece) return;
    const rotated = rotatePiece(board, piece, dir);
    if (rotated) {
      piece = rotated;
      hintCells = null;
    }
  }

  function hardDrop() {
    if (screen !== 'playing' || !piece) return;
    const gy = ghostY(board, piece);
    score += hardDropScore(Math.max(0, gy - piece.y));
    piece = { ...piece, y: gy };
    lockPiece();
  }

  function toggleHold() {
    if (screen !== 'playing' || !config.hold || holdUsed || !piece) return;
    const type = piece.type;
    if (held) {
      piece = { ...spawn(held, Math.floor(COLS / 2) - 1, 0) };
    } else {
      piece = nextPiece();
    }
    held = type;
    holdUsed = true;
    if (!piece) return;
  }

  function showHint() {
    if (screen !== 'playing' || !piece) return;
    const bestSpot = bestPlacement(board, piece);
    if (bestSpot) {
      hintCells = bestSpot;
      playTap();
      setTimeout(() => (hintCells = null), 1500);
    }
  }

  function frame(ts) {
    if (screen !== 'playing') return;
    if (!lastTs) lastTs = ts;
    const delta = ts - lastTs;
    lastTs = ts;
    const eff = softDropping ? Math.min(interval, 50) : interval;
    acc += delta;
    while (acc >= eff && screen === 'playing' && piece) {
      acc -= eff;
      if (!collide(board, piece, 0, 1)) {
        piece = { ...piece, y: piece.y + 1 };
        if (softDropping) score += softDropScore(1);
      } else {
        lockPiece();
        break;
      }
    }
    raf = requestAnimationFrame(frame);
  }

  function pauseGame() {
    if (screen === 'playing') screen = 'paused';
  }

  function resumeGame() {
    if (screen === 'paused') {
      screen = 'playing';
      lastTs = 0;
      acc = 0;
      raf = requestAnimationFrame(frame);
    }
  }

  // ---- touch controls -------------------------------------------------
  function boardDown(e) {
    if (pointerId !== null || screen !== 'playing') return;
    pointerId = e.pointerId;
    dragStartX = e.clientX;
    dragMoved = false;
    dragDownTs = Date.now();
  }

  function boardMove(e) {
    if (e.pointerId !== pointerId || screen !== 'playing') return;
    const cellPx = boardEl ? boardEl.clientWidth / COLS : 30;
    while (e.clientX - dragStartX > cellPx) {
      move(1);
      dragStartX += cellPx;
      dragMoved = true;
    }
    while (dragStartX - e.clientX > cellPx) {
      move(-1);
      dragStartX -= cellPx;
      dragMoved = true;
    }
  }

  function boardUp(e) {
    if (e.pointerId !== pointerId) return;
    pointerId = null;
    if (!dragMoved && Date.now() - dragDownTs < 300) rotate('cw'); // tap = rotate CW
  }

  function onKeyDown(e) {
    if (screen !== 'playing') return;
    if (e.key === 'ArrowLeft') move(-1);
    else if (e.key === 'ArrowRight') move(1);
    else if (e.key === 'ArrowUp') rotate('cw');
    else if (e.key === 'z' || e.key === 'Z') rotate('ccw');
    else if (e.key === 'ArrowDown') softDropping = true;
    else if (e.key === ' ') {
      e.preventDefault();
      hardDrop();
    }
  }

  function onKeyUp(e) {
    if (e.key === 'ArrowDown') softDropping = false;
  }

  function visibility() {
    if (document.hidden) pauseGame();
  }

  onMount(() => {
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (raf) cancelAnimationFrame(raf);
    };
  });

  // ---- rendering helpers ---------------------------------------------
  function buildCellMap() {
    const map = {};
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c]) map[`${r},${c}`] = { color: board[r][c], kind: 'locked' };
      }
    }
    if (piece && screen !== 'gameOver') {
      for (let r = 0; r < piece.cells.length; r++) {
        for (let c = 0; c < piece.cells[r].length; c++) {
          if (!piece.cells[r][c]) continue;
          const y = piece.y + r;
          const x = piece.x + c;
          if (y >= 0 && y < ROWS && x >= 0 && x < COLS) map[`${y},${x}`] = { color: piece.color ?? '#4FC3F7', kind: 'active' };
        }
      }
    }
    if (ghostCells) {
      for (let r = 0; r < ghostCells.cells.length; r++) {
        for (let c = 0; c < ghostCells.cells[r].length; c++) {
          if (!ghostCells.cells[r][c]) continue;
          const key = `${ghostCells.y + r},${ghostCells.x + c}`;
          if (!map[key]) map[key] = { kind: 'ghost' };
        }
      }
    }
    if (hintCells) {
      for (let r = 0; r < hintCells.cells.length; r++) {
        for (let c = 0; c < hintCells.cells[r].length; c++) {
          if (!hintCells.cells[r][c]) continue;
          const key = `${hintCells.y + r},${hintCells.x + c}`;
          const existing = map[key];
          if (!existing || existing.kind === 'ghost') map[key] = { kind: 'hint' };
        }
      }
    }
    return map;
  }

  const cellMap = $derived(buildCellMap());
</script>

<GameShell accent="#FFB74D">
  {#snippet hudLeft()}
    <HudPill icon="⭐" label={String(score)} />
    <HudPill icon="🧱" label={`${$_('level')} ${level}`} />
    <HudPill icon="🏆" label={String(best)} />
  {/snippet}

  <div class="tetris" data-testid="tetris-root">
    {#if screen === 'difficulty'}
      <div class="center-col">
        <h1 class="title">🧱 {$_('tetris')}</h1>
        {#each Object.keys(DIFFICULTIES) as d}
          <BigButton
            variant={d === difficulty ? 'primary' : 'ghost'}
            onclick={() => {
              difficulty = d;
              startGame();
            }}
          >
            {d === 'easy' ? '🌱 Easy' : d === 'medium' ? '⚡ Medium' : '🔥 Hard'}
            <span class="diff-note">
              {DIFFICULTIES[d].dropMs}ms · {DIFFICULTIES[d].ghost ? '👻' : ''}{DIFFICULTIES[d].hold ? '🎁' : ''}
            </span>
          </BigButton>
        {/each}
        <p class="best-line">🏆 {best}</p>
      </div>
    {:else}
      <div class="play-row">
        {#if config.hold}
          <div class="hold-box" data-testid="hold-box">
            <span class="hold-label">🎁</span>
            {#if held}<span class="hold-piece">{held}</span>{:else}<span class="hold-empty">·</span>{/if}
          </div>
        {/if}

        <div
          class="board {levelFlash ? 'flash' : ''}"
          bind:this={boardEl}
          data-testid="board"
          onpointerdown={boardDown}
          onpointermove={boardMove}
          onpointerup={boardUp}
          onpointercancel={boardUp}
        >
          {#if newBest}<Confetti />{/if}
          {#each Array(ROWS) as _, r}
            {#each Array(COLS) as __, c}
              {@const cell = cellMap[`${r},${c}`]}
              <div
                class="cell"
                class:hint-cell={cell?.kind === 'hint'}
                style:--cell-color={cell?.color ?? 'transparent'}
              >
                {#if cell && cell.kind !== 'ghost'}
                  <svg viewBox="0 0 10 10" class="block"><rect x="0.5" y="0.5" width="9" height="9" rx="2" fill={cell.color} stroke="rgba(255,255,255,.35)" stroke-width="0.6" /></svg>
                {:else if cell?.kind === 'ghost'}
                  <svg viewBox="0 0 10 10" class="block"><rect x="1" y="1" width="8" height="8" rx="2" fill="none" stroke="#7FD8FF" stroke-width="0.7" opacity="0.55" /></svg>
                {/if}
              </div>
            {/each}
          {/each}

          {#if screen === 'paused'}
            <div class="overlay" data-testid="pause-overlay">
              <p class="ov-title">⏸️</p>
              <BigButton onclick={resumeGame}>▶ {$_('play')}</BigButton>
              <BigButton variant="ghost" onclick={() => (screen = 'difficulty')}>{$_('back')}</BigButton>
            </div>
          {/if}

          {#if screen === 'gameOver'}
            <div class="overlay" data-testid="gameover-overlay">
              <p class="ov-title">🎉</p>
              <p class="score-line">⭐ {score}</p>
              <p class="best-line">🏆 {best}</p>
              <BigButton onclick={startGame}>{$_('replay')}</BigButton>
              <BigButton variant="ghost" onclick={() => (screen = 'difficulty')}>{$_('back')}</BigButton>
            </div>
          {/if}
        </div>

        <div class="controls" data-testid="controls">
          <button class="ctrl" aria-label="left" onclick={() => move(-1)}>◀</button>
          <button class="ctrl" aria-label="rotate ccw" onclick={() => rotate('ccw')}>⟲</button>
          <button class="ctrl big" aria-label="rotate cw" onclick={() => rotate('cw')}>⟳</button>
          <button class="ctrl" aria-label="right" onclick={() => move(1)}>▶</button>
          <button
            class="ctrl wide"
            aria-label="soft drop"
            onpointerdown={() => (softDropping = true)}
            onpointerup={() => (softDropping = false)}
            onpointerleave={() => (softDropping = false)}
          >▼</button>
          <button class="ctrl wide accent" aria-label="hard drop" onclick={hardDrop}>⤓</button>
          {#if config.hold}
            <button class="ctrl wide" aria-label="hold" onclick={toggleHold}>🎁</button>
          {/if}
          <button class="ctrl wide ghosty" aria-label="hint" onclick={showHint}>💡</button>
          <button class="ctrl wide ghosty" aria-label="pause" onclick={pauseGame}>⏸️</button>
        </div>
      </div>
    {/if}
  </div>
</GameShell>

<style>
  .tetris {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 8px;
    overflow: hidden;
  }
  .center-col {
    display: flex;
    flex-direction: column;
    gap: 14px;
    align-items: stretch;
    min-width: min(80vw, 320px);
  }
  .title {
    text-align: center;
    font-size: 30px;
    color: var(--gold);
    text-shadow: 0 0 14px var(--glow-gold);
  }
  .diff-note { font-size: 12px; opacity: 0.75; margin-left: 6px; }
  .best-line { text-align: center; color: var(--text-lo); font-size: 16px; margin: 0; }
  .play-row {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 100%;
    height: 100%;
    max-height: 100%;
  }
  .hold-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 6px;
    padding: 10px 8px;
    border-radius: 16px;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
  }
  .hold-label { font-size: 18px; }
  .hold-piece { font-size: 22px; }
  .hold-empty { opacity: 0.4; }
  .board {
    position: relative;
    aspect-ratio: 10 / 20;
    height: min(52vh, 460px);
    max-width: 92vw;
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    grid-template-rows: repeat(20, 1fr);
    gap: 1px;
    padding: 4px;
    border-radius: 12px;
    background: rgba(4, 10, 26, 0.65);
    border: 2px solid var(--panel-border);
    touch-action: none;
    user-select: none;
  }
  .board.flash { animation: lvlFlash 1s ease-out; }
  @keyframes lvlFlash {
    0%, 100% { box-shadow: none; }
    40% { box-shadow: 0 0 34px 8px var(--glow-gold); border-color: var(--gold); }
  }
  .cell { position: relative; }
  .block { position: absolute; inset: 0; width: 100%; height: 100%; }
  .hint-cell { background: rgba(127, 216, 255, 0.28); border-radius: 3px; animation: glowPulse 0.8s ease-in-out infinite; }
  .overlay {
    position: absolute;
    inset: 0;
    z-index: 5;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: rgba(4, 8, 24, 0.82);
    backdrop-filter: blur(6px);
    border-radius: 12px;
  }
  .ov-title { font-size: 44px; margin: 0; }
  .score-line { font-size: 34px; font-weight: 700; color: var(--gold); margin: 0; }
  .controls {
    display: grid;
    grid-template-columns: repeat(5, minmax(58px, 1fr));
    gap: 8px;
    width: min(94vw, 420px);
    padding-bottom: calc(8px + var(--safe-bottom));
  }
  .ctrl {
    min-height: calc(var(--touch-min) * 1.05);
    border-radius: 18px;
    font-size: 22px;
    color: #062033;
    background: var(--btn-gradient);
    box-shadow: 0 4px 14px rgba(91, 194, 240, 0.4);
    transition: transform 0.12s;
  }
  .ctrl:active { transform: scale(0.92); }
  .ctrl.wide { grid-column: span 2; }
  @media (min-width: 700px) and (orientation: landscape) {
    .play-row { flex-direction: row; }
    .board { height: min(88%, 78vh); }
    .controls { grid-template-columns: repeat(2, minmax(56px, 72px)); width: auto; align-content: start; padding-bottom: 0; }
  }
  .ctrl.accent { background: linear-gradient(135deg, #FFD54F, #FFB74D); }
  .ctrl.ghosty { color: var(--text-lo); background: var(--panel-glass); border: 1px solid var(--panel-border); box-shadow: none; }
</style>
