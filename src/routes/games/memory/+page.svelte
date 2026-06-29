<script>
  import { settings } from '$lib/stores/settings';
  import { playTap, playMatch, playWin, playError } from '$lib/sounds/audioManager';
  import Confetti from '$lib/components/Confetti.svelte';

  const emojis = ['🐶', '🐱', '🐰', '🐻', '🐸', '🐵', '🦊', '🐯', '🐭', '🐼', '🐨', '🦁'];

  let cards = $state([]);
  let flipped = $state([]);
  let matched = $state(new Set());
  let showcasing = $state(new Set());
  let locked = $state(false);
  let won = $state(false);
  let difficulty = $state(4);

  function pairsFromLevel(level) {
    if (level >= 10) return 12;
    return level + 1;
  }

  function colsFromCount(count) {
    if (count <= 8) return 2;
    if (count <= 16) return 4;
    return 4;
  }

  function initGame() {
    const c = pairsFromLevel(difficulty) * 2;
    const pairs = pairsFromLevel(difficulty);
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
        }, 1500 - difficulty * 100);
      }
    }
  }

  function setLevel(l) {
    difficulty = l;
    initGame();
  }

  let cols = $derived(colsFromCount(cards.length));

  initGame();
</script>

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

  <div class="diff-bar">
    <span class="diff-label">Level</span>
    <div class="diff-buttons">
      {#each Array(10) as _, i}
        <button
          class="diff-btn"
          class:active={difficulty === i + 1}
          onclick={() => setLevel(i + 1)}
        >
          {i + 1}
        </button>
      {/each}
    </div>
  </div>

  {#if won}
    <Confetti />
    <div class="win-overlay">
      <p class="win-text">Great job!</p>
      <button class="replay-btn" onclick={initGame}>Play Again</button>
    </div>
  {/if}
</div>

<style>
  .memory-game {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    padding: 16px;
  }
  .diff-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    margin-bottom: calc(8px + var(--safe-bottom));
    flex-shrink: 0;
  }
  .diff-label {
    font-size: 14px;
    font-weight: 600;
    color: #999;
    margin-right: 4px;
  }
  .diff-buttons {
    display: flex;
    gap: 4px;
  }
  .diff-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    color: #999;
    background: rgba(255,255,255,0.7);
    transition: all 0.15s;
  }
  .diff-btn.active {
    color: white;
    background: var(--color-primary);
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
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
    background: linear-gradient(135deg, var(--color-primary), #81D4FA);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }
  .card.flipped { transform: rotateY(180deg); }
  .card.showcasing {
    animation: matchPulse 1s ease-in-out infinite;
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  }
  .card.matched { opacity: 0.5; transform: rotateY(180deg) scale(0.9); }
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
    background: white;
    transform: rotateY(180deg);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .card-back {
    font-size: 24px;
    color: white;
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
