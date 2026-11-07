<script>
  import { onDestroy } from 'svelte';
  import { settings } from '$lib/stores/settings';
  import { _ } from '$lib/stores/locale';
  import { playTap, playMatch, playSoftNo } from '$lib/sounds/audioManager';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import LadderBar from '$lib/ladder/LadderBar.svelte';
  import LadderActions from '$lib/ladder/LadderActions.svelte';
  import WinOverlay from '$lib/components/ui/WinOverlay.svelte';
  import { loadLevel, saveLevel, loadMastered, saveMastered, MAX_LEVEL } from '$lib/ladder/progress.js';
  import ItemArt from '$lib/sorting/ItemArt.svelte';
  import BasketArt from '$lib/sorting/BasketArt.svelte';
  import { buildRound, signFor } from '$lib/sorting/data.js';

  const initialLevel = loadLevel('sorting');
  let level = $state(initialLevel);
  let mastered = $state(loadMastered('sorting'));
  let round = $state(buildRound(initialLevel));
  let placed = $state({});
  let selected = $state(null);
  let over = $state(null);
  let wrong = $state(-1);
  let won = $state(false);

  // drag = { uid, art, x, y, startX, startY, moved, mode: 'drag' | 'return' | 'drop' }
  let drag = $state(null);
  let dragOrigin = null;
  let activePointer = null;
  let basketEls = [];
  let timers = [];

  function later(fn, ms) {
    timers.push(setTimeout(fn, ms));
  }
  function clearTimers() {
    for (const t of timers) clearTimeout(t);
    timers = [];
  }

  function basketAt(x, y) {
    const el = document.elementFromPoint(x, y);
    const target = el?.closest?.('[data-basket]');
    return target ? Number(target.getAttribute('data-basket')) : null;
  }

  function basketCenter(i) {
    const el = basketEls[i];
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height * 0.5 };
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
    saveLevel('sorting', l);
    round = buildRound(l);
    placed = {};
    selected = null;
    over = null;
    wrong = -1;
    won = false;
    drag = null;
    dragOrigin = null;
  }

  function setLevel(l) {
    startLevel(l);
  }
  function advanceLevel(e) {
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
      uid: item.uid,
      art: item.art,
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
    over = basketAt(e.clientX, e.clientY);
  }

  function onUp(e) {
    if (!drag || e.pointerId !== activePointer) return;
    const moved = drag.moved;
    const basket = basketAt(e.clientX, e.clientY);
    stopPointer();
    over = null;

    if (!moved) {
      const item = round.items.find((it) => it.uid === drag.uid);
      drag = null;
      if (item) toggleSelect(item);
      return;
    }

    const item = round.items.find((it) => it.uid === drag.uid);
    if (!item) {
      drag = null;
      return;
    }
    if (basket === null) {
      returnToOrigin();
    } else if (item.cat === basket) {
      dropInto(item, basket);
    } else {
      reject(item, basket);
    }
  }

  // Animate the ghost back to the slot it came from, then reveal the item.
  function returnToOrigin() {
    if (!drag || !dragOrigin) return;
    drag.mode = 'return';
    const ghost = drag;
    const origin = dragOrigin;
    requestAnimationFrame(() => {
      if (drag !== ghost) return;
      drag.x = origin.x;
      drag.y = origin.y;
    });
    later(() => {
      if (drag === ghost) drag = null;
    }, 340);
  }

  function dropInto(item, basket) {
    if (!drag) return;
    const center = basketCenter(basket);
    drag.mode = 'drop';
    const ghost = drag;
    if (center) {
      requestAnimationFrame(() => {
        if (drag !== ghost) return;
        drag.x = center.x;
        drag.y = center.y;
      });
    }
    later(() => {
      if (drag !== ghost) return;
      commitPlacement(item, basket);
      drag = null;
    }, 260);
  }

  function reject(item, basket) {
    wrong = basket;
    if ($settings.soundEnabled) playSoftNo();
    returnToOrigin();
    later(() => (wrong = -1), 500);
  }

  function commitPlacement(item, basket) {
    placed = { ...placed, [basket]: [...(placed[basket] ?? []), item.art] };
    const remaining = round.items.filter((it) => it.uid !== item.uid);
    round = { ...round, items: remaining };
    selected = null;
    if ($settings.soundEnabled) playMatch();
    if (remaining.length === 0) {
      later(() => {
        if (level >= MAX_LEVEL) {
          saveMastered('sorting');
          mastered = true;
        }
        won = true;
      }, 260);
    }
  }

  function tapBasket(i) {
    if (selected === null) return;
    const item = round.items.find((it) => it.uid === selected);
    if (!item) return;
    if (item.cat === i) {
      commitPlacement(item, i);
    } else {
      wrong = i;
      if ($settings.soundEnabled) playSoftNo();
      later(() => (wrong = -1), 500);
    }
  }

  function toggleSelect(item) {
    if (won) return;
    selected = selected === item.uid ? null : item.uid;
  }

  onDestroy(() => {
    clearTimers();
    stopPointer();
  });
