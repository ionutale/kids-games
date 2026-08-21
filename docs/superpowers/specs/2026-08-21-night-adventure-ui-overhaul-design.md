# Night Adventure UI Overhaul — Design Spec

**Date:** 2026-08-21
**Status:** Approved design, pending implementation plan
**Scope:** Visual overhaul of hub + all 11 games with a shared "Night Adventure" design system

## Overview

Replace the current plain white-on-pale-blue UI with a cohesive **Night Adventure** theme: deep-space gradients, twinkling starfields, glass panels, glow accents. Introduce a shared component library so every game looks and behaves like part of one app, with larger touch targets for kids.

This is a **pure visual + navigation-polish change**: game logic, rules, sounds, difficulty tuning, and localStorage keys are untouched.

## Goals

1. One consistent visual language across hub and all 11 games
2. Playful, polished night-sky aesthetic kids find exciting ("big kid" feel)
3. Shared UI components eliminating ~6× duplicated overlay/level/HUD styles
4. Kid usability: ≥64px touch targets, high contrast, forgiving hit areas
5. Existing unit/behavioral tests pass unmodified; e2e selectors preserved wherever possible

## Non-goals

- No new gameplay features, levels, or sounds
- No intermediate game-detail pages (tap launches the game directly — toddlers)
- No backend/accounts/analytics
- No light-mode variant

## Design Tokens (`src/app.css`)

| Token | Value | Use |
|---|---|---|
| `--bg-space-1` | `#0A1128` | background gradient top |
| `--bg-space-2` | `#1B2A4A` | background gradient mid |
| `--bg-space-3` | `#2D4373` | background gradient bottom |
| `--panel-glass` | `rgba(255,255,255,0.08)` | card/panel fill |
| `--panel-border` | `rgba(255,255,255,0.16)` | card/panel border |
| `--text-hi` | `#EAF2FF` | primary text |
| `--text-lo` | `#CFE4FF` | secondary text |
| `--gold` | `#FFE082` | titles, highlights |
| `--glow-gold` | `rgba(255,224,130,0.45)` | title text-shadow |
| `--cyan` | `#7FD8FF` | primary actions, active states |
| `--btn-gradient` | `linear-gradient(135deg,#9FE4FF,#5BC2F0)` | primary button fill |
| `--purple` | `#A78BFA` | decorative accent |
| `--mint` | `#6EE7B7` | success |
| `--warn` | `#FF9B9B` | timers/warnings |
| `--radius-card` | `20px` | cards, panels |
| `--radius-btn` | `22px` | buttons |
| `--touch-min` | `64px` | minimum touch target |

Backgrounds use a layered gradient `linear-gradient(180deg, var(--bg-space-1), var(--bg-space-2) 55%, var(--bg-space-3))`. Panels are glass: `var(--panel-glass)` fill + `1px solid var(--panel-border)` + `backdrop-filter: blur(6px)`.

### Per-game accent hues

Each game sets `--accent` on its root element; glows, borders and highlights derive from it.

| Game | Accent |
|---|---|
| paint | `#FF8FB1` pink |
| memory | `#7FD8FF` cyan |
| soccer | `#FFE082` gold |
| splash | `#6EE7B7` mint |
| pop | `#C4B5FD` lavender |
| sorting | `#FCA5A5` coral |
| puzzle | `#93C5FD` sky blue |
| stickers | `#F0ABFC` magenta |
| tower-defense | `#F87171` red |
| animal-quiz | `#FDBA74` orange |
| glossary-puzzle | `#5EEAD4` teal |

### Typography

- **Fredoka** (400–700), self-hosted WOFF2 files in `/static/fonts`, registered via `@font-face` with `font-display: swap`. No CDN dependency — the PWA must work offline.
- Fredoka is the default UI font; fallback stack `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`.

### Motion

Shared keyframes defined once in `app.css`: `twinkle` (star opacity), `floaty` (gentle vertical bob), `pop-in` (scale+fade entrance), `glow-pulse` (accent box-shadow breathing).

All nonessential animation is disabled under `prefers-reduced-motion: reduce` (stars render statically, no float/pulse/entrance motion).

## Shared Components (`src/lib/components/ui/`)

Built with Svelte 5 runes, matching existing component conventions.

### `Starfield.svelte`
CSS-only twinkling star layer positioned absolute behind content.
- Props: `count = 40`

