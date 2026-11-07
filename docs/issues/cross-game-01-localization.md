# 01 — Cross-game: Localization and Locale Parity

## What to build

Add every new visible string for the six redesigns to all six locales in `src/lib/stores/locale.js` (en, it, ro, de, fr, zh), and add a parity test that the key set and non-empty values match everywhere. The prototypes hardcode English; no game surface should ship that way.

## Acceptance criteria

- [ ] Every new string in the six PRDs has a key in all six locales
- [ ] Keys cover prompts, Good Try / set-complete cards, buttons, toasts, panel labels and status text
- [ ] Existing keys are not renamed or removed
- [ ] `tests/unit/locale-parity.test.js` asserts the same key set in every locale and rejects empty values
- [ ] Each game route reads copy through `$_`, never a literal
- [ ] The longest it/ro/de/fr strings still fit the 320×568 buttons and cards
- [ ] `pnpm test` and `pnpm check` are green
- [ ] No new dependencies

## Blocked by

None — do before the first game core. The six-game review (`2026-11-07-six-game-review.md`) is the source of the shared checklist.
