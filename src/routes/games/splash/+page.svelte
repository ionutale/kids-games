<script>
  import { onMount, onDestroy } from 'svelte';
  import { settings } from '#lib/stores/settings.js';
  import { playSplashChirp } from '#lib/sounds/audioManager.js';
  import GameShell from '#lib/components/ui/GameShell.svelte';
  import DebugHud from '#lib/splash/DebugHud.svelte';
  import { getSplashBudget, shouldSpawn, appendWithCap, filterExpired } from '#lib/splash/budget.js';

  const colors = ['#FF6B6B', '#4FC3F7', '#81C784', '#FFD54F', '#BA68C8', '#FF8A65', '#E57373', '#64B5F6'];
  const emojis = ['⭐', '🌸', '🦋', '💫', '🎈', '🌈', '✨', '❤️'];
  let splashes = $state([]);
  let nextId = 0;
  let activePointer = null;
  let surfaceRect = null;
  let lastSpawnAt = -Infinity;
  let lastSpawnX = 0;
  let lastSpawnY = 0;
  let measureStart = $state(0);
  let dragging = $state(false);
  let debug = $state(false);
  let cleanupTimer = null;

  const budget = $derived(getSplashBudget($settings.ageLevel));

  function startCleanup() {
    if (cleanupTimer !== null) return;
    cleanupTimer = setInterval(() => {
      const now = performance.now();
      const next = filterExpired(splashes, now);
      if (next.length !== splashes.length) splashes = next;
      if (splashes.length === 0) {
        clearInterval(cleanupTimer);
        cleanupTimer = null;
      }
    }, 100);
  }

  function createBurst(clientX, clientY) {
    if (!surfaceRect) return;
    const now = performance.now();
    const x = ((clientX - surfaceRect.left) / surfaceRect.width) * 100;
    const y = ((clientY - surfaceRect.top) / surfaceRect.height) * 100;
    const b = budget;
    const newSplashes = [];

    for (let i = 0; i < b.perBurst; i++) {
      newSplashes.push({
        id: nextId++,
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        size: b.sizeMin + Math.random() * (b.sizeMax - b.sizeMin),
        lifetimeMs: b.lifetimeMs,
        expiresAt: now + b.lifetimeMs
      });
    }

    splashes = appendWithCap(splashes, newSplashes, b.cap);
    lastSpawnAt = now;
    lastSpawnX = clientX;
    lastSpawnY = clientY;
    startCleanup();
    if ($settings.soundEnabled) playSplashChirp();
  }

  // Pointer Events: single unified input path (mouse + touch), pointer-id locked,
  // window-level move/up so drags survive leaving the surface.
  function down(e) {
    if (activePointer !== null) return;
    activePointer = e.pointerId;
    dragging = true;
    surfaceRect = e.currentTarget.getBoundingClientRect(); // cache: window moves lack currentTarget
    e.preventDefault?.();
    if (measureStart === 0) measureStart = performance.now();
    createBurst(e.clientX, e.clientY);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  function move(e) {
    if (e.pointerId !== activePointer) return;
    const b = budget;
    if (!shouldSpawn({
      now: performance.now(),
      lastSpawnAt,
      x: e.clientX,
      y: e.clientY,
      lastX: lastSpawnX,
      lastY: lastSpawnY,
      intervalMs: b.intervalMs,
      minDistancePx: b.minDistancePx
    })) return;
    createBurst(e.clientX, e.clientY);
  }

  function up(e) {
    if (e.pointerId !== undefined && e.pointerId !== activePointer) return;
    resetInput();
  }

  function resetInput() {
    activePointer = null;
    dragging = false;
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', up);
  }

  function onVisibility() {
    if (!document.hidden) return;
    resetInput();
    splashes = [];
    if (cleanupTimer !== null) {
      clearInterval(cleanupTimer);
      cleanupTimer = null;
    }
  }

  onMount(() => {
    debug = new URLSearchParams(window.location.search).get('debug') === '1';
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  });

  onDestroy(() => {
    resetInput();
    if (cleanupTimer !== null) clearInterval(cleanupTimer);
  });
</script>

<GameShell accent="#6EE7B7">
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="splash-game"
    role="application"
    onpointerdown={down}
  >
    {#each splashes as s (s.id)}
      <span
        class="splash"
        aria-hidden="true"
        style:left="{s.x}%"
        style:top="{s.y}%"
        style:font-size="{s.size}px"
        style:--lifetime="{s.lifetimeMs}ms"
        style:--color="{s.color}"
      >
        {s.emoji}
      </span>
    {/each}
  </div>
  {#if debug}
    <DebugHud
      liveCount={splashes.length}
      cap={budget.cap}
      measureStart={measureStart}
      dragging={dragging}
    />
  {/if}
</GameShell>

<style>
  .splash-game {
    flex: 1;
    position: relative;
    overflow: hidden;
    cursor: crosshair;
    touch-action: none;
    user-select: none;
    -webkit-touch-callout: none;
    padding-bottom: calc(8px + var(--safe-bottom));
  }
  .splash {
    position: absolute;
    transform: translate(-50%, -50%);
    animation: splashOut var(--lifetime, 1300ms) ease-out forwards;
    pointer-events: none;
    filter: drop-shadow(0 0 6px var(--color));
  }
  @keyframes splashOut {
    0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); }
    50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
  }
</style>
