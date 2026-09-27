<script>
  import { onMount, untrack } from 'svelte';
  import { goto } from '$app/navigation';
  import { _ } from '$lib/stores/locale';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import HudPill from '$lib/components/ui/HudPill.svelte';
  import WinOverlay from '$lib/components/ui/WinOverlay.svelte';
  import '$lib/trainers/fx.css';

  import { makeRoundState, nextSpawn } from '$lib/trainers/focusTap.js';
  import { saveLevel } from '$lib/trainers/progress.js';
  import { startTrainerMusic, stopTrainerMusic } from '$lib/sounds/trainerMusic.js';
  import { playPop } from '$lib/sounds/audioManager.js';
  import { playSparkle, fanfare } from '$lib/sounds/trainerSounds.js';

  let { data } = $props();
  const level = $derived(data.level);
  const round = $derived(makeRoundState(level, data.seed));
  const FANFARE_PITCH = 1.0;

  let items = $state([]);
  let caught = $state(0);
  let won = $state(false);
  let wrongFxId = $state(-1);
  let catchFx = $state(null); // { x, y } stream-relative % for burst
  let idSeq = 0;
  let spawnTimer = null;
  let touchLock = false;
  let streamEl = $state(null);

  function spawn() {
    if (won) return;
    const next = nextSpawn(round, items, idSeq);
    items = next.items;
    if (!next.item) return;
    idSeq += 1;
    if (next.forced && next.item.isTarget) playSparkle();
  }

  function removeItem(id) {
    items = items.filter((i) => i.id !== id);
  }

  function tap(item) {
    if (touchLock || won || item.popping) return;
    touchLock = true;
    setTimeout(() => (touchLock = false), 60);
    if (item.isTarget) {
      item.popping = true;
      playPop(0.94 + (caught % 4) * 0.04); // slight variation per catch
      if (lastTouch) {
        catchFx = lastTouch;
        setTimeout(() => (catchFx = null), 450);
      }
      caught += 1;
      setTimeout(() => removeItem(item.id), 180);
      if (caught >= round.config.goal) {
        won = true;
        stopSpawning();
      }
    } else {
      item.wobbling = true; // silent — positive-only
      wrongFxId = item.id;
      setTimeout(() => {
        item.wobbling = false;
        if (wrongFxId === item.id) wrongFxId = -1;
      }, 420);
    }
  }

  let lastTouch = null;
  function touchY(e) {
    if (!streamEl) return;
    const rect = streamEl.getBoundingClientRect();
    const el = e.currentTarget.getBoundingClientRect();
    // Positions inside an overflow container are layout-relative: add back the
    // container's own scroll offset so the burst lands on the tapped emoji even
    // if a focus scroll nudged the stream.
    lastTouch = {
      x: el.left + el.width / 2 - rect.left + streamEl.scrollLeft,
      y: el.top + el.height / 2 - rect.top + streamEl.scrollTop
    };
  }

  function startSpawning() {
    stopSpawning();
    spawnTimer = setInterval(spawn, round.config.spawnMs);
  }

  function stopSpawning() {
    if (spawnTimer) clearInterval(spawnTimer);
    spawnTimer = null;
  }

  function nextLevel(e) {
    e.preventDefault();
    fanfare(FANFARE_PITCH);
    goto(`/games/focus-tap/play/${level + 1}`);
  }

  function replay(e) {
    e.preventDefault();
    goto(`/games/focus-tap/play/${level}?seed=${Date.now() % 1000000}`);
  }

  function resetRound() {
    stopSpawning();
    saveLevel('focus-tap', level);
    items = [];
    caught = 0;
    won = false;
    wrongFxId = -1;
    catchFx = null;
    touchLock = false;
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
    else if (!won) startSpawning();
  }

  onMount(() => {
    startTrainerMusic('focus-tap');
    document.addEventListener('visibilitychange', visibility);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      stopSpawning();
      stopTrainerMusic();
    };
  });
</script>

