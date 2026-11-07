# PRD — Focus Tap: the Pond Catch

- **Date:** 2026-11-07
- **Decision:** prototype winner A on `prototype/focus-tap` (`8c2d47a9`, refined `2335fc6d`)
- **Baseline:** the rising emoji trainer with a text target

## Problem Statement

Focus Tap has a good engine — target, distractors, tiers, spawns, goals, no fail — inside a void. Emoji rise through the starry background with no character, no place, and the target announced as text plus an emoji. Progress is a caught/goal number, and a catch is a small star burst. For 3–5 year-olds the game works, but it does not feel like anything: there is nobody to help, nowhere to be, and nothing to collect.

## Solution

A moonlit pond with a frog on a lily pad holding the target sign. The child helps the frog catch the target emoji from the rising stream; the frog's tongue flicks out, the target pops, and a firefly lands in a jar. The target is shown on the sign and repeated in the HUD; the jar replaces numbers. Distractors wobble silently. The existing tiers, spawns, goal (6 + level, capped at 20), landing and ladder stay. There is no timer and no fail.

## User Stories

1. As a 3-year-old, I want to see a frog, so that I know who I am helping.
2. As a 3-year-old, I want the frog to hold the target, so that I know what to catch without reading.
3. As a 3-year-old, I want to tap the right emoji, so that the frog catches it.
4. As a 3-year-old, I want to see the frog's tongue, so that the catch feels like the frog did it.
5. As a 3-year-old, I want a firefly to land in the jar, so that I can see my collection.
6. As a 3-year-old, I want the pond to be calm and pretty, so that the game feels like a place.
7. As a 3-year-old, I want wrong taps to be gentle, so that mistakes are not scary.
8. As a 4-year-old, I want the jar to fill up, so that I know when the round ends.
9. As a 4-year-old, I want more lookalike emojis as I level up, so that I have to focus.
10. As a 4-year-old, I want the frog to croak on a catch, so that success is audible.
11. As a 4-year-old, I want a sparkle at the catch, so that the target pops.
12. As a 5-year-old, I want the stream to keep moving, so that the game stays lively.
13. As a 5-year-old, I want later levels to need more catches, so that the round grows.
14. As a 5-year-old, I want the jar to be the only progress, so that there are no numbers to read.
15. As a parent, I want no timer and no fail, so that my child can take their time.
16. As a parent, I want the target to be visible on the frog, so that I do not have to explain the rules.
17. As a parent, I want the trainer music to keep playing, so that the game still feels like the trainer they know.
18. As a parent, I want quiet catch and fill sounds, so that the game is not noisy.
19. As a parent, I want the sound to respect the app toggle, so that I can mute it.
20. As a parent, I want the pond to fit a small phone in portrait, so that it is usable.
21. As a parent, I want reduced motion respected, so that the pond stays calm.
22. As a parent, I want the shared landing and ladder unchanged, so that the other trainers still work.
23. As a returning child, I want to pick any level from the ladder, so that I can replay a favourite.
24. As a returning child, I want the same frog and jar, so that the world is familiar.
25. As a designer, I want the existing target/distractor engine reused, so that the tiers stay trustworthy.
26. As a designer, I want the jar to count catches, so that the goal is unambiguous.
27. As a designer, I want the tongue to use the tapped element's position, so that it always lands on the target.
28. As a designer, I want the frog and jar to sit at the bottom corners, so that the stream remains clear.
29. As a designer, I want the lookalike tier to stay, so that focus-tap remains a brain trainer.
30. As a designer, I want the landing to stay untouched, so that the prototype is route-local.

## Implementation Decisions

- **Scene.** A portrait moonlit pond: moon, ripples, lily pads, reeds, fireflies. The stream fills the middle. No visible grid.
- **Cast.** A frog on a lily pad at the bottom-left holding a wooden Target Sign with the target emoji. A Firefly Jar at the bottom-right. Both are SVG; no emoji characters.
- **Stream.** Reuse `makeRoundState`, `nextSpawn`, `levelConfig` and the existing spawn/rise maths. Items rise from the bottom; x in the safe band; six on screen max.
- **Catch.** Tap a target. The frog's tongue animates from its mouth to the tapped element; a sparkle bursts at the point; the target pops; a firefly lights in the jar. A wrong tap wobbles the distractor and the frog is unaffected; silent.
- **Jar.** The visual goal: caught/goal fireflies, no digits. A soft fill chime when the jar reaches the goal.
- **Goal and levels.** 6 + level catches, capped at 20, from the shared config. No timer, no fail. The landing and the play route keep the level in the URL.
- **Tiers.** Keep cross-category (L1–2), same-category (L3–5) and lookalike (L6+).
- **Sound.** Keep the shared Trainer Music; add a quiet catch plop, a soft croak, and a three-note fill chime. Respect the existing setting.
- **Art.** Flat inline SVG frog, lily pads, jar, reeds, fireflies; the emoji stream stays emoji.
- **Constraints.** No new dependencies; do not edit the shared TrainerLanding, GameShell or the ladder; keep the trainer engine and the sound toggle.

## Testing Decisions

- **Test external behavior:** a target tap fills the jar, a distractor tap does not, the jar reaches the goal, the round ends, the level in the URL matches, the landing is unchanged.
- **Highest seam:** the play route DOM. Keep `data-testid="stream"`, `[data-testid="target"]`, `[data-testid="distractor"]`, the frog, the jar (with a data count), and the round card. Tests should not read Svelte state.
- **Unit:** reuse the existing `focusTap` engine tests; add jar/fill math if extracted.
- **E2E:** tap a target, tap a distractor, catch to the goal, check the jar, play the next level, 320×568 and 390×844, reduced motion, muted sound.
- **Prior art:** `tests/e2e/focus-tap.test.js` for the stream hooks and the win/next flow.

## Out of Scope

- The Search Party and Net Catch theses; they remain prototypes.
- Voice-over for the target.
- Accounts, cloud progress, or a new art pipeline.
- Edits to the shared TrainerLanding, GameShell or the ladder.
- Changing the target/distractor engine.

## Further Notes

- Prototype source: `prototype/focus-tap` (`8c2d47a9`, refined `2335fc6d`), variant A.
- The prototype plays levels 1, 4, 7 with the real goals 7, 10, 13.
- Risk: a rising stream plus a bottom-corner jar can hide falling items; keep the corner docks small and the stream x-band clear of them.
- Risk: the trainer music plus catch sounds can be noisy; the pond effects are quiet and the setting is respected.
