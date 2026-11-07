# 02 — Category Sort: SVG Item Art

## What to build

Replace every platform emoji item with illustrated SVG art in the same flat style as the Zone signs. The Room must never render an emoji item again: a cat, an apple, a bus, a tree, a t-shirt, and a toy each get eight drawn items, keyed by id and grouped by category.

## Acceptance criteria

- [ ] All six categories have eight SVG items (48 ids total)
- [ ] Every item id referenced by a round resolves to art; no missing fallback
- [ ] No emoji is rendered on the game surface
- [ ] Item art matches the Zone sign style and the room palette
- [ ] Shape is consistent within a category so the rule is the category, not the colour
- [ ] Category sets, level rules, balanced rounds, and progress keys are unchanged
- [ ] Unit tests cover unique ids per category and every id resolving
- [ ] The room e2e still passes and asserts the item art is visible
- [ ] No new dependencies; the offline bundle still caches the app

## Blocked by

None — can start immediately
