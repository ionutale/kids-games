# 10 — What Comes Next: Juice Wiring (SFX + Music + Accents)

**Spec:** [2026-08-23-trainers-assets-design.md](../superpowers/specs/2026-08-23-trainers-assets-design.md)

## What to build

Wire the shared assets kit into What Comes Next:

- Landing: Theme Loop; Kenney hero band; LevelBar tick + button tap sounds.
- Round: correct option keeps `playPop()` and the ❓ slot fills with `playSlotChime()` + scale-in; wrong taps stay silent.
- Win: cheer at round end; Next Level ▶ fanfare at What Comes Next's pitch shift; Kenney badge on overlay.

## Acceptance criteria

- [x] Slot fill produces chime + visual scale-in together (no desync)
- [x] Wrong options remain silent
- [x] Music + fanfare behavior identical in shape to other trainers, distinct in pitch
- [ ] Hero band + badge render from this trainer's art folder; no console errors

## Blocked by

- [trainers-02-assets-kit](trainers-02-assets-kit.md)
- [what-comes-next-01-core-game](what-comes-next-01-core-game.md)

> **Status (2026-08-23):** all audio wiring shipped with fallbacks. Open items are the Kenney art binaries (hero bands currently use emoji strips as the documented fallback) and the CC0 mp3 files — see trainers-02-assets-kit.
