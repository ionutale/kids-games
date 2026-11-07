# 02 — Cross-game: Shared Sound and Reduced Motion

## What to build

One sound helper that owns the AudioContext, the `settings.soundEnabled` check, cue scheduling and teardown. Each game supplies only note recipes and named cues. Add one `prefers-reduced-motion` JS helper so rAF-driven motion (walkers, keepers, bubbles, tongues, scenes) can be disabled consistently; the global CSS only clamps CSS animations and transitions.

## Acceptance criteria

- [ ] One helper (extend `src/lib/sounds/audioManager.js` or add `createGameSound`) owns the AudioContext
- [ ] A game can register a palette and call named cues without touching the context
- [ ] Navigating away releases or suspends the context and cancels pending cues
- [ ] The helper is a no-op when the sound setting is off
- [ ] A shared `prefers-reduced-motion` store/helper is available to components and JS loops
- [ ] The six games use the helper instead of creating their own AudioContext
- [ ] CSS-only motion still respects the global media query
- [ ] Unit tests cover the mute path and the reduced-motion store
- [ ] No new dependencies

## Blocked by

None — do before the first juice/sound ticket. The six-game review (`2026-11-07-six-game-review.md`) is the source of the shared checklist.
