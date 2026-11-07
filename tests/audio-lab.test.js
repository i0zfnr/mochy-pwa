import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EQ_FREQUENCIES,
  EQ_PRESETS,
  AUDIO_EFFECTS,
  AUDIO_QUALITIES,
  TRANSITION_PRESETS,
  DEFAULT_AUDIO_LAB,
  createAudioLabGraph,
  updateAudioLabGraph,
} from '../src/audio-lab.js';

test('audio lab exports valid 5-band frequency definitions', () => {
  assert.equal(EQ_FREQUENCIES.length, 5);
  const ids = EQ_FREQUENCIES.map(f => f.id);
  assert.deepEqual(ids, ['b60', 'b250', 'b1k', 'b4k', 'b12k']);
  assert.equal(EQ_FREQUENCIES[0].type, 'lowshelf');
  assert.equal(EQ_FREQUENCIES[4].type, 'highshelf');
});

test('audio lab presets define all 5 bands with expected boosts', () => {
  assert.ok(EQ_PRESETS.flat);
  assert.deepEqual(EQ_PRESETS.flat.bands, { b60: 0, b250: 0, b1k: 0, b4k: 0, b12k: 0 });

  assert.ok(EQ_PRESETS.bass_boost);
  assert.ok(EQ_PRESETS.bass_boost.bands.b60 > 5);

  assert.ok(EQ_PRESETS.vocal);
  assert.ok(EQ_PRESETS.vocal.bands.b1k > 2);

  assert.ok(EQ_PRESETS.custom);
  assert.equal(typeof EQ_PRESETS.custom.bands.b60, 'number');
});

test('audio effects include surround, bass, concert, vocal and off', () => {
  const effectIds = AUDIO_EFFECTS.map(e => e.id);
  assert.ok(effectIds.includes('off'));
  assert.ok(effectIds.includes('surround'));
  assert.ok(effectIds.includes('bass'));
  assert.ok(effectIds.includes('concert'));
  assert.ok(effectIds.includes('vocal'));
});

test('audio qualities define youtube auto and hd options', () => {
  const qualityIds = AUDIO_QUALITIES.map(q => q.id);
  assert.ok(qualityIds.includes('auto'));
  assert.ok(qualityIds.includes('high'));
  assert.ok(qualityIds.includes('normal'));
  assert.ok(qualityIds.includes('saver'));
});

test('transition presets support 3s auto crossfade, 5s crossfade, gapless and off', () => {
  const transitionIds = TRANSITION_PRESETS.map(t => t.id);
  assert.ok(transitionIds.includes('auto'));
  assert.ok(transitionIds.includes('crossfade_5s'));
  assert.ok(transitionIds.includes('gapless'));
  assert.ok(transitionIds.includes('off'));
});

test('createAudioLabGraph constructs Web Audio filter chain and responds to setting updates', () => {
  // Mock Web Audio Context
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
  }
  const mockContext = {
    createGain: () => new MockNode(),
    createBiquadFilter: () => new MockNode(),
    createDelay: () => new MockNode(),
  };

  const graph = createAudioLabGraph(mockContext);
  assert.ok(graph);
  assert.equal(graph.filters.length, 5);

  // Update with default settings (Surround, Custom EQ)
  updateAudioLabGraph(graph, DEFAULT_AUDIO_LAB);
  assert.equal(graph.filters[0].filter.gain.value, 4);
  assert.equal(graph.wetGain.gain.value, 0.45);

  // Update with Flat and Off
  updateAudioLabGraph(graph, {
    equalizer: { enabled: true, preset: 'flat', bands: { b60: 0, b250: 0, b1k: 0, b4k: 0, b12k: 0 } },
    effect: 'off',
  });
  assert.equal(graph.filters[0].filter.gain.value, 0);
  assert.equal(graph.wetGain.gain.value, 0);
});
