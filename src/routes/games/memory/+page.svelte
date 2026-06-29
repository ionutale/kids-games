<script>
  import { settings } from '$lib/stores/settings';
  import { playTap, playMatch, playWin, playError } from '$lib/sounds/audioManager';
  import Confetti from '$lib/components/Confetti.svelte';

  const emojis = ['🐶', '🐱', '🐰', '🐻', '🐸', '🐵', '🦊', '🐯', '🐭', '🐼', '🐨', '🦁'];

  let cards = $state([]);
  let flipped = $state([]);
  let matched = $state(new Set());
  let locked = $state(false);
  let won = $state(false);

  function initGame() {
    const pairs = $settings.ageLevel <= 2 ? 3 : $settings.ageLevel === 3 ? 4 : $settings.ageLevel === 4 ? 6 : 8;
    const selected = emojis.slice(0, pairs);
    const deck = [...selected, ...selected].map((emoji, i) => ({ id: i, emoji, flipped: false }));
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    cards = deck;
    flipped = [];
    matched = new Set();
    locked = false;
    won = false;
  }

  function flipCard(card) {
    if (locked || card.flipped || matched.has(card.id)) return;
    card.flipped = true;
    flipped = [...flipped, card.id];
    if ($settings.soundEnabled) playTap();
    if (flipped.length === 2) {
      locked = true;
      const [aId, bId] = flipped;
      const a = cards.find(c => c.id === aId);
      const b = cards.find(c => c.id === bId);
      if (a.emoji === b.emoji) {
        matched = new Set([...matched, aId, bId]);
        flipped = [];
        locked = false;
        if ($settings.soundEnabled) playMatch();
        if (matched.size === cards.length) {
          setTimeout(() => { won = true; if ($settings.soundEnabled) playWin(); }, 300);
        }
      } else {
        if ($settings.soundEnabled) playError();
        setTimeout(() => {
          cards = cards.map(c =>
            c.id === aId || c.id === bId ? { ...c, flipped: false } : c
          );
          flipped = [];
          locked = false;
        }, $settings.ageLevel <= 2 ? 1500 : 800);
      }
    }
  }

  let cols = $derived($settings.ageLevel <= 3 ? $settings.ageLevel <= 2 ? 3 : 4 : 4);

  initGame();
</script>

<div class="memory-game">
  <div class="grid" style:grid-template-columns="repeat({$settings.ageLevel <= 2 ? 3 : 4}, 1fr)">
    {#each cards as card (card.id)}
      <button
        class="card"
        class:flipped={card.flipped || matched.has(card.id)}
        class:matched={matched.has(card.id)}
        onclick={() => flipCard(card)}
      >
        <span class="card-front">{card.emoji}</span>
        <span class="card-back">?</span>
      </button>
    {/each}
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
    justify-content: center;
    flex: 1;
    padding: 16px;
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
  .card.matched { opacity: 0.6; }
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
