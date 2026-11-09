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
import { estimateWordTimes } from '../src/lyric-progress.js';
test('estimated words preserve source timings and remain within recording boundaries', () => {
  const exact = {time:10,text:'Keep me',words:[{time:10,text:'Keep '},{time:11,text:'me'}]};
  const lines = [{time:0,text:'Sinar mentari senja'}, {time:5,text:''},exact,{time:15,text:'Last words'}];
  const result = estimateWordTimes(lines,18);
  assert.equal(result[2],exact);
  assert.equal(result[1],lines[1]);
  assert.equal(result[0].words.map(w=>w.text).join(''),lines[0].text);
  assert.equal(result[0].words[0].time,0);
  assert.ok(result[0].words.at(-1).end < 5);
  assert.ok(result[3].words.at(-1).end <=18);
  assert.equal(result[0].estimatedWordTiming,true);
});
import { visualLyricPosition } from '../src/lyric-progress.js';
test('visual lyric clock interpolates frames but freezes on pause and clamps stalls', () => {
 const sample={position:10,at:1000};
 assert.equal(visualLyricPosition(sample,1016,true),10.016);
 assert.equal(visualLyricPosition(sample,1100,false),10);
 assert.equal(visualLyricPosition(sample,5000,true),10.2);
 assert.equal(visualLyricPosition({position:2,at:2000},2000,true),2);
 assert.equal(visualLyricPosition(sample,999,true),10);
});
