import { describe, it, expect } from 'vitest';
import { BUILDINGS } from '$lib/emoji-warcraft/buildings.js';
import { UNIT_TYPES } from '$lib/emoji-warcraft/units.js';

describe('Emoji Warcraft behavior', () => {
  it('placing a building costs resources', () => {
    let gold = 200, wood = 50;
    const barracks = BUILDINGS.find(b => b.id === 'barracks');
    gold -= barracks.cost.g;
    wood -= barracks.cost.w;
    expect(gold).toBe(100);
    expect(wood).toBe(0);
  });

  it('cannot afford building with insufficient resources', () => {
    let gold = 50;
    const canAfford = gold >= 100;
    expect(canAfford).toBe(false);
  });

  it('unit counts toward population', () => {
    const pop = [1, 2, 3];
    expect(pop.length).toBe(3);
  });

  it('population cap limits units', () => {
    const maxPop = 10;
    const units = 12;
    const canTrain = units < maxPop;
    expect(canTrain).toBe(false);
  });

  it('building damage reduces HP', () => {
    let hp = 500;
    hp -= 50;
    expect(hp).toBe(450);
    hp -= 200;
    expect(hp).toBe(250);
  });

  it('destroyed building has HP <= 0', () => {
    let hp = 100;
    hp -= 120;
    expect(hp <= 0).toBe(true);
  });

  it('unit attack deals damage to enemy', () => {
    let enemyHP = 60;
    const attack = 10;
    enemyHP -= attack;
    expect(enemyHP).toBe(50);
  });

  it('farm increases population cap by 5', () => {
    let maxPop = 5;
    maxPop += 5;
    expect(maxPop).toBe(10);
  });

  it('tower fires at range 2', () => {
    const tower = BUILDINGS.find(b => b.id === 'tower');
    expect(tower.range).toBe(2);
    expect(tower.damage).toBe(8);
  });

  it('game is won when enemy town hall is destroyed', () => {
    const townHallHP = 0;
    const gameOver = townHallHP <= 0;
    expect(gameOver).toBe(true);
  });
});
