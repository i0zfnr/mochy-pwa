import test from 'node:test';
import assert from 'node:assert/strict';
import { matchRecording, selectRecording } from '../server/lyrics-match.js';
import { parseLrc } from '../src/music.js';
import { highResolutionArtwork } from '../src/artwork.js';

const recording = { title: 'Example Song (Official Audio)', artist: 'Example Artist - Topic', duration: 210 };
const exact = { trackName: 'Example Song', artistName: 'Example Artist', duration: 210, syncedLyrics: '[00:12]First line' };
test('timed lyrics reject different recordings, versions and artists', () => {
  assert.equal(matchRecording(exact, recording), true);
  assert.equal(matchRecording({ ...exact, duration: 236 }, recording), false);
  assert.equal(matchRecording({ ...exact, artistName: 'Cover Artist' }, recording), false);
  assert.equal(matchRecording({ ...exact, trackName: 'Example Song (Live)' }, recording), false);
  assert.equal(matchRecording({ ...exact, trackName: 'Example Song (Remix)' }, recording), false);
  assert.equal(selectRecording([{ ...exact, duration: 240 }, exact], recording), exact);
});
test('word timing is used only when the lyrics contain real word timestamps', () => {
  const line = parseLrc('[00:12.00]A whole line')[0];
  assert.equal(line.words, undefined);
  const enhanced = parseLrc('[00:12.00]<00:12.00>A <00:12.80>whole <00:13.50>line')[0];
  assert.equal(enhanced.text, 'A whole line');
  assert.deepEqual(enhanced.words.map(word => word.time), [12, 12.8, 13.5]);
});
test('cover sizing requests real high-resolution variants and keeps local art intact', () => {
  assert.equal(highResolutionArtwork('https://yt3.googleusercontent.com/art=w120-h120-l90-rj'), 'https://yt3.googleusercontent.com/art=w1000-h1000-l90-rj');
  assert.equal(highResolutionArtwork('data:image/png;base64,local'), 'data:image/png;base64,local');
  assert.equal(highResolutionArtwork('https://example.com/cover.jpg'), 'https://example.com/cover.jpg');
});
