# Stickers — Full-bleed Dino Valley redesign

**Date:** 2026-10-24
**Status:** Approved design (grill-with-docs session)
**Game:** Stickers — free-play sticker scene (`/games/stickers`)
**Audience:** ages 3-5 first; age 2 gets a reduced palette. Portrait phones, PWA, offline.
**Reference:** the owner's photos of the McDonald's in-store sticker scene (2026-10-24). We copy the model — one full-bleed world, a bottom shelf, drag to place — not the characters, arches, or branding.
**Supersedes:** the Stickers section of `2026-06-29-kids-games-design.md`.

## Problem & Goals

The current Stickers game is a reskinned prototype, not a designed game:

- The scene is a blank cream rectangle; the four scene buttons only swap the tray.
- Tapping a tray sticker starts a phantom drag. The next pointer event anywhere can move that sticker; tapping another scene moved the rabbit to the top edge.
- Every sticker spawns at 50/50, so taps stack in the center.
- The trash button overlaps the tray (it sits on the apple) and clears everything on one tap.
- The old spec's pinch/rotate, scrollable/unlimited tray, and long-press clear are unimplemented.
- Reloading loses the scene; there is no save.
- The static screenshot shows the same blank scene in the old light theme. The game has been reskinned, not redesigned.

**Goal:** one full-bleed, illustrated Dino Valley canvas that feels like a place. A shelf of die-cut stickers at the bottom; drag from the shelf to the canvas; drag placed stickers; drag back to the shelf to peel. Auto-save the canvas and confirm a reset. A 3-year-old can play without instruction, and a 5-year-old has enough stickers to build a story.

## Decisions locked in the grill

1. **One world now, more later.** V1 ships Dino Valley only. The data model and art system are keyed by world so Coral Bay, Space Camp, and Moonlit Meadow can be added later. No scene picker in v1; back returns to the hub.
2. **One full-bleed canvas.** No album, no pages, no dark `GameShell` frame. The world fills the screen.
3. **Original low-poly SVG art in the repo.** White die-cut sticker borders, soft shadows, bright late-afternoon light. No McDonald's characters, arches, or branding.
4. **Drag-only.** Drag from the shelf, drag placed stickers, drag back to the shelf to peel. No pinch, no rotate, no per-sticker menu.
5. **18 stickers in one horizontal shelf row** — roughly 6 dinos, 6 camp/props, 6 nature/sky — at 64px. Age 2 gets 8 stickers at 72px.
6. **Infinite copies, soft cap 80.** The shelf is a palette, not an inventory. At 80, the shelf signals "full"; peel one off to make room. No eviction.
7. **Auto-save one canvas; two-step reset.** Back saves and returns to the hub. Reset asks once before clearing.
8. **Docs:** this spec, `CONTEXT.md` terms, ADR 0003, and a pointer from the old Stickers section.

## 1. The world: Dino Valley

- Full-bleed portrait scene, authored in a portrait `viewBox` (390 x 844), rendered with `preserveAspectRatio="xMidYMid slice"`. The art is composed for portrait, not cropped from the landscape reference.
- Late-afternoon light: blue sky at the top, warm cream/gold near the horizon; low-poly faceted mountains and a volcano; a teal lake; jungle ferns and pines; a dirt path; a campsite clearing. The background must leave clean areas for placed stickers: density at the edges, calm in the middle.
- Keep important shapes out of the top 80px (floating controls) and the bottom 130px (shelf plus safe area).
- Starting palette:
  - Sky: `#8FD3FF` to `#DDF4FF`, warming to `#FFE8C7` near the horizon.
  - Mountains: `#5B6B8C`, `#7B8CAE`; snow `#EAF2FF`.
  - Volcano: `#6B4A3A`, `#8A5A45`; lava `#FF7A3D`, `#FFC145`.
  - Ground: `#7CBF5A`, `#5FA84A`, `#3F7F3A`.
  - Lake: `#5ED0E8`, `#2FA8C7`.
  - Sticker outline: `#FFFFFF`; shadow `0 4px 8px rgba(23, 37, 55, 0.28)`.
- The background is one static SVG. No background animation; the child's stickers are the motion.
- "Dino Valley" is a proper noun and metadata; do not paint it on the canvas. Add a locale key for future use (the hub/picker can show it later).

## 2. The shelf

