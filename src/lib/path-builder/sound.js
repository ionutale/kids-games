// Quiet forest palette for the Path Builder Road, built on the shared
// mute-aware `createGameSound` player. No negative sounds: a miss is silent.
import { createGameSound } from '#lib/sounds/gameSound.js';

export function createForestSound() {
  let lastScratch = 0;
  let lastBump = 0;
  const sound = createGameSound({
    // A soft dirt scratch while a finger draws.
    scratch: ({ tone }) => {
      tone({
        freq: 200 + Math.random() * 45,
        dur: 0.04,
        type: 'triangle',
        vol: 0.028
      });
    },
    // Quiet paw steps under the walk.
    step: ({ tone }) => {
      tone({
        freq: 138 + Math.random() * 26,
        dur: 0.075,
        type: 'sine',
        vol: 0.055
      });
    },
    // Two warm notes per collected Star.
    star: ({ tone, after }) => {
      tone({ freq: 880, dur: 0.16, type: 'triangle', vol: 0.085 });
      after(80, () => tone({ freq: 1174, dur: 0.2, type: 'triangle', vol: 0.07 }));
    },
    // Three-note arrival at the cabin.
    arrive: ({ tone, after }) => {
      tone({ freq: 523, dur: 0.18, type: 'triangle', vol: 0.09 });
      after(110, () => tone({ freq: 659, dur: 0.18, type: 'triangle', vol: 0.085 }));
      after(220, () => tone({ freq: 784, dur: 0.3, type: 'triangle', vol: 0.085 }));
    },
    // A quiet bump when the stroke meets a rock, pond or hedge.
    bump: ({ tone }) => {
      tone({ freq: 116, dur: 0.09, type: 'sine', vol: 0.06 });
    }
  });

  return {
    unlock() {
      sound.unlock();
    },
    scratch() {
      const now = performance.now();
      if (now - lastScratch < 90) return;
      lastScratch = now;
      sound.play('scratch');
    },
    step() {
      sound.play('step');
    },
    star() {
      sound.play('star');
    },
    arrive() {
      sound.play('arrive');
    },
    bump() {
      const now = performance.now();
      if (now - lastBump < 240) return;
      lastBump = now;
      sound.play('bump');
    },
    stop() {
      sound.stop();
    },
    dispose() {
      sound.dispose();
    }
  };
}
