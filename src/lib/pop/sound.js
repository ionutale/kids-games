// Quiet pond palette for the Rising Pond, built on the shared mute-aware
// `createGameSound` player. Every cue is soft; there is no clock tick and no
// negative sound, so an escaped bubble is simply silent.
import { createGameSound } from '#lib/sounds/gameSound.js';

/**
 * Pitch of the nth pop in a swipe chain. The plop climbs a whole tone-ish step
 * per link and clamps after ten so a long swipe never turns shrill. Pure so the
 * chain can be tested without an AudioContext.
 */
export function chainFrequency(step) {
  const i = Math.min(Math.max(0, step), 9);
  return 360 + i * 58;
}

export function createPondSound() {
  let chain = 0;
  let lastSpawn = 0;
  let lastCrack = 0;

  const sound = createGameSound({
    // A water plop. The pitch climbs through a swipe chain so a chain sounds
    // like a chain; the route resets the chain when the finger lifts.
    pop: ({ tone }, step = 0) => {
      tone({ freq: chainFrequency(step), dur: 0.12, type: 'sine', vol: 0.11, slide: -140 });
      tone({ freq: 150, dur: 0.07, type: 'sine', vol: 0.045 });
    },
    // A soft bubble-up when a new bubble leaves the water.
    spawn: ({ tone }) => {
      tone({ freq: 250, dur: 0.12, type: 'sine', vol: 0.03, slide: 140 });
    },
    // The giant's first tap: a dry little crack, then the burst comes later.
    crack: ({ tone, noise }) => {
      noise({ dur: 0.08, vol: 0.04, cutoff: 900 });
      tone({ freq: 190, dur: 0.06, type: 'triangle', vol: 0.05 });
    },
    // A star bubble's sparkle, after the plop.
    star: ({ tone, after }) => {
      tone({ freq: 988, dur: 0.12, type: 'triangle', vol: 0.075 });
      after(80, () => tone({ freq: 1319, dur: 0.16, type: 'triangle', vol: 0.06 }));
    },
    // Three warm notes when the jar is full.
    chime: ({ tone, after }) => {
      tone({ freq: 523, dur: 0.18, type: 'triangle', vol: 0.09 });
      after(110, () => tone({ freq: 659, dur: 0.18, type: 'triangle', vol: 0.085 }));
      after(220, () => tone({ freq: 784, dur: 0.3, type: 'triangle', vol: 0.085 }));
    },
    // One gentle heads-up at five seconds — not a ticking clock.
    nearEnd: ({ tone, after }) => {
      tone({ freq: 587, dur: 0.14, type: 'triangle', vol: 0.045 });
      after(140, () => tone({ freq: 784, dur: 0.18, type: 'triangle', vol: 0.04 }));
    }
  });

  return {
    unlock() {
      sound.unlock();
    },
    /** Pop the next link of the current chain. */
    pop() {
      sound.play('pop', chain);
      chain += 1;
    },
    reset() {
      chain = 0;
    },
    spawn() {
      const now = performance.now();
      if (now - lastSpawn < 140) return;
      lastSpawn = now;
      sound.play('spawn');
    },
    crack() {
      const now = performance.now();
      if (now - lastCrack < 180) return;
      lastCrack = now;
      sound.play('crack');
    },
    star() {
      sound.play('star');
    },
    chime() {
      sound.play('chime');
    },
    nearEnd() {
      sound.play('nearEnd');
    },
    stop() {
      sound.stop();
    },
    dispose() {
      sound.dispose();
    }
  };
}