- A bottom strip, full width, 116px plus `--safe-bottom`. It looks like a rocky/earth ledge that belongs to the world, not a UI panel.
- 18 sticker types in one horizontal scroll row: roughly 6 dinos, 6 camp/props, 6 nature/sky.
- 64px sticker buttons with an 8px gap; every target is at least 48px. Each button has an `aria-label`.
- Scroll: `overflow-x: auto`, `touch-action: pan-x`, hidden scrollbar, snap proximity. A horizontal swipe scrolls; a vertical drag of 8px starts a sticker drag. The gesture is disambiguated by direction, so a scroll does not place a sticker.
- The shelf is a palette: infinite copies. A sticker button does not disappear or dim when placed.
- Soft cap: at 80 placed stickers, the shelf dims slightly and shows a small "full" badge. Starting a new shelf drag bounces and plays a soft cue. Placed stickers can still be moved or peeled; reset clears. No eviction.
- Age 2: 8 stickers (4 dinos, 2 camp, 2 nature/sky) at 72px. The shelf still scrolls if needed; larger targets, same canvas and save. The soft cap stays 80; the reduced palette is the age difference.
- Dino Valley's shelf texture is a layered rock/earth ledge with a warm top edge.

## 3. Sticker cast

18 types in a 6/6/6 mix. The exact art can be tuned; the mix is the rule.

**Dinos (6):** T-Rex, Triceratops, Stegosaurus, Brachiosaurus, Pteranodon, Ankylosaurus.

**Camp/props (6):** Tent, Campfire, Jeep, Camper, Log bench, Signpost.

**Nature/sky (6):** Fern, Pine tree, Boulder, Dino egg, Sun, Cloud.

- Each sticker is an original SVG with a white die-cut border (~6px at 64px) and a soft drop shadow. Friendly, rounded low-poly shapes; no teeth or gore; bright colors.
- Placed sticker sizes: 72-96px (age 2: 88-112px). Size can vary by silhouette so a T-Rex and a sun both read well.
- The shelf and the canvas use the same SVG symbol per type, so the art is defined once.
- The cast is illustrative; the 6/6/6 mix and the Dino Valley theme are the constraints.

## 4. Layout & chrome

- Full-bleed scene. This route does not use `GameShell`; the app's dark frame and `Starfield` are not shown.
- Floating top controls, safe-area aware:
  - **Back** (top-left): saves and returns to `/`. Use the existing back-button style or a matched glass chip.
  - **Sound** (top-right): the existing `SoundToggle`.
  - **Reset** (top-right, next to sound): a small chip with a reset glyph; opens the two-step reset card.
- The controls are cream/glass chips with dark icons, matching the app's floating controls and staying legible on the bright scene. 48px targets; above the scene, below the drag layer.
- The shelf sits at the bottom, above `--safe-bottom`. The canvas play area ends at the shelf top. The background art continues behind the shelf (covered), so there is no seam.
- The reset card: centered, compact, big icons — a green check (clear) and a red X (cancel) — with a short localized line for a parent. The scene dims; tapping the backdrop cancels. The first reset tap only opens the card.
- No title over the scene; the game title is on the hub. The hub card may keep its current icon or switch to a dinosaur when the art lands (minor).

## 5. Interaction

### Shelf to canvas

- Pointer down on a shelf sticker records the pointer and starts a pending gesture. Do not scroll or place yet. A tap without the 8px vertical move only bounces the shelf item and plays a soft tap; it does not place.
- If the pointer moves horizontally more than vertically, let the shelf scroll (no drag).
- If the pointer moves up more than 8px and more vertically than horizontally, begin the drag: create a draft placed sticker at the pointer's play-area position, clamp it, and render it in a top drag layer. The shelf item stays in place.
- While moving, the draft follows the finger with a slight lift (scale 1.06, stronger shadow). If the pointer is over the shelf, show the peel/cancel cue.
- Release over the play area: commit the draft to the top of the placed array, save, and play a soft stick/pop.
- Release over the shelf or outside the play area: discard the draft, play a soft cancel, and place nothing.

### Placed sticker

- Pointer down brings the sticker to the front (move it to the end of the placed array), records the start, and begins the drag. A tap without movement (4px or less) only brings it to front and plays a soft tap.
- Move: follow the finger; clamp to the play area. Over the shelf, show the peel cue.
- Release over the shelf: remove the sticker (peel), save, and play a soft peel.
- Release elsewhere: commit the new position, save, and play a soft stick.
- Single pointer only; pointer-id lock; window-level `pointermove`, `pointerup`, and `pointercancel` so drags survive leaving the canvas. No phantom drag: the pointerup that ends a shelf gesture must end the drag; never start a drag from a click handler.
- Z-order is array order. The last touched or placed is last (top). The active drag lives in a top layer; on commit it joins the end of the array.
- No pinch, no rotate, no per-sticker menu. A tap is a harmless bounce, not a delete.
- At 80 placed, shelf drags bounce with a soft "full" cue; placed drags still work; peel makes room.

