<script>
  import { onDestroy } from 'svelte';
  import { _ } from '$lib/stores/locale';
  import { settings } from '$lib/stores/settings';
  import { playWinCheer } from '$lib/sounds/audioManager';
  import { TOWERS } from '$lib/tower-defense/towers.js';
  import { MAPS } from '$lib/tower-defense/maps.js';
  import { createEngine } from '$lib/tower-defense/engine.js';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import HudPill from '$lib/components/ui/HudPill.svelte';
  import BigButton from '$lib/components/ui/BigButton.svelte';

  let view = $state('select');
  let selectedLevel = $state(1);
  let engine = $state(null);
  let gameState = $state(null);
  let dragTowerId = $state(null);
  let selectedTower = $state(null);
  let unlockedLevel = $state(1);
  let dragHover = $state(null);

  function startLevel(id) {
    selectedLevel = id;
    view = 'game';
    initGame();
  }

  function initGame() {
    const mapData = MAPS[selectedLevel - 1];
    const eng = createEngine(mapData, (s) => { gameState = s; });
    engine = eng;
    gameState = eng.state;
    eng.start();
  }

  // Pointer Events: unified mouse+touch. Tower placement drag runs at window
  // level so the finger can leave the map and come back mid-drag.
  let mapRect = null;

  function attachPlaceDrag() {
    window.addEventListener('pointermove', onMapPointerMove);
    window.addEventListener('pointerup', onMapPointerUp);
    window.addEventListener('pointercancel', onMapPointerUp);
  }
  function detachPlaceDrag() {
    window.removeEventListener('pointermove', onMapPointerMove);
    window.removeEventListener('pointerup', onMapPointerUp);
    window.removeEventListener('pointercancel', onMapPointerUp);
  }

  function onMapPointerMove(e) {
    if (!dragTowerId || !gameState) return;
    const rect = mapRect ?? document.querySelector('.td-map').getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    const col = Math.floor(((x - rect.left) / rect.width) * gridSize);
    const row = Math.floor(((y - rect.top) / rect.height) * gridSize);
    if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
      dragHover = { row, col };
    } else {
      dragHover = null;
    }
  }

  function onMapPointerUp(e) {
    if (!dragTowerId || !engine || !dragHover) {
      dragTowerId = null;
      dragHover = null;
      detachPlaceDrag();
      return;
    }
    const tower = TOWERS.find(t => t.id === dragTowerId);
    if (tower && engine.placeTower(dragHover.row, dragHover.col, tower)) {
      // placed
    }
    dragTowerId = null;
    dragHover = null;
    detachPlaceDrag();
  }

  function startDrag(towerId) {
    if (gameState?.phase !== 'setup') return;
    dragTowerId = towerId;
    selectedTower = null;
    mapRect = document.querySelector('.td-map')?.getBoundingClientRect() ?? null;
    attachPlaceDrag();
  }

  function selectTower(row, col) {
    if (!gameState) return;
    if (gameState.phase !== 'setup') return;
    const existing = gameState.towers.find(t => t.row === row && t.col === col);
    if (existing) {
      selectedTower = (selectedTower?.row === row && selectedTower?.col === col) ? null : existing;
    } else {
      selectedTower = null;
    }
  }

  function upgradeSelected() {
    if (!selectedTower) return;
    if (engine.upgradeTower(selectedTower.row, selectedTower.col)) {
      selectedTower = null;
    }
  }

  function sellSelected() {
    if (!selectedTower) return;
    if (engine.sellTower(selectedTower.row, selectedTower.col)) {
      selectedTower = null;
    }
  }

  function canPlaceTower(row, col) {
    if (!gameState) return false;
    return !isPath(row, col);
  }

  function isPath(row, col) {
    if (!gameState) return false;
    const mapData = MAPS[selectedLevel - 1];
    const v = mapData.layout[row]?.[col];
    return v === 'path' || v === 'spawn' || v === 'end';
  }

  function enemyAt(row, col) {
    return gameState?.enemies.find(e => {
      if (!e.alive) return false;
      const idx = Math.min(Math.floor(e.pathPos), gameState.pathCells.length - 1);
      const cell = gameState.pathCells[idx];
      return cell && cell.row === row && cell.col === col;
    }) || null;
  }

  function enemyCell(enemy) {
    if (!enemy || !enemy.alive || !gameState?.pathCells) return null;
    const idx = Math.min(Math.floor(enemy.pathPos), gameState.pathCells.length - 1);
    return gameState.pathCells[idx] || null;
  }

  let gridSize = $derived(MAPS[selectedLevel - 1]?.grid || 6);

  $effect(() => {
    if (gameState?.won && $settings.soundEnabled) playWinCheer();
  });

  onDestroy(() => { engine?.stop(); });
