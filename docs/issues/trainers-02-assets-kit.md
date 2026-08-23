# 06 — Brain Trainers: Assets & FX Kit

**Spec:** [2026-08-23-trainers-assets-design.md](../superpowers/specs/2026-08-23-trainers-assets-design.md)

## What to build

The shared juice layer all four trainers import:

1. **`src/lib/sounds/trainerSounds.js`** — synth micro-events: `playLevelTick`, `playFlashWhoosh`, `playReadyTick`, `playAdvancePop`, `playSlotChime`, `playSparkle`; each accepts a pitch multiplier; SSR/gesture-safe no-ops.
2. **`src/lib/sounds/trainerMusic.js`** — Theme Loop loader: plays `static/sounds/music/{trainer}.mp3` looped at volume ≈ 0.2, respects the settings store (SoundToggle mutes all), stops on route leave, never auto-crosses games.
3. **CC0 mp3 sourcing**: `static/sounds/fanfare.mp3` + 4 music loops (Kenney.nl CC0 first, Pixabay fallback) within size budget; record provenance in free-assets.md.
4. **Fix known gap**: ensure `public/sounds/kids-cheer.mp3` is served at runtime.
5. **`src/lib/trainers/fx.css`** — keyframe utilities: `.fx-pop`, `.fx-wobble`, `.fx-confetti`, `.fx-drain`.
6. **WinOverlay upgrade**: optional badge slot + built-in confetti burst on open; no breaking API change for existing call sites.

No game wiring here — this slice is verifiable via unit tests and the upgraded WinOverlay alone.

## Acceptance criteria

- [x] All 6 synth exports fire without AudioContext errors and no-op safely server-side / pre-gesture
- [x] Music loader: loops seamlessly at ~0.2 volume; SoundToggle off ⇒ silent; navigation stops playback; same trainer's routes resume it
- [ ] `fanfare.mp3` + 4 loops present in `static/sounds/`, each ≤ 400 KB, provenance recorded in docs/free-assets.md — **code + fallbacks shipped; binaries pending manual CC0 sourcing** (kenney.nl / pixabay downloads are interactive)
- [x] `kids-cheer.mp3` resolves at runtime from the served public path
- [x] fx.css classes render wobble/pop/confetti/drain in isolation (demo in WinOverlay)
- [x] Existing games using WinOverlay unchanged behaviorally; new badge + confetti visible when configured
- [x] Vitest unit tests for sounds/loader guards + e2e check that win overlay renders confetti without console asset errors

> **Status (2026-08-23):** all code shipped with graceful fallbacks (`fanfare()` falls back to synth `playWin()`; music loader no-ops on 404). Remaining work is sourcing the CC0 binary assets — see docs/free-assets.md "Planned" table.

## Blocked by

- None — can start immediately (independent of trainers-01-kit; both are foundation slices)
