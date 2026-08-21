<script>
  import { settings } from '$lib/stores/settings';
  import { _, locale } from '$lib/stores/locale';
  import { playTap, playMatch, playWin, playError } from '$lib/sounds/audioManager';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import LevelDots from '$lib/components/ui/LevelDots.svelte';
  import WinOverlay from '$lib/components/ui/WinOverlay.svelte';
  import BigButton from '$lib/components/ui/BigButton.svelte';

  const emojis = ['🐶', '🐱', '🐰', '🐻', '🐸', '🐵', '🦊', '🐯', '🐭', '🐼', '🐨', '🦁'];
  const STORAGE_KEY = 'memory-unlocked-level';

  let cards = $state([]);
  let flipped = $state([]);
  let matched = $state(new Set());
  let showcasing = $state(new Set());
  let locked = $state(false);
  let won = $state(false);
  let level = $state(1);
  let unlockedLevel = $state(1);

  function loadUnlocked() {
    let stored = 1;
    if (typeof localStorage !== 'undefined') {
      stored = parseInt(localStorage.getItem(STORAGE_KEY));
    }
    unlockedLevel = stored >= 1 && stored <= 10 ? stored : 1;
    level = unlockedLevel;
  }

  function saveUnlocked(l) {
    unlockedLevel = Math.min(l, 10);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(unlockedLevel));
    }
  }

  function pairsFromLevel(l) {
    if (l >= 10) return 12;
    return l + 1;
  }

  function colsFromCount(count) {
    if (count <= 8) return 2;
    return 4;
  }

  function initGame() {
    const pairs = pairsFromLevel(level);
    const selected = emojis.slice(0, pairs);
    const deck = [...selected, ...selected].map((emoji, i) => ({ id: i, emoji, flipped: false }));
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    cards = deck;
    flipped = [];
    matched = new Set();
    showcasing = new Set();
    locked = false;
    won = false;
  }

  function flipCard(card) {
    if (locked || card.flipped || matched.has(card.id) || showcasing.has(card.id)) return;
    card.flipped = true;
    flipped = [...flipped, card.id];
    if ($settings.soundEnabled) playTap();
    if (flipped.length === 2) {
      locked = true;
      const [aId, bId] = flipped;
      const a = cards.find(c => c.id === aId);
      const b = cards.find(c => c.id === bId);
      if (a.emoji === b.emoji) {
        showcasing = new Set([aId, bId]);
        flipped = [];
        if ($settings.soundEnabled) playMatch();
        setTimeout(() => {
          matched = new Set([...matched, aId, bId]);
          showcasing = new Set();
          locked = false;
          if (matched.size === cards.length) {
            if ($settings.soundEnabled) playWin();
            won = true;
          }
        }, 3000);
      } else {
        if ($settings.soundEnabled) playError();
        setTimeout(() => {
          cards = cards.map(c =>
            c.id === aId || c.id === bId ? { ...c, flipped: false } : c
          );
          flipped = [];
          locked = false;
        }, 1500 - level * 100);
      }
    }
  }

  function advanceLevel() {
    if (level < 10) {
      saveUnlocked(level + 1);
      level = level + 1;
    }
    initGame();
  }

  function replayLevel() {
    initGame();
  }

  let cols = $derived(colsFromCount(cards.length));

  loadUnlocked();
  initGame();
</script>

<GameShell accent="#7FD8FF">
  {#snippet hudLeft()}
    <div class="level-indicator">
      <span class="level-label">{$_('level')} {level}</span>
      <LevelDots total={10} current={level} unlocked={unlockedLevel} />
    </div>
  {/snippet}

  <div class="memory-game">
    <div class="grid" style:grid-template-columns="repeat({cols}, 1fr)">
      {#each cards as card (card.id)}
        <button
          class="card"
          class:flipped={card.flipped || matched.has(card.id) || showcasing.has(card.id)}
          class:showcasing={showcasing.has(card.id)}
          class:matched={matched.has(card.id)}
          onclick={() => flipCard(card)}
        >
          <span class="card-front">{card.emoji}</span>
          <span class="card-back">?</span>
          {#if showcasing.has(card.id)}
            <span class="sparkle s1">⭐</span>
            <span class="sparkle s2">✨</span>
            <span class="sparkle s3">💫</span>
          {/if}
        </button>
      {/each}
    </div>

    {#if won}
      <WinOverlay title={$_('greatJob')} subtitle={$_('levelComplete', { n: level })}>
        {#if level < 10}
          <BigButton variant="primary" class="next-btn" onclick={advanceLevel}>{$_('nextLevel')}</BigButton>
        {/if}
        <BigButton variant="ghost" class="replay-btn" onclick={replayLevel}>{$_('replay')}</BigButton>
      </WinOverlay>
    {/if}
  </div>
</GameShell>

<style>
  .memory-game {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    padding: 16px;
  }
  .level-indicator {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }
  .level-label {
    font-size: 16px;
    font-weight: 700;
    color: var(--accent);
  }
  .grid {
    display: grid;
    gap: 8px;
    width: 100%;
    max-width: 350px;
  }
  .card {
    aspect-ratio: 1;
    border-radius: 14px;
    font-size: 36px;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.3s;
    background: linear-gradient(145deg, #23375F, #18294A);
    border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
    box-shadow: 0 2px 8px rgba(0,0,0,0.35);
  }
  .card.flipped { transform: rotateY(180deg); }
  .card.showcasing {
    animation: matchPulse 1s ease-in-out infinite;
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  }
  .card.matched { opacity: 0; transform: rotateY(180deg) scale(0.9); pointer-events: none; }
  .sparkle {
    position: absolute;
    font-size: 20px;
    pointer-events: none;
    animation: sparkleFloat 1s ease-out infinite;
    z-index: 5;
  }
  .s1 { top: -10px; left: 50%; animation-delay: 0s; }
  .s2 { top: 50%; right: -10px; animation-delay: 0.3s; }
  .s3 { bottom: -10px; left: 50%; animation-delay: 0.6s; }
  @keyframes matchPulse {
    0%, 100% { transform: rotateY(180deg) scale(1); }
    50% { transform: rotateY(180deg) scale(1.08); }
  }
  @keyframes sparkleFloat {
    0% { opacity: 1; transform: translate(0, 0) scale(0.5); }
    50% { opacity: 1; transform: translate(0, -15px) scale(1.2); }
    100% { opacity: 0; transform: translate(0, -30px) scale(0.8); }
  }
  .card-front, .card-back {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    backface-visibility: hidden;
  }
  .card-front {
    background: linear-gradient(145deg, #F5FAFF, #DCEBFF);
    transform: rotateY(180deg);
  }
  .card-back {
    font-size: 24px;
    color: white;
  }
</style>
