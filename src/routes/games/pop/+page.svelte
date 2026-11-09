<script>
  // Pop — the Rising Pond. A portrait moonlit pond: bubbles rise carrying
  // surprise trinkets, a tap or swipe pops them into the jar, and the moon
  // crosses the sky as a 30-second clock. Reaching the target wins the level;
  // when the moon sets first the round ends on the calm Good Try card.
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import GameShell from '#lib/components/ui/GameShell.svelte';
  import WinOverlay from '#lib/components/ui/WinOverlay.svelte';
  import LadderBar from '#lib/ladder/LadderBar.svelte';
  import LadderActions from '#lib/ladder/LadderActions.svelte';
  import Bubble from '#lib/pop/Bubble.svelte';
  import Jar from '#lib/pop/Jar.svelte';
  import MoonTimer from '#lib/pop/MoonTimer.svelte';
  import Icons from '#lib/pop/Icons.svelte';
  import { createPondSound } from '#lib/pop/sound.js';
  import {
    ROUND_SECONDS,
    levelConfig,
    targetFor,
    pickType,
    bubbleSize,
    miniKinds,
    surprisePoolFor
  } from '#lib/pop/config.js';
  import { _ } from '#lib/stores/locale.js';
  import { reducedMotion } from '#lib/stores/reducedMotion.js';
  import { seedFromUrl } from '#lib/game/seed.js';
  import { makeRng } from '#lib/trainers/rng.js';
  import { loadLevel, saveLevel, loadMastered, saveMastered, MAX_LEVEL } from '#lib/ladder/progress.js';

  const PADS = [
    { x: 16, y: 84, s: 58, r: -8 },
    { x: 76, y: 91, s: 66, r: 6 },
    { x: 46, y: 98, s: 52, r: 0 },
    { x: 89, y: 72, s: 44, r: 12 }
  ];
  const REEDS = [
    { x: 7, y: 76, s: 46 },
    { x: 94, y: 68, s: 42 },
    { x: 24, y: 99, s: 38 }
  ];
  const FLIES = [
    { x: 16, y: 22 },
    { x: 38, y: 35 },
    { x: 63, y: 17 },
    { x: 85, y: 42 },
    { x: 53, y: 59 },
    { x: 11, y: 53 }
  ];

  const initialLevel = loadLevel('pop');
  const urlSeed = seedFromUrl(page.url);
  const rand = urlSeed == null ? Math.random : makeRng(urlSeed);
  const sound = createPondSound();

  let level = $state(initialLevel);
  let mastered = $state(loadMastered('pop'));
  let phase = $state('ready'); // ready | playing | won | good
  let bubbles = $state([]);
  let ripples = $state([]);
  let items = $state([]);
  let sticker = $state(false);
  let timeLeft = $state(ROUND_SECONDS);

  let waterEl;
  let jarEl;
  let retryBtn = $state(null);
  let cardEl = $state(null);
  let raf = 0;
  let last = 0;
  let spawnAcc = 0;
  let active = false;
  let nearEndPlayed = false;
  let idc = 0;
  const timers = new Set();

  const reduced = $derived($reducedMotion);
  const filled = $derived(items.length);
  const target = $derived(targetFor(level));
  const config = $derived(levelConfig(level));
  const remaining = $derived(Math.max(0, target - filled));
  const jarLabel = $derived($_('popJarFill', { n: Math.min(filled, target), m: target }));
  const typeLabels = $derived({
    normal: $_('popNormal'),
    giant: $_('popGiant'),
    star: $_('popStar')
  });
  const typeNames = $derived(config.types.map((type) => typeLabels[type]).join(', '));
  const typesText = $derived($_('popTypes', { types: typeNames }));
  const hint = $derived(
    phase === 'ready'
      ? $_('popStart')
      : phase === 'won'
        ? $_('jarFull')
        : phase === 'good'
          ? $_('goodTry')
          : $_('popHint')
  );
  // The single live region: fill progress, start, win and Good Try.
  const statusText = $derived(
    phase === 'ready'
      ? $_('popStart')
      : phase === 'good'
        ? `${$_('goodTry')}. ${$_('popGoodTrySub')}`
        : phase === 'won'
          ? `${$_('jarFull')} ${jarLabel}`
          : `${jarLabel}. ${$_('popRemaining', { n: remaining })}`
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

  function spawnBubble(initial = false) {
    if (phase !== 'playing' || bubbles.length >= config.maxItems) return;
    const type = pickType(config.types, rand);
    const size = bubbleSize(type, rand);
    const pool = surprisePoolFor(level);
    const item = type === 'star' ? 'star' : pool[Math.floor(rand() * pool.length) % pool.length];
    const x = 14 + rand() * 72;
    const speed = (118 / config.fallSec) * (0.85 + rand() * 0.3);
    bubbles = [
      ...bubbles,
      {
        id: ++idc,
        x,
        y: initial ? 74 + rand() * 16 : 104,
        size,
        type,
        item,
        cracked: false,
        speed
      }
    ];
    if (!initial) sound.spawn();
  }

  function startRound() {
    clearTimers();
    sound.stop();
    sound.reset();
    bubbles = [];
    ripples = [];
    items = [];
    sticker = false;
    timeLeft = ROUND_SECONDS;
    spawnAcc = 0;
    nearEndPlayed = false;
    phase = 'playing';
    for (let i = 0; i < 3; i += 1) spawnBubble(true);
  }

  function resetRound() {
    clearTimers();
    sound.stop();
    sound.reset();
    bubbles = [];
    ripples = [];
    items = [];
    sticker = false;
    timeLeft = ROUND_SECONDS;
    spawnAcc = 0;
    nearEndPlayed = false;
    phase = 'ready';
  }

  function addRipple(bubble) {
    const id = ++idc;
    ripples = [
      ...ripples,
      {
        id,
        x: bubble.x,
        y: bubble.y,
        tint: bubble.type === 'star' ? '#F2C14E' : bubble.type === 'giant' ? '#FFE3A3' : '#C4B5FD'
      }
    ];
    later(() => {
      ripples = ripples.filter((ripple) => ripple.id !== id);
    }, 520);
  }

  function winRound() {
    if (phase !== 'playing') return;
    phase = 'won';
    sticker = true;
    sound.chime();
    if (level >= MAX_LEVEL) {
      mastered = true;
      saveMastered('pop');
    }
  }

  function endRound() {
    if (phase !== 'playing') return;
    // Time ended short: calm, no star, no sad sound. A star popped earlier may
    // still be on the rim, so the Good Try state clears it explicitly.
    phase = 'good';
    sticker = false;
  }

  function popBubble(bubble) {
    if (phase !== 'playing') return;
    const live = bubbles.find((one) => one.id === bubble.id);
    if (!live) return;

    if (live.type === 'giant' && !live.cracked) {
      bubbles = bubbles.map((one) => (one.id === live.id ? { ...one, cracked: true } : one));
      sound.crack();
      return;
    }

    bubbles = bubbles.filter((one) => one.id !== live.id);
    sound.pop();
    if (!reduced) addRipple(live);

    // Push one trinket per point, flying from the bubble into the jar.
    const waterRect = waterEl?.getBoundingClientRect();
    const jarRect = jarEl?.getBoundingClientRect();
    let dx = 0;
    let dy = 0;
    if (waterRect && jarRect) {
      const bx = waterRect.left + (live.x / 100) * waterRect.width;
      const by = waterRect.top + (live.y / 100) * waterRect.height;
      dx = bx - (jarRect.left + jarRect.width / 2);
      dy = by - (jarRect.top + jarRect.height / 2);
    }
    items = [
      ...items,
      ...miniKinds(live.type, live.item).map((kind, index) => ({
        id: ++idc,
        kind,
        dx: dx + index * 4,
        dy: dy + index * 4
      }))
    ];

    if (live.type === 'star') {
      sticker = true;
      sound.star();
    }
    if (items.length >= target) winRound();
  }

  function popAt(event) {
    if (phase !== 'playing') return;
    const rect = waterEl?.getBoundingClientRect();
    if (!rect) return;
    for (const bubble of [...bubbles]) {
      const cx = rect.left + (bubble.x / 100) * rect.width;
      const cy = rect.top + (bubble.y / 100) * rect.height;
      if (Math.hypot(event.clientX - cx, event.clientY - cy) <= bubble.size / 2 + 16) {
        popBubble(bubble);
      }
    }
  }

  function down(event) {
    if (phase === 'won' || phase === 'good') return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    sound.unlock();

    if (phase === 'ready') {
      // The first tap starts the round; it never pops a bubble.
      startRound();
      event.preventDefault?.();
      return;
    }
    if (phase !== 'playing') return;

    active = true;
    sound.reset();
    popAt(event);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    event.preventDefault?.();
  }

  function move(event) {
    if (!active) return;
    popAt(event);
    if (event.cancelable) event.preventDefault?.();
  }

  function up() {
    if (!active) return;
    active = false;
    sound.reset();
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', up);
  }

  function loop(now) {
    if (!last) last = now;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (phase === 'playing') {
      timeLeft = Math.max(0, timeLeft - dt);
      if (!nearEndPlayed && timeLeft <= 5) {
        nearEndPlayed = true;
        sound.nearEnd();
      }
      spawnAcc += dt * 1000;
      if (spawnAcc >= config.spawnMs) {
        spawnAcc = 0;
        spawnBubble();
      }
      for (const bubble of bubbles) bubble.y -= bubble.speed * dt;
      bubbles = bubbles.filter((bubble) => bubble.y > -14);
      if (timeLeft <= 0) endRound();
    }
    raf = requestAnimationFrame(loop);
  }

  function pickLevel(n) {
    const next = Math.min(MAX_LEVEL, Math.max(1, parseInt(n, 10) || 1));
    level = next;
    saveLevel('pop', next);
    resetRound();
  }

  function advanceLevel(event) {
    event?.preventDefault();
    if (level < MAX_LEVEL) pickLevel(level + 1);
    else resetRound();
  }

  function replayLevel(event) {
    event?.preventDefault();
    startRound();
  }

  function retry() {
    startRound();
  }

  // Keep Tab inside the calm card while it is modal: Try Again and Back are
  // the only two focusable controls.
  function trapCardFocus(event) {
    if (event.key !== 'Tab' || !cardEl) return;
    const focusables = [...cardEl.querySelectorAll('button, a[href]')];
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (event.shiftKey) {
      if (active === first || active === cardEl) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last || active === cardEl) {
      event.preventDefault();
      first.focus();
    }
  }

  // Focus the calm card's only primary action so a keyboard/switch user is not
  // stranded behind the overlay.
  $effect(() => {
    if (phase === 'good') retryBtn?.focus();
  });

  onMount(() => {
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      clearTimers();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      sound.dispose();
    };
  });
