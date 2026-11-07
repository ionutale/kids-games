# 04 — Category Sort: Devices and Accessibility Gate

## What to build

Prove the finished Room works for every input and screen size. Fit the two-, three-, and four-home layouts on small phones, make the Tray and Homes usable by keyboard and screen reader, and run the full gate after the art and guidance work has landed.

## Acceptance criteria

- [ ] The Room fits 320×568 with the Tray and ladder visible and no horizontal overflow
- [ ] The Room fits 390×844 with ten items and four Homes
- [ ] Items announce what they are; Homes announce category and current count
- [ ] Focus rings are visible on items, Homes, and the ladder
- [ ] Enter or Space selects an item and places it in a chosen Home
- [ ] Reading order is Homes then Tray
- [ ] A reduced-motion pass leaves every level playable, including spring-back and drop
- [ ] `pnpm test`, the category-sort e2e suite, and `pnpm check` are green

## Blocked by

- 02 — SVG Item Art
- 03 — Guidance and Room Dressing
