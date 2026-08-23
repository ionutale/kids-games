export const PADS = [
  { id: 0, emoji: '🐱', color: '#E57373', tone: 392 }, // G4
  { id: 1, emoji: '🐶', color: '#64B5F6', tone: 494 }, // B4
  { id: 2, emoji: '🐸', color: '#81C784', tone: 587 }, // D5
  { id: 3, emoji: '🐼', color: '#FFD54F', tone: 784 } // G5
];

/** Round 1 starts at 2 steps; each round adds one. */
export function sequenceLength(round) {
  return 1 + Math.max(1, round);
}

/** Highlight duration shrinks as rounds progress (spec speed curve). */
export function flashMs(round) {
  const r = Math.max(1, round);
  if (r <= 8) return 600;
  if (r <= 12) return 400;
  if (r <= 19) return 300;
  return 250;
}

export function gapMs() {
  return 300;
}

export function generateSequence(round, rng = Math.random) {
  const len = sequenceLength(round);
  const seq = [];
  let prev = -1;
  for (let i = 0; i < len; i++) {
    let next;
    do {
      next = Math.floor(rng() * PADS.length) % PADS.length;
    } while (next === prev && PADS.length > 1);
    seq.push(next);
    prev = next;
  }
  return seq;
}

/**
 * Validates player input against the sequence.
 * Returns 'correct-step' | 'round-complete' | 'wrong'.
 */
export function validateTap(seq, position, padId) {
  if (seq[position] !== padId) return 'wrong';
  if (position + 1 >= seq.length) return 'round-complete';
  return 'correct-step';
}

export function scoreFor(round) {
  return Math.max(0, round);
}
