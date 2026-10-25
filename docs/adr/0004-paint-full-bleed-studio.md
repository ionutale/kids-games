---
status: proposed
---

# Paint uses a full-bleed studio with protected-line coloring

The shipped Paint game is a blank white canvas inside the app's dark `GameShell`: six small color dots, three brush sizes, emoji stamps, an instant clear, no undo, and no save. The owner's reference is the live page at `https://kids-2-5.aiu-media.com/games/paint` and the request for a bigger, more appealing canvas. The redesign makes the paper the place: a fresh white sheet runs edge to edge, with a warm floating studio dock and cream corner chips instead of the dark frame.

V1 ships blank paper plus three original coloring sheets: Dino Valley, Butterfly Garden, and Under the Sea. The sheet determines the mode; there is no separate Free/Coloring toggle. A paper-chip tray switches sheets and saves each one. Blank paper paints freely. Coloring sheets use original SVG line art with named regions: the bucket fills a region, the brush auto-clips to the region under the finger, stamps place as discrete stickers over the art, and the eraser removes paint or clears a fill. The line art is never painted over. The studio offers eight colors, three brush sizes, four SVG stamps, eraser, 20-step undo, and a two-step clear; age 2 gets six colors, two sizes, three stamps, two coloring sheets, and 72px targets.

The document is a per-sheet vector save in `localStorage` (`kids-games-paint`, version 1): fills by region id, strokes with normalized/thinned points and an optional region clip, and stamps. It saves after actions and on switch/back/pagehide. There is no album, export, or cloud sync in v1. The alternative — one raster canvas with a flood-fill bucket and no region clipping — is simpler, but it lets the brush destroy the line art and makes per-sheet editing/save a stack of images. The protected-line model costs region-aware art, clipping, hit-testing, and a command-stack undo; the slice exists to prove that cost is worth the magic.

## Consequences

- Paint becomes an immersive studio rather than a canvas inside a shell; it gives up the app's dark chrome and the old bottom bars.
- The line art must be authored as named, closed regions for every coloring sheet; that is real art and testing work, not a CSS skin.
- Per-sheet saving means four documents and no album; a child can return to each sheet, but there is no gallery of past artworks.
- The brush is deliberately constrained on coloring sheets; a child who wants to scribble over the lines should use blank paper.
- Stamps can overlap the line art, so "protected" applies to paint, not stickers.
- The ADR stays `proposed` until the Dino Valley slice passes the visual/feel review and the 30fps/p95 performance bar on the target phone.
- Future coloring packs are new line-art sheets and region maps; the canvas, tools, save, and undo stay the same.
