export function aiTurn(state, placeBuilding, spawnUnit) {
  const aiBld = state.buildings.filter(b => b.owner === 'p2' && b.hp > 0);
  const aiUnits = state.units.filter(u => u.alive && u.owner === 'p2');
  const aiTH = aiBld.find(b => b.id === 'townHall');
  if (!aiTH) return;

  if (state.turn < 15) return;

  if (!aiBld.find(b => b.id === 'farm')) {
    const empty = findEmpty(state.map, 8, 11, 0, 3);
    if (empty) placeBuilding('farm', empty[0], empty[1], 'p2');
    return;
  }
  if (!aiBld.find(b => b.id === 'barracks')) {
    const empty2 = findEmpty(state.map, 8, 11, 0, 4);
    if (empty2) placeBuilding('barracks', empty2[0], empty2[1], 'p2');
    return;
  }

  const barracks = aiBld.find(b => b.id === 'barracks');
  const targetCount = 2 + state.level;
  if (barracks && aiUnits.length < targetCount) {
    spawnUnit('soldier', barracks, 'p2');
    return;
  }

  const p1TH = state.buildings.find(b => b.owner === 'p1' && b.id === 'townHall');
  if (p1TH && aiUnits.length > 0) {
    for (const u of aiUnits) {
      if (u.role !== 'worker') u.attackTarget = p1TH;
    }
  }
}

function findEmpty(map, r1, r2, c1, c2) {
  for (let r = r1; r <= r2; r++)
    for (let c = c1; c <= c2; c++)
      if (map[r]?.[c] === 0) return [r, c];
  return null;
}