### Peel

- When a dragged sticker is over the shelf, the shelf glows and the sticker shrinks/fades slightly. Release removes it.
- The play-area clamp does not prevent the drag layer from reaching the shelf. A placed sticker dragged near the bottom but not over the shelf stays in the play area.

## 6. Save, reset, and back

- localStorage key `kids-games-stickers`:

  ```json
  {
    "version": 1,
    "worlds": {
      "dino-valley": {
        "placed": [{ "id": "p1", "type": "trex", "x": 42.5, "y": 61.2 }]
      }
    }
  }
  ```

- `x` and `y` are percentages of the play area (the canvas above the shelf), 0-100. `id` is unique; `type` is a catalog id. Array order is z-order.
- Save after each commit, peel, or reset, debounced about 200ms; also flush on `pagehide` and when `visibilitychange` becomes hidden. Do not save on every pointermove.
- Load on mount. Drop unknown `type`s (art changed), clamp out-of-range positions, ignore malformed JSON, and start empty on an unknown version. Never crash on bad saved data.
- Reset: the two-step card. Confirm clears the current world's `placed` array and saves; cancel closes. The world and shelf remain.
- Back: flush the save, then navigate to `/`. The scene is restored on the next visit.
- The save is per world, so adding Coral Bay, Space Camp, or Moonlit Meadow later does not migrate or mix scenes.

## 7. Age scaling

- **Ages 3-5:** the full 18-sticker shelf at 64px; soft cap 80.
- **Age 2:** 8 stickers (4 dinos, 2 camp, 2 nature/sky) at 72px; the same canvas, art, save, and two-step reset. Soft cap 80.
- The age is read on mount. The app's age selector is on the hub, so it cannot change mid-scene.
- If the age changes and a saved scene has more stickers than the new palette, keep the saved stickers. Never delete a child's work on an age change; the palette and cap gate only new placements.

## 8. Art production

- All art is original SVG in the repo. No external image requests; no McDonald's assets.
- Suggested structure:
  - `src/lib/stickers/catalog.js` — world id/name, 18 sticker entries (`id`, `labelKey`, `group`, size, art symbol), age palettes.
  - `src/lib/stickers/art/DinoValley.svelte` — the full-bleed background as inline SVG.
  - `src/lib/stickers/art/stickers/` — one SVG symbol per type, or one sprite with an id per type.
  - `src/lib/stickers/StickerLayer.svelte`, `Shelf.svelte`, `ResetConfirm.svelte`, and the route `+page.svelte`.
  - `src/lib/stickers/save.js` — schema load/save/clear/validate.
  - `src/lib/stickers/geometry.js` — pure clamp/percent/over-shelf helpers for unit tests.
- Define each sticker once as an SVG `<symbol>`; the shelf and the canvas use `<use href="#sticker-trex">` with a transform. This keeps 80 placed stickers light.
- Die-cut border: a white outline path behind the colored shape, not a CSS stroke on the shape, so the border stays even. About 6px at 64px, scaled with the sticker. Soft shadow via CSS `filter: drop-shadow(0 4px 6px rgba(23,37,55,.28))`; avoid heavy blur on every sticker while dragging.
- Background: one SVG with flat polygons and subtle gradients — sky, distant mountains, volcano, midground hills, lake, foreground foliage and path. No filters or blur. Keep the center calm.
- The shelf: an SVG/CSS ledge with a warm rock/earth texture; no image texture files. It must read as a physical shelf.
- No text in the art; no brand marks. The world name is metadata, not painted on the canvas.
- Compose and test at 360x780, 390x844, and 430x932. The shelf covers the bottom, so the focal point sits above it.

## 9. Performance

- Budget: one static background SVG, up to 80 placed `<use>` stickers, and 18 shelf items. No particle timers, no canvas, no layout-changing animations.
- Drag uses `transform: translate3d()` on the active sticker. No `left`/`top` animation, no transition on position, and `will-change: transform` only while dragging.
- Soft cap 80. No eviction.
- Acceptance on iPhone XR: during a 10-second continuous drag with 40 placed stickers, average FPS at least 30, p95 frame at most 50ms, worst frame at most 200ms; no console errors. Test at 80 placed as a stress check. Reuse the Splash measurement approach if a debug HUD is added; otherwise measure with Chrome DevTools and the XR.
- The shelf uses native overflow scrolling. Avoid `backdrop-filter` on the shelf; a solid or soft-gradient ledge is cheaper and looks better.
- This route does not add a Starfield or any extra animated background layer.

