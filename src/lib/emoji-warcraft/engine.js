import { createMap, bfs, MAP_W, MAP_H, T } from './map.js';
import { BUILDINGS } from './buildings.js';
import { UNIT_TYPES } from './units.js';

export function createEngine(level, onUpdate) {
  const map = createMap();
  const state = {
    map, level,
    gold: 200, wood: 50, maxPop: 5,
    buildings: [], units: [], projectiles: [],
    turn: 0, gameOver: null, winner: null,
  };

  function canPlace(row, col) {
    if (row < 0 || row >= MAP_H || col < 0 || col >= MAP_W) return false;
    if (map[row][col] !== T.EMPTY && map[row][col] < 10) return false;
    if (state.buildings.find(b => b.row === row && b.col === col && b.hp > 0)) return false;
    return true;
  }

  function placeBuilding(typeId, row, col, owner) {
    const bt = BUILDINGS.find(b => b.id === typeId);
    if (!bt || !canPlace(row, col)) return false;
    if (owner === 'p1' && (state.gold < bt.cost.g || state.wood < bt.cost.w)) return false;
    if (owner === 'p1') { state.gold -= bt.cost.g; state.wood -= bt.cost.w; }
    const b = { ...bt, row, col, hp: bt.hp, maxHp: bt.hp, owner, queue: [], queueTimer: 0 };
    state.buildings.push(b);
    map[row][col] = owner === 'p1' ? 10 + BUILDINGS.indexOf(bt) : 20 + BUILDINGS.indexOf(bt);
    if (bt.popBonus) state.maxPop += bt.popBonus;
    return true;
  }

  function spawnUnit(typeId, building, owner) {
    const ut = UNIT_TYPES.find(u => u.id === typeId);
    if (!ut) return false;
    const dirs = [[0,1],[0,-1],[1,0],[-1,0],[1,1],[-1,-1],[1,-1],[-1,1]];
    let spawnPos = null;
    for (const [dr, dc] of dirs) {
      const nr = building.row + dr, nc = building.col + dc;
      if (nr >= 0 && nr < MAP_H && nc >= 0 && nc < MAP_W && map[nr][nc] === T.EMPTY) {
        spawnPos = [nr, nc]; break;
      }
    }
    if (!spawnPos) return false;
    if (owner === 'p1') {
      if (state.gold < ut.cost.g || state.wood < ut.cost.w) return false;
      const pop = state.units.filter(u => u.alive && u.owner === 'p1').length;
      if (pop >= state.maxPop) return false;
      state.gold -= ut.cost.g; state.wood -= ut.cost.w;
    }
    const u = { ...ut, id: Math.random(), row: spawnPos[0], col: spawnPos[1], hp: ut.hp, maxHp: ut.hp, owner, alive: true, targetRow: null, targetCol: null, attackTarget: null };
    state.units.push(u);
    return true;
  }

  function tick() {
    state.turn++;

    for (const u of state.units) {
      if (!u.alive) continue;

      if (u.attackTarget) {
        const t = u.attackTarget;
        if (!t.alive && t.hp <= 0) { u.attackTarget = null; continue; }
        const dr = Math.abs(u.row - t.row), dc = Math.abs(u.col - t.col);
        const range = u.range || 1;
        if (dr <= range && dc <= range) {
          t.hp -= u.atk;
          if (t.hp <= 0) { t.alive = false; state.units = state.units.filter(x => x.alive || x.owner !== 'p2'); }
        } else {
          const path = bfs(state.map, u.row, u.col, t.row, t.col);
          if (path && path.length > 1) { u.row = path[1][0]; u.col = path[1][1]; }
        }
        continue;
      }

      if (u.targetRow !== null && u.targetCol !== null) {
        const dr = Math.abs(u.row - u.targetRow), dc = Math.abs(u.col - u.targetCol);
        if (dr <= u.speed && dc <= u.speed) { u.row = u.targetRow; u.col = u.targetCol; u.targetRow = null; u.targetCol = null; }
        else {
          const path = bfs(state.map, u.row, u.col, u.targetRow, u.targetCol);
          if (path && path.length > 1) { u.row = path[1][0]; u.col = path[1][1]; }
        }
      }
    }

    for (const t of state.buildings) {
      if (t.id === 'tower' && t.hp > 0) {
        const enemy = state.units.find(u => u.alive && u.owner !== t.owner && Math.abs(u.row - t.row) <= t.range && Math.abs(u.col - t.col) <= t.range);
        if (enemy) { enemy.hp -= t.damage || 8; if (enemy.hp <= 0) enemy.alive = false; }
      }
    }

    state.units = state.units.filter(u => u.alive || u.owner === 'p1');
    const p1th = state.buildings.find(b => b.id === 'townHall' && b.owner === 'p1');
    const p2th = state.buildings.find(b => b.id === 'townHall' && b.owner === 'p2');
    if (p1th && p1th.hp <= 0) { state.gameOver = true; state.winner = 'p2'; }
    if (p2th && p2th.hp <= 0) { state.gameOver = true; state.winner = 'p1'; }

    onUpdate({ ...state, buildings: [...state.buildings], units: state.units.map(u => ({ ...u })) });
  }

  function start() { setInterval(tick, 300); }

  return { state, placeBuilding, spawnUnit, start, canPlace };
}
