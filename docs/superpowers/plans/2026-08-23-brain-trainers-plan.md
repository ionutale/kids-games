# Brain Trainers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the 4 Brain Trainers (Focus Tap, Quick Count, Speed Match, What Comes Next) with their shared kits and juice layer, per the 5 approved specs + 10 issues.

**Architecture:** Shared foundation modules (`src/lib/trainers/*` for logic, `src/lib/sounds/trainerSounds|trainerMusic.js` for audio), one route folder per trainer (`landing /play /play/[n]`), shared chrome components (GameShell, LevelBar, HudPill, WinOverlay). All randomness flows through an injectable seeded PRNG.

**Tech Stack:** SvelteKit + Svelte 5 runes, Vitest (`tests/unit`, `tests/behavioral`), Playwright (`tests/e2e`), Web Audio API, localStorage.

**Specs:** `docs/superpowers/specs/2026-08-23-*.md` — formulas there are binding; this plan references them rather than duplicating every table.
**Issues:** `docs/issues/trainers-01-kit.md` … `what-comes-next-02-juice.md`.

---

## File Structure

```
src/lib/trainers/
  rng.js            seeded PRNG factory (mulberry32)
  progress.js       loadLevel/saveLevel (current level only)
  emojiSets.js      CATEGORIES, LOOKALIKES, pickTarget, pickDistractors
  focusTap.js       levelConfig + distractor-tier logic (pure)
  quickCount.js     levelConfig + prompt/distractor generation (pure)
  speedMatch.js     levelConfig + deck generation (pure)
  whatComesNext.js  levelConfig/patternTier + prompt generation (pure)
  fx.css            .fx-pop .fx-wobble .fx-drain utilities
src/lib/sounds/
  trainerSounds.js  synth micro-events (levelTick/whoosh/readyTick/advancePop/slotChime/sparkle)
  trainerMusic.js   Theme Loop loader (HTMLAudio, loop, vol .2, settings-guarded)
src/lib/components/ui/WinOverlay.svelte   + badge snippet slot (backward compatible)
src/routes/games/focus-tap/**        (+ quick-count, speed-match, what-comes-next)
src/routes/+page.svelte              4 new hub cards
src/lib/stores/locale.js             new flat keys ×6 languages
static/sounds/music/{trainer}.mp3    CC0 loops (graceful no-op until files land)
static/sounds/fanfare.mp3            CC0 sting (synth fallback until file lands)
static/art/trainers/{trainer}/       Kenney accents (CSS fallback hero/badge until files land)
tests/unit/trainers/*.spec.js        vitest per module
tests/e2e/{trainer}.spec.js          playwright happy paths (seeded)
```

**Asset-sourcing reality note:** CC0 mp3/Kenney downloads require interactive sites; where files can't be fetched autonomously, code ships with graceful fallbacks (existing repo precedent: `playWinCheer` falls back to `playWin`) and gaps are recorded in `docs/free-assets.md`. No code blocks on assets.

---

### Task 1: trainers-01-kit — rng, progress, emojiSets (TDD)

**Files:** Create `src/lib/trainers/rng.js`, `progress.js`, `emojiSets.js`; Test `tests/unit/trainers/kit.spec.js`

- [ ] Write failing tests: mulberry32 determinism (same seed ⇒ same sequence); `loadLevel` default 1 / clamp garbage; `saveLevel` round-trip (mock localStorage); catalog has 6 categories ≥8 emojis; `pickDistractors(target,'cross',…)` excludes target category; `'lookalike'` draws only from LOOKALIKES partner sets; never includes target.
- [ ] Run `pnpm vitest run tests/unit/trainers/kit.spec.js` → FAIL (modules missing)
- [ ] Implement:
  - `rng.js`: `export function makeRng(seed=1){ let t = seed>>>0 || 1; return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ t>>>15, 1|t); r ^= r + Math.imul(r ^ r>>>7, 61|r); return ((r ^ r>>>14)>>>0)/4294967296; }; }`
  - `progress.js`: key = gameId converted to camelCase + `Level`; clamp `Math.max(1, parseInt(n)||1)`
  - `emojiSets.js`: CATEGORIES exactly as spec table; `LOOKALIKES` pairs from spec; `pickTarget(pool,rng)` uniform; `pickDistractors(target,tier,count,rng)` — tier ∈ 'cross'|'same'|'lookalike' mapping L-bands at call sites
- [ ] Tests PASS → commit `feat(trainers): shared kit — rng, progress, emoji sets`

### Task 2: trainers-02-assets-kit — sounds, music, fx, WinOverlay badge

**Files:** Create `src/lib/sounds/trainerSounds.js`, `trainerMusic.js`, `src/lib/trainers/fx.css`; Modify `WinOverlay.svelte`; Test `tests/unit/trainers/sounds.spec.js`

