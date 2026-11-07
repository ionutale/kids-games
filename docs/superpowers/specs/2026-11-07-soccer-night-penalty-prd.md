# PRD — Soccer: the Night Penalty

- **Date:** 2026-11-07
- **Decision:** prototype winner A on `prototype/soccer` (`172e7826`, refined `f46dcb96`)
- **Baseline:** the shipped green-card penalty with a glove keeper

## Problem Statement

Soccer is a penalty shootout on a flat green card with a glove emoji, a white rectangle and a ball. There is no striker, no stadium, no net and no bear keeper, so the game has no world. The swipe starts anywhere and the landing point has no visible relation to the ball. There is no shot limit, so the round is an endless target. Stars are computed at the end but never stored, even though ADR 0001 says they are remembered per level. The keeper freezes on early levels and the power meter is not reflected in the result. The game is readable, but it is not a place and it does not keep its own promise about stars.

## Solution

A five-shot penalty shootout in a warm night stadium, seen from behind the ball. A child striker waits by the ball, a friendly bear keeper patrols the goal, and the child swipes anywhere: a reticle and dashed trajectory show the impact, and the open side glows on levels 1–2. The keeper patrols continuously and dives late; the far corner stays fair. All five shots are played; the target (3→5 goals) decides the win; stars are 1/2/3 for 3/4/5 goals, stored per level and shown in a local star row. Ball pips replace numbers. The shared ladder, saved level/mastery and hub entry are unchanged.

## User Stories

1. As a 4-year-old, I want to see a striker and a bear keeper, so that I understand who is playing.
2. As a 4-year-old, I want to swipe anywhere to shoot, so that I do not have to hit a small ball.
3. As a 4-year-old, I want to see where the ball will go, so that I can aim with confidence.
4. As a 4-year-old, I want the open side to glow on the first levels, so that I learn where to aim.
5. As a 4-year-old, I want the keeper to move, so that the goal feels alive.
6. As a 4-year-old, I want the keeper to dive, so that a save feels dramatic.
7. As a 4-year-old, I want a goal to flash the net, so that scoring is obvious.
8. As a 4-year-old, I want a save to show the glove, so that I know what happened.
9. As a 4-year-old, I want five ball pips, so that I can see how many shots are left without numbers.
10. As a 5-year-old, I want five shots, so that a round has a clear end.
11. As a 5-year-old, I want a target of three, four or five goals, so that later levels ask more.
12. As a 5-year-old, I want stars for three, four or five goals, so that a clean round feels special.
13. As a 5-year-old, I want my best stars to stay on the level, so that I can try to improve.
14. As a 5-year-old, I want the keeper to be faster on later levels, so that the game grows with me.
15. As a 5-year-old, I want the goal to narrow, so that aiming matters more.
16. As a parent, I want a night-stadium world, so that the game feels like an event.
17. As a parent, I want no sad sound on a save or a miss, so that the game stays encouraging.
18. As a parent, I want a whistle, a kick, a net and a crowd, so that a goal sounds like a goal.
19. As a parent, I want the sound to respect the app toggle, so that I can mute it.
20. As a parent, I want the layout to fit a small phone in portrait, so that it is usable.
21. As a parent, I want reduced motion respected, so that the stadium stays calm.
22. As a parent, I want the five shots to end the round, so that a session is short.
23. As a parent, I want a Try again button on a Good Try, so that retrying is one tap.
24. As a returning child, I want to pick any level from the ladder, so that I can replay a favourite.
25. As a returning child, I want the stars row to show my best, so that I know what to beat.
26. As a designer, I want all five shots played even after the target is reached, so that the 3/4/5-goal star tiers are reachable.
27. As a designer, I want the star store to be per level, so that ADR 0001 is honoured.
28. As a designer, I want the keeper result to use his position at release, so that timing is the skill.
29. As a designer, I want the shot result to use the impact point, not the raw release, so that a swipe that passes through the mouth counts.
30. As a designer, I want the shared ladder untouched, so that other games do not look unfinished.

