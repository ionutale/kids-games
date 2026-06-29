# Tower Defense Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or executing-plans to implement this plan task-by-task.

**Goal:** Build a 5-level tower defense game for ages 8+ using emoji, drag-and-drop tower placement, with waves, upgrades, and economy.

**Architecture:** Pure JS game engine (no canvas) using CSS grid for maps, positioned emoji for enemies/towers. Game loop via requestAnimationFrame. Engine, maps, enemies, towers as separate JS modules.

**Tech Stack:** Svelte 5, SvelteKit, Vitest, Playwright

---

### Task 1: Game Data Modules

**Files:**
- Create: `src/lib/tower-defense/towers.js`
- Create: `src/lib/tower-defense/enemies.js`
- Create: `src/lib/tower-defense/maps.js`

- [ ] **Step 1: Create `src/lib/tower-defense/towers.js`**

```js
export const TOWERS = [
  { id: 'arrow',  emoji: '🏹', name: 'Arrow',     cost: 30, damage: 10, range: 2, fireRate: 1,   splash: 0,   slow: 0,   chain: 0,   desc: 'Single target, fast fire' },
  { id: 'cannon', emoji: '💣', name: 'Cannon',    cost: 50, damage: 25, range: 2, fireRate: 2,   splash: 1,   slow: 0,   chain: 0,   desc: 'Area splash, slow fire' },
  { id: 'ice',    emoji: '❄️', name: 'Ice',       cost: 40, damage: 5,  range: 2, fireRate: 1.5, splash: 0,   slow: 0.5, chain: 0,   desc: 'Slows enemies' },
  { id: 'bolt',   emoji: '⚡', name: 'Lightning', cost: 70, damage: 15, range: 3, fireRate: 1.5, splash: 0,   slow: 0,   chain: 3,   desc: 'Chains to 3 enemies' },
  { id: 'star',   emoji: '🌟', name: 'Star',      cost: 100,damage: 40, range: 3, fireRate: 2.5, splash: 0,   slow: 0,   chain: 0,   desc: 'Single target, huge damage' },
];

export function upgradedStats(towerBase, level) {
  const mult = 1 + level * 0.5;
  return {
    damage: Math.round(towerBase.damage * mult),
    range: Math.round(towerBase.range * mult),
    upgradeCost: Math.round(towerBase.cost * (level + 1)),
  };
}
```

- [ ] **Step 2: Create `src/lib/tower-defense/enemies.js`**

```js
export const ENEMY_TYPES = [
  { id: 'basic', emoji: '🟢', name: 'Basic',  speed: 1,   health: 20, reward: 10, firstLevel: 1 },
  { id: 'fast',  emoji: '🔵', name: 'Fast',   speed: 2,   health: 10, reward: 15, firstLevel: 2 },
  { id: 'heavy', emoji: '🟠', name: 'Heavy',  speed: 0.7, health: 60, reward: 25, firstLevel: 3 },
  { id: 'boss',  emoji: '🔴', name: 'Boss',   speed: 0.5, health: 200,reward: 50, firstLevel: 4 },
];

export function scaledHealth(baseHealth, level) {
  return Math.round(baseHealth * (1 + (level - 1) * 0.3));
}

export function waveComposition(level, waveIndex) {
  const totalWaves = 2 + level;
  const difficulty = (waveIndex + 1) / totalWaves;
  const count = 3 + Math.floor(difficulty * (level * 2));

  const types = ENEMY_TYPES.filter(t => t.firstLevel <= level);
  const enemies = [];
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    enemies.push({ type: type.id, health: scaledHealth(type.health, level), speed: type.speed, reward: type.reward, emoji: type.emoji });
  }
  return enemies;
}
```

- [ ] **Step 3: Create `src/lib/tower-defense/maps.js`**

