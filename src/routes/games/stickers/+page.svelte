<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { settings } from '$lib/stores/settings';
  import { _ } from '$lib/stores/locale';
  import { playTap, playPop } from '$lib/sounds/audioManager';
  import SoundToggle from '$lib/components/SoundToggle.svelte';
  import DinoValley from '$lib/stickers/art/DinoValley.svelte';
  import StickerDefs from '$lib/stickers/art/StickerDefs.svelte';
  import StickerIcon from '$lib/stickers/StickerIcon.svelte';
  import {
    WORLD,
    SOFT_CAP,
    getShelf,
    getShelfButtonSize,
    getSticker,
    getPlacedSize
  } from '$lib/stickers/catalog.js';
  import { loadWorld, saveWorld } from '$lib/stickers/save.js';
  import { isOverShelf, clampPlacement } from '$lib/stickers/geometry.js';
  import {
    addPlacement,
    bringToFront,
    movePlacement,
    removePlacement,
    canAdd
  } from '$lib/stickers/placements.js';

  let placed = $state([]);
  let active = $state(null);
  let resetOpen = $state(false);

  let playAreaEl;
  let shelfEl;
  let worldEl;

  let pending = null;
  let playRect = null;
  let worldRect = null;
  let shelfTop = 0;
  let listenersAttached = false;
  let idCounter = 0;

  const shelf = $derived(getShelf($settings.ageLevel));
  const shelfButtonSize = $derived(getShelfButtonSize($settings.ageLevel));
  const isFull = $derived(placed.length >= SOFT_CAP);

  onMount(() => {
    placed = loadWorld(localStorage, WORLD.id, (type) => Boolean(getSticker(type)));
    window.addEventListener('pagehide', saveNow);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('pagehide', saveNow);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  });

  onDestroy(() => {
    saveNow();
    cleanupDrag();
  });

  function saveNow() {
    saveWorld(localStorage, WORLD.id, placed);
  }

  function onVisibility() {
    if (document.hidden) saveNow();
  }

  function newId() {
    if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
    return `p-${Date.now()}-${idCounter++}`;
  }

  function leave() {
    saveNow();
    goto('/');
  }

  function openReset() {
    if ($settings.soundEnabled) playTap();
    resetOpen = true;
  }

  function cancelReset() {
    resetOpen = false;
    if ($settings.soundEnabled) playTap();
  }

  function confirmReset() {
    placed = [];
    saveNow();
    resetOpen = false;
    if ($settings.soundEnabled) playPop();
  }

  function measure() {
    playRect = playAreaEl?.getBoundingClientRect() ?? null;
    worldRect = worldEl?.getBoundingClientRect() ?? null;
    shelfTop = shelfEl?.getBoundingClientRect().top ?? 0;
  }

  function attachDragListeners() {
    if (listenersAttached) return;
    listenersAttached = true;
    window.addEventListener('pointermove', onDragMove, { passive: false });
    window.addEventListener('pointerup', onDragEnd);
    window.addEventListener('pointercancel', onDragCancel);
  }

  function detachDragListeners() {
    if (!listenersAttached) return;
    listenersAttached = false;
    window.removeEventListener('pointermove', onDragMove);
    window.removeEventListener('pointerup', onDragEnd);
    window.removeEventListener('pointercancel', onDragCancel);
  }

  function cleanupDrag() {
    detachDragListeners();
    pending = null;
    active = null;
    playRect = null;
    worldRect = null;
    shelfTop = 0;
  }

  function startShelfGesture(event, type) {
    if (active || pending) return;

    if (!canAdd(placed, SOFT_CAP)) {
      if ($settings.soundEnabled) playTap();
      return;
    }

    measure();
    if (!playRect || !worldRect) return;

    pending = {
      pointerId: event.pointerId,
      type,
      startX: event.clientX,
      startY: event.clientY
    };
    attachDragListeners();
  }

  function startPlacedDrag(event, placement) {
    if (active || pending) return;

    event.preventDefault?.();
    measure();
    if (!playRect || !worldRect) return;

    const centerX = playRect.left + (placement.x / 100) * playRect.width;
    const centerY = playRect.top + (placement.y / 100) * playRect.height;
    const offsetX = event.clientX - centerX;
    const offsetY = event.clientY - centerY;

    placed = bringToFront(placed, placement.id);
    active = {
      id: placement.id,
      type: placement.type,
      size: getPlacedSize(placement.type, $settings.ageLevel),
      source: 'canvas',
      pointerId: event.pointerId,
      offsetX,
      offsetY,
      visualX: event.clientX - worldRect.left - offsetX,
      visualY: event.clientY - worldRect.top - offsetY,
      overShelf: isOverShelf(event.clientY, shelfTop),
      origin: { x: placement.x, y: placement.y }
    };
    attachDragListeners();
    if ($settings.soundEnabled) playTap();
  }

  function beginShelfDrag(event) {
    if (!pending || !worldRect) return;

    const gesture = pending;
    pending = null;
    active = {
      id: null,
      type: gesture.type,
      size: getPlacedSize(gesture.type, $settings.ageLevel),
      source: 'shelf',
      pointerId: gesture.pointerId,
      offsetX: 0,
      offsetY: 0,
      visualX: event.clientX - worldRect.left,
      visualY: event.clientY - worldRect.top,
      overShelf: isOverShelf(event.clientY, shelfTop)
    };
    if ($settings.soundEnabled) playTap();
  }

  function updateActive(event) {
    if (!active || !worldRect) return;
    active = {
      ...active,
      visualX: event.clientX - worldRect.left - active.offsetX,
      visualY: event.clientY - worldRect.top - active.offsetY,
      overShelf: isOverShelf(event.clientY, shelfTop)
    };
  }

  function onDragMove(event) {
    if (pending) {
      if (event.pointerId !== pending.pointerId) return;

      const dx = event.clientX - pending.startX;
      const dy = event.clientY - pending.startY;

      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        cleanupDrag();
        return;
      }

      if (dy < -8 && Math.abs(dy) > Math.abs(dx)) {
        event.preventDefault?.();
        beginShelfDrag(event);
      }
      return;
    }

    if (!active || event.pointerId !== active.pointerId) return;
    event.preventDefault?.();
    updateActive(event);
  }

  function onDragEnd(event) {
    if (pending) {
      if (event.pointerId !== pending.pointerId) return;
      cleanupDrag();
      return;
    }

    if (!active || event.pointerId !== active.pointerId) return;
    updateActive(event);

    if (!playRect || !worldRect) {
      cleanupDrag();
      return;
    }

    const current = active;

    if (current.overShelf) {
      if (current.source === 'canvas') {
        placed = removePlacement(placed, current.id);
        saveNow();
        if ($settings.soundEnabled) playPop();
      }
      cleanupDrag();
      return;
    }

    const x = ((current.visualX + worldRect.left - playRect.left) / playRect.width) * 100;
    const y = ((current.visualY + worldRect.top - playRect.top) / playRect.height) * 100;
    const point = clampPlacement({ x, y });

    if (current.source === 'shelf') {
      placed = addPlacement(
        placed,
        { id: newId(), type: current.type, x: point.x, y: point.y },
        SOFT_CAP
      );
    } else {
      placed = movePlacement(placed, current.id, point.x, point.y);
    }

    saveNow();
    if ($settings.soundEnabled) playPop();
    cleanupDrag();
  }

  function onDragCancel(event) {
    if (pending) {
      cleanupDrag();
      return;
    }

    if (!active || event.pointerId !== active.pointerId) return;

    if (active.source === 'canvas') {
      placed = movePlacement(placed, active.id, active.origin.x, active.origin.y);
      saveNow();
    }
    cleanupDrag();
  }
