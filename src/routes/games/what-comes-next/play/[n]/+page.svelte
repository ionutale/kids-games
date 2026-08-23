<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { _ } from '$lib/stores/locale';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import HudPill from '$lib/components/ui/HudPill.svelte';
  import WinOverlay from '$lib/components/ui/WinOverlay.svelte';
  import '$lib/trainers/fx.css';

  import { makePrompt, roundGoal } from '$lib/trainers/whatComesNext.js';
  import { startTrainerMusic, stopTrainerMusic } from '$lib/sounds/trainerMusic.js';
  import { playPop } from '$lib/sounds/audioManager.js';
  import { playSlotChime, fanfare } from '$lib/sounds/trainerSounds.js';

  let { data } = $props();
  const level = data.level;
  const goal = roundGoal(level);
  const FANFARE_PITCH = 1.2;

  let solved = $state(0);
  let won = $state(false);
  let prompt = $state(null);
  let chosen = $state(-1);
  let filled = $state(false);
  let timers = [];

  function clearTimers() {
    for (const t of timers) clearTimeout(t);
    timers = [];
  }

  function nextPrompt() {
    clearTimers();
    prompt = makePrompt(level, (data.seed + solved * 6007) % 100000000);
    chosen = -1;
    filled = false;
  }

  function answer(idx) {
    if (!prompt || filled || won) return;
    if (idx !== prompt.correctIndex) {
      chosen = idx; // silent wobble
      timers.push(setTimeout(() => (chosen = -1), 320));
      return;
    }
    playPop();
    filled = true; // ❓ fills with the chosen emoji + chime
    playSlotChime();
    solved += 1;
    if (solved >= goal) {
      timers.push(setTimeout(() => (won = true), 700));
    } else {
      timers.push(setTimeout(nextPrompt, 500));
    }
  }

  function nextLevel(e) {
    e.preventDefault();
    fanfare(FANFARE_PITCH);
    goto(`/games/what-comes-next/play/${level + 1}`);
  }

  onMount(() => {
    startTrainerMusic('what-comes-next');
    nextPrompt();
    return () => {
      clearTimers();
      stopTrainerMusic();
    };
  });
</script>

<GameShell accent="#6EE7B7">
  {#snippet hudLeft()}
    <HudPill icon="🔁" label={`${solved}/${goal}`} />
  {/snippet}

  <div class="board" data-testid="board">
    <p class="question">{$_('whatsNext')}</p>

    {#if prompt}
      {#key prompt.symbols.join('') + solved}
        <div class="strip" data-testid="strip">
          {#each prompt.symbols as sym}
            <span class="sym">{sym}</span>
          {/each}
          <span class="slot" class:filled data-testid="slot">
            {filled ? prompt.answer : '❓'}
          </span>
        </div>
      {/key}

      <div class="options" data-testid="options">
        {#each prompt.options as opt, idx}
          <button
            class="opt"
            class:wobbling={chosen === idx}
            onclick={() => answer(idx)}
            data-testid={idx === prompt.correctIndex ? 'correct-opt' : `wrong-opt-${idx}`}
          >
            {opt}
          </button>
        {/each}
      </div>
    {/if}
  </div>

  {#if won}
    <WinOverlay title={$_('wellDone')} subtitle={`🔁 ${solved}/${goal}`}>
      {#snippet badge()}<span class="win-badge">🏆</span>{/snippet}
      <a
        class="big-btn primary"
        href={`/games/what-comes-next/play/${level + 1}`}
        data-testid="next-level"
        onclick={nextLevel}
      >
        {$_('nextLevel')} ▶
      </a>
      <a class="big-btn ghost" href={`/games/what-comes-next/play/${level}`} data-testid="replay">
        {$_('replay')}
      </a>
      <a class="big-btn ghost" href="/games/what-comes-next">{$_('back')}</a>
    </WinOverlay>
  {/if}
</GameShell>

<style>
  .board {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 30px;
    padding: 12px 16px;
  }
  .question {
    font-size: 22px;
    font-weight: 700;
    color: var(--text-hi);
  }
  .strip {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
    padding: 22px 26px;
    border-radius: 24px;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    max-width: min(92vw, 520px);
  }
  .sym,
  .slot {
    font-size: 38px;
    line-height: 1;
    animation: popIn 0.25s ease-out backwards;
  }
  .slot {
    width: 56px;
    height: 56px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    background: rgba(127, 216, 255, 0.15);
    border: 2px dashed var(--accent);
    font-size: 26px;
  }
  .slot.filled {
    border-style: solid;
    background: var(--panel-glass);
    box-shadow: 0 0 18px var(--accent-glow);
  }
  .options {
    display: flex;
    gap: 16px;
    padding-bottom: calc(12px + var(--safe-bottom));
  }
  .opt {
    width: 72px;
    height: 72px;
    border-radius: 24px;
    font-size: 36px;
    line-height: 1;
    background: var(--btn-gradient);
    box-shadow: 0 4px 18px rgba(91, 194, 240, 0.5);
    transition: transform 0.15s;
  }
  .opt:active { transform: scale(0.92); }
  .opt.wobbling { animation: fxWobble 0.3s ease-in-out; }
  .opt:disabled { opacity: 0.85; }

  .win-badge { font-size: 52px; }
  .big-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    min-height: var(--touch-min); padding: 12px 32px;
    border-radius: var(--radius-btn);
    font-family: var(--font-display); font-size: 18px; font-weight: 600;
    text-decoration: none; transition: transform 0.15s;
  }
  .big-btn:active { transform: scale(0.95); }
  .primary { color: #062033; background: var(--btn-gradient); box-shadow: 0 4px 18px rgba(91,194,240,0.5); }
  .ghost { color: var(--text-lo); background: var(--panel-glass); border: 1px solid var(--panel-border); }
</style>
