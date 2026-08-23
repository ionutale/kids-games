<script>
  import { onMount } from 'svelte';
  import { _ } from '$lib/stores/locale';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import HudPill from '$lib/components/ui/HudPill.svelte';
  import BigButton from '$lib/components/ui/BigButton.svelte';
  import Confetti from '$lib/components/Confetti.svelte';
  import { playPop } from '$lib/sounds/audioManager.js';
  import { playAdvancePop, playSlotChime, fanfare } from '$lib/sounds/trainerSounds.js';
  import { generateLadder, nextPlatform, step, PX_PER_M } from '$lib/emoji-jump/engine.js';

  const VIEW_H = 600;
  const WORLD_W = 390;

  let screen = $state('idle');
  let platforms = $state([]);
  let player = $state({ x: 170, y: -60, vy: 0, shield: false, jetpackMs: 0 });
  let input = $state(0);
  let cameraY = $state(-VIEW_H + 80);
  let heightM = $state(0);
  let springs = $state(0);
  let best = $state(
    (typeof localStorage !== 'undefined' && parseInt(localStorage.getItem('emoji-jump-best') || '0', 10)) || 0
  );
  let newBest = $state(false);

  let raf = null;
  let lastTs = 0;

  function startGame() {
    platforms = generateLadder(400, Date.now() % 1000000);
    player = { x: 170, y: -30, vy: 100, shield: false, jetpackMs: 0 };
    input = 0;
    cameraY = -VIEW_H + 120;
    heightM = 0;
    springs = 0;
    newBest = false;
    lastTs = 0;
    screen = 'playing';
    raf = requestAnimationFrame(frame);
  }

  function finish() {
    if (screen !== 'playing') return;
    screen = 'gameOver';
    if (heightM > best) {
      best = Math.floor(heightM);
      localStorage.setItem('emoji-jump-best', String(best));
      newBest = true;
      fanfare(1.2);
    }
  }

  function frame(ts) {
    if (screen !== 'playing') return;
    if (!lastTs) lastTs = ts;
    const delta = Math.min((ts - lastTs) / 1000, 1 / 20);
    lastTs = ts;

    for (const p of platforms) {
      if (p.type === 'moving' && !p.broken) {
        p.x += p.vx * delta;
        if (p.x < 6 || p.x + p.w > WORLD_W - 6) p.vx *= -1;
      }
    }
    const top = platforms[platforms.length - 1];
    while (top && top.y > cameraY - VIEW_H) {
      platforms.push(nextPlatform(top, Math.random()));
      break;
    }
    // prune far-below platforms to keep arrays small
    if (platforms.length > 900) platforms = platforms.filter((p) => p.y < cameraY + VIEW_H + 400);

    const deathY = cameraY + VIEW_H + 60;
    const res = step(player, platforms, input, delta, { worldW: WORLD_W, deathY });
    player = res.state;
    const ev = res.events;

    if (ev.bounced) playPop();
    if (ev.sprung) {
      springs += 1;
      playAdvancePop();
    }
    if (ev.powered || ev.shieldUsed) playSlotChime();

    const m = Math.max(heightM, -player.y / PX_PER_M);
    if (m > heightM) heightM = m;

    const targetCam = player.y - VIEW_H * 0.55;
    if (targetCam < cameraY) cameraY = targetCam;

    if (ev.died) {
      finish();
      return;
    }
    raf = requestAnimationFrame(frame);
  }

  function pauseGame() {
    if (screen === 'playing') {
      screen = 'paused';
      if (raf) cancelAnimationFrame(raf);
    }
  }

  function resumeGame() {
    if (screen === 'paused') {
      screen = 'playing';
      lastTs = 0;
      raf = requestAnimationFrame(frame);
    }
  }

  function press(dir) {
    input = dir;
  }
  function release() {
    input = 0;
  }
  function onKeyDown(e) {
    if (e.key === 'ArrowLeft') press(-1);
    else if (e.key === 'ArrowRight') press(1);
  }
  function onKeyUp(e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') release();
  }
  function visibility() {
    pauseGame();
  }

  onMount(() => {
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (raf) cancelAnimationFrame(raf);
    };
  });

  function visible(p) {
    return p.y - cameraY > -40 && p.y - cameraY < VIEW_H + 40;
  }
  function stretch() {
    if (player.jetpackMs > 0) return 'scale(0.9,1.25)';
    if (player.vy < -300) return 'scale(0.88,1.18)';
    if (player.vy > 350) return 'scale(1.12,0.85)';
    return 'scale(1,1)';
  }
</script>