## Implementation Decisions

- **Scene.** A portrait night stadium: floodlights, a crowd silhouette, striped grass, a wide goal with a net, a child striker and a ball at the penalty spot. The camera is behind the ball in a flat 2.5D composition.
- **Goal.** The goal mouth is wide and shallow (the engine's bounds are adjusted from a tall mouth to a wide, shallow one) so it reads as a real goal and the keeper has a horizontal patrol.
- **Input.** A swipe anywhere on the field. During the drag, a dashed line and reticle show the **impact point** (the first point of the arc inside the goal mouth), not the raw release. The swipe length only sets the flight time; it does not change the result.
- **Aim aid.** Levels 1–2 softly glow the open side of the goal; later levels do not. The reticle is always shown while dragging.
- **Keeper.** A bear who patrols continuously and dives late at release. The save band (Reach) is his half-width plus the ball radius. The far corner always has room.
- **Shots.** Five per round, shown as ball pips. All five are always played; the target only decides the win. A round ends after the fifth shot.
- **Target and stars.** Target 3 at level 1 rising to 5 at level 10. Stars: 1 for 3 goals, 2 for 4, 3 for 5. Stars are stored per level in `soccerStars` and shown in a local star row above the ladder; the shared ladder stays untouched (ADR 0001).
- **End states.** Reaching the target after five shots wins with the earned stars; below the target shows Good Try with Try again / Back, no star, no sad sound. All five shots are played in both cases.
- **Sound.** A short whistle at round start, a kick thud, a net swish plus a quiet crowd cheer on a goal, a glove thud on a save, a whoosh on a miss. No negative sting. Respects the existing sound setting.
- **Art.** Flat inline SVG: child striker, bear keeper, soccer ball, gloves, rings (prototype only), stadium props. No emoji on the pitch.
- **Engine.** The shared shot engine keeps `goalBounds`, `keeperCenter`, `keeperHalfWidth`, `openAim`, `impactPoint` and `shotResult`. The result is decided by the keeper's x at release. The old power-shrinks-Reach behaviour is retired; the swipe length affects flight time only.
- **Constraints.** No new dependencies; do not edit shared components or the global theme; keep the ladder, progress keys, hub entry and sound toggle.

## Testing Decisions

- **Test external behavior:** a swipe scores or is saved, a giant-like power does not change the result, all five shots are played, the target decides the win, stars match goals and persist per level, the star row shows the best, levels switch, the round ends with a Good Try.
- **Highest seam:** the route DOM. Keep `data-testid="soccer-root"`, `.field`, `.goal`, `.keeper` with a data x, `.ball`, `.reticle`, `.pips`, `.star`, `.card`, and the local star row. Tests should not read Svelte state.
- **Unit:** goal bounds, keeper patrol and reach, openAim, impactPoint, shotResult, target curve, stars-by-goals, and the `soccerStars` store.
- **E2E:** start a round, score to the open side, get a save, miss, use five shots, reach the target, finish below it, check the local star row and persistence across reload, switch level, 320×568 and 390×844, muted sound, reduced motion.
- **Prior art:** `tests/unit/soccer.test.js` for the engine and `tests/e2e/soccer.test.js` for the field hooks.

## Out of Scope

- The Target Rings and Keeper for a Day theses; they remain prototypes.
- A mini match with defenders or dribbling.
- Voice-over, accounts, cloud stars, or a new art pipeline.
- Shared component or global theme edits.
- Changing the star rule for any other game.

## Further Notes

- Prototype source: `prototype/soccer` (`172e7826`, refined `f46dcb96`), variant A.
- Ruling: the round plays all five shots even when the target is reached; ending at the target would make the 3/4/5-goal star tiers unreachable on level 1.
- ADR 0001 is now implemented; an addendum records that the star row is local to the soccer page, not on the shared LadderBar.
- Risk: a moving keeper plus a wide goal can feel unfair; the late dive and the far-corner guarantee are the fairness contract.
- Risk: the star row may show a best from a previous session before the round starts; that is intended.
