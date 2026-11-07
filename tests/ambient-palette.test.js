import test from 'node:test';
import assert from 'node:assert/strict';
import { ambientTones } from '../src/ambient-palette.js';

test('album tones preserve cover regions and cap brightness for white lyrics', () => {
  const pixels = new Uint8ClampedArray(32 * 32 * 4);
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
    const index = (y * 32 + x) * 4;
    const rgb = y < 13 ? [25, 190, 70] : x < 16 ? [220, 30, 40] : [25, 50, 220];
    pixels.set([...rgb, 255], index);
  }
  const [left, right, deep, accent] = ambientTones(pixels, 32, 32);
  assert.ok(left[0] > left[2], 'left seam retains the red cover region');
  assert.ok(right[2] > right[0], 'right seam retains the blue cover region');
  assert.ok(accent[1] > accent[0], 'accent comes from the top of the artwork');
  for (const rgb of [left, right, deep, accent]) assert.ok(rgb.every(channel => Number.isFinite(channel) && channel >= 0 && channel <= 1));
  assert.ok((Math.max(...deep) + Math.min(...deep)) / 2 <= .26001);
});
