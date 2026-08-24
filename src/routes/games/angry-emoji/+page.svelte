<script>
  import { onMount, onDestroy } from 'svelte';
  import { _ } from '$lib/stores/locale';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import HudPill from '$lib/components/ui/HudPill.svelte';
  import BigButton from '$lib/components/ui/BigButton.svelte';
  import Confetti from '$lib/components/Confetti.svelte';
  import { playMatch } from '$lib/sounds/audioManager.js';
  import {
    playFlashWhoosh,
    playStretch,
    playBoom,
    playThud,
    playMaterialBreak,
    fanfare
  } from '$lib/sounds/trainerSounds.js';
  import {
    createWorld,
    addBody,
    removeBody,
    step as physStep,
    cull,
    explode,
    MATERIALS
  } from '$lib/angry-emoji/phys.js';
  import { getLevel, WORLD_W, WORLD_H, GROUND_Y, SLING } from '$lib/angry-emoji/levels.js';
  import { levelMaxScore, starsFor, POINTS } from '$lib/angry-emoji/score.js';
  import { computeTrajectory } from '$lib/angry-emoji/aim.js';
  import { birdForShot } from '$lib/angry-emoji/birds.js';

  const BIRD_EMOJI = { bird: '😡', birdFire: '🐦‍🔥', ball: '🧱' };
  const TARGET_EMOJI = { targetBasic: '😠', targetTough: '🤬', targetBoss: '👿' };
  const BLOCK_EMOJI = { wood: '🪵', ice: '🧊', stone: '🪨', tnt: '🧨' };

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
  let dragging = $state(null); // {x,y} pouch position while aiming
  let aimPoint = null;
  let traj = $state(null); // {points, firstBounce} while aiming
  let loadedBird = $state(null); // bird kind waiting in the pouch
  // raw: holds a live engine body — must NOT be deep-proxied, or identity
  // checks against world.bodies break ($state wraps objects in Proxies)
  let activeBird = $state.raw(null); // projectile currently in flight (ability window)
  let lastGhost = $state(null); // dots of the previous shot's path
  let popups = $state([]); // floating score popups
  let popupId = 0;
  let particles = $state([]); // silent emoji debris bursts
  let particleId = 0;

  const PARTICLE_EMOJI = { wood: '🪵', ice: '❄️', stone: '🪨', tnt: '💥' };
  const MAX_PARTICLES = 40;
  const PARTICLE_LIFE = 0.6; // seconds
  const PARTICLE_GRAVITY = 900;
  let targetBrokenCount = 0; // alternate 💥/⭐ on target kills

  /** Spawn a small silent burst of emoji debris. Purely visual. */
  function burst(x, y, emojis, count, power = 1) {
    for (let i = 0; i < count; i++) {
      if (particles.length >= MAX_PARTICLES) particles.shift();
      particles.push({
        id: ++particleId,
        x,
        y,
        vx: (Math.random() * 2 - 1) * 140 * power,
        vy: (-60 - Math.random() * 200) * power,
        rot: Math.random() * 360,
        vr: (Math.random() * 2 - 1) * 240,
        size: 10 + Math.random() * 7,
        life: PARTICLE_LIFE,
        emoji: emojis[Math.floor(Math.random() * emojis.length)]
      });
    }
  }

  function advanceParticles(dt) {
    if (!particles.length) return;
    let expired = false;
    for (const p of particles) {
      p.life -= dt;
      p.vy += PARTICLE_GRAVITY * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      if (p.life <= 0) expired = true;
    }
    if (expired) particles = particles.filter((p) => p.life > 0);
  }

  const def = $derived(getLevel(levelN));

  // the bird perched in the sling while idle + the lineup behind it
  const waitingKind = $derived(
    screen === 'playing' && !dragging && !activeBird && shotsLeft > 0
      ? birdForShot(def.tier, shotsLeft)
      : null
  );
  const upcomingKinds = $derived.by(() => {
    if (screen !== 'playing' || shotsLeft <= 0) return [];
    const out = [];
    for (let k = shotsLeft - 1; k >= 1; k--) out.push(birdForShot(def.tier, k));
    return out;
  });

  function removePopup(id) {
    popups = popups.filter((p) => p.id !== id);
  }

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

  function levelUnlocked(n) {
    return n === 1 || (bestStars[n - 1] ?? 0) > 0;
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
    traj = null;
    loadedBird = null;
    activeBird = null;
    lastGhost = null;
    popups = [];
    particles = [];
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
    if (screen !== 'playing' || paused) return;
    // a tap while a bird is airborne triggers its ability (AB-style)
    if (activeBird) {
      activateAbility(activeBird);
      e.preventDefault();
      return;
    }
    if (shotsLeft <= 0) return;
    if (activePointerId !== null) return; // single-touch lock
    const p = toWorld(e);
    if (inGrabZone(p)) {
      activePointerId = e.pointerId;
      dragging = p;
      aimPoint = p;
      loadedBird = nextBirdKind();
      playStretch();
      e.preventDefault();
    }
  }

  /** Launch vector from a drag point — identical math for preview and release. */
  function launchParams(from) {
    const dx = SLING.x - from.x;
    const dy = SLING.y - from.y;
    const len = Math.max(1e-6, Math.hypot(dx, dy));
    const speed = Math.min(1750, len * 9);
    return {
      x: SLING.x + 26,
      y: SLING.y - 26,
      vx: (dx / len) * speed,
      vy: (dy / len) * speed
    };
  }

  function move(e) {
    if (!dragging || e.pointerId !== activePointerId) return;
    aimPoint = toWorld(e);
    if (loadedBird) {
      const lp = launchParams(aimPoint);
      traj = computeTrajectory({
        ...lp,
        halfH: 13,
        restitution: MATERIALS[loadedBird].restitution,
        maxX: WORLD_W + 60
      });
    }
    e.preventDefault();
  }
  function up(e) {
    if (!dragging || (e.pointerId !== undefined && e.pointerId !== activePointerId)) return;
    activePointerId = null;
    if (!dragging) return;
    const lp = launchParams(aimPoint);
    const len = Math.hypot(SLING.x - aimPoint.x, SLING.y - aimPoint.y);
    dragging = null;
    aimPoint = null;
    traj = null;
    loadedBird = null;
    // tiny drags are accidental taps; a release aimed BEHIND the sling
    // (launch velocity pointing left, away from the towers) is cancelled too —
    // both silently keep the shot, mirroring AB blocking behind-the-sling aim
    if (len < 30 || lp.vx < 0) return;
    const kind = nextBirdKind(); // uses pre-decrement shotsLeft
    activeBird = addBody(world, {
      x: lp.x,
      y: lp.y,
      w: 26,
      h: 26,
      type: kind,
      vx: lp.vx,
      vy: lp.vy
    });
    // ghost trail of this shot stays visible until the next launch
    lastGhost = computeTrajectory({
      ...lp,
      halfH: 13,
      restitution: MATERIALS[kind].restitution,
      maxX: WORLD_W + 60
    }).points;
    playFlashWhoosh();
    shotsLeft -= 1;
    settling = true;
    settleFrames = 0;
  }

  /** Tap-activated bird powers: fire bird detonates, ball slams down. */
  function activateAbility(bird) {
    if (!bird || bird.usedAbility) return;
    bird.usedAbility = true;
    if (bird.type === 'birdFire') {
      explode(world, { x: bird.x, y: bird.y });
      removeBody(world, bird);
      if (activeBird === bird) activeBird = null;
      playBoom();
    } else if (bird.type === 'ball') {
      bird.vx *= 0.25;
      bird.vy = Math.max(bird.vy, 1800); // slam straight down
      playThud(1);
    }
    // plain bird: no ability (Red-style) — silent
  }

  function nextBirdKind() {
    return birdForShot(getLevel(levelN).tier, shotsLeft);
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
  let lastThudAt = 0;
  function frame(ts) {
    if (screen !== 'playing') return;
    if (!lastTs) lastTs = ts;
    const dt = Math.min((ts - lastTs) / 1000, 1 / 30);
    lastTs = ts;
    if (!paused) {
      physStep(world, dt);
      cull(world, { maxX: WORLD_W + 450, maxY: WORLD_H + 600 });
      if (activeBird && !world.bodies.includes(activeBird)) activeBird = null;

      // scoring from this step's break log (targets 10 / blocks 5 — B1)
      for (const b of world.brokenLog.splice(0)) {
        const px = Math.max(40, Math.min(WORLD_W - 40, b.x));
        const py = Math.max(20, b.y - 30);
        if (b.type.startsWith('target')) {
          score += POINTS.target;
          targetsBroken += 1;
          playMatch();
          popups.push({ id: ++popupId, x: px, y: py, text: `+${POINTS.target}` });
          burst(b.x, b.y, targetBrokenCount++ % 2 ? ['⭐', '💥'] : ['💥', '⭐'], 6);
        } else {
          score += POINTS.block;
          playMaterialBreak(b.type); // wood crack / ice shimmer / stone thud / TNT boom
          popups.push({ id: ++popupId, x: px, y: py, text: `+${POINTS.block}` });
          burst(b.x, b.y, [PARTICLE_EMOJI[b.type] ?? '💨', PARTICLE_EMOJI[b.type] ?? '💨', '💨'], 5);
        }
      }

      // heavy non-breaking impacts → thud + dust puff (throttled)
      for (const imp of world.impactLog.splice(0)) {
        burst(imp.x, imp.y, ['💨'], 2, 0.5);
        const now = performance.now();
        if (now - lastThudAt > 150) {
          playThud(imp.speed / 1750);
          lastThudAt = now;
        }
      }

      advanceParticles(dt);

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
      isTarget: b.type.startsWith('target'),
      // thin shapes (planks/columns) render as pure grain — no emoji fits them
      thin: Math.min(b.w, b.h) < 32 ? (b.w >= b.h ? 'h' : 'v') : null
    }));
    raf = requestAnimationFrame(frame);
  }

  function evaluateEnd() {
    settling = false;
    activeBird = null; // flight over — ability window closes
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
          {@const tierOpen = levelUnlocked((tier - 1) * 5 + 1)}
          <div class="tier" class:locked={!tierOpen}>
            <p class="tier-name">{tierOpen ? '🔓' : '🔒'} {$_('tierLabel', { n: tier })}</p>
            <div class="lvl-grid">
              {#each Array(5) as _, i}
                {@const n = (tier - 1) * 5 + i + 1}
                {@const unlocked = levelUnlocked(n)}
                {@const stars = bestStars[n] ?? 0}
                <button class="lvl-btn" disabled={!unlocked} onclick={() => startLevel(n)} data-testid="level-{n}">
                  <span>{n}</span>
                  <span class="mini-stars">{unlocked ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '🔒'}</span>
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
              class:thin-h={b.thin === 'h'}
              class:thin-v={b.thin === 'v'}
              style:left="{b.x - b.w / 2}px"
              style:top="{b.y - b.h / 2}px"
              style:width="{b.w}px"
              style:height="{b.h}px"
              data-testid={b.isTarget ? 'target-body' : 'body'}
            >
              {#if b.isTarget}
                <span class="face">{TARGET_EMOJI[b.type]}</span>
                {#if b.hpRatio < 1}
                  <span class="crack">💥</span>
                  <span class="stars-orbit"><i>⭐</i><i>⭐</i></span>
                {/if}
              {:else if BIRD_EMOJI[b.type]}
                <span class="face">{BIRD_EMOJI[b.type]}</span>
              {:else if b.thin}
                <span class="mat grain" style:--c={MATERIALS[b.type]?.color ?? '#ccc'}></span>
                {#if cracked}<span class="crack">💥</span>{/if}
              {:else}
                <span class="mat" style:--c={MATERIALS[b.type]?.color ?? '#ccc'}></span>
                <span class="block-face">{BLOCK_EMOJI[b.type] ?? ''}</span>
                {#if cracked}<span class="crack">💥</span>{/if}
              {/if}
            </div>
          {/if}
        {/each}

        {#if screen === 'playing'}
          <button class="pause-fab" aria-label="pause" data-testid="pause-btn" onclick={() => (paused = !paused)}>⏸️</button>
        {/if}

        <div class="sling" style:left="{SLING.x}px" style:top="{SLING.y}px"></div>

        <!-- ghost trail of the previous shot -->
        {#if lastGhost}
          <svg class="aimline" viewBox="0 0 {WORLD_W} {WORLD_H}">
            {#each lastGhost as p, i (i)}
              <circle cx={p.x} cy={p.y} r="2.5" fill="#FFD54F" opacity="0.22" />
            {/each}
          </svg>
        {/if}

        <!-- score popups -->
        {#each popups as p (p.id)}
          <div class="popup" style:left="{p.x}px" style:top="{p.y}px" onanimationend={() => removePopup(p.id)}>
            {p.text}
          </div>
        {/each}

        <!-- silent emoji debris -->
        {#each particles as p (p.id)}
          <span
            class="particle"
            style:left="{p.x}px"
            style:top="{p.y}px"
            style:font-size="{p.size}px"
            style:opacity="{Math.max(0, p.life / 0.6)}"
            style:transform="translate(-50%, -50%) rotate({p.rot}deg)"
          >{p.emoji}</span>
        {/each}

        <!-- next bird perched in the sling + the queue behind it -->
        {#if waitingKind}
          <div class="waiting-bird" style:left="{SLING.x}px" style:top="{SLING.y - 30}px">{BIRD_EMOJI[waitingKind]}</div>
        {/if}
        {#each upcomingKinds as kind, i (i)}
          <div class="queue-bird" style:left="{SLING.x - 70 - i * 34}px" style:top="{GROUND_Y - 16}px">{BIRD_EMOJI[kind]}</div>
        {/each}

        {#if dragging && loadedBird}
          <svg class="aimline" viewBox="0 0 {WORLD_W} {WORLD_H}">
            {#each traj?.points ?? [] as p, i (i)}
              <circle
                cx={p.x}
                cy={p.y}
                r={i === traj.firstBounce ? 7 : 3.5}
                fill="#FFD54F"
                opacity={i === traj.firstBounce ? 0.95 : 0.6}
              />
            {/each}
            <!-- rubber bands: rear + front, stretched to the pouch -->
            <line x1={SLING.x - 9} y1={SLING.y - 42} x2={dragging.x} y2={dragging.y} stroke="#5a3620" stroke-width="7" stroke-linecap="round" />
            <line x1={SLING.x + 9} y1={SLING.y - 42} x2={dragging.x} y2={dragging.y} stroke="#7a4a28" stroke-width="7" stroke-linecap="round" />
          </svg>
          <div class="pouch-bird" style:left="{dragging.x}px" style:top="{dragging.y}px">{BIRD_EMOJI[loadedBird]}</div>
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
              <p class="hint-line">{$_('shotsEmpty')}</p>
            {:else}
              {#if outcome.stars >= 2 || newBestStars}<Confetti />{/if}
              <p class="ov-title">{'⭐'.repeat(outcome.stars)}{'☆'.repeat(3 - outcome.stars)}</p>
              <p class="score-line">⭐ {outcome.score}</p>
              {#if levelN >= 20}
                <p class="all-done" data-testid="campaign-complete">🎉 {$_('allDone')}</p>
              {/if}
            {/if}
            <BigButton onclick={() => startLevel(levelN)}>{$_('replay')}</BigButton>
            {#if outcome !== 'failed' && levelN < 20}
              <BigButton variant="ghost" onclick={() => startLevel(levelN + 1)}>
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
  /* thin planks/columns: pure material color with grain shading along the long axis */
  .mat.grain { position: absolute; inset: 1px; border-radius: 3px; opacity: 0.95; }
  .thin-h .mat.grain {
    background:
      repeating-linear-gradient(180deg, rgba(0, 0, 0, 0.10) 0 2px, transparent 2px 6px),
      linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(0, 0, 0, 0.12)),
      var(--c);
  }
  .thin-v .mat.grain {
    background:
      repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.10) 0 2px, transparent 2px 6px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.18), rgba(0, 0, 0, 0.12)),
      var(--c);
  }
  .block-face { position: relative; z-index: 1; font-size: 26px; line-height: 1; }
  .body.cracked .mat { clip-path: polygon(0 0, 60% 0, 45% 40%, 100% 35%, 100% 100%, 0 100%); }
  .crack { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 16px; z-index: 2; pointer-events: none; }
  .stars-orbit {
    position: absolute;
    inset: -8px;
    z-index: 3;
    animation: orbit-spin 1.6s linear infinite;
    pointer-events: none;
  }
  .stars-orbit i { position: absolute; font-size: 13px; font-style: normal; }
  .stars-orbit i:nth-child(1) { top: -4px; left: 50%; }
  .stars-orbit i:nth-child(2) { bottom: -4px; right: 18%; }
  @keyframes orbit-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .pouch-bird {
    position: absolute;
    width: 34px;
    height: 34px;
    margin: -17px 0 0 -17px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    line-height: 1;
    pointer-events: none;
    z-index: 2;
  }
  .waiting-bird {
    position: absolute;
    margin: -34px 0 0 -13px;
    font-size: 26px;
    line-height: 1;
    pointer-events: none;
    z-index: 1;
    animation: perch-bob 2.2s ease-in-out infinite;
  }
  .queue-bird {
    position: absolute;
    margin: -10px 0 0 -10px;
    font-size: 18px;
    line-height: 1;
    opacity: 0.85;
    pointer-events: none;
    z-index: 1;
  }
  .popup {
    position: absolute;
    transform: translate(-50%, -50%);
    font-size: 20px;
    font-weight: 700;
    color: var(--gold, #FFD54F);
    text-shadow: 0 0 8px rgba(255, 213, 79, 0.6);
    pointer-events: none;
    z-index: 4;
    animation: popup-rise 0.9s ease-out forwards;
  }
  @keyframes popup-rise {
    from { opacity: 1; translate: 0 0; }
    to { opacity: 0; translate: 0 -44px; }
  }
  .particle {
    position: absolute;
    line-height: 1;
    pointer-events: none;
    z-index: 3;
  }
  .all-done {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: var(--gold);
    text-shadow: 0 0 10px rgba(255, 213, 79, 0.6);
  }
  @keyframes perch-bob {
    0%, 100% { rotate: 0deg; }
    50% { rotate: -6deg; }
  }
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
