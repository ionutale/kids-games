# 07 — Focus Tap: Juice Wiring (SFX + Music + Accents)

**Spec:** [2026-08-23-trainers-assets-design.md](../superpowers/specs/2026-08-23-trainers-assets-design.md)

## What to build

Wire the shared assets kit into Focus Tap:

- Landing: Theme Loop starts; Kenney hero band above the LevelBar; LevelBar changes play `playLevelTick()`; buttons keep `playTap()`.
- Round: forced-target spawns play `playSparkle()`; catches keep `playPop()` with slight pitch variation per catch; wobble stays silent (binding).
- Win: cheer at round end; pressing Next Level ▶ plays `fanfare.mp3` at Focus Tap's pitch shift before navigating.
- WinOverlay configured with its Kenney badge.

## Acceptance criteria

- [x] Music plays on landing + play routes of this trainer only; SoundToggle kills it instantly mid-loop
- [x] Forced-target sparkle audible; distractor taps remain 100% silent
- [x] Catch pops vary pitch slightly (not identical every time)
- [x] Next Level ▶ produces fanfare → route change; Replay/Back produce no fanfare
- [ ] Hero band renders from `static/art/trainers/focus-tap/`; no layout regression on mobile widths
- [x] No console errors; all assets within size budget

## Blocked by

- [trainers-02-assets-kit](trainers-02-assets-kit.md)
- [focus-tap-01-core-game](focus-tap-01-core-game.md)

> **Status (2026-08-23):** all audio wiring shipped with fallbacks. Open items are the Kenney art binaries (hero bands currently use emoji strips as the documented fallback) and the CC0 mp3 files — see trainers-02-assets-kit.