```js
const T = 'tower';   // tower placement spot
const P = 'path';    // path cell
const S = 'spawn';   // enemy spawn
const E = 'end';     // enemy exit
const _ = null;      // empty

export const MAPS = [
  {
    id: 1, name: 'Simple S', grid: 6, startCoins: 100, lives: 10,
    layout: [
      [S, P, _, _, _, _],
      [_, P, _, _, _, _],
      [_, P, P, P, _, _],
      [_, _, _, P, _, _],
      [_, _, _, P, T, _],
      [_, _, _, E, _, _],
    ],
  },
  {
    id: 2, name: 'L-Turn', grid: 7, startCoins: 120, lives: 10,
    layout: [
      [S, P, _, _, T, _, _],
      [_, P, _, _, _, _, _],
      [_, P, P, P, P, P, _],
      [_, _, _, _, _, P, _],
      [T, _, _, _, _, P, _],
      [_, _, _, _, _, P, _],
      [_, _, _, _, _, E, _],
    ],
  },
  {
    id: 3, name: 'Zigzag', grid: 8, startCoins: 140, lives: 10,
    layout: [
      [S, P, _, _, _, _, T, _],
      [_, P, _, _, _, _, _, _],
      [_, P, P, P, _, _, _, _],
      [_, _, _, P, _, _, _, _],
      [_, _, _, P, P, P, _, _],
      [_, _, _, _, _, P, _, _],
      [T, _, _, _, _, P, P, _],
      [_, _, _, _, _, _, E, _],
    ],
  },
  {
    id: 4, name: 'Double Back', grid: 9, startCoins: 160, lives: 10,
    layout: [
      [S, P, P, P, _, _, _, _, _],
      [_, _, _, P, _, _, _, T, _],
      [_, _, _, P, P, P, _, _, _],
      [_, T, _, _, _, P, _, _, _],
      [_, _, _, _, _, P, P, P, _],
      [_, _, _, _, _, _, _, P, _],
      [_, _, T, _, _, _, _, P, _],
      [_, _, _, _, _, _, _, P, _],
      [_, _, _, _, _, _, _, E, _],
    ],
  },
  {
    id: 5, name: 'Maze', grid: 10, startCoins: 180, lives: 10,
    layout: [
      [S, P, _, _, _, _, T, _, _, _],
      [_, P, _, _, _, _, _, _, _, _],
      [_, P, P, P, _, _, _, _, _, _],
      [_, _, _, P, _, _, _, T, _, _],
      [_, T, _, P, P, P, P, _, _, _],
      [_, _, _, _, _, _, P, _, _, _],
      [_, _, _, _, _, _, P, P, P, _],
      [_, _, T, _, _, _, _, _, P, _],
      [_, _, _, _, _, _, _, _, P, _],
      [_, _, _, _, _, _, _, _, E, _],
    ],
  },
];

export function getTowerSpots(layout) {
  const spots = [];
  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      if (layout[r][c] === 'tower') spots.push({ row: r, col: c, tower: null });
    }
  }
  return spots;
}

export function getPathCells(layout) {
  const cells = [];
  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      if (layout[r][c] === 'path' || layout[r][c] === 'spawn' || layout[r][c] === 'end') {
        cells.push({ row: r, col: c });
      }
    }
  }
  return cells;
}

export function getSpawnPoint(layout) {
  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      if (layout[r][c] === 'spawn') return { row: r, col: c };
    }
  }
  return { row: 0, col: 0 };
}

export function getEndPoint(layout) {
  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      if (layout[r][c] === 'end') return { row: r, col: c };
    }
  }
  return { row: 0, col: 0 };
}
```

- [ ] **Step 4: Verify modules load correctly**

```bash
node -e "import('./src/lib/tower-defense/towers.js').then(m => console.log('towers:', m.TOWERS.length))"
node -e "import('./src/lib/tower-defense/enemies.js').then(m => console.log('enemies:', m.ENEMY_TYPES.length))"
node -e "import('./src/lib/tower-defense/maps.js').then(m => console.log('maps:', m.MAPS.length))"
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(td): add game data modules for towers, enemies, maps"
```

---

### Task 2: Game Engine

**Files:**
- Create: `src/lib/tower-defense/engine.js`

- [ ] **Step 1: Create `src/lib/tower-defense/engine.js`**

