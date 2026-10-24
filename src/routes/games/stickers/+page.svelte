<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { settings } from '$lib/stores/settings';
  import { _ } from '$lib/stores/locale';
  import SoundToggle from '$lib/components/SoundToggle.svelte';
  import DinoValley from '$lib/stickers/art/DinoValley.svelte';
  import StickerDefs from '$lib/stickers/art/StickerDefs.svelte';
  import StickerIcon from '$lib/stickers/StickerIcon.svelte';
  import {
    WORLD,
    getShelf,
    getShelfButtonSize,
    getSticker,
    getPlacedSize
  } from '$lib/stickers/catalog.js';
  import { loadWorld } from '$lib/stickers/save.js';

  let placed = $state([]);

  const shelf = $derived(getShelf($settings.ageLevel));
  const shelfButtonSize = $derived(getShelfButtonSize($settings.ageLevel));

  onMount(() => {
    placed = loadWorld(localStorage, WORLD.id, (type) => Boolean(getSticker(type)));
  });

  function leave() {
    goto('/');
  }
</script>

<div class="stickers-world">
  <div class="world-art">
    <DinoValley />
  </div>
  <StickerDefs />

  <div class="top-controls">
    <button class="round-control" type="button" onclick={leave} aria-label={$_('back')}>←</button>
    <SoundToggle />
  </div>

  <div class="play-area">
    {#each placed as placement (placement.id)}
      {@const size = getPlacedSize(placement.type, $settings.ageLevel)}
      <button
        class="placed-sticker"
        type="button"
        tabindex="-1"
        data-sticker-type={placement.type}
        aria-label={$_('stickers.' + placement.type)}
        style:left="{placement.x}%"
        style:top="{placement.y}%"
        style:width="{size}px"
        style:height="{size}px"
      >
        <StickerIcon type={placement.type} size={size} />
      </button>
    {/each}
  </div>

  <div class="shelf">
    <div class="shelf-scroll">
      {#each shelf as type}
        <button
          class="shelf-sticker"
          type="button"
          data-sticker-type={type}
          aria-label={$_('stickers.' + type)}
          style:width="{shelfButtonSize}px"
          style:height="{shelfButtonSize}px"
        >
          <StickerIcon type={type} size={shelfButtonSize} />
        </button>
      {/each}
    </div>
  </div>
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
    pointer-events: none;
    filter: drop-shadow(0 4px 5px rgba(23, 37, 55, 0.3));
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
    mask-image: linear-gradient(to right, transparent 0, #000 10px, #000 calc(100% - 10px), transparent 100%);
  }

  .shelf-scroll::-webkit-scrollbar {
    display: none;
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
</style>
