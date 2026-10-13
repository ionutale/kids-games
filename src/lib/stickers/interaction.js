/**
 * Drag-grab maths for the Stickers game.
 *
 * A sticker lifted from the tray starts its drag with no grab event, so its
 * offset MUST be zero. The old code left the previous drag's offset in place,
 * making the newly placed sticker jump away from the finger on its first move.
 */
export function dragOffsetFor(e, sceneRect, sticker) {
  if (!e || !sceneRect || !sticker || !sceneRect.width || !sceneRect.height) {
    return { x: 0, y: 0 };
  }
  return {
    x: ((e.clientX - sceneRect.left) / sceneRect.width) * 100 - sticker.x,
    y: ((e.clientY - sceneRect.top) / sceneRect.height) * 100 - sticker.y
  };
}
