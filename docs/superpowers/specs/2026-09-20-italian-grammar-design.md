# Italian Grammar Game — Design

**Date:** 2026-09-20
**Status:** Approved scope (brainstorming session)
**Route:** `/games/grammar`

## Concept

A touch grammar trainer for Italian-speaking kids (ages 4–8): complete sentences and match
pictures to sentences. Content is **always Italian**; UI chrome follows the app locale. Same
positive-only feel as the other trainers: silent wrong, celebration on round end.

## Exercise Types

1. **Completa** — a sentence with a `___` blank and three word buttons.
   - *verb*: `Io ___ andare` → voglio / vuoi / vuole
   - *article*: `___ zaino` → lo / il / la
   - *plural*: `il gatto → ___` → i gatti / le gatte / il gatti
   - *preposition*: `Andiamo ___ bici` → in / a / con
   - *imperative*: `___ la pala!` → Prendi / Prendiamo / Prendete
2. **Immagine → frase** — a scene emoji and three full sentences.
   - 🍦 → «Andiamo a prendere un gelato» / «Prendi la pala» / «Giochiamo insieme»

All exercises render as: prompt card (big text, or big emoji for pictures) + three large
option buttons.

## Level Ladder (1–10, no Level Bar)

Advance with **Next Level ▶** after a win; Replay restarts the level; progress saved via
`src/lib/trainers/progress.js` (key `grammar`). Levels 1–10 are distinct; 11+ plateaus on the
mixed pool.

| Level | Focus |
|---|---|
| L1 | volere: io voglio / tu vuoi / lui vuole |
| L2 | verbi in -are (giocare, andare, mangiare) |
| L3 | verbi in -ere/-ire (prendere, dormire, leggere) |
| L4 | articoli determinativi il/lo/la/i/gli/le |
| L5 | indeterminativi un/uno/una + singolare→plurale |
| L6 | preposizioni semplici (in/a/con/per/da) |
| L7 | imperativi e frasi di gioco |
| L8 | immagini → frasi (scene semplici) |
| L9 | immagini → frasi (distrattori simili) |
| L10 | misto, tutti i tipi |
| L11+ | plateau su L10 |

Round length: `roundGoal(level) = 4 + min(level, 6)` (5–10 exercises).

## Interaction Rules

- Wrong pick: silent red shake, exercise stays, no progress.
- Correct pick: green pop + `playMatch()`, next exercise after 1.5 s.
- Round end: `WinOverlay` ("Well done!") with **Next Level ▶** (`fanfare`), **Replay**, **Back**.
- No theme music (no asset); SFX only.
- The play component rebuilds the round whenever the route hands it a new level/seed
  (reactive-level pattern used by the other trainers).

## Data Model

`src/lib/grammar/italian.js`:

```js
export const LEVELS = {
  1: [ { type: 'verb', prompt: 'Io ___ andare', options: ['voglio','vuoi','vuole'], answer: 0 }, … ],
  // …10
};

export function exercisesFor(level); // clamps to 1..10
export function roundGoal(level);    // 4 + min(level, 6)
```

Exercise shape: `{ type, prompt, options: [string, string, string], answer: number, emoji? }`
where `emoji` is present for picture exercises. Every prompt for non-picture types contains
`___`; options are unique within an exercise and the answer index is valid.

## Files

- `src/lib/grammar/italian.js` — data + helpers.
- `src/lib/components/GrammarGame.svelte` — engine (level/seed props, round state, reset).
- `src/routes/games/grammar/+page.svelte` — landing (TrainerLanding, `showLevels={false}`, no music).
- `src/routes/games/grammar/play/+page.js` — redirect to the saved level.
- `src/routes/games/grammar/play/[n]/+page.js` + `+page.svelte` — play route (saves level, `?seed=`).
- `src/routes/+page.svelte` — hub tile `🇮🇹`.
- `src/lib/stores/locale.js` — `grammar`, `grammarTagline`, `whichSentence` keys in 6 locales.
- `TrainerLanding.svelte` — new `music = true` prop (grammar passes `false`).

## Testing

- **Unit** (`tests/unit/grammar.test.js`): levels 1–10 present; ≥6 exercises per level; each
  exercise has a known type, non-empty prompt (or emoji for pictures), exactly 3 unique
  options, valid answer index; picture exercises carry an emoji; non-picture prompts contain
  `___`; `roundGoal` grows then caps; `exercisesFor(11+) === exercisesFor(10)`.
- **E2E** (`tests/e2e/grammar.test.js`): landing without Level Bar + Play link; L1 shows card +
  3 options; wrong option shakes and does not advance; correct option advances; winning shows
  the overlay; Next Level loads a fresh L2 round (no stale board); Replay restarts the level.

## Glossary (added to CONTEXT.md)

**Exercise**, **Prompt**, **Option**, **Level** for the Italian Grammar Game.

## Out of Scope (v1)

Other languages' grammar, free-text answers, speech audio, grammar explanations/theory
screens, streak tracking.
