<script>
  // Focus Tap — the Pond Catch. A moonlit pond fills the screen: the target
  // emoji rises through the middle, the frog waits bottom-left with the target
  // on its wooden sign, and every catch lights one firefly in the jar at the
  // bottom-right. Distractors wobble silently. There is no timer and no fail.
  import { onMount, untrack } from 'svelte';
  import { _ } from '#lib/stores/locale.js';
  import { reducedMotion } from '#lib/stores/reducedMotion.js';
  import GameShell from '#lib/components/ui/GameShell.svelte';
  import HudPill from '#lib/components/ui/HudPill.svelte';
  import WinOverlay from '#lib/components/ui/WinOverlay.svelte';
  import LadderActions from '#lib/ladder/LadderActions.svelte';
  import Pond from '#lib/focus-tap/Pond.svelte';
  import Frog from '#lib/focus-tap/Frog.svelte';
  import FireflyJar from '#lib/focus-tap/FireflyJar.svelte';
  import { createPondSound } from '#lib/focus-tap/sound.js';
  import '#lib/trainers/fx.css';

  import { makeRoundState, nextSpawn } from '#lib/trainers/focusTap.js';
  import { startTrainerMusic, stopTrainerMusic } from '#lib/sounds/trainerMusic.js';

  let { data } = $props();

  const level = $derived(data.level);
  const round = $derived(makeRoundState(level, data.seed));
  const goal = $derived(round.config.goal);
  const reduced = $derived($reducedMotion);
  const FANFARE_PITCH = 1.0;

  // Where the frog's mouth sits inside the pond, in percent. The dock is
  // bottom-left, so the tongue starts low and slightly in from the edge.
  const MOUTH = { x: 16, y: 93 };

  let items = $state([]);
  let caught = $state(0);
  let won = $state(false);
  let wrongId = $state(-1);
  let tongue = $state(null);
  let burst = $state(null);
  let idSeq = 0;
  let spawnTimer = null;
  let touchLock = false;
  let streamEl = $state(null);
  let timers = new Set();

  const sound = createPondSound();

  const jarLabel = $derived($_('ftJarFill', { n: Math.min(caught, goal), m: goal }));
  const signLabel = $derived($_('ftSign', { e: round.target }));
  const jarStatus = $derived(
    won
      ? `${$_('jarFull')} ${jarLabel}`
      : `${jarLabel}. ${$_('ftRemaining', { n: Math.max(0, goal - caught) })}`
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

  function spawn() {
    if (won) return;
    const next = nextSpawn(round, items, idSeq);
    items = next.items;
    if (!next.item) return;
    idSeq += 1;
  }

  function removeItem(id) {
    items = items.filter((item) => item.id !== id);
  }

  function pointFor(el) {
    const pond = streamEl?.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    if (!pond || !pond.width || !pond.height) return null;
    return {
      x: ((rect.left + rect.width / 2 - pond.left) / pond.width) * 100,
      y: ((rect.top + rect.height / 2 - pond.top) / pond.height) * 100
    };
  }

  function tap(event, item) {
    if (touchLock || won || item.popping) return;
    touchLock = true;
    later(() => (touchLock = false), 70);
    sound.unlock();

    const point = pointFor(event.currentTarget);
    if (item.isTarget) {
      item.popping = true;
      if (point) {
        tongue = point;
        later(() => (tongue = null), 300);
        if (!reduced) {
          burst = point;
          later(() => (burst = null), 450);
        }
      }
      sound.catch();
      sound.croak();
      caught += 1;
      later(() => removeItem(item.id), 190);
      if (caught >= goal) finish();
    } else {
      wrongId = item.id;
      later(() => {
        if (wrongId === item.id) wrongId = -1;
      }, 420);
    }
  }

  function startSpawning(immediate = true) {
    stopSpawning();
    if (won) return;
    if (immediate) spawn();
    spawnTimer = setInterval(spawn, round.config.spawnMs);
  }

  function stopSpawning() {
    if (spawnTimer) clearInterval(spawnTimer);
    spawnTimer = null;
  }

  function finish() {
    won = true;
    stopSpawning();
    sound.fill();
  }

  function resetRound() {
    clearTimers();
    sound.stop();
    stopSpawning();
    items = [];
    caught = 0;
    won = false;
    wrongId = -1;
    tongue = null;
    burst = null;
    touchLock = false;
    idSeq = 0;
    startSpawning();
  }

  // The component is reused across /play/[n] navigations: rebuild the round
  // whenever the route hands us a different level or seed.
  $effect(() => {
    data.level;
    data.seed;
    untrack(resetRound);
  });

  function visibility() {
    if (document.hidden) stopSpawning();
    else if (!won) startSpawning(false);
  }

  onMount(() => {
    startTrainerMusic('focus-tap');
    document.addEventListener('visibilitychange', visibility);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      stopSpawning();
      clearTimers();
      stopTrainerMusic();
      sound.dispose();
    };
  });
</script>