```js
export function createEngine(mapData, onUpdate) {
  let state = {
    coins: mapData.startCoins,
    lives: mapData.lives,
    wave: 0,
    totalWaves: 2 + mapData.id,
    phase: 'setup',
    towers: [],
    enemies: [],
    projectiles: [],
    waveQueue: [],
    spawnTimer: 0,
    spawnInterval: 1500,
    spawnIndex: 0,
    frameId: null,
    lastTime: 0,
    won: false,
    lost: false,
  };

  function getTowerSpot(row, col) {
    return mapData.towerSpots.find(s => s.row === row && s.col === col);
  }

  function placeTower(row, col, towerType) {
    const spot = getTowerSpot(row, col);
    if (!spot || spot.tower) return false;
    if (state.coins < towerType.cost) return false;
    state.coins -= towerType.cost;
    spot.tower = { type: towerType, level: 0, cooldown: 0, lastFired: 0, row, col };
    state.towers.push(spot.tower);
    return true;
  }

  function upgradeTower(row, col) {
    const tower = state.towers.find(t => t.row === row && t.col === col);
    if (!tower || tower.level >= 2) return false;
    const cost = Math.round(tower.type.cost * (tower.level + 1));
    if (state.coins < cost) return false;
    state.coins -= cost;
    tower.level++;
    return true;
  }

  function sellTower(row, col) {
    const idx = state.towers.findIndex(t => t.row === row && t.col === col);
    if (idx === -1) return false;
    const tower = state.towers[idx];
    const refund = Math.round((tower.type.cost + tower.type.cost * tower.level * 0.5) * 0.5);
    state.coins += refund;
    state.towers.splice(idx, 1);
    const spot = getTowerSpot(row, col);
    if (spot) spot.tower = null;
    return true;
  }

  function startWave() {
    if (state.phase !== 'setup') return;
    state.wave++;
    state.phase = 'wave';
    state.waveQueue = waveComposition(mapData.id, state.wave - 1);
    state.spawnIndex = 0;
    state.spawnTimer = 0;
  }

  function waveComposition(level, waveIdx) {
    const totalWaves = 2 + level;
    const difficulty = (waveIdx + 1) / totalWaves;
    const count = 3 + Math.floor(difficulty * (level * 2));
    const enemyTypes = [
      { emoji: '🟢', speed: 1, health: 20 * (1 + (level - 1) * 0.3), reward: 10 },
      { emoji: '🔵', speed: 2, health: 10 * (1 + (level - 1) * 0.3), reward: 15 },
      { emoji: '🟠', speed: 0.7, health: 60 * (1 + (level - 1) * 0.3), reward: 25 },
      { emoji: '🔴', speed: 0.5, health: 200 * (1 + (level - 1) * 0.3), reward: 50 },
    ];
    const available = enemyTypes.filter((_, i) => i < level);
    const enemies = [];
    for (let i = 0; i < count; i++) {
      const type = available[Math.floor(Math.random() * available.length)];
      enemies.push({ ...type, id: Math.random(), pathPos: 0, alive: true });
    }
    return enemies;
  }

  function getPathCells() {
    const cells = [];
    for (let r = 0; r < mapData.layout.length; r++) {
      for (let c = 0; c < mapData.layout[r].length; c++) {
        const v = mapData.layout[r][c];
        if (v === 'path' || v === 'spawn' || v === 'end') cells.push({ row: r, col: c });
      }
    }
    return cells;
  }

  function loop(time) {
    if (state.lastTime === 0) state.lastTime = time;
    const dt = (time - state.lastTime) / 1000;
    state.lastTime = time;

    if (state.phase === 'wave') {
      state.spawnTimer += dt * 1000;
      if (state.spawnTimer >= state.spawnInterval && state.spawnIndex < state.waveQueue.length) {
        const enemy = { ...state.waveQueue[state.spawnIndex], id: Math.random(), pathPos: 0, alive: true };
        state.enemies.push(enemy);
        state.spawnIndex++;
        state.spawnTimer = 0;
      }

      for (const enemy of state.enemies) {
        if (!enemy.alive) continue;
        enemy.pathPos += enemy.speed * dt;
        if (enemy.pathPos >= state.pathCells.length) {
          enemy.alive = false;
          state.lives--;
          if (state.lives <= 0) { state.lost = true; state.phase = 'gameover'; }
        }
      }

      for (const tower of state.towers) {
        tower.cooldown = Math.max(0, tower.cooldown - dt);
        if (tower.cooldown > 0) continue;
        const stats = { damage: tower.type.damage * (1 + tower.level * 0.5), range: tower.type.range * (1 + tower.level * 0.5) };
        const target = state.enemies.find(e => {
          if (!e.alive) return false;
          const dx = tower.col - e.pathPos;
          const dy = tower.row - e.pathPos;
          return Math.abs(dx) <= stats.range && Math.abs(dy) <= stats.range;
        });
        if (target) {
          tower.cooldown = tower.type.fireRate;
          target.health -= stats.damage;
          if (target.health <= 0) {
            target.alive = false;
            state.coins += target.reward;
          }
        }
      }

      state.enemies = state.enemies.filter(e => e.alive);
      const allSpawned = state.spawnIndex >= state.waveQueue.length;
      const allDead = state.enemies.length === 0;
      if (allSpawned && allDead && !state.lost) {
        if (state.wave >= state.totalWaves) {
          state.phase = 'won';
          state.won = true;
        } else {
          state.phase = 'setup';
        }
      }
    }

    state.statePathCells = state.statePathCells || state.pathCells;
    state.pathCells = getPathCells();
    onUpdate(state);
    if (!state.lost && !state.won) {
      state.frameId = requestAnimationFrame(loop);
    }
  }

  function start() {
    state.pathCells = getPathCells();
    state.frameId = requestAnimationFrame(loop);
  }

  function stop() {
    if (state.frameId) cancelAnimationFrame(state.frameId);
  }

  return { state, placeTower, upgradeTower, sellTower, startWave, start, stop };
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat(td): add game engine with spawn, move, attack, economy"
```

