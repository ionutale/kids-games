// Picnic feedback for Quick Count, built on the shared mute-aware
// `createGameSound` player. Count ticks teach the early levels, a berry plop
// marks a correct answer, and three warm notes mark a full basket. Wrong
// answers stay silent.
import { createGameSound } from '#lib/sounds/gameSound.js';

export function createPicnicSound() {
  const sound = createGameSound({
    // One soft tick per object while the cloth flashes.
    tick: ({ tone }) => {
      tone({ freq: 900, dur: 0.05, type: 'triangle', vol: 0.035 });
    },
    // A berry dropping into the basket.
    berry: ({ tone }) => {
      tone({ freq: 520, dur: 0.12, type: 'sine', vol: 0.09, slide: -180 });
      tone({ freq: 780, dur: 0.1, type: 'triangle', vol: 0.04, slide: 140, delay: 0.04 });
    },
    // Three warm notes when the basket is full.
    fill: ({ tone, after }) => {
      tone({ freq: 523, dur: 0.18, type: 'triangle', vol: 0.09 });
      after(110, () => tone({ freq: 659, dur: 0.18, type: 'triangle', vol: 0.085 }));
      after(220, () => tone({ freq: 784, dur: 0.3, type: 'triangle', vol: 0.085 }));
    }
  });

  return {
    unlock() {
      sound.unlock();
    },
    tick() {
      sound.play('tick');
    },
    berry() {
      sound.play('berry');
    },
    fill() {
      sound.play('fill');
    },
    stop() {
      sound.stop();
    },
    dispose() {
      sound.dispose();
    }
  };
}
