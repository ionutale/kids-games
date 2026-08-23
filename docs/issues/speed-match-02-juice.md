# 09 — Speed Match: Juice Wiring (SFX + Music + Accents)

**Spec:** [2026-08-23-trainers-assets-design.md](../superpowers/specs/2026-08-23-trainers-assets-design.md)

## What to build

Wire the shared assets kit into Speed Match:

- Landing: Theme Loop; Kenney hero band; LevelBar tick + button tap sounds.
- Round: card answered correctly plays `playAdvancePop()`; wrong taps stay silent; window expiry stays silent — only the `.fx-drain` bar communicates tempo.
- Win: cheer when deck completes; Next Level ▶ fanfare at Speed Match's pitch shift; Kenney badge on overlay.

## Acceptance criteria

- [ ] Correct answers pop with upward blip and advance immediately
- [ ] Wrong taps AND window expiries are 100% silent (spot-check with sound on)
- [ ] Drain bar animation duration tracks `levelConfig` window exactly at L1/L10
- [ ] Music + fanfare behavior identical in shape to other trainers, distinct in pitch
- [ ] Hero band + badge render from this trainer's art folder; no console errors

## Blocked by

- [trainers-02-assets-kit](trainers-02-assets-kit.md)
- [speed-match-01-core-game](speed-match-01-core-game.md)
