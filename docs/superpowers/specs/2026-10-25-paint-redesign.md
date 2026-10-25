# Paint — Full-bleed Cozy Art Studio redesign

**Date:** 2026-10-25
**Status:** Approved design (grill-with-docs session, 2026-10-25)
**Game:** Paint — free-play drawing and coloring (`/games/paint`)
**Audience:** ages 3-5 first; age 2 gets a reduced, larger-touch studio. Portrait phones, PWA, offline.
**Reference:** the live Paint page at `https://kids-2-5.aiu-media.com/games/paint` and the owner's request for a bigger, full-bleed canvas. The redesign keeps finger painting as the core; all art is original.
**Supersedes (proposed):** the Paint section of `2026-06-29-kids-games-design.md`.

## Problem & Goals

The current Paint game is a useful canvas inside the app's dark frame:

- The `GameShell` chrome and a large white rectangle make the page read as a utility, not a place.
- The canvas ends at a toolbar and bottom bar, so the paper never fills the screen.
- There are six small color dots, three brush sizes, emoji stamps, and an instant clear.
- There is no undo, no save, no page picker, and no coloring mode. Leaving loses the artwork.
- The blank surface is the whole experience; there is nothing to return to.

**Goal:** a full-bleed sheet of paper that feels like the child's art table. The paper runs edge to edge; chunky tools float over it. The child can free-paint on blank paper or color an original line-art sheet. Marks stay on the paper, lines stay crisp, and every sheet remembers its own artwork. A 2-year-old can make a mark without instruction; a 5-year-old can fill a page, scribble, stamp, undo, and come back later.

## Decisions locked in the grill

1. **Cozy art studio, full bleed.** No `GameShell`; the paper fills the screen. A floating studio dock and corner chips are the only chrome. Fresh white paper with a barely-there grain; the warmth comes from the wooden/ceramic tools and soft light.
2. **Both free paint and coloring.** The studio ships blank paper plus three original coloring sheets: Dino Valley, Butterfly Garden, Under the Sea. The sheet determines the mode; there is no separate Free/Coloring toggle.
3. **Paper cards, not a mode switch.** A current-paper chip opens a tray of large paper cards. Switching saves the current sheet and loads the chosen one immediately; no confirmation because each sheet is preserved.
4. **Protect the line art.** A coloring sheet's lines are never painted over. The bucket fills one region; the brush auto-clips to the region under the finger; stamps are discrete stickers and may overlap the lines.
5. **Save each sheet.** Blank and every coloring sheet keep their own artwork. Auto-save after actions and on switch/back/pagehide; no album UI in v1.
6. **Studio set.** Eight paint pots, three brush sizes, four original SVG stamps, eraser, undo, and two-step clear. The coloring sheet adds a bucket. Age 2 gets six colors, two sizes, three stamps, two coloring sheets, and 72px targets.
7. **Docs first.** This spec and ADR are the design contract; the Dino Valley slice is the first build after approval.

## The studio

### Full-bleed paper

- The paper fills the viewport, under the top and bottom safe areas. There is no frame, border radius, or dark surround.
- Surface: fresh white with a barely-there warm grain (SVG/CSS noise at very low opacity) and a soft edge shadow so the screen reads as paper, not a white div.
- The paint canvas also fills the viewport and extends behind the dock. The child can draw to every edge; the dock floats over the paper.
- No title over the sheet. "Paint" stays on the hub.
- The dock and chips sit above the paper and below the drag/paint layer. Nothing overlaps the top-left back target or the bottom safe area.

### Floating controls

- **Back** (top-left): saves and returns to `/`. Cream glass chip with a dark arrow, 48px (56px at age 2).
- **Paper chip** (top-center): a small stack of paper with the current sheet's thumbnail. Tapping opens the Paper Tray. This is the only mode/page control.
- **Sound** (top-right): the existing `SoundToggle`, styled as a matching cream chip.
- **Clear** (top-right, next to sound): a small broom chip for a parent. It opens the two-step clear card; it never clears on one tap.
- The corner chips are cream/glass with dark icons, matching the Stickers controls. No dark panel.

