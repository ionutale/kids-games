<script>
  import { onMount } from 'svelte';
  import { _ } from '$lib/stores/locale';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import '$lib/trainers/fx.css';
  import HudPill from '$lib/components/ui/HudPill.svelte';
  import Confetti from '$lib/components/Confetti.svelte';
  import { playMatch, playWin } from '$lib/sounds/audioManager.js';
  import { buildRound, correctBin } from '$lib/category-sort/categories.js';

  let roundIndex = $state(0);
  let round = $state(buildRound(0, 8));
  let itemIdx = $state(0);
  let correctTotal = $state(0);
  let roundsDone = $state(0);

  // area geometry (reactive → resize-safe home slot)
  let areaW = $state(0);
  let areaH = $state(0);
  const homeX = $derived(areaW / 2);
  const homeY = $derived(areaH * 0.6);

  let dragging = $state(false);
  let dragX = $state(0);
  let dragY = $state(0);
  let hoverBin = $state(-1);
  let wrongBin = $state(-1);
  let celebrate = $state(false);
  let returning = $state(false);
  let flying = $state(null); // { emoji, x, y } ghost flying into a bin

  // tap-to-place state
  let selected = $state(false);

  let binEls = [];
  let areaEl;
  let activePointerId = null;
  let dragStart = null;
  let dragMoved = false;
  let timers = [];

  function later(fn, ms) {
    timers.push(setTimeout(fn, ms));
  }
  function clearTimers() {
    for (const t of timers) clearTimeout(t);
    timers = [];
  }

  function rel(e) {
    const r = areaEl.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function nextRound() {
    roundIndex += 1;
    round = buildRound(roundIndex, 8);
    itemIdx = 0;
    celebrate = false;
    selected = false;
  }

  const currentItem = $derived(round?.items[itemIdx] ?? null);
  const correctBinId = $derived(currentItem?.categoryId ?? null);

  function binCenter(i) {
    const el = binEls[i];
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 };
  }

  // ---- drag ------------------------------------------------------------
  function beginDrag(e) {
    if (!currentItem || celebrate || dragging) return;
    if (returning) returning = false; // kid re-grabs mid-bounce-back: cancel it
    if (activePointerId !== null) return; // single-touch lock
    activePointerId = e.pointerId;
    selected = false;
    dragging = true;
    const p = rel(e);
    dragX = p.x;
    dragY = p.y;
    dragStart = { x: p.x, y: p.y };
    dragMoved = false;
    window.addEventListener('pointermove', duringDrag);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    e.preventDefault?.();
  }

  function duringDrag(e) {
    if (!dragging || e.pointerId !== activePointerId) return;
    const p = rel(e);
    dragX = p.x;
    dragY = p.y;
    if (dragStart && Math.hypot(p.x - dragStart.x, p.y - dragStart.y) > 8) dragMoved = true;
    hoverBin = hitBin(e.clientX, e.clientY);
  }

  function endDrag(e) {
    window.removeEventListener('pointermove', duringDrag);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
    if (!dragging || (e.pointerId !== undefined && e.pointerId !== activePointerId)) return;
    activePointerId = null;
    dragging = false;
    hoverBin = -1; // always clear, even when dropped outside (L1)
    if (!dragMoved) {
      // a stationary touch is a TAP: lift or cancel the selected item
      selected = !selected;
      return;
    }
    const binIdx = hitBin(e.clientX, e.clientY);
    if (binIdx === -1) return; // dropped outside — bounce back silently

    const bin = round.bins[binIdx];
    const target = correctBin(currentItem, round.bins);
    if (bin && target && bin.id === target.id) {
      placeItem(binIdx);
    } else {
      wrongBin = binIdx; // gentle silent rejection — emoji bounces back
      later(() => (wrongBin = -1), 400);
      bounceBack(e);
    }
  }

  function bounceBack(e) {
    const p = rel(e);
    returning = true;
    dragX = p.x;
    dragY = p.y;
    requestAnimationFrame(() => {
      dragX = homeX;
      dragY = homeY;
      later(() => (returning = false), 300);
    });
  }

  function hitBin(clientX, clientY) {
    for (let i = 0; i < binEls.length; i++) {
      const el = binEls[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) return i;
    }
    return -1;
  }

  function placeItem(binIdx) {
    playMatch();
    correctTotal += 1;
    // ghost flies into the bin while logic advances instantly (juice + determinism)
    const center = binCenter(binIdx);
    if (center) {
      flying = { emoji: currentItem.emoji, x: center.x - areaEl.getBoundingClientRect().left, y: center.y - areaEl.getBoundingClientRect().top };
      later(() => (flying = null), 300);
    }
    advance();
  }

  function advance() {
    if (itemIdx + 1 >= round.items.length) {
      roundsDone += 1;
      celebrate = true;
      playWin();
      later(nextRound, 1800);
    } else {
      itemIdx += 1;
    }
  }

  // ---- tap-to-place ----------------------------------------------------
  function onItemTap() {
    if (!currentItem || celebrate || returning || dragging) return;
    if (!selected) {
      selected = true; // lift the item
      return;
    }
    // tapping again cancels selection
    selected = false;
  }

  function onBinTap(i) {
    if (!selected || celebrate) return;
    const bin = round.bins[i];
    const target = correctBin(currentItem, round.bins);
    if (bin && target && bin.id === target.id) {
      selected = false;
      placeItem(i);
    } else {
      wrongBin = i;
      later(() => (wrongBin = -1), 400);
    }
  }

  onMount(() => () => {
    window.removeEventListener('pointermove', duringDrag);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
    clearTimers();
  });