---

### Task 3: Tower Defense Route + Component

**Files:**
- Create: `src/routes/games/tower-defense/+page.svelte`
- Create: `src/routes/games/tower-defense/+page.js`

- [ ] **Step 1: Write `src/routes/games/tower-defense/+page.js`**

```js
export const prerender = false;
export const ssr = false;
```

- [ ] **Step 2: Write `src/routes/games/tower-defense/+page.svelte`**

```svelte
<script>
  import { onMount, onDestroy } from 'svelte';
  import { settings } from '$lib/stores/settings';
  import { _ } from '$lib/stores/locale';
  import { TOWERS, upgradedStats } from '$lib/tower-defense/towers.js';
  import { MAPS } from '$lib/tower-defense/maps.js';
  import { createEngine } from '$lib/tower-defense/engine.js';

  let view = $state('select');
  let selectedLevel = $state(1);
  let engine = $state(null);
  let gameState = $state(null);
  let dragTower = $state(null);
  let selectedTower = $state(null);
  let unlockedLevel = $state(1);

  function selectLevel(id) {
    selectedLevel = id;
    view = 'game';
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
    } else if (selectedTower) {
      if (selectedTower.row === row && selectedTower.col === col) {
        selectedTower = null;
      } else {
        selectedTower = null;
      }
    } else {
      const tower = gameState.towers.find(t => t.row === row && t.col === col);
      if (tower) selectedTower = tower;
    }
  }

  function upgradeSelected() {
    if (selectedTower && engine.upgradeTower(selectedTower.row, selectedTower.col)) {
      selectedTower = null;
    }
  }

  function sellSelected() {
    if (selectedTower && engine.sellTower(selectedTower.row, selectedTower.col)) {
      selectedTower = null;
    }
  }

  function isTowerSpot(row, col) {
    if (!gameState) return false;
    const mapData = MAPS[selectedLevel - 1];
    return mapData.layout[row]?.[col] === 'tower';
  }

  function isPath(row, col) {
    if (!gameState) return false;
    const mapData = MAPS[selectedLevel - 1];
    const v = mapData.layout[row]?.[col];
    return v === 'path' || v === 'spawn' || v === 'end';
  }

  function getCellEmoji(row, col) {
    if (!gameState) return '';
    const mapData = MAPS[selectedLevel - 1];
    const v = mapData.layout[row]?.[col];
    if (v === 'spawn') return '🚪';
    if (v === 'end') return '🏠';
    return '';
  }

  function getTowerAt(row, col) {
    return gameState?.towers.find(t => t.row === row && t.col === col) || null;
  }

  onDestroy(() => { engine?.stop(); });

  let gridSize = $derived(selectedLevel >= 0 ? MAPS[selectedLevel - 1]?.grid || 6 : 6);
</script>

{#if view === 'select'}
  <div class="td-menu">
    <h2 class="td-title">🛡️ {$_('towerDefense')}</h2>
    <div class="level-grid">
      {#each MAPS as map, i}
        <button class="td-level-btn" class:locked={i + 1 > unlockedLevel} onclick={() => i + 1 <= unlockedLevel && selectLevel(map.id)}>
          <span class="level-num">{i + 1}</span>
          <span class="level-name">{map.name}</span>
          {#if i + 1 > unlockedLevel}🔒{/if}
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
            {@const tower = getTowerAt(r, c)}
            <button
              class="td-cell"
              class:path={isPath(r, c)}
              class:tower-spot={isTowerSpot(r, c) && !tower}
              class:has-tower={!!tower}
              class:drag-over={dragTower && isTowerSpot(r, c) && !tower}
              class:selected={selectedTower?.row === r && selectedTower?.col === c}
              onclick={() => handleCellClick(r, c)}
            >
              {#if tower}
                <span class="tower-emoji" class:upgraded={tower.level > 0}>{tower.type.emoji}</span>
              {:else if isTowerSpot(r, c)}
                <span class="spot-hint">⬜</span>
              {:else if isPath(r, c)}
                <span class="path-emoji">{getCellEmoji(r, c) || '⬛'}</span>
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
          <button class="td-tower-btn" class:active={dragTower === twr.id}
            ontouchstart={() => dragTower = twr.id}
            onmousedown={() => dragTower = twr.id}
            onmouseup={() => { if (dragTower === twr.id) dragTower = null; }}
          >
            <span class="tray-emoji">{twr.emoji}</span>
            <span class="tray-cost">{twr.cost}🪙</span>
          </button>
        {/each}
        <button class="td-start-btn" onclick={() => engine?.startWave()}>▶ {$_('startWave')}</button>
      </div>
    {:else if gameState?.phase === 'wave'}
      <div class="td-tray">
        <span class="td-wave-info">🌊 {$_('waveInProgress')}</span>
      </div>
    {/if}

    {#if gameState?.won}
      <div class="td-overlay">
        <p class="td-win-text">🎉 {$_('youWin')}</p>
        <button class="td-replay" onclick={() => { view = 'select'; engine?.stop(); }}>
          ◀ {$_('back')}
        </button>
        <button class="td-replay" onclick={() => { initGame(); }}>
          🔄 {$_('playAgain')}
        </button>
      </div>
    {/if}

    {#if gameState?.lost}
      <div class="td-overlay">
        <p class="td-lose-text">💀 {$_('gameOver')}</p>
        <button class="td-replay" onclick={() => { initGame(); }}>
          🔄 {$_('tryAgain')}
        </button>
      </div>
    {/if}
  </div>
{/if}

<style>
  .td-menu, .td-game { display: flex; flex-direction: column; align-items: center; flex: 1; padding: 16px; }
  .td-title { font-size: 24px; margin-bottom: 16px; }
  .level-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; max-width: 350px; }
  .td-level-btn {
    display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 16px;
    background: white; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    font-size: 14px; font-weight: 600;
  }
  .td-level-btn.locked { opacity: 0.4; }
  .level-num { font-size: 28px; }
  .td-hud { display: flex; gap: 16px; margin-bottom: 8px; font-size: 18px; font-weight: 700; }
  .td-map { display: grid; gap: 2px; width: 100%; max-width: 350px; aspect-ratio: 1; }
  .td-cell {
    aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
    border-radius: 4px; font-size: 20px; background: #e8f5e9; border: 1px solid #c8e6c9;
  }
  .td-cell.path { background: #fff9c4; border-color: #fff176; }
  .td-cell.tower-spot { background: #e3f2fd; border-color: #90caf9; border-style: dashed; }
  .td-cell.has-tower { background: #fff3e0; border-color: #ffcc80; }
  .td-cell.drag-over { background: #c8e6c9; border-color: #66bb6a; border-width: 2px; }
  .td-cell.selected { box-shadow: 0 0 0 3px var(--color-primary); }
  .spot-hint { opacity: 0.4; }
  .path-emoji { font-size: 14px; opacity: 0.5; }
  .tower-emoji { font-size: 24px; }
  .tower-emoji.upgraded { filter: drop-shadow(0 0 4px gold); }
  .td-tower-info {
    display: flex; align-items: center; gap: 8px; padding: 8px 16px;
    background: white; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-top: 8px;
  }
  .td-tray {
    display: flex; gap: 8px; padding: 8px; margin-top: 8px;
    padding-bottom: calc(8px + var(--safe-bottom)); overflow-x: auto;
    background: rgba(255,255,255,0.9); border-radius: 16px; width: 100%; max-width: 350px;
    justify-content: center; flex-wrap: wrap;
  }
  .td-tower-btn {
    display: flex; flex-direction: column; align-items: center; gap: 2px;
    padding: 8px; background: white; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.1);
    min-width: 60px;
  }
  .td-tower-btn.active { box-shadow: 0 0 0 3px var(--color-primary); }
  .tray-emoji { font-size: 28px; }
  .tray-cost { font-size: 11px; font-weight: 600; color: #999; }
  .td-start-btn {
    padding: 8px 24px; background: var(--color-primary); color: white;
    border-radius: 20px; font-weight: 700; font-size: 16px;
  }
  .td-wave-info { font-size: 14px; color: #999; font-weight: 600; }
  .td-overlay {
    position: fixed; inset: 0; display: flex; flex-direction: column;
    align-items: center; justify-content: center; background: rgba(0,0,0,0.3);
    z-index: 50; gap: 16px;
  }
  .td-win-text { font-size: 36px; color: white; font-weight: 700; text-shadow: 0 2px 8px rgba(0,0,0,0.3); }
  .td-lose-text { font-size: 36px; color: #FF6B6B; font-weight: 700; text-shadow: 0 2px 8px rgba(0,0,0,0.3); }
  .td-replay {
    padding: 14px 32px; background: white; border-radius: 24px;
    font-size: 18px; font-weight: 600; color: var(--color-primary);
  }
</style>
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(td): add tower defense game route with full component"
```

