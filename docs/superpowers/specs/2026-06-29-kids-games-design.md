# Kids Games — Mobile Games for Ages 2-5

## Overview

Reimplementation of McDonald's Italy in-store touchscreen games as a mobile-friendly PWA for kids aged 2-5. Built with SvelteKit + static adapter + PWA. No backend, no database. Deployable to any static hosting.

## Stack

- **Framework:** Svelte 5 + SvelteKit
- **Build:** Vite
- **Adapter:** `@sveltejs/adapter-static` (pure static output)
- **PWA:** `vite-plugin-pwa` (service worker, offline support, manifest)
- **Audio:** Web Audio API + CC0 sound effects
- **Styling:** Scoped CSS within each component (no framework)
- **Targets:** iPhone 16, iPhone XR (mobile-first), any touch device

## Architecture

```
src/
  routes/
    +page.svelte               ← game hub (launcher)
    +layout.svelte             ← shell: nav, sound, fullscreen
    games/
      paint/                   ← /games/paint
      stickers/                ← /games/stickers
      memory/                  ← /games/memory
      puzzle/                  ← /games/puzzle
      pop/                     ← /games/pop
      soccer/                  ← /games/soccer
      sorting/                 ← /games/sorting
      splash/                  ← /games/splash
  lib/
    components/
      BackButton.svelte
      SoundToggle.svelte
      StarBurst.svelte
      Confetti.svelte
      AgeSelector.svelte
      GameLoader.svelte
    stores/
      settings.js              ← volume, age level, sound on/off
    sounds/
      audioManager.js          ← Web Audio API helper
    utils/
      touch.js                 ← touch event helpers
      animate.js               ← simple animation utils
      confetti.js              ← particle burst utility
```

## Shell (Layout)

All games share a thin shell:

- **Top bar:** Back button (long-press confirmed: hold 1.5s to prevent accidental exits for 2-year-olds) + sound toggle
- **Game area:** fills remaining viewport height, 100% width
- **No footer nav**
- **Safe areas:** respects iPhone notch and home indicator via `env(safe-area-inset-*)`
- **Fullscreen:** auto-enter on first tap via `element.requestFullscreen()`
- **Orientation:** portrait-locked via CSS (`@media orientation: landscape` → prompt to rotate)
- **Prevent back-swipe:** overscroll-behavior: none on body

## Game Hub (Home Screen)

- Grid of 8 game buttons (2 columns x 4 rows on phone)
- Each button: large emoji/icon + 1-2 word label below
- Tap to navigate to game route
- Settings bar at bottom: sound toggle + age slider (2-5)
- Difficulty set here is persisted in localStorage and passed to each game
- Kid lock: settings require long-press (3s) to prevent toddler navigation

## Game Designs

### 1. Paint
- **Mechanics:** Finger drawing on canvas. Select brush size (big/medium/small) + color palette. Stamp mode (star, heart, animals) places at tap location.
- **Age scaling:**
  - 2yo: 3 colors + big brush only + stamps
  - 5yo: 10 colors + 3 brush sizes + stamps + undo button
- **Clear:** long-press clear button to confirm
- **Layout:** canvas fills game area. Toolbar at bottom with color swatches + brush sizes + stamp tray.

### 2. Stickers
- **Mechanics:** Background scene selector (farm, ocean, space, jungle). Bottom tray of themed stickers. Drag onto scene. Pinch to resize. Tap to rotate.
- **Age scaling:**
  - 2yo: 4 stickers visible at a time
  - 5yo: scrollable tray, unlimited stickers
- **Clear:** button to remove all stickers (long-press confirm)

### 3. Memory
- **Mechanics:** Face-down card grid. Tap card to flip. Tap another. Match = celebration animation + sound. Mismatch = cards flip back gently.
- **Age scaling:**
  - 2yo: 3 pairs (2x3 grid), distinct emoji, cards stay flipped longer
  - 5yo: 8 pairs (4x4 grid), timer optional
- **Win:** all matched → confetti + "Good job" screen → tap to replay

### 4. Puzzle
- **Mechanics:** Image splits into pieces. Each piece draggable. Snap zone is generous (30% tolerance). Hints available.
- **Age scaling:**
  - 2yo: 2 pieces, semi-transparent ghost overlay
  - 5yo: 8 pieces, no hint
- **Win:** completed puzzle → star burst + applause → tap to replay
- **Images:** abstract shapes/patterns (SVG-generated, no external assets)

### 5. Pop!
- **Mechanics:** Bubbles/items float up from bottom. Tap to pop. Burst = particle effect + sound + vibration (Android).
- **Age scaling:**
  - 2yo: 2-3 items on screen, slow float speed, huge targets
  - 5yo: 10+ items, faster, combo multiplier
- **No failure:** items don't "escape", they just cycle

### 6. Mini Soccer
- **Mechanics:** Ball bounces gently. Tap anywhere → character kicks ball toward goal. Goal = crowd cheer + confetti.
- **Age scaling:**
  - 2yo: always scores regardless of tap position
  - 5yo: ball trajectory depends on tap offset, requires aim
- **Layout:** side-view field, goal on one side, character + ball on other

### 7. Sorting
- **Mechanics:** Items appear. Drag each into matching basket. Correct = happy sound + star. Wrong = gentle wobble, item returns.
- **Categories:** colors, shapes, fruits, animals (selected by age)
- **Age scaling:**
  - 2yo: 2 categories, 2 items each
  - 5yo: 4 categories, 8 items each
- **Win:** all sorted → celebration

### 8. Splash
- **Mechanics:** Tap anywhere → explosion of color/stars/rainbows + sound. No rules, no goal. Pure sensory play.
- **Age scaling:**
  - 2yo: big slow bursts, single tap
  - 5yo: trails follow finger, hold for continuous effect, pattern variations
- **No failure, no end state**

## PWA

- **Service worker:** precache all game assets, routes
- **Manifest:** app name "Kids Games", short name, theme color, 192+512 icons
- **Offline:** all games work fully offline after first load
- **Install prompt:** `beforeinstallprompt` event handled, show banner after 2 visits

## Audio

- **Web Audio API** with AudioContext for low-latency playback
- **Sound effects:** CC0 sources (mixkit.co, freesound.org) — tap, pop, match, win, cheer, splash
- **Synth sounds:** OscillatorNode for boops, chirps, jingles
- **Volume:** global setting persisted in localStorage

## Accessibility

- Minimum touch target 60x60px (guideline is 44px)
- High contrast color palette
- No text required for any game — icons + sound + color communicate
- Reduced motion: `prefers-reduced-motion` respected (use opacity transitions instead of movement)

## Deployment

- Static export via `@sveltejs/adapter-static`
- Host anywhere: Netlify, Cloudflare Pages, Vercel, GitHub Pages
- Environment variables: none required

## Age Scaling System

The age slider (2-5) adjusts:
- Touch target size (larger for younger)
- Number of items on screen
- Speed of animations / game pace
- Number of options/choices
- Complexity of rules
- Hint visibility

Setting is stored in localStorage and passed to each game via a store.

## File Conventions

- Each game is a Svelte route page: `src/routes/games/<name>/+page.svelte`
- Game-specific logic co-located: `<name>/game.js` for pure logic, `<name>/types.js` for constants
- Shared components in `src/lib/components/`
- No TypeScript (reduced complexity for this project)
- No external CSS framework
