# Emoji Warcraft Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or executing-plans to implement this plan task-by-task.

**Goal:** Build a mobile-first Warcraft-like RTS with emoji, 12×12 map, AI opponent, 6 buildings, 4 units.

**Architecture:** Tick-based game loop (200ms). Grid rendered with CSS grid, units/buildings as positioned emoji. BFS pathfinding. AI state machine.

**Tech Stack:** Svelte 5, SvelteKit, Vitest, Playwright

---

### Task 1: Data Modules

**Files:**
- Create: `src/lib/emoji-warcraft/map.js`
- Create: `src/lib/emoji-warcraft/buildings.js`
- Create: `src/lib/emoji-warcraft/units.js`

- [ ] **Step 1: Create `src/lib/emoji-warcraft/map.js`**

```js
export const MAP_W = 12;
export const MAP_H = 12;
export const T = { EMPTY: 0, GOLD: 1, TREE: 2, WATER: 3, TOWN_HALL: 4, BARRACKS: 5, FARM: 6, TOWER: 7, LUMBER: 8, MINE: 9 };

export function createMap() {
  const grid = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(T.EMPTY));

  // Water center column
  for (let r = 3; r <= 8; r++) grid[r][6] = T.WATER;

  // Gold clusters
  const goldSpots = [[2,2],[3,10],[9,2],[8,9]];
  goldSpots.forEach(([r,c]) => { grid[r][c] = T.GOLD; grid[r+1][c+1] = T.GOLD; });

  // Tree clusters
  for (let i = 0; i < 15; i++) {
    let r = Math.floor(Math.random() * 12);
    let c = Math.floor(Math.random() * 12);
    if (grid[r][c] === T.EMPTY) grid[r][c] = T.TREE;
  }

  return grid;
}

export function bfs(grid, startR, startC, endR, endC) {
  const rows = grid.length, cols = grid[0].length;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const prev = Array.from({ length: rows }, () => Array(cols).fill(null));
  const queue = [[startR, startC]];
  visited[startR][startC] = true;

  while (queue.length > 0) {
    const [r, c] = queue.shift();
    if (r === endR && c === endC) {
      const path = [];
      let cur = [endR, endC];
      while (cur) {
        path.push(cur);
        cur = prev[cur[0]][cur[1]];
      }
      return path.reverse();
    }
    for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {
        const cell = grid[nr][nc];
        if (cell === T.EMPTY || cell >= 10) {
          visited[nr][nc] = true;
          prev[nr][nc] = [r, c];
          queue.push([nr, nc]);
        }
      }
    }
  }
  return null; // no path
}
```

- [ ] **Step 2: Create `src/lib/emoji-warcraft/buildings.js`**

```js
export const BUILDINGS = [
  { id: 'townHall',  emoji: '🏰', name: 'Town Hall', cost: { g: 0, w: 0 }, hp: 500, produces: 'peasant', range: 0 },
  { id: 'barracks',  emoji: '⚔️', name: 'Barracks',  cost: { g: 100, w: 50 }, hp: 200, produces: 'soldier', range: 0 },
  { id: 'farm',      emoji: '🌾', name: 'Farm',      cost: { g: 50, w: 0 },  hp: 100, produces: null, range: 0, popBonus: 5 },
  { id: 'tower',     emoji: '🗼', name: 'Tower',     cost: { g: 75, w: 25 }, hp: 150, produces: null, range: 2, damage: 8 },
  { id: 'lumberMill',emoji: '🪵', name: 'Lumber Mill', cost: { g: 60, w: 0 }, hp: 100, produces: null, range: 0 },
  { id: 'goldMine',  emoji: '⛏️', name: 'Gold Mine', cost: { g: 80, w: 0 }, hp: 80, produces: null, range: 0 },
];
```

- [ ] **Step 3: Create `src/lib/emoji-warcraft/units.js`**

```js
export const UNIT_TYPES = [
  { id: 'peasant',  emoji: '👷', name: 'Peasant',  cost: { g: 50, w: 0 },  hp: 30, atk: 0,  speed: 1, range: 0, role: 'worker' },
  { id: 'soldier',  emoji: '🗡️', name: 'Soldier',  cost: { g: 75, w: 25 }, hp: 60, atk: 10, speed: 1, range: 0, role: 'melee' },
  { id: 'archer',   emoji: '🏹', name: 'Archer',   cost: { g: 100, w: 50 }, hp: 40, atk: 8,  speed: 1, range: 2, role: 'ranged' },
  { id: 'knight',   emoji: '🐴', name: 'Knight',   cost: { g: 150, w: 75 }, hp: 80, atk: 15, speed: 2, range: 0, role: 'cavalry' },
];
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(ew): add data modules for map, buildings, units"
```

