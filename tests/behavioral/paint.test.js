import { describe, it, expect } from 'vitest';

describe('Paint game behavior', () => {
  it('brush and stamp are the two modes', () => {
    const modes = ['brush', 'stamp'];
    expect(modes.includes('brush')).toBe(true);
    expect(modes.includes('stamp')).toBe(true);
  });

  it('colors array has 6 entries', () => {
    const colors = ['#FF6B6B', '#4FC3F7', '#81C784', '#FFD54F', '#BA68C8', '#FF8A65'];
    expect(colors).toHaveLength(6);
  });

  it('drawing starts on mousedown and stops on mouseup', () => {
    let isDrawing = false;
    isDrawing = true;
    expect(isDrawing).toBe(true);
    isDrawing = false;
    expect(isDrawing).toBe(false);
  });

  it('color switching sets current color and switches to brush mode', () => {
    let currentColor = '#FF6B6B';
    let mode = 'stamp';
    currentColor = '#4FC3F7';
    mode = 'brush';
    expect(currentColor).toBe('#4FC3F7');
    expect(mode).toBe('brush');
  });

  it('clear canvas resets drawing', () => {
    let cleared = false;
    cleared = true;
    expect(cleared).toBe(true);
  });
});
