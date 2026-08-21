<script>
  import { settings } from '$lib/stores/settings';
  import { _ } from '$lib/stores/locale';
  import { playTap, playMatch, playError, playWin } from '$lib/sounds/audioManager';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import LevelBar from '$lib/components/ui/LevelBar.svelte';
  import WinOverlay from '$lib/components/ui/WinOverlay.svelte';
  import BigButton from '$lib/components/ui/BigButton.svelte';

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
  let level = $state(3);

  function levelConfig(l) {
    const numItems = Math.min(2 + l, 8);
    const numBaskets = l <= 3 ? 2 : 4;
    return { numItems, numBaskets };
  }

  function initGame() {
    const keys = Object.keys(categories);
    currentCat = keys[Math.floor(Math.random() * keys.length)];
    const cat = categories[currentCat];
    const config = levelConfig(level);

    baskets = cat.baskets.slice(0, config.numBaskets);
    const eligible = cat.items.filter(item => item.cat < config.numBaskets);
    const shuffled = [...eligible].sort(() => Math.random() - 0.5).slice(0, config.numItems);
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

<GameShell accent="#FCA5A5">
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
    <p class="hint">{$_('tapBasket')}</p>
  {:else if sorted.size > 0 && sorted.size < items.length}
    <p class="hint">{$_('tapItemThenBasket')}</p>
  {:else}
    <p class="hint">{#if items.length > 0}{$_('tapItem')}{/if}</p>
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

  <LevelBar current={level} onchange={(l) => { level = l; initGame(); }} />

  {#if won}
    <WinOverlay title={$_('allSorted')}>
      <BigButton variant="ghost" class="replay-btn" onclick={initGame}>{$_('again')}</BigButton>
    </WinOverlay>
  {/if}
  </div>
</GameShell>

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
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    border-radius: 16px;
    transition: transform 0.15s;
  }
  .item:active { transform: scale(1.15); }
  .item.selected {
    transform: scale(1.15);
    box-shadow: 0 0 0 4px var(--accent);
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
    color: var(--text-lo);
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
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    border-radius: 16px;
    min-height: 80px;
  }
  .basket-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-lo);
  }
  .basket-count {
    font-size: 20px;
    font-weight: 700;
    color: var(--accent);
  }
</style>
