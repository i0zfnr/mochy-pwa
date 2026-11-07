import { memo, useEffect, useRef, useState } from 'react';
import { START_TONES, readArtworkTones } from './ambient-palette';
import { createAmbientRenderer } from './ambient-renderer';
import './playback-atmosphere.css';

export const AlbumAtmosphere = memo(function AlbumAtmosphere({ artwork = '', compact = false }) {
  const [tones, setTones] = useState(START_TONES);
  const element = useRef(null), canvas = useRef(null), redraw = useRef(null);
  const shown = useRef(START_TONES);
  const fade = useRef({ from: START_TONES, to: START_TONES, start: 0 });
  useEffect(() => {
    let cancelled = false;
    readArtworkTones(artwork).then(next => { if (!cancelled) setTones(next); });
    return () => { cancelled = true; };
  }, [artwork]);
  useEffect(() => {
    fade.current = { from: shown.current, to: tones, start: performance.now() };
    redraw.current?.();
  }, [tones]);
  useEffect(() => {
    const holder = element.current, target = canvas.current;
    const app = holder.closest('.app');
    const renderer = createAmbientRenderer(target);
    if (!renderer) return;
    holder.dataset.renderer = 'shader';
    let frame = 0, previous = performance.now(), lastDraw = 0, clock = 0;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    function draw(now) {
      frame = 0;
      const active = app.dataset.motion === 'playing' && !document.hidden && !reduced.matches;
      const progress = reduced.matches ? 1 : Math.min(1, Math.max(0, (now - fade.current.start) / 1400));
      if (active) clock = (clock + Math.min(.1, (now - previous) / 1000)) % 100;
      previous = now;
      if (now - lastDraw >= 33 || !active) {
        lastDraw = now;
        const eased = progress * progress * (3 - 2 * progress);
        shown.current = fade.current.from.map((color, i) => color.map((value, channel) => value + (fade.current.to[i][channel] - value) * eased));
        const energy = active ? Number(app.style.getPropertyValue('--beat-energy')) || 0 : 0;
        renderer.draw(clock, shown.current, energy);
      }
      if (active || progress < 1) frame = requestAnimationFrame(draw);
    }
    function wake() { if (!frame) { previous = performance.now(); frame = requestAnimationFrame(draw); } }
    function resize() {
      // Same quarter-resolution strategy as the Android implementation.
      const box = holder.getBoundingClientRect();
      target.width = Math.max(1, Math.ceil(box.width / 4));
      target.height = Math.max(1, Math.ceil(box.height / 4));
      wake();
    }
    const observer = new MutationObserver(wake); observer.observe(app, { attributes: true, attributeFilter: ['data-motion'] });
    const sizes = new ResizeObserver(resize); sizes.observe(holder);
    document.addEventListener('visibilitychange', wake); reduced.addEventListener('change', wake);
    const lost = event => { event.preventDefault(); cancelAnimationFrame(frame); holder.dataset.renderer = 'fallback'; };
    target.addEventListener('webglcontextlost', lost);
    redraw.current = wake; resize();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); sizes.disconnect(); document.removeEventListener('visibilitychange', wake); reduced.removeEventListener('change', wake); target.removeEventListener('webglcontextlost', lost); renderer.dispose(); redraw.current = null; };
  }, []);
  const colors = Object.fromEntries(tones.map((rgb, i) => [`--album-tone-${i}`, `rgb(${rgb.map(channel => Math.round(channel * 255)).join(' ')})`]));
  return <div ref={element} className={`album-atmosphere ${compact ? 'is-compact' : ''}`} style={colors} aria-hidden="true">
    {artwork ? (
      <div className="album-artwork-field">
        <img src={artwork} alt="" className="album-artwork-blur" />
        <img src={artwork} alt="" className="album-artwork-drift" />
      </div>
    ) : null}
    <div className="album-color-fallback"/>
    <canvas ref={canvas}/>
    <div className="album-accent-aurora">
      <div className="aurora-orb orb-a"/>
      <div className="aurora-orb orb-b"/>
    </div>
    <div className="album-atmosphere-shade"/>
  </div>;
});

