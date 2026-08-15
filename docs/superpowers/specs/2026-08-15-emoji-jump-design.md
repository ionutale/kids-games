# Emoji Jump (Doodle Jump clone) — Design Spec

## Problem Statement

The hub has reflex, memory, and puzzle games, but no **endless vertical climber** — the genre where the score IS the distance climbed. Doodle Jump's one-mechanic loop (bounce upward, steer left/right) is perfect for touch devices and needs no language, which fits the hub's young multilingual audience. A full-featured version (platform types, springs, enemies, power-ups) gives the depth older kids crave while the endless ramp stays forgiving for beginners.

## Solution

An endless vertical climber: the player's emoji (😀) bounces automatically off platforms while the player steers left/right with touch buttons. Score = height climbed in meters (+ spring bonuses). Platform density and variety ramp up across three altitude bands. Falling off the bottom of the screen ends the run; the best height is saved to localStorage.

## User Stories

1. As a child, I want to steer my emoji left/right with big press-and-hold buttons, so that I can climb without precision taps.
2. As a child, I want to bounce automatically off platforms, so that the core loop is effortless.
3. As a child, I want my score to climb with my height, so that I feel progress instantly.
4. As a child, I want springs to launch me higher, so that the climb has surprises.
5. As a child, I want to dodge enemies, so that there's tension.
6. As a child, I want power-ups (jetpack, shield) to collect, so that I feel powerful.
7. As a child, I want a fair climb — platforms always reachable — so that I never die to an impossible gap.
8. As a child, I want my best height saved, so that I can beat my own record.
9. As a child, I want a gentle game-over screen with a tap-to-restart, so that trying again is effortless.

## Implementation Decisions

### Core Mechanics
- **Vertical climber**: world scrolls up as the player climbs; falling below the screen bottom = game over
- **Bounce**: landing on a platform from above bounces the emoji up; landing at an angle steers along the platform edge
- **Score**: height climbed in meters, +50 per spring bounce. No dodge bonus, no death penalty
- **Best height** persisted to localStorage (`emoji-jump-best`), shown on the game-over overlay

### Controls (touch-first)
- Press-and-hold left/right buttons (large, thumb-reachable) — matching the charting decision of touch buttons over tilt
- Keyboard optional: ←/→ arrows
- Single-touch lock: only one touch registered during steering

### Protagonist
- Fixed emoji 😀 with squash-and-stretch on landing/bounce, slight tilt while moving horizontally
- Falls off-screen below → game over

### Platform Generation
- Platforms spawn ahead of the player with vertical gaps of **1.5–3.5× jump height**
- Horizontal jitter around the climb column keeps the path reachable
- **Guaranteed reachable path at every altitude** (no impossible gaps — fairness for kids)

### Platform Types & Altitude Bands
| Band | Height | Content |
|---|---|---|
| Start | 0–150m | Static platforms only (~70% density of max), no springs |
| Mid | 150–400m | Moving + breakable platforms appear, springs appear |
| Deep | 400m+ | Platform density maxes; enemies + power-ups spawn |

- Mix at mid/deep: static ~70%, moving ~15%, breakable ~15% (tightening as height grows)
- Moving platforms drift horizontally; breakable platforms collapse one bounce after landing
- Springs: ≤5% of platforms, bounce = **2.5× a normal jump**, rendered as a spring emoji that compresses on contact

### Enemies
- One type: 👾 drifting horizontally on some platforms
- Appear from mid-altitude onward: none for the first 200m, then roughly every ~60m
- Contact = death (run over)

### Power-ups
- **Jetpack**: fly up ~150m over 5s
- **Shield**: survives one enemy hit
- Each spawns on ≤3% of platforms from mid-altitude; floats above platforms; collected by touching

### Sounds (positive-only, WebAudio tones via `$lib/sounds/audioManager.js`)
| Event | Sound |
|---|---|
| Bounce/land | Soft pop |
| Spring bounce | Boing |
| Power-up pickup | Bright chime |
| Enemy dodge | Silent (no punitive sounds) |
| Game over | Silent |
| New best height | Fanfare |

### Architecture
- Logic module: `src/lib/emoji-jump/engine.js` — pure functions (platform generation, jump physics, band progression, score/height)
- UI: `src/routes/games/emoji-jump/+page.svelte` (Svelte 5 runes), `+page.js` with prerender=false, ssr=false
- Rendering: DOM/CSS positioned elements + emoji/SVG mix (no canvas — matches hub conventions)
- Game loop: `requestAnimationFrame` with fixed-timestep physics

### States
- `playing` — climbing, steering active
- `paused` — overlay (auto-pause on tab blur, matching hub conventions)
- `gameOver` — overlay with height + best height, tap to restart

## Testing Decisions

### Unit tests (`tests/unit/emoji-jump.test.js`)
- Platform generation: gaps within 1.5–3.5× jump height, reachability guarantee holds at all altitudes
- Physics: jump velocity, gravity, bounce height multiplier (spring 2.5×)
- Band progression: which elements appear at 0–150 / 150–400 / 400+ meters
- Score: height in meters, +50 per spring, no dodge bonus
- Power-ups: jetpack flight, shield absorbs one hit

### Behavioral tests (`tests/behavioral/emoji-jump.test.js`)
- Full run simulation: spawn → bounce → steer → spring → enemy contact → power-up → death
- Fairness property: generated platform columns are always reachable

### E2E tests (`tests/e2e/emoji-jump.test.js`)
- Page loads with the emoji on a platform and steering buttons visible
- Pressing left/right moves the emoji horizontally
- Falling below the screen shows the game-over overlay
- Best height persists across reloads

## Out of Scope

- No tilt steering (touch buttons per the charting decision)
- No score bonus for dodging enemies (dodging is its own reward)
- No in-progress resume — fresh run every time, only best height persists
- No difficulty selector (endless ramp is the single mode)
- No level-based structure (endless by design)