</script>

<GameShell accent="#F0ABFC">
  {#snippet hudLeft()}
    <HudPill icon="✅" label={String(correctTotal)} />
    <HudPill icon="🔄" label={String(roundsDone)} />
    <HudPill icon="🎯" label={`${itemIdx}/${round.items.length}`} />
  {/snippet}

  <div class="sort" data-testid="sort-root">
    <div class="bins" data-testid="bins">
      {#each round.bins as bin, i}
        <div
          class="bin"
          class:hover={hoverBin === i}
          class:hover-correct={hoverBin === i && bin.id === correctBinId}
          class:hover-wrong={hoverBin === i && bin.id !== correctBinId}
          class:wobbling={wrongBin === i}
          class:selected-target={selected && bin.id === correctBinId}
          bind:this={binEls[i]}
          data-testid="bin-{bin.id}"
          onclick={() => onBinTap(i)}
        >
          <span class="bin-icon">{bin.icon}</span>
          <span class="bin-name">{$_(bin.id)}</span>
          {#if hoverBin === i && bin.id === correctBinId}<span class="ok-mark">✓</span>{/if}
        </div>
      {/each}
    </div>

    <p class="hint-line">👇 {$_('dragToBin')}</p>

    <div
      class="drop-area"
      data-testid="drop-area"
      bind:this={areaEl}
      bind:clientWidth={areaW}
      bind:clientHeight={areaH}
    >
      {#if celebrate}
        <Confetti />
        <p class="celebrate" data-testid="celebrate">🎉</p>
      {:else if currentItem}
        <button
          class="draggable"
          class:dragging
          class:selected
          class:returning
          class:over-correct={hoverBin !== -1 && round.bins[hoverBin]?.id === correctBinId}
          style:left="{dragging || returning ? dragX : homeX}px"
          style:top="{dragging || returning ? dragY : homeY}px"
          onpointerdown={beginDrag}
          aria-label={currentItem.emoji}
          data-testid="item"
        >
          {currentItem.emoji}
          {#if dragging && hoverBin !== -1 && round.bins[hoverBin]?.id === correctBinId}
            <span class="ok-badge" data-testid="ok-badge">✓</span>
          {/if}
        </button>
      {/if}

      {#if flying}
        <span class="flying-ghost" style:left="{flying.x}px" style:top="{flying.y}px" data-testid="flying-ghost">
          {flying.emoji}
        </span>
      {/if}
    </div>
  </div>
</GameShell>

<style>
  .sort {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 10px;
    padding-bottom: calc(10px + var(--safe-bottom));
    overflow-y: auto;
  }
  .bins {
    display: flex;
    gap: 12px;
    width: min(96vw, 480px);
  }
  .bin {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 14px 8px;
    border-radius: 20px;
    background: var(--panel-glass);
    border: 2px dashed var(--panel-border);
    transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
  }
  .bin.hover { transform: scale(1.05); }
  .bin.hover-correct {
    border-color: #7ee787;
    box-shadow: 0 0 22px rgba(126, 231, 135, 0.6);
  }
  .bin.hover-wrong { opacity: 0.6; }
  .bin.selected-target { border-color: #7ee787; }
  .bin.wobbling { animation: fxWobble 0.4s ease-in-out; border-color: rgba(255, 155, 155, 0.6); }
  .ok-mark {
    position: absolute;
    top: -10px;
    right: -8px;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #7ee787;
    color: #062033;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fxPop 0.25s ease-out;
  }
  .bin-icon { font-size: 30px; }
  .bin-name { font-size: 13px; font-weight: 700; color: var(--text-lo); }
  .hint-line { color: var(--text-lo); font-size: 14px; margin: 0; }
  .drop-area {
    position: relative;
    width: min(96vw, 480px);
    height: 46vh;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--panel-border);
    touch-action: none;
    user-select: none;
    -webkit-touch-callout: none;
  }
  .celebrate {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 64px; margin: 0; z-index: 3;
  }
  .draggable {
    position: absolute;
    width: 88px;
    height: 88px;
    margin: -44px 0 0 -44px;
    border-radius: 24px;
    font-size: 52px;
    line-height: 84px;
    background: var(--panel-glass);
    border: 2px solid var(--panel-border);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    touch-action: none;
    transition: box-shadow 0.2s, left 0.3s ease-out, top 0.3s ease-out;
    z-index: 4;
  }
  .draggable.dragging {
    transition: none;
    transform: scale(1.12);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.55), 0 0 24px rgba(240, 171, 252, 0.45);
    z-index: 6;
  }
  .draggable.selected {
    transform: scale(1.1);
    outline: 3px solid #7ee787;
    outline-offset: 2px;
  }
  .draggable.over-correct {
    box-shadow: 0 0 26px rgba(126, 231, 135, 0.8);
  }
  .draggable.returning { pointer-events: none; }
  .ok-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #7ee787;
    color: #062033;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }
  .flying-ghost {
    position: absolute;
    width: 88px;
    height: 88px;
    margin: -44px 0 0 -44px;
    font-size: 52px;
    line-height: 84px;
    text-align: center;
    pointer-events: none;
    z-index: 7;
    animation: flyIn 0.3s ease-in forwards;
  }
  @keyframes flyIn {
    0% { transform: translate(0, 0) scale(1); opacity: 1; }
    100% { transform: translate(0, 0) scale(0.4); opacity: 0; }
  }
</style>
