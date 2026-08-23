# Trainers Assets & FX — Design

**Date:** 2026-08-23
**Status:** Approved scope (grill-with-docs session)
**Applies to:** All 4 Brain Trainers (Focus Tap, Quick Count, Speed Match, What Comes Next) + shared WinOverlay
**Companion docs:** [free-assets.md](../../free-assets.md) · game specs dated 2026-08-23

## Concept

Give the 4 trainers a full "juice" layer — sound effects, music, decorative art, and visual feedback — without breaking the repo's Positive-Only Audio rule or the emoji-first art direction. Hybrid audio (synth micro-events + a few CC0 mp3 stings), per-trainer music loops, CSS-only visual effects, and light Kenney CC0 sprite accents.

## Audio Architecture (Hybrid)

### 1. Synth micro-events — `src/lib/sounds/trainerSounds.js`

Web Audio oscillator-based exports following the `audioManager.js` pattern. Every export accepts an optional pitch/detune multiplier so one sound can vary per event or per game.

| Export | Used by | Character |
|---|---|---|
| `playLevelTick()` | LevelBar value change (all landings) | soft short tick |
| `playFlashWhoosh()` | Quick Count flash start | airy noise sweep |
| `playReadyTick()` | Quick Count get-ready beat | double soft tick |
| `playAdvancePop()` | Speed Match card answered correctly | pop with upward blip |
| `playSlotChime()` | What Comes Next ❓ slot fills | two-note chime |
| `playSparkle()` | Focus Tap forced-target spawn | high shimmer arpeggio |

Silence rules from the game specs are binding: **wobble is always silent; Speed Match window expiry is always silent.**

### 2. MP3 stings — `static/sounds/`

CC0 only (prefer-CC0 repo rule). Added to `static/sounds/` first; build copies to `public/`.

| File | Event | Notes |
|---|---|---|
| `fanfare.mp3` | Next Level ▶ press (all trainers) | shared level-up sting; played at per-game playbackRate/pitch shift for subtle identity |

Round-end celebration keeps the existing `kids-cheer.mp3`. Known gap fix included: ensure `public/sounds/kids-cheer.mp3` exists at runtime (see free-assets.md).

### 3. Music — 4 Theme Loops

One seamless loop per trainer: `static/sounds/music/focus-tap.mp3`, `quick-count.mp3`, `speed-match.mp3`, `what-comes-next.mp3`.

| Property | Value |
|---|---|
| Source | CC0-first: kenney.nl audio packs → pixabay.com/music fallback |
| Duration | 15–30 s seamless loop |
| Size budget | ≤ 400 KB each (mp3 ~128 kbps mono acceptable) |
| Playback | HTMLAudioElement `loop = true`, volume ≈ 0.2, no ducking in v1 |
| Control | Existing SoundToggle mutes everything; **no separate music toggle** |
| Scope | Plays on its trainer's landing + play routes; stops on route leave; never auto-crosses into other games |

Loader lives beside the trainer kit (`src/lib/sounds/trainerMusic.js`), SSR-safe, reuses the settings store guard.

## Full SFX Map (event → sound)

| Game | Event | Sound |
|---|---|---|
| All | LevelBar change | `playLevelTick()` |
| All | Button taps | existing `playTap()` |
| All | Round end | existing cheer |
| All | Next Level ▶ | `fanfare.mp3` (pitch-shifted per game) |
| Focus Tap | Catch | existing `playPop()` |
| Focus Tap | Forced-target spawn | `playSparkle()` |
| Quick Count | Get-ready beat | `playReadyTick()` |
| Quick Count | Flash start | `playFlashWhoosh()` |
| Quick Count | Correct pill | existing `playPop()` |
| Speed Match | Card correct | `playAdvancePop()` |
| What Comes Next | Slot fill | `playSlotChime()` |
| What Comes Next | Prompt correct | existing `playPop()` |
| *any* | Wrong tap / wobble / expiry | **silence (binding spec constraint)** |

## Visual Effects (CSS-only)

No canvas, no motion libraries. A small shared stylesheet of keyframe utilities (`src/lib/trainers/fx.css`):

- `.fx-pop` — scale bounce for catches/correct answers
- `.fx-wobble` — the silent wrong-tap wobble (~300 ms translateX shake)
- `.fx-confetti` — celebration confetti burst (absolutely-positioned spans, staggered keyframes)
- `.fx-drain` — Speed Match window bar drain (width transition tied to remaining ms)

Animations are **always on** (no prefers-reduced-motion gating in v1).

## Art Direction (Emoji + Kenney Accents)

- Emojis remain the primary art everywhere.
- Kenney CC0 sprite accents appear in exactly two places:
  1. **Landing hero band** — a themed decorative strip (clouds/stars/shapes) above the LevelBar on each trainer's landing page.
  2. **Win overlay badge** — a celebratory badge/frame inside WinOverlay.
- Play areas stay visually clean (focus tasks).
- Assets stored under `static/art/trainers/{trainer}/…`; sourced from kenney.nl CC0 packs; resized/optimized (SVG preferred, PNG ≤ 50 KB each otherwise).

## Shared WinOverlay Upgrade

The existing shared `WinOverlay.svelte` is upgraded once — all repo games benefit:

- Optional `badge` slot (Kenney accent or emoji).
- Built-in confetti burst on open (`fx-confetti`), configurable off.
- No breaking API changes to current call sites.

## Glossary Terms (added to CONTEXT.md under Brain Trainers)

**Trainer SFX Set**, **Theme Loop**, **Fanfare Sting**, **Accent Sprites**.

## Testing

- Vitest: trainerSounds exports exist and no-op safely without user gesture/AudioContext; trainerMusic loader respects muted setting and cleans up on stop.
- Playwright (folded into each trainer's e2e): win overlay shows confetti container; no console errors from missing assets.
- Manual QA checklist per trainer: music loops seamlessly, SoundToggle kills everything mid-loop, fanfare pitch differs per game.

## Out of Scope (v1)

Separate music toggle, ducking/duck-under-cheer, reduced-motion support, custom SVG illustration sets, canvas particle engine, adaptive music (tempo by level).
