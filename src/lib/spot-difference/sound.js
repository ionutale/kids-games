// Harbor sound palette for Twin Postcards, built on the shared mute-aware
// `createGameSound`. A gull greets each new picture, finds climb a two-note
// chime, a wrong tap is a quiet low thud, a solve is a four-note jingle, and the
// set ends with a buoy bell. There is no negative sting and no clock tick.
import { createGameSound } from '#lib/sounds/gameSound.js';

const FIND_SCALE = [523, 659, 784, 1047];

export function createHarborSound() {
  let finds = 0;

  const sound = createGameSound({
    // A distant gull, two falling calls.
    gull: ({ tone }) => {
      tone({ freq: 1500, dur: 0.09, type: 'triangle', vol: 0.045, slide: -520 });
      tone({ freq: 1180, dur: 0.13, type: 'triangle', vol: 0.035, slide: -380, delay: 0.11 });
    },
    // A rising two-note chime; each find in the picture climbs a step.
    find: ({ tone }, step = 0) => {
      const base = FIND_SCALE[Math.min(Math.max(0, step), FIND_SCALE.length - 1)];
      tone({ freq: base, dur: 0.13, type: 'triangle', vol: 0.07 });
      tone({ freq: base * 1.5, dur: 0.17, type: 'triangle', vol: 0.045, delay: 0.07 });
    },
    // A soft low thud, never a buzzer.
    miss: ({ tone }) => {
      tone({ freq: 150, dur: 0.09, type: 'sine', vol: 0.045 });
    },
    // Four warm notes when a picture is solved.
    jingle: ({ tone, after }) => {
      [523, 659, 784, 1047].forEach((freq, index) => {
        after(index * 100, () => tone({ freq, dur: 0.22, type: 'triangle', vol: 0.07 }));
      });
    },
    // A buoy bell for the completed set.
    bell: ({ tone, after }) => {
      tone({ freq: 392, dur: 0.9, type: 'sine', vol: 0.055 });
      after(80, () => tone({ freq: 587, dur: 0.7, type: 'sine', vol: 0.028 }));
      after(160, () => tone({ freq: 784, dur: 0.5, type: 'sine', vol: 0.018 }));
    }
  });

  return {
    unlock() {
      sound.unlock();
    },
    reset() {
      finds = 0;
    },
    gull() {
      sound.play('gull');
    },
    find() {
      sound.play('find', finds);
      finds += 1;
    },
    miss() {
      sound.play('miss');
    },
    jingle() {
      sound.play('jingle');
    },
    bell() {
      sound.play('bell');
    },
    stop() {
      sound.stop();
    },
    dispose() {
      sound.dispose();
    }
  };
}