<GameShell accent="#6EE7B7">
  {#snippet hudLeft()}
    <HudPill icon="📏" label={`${Math.floor(heightM)}m`} />
    <HudPill icon="🏆" label={`${best}m`} />
  {/snippet}

  <div class="jump" data-testid="jump-root">
    {#if screen === 'idle'}
      <div class="center-col">
        <h1 class="title">🦘 {$_('emojiJump')}</h1>
        <p class="tag">😀 ⬆️ 🟩 ⬆️ 👾</p>
        <BigButton onclick={startGame}>▶ {$_('play')}</BigButton>
        <p class="best-line">🏆 {best}m</p>
      </div>
    {:else}
      <div class="world" data-testid="world">
        {#if newBest}<Confetti />{/if}
        {#each platforms as p (p.id)}
          {#if visible(p)}
            <div
              class="plat {p.type}"
              class:broken={p.broken}
              style:left="{p.x}px"
              style:top="{p.y - cameraY}px"
              data-testid="platform"
            >
              {#if p.spring}<span class="mark">⬆️</span>{/if}
              {#if p.enemy}
                <span class="enemy" style:left="{p.enemy.x - p.x}px">👾</span>
              {/if}
            </div>
          {/if}
          {#if p.powerup && visible(p)}
            <div class="powerup" style:left="{p.x + p.w / 2 - 14}px" style:top="{p.y - cameraY - 34}px">
              {p.powerup === 'jetpack' ? '🚀' : '🛡️'}
            </div>
          {/if}
        {/each}

        <div
          class="player"
          class:shielded={player.shield}
          style:left="{player.x}px"
          style:top="{player.y - cameraY}px"
          style:transform="translateY(-24px) {stretch()}"
          data-testid="player"
        >
          😀
        </div>

        {#if screen === 'paused'}
          <div class="overlay" data-testid="pause-overlay">
            <p class="ov-title">⏸️</p>
            <BigButton onclick={resumeGame}>▶ {$_('play')}</BigButton>
            <BigButton variant="ghost" onclick={() => (screen = 'idle')}>{$_('back')}</BigButton>
          </div>
        {/if}

        {#if screen === 'gameOver'}
          <div class="overlay" data-testid="gameover-overlay">
            <p class="ov-title">{newBest ? '🏆' : '😅'}</p>
            <p class="score-line">📏 {Math.floor(heightM)}m</p>
            <p class="best-line">🏆 {best}m</p>
            <BigButton onclick={startGame}>{$_('replay')}</BigButton>
            <BigButton variant="ghost" onclick={() => (screen = 'idle')}>{$_('back')}</BigButton>
          </div>
        {/if}
      </div>

      <div class="steer" data-testid="steer">
        <button class="steer-btn" aria-label="left" onpointerdown={() => press(-1)} onpointerup={release} onpointerleave={release}>◀</button>
        <button class="steer-btn" aria-label="right" onpointerdown={() => press(1)} onpointerup={release} onpointerleave={release}>▶</button>
        <button class="steer-btn ghosty" aria-label="pause" onclick={pauseGame}>⏸️</button>
      </div>
    {/if}
  </div>
</GameShell>

<style>
  .jump { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 8px; }
  .center-col { display: flex; flex-direction: column; gap: 14px; align-items: center; }
  .title { font-size: 30px; color: var(--gold); text-shadow: 0 0 14px var(--glow-gold); }
  .tag { letter-spacing: 8px; opacity: 0.85; margin: 0; }
  .best-line { color: var(--text-lo); font-size: 16px; margin: 0; }
  .world {
    position: relative;
    width: min(96vw, 390px);
    height: min(64vh, 600px);
    border-radius: 16px;
    overflow: hidden;
    background: linear-gradient(180deg, #101a3a 0%, #16244d 60%, #1b2f63 100%);
    border: 2px solid var(--panel-border);
    touch-action: none;
  }
  .plat {
    position: absolute;
    width: 64px;
    height: 14px;
    border-radius: 8px;
    background: linear-gradient(180deg, #7ee787, #46c96b);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
  }
  .plat.moving { background: linear-gradient(180deg, #7fd8ff, #4aa8e8); }
  .plat.breakable { background: linear-gradient(180deg, #d8b98e, #b08d5f); }
  .plat.broken { opacity: 0; transition: opacity 0.25s; pointer-events: none; }
  .mark { position: absolute; left: 24px; top: -14px; font-size: 13px; }
  .enemy { position: absolute; top: -22px; font-size: 20px; line-height: 1; }
  .powerup { position: absolute; font-size: 24px; animation: floaty 2s ease-in-out infinite; }
  .player {
    position: absolute;
    font-size: 30px;
    line-height: 1;
    transition: transform 0.08s linear;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
  }
  .player.shielded { text-shadow: 0 0 12px #7FD8FF, 0 0 20px #7FD8FF; }
  .overlay {
    position: absolute;
    inset: 0;
    z-index: 5;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: rgba(4, 8, 24, 0.82);
    backdrop-filter: blur(6px);
  }
  .ov-title { font-size: 44px; margin: 0; }
  .score-line { font-size: 32px; font-weight: 700; color: var(--gold); margin: 0; }
  .steer { display: flex; gap: 14px; }
  .steer-btn {
    width: 96px;
    min-height: calc(var(--touch-min) * 1.15);
    border-radius: 22px;
    font-size: 26px;
    color: #062033;
    background: var(--btn-gradient);
    box-shadow: 0 4px 14px rgba(91, 194, 240, 0.4);
  }
  .steer-btn:active { transform: scale(0.93); }
  .steer-btn.ghosty { color: var(--text-lo); background: var(--panel-glass); border: 1px solid var(--panel-border); box-shadow: none; }
</style>
