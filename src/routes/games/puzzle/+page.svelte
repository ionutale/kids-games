<script>
  import { settings } from '$lib/stores/settings';
  import { _ } from '$lib/stores/locale';
  import { playTap, playMatch, playWin } from '$lib/sounds/audioManager';
  import Confetti from '$lib/components/Confetti.svelte';

  const emojiSets = {
    2: [['🐶','🐱'],['🐻','🐸']],
    3: [['🐶','🐱','🐰'],['🐻','🐸','🐵'],['🦊','🐯','🐭']],
    4: [['🐶','🐱','🐰','🐻'],['🐸','🐵','🦊','🐯'],['🐭','🐼','🐨','🦁'],['🐮','🦊','🐸','🐰']],
    5: [['🐶','🐱','🐰','🐻','🐸'],['🐵','🦊','🐯','🐭','🐼'],['🐨','🦁','🐮','🐷','🐸'],['🐰','🐱','🐶','🐯','🦊'],['🐻','🐵','🐼','🐨','🦁']],
  };

  let level = $state(1);
  let pieces = $state([]);
  let won = $state(false);
  let dragging = $state(null);
  let placed = $state(new Set());

  function levelConfig(l) {
    if (l <= 2) return { size: 2, tiles: 4 };
    if (l <= 5) return { size: 3, tiles: 9 };
    if (l <= 8) return { size: 4, tiles: 16 };
    return { size: 5, tiles: 25 };
  }

  let size = $derived(levelConfig(level).size);

  function initGame() {
    const cfg = levelConfig(level);
    const grid = emojiSets[cfg.size];
    if (!grid) return;
    const result = [];
    let id = 0;
    for (let r = 0; r < cfg.size; r++) {
      for (let c = 0; c < cfg.size; c++) {
        result.push({ id, correctRow: r, correctCol: c, emoji: grid[r][c], placed: false });
        id++;
      }
    }
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    pieces = result;
    placed = new Set();
    won = false;
  }

  function startDrag(id) {
    if (won || placed.has(id)) return;
    dragging = id;
    if ($settings.soundEnabled) playTap();
  }

  function dropOnCell(correctRow, correctCol) {
    if (dragging === null) return;
    const piece = pieces.find(p => p.id === dragging);
    if (!piece) { dragging = null; return; }
    if (piece.correctRow === correctRow && piece.correctCol === correctCol && !placed.has(dragging)) {
      placed = new Set([...placed, dragging]);
      if ($settings.soundEnabled) playMatch();
      if (placed.size === pieces.length) {
        setTimeout(() => { won = true; if ($settings.soundEnabled) playWin(); }, 300);
      }
    }
    dragging = null;
  }

  function setLevel(l) {
    level = l;
    initGame();
  }

  initGame();
</script>

<div class="puzzle-game">
  <div class="level-bar">
    {#each Array(10) as _, i}
      <button class="lvl-btn" class:active={level === i + 1} onclick={() => setLevel(i + 1)}>{i + 1}</button>
    {/each}
  </div>

  <div class="board" style:grid-template-columns="repeat({size}, 1fr)">
    {#each Array(size) as _, r}
      {#each Array(size) as _, c}
        <button
          class="ghost-cell"
          class:small={size >= 4}
          class:drag-over={dragging !== null && pieces.find(p => p.id === dragging)?.correctRow === r && pieces.find(p => p.id === dragging)?.correctCol === c}
          onclick={() => dropOnCell(r, c)}
        >
          <span class="ghost-emoji" class:small={size >= 4}>{emojiSets[size][r][c]}</span>
          {#each pieces.filter(p => p.correctRow === r && p.correctCol === c && placed.has(p.id)) as placedPiece}
            <span class="placed-piece" class:small={size >= 4}>{placedPiece.emoji}</span>
          {/each}
        </button>
      {/each}
    {/each}
  </div>

  <div class="tray">
    {#each pieces as piece (piece.id)}
      {#if !placed.has(piece.id)}
        <button
          class="tray-piece"
          class:dragging={dragging === piece.id}
          class:small={size >= 4}
          onclick={() => startDrag(piece.id)}
        >
          {piece.emoji}
        </button>
      {/if}
    {/each}
  </div>

  {#if dragging !== null}
    <div class="drag-hint">{$_('tapItem')}</div>
  {/if}

  {#if won}
    <Confetti />
    <div class="win-overlay">
      <p class="win-text">{$_('puzzleDone')}</p>
      <button class="replay-btn" onclick={initGame}>{$_('newPuzzle')}</button>
    </div>
  {/if}
</div>

<style>
  .puzzle-game { display: flex; flex-direction: column; align-items: center; flex: 1; padding: 8px; gap: 8px; }
  .level-bar { display: flex; gap: 3px; }
  .lvl-btn { width: 30px; height: 28px; border-radius: 6px; font-size: 11px; font-weight: 600; color: #999; background: rgba(255,255,255,0.6); }
  .lvl-btn.active { color: white; background: var(--color-primary); }
  .board { display: grid; gap: 4px; width: 100%; max-width: 300px; aspect-ratio: 1; }
  .ghost-cell { position: relative; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.04); border-radius: 10px; border: 2px dashed #ccc; transition: all 0.15s; }
  .ghost-cell.drag-over { border-color: #66bb6a; background: rgba(102, 187, 106, 0.1); transform: scale(1.03); }
  .ghost-emoji { font-size: 42px; opacity: 0.2; filter: grayscale(1); }
  .ghost-emoji.small { font-size: 28px; }
  .placed-piece { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 38px; animation: popIn 0.3s ease-out; }
  .placed-piece.small { font-size: 26px; }
  @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
  .tray { display: flex; justify-content: center; gap: 6px; flex-wrap: wrap; padding: 8px; background: rgba(255,255,255,0.8); border-radius: 14px; width: 100%; max-width: 300px; min-height: 50px; }
  .tray-piece { font-size: 32px; width: 48px; height: 48px; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.12); transition: transform 0.15s; }
  .tray-piece.small { font-size: 24px; width: 40px; height: 40px; }
  .tray-piece:active { transform: scale(1.15); }
  .tray-piece.dragging { transform: scale(1.2); box-shadow: 0 4px 16px rgba(0,0,0,0.2); }
  .drag-hint { font-size: 14px; color: #999; font-weight: 600; }
  .win-overlay { position: fixed; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.3); z-index: 50; gap: 16px; }
  .win-text { font-size: 36px; color: white; font-weight: 700; text-shadow: 0 2px 8px rgba(0,0,0,0.3); }
  .replay-btn { padding: 14px 32px; background: white; border-radius: 24px; font-size: 18px; font-weight: 600; color: var(--color-primary); }
</style>
