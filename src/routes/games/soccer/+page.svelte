<script>
  // Soccer — the Night Penalty. A portrait night stadium seen from behind the
  // ball: floodlights, a crowd silhouette, striped grass, a wide shallow goal
  // with a net, a child striker and a friendly bear keeper.
  //
  // A child swipes anywhere. The reticle and dashed arc show the IMPACT point
  // (the first point of the arc inside the mouth); the swipe length only sets
  // the flight time. The keeper patrols continuously and dives late, and the
  // outcome uses his x at release. Five shots are always played; the level
  // target decides the win, and stars 1/2/3 are remembered per level locally.
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { seedFromUrl } from '#lib/game/seed.js';
  import { _ } from '#lib/stores/locale.js';
  import { reducedMotion, prefersReducedMotion } from '#lib/stores/reducedMotion.js';
  import GameShell from '#lib/components/ui/GameShell.svelte';
  import WinOverlay from '#lib/components/ui/WinOverlay.svelte';
  import LadderBar from '#lib/ladder/LadderBar.svelte';
  import LadderActions from '#lib/ladder/LadderActions.svelte';
  import SoccerArt from '#lib/soccer/SoccerArt.svelte';
  import Pips from '#lib/soccer/Pips.svelte';
  import StarRow from '#lib/soccer/StarRow.svelte';
  import { createStadiumSound } from '#lib/soccer/sound.js';
  import { bestStarsFor, saveBestStars } from '#lib/soccer/stars.js';
  import {
    BALL_START,
    SHOTS,
    TAP_SLOP_PX,
    controlPoint,
    flightDuration,
    goalBounds,
    impactPoint,
    keeperCenter,
    openAim,
    openSideGlow,
    quadPoint,
    shotResult,
    starsForGoals,
    targetFor
  } from '#lib/soccer/engine.js';
  import {
    loadLevel,
    saveLevel,
    loadMastered,
    saveMastered,
    MAX_LEVEL
  } from '#lib/ladder/progress.js';

  const KEEPER_PHASE = (seedFromUrl(page.url) ?? 0) / 1000;
  const initialLevel = loadLevel('soccer');
  const sound = createStadiumSound();

  let level = $state(initialLevel);
  let mastered = $state(loadMastered('soccer'));
  let phase = $state('playing'); // playing | won | good
  let goals = $state(0);
  let shotsLeft = $state(SHOTS);
  let best = $state(bestStarsFor(initialLevel));
  let outcome = $state(null);
  let ball = $state({ ...BALL_START, scale: 1 });
  let ballMoving = $state(false);
  let keeperX = $state(keeperCenter(initialLevel, KEEPER_PHASE));
  let dive = $state(0);
  let goalFlash = $state(false);
  let isDragging = $state(false);
  let dragEnd = $state(null);
  let fieldEl = $state(null);
  let retryBtn = $state(null);

  let fieldRect = null;
  let activePointer = null;
  let pressClient = null;
  let lastClient = null;
  let keeperHold = false;
  let keeperClock = KEEPER_PHASE;
  let lastKeeperNow = 0;
  let flightRaf = 0;
  let keeperRaf = 0;
  const timers = new Set();

  const reduced = $derived($reducedMotion);
  const bounds = $derived(goalBounds(level));
  const target = $derived(targetFor(level));
  const glow = $derived(openSideGlow(level) && !ballMoving ? openAim(level, keeperX) : null);
  // The displayed reticle sits on the impact when the arc enters the mouth and
  // on the finger when it does not, so the child always sees where they aimed.
  const aim = $derived.by(() => {
    if (!isDragging || !dragEnd) return null;
    return impactPoint(BALL_START, dragEnd, level) ?? dragEnd;
  });
  const aimControl = $derived(aim ? controlPoint(BALL_START, aim) : null);
  const liveOpen = $derived(openAim(level, keeperX));
  const onTarget = $derived(
    aim ? aim.x > bounds.x0 && aim.x < bounds.x1 && aim.y > bounds.y0 && aim.y < bounds.y1 : false
  );
  const showHint = $derived(
    phase === 'playing' && goals === 0 && shotsLeft === SHOTS && !ballMoving && !isDragging
  );
  const pipsLabel = $derived(
    `${$_('soccerGoals', { n: goals, m: target })}, ${$_('soccerShots', { n: shotsLeft })}`
  );
  const starLabel = $derived($_('soccerBest', { n: best, m: 3 }));
  const aimText = $derived.by(() => {
    if (!aim) return '';
    const third = (bounds.x1 - bounds.x0) / 3;
    const zone =
      aim.x < bounds.x0 + third
        ? $_('soccerZoneLeft')
        : aim.x > bounds.x1 - third
          ? $_('soccerZoneRight')
          : $_('soccerZoneCentre');
    const state = onTarget ? $_('soccerOnTarget') : $_('soccerOffTarget');
    return $_('soccerAimStatus', { state, aim: $_('soccerAimAt', { zone }) });
  });
  // The single live round status: progress, outcomes, win and Good Try.
  const statusText = $derived.by(() => {
    if (phase === 'won') {
      return `${$_('soccerWhatAShot')} ${$_('soccerGoals', { n: goals, m: target })}`;
    }
    if (phase === 'good') {
      return `${$_('goodTry')}. ${$_('soccerGoodTrySub', { n: goals, m: target })}`;
    }
    if (outcome === 'goal') return $_('soccerGoal');
    if (outcome === 'save') return $_('soccerSaved');
    if (outcome === 'miss') return $_('soccerMiss');
    return `${$_('soccerGoals', { n: goals, m: target })}. ${$_('soccerShots', { n: shotsLeft })}`;
  });

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

  function detachDrag() {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', cancelDrag);
  }

  function cancelDrag() {
    detachDrag();
    activePointer = null;
    fieldRect = null;
    pressClient = null;
    lastClient = null;
    isDragging = false;
    dragEnd = null;
  }

  function toField(event) {
    const rect = fieldRect ?? fieldEl?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100
    };
  }

  function startRound({ whistle = true } = {}) {
    clearTimers();
    if (flightRaf) cancelAnimationFrame(flightRaf);
    flightRaf = 0;
    sound.stop();
    detachDrag();
    activePointer = null;
    fieldRect = null;
    pressClient = null;
    lastClient = null;
    phase = 'playing';
    goals = 0;
    shotsLeft = SHOTS;
    outcome = null;
    ball = { ...BALL_START, scale: 1 };
    ballMoving = false;
    keeperHold = false;
    keeperX = keeperCenter(level, keeperClock);
    dive = 0;
    goalFlash = false;
    isDragging = false;
    dragEnd = null;
    best = bestStarsFor(level);
    if (whistle) {
      sound.unlock();
      sound.whistle();
    }
  }

  function setLevel(next) {
    level = Math.min(MAX_LEVEL, Math.max(1, parseInt(next, 10) || 1));
    saveLevel('soccer', level);
    startRound();
  }

  function retry() {
    startRound();
  }

  function advanceLevel(event) {
    event?.preventDefault();
    if (level < MAX_LEVEL) setLevel(level + 1);
    else startRound();
  }

  function replayLevel(event) {
    event?.preventDefault();
    startRound();
  }

  function down(event) {
    if (phase !== 'playing' || ballMoving || keeperHold) return;
    if (activePointer !== null) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault?.();
    sound.unlock();
    fieldRect = fieldEl?.getBoundingClientRect() ?? null;
    const p = toField(event);
    if (!p) {
      fieldRect = null;
      return;
    }
    activePointer = event.pointerId;
    pressClient = { x: event.clientX, y: event.clientY };
    lastClient = { ...pressClient };
    isDragging = true;
    dragEnd = p;
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancelDrag);
  }

  function move(event) {
    if (!isDragging || event.pointerId !== activePointer) return;
    if (event.cancelable) event.preventDefault?.();
    if (Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) {
      lastClient = { x: event.clientX, y: event.clientY };
    }
    dragEnd = toField(event);
  }

  function up(event) {
    if (event.pointerId !== undefined && event.pointerId !== activePointer) return;
    const end = toField(event) ?? dragEnd;
    const release =
      Number.isFinite(event.clientX) && Number.isFinite(event.clientY)
        ? { x: event.clientX, y: event.clientY }
        : lastClient;
    const travel =
      release && pressClient
        ? Math.hypot(release.x - pressClient.x, release.y - pressClient.y)
        : 0;
    detachDrag();
    activePointer = null;
    fieldRect = null;
    pressClient = null;
    lastClient = null;
    if (!isDragging || !end) {
      isDragging = false;
      dragEnd = null;
      return;
    }
    isDragging = false;
    dragEnd = null;
    // A stationary tap is not a shot: only real pointer travel fires.
    if (travel < TAP_SLOP_PX) return;
    if (Math.hypot(end.x - BALL_START.x, end.y - BALL_START.y) < 3) return;
    shoot(end, travel);
  }

  function shoot(end, travel) {
    if (phase !== 'playing' || shotsLeft <= 0 || keeperHold) return;
    // Capture the keeper's position at release: this is the moment the result
    // is decided, so swipe timing matters and swipe length never does.
    const keeperAtRelease = keeperX;
    const result = shotResult(BALL_START, end, level, keeperAtRelease);
    const impact = impactPoint(BALL_START, end, level);
    const to = impact ?? end;
    const control = controlPoint(BALL_START, to);
    // The dive starts at release, toward the impact, and stays through the
    // outcome window. A shot that never enters the mouth makes the keeper hold.
    const calm = prefersReducedMotion();
    const duration = flightDuration(travel, { calm });
    const startTime = performance.now();

    ballMoving = true;
    keeperHold = true;
    outcome = null;
    goalFlash = false;
    dive = impact ? (impact.x < keeperAtRelease ? -1 : 1) : 0;
    shotsLeft = Math.max(0, shotsLeft - 1);
    sound.kick();

    function tick(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const pt = quadPoint(BALL_START, control, to, t);
      ball = { x: pt.x, y: pt.y, scale: calm ? 1 : 1 + t * 0.22 };
      if (t < 1) {
        flightRaf = requestAnimationFrame(tick);
        return;
      }
      flightRaf = 0;
      resolve(result, to);
    }
    flightRaf = requestAnimationFrame(tick);
  }

  function resolve(result, to) {
    ballMoving = false;
    outcome = result;
    if (result === 'goal') {
      goals += 1;
      goalFlash = true;
      ball = { ...to, scale: 1.22 };
      sound.net();
    } else if (result === 'save') {
      ball = { ...to, scale: 1.1 };
      sound.glove();
    } else {
      // A miss is a whoosh, never a sad sting.
      ball = { ...to, scale: 1 };
      sound.whoosh();
    }

    later(
      () => {
        outcome = null;
        goalFlash = false;
        dive = 0;
        ball = { ...BALL_START, scale: 1 };
        if (shotsLeft <= 0) finishRound({ scored: result === 'goal' });
        else keeperHold = false;
      },
      result === 'goal' ? 1100 : 850
    );
  }

  function finishRound({ scored = false } = {}) {
    if (phase !== 'playing') return;
    keeperHold = true;
    if (goals >= target) {
      const earned = starsForGoals(goals);
      best = saveBestStars(level, earned);
      if (level >= MAX_LEVEL) {
        mastered = true;
        saveMastered('soccer');
      }
      phase = 'won';
      // A won round whose fifth shot was saved or missed still deserves the
      // stadium's positive cheer; the shared fanfare stays suppressed.
      if (!scored) sound.cheer();
    } else {
      // Calm Good Try: no star, no sad sound, no fail state.
      phase = 'good';
    }
  }

  function keeperLoop(now) {
    if (!lastKeeperNow) lastKeeperNow = now;
    const dt = Math.min(0.05, (now - lastKeeperNow) / 1000);
    lastKeeperNow = now;
    if (!keeperHold && !ballMoving && phase === 'playing') {
      keeperClock += dt;
      keeperX = keeperCenter(level, keeperClock);
    }
    keeperRaf = requestAnimationFrame(keeperLoop);
  }

  // Focus the calm card's only primary action so a keyboard/switch user is not
  // stranded behind the overlay.
  $effect(() => {
    if (phase === 'good') retryBtn?.focus();
  });

  onMount(() => {
    keeperX = keeperCenter(level, keeperClock);
    keeperRaf = requestAnimationFrame(keeperLoop);
    return () => {
      cancelAnimationFrame(keeperRaf);
      cancelAnimationFrame(flightRaf);
      clearTimers();
      detachDrag();
      sound.dispose();
    };
  });