</script>

<GameShell accent="#F6B26B">
  {#snippet hudLeft()}
    <span class="level-label">{$_('level')} {level}</span>
  {/snippet}

  <div class="sorting-game" data-category={round.category}>
    <div class="scene">
      <div class="lantern" aria-hidden="true"></div>
      <div class="table" aria-hidden="true"></div>
      <div class="table-light" aria-hidden="true"></div>
      <div class="runner" aria-hidden="true"></div>

      {#if round.baskets.length <= 2}
        <div class="prop lantern-prop" aria-hidden="true">
          <svg viewBox="0 0 48 72">
            <path d="M14 18 16 9h16l2 9" fill="#8A5A34" stroke="#3A271B" stroke-width="2" stroke-linejoin="round" />
            <path d="M10 18h28l-3 46H13z" fill="#F2C14E" stroke="#3A271B" stroke-width="2" stroke-linejoin="round" />
            <rect x="18" y="27" width="12" height="26" rx="6" fill="#FFF3C4" stroke="#8A5A34" stroke-width="1.6" />
            <circle cx="24" cy="40" r="5" fill="#FFF8EC" />
            <path d="M8 64h32" stroke="#8A5A34" stroke-width="4" stroke-linecap="round" />
          </svg>
        </div>
        <div class="prop plant-prop" aria-hidden="true">
          <svg viewBox="0 0 48 72">
            <path d="M18 44h12l-2 20H20z" fill="#C97A4A" stroke="#3A271B" stroke-width="2" stroke-linejoin="round" />
            <path d="M24 44c-10 0-14-10-12-20 8 2 12 10 12 20zM24 44c10 0 14-10 12-20-8 2-12 10-12 20zM24 44c-2-14 4-22 4-22s6 8 0 22z" fill="#57A773" stroke="#2F6A48" stroke-width="1.6" />
          </svg>
        </div>
      {/if}

      <div class="fireflies" aria-hidden="true">
        {#each [0, 1, 2, 3, 4] as f (f)}
          <span class="fly" style:left="{14 + f * 18}%" style:top="{12 + (f % 3) * 14}%"></span>
        {/each}
      </div>

      <div class="tray">
        {#each round.items as item (item.uid)}
          <button
            class="item"
            class:selected={selected === item.uid}
            class:dragging={drag?.uid === item.uid}
            style:--tilt="{(item.uid % 3) - 1}deg"
            data-art={item.art}
            data-cat={item.cat}
            aria-label={item.art}
            onpointerdown={(e) => startDrag(e, item)}
            onclick={(e) => {
              if (e.detail === 0) toggleSelect(item);
            }}
          >
            <ItemArt id={item.art} size={54} />
          </button>
        {/each}
      </div>

      <p class="hint">
        <span class="hint-arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M12 3v14M6 12l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
        {selected !== null ? $_('tapBasket') : $_('tapItem')}
      </p>

      <div class="baskets">
        {#each round.baskets as basket, i}
          <button
            class="basket"
            class:over={over === i}
            class:wrong={wrong === i}
            data-basket={i}
            bind:this={basketEls[i]}
            onclick={() => tapBasket(i)}
          >
            <span class="basket-art">
              <BasketArt sign={signFor(round.category, basket)} size={84} />
            </span>
            <span class="basket-label">{$_(basket)}</span>
            <span class="basket-count">{placed[i]?.length ?? 0}</span>
            <span class="pile">
              {#each placed[i] ?? [] as art, n (n)}
                <span class="mini" style:animation-delay="{n * 45}ms">
                  <ItemArt id={art} size={18} />
                </span>
              {/each}
            </span>
          </button>
        {/each}
      </div>

      {#if drag}
        <div
          class="drag-ghost"
          class:live={drag.mode === 'drag'}
          class:returning={drag.mode === 'return'}
          class:dropping={drag.mode === 'drop'}
          style:left="{drag.x}px"
          style:top="{drag.y}px"
        >
          <ItemArt id={drag.art} size={64} />
        </div>
      {/if}

      {#if won}
        <WinOverlay title={$_('allSorted')}>
          <LadderActions
            gameId="sorting"
            {level}
            backHref="/"
            nextHref="/games/sorting"
            replayHref="/games/sorting"
            onnext={advanceLevel}
            onreplay={replayLevel}
          />
        </WinOverlay>
      {/if}
    </div>

    <div class="ladder-dock">
      <LadderBar current={level} {mastered} onchange={setLevel} />
    </div>
  </div>
</GameShell>

<style>
  .level-label {
    font-size: 16px;
    font-weight: 700;
    color: #ffcf8a;
    text-shadow: 0 0 12px rgba(255, 190, 110, 0.45);
  }

  .sorting-game {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
  }

  .scene {
    position: relative;
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: radial-gradient(130% 90% at 50% 0%, #3a2733 0%, #201a33 55%, #141024 100%);
  }
  .lantern {
    position: absolute;
    left: 50%;
    bottom: -16%;
    width: 130%;
    height: 66%;
    transform: translateX(-50%);
    background: radial-gradient(closest-side, rgba(255, 176, 88, 0.42), transparent 72%);
    pointer-events: none;
  }
  .table {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 68%;
    border-top: 6px solid #4a2e1b;
    background:
      linear-gradient(180deg, rgba(255, 206, 140, 0.22), transparent 34%),
      repeating-linear-gradient(90deg, #7a4e2d 0 34px, #6b4326 34px 37px, #7a4e2d 37px 70px);
    box-shadow: inset 0 14px 30px rgba(0, 0, 0, 0.35);
    pointer-events: none;
  }
  .table-light {
    position: absolute;
    left: 50%;
    top: 16%;
    width: 78%;
    height: 34%;
    transform: translateX(-50%);
    background: radial-gradient(closest-side, rgba(255, 205, 140, 0.2), transparent 72%);
    pointer-events: none;
  }
  .runner {
    position: absolute;
    left: 4%;
    right: 4%;
    bottom: 5%;
    height: 25%;
    z-index: 1;
    border-radius: 26px;
    border: 2px solid rgba(255, 205, 140, 0.2);
    background:
      repeating-linear-gradient(90deg, rgba(255, 205, 140, 0.13) 0 16px, transparent 16px 32px),
      linear-gradient(180deg, #7a3f2e, #53291f);
    box-shadow: inset 0 3px 14px rgba(255, 205, 140, 0.14), 0 14px 26px rgba(0, 0, 0, 0.28);
    pointer-events: none;
  }
  .prop {
    position: absolute;
    bottom: 4%;
    z-index: 1;
    filter: drop-shadow(0 10px 10px rgba(0, 0, 0, 0.3));
    pointer-events: none;
    opacity: 0.95;
  }
  .lantern-prop { left: 4%; width: 44px; }
  .plant-prop { right: 3%; width: 48px; }
  .prop svg { display: block; width: 100%; height: auto; }
  .fireflies {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }  .fly {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ffe3a3;
    box-shadow: 0 0 10px 3px rgba(255, 214, 140, 0.5);
    animation: fly 8s ease-in-out infinite;
  }
  .fly:nth-child(2n) { animation-duration: 11s; animation-delay: -3s; }
  .fly:nth-child(3n) { animation-duration: 9.5s; animation-delay: -6s; }
  @keyframes fly {
    0%, 100% { transform: translate(0, 0); opacity: 0.2; }
    30% { transform: translate(16px, -24px); opacity: 0.9; }
    60% { transform: translate(-12px, -42px); opacity: 0.45; }
  }

  .tray {
    position: relative;
    z-index: 2;
    margin: 27% auto 0;
    padding: 12px 14px;
    width: fit-content;
    max-width: min(360px, 92%);
    min-width: 200px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    border-radius: 24px;
    background: rgba(60, 38, 22, 0.58);
    border: 2px solid rgba(255, 205, 140, 0.32);
    box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.35), 0 10px 24px rgba(0, 0, 0, 0.28);
  }
  .item {
    width: 62px;
    height: 62px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    background: linear-gradient(160deg, #fff8ec, #ffe9c9);
    border: 2px solid rgba(255, 205, 140, 0.65);
    box-shadow: 0 4px 0 rgba(52, 28, 16, 0.5), 0 8px 14px rgba(0, 0, 0, 0.3);
    transform: rotate(var(--tilt, 0deg));
    transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.14s ease;
    touch-action: none;
  }
  .item:hover,
  .item.selected {
    transform: translateY(-5px) rotate(0deg) scale(1.06);
    box-shadow: 0 0 0 4px rgba(255, 205, 140, 0.55), 0 12px 20px rgba(0, 0, 0, 0.35);
  }
  .item.selected { animation: breathe 1.6s ease-in-out infinite; }
  .item.dragging { opacity: 0; }
  @keyframes breathe {
    0%, 100% { box-shadow: 0 0 0 4px rgba(255, 205, 140, 0.45), 0 12px 20px rgba(0, 0, 0, 0.35); }
    50% { box-shadow: 0 0 0 7px rgba(255, 205, 140, 0.7), 0 12px 20px rgba(0, 0, 0, 0.35); }
  }

  .hint {
    position: relative;
    z-index: 2;
    margin: 12px 0 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #ffe6c4;
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
  }
  .hint-arrow {
    display: inline-flex;
    color: #ffcf8a;
    animation: nudge 1.4s ease-in-out infinite;
  }
  @keyframes nudge {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(4px); }
  }

  .baskets {
    position: relative;
    z-index: 2;
    margin-top: auto;
    margin-bottom: 8px;
    padding: 0 8px;
    width: min(390px, 96%);
    display: flex;
    justify-content: center;
    align-items: flex-end;
    gap: 4px;
  }
  .basket {
    position: relative;
    flex: 1 1 0;
    min-width: 0;
    max-width: 118px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: none;
    touch-action: manipulation;
  }
  .basket-art {
    display: block;
    width: 100%;
    transition: transform 0.2s ease, filter 0.2s ease;
    filter: drop-shadow(0 8px 10px rgba(0, 0, 0, 0.3));
  }
  .basket-art :global(svg) { width: 100%; height: auto; }
  .basket.over .basket-art,
  .basket:hover .basket-art {
    transform: translateY(-6px) scale(1.05);
    filter: drop-shadow(0 0 16px rgba(255, 205, 140, 0.65));
  }
  .basket.wrong .basket-art { animation: wobble 0.38s ease-in-out; }
  @keyframes wobble {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-7px); }
    75% { transform: translateX(7px); }
  }
  .basket-label {
    margin-top: -2px;
    font-size: 12px;
    font-weight: 700;
    color: #ffe6c4;
    white-space: nowrap;
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.55);
  }
  .basket-count {
    position: absolute;
    right: 6px;
    bottom: 26px;
    min-width: 20px;
    height: 20px;
    padding: 0 4px;
    border-radius: 10px;
    background: #fff8ec;
    color: #8a4b1f;
    font-size: 11px;
    font-weight: 700;
    display: grid;
    place-items: center;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }
  .pile {
    position: absolute;
    top: 47%;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 1px;
    z-index: 2;
  }
  .mini { animation: popIn 0.26s ease-out backwards; }

  .drag-ghost {
    position: fixed;
    z-index: 80;
    transform: translate(-50%, -50%) rotate(-5deg) scale(1.12);
    pointer-events: none;
    filter: drop-shadow(0 18px 18px rgba(0, 0, 0, 0.4));
    transition: left 0.34s cubic-bezier(0.34, 1.4, 0.64, 1),
      top 0.34s cubic-bezier(0.34, 1.4, 0.64, 1),
      transform 0.26s ease, opacity 0.26s ease;
    will-change: left, top;
  }
  .drag-ghost.live { transition: none; }
  .drag-ghost.dropping {
    transform: translate(-50%, -50%) rotate(0deg) scale(0.35);
    opacity: 0.15;
  }

  .ladder-dock {
    flex-shrink: 0;
    padding: 6px 0 calc(6px + var(--safe-bottom));
    background: rgba(16, 12, 22, 0.55);
    border-top: 1px solid rgba(255, 205, 140, 0.12);
  }
  .sorting-game :global(.ladder-step.active) {
    background: #f6b26b;
    border-color: #f6b26b;
    color: #3a271b;
    box-shadow: 0 0 10px rgba(246, 178, 107, 0.55);
  }

  .sorting-game :global(.win-overlay) { background: rgba(20, 12, 10, 0.72); }
  .sorting-game :global(.win-card) {
    background: linear-gradient(160deg, #fff8ec, #ffe7c2);
    border: 2px solid rgba(255, 205, 140, 0.7);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5), 0 0 50px rgba(255, 190, 110, 0.25);
  }
  .sorting-game :global(.win-title) { color: #8a4b1f; text-shadow: none; }
  .sorting-game :global(.win-sub) { color: #6b4a33; }

  @media (max-height: 700px) {
    .tray { margin-top: 22%; padding: 9px 12px; gap: 6px; }
    .item { width: 54px; height: 54px; }
    .basket { width: min(76px, 20vw); }
  }
</style>
