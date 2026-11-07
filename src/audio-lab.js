// Audio Lab audio processor: 5-band Equalizer, Spatial/Surround effects, Crossfade, and Audio Pass.

export const EQ_FREQUENCIES = [
  { id: 'b60', freq: 60, type: 'lowshelf', label: '60 Hz', name: 'Bass' },
  { id: 'b250', freq: 250, type: 'peaking', label: '250 Hz', name: 'Low Mid' },
  { id: 'b1k', freq: 1000, type: 'peaking', label: '1 kHz', name: 'Mid' },
  { id: 'b4k', freq: 4000, type: 'peaking', label: '4 kHz', name: 'High Mid' },
  { id: 'b12k', freq: 12000, type: 'highshelf', label: '12 kHz', name: 'Treble' },
];

export const EQ_PRESETS = {
  custom: { name: 'Custom', bands: { b60: 4, b250: 2, b1k: 0, b4k: 2, b12k: 4 } },
  flat: { name: 'Flat', bands: { b60: 0, b250: 0, b1k: 0, b4k: 0, b12k: 0 } },
  bass_boost: { name: 'Bass Boost', bands: { b60: 7, b250: 4, b1k: 0, b4k: -1, b12k: 1 } },
  vocal: { name: 'Vocal Boost', bands: { b60: -2, b250: 1, b1k: 4, b4k: 3, b12k: 1 } },
  electronic: { name: 'Electronic', bands: { b60: 5, b250: 2, b1k: -1, b4k: 3, b12k: 5 } },
  rock: { name: 'Rock', bands: { b60: 5, b250: 3, b1k: -1, b4k: 2, b12k: 4 } },
  acoustic: { name: 'Acoustic', bands: { b60: 3, b250: 1, b1k: 1, b4k: 3, b12k: 3 } },
  treble_boost: { name: 'Treble Boost', bands: { b60: -2, b250: -1, b1k: 1, b4k: 4, b12k: 7 } },
};

export const AUDIO_EFFECTS = [
  { id: 'off', name: 'Off', description: 'Pure unaltered stereo output' },
  { id: 'surround', name: 'Surround', description: 'Wide spatial stage with 3D depth' },
  { id: 'bass', name: 'Bass Immersion', description: 'Deep cinematic low-end warmth' },
  { id: 'concert', name: 'Concert Hall', description: 'Expansive live acoustic ambiance' },
  { id: 'vocal', name: 'Vocal Clarity', description: 'Crisp upfront vocal presence' },
];

export const AUDIO_QUALITIES = [
  { id: 'auto', name: 'Auto', provider: 'YouTube', description: 'Best available quality adapted to connection' },
  { id: 'high', name: 'High (320 kbps)', provider: 'HD Audio', description: 'Maximum fidelity and studio detail' },
  { id: 'normal', name: 'Normal (160 kbps)', provider: 'Standard', description: 'Balanced fidelity and bandwidth' },
  { id: 'saver', name: 'Data Saver (96 kbps)', provider: 'Compact', description: 'Optimized for mobile network limits' },
];

export const TRANSITION_PRESETS = [
  { id: 'auto', name: 'Auto (3s)', duration: 3, description: 'Smooth 3-second natural crossfade' },
  { id: 'crossfade_5s', name: 'Crossfade (5s)', duration: 5, description: 'Long 5-second cinematic blend' },
  { id: 'gapless', name: 'Gapless', duration: 0, description: 'Zero delay between tracks' },
  { id: 'off', name: 'Off', duration: 0, description: 'Standard cut on track change' },
];

export const BEAT_INTENSITIES = [
  { id: 'low', name: 'Low', multiplier: 0.55, description: 'Subtle, gentle ambient breathing' },
  { id: 'normal', name: 'Normal', multiplier: 1.0, description: 'Balanced Apple Music rhythm & bounce' },
  { id: 'aggressive', name: 'Aggressive', multiplier: 1.85, description: 'Deep, dynamic club expansion & luminescence' },
  { id: 'off', name: 'Off', multiplier: 0, description: 'Static ambient colors without rhythm movement' },
];

export const DEFAULT_AUDIO_LAB = {
  equalizer: {
    enabled: true,
    preset: 'custom',
    bands: { b60: 4, b250: 2, b1k: 0, b4k: 2, b12k: 4 },
  },
  effect: 'surround',
  quality: 'auto',
  transition: 'auto',
  transitionDuration: 3,
  audioPass: false,
  beatIntensity: 'normal',
};


