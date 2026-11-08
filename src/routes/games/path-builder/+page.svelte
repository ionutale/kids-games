<script>
  // Path Builder — the Forest Road. A continuous portrait forest: draw a
  // freehand road from the cottage to the cabin, avoid rocks/ponds/hedges,
  // then the fox walks it and gathers Stars. No timer, no fail state.
  import { onMount } from 'svelte';
  import { _ } from '#lib/stores/locale.js';
  import GameShell from '#lib/components/ui/GameShell.svelte';
  import HudPill from '#lib/components/ui/HudPill.svelte';
  import WinOverlay from '#lib/components/ui/WinOverlay.svelte';
  import LadderBar from '#lib/ladder/LadderBar.svelte';
  import LadderActions from '#lib/ladder/LadderActions.svelte';
  import { loadLevel, saveLevel, loadMastered, saveMastered } from '#lib/ladder/progress.js';
  import { prefersReducedMotion, reducedMotion } from '#lib/stores/reducedMotion.js';
  import Icons from '#lib/path-builder/Icons.svelte';
  import { createForestSound } from '#lib/path-builder/sound.js';
  import {
    W,
    H,
    LEVELS,
    LAYOUTS,
    BLOCKER_PAD,
    TRUNCATE_RADIUS,
    CONTINUE_RADIUS,
    sceneFor,
    roadReachesDestination,
    blockerHit,
    clipSegmentToCircle,
    dist,
    near,
    nearestRoadIndex,
    pointAt,
    pathLength,
    starCollected,
    hasRequiredStars
  } from '#lib/path-builder/scene.js';

  const GHOST_KEY = 'path-builderGhostSeen';
  const IDLE_MS = 6000;
  const GUIDE_MS = 3800;

  const initialLevel = loadLevel('path-builder');
  const firstScene = sceneFor(initialLevel, 0);

  let level = $state(initialLevel);
  let mastered = $state(loadMastered('path-builder'));
  let layout = $state(0);
  let scene = $state(firstScene);
  let road = $state([]);
  let walker = $state({ ...firstScene.home, angle: 0 });
  let drawing = $state(false);
  let walking = $state(false);
  let collected = $state([]);
  let solved = $state(false);
  let needsStars = $state(false);
  let guide = $state(false);
  let ghost = $state(null);
  let hitBlocker = $state(-1);
  let roundDone = $state(false);
  let levelDone = $state(null);
  let won = $state(false);

  let svgEl;
  let raf = 0;
  let ghostRaf = 0;
  let idleTimer = null;
  let guideTimer = null;
  let advanceTimer = null;
  let pulseTimer = null;
  let levelDoneTimer = null;
  let ghostTimer = null;

  const sound = createForestSound();

  const trees = [
    { x: 52, y: 140, s: 52 },
    { x: 566, y: 190, s: 46 },
    { x: 46, y: 410, s: 60 },
    { x: 574, y: 500, s: 54 },
    { x: 58, y: 740, s: 64 },
    { x: 560, y: 830, s: 58 },
    { x: 84, y: 930, s: 50 },
    { x: 540, y: 960, s: 48 }
  ];

  const fireflies = [
    { x: 150, y: 250 },
    { x: 470, y: 300 },
    { x: 90, y: 560 },
    { x: 540, y: 620 },
    { x: 200, y: 940 },
    { x: 460, y: 900 }
  ];

  const mushrooms = [
    { x: 70, y: 640, s: 26 },
    { x: 548, y: 700, s: 22 },
    { x: 110, y: 960, s: 24 },
    { x: 520, y: 950, s: 20 }
  ];

  const reduced = $derived($reducedMotion);

  function ghostAlreadySeen() {
    try {
      return localStorage.getItem(GHOST_KEY) === '1';
    } catch {
      return true;
    }
  }

  function markGhostSeen() {
    try {
      localStorage.setItem(GHOST_KEY, '1');
    } catch {
      // Private mode: the demonstration simply appears again next time.
    }
  }

  function toScene(event) {
    const ctm = svgEl?.getScreenCTM?.();
    if (!ctm) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse());
    return { x: point.x, y: point.y };
  }

  function roadConnects() {
    return roadReachesDestination(scene, road);
  }

  function armIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (walking || drawing || solved || roundDone || roadConnects()) return;
      guide = true;
      clearTimeout(guideTimer);
      guideTimer = setTimeout(() => {
        guide = false;
        armIdle();
      }, GUIDE_MS);
    }, IDLE_MS);
  }

  function dismissGuidance() {
    guide = false;
    clearTimeout(guideTimer);
    if (ghost) {
      cancelAnimationFrame(ghostRaf);
      clearTimeout(ghostTimer);
      ghost = null;
      markGhostSeen();
    }
  }

  function playGhost() {
    if (ghostAlreadySeen()) return;
    const start = pointAt(scene.route, 0.04);
    if (!start) return;
    if (prefersReducedMotion()) {
      // No drift under reduced motion: a still hand rests on the first road.
      ghost = start;
      ghostTimer = setTimeout(() => {
        ghost = null;
        markGhostSeen();
      }, 2600);
      return;
    }
    ghost = start;
    const began = performance.now();
    const duration = 2400;
    const frame = (now) => {
      const t = Math.min(1, (now - began) / duration);
      ghost = pointAt(scene.route, t);
      if (t < 1) ghostRaf = requestAnimationFrame(frame);
      else {
        ghost = null;
        // Only a finished demonstration counts as seen, so a first-visit reload
        // that interrupts it plays the hand again.
        markGhostSeen();
      }
    };
    ghostRaf = requestAnimationFrame(frame);
  }

  function resetRound() {
    cancelAnimationFrame(raf);
    cancelAnimationFrame(ghostRaf);
    clearTimeout(advanceTimer);
    clearTimeout(pulseTimer);
    clearTimeout(ghostTimer);
    drawing = false;
    walking = false;
    solved = false;
    roundDone = false;
    needsStars = false;
    guide = false;
    ghost = null;
    hitBlocker = -1;
    road = [];
    collected = [];
    walker = { ...scene.home, angle: 0 };
    armIdle();
  }

  function loadRound() {
    scene = sceneFor(level, layout);
    resetRound();
  }

  function startDrawing(event) {
    if (walking || solved || roundDone || won) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const p = toScene(event);
    if (!p) return;
    if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) return;

    dismissGuidance();
    sound.unlock();

    if (road.length === 0) {
      // Start anywhere: seed the road at Home, then draw toward the press.
      road = [{ ...scene.home }];
      if (dist(p, scene.home) > 6 && !blockerHit(scene.blockers, scene.home, p)) {
        road = [...road, p];
      }
    } else {
      const tip = road[road.length - 1];
      const idx = nearestRoadIndex(road, p, TRUNCATE_RADIUS);
      if (idx >= 0) {
        // Rubbing back over the road erases everything after that point.
        road = road.slice(0, Math.max(1, idx + 1));
      } else if (!near(p, tip, CONTINUE_RADIUS)) {
        return;
      }
    }

    drawing = true;
    needsStars = false;
    window.addEventListener('pointermove', moveDrawing);
    window.addEventListener('pointerup', endDrawing);
    window.addEventListener('pointercancel', endDrawing);
    event.preventDefault?.();
  }

  function moveDrawing(event) {
    if (!drawing) return;
    const p = toScene(event);
    if (!p) return;
    if (p.x < 14 || p.x > W - 14 || p.y < 14 || p.y > H - 14) return;
    const last = road[road.length - 1];
    if (!last || dist(p, last) < 6) return;

    const hit = blockerHit(scene.blockers, last, p);
    if (hit) {
      // Stop at the Blocker edge and keep the last valid point.
      const edge = clipSegmentToCircle(last, p, hit, hit.r + BLOCKER_PAD);
      if (edge && dist(edge, last) > 5) road = [...road, edge];
      hitBlocker = scene.blockers.indexOf(hit);
      sound.bump();
      clearTimeout(pulseTimer);
      pulseTimer = setTimeout(() => {
        hitBlocker = -1;
      }, 360);
      return;
    }

    road = [...road, p];
    sound.scratch();
    event.preventDefault?.();
  }

  function endDrawing() {
    if (!drawing) return;
    drawing = false;
    window.removeEventListener('pointermove', moveDrawing);
    window.removeEventListener('pointerup', endDrawing);
    window.removeEventListener('pointercancel', endDrawing);
    if (roadConnects()) walk();
    else armIdle();
  }

  function walk() {
    if (walking || solved || road.length < 2) return;
    const path = road.map((p) => ({ x: p.x, y: p.y }));
    walking = true;
    guide = false;
    needsStars = false;
    walker = pointAt(path, 0);
    const duration = Math.min(5200, Math.max(750, pathLength(path) * 1.9));
    const began = performance.now();
    let lastStep = 0;

    const frame = (now) => {
      const t = Math.min(1, (now - began) / duration);
      walker = pointAt(path, t);
      if (now - lastStep > 200) {
        sound.step();
        lastStep = now;
      }
      for (const star of scene.stars) {
        if (!collected.includes(star.id) && starCollected(walker, star)) {
          collected = [...collected, star.id];
          sound.star();
        }
      }
      if (t < 1) raf = requestAnimationFrame(frame);
      else finishWalk();
    };
    raf = requestAnimationFrame(frame);
  }

  function finishWalk() {
    walking = false;
    if (hasRequiredStars(scene, collected)) {
      solved = true;
      roundDone = true;
      sound.arrive();
      clearTimeout(advanceTimer);
      advanceTimer = setTimeout(advance, 1500);
    } else {
      // A missed required Star: the fox goes home, the road stays editable.
      walker = { ...scene.home, angle: 0 };
      needsStars = true;
      armIdle();
    }
  }

  function advance() {
    clearTimeout(advanceTimer);
    if (layout < LAYOUTS - 1) {
      layout += 1;
      loadRound();
      return;
    }
    if (level < LEVELS) {
      const finished = level;
      level += 1;
      layout = 0;
      saveLevel('path-builder', level);
      loadRound();
      levelDone = finished;
      clearTimeout(levelDoneTimer);
      levelDoneTimer = setTimeout(() => {
        levelDone = null;
      }, 1800);
      return;
    }
    // Top of the ladder: keep the mastery moment and never auto-advance past it.
    mastered = true;
    saveMastered('path-builder');
    won = true;
  }

  function redraw() {
    if (won) return;
    resetRound();
  }

  function pickLevel(n) {
    clearTimeout(levelDoneTimer);
    level = n;
    layout = 0;
    levelDone = null;
    won = false;
    saveLevel('path-builder', n);
    loadRound();
  }

  function replayLevel(event) {
    event?.preventDefault();
    won = false;
    layout = 0;
    loadRound();
  }

  function routeD() {
    return scene.route
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');
  }

  function roadD() {
    return road
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');
  }

  onMount(() => {
    resetRound();
    playGhost();
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(ghostRaf);
      clearTimeout(idleTimer);
      clearTimeout(guideTimer);
      clearTimeout(advanceTimer);
      clearTimeout(pulseTimer);
      clearTimeout(levelDoneTimer);
      clearTimeout(ghostTimer);
      window.removeEventListener('pointermove', moveDrawing);
      window.removeEventListener('pointerup', endDrawing);
      window.removeEventListener('pointercancel', endDrawing);
      sound.dispose();
    };
  });
