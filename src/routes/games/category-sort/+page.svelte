<script>
  import { onDestroy } from 'svelte';
  import { settings } from '#lib/stores/settings.js';
  import { _ } from '#lib/stores/locale.js';
  import { playTap, playMatch } from '#lib/sounds/audioManager.js';
  import GameShell from '#lib/components/ui/GameShell.svelte';
  import HudPill from '#lib/components/ui/HudPill.svelte';
  import WinOverlay from '#lib/components/ui/WinOverlay.svelte';
  import LadderBar from '#lib/ladder/LadderBar.svelte';
  import LadderActions from '#lib/ladder/LadderActions.svelte';
  import { loadLevel, saveLevel, loadMastered, saveMastered, MAX_LEVEL } from '#lib/ladder/progress.js';
  import { buildRound } from '#lib/category-sort/categories.js';
  import CategoryArt from '#lib/category-sort/CategoryArt.svelte';

  function withUids(round) {
    return { ...round, items: round.items.map((item, uid) => ({ ...item, uid })) };
  }

  const initialLevel = loadLevel('category-sort');
  let level = $state(initialLevel);
  let mastered = $state(loadMastered('category-sort'));
  let round = $state(withUids(buildRound(initialLevel)));
  let placed = $state({});
  let selected = $state(null);
  let over = $state(null);
  let wrong = $state(-1);
  let popping = $state(-1);
  let correctTotal = $state(0);
  let won = $state(false);

  // drag = { item, x, y, startX, startY, moved, mode: 'drag' | 'return' | 'drop' }
  let drag = $state(null);
  let dragOrigin = null;
  let activePointer = null;
  let zoneEls = [];
  let timers = [];

  const placedCount = $derived(Object.values(placed).reduce((n, list) => n + list.length, 0));
  const totalItems = $derived(placedCount + round.items.length);
  const selectedItem = $derived(
    selected === null ? null : round.items.find((item) => item.uid === selected) ?? null
  );
  const showHelper = $derived(level === 1 && correctTotal < 5);
  const draggedCorrectly = $derived(
    drag && over !== null && drag.item.categoryId === round.bins[over]?.id
  );

  function later(fn, ms) {
    timers.push(setTimeout(fn, ms));
  }
  function clearTimers() {
    for (const t of timers) clearTimeout(t);
    timers = [];
  }

  function zoneAt(x, y) {
    const el = document.elementFromPoint(x, y);
    const target = el?.closest?.('[data-basket]');
    return target ? Number(target.getAttribute('data-basket')) : null;
  }

  function zoneCenter(i) {
    const el = zoneEls[i];
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height * 0.55 };
  }

  function stopPointer() {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    activePointer = null;
  }

  function startLevel(l) {
    clearTimers();
    stopPointer();
    level = l;
    saveLevel('category-sort', l);
    round = withUids(buildRound(l));
    placed = {};
    selected = null;
    over = null;
    wrong = -1;
    popping = -1;
    correctTotal = 0;
    won = false;
    drag = null;
    dragOrigin = null;
  }

  function nextLevel(e) {
    e?.preventDefault();
    startLevel(Math.min(MAX_LEVEL, level + 1));
  }

  function replayLevel(e) {
    e?.preventDefault();
    startLevel(level);
  }

  function startDrag(e, item) {
    if (won || drag || activePointer !== null) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    activePointer = e.pointerId;
    const r = e.currentTarget.getBoundingClientRect();
    dragOrigin = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    drag = {
      item,
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      mode: 'drag'
    };
    selected = null;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    e.preventDefault();
    if ($settings.soundEnabled) playTap();
  }

  function onMove(e) {
    if (!drag || e.pointerId !== activePointer) return;
    drag.x = e.clientX;
    drag.y = e.clientY;
    if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 8) drag.moved = true;
    over = zoneAt(e.clientX, e.clientY);
  }

  function onUp(e) {
    if (!drag || e.pointerId !== activePointer) return;
    const moved = drag.moved;
    const zone = zoneAt(e.clientX, e.clientY);
    stopPointer();
    over = null;

    if (!moved) {
      const item = drag.item;
      drag = null;
      toggleSelect(item);
      return;
    }

    if (zone === null) {
      returnToOrigin();
    } else if (drag.item.categoryId === round.bins[zone]?.id) {
      dropInto(zone);
    } else {
      reject(zone);
    }
  }

  function returnToOrigin() {
    if (!drag || !dragOrigin) return;
    const ghost = drag;
    const home = dragOrigin;
    drag.mode = 'return';
    requestAnimationFrame(() => {
      if (drag !== ghost) return;
      drag.x = home.x;
      drag.y = home.y;
    });
    later(() => {
      if (drag === ghost) drag = null;
    }, 340);
  }

  function dropInto(zone) {
    if (!drag) return;
    const center = zoneCenter(zone);
    const ghost = drag;
    drag.mode = 'drop';
    if (center) {
      requestAnimationFrame(() => {
        if (drag !== ghost) return;
        drag.x = center.x;
        drag.y = center.y;
      });
    }
    later(() => {
      if (drag !== ghost) return;
      commit(ghost.item, zone);
      drag = null;
    }, 260);
  }

  function reject(zone) {
    wrong = zone;
    returnToOrigin();
    later(() => (wrong = -1), 500);
  }

  function commit(item, zone) {
    placed = { ...placed, [zone]: [...(placed[zone] ?? []), item.emoji] };
    const remaining = round.items.filter((it) => it.uid !== item.uid);
    round = { ...round, items: remaining };
    selected = null;
    correctTotal += 1;
    popping = zone;
    later(() => (popping = -1), 450);
    if ($settings.soundEnabled) playMatch();
    if (remaining.length === 0) {
      later(() => {
        if (level >= MAX_LEVEL) {
          saveMastered('category-sort');
          mastered = true;
        }
        won = true;
      }, 280);
    }
  }

  function tapZone(i) {
    if (!selectedItem || won) return;
    if (selectedItem.categoryId === round.bins[i]?.id) {
      commit(selectedItem, i);
    } else {
      wrong = i;
      later(() => (wrong = -1), 500);
    }
  }

  function toggleSelect(item) {
    if (won) return;
    selected = selected === item.uid ? null : item.uid;
    if ($settings.soundEnabled) playTap();
  }

  onDestroy(() => {
    clearTimers();
    stopPointer();
  });