</script>

<GameShell accent="#F87171">
{#if view === 'select'}
  <div class="td-menu">
    <h2 class="td-title">🛡️ {$_('towerDefense')}</h2>
    <div class="level-grid">
      {#each MAPS as map, i}
        <button
          class="td-level-btn"
          class:locked={i + 1 > unlockedLevel}
          onclick={() => i + 1 <= unlockedLevel && startLevel(map.id)}
        >
          <span class="level-num">{map.id}</span>
          <span class="level-name">{map.name}</span>
          {#if i + 1 > unlockedLevel}<span class="lock-icon">🔒</span>{/if}
        </button>
      {/each}
    </div>
  </div>
{:else}
  <div class="td-game">
    <div class="td-hud">
      <HudPill icon="❤️" label={String(gameState?.lives ?? 10)} />
      <HudPill icon="🪙" label={String(gameState?.coins ?? 0)} />
      <HudPill icon="🌊" label="{gameState?.wave ?? 0}/{gameState?.totalWaves ?? 0}" />
    </div>

    {#if gameState}
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <div
        class="td-map"
        style:grid-template-columns="repeat({gridSize}, 1fr)"
      >
        {#each Array(gridSize) as _, r}
          {#each Array(gridSize) as _, c}
            {@const tower = gameState.towers.find(t => t.row === r && t.col === c)}
            {@const enemy = enemyAt(r, c)}
            {@const isSelected = selectedTower?.row === r && selectedTower?.col === c}
            {@const isHover = dragHover?.row === r && dragHover?.col === c}
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <div
              class="td-cell"
              class:path={isPath(r, c)}
              class:tower-spot={canPlaceTower(r, c) && !tower}
              class:has-tower={!!tower}
              class:drag-over={dragTowerId && isHover && canPlaceTower(r, c) && !tower}
              class:selected={isSelected}
              class:drag-valid={dragTowerId && isHover && canPlaceTower(r, c) && !tower}
              class:drag-invalid={dragTowerId && isHover && (!canPlaceTower(r, c) || !!tower)}
              onpointerdown={() => !dragTowerId && selectTower(r, c)}
            >
              {#if isSelected}
                {@const mult = 1 + selectedTower.level * 0.5}
                {@const range = Math.round(selectedTower.type.range * mult)}
                <span class="range-circle" style:--range="{(range * 100) / gridSize}%"></span>
              {/if}
              {#if isHover && dragTowerId}
                <span class="ghost-tower">{TOWERS.find(t => t.id === dragTowerId)?.emoji}</span>
              {:else if enemy}
                <div class="enemy-wrap">
                  <span class="enemy">{enemy.emoji}</span>
                  <span class="hp-bar" style:width="{Math.max(0, (enemy.health / enemy.maxHealth) * 100)}%"></span>
                </div>
              {:else if tower}
                <span class="tower-e" class:upgraded={tower.level > 0}>{tower.type.emoji}</span>
              {:else if canPlaceTower(r, c)}
                <span class="spot-hint">⬜</span>
              {:else if isPath(r, c)}
                <span class="path-dot">·</span>
              {/if}
            </div>
          {/each}
        {/each}

        {#if gameState?.projectiles?.length}
          <div class="proj-layer" style:--p-grid={gridSize}>
            {#each gameState.projectiles as proj (proj.id)}
              {@const tgt = gameState.enemies.find(e => e.id === proj.targetId && e.alive)}
              {@const cell = enemyCell(tgt)}
              <span class="projectile" class:hit={proj.progress >= 1} style:--r="{cell ? cell.row : proj.fromRow}" style:--c="{cell ? cell.col : proj.fromCol}">💥</span>
            {/each}
          </div>
        {/if}
      </div>

    {/if}

    {#if selectedTower}
      <div class="td-tower-info">
        <span>{selectedTower.type.emoji} {$_('level')} {selectedTower.level + 1}</span>
        {#if selectedTower.level < 2}
          <button class="td-action" onclick={upgradeSelected}>⬆ {$_('upgrade')} ({Math.round(selectedTower.type.cost * (selectedTower.level + 1))}🪙)</button>
        {/if}
        <button class="td-action" onclick={sellSelected}>💰 {$_('sell')}</button>
        <button class="td-action" onclick={() => selectedTower = null}>✕</button>
      </div>
    {:else if gameState?.phase === 'setup'}
      <div class="td-tray">
        {#each TOWERS as twr}
          <button
            class="td-tower-btn"
            class:active={dragTowerId === twr.id}
            class:cant-afford={gameState.coins < twr.cost}
            onclick={() => startDrag(twr.id)}
          >
            <span class="tray-emoji">{twr.emoji}</span>
            <span class="tray-cost">{twr.cost}🪙</span>
          </button>
        {/each}
        {#if gameState.wave === 0}
          <button class="td-start-btn" onclick={() => engine?.startWave()}>▶ {$_('startWave')}</button>
        {:else}
          <button class="td-start-btn" onclick={() => engine?.startWave()}>▶ {$_('nextWave')}</button>
        {/if}
      </div>
    {:else if gameState?.phase === 'wave'}
      <div class="td-tray">
        <span class="td-wave-info">🌊 {$_('waveInProgress')}</span>
      </div>
    {/if}

    {#if gameState?.won}
      <div class="td-overlay">
        <p class="td-win-text">🎉 {$_('youWin')}</p>
        <BigButton variant="ghost" class="td-replay" onclick={() => { view = 'select'; engine?.stop(); }}>◀ {$_('back')}</BigButton>
        <BigButton variant="primary" class="td-replay" onclick={() => { initGame(); }}>🔄 {$_('playAgain')}</BigButton>
      </div>
    {/if}

    {#if gameState?.lost}
      <div class="td-overlay">
        <p class="td-lose-text">💀 {$_('gameOver')}</p>
        <BigButton variant="primary" class="td-replay" onclick={() => { initGame(); }}>🔄 {$_('tryAgain')}</BigButton>
      </div>
    {/if}
      </div>
{/if}
</GameShell>

<style>
  .td-menu, .td-game { display: flex; flex-direction: column; align-items: center; flex: 1; padding: 12px; }
  .td-title { font-size: 24px; margin-bottom: 12px; color: var(--gold); text-shadow: 0 0 14px var(--glow-gold); }
  .level-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; max-width: 320px; }
  .td-level-btn { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 14px; background: var(--panel-glass); border: 1px solid var(--panel-border); border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-size: 14px; font-weight: 600; }
  .td-level-btn.locked { opacity: 0.4; }
  .level-num { font-size: 26px; font-weight: 700; color: var(--accent); }
  .level-name { font-size: 13px; color: var(--text-lo); }
  .lock-icon { font-size: 16px; }
  .td-hud { display: flex; gap: 20px; margin-bottom: 6px; }
  .td-map {
    touch-action: none;
    user-select: none;
    -webkit-touch-callout: none; display: grid; gap: 2px; width: 100%; max-width: 340px; aspect-ratio: 1; position: relative; }
  .td-cell { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border-radius: 4px; font-size: 18px; background: rgba(10,17,40,0.55); border: 1px solid var(--panel-border); position: relative; }
  .td-cell.path { background: rgba(255,224,130,0.12); border-color: rgba(255,224,130,0.35); }
  .td-cell.tower-spot { background: rgba(127,216,255,0.08); border-color: rgba(127,216,255,0.3); border-style: dashed; }
  .td-cell.has-tower { background: rgba(240,171,252,0.1); }
  .td-cell.drag-over { background: rgba(110,231,183,0.15); border-color: #66bb6a; border-width: 2px; }
  .td-cell.drag-valid { background: rgba(110,231,183,0.15); border-color: #66bb6a; border-width: 2px; }
  .td-cell.drag-invalid { background: #ffcdd2; border-color: #ef5350; border-width: 2px; }
  .td-cell.selected { box-shadow: 0 0 0 3px var(--accent); z-index: 2; }
  .range-circle {
    position: absolute;
    width: var(--range);
    height: var(--range);
    border-radius: 50%;
    border: 2px dashed rgba(79, 195, 247, 0.5);
    background: rgba(79, 195, 247, 0.06);
    pointer-events: none;
    z-index: 5;
  }
  .proj-layer {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-columns: repeat(var(--p-grid, 6), 1fr);
    grid-template-rows: repeat(var(--p-grid, 6), 1fr);
    gap: 2px;
    pointer-events: none;
    z-index: 10;
  }
  .projectile {
    grid-row: calc(var(--r) + 1);
    grid-column: calc(var(--c) + 1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    animation: projFly 0.3s ease-out forwards;
    z-index: 11;
  }
  @keyframes projFly {
    0% { opacity: 1; transform: scale(0.3); }
    50% { opacity: 1; transform: scale(1.2); }
    100% { opacity: 0; transform: scale(0.3); }
  }
  .spot-hint { opacity: 0.3; font-size: 14px; }
  .ghost-tower { font-size: 24px; opacity: 0.6; filter: drop-shadow(0 0 4px rgba(0,0,0,0.3)); }
  .path-dot { color: #ccc; font-size: 10px; }
  .tower-e { font-size: 22px; }
  .tower-e.upgraded { filter: drop-shadow(0 0 3px gold); }
  .enemy-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; }
  .enemy { font-size: 18px; line-height: 1; }
  .hp-bar { display: block; height: 3px; background: #4caf50; border-radius: 2px; margin-top: 1px; transition: width 0.2s; max-width: 100%; }
  .td-tower-info { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: var(--panel-glass); backdrop-filter: blur(6px); border: 1px solid var(--panel-border); border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-top: 6px; font-size: 14px; font-weight: 600; }
  .td-action { padding: 6px 14px; background: transparent; border: 1px solid var(--panel-border); border-radius: 10px; font-size: 13px; font-weight: 600; color: var(--text-hi); }
  .td-tray { display: flex; gap: 6px; padding: 8px; margin-top: 6px; padding-bottom: calc(8px + var(--safe-bottom)); background: var(--panel-glass); backdrop-filter: blur(6px); border: 1px solid var(--panel-border); border-radius: 14px; width: 100%; max-width: 340px; justify-content: center; flex-wrap: wrap; }
  .td-tower-btn { display: flex; flex-direction: column; align-items: center; gap: 1px; padding: 6px 8px; background: var(--panel-glass); border: 1px solid var(--panel-border); border-radius: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); min-width: 52px; }
  .td-tower-btn.active { box-shadow: 0 0 0 3px var(--color-primary); }
  .td-tower-btn.cant-afford { opacity: 0.4; }
  .tray-emoji { font-size: 24px; }
  .tray-cost { font-size: 10px; font-weight: 600; color: var(--text-lo); }
  .td-start-btn { padding: 8px 20px; background: var(--btn-gradient); color: #062033; border-radius: 18px; font-weight: 700; font-size: 14px; }
  .td-wave-info { font-size: 14px; color: var(--text-lo); font-weight: 600; padding: 8px; }
  .td-overlay { position: fixed; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(4,8,24,0.72); z-index: 50; gap: 12px; }
  .td-win-text { font-size: 32px; color: white; font-weight: 700; text-shadow: 0 2px 8px rgba(0,0,0,0.3); }
  .td-lose-text { font-size: 32px; color: #FF6B6B; font-weight: 700; text-shadow: 0 2px 8px rgba(0,0,0,0.3); }
</style>
