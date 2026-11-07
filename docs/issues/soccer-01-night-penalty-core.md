# 01 — Soccer: Night Penalty Core

## What to build

Replace the green-card shooter with the Night Penalty: a night stadium, a child striker, a bear keeper, a wide net and a ball at the spot. The child swipes anywhere; a reticle and dashed trajectory show the impact; the keeper patrols and dives; five shots decide the round against the target.

## Acceptance criteria

- [ ] The field renders in portrait with a stadium, crowd, wide goal, net, striker and bear keeper
- [ ] The ball is placed at the penalty spot and the striker stands behind it
- [ ] A swipe anywhere shows a reticle and a dashed trajectory at the impact point
- [ ] The ball flies to the impact; goal, save and miss are visibly distinct
- [ ] The keeper patrols continuously and dives late at release
- [ ] The far corner always has room for a goal
- [ ] The open side glows softly on levels 1–2 only
- [ ] Five shots are always played, shown as ball pips
- [ ] The target decides the win; below it shows a calm Good Try with Try again / Back
- [ ] The shared ladder and saved level/mastery are unchanged
- [ ] Engine unit tests cover the adjusted goal, keeper, impact and shot result
- [ ] E2E covers a goal, a save or miss, the five-shot end and the Good Try
- [ ] No new dependencies; SVG art only

## Blocked by

None — can start immediately
