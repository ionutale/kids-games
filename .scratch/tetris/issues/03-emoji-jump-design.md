# 03 — Emoji Jump Design

Type: grilling
Status: open
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
