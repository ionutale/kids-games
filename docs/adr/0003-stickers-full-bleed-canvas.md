---
status: proposed
---

# Stickers uses one full-bleed canvas per world

The old Stickers game was a reskinned prototype: a blank cream page, four scene buttons that only swapped the tray, a phantom drag from the tray, and no save. The redesign follows the owner's McDonald's in-store reference: one full-bleed illustrated world, a bottom shelf of die-cut stickers, drag from the shelf to the canvas, and drag back to the shelf to peel. V1 ships Dino Valley only. The save schema and art system are keyed by world, so Coral Bay, Space Camp, and Moonlit Meadow can be added later without an album or page model.

The game uses original low-poly SVG art in the repo, white die-cut borders, and bright late-afternoon light. It is drag-only: no pinch, no rotate, no per-sticker menu. Every sticker type is infinite; the canvas soft-caps at 80 placed stickers, and a drag back to the shelf removes one. The canvas auto-saves to localStorage and reset is a two-step confirmation. This route does not use the app's dark `GameShell`; the world fills the screen and the controls float.

The reference is a model, not a brand copy: original worlds and characters only.

## Consequences

- The game is immersive and toddler-legible, but it gives up the app's dark chrome and the old scene selector.
- One world at launch means less variety; adding worlds needs a picker screen and per-world art/shelf entries.
- No resize/rotate means less creative control for a 5-year-old; a selected-sticker toolbar can be added later if needed.
- The soft cap plus peel keeps performance bounded without a delete UI, but a child can still fill the canvas with one sticker.
- The custom SVG art system is a real cost; the first vertical slice should prove the style and drag feel before the full sticker set.
- The ADR stays `proposed` until the Dino Valley slice passes the XR acceptance and the art/drag feel is reviewed.
