# 01 — Scoring and Speed Curve

Type: grilling
Status: resolved
Blocked by:

## Question

What are the exact tuning values for the scoring and speed curve?

- Drop interval (ms per row) for Easy, Medium, and Hard at level 1 — and the level-up curve: how does the interval shrink per level, and what's the floor?
- Lines-per-level: how many cleared lines advance the level at each difficulty?
- Scoring constants: confirm the classic 100/300/500/800 (single/double/triple/Tetris) × level multiplier, and whether line-clear bonuses scale by difficulty.
- Rotation direction: clockwise-only (tap = rotate right) or two rotate buttons (CW + CCW)?
- Soft drop and hard drop scoring: points per cell for soft drop, per-line bonus for hard drop?

Resolves the fog: exact drop speeds / lines-per-level / level-up curve.

## Answer

Settled in grilling session (all recommendations accepted):

- **Level-1 drop speeds**: Easy 1000ms / Medium 700ms / Hard 450ms per row.
- **Level-up curve**: speed shrinks ~8% per level, 100ms floor.
- **Lines per level**: 10 at all difficulties (level pace set by drop speed).
- **Rotation**: two rotate buttons — CW + CCW; tap = CW.
- **Line-clear scoring**: classic 100/300/500/800 (single/double/triple/Tetris) × level; no difficulty multiplier (difficulty affects speed only).
- **Drop bonuses**: soft drop +1 point per cell, hard drop +2 points per cell.
