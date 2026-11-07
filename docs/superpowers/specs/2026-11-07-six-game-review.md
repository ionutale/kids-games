# Six-game review — PRDs and ticket sets

- **Date:** 2026-11-07
- **Scope:** the six redesign PRDs and their 24 tickets, checked against each other and the current engines/tests.
- **Method:** section/structure audit, decision-to-ticket cross-check, dependency check, engine/test comparison, and the prototype/browser pass.
- **Verdict:** **no blockers.** The six PRDs are implementable. Three cross-cutting decisions should be made once, before the first implementation, and eight small documentation inconsistencies should be fixed.

## What is consistent

- Every PRD has the same shape: Problem, Solution, 30 user stories, Implementation Decisions, Testing Decisions, Out of Scope, Further Notes.
- Every ticket has What to build, acceptance criteria, and a Blocked by section. The dependency graph is a simple DAG per game: **core → juice → devices → content**, with devices also depending on juice. There are no cycles or dangling references.
- The shared contracts are respected everywhere: the 10-step ladder and saved level/mastery for the five ladder games, no ladder for Spot the Difference, the hub entry, the sound toggle, and no new dependencies.
- The hard-won decisions are consistently carried into the tickets: Pop's 30-second round and Good Try, Soccer's five always-played shots and per-level stars, Focus Tap's firefly jar and goal 6 + level, Quick Count's 1–3/1–6/1–8/1–10 ramp, Spot's 5-puzzle flat set and postcard album, and Path Builder's freehand road with no grid.
- Testing seams are named (route roots, panels, rings, HUD, cards) and the prior-art test files exist, with one exception noted below.

## Major findings — decide before implementing

### 1. Localization is missing from all six

`src/lib/stores/locale.js` carries six locales (en, it, ro, de, fr, zh). The prototypes hardcode English, and no PRD or ticket mentions locale keys for the new copy. Every new visible string — prompts, Good Try / set-complete cards, Play again, Postcard added, set labels, button labels — needs six entries, or the new games will ship in English inside a multilingual app.

**Recommendation:** add one cross-cutting ticket that adds the new keys and a `tests/unit/locale-parity.test.js` (same key set in all six locales, no empty values). Do it before the first game so each game only adds its own keys.

### 2. No deterministic seed hook for Path Builder, Pop, Soccer or Spot

Focus Tap and Quick Count already take a seed from the route load. The other four generate from `Date.now()`. E2E can still find cells by comparing DOM props, but drawing a known Path Builder road, reproducing a Pop spawn pattern, timing a Soccer keeper, or comparing a Spot pair is fragile without a seed.

**Recommendation:** give every scene/round generator an explicit seed, and expose a dev/test-only `?seed=` on the route (or seed from the load function). Add it as an acceptance criterion in each core ticket. Focus Tap and Quick Count keep their existing seed path.

### 3. Six sound modules, six AudioContexts, no shared mute path

Each PRD adds its own palette: forest (Path Builder), pond (Pop), stadium (Soccer), pond (Focus Tap), picnic (Quick Count), harbor (Spot). Each prototype built its own `new AudioContext` and its own `get(settings).soundEnabled` check. That is six copies of the same lifecycle and mute logic, and a risk of contexts left open after navigation.

**Recommendation:** one shared sound helper (extend `src/lib/sounds/audioManager.js` or add `createGameSound`) that owns the context, the mute check, and teardown. Each game supplies note recipes only. Add the reduced-motion JS helper at the same time: the global CSS clamps CSS animations, but not rAF-driven walkers, keepers or bubble motion, so every devices ticket still needs a JS check.

### 4. Design overlap: Pop and Focus Tap are both moonlit ponds

This bends the global “distinct world per game” decision. It is not a doc contradiction — the user chose each world knowingly — but the two games will sit next to each other in the hub with the same biome. Either accept it explicitly as a two-pond family, or differentiate one sub-world (for example, Pop stays the moonlit pond with a jar; Focus Tap becomes a dusk firefly marsh with reeds and a frog). Also note the bear appears as the Quick Count asker and the Soccer keeper; that is a smaller overlap.

## Minor documentation contradictions to fix