</script>

<GameShell accent="#FFE082">
  <div
    class="soccer-game"
    data-testid="soccer-root"
    data-level={level}
    data-state={phase}
    data-goals={goals}
    data-shots={shotsLeft}
    data-target={target}
    data-best={best}
  >
    <div class="stadium" class:reduced={reduced}>
      <div class="sky" aria-hidden="true">
        <span class="floodlight l1"></span>
        <span class="floodlight l2"></span>
        <span class="crowd"></span>
      </div>

      <div class="scoreboard">
        <Pips shotsLeft={shotsLeft} total={SHOTS} {goals} label={pipsLabel} />
      </div>

      <div
        class="field"
        data-testid="soccer-field"
        bind:this={fieldEl}
        role="group"
        aria-label={$_('soccerField')}
        data-open-x={liveOpen.x}
        data-open-y={liveOpen.y}
        onpointerdown={down}
      >
        <div
          class="goal"
          class:flash={goalFlash}
          data-testid="soccer-goal"
          style:left="{bounds.x0}%"
          style:top="{bounds.y0}%"
          style:width="{bounds.x1 - bounds.x0}%"
          style:height="{bounds.y1 - bounds.y0}%"
        >
          <span class="net" aria-hidden="true"></span>
          <span class="post left" aria-hidden="true"></span>
          <span class="post right" aria-hidden="true"></span>
          {#if glow}
            <span
              class="open-glow"
              aria-hidden="true"
              style:left="{((glow.x - bounds.x0) / (bounds.x1 - bounds.x0)) * 100}%"
            ></span>
          {/if}
          <span
            class="keeper"
            class:diving={dive !== 0}
            data-x={keeperX}
            style:left="{((keeperX - bounds.x0) / (bounds.x1 - bounds.x0)) * 100}%"
            style:transform="translate(-50%, -30%) rotate({dive * -26}deg)"
          >
            <SoccerArt id="bear" size={46} />
          </span>
        </div>

        <span class="spot" aria-hidden="true"></span>
        <span class="striker" aria-hidden="true">
          <SoccerArt id="striker" size={68} />
        </span>
        <span class="ball" style:left="{ball.x}%" style:top="{ball.y}%" data-testid="soccer-ball">
          <span class="ball-art" style:transform="scale({ball.scale})">
            <span class="ball-spin" class:spin={ballMoving && !reduced}>
              <SoccerArt id="ball" size={36} />
            </span>
          </span>
        </span>

        {#if aim && aimControl}
          <svg class="aim" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path
              d="M {BALL_START.x} {BALL_START.y} Q {aimControl.x} {aimControl.y} {aim.x} {aim.y}"
            />
          </svg>
          <span
            class="reticle"
            class:on-target={onTarget}
            style:left="{aim.x}%"
            style:top="{aim.y}%"
            aria-hidden="true"
          ></span>
        {/if}

        {#if outcome === 'save'}
          <span
            class="glove-beat"
            data-testid="soccer-glove"
            style:left="{ball.x}%"
            style:top="{ball.y}%"
            aria-hidden="true"
          >
            <SoccerArt id="glove" size={42} />
          </span>
        {/if}

        {#if outcome}
          <span
            class="callout"
            class:save={outcome === 'save'}
            class:miss={outcome === 'miss'}
            data-testid="soccer-callout"
          >
            {outcome === 'goal' ? $_('soccerGoal') : outcome === 'save' ? $_('soccerSaved') : $_('soccerMiss')}
          </span>
        {/if}

        {#if showHint}
          <p class="hint" data-testid="soccer-hint">{$_('soccerHint')}</p>
        {/if}
      </div>
    </div>

    <StarRow best={best} label={starLabel} />
    <LadderBar current={level} {mastered} onchange={setLevel} />

    <p class="sr-only" role="status" data-testid="soccer-status">{statusText}</p>
    <p class="sr-only" role="status" data-testid="soccer-aim">{aimText}</p>

    {#if phase === 'good'}
      <div class="card-wrap" data-testid="soccer-card">
        <div class="card" role="dialog" aria-label={$_('goodTry')}>
          <p class="card-title">{$_('goodTry')}</p>
          <p class="card-sub">{$_('soccerGoodTrySub', { n: goals, m: target })}</p>
          <div class="actions">
            <button class="primary" type="button" bind:this={retryBtn} onclick={retry}>
              {$_('tryAgain')}
            </button>
            <a class="ghost" href="/" data-testid="soccer-back">{$_('back')}</a>
          </div>
        </div>
      </div>
    {/if}
  </div>
</GameShell>

{#if phase === 'won'}
  <div class="win-wrap" class:calm={reduced}>
    <WinOverlay
      title={$_('soccerWhatAShot')}
      subtitle={$_('soccerWinSub', { n: goals })}
      sound={false}
      testid="soccer-win"
    >
      <div class="earned-stars" aria-hidden="true">
        {#each Array(3) as _, i (i)}
          <SoccerArt id={i < starsForGoals(goals) ? 'star' : 'star-outline'} size={26} />
        {/each}
      </div>
      <LadderActions
        gameId="soccer"
        {level}
        backHref="/"
        nextHref="/games/soccer"
        replayHref="/games/soccer"
        onnext={advanceLevel}
        onreplay={replayLevel}
      />
    </WinOverlay>
  </div>
{/if}

<style>
  .soccer-game {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 2px 8px 0;
    overflow: hidden;
    background: #0c1224;
  }
  .stadium {
    position: relative;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    border-radius: 20px;
    overflow: hidden;
    border: 2px solid rgba(255, 224, 130, 0.28);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    background: #0b1230;
  }
  .sky {
    position: relative;
    flex: 0 0 50px;
    overflow: hidden;
    background: linear-gradient(180deg, #0a1030, #1b2a4c);
  }
  .floodlight {
    position: absolute;
    top: -24px;
    width: 122px;
    height: 82px;
    border-radius: 50%;
    background: radial-gradient(closest-side, rgba(255, 248, 220, 0.85), transparent 72%);
    animation: flicker 4.5s ease-in-out infinite;
    pointer-events: none;
  }
  .floodlight.l1 {
    left: -30px;
  }
  .floodlight.l2 {
    right: -30px;
    animation-delay: -2.2s;
  }
  .crowd {
    position: absolute;
    inset: auto 0 0 0;
    height: 22px;
    background:
      radial-gradient(circle at 8% 42%, #2a3654 0 5px, transparent 6px),
      radial-gradient(circle at 20% 62%, #33415f 0 5px, transparent 6px),
      radial-gradient(circle at 32% 36%, #2a3654 0 5px, transparent 6px),
      radial-gradient(circle at 44% 60%, #33415f 0 5px, transparent 6px),
      radial-gradient(circle at 56% 38%, #2a3654 0 5px, transparent 6px),
      radial-gradient(circle at 68% 62%, #33415f 0 5px, transparent 6px),
      radial-gradient(circle at 80% 40%, #2a3654 0 5px, transparent 6px),
      radial-gradient(circle at 92% 58%, #33415f 0 5px, transparent 6px);
    animation: sway 6s ease-in-out infinite;
    pointer-events: none;
  }
  .scoreboard {
    position: absolute;
    top: 5px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 3;
    pointer-events: none;
  }
  .field {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    cursor: crosshair;
    background:
      repeating-linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.055) 0 34px,
        rgba(0, 0, 0, 0.025) 34px 68px
      ),
      radial-gradient(120% 70% at 50% 0%, #4f8a4b 0%, #3a6e3a 55%, #2d5a30 100%);
    box-shadow: inset 0 14px 30px rgba(0, 0, 0, 0.3);
  }
  .goal {
    position: absolute;
    border: 4px solid #f7f7f2;
    border-bottom: 0;
    border-radius: 3px 3px 0 0;
    background: rgba(10, 20, 40, 0.26);
    transition: left 0.3s, width 0.3s, background 0.2s;
    z-index: 2;
  }
  .goal.flash {
    background: rgba(255, 224, 130, 0.4);
    box-shadow: 0 0 22px rgba(255, 224, 130, 0.55);
  }
  .net {
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.3) 0 1px, transparent 1px 11px),
      repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.3) 0 1px, transparent 1px 11px);
    opacity: 0.55;
  }
  .post {
    position: absolute;
    top: -6px;
    bottom: -6px;
    width: 5px;
    border-radius: 2px;
    background: #f7f7f2;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  }
  .post.left {
    left: -6px;
  }
  .post.right {
    right: -6px;
  }
  .open-glow {
    position: absolute;
    top: 6%;
    width: 48px;
    height: 48px;
    transform: translate(-50%, 0);
    border-radius: 50%;
    background: radial-gradient(closest-side, rgba(255, 224, 130, 0.55), transparent 72%);
    animation: glow 1.6s ease-in-out infinite;
    pointer-events: none;
  }
  .keeper {
    position: absolute;
    top: 18%;
    z-index: 4;
    transform-origin: 50% 62%;
    transition: left 0.06s linear;
    filter: drop-shadow(0 5px 6px rgba(0, 0, 0, 0.4));
    pointer-events: none;
  }
  .keeper.diving {
    transition: left 0.06s linear, transform 0.14s ease;
  }
  .spot {
    position: absolute;
    left: 50%;
    top: 82%;
    width: 10px;
    height: 5px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.55);
    pointer-events: none;
  }
  .striker {
    position: absolute;
    left: 42%;
    top: 86%;
    transform: translate(-50%, -50%) rotate(-4deg);
    filter: drop-shadow(0 5px 6px rgba(0, 0, 0, 0.35));
    pointer-events: none;
    z-index: 3;
  }
  .ball {
    position: absolute;
    z-index: 6;
    transform: translate(-50%, -50%);
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.35));
    pointer-events: none;
  }
  .ball-art {
    display: inline-flex;
  }
  .ball-spin {
    display: inline-flex;
  }
  .ball-spin.spin {
    animation: ballspin 0.7s linear infinite;
  }
  .aim {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 4;
  }
  .aim path {
    fill: none;
    stroke: #fff8ec;
    stroke-width: 0.7;
    stroke-dasharray: 2 2;
    opacity: 0.85;
  }
  .reticle {
    position: absolute;
    width: 26px;
    height: 26px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 3px solid #ffe082;
    box-shadow: 0 0 12px rgba(255, 224, 130, 0.7);
    pointer-events: none;
    z-index: 5;
  }
  .reticle.on-target {
    border-color: #8ef0a8;
    box-shadow: 0 0 12px rgba(142, 240, 168, 0.75);
  }
  .reticle.on-target::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 6px;
    height: 6px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: #8ef0a8;
  }
  .glove-beat {
    position: absolute;
    transform: translate(-50%, -50%);
    z-index: 9;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.45));
    pointer-events: none;
    animation: gloveBeat 0.45s ease-out both;
  }
  @keyframes gloveBeat {
    0% {
      transform: translate(-50%, -50%) scale(0.5) rotate(-16deg);
      opacity: 0;
    }
    55% {
      transform: translate(-50%, -50%) scale(1.18) rotate(4deg);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(1) rotate(0);
      opacity: 1;
    }
  }
  .callout {
    position: absolute;
    top: 24%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 8;
    font-size: 30px;
    font-weight: 800;
    letter-spacing: 1px;
    text-align: center;
    color: #fff;
    text-shadow: 0 2px 0 #0b3d1e, 0 0 18px rgba(255, 224, 130, 0.9);
    pointer-events: none;
    animation: popIn 0.22s ease-out;
  }
  .callout.save {
    color: #dff2ff;
    text-shadow: 0 2px 0 #0d2744, 0 0 14px rgba(127, 216, 255, 0.8);
  }
  .callout.miss {
    color: #f3ecff;
    text-shadow: 0 2px 0 #241a3d, 0 0 14px rgba(200, 180, 255, 0.55);
  }
  .hint {
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translateX(-50%);
    width: 76%;
    margin: 0;
    text-align: center;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.3;
    color: #fff;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.65);
    pointer-events: none;
    z-index: 7;
  }
  .soccer-game :global(.ladder-bar) {
    margin: 0;
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
  .card-wrap {
    position: absolute;
    inset: 0;
    z-index: 20;
    display: grid;
    place-items: center;
    padding: 12px;
    background: rgba(6, 12, 24, 0.6);
    backdrop-filter: blur(2px);
  }
  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    max-width: 88%;
    padding: 24px 28px;
    border-radius: 24px;
    background: linear-gradient(160deg, #fff8ec, #ffe7c2);
    border: 2px solid rgba(255, 224, 130, 0.85);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
    animation: popIn 0.3s ease-out;
  }
  .card-title {
    font-size: 24px;
    font-weight: 700;
    color: #5a3b12;
  }
  .card-sub {
    font-size: 13px;
    text-align: center;
    color: #7a5a33;
  }
  .actions {
    display: flex;
    gap: 8px;
    margin-top: 4px;
  }
  .primary {
    min-height: 48px;
    padding: 10px 20px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
    color: #2a1b3d;
    background: #ffe082;
    box-shadow: 0 3px 0 #c9a836;
  }
  .primary:active {
    transform: scale(0.96);
  }
  .ghost {
    display: inline-flex;
    align-items: center;
    min-height: 48px;
    padding: 10px 18px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
    color: #5a3b12;
    text-decoration: none;
    background: rgba(255, 224, 130, 0.18);
    border: 2px solid rgba(90, 59, 18, 0.2);
  }
  .win-wrap {
    display: contents;
  }
  /* WinOverlay always mounts Confetti/Starfield. A child who asked for reduced
     motion gets the win card without the falling celebration. */
  .win-wrap.calm :global(.confetti-container),
  .win-wrap.calm :global(.starfield) {
    display: none;
  }
  .earned-stars {
    display: flex;
    gap: 6px;
    filter: drop-shadow(0 0 6px rgba(242, 193, 78, 0.45));
  }
  .stadium.reduced .floodlight,
  .stadium.reduced .crowd,
  .stadium.reduced .open-glow,
  .stadium.reduced .glove-beat {
    animation: none;
  }
  @keyframes flicker {
    0%,
    100% {
      opacity: 0.75;
    }
    48% {
      opacity: 0.95;
    }
    52% {
      opacity: 0.68;
    }
    70% {
      opacity: 0.86;
    }
  }
  @keyframes sway {
    0%,
    100% {
      transform: translateX(-2px);
    }
    50% {
      transform: translateX(2px);
    }
  }
  @keyframes glow {
    0%,
    100% {
      opacity: 0.35;
    }
    50% {
      opacity: 0.85;
    }
  }
  @keyframes ballspin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
