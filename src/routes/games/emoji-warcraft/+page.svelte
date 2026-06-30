<script>
  import { onDestroy } from 'svelte';
  import { _ } from '$lib/stores/locale';
  import { createEngine } from '$lib/emoji-warcraft/engine.js';
  import { aiTurn } from '$lib/emoji-warcraft/ai.js';
  import { T } from '$lib/emoji-warcraft/map.js';
  import { BUILDINGS } from '$lib/emoji-warcraft/buildings.js';
  import { UNIT_TYPES } from '$lib/emoji-warcraft/units.js';

  let view = $state('select');
  let engine = $state(null);
  let gs = $state(null);
  let selectedUnit = $state(null);
  let selectedBld = $state(null);
  let buildingMenu = $state(null);
  let intervalId = $state(null);
  let panX = $state(0), panY = $state(0);
  let pointerData = $state({ down: false, startX: 0, startY: 0, startPX: 0, startPY: 0, moved: false, cellRow: null, cellCol: null });
  let tooltip = $state('');

  function showTooltip(msg) { tooltip = msg; setTimeout(() => { if (tooltip === msg) tooltip = ''; }, 2000); }

  function startLevel(l) {
    const eng = createEngine(l, (s) => { gs = { ...s }; });
    engine = eng;
    gs = { ...eng.state, map: eng.state.map.map(r => [...r]), buildings: [...eng.state.buildings], units: eng.state.units.map(u => ({ ...u })) };
    view = 'game';

    eng.placeBuilding('townHall', 10, 1, 'p1');
    eng.placeBuilding('townHall', 1, 10, 'p2');

    eng.start();

    intervalId = setInterval(() => {
      if (gs?.gameOver) return;
      aiTurn(gs, eng.placeBuilding, eng.spawnUnit);
    }, 1500);

    showTooltip('Tap a unit or building to select it');
  }

  function getCellFromPoint(clientX, clientY) {
    const wrap = document.querySelector('.ew-map');
    if (!wrap) return null;
    const rect = wrap.getBoundingClientRect();
    const x = clientX - rect.left - panX;
    const y = clientY - rect.top - panY;
    const col = Math.floor(x / 44);
    const row = Math.floor(y / 44);
    if (row >= 0 && row < 12 && col >= 0 && col < 12) return { row, col };
    return null;
  }

  function onPointerDown(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    pointerData = { down: true, startX: clientX, startY: clientY, startPX: panX, startPY: panY, moved: false, cellRow: null, cellCol: null };
  }

  function onPointerMove(e) {
    if (!pointerData.down) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = Math.abs(clientX - pointerData.startX);
    const dy = Math.abs(clientY - pointerData.startY);

    if (dx > 5 || dy > 5) {
      pointerData = { ...pointerData, moved: true };
      panX = pointerData.startPX + (pointerData.startX - clientX);
      panY = pointerData.startPY + (pointerData.startY - clientY);
    }
  }

  function onPointerUp(e) {
    if (!pointerData.down) return;
    const wasMoved = pointerData.moved;
    pointerData = { down: false, startX: 0, startY: 0, startPX: 0, startPY: 0, moved: false, cellRow: null, cellCol: null };

    if (wasMoved || !gs || gs.gameOver) return;

    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    const cell = getCellFromPoint(clientX, clientY);
    if (!cell) return;

    const { row, col } = cell;

    if (buildingMenu) {
      const ok = engine.placeBuilding(buildingMenu, row, col, 'p1');
      if (ok) { buildingMenu = null; showTooltip('Building placed!'); }
      else showTooltip('Cannot build there');
      return;
    }

    const clickedBld = gs.buildings.find(b => b.row === row && b.col === col && b.owner === 'p1' && b.hp > 0);
    if (clickedBld) {
      const wasSelected = selectedBld?.row === row && selectedBld?.col === col;
      selectedBld = wasSelected ? null : clickedBld;
      selectedUnit = null;
      buildingMenu = null;
      if (wasSelected) showTooltip('Deselected');
      else if (clickedBld.id === 'townHall') showTooltip('Train peasants');
      else if (clickedBld.id === 'barracks') showTooltip('Train soldiers');
      return;
    }

    const clickedUnit = gs.units.find(u => u.alive && u.row === row && u.col === col && u.owner === 'p1');
    if (clickedUnit) {
      const wasSelected = selectedUnit?.id === clickedUnit.id;
      selectedUnit = wasSelected ? null : clickedUnit;
      selectedBld = null;
      buildingMenu = null;
      if (wasSelected) showTooltip('Deselected');
      else showTooltip(`${clickedUnit.emoji} ${clickedUnit.name} selected`);
      return;
    }

    const enemy = gs.units.find(u => u.alive && u.row === row && u.col === col && u.owner === 'p2');
    if (enemy && selectedUnit) {
      selectedUnit.attackTarget = enemy;
      selectedUnit.targetRow = enemy.row;
      selectedUnit.targetCol = enemy.col;
      showTooltip(`Attack!`);
      return;
    }

    const enemyBld = gs.buildings.find(b => b.row === row && b.col === col && b.owner === 'p2' && b.hp > 0);
    if (enemyBld && selectedUnit) {
      selectedUnit.attackTarget = enemyBld;
      showTooltip(`Attack!`);
      return;
    }

    if (selectedUnit) {
      selectedUnit.targetRow = row;
      selectedUnit.targetCol = col;
      selectedUnit.attackTarget = null;
    }
  }

  function queueUnit(typeId) {
    if (!selectedBld) return;
    engine.spawnUnit(typeId, selectedBld, 'p1');
  }

  function getTileEmoji(val) {
    if (val === T.GOLD) return '💰';
    if (val === T.TREE) return '🌲';
    if (val === T.WATER) return '🌊';
    return '';
  }

  onDestroy(() => { if (intervalId) clearInterval(intervalId); });
