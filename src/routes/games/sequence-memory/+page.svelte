<script>
  import { onMount } from 'svelte';
  import { makeRng } from '$lib/trainers/rng.js';
  import { _ } from '$lib/stores/locale';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import HudPill from '$lib/components/ui/HudPill.svelte';
  import BigButton from '$lib/components/ui/BigButton.svelte';
  import WinOverlay from '$lib/components/ui/WinOverlay.svelte';
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
  let screen = $state('idle'); // idle | watching | listening | correct | gameOver | paused
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
  let bestAtStart = 0;
  let watchingHalfSpeed = false;
  let timers = [];

  function clearTimers() {
    for (const t of timers) clearTimeout(t);
    timers = [];
  }
  function later(fn, ms) {
    timers.push(setTimeout(fn, ms));
  }

  function saveBest(value) {
    if (value > best) {
      best = value;
      localStorage.setItem('sequence-memory-best', String(best));
    }
  }

  function startGame() {
    clearTimers();
    round = 1;
    usedSecondChance = false;
    newBest = false;
    bestAtStart = best;
    beginRound();
  }

  function beginRound() {
    const rng = data?.seed != null ? makeRng(data.seed + round) : Math.random;
    seq = generateSequence(round, rng);
    inputPos = 0;
    watchSequence(false);
  }

  // Plays the CURRENT seq. Never regenerates: the second chance and pause
  // resume must show the sequence the child already saw.
  function watchSequence(halfSpeed) {
    clearTimers();
    watchingHalfSpeed = halfSpeed;
    screen = 'watching';
    litPad = -1;
    const speed = halfSpeed ? flashMs(round) * 2 : flashMs(round);
    const gap = halfSpeed ? gapMs() * 2 : gapMs();
    seq.forEach((padId, i) => {
      later(() => {
        litPad = padId;
        playPadTone(PADS[padId].tone);
      }, i * (speed + gap));
      later(() => (litPad = -1), i * (speed + gap) + speed);
    });
    later(() => {
      if (screen === 'watching') screen = 'listening';
    }, seq.length * (speed + gap) + 150);
  }

  function tap(padId) {
    if (screen !== 'listening') return; // watching is for eyes, not fingers
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
        screen = 'watching';
        later(() => watchSequence(true), 900); // replay at half speed
      } else {
        gameOver();
      }
      return;
    }

    inputPos += 1;
    if (verdict === 'round-complete') {
      screen = 'correct';
      playMatch();
      saveBest(scoreFor(round)); // this run's completed rounds survive an abandon
      later(() => {
        round += 1;
        usedSecondChance = false;
        inputPos = 0;
        beginRound();
      }, 900);
    }
  }

  function gameOver() {
    screen = 'gameOver';
    const s = scoreFor(Math.max(0, round - 1));
    saveBest(s);
    newBest = s > bestAtStart;
    playWin();
  }

  function visibility() {
    if (screen === 'watching' || screen === 'listening') {
      pauseGame();
    }
  }
  let pausedFrom = 'idle';
  function pauseGame() {
    clearTimers();
    pausedFrom = screen;
    screen = 'paused';
  }
  function resumeGame() {
    if (pausedFrom === 'listening') {
      // The sequence was already memorised; keep the child's progress.
      screen = 'listening';
    } else if (pausedFrom === 'watching') {
      // Replay the same sequence so the child sees it whole again.
      watchSequence(watchingHalfSpeed);
    } else {
      screen = 'idle';
    }
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
    {:else if screen !== 'gameOver'}
      <p class="status-line" data-testid="status">
        {#if screen === 'watching'}👀{:else if screen === 'listening'}👆{:else if screen === 'correct'}🎉{/if}
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

    {#if screen === 'gameOver'}
      <WinOverlay
        title={`🎼 ${scoreFor(Math.max(0, round - 1))}`}
        subtitle={`🏆 ${best}`}
        sound={false}
      >
        {#snippet badge()}<span class="win-badge">{newBest ? '🏆' : '🐸'}</span>{/snippet}
        <BigButton onclick={startGame}>{$_('replay')}</BigButton>
        <BigButton variant="ghost" onclick={() => (screen = 'idle')}>{$_('back')}</BigButton>
      </WinOverlay>
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

</style>
