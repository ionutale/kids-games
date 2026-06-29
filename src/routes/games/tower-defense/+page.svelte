<script>
  import { onDestroy } from 'svelte';
  import { settings } from '$lib/stores/settings';
  import { _ } from '$lib/stores/locale';
  import { TOWERS } from '$lib/tower-defense/towers.js';
  import { MAPS } from '$lib/tower-defense/maps.js';
  import { createEngine } from '$lib/tower-defense/engine.js';

  let view = $state('select');
  let selectedLevel = $state(1);
  let engine = $state(null);
  let gameState = $state(null);
  let dragTower = $state(null);
  let selectedTower = $state(null);
  let unlockedLevel = $state(1);

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

  function handleCellClick(row, col) {
    if (!gameState || gameState.phase !== 'setup') return;

    if (dragTower) {
      const tower = TOWERS.find(t => t.id === dragTower);
      if (tower && engine.placeTower(row, col, tower)) {
        dragTower = null;
      }
      return;
    }

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

  let gridSize = $derived(MAPS[selectedLevel - 1]?.grid || 6);

  onDestroy(() => { engine?.stop(); });
</script>

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
      <span>❤️ {gameState?.lives ?? 10}</span>
      <span>🪙 {gameState?.coins ?? 0}</span>
      <span>🌊 {gameState?.wave ?? 0}/{gameState?.totalWaves ?? 0}</span>
    </div>

    {#if gameState}
      <div class="td-map" style:grid-template-columns="repeat({gridSize}, 1fr)">
        {#each Array(gridSize) as _, r}
          {#each Array(gridSize) as _, c}
            {@const tower = gameState.towers.find(t => t.row === r && t.col === c)}
            {@const enemy = enemyAt(r, c)}
            {@const isSelected = selectedTower?.row === r && selectedTower?.col === c}
            <button
              class="td-cell"
              class:path={isPath(r, c)}
              class:tower-spot={canPlaceTower(r, c) && !tower}
              class:has-tower={!!tower}
              class:drag-over={dragTower && canPlaceTower(r, c) && !tower && !enemy}
              class:selected={isSelected}
              onclick={() => handleCellClick(r, c)}
            >
              {#if isSelected}
                {@const mult = 1 + selectedTower.level * 0.5}
                {@const range = Math.round(selectedTower.type.range * mult)}
                <span class="range-circle" style:--range="{(range * 100) / gridSize}%"></span>
              {/if}
              {#if enemy}
                <span class="enemy" style:background="rgba(255,0,0,{1 - enemy.health/enemy.maxHealth})">{enemy.emoji}</span>
              {:else if tower}
                <span class="tower-e" class:upgraded={tower.level > 0}>{tower.type.emoji}</span>
              {:else if canPlaceTower(r, c)}
                <span class="spot-hint">⬜</span>
              {:else if isPath(r, c)}
                <span class="path-dot">·</span>
              {/if}
            </button>
          {/each}
        {/each}
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
            class:active={dragTower === twr.id}
            class:cant-afford={gameState.coins < twr.cost}
            onclick={() => { dragTower = dragTower === twr.id ? null : twr.id; selectedTower = null; }}
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
        <button class="td-replay" onclick={() => { view = 'select'; engine?.stop(); }}>◀ {$_('back')}</button>
        <button class="td-replay" onclick={() => { initGame(); }}>🔄 {$_('playAgain')}</button>
      </div>
    {/if}

    {#if gameState?.lost}
      <div class="td-overlay">
        <p class="td-lose-text">💀 {$_('gameOver')}</p>
        <button class="td-replay" onclick={() => { initGame(); }}>🔄 {$_('tryAgain')}</button>
      </div>
    {/if}
      </div>

      {#if gameState?.projectiles?.length}
        <div class="proj-layer" style:--grid="{gridSize}">
          {#each gameState.projectiles as proj (proj.id)}
            <span
              class="projectile"
              style:--r="{proj.fromRow}"
              style:--c="{proj.fromCol}"
              style:--p="{proj.progress}"
            >💥</span>
          {/each}
        </div>
      {/if}
    {/if}

<style>
  .td-menu, .td-game { display: flex; flex-direction: column; align-items: center; flex: 1; padding: 12px; }
  .td-title { font-size: 24px; margin-bottom: 12px; }
  .level-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; max-width: 320px; }
  .td-level-btn { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 14px; background: white; border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-size: 14px; font-weight: 600; }
  .td-level-btn.locked { opacity: 0.4; }
  .level-num { font-size: 26px; font-weight: 700; color: var(--color-primary); }
  .level-name { font-size: 13px; color: #666; }
  .lock-icon { font-size: 16px; }
  .td-hud { display: flex; gap: 20px; margin-bottom: 6px; font-size: 16px; font-weight: 700; background: rgba(255,255,255,0.8); padding: 6px 20px; border-radius: 20px; }
  .td-map { display: grid; gap: 2px; width: 100%; max-width: 340px; aspect-ratio: 1; }
  .td-cell { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border-radius: 4px; font-size: 18px; background: #e8f5e9; border: 1px solid #c8e6c9; position: relative; }
  .td-cell.path { background: #fff9c4; border-color: #fff176; }
  .td-cell.tower-spot { background: #e3f2fd; border-color: #90caf9; border-style: dashed; }
  .td-cell.has-tower { background: #fff3e0; border-color: #ffcc80; }
  .td-cell.drag-over { background: #c8e6c9; border-color: #66bb6a; border-width: 2px; }
  .td-cell.selected { box-shadow: 0 0 0 3px var(--color-primary); z-index: 2; }
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
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 4;
  }
  .projectile {
    position: absolute;
    font-size: 12px;
    left: calc((var(--c) + 0.5) / var(--grid, 6) * 100%);
    top: calc((var(--r) + 0.5) / var(--grid, 6) * 100%);
    transform: translate(-50%, -50%);
    animation: projFly 0.25s ease-out forwards;
  }
  @keyframes projFly {
    0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
  }
  .spot-hint { opacity: 0.3; font-size: 14px; }
  .path-dot { color: #ccc; font-size: 10px; }
  .tower-e { font-size: 22px; }
  .tower-e.upgraded { filter: drop-shadow(0 0 3px gold); }
  .enemy { font-size: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
  .td-tower-info { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: white; border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-top: 6px; font-size: 14px; font-weight: 600; }
  .td-action { padding: 6px 14px; background: #f5f5f5; border-radius: 10px; font-size: 13px; font-weight: 600; color: #333; }
  .td-tray { display: flex; gap: 6px; padding: 8px; margin-top: 6px; padding-bottom: calc(8px + var(--safe-bottom)); background: rgba(255,255,255,0.9); border-radius: 14px; width: 100%; max-width: 340px; justify-content: center; flex-wrap: wrap; }
  .td-tower-btn { display: flex; flex-direction: column; align-items: center; gap: 1px; padding: 6px 8px; background: white; border-radius: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); min-width: 52px; }
  .td-tower-btn.active { box-shadow: 0 0 0 3px var(--color-primary); }
  .td-tower-btn.cant-afford { opacity: 0.4; }
  .tray-emoji { font-size: 24px; }
  .tray-cost { font-size: 10px; font-weight: 600; color: #999; }
  .td-start-btn { padding: 8px 20px; background: var(--color-primary); color: white; border-radius: 18px; font-weight: 700; font-size: 14px; }
  .td-wave-info { font-size: 14px; color: #999; font-weight: 600; padding: 8px; }
  .td-overlay { position: fixed; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.3); z-index: 50; gap: 12px; }
  .td-win-text { font-size: 32px; color: white; font-weight: 700; text-shadow: 0 2px 8px rgba(0,0,0,0.3); }
  .td-lose-text { font-size: 32px; color: #FF6B6B; font-weight: 700; text-shadow: 0 2px 8px rgba(0,0,0,0.3); }
  .td-replay { padding: 12px 28px; background: white; border-radius: 24px; font-size: 16px; font-weight: 600; color: var(--color-primary); }
</style>
