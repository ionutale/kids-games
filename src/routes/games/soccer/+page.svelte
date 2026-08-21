<script>
  import { settings } from '$lib/stores/settings';
  import { _ } from '$lib/stores/locale';
  import { playTap, playGoal as playGoalSound } from '$lib/sounds/audioManager';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import LevelBar from '$lib/components/ui/LevelBar.svelte';
  import WinOverlay from '$lib/components/ui/WinOverlay.svelte';
  import BigButton from '$lib/components/ui/BigButton.svelte';

  let ballX = $state(50);
  let ballY = $state(82);
  let ballMoving = $state(false);
  let score = $state(0);
  let showConfetti = $state(false);
  let gameOver = $state(false);
  let level = $state(3);
  let dragStart = $state(null);
  let dragEnd = $state(null);
  let isDragging = $state(false);

  const goalTop = 5;
  const goalBottom = 23;
  const ballStartX = 50, ballStartY = 82;

  function levelTargets(l) {
    return { targetScore: Math.min(2 + l, 8), goalSize: Math.max(10, 24 - l) };
  }

  function onFieldDown(e) {
    if (ballMoving || gameOver) return;
    const rect = e.currentTarget.querySelector('.field').getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    isDragging = true;
    dragStart = { x: ((clientX - rect.left) / rect.width) * 100, y: ((clientY - rect.top) / rect.height) * 100 };
  }

  function onFieldMove(e) {
    if (!isDragging || ballMoving || !dragStart) return;
    e.preventDefault();
    const rect = document.querySelector('.field').getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragEnd = { x: ((clientX - rect.left) / rect.width) * 100, y: ((clientY - rect.top) / rect.height) * 100 };
  }

  function onFieldUp(e) {
    if (!isDragging || ballMoving || !dragStart) return;
    isDragging = false;
    const rect = document.querySelector('.field').getBoundingClientRect();
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    const endX = ((clientX - rect.left) / rect.width) * 100;
    const endY = ((clientY - rect.top) / rect.height) * 100;

    dragEnd = { x: endX, y: endY };
    performKick(dragStart, dragEnd);
    dragStart = null;
    dragEnd = null;
  }

  function performKick(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 3) return;

    ballMoving = true;
    if ($settings.soundEnabled) playTap();

    const targets = levelTargets(level);
    const goalHalf = targets.goalSize / 2;
    const inGoalX = to.x > 50 - goalHalf && to.x < 50 + goalHalf;
    const inGoalY = to.y > goalTop && to.y < goalBottom;
    const willScore = inGoalX && inGoalY;

    ballX = to.x;
    ballY = to.y;

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
        setTimeout(() => { ballX = ballStartX; ballY = ballStartY; }, 1000);
      } else {
        setTimeout(() => { ballX = ballStartX; ballY = ballStartY; }, 800);
      }
    }, 400);
  }

  function resetGame() {
    score = 0; gameOver = false; ballX = ballStartX; ballY = ballStartY;
    dragStart = null; dragEnd = null; isDragging = false;
  }

  function setLevel(l) { level = l; resetGame(); }
</script>

<GameShell accent="#FFE082">
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="soccer-game"
    role="application"
    ontouchstart={onFieldDown}
    ontouchmove={onFieldMove}
    ontouchend={onFieldUp}
    onmousedown={onFieldDown}
    onmousemove={onFieldMove}
    onmouseup={onFieldUp}
    onmouseleave={() => { if (isDragging && dragStart) { isDragging = false; dragStart = null; dragEnd = null; } }}
  >
    <div class="field">
      <div class="goal-area"></div>
      <div class="goal-text">🏆</div>
      <div class="ball" style:left="{ballX}%" style:top="{ballY}%" class:kicking={ballMoving}>⚽</div>
      {#if !gameOver}
        <div class="score-display">{$_('score')}: {score}/{levelTargets(level).targetScore}</div>
      {/if}
      {#if !ballMoving && !gameOver && dragStart && dragEnd}
        <svg class="arrow-line" viewBox="0 0 100 100">
          <line x1="{dragStart.x}" y1="{dragStart.y}" x2="{dragEnd.x}" y2="{dragEnd.y}" stroke="#fff" stroke-width="0.5" stroke-dasharray="2,2" marker-end="url(#arrowhead)"/>
          <defs><marker id="arrowhead" markerWidth="3" markerHeight="2" refX="3" refY="1" orient="auto"><polygon points="0 0, 3 1, 0 2" fill="#fff"/></marker></defs>
        </svg>
      {/if}
    </div>
  </div>

  {#if gameOver}
    <WinOverlay title={$_('greatGame')} subtitle="{$_('goals')}: {score}">
      <BigButton variant="primary" class="replay-btn" onclick={resetGame}>{$_('playAgain')}</BigButton>
    </WinOverlay>
  {/if}

  <LevelBar current={level} onchange={setLevel} />
</GameShell>

<style>
  .soccer-game { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px; position: relative; }
  .field { position: relative; width: 100%; max-width: 350px; aspect-ratio: 3/4; background: linear-gradient(180deg, #81C784 0%, #66BB6A 50%, #4CAF50 100%); border-radius: 24px; border: 1px solid var(--panel-border); box-shadow: 0 8px 30px rgba(0,0,0,0.4); overflow: hidden; cursor: crosshair; touch-action: none; }
  .goal-area { position: absolute; top: 2%; left: 30%; width: 40%; height: 22%; border: 3px solid white; border-radius: 0 0 12px 12px; background: rgba(255,255,255,0.08); }
  .goal-text { position: absolute; top: 7%; left: 50%; transform: translateX(-50%); font-size: 20px; opacity: 0.4; }
  .ball { position: absolute; transform: translate(-50%, -50%); font-size: 48px; transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); z-index: 2; }
  .ball.kicking { transition: all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1); }
  .arrow-line { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 3; }
  .score-display { position: absolute; bottom: 12px; right: 12px; color: white; font-weight: 700; font-size: 18px; text-shadow: 0 1px 4px rgba(0,0,0,0.3); background: var(--panel-glass); border: 1px solid var(--panel-border); backdrop-filter: blur(6px); padding: 4px 12px; border-radius: 12px; }
</style>
