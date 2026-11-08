// Quiet pond palette for Pond Catch, built on the shared mute-aware
// `createGameSound` player. A catch is a plop plus a soft croak; filling the
// jar is three warm notes. There is no negative sound and no timer tick.
import { createGameSound } from '#lib/sounds/gameSound.js';

export function createPondSound() {
  const sound = createGameSound({
    // A small water plop with a bright droplet on top.
    catch: ({ tone }) => {
      tone({ freq: 520, dur: 0.12, type: 'sine', vol: 0.09, slide: -220 });
      tone({ freq: 1300, dur: 0.1, type: 'triangle', vol: 0.04, slide: 280, delay: 0.04 });
    },
    // The frog's happy little croak, low and soft.
    croak: ({ tone }) => {
      tone({ freq: 150, dur: 0.1, type: 'square', vol: 0.035 });
      tone({ freq: 120, dur: 0.12, type: 'square', vol: 0.03, delay: 0.09 });
    },
    // Three warm notes when the jar is full.
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
    catch() {
      sound.play('catch');
    },
    croak() {
      sound.play('croak');
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
