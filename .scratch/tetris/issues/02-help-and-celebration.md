# 02 — Help and Celebration

Type: grilling
Status: open
Blocked by:

## Question

How do we help stuck players and celebrate milestones?

- Idle nudge: the puzzle game jiggles a piece + highlights its target after 8s of inactivity. Does Tetris get an equivalent — and what would it even be (slow-mo gravity? arrow hinting where the piece fits? a "hint" button)?
- Celebration sequence: the puzzle has a multi-stage celebration on completion. What happens on a level-up and on a new best score — both at once, or level-up only?
- Sound mapping: which events fire sounds (piece lock, line clear, Tetris clear, level up, game over, new best score) using the positive-only WebAudio tones — and which stay silent?
- In-progress resume: does an interrupted game (tab blur, reload, accidental exit) resume where it left off, or always start fresh with only the best score persisted?

Resolves the fog: idle nudge, milestone celebrations, sound mapping, resume behavior.
