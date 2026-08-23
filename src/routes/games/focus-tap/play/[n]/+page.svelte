<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { _ } from '$lib/stores/locale';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import HudPill from '$lib/components/ui/HudPill.svelte';
  import WinOverlay from '$lib/components/ui/WinOverlay.svelte';
  import '$lib/trainers/fx.css';

  import { makeRoundState, chooseSpawnItem } from '$lib/trainers/focusTap.js';
  import { saveLevel } from '$lib/trainers/progress.js';
  import { startTrainerMusic, stopTrainerMusic } from '$lib/sounds/trainerMusic.js';
  import { playPop } from '$lib/sounds/audioManager.js';
  import { playSparkle, fanfare } from '$lib/sounds/trainerSounds.js';

  let { data } = $props();
  const level = data.level;
  const round = makeRoundState(level, data.seed);
  const FANFARE_PITCH = 1.0;

  saveLevel('focus-tap', level);

  let items = $state([]);
  let caught = $state(0);
  let won = $state(false);
  let wrongFxId = $state(-1);
  let catchFx = $state(null); // { x, y } viewport-relative % for burst
  let idSeq = 0;
  let spawnTimer = null;
  let touchLock = false;

  function targetsOnScreen() {
    return items.filter((i) => i.isTarget).length;
  }

  function spawn() {
    if (won || items.length >= round.config.maxItems) return;
    const forced = targetsOnScreen() === 0;
    const pick = chooseSpawnItem(round, targetsOnScreen(), idSeq);
    if (forced && pick.isTarget) playSparkle();
    items.push({
      id: idSeq++,
      emoji: pick.emoji,
      isTarget: pick.isTarget,
      x: 6 + round.rng() * 84,
      wobbling: false,
      popping: false
    });
    items = items;
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
      catchFx = { x: item.x, y: lastTouchY ?? 50 };
      setTimeout(() => (catchFx = null), 450);
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

  let lastTouchY = null;
  function touchY(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    lastTouchY = ((e.clientY - rect.top) / rect.height) * 100;
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

  function visibility() {
    if (document.hidden) stopSpawning();
    else if (!won) startSpawning();
  }

  onMount(() => {
    startTrainerMusic('focus-tap');
    startSpawning();
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

  <div class="stream" data-testid="stream">
    <p class="hint">{$_('catchTarget', { e: round.target })}</p>
    {#if catchFx}
      <div
        class="catch-fx"
        style:left="{catchFx.x}%"
        style:top="{catchFx.y}%"
        data-testid="catch-fx"
      >
        ⭐
      </div>
    {/if}
    {#each items as item (item.id)}
      <button
        class="emoji"
        class:wobbling={item.wobbling}
        class:popping={item.popping}
        class:wrong-fx={wrongFxId === item.id}
        onpointerdown={(e) => { touchY(e); tap(item); }}
        style:left="{item.x}%"
        style:animation-duration="{round.config.riseSec}s"
        data-testid={item.isTarget ? 'target' : 'distractor'}
                oncontextmenu={(e) => e.preventDefault()}
      >
        {item.emoji}
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
  .emoji.wrong-fx {
    outline: 3px solid rgba(255, 120, 120, 0.9);
    outline-offset: -2px;
    border-radius: 12px;
    opacity: 0.75;
  }
  .emoji.wobbling {
    animation: fxWobbleFloat 0.3s ease-in-out;
  }
  .catch-fx {
    position: absolute;
    transform: translate(-50%, -50%);
    font-size: 40px;
    pointer-events: none;
    z-index: 4;
    animation: catchBurst 0.45s ease-out forwards;
  }
  @keyframes catchBurst {
    0% { transform: translate(-50%, -50%) scale(0.4); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
  }
  .emoji.popping {
    animation: fxPopFloat 0.18s ease-out forwards;
  }
  @keyframes floatUp {
    from { top: 105%; }
    to { top: -18%; }
  }
  @keyframes fxWobbleFloat {
    0%, 100% { margin-left: 0; }
    25% { margin-left: -5px; }
    50% { margin-left: 5px; }
    75% { margin-left: -2px; }
  }
  @keyframes fxPopFloat {
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
