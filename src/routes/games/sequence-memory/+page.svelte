<script>
  import { onMount, onDestroy } from 'svelte';
  import { makeRng } from '$lib/trainers/rng.js';
  import { _ } from '$lib/stores/locale';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import HudPill from '$lib/components/ui/HudPill.svelte';
  import BigButton from '$lib/components/ui/BigButton.svelte';
  import Confetti from '$lib/components/Confetti.svelte';
  import { playMatch, playWin } from '$lib/sounds/audioManager.js';
  import { playPadTone, playRetryTone } from '$lib/sounds/padSounds.js';
  import {
    PADS,
    generateSequence,
    sequenceLength,
    flashMs,
    gapMs,
    validateTap,
    scoreFor
  } from '$lib/sequence-memory/game.js';

  let { data } = $props();
  let screen = $state('idle'); // idle | playing | listening | replay | correct | gameOver
  let round = $state(1);
  let seq = $state([]);
  let inputPos = $state(0);
  let litPad = $state(-1);
  let wrongPad = $state(-1);
  let usedSecondChance = $state(false);
  let best = $state(
    (typeof localStorage !== 'undefined' && parseInt(localStorage.getItem('sequence-memory-best') || '0', 10)) || 0
  );
  let newBest = $state(false);
  let timers = [];

  function clearTimers() {
    for (const t of timers) clearTimeout(t);
    timers = [];
  }
  function later(fn, ms) {
    timers.push(setTimeout(fn, ms));
  }

  function startGame() {
    clearTimers();
    round = 1;
    usedSecondChance = false;
    newBest = false;
    screen = 'playing';
    playRound();
  }

  function playRound(halfSpeed = false) {
    const rng = data?.seed != null ? makeRng(data.seed + round) : Math.random;
    seq = generateSequence(round, rng);
    inputPos = 0;
    const speed = halfSpeed ? flashMs(round) * 2 : flashMs(round);
    const gap = halfSpeed ? gapMs() * 2 : gapMs();
    seq.forEach((padId, i) => {
      later(() => {
        litPad = padId;
        playPadTone(PADS[padId].tone);
      }, i * (speed + gap));
      later(() => (litPad = -1), i * (speed + gap) + speed);
    });
    later(() => (screen = 'listening'), seq.length * (speed + gap) + 150);
  }

  function tap(padId) {
    if (screen !== 'listening' && screen !== 'replay') return;
    litPad = padId;
    playPadTone(PADS[padId].tone);
    later(() => (litPad = -1), 200);

    const verdict = validateTap(seq, inputPos, padId);
    if (verdict === 'wrong') {
      wrongPad = padId;
      playRetryTone(); // gentle, not punitive
      later(() => (wrongPad = -1), 400);
      if (!usedSecondChance) {
        usedSecondChance = true;
        screen = 'replay';
        inputPos = 0;
        later(() => playRound(true), 900); // replay at half speed
      } else {
        gameOver();
      }
      return;
    }

    inputPos += 1;
    if (verdict === 'round-complete') {
      screen = 'correct';
      playMatch();
      later(() => {
        round += 1;
        usedSecondChance = false;
        screen = 'playing';
        playRound();
      }, 900);
    }
  }

  function gameOver() {
    screen = 'gameOver';
    const s = scoreFor(round - 1 > 0 ? round - 1 : 0);
    if (s > best) {
      best = s;
      localStorage.setItem('sequence-memory-best', String(best));
      newBest = true;
      playWin();
    } else {
      playWin();
    }
  }

  function visibility() {
    if (screen === 'playing' || screen === 'listening' || screen === 'replay') {
      pauseGame();
    }
  }
  function pauseGame() {
    clearTimers();
    pausedFrom = screen;
    screen = 'paused';
  }
  let pausedFrom = 'idle';
  function resumeGame() {
    screen = pausedFrom === 'idle' || pausedFrom === 'playing' ? 'playing' : pausedFrom;
    if (pausedFrom === 'playing' || pausedFrom === 'replay') playRound(pausedFrom === 'replay');
    else if (pausedFrom === 'listening') playRound();
  }

  onMount(() => {
    document.addEventListener('visibilitychange', visibility);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      clearTimers();
    };
  });
</script>

