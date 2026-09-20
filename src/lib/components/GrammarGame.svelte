<script>
  import { untrack } from 'svelte';
  import { goto } from '$app/navigation';
  import { _ } from '$lib/stores/locale';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import HudPill from '$lib/components/ui/HudPill.svelte';
  import WinOverlay from '$lib/components/ui/WinOverlay.svelte';
  import Confetti from '$lib/components/Confetti.svelte';
  import '$lib/trainers/fx.css';
  import { exercisesFor, roundGoal } from '$lib/grammar/italian.js';
  import { makeRng, shuffle } from '$lib/trainers/rng.js';
  import { playMatch } from '$lib/sounds/audioManager.js';
  import { fanfare } from '$lib/sounds/trainerSounds.js';

  let { level = 1, seed = 0 } = $props();
  const FANFARE_PITCH = 1.05;

  let queue = $state([]);
  let index = $state(0);
  let won = $state(false);
  let shake = $state(-1);
  let picked = $state(-1);
  let timers = [];

  const goal = $derived(roundGoal(level));
  const exercise = $derived(queue[index] ?? null);

  function clearTimers() {
    for (const t of timers) clearTimeout(t);
    timers = [];
  }

  function later(fn, ms) {
    timers.push(setTimeout(fn, ms));
  }

  function resetRound() {
    clearTimers();
    queue = shuffle(exercisesFor(level), makeRng(seed)).slice(0, goal);
    index = 0;
    won = false;
    shake = -1;
    picked = -1;
  }

  // The component is reused across /play/[n] navigations: rebuild whenever the
  // route hands us a different level or seed.
  $effect(() => {
    level;
    seed;
    untrack(resetRound);
  });

  function answer(i) {
    if (!exercise || won || picked !== -1) return;
    if (i !== exercise.answer) {
      shake = i;
      later(() => {
        if (shake === i) shake = -1;
      }, 400);
      return;
    }
    picked = i;
    playMatch();
    later(() => {
      picked = -1;
      if (index + 1 >= queue.length) won = true;
      else index += 1;
    }, 1200);
  }

  function nextLevel(e) {
    e.preventDefault();
    fanfare(FANFARE_PITCH);
    goto(`/games/grammar/play/${level + 1}`);
  }

  function replay(e) {
    e.preventDefault();
    goto(`/games/grammar/play/${level}?seed=${Date.now() % 1000000}`);
  }
</script>

<GameShell accent="#86EFAC">
  {#snippet hudLeft()}
    <HudPill icon="✏️" label={`${index + 1}/${queue.length}`} />
  {/snippet}

  <div class="board" data-testid="grammar-root">
    {#if exercise}
      {#key index}
        {#if exercise.type === 'picture'}
          <p class="question">{$_('whichSentence')}</p>
          <div class="scene" data-testid="scene"><span class="scene-emoji">{exercise.emoji}</span></div>
        {:else}
          <p class="question">{$_('completeSentence')}</p>
          <div class="prompt-card" data-testid="prompt"><span class="prompt-text">{exercise.prompt}</span></div>
        {/if}

        <div class="options" data-testid="options">
          {#each exercise.options as opt, i (opt)}
            <button
              class="opt"
              class:shake={shake === i}
              class:correct={picked === i}
              onclick={() => answer(i)}
              data-testid={i === exercise.answer ? 'correct-opt' : `wrong-opt-${i}`}
            >
              {opt}
            </button>
          {/each}
        </div>
      {/key}
    {/if}
  </div>

  {#if picked !== -1}
    <Confetti />
  {/if}

  {#if won}
    <WinOverlay title={$_('wellDone')} subtitle={`✏️ ${queue.length}/${queue.length}`}>
      <a
        class="big-btn primary"
        href={`/games/grammar/play/${level + 1}`}
        data-testid="next-level"
        onclick={nextLevel}
      >
        {$_('nextLevel')} ▶
      </a>
      <a class="big-btn ghost" href={`/games/grammar/play/${level}`} data-testid="replay" onclick={replay}>
        {$_('replay')}
      </a>
      <a class="big-btn ghost" href="/games/grammar">{$_('back')}</a>
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
    gap: 22px;
    padding: 12px 16px;
  }
  .question {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-hi);
    margin: 0;
  }
  .prompt-card {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 120px;
    max-width: min(92vw, 480px);
    padding: 24px 30px;
    border-radius: 24px;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    animation: popIn 0.25s ease-out;
  }
  .prompt-text {
    font-size: 32px;
    font-weight: 700;
    color: var(--text-hi);
    text-align: center;
  }
  .scene {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 150px;
    height: 150px;
    border-radius: 24px;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    animation: popIn 0.25s ease-out;
  }
  .scene-emoji {
    font-size: 72px;
    line-height: 1;
  }
  .options {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    max-width: 420px;
    padding-bottom: calc(10px + var(--safe-bottom));
  }
  .opt {
    width: 100%;
    min-height: var(--touch-min);
    padding: 14px 18px;
    font-size: 22px;
    font-weight: 700;
    font-family: var(--font-display);
    color: var(--text-hi);
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    border-radius: 18px;
    transition: transform 0.12s;
  }
  .opt:active { transform: scale(0.97); }
  .opt.correct {
    color: #062033;
    background: var(--mint);
    border-color: var(--mint);
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(110, 231, 183, 0.6);
    animation: fxPop 0.25s ease-out;
  }
  .opt.shake {
    animation: fxWobble 0.4s ease-in-out;
    background: rgba(255, 155, 155, 0.25);
    border-color: rgba(255, 155, 155, 0.7);
  }

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
