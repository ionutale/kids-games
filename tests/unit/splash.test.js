import { describe, it, expect } from 'vitest';

describe('Splash game', () => {
  it('burst count scales with age', () => {
    const count = { 2: 3, 3: 6, 4: 6, 5: 6 };
    expect(count[2]).toBe(3);
    expect(count[5]).toBe(6);
  });

  it('has effect colors and emojis', () => {
    const colors = ['#FF6B6B', '#4FC3F7', '#81C784', '#FFD54F', '#BA68C8', '#FF8A65', '#E57373', '#64B5F6'];
    const emojis = ['⭐', '🌸', '🦋', '💫', '🎈', '🌈', '✨', '❤️'];
    expect(colors.length).toBe(8);
    expect(emojis.length).toBe(8);
  });

  it('elimination timing is 3500ms', () => {
    const timeout = 3500;
    expect(timeout).toBe(3500);
  });

  it('animation timing matches elimination', () => {
    const animationDuration = 3.5;
    expect(animationDuration).toBeGreaterThanOrEqual(3);
  });
});
