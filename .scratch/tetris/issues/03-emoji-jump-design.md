# 03 — Emoji Jump Design

Type: grilling
Status: resolved
Blocked by:

## Question

What are the exact design details for emoji-jump?

- Platform generation: how are platforms placed as the player climbs (column-of-play drift, gap sizes, min/max heights)? What spacing feels fair at the top of the endless ramp vs. the start?
- Platform types and frequency: static, moving, breakable — what mix per altitude band? Springs — how often, and how much bounce (multiplier vs. a normal jump)?
- Enemies: which ones, how many, where do they appear (every N altitude units)? What happens on contact — death straight to game over, or a bounce-off-miss penalty?
- Power-ups: jetpack and shield — how rare, how long do they last, how do they visually read on the emoji character?
- Scoring: score = height climbed — any bonus points for springs, enemies dodged, or power-up usage? Best height persistence in localStorage.
- Ramp curve: exact gravity and platform-density values per altitude band so the climb gets harder but never feels impossible for a kid.
- The emoji protagonist: which emoji, how does it animate during a jump (rotate, squash)?

Resolves the fog: platform generation rules, enemy & power-up catalog, scoring/best-height specifics, ramp curve.

## Answer

Settled in grilling session (all recommendations accepted):

- **Platform generation**: platforms spawn ahead of the player with vertical gaps 1.5–3.5× jump height, horizontal jitter from the climb column; guaranteed reachable paths at every altitude.
- **Platform mix**: altitude-based — static ~70% early; moving/breakable appear mid-altitude; mix tightens as height grows.
- **Springs**: ≤5% of platforms, bounce = 2.5× normal jump, spring emoji compresses on contact.
- **Enemies**: one type (👾) drifting horizontally on some platforms, from mid-altitude; contact = death.
- **Power-ups**: jetpack (fly up ~150m, 5s) + shield (survive one enemy hit); ≤3% of platforms each, from mid-altitude; float above platforms, collect by touching.
- **Scoring**: height climbed in meters +50 per spring bounce. No dodge bonus, no death penalty. Best height saved to localStorage. Difficulty ramps per altitude band.
- **Altitude bands**: 0–150m static-only, no springs; 150–400m moving/breakable/springs appear; 400m+ enemies + power-ups spawn, platform density maxes.
- **Protagonist**: fixed emoji (😀) with squash-and-stretch, slight tilt while moving; falls off-screen → game over.
