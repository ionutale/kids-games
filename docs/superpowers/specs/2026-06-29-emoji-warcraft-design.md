# Emoji Warcraft — Design

## Overview

A simplified Warcraft-like RTS for mobile, using emoji for all units and buildings. Two-player skirmish: you vs AI. Build a village, gather resources, train an army, destroy the enemy Town Hall.

## Target

Mobile-first (touch controls), portrait orientation, 12×12 scrollable grid.

## Architecture

```
src/routes/games/emoji-warcraft/+page.svelte   ← main game component
src/routes/games/emoji-warcraft/+page.js       ← ssr=false, prerender=false
src/lib/emoji-warcraft/
  map.js          ← 12×12 grid, cell types, BFS pathfinding
  buildings.js    ← 6 building types, costs, production queues
  units.js        ← 4 unit types, stats, movement
  engine.js       ← game loop (tick-based), state machine, resource tracking
  ai.js           ← simple AI opponent state machine
```

No external dependencies. Grid rendered with CSS, units/buildings as positioned emoji. Game loop via `setInterval` (tick-based, not rAF — easier for AI turns).

## Map (12×12)

```js
const TILES = {
  EMPTY: 0, GOLD: 1, TREE: 2, WATER: 3,
  TOWN_HALL_P1: 10, TOWN_HALL_P2: 11,
};
```

- Player 1 starts bottom-left (col 1–3, row 10–11)
- Player 2 starts top-right (col 8–10, row 0–1)
- Gold mines and trees scattered in clusters around the map
- A water patch in the center dividing the map

## Buildings (6 types)

| Emoji | Name | Cost | HP | Purpose |
|-------|------|------|----|---------|
| 🏰 | Town Hall | — | 500 | Produces peasants, stores resources |
| ⚔️ | Barracks | 100g+50w | 200 | Trains soldiers & archers |
| 🌾 | Farm | 50g | 100 | +5 population cap |
| 🗼 | Tower | 75g+25w | 150 | Auto-attacks enemies in range (2 cells) |
| 🪵 | Lumber Mill | 60g | 100 | +50% wood gather rate |
| ⛏️ | Gold Mine | 80g | — | Placed on gold vein, auto-produces gold |

Building placement: drag from build menu to valid non-path cell on the map.

## Units (4 types)

| Emoji | Name | Cost | HP | ATK | Speed | Role |
|-------|------|------|----|-----|-------|------|
| 👷 | Peasant | 50g | 30 | — | 1 cell/s | Gathers, builds |
| 🗡️ | Soldier | 75g+25w | 60 | 10 | 1 cell/s | Melee fighter |
| 🏹 | Archer | 100g+50w | 40 | 8 | 1 cell/s | Ranged (2 cells) |
| 🐴 | Knight | 150g+75w | 80 | 15 | 2 cell/s | Fast cavalry |

Units move via BFS pathfinding along non-building/non-water cells. Selected by tapping. Move by tapping ground. Attack by tapping enemy.

## Mobile Controls

- **Tap unit/building** → select, show action panel at bottom
- **Tap empty cell** → move selected units there (pathfinding)
- **Tap enemy unit/building** → attack
- **Drag on map** → pan viewport (12×12 > screen)
- **Bottom action panel** shows context-dependent buttons (Build, Train, Move, Attack)
- **Top HUD**: Gold / Wood / Population / Score
- **Building menu**: appears when selecting Peasant or empty valid cell

## Resources

- **Gold**: Gather from Gold Mine (building on vein) or gold deposit. Peasant gathers 5g/trip
- **Wood**: Gather from trees. Peasant gathers 3w/trip
- **Population**: starts at 5, +5 per Farm. Max 25

## Win / Lose

- **Win**: Destroy enemy Town Hall
- **Lose**: Your Town Hall is destroyed
- Optionally: surrender button after 2 minutes

## Game Loop

Tick-based (every 200ms):

1. **Player input** → handled via event listeners
2. **Unit movement** → move each selected unit 1 cell toward its target
3. **Combat** → units in range of enemies auto-attack
4. **Towers** → auto-attack nearest enemy in range
5. **Production** → building queues progress, peasants return resources
6. **AI turn** → AI evaluates state, makes decisions
7. **Win check** → town hall HP ≤ 0?

## AI (Simple State Machine)

Phases:
1. **EARLY**: Gather 200g + 50w → build Farm + Barracks
2. **BUILD**: Queue 3 Soldiers + 1 Archer
3. **ATTACK**: Send all military units toward player base
4. **REBUILD**: If attack force wiped, gather more, rebuild, attack again
5. **Each wave**: slightly larger (adds Knights at later levels)

AI difficulty scales with level:
- Level 1: starts at 100g, 1× gather speed, attacks at 3 units
- Level 5: starts at 300g, 2× gather speed, attacks at 6 units

## Levels

5 levels with increasing AI difficulty:
- Level 1: Tutorial — AI barely builds, easy win
- Level 2: AI builds 2 Soldiers
- Level 3: AI builds 3 Soldiers + 1 Archer
- Level 4: AI builds 4 Soldiers + 2 Archers
- Level 5: AI builds 6 Soldiers + 2 Archers + 1 Knight

## Mobile Responsiveness

- Map viewport fills screen width, scrolls with touch drag
- Buttons are minimum 60×60px
- Action panel slides up from bottom
- Building drag: tap building type in menu → tap map to place

## Testing

- **Unit**: resource tracking, building costs, unit combat stats, AI phase transitions
- **Behavioral**: pathfinding, gathering cycles, production queues
- **E2E**: load game, build a building, train a unit, attack an enemy