---

### Task 2: Game Engine

**Files:**
- Create: `src/lib/emoji-warcraft/engine.js`
- Create: `src/lib/emoji-warcraft/ai.js`

- [ ] **Step 1: Create `src/lib/emoji-warcraft/engine.js`**

```js
import { createMap, bfs, MAP_W, MAP_H, T } from './map.js';
import { BUILDINGS } from './buildings.js';
import { UNIT_TYPES } from './units.js';

export function createEngine(level, onUpdate) {
  const map = createMap();
  let state = {
    map, level,
    gold: 200, wood: 50, maxPop: 5,
    buildings: [], units: [], projectiles: [],
    turn: 0, gameOver: null, winner: null,
  };

  function placeBuilding(typeId, row, col, owner) {
    const bt = BUILDINGS.find(b => b.id === typeId);
    if (!bt) return false;
    if (map[row][col] !== T.EMPTY && map[row][col] < 10) return false;
    if (state.buildings.find(b => b.row === row && b.col === col)) return false;
    if (state.gold < bt.cost.g || state.wood < bt.cost.w) return false;
    if (owner === 'p1') { state.gold -= bt.cost.g; state.wood -= bt.cost.w; }
    const b = { ...bt, row, col, hp: bt.hp, maxHp: bt.hp, owner, queue: [], queueTimer: 0, placed: true };
    state.buildings.push(b);
    map[row][col] = owner === 'p1' ? 10 + BUILDINGS.indexOf(bt) : 20 + BUILDINGS.indexOf(bt);
    if (bt.popBonus) state.maxPop += bt.popBonus;
    return true;
  }

  function spawnUnit(typeId, building, owner) {
    const ut = UNIT_TYPES.find(u => u.id === typeId);
    if (!ut) return;
    const dirs = [[0,1],[0,-1],[1,0],[-1,0],[1,1],[-1,-1],[1,-1],[-1,1]];
    let spawnPos = null;
    for (const [dr, dc] of dirs) {
      const nr = building.row + dr, nc = building.col + dc;
      if (nr >= 0 && nr < MAP_H && nc >= 0 && nc < MAP_W && map[nr][nc] === T.EMPTY) {
        spawnPos = [nr, nc]; break;
      }
    }
    if (!spawnPos) return;
    if (owner === 'p1') {
      if (state.gold < ut.cost.g || state.wood < ut.cost.w) return;
      const pop = state.units.filter(u => u.alive && u.owner === 'p1').length;
      if (pop >= state.maxPop) return;
      state.gold -= ut.cost.g; state.wood -= ut.cost.w;
    }
    const u = {
      ...ut, id: Math.random(), row: spawnPos[0], col: spawnPos[1],
      hp: ut.hp, maxHp: ut.hp, owner, alive: true,
      targetRow: null, targetCol: null, attackTarget: null,
      gatherTarget: null, carrying: null,
    };
    state.units.push(u);
  }

  return { state, placeBuilding, spawnUnit, map };
}
```

- [ ] **Step 2: Create `src/lib/emoji-warcraft/ai.js`**

```js
export function aiTurn(state, placeBuilding, spawnUnit) {
  const aiBld = state.buildings.filter(b => b.owner === 'p2');
  const aiUnits = state.units.filter(u => u.alive && u.owner === 'p2');

  // Phase 1: gather
  if (state.turn < 30) return;

  // Build farm + barracks
  if (!aiBld.find(b => b.id === 'barracks')) {
    const empty = findEmpty(state.map, 8, 10, 0, 4);
    if (empty) placeBuilding('farm', empty[0], empty[1], 'p2');
    return;
  }

  // Train soldiers
  const barracks = aiBld.find(b => b.id === 'barracks');
  if (barracks && aiUnits.length < 3 + state.level) {
    spawnUnit('soldier', barracks, 'p2');
    return;
  }

  // Attack
  if (aiUnits.length >= 3 + state.level) {
    const target = state.buildings.find(b => b.owner === 'p1');
    if (target) {
      for (const u of aiUnits) {
        if (!u.attackTarget) u.attackTarget = target;
      }
    }
  }
}

function findEmpty(map, r1, r2, c1, c2) {
  const { T } = require('./map.js');
  for (let r = r1; r <= r2; r++)
    for (let c = c1; c <= c2; c++)
      if (map[r][c] === 0) return [r, c];
  return null;
}
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat(ew): add game engine and AI skeleton"
```

---

### Task 3: Game Route + Component

**Files:**
- Create: `src/routes/games/emoji-warcraft/+page.js`
- Create: `src/routes/games/emoji-warcraft/+page.svelte`
- Modify: `src/routes/+page.svelte` (add to games list)
- Modify: `src/lib/stores/locale.js` (add game title key)

