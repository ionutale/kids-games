<script>
  import { onDestroy } from 'svelte';
  import { settings } from '$lib/stores/settings';
  import { _ } from '$lib/stores/locale';
  import { playTap, playGoal as playGoalSound } from '$lib/sounds/audioManager';
  import Confetti from '$lib/components/Confetti.svelte';
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
  let dragPower = $state(0);
  let isDragging = $state(false);
  let rafId = null;

  const GOAL_X0 = 30, GOAL_X1 = 70;
  const GOAL_Y0 = 2, GOAL_Y1 = 24;
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
    dragPower = 0;
    dragStart = { x: ((clientX - rect.left) / rect.width) * 100, y: ((clientY - rect.top) / rect.height) * 100 };
  }

  function onFieldMove(e) {
    if (!isDragging || ballMoving || !dragStart) return;
    e.preventDefault();
    const rect = document.querySelector('.field').getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragEnd = { x: ((clientX - rect.left) / rect.width) * 100, y: ((clientY - rect.top) / rect.height) * 100 };
    const dist = Math.hypot(dragEnd.x - dragStart.x, dragEnd.y - dragStart.y);
    dragPower = Math.max(0.15, Math.min(1, dist / 45));
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
    performKick({ x: endX, y: endY });
    dragStart = null;
    dragEnd = null;
  }

  function quadPoint(p0, p1, p2, t) {
    const inv = 1 - t;
    return {
      x: inv * inv * p0.x + 2 * inv * t * p1.x + t * t * p2.x,
      y: inv * inv * p0.y + 2 * inv * t * p1.y + t * t * p2.y
    };
  }

  function flightScores(p0, p1, p2) {
    for (let i = 0; i <= 10; i++) {
      const pt = quadPoint(p0, p1, p2, i / 10);
      if (pt.x > GOAL_X0 && pt.x < GOAL_X1 && pt.y > GOAL_Y0 && pt.y < GOAL_Y1) return true;
    }
    return false;
  }

  function performKick(to) {
    const p0 = { x: ballStartX, y: ballStartY };
    const dx = to.x - p0.x;
    const dy = to.y - p0.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 3) return;

    ballMoving = true;
    if ($settings.soundEnabled) playTap();

    const power = dragPower;
    const p2 = { x: to.x, y: to.y };
    const aimVec = { x: 50 - p0.x, y: 13 - p0.y };
    const aimLen = Math.hypot(aimVec.x, aimVec.y) || 1;
    const perpAim = { x: -aimVec.y / aimLen, y: aimVec.x / aimLen };
    const lateral = (p2.x - p0.x) * perpAim.x + (p2.y - p0.y) * perpAim.y;
    const p1 = {
      x: (p0.x + p2.x) / 2 + perpAim.x * lateral * 0.35,
      y: (p0.y + p2.y) / 2 + perpAim.y * lateral * 0.35
    };

    const targets = levelTargets(level);
    const willScore = flightScores(p0, p1, p2);
    const duration = 650 - 350 * power;
    const startTime = performance.now();

    function tick(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const pt = quadPoint(p0, p1, p2, t);
      ballX = pt.x;
      ballY = pt.y;
      if (t < 1) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      rafId = null;
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
    }

    rafId = requestAnimationFrame(tick);
  }

  function resetGame() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    score = 0; gameOver = false; ballX = ballStartX; ballY = ballStartY;
    dragStart = null; dragEnd = null; isDragging = false; dragPower = 0;
  }

  function setLevel(l) { level = l; resetGame(); }

  onDestroy(() => { if (rafId) cancelAnimationFrame(rafId); });
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
      {#if isDragging && dragEnd}
        <div class="power-meter">
          <div class="power-fill" style:width="{dragPower * 100}%"></div>
        </div>
      {/if}
    </div>
  </div>

  {#if showConfetti}
    <Confetti />
  {/if}

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
  .ball.kicking { transition: none; }
  .arrow-line { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 3; }
  .power-meter { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); width: 45%; height: 12px; border-radius: 8px; background: rgba(4,8,24,0.55); border: 1px solid var(--panel-border); overflow: hidden; z-index: 4; pointer-events: none; }
  .power-fill { height: 100%; background: linear-gradient(90deg, #7FD8FF, #FFE082); transition: width 0.1s linear; }
  .score-display { position: absolute; bottom: 12px; right: 12px; color: white; font-weight: 700; font-size: 18px; text-shadow: 0 1px 4px rgba(0,0,0,0.3); background: var(--panel-glass); border: 1px solid var(--panel-border); backdrop-filter: blur(6px); padding: 4px 12px; border-radius: 12px; }
</style>
