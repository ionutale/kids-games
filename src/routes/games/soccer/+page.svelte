<script>
  import { onDestroy, onMount } from 'svelte';
  import { settings } from '$lib/stores/settings';
  import { _ } from '$lib/stores/locale';
  import { playTap, playGoal as playGoalSound } from '$lib/sounds/audioManager';
  import Confetti from '$lib/components/Confetti.svelte';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import LadderBar from '$lib/ladder/LadderBar.svelte';
  import LadderActions from '$lib/ladder/LadderActions.svelte';
  import WinOverlay from '$lib/components/ui/WinOverlay.svelte';
  import { loadLevel, saveLevel, loadMastered, saveMastered, MAX_LEVEL } from '$lib/ladder/progress.js';
  import {
    BALL_START,
    controlPoint,
    goalBounds,
    keeperCenter,
    openAim,
    quadPoint,
    shotResult,
    starsFor,
    targetScoreFor
  } from '$lib/soccer/engine.js';

  let ballX = $state(BALL_START.x);
  let ballY = $state(BALL_START.y);
  let ballMoving = $state(false);
  let score = $state(0);
  let streak = $state(0);
  let wasted = $state(0);
  let showConfetti = $state(false);
  let gameOver = $state(false);
  let level = $state(loadLevel('soccer'));
  let mastered = $state(loadMastered('soccer'));
  let dragStart = $state(null);
  let dragEnd = $state(null);
  let dragPower = $state(0);
  let isDragging = $state(false);
  let keeperXPos = $state(50);
  let keeperHold = false;
  let dive = $state(0);
  let callout = $state(null);
  let goalFlash = $state(false);
  let rafId = null;
  let keeperRaf = null;
  let timers = [];

  const bounds = $derived(goalBounds(level));
  const aim = $derived(openAim(level, keeperXPos));

  let activePointer = null;
  let fieldRect = null;

  function later(fn, ms) {
    const id = setTimeout(fn, ms);
    timers.push(id);
  }
  function clearTimers() {
    for (const id of timers) clearTimeout(id);
    timers = [];
  }

  function attachFieldDrag() {
    window.addEventListener('pointermove', onFieldMove);
    window.addEventListener('pointerup', onFieldUp);
    window.addEventListener('pointercancel', onFieldUp);
  }
  function detachFieldDrag() {
    window.removeEventListener('pointermove', onFieldMove);
    window.removeEventListener('pointerup', onFieldUp);
    window.removeEventListener('pointercancel', onFieldUp);
  }

  function onFieldDown(e) {
    if (ballMoving || gameOver) return;
    if (activePointer !== null) return;
    e.preventDefault?.();
    activePointer = e.pointerId;
    fieldRect = e.currentTarget.querySelector('.field').getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;
    isDragging = true;
    keeperHold = true;
    dragPower = 0;
    dragStart = { x: ((clientX - fieldRect.left) / fieldRect.width) * 100, y: ((clientY - fieldRect.top) / fieldRect.height) * 100 };
    attachFieldDrag();
  }

  function onFieldMove(e) {
    if (!isDragging || ballMoving || !dragStart) return;
    if (e.pointerId !== activePointer) return;
    e.preventDefault();
    const rect = fieldRect ?? document.querySelector('.field').getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;
    dragEnd = { x: ((clientX - rect.left) / rect.width) * 100, y: ((clientY - rect.top) / rect.height) * 100 };
    const dist = Math.hypot(dragEnd.x - dragStart.x, dragEnd.y - dragStart.y);
    dragPower = Math.max(0.15, Math.min(1, dist / 45));
  }

  function onFieldUp(e) {
    if (e.pointerId !== undefined && e.pointerId !== activePointer) return;
    const rect = fieldRect;
    detachFieldDrag();
    activePointer = null;
    fieldRect = null;
    if (!isDragging || ballMoving || !dragStart || !rect) return;
    isDragging = false;
    const clientX = e.clientX;
    const clientY = e.clientY;
    const endX = ((clientX - rect.left) / rect.width) * 100;
    const endY = ((clientY - rect.top) / rect.height) * 100;

    dragEnd = { x: endX, y: endY };
    performKick({ x: endX, y: endY });
    dragStart = null;
    dragEnd = null;
  }

  function settleBall() {
    ballX = BALL_START.x;
    ballY = BALL_START.y;
    dive = 0;
    callout = null;
    goalFlash = false;
    keeperHold = false;
  }

  function performKick(to) {
    const p0 = { x: BALL_START.x, y: BALL_START.y };
    const dx = to.x - p0.x;
    const dy = to.y - p0.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 3) {
      keeperHold = false;
      return;
    }

    ballMoving = true;
    keeperHold = true;
    if ($settings.soundEnabled) playTap();

    const power = dragPower;
    const p2 = { x: to.x, y: to.y };
    const p1 = controlPoint(p0, p2);
    const result = shotResult(p0, p2, level, keeperXPos);
    const targetScore = targetScoreFor(level);
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
      if (result === 'goal') {
        score++;
        streak++;
        showConfetti = true;
        goalFlash = true;
        callout = 'goal';
        if ($settings.soundEnabled) playGoalSound();
        later(() => { showConfetti = false; }, 2000);
        if (score >= targetScore) {
          if (level >= MAX_LEVEL) {
            saveMastered('soccer');
            mastered = true;
          }
          gameOver = true;
          keeperHold = false;
          return;
        }
        later(settleBall, 900);
      } else if (result === 'save') {
        streak = 0;
        wasted++;
        dive = p2.x < keeperXPos ? -1 : 1;
        callout = 'save';
        later(settleBall, 700);
      } else {
        streak = 0;
        wasted++;
        later(settleBall, 600);
      }
    }

    rafId = requestAnimationFrame(tick);
  }

  function resetGame() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    clearTimers();
    score = 0;
    streak = 0;
    wasted = 0;
    gameOver = false;
    showConfetti = false;
    ballX = BALL_START.x;
    ballY = BALL_START.y;
    dragStart = null;
    dragEnd = null;
    isDragging = false;
    dragPower = 0;
    dive = 0;
    callout = null;
    goalFlash = false;
    keeperHold = false;
  }

  function setLevel(l) {
    level = l;
    saveLevel('soccer', l);
    resetGame();
  }

  function advanceLevel(e) {
    e?.preventDefault();
    setLevel(Math.min(MAX_LEVEL, level + 1));
  }

  function replayLevel(e) {
    e?.preventDefault();
    resetGame();
  }

  onMount(() => {
    const loop = (now) => {
      if (!keeperHold) keeperXPos = keeperCenter(level, now / 1000);
      keeperRaf = requestAnimationFrame(loop);
    };
    keeperRaf = requestAnimationFrame(loop);
  });

  onDestroy(() => {
    if (rafId) cancelAnimationFrame(rafId);
    if (keeperRaf) cancelAnimationFrame(keeperRaf);
    clearTimers();
    detachFieldDrag();
  });
