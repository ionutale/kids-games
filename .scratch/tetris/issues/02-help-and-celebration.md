# 02 — Help and Celebration

Type: grilling
Status: resolved
Blocked by:

## Question

How do we help stuck players and celebrate milestones?

- Idle nudge: the puzzle game jiggles a piece + highlights its target after 8s of inactivity. Does Tetris get an equivalent — and what would it even be (slow-mo gravity? arrow hinting where the piece fits? a "hint" button)?
- Celebration sequence: the puzzle has a multi-stage celebration on completion. What happens on a level-up and on a new best score — both at once, or level-up only?
- Sound mapping: which events fire sounds (piece lock, line clear, Tetris clear, level up, game over, new best score) using the positive-only WebAudio tones — and which stay silent?
- In-progress resume: does an interrupted game (tab blur, reload, accidental exit) resume where it left off, or always start fresh with only the best score persisted?

Resolves the fog: idle nudge, milestone celebrations, sound mapping, resume behavior.

## Answer

Settled in grilling session (all recommendations accepted):

- **Hint button**: no auto nudge — a button highlights the best spot for the current piece (ghost-cell flash) when tapped.
- **Celebrations**: level-up → brief full-board flash + sound (game continues immediately); new best score → short confetti burst (reuse Confetti.svelte). Both under 1.5s, no modal, no flow break.
- **Sound mapping** (positive-only, WebAudio tones): piece lock → soft tap; line clear → ascending chime (pitch rises with combo); Tetris clear → bigger fanfare; level up → bright two-note; new best score → fanfare. Failed drop → silence.
- **Resume**: fresh start every time — only the best score persists. No in-progress state.
