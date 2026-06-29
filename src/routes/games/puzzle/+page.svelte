<script>
  import { settings } from '$lib/stores/settings';
  import { playTap, playMatch, playWin } from '$lib/sounds/audioManager';
  import Confetti from '$lib/components/Confetti.svelte';

  const images = [
    { id: 1, colors: ['#FF6B6B', '#4FC3F7', '#FFD54F'], name: 'Sun' },
    { id: 2, colors: ['#81C784', '#BA68C8', '#FF8A65'], name: 'Flower' },
    { id: 3, colors: ['#4FC3F7', '#E57373', '#FFD54F'], name: 'Star' },
  ];

  let pieces = $state([]);
  let won = $state(false);

  function initGame() {
    const img = images[Math.floor(Math.random() * images.length)];
    const count = $settings.ageLevel <= 2 ? 2 : $settings.ageLevel <= 3 ? 4 : $settings.ageLevel <= 4 ? 6 : 8;
    const cols = count <= 2 ? 2 : count <= 4 ? 2 : 3;
    const rows = Math.ceil(count / cols);

    const result = [];
    let id = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols && id < count; c++) {
        result.push({
          id,
          correctRow: r,
          correctCol: c,
          row: r,
          col: c,
          color: img.colors[(r * cols + c) % img.colors.length],
          placed: false
        });
        id++;
      }
    }

    const positions = [];
    for (let i = 0; i < count; i++) {
      positions.push({ row: result[i].correctRow, col: result[i].correctCol });
    }
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    for (let i = 0; i < count; i++) {
      result[i].row = positions[i].row;
      result[i].col = positions[i].col;
    }

    pieces = result;
    won = false;
  }

  function placePiece(piece) {
    if (piece.placed) return;
    if (piece.row === piece.correctRow && piece.col === piece.correctCol) {
      pieces = pieces.map(p => p.id === piece.id ? { ...p, placed: true } : p);
      if ($settings.soundEnabled) playMatch();
      if (pieces.every(p => p.placed)) {
        setTimeout(() => { won = true; if ($settings.soundEnabled) playWin(); }, 300);
      }
    } else {
      const neighbor = pieces.find(p =>
        p.row === piece.correctRow && p.col === piece.correctCol && !p.placed && p.id !== piece.id
      );
      if (neighbor) {
        pieces = pieces.map(p => {
          if (p.id === piece.id) return { ...p, row: neighbor.row, col: neighbor.col };
          if (p.id === neighbor.id) return { ...neighbor, row: piece.row, col: piece.col };
          return p;
        });
        if ($settings.soundEnabled) playTap();
      }
    }
  }

  let gridCols = $derived($settings.ageLevel <= 2 ? 2 : $settings.ageLevel <= 4 ? 2 : 3);

  initGame();
</script>

<div class="puzzle-game">
  <div class="puzzle-grid" style:grid-template-columns="repeat({gridCols}, 1fr)">
    {#each pieces as piece (piece.id)}
      <button
        class="piece"
        class:placed={piece.placed}
        style:background={piece.color}
        style:grid-row="{piece.row + 1}"
        style:grid-column="{piece.col + 1}"
        onclick={() => placePiece(piece)}
      >
        {piece.placed ? '' : '?'}
      </button>
    {/each}
  </div>

  {#if won}
    <Confetti />
    <div class="win-overlay">
      <p class="win-text">Puzzle done!</p>
      <button class="replay-btn" onclick={initGame}>New Puzzle</button>
    </div>
  {/if}
</div>

<style>
  .puzzle-game {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 24px;
  }
  .puzzle-grid {
    display: grid;
    gap: 6px;
    width: 100%;
    max-width: 300px;
    aspect-ratio: 1;
  }
  .piece {
    border-radius: 12px;
    font-size: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    text-shadow: 0 1px 3px rgba(0,0,0,0.2);
    transition: opacity 0.2s, transform 0.15s;
  }
  .piece:active { transform: scale(0.92); }
  .piece.placed { opacity: 0.7; cursor: default; }
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
