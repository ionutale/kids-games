# 05 — Logic Extraction Strategy

Type: grilling
Status: open
Blocked by:

## Question

How do we extract game logic from `+page.svelte` components into testable `$lib` modules across all 11 games?

- Carve pattern: what goes in the module vs. stays in the component (pure logic + state transitions vs. DOM/gesture/timing)? Stores vs. plain functions — the settings store already exists; do games get per-game stores or pure modules?
- Ordering by value: proposed order is memory, puzzle, soccer, pop, splash, stickers, paint, sorting, animal-quiz, tower-defense, glossary-puzzle (tower-defense + glossary-puzzle already test real modules — do they need extraction at all, or just parity tests?). What's the risk profile per game?
- Parity verification: how do we prove the extraction didn't change behavior — existing behavioral/e2e tests must still pass; is there a golden-run approach?
- Fate of copy tests: the memory behavioral file re-implements `flipCard`; puzzle unit tests assert literals. Rewrite against extracted modules, or delete and write fresh?
- Naming/home for extracted modules: per-game `src/lib/<game>/` directories (tower-defense and glossary-puzzle already set that precedent).
- Scope of refactor risk: does extraction happen game-by-game as its own commit/PR, with each gated by its tests?

Resolves the fog: extraction pattern and ordering, parity verification, fate of copy tests.
