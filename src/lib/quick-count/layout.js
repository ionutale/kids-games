// Pure layout maths for the Flash Picnic basket. Kept out of the component so
// the high-goal berry grid (up to 15) can be unit-tested.

export const MAX_BASKET_BERRIES = 15;

/**
 * Berry positions inside the basket, in percent. Low goals keep the loose
 * scatter from the prototype; higher goals switch to a compact grid so every
 * berry stays countable instead of clumping into one red blob.
 */
export function basketDots(goal) {
  const total = Math.max(0, Math.min(Math.round(goal) || 0, MAX_BASKET_BERRIES));
  if (total === 0) return [];

  const cols = total <= 4 ? total : Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / cols);

  return Array.from({ length: total }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const left = cols === 1 ? 50 : 14 + (col * 72) / (cols - 1);
    const top = rows === 1 ? 44 : 8 + (row * 72) / (rows - 1);
    // Alternate rows sit a touch lower/higher so the grid does not look printed.
    const lift = row % 2 === 0 ? -2 : 2;
    return {
      left: Math.min(86, Math.max(14, left)),
      top: Math.min(80, Math.max(8, top + lift))
    };
  });
}
