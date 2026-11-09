import test from 'node:test';
import assert from 'node:assert/strict';
import { timedWordProgress, lyricGraphemes } from '../src/lyric-progress.js';
test('word illumination uses real bounds and handles seeking backwards', () => {
  assert.equal(timedWordProgress(10,12,9),0);
  assert.equal(timedWordProgress(10,12,11),.5);
  assert.equal(timedWordProgress(10,12,13),1);
  assert.equal(timedWordProgress(10,undefined,10),1);
  assert.equal(timedWordProgress(10,12,10.5),.25);
});
test('Latin combining graphemes stay intact and joining scripts are never split', () => {
  assert.deepEqual(lyricGraphemes('e\u0301!'),['e\u0301','!']);
  assert.equal(lyricGraphemes('مرحبا'),null);
  assert.equal(lyricGraphemes('नमस्ते'),null);
  assert.equal(lyricGraphemes('Hello مرحبا'),null);
});
