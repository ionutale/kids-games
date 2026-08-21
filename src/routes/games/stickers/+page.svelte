<script>
  import { settings } from '$lib/stores/settings';
  import { playTap, playPop } from '$lib/sounds/audioManager';
  import GameShell from '$lib/components/ui/GameShell.svelte';

  const scenes = ['🌿', '🌊', '🚀', '🦁'];
  const stickerSets = {
    '🌿': ['🐰', '🦊', '🐻', '🦋', '🌻', '🍎', '🌲', '🐝'],
    '🌊': ['🐟', '🐙', '🐳', '🦀', '🌊', '🐠', '🐡', '🪸'],
    '🚀': ['👨‍🚀', '🛸', '🌍', '⭐', '🌙', '☄️', '🛰️', '👾'],
    '🦁': ['🐘', '🦒', '🐆', '🦁', '🐒', '🦩', '🐍', '🦜']
  };

  let scene = $state('🌿');
  let placed = $state([]);
  let activeStickers = $state([]);
  let nextId = $state(0);
  let dragging = $state(null);
  let dragOffset = $state({ x: 0, y: 0 });

  function updateStickers() {
    const stickers = stickerSets[scene] || stickerSets['🌿'];
    const maxVisible = $settings.ageLevel <= 2 ? 4 : 8;
    activeStickers = stickers.slice(0, maxVisible);
  }

  function placeSticker(emoji) {
    const id = nextId++;
    placed = [...placed, { id, emoji, x: 50, y: 50 }];
    if ($settings.soundEnabled) playPop();
  }

  function changeScene(s) {
    scene = s;
    updateStickers();
    if ($settings.soundEnabled) playTap();
  }

  function clearAll() {
    placed = [];
    if ($settings.soundEnabled) playTap();
  }

  function startDrag(e, id) {
    const rect = e.target.closest('.scene-area').getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragging = id;
    const sticker = placed.find(p => p.id === id);
    if (sticker) {
      dragOffset = {
        x: ((clientX - rect.left) / rect.width) * 100 - sticker.x,
        y: ((clientY - rect.top) / rect.height) * 100 - sticker.y
      };
    }
  }

  function moveDrag(e) {
    if (dragging === null) return;
    e.preventDefault();
    const rect = document.querySelector('.scene-area').getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    let newX = ((clientX - rect.left) / rect.width) * 100 - dragOffset.x;
    let newY = ((clientY - rect.top) / rect.height) * 100 - dragOffset.y;
    newX = Math.max(5, Math.min(95, newX));
    newY = Math.max(5, Math.min(95, newY));
    placed = placed.map(p => p.id === dragging ? { ...p, x: newX, y: newY } : p);
  }

  function endDrag() {
    if (dragging !== null && $settings.soundEnabled) playTap();
    dragging = null;
  }

  function trayTap(emoji) {
    const id = nextId++;
    placed = [...placed, { id, emoji, x: 50, y: 50 }];
    dragging = id;
    if ($settings.soundEnabled) playPop();
  }

  $effect(() => {
    updateStickers();
  });
</script>

<GameShell accent="#F0ABFC">
  <div class="stickers-game">
    <div class="scene-select">
      {#each scenes as s}
        <button class="scene-btn" class:active={scene === s} onclick={() => changeScene(s)}>
          {s}
        </button>
      {/each}
    </div>

    <div class="scene-area" style="background: linear-gradient(135deg, #e8f5e9 0%, #fff3e0 100%);"
      ontouchmove={moveDrag}
      ontouchend={endDrag}
      onmousemove={moveDrag}
      onmouseup={endDrag}
      onmouseleave={endDrag}>
      {#each placed as p (p.id)}
        <span
          class="placed-sticker"
          class:dragging={dragging === p.id}
          style:left="{p.x}%"
          style:top="{p.y}%"
          style:font-size="{$settings.ageLevel <= 2 ? '48px' : '36px'}"
          ontouchstart={(e) => startDrag(e, p.id)}
          onmousedown={(e) => startDrag(e, p.id)}
        >
          {p.emoji}
        </span>
      {/each}
    </div>

    <div class="tray">
      {#each activeStickers as sticker}
        <button class="sticker-btn" onclick={() => trayTap(sticker)}>
          {sticker}
        </button>
      {/each}
    </div>

    {#if placed.length > 0}
      <button class="clear-btn" onclick={clearAll}>🗑️</button>
    {/if}
  </div>
</GameShell>

<style>
  .stickers-game {
    display: flex;
    flex-direction: column;
    flex: 1;
    position: relative;
  }
  .scene-select {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 8px;
    flex-shrink: 0;
    background: var(--panel-glass);
    border-top: 1px solid var(--panel-border);
    border-bottom: 1px solid var(--panel-border);
    backdrop-filter: blur(6px);
  }
  .scene-btn {
    font-size: 28px;
    width: 52px;
    height: 52px;
    border-radius: 12px;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    transition: transform 0.15s;
  }
  .scene-btn.active { transform: scale(1.15); background: rgba(240,171,252,0.25); border-color: var(--accent); box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
  .scene-area {
    flex: 1;
    position: relative;
    margin: 8px;
    border-radius: 20px;
    overflow: hidden;
    touch-action: none;
  }
  .placed-sticker {
    position: absolute;
    transform: translate(-50%, -50%);
    transition: left 0.05s, top 0.05s;
    cursor: grab;
    z-index: 1;
  }
  .placed-sticker.dragging {
    z-index: 10;
    cursor: grabbing;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
    transform: translate(-50%, -50%) scale(1.15);
  }
  .tray {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 8px;
    padding-bottom: calc(8px + var(--safe-bottom));
    flex-wrap: wrap;
    flex-shrink: 0;
    background: var(--panel-glass);
    border-top: 1px solid var(--panel-border);
    border-bottom: 1px solid var(--panel-border);
    backdrop-filter: blur(6px);
  }
  .sticker-btn {
    font-size: 32px;
    width: 52px;
    height: 52px;
    border-radius: 12px;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  }
  .sticker-btn:active { transform: scale(1.2); }
  .clear-btn {
    position: absolute;
    bottom: calc(80px + var(--safe-bottom));
    right: 12px;
    font-size: 24px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    z-index: 20;
  }
</style>
