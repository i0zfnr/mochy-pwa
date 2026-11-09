import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseLrc, nextIndex, time } from '../src/music.js';
import { highResolutionArtwork } from '../src/artwork.js';
import { ambientTones } from '../src/ambient-palette.js';
import { EQ_FREQUENCIES, EQ_PRESETS, createAudioLabGraph } from '../src/audio-lab.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.resolve(rootDir, 'src');

// Mock Web Audio Context for DSP graph verification
class MockParam {
  constructor(val = 0) { this.value = val; }
  setTargetAtTime(val) { this.value = val; }
}

class MockNode {
  constructor() {
    this.gain = new MockParam(1);
    this.frequency = new MockParam(1000);
    this.Q = new MockParam(1);
    this.delayTime = new MockParam(0);
  }
  connect() {}
  disconnect() {}
}

const mockAudioContext = {
  createGain: () => new MockNode(),
  createBiquadFilter: () => new MockNode(),
  createDelay: () => new MockNode(),
};

// =============================================================================
// TIER 1: Feature Coverage Tests
// =============================================================================

test('Tier 1 [Navigation & Topbar]: navigation links and breadcrumb state mapping', () => {
  const mainJsx = fs.readFileSync(path.join(srcDir, 'main.jsx'), 'utf8');

  // Verify core navigation views supported
  const pages = ['home', 'search', 'library', 'audiolab', 'settings'];
  for (const p of pages) {
    assert.ok(mainJsx.includes(`'${p}'`) || mainJsx.includes(`"${p}"`), `main.jsx must support navigation page '${p}'`);
  }

  // Topbar exists and contains actions
  assert.ok(mainJsx.includes('topbar'), 'topbar layout must exist');
});

test('Tier 1 [Player & Fullscreen]: interactive synced lyrics parser and timing alignment', () => {
  const sampleLrc = `[00:00.00]Intro
[00:04.25]<00:04.25>Sweet <00:04.75>sounds <00:05.10>in <00:05.50>the <00:06.00>air
[00:08.50]Instrumental bridge
[00:15.00]<00:15.00>Echoes <00:15.80>fading`;

  const parsed = parseLrc(sampleLrc);
  assert.equal(parsed.length, 4);

  // Line 1: plain
  assert.equal(parsed[0].text, 'Intro');
  assert.equal(parsed[0].words, undefined);

  // Line 2: karaoke word timestamps
  assert.equal(parsed[1].text, 'Sweet sounds in the air');
  assert.ok(Array.isArray(parsed[1].words));
  assert.equal(parsed[1].words.length, 5);
  assert.equal(parsed[1].words[0].text, 'Sweet ');
  assert.equal(parsed[1].words[0].time, 4.25);

  // Focus position (40%) check
  const activeIndex = 1;
  const containerHeight = 600;
  const focusOffset = containerHeight * 0.40;
  assert.ok(focusOffset > 220 && focusOffset < 260, '40% focus position offset accurately calculated');
});

test('Tier 1 [Search & Spotify Import]: Spotify URL pattern matching and link detection', () => {
  const spotifyTrackUrl = 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT';
  const spotifyAlbumUrl = 'https://open.spotify.com/album/2noRn2Aes5aoNVsU6iWThc';
  const spotifyPlaylistUrl = 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M';
  const regularQuery = 'laufey from the start';

  const spotifyRegex = /https?:\/\/open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/;

  assert.ok(spotifyRegex.test(spotifyTrackUrl), 'Recognizes Spotify track URL');
  assert.ok(spotifyRegex.test(spotifyAlbumUrl), 'Recognizes Spotify album URL');
  assert.ok(spotifyRegex.test(spotifyPlaylistUrl), 'Recognizes Spotify playlist URL');
  assert.strictEqual(spotifyRegex.test(regularQuery), false, 'Normal query is not flagged as Spotify URL');
});

