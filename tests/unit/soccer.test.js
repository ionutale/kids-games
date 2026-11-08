import { beforeEach, describe, it, expect } from 'vitest';
import {
  BALL_START,
  SHOTS,
  controlPoint,
  goalBounds,
  impactPoint,
  keeperCenter,
  keeperHalfWidth,
  keeperHz,
  openAim,
  openSideGlow,
  quadPoint,
  shotResult,
  starsForGoals,
  targetFor
} from '../../src/lib/soccer/engine.js';
import {
  STARS_KEY,
  bestStarsFor,
  loadSoccerStars,
  saveBestStars
} from '../../src/lib/soccer/stars.js';

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

describe('Soccer — the five-shot round', () => {
  it('plays exactly five shots at every level', () => {
    expect(SHOTS).toBe(5);
  });

  it('raises the target from 3 goals at level 1 to 5 at level 10', () => {
    expect(targetFor(1)).toBe(3);
    expect(targetFor(5)).toBe(4);
    expect(targetFor(9)).toBe(5);
    expect(targetFor(10)).toBe(5);
  });

  it('never lowers the target as the ladder rises, and clamps odd levels', () => {
    let previous = 0;
    for (const level of LEVELS) {
      const target = targetFor(level);
      expect(target).toBeGreaterThanOrEqual(previous);
      expect(target).toBeLessThanOrEqual(5);
      previous = target;
    }
    expect(targetFor(0)).toBe(3);
    expect(targetFor(99)).toBe(5);
    expect(targetFor('nope')).toBe(3);
  });

  it('awards stars for 3, 4 and 5 goals and none below three', () => {
    expect(starsForGoals(0)).toBe(0);
    expect(starsForGoals(1)).toBe(0);
    expect(starsForGoals(2)).toBe(0);
    expect(starsForGoals(3)).toBe(1);
    expect(starsForGoals(4)).toBe(2);
    expect(starsForGoals(5)).toBe(3);
    expect(starsForGoals(99)).toBe(3);
  });
});

describe('Soccer — a wide, shallow goal', () => {
  it('is wide and shallow at level 1', () => {
    const goal = goalBounds(1);
    expect(goal.x1 - goal.x0).toBe(48);
    expect(goal.y1 - goal.y0).toBe(10);
    expect((goal.x0 + goal.x1) / 2).toBe(50);
    expect(goal.y0).toBeGreaterThan(0);
    expect(goal.y1).toBeLessThan(20);
  });

  it('narrows gently with the level but never below the fairness floor', () => {
    let previous = Infinity;
    for (const level of LEVELS) {
      const goal = goalBounds(level);
      const width = goal.x1 - goal.x0;
      expect(width).toBeLessThanOrEqual(previous);
      expect(width).toBeGreaterThanOrEqual(34);
      expect(goal.y1 - goal.y0).toBe(10);
      previous = width;
    }
    expect(goalBounds(10).x1 - goalBounds(10).x0).toBe(34);
  });

  it('glows the open side on levels 1 and 2 only', () => {
    expect(openSideGlow(1)).toBe(true);
    expect(openSideGlow(2)).toBe(true);
    for (const level of [3, 5, 10]) expect(openSideGlow(level)).toBe(false);
  });
});

describe('Soccer — the patrolling keeper', () => {
  it('stays inside the mouth and leaves a gap at every level', () => {
    for (const level of LEVELS) {
      const goal = goalBounds(level);
      const half = keeperHalfWidth(level);
      expect(half).toBeGreaterThan(0);
      for (let t = 0; t <= 20; t += 0.25) {
        const x = keeperCenter(level, t);
        expect(x - half).toBeGreaterThanOrEqual(goal.x0 - 0.01);
        expect(x + half).toBeLessThanOrEqual(goal.x1 + 0.01);
      }
    }
  });

  it('keeps moving continuously', () => {
    expect(keeperCenter(1, 1)).not.toBe(keeperCenter(1, 2));
    expect(keeperCenter(10, 1)).not.toBe(keeperCenter(10, 2));
  });

  it('covers a little more of the mouth and patrols a little faster with the level', () => {
    const coverage = (level) => {
      const goal = goalBounds(level);
      return (keeperHalfWidth(level) * 2) / (goal.x1 - goal.x0);
    };
    for (let level = 2; level <= 10; level += 1) {
      expect(coverage(level)).toBeGreaterThan(coverage(level - 1));
      expect(keeperHalfWidth(level)).toBeGreaterThan(7);
      expect(keeperHz(level)).toBeGreaterThan(keeperHz(level - 1));
    }
  });

  it('always leaves room in the far corner', () => {
    for (const level of LEVELS) {
      const goal = goalBounds(level);
      const half = keeperHalfWidth(level);
      const spots = [goal.x0 + half, 50, goal.x1 - half];
      for (const keeperX of spots) {
        const aim = openAim(level, keeperX);
        expect(aim.x).toBeGreaterThan(goal.x0);
        expect(aim.x).toBeLessThan(goal.x1);
        expect(shotResult(BALL_START, aim, level, keeperX)).toBe('goal');
      }
    }
  });
});

