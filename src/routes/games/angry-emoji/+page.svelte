<script>
  import { onMount, onDestroy } from 'svelte';
  import { _ } from '$lib/stores/locale';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import HudPill from '$lib/components/ui/HudPill.svelte';
  import BigButton from '$lib/components/ui/BigButton.svelte';
  import Confetti from '$lib/components/Confetti.svelte';
  import { playPop, playMatch } from '$lib/sounds/audioManager.js';
  import { playFlashWhoosh, fanfare } from '$lib/sounds/trainerSounds.js';
  import { createWorld, addBody, step as physStep, cull, MATERIALS } from '$lib/angry-emoji/phys.js';
  import { getLevel, WORLD_W, WORLD_H, GROUND_Y, SLING } from '$lib/angry-emoji/levels.js';
  import { levelMaxScore, starsFor, POINTS } from '$lib/angry-emoji/score.js';

  const BIRD_EMOJI = { bird: '😡', birdFire: '🐦‍🔥', ball: '🧱' };
  const TARGET_EMOJI = { targetBasic: '😠', targetTough: '🤬', targetBoss: '👿' };
  const BLOCK_EMOJI = { wood: '🪵', ice: '🧊', stone: '🪨' };

  let screen = $state('select'); // select | playing | levelEnd
  let levelN = $state(1);
  let paused = $state(false);
  let world = null;
  let frameBodies = $state([]);
  let shotsLeft = $state(0);
  let score = $state(0);
  let targetsTotal = $state(0);
  let targetsBroken = $state(0);
  let outcome = $state(null); // {stars, score} or 'failed'
  let bestStars = $state({});
  let newBestStars = $state(false);

  let raf = null;
  let stageWidth = $state(0);
  let stageHeight = $state(0);
  const worldScale = $derived.by(() => {
    if (stageWidth <= 0 || stageHeight <= 0) return 1;
    return Math.min(stageWidth / WORLD_W, stageHeight / WORLD_H);
  });
  const worldOffsetX = $derived((stageWidth - WORLD_W * worldScale) / 2);
  const worldOffsetY = $derived((stageHeight - WORLD_H * worldScale) / 2);
  let settling = false;
  let settleFrames = 0;
  let dragging = null; // {x,y}
  let aimPoint = null;

  const def = $derived(getLevel(levelN));

  function loadStars() {
    try {
      bestStars = JSON.parse(localStorage.getItem('angry-emoji-levels') || '{}');
    } catch {
      bestStars = {};
    }
  }

  function saveStar(n, stars) {
    if ((bestStars[n] ?? 0) >= stars) return;
    newBestStars = true;
    bestStars[n] = stars;
    localStorage.setItem('angry-emoji-levels', JSON.stringify(bestStars));
  }

  function tierUnlocked(tier) {
    return tier === 1 || (bestStars[(tier - 1) * 5] ?? 0) > 0;
  }

  function startLevel(n) {
    if (raf) cancelAnimationFrame(raf); // never run two physics loops (B2)
    levelN = n;
    loadStars();
    const d = getLevel(n);
    world = createWorld();
    world.brokenLog = [];
    addBody(world, { x: WORLD_W / 2, y: GROUND_Y + 20, w: WORLD_W * 2, h: 40, type: 'ground', isStatic: true });
    for (const b of d.blocks) addBody(world, b);
    for (const t of d.targets) {
      addBody(world, { x: t.x, y: t.y, w: 40, h: 48, type: t.type });
    }
    shotsLeft = d.ammo;
    score = 0;
    targetsTotal = d.targets.length;
    targetsBroken = 0;
    outcome = null;
    newBestStars = false;
    settling = false;
    dragging = null;
    aimPoint = null;
    screen = 'playing';
    lastTs = 0;
    raf = requestAnimationFrame(frame);
  }

  // ---- slingshot ----
  let activePointerId = null;
  const inGrabZone = (p) =>
    Math.hypot(p.x - SLING.x, p.y - SLING.y) < 150 ||
    (p.x < WORLD_W * 0.5 && p.y > WORLD_H * 0.45); // forgiving lower-left quadrant

  function down(e) {
    if (screen !== 'playing' || paused || shotsLeft <= 0) return;
    if (activePointerId !== null) return; // single-touch lock
    const p = toWorld(e);
    if (inGrabZone(p)) {
      activePointerId = e.pointerId;
      dragging = p;
      aimPoint = p;
      e.preventDefault();
    }
  }
  function move(e) {
    if (!dragging || e.pointerId !== activePointerId) return;
    aimPoint = toWorld(e);
    e.preventDefault();
  }
  function up(e) {
    if (!dragging || (e.pointerId !== undefined && e.pointerId !== activePointerId)) return;
    activePointerId = null;
    if (!dragging) return;
    const dx = SLING.x - aimPoint.x;
    const dy = SLING.y - aimPoint.y;
    const len = Math.hypot(dx, dy);
    dragging = null;
    aimPoint = null;
    if (len < 30) return;
    const speed = Math.min(1750, len * 9);
    const kind = nextBirdKind();
    addBody(world, {
      x: SLING.x + 26,
      y: SLING.y - 26,
      w: 26,
      h: 26,
      type: kind,
      vx: (dx / len) * speed,
      vy: (dy / len) * speed
    });
    playFlashWhoosh();
    shotsLeft -= 1;
    settling = true;
    settleFrames = 0;
  }

  function nextBirdKind() {
    const d = getLevel(levelN);
    if (d.tier === 4 && shotsLeft === 3) return 'birdFire'; // open T4 levels with fire
    if (d.tier === 4) return 'ball';
    return 'bird';
  }

  function toWorld(e) {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * WORLD_W,
      y: ((e.clientY - r.top) / r.height) * WORLD_H
    };
  }

  // ---- game loop ----
  let lastTs = 0;
  function frame(ts) {
    if (screen !== 'playing') return;
    if (!lastTs) lastTs = ts;
    const dt = Math.min((ts - lastTs) / 1000, 1 / 30);
    lastTs = ts;
    if (!paused) {
      physStep(world, dt);
      cull(world, { maxX: WORLD_W + 450, maxY: WORLD_H + 600 });

      // scoring from this step's break log (targets 10 / blocks 5 — B1)
      for (const b of world.brokenLog.splice(0)) {
        if (b.type.startsWith('target')) {
          score += POINTS.target;
          targetsBroken += 1;
          playMatch();
        } else {
          score += POINTS.block;
          playPop();
        }
      }

      if (settling) {
        const moving = world.bodies.some(
          (b) => !b.isStatic && (Math.abs(b.vx) > 8 || Math.abs(b.vy) > 8)
        );
        if (!moving || settleFrames++ > 180) evaluateEnd();
      }
    }
    frameBodies = world.bodies.map((b) => ({
      id: b.id,
      x: b.x,
      y: b.y,
      w: b.w,
      h: b.h,
      type: b.type,
      hpRatio: b.hp === Infinity ? 1 : Math.max(0, b.hp / b.maxHp),
      isTarget: b.type.startsWith('target')
    }));
    raf = requestAnimationFrame(frame);
  }

  function evaluateEnd() {
    settling = false;
    const remainingTargets = world.bodies.filter((b) => b.type.startsWith('target')).length;
    if (remainingTargets === 0) {
      score += shotsLeft * POINTS.unusedShot; // bonus per unused shot
      const maxScore = levelMaxScore(getLevel(levelN));
      const stars = starsFor(score, maxScore, targetsTotal - remainingTargets);
      outcome = { stars, score };
      saveStar(levelN, stars);
      if (stars >= 2) fanfare(1.15);
      else playMatch();
      screen = 'levelEnd';
    } else if (shotsLeft <= 0) {
      outcome = 'failed';
      screen = 'levelEnd';
    }
  }

  function visibility() {
    if (screen === 'playing') paused = true;
  }

  onMount(() => {
    loadStars();
    document.addEventListener('visibilitychange', visibility);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      if (raf) cancelAnimationFrame(raf);
    };
  });