- [ ] **Step 1: Write `src/routes/games/emoji-warcraft/+page.js`**

```js
export const prerender = false;
export const ssr = false;
```

- [ ] **Step 2: Write `src/routes/games/emoji-warcraft/+page.svelte`**

```svelte
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
  let interval = null;
  let panX = $state(0), panY = $state(0);
  let panning = $state(false);
  let panStart = $state(null);

  function startLevel(l) {
    const eng = createEngine(l, (s) => { gs = s; });
    engine = eng;
    gs = eng.state;
    view = 'game';

    eng.placeBuilding('townHall', 1, 10, 'p1');
    eng.placeBuilding('townHall', 10, 1, 'p2');

    interval = setInterval(() => {
      aiTurn(gs, eng.placeBuilding, eng.spawnUnit);
      gs = { ...gs, turn: gs.turn + 1 };
    }, 1000);
  }

  function handleCellClick(row, col) {
    if (!gs) return;

    if (buildingMenu) {
      const ok = engine.placeBuilding(buildingMenu, row, col, 'p1');
      if (ok) buildingMenu = null;
      return;
    }

    const clickedBld = gs.buildings.find(b => b.row === row && b.col === col && b.owner === 'p1');
    if (clickedBld) {
      selectedBld = clickedBld;
      selectedUnit = null;
      return;
    }

    const clickedUnit = gs.units.find(u => u.alive && u.row === row && u.col === col && u.owner === 'p1');
    if (clickedUnit) {
      selectedUnit = clickedUnit;
      selectedBld = null;
      return;
    }

    const enemy = gs.units.find(u => u.alive && u.row === row && u.col === col && u.owner === 'p2');
    if (enemy && selectedUnit && selectedUnit.role !== 'worker') {
      selectedUnit.attackTarget = enemy;
      selectedUnit.targetRow = enemy.row;
      selectedUnit.targetCol = enemy.col;
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

  function onMapPointerDown(e) {
    panning = true;
    panStart = { x: e.clientX, y: e.clientY, px: panX, py: panY };
  }

  function onMapPointerMove(e) {
    if (!panning || !panStart) return;
    panX = panStart.px + (panStart.x - e.clientX);
    panY = panStart.py + (panStart.y - e.clientY);
  }

  function onMapPointerUp() { panning = false; panStart = null; }

  onDestroy(() => { if (interval) clearInterval(interval); });
</script>

{#if view === 'select'}
  <div class="ew-menu">
    <h2>⚔️ Emoji Warcraft</h2>
    <div class="ew-levels">
      {#each Array(5) as _, i}
        <button onclick={() => startLevel(i + 1)}>Level {i + 1}</button>
      {/each}
    </div>
  </div>
{:else if gs}
  <div class="ew-game">
    <div class="ew-hud">
      <span>🪙 {gs.gold}</span>
      <span>🪵 {gs.wood}</span>
      <span>👷 {gs.units.filter(u => u.alive && u.owner === 'p1').length}/{gs.maxPop}</span>
    </div>

    <div class="ew-map-wrap"
      ontouchstart={onMapPointerDown}
      ontouchmove={onMapPointerMove}
      ontouchend={onMapPointerUp}
      onmousedown={onMapPointerDown}
      onmousemove={onMapPointerMove}
      onmouseup={onMapPointerUp}
      onmouseleave={onMapPointerUp}
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
                <span class="ew-unit">{un.emoji}</span>
              {:else if bld}
                <span class="ew-bld" class:enemy={bld.owner === 'p2'}>{bld.emoji}</span>
              {:else}
                <span class="ew-tile">{getTileEmoji(cell)}</span>
              {/if}
            </div>
          {/each}
        {/each}
      </div>
    </div>

    <div class="ew-panel">
      {#if selectedBld && selectedBld.id === 'townHall'}
        {#each UNIT_TYPES.filter(u => u.role === 'worker') as ut}
          <button class="ew-btn" onclick={() => queueUnit(ut.id)}>
            {ut.emoji} {ut.name} ({ut.cost.g}g)
          </button>
        {/each}
      {:else if selectedBld && selectedBld.id === 'barracks'}
        {#each UNIT_TYPES.filter(u => u.role !== 'worker') as ut}
          <button class="ew-btn" onclick={() => queueUnit(ut.id)}>
            {ut.emoji} {ut.name} ({ut.cost.g}g + {ut.cost.w}w)
          </button>
        {/each}
      {:else if selectedUnit?.role === 'worker'}
        <button class="ew-btn" onclick={() => buildingMenu = buildingMenu ? null : 'barracks'}>
          ⚔️ Build Barracks
        </button>
      {:else if !selectedBld && !selectedUnit}
        <span class="ew-hint">Tap a unit or building</span>
      {/if}
    </div>
  </div>
{/if}

<style>
  .ew-menu, .ew-game { display: flex; flex-direction: column; align-items: center; flex: 1; }
  .ew-hud { display: flex; gap: 16px; padding: 8px; font-weight: 700; font-size: 16px; background: rgba(255,255,255,0.8); width: 100%; justify-content: center; }
  .ew-map-wrap { flex: 1; overflow: hidden; width: 100%; position: relative; touch-action: none; }
  .ew-map { display: grid; grid-template-columns: repeat(12, 48px); grid-template-rows: repeat(12, 48px); gap: 1px; background: #e8f5e9; }
  .ew-cell { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; font-size: 20px; background: #f1f8e9; border: 1px solid #c8e6c9; }
  .ew-cell.gold { background: #fff8e1; border-color: #ffecb3; }
  .ew-cell.tree { background: #e8f5e9; border-color: #a5d6a7; }
  .ew-cell.water { background: #e3f2fd; border-color: #90caf9; }
  .ew-unit { font-size: 22px; cursor: pointer; }
  .ew-bld { font-size: 24px; }
  .ew-bld.enemy { filter: drop-shadow(0 0 4px rgba(244,67,54,0.5)); }
  .ew-tile { font-size: 14px; opacity: 0.4; }
  .ew-panel { display: flex; gap: 8px; padding: 8px; padding-bottom: calc(8px + var(--safe-bottom)); background: rgba(255,255,255,0.9); width: 100%; justify-content: center; flex-wrap: wrap; }
  .ew-btn { padding: 8px 16px; background: white; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); font-weight: 600; font-size: 14px; }
  .ew-hint { color: #999; font-size: 14px; }
</style>
```