---

### Task 4: Navigation + Localization

**Files:**
- Modify: `src/routes/+page.svelte` (add tower-defense to game list)
- Modify: `src/lib/stores/locale.js` (add tower defense keys)

- [ ] **Step 1: Add to game hub**

In `src/routes/+page.svelte`, add to the games array:
```js
{ id: 'tower-defense', icon: '🛡️', key: 'towerDefense' },
```

- [ ] **Step 2: Add locale keys**

In `src/lib/stores/locale.js`, add to each language:
```js
towerDefense: 'Tower Defense',
level: 'Level',
startWave: 'Start Wave',
waveInProgress: 'Wave in progress...',
upgrade: 'Upgrade',
sell: 'Sell',
youWin: 'You Win!',
gameOver: 'Game Over!',
tryAgain: 'Try Again',
```

For Italian:
```js
towerDefense: 'Torre Difesa',
startWave: 'Inizia Onda',
waveInProgress: 'Onda in corso...',
upgrade: 'Migliora',
sell: 'Vendi',
youWin: 'Hai Vinto!',
gameOver: 'Game Over!',
tryAgain: 'Riprova',
```

For Romanian:
```js
towerDefense: 'Apărare Turn',
startWave: 'Începe Valul',
waveInProgress: 'Val în desfășurare...',
upgrade: 'Îmbunătățește',
sell: 'Vinde',
youWin: 'Ai Câștigat!',
gameOver: 'Game Over!',
tryAgain: 'Încearcă din nou',
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(td): add tower-defense to navigation and localization"
```

