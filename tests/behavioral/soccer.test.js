import { beforeEach, describe, it, expect } from 'vitest';
import {
  BALL_START,
  SHOTS,
  flightDuration,
  goalBounds,
  keeperCenter,
  openAim,
  shotResult,
  starsForGoals,
  targetFor
} from '../../src/lib/soccer/engine.js';
import { bestStarsFor, saveBestStars } from '../../src/lib/soccer/stars.js';

const open = (level) => (keeperX) => openAim(level, keeperX);
const atKeeper = () => (keeperX) => ({ x: keeperX, y: 10 });
const wide = () => () => ({ x: 5, y: 10 });
const short = () => () => ({ x: 50, y: 92 });

/**
 * Play one round exactly as the route does: five shots, the keeper's x at each
 * release, then the target decides the win and stars follow the goal count.
 */
function playRound(level, pickers) {
  let keeperT = 0;
  let goals = 0;
  let saves = 0;
  let misses = 0;
  const results = [];
  for (const pick of pickers.slice(0, SHOTS)) {
    const keeperX = keeperCenter(level, keeperT);
    const end = pick(keeperX);
    const result = shotResult(BALL_START, end, level, keeperX);
    results.push(result);
    if (result === 'goal') goals += 1;
    else if (result === 'save') saves += 1;
    else misses += 1;
    keeperT += 1.1;
  }
  const shots = results.length;
  const won = goals >= targetFor(level);
  return {
    results,
    goals,
    saves,
    misses,
    shots,
    won,
    stars: won ? starsForGoals(goals) : 0
  };
}

describe('Soccer — a Night Penalty round', () => {
  it('plays all five shots even after the target is already reached', () => {
    const round = playRound(1, [open(1), open(1), open(1), short(), wide()]);
    expect(round.shots).toBe(5);
    expect(round.goals).toBe(3);
    expect(round.won).toBe(true);
    expect(round.stars).toBe(1);
  });

  it('lets the target decide the win, not the last shot', () => {
    const short1 = playRound(1, [open(1), open(1), short(), short(), short()]);
    expect(short1.goals).toBe(2);
    expect(short1.shots).toBe(5);
    expect(short1.won).toBe(false);
    expect(short1.stars).toBe(0);

    const made = playRound(1, [open(1), open(1), open(1), short(), short()]);
    expect(made.goals).toBe(3);
    expect(made.won).toBe(true);
  });

  it('earns one, two and three stars for three, four and five goals', () => {
    const three = playRound(1, [open(1), open(1), open(1), short(), short()]);
    const four = playRound(1, [open(1), open(1), open(1), open(1), short()]);
    const five = playRound(1, [open(1), open(1), open(1), open(1), open(1)]);
    expect(three.stars).toBe(1);
    expect(four.stars).toBe(2);
    expect(five.stars).toBe(3);
  });

  it('asks for more goals later but still fits the target in five shots', () => {
    for (let level = 1; level <= 10; level += 1) {
      expect(targetFor(level)).toBeLessThanOrEqual(SHOTS);
      const perfect = playRound(level, Array.from({ length: 5 }, () => open(level)));
      expect(perfect.goals).toBe(5);
      expect(perfect.won).toBe(true);
    }
  });

  it('keeps the far corner fair with the level-10 goal and keeper', () => {
    const level = 10;
    const goal = goalBounds(level);
    expect(goal.x1 - goal.x0).toBeGreaterThanOrEqual(34);
    for (let t = 0; t < 12; t += 0.37) {
      const keeperX = keeperCenter(level, t);
      const aim = openAim(level, keeperX);
      expect(shotResult(BALL_START, aim, level, keeperX)).toBe('goal');
    }
  });

  it('saves the shot at the keeper and scores the open side', () => {
    const level = 3;
    const keeperX = keeperCenter(level, 4.2);
    expect(shotResult(BALL_START, atKeeper()(keeperX), level, keeperX)).toBe('save');
    expect(shotResult(BALL_START, open(level)(keeperX), level, keeperX)).toBe('goal');
  });

  it('counts a swipe that flies through the mouth even when it ends over the bar', () => {
    const level = 2;
    const keeperX = keeperCenter(level, 1.4);
    const aim = openAim(level, keeperX);
    expect(shotResult(BALL_START, { x: aim.x, y: -40 }, level, keeperX)).toBe('goal');
  });

  it('a longer swipe only speeds up the flight, never the result', () => {
    const level = 6;
    const keeperX = keeperCenter(level, 1.7);
    const aim = openAim(level, keeperX);
    expect(flightDuration(10)).toBeGreaterThan(flightDuration(140));
    expect(shotResult(BALL_START, aim, level, keeperX)).toBe('goal');
    expect(shotResult(BALL_START, { x: aim.x, y: -40 }, level, keeperX)).toBe('goal');
  });

  it('shows a Good Try without a star when the target is missed', () => {
    const round = playRound(1, [atKeeper(), short(), wide(), short(), atKeeper()]);
    expect(round.won).toBe(false);
    expect(round.stars).toBe(0);
    expect(round.shots).toBe(5);
  });
});

describe('Soccer — the local star row', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('remembers the best round per level across reloads', () => {
    const first = playRound(1, [open(1), open(1), open(1), open(1), short()]);
    expect(first.stars).toBe(2);
    saveBestStars(1, first.stars);
    expect(bestStarsFor(1)).toBe(2);

    const later = playRound(1, [open(1), open(1), open(1), short(), short()]);
    expect(later.stars).toBe(1);
    saveBestStars(1, later.stars);
    expect(bestStarsFor(1)).toBe(2);

    saveBestStars(2, 3);
    expect(bestStarsFor(1)).toBe(2);
    expect(bestStarsFor(2)).toBe(3);
  });
});
