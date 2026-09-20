# Quiz Collection — Design (6 new picture-naming quizzes)

**Date:** 2026-09-20
**Status:** Approved scope (brainstorming session)
**Builds on:** Animal Quiz (the existing single-topic game this collection generalizes)

## Concept

Generalize Animal Quiz into a small **Quiz Collection**: one shared round engine, one data
module with one **Topic** per game, and a thin route per topic. Each quiz shows a big emoji,
three localized name buttons, advances on the correct pick, and ends with an All-done overlay.
Same mechanic as Animal Quiz, verbatim — only the content changes.

## Topics

| Topic id | Title key | Icon | Accent | Items |
|---|---|---|---|---|
| `animals` (= existing Animal Quiz) | `animalQuiz` | 🐾 | `#FDBA74` | 32 |
| `food` | `foodQuiz` | 🍎 | `#FCA5A5` | 20 |
| `vehicles` | `vehicleQuiz` | 🚗 | `#93C5FD` | 16 |
| `colorshapes` | `colorShapeQuiz` | 🔷 | `#C4B5FD` | 14 (8 colors + 6 shapes) |
| `clothes` | `clothesQuiz` | 👕 | `#F0ABFC` | 14 |
| `toys` | `toyQuiz` | 🧸 | `#FDE68A` | 14 |
| `instruments` | `instrumentQuiz` | 🎸 | `#6EE7B7` | 12 |

Routes: `/games/animal-quiz` (existing URL, unchanged) plus `/games/food-quiz`,
`/games/vehicle-quiz`, `/games/color-shape-quiz`, `/games/clothes-quiz`, `/games/toy-quiz`,
`/games/instrument-quiz`. New hub tiles + locale keys per game.

## Data model

`src/lib/quiz/topics.js` (replaces `src/lib/animalQuizData.js`; the animals array moves here
unchanged):

```js
export const LOCALES = ['en', 'it', 'ro', 'de', 'fr', 'zh'];

export const TOPICS = {
  animals: { id: 'animals', icon: '🐾', accent: '#FDBA74', items: ANIMALS },
  food: { id: 'food', icon: '🍎', accent: '#FCA5A5', items: FOOD },
  // …
};
```

Every item is `{ emoji, en, it, ro, de, fr, zh }` — all six locales required.

## Engine

`src/lib/quiz/round.js` — pure, unit-testable helpers:

- `itemsFor(topicId)` → the topic's item array.
- `buildOptions(item, items, lang, rng = Math.random)` → three `{ name, correct }` entries
  (one correct + two wrong names from other items), shuffled.

`src/lib/components/QuizGame.svelte` — the round UI, extracted from the current animal-quiz
page. Prop: `topic` (topic id). Behavior identical to today:

- Title (`icon + topic title`), `n / N` progress, big emoji card.
- Three name buttons (large, stacked, `--touch-min`); wrong pick → red shake + `playTap()`,
  stays, no progress; correct pick → green pop + Confetti + `playMatch()`, next item after
  1.5 s.
- After the last item → `WinOverlay` ("All done!") with a Play Again button that restarts.
- Item order is the data order (like Animal Quiz); option order is shuffled.
- Names render in the app locale (`$locale`).

Each route page is a thin wrapper: `<QuizGame topic="food" />` etc.

## Tests

- **Unit — data integrity** (`tests/unit/quiz-topics.test.js`): for every topic — ≥12 items,
  unique emojis, every locale non-empty, **names unique within each locale** (duplicate names
  would render two seemingly-correct options).
- **Unit — round helpers** (`tests/unit/quiz-round.test.js`): `buildOptions` returns 3 unique
  names, exactly one correct, uses the requested locale, honors an injected rng; unknown
  topic id yields an empty list.
- **Behavioral** (`tests/behavioral/animal-quiz.test.js`): rewritten to exercise the real
  `buildOptions` instead of a copied algorithm.
- **E2E** (`tests/e2e/quizzes.test.js`): loops all six new routes — card + progress visible,
  exactly 3 options, wrong option shakes and does not advance, correct option advances.
  Animal Quiz's existing unit/behavioral/e2e tests remain as the regression net (import paths
  updated only).

## Docs

- New spec (this file).
- `CONTEXT.md` gains a **Quiz Games** section: *Topic*, *Item*, *Quiz Round*.
- Animal Quiz's data module reference changes to `src/lib/quiz/topics.js`.

## Out of Scope (v1)

Per-topic difficulty levels, saved progress, extra round mechanics, audio beyond the existing
`playTap`/`playMatch` calls, and translating UI chrome beyond the six new title keys.