### Studio dock

A rounded, warm oak/ceramic tray floating at the bottom, safe-area aware. It is a physical object on the paper, not a UI bar.

Controls, left to right:

1. **Current color well** — a glossy paint blob, 56px (64px age 2). Tapping opens the Paint Palette.
2. **Brush** — the active painting tool; tapping cycles small → medium → big. The icon shows the current stroke width. 48px (56px age 2). A tiny three-dot size indicator sits under the brush so the current size is visible without opening anything.
3. **Bucket** — coloring sheets only. Tap a region to fill it. Hidden on blank paper and on age 2 blank paper.
4. **Stamp** — opens the Stamp Tray; the current stamp is shown on the button. Stamps place at the next tap.
5. **Eraser** — drag to rub out paint and stamps; tap a filled region to clear that fill. 48px/56px.
6. **Undo** — pops the last action. Disabled when the history is empty. No redo in v1.

The dock is one row when it fits (390px baseline: 6 controls at 48px plus gaps). On a narrow screen or the age-2 palette it may wrap to two rows; the paper remains full-bleed behind it. The clear chip is deliberately outside the toddler dock.

### Paint Palette

- A 4×2 grid of eight large paint pots (64px standard, 72px age 2) rises above the dock on a small wooden palette.
- Colors: coral `#FF6B6B`, tangerine `#FF9F43`, sunshine `#FFD54F`, leaf `#81C784`, sky `#4FC3F7`, grape `#8A6FD1`, bubblegum `#FF8FB1`, cocoa `#8B5A3C`.
- Each pot has a glossy highlight and a localized color name. The selected pot has a paint-splash ring.
- Tapping a pot selects it and closes the palette; the current color well updates.

### Stamp Tray

- A row/tray of four original SVG stamps: star, heart, butterfly, flower. Each has a white die-cut border and a soft shadow, like a paper sticker.
- Selecting a stamp sets the tool to stamp; the tray closes. The next taps place the selected stamp. The brush button returns to painting.
- Stamps place at 56px (64px age 2). They are decorations and may overlap line art.

### Paper Tray

- Opens from the paper chip as a bottom tray with a dimmed paper behind it.
- Four large paper cards in a 2×2 grid (standard): Blank, Dino Valley, Butterfly Garden, Under the Sea. The blank card shows a fresh sheet and a crayon; the coloring cards show their line art.
- Age 2 shows three cards (Blank, Dino Valley, Under the Sea) in a 2+1 layout; each target is at least 120px wide.
- The active card has a tape corner/check. Tapping another card saves the current sheet, loads the target, and closes the tray. Tapping the backdrop or the X closes without changing.
- No confirmation and no empty-state text. The paper itself is the content; the cards are the collection.
- A small localized label names each card for parents/screen readers; the art carries the choice for pre-readers.

## Sheets and modes

### Blank sheet

- A full-bleed sheet of fresh white paper. Brushes, stamps, and eraser work anywhere.
- No bucket; the whole sheet is one plane, so a fill would cover the drawing.
- Default sheet on first visit and after a malformed save.

### Coloring sheets

- Original line-art pages: **Dino Valley**, **Butterfly Garden**, **Under the Sea**.
- Dino Valley is the first built page: volcano, lake, friendly brachiosaurus and triceratops, palm, tent, sun, clouds, ferns. It is a companion to the Stickers world, not a copy of that filled background.
- Butterfly Garden: sun, clouds, flowers, a butterfly, grass, watering can, garden stones.
- Under the Sea: fish, octopus, coral, shell, bubbles, seaweed, a small submarine.
- Line art is charcoal-brown `#3A2E28`, 4-5px at the 390px baseline, rounded and friendly; no text, no filled regions, no gradients. Each page defines 10-16 named regions (sky, sun, volcano, lake, dino body, etc.).
- The line art sits above the paint layer, so it stays crisp. Regions are closed shapes with stable IDs. The child never sees the IDs.
- The page covers the viewport with `preserveAspectRatio="xMidYMid slice"`; the composition keeps a safe margin so the important shapes survive narrow and tall phones.