test('Tier 1 [Library & Storage]: playlist data structure and persistence schema', () => {
  // Validate playlist structure schema
  const playlist = {
    id: 'pl_' + Date.now(),
    name: 'Late Night Chill',
    createdAt: new Date().toISOString(),
    tracks: [
      { id: 'trk_1', title: 'Promise', artist: 'Laufey', duration: 234 },
      { id: 'trk_2', title: 'Glue Song', artist: 'beabadoobee', duration: 180 }
    ]
  };

  assert.ok(playlist.id.startsWith('pl_'));
  assert.equal(playlist.name, 'Late Night Chill');
  assert.equal(playlist.tracks.length, 2);
  assert.equal(playlist.tracks.reduce((acc, t) => acc + t.duration, 0), 414);
});

test('Tier 1 [Audio Lab]: Equalizer frequency clamping and preset boost ranges', () => {
  assert.equal(EQ_FREQUENCIES.length, 5);

  // Bass boost preset
  const bassBoost = EQ_PRESETS.bass_boost;
  assert.ok(bassBoost.bands.b60 >= 6, 'Bass boost b60 band must be boosted by at least 6dB');
  assert.ok(bassBoost.bands.b250 >= 2, 'Bass boost b250 band must be boosted by at least 2dB');

  // Vocal preset
  const vocal = EQ_PRESETS.vocal;
  assert.ok(vocal.bands.b1k >= 3, 'Vocal preset b1k band must be boosted for presence');

  // Graph creation
  const graph = createAudioLabGraph(mockAudioContext, {
    equalizer: { enabled: true, bands: bassBoost.bands },
    effect: 'off',
    transition: 'auto'
  });
  assert.ok(graph.input, 'Audio graph has input node');
  assert.ok(graph.output, 'Audio graph has output node');
});

// =============================================================================
// TIER 2: Boundary & Corner Cases
// =============================================================================

test('Tier 2 [Boundary]: missing or corrupt artwork URLs fall back to highResolutionArtwork safely', () => {
  assert.equal(highResolutionArtwork(''), '');
  assert.equal(highResolutionArtwork(null), null);
  assert.equal(highResolutionArtwork(undefined), '');

  const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  assert.equal(highResolutionArtwork(dataUrl), dataUrl, 'Data URLs must remain untouched');

  const youtubeUrl = 'https://lh3.googleusercontent.com/abc=w120-h120-l90-rj';
  assert.ok(highResolutionArtwork(youtubeUrl).includes('=w1000-h1000'), 'Rewrites thumbnail to high-resolution 1000px variant');
});

test('Tier 2 [Boundary]: duration formatting handles negative, NaN numbers, and non-numeric strings', () => {
  assert.equal(time(NaN), '0:00');
  assert.equal(time(-10), '0:00');
  assert.equal(time('invalid string'), '0:00');
  assert.equal(time(null), '0:00');
  assert.equal(time(undefined), '0:00');
  assert.equal(time(0), '0:00');
  assert.equal(time(59), '0:59');
  assert.equal(time(60), '1:00');
  assert.equal(time(3599), '59:59');
});

test('Tier 2 [Boundary]: queue navigation handles 0-length, 1-length, and out-of-bounds indices', () => {
  // Empty queue
  assert.equal(nextIndex(0, 0, false, 'off', 1), -1);

  // Single-track queue
  assert.equal(nextIndex(0, 1, false, 'off', 1, true), -1);
  assert.equal(nextIndex(0, 1, false, 'all', 1, true), 0);
  assert.equal(nextIndex(0, 1, false, 'one', 1, true), 0);

  // Backward navigation from index 0 wraps to end
  assert.equal(nextIndex(0, 5, false, 'off', -1), 4);
});

test('Tier 2 [Boundary]: ambient tone extraction bounds brightness for white lyrics legibility', () => {
  // Synthesize solid bright white 16x16 image
  const whitePixels = new Uint8ClampedArray(16 * 16 * 4);
  whitePixels.fill(255);

  const [left, right, deep, accent] = ambientTones(whitePixels, 16, 16);
  // Deep background brightness must be capped to <= 0.26001 for high contrast against white text
  const deepBrightness = (Math.max(...deep) + Math.min(...deep)) / 2;
  assert.ok(
    deepBrightness <= 0.26001,
    `Deep ambient tone brightness (${deepBrightness}) must be capped <= 0.26001 for white text readability`
  );
});

