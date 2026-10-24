# Kids Games

A touch-first PWA of mini-games for children aged 2-5, grouped into creative, puzzles, arcade, quizzes, and brain games.

## Language

**Splash**:
A free-play game where tapping or dragging on the surface emits celebratory emoji.
_Avoid_: particle game, confetti game

**Particle**:
One emoji emitted by Splash that appears, animates, and disappears.
_Avoid_: blob, sprite, bubble

**Burst**:
The group of particles emitted by one spawn event.
_Avoid_: click, tap, batch

**Live count**:
The number of particles currently animating.
_Avoid_: particle count, on-screen emoji

**Splash budget**:
The cap, cadence, and lifetime that bound Splash's particles.
_Avoid_: particle limit, performance settings

**Fluid**:
Splash meets the iPhone XR acceptance bar: during a 10-second drag, average frame rate is at least 30fps, the 95th-percentile frame is at most 50ms, and no frame exceeds 200ms.
_Avoid_: smooth, fast, responsive
