# PRD — Cozy Category Sort, next iteration

- **Date:** 2026-11-07
- **Baseline:** Sorting Room shipped in `6c8c24c6` (`7462120c` rebuilt shell)
- **Vocabulary:** Room, Zone, Tray, Shelf, Helper, Spring-back (see `CONTEXT.md`)

## Problem Statement

The Sorting Room fixed the biggest problems: a pre-reader can now see what each home holds (illustrated Zone signs), every item in the round is visible in the Tray, wrong drops spring back, and collected items stay on a Shelf. But the room is only half-cozy and half-accessible:

- Items are still platform emoji, so the game looks different from the Sorting game's flat SVG table and can render inconsistently across devices.
- The instruction is still a sentence (`Drag it to the right bin!`), which a 3-year-old cannot read, and nothing demonstrates the gesture.
- The first two-home levels leave a large blank wall between the Zones and the Rug.
- The board has never been verified at 320×568, with reduced motion, or with a keyboard/screen reader.
- Six categories and a ten-item cap make later replays feel familiar.

## Solution

Finish the room:

1. Replace every item emoji with illustrated SVG art in the same flat style as the Zone signs.
2. Replace the sentence hint with a pointing-hand cue and a one-time ghost-hand demonstration; keep the Helper glow for the first five placements.
3. Dress the room so early levels feel furnished, not empty, without blocking the drag path.
4. Verify and harden small phones, reduced motion, keyboard, and screen-reader labels.
5. Add categories and mixed sets so level 8–10 rounds keep surprising a returning child.

Mechanics stay: drag or tap an item, drop it in its Zone, spring back on a miss, shelf grows, ladder and progress unchanged.

## User Stories

1. As a 3-year-old, I want each item to look like a clear picture, so that I recognise a cat or an apple without reading.
2. As a 3-year-old, I want the item art to match the style of the home signs, so that the room feels like one world.
3. As a 3-year-old, I want a hand to show me how to move the first item, so that I can copy it instead of being told.
4. As a 3-year-old, I want the hint to be a picture or gesture, so that I never need to read.
5. As a 3-year-old, I want a wrong drop to come back to the tray, so that I do not lose my item.
6. As a 3-year-old, I want to see my sorted items on the shelf, so that I know I am making progress.
7. As a 3-year-old, I want the room to feel warm and furnished, so that playing feels calm rather than empty.
8. As a 3-year-old, I want to choose any item from the tray, so that I can start with the one I recognise.
9. As a 3-year-old, I want the same level to stay playable while I think, so that nothing is timed or rushed.
10. As a 4-year-old, I want the green glow to show me the right home for the first few tries, so that I learn the rule.
11. As a 4-year-old, I want the glow to stop once I understand, so that the game still feels like my choice.
12. As a 5-year-old, I want more kinds of things to sort, so that the game does not repeat the same six topics.
13. As a 5-year-old, I want later rounds to mix topics, so that I have to think about which home fits each item.
14. As a child using a small phone, I want the room to fit without cutting off the tray or ladder, so that I can still play.
15. As a child who prefers less motion, I want the room to stay calm, so that I can play without spinning or bouncing.
16. As a child using a keyboard, I want to select an item and choose a home, so that I can play without dragging.
17. As a screen-reader user, I want each home to announce its category and how many items it holds, so that I understand the state.
18. As a screen-reader user, I want each item to announce what it is, so that I can choose deliberately.
19. As a parent, I want the game to look consistent with the other cozy games, so that the app feels like one family.
20. As a parent, I want the room to work offline on a phone, so that a car ride does not break the game.
21. As a parent, I want the helper to teach without nagging, so that my child is not interrupted after every drop.
22. As a parent, I want no negative sounds on a miss, so that mistakes stay low-stakes.
23. As a returning child, I want my level and progress to remain saved, so that I continue where I left off.
24. As a returning child, I want the ladder to keep its ten steps, so that mastery still means something.
25. As a parent, I want the new art and categories to load with the existing app bundle, so that the offline install keeps working.
26. As a designer, I want the room to fill its wall on two-home levels, so that early levels do not look unfinished.
27. As a designer, I want the ghost hand to appear once per device, so that it teaches without becoming noise.
28. As a designer, I want the SVG art to be reusable and testable by id, so that new categories are cheap to add.

## Implementation Decisions