</script>

{#if view === 'select'}
  <div class="ew-menu">
    <h2>⚔️ Emoji Warcraft</h2>
    <div class="ew-levels">
      {#each Array(5) as _, i}
        <button class="ew-lvl-btn" onclick={() => startLevel(i + 1)}>Level {i + 1}</button>
      {/each}
    </div>
  </div>
{:else if gs}
  <div class="ew-game">
    <div class="ew-hud">
      <span>🪙 {gs.gold}</span>
      <span>🪵 {gs.wood}</span>
      <span>👷 {gs.units.filter(u => u.alive && u.owner === 'p1').length}/{gs.maxPop}</span>
      {#if gs.gameOver}
        <span class:ew-win={gs.winner === 'p1'} class:ew-lose={gs.winner === 'p2'}>
          {gs.winner === 'p1' ? '🎉 Win!' : '💀 Lose'}
        </span>
      {/if}
    </div>

    <div class="ew-map-wrap"
      ontouchstart={onPointerDown}
      ontouchmove={onPointerMove}
      ontouchend={onPointerUp}
      onmousedown={onPointerDown}
      onmousemove={onPointerMove}
      onmouseup={onPointerUp}
      onmouseleave={onPointerUp}
    >
      <div class="ew-map" style:transform="translate({panX}px, {panY}px)">
        {#each gs.map as row, r}
          {#each row as cell, c}
            {@const bld = gs.buildings.find(b => b.row === r && b.col === c && b.hp > 0)}
            {@const un = gs.units.find(u => u.alive && u.row === r && u.col === c)}
            <div
              class="ew-cell"
              class:gold={cell === T.GOLD}
              class:tree={cell === T.TREE}
              class:water={cell === T.WATER}
              onclick={() => handleCellClick(r, c)}
            >
              {#if un}
                <span class="ew-unit" class:enemy-u={un.owner === 'p2'}>{un.emoji}</span>
              {:else if bld}
                <span class="ew-bld" class:enemy-b={bld.owner === 'p2'} class:low-hp={bld.hp < bld.maxHp * 0.3}>{bld.emoji}</span>
              {:else}
                <span class="ew-tile">{getTileEmoji(cell)}</span>
              {/if}
            </div>
          {/each}
        {/each}
      </div>
    </div>

    <div class="ew-panel">
      {#if tooltip}
        <span class="ew-tooltip">{tooltip}</span>
      {:else if gs.gameOver}
        <span class="ew-hint">{gs.winner === 'p1' ? '🎉 You Win!' : '💀 You Lose'}</span>
      {:else if buildingMenu}
        <span class="ew-hint">Tap a cell on the map to build</span>
      {:else if selectedBld && selectedBld.id === 'townHall'}
        <button class="ew-btn" onclick={() => queueUnit('peasant')}>👷 Peasant (50g)</button>
      {:else if selectedBld && selectedBld.id === 'barracks'}
        {#each UNIT_TYPES.filter(u => u.role !== 'worker') as ut}
          <button class="ew-btn" onclick={() => queueUnit(ut.id)}>{ut.emoji} {ut.name} ({ut.cost.g}g+{ut.cost.w}w)</button>
        {/each}
      {:else if selectedUnit?.role === 'worker'}
        <button class="ew-btn" onclick={() => buildingMenu = buildingMenu === 'barracks' ? null : 'barracks'}>
          ⚔️ {buildingMenu === 'barracks' ? 'Cancel' : 'Barracks (100g+50w)'}
        </button>
        <button class="ew-btn" onclick={() => buildingMenu = buildingMenu === 'farm' ? null : 'farm'}>
          🌾 {buildingMenu === 'farm' ? 'Cancel' : 'Farm (50g)'}
        </button>
        <button class="ew-btn" onclick={() => buildingMenu = buildingMenu === 'tower' ? null : 'tower'}>
          🗼 {buildingMenu === 'tower' ? 'Cancel' : 'Tower (75g+25w)'}
        </button>
        <button class="ew-btn" onclick={() => buildingMenu = buildingMenu === 'goldMine' ? null : 'goldMine'}>
          ⛏️ {buildingMenu === 'goldMine' ? 'Cancel' : 'Mine (80g)'}
        </button>
      {:else if selectedUnit}
        <span class="ew-hint">Tap ground to move, tap enemy to attack</span>
      {:else if !selectedBld && !selectedUnit}
        <span class="ew-hint">Tap a friendly unit or building</span>
      {/if}
    </div>
  </div>
{/if}

<style>
  .ew-menu, .ew-game { display: flex; flex-direction: column; align-items: center; flex: 1; }
  .ew-menu { justify-content: center; gap: 16px; }
  .ew-levels { display: flex; gap: 12px; }
  .ew-lvl-btn { padding: 12px 24px; background: white; border-radius: 14px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  .ew-hud { display: flex; gap: 16px; padding: 6px 16px; font-weight: 700; font-size: 14px; background: rgba(255,255,255,0.85); width: 100%; justify-content: center; flex-shrink: 0; }
  .ew-win { color: #4caf50; }
  .ew-lose { color: #e57373; }
  .ew-map-wrap { flex: 1; overflow: hidden; width: 100%; position: relative; touch-action: none; }
  .ew-map { display: grid; grid-template-columns: repeat(12, 44px); grid-template-rows: repeat(12, 44px); gap: 1px; background: #e8f5e9; }
  .ew-cell { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; font-size: 18px; background: #f1f8e9; border: 1px solid #c8e6c9; }
  .ew-cell.gold { background: #fff8e1; border-color: #ffecb3; }
  .ew-cell.tree { background: #e8f5e9; border-color: #a5d6a7; }
  .ew-cell.water { background: #e3f2fd; border-color: #90caf9; }
  .ew-unit { font-size: 20px; cursor: pointer; }
  .ew-unit.enemy-u { filter: drop-shadow(0 0 3px rgba(244,67,54,0.6)); }
  .ew-bld { font-size: 22px; }
  .ew-bld.enemy-b { filter: drop-shadow(0 0 4px rgba(244,67,54,0.5)); }
  .ew-bld.low-hp { filter: drop-shadow(0 0 4px rgba(244,67,54,0.8)); }
  .ew-tile { font-size: 12px; opacity: 0.35; }
  .ew-panel { display: flex; gap: 6px; padding: 6px; padding-bottom: calc(6px + var(--safe-bottom)); background: rgba(255,255,255,0.9); width: 100%; justify-content: center; flex-wrap: wrap; flex-shrink: 0; }
  .ew-btn { padding: 6px 12px; background: white; border-radius: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); font-weight: 600; font-size: 12px; }
  .ew-hint { color: #999; font-size: 13px; padding: 4px; }
  .ew-tooltip { color: var(--color-primary); font-size: 14px; font-weight: 700; padding: 4px; animation: fadeIn 0.2s; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
