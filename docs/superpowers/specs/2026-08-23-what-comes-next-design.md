# What Comes Next — Design (Brain Trainer 4 of 4)

**Date:** 2026-08-23
**Status:** Approved scope (grill-with-docs session)
**Collection:** Brain Trainers — see shared decisions in `2026-08-23-focus-tap-design.md` ("Collection-wide decisions"); they apply verbatim to this game.

## Concept

Elevate-inspired pattern-completion trainer. The child sees a **Prompt Strip** — an emoji sequence following a repeating **Pattern Unit** with one missing slot (❓) — and completes it by choosing from 3 options. Patterns follow a fixed pedagogical arc from simple alternation to growing patterns, mirroring preschool pre-math curricula.

Cognitive skill trained: pattern recognition, logical reasoning, pre-math sequencing.

## Routes

| Route | File | Behavior |
|---|---|---|
| `/games/what-comes-next` | `src/routes/games/what-comes-next/+page.svelte` | Landing: LevelBar + Play |
| `/games/what-comes-next/play` | `src/routes/games/what-comes-next/play/+page.js` | Redirect to saved level |
| `/games/what-comes-next/play/[n]` | `src/routes/games/what-comes-next/play/[n]/+page.svelte` | The round; saves *n*; accepts `?seed=` |

## Core Loop

1. A Prompt Strip renders: complete visible units + a partial unit, ending in one ❓ slot. The strip always shows the full Pattern Unit at least twice before the slot.
2. Three option buttons below: correct next emoji + 2 distractors.
3. Correct tap → satisfying pop sound; ❓ fills with the chosen emoji (brief scale-in); next prompt after ~500 ms.
4. Wrong tap → silent wobble; prompt stays until correct choice (no fail state).
5. After `goal` solved prompts → Celebration Sequence (WinOverlay + cheer) with **Next Level ▶ / Replay / Back**.

## Level Ladder (unbounded)

Two axes: pattern complexity via a fixed pedagogical arc, and emoji discrimination difficulty.

### Pattern Arc (`patternTier(n)` — pure, unit-tested)

| Tier | Levels | Pattern Units |
|---|---|---|
| 1 | L1–2 | AB |
| 2 | L3–4 | AAB · ABB · AABB |
| 3 | L5–6 | ABC · AABC · ABCC |
| 4 | L7+ | Growing patterns: blocks `[A×k][B]` for k = 1, 2, 3 … shown as complete blocks (🍎🍌 🍎🍎🍌 🍎🍎🍎🍌); the answer is always the first element of the next block |

Rules:
- Within a prompt, all As are the same emoji, all Bs another, all Cs a third (drawn from distinct categories at low levels).
- Slot position: always the item immediately after the visible prefix; the correct answer is deterministic from the unit.
- Prompt shows ≥ 2 full repetitions of the unit before the slot (growing tier: ≥ 3 complete blocks).

### Emoji discrimination axis

| Levels | Distractor source |
|---|---|
| L1–5 | Different categories than the pattern emojis |
| L6+ | Same category / lookalike pairs from the shared catalog |

## Round Goal

Solve `4 + min(n, 6)` prompts correctly per round (goal-driven, no timer).

## Interaction Rules (positive-only)

- Wrong taps: wobble only — silent, non-counting.
- Options are large tappable buttons (`--touch-min`); 3 options always, shuffled left-to-right by seeded rng.
- Audio: `playPop` (correct), `playWinCheer` (round end). Nothing punitive.

## i18n Keys

`whatComesNext.title`, `whatComesNext.whatsNext` ("What comes next?"), `whatComesNext.play`, `whatComesNext.nextLevel`, `whatComesNext.replay`, `whatComesNext.back`, `whatComesNext.progress` — en/it/ro/de/fr/zh.

## Glossary Terms (added to CONTEXT.md)

**Pattern Unit**, **Pattern Arc**, **Prompt Strip**.

## Testing

- **Vitest unit**: `patternTier` mapping and unit generation per level band; growing-tier block expansion (k = 1…m) and deterministic answer; distractor category rules; seeded determinism; slot-answer consistency for every generated prompt (property test over levels 1–30).
- **Playwright e2e** (seeded): landing → play → solve first prompt via data attribute → win overlay after goal → Next Level link.

## Out of Scope (v1)

Child-authored patterns, sound-pattern variants, horizontal drag-to-fill interactions.
