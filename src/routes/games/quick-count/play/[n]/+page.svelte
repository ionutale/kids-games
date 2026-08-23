<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { _ } from '$lib/stores/locale';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import HudPill from '$lib/components/ui/HudPill.svelte';
  import WinOverlay from '$lib/components/ui/WinOverlay.svelte';
  import '$lib/trainers/fx.css';

  import { makePrompt } from '$lib/trainers/quickCount.js';
  import { levelConfig } from '$lib/trainers/quickCount.js';
  import { startTrainerMusic, stopTrainerMusic } from '$lib/sounds/trainerMusic.js';
  import { playPop } from '$lib/sounds/audioManager.js';
  import { playLevelTick, playFlashWhoosh, playReadyTick, fanfare } from '$lib/sounds/trainerSounds.js';

  let { data } = $props();
  const level = data.level;
  const config = levelConfig(level);
  const FANFARE_PITCH = 1.12;

  let solved = $state(0);
  let won = $state(false);

  let prompt = $state(null);
  let phase = $state('ready'); // ready → flash → answer
  let chosen = $state(-1); // index of wrong pill currently wobbling
  let timers = [];

  function clearTimers() {
    for (const t of timers) clearTimeout(t);
    timers = [];
  }

  function later(fn, ms) {
    timers.push(setTimeout(fn, ms));
  }

  function nextPrompt() {
    clearTimers();
    prompt = makePrompt(level, (data.seed + solved * 7919) % 100000000);
    chosen = -1;
    phase = 'ready';
    playReadyTick();
    later(() => {
      if (phase !== 'ready') return;
      phase = 'flash';
      playFlashWhoosh();
      later(() => {
        if (phase === 'flash') phase = 'answer';
      }, config.flashMs);
    }, 600);
  }

  function answer(idx) {
    if (phase !== 'answer' || won) return;
    const value = prompt.options[idx];
    if (value !== prompt.correct) {
      chosen = idx; // silent wobble, stays until correct
      setTimeout(() => (chosen = -1), 320);
      return;
    }
    playPop();
    solved += 1;
    if (solved >= config.goal) {
      won = true;
    } else {
      later(nextPrompt, 400);
    }
  }

  function restartFlashIfHidden() {
    if (document.hidden && (phase === 'ready' || phase === 'flash')) {
      clearTimers();
      phase = 'paused';
    }
  }

  function resumeAfterBlur() {
    if (!document.hidden && phase === 'paused') nextPrompt(); // fresh flash — never counts
  }

  function nextLevel(e) {
    e.preventDefault();
    fanfare(FANFARE_PITCH);
    goto(`/games/quick-count/play/${level + 1}`);
  }

  onMount(() => {
    startTrainerMusic('quick-count');
    document.addEventListener('visibilitychange', resumeAfterBlur);
    document.addEventListener('visibilitychange', restartFlashIfHidden);
    nextPrompt();
    return () => {
      document.removeEventListener('visibilitychange', resumeAfterBlur);
      document.removeEventListener('visibilitychange', restartFlashIfHidden);
      clearTimers();
      stopTrainerMusic();
    };
  });
</script>

<GameShell accent="#FDBA74">
  {#snippet hudLeft()}
    <HudPill icon="🔢" label={`${solved}/${config.goal}`} />
  {/snippet}

  <div class="board" data-testid="board">
    <p class="question">{$_('howMany')}</p>

    <div class="panel" class:visible={phase === 'flash'} data-testid="panel">
      {#if phase === 'flash'}
        {#each prompt.cells as cell, i}
          <span class="dot" style:left="{cell.x}%" style:top="{cell.y}%">{prompt.emojis[i]}</span>
        {/each}
      {:else if phase === 'ready'}
        <span class="get-ready">{$_('getReady')}</span>
      {/if}
    </div>

    {#if phase === 'answer'}
      <div class="pills" data-testid="pills">
        {#each prompt.options as value, idx}
          <button
            class="pill"
            class:wobbling={chosen === idx}
            onclick={() => answer(idx)}
            data-testid={value === prompt.correct ? 'correct-pill' : `wrong-pill-${idx}`}
          >
            {value}
          </button>
        {/each}
      </div>
    {/if}
  </div>

  {#if won}
    <WinOverlay title={$_('wellDone')} subtitle={`🔢 ${solved}/${config.goal}`}>
      {#snippet badge()}<span class="win-badge">🏆</span>{/snippet}
      <a
        class="big-btn primary"
        href={`/games/quick-count/play/${level + 1}`}
        data-testid="next-level"
        onclick={nextLevel}
      >
        {$_('nextLevel')} ▶
      </a>
      <a class="big-btn ghost" href={`/games/quick-count/play/${level}`} data-testid="replay">
        {$_('replay')}
      </a>
      <a class="big-btn ghost" href="/games/quick-count">{$_('back')}</a>
    </WinOverlay>
  {/if}
</GameShell>

<style>
  .board {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    padding: 12px 16px;
  }
  .question {
    font-size: 22px;
    font-weight: 700;
    color: var(--text-hi);
  }
  .panel {
    position: relative;
    width: min(88vw, 420px);
    height: min(52vh, 340px);
    border-radius: 24px;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .panel.visible {
    border-color: var(--accent);
    box-shadow: 0 0 24px var(--accent-glow);
  }
  .dot {
    position: absolute;
    font-size: 34px;
    line-height: 1;
    transform: translate(-50%, -50%);
    animation: fxPop 0.25s ease-out;
  }
  .get-ready {
    font-size: 20px;
    color: var(--text-lo);
    animation: floaty 1s ease-in-out infinite;
  }
  .pills {
    display: flex;
    gap: 16px;
    padding-bottom: calc(12px + var(--safe-bottom));
  }
  .pill {
    width: 76px;
    height: 76px;
    border-radius: 24px;
    font-size: 32px;
    font-weight: 700;
    font-family: var(--font-display);
    color: #062033;
    background: var(--btn-gradient);
    box-shadow: 0 4px 18px rgba(91, 194, 240, 0.5);
    transition: transform 0.15s;
  }
  .pill:active { transform: scale(0.92); }
  .pill.wobbling { animation: fxWobble 0.3s ease-in-out; }

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