- [ ] Tests first: exports exist; calls before gesture / without AudioContext don't throw; music loader returns stop function; respects `$settings.soundEnabled`.
- [ ] `trainerSounds.js`: lazy AudioContext singleton; oscillator recipes — tick (1200Hz square 30ms), whoosh (filtered noise sweep 300ms), readyTick (2×tick 90ms apart), advancePop (pop + 900Hz blip), slotChime (E6→G6 sine pair), sparkle (C7-E7-G7 fast arp). Each takes `pitch=1` multiplier.
- [ ] `fanfare()` in trainerSounds: try `new Audio('/sounds/fanfare.mp3')`, playbackRate per game, catch → fall back to `playWin()`.
- [ ] `trainerMusic.js`: `startTrainerMusic(id)` / `stopTrainerMusic()` — HTMLAudio loop, volume .2, subscribes to settings, stops on store mute, SSR-safe.
- [ ] `fx.css`: `.fx-pop` scale bounce 250ms; `.fx-wobble` translateX ±4px shake 300ms; `.fx-drain` width linear transition helper class.
- [ ] WinOverlay: add optional `{#if badge}` snippet render above title; existing props untouched.
- [ ] Copy `static/sounds/kids-cheer.mp3` gap fix: ensure file served (verify exists in static; public is build output).
- [ ] Tests PASS → commit `feat(trainers): sound/music/fx kit + winoverlay badge`

### Task 3: Focus Tap core + juice (issues 02+07)

**Files:** Create `src/lib/trainers/focusTap.js`, routes `focus-tap/+page.svelte`, `play/+page.js`, `play/[n]/+page.svelte`, `tests/unit/trainers/focusTap.spec.js`, `tests/e2e/focus-tap.spec.js`; Modify hub `+page.svelte`, `locale.js`

- [ ] Unit tests: levelConfig caps (goal ≤20 @L15+, spawn floor 600ms, rise floor 4s); tier bands L1/L3/L6; forced-target rule.
- [ ] `focusTap.js`: `levelConfig(n)` per spec table; `tierFor(n)` → 'cross'|'same'|'lookalike'.
- [ ] Landing page: GameShell accent #C4B5FD, title, LevelBar `count=10 maxUnlocked=10 hrefFor=n→/play/n`, Play BigButton → `/play/{saved}`.
- [ ] `play/+page.js`: `redirect(307, ...)`.
- [ ] Round page: spawn loop (setInterval per config, paused on visibilitychange), items absolutely positioned, CSS transition bottom→top over riseTime; pointerdown single-touch lock; target tap → pop anim + playPop + caught++; distractor tap → add `.fx-wobble` 300ms silent; goal → WinOverlay (badge) with Next ▶ `/play/{n+1}`, Replay, Back links.
- [ ] Music start/stop on mount/destroy; sparkle on forced-target spawn; fanfare on Next press.
- [ ] Hub card `{ id:'focus-tap', icon:'🎯', key:'focusTap', accent:'#F87171' }`; locale keys `focusTap`, `catchTarget:'Catch {e}!'`, `play:'Play'`, `progress:'{a}/{b}'` ×6 langs.
- [ ] e2e seeded: landing→play, tap distractor (counter unchanged), reach goal via `[data-testid="target"]`, overlay visible, next link → n+1.
- [ ] Green → commit `feat(focus-tap): full trainer with stream, tiers, celebration`

### Task 4–6: Quick Count / Speed Match / What Comes Next (same shape)

Each mirrors Task 3's structure with its own pure module + spec formulas:

- [ ] **Quick Count** (`quickCount.js`): flash `max(800,3000−150n)`ms; count range `1..min(4+n,20)`; jittered grid placement (cell shuffle, no overlap); pills correct±1/2 unique clamped `[0,max+2]`; blur mid-flash restarts prompt; icons 🔢 accent #FDBA74. Commit `feat(quick-count): …`
- [ ] **Speed Match** (`speedMatch.js`): deck `8+min(n,12)`, window `max(1500,4000−100n)`ms, 50/50 same-different, ≤3 streak constraint (rejection-sample), trickiness bands; drain bar width = remaining%; expiry silent advance; wrong wobble stays; blur freezes timer (pause timestamps); icon 🃏 accent #93C5FD. Commit `feat(speed-match): …`
- [ ] **What Comes Next** (`whatComesNext.js`): `patternTier(n)` bands; unit builders AB/AAB/ABB/AABB/ABC/AABC/ABCC/growing `[A×k][B]`; strip = ≥2 reps + partial; answer deterministic; property test L1–30 prefix↔unit consistency; distractor category rules; icon 🔁 accent #6EE7B7. Commit `feat(what-comes-next): …`

### Task 7: Full verification

- [ ] `pnpm check` clean · `pnpm test` green · `pnpm test:e2e` green (4 new specs)
- [ ] Update CONTEXT.md TODO statuses → "Implemented"; mark issues checkboxes done
- [ ] Final docs commit if needed