1. **Focus Tap item cap.** `focus-tap-06` says “Five items on screen at most”. The engine (`levelConfig.maxItems = 6`) and the PRD (“six on screen max”) say six. Change the ticket to six.
2. **Soccer core rule.** `soccer-01` says the keeper patrols and dives, but not that the **result uses the keeper’s x at release** and the **impact point**, nor that **swipe length only sets flight time**. The PRD has all three; add them to the ticket.
3. **Spot old tests.** `spot-the-difference-02` says the old generator is retired, but not its unit test. The PRD says retire the generator **and its unit tests**. Add “replace `tests/unit/spot-difference.test.js` with the new scene tests”.
4. **Focus Tap test claim.** The PRD says “reuse the existing `focusTap` engine tests”, but there is no `tests/unit/focusTap.test.js`; only the e2e suite exists. Change to “add unit tests for `focusTap.js` (goal, tiers, spawns)”.
5. **Quick Count zero option.** “Unique, non-negative” allows 0 as a distractor (1 − 1). For a 3-year-old counting objects that are never absent, prefer ≥1. Decide and update the PRD/ticket.
6. **Path Builder ghost hand.** The PRD says “first-ever road once”; ticket 04 says “once per device”. Pick one and name the storage key (for example `path-builderGhostSeen`). Per device is the friendlier default.
7. **Quick Count count source.** The new ramp (1–3, 1–6, 1–8, 1–10) conflicts with `levelConfig.max = min(4 + level, 20)`. Say whether the production changes `levelConfig.max` or adds a separate `countMax`, so the engine and the UI cannot drift.
8. **Soccer bounds wording.** The PRD says the mouth was “tall” and becomes “wide”; it is already wide, and the change is wide-and-shallow (y 2–24 → 4–14). Reword to “wide and shallow”.

## Nits and handoff notes

- The prototype branches are **reference only**. `prototype/soccer` also edits `src/lib/soccer/engine.js`, and every prototype adds a `?variant=` hook to a real route. Do not merge the branches wholesale; rebuild from the PRDs/tickets on `main`.
- The hub registry uses an emoji icon plus a title key (`🔍`, `🎯`, `🔢`). The PRDs keep the hub entry unchanged, so the hub will still advertise the old iconography. Either accept that or add a small hub pass (icon/tagline) after the six implementations.
- Path Builder user story 29 says the Guide is generated from the Scene, but no acceptance criterion says so. Add “the Guide is a valid route derived from the scene”.
- The six devices/a11y tickets repeat the same checklist. That is fine for tracking, but implement them from one shared checklist to avoid six subtly different gates.
- Soccer’s current `targetScoreFor` (2→8) and `starsFor(wasted)` are replaced by the new target 3→5 and stars-by-goals. The ticket set covers both; the engine unit tests must be rewritten, not just extended.
- Spot’s prototype bug (difference props rendered without an `id`, breaking the keyed each) is fixed on the prototype branch. The production scene generator should give every rendered prop a stable id.

## Per-game audit

| Game | PRD ↔ tickets | Main risk | Verdict |
|---|---|---|---|
| Path Builder | Consistent; 4 tickets, core 03 | Freehand collision feel; guide derivation; seed for E2E | Ready after the ghost-hand and guide clarifications |
| Pop | Consistent; 4 tickets, core 01 | A long swipe can trivialise the jar target; tune chain radius | Ready |
| Soccer | Mostly consistent; 4 tickets, core 01 | Engine rewrite (`goalBounds`, `targetScoreFor`, `starsFor`); release-time rule missing from ticket 01 | Ready after ticket 01 criteria |
| Focus Tap | One count contradiction; 4 tickets, core 03 | No unit test for the engine; six vs five items | Ready after the two-line fix |
| Quick Count | Count source ambiguity; 4 tickets, core 03 | Replacing distinct emoji with repeats; 0 option; no unit test yet | Ready after the count-source and zero decisions |
| Spot the Difference | Consistent; 4 tickets, core 02 | Replacing the grid engine; 320px prop density; album storage fallback | Ready after the old-test retirement note |

## Recommended order

1. **Cross-cutting first:** locale keys + parity test; shared sound/mute helper; reduced-motion JS helper; deterministic seed hook. These touch all six, so doing them once avoids six divergent implementations.
2. **Path Builder** — the largest new engine and the biggest interaction risk; derisk it first.
3. **Pop** — a new timed loop; establishes the jar/Good Try pattern.
4. **Soccer** — shared-engine rewrite; do it before the simpler world swaps while the engine context is fresh.
5. **Focus Tap** — world swap over a stable engine.
6. **Quick Count** — world swap plus the content-ramp change.
7. **Spot the Difference** — self-contained, no ladder; a clean finish.

Within every game: **core → juice and sound → devices/a11y → content/levels**. Do not start a juice ticket before its core is merged; do not start a devices ticket before sound, because the muted path is part of the gate.

## Pre-implementation checklist

- [ ] Add the new copy to all six locales and a parity test.
- [ ] Decide the shared sound/mute helper and the reduced-motion helper.
- [ ] Add a seed parameter/`?seed=` to Path Builder, Pop, Soccer and Spot.
- [ ] Fix the eight minor contradictions above.
- [ ] Decide the Pop/Focus Tap pond overlap.
- [ ] Decide whether the hub icon/tagline gets a small pass.
- [ ] Mark the prototype branches as reference-only; do not merge them.
- [ ] Rewrite (not just extend) the Soccer engine unit tests for the new target and star rules.