<GameShell accent="#F87171">
  {#snippet hudLeft()}
    <HudPill icon="🎯" label={round.target} />
    <HudPill icon="✅" label={`${caught}/${round.config.goal}`} />
  {/snippet}

  <div class="stream" data-testid="stream" bind:this={streamEl}>
    <p class="hint">{$_('catchTarget', { e: round.target })}</p>
    {#if catchFx}
      <div
        class="catch-fx"
        style:left="{catchFx.x}px"
        style:top="{catchFx.y}px"
        data-testid="catch-fx"
      >
        ⭐
      </div>
    {/if}
    {#each items as item (item.id)}
      <button
        class="emoji"
        class:popping={item.popping}
        class:wrong-fx={wrongFxId === item.id}
        onpointerdown={(e) => { touchY(e); tap(item); }}
        style:left="{item.x}%"
        style:animation-duration="{round.config.riseSec}s"
        data-testid={item.isTarget ? 'target' : 'distractor'}
                oncontextmenu={(e) => e.preventDefault()}
      >
        <span class="emoji-body" class:wobbling={item.wobbling} class:popping={item.popping}>{item.emoji}</span>
      </button>
    {/each}
  </div>

  {#if won}
    <WinOverlay title={$_('wellDone')} subtitle={`🎯 ${caught}/${round.config.goal}`}>
      {#snippet badge()}<img class="win-badge" src="/art/trainers/focus-tap/win-badge.png" alt="" />{/snippet}
      <a
        class="big-btn primary"
        href={`/games/focus-tap/play/${level + 1}`}
        data-testid="next-level"
        onclick={nextLevel}
      >
        {$_('nextLevel')} ▶
      </a>
      <a
        class="big-btn ghost"
        href={`/games/focus-tap/play/${level}`}
        data-testid="replay"
        onclick={replay}
      >
        {$_('replay')}
      </a>
      <a class="big-btn ghost" href="/games/focus-tap">{$_('back')}</a>
    </WinOverlay>
  {/if}
</GameShell>

<style>
  .stream {
    position: relative;
    flex: 1;
    overflow: hidden;
  }
  .hint {
    text-align: center;
    font-size: 20px;
    font-weight: 700;
    color: var(--text-hi);
    padding-top: 10px;
  }
  .emoji {
    position: absolute;
    top: 105%;
    font-size: 46px;
    line-height: 1;
    background: none;
    border: none;
    animation-name: floatUp;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
    filter: drop-shadow(0 0 6px var(--accent-glow));
  }
  .emoji-body {
    display: inline-block;
  }
  .emoji.wrong-fx {
    outline: 3px solid rgba(255, 120, 120, 0.9);
    outline-offset: -2px;
    border-radius: 12px;
    opacity: 0.75;
  }
  .emoji-body.wobbling {
    animation: fxWobble 0.3s ease-in-out;
  }
  .catch-fx {
    position: absolute;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: -20px;
    margin-top: -20px;
    font-size: 40px;
    pointer-events: none;
    z-index: 4;
    animation: catchBurst 0.45s ease-out forwards;
  }
  @keyframes catchBurst {
    0% { transform: scale(0.4); opacity: 1; }
    100% { transform: scale(2.2); opacity: 0; }
  }
  .emoji-body.popping {
    animation: fxPop 0.18s ease-out forwards;
  }
  @keyframes floatUp {
    from { top: 105%; }
    to { top: -18%; }
  }
  @keyframes fxWobble {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    50% { transform: translateX(5px); }
    75% { transform: translateX(-2px); }
  }
  @keyframes fxPop {
    to { transform: scale(1.6); opacity: 0; }
  }

  .win-badge { width: 64px; height: 64px; filter: drop-shadow(0 0 12px var(--glow-gold)); }
  .big-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: var(--touch-min);
    padding: 12px 32px;
    border-radius: var(--radius-btn);
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 600;
    text-decoration: none;
    transition: transform 0.15s;
  }
  .big-btn:active { transform: scale(0.95); }
  .primary {
    color: #062033;
    background: var(--btn-gradient);
    box-shadow: 0 4px 18px rgba(91, 194, 240, 0.5);
  }
  .ghost {
    color: var(--text-lo);
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
  }
</style>