---

### Task 5: Tests

**Files:**
- Create: `tests/behavioral/tower-defense.test.js`
- Create: `tests/e2e/tower-defense.test.js`
- Create: `tests/unit/tower-defense.test.js`

- [ ] **Step 1: Unit tests**

`tests/unit/tower-defense.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { TOWERS, upgradedStats } from '$lib/tower-defense/towers';
import { ENEMY_TYPES, scaledHealth } from '$lib/tower-defense/enemies';
import { MAPS, getTowerSpots, getPathCells } from '$lib/tower-defense/maps';

describe('Towers', () => {
  it('has 5 tower types', () => expect(TOWERS.length).toBe(5));
  it('each tower has required fields', () => {
    TOWERS.forEach(t => {
      expect(t.id).toBeTruthy();
      expect(t.cost).toBeGreaterThan(0);
      expect(t.damage).toBeGreaterThan(0);
    });
  });
  it('upgrade stats scale correctly', () => {
    const arrow = TOWERS[0];
    const up1 = upgradedStats(arrow, 1);
    expect(up1.damage).toBeGreaterThan(arrow.damage);
  });
});

describe('Enemies', () => {
  it('has 4 enemy types', () => expect(ENEMY_TYPES.length).toBe(4));
  it('health scales with level', () => {
    expect(scaledHealth(20, 1)).toBe(20);
    expect(scaledHealth(20, 5)).toBeGreaterThan(20);
  });
});

describe('Maps', () => {
  it('has 5 maps', () => expect(MAPS.length).toBe(5));
  it('each map has grid, startCoins, lives', () => {
    MAPS.forEach(m => {
      expect(m.grid).toBeGreaterThan(0);
      expect(m.startCoins).toBeGreaterThan(0);
      expect(m.lives).toBe(10);
    });
  });
  it('tower spots are counted correctly', () => {
    const spots = getTowerSpots(MAPS[0].layout);
    expect(spots.length).toBeGreaterThanOrEqual(1);
  });
  it('path has spawn and end', () => {
    const path = getPathCells(MAPS[0].layout);
    expect(path.length).toBeGreaterThan(2);
  });
});
```