</script>

<GameShell accent="#F6B26B">
  {#snippet hudLeft()}
    <HudPill icon="✅" label={String(placedCount)} />
    <HudPill icon="🚩" label={String(level)} />
    <HudPill icon="🎯" label={`${placedCount}/${totalItems}`} />
  {/snippet}

  <div class="category-game">
    <div class="room">
      <div class="wall" aria-hidden="true"></div>
      <div class="floor" aria-hidden="true"></div>
      <div class="window" aria-hidden="true">
        <span class="moon"></span>
        <span class="wstar" style:left="22%" style:top="26%"></span>
        <span class="wstar" style:left="62%" style:top="18%"></span>
        <span class="wstar" style:left="46%" style:top="46%"></span>
      </div>

      <div class="zones" data-testid="bins" class:many={round.bins.length > 2}>
        {#each round.bins as bin, i}
          <button
            class="zone"
            class:over={over === i}
            class:wrong={wrong === i}
            class:helper={showHelper &&
              ((selectedItem && selectedItem.categoryId === bin.id) ||
                (drag && over === i && drag.item.categoryId === bin.id))}
            class:hover-wrong={drag && over === i && drag.item.categoryId !== bin.id}
            class:filled={(placed[i]?.length ?? 0) > 0}
            class:pop={popping === i}
            data-basket={i}
            data-cat={bin.id}
            bind:this={zoneEls[i]}
            onclick={() => tapZone(i)}
          >
            <span class="zone-sign">
              <CategoryArt id={bin.id} size={34} />
            </span>
            <span class="zone-name">{$_(bin.id)}</span>
            {#if showHelper &&
              ((selectedItem && selectedItem.categoryId === bin.id) ||
                (drag && over === i && drag.item.categoryId === bin.id))}
              <span class="ok-mark" aria-hidden="true">✓</span>
            {/if}
            <span class="shelf">
              {#each placed[i] ?? [] as emoji, n (n)}
                <span class="mini" style:animation-delay="{n * 45}ms">{emoji}</span>
              {/each}
            </span>
            <span class="zone-count">{placed[i]?.length ?? 0}</span>
          </button>
        {/each}
      </div>

      <div class="rug" aria-hidden="true"></div>

      <div class="tray-wrap">
        <p class="hint">{$_('dragToBin')}</p>
        <div class="tray">
          {#each round.items as item (item.uid)}
            <button
              class="draggable"
              class:selected={selected === item.uid}
              class:dragging={drag?.item.uid === item.uid}
              style:--tilt="{(item.uid % 3) - 1}deg"
              data-emoji={item.emoji}
              data-cat={item.categoryId}
              onpointerdown={(e) => startDrag(e, item)}
              onclick={(e) => {
                if (e.detail === 0) toggleSelect(item);
              }}
              aria-label={item.emoji}
            >
              {item.emoji}
            </button>
          {/each}
        </div>
      </div>

      {#if drag}
        <div
          class="ghost"
          class:live={drag.mode === 'drag'}
          class:correct={draggedCorrectly}
          class:dropping={drag.mode === 'drop'}
          style:left="{drag.x}px"
          style:top="{drag.y}px"
        >
          {drag.item.emoji}
        </div>
      {/if}
    </div>

    <div class="ladder-dock">
      <LadderBar current={level} {mastered} onchange={startLevel} />
    </div>
  </div>

  {#if won}
    <WinOverlay title={$_('allSorted')}>
      <LadderActions
        gameId="category-sort"
        {level}
        backHref="/"
        nextHref="/games/category-sort"
        replayHref="/games/category-sort"
        onnext={nextLevel}
        onreplay={replayLevel}
      />
    </WinOverlay>
  {/if}
</GameShell>

<style>
  .category-game {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
  }

  .room {
    position: relative;
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: #2a2035;
  }
  .wall {
    position: absolute;
    inset: 0 0 30% 0;
    background:
      radial-gradient(60% 44% at 50% 0%, rgba(255, 176, 88, 0.2), transparent 70%),
      repeating-linear-gradient(90deg, rgba(255, 248, 236, 0.035) 0 2px, transparent 2px 52px),
      linear-gradient(180deg, #43304a, #33253c);
  }
  .floor {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 30%;
    border-top: 6px solid #4a2e1b;
    background:
      repeating-linear-gradient(90deg, #6b4326 0 40px, #5a3720 40px 43px, #6b4326 43px 84px);
    box-shadow: inset 0 12px 26px rgba(0, 0, 0, 0.3);
    pointer-events: none;
  }
  .window {
    position: absolute;
    top: 4px;
    left: 22px;
    width: 70px;
    height: 58px;
    border-radius: 12px;
    background: #141b34;
    border: 5px solid #7a4e2d;
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35);
    overflow: hidden;
  }
  .moon {
    position: absolute;
    top: 9px;
    right: 11px;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: #ffe3a3;
    box-shadow: 0 0 14px rgba(255, 214, 140, 0.7);
  }
  .wstar {
    position: absolute;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #fff;
    opacity: 0.8;
    animation: twinkle 3.6s ease-in-out infinite;
  }

  .zones {
    position: relative;
    z-index: 2;
    width: min(360px, 92%);
    margin: 74px auto 0;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .zones > :last-child:nth-child(odd) {
    grid-column: 1 / -1;
    width: min(200px, 62%);
    justify-self: center;
  }
  .zone {
    position: relative;
    aspect-ratio: 1 / 0.92;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px;
    border-radius: 22px;
    background: linear-gradient(160deg, rgba(255, 248, 236, 0.16), rgba(255, 248, 236, 0.05));
    border: 2px solid rgba(255, 233, 201, 0.32);
    box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.25), 0 8px 18px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease,
      opacity 0.2s ease;
    touch-action: manipulation;
  }
  .zone.over {
    transform: translateY(-3px) scale(1.02);
    border-color: rgba(255, 205, 140, 0.9);
    box-shadow: 0 0 24px rgba(255, 205, 140, 0.45);
  }
  .zone.helper {
    border-color: #7ee787;
    box-shadow: 0 0 22px rgba(126, 231, 135, 0.55);
  }
  .zone.hover-wrong { opacity: 0.55; }
  .zone.filled { border-color: rgba(255, 205, 140, 0.55); }
  .zone.wrong { animation: wobble 0.38s ease-in-out; }
  .zone.pop { animation: zonePop 0.32s ease-out; }
  @keyframes wobble {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-6px); }
    75% { transform: translateX(6px); }
  }
  @keyframes zonePop {
    0% { transform: scale(1); }
    45% { transform: scale(1.04); }
    100% { transform: scale(1); }
  }
  .zone-sign {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: #fff8ec;
    border: 2px solid #3a271b;
    display: grid;
    place-items: center;
    box-shadow: 0 3px 0 rgba(52, 28, 16, 0.4);
  }
  .zone-name {
    margin-top: 3px;
    font-size: 11px;
    font-weight: 700;
    color: #ffe6c4;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  }
  .ok-mark {
    position: absolute;
    top: -9px;
    right: -7px;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #7ee787;
    color: #06301a;
    font-size: 15px;
    font-weight: 800;
    display: grid;
    place-items: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  .shelf {
    flex: 1;
    width: 100%;
    margin-top: 4px;
    padding: 4px;
    display: flex;
    flex-wrap: wrap;
    align-content: center;
    justify-content: center;
    gap: 2px;
    border-radius: 10px;
    background: rgba(58, 39, 27, 0.45);
    border: 1px solid rgba(255, 205, 140, 0.18);
    font-size: 20px;
    line-height: 1.1;
  }
  .mini { animation: popIn 0.26s ease-out backwards; }
  .zone-count {
    position: absolute;
    top: 6px;
    right: 8px;
    font-size: 10px;
    font-weight: 700;
    color: #ffe6c4;
    opacity: 0.7;
  }

  .rug {
    position: absolute;
    left: 4%;
    right: 4%;
    bottom: 3%;
    height: 32%;
    z-index: 1;
    border-radius: 50% / 22%;
    background:
      repeating-linear-gradient(90deg, rgba(255, 205, 140, 0.12) 0 18px, transparent 18px 36px),
      linear-gradient(180deg, #7a3f2e, #53291f);
    border: 2px solid rgba(255, 205, 140, 0.22);
    box-shadow: inset 0 3px 14px rgba(255, 205, 140, 0.14), 0 14px 26px rgba(0, 0, 0, 0.28);
    pointer-events: none;
  }

  .tray-wrap {
    position: relative;
    z-index: 3;
    margin-top: auto;
    padding: 8px 10px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
  .hint {
    font-size: 13px;
    font-weight: 600;
    color: #ffe6c4;
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
  }
  .tray {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 7px;
    padding: 9px 12px;
    border-radius: 20px;
    background: rgba(58, 39, 27, 0.55);
    border: 2px solid rgba(255, 205, 140, 0.3);
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
    max-width: min(360px, 94vw);
  }
  .draggable {
    width: 54px;
    height: 54px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    font-size: 32px;
    line-height: 1;
    background: linear-gradient(160deg, #fff8ec, #ffe9c9);
    border: 2px solid rgba(255, 205, 140, 0.65);
    box-shadow: 0 4px 0 rgba(52, 28, 16, 0.45), 0 8px 12px rgba(0, 0, 0, 0.28);
    transform: rotate(var(--tilt, 0deg));
    transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.14s ease;
    touch-action: none;
  }
  .draggable.selected {
    transform: translateY(-4px) rotate(0deg) scale(1.05);
    box-shadow: 0 0 0 4px rgba(255, 205, 140, 0.55), 0 10px 18px rgba(0, 0, 0, 0.32);
  }
  .draggable.dragging { opacity: 0; }

  .ghost {
    position: fixed;
    z-index: 80;
    width: 62px;
    height: 62px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    font-size: 38px;
    background: linear-gradient(160deg, #fff8ec, #ffe9c9);
    border: 2px solid rgba(255, 205, 140, 0.8);
    box-shadow: 0 14px 22px rgba(0, 0, 0, 0.38);
    transform: translate(-50%, -50%) rotate(-4deg) scale(1.08);
    pointer-events: none;
    transition: left 0.34s cubic-bezier(0.34, 1.4, 0.64, 1),
      top 0.34s cubic-bezier(0.34, 1.4, 0.64, 1),
      transform 0.26s ease, opacity 0.26s ease, box-shadow 0.2s ease;
  }
  .ghost.live { transition: none; }
  .ghost.correct {
    border-color: #7ee787;
    box-shadow: 0 0 22px rgba(126, 231, 135, 0.65);
  }
  .ghost.dropping {
    transform: translate(-50%, -50%) rotate(0) scale(0.35);
    opacity: 0.15;
  }

  .ladder-dock {
    flex-shrink: 0;
    padding: 6px 0 calc(6px + var(--safe-bottom));
    background: rgba(16, 12, 22, 0.55);
    border-top: 1px solid rgba(255, 205, 140, 0.12);
  }
  .category-game :global(.ladder-step.active) {
    background: #f6b26b;
    border-color: #f6b26b;
    color: #3a271b;
    box-shadow: 0 0 10px rgba(246, 178, 107, 0.55);
  }

  .category-game :global(.win-overlay) { background: rgba(20, 12, 10, 0.72); }
  .category-game :global(.win-card) {
    background: linear-gradient(160deg, #fff8ec, #ffe7c2);
    border: 2px solid rgba(255, 205, 140, 0.7);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5), 0 0 50px rgba(255, 190, 110, 0.25);
  }
  .category-game :global(.win-title) { color: #8a4b1f; text-shadow: none; }
  .category-game :global(.win-sub) { color: #6b4a33; }

  @media (max-height: 700px) {
    .zones { margin-top: 58px; }
    .zone { aspect-ratio: 1 / 0.84; }
    .draggable { width: 48px; height: 48px; font-size: 28px; }
    .tray { gap: 5px; padding: 7px 10px; }
  }
</style>
