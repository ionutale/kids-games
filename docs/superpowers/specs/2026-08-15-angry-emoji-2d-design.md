# Angry Emoji 2D (Angry Birds clone) — Design Spec

## Problem Statement

The hub lacks a **physics-driven puzzle game** — the genre where aiming, trajectories, and destructible environments meet. Angry Birds' slingshot loop is the gold standard: one finger, drag back, release, watch blocks topple. Kids understand it instantly, and the physics destruction is intrinsically satisfying. A 20-level campaign with star ratings gives it the replay structure the hub's other games lack.

## Solution

A slingshot physics game: the player drags emoji projectiles back from a slingshot and releases to launch them on a parabolic arc (with a dotted aim-line preview) into towers of destructible blocks (wood/ice/stone) that collapse under emoji targets. 20 hand-crafted levels in 4 tiers of 5; 1–3 stars per level based on score; best stars persisted per level.

The physics core is the validated AABB-only engine from the destructible-towers prototype (branch `prototype/angry-emoji-towers`, commit 5fc2e89) — no rotation, hand-rolled, zero dependencies.

## User Stories

1. As a child, I want to drag an emoji back on the slingshot and release to launch it, so that aiming feels natural.
2. As a child, I want a dotted aim-line showing where the emoji will go, so that I can aim without guessing.
3. As a child, I want to knock down block towers, so that destruction is the reward.
4. As a child, I want targets to be destroyed by falling blocks and direct hits, so that physics thinking pays off.
5. As a child, I want different projectiles for different jobs, so that level design has variety.
6. As a child, I want stars per level based on how well I played, so that replaying is motivated.
7. As a child, I want my best stars saved per level, so that I can return and improve.
8. As a child, I want a clear replay prompt when I run out of shots, so that I can try again.
9. As a child, I want levels to unlock as I complete them, so that progress feels linear and fair.

## Implementation Decisions

### Physics (from the validated prototype)
- **AABB-only** collision, no rotation — accepted in prototype review ("LGTM")
- 4 fixed substeps per frame (no tunneling at max launch speed 1750px/s)
- Positional correction with 0.5px slop (0px jitter on stacked towers)
- Impulse resolution with restitution + **Coulomb friction** (required — prevents impacted walls sliding forever)
- Kinetic-energy impact damage: `speed² × impactor mass × 0.001`, 150px/s threshold (resting contact never damages)
- Performance: ~0.1ms/step at 100+ bodies — comfortably 60fps on mid-range tablets
- Engine is a pure, liftable module (`PHYS` — createWorld/addBody/step) to be reused from the prototype as the game's physics core

### Materials (from the prototype)
| Material | Density | HP | Restitution | Friction | Kid look |
|---|---|---|---|---|---|
| Wood | 1.0 | 60 | 0.05 | 0.5 | Logs |
| Ice | 0.8 | 25 | 0.10 | 0.05 | Icicles |
| Stone | 1.6 | 240 | 0.00 | 0.7 | Boulders |

- Damage crack overlay at ≤40% HP

### Shapes: cubes, planks, columns
- Blocks are axis-aligned boxes in three shapes: **cube** (46×46), horizontal **plank**
  (92×23), vertical **column** (23×92)
- **Thickness-scaled HP**: a block's HP = material base × (min(w,h) ÷ 46) — planks and
  columns are roughly half as tough as a cube of the same material ("thin breaks easy")
- Mass stays area-based (`density × w × h ÷ 1600`), so planks hit as hard as cubes
- Thin shapes render as pure material color with grain shading along the long axis
  (no emoji fits them); cubes keep the emoji face

### Destruction juice
- Silent emoji particle bursts when blocks/targets break (wood splinters, ice shards,
  stone chips, 💥⭐ on targets) and 💨 dust puffs on heavy non-breaking impacts
- Purely visual: hard cap of ~40 live particles, ~0.6s lifetime, no sound added

### Launch & Aim
- **Slingshot drag**: press the slingshot, drag back, release to launch (touch-native, one finger)
- **Always-on dotted aim-line** showing the trajectory to the first bounce point
- Max launch speed 1750px/s; power scales with drag distance
- Releases shorter than ~30px are accidental taps and are cancelled silently
- Releases aimed **behind the slingshot** (launch velocity pointing away from the towers)
  are also cancelled silently — the bird returns to its perch and **no ammo is spent**
  (mirrors AB blocking behind-the-sling aim)
- Projectile spawns as a circle (rendered emoji), collides as an AABB

### Emoji Cast
| Role | Emoji | Behavior |
|---|---|---|
| Projectile (default) | 😡 | Balanced, breaks wood/ice |
| Projectile (heavy) | 🐦🔥 | Higher density — breaks stone |
| Projectile (bouncy) | 🧱 | High restitution — good for knock-downs |
| Target (basic) | 😠 | Destroyed by one solid hit |
| Target (tough) | 🤬 | Takes 2 hits |
| Target (boss) | 👿 | Shielded, most resilient |