export function getTransitionDuration(settings) {
  if (!settings) return 3;
  if (settings.transition === 'off' || settings.transition === 'gapless') return 0;
  if (typeof settings.transitionDuration === 'number') return settings.transitionDuration;
  if (settings.transition === 'crossfade_5s') return 5;
  if (settings.transition === 'auto') return 3;
  return 3;
}

// Create the Web Audio filter chain for Equalizer and Audio Effects
export function createAudioLabGraph(context) {
  if (!context) return null;
  const input = context.createGain();
  const output = context.createGain();

  // Equalizer filters (5 bands)
  const filters = EQ_FREQUENCIES.map(freqSpec => {
    const filter = context.createBiquadFilter();
    filter.type = freqSpec.type;
    filter.frequency.value = freqSpec.freq;
    if (filter.type === 'peaking') filter.Q.value = 1.0;
    filter.gain.value = 0;
    return { ...freqSpec, filter };
  });

  // Connect EQ chain: input -> f0 -> f1 -> f2 -> f3 -> f4
  let prevNode = input;
  for (const f of filters) {
    prevNode.connect(f.filter);
    prevNode = f.filter;
  }

  // Audio Effects: Spatial Surround delay + mid/side widener
  const effectGain = context.createGain();
  const dryGain = context.createGain();
  const wetGain = context.createGain();
  const delayNode = context.createDelay();
  delayNode.delayTime.value = 0.015; // 15ms Haas effect for spatial width

  // Feedback filter for concert hall ambiance
  const feedback = context.createGain();
  feedback.gain.value = 0.25;

  prevNode.connect(dryGain);
  prevNode.connect(delayNode);
  delayNode.connect(feedback);
  feedback.connect(delayNode);
  delayNode.connect(wetGain);

  dryGain.connect(effectGain);
  wetGain.connect(effectGain);
  effectGain.connect(output);

  return {
    input,
    output,
    filters,
    dryGain,
    wetGain,
    delayNode,
    feedback,
  };
}

export function updateAudioLabGraph(graph, settings = DEFAULT_AUDIO_LAB) {
  if (!graph) return;
  const { equalizer, effect } = settings;

  // Apply Equalizer bands
  if (graph.filters) {
    for (const f of graph.filters) {
      const targetGain = equalizer?.enabled ? Number(equalizer.bands?.[f.id] || 0) : 0;
      f.filter.gain.setTargetAtTime(targetGain, 0, 0.05);
    }
  }

  // Apply Audio Effect
  if (graph.dryGain && graph.wetGain && graph.delayNode) {
    if (effect === 'surround') {
      graph.dryGain.gain.setTargetAtTime(0.85, 0, 0.05);
      graph.wetGain.gain.setTargetAtTime(0.45, 0, 0.05);
      graph.delayNode.delayTime.setTargetAtTime(0.018, 0, 0.05);
      graph.feedback.gain.setTargetAtTime(0.15, 0, 0.05);
    } else if (effect === 'concert') {
      graph.dryGain.gain.setTargetAtTime(0.75, 0, 0.05);
      graph.wetGain.gain.setTargetAtTime(0.55, 0, 0.05);
      graph.delayNode.delayTime.setTargetAtTime(0.038, 0, 0.05);
      graph.feedback.gain.setTargetAtTime(0.40, 0, 0.05);
    } else if (effect === 'bass') {
      graph.dryGain.gain.setTargetAtTime(1.0, 0, 0.05);
      graph.wetGain.gain.setTargetAtTime(0.0, 0, 0.05);
      // Extra bass punch
      if (graph.filters?.[0]) {
        const cur = graph.filters[0].filter.gain.value;
        graph.filters[0].filter.gain.setTargetAtTime(cur + 3.5, 0, 0.05);
      }
    } else if (effect === 'vocal') {
      graph.dryGain.gain.setTargetAtTime(1.0, 0, 0.05);
      graph.wetGain.gain.setTargetAtTime(0.0, 0, 0.05);
      if (graph.filters?.[2]) {
        const cur = graph.filters[2].filter.gain.value;
        graph.filters[2].filter.gain.setTargetAtTime(cur + 3.0, 0, 0.05);
      }
    } else {
      // Off: pure dry signal
      graph.dryGain.gain.setTargetAtTime(1.0, 0, 0.05);
      graph.wetGain.gain.setTargetAtTime(0.0, 0, 0.05);
      graph.feedback.gain.setTargetAtTime(0.0, 0, 0.05);
    }
  }
}
