# 08 — Quick Count: Juice Wiring (SFX + Music + Accents)

**Spec:** [2026-08-23-trainers-assets-design.md](../superpowers/specs/2026-08-23-trainers-assets-design.md)

## What to build

Wire the shared assets kit into Quick Count:

- Landing: Theme Loop; Kenney hero band; LevelBar tick + button tap sounds.
- Round: get-ready beat plays `playReadyTick()` (~600 ms before flash); flash start plays `playFlashWhoosh()`; correct pill keeps `playPop()`; wrong pill stays silent.
- Win: cheer at round end; Next Level ▶ fanfare at Quick Count's pitch shift; Kenney badge on overlay.

## Acceptance criteria

- [ ] Ready-tick → whoosh sequence audibly cues each flash; timing matches the 600 ms beat
- [ ] Wrong pills remain silent; correct pills pop
- [ ] Music control identical to Focus Tap wiring (loop on trainer routes, SoundToggle kills all)
- [ ] Fanfare pitch differs audibly from other trainers
- [ ] Hero band + badge render from this trainer's art folder; no console errors

## Blocked by

- [trainers-02-assets-kit](trainers-02-assets-kit.md)
- [quick-count-01-core-game](quick-count-01-core-game.md)
