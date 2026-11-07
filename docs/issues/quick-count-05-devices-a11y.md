# 05 — Quick Count: Devices and Accessibility Gate

## What to build

Prove the Flash Picnic works on the target phones and for children who mute sound or reduce motion. Make the question, the answer pills and the basket understandable without relying on colour or digits alone.

## Acceptance criteria

- [ ] The cloth, bear, basket and pills fit 320×568 with no horizontal overflow
- [ ] The layout fits 390×844 in portrait with the pills clear of the bottom bar
- [ ] Each pill exposes its number and dot count to assistive technology
- [ ] The question and the basket progress are announced
- [ ] The bear and cloth are decorative for screen readers
- [ ] The sound toggle mutes the music and effects with no thrown errors
- [ ] Reduced motion disables the cloth glow and the berry pop
- [ ] The game remains fully playable under reduced motion
- [ ] `pnpm test`, the quick-count e2e suite and `pnpm check` are green

## Blocked by

- 03 — Flash Picnic Core
- 04 — Picnic Juice and Sound
