# Mobile Games — Best Practices

Platform rules for touch-first games, distilled from Apple HIG, Google Material 3,
WCAG 2.5.5, thumb-zone research (Hoober/Clark), and web-game touch guides (MDN,
web.dev). Every game in this repo should satisfy the [compliance checklist](#8-compliance-checklist)
before shipping.

Sources: [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/) ·
[Material 3](https://m3.material.io/) ·
[WCAG target size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html) ·
[Thumb zone research](https://www.smashingmagazine.com/2016/09/the-thumb-zone-designing-for-mobile-users/) ·
[Touch controls for mobile web games](https://www.abratabia.com/game-controls/touch-controls.php) ·
[web.dev HiDPI](https://web.dev/articles/canvas-hidipi)

## 1. Touch targets

| Platform | Minimum size | Notes |
|---|---|---|
| iOS (HIG) | **44 × 44 pt** | |
| Android (Material 3) | **48 × 48 dp** | |
| WCAG 2.5.5 | **44 × 44 px** | AAA level wants 24px min at AA |

- ≥ **8 px spacing** between adjacent targets — prevents mis-taps.
- Keep interactive elements out of screen corners (system gesture conflicts).
- **Kid adjustment:** the *hit area* should be equal to or larger than the visual;
  young thumbs are imprecise. Prefer whole-cell buttons over small inline icons.
- This repo: `var(--touch-min)` is the shared minimum height — never go below it
  for anything tappable.

## 2. Thumb zones

- Primary / frequent actions live in the **lower 40–50%** of the screen ("green zone").
- Secondary and destructive actions belong in stretch zones (top, far corners).
- Eye-flow and thumb-path should follow the same route; the comfortable zone gets
  visual dominance.
- Test one-handed grip on a large device (~6.7") and with both thumbs.

## 3. Safe areas & orientation

- Never anchor interactive UI to raw screen edges. Use platform insets:
  `env(safe-area-inset-top)` / `-bottom` / `-left` / `-right`
  (this repo exposes them as `--safe-top` / `--safe-bottom`).
- Intrusions to respect: notch/Dynamic Island, home indicator, gesture bars,
  rounded corners, camera cutouts.
- Support portrait aspect ratios 16:9 → 21:9 and tablets (4:3 / 3:2).
- If a game locks orientation, declare it in the PWA manifest (repo convention:
  `orientation: "portrait"`); otherwise test both orientations.
- When content is letterboxed/scaled, compute scale from **both** axes:
  `scale = min(width/referenceW, height/referenceH)` — width-only scaling crops.

## 4. Viewport & touch (web games)

- `<meta name="viewport" content="width=device-width, initial-scale=1">` — kills the
  legacy 300ms tap delay on modern browsers.
- CSS `touch-action`:
  - `manipulation` on buttons/links (fast taps, keeps scroll/pinch);
  - `none` on play surfaces/canvases (game owns all gestures).
- `user-select: none` + `-webkit-touch-callout: none` on game surfaces — no text
  selection or long-press menus mid-play.
- Pointer Events over click for drag surfaces; `{passive:false}` only when calling
  `preventDefault()`.
- Track drags by `pointerId`; attach move/up listeners to `window` during a drag so
  leaving the element never strands the gesture.
- Multi-touch: lock one active pointer for the interaction; ignore others.
- HiDPI canvases: multiply internal resolution by `devicePixelRatio`, scale drawing
  ops back down.

## 5. HUD & readability

- HUD anchors to safe-area insets, not edges; glanceable hierarchy (state → score → meta).
- No text truncation across locales — test longest strings (de/fr translations run long).
- Numeric counters reserve growth room (score overflow past 5 digits shouldn't clip).
- **Effective font size after transforms**: any scaled layer must keep text ≥ ~12 px
  *on screen*. A 22px label inside a `scale(0.4)` world renders at ~9px — too small.
- Occlusion: hands sit at the bottom in portrait — keep critical info top, actions bottom.

## 6. Performance & sessions

- Target 30–60 fps on mid-tier devices; avoid per-frame layout reads
  (cache `getBoundingClientRect` once per frame, not per event).
- Short session loops (30 s – 2 min for kids); battery-aware effects (no always-on
  particles/haptics).
- Pause on tab blur (`visibilitychange`) — kids switch apps constantly.

## 7. Kids-specific adjustments

- Positive-only feedback (repo-wide rule): wrong input = silent/gentle visual, never punitive sound.
- Forgiving timing: generous windows, second chances, no fail-spirals.
- Pre-reader friendly: emoji/icon-first labels; localized strings kept short.

## 8. Compliance checklist

Per-release smoke pass, ~10 minutes:

- [ ] Every tappable element ≥ 44×44 px with ≥ 8 px spacing
- [ ] Primary action inside the lower thumb arc; no critical control in top corners
- [ ] Nothing clips into notch / home-indicator / gesture-bar zones (`--safe-*` used)
- [ ] Portrait **and** landscape verified (or orientation locked in manifest)
- [ ] Aspect ratios 16:9 → 21:9 render without cropping or horizontal scroll
- [ ] Scaled layers keep effective text ≥ ~12 px on the smallest supported device
- [ ] Drag surfaces use window-level pointer tracking + pointer-id lock
- [ ] `touch-action` correct per surface (`manipulation` vs `none`)
- [ ] Tab blur pauses gameplay; no leaked intervals/rAF after exit
- [ ] Longest locale string renders without truncation
- [ ] Wrong-input feedback is silent/gentle (positive-only audio rule)
- [ ] Best score/level persists across reload