### Coloring interaction

- **Bucket:** tap a region; the region fills with the current color. Tapping a filled region with another color replaces it. Tapping outside any region does nothing. The fill sits under brush strokes and stamps.
- **Brush:** a stroke clips to the region under its start point. Crossing a line stops the stroke at the boundary; the child can start a new stroke in the next region. A tap with the brush makes a clipped dot. The line art itself is never a paint target.
- **Stamps:** place anywhere, including over lines, as discrete stickers. They sit above paint and fills.
- **Eraser:** drag erases brush strokes and stamps. A tap (≤4px) on a filled region clears that region's fill and leaves the lines. A tap outside a fill does nothing.
- **Undo** reverses the last fill, stroke, stamp, region clear, or clear-all; the line art is never undone. The history is per active sheet, in memory; switching sheets or reloading resets it.
- **Clear** clears only the current sheet after the two-step card. The other sheets are untouched. Clear is undoable until the child leaves the sheet.

## The studio art direction

- The paper is the hero: fresh white, a whisper of grain, soft edge light. No busy background competes with the child's marks.
- The dock is a warm oak tray with cream ceramic tool wells and glossy paint. The palette looks like a real painter's palette. Tools are chunky, rounded, and cast soft late-afternoon shadows.
- The corner chips are cream glass with dark ink icons, matching the app's Stickers controls but lighter than the dark `GameShell`.
- The paper tray and clear card are cream cards on a warm wooden tray; the clear card uses a green check and red X, like Stickers.
- No characters, logos, or branded references in the chrome. The Dino Valley page is an original scene.
- Motion is small and physical: a 120ms press scale on tools, a soft fill fade, a stamp pop, a 150ms palette/tray rise. No particle timers, no continuous animation, no confetti.

## Save, undo, back

- Storage key `kids-games-paint`, version 1. Per-sheet documents:
  ```json
  {
    "version": 1,
    "activeSheet": "blank",
    "sheets": {
      "blank": { "kind": "free", "strokes": [], "stamps": [] },
      "dino-valley": {
        "kind": "coloring",
        "fills": { "sky": "#4FC3F7" },
        "strokes": [],
        "stamps": []
      }
    }
  }
  ```
- A stroke is `{ color, size, region, points }`; `region` is the coloring region id or `null` on blank paper. Points are normalized 0-1 to the sheet artboard and thinned to at least 2px apart, max 400 points per stroke.
- A stamp is `{ type, x, y, size }`, normalized. A fill is `{ [regionId]: color }`.
- Save after each stroke end, fill, stamp, erase, region clear, undo, clear, sheet switch, back, `pagehide`, and `visibilitychange` (hidden). Do not save on pointermove.
- Load on mount; validate and drop malformed sheets/strokes/stamps/fills and unknown sheet ids/regions; clamp points and stamp positions; fall back to the blank sheet on unknown version or bad JSON. Never crash on bad data. Preserve other sheets when saving one.
- Use the same guarded storage access pattern as Stickers: a blocked `localStorage` accessor must not stop back/save.
- Total document size stays well under a typical 5MB localStorage budget: point thinning, no raster snapshots, no per-move writes. If a write fails (quota/private mode), keep painting; the current action still renders. The next successful save catches up; a quiet parent-facing "couldn't save" cue is allowed but must not block play.
- Back saves and returns to the hub. Re-entering restores the active sheet. Clear is a two-step card: green check clears, red X/backdrop keeps. The card traps focus, Escape cancels, and focus returns to the broom chip.
- No album, export, share, print, cloud sync, or multiple named canvases in v1.

