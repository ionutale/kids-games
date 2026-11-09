<script>
  // Quick Count — the Flash Picnic. The bear asks “How many?”; one themed
  // object (berries, eggs, cookies, apples) flashes on the checkered cloth,
  // repeated N times. Three pills show the digit plus that many dots. A correct
  // answer drops a berry in the basket. No timer, no fail.
  import { onMount, untrack } from 'svelte';
  import { _ } from '#lib/stores/locale.js';
  import { reducedMotion } from '#lib/stores/reducedMotion.js';
  import GameShell from '#lib/components/ui/GameShell.svelte';
  import WinOverlay from '#lib/components/ui/WinOverlay.svelte';
  import LadderActions from '#lib/ladder/LadderActions.svelte';
  import PicnicCloth from '#lib/quick-count/PicnicCloth.svelte';
  import Bear from '#lib/quick-count/Bear.svelte';
  import Basket from '#lib/quick-count/Basket.svelte';
  import Pills from '#lib/quick-count/Pills.svelte';
  import { createPicnicSound } from '#lib/quick-count/sound.js';
  import '#lib/trainers/fx.css';

  import { makePrompt, levelConfig, tickSchedule } from '#lib/trainers/quickCount.js';
  import { startTrainerMusic, stopTrainerMusic } from '#lib/sounds/trainerMusic.js';

  let { data } = $props();

  const level = $derived(data.level);
  const config = $derived(levelConfig(level));
  const reduced = $derived($reducedMotion);
  const FANFARE_PITCH = 1.12;

  let solved = $state(0);
  let won = $state(false);
  let prompt = $state(null);
  let phase = $state('ready'); // ready → flash → answer
  let chosen = $state(-1); // index of the wrong pill currently wobbling
  let answered = $state(false);
  const timers = new Set();

  const sound = createPicnicSound();

  const basketLabel = $derived(
    $_('qcBasket', { n: Math.min(solved, config.goal), m: config.goal })
  );
  const statusText = $derived(
    won ? `${$_('qcBasketFull')} ${basketLabel}` : `${$_('howMany')} ${basketLabel}`
  );

  function later(fn, ms) {
    const id = setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
    return id;
  }

  function clearTimers() {
    for (const id of timers) clearTimeout(id);
    timers.clear();
  }

  function nextPrompt() {
    clearTimers();
    // Rotate themes by prompt so all four picnic foods appear in a round.
    prompt = makePrompt(level, (data.seed + solved * 7919) % 100000000, solved);
    chosen = -1;
    answered = false;
    phase = 'ready';
    later(() => {
      if (phase !== 'ready') return;
      phase = 'flash';
      // Count ticks are the teaching aid for the first two levels only.
      for (const delay of tickSchedule(level, prompt.n)) later(() => sound.tick(), delay);
      later(() => {
        if (phase === 'flash') phase = 'answer';
      }, config.flashMs);
    }, 650);
  }

  function answer(idx) {
    if (phase !== 'answer' || won || answered || !prompt) return;
    sound.unlock();
    const value = prompt.options[idx];
    if (value !== prompt.correct) {
      chosen = idx; // silent wobble, no penalty and no advance
      later(() => {
        if (chosen === idx) chosen = -1;
      }, 320);
      return;
    }

    answered = true;
    solved += 1;
    sound.berry();
    if (solved >= config.goal) {
      // Let the berry plop land before the basket chime; the win card itself
      // is silent so the fill is the one positive audio beat.
      later(() => sound.fill(), 260);
      // Hold the card back briefly so the child sees the last berry drop into
      // the basket instead of the overlay covering it on the same frame.
      later(() => {
        won = true;
      }, 420);
    } else {
      later(nextPrompt, 480);
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

  function resetRound() {
    clearTimers();
    sound.stop();
    solved = 0;
    won = false;
    chosen = -1;
    answered = false;
    prompt = null;
    phase = 'ready';
    nextPrompt();
  }

  // The component is reused across /play/[n] navigations: rebuild the round
  // whenever the route hands us a different level or seed.
  $effect(() => {
    data.level;
    data.seed;
    untrack(resetRound);
  });

  onMount(() => {
    startTrainerMusic('quick-count');
    document.addEventListener('visibilitychange', resumeAfterBlur);
    document.addEventListener('visibilitychange', restartFlashIfHidden);
    return () => {
      document.removeEventListener('visibilitychange', resumeAfterBlur);
      document.removeEventListener('visibilitychange', restartFlashIfHidden);
      clearTimers();
      stopTrainerMusic();
      sound.dispose();
    };
  });
</script>

<GameShell accent="#FDBA74">
  <div
    class="picnic"
    class:calm={reduced}
    data-testid="board"
    data-level={level}
    data-goal={config.goal}
    data-flash-ms={config.flashMs}
    data-theme={prompt?.theme.id ?? ''}
  >
    <PicnicCloth
      {phase}
      objects={prompt?.objects ?? []}
      cells={prompt?.cells ?? []}
      {reduced}
      readyLabel={$_('getReady')}
    />

    <div class="docks">
      <div class="bear-dock">
        <Bear ask={$_('howMany')} size={92} />
      </div>
      <div
        class="basket-dock"
        data-testid="basket"
        data-count={solved}
        data-goal={config.goal}
        role="img"
        aria-label={basketLabel}
      >
        <Basket filled={solved} goal={config.goal} {reduced} />
      </div>
    </div>

    <div class="answer-slot">
      {#if phase === 'answer' && prompt}
        <Pills
          options={prompt.options}
          theme={prompt.theme}
          wrong={chosen}
          correct={prompt.correct}
          groupLabel={$_('qcAnswers')}
          onpick={answer}
        />
      {/if}
    </div>

    <p class="sr-only" role="status" data-testid="prompt-status">{statusText}</p>
  </div>
</GameShell>

{#if won}
  <div class="win-wrap" class:calm={reduced}>
    <WinOverlay title={$_('qcBasketFull')} subtitle={$_('qcWinSub')} sound={false}>
      {#snippet badge()}<img
          class="win-badge"
          src="/art/trainers/quick-count/win-badge.png"
          alt=""
        />{/snippet}
      <LadderActions gameId="quick-count" {level} pitch={FANFARE_PITCH} />
    </WinOverlay>
  </div>
{/if}

<style>
  .picnic {
    position: relative;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: clamp(4px, 1.2vh, 8px);
    padding: 4px 10px calc(6px + var(--safe-bottom));
    overflow: hidden;
    background: #2a1f2a;
  }
  .docks {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 8px;
    padding: 26px 6px 0;
    flex-shrink: 0;
  }
  .bear-dock {
    width: clamp(76px, 23vw, 100px);
  }
  .basket-dock {
    width: clamp(58px, 17vw, 76px);
  }
  .answer-slot {
    flex-shrink: 0;
    min-height: clamp(84px, 14vh, 104px);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .win-wrap {
    display: contents;
  }
  /* A child who asked for reduced motion keeps the static celebration and the
     win card, but not the falling confetti. */
  .win-wrap.calm :global(.confetti-container) {
    display: none;
  }
  .win-badge {
    width: 64px;
    height: 64px;
    filter: drop-shadow(0 0 12px var(--glow-gold));
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
</style>
