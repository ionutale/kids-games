import { getPathCells } from './maps.js';

export function createEngine(mapData, onUpdate) {
  const pathCells = getPathCells(mapData.layout);

  const state = {
    coins: mapData.startCoins,
    lives: mapData.lives,
    wave: 0,
    totalWaves: 2 + mapData.id,
    phase: 'setup',
    towers: [],
    enemies: [],
    projectiles: [],
    pathCells,
    waveQueue: [],
    spawnTimer: 0,
    spawnInterval: 1500,
    spawnIndex: 0,
    frameId: null,
    lastTime: 0,
    won: false,
    lost: false,
    gridSize: mapData.grid,
  };

  function getTowerAt(row, col) {
    return state.towers.find(t => t.row === row && t.col === col) || null;
  }

  function isPath(row, col) {
    const v = mapData.layout[row]?.[col];
    return v === 'path' || v === 'spawn' || v === 'end';
  }

  function placeTower(row, col, towerType) {
    if (isPath(row, col)) return false;
    if (getTowerAt(row, col)) return false;
    if (state.coins < towerType.cost) return false;
    state.coins -= towerType.cost;
    const tower = { type: towerType, level: 0, cooldown: 0, row, col };
    state.towers.push(tower);
    return true;
  }

  function upgradeTower(row, col) {
    const tower = getTowerAt(row, col);
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
    const invested = tower.type.cost + (tower.level > 0 ? tower.type.cost * tower.level : 0);
    state.coins += Math.round(invested * 0.5);
    state.towers.splice(idx, 1);
    return true;
  }

  function generateWaveEnemies(level, waveIdx) {
    const totalWaves = 2 + level;
    const difficulty = (waveIdx + 1) / totalWaves;
    const count = 3 + Math.floor(difficulty * (level * 2));
    const types = [
      { emoji: '🐗', speed: 1,   health: 20,   reward: 10 },
      { emoji: '🐺', speed: 2,   health: 10,   reward: 15 },
      { emoji: '🐻', speed: 0.7, health: 60,   reward: 25 },
      { emoji: '🐉', speed: 0.5, health: 200,  reward: 50 },
    ];
    const available = types.filter((_, i) => i <= level - 1);
    if (available.length === 0) available.push(types[0]);
    const enemies = [];
    for (let i = 0; i < count; i++) {
      const t = available[Math.floor(Math.random() * available.length)];
      const scaledHealth = Math.round(t.health * (1 + (level - 1) * 0.3));
      enemies.push({ emoji: t.emoji, speed: t.speed, health: scaledHealth, maxHealth: scaledHealth, reward: t.reward, pathPos: 0, alive: true });
    }
    return enemies;
  }

  function startWave() {
    if (state.phase !== 'setup') return;
    state.wave++;
    state.phase = 'wave';
    state.waveQueue = generateWaveEnemies(mapData.id, state.wave - 1);
    state.spawnIndex = 0;
    state.spawnTimer = 0;
  }

  function loop(time) {
    if (state.lastTime === 0) state.lastTime = time;
    const dt = Math.min((time - state.lastTime) / 1000, 0.1);
    state.lastTime = time;

    if (state.phase === 'wave') {
      state.spawnTimer += dt * 1000;
      if (state.spawnTimer >= state.spawnInterval && state.spawnIndex < state.waveQueue.length) {
        const e = state.waveQueue[state.spawnIndex];
        state.enemies.push({ ...e, id: Math.random(), pathPos: 0, alive: true });
        state.spawnIndex++;
        state.spawnTimer = 0;
      }

      for (const enemy of state.enemies) {
        if (!enemy.alive) continue;
        enemy.pathPos += enemy.speed * dt;
        if (enemy.pathPos >= pathCells.length) {
          enemy.alive = false;
          state.lives--;
          if (state.lives <= 0) { state.lost = true; state.phase = 'gameover'; }
        }
      }

      for (const tower of state.towers) {
        tower.cooldown = Math.max(0, tower.cooldown - dt);
        if (tower.cooldown > 0) continue;
        const mult = 1 + tower.level * 0.5;
        const range = Math.round(tower.type.range * mult);
        const damage = Math.round(tower.type.damage * mult);

        let target = null;
        let targetDist = Infinity;
        for (const enemy of state.enemies) {
          if (!enemy.alive) continue;
          if (enemy.pathPos >= pathCells.length) continue;
          const cellIdx = Math.min(Math.floor(enemy.pathPos), pathCells.length - 1);
          const cell = pathCells[cellIdx];
          if (!cell) continue;
          const dx = Math.abs(tower.col - cell.col);
          const dy = Math.abs(tower.row - cell.row);
          const dist = Math.max(dx, dy);
          if (dist <= range && enemy.pathPos > targetDist) {
            target = enemy;
            targetDist = enemy.pathPos;
          }
        }

        if (target) {
          tower.cooldown = tower.type.fireRate;
          state.projectiles.push({
            id: Math.random(),
            fromRow: tower.row,
            fromCol: tower.col,
            targetId: target.id,
            speed: 4,
            progress: 0,
            damage,
            slow: tower.type.slow,
          });
        }
      }

      for (const proj of state.projectiles) {
        proj.progress += proj.speed * dt;
      }

      for (const proj of state.projectiles) {
        if (proj.progress < 1) continue;
        const tgt = state.enemies.find(e => e.id === proj.targetId && e.alive);
        if (tgt) {
          tgt.health -= proj.damage;
          if (proj.slow > 0) {
            tgt.speed = tgt._baseSpeed || tgt.speed;
            if (!tgt._baseSpeed) tgt._baseSpeed = tgt.speed;
            tgt.speed = tgt._baseSpeed * (1 - proj.slow);
          }
          if (tgt.health <= 0) {
            tgt.alive = false;
            state.coins += tgt.reward;
          }
        }
      }
      state.projectiles = state.projectiles.filter(p => p.progress < 1);

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

    onUpdate({ ...state, towers: [...state.towers], enemies: state.enemies.map(e => ({ ...e })), projectiles: state.projectiles.map(p => ({ ...p })) });
    if (!state.lost && !state.won) {
      state.frameId = requestAnimationFrame(loop);
    }
  }

  function start() {
    state.lastTime = 0;
    state.frameId = requestAnimationFrame(loop);
  }

  function stop() {
    if (state.frameId) cancelAnimationFrame(state.frameId);
    state.frameId = null;
  }

  return { state, placeTower, upgradeTower, sellTower, startWave, start, stop };
}
