<script>
  import { onMount } from 'svelte';
  import { _ } from '$lib/stores/locale';
  import { settings } from '$lib/stores/settings';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import '$lib/trainers/fx.css';
  import HudPill from '$lib/components/ui/HudPill.svelte';
  import BigButton from '$lib/components/ui/BigButton.svelte';
  import Confetti from '$lib/components/Confetti.svelte';
  import { playTap, playMatch, playWin } from '$lib/sounds/audioManager.js';
  import { makePuzzle, isDifference } from '$lib/spot-difference/game.js';

  let puzzle = $state(null);
  let found = $state([]);
  let wrongCell = $state(-1);
  let sideShake = $state('');
  let solvedCount = $state(0);
  let complete = $state(false);

  let timers = [];

  function next(seedOffset = Date.now() % 100000) {
    for (const t of timers) clearTimeout(t);
    timers = [];
    puzzle = makePuzzle($settings.ageLevel, seedOffset);
    found = [];
    wrongCell = -1;
    complete = false;
  }

  function tap(index, side) {
    if (!puzzle || complete) return;
    if (isDifference(puzzle, index)) {
      if (found.includes(index)) return;
      found = [...found, index]; // reassigned ⇒ reliably reactive
      playTap();
      if (found.length === puzzle.diffCells.size) {
        complete = true;
        solvedCount += 1;
        playMatch();
        timers.push(setTimeout(() => playWin(), 350));
      }
    } else {
      wrongCell = index; // brief shake on the tapped cell — silent, no penalty
      sideShake = side;
      timers.push(setTimeout(() => { wrongCell = -1; sideShake = ''; }, 420));
    }
  }

  onMount(() => {
    next();
    return () => { for (const t of timers) clearTimeout(t); };
  });

  function cellState(index, side) {
    const isFound = found.includes(index);
    const isWrong = wrongCell === index && sideShake === side;
    return { isFound, isWrong };
  }
</script>

<GameShell accent="#7FD8FF">
  {#snippet hudLeft()}
    <HudPill icon="🔍" label={`${found.size}/${puzzle ? puzzle.diffCells.size : 0}`} />
    <HudPill icon="✅" label={String(solvedCount)} />
  {/snippet}

  <div class="spot" data-testid="spot-root">
    {#if puzzle}
      <p class="prompt">🔍 {$_('findDiffs')}</p>
      <div class="boards" data-testid="boards">
        {#each ['left', 'right'] as side}
          <div class="grid" style:--size="{puzzle.size}" data-testid="grid-{side}">
            {#each Array(puzzle.size * puzzle.size) as _, i}
              {@const emoji = side === 'left' ? puzzle.left[i] : puzzle.right[i]}
              {@const st = cellState(i, side)}
              <button
                class="cell"
                class:found={st.isFound}
                class:wrong={st.isWrong}
                class:diff-cell={st.isFound}
                onclick={() => tap(i, side)}
                data-testid={`${side}-${i}`}
              >
                <span class="emoji">{emoji}</span>
                {#if st.isFound}<span class="ring">💚</span>{/if}
              </button>
            {/each}
          </div>
        {/each}

        {#if complete}
          <div class="overlay" data-testid="complete-overlay">
            <Confetti />
            <p class="ov-title">🎉</p>
            <p class="solved-line">✅ {solvedCount}</p>
            <BigButton onclick={() => next((Date.now() + solvedCount * 13) % 100000)}>
              {$_('nextPuzzle')}
            </BigButton>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</GameShell>

<style>
  .spot {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: safe center;
    gap: 14px;
    padding: 10px;
    overflow-y: auto;
  }
  .prompt { font-size: 20px; font-weight: 700; color: var(--text-hi); margin: 0; }
  .boards {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: min(94vw, 380px);
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(var(--size), 1fr);
    gap: 5px;
    background: var(--panel-glass);
    border: 2px solid var(--panel-border);
    border-radius: 14px;
    padding: 8px;
  }
  .cell {
    position: relative;
    aspect-ratio: 1;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.1s, box-shadow 0.15s, opacity 0.3s;
  }
  .cell .emoji { font-size: clamp(18px, 6vw, 30px); line-height: 1; }
  .cell:active { transform: scale(0.93); }
  .cell.found { opacity: 0.45; pointer-events: none; }
  .cell.diff-cell .ring { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 22px; }
  .cell.wrong { animation: fxWobble 0.4s ease-in-out; }
  .overlay {
    position: absolute;
    inset: 0;
    z-index: 6;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: rgba(4, 8, 24, 0.85);
    backdrop-filter: blur(6px);
    border-radius: 16px;
  }
  .ov-title { font-size: 48px; margin: 0; }
  .solved-line { font-size: 26px; color: var(--gold); margin: 0; }
</style>
