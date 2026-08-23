# 01 — Category Sort: Core Game + Data + Hub + Tests

## What to build

Category sort game: 2-3 bins at top, emojis appear one at a time at bottom. Player drags each into the correct bin. Rounds cycle through category sets (animals, food, vehicles, etc.).

Files:
- `src/routes/games/category-sort/+page.svelte`
- `src/routes/games/category-sort/+page.js`
- `src/lib/category-sort/categories.js` — category and item data

## Acceptance criteria

- [ ] 2-3 category bins displayed at top with icon + label
- [ ] Emoji appears at bottom (one at a time)
- [ ] Dragging emoji over a bin and releasing checks the category
- [ ] Correct placement: emoji slides into bin with chime
- [ ] Wrong placement: emoji bounces back to center
- [ ] 8-10 emojis per round, then celebration + next round
- [ ] Category sets cycle: Animal vs Food, Vehicle vs Nature, Clothes vs Toys
- [ ] 3-bin rounds (Animal vs Food vs Vehicle) included
- [ ] Running correct count displayed
- [ ] Game appears in hub with icon
- [ ] Translation keys for all 3 languages
- [ ] CONTEXT.md updated
- [ ] Unit + behavioral + E2E tests pass

## Blocked by

None — can start immediately