### `GameShell.svelte`
Replaces per-page top-bar chrome. Owns the starfield background, back button, sound toggle, and HUD row.
- Props: `accent` (hex string)
- Slots: `hud-left`, `hud-right` (pill positions), default slot = playfield
- Renders `.back-btn` (existing BackButton) and sound toggle; keeps class names stable for e2e

### `WinOverlay.svelte`
Unified victory screen. Dark scrim + built-in `<Confetti />` + glowing gold title.
- Props: `title`, `subtitle?`
- Slot: `actions` — caller supplies its own buttons (preserving game-specific classes like `.next-btn`, `.replay-btn`)
- Container keeps `.win-overlay` class

### `LevelBar.svelte`
Numbered level picker used by pop/soccer/puzzle/sorting.
- Props: `current`, `onchange(level)`
- Keeps `.level-bar`, `.level-btn`, `.active` classes

### `LevelDots.svelte`
Progress dots used by memory (and hub progress hints).
- Props: `total`, `current`, `unlocked`
- Keeps `.level-dot` classes

### `HudPill.svelte`
Score/time/status pill.
- Props: `icon?`, `label`, `tone: 'default' | 'warn' = 'default'`
- Keeps `.hud-item` / `.hud-warn` classes

### `BigButton.svelte`
Primary CTA / ghost secondary.
- Props: `variant: 'primary' | 'ghost' = 'primary'`; forwards `onclick`; caller may add extra classes

## Hub Redesign (`src/routes/+page.svelte`)

- Full-screen starfield over the space gradient; glowing gold title
- Responsive glass grid of game cards: 2 columns (phone) → 3 (≥480px) → 4 (≥768px)
- Each card: emoji icon with drop-shadow glow in the game's accent hue, localized label, gentle `floaty` animation with staggered delays, press scale feedback
- Memory card shows a mini unlocked-level dot hint (cheap localStorage read); other cards show no progress hint
- Tap launches the game directly
- Settings stays as today's slide-up bar triggered from the ⚙️ corner button, restyled to theme

## Migration Plan (big-bang)

Single branch; all pages rewritten against the new system before merge.

Changed/new files:
1. `src/app.css` — full token set, keyframes, font-face, base styles
2. `static/fonts/fredoka-*.woff2` + `@font-face` registration
3. `src/lib/components/ui/{Starfield,GameShell,WinOverlay,LevelBar,LevelDots,HudPill,BigButton}.svelte`
4. `src/routes/+layout.svelte` — shell chrome simplified (install banner unchanged); top-bar responsibility moves into GameShell
5. `src/routes/+page.svelte` — redesigned hub
6. All 11 `src/routes/games/*/​+page.svelte` — adopt GameShell + shared components, reskinned internals, per-game accent

Untouched: all game logic modules (`src/lib/*` engines/stores/sounds except styling-neutral imports), route params, localStorage keys, locale store and translation keys, PWA manifest/service worker behavior.

### Class-name preservation contract

These selectors must continue to exist (e2e depends on them): `.game-btn`, `.grid`, `.card`, `.card-front`, `.card-back`, `.flipped`, `.matched`, `.showcasing`, `.sparkle`, `.level-label`, `.level-dots`, `.level-dot`, `.win-overlay`, `.next-btn`, `.replay-btn`, `.score-text`, `.hud-item`, `.hud-warn`, `.level-bar`, `.level-btn`, `.active`, `.back-btn`, `.bubble`, `.settings-trigger`. If a rewrite cannot preserve one, the corresponding e2e test is updated in the same commit.

## Error Handling

- Font fails to load → system fallback stack via `font-display: swap`; layout must not shift critically
- `backdrop-filter` unsupported → panels fall back to solid `rgba(27,42,74,0.92)` via `@supports not` rule
- `prefers-reduced-motion` → static stars, animations off
- No JS-level error handling changes required (logic untouched)

## Testing & Verification

1. `pnpm run lint` — svelte-check clean
2. `pnpm test` — unit + behavioral suites pass **unmodified** (proves logic untouched)
3. `pnpm test:e2e` — passes; update only tests whose selectors could not be preserved (same commit as the change)
4. Manual smoke: launch dev server, walk through hub + every game (launch, interact, win path), review screenshots in desktop + mobile viewport

## Risks

| Risk | Mitigation |
|---|---|
| Big-bang diff is large and hard to review | Component library lands first in its own commits; page rewrites follow mechanically; full test suite gates merge |
| Dark theme hurts readability for youngest users | High-contrast text tokens (#EAF2FF on deep navy ≈ 13:1), large type, tested manually at small viewports |
| E2e selector drift | Explicit preservation contract above |