## Age variants

- **Ages 3-5 (standard):** 8 colors, 3 brush sizes, 4 stamps, blank + 3 coloring sheets, 48px dock targets (56px color well), 20-step undo.
- **Age 2:** 6 colors (coral, tangerine, sunshine, leaf, sky, grape), 2 brush sizes (medium, big), 3 stamps (star, heart, flower), blank + Dino Valley + Under the Sea, 72px targets, larger palette pots, 3 paper cards, 20-step undo. Same paper, line art, save, and clear behavior.
- The age is read on mount from `settings`; the hub owns the selector. It cannot change mid-session.

## Architecture

- `src/routes/games/paint/+page.svelte` — full-bleed page, canvas/SVG layers, dock, palette, stamp tray, paper tray, clear card, save lifecycle.
- `src/lib/paint/sheets.js` — sheet catalog: id, kind, titleKey, art component, age availability.
- `src/lib/paint/tools.js` — color palette, brush sizes, stamps, age configuration.
- `src/lib/paint/document.js` — sheet document shape, add/move/clear actions, undo stack, point thinning, validation.
- `src/lib/paint/save.js` — v1 per-sheet load/save and guarded storage.
- `src/lib/paint/geometry.js` — normalized coordinates, tap threshold, region hit-testing and viewport mapping helpers.
- `src/lib/paint/paper/DinoValleyPage.svelte`, `ButterflyGardenPage.svelte`, `UnderTheSeaPage.svelte` — original line art with region paths and fill paths.
- `src/lib/paint/StampDefs.svelte`, `src/lib/paint/PaintStamp.svelte` — four original SVG stamps and the reusable renderer.
- The canvas is one 2D paint layer plus SVG overlays: fills below the paint, line art above the paint, and stamps above the line art. Brushes draw on the canvas; brush strokes are clipped. Stamps are vector decorations and may cover lines; the eraser removes a stamp it touches. The paint canvas is capped at DPR 2 for memory; line art and stamps stay vector-crisp.
- No new dependencies. Do not reuse the Stickers world art as coloring line art; Dino Valley is a new companion composition.

## Accessibility & i18n

- All controls are `<button>`s with `aria-label`, visible focus, and at least 48px targets (72px at age 2). The canvas is touch-first; the parent controls and dialogs are keyboard reachable.
- Color names, sheet names, tool names, and stamp names are localized; do not use hex codes as accessible names. Use descriptive names (Coral, Sunshine, Leaf...).
- The clear card is a `role="dialog" aria-modal="true"` with focus trap, Escape, and backdrop cancel; the paper tray closes on backdrop/Escape.
- Reduced motion: disable press/rise transitions; keep state changes immediate.
- No continuous brush sound; a soft tap on tool select, a pop on fill/stamp, and a soft tap on sheet switch. Sound respects `settings.soundEnabled`.
- New keys use the `paint*` prefix (the existing `paint` key is the game title): `paintBrush`, `paintBrushSmall`, `paintBrushMedium`, `paintBrushBig`, `paintBucket`, `paintStamp`, `paintEraser`, `paintUndo`, `paintClear`, `paintClearConfirm`, `paintClearCancel`, `paintPaper`, `paintSheetBlank`, `paintSheetDinoValley`, `paintSheetButterflyGarden`, `paintSheetUnderTheSea`, `paintColorCoral` ... `paintColorCocoa`, `paintStampStar`, `paintStampHeart`, `paintStampButterfly`, `paintStampFlower`. Add all six locales (en/it/ro/de/fr/zh).

## Performance

- One static paper surface, one 2D paint canvas, one fill SVG and one line SVG. No particle timers, no canvas animation loop, no layout-changing animation.
- Draw strokes directly on pointermove; thin points; save only on stroke end. Undo is a command stack, not a per-move image snapshot.
- One pointer at a time, pointer-id locked, window-level move/up/cancel so strokes survive leaving the canvas. No phantom strokes from taps.
- Acceptance bar: during a 10-second continuous stroke on the target phone, average ≥30fps, p95 frame ≤50ms, worst frame ≤200ms; no dropped pointerup; no scroll/zoom while painting (`touch-action: none`).
- The dock/palette/tray must not cause a visible canvas resize; overlay them.