</script>

<div class="stickers-world" bind:this={worldEl}>
  <div class="world-art">
    <DinoValley />
  </div>
  <StickerDefs />

  <div class="top-controls">
    <button class="round-control" type="button" data-testid="back" onclick={leave} aria-label={$_('back')}>←</button>
    <div class="top-right">
      <SoundToggle />
      <button
        class="round-control reset-control"
        type="button"
        data-testid="reset"
        onclick={openReset}
        aria-label={$_('stickerReset')}
      >🧹</button>
    </div>
  </div>

  <div class="play-area" bind:this={playAreaEl}>
    {#each placed as placement (placement.id)}
      {@const size = getPlacedSize(placement.type, $settings.ageLevel)}
      <button
        class="placed-sticker"
        class:active-origin={active?.id === placement.id}
        type="button"
        tabindex="-1"
        data-sticker-type={placement.type}
        aria-label={$_(getSticker(placement.type).labelKey)}
        style:left="{placement.x}%"
        style:top="{placement.y}%"
        style:width="{size}px"
        style:height="{size}px"
        onpointerdown={(event) => startPlacedDrag(event, placement)}
      >
        <StickerIcon type={placement.type} size={size} />
      </button>
    {/each}
  </div>

  <div class="shelf" class:peel-ready={active?.overShelf} class:full={isFull} bind:this={shelfEl}>
    {#if isFull}
      <div class="shelf-full" data-testid="shelf-full" role="status">{$_('stickerFull')}</div>
    {/if}
    <div class="shelf-scroll">
      {#each shelf as type}
        <button
          class="shelf-sticker"
          type="button"
          data-sticker-type={type}
          aria-label={$_(getSticker(type).labelKey)}
          style:width="{shelfButtonSize}px"
          style:height="{shelfButtonSize}px"
          onpointerdown={(event) => startShelfGesture(event, type)}
        >
          <StickerIcon type={type} size={shelfButtonSize} />
        </button>
      {/each}
    </div>
  </div>

  {#if active}
    <div class="drag-layer" aria-hidden="true">
      <div
        class="drag-sticker"
        class:peel={active.overShelf}
        style:left="{active.visualX}px"
        style:top="{active.visualY}px"
        style:width="{active.size}px"
        style:height="{active.size}px"
      >
        <StickerIcon type={active.type} size={active.size} />
      </div>
    </div>
  {/if}

  {#if resetOpen}
    <div class="reset-layer">
      <button
        class="reset-backdrop"
        type="button"
        tabindex="-1"
        aria-label={$_('stickerResetCancel')}
        onclick={cancelReset}
      ></button>
      <div class="reset-card" role="dialog" aria-modal="true" aria-labelledby="reset-title" data-testid="reset-card">
        <p id="reset-title">{$_('stickerResetConfirm')}</p>
        <div class="reset-actions">
          <button
            class="reset-yes"
            type="button"
            data-testid="reset-confirm"
            onclick={confirmReset}
            aria-label={$_('stickerReset')}
          >✓</button>
          <button
            class="reset-no"
            type="button"
            data-testid="reset-cancel"
            onclick={cancelReset}
            aria-label={$_('stickerResetCancel')}
          >✕</button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .stickers-world {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: #67c4ef;
    font-family: var(--font-display);
  }

  .world-art {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .play-area {
    position: absolute;
    inset: 0 0 calc(116px + var(--safe-bottom)) 0;
    pointer-events: none;
  }

  .placed-sticker {
    position: absolute;
    transform: translate(-50%, -50%);
    display: block;
    padding: 0;
    border: 0;
    background: none;
    line-height: 0;
    pointer-events: auto;
    touch-action: none;
    cursor: grab;
    filter: drop-shadow(0 4px 5px rgba(23, 37, 55, 0.3));
    transition: opacity 0.1s ease-out;
  }

  .placed-sticker.active-origin {
    opacity: 0;
  }

  .shelf {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: calc(116px + var(--safe-bottom));
    padding-bottom: var(--safe-bottom);
    z-index: 20;
    border-top: 4px solid #b9a38a;
    background:
      radial-gradient(circle at 12% 26%, rgba(255, 255, 255, 0.12) 0 2px, transparent 3px),
      radial-gradient(circle at 38% 66%, rgba(255, 255, 255, 0.1) 0 2px, transparent 3px),
      radial-gradient(circle at 72% 34%, rgba(0, 0, 0, 0.12) 0 2px, transparent 3px),
      linear-gradient(180deg, #9a8570 0%, #6b5847 18%, #4a3b2f 100%);
    background-size: 90px 46px, 120px 60px, 100px 52px, 100% 100%;
    box-shadow: 0 -10px 24px rgba(27, 37, 55, 0.25);
    transition: box-shadow 0.12s ease-out, border-color 0.12s ease-out;
  }

  .shelf.peel-ready {
    border-top-color: #ffe082;
    box-shadow: 0 -14px 30px rgba(255, 224, 130, 0.5);
  }

  .shelf-scroll {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 116px;
    padding: 10px 14px;
    overflow-x: auto;
    overflow-y: hidden;
    touch-action: pan-x;
    scroll-snap-type: x proximity;
    scrollbar-width: none;
    transition: opacity 0.15s ease-out;
    -webkit-mask-image: linear-gradient(to right, transparent 0, #000 10px, #000 calc(100% - 10px), transparent 100%);
    mask-image: linear-gradient(to right, transparent 0, #000 10px, #000 calc(100% - 10px), transparent 100%);
  }

  .shelf-scroll::-webkit-scrollbar {
    display: none;
  }

  .shelf.full .shelf-scroll {
    opacity: 0.55;
  }

  .shelf-full {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    z-index: 2;
    width: max-content;
    max-width: calc(100% - 32px);
    padding: 6px 12px;
    border-radius: 999px;
    transform: translateX(-50%);
    background: rgba(255, 253, 245, 0.95);
    color: #2b2118;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.25;
    text-align: center;
    box-shadow: 0 4px 12px rgba(27, 37, 55, 0.2);
    pointer-events: none;
  }

  .shelf-sticker {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    background: none;
    line-height: 0;
    cursor: grab;
    touch-action: pan-x;
    scroll-snap-align: center;
    filter: drop-shadow(0 4px 4px rgba(23, 37, 55, 0.25));
    transition: transform 0.12s ease-out;
  }

  .shelf-sticker:active {
    transform: scale(1.08);
  }

  .top-controls {
    position: absolute;
    top: calc(8px + var(--safe-top));
    left: calc(10px + var(--safe-left));
    right: calc(10px + var(--safe-right));
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 30;
    pointer-events: none;
  }

  .top-controls > :global(*) {
    pointer-events: auto;
  }

  .top-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .top-right :global(.sound-btn) {
    background: rgba(255, 253, 245, 0.94);
    box-shadow: 0 4px 0 rgba(93, 76, 61, 0.2), 0 8px 18px rgba(27, 37, 55, 0.18);
  }

  .round-control {
    width: var(--touch-min);
    height: var(--touch-min);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(255, 253, 245, 0.94);
    color: #2b2118;
    font-size: 28px;
    line-height: 1;
    box-shadow: 0 4px 0 rgba(93, 76, 61, 0.2), 0 8px 18px rgba(27, 37, 55, 0.18);
  }

  .round-control:active {
    transform: translateY(1px) scale(0.96);
  }

  .reset-control {
    font-size: 26px;
  }

  .drag-layer {
    position: absolute;
    inset: 0;
    z-index: 40;
    pointer-events: none;
  }

  .drag-sticker {
    position: absolute;
    transform: translate(-50%, -50%);
    filter: drop-shadow(0 10px 12px rgba(23, 37, 55, 0.35));
    transition: transform 0.08s ease-out, opacity 0.08s ease-out;
  }

  .drag-sticker.peel {
    transform: translate(-50%, -50%) scale(0.72);
    opacity: 0.7;
  }

  .reset-layer {
    position: absolute;
    inset: 0;
    z-index: 50;
    display: grid;
    place-items: center;
  }

  .reset-backdrop {
    position: absolute;
    inset: 0;
    border: 0;
    background: rgba(10, 17, 40, 0.38);
  }

  .reset-card {
    position: relative;
    width: min(320px, 82vw);
    padding: 24px 22px 20px;
    border-radius: 24px;
    background: #fff8e8;
    color: #2b2118;
    text-align: center;
    box-shadow: 0 18px 40px rgba(27, 37, 55, 0.35), 0 4px 0 rgba(93, 76, 61, 0.18);
  }

  .reset-card p {
    margin-bottom: 18px;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.2;
  }

  .reset-actions {
    display: flex;
    justify-content: center;
    gap: 18px;
  }

  .reset-yes,
  .reset-no {
    width: 72px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: #ffffff;
    font-size: 34px;
    font-weight: 700;
    box-shadow: 0 4px 0 rgba(93, 76, 61, 0.18), 0 8px 16px rgba(27, 37, 55, 0.2);
  }

  .reset-yes {
    background: #4caf50;
  }

  .reset-no {
    background: #e57373;
  }
</style>
