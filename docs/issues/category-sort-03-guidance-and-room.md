# 03 — Category Sort: Guidance and Room Dressing

## What to build

Remove the last reading requirement and furnish the empty wall. The sentence hint becomes a small caption under a pointing-hand/arrow cue. On the first round, a ghost hand demonstrates one correct placement, dismissible by any tap and remembered per device. Two-home levels get wall furniture — a shelf with a plant, a framed picture — that stays out of the drag corridor.

## Acceptance criteria

- [ ] The instruction is carried by a hand/arrow gesture, with the localized sentence kept as a caption
- [ ] The first round demonstrates one correct placement with a ghost hand
- [ ] Any tap dismisses the demonstration and leaves the board playable
- [ ] The demonstration is shown once per device and remembered
- [ ] The green Helper glow still retires after five placements of level 1
- [ ] Two-home levels no longer show a large blank wall
- [ ] Decorations are `aria-hidden`, `pointer-events: none`, and never cover the Zones or Tray
- [ ] Guidance and decorations behave under `prefers-reduced-motion`
- [ ] E2E covers the demonstration, its dismissal, and the Helper retirement

## Blocked by

None — can start immediately
