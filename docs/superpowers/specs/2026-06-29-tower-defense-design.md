# Tower Defense — Kids Game Design

## Overview

A tower defense game for ages 8+. 5 levels with increasing difficulty. Drag towers from a tray onto placement spots on the map. Enemies follow a fixed path. Survive all waves to win.

## Stack

Same as existing project: Svelte 5 + SvelteKit. No canvas — grid rendered with CSS, enemies/towers as positioned emoji in cells. Game loop via `requestAnimationFrame`.

## Architecture

```
src/routes/games/tower-defense/+page.svelte   ← main game component
src/lib/tower-defense/
  maps.js       ← 5 map definitions (grid, path, tower spots, waves)
  enemies.js    ← enemy types with stats
  towers.js     ← tower types, costs, stats, upgrades
  engine.js     ← game loop: spawn, move, shoot, damage, win/lose
```

All game logic in plain JS modules, no external dependencies.

## Maps (5 levels)

| Level | Grid | Path | Tower Spots | Waves | Start Coins |
|-------|------|------|-------------|-------|-------------|
| 1 | 6×6 | Simple S-curve | 4 | 3 | 100 |
| 2 | 7×7 | L-shape with turn | 5 | 4 | 120 |
| 3 | 8×8 | Zig-zag | 6 | 5 | 140 |
| 4 | 9×9 | Double-back | 7 | 6 | 160 |
| 5 | 10×10 | Maze-like | 8 | 7 | 180 |

Each map defined as a 2D array where each cell is: empty, path (with direction), tower-spot (highlighted), or spawn/end point.

## Tower Types

| Emoji | Name | Cost | Damage | Range | Fire Rate | Special |
|-------|------|------|--------|-------|-----------|---------|
| 🏹 | Arrow | 30 | 10 | 2 cells | 1s | Single target |
| 💣 | Cannon | 50 | 25 | 2 cells | 2s | Area splash |
| ❄️ | Ice | 40 | 5 | 2 cells | 1.5s | Slows 50% for 2s |
| ⚡ | Lightning | 70 | 15 | 3 cells | 1.5s | Chains to 3 enemies |
| 🌟 | Star | 100 | 40 | 3 cells | 2.5s | Single target, high damage |

Each tower can be upgraded twice: +50% damage and range per upgrade. Upgrade cost = base cost × upgrade level.

## Enemy Types

| Emoji | Name | Speed | Health | Coin Reward | First Appears |
|-------|------|-------|--------|-------------|---------------|
| 🟢 | Basic | 1 cell/s | 20 | 10 | Level 1 |
| 🔵 | Fast | 2 cell/s | 10 | 15 | Level 2 |
| 🟠 | Heavy | 0.7 cell/s | 60 | 25 | Level 3 |
| 🔴 | Boss | 0.5 cell/s | 200 | 50 | Level 4 |

Enemy health scales with level: `health × (1 + (level - 1) × 0.3)`.

## Game Flow

1. **Setup phase**: Map loads. Player drags towers from bottom tray to highlighted spots. "Start Wave" button visible.
2. **Wave phase**: Enemies spawn at entry point and follow path path. Towers auto-fire at enemies in range. Coins drop on kill. Player cannot place/upgrade during wave (only between).
3. **Between waves**: Brief pause. Player can place new towers or upgrade existing ones. "Next Wave" button.
4. **Enemy reaches end**: Lose 1 life (10 lives per level).
5. **All waves survived**: Win screen with 1-3 stars based on lives remaining (3+ lives = 3 stars, 1-2 = 2 stars, 0 = 1 star).
6. **Lives reach 0 during a wave**: Game over. "Try Again" button.

## Controls

- **Drag tower**: Touch/mousedown on tray item → drag to map spot → release to place (if valid and affordable)
- **Upgrade tower**: Tap placed tower → shows upgrade cost overlay → tap upgrade button
- **Sell tower**: Tap placed tower → shows sell button → returns 50% of total invested
- **Start wave**: Tap "▶ Start Wave" button
- **Wave info**: HUD shows current wave, coins, lives

## Game Engine (engine.js)

The engine runs a game loop via `requestAnimationFrame`:

1. **Spawn timer**: Every N ms, spawn next enemy from the wave queue
2. **Move phase**: Each enemy advances along path by `speed × dt`
3. **Attack phase**: Each tower checks enemies in range. If cooldown is ready, fires at nearest/closest-to-end enemy
4. **Damage phase**: Projectiles hit, apply damage, check kills, award coins
5. **End check**: If enemy reaches path end → lose life. If all enemies cleared → next wave / win.

## Data Flow

```
user drags tower → engine.addTower(mapSpot, towerType)
tower placed → coins deducted

tower fires → engine.createProjectile(tower, target)
projectile hits → enemy.takeDamage(damage)
enemy.health <= 0 → coins += enemy.reward, enemy removed

enemy reaches end → lives--, enemy removed
lives <= 0 → gameOver
waves completed → win
```

## PWA / Mobile

- Works offline (already configured)
- Touch-optimized: drag-and-drop with touch events
- Portrait orientation
- 60px+ touch targets

## Localization

Same system as existing games. Keys for: tower names, UI labels (start wave, upgrade, sell, lives, coins, win, game over, stars).

## Testing

- **Unit**: Engine logic (spawn, move, shoot, damage, win/lose conditions)
- **Behavioral**: Tower placement, upgrade, sell, economy
- **E2E**: Level load, drag tower, start wave, win a level