</script>

<GameShell accent="#F87171">
  <div class="angry" data-testid="angry-root">
    {#if screen === 'select'}
      <h1 class="title">😡 {$_('angryEmoji')}</h1>
      <div class="tiers">
        {#each [1, 2, 3, 4] as tier}
          {@const unlocked = tierUnlocked(tier)}
          <div class="tier" class:locked={!unlocked}>
            <p class="tier-name">{unlocked ? '🔓' : '🔒'} {$_('tierLabel', { n: tier })}</p>
            <div class="lvl-grid">
              {#each Array(5) as _, i}
                {@const n = (tier - 1) * 5 + i + 1}
                {@const stars = bestStars[n] ?? 0}
                <button class="lvl-btn" disabled={!unlocked} onclick={() => startLevel(n)} data-testid="level-{n}">
                  <span>{n}</span>
                  <span class="mini-stars">{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</span>
                </button>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="hud-row">
        <HudPill icon="⭐" label={String(score)} />
        <HudPill icon="🐦" label={String(shotsLeft)} />
        <HudPill icon="🎯" label={`${targetsBroken}/${targetsTotal}`} />
      </div>

      <div
        class="stage"
        bind:clientWidth={stageWidth}
        bind:clientHeight={stageHeight}
        data-testid="stage"
        onpointerdown={down}
        onpointermove={move}
        onpointerup={up}
        onpointercancel={up}
      >
        <div class="world" style:left="{worldOffsetX}px" style:top="{worldOffsetY}px" style:transform="scale({worldScale})">
        {#each frameBodies as b (b.id)}
          {#if b.type !== 'ground'}
            {@const cracked = b.hpRatio <= 0.4 && !b.isTarget}
            <div
              class="body {b.type}"
              class:cracked
              style:left="{b.x - b.w / 2}px"
              style:top="{b.y - b.h / 2}px"
              style:width="{b.w}px"
              style:height="{b.h}px"
              data-testid={b.isTarget ? 'target-body' : 'body'}
            >
              {#if b.isTarget}
                <span class="face">{TARGET_EMOJI[b.type]}</span>
                {#if b.hpRatio < 1}<span class="hpbar"><i style:width="{b.hpRatio * 100}%"></i></span>{/if}
              {:else if BIRD_EMOJI[b.type]}
                <span class="face">{BIRD_EMOJI[b.type]}</span>
              {:else}
                <span class="mat" style:--c={MATERIALS[b.type]?.color ?? '#ccc'}></span>
                {#if cracked}<span class="crack">💥</span>{/if}
              {/if}
            </div>
          {/if}
        {/each}

        {#if screen === 'playing'}
          <button class="pause-fab" aria-label="pause" data-testid="pause-btn" onclick={() => (paused = !paused)}>⏸️</button>
        {/if}

        <div class="sling" style:left="{SLING.x}px" style:top="{SLING.y}px"></div>
        {#if aimPoint}
          <svg class="aimline" viewBox="0 0 {WORLD_W} {WORLD_H}">
            <line x1={SLING.x} y1={SLING.y} x2={2 * SLING.x - aimPoint.x} y2={2 * SLING.y - aimPoint.y} stroke="#FFD54F" stroke-width="3" stroke-dasharray="6 8" opacity="0.8" />
          </svg>
        {/if}
        </div>

        {#if paused && screen === 'playing'}
          <div class="overlay">
            <p class="ov-title">⏸️</p>
            <BigButton onclick={() => (paused = false)}>▶ {$_('play')}</BigButton>
            <BigButton variant="ghost" onclick={() => (screen = 'select')}>{$_('back')}</BigButton>
          </div>
        {/if}

        {#if screen === 'levelEnd'}
          <div class="overlay" data-testid="end-overlay">
            {#if outcome === 'failed'}
              <p class="ov-title">😅</p>
              <p class="score-line">{targetsBroken}/{targetsTotal} 🎯</p>
              <p class="hint-line">{$_('shotsRetry', { n: shotsLeft })}</p>
            {:else}
              {#if outcome.stars >= 2 || newBestStars}<Confetti />{/if}
              <p class="ov-title">{'⭐'.repeat(outcome.stars)}{'☆'.repeat(3 - outcome.stars)}</p>
              <p class="score-line">⭐ {outcome.score}</p>
            {/if}
            <BigButton onclick={() => startLevel(levelN)}>{$_('replay')}</BigButton>
            {#if outcome !== 'failed'}
              <BigButton variant="ghost" onclick={() => startLevel(Math.min(20, levelN + 1))}>
                {$_('nextLevel')} ▶
              </BigButton>
            {/if}
            <BigButton variant="ghost" onclick={() => (screen = 'select')}>{$_('back')}</BigButton>
          </div>
        {/if}

        {#if screen === 'playing' && shotsLeft === 0 && !settling}
          <!-- waiting for last settle; handled by evaluateEnd -->
        {/if}
      </div>
      <p class="drag-hint">🎯 drag from the sling, release to launch!</p>
    {/if}
  </div>
</GameShell>

<style>
  .angry { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 8px; overflow-y: auto; }
  .title { font-size: 28px; color: var(--gold); text-shadow: 0 0 14px var(--glow-gold); }
  .tiers { display: flex; flex-direction: column; gap: 12px; width: min(92vw, 420px); }
  .tier { background: var(--panel-glass); border: 1px solid var(--panel-border); border-radius: 16px; padding: 10px 12px; }
  .tier.locked { opacity: 0.55; }
  .tier-name { margin: 0 0 6px; font-weight: 700; color: var(--text-lo); font-size: 14px; }
  .lvl-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
  .lvl-btn {
    display: flex; flex-direction: column; align-items: center; gap: 2px;
    min-height: calc(var(--touch-min) * 0.9);
    border-radius: 14px; color: #062033; background: var(--btn-gradient); font-weight: 700;
  }
  .lvl-btn:disabled { filter: grayscale(1); opacity: 0.5; }
  .mini-stars { font-size: 10px; letter-spacing: 1px; }
  .hud-row { display: flex; gap: 8px; align-items: center; }
  .stage {
    position: relative;
    width: min(96vw, 900px);
    aspect-ratio: 900 / 620;
    max-height: 66vh;
    border-radius: 16px;
    overflow: hidden;
    background: linear-gradient(180deg, #16244d 0%, #23386e 70%, #7a5a3a 71%, #6a4d32 100%);
    border: 2px solid var(--panel-border);
    touch-action: none;
    user-select: none;
    -webkit-touch-callout: none;
  }
  .pause-fab {
    position: absolute;
    right: calc(10px + env(safe-area-inset-right, 0px));
    bottom: calc(10px + var(--safe-bottom));
    width: 52px;
    height: 52px;
    border-radius: 16px;
    font-size: 22px;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    z-index: 5;
  }
  .world {
    position: absolute;
    top: 0;
    left: 0;
    width: 900px;
    height: 620px;
    transform-origin: top left;
  }
  .body { position: absolute; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
  .body .face { font-size: 36px; line-height: 1; z-index: 1; }
  .body.wood .mat, .body.ice .mat, .body.stone .mat { position: absolute; inset: 2px; border-radius: 4px; background: var(--c); opacity: 0.9; }
  .body.cracked .mat { clip-path: polygon(0 0, 60% 0, 45% 40%, 100% 35%, 100% 100%, 0 100%); }
  .crack { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 16px; }
  .hpbar { position: absolute; bottom: 2px; left: 4px; right: 4px; height: 3px; background: rgba(0,0,0,.4); border-radius: 2px; overflow: hidden; }
  .hpbar i { display: block; height: 100%; background: #7ee787; }
  .sling { position: absolute; width: 18px; height: 44px; margin: -44px 0 0 -9px; border-radius: 8px; background: linear-gradient(180deg, #a06a3a, #7a4a28); box-shadow: 0 0 12px rgba(255,213,79,.5); }
  .aimline { position: absolute; inset: 0; width: 900px; height: 620px; pointer-events: none; }
  .overlay {
    position: absolute; inset: 0; z-index: 6;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
    background: rgba(4, 8, 24, 0.85); backdrop-filter: blur(6px);
  }
  .ov-title { font-size: 40px; margin: 0; letter-spacing: 6px; }
  .score-line { font-size: 28px; font-weight: 700; color: var(--gold); margin: 0; }
  .hint-line { color: var(--text-lo); margin: 0; }
  .drag-hint { color: var(--text-lo); font-size: 13px; margin: 0; padding-bottom: calc(6px + var(--safe-bottom)); }
</style>