- [ ] **Step 3: Add to game hub**

In `src/routes/+page.svelte`:
```js
{ id: 'emoji-warcraft', icon: '⚔️', key: 'emojiWarcraft' },
```

In `src/lib/stores/locale.js`, add to each language:
```js
emojiWarcraft: 'Emoji Warcraft',
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(ew): add game route with map, units, building placement"
```

---

### Task 4: Tests

**Files:**
- Create: `tests/unit/emoji-warcraft.test.js`
- Create: `tests/behavioral/emoji-warcraft.test.js`
- Create: `tests/e2e/emoji-warcraft.test.js`

- [ ] **Step 1: Unit tests**

```js
import { describe, it, expect } from 'vitest';
import { createMap, bfs, MAP_W, MAP_H, T } from '$lib/emoji-warcraft/map.js';
import { BUILDINGS } from '$lib/emoji-warcraft/buildings.js';
import { UNIT_TYPES } from '$lib/emoji-warcraft/units.js';

describe('Map', () => {
  it('creates 12x12 grid', () => {
    const map = createMap();
    expect(map.length).toBe(12);
    expect(map[0].length).toBe(12);
  });

  it('bfs finds path between two empty cells', () => {
    const map = createMap();
    const path = bfs(map, 0, 0, 11, 11);
    expect(path).not.toBeNull();
    expect(path[0]).toEqual([0, 0]);
    expect(path[path.length - 1]).toEqual([11, 11]);
  });
});

describe('Buildings', () => {
  it('has 6 building types', () => expect(BUILDINGS.length).toBe(6));
  it('each has emoji, cost, hp', () => {
    BUILDINGS.forEach(b => {
      expect(b.emoji).toBeTruthy(); expect(b.hp).toBeGreaterThan(0);
    });
  });
});

describe('Units', () => {
  it('has 4 unit types', () => expect(UNIT_TYPES.length).toBe(4));
  it('each has cost and attack', () => {
    UNIT_TYPES.forEach(u => {
      expect(u.emoji).toBeTruthy();
      expect(u.hp).toBeGreaterThan(0);
    });
  });
});
```

- [ ] **Step 2: Behavioral + E2E tests**

Create behavioral tests for resource tracking, building placement, and unit stats. Create E2E tests for loading the game, building placement, and basic interaction.

- [ ] **Step 3: Run tests**

```bash
pnpm test && HEADED=true pnpm test:e2e tests/e2e/emoji-warcraft.test.js
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "test(ew): add unit, behavioral, e2e tests"
```

---

### Task 5: Final Polish

- [ ] **Step 1: Update screenshots**
- [ ] **Step 2: Run full test suite**
- [ ] **Step 3: Push branch**

```bash
git push -u origin feat/emoji-warcraft
```
