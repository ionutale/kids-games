# PRD — Pop: the Rising Pond

- **Date:** 2026-11-07
- **Status:** Implemented (shipped 2026-11-09).
- **Decision:** prototype winner A on `prototype/pop` (`fb6d614e`)
- **Baseline:** the shipped 20-second emoji bubble game

## Problem Statement

Pop is a 20-second timer with emoji bubbles and a numeric score target. For 3–5 year-olds the countdown creates pressure, the numbers mean little, and the target is contradictory: when time runs out below target the game still says "Great job". The starry background gives the bubbles no world, every emoji is equally important, and a burst has no collection or reward. The result is a tap toy with an anxious clock and no reason to care which bubble you pop.

## Solution

A gentle arcade in a moonlit pond. Bubbles rise from the water carrying surprise trinkets; the child taps or swipes them into a jar on the shore. The jar fills to the target and the round ends; the moon crosses an arc as the 30-second timer. If time ends short, a calm Good Try card offers Try again or Back — no star, no sad sound. Giant bubbles take two taps and count double; rare star bubbles leave a sticker. Surprises fly into the jar and stay as the collection. The shared ladder, saved level/mastery and hub entry are unchanged.

## User Stories

1. As a 3-year-old, I want to tap a bubble and see it burst, so that the cause and effect is immediate.
2. As a 3-year-old, I want a surprise inside the bubble, so that each pop is a small gift.
3. As a 3-year-old, I want the surprise to fly into a jar, so that I can see what I collected.
4. As a 3-year-old, I want a moon to move instead of numbers counting down, so that I am not anxious.
5. As a 3-year-old, I want to swipe through several bubbles, so that one gesture can pop a chain.
6. As a 3-year-old, I want the pond to be calm and pretty, so that the game feels like a place.
7. As a 3-year-old, I want a big bubble to take two taps, so that I have a small challenge.
8. As a 3-year-old, I want a sparkly star bubble sometimes, so that there is a special surprise.
9. As a 4-year-old, I want the jar to fill up, so that I know how close I am to finishing.
10. As a 4-year-old, I want a star sticker when the jar is full, so that I feel I did well.
11. As a 4-year-old, I want the pop pitch to rise as I swipe, so that a chain sounds like a chain.
12. As a 4-year-old, I want bubbles to appear faster as I level up, so that the game grows with me.
13. As a 4-year-old, I want more kinds of surprise, so that collecting stays interesting.
14. As a 5-year-old, I want a bigger target on later levels, so that the round is not over too soon.
15. As a 5-year-old, I want giant and star bubbles mixed in, so that I have to choose what to pop.
16. As a parent, I want a 30-second round, so that a session ends before my child is tired.
17. As a parent, I want no losing state or sad sound, so that a short round is not a failure.
18. As a parent, I want a Try again button on the Good Try card, so that my child can retry immediately.
19. As a parent, I want no score numbers, so that the game is not about arithmetic.
20. As a parent, I want the sound to be quiet and respect the app toggle, so that I can mute it.
21. As a parent, I want the game to fit a small phone in portrait, so that it is usable on the go.
22. As a parent, I want reduced motion respected, so that the pond stays calm.
23. As a parent, I want the level and mastery to persist, so that progress is not lost.
24. As a returning child, I want to pick any level from the ladder, so that I can replay a favourite.
25. As a returning child, I want the pond world to stay consistent, so that I recognise it instantly.
26. As a designer, I want bubble types to unlock by level, so that difficulty is taught rather than sprung.
27. As a designer, I want the jar to count giant/star bubbles as two, so that the fill matches the reward.
28. As a designer, I want one round per level, so that the ladder stays the single progression contract.
29. As a designer, I want the pop, spawn and fill sounds to be separate, so that each event is legible.
30. As a designer, I want the setTimeout and rAF loop to stop cleanly, so that navigating away leaves no leaks.

## Implementation Decisions

- **Scene.** A portrait moonlit pond with lily pads, reeds, fireflies and a soft moon glow. Bubbles rise from the water. The Jar and Moon Timer live in the HUD row above the water. No visible grid.
- **Bubble.** A soap film with one Surprise inside. Normal 48–60px, giant 86px, star 56px. Colours are a soft blue/lavender film; star bubbles are gold.
- **Round.** 30 seconds. The jar target follows the shared ladder: `targetFor(level) = min(5 + level, 15)` (6 at level 1). The first tap starts the round. A Moon Timer arc replaces digits; a soft chime at 5 seconds.
- **Jar.** Fills by points, not by item count: normal +1, giant +2, star +2. Surprises are pushed into the jar once per point so the minis match the fill. A star sticker appears on the rim when the jar fills or a star bubble pops.
- **Interaction.** Tap or swipe. A swipe pops every bubble the finger crosses; the pop pitch rises per bubble in the chain and resets on lift. Giant bubbles crack on the first tap and burst on the second. No penalty for missed or escaped bubbles.
- **Bubble types.** Normal at levels 1–2; giant unlocks at level 3; star at level 6. Types are chosen per spawn with a low star probability. All bubbles are poppable; there are no decoys.
- **End states.** Reaching the target ends the round as a win: star sticker, a three-note chime, and the standard ladder next/replay actions. The Moon Timer reaching zero below target shows the Good Try card: the jar fill, no star, no sad sound, Try again and Back.
- **Levels.** One 30-second round per ladder level. Spawn interval, fall duration, concurrent cap and surprise pool come from the level config, tuned gently; the target rises 6→15.
- **Sound.** Water plop per pop with rising chain pitch, a soft bubble-up on spawn, a three-note chime when the jar fills. No ticking clock and no negative sound. Respects the existing sound setting.
- **Art.** Flat inline SVG bubbles, pond props and surprise trinkets. No emoji on the game surface.
- **Constraints.** No new dependencies; do not edit shared components or the global theme; keep the ladder, progress keys, hub entry and sound toggle.

## Testing Decisions

- **Test external behavior**: a tap pops, a swipe pops a chain, a giant needs two taps, a star adds two slots and a sticker, the jar fills to the target, the round wins, the timer shows Good Try, levels switch.
- **Highest seam:** the route DOM. Keep `data-testid="pop-root"`, `.bubble` with `data-type`, `.jar` (and its fill), `.moon`, `.card`, and the HUD hooks. Tests should not read Svelte state.
- **Unit:** level config and target curve, pop values (normal/giant/star), type unlocking by level, and jar fill math (points vs minis).
- **E2E:** start the round, pop one, swipe a chain, giant two taps, star sticker, target win, timer good-try, level switch, 320×568 and 390×844, sound toggle muted, reduced motion.
- **Prior art:** the current `tests/e2e/pop.test.js` for bubble/HUD hooks and `tests/e2e/sorting.test.js` for touch interaction helpers.

## Out of Scope

- The Bubble Wand and Pond Chain theses; they stay as prototypes.
- Colour-cluster matching and any match-3 mechanics.
- Real physics for bubbles, or voice-over.
- Accounts, cloud progress, or a new art pipeline.
- Editing shared components or other games.

## Further Notes

- Prototype source: `prototype/pop` (`fb6d614e`), variant A.
- The 30-second round was chosen over no timer; the Good Try card is what keeps it gentle.
- The target is a jar, not a score. Do not add digits back in without a new decision.
- Risk: a swipe can pop a whole screen and trivialise the target; tune the chain radius and cap the chain points if needed.
- Risk: a 30-second gap with no taps can feel empty at low levels; the first tap starts the round, and spawns begin immediately.