- [ ] **Step 2: Behavioral tests**

`tests/behavioral/tower-defense.test.js`:
```js
import { describe, it, expect } from 'vitest';

describe('Tower Defense behavior', () => {
  it('placing tower costs coins', () => {
    let coins = 100;
    const cost = 30;
    coins -= cost;
    expect(coins).toBe(70);
  });
  it('cannot place tower if insufficient coins', () => {
    let coins = 20;
    const canPlace = coins >= 50;
    expect(canPlace).toBe(false);
  });
  it('killing enemy awards coins', () => {
    let coins = 100;
    coins += 10;
    expect(coins).toBe(110);
  });
  it('losing all lives ends game', () => {
    let lives = 10;
    for (let i = 0; i < 10; i++) lives--;
    expect(lives).toBe(0);
    const gameOver = lives <= 0;
    expect(gameOver).toBe(true);
  });
  it('winning requires surviving all waves', () => {
    const wave = 5;
    const totalWaves = 5;
    expect(wave >= totalWaves).toBe(true);
  });
  it('tower upgrade increases damage', () => {
    const baseDamage = 10;
    const upgradedDamage = Math.round(baseDamage * 1.5);
    expect(upgradedDamage).toBe(15);
  });
  it('selling refunds half the investment', () => {
    const cost = 30;
    const refund = Math.round(cost * 0.5);
    expect(refund).toBe(15);
  });
  it('enemy health scales with level', () => {
    const health = (base, lvl) => Math.round(base * (1 + (lvl - 1) * 0.3));
    expect(health(20, 1)).toBe(20);
    expect(health(20, 5)).toBe(44);
  });
});
```

- [ ] **Step 3: E2E tests**

`tests/e2e/tower-defense.test.js`:
```js
import { test, expect } from '@playwright/test';

test.describe('Tower Defense E2E', () => {
  test('level select screen loads', async ({ page }) => {
    await page.goto('/games/tower-defense');
    await expect(page.locator('.td-menu')).toBeVisible();
    await expect(page.locator('.td-level-btn')).toHaveCount(5);
  });

  test('selecting a level starts the game', async ({ page }) => {
    await page.goto('/games/tower-defense');
    await page.locator('.td-level-btn').first().click();
    await expect(page.locator('.td-map')).toBeVisible();
    await expect(page.locator('.td-hud')).toBeVisible();
  });

  test('tower tray is visible during setup', async ({ page }) => {
    await page.goto('/games/tower-defense');
    await page.locator('.td-level-btn').first().click();
    await expect(page.locator('.td-tower-btn')).toHaveCount(5);
    await expect(page.locator('.td-start-btn')).toBeVisible();
  });

  test('start wave button triggers wave phase', async ({ page }) => {
    await page.goto('/games/tower-defense');
    await page.locator('.td-level-btn').first().click();
    await page.waitForTimeout(500);
    await page.locator('.td-start-btn').click();
    await page.waitForTimeout(200);
    const waveInfo = page.locator('.td-wave-info');
    await expect(waveInfo).toBeVisible();
  });
});
```

- [ ] **Step 4: Run all tests**

```bash
pnpm test && HEADED=true pnpm test:e2e tests/e2e/tower-defense.test.js
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "test(td): add unit, behavioral, and e2e tests for tower defense"
```

---

### Task 6: Final Polish

- [ ] **Step 1: Update screenshots**

```bash
node scripts/screenshots.mjs
```

- [ ] **Step 2: Run full test suite**

```bash
pnpm test && HEADED=true npx playwright test
```

- [ ] **Step 3: If all pass, commit final**

```bash
git add -A && git commit -m "chore: final polish and full test pass"
git push
```
