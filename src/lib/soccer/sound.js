// Quiet night-stadium palette for the Night Penalty, built on the shared
// mute-aware `createGameSound` player. There is no negative sting: a save is a
// glove thud and a miss is a whoosh, never a scold.
import { createGameSound } from '#lib/sounds/gameSound.js';

export function createStadiumSound() {
  const sound = createGameSound({
    // The referee's short two-note whistle opens a new round.
    whistle: ({ tone }) => {
      tone({ freq: 1850, dur: 0.12, type: 'triangle', vol: 0.07 });
      tone({ freq: 2050, dur: 0.18, type: 'triangle', vol: 0.06, delay: 0.05 });
    },
    // A low boot thud with a dry scuff of grass.
    kick: ({ tone, noise }) => {
      tone({ freq: 90, dur: 0.12, type: 'sine', vol: 0.13 });
      noise({ dur: 0.06, vol: 0.05, cutoff: 700 });
    },
    // A goal: the net swishes, then a quiet crowd cheer (no fanfare).
    net: ({ tone, noise, after }) => {
      noise({ dur: 0.2, vol: 0.12, cutoff: 1400 });
      tone({ freq: 523, dur: 0.12, type: 'triangle', vol: 0.06 });
      after(130, () => noise({ dur: 0.55, vol: 0.07, cutoff: 900 }));
      after(170, () => tone({ freq: 659, dur: 0.18, type: 'triangle', vol: 0.045 }));
      after(300, () => tone({ freq: 784, dur: 0.24, type: 'triangle', vol: 0.045 }));
    },
    // A save: the keeper's glove stops the ball.
    glove: ({ tone, noise }) => {
      tone({ freq: 120, dur: 0.12, type: 'sine', vol: 0.14 });
      noise({ dur: 0.06, vol: 0.04, cutoff: 600 });
    },
    // A miss: the ball sails past the post, and nothing scolds the child.
    whoosh: ({ noise }) => {
      noise({ dur: 0.22, vol: 0.06, cutoff: 3200 });
    }
  });

  return {
    unlock() {
      sound.unlock();
    },
    whistle() {
      sound.play('whistle');
    },
    kick() {
      sound.play('kick');
    },
    net() {
      sound.play('net');
    },
    glove() {
      sound.play('glove');
    },
    whoosh() {
      sound.play('whoosh');
    },
    stop() {
      sound.stop();
    },
    dispose() {
      sound.dispose();
    }
  };
}