## 10. Accessibility & i18n

- All controls are buttons with `aria-label` and at least 48px targets: back, sound, reset, and every shelf sticker.
- Each shelf sticker button has an accessible name from `labelKey` (for example, "T-Rex sticker"). The art itself is decorative.
- Placed stickers are not focusable; drag is the interaction. The reset card is button/keyboard accessible.
- Color is not the only cue: the full state has a badge/icon; the peel cue has a shelf glow and a sticker shrink.
- i18n keys: `stickerReset`, `stickerResetConfirm`, `stickerResetCancel`, `stickerFull`, `stickerWorldDinoValley`, and one label per sticker (`stickerTrex`, ...). The existing `stickers` key is the game title, so the new keys use the singular `sticker` prefix. Add them to all six locale files. Fall back to a readable English name if a label is missing.
- The reset card uses icons plus text: a pre-reader can recognize the green check/red X, and a parent can read the line.

## 11. Testing

- **Vitest unit:** catalog has 18 entries with 6/6/6 groups; age palettes (18 at 64px, 8 at 72px); save schema round-trip, unknown version, malformed JSON, unknown sticker type, and clamping; geometry clamp/over-shelf/percentage; cap gating; z-order move-to-end; reset clear.
- **Playwright e2e:** loads the full-bleed world and the slice shelf (18 at full v1, 8 at age 2); the shelf row scrolls without placing; a tap or a sub-threshold nudge places nothing; drag a sticker from the shelf to the canvas produces one placed sticker; drag a placed sticker changes its position; a tap on a placed sticker keeps its position; drag back to the shelf removes it; edge drops and loaded out-of-range positions are clamped fully inside the play area; reload restores the placed stickers; duplicate saved ids keep the first instead of crashing; back returns to the hub and re-entering restores; reset opens the card, cancel/backdrop keeps, confirm clears, and the card traps focus with a working Escape; age 2 shows 8 shelf stickers; the soft cap shows a full cue and a peel makes room; no page or console errors; a committed 390x844 screenshot at the hub is reviewed manually.
- The e2e drag uses pointer events with a `pointerId` and a small vertical move to pass the 8px gesture threshold, like the Splash tests.
- **Performance:** a manual XR run using the protocol above; record the numbers in the ADR/spec. Not a CI test.
- **Visual:** inspect at 390x844 for the old blank-page, center-stacking, and clear-overlap regressions. Replace the stale `static/screenshots/stickers.png` after the redesign.

## 12. Acceptance

- A 3-year-old can drag a sticker from the shelf to the canvas without instruction; the sticker follows the finger and stays where dropped.
- The canvas fills the screen and reads as Dino Valley; no blank cream page and no dark `GameShell` frame.
- A placed sticker can be moved; the last touched is on top; a sticker dragged back to the shelf peels off.
- The shelf scrolls horizontally and all 18 stickers are reachable; the reset and sound controls never overlap the shelf.
- Reloading, backing out, or returning restores the scene; reset requires a second confirmation.
- At 80 placed, the shelf shows a friendly full state; peeling makes room.
- Age 2 shows 8 larger stickers; ages 3-5 show 18.
- On the XR: 30fps floor, p95 at most 50ms, worst at most 200ms with 40 placed stickers; no console errors.
- All tests pass; no McDonald's characters, arches, or branding.

## 13. Out of scope (v1)

- Coral Bay, Space Camp, Moonlit Meadow, and the scene picker. The data model is ready; the art comes later.
- Collection/unlock, rewards, locked stickers.
- Pinch/rotate, per-sticker size/rotate/delete menus.
- Gallery/share/export, cloud sync, multiple saves per world.
- Landscape layout, text-heavy UI, custom music.
- McDonald's IP or any branded characters.

## 14. Future worlds

- The catalog and save schema are keyed by world. Adding a world means a background SVG, 18 sticker entries, a shelf texture, and a picker card; the canvas, interaction, and save code stay the same.
- A future Scene Picker shows large postcard cards. Back from a world returns to the picker; the picker's back returns to the hub.
- Keep the same 6/6/6 mix per world: characters, props, nature/sky.

## Glossary Terms (added to CONTEXT.md)

**Canvas**, **World**, **Scene**, **Play Area**, **Sticker**, **Placed Sticker**, **Shelf**, **Peel**, **Soft Cap**, **Reset**, **Scene Picker**.