<GameShell accent="#F87171">
  {#snippet hudLeft()}
    <span data-testid="hud-target" aria-hidden="true">
      <HudPill icon="🎯" label={round.target} />
    </span>
  {/snippet}

  <div class="pond-catch" data-testid="focus-tap" data-level={level}>
    <div class="pond" data-testid="pond" role="group" aria-label={$_('ftPond')}>
      <Pond {reduced} />

      <div class="stream" data-testid="stream" bind:this={streamEl}>
        {#each items as item (item.id)}
          <button
            class="emoji"
            class:popping={item.popping}
            class:wrong={wrongId === item.id}
            type="button"
            onpointerdown={(event) => tap(event, item)}
            aria-label={item.isTarget ? $_('catchTarget', { e: item.emoji }) : $_('ftFriend')}
            style:left="{item.x}%"
            style:--rise="{round.config.riseSec}s"
            data-testid={item.isTarget ? 'target' : 'distractor'}
            oncontextmenu={(event) => event.preventDefault()}
          >
            <span class="emoji-body">{item.emoji}</span>
          </button>
        {/each}

        {#if tongue}
          <svg
            class="tongue"
            data-testid="tongue"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d={`M ${MOUTH.x} ${MOUTH.y} Q ${(MOUTH.x + tongue.x) / 2} ${Math.min(90, tongue.y + 8)} ${tongue.x} ${tongue.y}`}
              fill="none"
              stroke="#E4572E"
              stroke-width="5"
              stroke-linecap="round"
              vector-effect="non-scaling-stroke"
            />
          </svg>
        {/if}

        {#if burst}
          <span
            class="sparkle"
            data-testid="catch-fx"
            style:left="{burst.x}%"
            style:top="{burst.y}%"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" width="34" height="34">
              <path
                d="M12 1.5l2.7 7.8 7.8 2.7-7.8 2.7L12 22.5l-2.7-7.8L1.5 12l7.8-2.7z"
                fill="#FFE3A3"
              />
            </svg>
          </span>
        {/if}
      </div>

      <div class="frog-dock" data-testid="frog">
        <Frog target={round.target} />
      </div>

      <div
        class="jar-dock"
        data-testid="jar"
        data-count={caught}
        data-goal={goal}
        aria-hidden="true"
      >
        <FireflyJar caught={caught} {goal} {reduced} />
      </div>
    </div>

    <p class="sr-only" data-testid="target-status">{signLabel}</p>
    <p class="sr-only" role="status" data-testid="jar-status">{jarStatus}</p>
  </div>
</GameShell>

{#if won}
  <div class="win-wrap" class:calm={reduced}>
    <WinOverlay title={$_('jarFull')} subtitle={$_('ftWinSub')}>
      {#snippet badge()}<img
          class="win-badge"
          src="/art/trainers/focus-tap/win-badge.png"
          alt=""
        />{/snippet}
      <LadderActions gameId="focus-tap" {level} pitch={FANFARE_PITCH} />
    </WinOverlay>
  </div>
{/if}

<style>
  .pond-catch {
    position: relative;
    flex: 1;
    min-height: 0;
    display: flex;
    padding: 4px 8px 8px;
    overflow: hidden;
    background: #0f1d26;
  }
  .pond {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    border-radius: 22px;
    border: 2px solid rgba(134, 239, 172, 0.3);
    box-shadow:
      inset 0 10px 30px rgba(0, 0, 0, 0.35),
      0 10px 26px rgba(0, 0, 0, 0.28);
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }
  .stream {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 2;
  }
  .emoji {
    position: absolute;
    top: 104%;
    transform: translateX(-50%);
    padding: 5px;
    border: none;
    background: none;
    line-height: 1;
    font-size: clamp(38px, 10vw, 48px);
    pointer-events: auto;
    animation-name: floatUp;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
    animation-duration: var(--rise, 7s);
    filter: drop-shadow(0 0 7px rgba(255, 227, 163, 0.45));
    cursor: pointer;
  }
  .emoji-body {
    display: inline-block;
  }
  .emoji.wrong {
    opacity: 0.82;
    border-radius: 14px;
    outline: 2px solid rgba(255, 155, 155, 0.65);
    outline-offset: -2px;
  }
  .emoji.wrong .emoji-body {
    animation: wobble 0.3s ease-in-out;
  }
  .emoji.popping .emoji-body {
    animation: pop 0.19s ease-out forwards;
  }
  .tongue {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
    z-index: 3;
    filter: drop-shadow(0 0 3px rgba(228, 87, 46, 0.45));
  }
  .sparkle {
    position: absolute;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 4;
    animation: sparkle 0.45s ease-out forwards;
    filter: drop-shadow(0 0 8px rgba(255, 227, 163, 0.9));
  }
  .frog-dock {
    position: absolute;
    left: 2%;
    bottom: 2%;
    width: clamp(88px, 27vw, 122px);
    z-index: 5;
    pointer-events: none;
  }
  .jar-dock {
    position: absolute;
    right: 3%;
    bottom: 3%;
    width: clamp(50px, 15vw, 66px);
    z-index: 5;
    pointer-events: none;
  }
  .win-wrap {
    display: contents;
  }
  /* WinOverlay always mounts Confetti/Starfield. A child who asked for reduced
     motion should not get a falling celebration, so the route hides those two
     layers; the win card and ladder actions stay. */
  .win-wrap.calm :global(.confetti-container),
  .win-wrap.calm :global(.starfield) {
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
  @keyframes floatUp {
    from {
      top: 104%;
    }
    to {
      top: -16%;
    }
  }
  @keyframes wobble {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-5px);
    }
    50% {
      transform: translateX(5px);
    }
    75% {
      transform: translateX(-2px);
    }
  }
  @keyframes pop {
    to {
      transform: scale(1.6);
      opacity: 0;
    }
  }
  @keyframes sparkle {
    0% {
      transform: translate(-50%, -50%) scale(0.35) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(1.9) rotate(45deg);
      opacity: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    /* The global calm rule stops every animation. The rising stream is
       functional, not decorative: keep its real per-item duration so the pond
       stays playable while the fireflies and sparkle stay still. */
    .emoji {
      animation-duration: var(--rise, 7s) !important;
    }
    .sparkle {
      animation: none;
    }
  }
</style>