</script>

<GameShell accent="#C4B5FD">
  <div
    class="pop-game"
    data-testid="pop-root"
    data-level={level}
    data-state={phase}
    data-filled={filled}
    data-target={target}
    data-remaining={remaining}
  >
    <div class="pop-hud">
      <div class="jar-slot" bind:this={jarEl}>
        <Jar items={items} {target} star={sticker} {reduced} label={jarLabel} />
      </div>
      <div class="hint-wrap">
        <p class="hint" data-testid="pop-hint">{hint}</p>
      </div>
      <MoonTimer secondsLeft={timeLeft} total={ROUND_SECONDS} {reduced} label={$_('popMoon')} />
    </div>

    <div
      class="pond"
      data-testid="pop-pond"
      bind:this={waterEl}
      role="group"
      aria-label={$_('popPond')}
      onpointerdown={down}
    >
      <div class="moonlight" aria-hidden="true"></div>

      {#if !reduced}
        <div class="fireflies" data-testid="fireflies" aria-hidden="true">
          {#each FLIES as fly, i (i)}
            <span
              class="firefly"
              style:left="{fly.x}%"
              style:top="{fly.y}%"
              style:animation-delay="{-i * 1.3}s"
            ></span>
          {/each}
        </div>
      {/if}

      <div class="shore" aria-hidden="true">
        {#each PADS as pad, i (i)}
          <span
            class="pad"
            style:left="{pad.x}%"
            style:top="{pad.y}%"
            style:transform="translate(-50%, -50%) rotate({pad.r}deg)"
          ><Icons id="lily" size={pad.s} /></span>
        {/each}
        {#each REEDS as reed, i (i)}
          <span class="reed" style:left="{reed.x}%" style:top="{reed.y}%">
            <Icons id="reed" size={reed.s} />
          </span>
        {/each}
      </div>

      {#each bubbles as bubble (bubble.id)}
        <div class="rise" style:left="{bubble.x}%" style:top="{bubble.y}%">
          <Bubble
            id={bubble.id}
            item={bubble.item}
            type={bubble.type}
            size={bubble.size}
            cracked={bubble.cracked}
            {reduced}
            label={typeLabels[bubble.type]}
          />
        </div>
      {/each}

      {#if !reduced}
        {#each ripples as ripple (ripple.id)}
          <span
            class="ripple"
            data-testid="ripple"
            style:left="{ripple.x}%"
            style:top="{ripple.y}%"
            style:--tint={ripple.tint}
          ></span>
        {/each}
      {/if}
    </div>

    <LadderBar current={level} {mastered} onchange={pickLevel} />

    <p class="sr-only" role="status" data-testid="pop-status">{statusText}</p>
    <p class="sr-only" data-testid="pop-types">{typesText}</p>

    {#if phase === 'good'}
      <div class="card-wrap" data-testid="pop-card">
        <div
          class="card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pop-good-title"
          tabindex="-1"
          bind:this={cardEl}
          onkeydown={trapCardFocus}
        >
          <p class="card-title" id="pop-good-title">{$_('goodTry')}</p>
          <p class="card-sub">{$_('popGoodTrySub')}</p>
          <div class="actions">
            <button class="primary" type="button" bind:this={retryBtn} onclick={retry}>
              {$_('tryAgain')}
            </button>
            <a class="ghost" href="/" data-testid="pop-back">{$_('back')}</a>
          </div>
        </div>
      </div>
    {/if}
  </div>
</GameShell>

{#if phase === 'won'}
  <div class="win-wrap">
    <WinOverlay
      title={$_('jarFull')}
      subtitle={$_('popWinSub')}
      sound={false}
      testid="pop-win"
    >
      <LadderActions
        gameId="pop"
        {level}
        backHref="/"
        nextHref="/games/pop"
        replayHref="/games/pop"
        onnext={advanceLevel}
        onreplay={replayLevel}
      />
    </WinOverlay>
  </div>
{/if}

<style>
  .pop-game {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-height: 0;
    padding: 2px 8px 0;
    overflow: hidden;
    background: #171326;
  }
  .pop-hud {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 2px 2px 2px;
  }
  .jar-slot {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 8px;
  }
  .hint-wrap {
    flex: 1;
    min-width: 0;
    display: flex;
    justify-content: center;
  }
  .hint {
    margin: 0;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.2;
    text-align: center;
    color: #efe8ff;
    background: rgba(196, 181, 253, 0.12);
    border: 1px solid rgba(196, 181, 253, 0.24);
  }
  .pond {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    border-radius: 24px;
    border: 2px solid rgba(196, 181, 253, 0.35);
    background:
      radial-gradient(90% 58% at 50% 0%, rgba(255, 227, 163, 0.22), transparent 62%),
      radial-gradient(78% 44% at 50% 102%, rgba(127, 216, 255, 0.2), transparent 72%),
      linear-gradient(180deg, #2b2a58 0%, #233a63 46%, #1b4a55 100%);
    box-shadow:
      inset 0 12px 32px rgba(0, 0, 0, 0.35),
      inset 0 -18px 40px rgba(0, 0, 0, 0.18);
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }
  .moonlight {
    position: absolute;
    left: 50%;
    top: -20%;
    width: 76%;
    height: 64%;
    transform: translateX(-50%);
    background: radial-gradient(closest-side, rgba(255, 227, 163, 0.24), transparent 70%);
    pointer-events: none;
  }
  .shore {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .pad {
    position: absolute;
    opacity: 0.88;
    filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.28));
  }
  .reed {
    position: absolute;
    transform: translate(-50%, -100%);
    opacity: 0.72;
    filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.25));
  }
  .fireflies {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .firefly {
    position: absolute;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #ffe3a3;
    box-shadow: 0 0 10px 3px rgba(255, 214, 140, 0.5);
    animation: drift 7s ease-in-out infinite;
  }
  .firefly:nth-child(2n) {
    animation-duration: 9s;
    animation-delay: -2s;
  }
  .rise {
    position: absolute;
    transform: translate(-50%, -50%);
    pointer-events: none;
    filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.25));
  }
  .ripple {
    position: absolute;
    width: 30px;
    height: 30px;
    margin: -15px 0 0 -15px;
    border-radius: 50%;
    border: 3px solid var(--tint, #c4b5fd);
    animation: ripple 0.5s ease-out forwards;
    pointer-events: none;
  }
  .pop-game :global(.ladder-bar) {
    margin: 0;
  }
  .win-wrap {
    display: contents;
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
    background: rgba(16, 12, 26, 0.58);
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
    background: linear-gradient(160deg, #fff8ec, #efe6ff);
    border: 2px solid rgba(196, 181, 253, 0.85);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
    animation: popIn 0.3s ease-out;
  }
  .card-title {
    font-size: 24px;
    font-weight: 700;
    color: #4b3a6b;
  }
  .card-sub {
    font-size: 13px;
    color: #6b5a8a;
    text-align: center;
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
    background: #c4b5fd;
    box-shadow: 0 3px 0 #8f7fd8;
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
    color: #4b3a6b;
    text-decoration: none;
    background: rgba(196, 181, 253, 0.18);
    border: 2px solid rgba(75, 58, 107, 0.2);
  }
  @keyframes drift {
    0%, 100% { transform: translate(0, 0); opacity: 0.2; }
    40% { transform: translate(10px, -18px); opacity: 0.9; }
    70% { transform: translate(-8px, -28px); opacity: 0.5; }
  }
  @keyframes ripple {
    from { transform: scale(0.3); opacity: 1; }
    to { transform: scale(2.6); opacity: 0; }
  }
</style>