// Local files or explicitly shared tab audio can drive the light field.
// Without audio access, the album colors drift without an invented beat signal.
export function usePlaybackMotion(rootRef, analyserRef, playing, analysable) {
  const lastLevels = useRef(new Float32Array(20));
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let lastTime = 0;
    let data;
    function clear() {
      root.style.setProperty('--beat-energy', '0');
      for (let i = 0; i < 20; i++) root.style.setProperty(`--spectrum-${i}`, '0');
      lastLevels.current.fill(0);
    }
    function sample(now) {
      frame = requestAnimationFrame(sample);
      if (now - lastTime < 32) return;
      lastTime = now;
      const analyser = analyserRef.current?.analyser;
      if (analyser) {
        if (!data || data.length !== analyser.frequencyBinCount) data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        root.dataset.audioMotion = 'audio';
        const binHz = analyser.context.sampleRate / analyser.fftSize;
        let bass = 0;
        for (let i = 0; i < 20; i++) {
          const low = Math.max(1, Math.floor(55 * (140 ** (i / 20)) / binHz));
          const high = Math.min(data.length - 1, Math.max(low, Math.ceil(55 * (140 ** ((i + 1) / 20)) / binHz)));
          let power = 0;
          for (let bin = low; bin <= high; bin++) power = Math.max(power, data[bin]);
          const value = Math.max(0, Math.min(1, (power - 28) / 205));
          lastLevels.current[i] = Math.max(value, lastLevels.current[i] * 0.82);
          root.style.setProperty(`--spectrum-${i}`, lastLevels.current[i].toFixed(3));
          if (i < 6) bass += lastLevels.current[i];
        }
        root.style.setProperty('--beat-energy', (bass / 6).toFixed(3));
      } else {
        root.dataset.audioMotion = 'audio';
        const nowSec = now / 1000;
        const beatPeriod = 0.5085;
        const measureTime = nowSec % (beatPeriod * 4);
        const beatNum = Math.floor(measureTime / beatPeriod);
        const beatPhase = (measureTime % beatPeriod) / beatPeriod;

        // Soft, organic, undulating beat pulse (musical swell, never aggressive)
        const isAccent = beatNum === 0 || beatNum === 2;
        const kickWave = Math.sin(beatPhase * Math.PI) * (isAccent ? 0.38 : 0.25);
        const kickDecay = Math.exp(-beatPhase * 4.2) * (isAccent ? 0.28 : 0.18);
        const breathing = Math.sin(nowSec * 1.6) * 0.06 + 0.10;
        const pulse = Math.min(0.68, Math.max(0.08, (kickWave + kickDecay) * 0.65 + breathing));

        root.style.setProperty('--beat-energy', pulse.toFixed(3));
        for (let i = 0; i < 20; i++) {
          const bandDecay = Math.exp(-i / 5.2);
          const bandPhase = Math.sin(nowSec * (2.6 + i * 0.32) + i * 0.45) * 0.14;
          const bandLevel = Math.min(1, Math.max(0, pulse * bandDecay + bandPhase + 0.08));
          lastLevels.current[i] = Math.max(bandLevel, lastLevels.current[i] * 0.82);
          root.style.setProperty(`--spectrum-${i}`, lastLevels.current[i].toFixed(3));
        }
      }
    }
    function update() {
      cancelAnimationFrame(frame);
      const active = playing && !document.hidden && !reduced.matches;
      root.dataset.motion = active ? 'playing' : 'paused';
      root.dataset.audioMotion = active && analysable ? 'audio' : active ? 'activity' : 'idle';
      if (active && analysable) frame = requestAnimationFrame(sample);
      else clear();
    }
    update();
    document.addEventListener('visibilitychange', update);
    reduced.addEventListener('change', update);
    return () => { cancelAnimationFrame(frame); document.removeEventListener('visibilitychange', update); reduced.removeEventListener('change', update); };
  }, [rootRef, analyserRef, playing, analysable]);
}