- Rest state: neutral face. Hit state: cracked face + circling stars (until destroyed)

### Scoring & Stars
- Points: **+10 per target destroyed, +5 per block knocked out, +25 per unused shot** at level end
- A living target knocked off-world counts as destroyed and pays through the same
  broken-accounting path (points, popup, sound) — it can never vanish silently
- Star thresholds (vs. level max score = all targets + all blocks + all shots unused):
  - 1★: ≥1 target destroyed
  - 2★: ≥60% of max score
  - 3★: ≥90% of max score
- Best stars per level persisted to localStorage (`angry-emoji-levels`)
- Winning **level 20** shows an "all levels complete 🎉" badge instead of a Next Level
  button (which would otherwise silently replay level 20)

### Ammo & Failure
- Ammo varies per level: tier 4 → 3; tiers 2–3 → 2; tier 1 → 1 on level 1, else 2
- When ammo runs out: level ends, remaining targets shown, **replay prompt appears**
- Unused shots are paid out at end (+25 each) and are baked into the level's max score,
  so finishing with birds in hand is what pushes a clear into the 2★/3★ bands

### Level Structure (20 levels, 4 tiers × 5)
| Tier | Description | Birds | Materials |
|---|---|---|---|
| 1 | Hand-crafted shelters (houses, pyramids, bridges) | 1 | No stone |
| 2 | Mixed wood + ice forts | 2 | Wood + ice |
| 3 | Stone bunkers, tough targets, one TNT crate | 2 | Stone included |
| 4 | Multi-tower compounds, patrol blocks, two TNT crates, boss on 18–20 | 3 | All materials |

- Every layout is hand-crafted (no procedural drift): each level has a distinct
  silhouette and an intended solution shape (collapse the roof, snap the column,
  chain the TNT)
- Tiers unlock sequentially: completing a level unlocks the next; completing all 5 in a tier unlocks the next tier
- Level data as static config arrays (`src/lib/angry-emoji/levels.js`); a unit test
  builds every level and asserts nothing breaks or drifts at spawn

### Sounds (positive-only, WebAudio tones via `$lib/sounds/audioManager.js`)
| Event | Sound |
|---|---|
| Launch | Whoosh |
| Block break | Material crack/pop (wood/ice/stone/TNT flavours) |
| Heavy non-breaking impact | Thud (throttled) |
| Target destroyed | Happy pop |
| Level complete with ≥2 stars | Fanfare (any <2★ win gets the ascending chime) |
| Miss / failed level / cancelled shot | Silence (no punitive sounds) |

Note: the fanfare fires on any ≥2★ win (not strictly new-best stars); confetti still
requires a ≥2★ win or a new personal best.

### Architecture
- `src/lib/angry-emoji/phys.js` — the validated physics engine (lifted from the prototype)
- `src/lib/angry-emoji/levels.js` — 20 level definitions (tower layouts, emoji placements, ammo)
- `src/lib/angry-emoji/score.js` — points/star-threshold logic (pure functions)
- UI: `src/routes/games/angry-emoji/+page.svelte` (Svelte 5 runes), `+page.js` with prerender=false, ssr=false
- Rendering: DOM/CSS positioned elements, emoji + SVG mix, `requestAnimationFrame` game loop

### States
- `aiming` — slingshot armed, drag active, aim-line shown
- `flying` — projectile in flight (physics stepping)
- `settling` — blocks coming to rest, waiting for stability
- `levelEnd` — targets destroyed or ammo exhausted; stars shown
- `paused` — overlay (auto-pause on tab blur)
- `levelSelect` — tier map with per-level stars

## Testing Decisions

### Unit tests (`tests/unit/angry-emoji.test.js`)
- Physics engine: stack stability (0 jitter), no tunneling at 1750px/s, material damage thresholds, friction stops sliding
- Scoring: +10/+5/+25 math, star thresholds (1★/2★/3★)
- Level data: 20 levels, valid ammo counts, no stone in tier 1
- Projectile behaviors: heavy breaks stone, bouncy restitution

### Behavioral tests (`tests/behavioral/angry-emoji.test.js`)
- Full level simulation: launch → flight → impact → tower collapse → target destroyed → score → stars
- Ammo exhaustion flow: remaining targets shown, replay prompt
- Shielded boss requires correct projectiles

### E2E tests (`tests/e2e/angry-emoji.test.js`)
- Level select shows 20 levels, locked tiers
- Slingshot drag launches a projectile (aim-line visible)
- A scripted shot destroys a target and awards stars
- Best stars persist across reloads

## Out of Scope

- No level editor
- No rotation physics (validated AABB-only as v1)
- No trajectory preview toggle (always on)
- No hub-wide leaderboard (per-level stars only)
- No score multiplier by difficulty (no difficulty selector — tiers carry difficulty)
- No in-progress resume — levels replay fresh
