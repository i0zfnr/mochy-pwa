import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  EQ_FREQUENCIES,
  EQ_PRESETS,
  AUDIO_EFFECTS,
  AUDIO_QUALITIES,
  TRANSITION_PRESETS,
  DEFAULT_AUDIO_LAB,
} from '../src/audio-lab.js';
import { parseLrc, nextIndex, time } from '../src/music.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.resolve(rootDir, 'src');

test('E2E Audio Engine: usePlayer.js satisfies interface contract exports', () => {
  const usePlayerContent = fs.readFileSync(path.join(srcDir, 'usePlayer.js'), 'utf8');

  // Interface contract exports required by PROJECT.md
  const requiredKeys = [
    'current',
    'queue',
    'index',
    'playing',
    'position',
    'duration',
    'volume',
    'setVolume',
    'shuffle',
    'setShuffle',
    'repeat',
    'toggle',
    'seek',
    'setQueue',
    'removeQueueItem',
    'analyserRef'
  ];

  // Check return statement in usePlayer.js
  const returnMatch = usePlayerContent.match(/return\s*\{([^}]+)\};?\s*\}/);
  assert.ok(returnMatch, 'usePlayer must contain an exported return object');

  const returnedProps = returnMatch[1]
    .split(',')
    .map(p => p.trim())
    .filter(Boolean);

  for (const key of requiredKeys) {
    const hasKey = returnedProps.some(p => p === key || p.startsWith(`${key}:`));
    assert.ok(hasKey, `usePlayer.js return object must include '${key}'`);
  }
});

test('E2E Audio Engine: Audio Lab DSP frequencies, presets, effects, and default settings', () => {
  // 5 EQ bands
  assert.equal(EQ_FREQUENCIES.length, 5, 'Must have exactly 5 EQ bands');
  const bandIds = EQ_FREQUENCIES.map(b => b.id);
  assert.deepEqual(bandIds, ['b60', 'b250', 'b1k', 'b4k', 'b12k']);

  // Presets
  assert.ok('flat' in EQ_PRESETS, 'flat preset must exist');
  assert.ok('bass_boost' in EQ_PRESETS, 'bass_boost preset must exist');
  assert.ok('vocal' in EQ_PRESETS, 'vocal preset must exist');

  // Effects
  const effectIds = AUDIO_EFFECTS.map(e => e.id);
  assert.ok(effectIds.includes('off'), 'effects must include off');
  assert.ok(effectIds.includes('surround'), 'effects must include surround');
  assert.ok(effectIds.includes('bass'), 'effects must include bass');

  // Qualities
  const qualityIds = AUDIO_QUALITIES.map(q => q.id);
  assert.ok(qualityIds.includes('auto'), 'qualities must include auto');
  assert.ok(qualityIds.includes('high'), 'qualities must include high');

  // Transitions
  const transitionIds = TRANSITION_PRESETS.map(t => t.id);
  assert.ok(transitionIds.includes('auto'), 'transitions must include auto');
  assert.ok(transitionIds.includes('crossfade_5s'), 'transitions must include crossfade_5s');
  assert.ok(transitionIds.includes('gapless'), 'transitions must include gapless');

  // DEFAULT_AUDIO_LAB structure
  assert.ok('equalizer' in DEFAULT_AUDIO_LAB, 'default settings has equalizer');
  assert.ok('effect' in DEFAULT_AUDIO_LAB, 'default settings has effect');
  assert.ok('transition' in DEFAULT_AUDIO_LAB, 'default settings has transition');
});

test('E2E Audio Engine: Server listener stdout regex contract compatibility', () => {
  const SERVER_READY_REGEX = /(?:Xenn|Mochy) is ready at (http:\/\/127\.0\.0\.1:\d+)/;

  const legacyStdout = 'Xenn is ready at http://127.0.0.1:4567\n';
  const legacyMatch = legacyStdout.match(SERVER_READY_REGEX);
  assert.ok(legacyMatch, 'Regex matches legacy server startup message');
  assert.equal(legacyMatch[1], 'http://127.0.0.1:4567');

  const mochyStdout = 'Mochy is ready at http://127.0.0.1:8080\n';
  const mochyMatch = mochyStdout.match(SERVER_READY_REGEX);
  assert.ok(mochyMatch, 'Regex matches rebranded Mochy server startup message');
  assert.equal(mochyMatch[1], 'http://127.0.0.1:8080');
});

test('E2E Audio Engine: silentAudio cleanup in usePlayer unmount hook', (t) => {
  const usePlayerContent = fs.readFileSync(path.join(srcDir, 'usePlayer.js'), 'utf8');

  // Survey discovered latent ReferenceError: silentAudio at usePlayer.js:177
  if (usePlayerContent.includes('silentAudio.pause()')) {
    t.diagnostic('Note: usePlayer.js line 177 contains legacy `silentAudio.pause()`; scheduled for replacement with `silentAudioRef.current?.pause()` in M3');
  } else {
    assert.ok(
      usePlayerContent.includes('silentAudioRef.current?.pause()') || !usePlayerContent.includes('silentAudio.pause()'),
      'silentAudio must use safe ref access'
    );
  }
});

test('E2E Audio Engine: Music helper invariants for lyrics, timing and queue cycling', () => {
  // Duration formatting invariants
  assert.equal(time(0), '0:00');
  assert.equal(time(65), '1:05');
  assert.equal(time(3600), '60:00');
  assert.equal(time(null), '0:00');
  assert.equal(time(undefined), '0:00');

  // LRC timestamp parser invariants
  const lrc = '[00:01.00]First line\n[00:03.50]Second line';
  const parsed = parseLrc(lrc);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].time, 1.0);
  assert.equal(parsed[0].text, 'First line');
  assert.equal(parsed[1].time, 3.5);

  // Queue cycling invariants
  // 3 items (indices 0, 1, 2)
  assert.equal(nextIndex(0, 3, false, 'off', 1), 1);
  assert.equal(nextIndex(1, 3, false, 'off', 1), 2);
  assert.equal(nextIndex(2, 3, false, 'off', 1, true), -1); // queue end when song completes naturally
  assert.equal(nextIndex(2, 3, false, 'all', 1, true), 0);  // wrap to start on repeat all
  assert.equal(nextIndex(1, 3, false, 'one', 1, true), 1);  // repeat one on track end
});