describe('Soccer — the impact point', () => {
  it('is the release itself when the swipe lands in the mouth', () => {
    const inside = openAim(3, keeperCenter(3, 0));
    expect(impactPoint(BALL_START, inside, 3)).toEqual(inside);
  });

  it('is the first point of the arc inside the mouth when the swipe flies past it', () => {
    const goal = goalBounds(4);
    const end = { x: 55, y: -40 };
    const impact = impactPoint(BALL_START, end, 4);
    expect(impact).not.toBeNull();
    expect(impact.x).toBeGreaterThan(goal.x0);
    expect(impact.x).toBeLessThan(goal.x1);
    expect(impact.y).toBeGreaterThan(goal.y0);
    expect(impact.y).toBeLessThan(goal.y1);
    expect(impact.y).toBeGreaterThan(end.y);
  });

  it('is absent for a swipe that never reaches the mouth', () => {
    expect(impactPoint(BALL_START, { x: 50, y: 90 }, 1)).toBeNull();
    expect(impactPoint(BALL_START, { x: 5, y: 10 }, 1)).toBeNull();
  });

  it('shares one quadratic arc between the aim preview and the flight', () => {
    const end = { x: 60, y: 10 };
    const control = controlPoint(BALL_START, end);
    expect(quadPoint(BALL_START, control, end, 0)).toEqual(BALL_START);
    const landing = quadPoint(BALL_START, control, end, 1);
    expect(landing.x).toBeCloseTo(end.x, 6);
    expect(landing.y).toBeCloseTo(end.y, 6);
  });
});

describe('Soccer — one shot', () => {
  it('saves a shot into the keeper and scores beside him', () => {
    for (const level of LEVELS) {
      const keeperX = keeperCenter(level, 0);
      expect(shotResult(BALL_START, { x: keeperX, y: 10 }, level, keeperX)).toBe('save');
      expect(shotResult(BALL_START, openAim(level, keeperX), level, keeperX)).toBe('goal');
    }
  });

  it('misses a tiny swipe, a swipe away from the goal and a shot wide of the posts', () => {
    const keeperX = keeperCenter(1, 0);
    expect(shotResult(BALL_START, { x: 50, y: 81 }, 1, keeperX)).toBe('miss');
    expect(shotResult(BALL_START, { x: 50, y: 95 }, 1, keeperX)).toBe('miss');
    expect(shotResult(BALL_START, { x: 5, y: 10 }, 1, keeperX)).toBe('miss');
  });

  it('counts a longer swipe that flies through the mouth and over the bar', () => {
    for (const level of LEVELS) {
      const keeperX = keeperCenter(level, 0);
      const aim = openAim(level, keeperX);
      const shortEnd = { ...aim };
      const longEnd = { x: aim.x, y: -40 };
      expect(shotResult(BALL_START, shortEnd, level, keeperX)).toBe('goal');
      expect(shotResult(BALL_START, longEnd, level, keeperX)).toBe('goal');
    }
  });

  it('is decided by the keeper x at release, not by the swipe length', () => {
    const level = 6;
    const aim = { x: 62, y: 10 };
    const away = keeperCenter(level, 0);
    expect(shotResult(BALL_START, aim, level, away)).toBe('goal');
    expect(shotResult(BALL_START, aim, level, 62)).toBe('save');
  });
});

describe('Soccer — the star memory', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts empty and remembers the best stars per level', () => {
    expect(bestStarsFor(3)).toBe(0);
    expect(saveBestStars(3, 2)).toBe(2);
    expect(bestStarsFor(3)).toBe(2);
    expect(loadSoccerStars()).toEqual({ 3: 2 });
    expect(bestStarsFor(4)).toBe(0);
  });

  it('never lets a lower round erase a best', () => {
    saveBestStars(7, 3);
    expect(saveBestStars(7, 1)).toBe(3);
    expect(saveBestStars(7, 0)).toBe(3);
    expect(bestStarsFor(7)).toBe(3);
  });

  it('clamps bad levels and star counts', () => {
    expect(saveBestStars(99, 9)).toBe(3);
    expect(bestStarsFor(10)).toBe(3);
    expect(saveBestStars(0, -2)).toBe(0);
    expect(bestStarsFor(1)).toBe(0);
  });

  it('survives a reload and ignores corrupt storage', () => {
    saveBestStars(2, 1);
    expect(loadSoccerStars()).toEqual({ 2: 1 });

    localStorage.setItem(STARS_KEY, 'not json');
    expect(loadSoccerStars()).toEqual({});
    expect(bestStarsFor(2)).toBe(0);

    localStorage.setItem(STARS_KEY, JSON.stringify({ 1: 2, 2: 9, BAD: 3, 3: 0 }));
    expect(loadSoccerStars()).toEqual({ 1: 2, 2: 3 });
  });
});
