<script>
  import { onMount } from 'svelte';
  import { _ } from '$lib/stores/locale';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import '$lib/trainers/fx.css';
  import HudPill from '$lib/components/ui/HudPill.svelte';
  import BigButton from '$lib/components/ui/BigButton.svelte';
  import Confetti from '$lib/components/Confetti.svelte';
  import { playTap, playMatch, playWin } from '$lib/sounds/audioManager.js';
  import { generatePuzzle, validatePath, hintCell, levelSpec } from '$lib/path-builder/engine.js';

  const PUZZLES_PER_LEVEL = 5;

  let level = $state(
    (typeof localStorage !== 'undefined' && parseInt(localStorage.getItem('path-builder-level') || '1', 10)) || 1
  );
  let puzzleNum = $state(1); // 1..5 within the level
  let puzzle = $state(null);
  let path = $state([]);
  let hint = $state(null);
  let solvedTotal = $state(0);
  let complete = $state(false); // puzzle solved
  let levelDone = $state(false);

  let timers = [];
  function clearTimers() {
    for (const t of timers) clearTimeout(t);
    timers = [];
  }

  function newPuzzle(seedOffset = Date.now() % 100000) {
    clearTimers();
    puzzle = generatePuzzle(level, seedOffset + puzzleNum * 977);
    path = [];
    hint = null;
    complete = false;
    levelDone = false;
  }

  function tapCell(r, c) {
    if (!puzzle || complete) return;
    const cell = { r, c };

    // undo: tapping a path cell truncates back to (excluding) it
    const idx = path.findIndex((p) => p.r === r && p.c === c);
    if (idx !== -1 && idx !== 0) {
      path = path.slice(0, idx);
      playTap();
      hint = null;
      return;
    }
    if (idx === 0) return; // start cell is permanent

    // only allow extending from the current tip
    const tip = path.length > 0 ? path[path.length - 1] : puzzle.start;
    const adjacent = Math.abs(cell.r - tip.r) + Math.abs(cell.c - tip.c) === 1;
    if (!adjacent) {
      hint = null;
      return; // ignore far taps silently — kid taps next to the tip
    }
    if (puzzle.grid[r][c] === 'obstacle') return; // obstacle: silent reject

    const candidate = [...path, cell];
    const verdict = validatePath(puzzle, candidate);
    if (verdict === 'invalid') return;

    path = candidate;
    playTap();
    hint = null;

    if (verdict === 'complete') {
      complete = true;
      solvedTotal += 1;
      playMatch();
      timers.push(setTimeout(() => {
        if (puzzleNum >= PUZZLES_PER_LEVEL) {
          levelDone = true;
          level += 1;
          localStorage.setItem('path-builder-level', String(level));
          playWin();
          timers.push(setTimeout(() => {
            puzzleNum = 1;
            newPuzzle();
          }, 2200));
        } else {
          puzzleNum += 1;
          timers.push(setTimeout(() => newPuzzle(), 1400));
        }
      }, 900));
    }
  }

  function showHint() {
    if (!puzzle || complete) return;
    hint = hintCell(puzzle, path);
    if (hint) {
      playTap();
      timers.push(setTimeout(() => (hint = null), 1600));
    }
  }

  function restartPuzzle() {
    path = [];
    hint = null;
    complete = false;
  }

  onMount(() => {
    newPuzzle();
    return clearTimers;
  });

  function cellContent(r, c) {
    if (puzzle.start.r === r && puzzle.start.c === c) return '🚩';
    if (puzzle.goal.r === r && puzzle.goal.c === c) return '🏁';
    if (puzzle.grid[r][c] === 'obstacle') return '🧱';
    const onPath = path.findIndex((p) => p.r === r && p.c === c);
    if (onPath !== -1) return '🔵';
    if (hint && hint.r === r && hint.c === c) return '💡';
    return '';
  }
</script>

<GameShell accent="#FDBA74">
  {#snippet hudLeft()}
    <HudPill icon="🚩" label={`${$_('level')} ${level}`} />
    <HudPill icon="🧩" label={`${puzzleNum}/5`} />
    <HudPill icon="✅" label={String(solvedTotal)} />
  {/snippet}

  <div class="pb" data-testid="pb-root">
    <p class="prompt">🚩 → 🏁</p>
    <div class="stage">
      {#if puzzle}
        <div
          class="grid"
          style:--size="{puzzle.size}"
          data-testid="grid"
        >
          {#each Array(puzzle.size) as _, r}
            {#each Array(puzzle.size) as __, c}
              {@const content = cellContent(r, c)}
              <button
                class="cell"
                class:path-cell={content === '🔵'}
                class:obstacle={puzzle.grid[r][c] === 'obstacle'}
                onclick={() => tapCell(r, c)}
                data-testid={`cell-${r}-${c}`}
              >
                {content}
              </button>
            {/each}
          {/each}
        </div>
      {/if}

      {#if complete}
        <Confetti />
      {/if}

      {#if levelDone}
        <div class="overlay" data-testid="level-overlay">
          <p class="ov-title">🏆</p>
          <p class="done-line">{$_('level')} {level - 1} ✓</p>
        </div>
      {/if}
    </div>

    <div class="actions">
      <button class="act ghosty" onclick={restartPuzzle}>↺</button>
      <BigButton variant="ghost" onclick={showHint}>💡 {$_('hint')}</BigButton>
    </div>
  </div>
</GameShell>

<style>
  .pb {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 10px;
    overflow-y: auto;
  }
  .prompt { font-size: 24px; margin: 0; letter-spacing: 4px; }
  .stage { position: relative; }
  .grid {
    display: grid;
    grid-template-columns: repeat(var(--size), minmax(56px, 76px));
    gap: 6px;
    background: var(--panel-glass);
    border: 2px solid var(--panel-border);
    border-radius: 18px;
    padding: 10px;
  }
  .cell {
    aspect-ratio: 1;
    border-radius: 12px;
    font-size: clamp(20px, 7vw, 30px);
    line-height: 1;
    background: rgba(255, 255, 255, 0.05);
    transition: transform 0.1s, background 0.15s;
  }
  .cell:active { transform: scale(0.92); }
  .cell.path-cell { background: rgba(127, 216, 255, 0.35); box-shadow: inset 0 0 10px rgba(127, 216, 255, 0.5); }
  .cell.obstacle { background: rgba(255, 155, 155, 0.12); }
  .overlay {
    position: absolute; inset: -8px; z-index: 6;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
    background: rgba(4, 8, 24, 0.85); backdrop-filter: blur(6px); border-radius: 18px;
  }
  .ov-title { font-size: 52px; margin: 0; }
  .done-line { font-size: 26px; color: var(--gold); margin: 0; }
  .actions { display: flex; align-items: center; gap: 14px; }
  .act {
    width: calc(var(--touch-min) * 1.2);
    height: calc(var(--touch-min) * 1.2);
    border-radius: 18px;
    font-size: 22px;
    color: var(--text-lo);
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
  }
  .act:active { transform: scale(0.94); }
</style>
