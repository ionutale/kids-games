export function canAdd(placements, cap = 80) {
  return placements.length < cap;
}

export function addPlacement(placements, placement, cap = 80) {
  if (!canAdd(placements, cap)) return placements;
  return [...placements, placement];
}

export function bringToFront(placements, id) {
  const index = placements.findIndex((placement) => placement.id === id);
  if (index < 0 || index === placements.length - 1) return placements;

  const next = [...placements];
  const [placement] = next.splice(index, 1);
  next.push(placement);
  return next;
}

export function movePlacement(placements, id, x, y) {
  return placements.map((placement) =>
    placement.id === id ? { ...placement, x, y } : placement
  );
}

export function removePlacement(placements, id) {
  return placements.filter((placement) => placement.id !== id);
}
