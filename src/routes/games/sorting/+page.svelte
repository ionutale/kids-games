<script>
  import { settings } from '$lib/stores/settings';
  import { playTap, playMatch, playError, playWin } from '$lib/sounds/audioManager';
  import Confetti from '$lib/components/Confetti.svelte';

  const categories = {
    colors: {
      items: [
        { emoji: '🔴', cat: 0 }, { emoji: '🟡', cat: 1 },
        { emoji: '🔵', cat: 2 }, { emoji: '🟢', cat: 3 },
        { emoji: '🟣', cat: 0 }, { emoji: '🟠', cat: 1 },
        { emoji: '⚪', cat: 2 }, { emoji: '🟤', cat: 3 }
      ],
      baskets: ['Red', 'Yellow', 'Blue', 'Green']
    },
    shapes: {
      items: [
        { emoji: '⬛', cat: 0 }, { emoji: '⭕', cat: 1 },
        { emoji: '🔺', cat: 2 }, { emoji: '💎', cat: 3 },
        { emoji: '⬜', cat: 0 }, { emoji: '🔵', cat: 1 },
        { emoji: '🔻', cat: 2 }, { emoji: '🔶', cat: 3 }
      ],
      baskets: ['Square', 'Circle', 'Triangle', 'Diamond']
    }
  };

  let currentCat = $state('colors');
  let items = $state([]);
  let baskets = $state([]);
  let sorted = $state(new Set());
  let won = $state(false);
  let wobbleId = $state(null);
  let selected = $state(null);

  function initGame() {
    const keys = Object.keys(categories);
    currentCat = keys[Math.floor(Math.random() * keys.length)];
    const cat = categories[currentCat];
    const numItems = $settings.ageLevel <= 2 ? 2 : $settings.ageLevel <= 3 ? 4 : $settings.ageLevel <= 4 ? 6 : 8;
    const numBaskets = $settings.ageLevel <= 2 ? 2 : 4;

    baskets = cat.baskets.slice(0, numBaskets);
    const shuffled = [...cat.items].sort(() => Math.random() - 0.5).slice(0, numItems);
    items = shuffled.map((item, i) => ({ ...item, id: i }));
    sorted = new Set();
    won = false;
    selected = null;
  }

  function selectItem(id) {
    if (sorted.has(id)) return;
    selected = selected === id ? null : id;
    if ($settings.soundEnabled && selected !== null) playTap();
  }

  function dropOnBasket(catIdx) {
    if (selected === null) return;
    const item = items.find(i => i.id === selected);
    if (!item) { selected = null; return; }

    if (item.cat === catIdx) {
      sorted = new Set([...sorted, item.id]);
      selected = null;
      if ($settings.soundEnabled) playMatch();
      if (sorted.size === items.length) {
        setTimeout(() => { won = true; if ($settings.soundEnabled) playWin(); }, 300);
      }
    } else {
      wobbleId = item.id;
      if ($settings.soundEnabled) playError();
      setTimeout(() => { wobbleId = null; selected = null; }, 600);
    }
  }

  initGame();
</script>

<div class="sorting-game">
  <div class="items-row">
    {#each items as item (item.id)}
      {#if !sorted.has(item.id)}
        <button
          class="item"
          class:selected={selected === item.id}
          class:wobble={wobbleId === item.id}
          onclick={() => selectItem(item.id)}
        >
          {item.emoji}
        </button>
      {/if}
    {/each}
  </div>

  {#if selected !== null}
    <p class="hint">Now tap a basket!</p>
  {:else if sorted.size > 0 && sorted.size < items.length}
    <p class="hint">Tap an item, then a basket</p>
  {:else}
    <p class="hint">{#if items.length > 0}Tap an item to start{/if}</p>
  {/if}

  <div class="baskets-row">
    {#each baskets as basket, i}
      <button
        class="basket"
        onclick={() => dropOnBasket(i)}
      >
        <span class="basket-label">{basket}</span>
        <span class="basket-count">
          {items.filter(item => item.cat === i && sorted.has(item.id)).length}
        </span>
      </button>
    {/each}
  </div>

  {#if won}
    <Confetti />
    <div class="win-overlay">
      <p class="win-text">All sorted!</p>
      <button class="replay-btn" onclick={initGame}>Again!</button>
    </div>
  {/if}
</div>

<style>
  .sorting-game {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 16px;
    gap: 16px;
  }
  .items-row {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
    min-height: 80px;
  }
  .item {
    font-size: 40px;
    width: 64px;
    height: 64px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .item:active { transform: scale(1.15); }
  .item.selected {
    transform: scale(1.15);
    box-shadow: 0 0 0 4px var(--color-primary);
  }
  .item.wobble { animation: wobble 0.4s ease-in-out; }
  @keyframes wobble {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    75% { transform: translateX(8px); }
  }
  .hint {
    text-align: center;
    font-size: 14px;
    color: #999;
    min-height: 20px;
  }
  .baskets-row {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .basket {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    width: 70px;
    padding: 12px 8px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    min-height: 80px;
  }
  .basket-label {
    font-size: 12px;
    font-weight: 600;
    color: #666;
  }
  .basket-count {
    font-size: 20px;
    font-weight: 700;
    color: var(--color-primary);
  }
  .win-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.3);
    z-index: 50;
    gap: 16px;
  }
  .win-text {
    font-size: 36px;
    color: white;
    font-weight: 700;
    text-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }
  .replay-btn {
    padding: 14px 32px;
    background: white;
    border-radius: 24px;
    font-size: 18px;
    font-weight: 600;
    color: var(--color-primary);
  }
</style>
