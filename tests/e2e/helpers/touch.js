/**
 * Touch-first input helpers for mobile specs.
 *
 * The app is mobile-first: components listen to Pointer Events (down on the
 * element, move/up on window during a drag). These helpers replay that exact
 * shape with pointerType: 'touch' so tests exercise the production phone path
 * (no mouse).
 */

const PE = (x, y, extra = {}) => ({
  pointerId: 7,
  pointerType: 'touch',
  isPrimary: true,
  clientX: x,
  clientY: y,
  buttons: 1,
  bubbles: true,
  cancelable: true,
  ...extra
});

/** Center point of a locator in viewport coordinates. */
export async function center(locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error(`locator has no bounding box: ${locator}`);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

function lerp(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/**
 * Touch-drag from the item to a target point.
 * - pointerdown is dispatched ON `item` (that's where beginDrag is bound);
 * - pointermove/pointerup are dispatched at window level (the component's
 *   duringDrag/endDrag live there).
 */
export async function touchDrag(page, item, to, { steps = 8, settleMs = 30 } = {}) {
  const from = await center(item);
  await item.dispatchEvent('pointerdown', PE(from.x, from.y));
  for (let i = 1; i <= steps; i++) {
    const p = lerp(from, to, i / steps);
    await page.dispatchEvent(':root', 'pointermove', PE(p.x, p.y));
    await page.waitForTimeout(settleMs);
  }
  await page.dispatchEvent(':root', 'pointerup', PE(to.x, to.y));
  await page.waitForTimeout(120);
}

/** Real-device-style tap (CDP touchscreen) — fires pointer events + click. */
export async function touchTap(page, locator) {
  const p = await center(locator);
  await page.touchscreen.tap(p.x, p.y);
  await page.waitForTimeout(80);
}