<GameShell accent="#BA68C8">
  {#snippet hudLeft()}
    {#if screen !== 'idle'}
      <HudPill icon="🎼" label={`${$_('round')} ${round}`} />
      <HudPill icon="🏆" label={String(best)} />
    {/if}
  {/snippet}

  <div class="seq" data-testid="seq-root">
    {#if screen === 'idle'}
      <div class="center-col">
        <h1 class="title">🎵 {$_('sequenceMemory')}</h1>
        <p class="tag">🐱 🐶 🐸 🐼</p>
        <BigButton onclick={startGame}>▶ {$_('play')}</BigButton>
        <p class="best-line">🏆 {best}</p>
      </div>
    {:else if screen === 'gameOver'}
      <div class="center-col">
        <p class="big-emoji">{newBest ? '🏆' : '🐸'}</p>
        <p class="score-line">🎼 {scoreFor(Math.max(1, round - 1))}</p>
        <p class="best-line">🏆 {best}</p>
        <BigButton onclick={startGame}>{$_('replay')}</BigButton>
        <BigButton variant="ghost" onclick={() => (screen = 'idle')}>{$_('back')}</BigButton>
      </div>
    {:else}
      <p class="status-line" data-testid="status">
        {#if screen === 'playing'}👀{:else if screen === 'listening' || screen === 'replay'}👆{:else if screen === 'correct'}🎉{/if}
      </p>
      <div class="grid" data-testid="pads">
        {#each PADS as pad (pad.id)}
          <button
            class="pad"
            class:lit={litPad === pad.id}
            class:wrong={wrongPad === pad.id}
            style:--pad-color={pad.color}
            aria-label={pad.emoji}
            data-testid="pad-{pad.id}"
            onclick={() => tap(pad.id)}
          >
            <span class="emoji">{pad.emoji}</span>
          </button>
        {/each}
        {#if screen === 'correct'}
          <Confetti />
        {/if}
      </div>

      {#if screen === 'paused'}
        <div class="overlay">
          <p class="ov-title">⏸️</p>
          <BigButton onclick={resumeGame}>▶ {$_('play')}</BigButton>
          <BigButton variant="ghost" onclick={() => (screen = 'idle')}>{$_('back')}</BigButton>
        </div>
      {/if}
    {/if}
  </div>
</GameShell>

<style>
  .seq {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 10px;
  }
  .center-col { display: flex; flex-direction: column; gap: 14px; align-items: center; }
  .title { font-size: 30px; color: var(--gold); text-shadow: 0 0 14px var(--glow-gold); margin: 0; text-align: center; }
  .tag { letter-spacing: 8px; opacity: 0.85; margin: 0; }
  .best-line { color: var(--text-lo); font-size: 16px; margin: 0; }
  .status-line { font-size: 34px; margin: 0; min-height: 40px; }
  .grid {
    position: relative;
    display: grid;
    grid-template-columns: repeat(2, minmax(120px, 170px));
    grid-template-rows: repeat(2, minmax(120px, 170px));
    gap: 16px;
  }
  .pad {
    border-radius: 28px;
    background: color-mix(in srgb, var(--pad-color) 55%, #101a3a);
    border: 2px solid var(--panel-border);
    box-shadow: inset 0 -6px 14px rgba(0, 0, 0, 0.25);
    transition: transform 0.1s, filter 0.15s, box-shadow 0.15s;
  }
  .pad .emoji { font-size: 54px; filter: grayscale(0.35) brightness(0.9); transition: filter 0.15s; }
  .pad.lit {
    transform: scale(1.05);
    filter: brightness(1.5);
    box-shadow: 0 0 30px var(--pad-color), inset 0 0 12px rgba(255, 255, 255, 0.3);
  }
  .pad.lit .emoji { filter: none; }
  .pad.wrong { animation: fxWobble 0.4s ease-in-out; }
  .pad:active { transform: scale(0.96); }
  .overlay {
    position: fixed; inset: 0; z-index: 40;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
    background: rgba(4, 8, 24, 0.85);
  }
  .ov-title { font-size: 44px; margin: 0; }
  .big-emoji { font-size: 60px; margin: 0; }
  .score-line { font-size: 32px; font-weight: 700; color: var(--gold); margin: 0; }
</style>