- **Evidence-based baseline.** The Sorting Room (Zones, Tray, Shelf, Spring-back, Helper) is the design. Do not re-open the Market Stall or Delivery Route directions.
- **SVG item system.** Extend the existing illustrated badge component into an item art registry. Every item is an id plus a category; the game never renders a platform emoji. Shape is consistent; the palette stays within the room's warm tokens. Six categories × eight items today, with a shape that makes new categories additive.
- **Data contract.** A round remains `{ category, bins: Category[], items: { art, categoryId, uid }[] }`. Level rules (`binsForLevel`, `itemsForLevel`, set rotation, balanced draw, every Zone at least one item) are unchanged. Saved progress keys are unchanged.
- **Guidance.** The sentence hint becomes a caption, not the instruction. A pointing-hand/arrow cue shows the two-step gesture, and a one-time ghost-hand demonstration places one item correctly on the first round. The demonstration is dismissible by any tap and remembered per device.
- **Helper.** Keep the green Zone glow and ✓ for the first five placements of level 1; retire after five. The dragged item keeps its own green glow as the item-side cue.
- **Spring-back contract.** A wrong Zone wobbles silently and the dragged item animates back to its Tray slot; the item is never consumed. Tap-to-place keeps the item selected after a miss.
- **Room composition.** Fill the blank wall on two-home levels with furniture that stays out of the drag corridor (a wall shelf with a plant, a framed picture, a small sideboard). Decoration is decorative only: `pointer-events: none`, `aria-hidden`.
- **Device floor.** The room must fit 320×568 with the Tray and ladder visible and no horizontal overflow. Zones may shrink before items do.
- **Accessibility contract.** Items announce their name; Zones announce category plus count; focus rings are visible; Enter/Space selects and places; the Room reading order is Zones then Tray.
- **Motion contract.** All decorative motion respects the global `prefers-reduced-motion` rule. The spring-back and the drop animation must still complete (JS timers), and no state may depend on an animation ending.
- **Content growth.** Add at least three categories with eight SVG items each, plus mixed sets for late levels. Do not exceed four Zones, and keep every Zone populated.
- **No new dependencies, no shared-component edits.** Style the route only; do not change `GameShell`, `WinOverlay`, or the global theme. Keep the additive sound policy (tap, match, win; no miss sound).

## Testing Decisions

- **Good tests** assert what a player can observe through the room: rendered Zones and items, counts, selection, win, level changes, and the spring-back. They do not reach into Svelte state or timers.
- **Highest seam:** the route DOM. Keep `data-testid="bins"`, `.zone[data-cat]`, `.draggable[data-cat]`, `.zone-count`, `.ok-mark`, and `.win-overlay` stable for tests.
- **Unit:** extend the existing category-data suite for SVG ids (unique per category, every referenced id exists, every set valid) and keep `buildRound` balance/determinism tests unchanged.
- **E2E:** keep the current seven-room suite; add art-rendered assertions, the ghost-hand demo (appears once, dismisses), the 320×568 fit, reduced motion, and keyboard placement.
- **Prior art:** `tests/e2e/sorting.test.js` for SVG/drag/return; the current `tests/e2e/category-sort.test.js` for the room structure and Helper retirement.
- **Do not** add a test that pins CSS values; assert visibility, counts, and classes that represent behavior.

## Out of Scope

- Changing the room mechanic, the level ladder, or `buildRound` difficulty rules.
- A new audio engine, voice-over, or recorded narration.
- Parent gate, cloud progress, or accounts.
- Editing shared components or the global theme.
- The other games' content or prototypes.

## Further Notes

- Prototype source: branch `prototype/category-sort` (`f4b94715`); winner C is the shipped design.
- The room's empty wall is the most visible cosmetic gap; it is cheap to fix and should not wait for the art system.
- Adding 24+ SVG items is the largest piece; sequence it first so later content and device work test the final art.
- Risk: too much furniture can hide the drag corridor. Attack decorations to the wall edges and keep the center clear.
- Risk: a ghost hand that reappears every round becomes noise. Persist "seen" per device (localStorage, keyed to this game) and allow any tap to dismiss.

## Suggested ticket sequence

1. SVG item art (unblocks content).
2. Guidance and room dressing (independent).
3. Device and accessibility gate (after 1 and 2).
4. Content growth (after 1).
