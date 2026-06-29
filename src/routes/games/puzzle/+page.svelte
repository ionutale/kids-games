<script>
  import { settings } from '$lib/stores/settings';
  import { _ } from '$lib/stores/locale';
  import { playTap, playMatch, playWin } from '$lib/sounds/audioManager';
  import Confetti from '$lib/components/Confetti.svelte';

  const PUZZLE_SIZE = 3;

  const emojiGrid = [
    ['🐶', '🐱', '🐰'],
    ['🐻', '🐸', '🐵'],
    ['🦊', '🐯', '🐭'],
  ];

  let pieces = $state([]);
  let won = $state(false);
  let dragging = $state(null);
  let dragOffset = $state({ x: 0, y: 0 });

  function initGame() {
    const result = [];
    let id = 0;
    for (let r = 0; r < PUZZLE_SIZE; r++) {
      for (let c = 0; c < PUZZLE_SIZE; c++) {
        result.push({ id, correctRow: r, correctCol: c, row: r, col: c, emoji: emojiGrid[r][c], placed: false });
        id++;
      }
    }

    const positions = [];
    for (let i = 0; i < result.length; i++) {
      positions.push({ row: result[i].row, col: result[i].col });
    }
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    for (let i = 0; i < result.length; i++) {
      result[i].row = positions[i].row;
      result[i].col = positions[i].col;
    }

    pieces = result;
    won = false;
  }

  function startDrag(e, id) {
    if (won) return;
    const rect = document.querySelector('.puzzle-board').getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const piece = pieces.find(p => p.id === id);
    if (!piece || piece.placed) return;

    const cellW = rect.width / PUZZLE_SIZE;
    const cellH = rect.height / PUZZLE_SIZE;
    dragOffset = {
      x: clientX - (piece.col * cellW + cellW / 2),
      y: clientY - (piece.row * cellH + cellH / 2) + rect.top
    };
    dragging = id;
    if ($settings.soundEnabled) playTap();
  }

  function moveDrag(e) {
    if (dragging === null) return;
    e.preventDefault();
  }

  function endDrag(e) {
    if (dragging === null) return;
    const rect = document.querySelector('.puzzle-board').getBoundingClientRect();
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    const cellW = rect.width / PUZZLE_SIZE;
    const cellH = rect.height / PUZZLE_SIZE;

    const dropCol = Math.floor((clientX - rect.left) / cellW);
    const dropRow = Math.floor((clientY - rect.top) / cellH);
    const piece = pieces.find(p => p.id === dragging);

    if (piece && dropRow >= 0 && dropRow < PUZZLE_SIZE && dropCol >= 0 && dropCol < PUZZLE_SIZE) {
      if (dropRow === piece.correctRow && dropCol === piece.correctCol && piece.row === dropRow && piece.col === dropCol) {
        pieces = pieces.map(p => p.id === dragging ? { ...p, placed: true } : p);
        if ($settings.soundEnabled) playMatch();
        if (pieces.every(p => p.placed)) {
          setTimeout(() => { won = true; if ($settings.soundEnabled) playWin(); }, 300);
        }
      } else if (!pieces.find(p => p.row === dropRow && p.col === dropCol && !p.placed)) {
        const target = pieces.find(p => p.row === dropRow && p.col === dropCol && p.placed);
        if (!target) {
          pieces = pieces.map(p => {
            if (p.id === dragging) return { ...p, row: dropRow, col: dropCol };
            if (p.row === dropRow && p.col === dropCol && !p.placed) return { ...p, row: piece.row, col: piece.col };
            return p;
          });
          const moved = pieces.find(p => p.id === dragging);
          if (moved.row === moved.correctRow && moved.col === moved.correctCol) {
            pieces = pieces.map(p => p.id === dragging ? { ...p, placed: true } : p);
            if ($settings.soundEnabled) playMatch();
            if (pieces.every(p => p.placed)) {
              setTimeout(() => { won = true; if ($settings.soundEnabled) playWin(); }, 300);
            }
          } else if ($settings.soundEnabled) playTap();
        }
      }
    }

    dragging = null;
  }

  initGame();
</script>

<div class="puzzle-game">
  <div
    class="puzzle-board"
    ontouchmove={moveDrag}
    ontouchend={endDrag}
    onmousemove={moveDrag}
    onmouseup={endDrag}
    onmouseleave={() => dragging = null}
  >
    <div class="bg-grid">
      {#each Array(PUZZLE_SIZE) as _, r}
        {#each Array(PUZZLE_SIZE) as _, c}
          <div class="bg-cell" style:grid-row="{r + 1}" style:grid-column="{c + 1}">
            <span class="bg-emoji">{emojiGrid[r][c]}</span>
          </div>
        {/each}
      {/each}
    </div>

    {#each pieces as piece (piece.id)}
      {#if !piece.placed}
        <div
          class="piece"
          class:dragging={dragging === piece.id}
          style:grid-row="{piece.row + 1}"
          style:grid-column="{piece.col + 1}"
          style:z-index="{dragging === piece.id ? 10 : 1}"
          ontouchstart={(e) => startDrag(e, piece.id)}
          onmousedown={(e) => startDrag(e, piece.id)}
        >
          <span class="piece-emoji">{piece.emoji}</span>
        </div>
      {/if}
    {/each}
  </div>

  {#if won}
    <Confetti />
    <div class="win-overlay">
      <p class="win-text">{$_('puzzleDone')}</p>
      <button class="replay-btn" onclick={initGame}>{$_('newPuzzle')}</button>
    </div>
  {/if}
</div>

<style>
  .puzzle-game {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    padding: 16px;
  }
  .puzzle-board {
    position: relative;
    width: 100%;
    max-width: 320px;
    aspect-ratio: 1;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 4px;
    touch-action: none;
    user-select: none;
  }
  .bg-grid {
    display: contents;
  }
  .bg-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.04);
    border-radius: 12px;
    border: 2px dashed #ccc;
  }
  .bg-emoji {
    font-size: 48px;
    opacity: 0.3;
    filter: grayscale(1);
  }
  .piece {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    cursor: grab;
    transition: box-shadow 0.15s;
  }
  .piece:active { cursor: grabbing; }
  .piece.dragging {
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    transform: scale(1.08);
    z-index: 10;
  }
  .piece-emoji {
    font-size: 44px;
    pointer-events: none;
  }
  .win-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.3);
    z-index: 50;
    gap: 16px;
  }
  .win-text {
    font-size: 36px;
    color: white;
    font-weight: 700;
    text-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }
  .replay-btn {
    padding: 14px 32px;
    background: white;
    border-radius: 24px;
    font-size: 18px;
    font-weight: 600;
    color: var(--color-primary);
  }
</style>
