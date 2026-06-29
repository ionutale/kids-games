<script>
  import { onMount } from 'svelte';
  import { settings } from '$lib/stores/settings';
  import { _ } from '$lib/stores/locale';
  import { playPop, playWin } from '$lib/sounds/audioManager';

  const items = ['🫧', '🐟', '🦋', '⭐', '🌟', '💫', '🌸', '🍎'];
  let bubbles = $state([]);
  let interval = null;
  let score = $state(0);
  let timeLeft = $state(20);
  let playing = $state(false);
  let level = $state(3);

  function levelConfig(l) {
    const maxItems = Math.min(2 + l * 1.3, 15);
    const spawnMs = Math.max(300, 2000 - l * 170);
    const speed = Math.min(3 + l * 0.5, 10);
    const itemCount = Math.min(2 + l, 8);
    return { maxItems, spawnMs, speed, itemCount };
  }

  function spawnBubble() {
    if (!playing) return;
    const config = levelConfig(level);
    if (bubbles.length >= config.maxItems) return;
    bubbles = [...bubbles, {
      id: Math.random(),
      emoji: items[Math.floor(Math.random() * config.itemCount)],
      x: 5 + Math.random() * 90,
      size: level <= 3 ? 50 + Math.random() * 15 : 36 + Math.random() * 12,
      speed: config.speed + Math.random() * 2
    }];
  }

  function popBubble(id) {
    if (!playing) return;
    bubbles = bubbles.filter(b => b.id !== id);
    score++;
    if ($settings.soundEnabled) playPop();
    if (navigator.vibrate) navigator.vibrate(20);
  }

  function startGame() {
    score = 0;
    timeLeft = 20;
    bubbles = [];
    playing = true;
    const config = levelConfig(level);
    if (interval) clearInterval(interval);
    interval = setInterval(spawnBubble, config.spawnMs);
  }

  function resetGame() {
    playing = false;
    if (interval) clearInterval(interval);
  }

  onMount(() => {
    startGame();
    const timer = setInterval(() => {
      if (playing) {
        timeLeft--;
        if (timeLeft <= 0) {
          resetGame();
          if ($settings.soundEnabled) playWin();
        }
      }
    }, 1000);
    return () => { clearInterval(interval); clearInterval(timer); };
  });

  function setLevel(l) {
    level = l;
    startGame();
  }
</script>

<div class="pop-game">
  {#if !playing && timeLeft <= 0}
    <div class="win-overlay">
      <p class="score-text">{$_('score')}: {score}</p>
      <button class="replay-btn" onclick={startGame}>{$_('playAgain')}</button>
    </div>
  {/if}

  <div class="hud">
    <span class="hud-item">{$_('score')}: {score}</span>
    <span class="hud-item" class:hud-warn={timeLeft <= 5}>{$_('time')}: {timeLeft}s</span>
  </div>

  {#each bubbles as b (b.id)}
    <button
      class="bubble"
      style:left="{b.x}%"
      style:font-size="{b.size}px"
      style:--speed="{b.speed}s"
      onclick={() => popBubble(b.id)}
    >
      {b.emoji}
    </button>
  {/each}

  <div class="level-bar">
    {#each Array(10) as _, i}
      <button class="level-btn" class:active={level === i + 1} onclick={() => setLevel(i + 1)}>
        {i + 1}
      </button>
    {/each}
  </div>
</div>

<style>
  .pop-game {
    flex: 1;
    position: relative;
    overflow: hidden;
    background: linear-gradient(180deg, #e3f2fd 0%, #bbdefb 100%);
  }
  .hud {
    position: absolute;
    top: 8px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    padding: 0 16px;
    z-index: 10;
    pointer-events: none;
  }
  .hud-item {
    background: rgba(255,255,255,0.8);
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 700;
    color: #333;
  }
  .hud-warn { color: #E57373; animation: pulse 0.5s ease-in-out infinite; }
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  .bubble {
    position: absolute;
    transform: translateX(-50%);
    animation: float var(--speed) linear infinite;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
  }
  @keyframes float {
    0% { bottom: -60px; opacity: 0; }
    5% { opacity: 1; }
    90% { opacity: 1; }
    100% { bottom: 100%; opacity: 0; }
  }
  .level-bar {
    position: absolute;
    bottom: calc(8px + var(--safe-bottom));
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: 3px;
    z-index: 10;
    pointer-events: none;
  }
  .level-btn {
    pointer-events: auto;
    width: 30px;
    height: 28px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    color: #999;
    background: rgba(255,255,255,0.6);
  }
  .level-btn.active {
    color: white;
    background: var(--color-primary);
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
  .score-text {
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