</script>

<GameShell accent="#F6B26B">
  {#snippet hudLeft()}
    <HudPill icon="🚩" label={`${level}/${LEVELS}`} />
    {#if scene.stars.length > 0}
      <HudPill icon="⭐" label={`${collected.length}/${scene.stars.length}`} />
    {/if}
  {/snippet}

  <div
    class="pb"
    data-testid="pb-root"
    data-level={level}
    data-road={layout + 1}
    data-state={solved ? 'solved' : needsStars ? 'missed' : walking ? 'walking' : 'drawing'}
  >
    <div class="pb-board-wrap">
      <svg
        bind:this={svgEl}
        class="board"
        viewBox="0 0 {W} {H}"
        preserveAspectRatio="xMidYMid meet"
        role="application"
        aria-label={$_('pbDrawRoad')}
        data-testid="scene"
        onpointerdown={startDrawing}
      >
        <defs>
          <linearGradient id="pb-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#3b2b4a" />
            <stop offset=".55" stop-color="#5a3d45" />
            <stop offset="1" stop-color="#6b4a2f" />
          </linearGradient>
          <filter id="pb-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000" flood-opacity=".35" />
          </filter>
        </defs>

        <rect width={W} height={H} fill="url(#pb-sky)" />
        <circle cx="500" cy="110" r="42" fill="#ffe3a3" opacity=".28" />
        <ellipse cx="310" cy="560" rx="330" ry="470" fill="#4a5a34" opacity=".55" />
        <ellipse cx="310" cy="620" rx="296" ry="400" fill="#5d6b3c" opacity=".55" />

        <g aria-hidden="true">
          {#each trees as t (t.x + '-' + t.y)}
            <g transform="translate({t.x - t.s / 2},{t.y - t.s / 2})" opacity=".9">
              <Icons id="tree" size={t.s} />
            </g>
          {/each}
        </g>

        {#if !reduced}
          <g aria-hidden="true" data-testid="fireflies">
            {#each fireflies as f, i (i)}
              <circle class="fly" cx={f.x} cy={f.y} r="3.2" fill="#ffe3a3" style:animation-delay="{-i * 1.3}s" />
            {/each}
          </g>
        {/if}

        <g aria-hidden="true">
          {#each mushrooms as m, i (i)}
            <g transform="translate({m.x - m.s / 2},{m.y - m.s / 2})" opacity=".9">
              <Icons id="mushroom" size={m.s} />
            </g>
          {/each}
        </g>

        <g
          role="img"
          aria-label={$_('pbHome')}
          data-testid="home"
          data-x={scene.home.x}
          data-y={scene.home.y}
          transform="translate({scene.home.x - 43},{scene.home.y - 43})"
        >
          <Icons id="home" size={86} />
        </g>
        <g
          role="img"
          aria-label={$_('pbDest')}
          data-testid="destination"
          data-x={scene.dest.x}
          data-y={scene.dest.y}
          transform="translate({scene.dest.x - 43},{scene.dest.y - 43})"
        >
          <Icons id="dest" size={86} />
        </g>

        {#each scene.blockers as b, i (i)}
          <g
            transform="translate({b.x - b.r},{b.y - b.r})"
            style:filter="url(#pb-soft)"
            data-testid="blocker"
            data-kind={b.kind}
            data-x={b.x}
            data-y={b.y}
            data-r={b.r}
          >
            <g class:blocked={hitBlocker === i}>
              <Icons id={b.kind} size={b.r * 2} />
            </g>
          </g>
        {/each}

        {#if guide}
          <path
            class="guide"
            class:still={reduced}
            data-testid="guide"
            d={routeD()}
            fill="none"
            stroke="#ffe3a3"
            stroke-width="7"
            stroke-linecap="round"
            stroke-dasharray="2 18"
            opacity=".55"
            aria-hidden="true"
          />
        {/if}

        <path
          data-testid="road"
          data-points={road.length}
          d={roadD()}
          fill="none"
          stroke="#8a5a34"
          stroke-width="22"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d={roadD()}
          fill="none"
          stroke="#ffe9c9"
          stroke-width="3"
          stroke-linecap="round"
          stroke-dasharray="10 16"
          opacity=".8"
          aria-hidden="true"
        />

        {#each scene.stars as star (star.id)}
          {@const got = collected.includes(star.id)}
          <g
            data-testid="star"
            data-x={star.x}
            data-y={star.y}
            data-required={star.required}
            aria-hidden="true"
          >
            <circle cx={star.x} cy={star.y} r="42" fill="#ffe3a3" opacity={got ? 0 : 0.16} />
            <g transform="translate({star.x - 22},{star.y - 22})">
              <g class:got>
                <Icons id="star" size={44} />
              </g>
            </g>
          </g>
        {/each}

        <g
          data-testid="walker"
          data-x={walker.x}
          data-y={walker.y}
          transform="translate({walker.x - 50},{walker.y - 66})"
          style:filter="url(#pb-soft)"
        >
          <g class:bob={walking && !reduced}>
            <Icons id="fox" size={80} />
          </g>
        </g>

        {#if ghost}
          <g
            data-testid="ghost-hand"
            transform="translate({ghost.x - 22},{ghost.y - 22})"
            opacity=".85"
            aria-hidden="true"
          >
            <Icons id="hand" size={44} />
          </g>
        {/if}
      </svg>

      <button class="pb-redraw" type="button" onclick={redraw} aria-label={$_('pbRedraw')}>
        <span aria-hidden="true">↺</span>
        <span class="pb-redraw-text">{$_('pbRedraw')}</span>
      </button>

      {#if roundDone && !won}
        <div class="pb-round-done" data-testid="round-done" role="status">
          <p class="pb-round-title">{$_('pbMadeIt')}</p>
          <button class="pb-next" type="button" onclick={advance}>{$_('pbNextRoad')} ▶</button>
        </div>
      {/if}

      {#if levelDone}
        <div class="pb-level-done" data-testid="level-overlay" role="status">
          <p>{$_('levelComplete', { n: levelDone })}</p>
        </div>
      {/if}
    </div>

    <p class="pb-status" data-testid="pb-status" aria-live="polite">
      {#if solved}
        {$_('pbMadeIt')}
      {:else if needsStars}
        {$_('pbMissedStar')}
      {:else if walking}
        {$_('pbWalking')}
      {:else}
        {$_('pbDrawRoad')}
      {/if}
    </p>

    <p class="pb-summary" data-testid="pb-summary" aria-live="polite">
      {$_('pbLevelOf', { n: level, m: LEVELS })}, {$_('pbRoadOf', { n: layout + 1, m: LAYOUTS })}.
      {#if scene.stars.length > collected.length}
        {$_('pbStarsLeft', { n: scene.stars.length - collected.length })}
      {/if}
    </p>

    <LadderBar current={level} {mastered} onchange={pickLevel} />
  </div>
</GameShell>

{#if won}
  <WinOverlay title={$_('wellDone')} subtitle={$_('pbMadeIt')}>
    <LadderActions
      gameId="path-builder"
      {level}
      backHref="/"
      replayHref="/games/path-builder"
      onreplay={replayLevel}
    />
  </WinOverlay>
{/if}

<style>
  .pb {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-height: 0;
    padding: 2px 8px 0;
    background: #1f1722;
    overflow: hidden;
  }
  .pb-board-wrap {
    position: relative;
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    container-type: size;
  }
  .board {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 20px;
    border: 2px solid rgba(255, 205, 140, 0.35);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }
  /* Keep the portrait Scene's 620:1000 ratio so the art never stretches. */
  @supports (width: 1cqw) {
    .board {
      width: min(100cqw, 62cqh);
      height: min(100cqh, 161.29cqw);
    }
  }
  .pb-redraw {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 3;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 48px;
    padding: 8px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
    color: #3a271b;
    background: #f6b26b;
    box-shadow: 0 3px 0 #c98445;
  }
  .pb-redraw:active { transform: scale(0.96); }
  .pb-redraw span[aria-hidden] { font-size: 18px; }
  .pb-status {
    margin: 2px 0 0;
    min-height: 18px;
    text-align: center;
    font-size: 13px;
    font-weight: 600;
    color: #ffe6c4;
  }
  .pb-summary {
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
  .pb-round-done {
    position: absolute;
    inset: 0;
    z-index: 4;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    border-radius: 20px;
    background: rgba(20, 12, 10, 0.55);
  }
  .pb-round-title {
    font-size: 24px;
    font-weight: 700;
    color: #ffe3a3;
    text-align: center;
    padding: 0 16px;
  }
  .pb-next {
    min-height: 52px;
    padding: 10px 22px;
    border-radius: 18px;
    font-size: 15px;
    font-weight: 700;
    color: #3a271b;
    background: #f6b26b;
    box-shadow: 0 3px 0 #c98445;
  }
  .pb-level-done {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 5;
    transform: translate(-50%, -50%);
    padding: 18px 26px;
    border-radius: 20px;
    text-align: center;
    font-size: 20px;
    font-weight: 700;
    color: #ffe3a3;
    background: rgba(20, 12, 10, 0.8);
    pointer-events: none;
  }
  .guide { animation: pbGuideFade 3.8s ease-in-out; }
  .guide.still { animation: none; opacity: 0.55; }
  .blocked { animation: pbNudge 0.3s ease-in-out; }
  .bob { animation: pbBob 0.35s ease-in-out infinite; }
  .fly {
    animation: pbDrift 7s ease-in-out infinite;
    filter: drop-shadow(0 0 6px rgba(255, 214, 140, 0.8));
  }
  .got {
    opacity: 0.3;
    transform: scale(0.65);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  @keyframes pbGuideFade {
    0% { opacity: 0; }
    15%, 80% { opacity: 0.55; }
    100% { opacity: 0; }
  }
  @keyframes pbNudge {
    0%, 100% { transform: translate(0, 0); }
    30% { transform: translate(-4px, 2px); }
    70% { transform: translate(4px, -2px); }
  }
  @keyframes pbBob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
  @keyframes pbDrift {
    0%, 100% { transform: translate(0, 0); opacity: 0.2; }
    35% { transform: translate(12px, -18px); opacity: 0.95; }
    70% { transform: translate(-8px, -30px); opacity: 0.5; }
  }
</style>
