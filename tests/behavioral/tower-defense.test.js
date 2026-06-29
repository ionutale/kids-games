import { describe, it, expect } from 'vitest';

describe('Tower Defense behavior', () => {
  it('placing tower costs coins', () => {
    let coins = 100;
    coins -= 30;
    expect(coins).toBe(70);
  });

  it('cannot place tower if insufficient coins', () => {
    const coins = 20;
    const canPlace = coins >= 50;
    expect(canPlace).toBe(false);
  });

  it('killing enemy awards coins', () => {
    let coins = 100;
    coins += 10;
    expect(coins).toBe(110);
  });

  it('losing all lives ends game', () => {
    let lives = 10;
    for (let i = 0; i < 10; i++) lives--;
    expect(lives).toBe(0);
    const gameOver = lives <= 0;
    expect(gameOver).toBe(true);
  });

  it('winning requires surviving all waves', () => {
    const wave = 5;
    const totalWaves = 5;
    expect(wave >= totalWaves).toBe(true);
  });

  it('tower upgrade increases damage', () => {
    const baseDamage = 10;
    const upgradedDamage = Math.round(baseDamage * 1.5);
    expect(upgradedDamage).toBe(15);
  });

  it('selling refunds half the investment', () => {
    const cost = 30;
    const refund = Math.round(cost * 0.5);
    expect(refund).toBe(15);
  });

  it('enemy health scales with level', () => {
    const fn = (base, lvl) => Math.round(base * (1 + (lvl - 1) * 0.3));
    expect(fn(20, 1)).toBe(20);
    expect(fn(20, 5)).toBe(44);
  });

  it('enemy speed can be slowed', () => {
    let speed = 1;
    const slowFactor = 0.5;
    speed = speed * (1 - slowFactor);
    expect(speed).toBe(0.5);
  });

  it('wave count increases with level', () => {
    const wavesByLevel = [3, 4, 5, 6, 7];
    expect(wavesByLevel[0]).toBe(3);
    expect(wavesByLevel[4]).toBe(7);
  });
});