</script>

<GameShell accent="#FFE082">
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="soccer-game"
    role="application"
    onpointerdown={onFieldDown}
  >
    <div class="field" data-open-x={aim.x} data-open-y={aim.y}>
      <div
        class="goal-area"
        class:scored={goalFlash}
        style:left="{bounds.x0}%"
        style:width="{bounds.x1 - bounds.x0}%"
        style:top="{bounds.y0}%"
        style:height="{bounds.y1 - bounds.y0 - 2}%"
      ></div>
      <div
        class="keeper"
        class:diving={dive !== 0}
        data-x={keeperXPos}
        style:left="{keeperXPos}%"
        style:transform="translate(-50%, -40%) rotate({dive * -32}deg)"
      >🧤</div>
      <div class="ball" style:left="{ballX}%" style:top="{ballY}%" class:kicking={ballMoving}>⚽</div>
      {#if callout}
        <div class="callout" class:save={callout === 'save'}>
          {callout === 'goal' ? $_('goalWord') : $_('savedWord')}
        </div>
      {/if}
      {#if score === 0 && !gameOver && !ballMoving}
        <p class="hint">{$_('beatKeeper')}</p>
      {/if}
      {#if !gameOver}
        <div class="score-display">{$_('score')}: {score}/{targetScoreFor(level)}</div>
      {/if}
      {#if streak >= 2 && !gameOver}
        <div class="streak">🔥 {streak}</div>
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
    <WinOverlay title={$_('greatGame')} subtitle="{$_('goals')}: {score} {'⭐'.repeat(starsFor(wasted))}">
      <LadderActions
        gameId="soccer"
        {level}
        backHref="/"
        nextHref="/games/soccer"
        replayHref="/games/soccer"
        onnext={advanceLevel}
        onreplay={replayLevel}
      />
    </WinOverlay>
  {/if}

  <LadderBar current={level} {mastered} onchange={setLevel} />
</GameShell>

<style>
  .soccer-game {
    padding-bottom: calc(8px + var(--safe-bottom)); flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px; position: relative; }
  .field { position: relative; width: 100%; max-width: 350px; aspect-ratio: 3/4; background: linear-gradient(180deg, #81C784 0%, #66BB6A 50%, #4CAF50 100%); border-radius: 24px; border: 1px solid var(--panel-border); box-shadow: 0 8px 30px rgba(0,0,0,0.4); overflow: hidden; cursor: crosshair; touch-action: none; }
  .goal-area { position: absolute; border: 3px solid white; border-radius: 0 0 12px 12px; background: rgba(255,255,255,0.08); transition: left 0.3s, width 0.3s, background 0.2s; }
  .goal-area.scored { background: rgba(255, 224, 130, 0.45); }
  .keeper { position: absolute; top: 14%; font-size: 40px; z-index: 2; pointer-events: none; filter: drop-shadow(0 3px 2px rgba(0,0,0,0.35)); transition: left 0.05s linear; }
  .keeper.diving { transition: left 0.05s linear, rotate 0.12s ease; }
  .ball { position: absolute; transform: translate(-50%, -50%); font-size: 48px; transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); z-index: 3; }
  .ball.kicking { transition: none; }
  .callout { position: absolute; top: 36%; left: 50%; transform: translate(-50%, -50%); z-index: 5; pointer-events: none; font-size: 40px; font-weight: 800; color: #fff; letter-spacing: 1px; text-shadow: 0 2px 0 #0b3d1e, 0 0 16px rgba(255,224,130,0.95); animation: callout-in 0.22s ease-out; }
  .callout.save { font-size: 32px; color: #E3F2FD; text-shadow: 0 2px 0 #0d2744, 0 0 12px rgba(127,216,255,0.8); }
  .hint { position: absolute; top: 40%; left: 50%; transform: translateX(-50%); width: 78%; margin: 0; text-align: center; color: white; font-weight: 700; font-size: 16px; line-height: 1.3; text-shadow: 0 1px 4px rgba(0,0,0,0.5); pointer-events: none; }
  .streak { position: absolute; bottom: 12px; left: 12px; color: white; font-weight: 800; font-size: 18px; background: var(--panel-glass); border: 1px solid var(--panel-border); backdrop-filter: blur(6px); padding: 4px 12px; border-radius: 12px; }
  .arrow-line { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 4; }
  .power-meter { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); width: 45%; height: 12px; border-radius: 8px; background: rgba(4,8,24,0.55); border: 1px solid var(--panel-border); overflow: hidden; z-index: 4; pointer-events: none; }
  .power-fill { height: 100%; background: linear-gradient(90deg, #7FD8FF, #FFE082); transition: width 0.1s linear; }
  .score-display { position: absolute; bottom: 12px; right: 12px; color: white; font-weight: 700; font-size: 18px; text-shadow: 0 1px 4px rgba(0,0,0,0.3); background: var(--panel-glass); border: 1px solid var(--panel-border); backdrop-filter: blur(6px); padding: 4px 12px; border-radius: 12px; }
  @keyframes callout-in { from { transform: translate(-50%, -50%) scale(0.6); opacity: 0; } to { transform: translate(-50%, -50%) scale(1); opacity: 1; } }
</style>
