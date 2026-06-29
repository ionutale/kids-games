<script>
  import { settings } from '$lib/stores/settings';
  import { _ } from '$lib/stores/locale';
  import { playTap, playGoal as playGoalSound } from '$lib/sounds/audioManager';
  import Confetti from '$lib/components/Confetti.svelte';

  let ballX = $state(50);
  let ballY = $state(82);
  let ballMoving = $state(false);
  let score = $state(0);
  let showConfetti = $state(false);
  let gameOver = $state(false);
  let level = $state(3);
  let ballTargetX = $state(50);
  let ballTargetY = $state(82);

  const goalTop = 5;
  const goalBottom = 23;
  const goalLeft = 38;
  const goalRight = 62;

  function levelTargets(l) {
    return {
      targetScore: Math.min(2 + l, 8),
      goalSize: Math.max(10, 24 - l),
    };
  }

  function kick(event) {
    if (ballMoving || gameOver) return;
    const rect = event.currentTarget.querySelector('.field').getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    const tapX = ((clientX - rect.left) / rect.width) * 100;
    const tapY = ((clientY - rect.top) / rect.height) * 100;

    ballMoving = true;
    ballTargetX = tapX;
    ballTargetY = tapY;
    if ($settings.soundEnabled) playTap();

    const targets = levelTargets(level);
    const goalHalf = targets.goalSize / 2;
    const goalCenter = 50;
    const inGoalX = tapX > goalCenter - goalHalf && tapX < goalCenter + goalHalf;
    const inGoalY = tapY > goalTop && tapY < goalBottom;
    const willScore = inGoalX && inGoalY;

    ballX = tapX;
    ballY = tapY;

    setTimeout(() => {
      ballMoving = false;
      if (willScore) {
        score++;
        showConfetti = true;
        if ($settings.soundEnabled) playGoalSound();
        setTimeout(() => { showConfetti = false; }, 2000);
        if (score >= targets.targetScore) {
          gameOver = true;
          return;
        }
        setTimeout(() => { ballX = 50; ballY = 82; ballTargetX = 50; ballTargetY = 82; }, 1000);
      } else {
        setTimeout(() => { ballX = 50; ballY = 82; ballTargetX = 50; ballTargetY = 82; }, 800);
      }
    }, 500);
  }

  function resetGame() {
    score = 0;
    gameOver = false;
    ballX = 50;
    ballY = 82;
    ballTargetX = 50;
    ballTargetY = 82;
  }

  function setLevel(l) {
    level = l;
    resetGame();
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  class="soccer-game"
  role="application"
  ontouchstart={kick}
  onmousedown={kick}
>
  <div class="field">
    <div class="goal-area"></div>
    <div class="goal-text">🏆</div>
    <div
      class="ball"
      style:left="{ballX}%"
      style:top="{ballY}%"
      class:kicking={ballMoving}
    >
      ⚽
    </div>
    {#if !gameOver}
      <div class="score-display">{$_('score')}: {score}/{levelTargets(level).targetScore}</div>
    {/if}
    {#if !ballMoving && !gameOver}
      <div class="aim-hint">{$_('tapToKick')}</div>
    {/if}
  </div>

  {#if showConfetti}
    <Confetti />
  {/if}

  {#if gameOver}
    <div class="win-overlay">
      <p class="win-text">{$_('greatGame')}</p>
      <p class="win-score">{$_('goals')}: {score}</p>
      <button class="replay-btn" onclick={resetGame}>{$_('playAgain')}</button>
    </div>
  {/if}

  <div class="level-bar">
    {#each Array(10) as _, i}
      <button class="level-btn" class:active={level === i + 1} onclick={() => setLevel(i + 1)}>
        {i + 1}
      </button>
    {/each}
  </div>
</div>

<style>
  .soccer-game {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px;
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
    top: 2%;
    left: 30%;
    width: 40%;
    height: 22%;
    border: 3px solid white;
    border-radius: 0 0 12px 12px;
    background: rgba(255,255,255,0.08);
  }
  .goal-text {
    position: absolute;
    top: 7%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 20px;
    opacity: 0.4;
  }
  .ball {
    position: absolute;
    transform: translate(-50%, -50%);
    font-size: 48px;
    transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
  }
  .ball.kicking { transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1); }
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
  .aim-hint {
    position: absolute;
    bottom: 12px;
    left: 12px;
    color: rgba(255,255,255,0.5);
    font-size: 12px;
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
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
  .win-text { font-size: 36px; color: white; font-weight: 700; text-shadow: 0 2px 8px rgba(0,0,0,0.3); }
  .win-score { font-size: 20px; color: white; opacity: 0.8; }
  .replay-btn {
    padding: 14px 32px;
    background: white;
    border-radius: 24px;
    font-size: 18px;
    font-weight: 600;
    color: var(--color-primary);
    margin-top: 8px;
  }
  .level-bar {
    display: flex;
    justify-content: center;
    gap: 3px;
    margin-top: 8px;
    padding-bottom: calc(8px + var(--safe-bottom));
  }
  .level-btn {
    width: 30px;
    height: 28px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    color: #999;
    background: rgba(255,255,255,0.6);
  }
  .level-btn.active { color: white; background: var(--color-primary); }
</style>
