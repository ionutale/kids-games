# 01 — Pop: Rising Pond Core

- **Status:** Implemented (shipped 2026-11-09).

## What to build

Replace the emoji timer game with the Rising Pond: a portrait moonlit pond, rising bubbles with surprises inside, a jar that fills to the target, a moon arc for the 30-second clock, and a calm end card. Tap or swipe pops; giant and star bubbles add the two-tap and bonus layers.

## Acceptance criteria

- [x] The pond renders in portrait with lily pads, reeds and fireflies
- [x] The first tap starts the round; bubbles rise from the water
- [x] Tapping a bubble pops it; swiping pops every bubble crossed
- [x] The pop pitch rises through a chain and resets on lift
- [x] Surprise items fly into the jar and stay visible
- [x] The jar fills by points; giant and star bubbles are worth two
- [x] A giant bubble cracks on the first tap and bursts on the second
- [x] A star bubble leaves a sticker on the jar
- [x] The moon arc replaces the numeric countdown
- [x] Reaching the target wins the level with the ladder actions
- [x] Time ending short shows Good Try with Try again / Back, no star
- [x] No negative sound; escaped bubbles have no penalty
- [x] E2E covers start, tap, swipe, giant, star, win and good try
- [x] Unit tests cover target/level config and pop values
- [x] No new dependencies

## Blocked by

None — can start immediately