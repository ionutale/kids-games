# 01 — Soccer: Night Penalty Core

- **Status:** Implemented (shipped 2026-11-09).

## What to build

Replace the green-card shooter with the Night Penalty: a night stadium, a child striker, a bear keeper, a wide net and a ball at the spot. The child swipes anywhere; a reticle and dashed trajectory show the impact; the keeper patrols and dives; five shots decide the round against the target.

## Acceptance criteria

- [x] The field renders in portrait with a stadium, crowd, wide goal, net, striker and bear keeper
- [x] The ball is placed at the penalty spot and the striker stands behind it
- [x] A swipe anywhere shows a reticle and a dashed trajectory at the impact point
- [x] The ball flies to the impact; goal, save and miss are visibly distinct
- [x] The goal/save result uses the keeper's x at release and the impact point
- [x] The swipe length only sets flight time; it never shrinks the keeper's reach or changes the result
- [x] The keeper patrols continuously and dives late at release
- [x] The far corner always has room for a goal
- [x] The open side glows softly on levels 1–2 only
- [x] Five shots are always played, shown as ball pips
- [x] The target decides the win; below it shows a calm Good Try with Try again / Back
- [x] The shared ladder and saved level/mastery are unchanged
- [x] Engine unit tests cover the adjusted goal, keeper, impact and shot result
- [x] E2E covers a goal, a save or miss, the five-shot end and the Good Try
- [x] No new dependencies; SVG art only

## Blocked by

None — can start immediately