<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { _ } from '$lib/stores/locale';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import HudPill from '$lib/components/ui/HudPill.svelte';
  import WinOverlay from '$lib/components/ui/WinOverlay.svelte';
  import '$lib/trainers/fx.css';

  import { makeDeck, levelConfig } from '$lib/trainers/speedMatch.js';
  import { startTrainerMusic, stopTrainerMusic } from '$lib/sounds/trainerMusic.js';
  import { playAdvancePop, fanfare } from '$lib/sounds/trainerSounds.js';

  let { data } = $props();
  const level = data.level;
  const config = levelConfig(level);
  const deck = makeDeck(level, data.seed);
  const FANFARE_PITCH = 0.92;

  let index = $state(0);
  let won = $state(false);
  let wobbling = $state('');
  let bar;

  let timer = null;
  let deadline = 0;
  let remainingMs = config.windowMs;

  const card = $derived(deck[index]);

  function clearTimer() {
    if (timer) clearTimeout(timer);
    timer = null;
  }

  function armWindow(ms) {
    clearTimer();
    deadline = Date.now() + ms;
    timer = setTimeout(expire, ms); // silent expiry — never a penalty
    if (bar) {
      bar.style.transition = 'none';
      bar.style.width = '100%';
      void bar.offsetWidth; // reflow before animating
      bar.style.transition = `width ${ms}ms linear`;
      bar.style.width = '0%';
    }
  }

  function expire() {
    advance(); // silent — no sound, no penalty
  }

  function advance() {
    clearTimer();
    if (index + 1 >= deck.length) {
      won = true;
      return;
    }
    index += 1;
    armWindow(config.windowMs);
  }

  function answer(saysSame) {
    if (won) return;
    if (saysSame === card.same) {
      playAdvancePop();
      remainingMs = config.windowMs;
      advance();
    } else {
      wobbling = saysSame ? 'same' : 'diff'; // silent wobble — card stays
      setTimeout(() => (wobbling = ''), 320);
    }
  }

  function visibility() {
    if (document.hidden) {
      // freeze: never expires while hidden
      remainingMs = Math.max(0, deadline - Date.now());
      clearTimer();
      if (bar) {
        const w = getComputedStyle(bar).width;
        bar.style.transition = 'none';
        bar.style.width = w;
      }
    } else if (!won && !timer && index < deck.length) {
      if (remainingMs <= 0) remainingMs = config.windowMs;
      armWindow(remainingMs);
    }
  }

  function nextLevel(e) {
    e.preventDefault();
    fanfare(FANFARE_PITCH);
    goto(`/games/speed-match/play/${level + 1}`);
  }

  onMount(() => {
    startTrainerMusic('speed-match');
    armWindow(config.windowMs);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      clearTimer();
      stopTrainerMusic();
    };
  });
</script>

<GameShell accent="#93C5FD">
  {#snippet hudLeft()}
    <HudPill icon="🃏" label={`${index + 1}/${deck.length}`} />
  {/snippet}

  <div class="board" data-testid="board">
    {#if card}
      {#key index}
        <div class="card" data-testid="pair-card">
          <span class="face" data-testid="emoji-a">{card.a}</span>
          <span class="vs">·</span>
          <span class="face" data-testid="emoji-b">{card.b}</span>
        </div>
        <div class="window-track" aria-hidden="true">
          <div class="window-bar" bind:this={bar}></div>
        </div>
        <div class="answers">
          <button
            class="answer"
            class:wobbling={wobbling === 'same'}
            onclick={() => answer(true)}
            data-testid="same-btn"
          >
            👯 {$_('samePair')}
          </button>
          <button
            class="answer"
            class:wobbling={wobbling === 'diff'}
            onclick={() => answer(false)}
            data-testid="diff-btn"
          >
            🙅 {$_('diffPair')}
          </button>
        </div>
      {/key}
    {/if}
  </div>

  {#if won}
    <WinOverlay title={$_('wellDone')} subtitle={`🃏 ${deck.length}/${deck.length}`}>
      {#snippet badge()}<img class="win-badge" src="/art/trainers/speed-match/win-badge.png" alt="" />{/snippet}
      <a
        class="big-btn primary"
        href={`/games/speed-match/play/${level + 1}`}
        data-testid="next-level"
        onclick={nextLevel}
      >
        {$_('nextLevel')} ▶
      </a>
      <a class="big-btn ghost" href={`/games/speed-match/play/${level}`} data-testid="replay">
        {$_('replay')}
      </a>
      <a class="big-btn ghost" href="/games/speed-match">{$_('back')}</a>
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
    gap: 26px;
    padding: 12px 16px;
  }
  .card {
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 30px 38px;
    border-radius: 28px;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    animation: popIn 0.3s ease-out;
  }
  .face {
    font-size: 64px;
    line-height: 1;
    filter: drop-shadow(0 0 8px var(--accent-glow));
  }
  .vs { font-size: 40px; color: var(--text-lo); }
  .window-track {
    width: min(70vw, 340px);
    height: 10px;
    border-radius: 6px;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    overflow: hidden;
  }
  .window-bar {
    height: 100%;
    width: 100%;
    border-radius: 6px;
    background: linear-gradient(90deg, #7FD8FF, #5EEAD4);
  }
  .answers {
    display: flex;
    gap: 18px;
  }
  .answer {
    min-height: calc(var(--touch-min) * 1.2);
    min-width: 128px;
    padding: 12px 24px;
    border-radius: 22px;
    font-size: 20px;
    font-weight: 700;
    font-family: var(--font-display);
    color: #062033;
    background: var(--btn-gradient);
    box-shadow: 0 4px 18px rgba(91, 194, 240, 0.5);
    transition: transform 0.15s;
  }
  .answer:active { transform: scale(0.94); }
  .answer.wobbling { animation: fxWobble 0.3s ease-in-out; }

  .win-badge { width: 64px; height: 64px; filter: drop-shadow(0 0 12px var(--glow-gold)); }
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
