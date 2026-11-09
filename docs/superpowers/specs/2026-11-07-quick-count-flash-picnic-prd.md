# PRD — Quick Count: the Flash Picnic

- **Date:** 2026-11-07
- **Status:** Implemented (shipped 2026-11-09).
- **Decision:** prototype winner A on `prototype/quick-count` (`772fa5ee`, refined `a7e4cff8`)
- **Baseline:** the abstract flash trainer with a starry panel

## Problem Statement

Quick Count has a sound subitizing loop — a brief flash, then three number pills — but it lives in a void. The objects are distinct emoji from a random category, the panel is glass on a starry background, and progress is a solved/goal number. Worse, the level config asks for up to 20 objects while the distinct category pool caps the real count near eight, so the top of the ladder never gets as large as it claims. For 3–5 year-olds there is no reason to count, no character to help, and no collection to fill.

## Solution

A bear picnic. The bear asks “How many?”; a brief flash of one themed object (berries, eggs, cookies, apples) appears on a checkered cloth; then three number pills show the digit and that many theme dots. A correct answer adds a berry to a basket. The object repeats, so counts can grow past eight. The existing flash timing, goal (5 + min(level, 10)) and landing stay. There is no timer and no fail.

## User Stories

1. As a 3-year-old, I want to see a bear, so that I know who is asking.
2. As a 3-year-old, I want the bear to say “How many?”, so that I understand the question.
3. As a 3-year-old, I want to see objects on a picnic cloth, so that counting feels like a game.
4. As a 3-year-old, I want to count the same kind of object, so that I am not distracted by mixed shapes.
5. As a 3-year-old, I want the objects to be big and clear, so that I can see each one.
6. As a 3-year-old, I want a short, calm flash, so that I am not overwhelmed.
7. As a 3-year-old, I want a soft tick for each object on the first levels, so that I can follow the count.
8. As a 3-year-old, I want three big answer buttons, so that I can tap the number.
9. As a 3-year-old, I want each answer to show dots, so that I can recognise the number without reading it.
10. As a 3-year-old, I want a berry to land in the basket, so that I can see my progress.
11. As a 4-year-old, I want wrong answers to wobble gently, so that mistakes are not scary.
12. As a 4-year-old, I want the counts to grow, so that the game stays interesting.
13. As a 4-year-old, I want the flash to get briefer, so that I get faster at recognising.
14. As a 4-year-old, I want different picnic objects, so that the game does not look the same.
15. As a 5-year-old, I want larger counts up to ten, so that I can practise bigger numbers.
16. As a 5-year-old, I want the answer dots to match the objects, so that I can verify my choice.
17. As a parent, I want no timer and no fail, so that my child can take their time.
18. As a parent, I want the answer options to be visual, so that a pre-reader can play.
19. As a parent, I want the bear and picnic to be cozy, so that the game feels like a place.
20. As a parent, I want the trainer music to keep playing, so that the game still feels like the trainer they know.
21. As a parent, I want quiet ticks, a berry plop and a fill chime, so that the game is not noisy.
22. As a parent, I want the sound to respect the app toggle, so that I can mute it.
23. As a parent, I want the game to fit a small phone in portrait, so that it is usable.
24. As a parent, I want reduced motion respected, so that the picnic stays calm.
25. As a returning child, I want to pick any level from the ladder, so that I can replay a favourite.
26. As a returning child, I want the same bear and basket, so that the world is familiar.
27. As a designer, I want repeated objects, so that the count can grow past the distinct-emoji cap.
28. As a designer, I want the existing flash, goal and landing, so that only the world and answer UI change.
29. As a designer, I want the count ramp explicit (1–3, 1–6, 1–8, 1–10), so that the level config and the UI agree.
30. As a designer, I want the basket to count correct prompts, so that progress is unambiguous.

## Implementation Decisions

- **Scene.** A portrait picnic: a checkered cloth, a bear at the left with a speech bubble, a berry basket at the right. The flash happens on the cloth; the answer pills sit at the bottom.
- **Objects.** One theme per prompt (berry, egg, cookie, apple), repeated N times. Repeats replace the old distinct-category cap. Positions are a jittered grid so objects never overlap.
- **Count ramp.** Level 1: 1–3; level 4: 1–6; level 7: 1–8; level 10: 1–10, supplied by an explicit `countMax(level)`. `levelConfig.max` is not used for this game, so the old distinct-emoji cap cannot drift back in. The flash duration stays `max(800, 3000 − 150·level)` ms.
- **Answer pills.** Three options (correct ±1/±2, unique, at least 1); each pill shows the digit and that many theme dots. Wrong pills wobble silently; the correct one advances.
- **Progress.** A berry basket lights one berry per correct prompt; goal `5 + min(level, 10)` prompts. No digits.
- **Sound.** Keep the shared Trainer Music; add a soft count tick per object on levels 1–2, a berry plop on a correct answer, and a three-note fill chime. Respect the setting.
- **No fail.** Wrong answers only wobble; there is no timer.
- **Landing and route.** The shared TrainerLanding, the play route's level/seed and the ladder are untouched.
- **Art.** Flat inline SVG bear and basket; the themed objects stay emoji; the cloth is CSS.

## Testing Decisions

- **Test external behavior:** a correct pill adds a berry, a wrong pill does not, the basket reaches the goal, the round ends, the level in the URL matches, the landing is unchanged.
- **Highest seam:** the play route DOM. Keep `data-testid="board"`, the cloth, the answer pills (`correct-pill` / `wrong-pill`), the basket berries, and the round card. Tests should not read Svelte state.
- **Unit:** `makePrompt` count ramp, option uniqueness/bounds, and the goal mapping.
- **E2E:** flash → answer → correct, a wrong pill, catch to the goal, level switch, 320×568 and 390×844, reduced motion, muted sound.
- **Prior art:** `tests/e2e/quick-count.test.js` for the board and correct-pill flow.

## Out of Scope

- The Scene Count and Feed the Bear theses; they remain prototypes.
- Voice-over for the numbers.
- Accounts, cloud progress, or a new art pipeline.
- Edits to the shared TrainerLanding, GameShell or the ladder.
- Changing the flash engine.

## Further Notes

- Prototype source: `prototype/quick-count` (`772fa5ee`, refined `a7e4cff8`), variant A.
- The prototype plays levels 1, 4, 7 with the real goals 6, 9, 12.
- The old hidden cap — the config asking for 20 while distinct emoji capped near eight — is retired by repeats and an explicit ramp.
- Risk: repeated objects plus a brief flash can feel like a guess; the early count ticks and the dot pills are the teaching aids.
