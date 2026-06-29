<script>
  import { settings } from '$lib/stores/settings';
  import { playTap, playGoal as playGoalSound } from '$lib/sounds/audioManager';
  import Confetti from '$lib/components/Confetti.svelte';

  let ballX = $state(20);
  let ballY = $state(50);
  let ballMoving = $state(false);
  let score = $state(0);
  let showConfetti = $state(false);
  let gameOver = $state(false);

  const goalX = 88;
  const goalY1 = 35;
  const goalY2 = 65;

  function kick(event) {
    if (ballMoving || gameOver) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    const tapX = ((clientX - rect.left) / rect.width) * 100;
    const tapY = ((clientY - rect.top) / rect.height) * 100;

    ballMoving = true;
    if ($settings.soundEnabled) playTap();

    const willScore = $settings.ageLevel <= 2 || (tapY > goalY1 && tapY < goalY2 && tapX > 70);
    const targetX = willScore ? goalX : 70 + Math.random() * 10;
    const targetY = willScore ? 45 + Math.random() * 10 : Math.random() * 60 + 20;

    ballX = targetX;
    ballY = targetY;

    setTimeout(() => {
      ballMoving = false;
      if (willScore) {
        score++;
        showConfetti = true;
        if ($settings.soundEnabled) playGoalSound();
        setTimeout(() => { showConfetti = false; }, 2000);
        if (score >= 5) {
          gameOver = true;
          return;
        }
        setTimeout(() => { ballX = 20; ballY = 50; }, 1000);
      } else {
        setTimeout(() => { ballX = 20; ballY = 50; }, 800);
      }
    }, 500);
  }

  function resetGame() {
    score = 0;
    gameOver = false;
    ballX = 20;
    ballY = 50;
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div class="soccer-game" role="application" ontouchstart={kick} onmousedown={kick}>
  <div class="field">
    <div class="goal-area"></div>
    <div
      class="ball"
      style:left="{ballX}%"
      style:top="{ballY}%"
    >
      ⚽
    </div>
    {#if !gameOver}
      <div class="score-display">Score: {score}</div>
    {/if}
  </div>

  {#if showConfetti}
    <Confetti />
  {/if}

  {#if gameOver}
    <div class="win-overlay">
      <p class="win-text">Great game!</p>
      <p class="win-score">Goals: {score}</p>
      <button class="replay-btn" onclick={resetGame}>Play Again</button>
    </div>
  {/if}
</div>

<style>
  .soccer-game {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    position: relative;
  }
  .field {
    position: relative;
    width: 100%;
    max-width: 350px;
    aspect-ratio: 3/4;
    background: linear-gradient(180deg, #81C784 0%, #66BB6A 50%, #4CAF50 100%);
    border-radius: 24px;
    overflow: hidden;
    cursor: pointer;
  }
  .goal-area {
    position: absolute;
    top: 5%;
    left: 50%;
    transform: translateX(-50%);
    width: 50%;
    height: 18%;
    border: 3px solid white;
    border-radius: 0 0 12px 12px;
    background: rgba(255,255,255,0.1);
  }
  .ball {
    position: absolute;
    transform: translate(-50%, -50%);
    font-size: 48px;
    transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
  }
  .score-display {
    position: absolute;
    bottom: 12px;
    right: 12px;
    color: white;
    font-weight: 700;
    font-size: 18px;
    text-shadow: 0 1px 4px rgba(0,0,0,0.3);
    background: rgba(0,0,0,0.2);
    padding: 4px 12px;
    border-radius: 12px;
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
    gap: 8px;
  }
  .win-text {
    font-size: 36px;
    color: white;
    font-weight: 700;
    text-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }
  .win-score {
    font-size: 20px;
    color: white;
    opacity: 0.8;
  }
  .replay-btn {
    padding: 14px 32px;
    background: white;
    border-radius: 24px;
    font-size: 18px;
    font-weight: 600;
    color: var(--color-primary);
    margin-top: 8px;
  }
</style>