## Tests & acceptance

**Unit (Vitest):**
- Sheets: standard has blank + 3 coloring sheets; age 2 has blank + 2; unique ids; age availability.
- Document: add stroke/stamp/fill, region clear, clear sheet, 20-step undo/redo-less behavior, point thinning, duplicate/edge points.
- Save: round-trip all sheets, active sheet, preserve other sheets, unknown version, malformed JSON, unknown sheet/region, clamped points, storage accessor throws, `setItem` throws.
- Geometry: normalized mapping, tap threshold, region hit-testing; region ids in the SVG match the sheet catalog.
- Tools: palettes and age subsets; brush sizes; stamp sets.

**Playwright e2e:**
- Full-bleed paper, no `.game-shell`, dock and corner chips visible; 390x844 baseline.
- Blank sheet: draw a stroke; undo removes it; redo is absent; reload restores; clear cancel keeps and confirm clears; back returns to the hub and re-entry restores.
- Paper tray: four cards standard, three at age 2; switching saves the current sheet and restores each on re-entry; no confirmation.
- Dino Valley: line art visible; bucket fills a region; tapping another region with a second color works; a brush stroke crossing a line stays inside its starting region (assert via canvas pixels or a debug region attribute); stamps can overlap lines; eraser removes paint; eraser tap clears a fill; undo restores fill/stroke; save/reload restores fills, strokes, and stamps.
- Age 2: 6 colors, 2 brush sizes, 3 stamps, 3 paper cards, 72px targets; same bucket/clip/save.
- No page errors or console errors during draw/fill/stamp/undo/switch; screenshot baseline at 390x844.
- Keyboard: clear card focus trap, Escape, focus return; paper tray closes on Escape.

**Manual review:**
- 390x844 screenshot of the studio, the paper tray, a colored Dino Valley page, and the age-2 dock.
- Feel review on a phone/XR: paper fills the screen; tools are reachable; brush clipping feels magic, not broken; no accidental clears; the studio reads as a place.

## First slice (after approval)

**Slice 1 — Blank + Dino Valley:**
- Full-bleed studio shell, fresh paper, dock, palette, stamp tray, clear card.
- Blank free-paint sheet with 8 colors, 3 sizes, 4 stamps, eraser, 20-step undo, per-sheet save.
- Dino Valley line-art sheet with 10-16 regions, bucket fill, auto-clipped brush, stamps, eraser, fill clear.
- Paper tray with Blank + Dino Valley (standard two cards; age 2 two cards until Under the Sea lands).
- Age 2 variant (6 colors, 2 sizes, 3 stamps, 72px targets; blank + Dino Valley in this slice).
- Unit/e2e coverage, screenshot, performance/feel review.

**Slice 2 — Full paper collection:**
- Butterfly Garden and Under the Sea line art and regions.
- Four-card paper tray (three at age 2); per-sheet save verified across all sheets.

**Slice 3 — Polish:**
- Final art pass, sound, transitions, docs/ADR status, full regression.

## Out of scope

- Album/gallery of past artworks, export/share/print, cloud sync, multiple named canvases.
- Text tools, shapes/lines, patterns, rainbow/glitter brushes, sticker packs, pinch/zoom, rotate.
- Landscape-specific compositions, XR-specific layout, future worlds/coloring packs.
- Any branded characters, logos, or reference assets.

## Open questions

None. The grill settled the studio, both modes, the picker, protected line art, stamps, eraser, save model, age variant, and slice. The design was approved on 2026-10-25; ADR 0004 stays proposed until the Dino Valley slice passes the feel/performance review.