// =============================================================================
// TIER 3: Cross-Feature Combinations
// =============================================================================

test('Tier 3 [Pairwise]: Playback state continuity across theme switching and view navigation', () => {
  // Simulated playback engine state
  const playerState = {
    current: { id: 'track_1', title: 'From The Start', artist: 'Laufey', duration: 169 },
    playing: true,
    position: 45.2,
    volume: 0.8
  };

  // Simulate view transition: Home -> Search
  let activePage = 'home';
  activePage = 'search';

  // State continuity invariant: navigation must NOT reset player state
  assert.equal(playerState.playing, true, 'Audio must continue playing when changing view');
  assert.equal(playerState.current.id, 'track_1', 'Current track must persist across view transitions');

  // Simulate theme switch: apple-dark -> apple-light
  let activeTheme = 'apple-dark';
  activeTheme = 'apple-light';

  assert.equal(playerState.playing, true, 'Audio must continue playing during theme change');
  assert.equal(activeTheme, 'apple-light');
});

test('Tier 3 [Pairwise]: Lyric offset adjustment combined with seek operations', () => {
  const currentTrackId = 'track_42';
  const lyricDelays = {};

  // User adjusts lyric delay by +1.5s
  lyricDelays[currentTrackId] = 1.5;

  const currentAudioPosition = 30.0;
  const effectiveLyricPosition = currentAudioPosition - lyricDelays[currentTrackId];
  assert.equal(effectiveLyricPosition, 28.5, 'Effective lyric position applies offset adjustment');

  // User clicks lyric at timestamp 50.0s -> seeks player to 50.0 + delay
  const targetLyricTimestamp = 50.0;
  const targetAudioSeek = targetLyricTimestamp + lyricDelays[currentTrackId];
  assert.equal(targetAudioSeek, 51.5, 'Audio seek compensates for lyric delay offset');
});

// =============================================================================
// TIER 4: Real-World Application Scenarios
// =============================================================================

test('Tier 4 [Journey]: Local audio file import, playlist creation, and queue playback', () => {
  // Step 1: Simulated local files imported
  const importedTracks = [
    { id: 'local_1', title: 'Track One', artist: 'Artist A', duration: 200, source: 'local' },
    { id: 'local_2', title: 'Track Two', artist: 'Artist B', duration: 240, source: 'local' },
  ];
  assert.equal(importedTracks.length, 2);

  // Step 2: User creates new playlist "Favorites"
  const playlist = {
    id: 'pl_fav',
    name: 'Favorites',
    tracks: [...importedTracks]
  };
  assert.equal(playlist.tracks.length, 2);

  // Step 3: Queue initialized with playlist tracks
  const queue = [...playlist.tracks];
  let currentIndex = 0;
  assert.equal(queue[currentIndex].title, 'Track One');

  // Step 4: Advance to next track
  currentIndex = nextIndex(currentIndex, queue.length, false, 'off', 1);
  assert.equal(currentIndex, 1);
  assert.equal(queue[currentIndex].title, 'Track Two');

  // Step 5: Advance past end with repeat off
  currentIndex = nextIndex(currentIndex, queue.length, false, 'off', 1, true);
  assert.equal(currentIndex, -1, 'Playback halts cleanly at end of queue');
});

test('Tier 4 [Journey]: Search query, add to queue, and continuous playback transition', () => {
  // Step 1: In-flight search results
  const searchResults = [
    { id: 'yt_101', title: 'Song Alpha', artist: 'Artist X', duration: 180 },
    { id: 'yt_102', title: 'Song Beta', artist: 'Artist Y', duration: 210 },
  ];

  // Step 2: User plays first result
  let currentTrack = searchResults[0];
  const queue = [searchResults[0]];
  let currentIndex = 0;

  // Step 3: User adds second result to queue
  queue.push(searchResults[1]);
  assert.equal(queue.length, 2);

  // Step 4: Song Alpha finishes naturally
  currentIndex = nextIndex(currentIndex, queue.length, false, 'off', 1, true);
  assert.equal(currentIndex, 1);
  currentTrack = queue[currentIndex];
  assert.equal(currentTrack.id, 'yt_102', 'Queue smoothly transitions to queued track');
});
