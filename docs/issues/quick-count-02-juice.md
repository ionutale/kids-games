# 08 — Quick Count: Juice Wiring (SFX + Music + Accents)

**Spec:** [2026-08-23-trainers-assets-design.md](../superpowers/specs/2026-08-23-trainers-assets-design.md)

## What to build

Wire the shared assets kit into Quick Count:

- Landing: Theme Loop; Kenney hero band; LevelBar tick + button tap sounds.
- Round: get-ready beat plays `playReadyTick()` (~600 ms before flash); flash start plays `playFlashWhoosh()`; correct pill keeps `playPop()`; wrong pill stays silent.
- Win: cheer at round end; Next Level ▶ fanfare at Quick Count's pitch shift; Kenney badge on overlay.

## Acceptance criteria

- [x] Ready-tick → whoosh sequence audibly cues each flash; timing matches the 600 ms beat
- [x] Wrong pills remain silent; correct pills pop
- [x] Music control identical to Focus Tap wiring (loop on trainer routes, SoundToggle kills all)
- [x] Fanfare pitch differs per game (playbackRate constants; distinct once fanfare.mp3 lands)
- [ ] Hero band + badge render from this trainer's art folder; no console errors

## Blocked by

- [trainers-02-assets-kit](trainers-02-assets-kit.md)
- [quick-count-01-core-game](quick-count-01-core-game.md)

> **Status (2026-08-23):** all audio wiring shipped with fallbacks. Open items are the Kenney art binaries (hero bands currently use emoji strips as the documented fallback) and the CC0 mp3 files — see trainers-02-assets-kit.
