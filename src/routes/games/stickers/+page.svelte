<script>
  import { settings } from '$lib/stores/settings';
  import { playTap, playPop } from '$lib/sounds/audioManager';

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

  function updateStickers() {
    const stickers = stickerSets[scene] || stickerSets['🌿'];
    const maxVisible = $settings.ageLevel <= 2 ? 4 : 8;
    activeStickers = stickers.slice(0, maxVisible);
  }

  function placeSticker(emoji) {
    const id = nextId++;
    placed = [...placed, { id, emoji, x: 35 + Math.random() * 30, y: 30 + Math.random() * 35 }];
    if ($settings.soundEnabled) playPop();
  }

  function changeScene(s) {
    scene = s;
    placed = [];
    updateStickers();
    if ($settings.soundEnabled) playTap();
  }

  function clearAll() {
    placed = [];
    if ($settings.soundEnabled) playTap();
  }

  $effect(() => {
    updateStickers();
  });
</script>

<div class="stickers-game">
  <div class="scene-select">
    {#each scenes as s}
      <button class="scene-btn" class:active={scene === s} onclick={() => changeScene(s)}>
        {s}
      </button>
    {/each}
  </div>

  <div class="scene-area" style="background: linear-gradient(135deg, #e8f5e9 0%, #fff3e0 100%);">
    {#each placed as p (p.id)}
      <span class="placed-sticker" style:left="{p.x}%" style:top="{p.y}%" style:font-size="{$settings.ageLevel <= 2 ? '48px' : '36px'}">
        {p.emoji}
      </span>
    {/each}
  </div>

  <div class="tray">
    {#each activeStickers as sticker}
      <button class="sticker-btn" onclick={() => placeSticker(sticker)}>
        {sticker}
      </button>
    {/each}
  </div>

  {#if placed.length > 0}
    <button class="clear-btn" onclick={clearAll}>🗑️</button>
  {/if}
</div>

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
  }
  .scene-btn {
    font-size: 28px;
    width: 52px;
    height: 52px;
    border-radius: 12px;
    background: rgba(255,255,255,0.7);
    transition: transform 0.15s;
  }
  .scene-btn.active { transform: scale(1.15); background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
  .scene-area {
    flex: 1;
    position: relative;
    margin: 8px;
    border-radius: 20px;
    overflow: hidden;
  }
  .placed-sticker {
    position: absolute;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
  .tray {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 8px;
    padding-bottom: calc(8px + var(--safe-bottom));
    flex-wrap: wrap;
    flex-shrink: 0;
    background: rgba(255,255,255,0.8);
  }
  .sticker-btn {
    font-size: 32px;
    width: 52px;
    height: 52px;
    border-radius: 12px;
    background: white;
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
    background: white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }
</style>
