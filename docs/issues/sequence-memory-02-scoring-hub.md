# 02 — Sequence Memory: Scoring + Hub + i18n + Tests

## What to build

Score display, high score persistence, age-based difficulty scaling, hub registration, translation keys, CONTEXT.md update, and all tests.

## Acceptance criteria

- [ ] Score = current round number, displayed during play
- [ ] High score saved to localStorage, shown on game over
- [ ] Age level from settings adjusts starting sequence length and speed
- [ ] Game appears in hub with icon
- [ ] Translation keys for all 3 languages (en/it/ro): game title, score, high score, start, replay
- [ ] CONTEXT.md updated with Sequence Memory glossary terms
- [ ] Unit tests for pad data
- [ ] Behavioral tests for sequence generation, input validation, scoring
- [ ] E2E test for load + game over flow

## Blocked by

- 01 — Core Game Loop
