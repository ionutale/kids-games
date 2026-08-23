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

  let dragging = $state(false);
  let dragX = $state(0);
  let dragY = $state(0);
  let hoverBin = $state(-1);
  let wrongBin = $state(-1);
  let celebrate = $state(false);

  let binEls = [];
  let areaEl;

  function rel(e) {
    const r = areaEl.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function nextRound() {
    roundIndex += 1;
    round = buildRound(roundIndex, 8);
    itemIdx = 0;
    celebrate = false;
  }

  const currentItem = $derived(round?.items[itemIdx] ?? null);

  function beginDrag(e) {
    if (!currentItem || celebrate) return;
    dragging = true;
    const p = rel(e);
    dragX = p.x;
    dragY = p.y;
    window.addEventListener('pointermove', duringDrag);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
  }

  function duringDrag(e) {
    if (!dragging) return;
    const p = rel(e);
    dragX = p.x;
    dragY = p.y;
    hoverBin = hitBin(e.clientX, e.clientY);
  }

  function endDrag(e) {
    window.removeEventListener('pointermove', duringDrag);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
    if (!dragging) return;
    dragging = false;
    const binIdx = hitBin(e.clientX, e.clientY);
    if (binIdx === -1) return; // dropped outside — bounce back silently

    const bin = round.bins[binIdx];
    const target = correctBin(currentItem, round.bins);
    if (bin && target && bin.id === target.id) {
      playMatch();
      correctTotal += 1;
      advance();
    } else {
      wrongBin = binIdx; // gentle silent rejection — emoji bounces back
      setTimeout(() => (wrongBin = -1), 400);
    }
    hoverBin = -1;
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

  onMount(() => () => {
    window.removeEventListener('pointermove', duringDrag);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
  });

  function advance() {
    if (itemIdx + 1 >= round.items.length) {
      roundsDone += 1;
      celebrate = true;
      playWin();
      setTimeout(nextRound, 1800);
    } else {
      itemIdx += 1;
    }
  }

</script>

<GameShell accent="#F0ABFC">
  {#snippet hudLeft()}
    <HudPill icon="✅" label={String(correctTotal)} />
    <HudPill icon="🔄" label={String(roundsDone)} />
  {/snippet}

  <div class="sort" data-testid="sort-root">
    <div class="bins" data-testid="bins">
      {#each round.bins as bin, i}
        <div
          class="bin"
          class:hover={hoverBin === i}
          class:wobbling={wrongBin === i}
          bind:this={binEls[i]}
          data-testid="bin-{bin.id}"
        >
          <span class="bin-icon">{bin.icon}</span>
          <span class="bin-name">{$_(bin.id)}</span>
        </div>
      {/each}
    </div>

    <p class="hint-line">👇 {$_('dragToBin')}</p>

    <div class="drop-area" data-testid="drop-area" bind:this={areaEl}>
      {#if celebrate}
        <Confetti />
        <p class="celebrate">🎉</p>
      {:else if currentItem}
        <button
          class="draggable"
          class:dragging
          bind:this={dragGhost}
          style:left="{dragging ? dragX : 50}%"
          style:top="{dragging ? dragY : 60}%"
          onpointerdown={beginDrag}
          data-testid="item"
        >
          {currentItem.emoji}
        </button>
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
    overflow-y: auto;
  }
  .bins {
    display: flex;
    gap: 12px;
    width: min(96vw, 480px);
  }
  .bin {
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
  .bin.hover {
    border-color: var(--accent, #f0abfc);
    transform: scale(1.05);
    box-shadow: 0 0 22px rgba(240, 171, 252, 0.5);
  }
  .bin.wobbling { animation: fxWobble 0.4s ease-in-out; border-color: rgba(255, 155, 155, 0.6); }
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
    overflow: hidden;
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
    transition: box-shadow 0.2s;
    z-index: 4;
  }
  .draggable.dragging {
    transition: none;
    transform: scale(1.12);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.55), 0 0 24px rgba(240, 171, 252, 0.45);
    z-index: 6;
  }
</style>
