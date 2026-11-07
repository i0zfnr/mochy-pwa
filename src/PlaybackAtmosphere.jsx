import { memo, useEffect, useRef, useState } from 'react';
import { START_TONES, readArtworkTones } from './ambient-palette';
import { createAmbientRenderer } from './ambient-renderer';
import './playback-atmosphere.css';

let currentBeatEnergy = 0;

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
    if (compact) return; // Skip heavy WebGL canvas loop for the small sidebar preview
    const holder = element.current, target = canvas.current;
    if (!target) return;
    const app = holder.closest('.app');
    const renderer = createAmbientRenderer(target);
    if (!renderer) return;
    holder.dataset.renderer = 'shader';
    let frame = 0, previous = performance.now(), lastDraw = 0, clock = 0;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');

    function draw(now) {
      frame = 0;
      const active = app?.dataset.motion === 'playing' && !document.hidden && !reduced.matches;
      const progress = reduced.matches ? 1 : Math.min(1, Math.max(0, (now - fade.current.start) / 1400));
      if (active) clock = (clock + Math.min(.1, (now - previous) / 1000)) % 100;
      previous = now;
      if (now - lastDraw >= 33 || !active) {
        lastDraw = now;
        const eased = progress * progress * (3 - 2 * progress);
        shown.current = fade.current.from.map((color, i) => color.map((value, channel) => value + (fade.current.to[i][channel] - value) * eased));
        const energy = active ? currentBeatEnergy : 0;
        renderer.draw(clock, shown.current, energy);
        // Only set --beat-energy on this atmosphere container, never on the app root
        holder.style.setProperty('--beat-energy', energy.toFixed(2));
      }
      if (active || progress < 1) frame = requestAnimationFrame(draw);
    }
    function wake() { if (!frame) { previous = performance.now(); frame = requestAnimationFrame(draw); } }
    function resize() {
      const box = holder.getBoundingClientRect();
      target.width = Math.max(1, Math.ceil(box.width / 4));
      target.height = Math.max(1, Math.ceil(box.height / 4));
      wake();
    }
    const observer = new MutationObserver(wake);
    if (app) observer.observe(app, { attributes: true, attributeFilter: ['data-motion'] });
    const sizes = new ResizeObserver(resize);
    sizes.observe(holder);
    document.addEventListener('visibilitychange', wake);
    reduced.addEventListener('change', wake);
    const lost = event => { event.preventDefault(); cancelAnimationFrame(frame); holder.dataset.renderer = 'fallback'; };
    target.addEventListener('webglcontextlost', lost);
    redraw.current = wake;
    resize();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      sizes.disconnect();
      document.removeEventListener('visibilitychange', wake);
      reduced.removeEventListener('change', wake);
      target.removeEventListener('webglcontextlost', lost);
      renderer.dispose();
      redraw.current = null;
    };
  }, [compact]);

  const colors = Object.fromEntries(tones.map((rgb, i) => [`--album-tone-${i}`, `rgb(${rgb.map(channel => Math.round(channel * 255)).join(' ')})`]));

  return <div ref={element} className={`album-atmosphere ${compact ? 'is-compact' : ''}`} style={colors} aria-hidden="true">
    {artwork ? (
      <div className="album-artwork-field">
        <img src={artwork} alt="" className="album-artwork-blur" />
      </div>
    ) : null}
    <div className="album-color-fallback"/>
    {!compact && <canvas ref={canvas}/>}
    {!compact && (
      <div className="album-accent-aurora">
        <div className="aurora-orb orb-a"/>
        <div className="aurora-orb orb-b"/>
      </div>
    )}
    <div className="album-atmosphere-shade"/>
  </div>;
});

// Local files or explicitly shared tab audio can drive the light field.
// Highly optimized for maximum battery and 60fps iPad / mobile performance.
export function usePlaybackMotion(rootRef, analyserRef, playing, analysable, beatIntensity = 'normal') {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let lastTime = 0;
    let data;

    const multipliers = {
      off: 0,
      low: 0.55,
      normal: 1.0,
      aggressive: 1.85,
    };
    const mult = multipliers[beatIntensity] ?? 1.0;

    function clear() {
      currentBeatEnergy = 0;
    }

    function sample(now) {
      frame = requestAnimationFrame(sample);
      if (now - lastTime < 33) return; // ~30fps for smooth motion & low battery consumption
      lastTime = now;
      const analyser = analyserRef.current?.analyser;
      let energy = 0;
      if (analyser && analysable) {
        if (!data || data.length !== analyser.frequencyBinCount) data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        root.dataset.audioMotion = 'audio';
        let bass = 0;
        for (let i = 0; i < 4; i++) bass += (data[i] || 0) / 255;
        energy = Math.min(1.0, Math.max(0.04, (bass / 4) * 1.25 * mult));
      } else {
        root.dataset.audioMotion = 'audio';
        const nowSec = now / 1000;
        const beatPeriod = 0.5085;
        const measureTime = nowSec % (beatPeriod * 4);
        const beatNum = Math.floor(measureTime / beatPeriod);
        const beatPhase = (measureTime % beatPeriod) / beatPeriod;

        const isAccent = beatNum === 0 || beatNum === 2;
        const kickWave = Math.sin(beatPhase * Math.PI) * (isAccent ? 0.65 : 0.40);
        const kickDecay = Math.exp(-beatPhase * 3.8) * (isAccent ? 0.45 : 0.25);
        const breathing = Math.sin(nowSec * 1.5) * 0.10 + 0.12;
        const raw = (kickWave + kickDecay) * 0.65 + breathing;
        energy = Math.min(1.0, Math.max(0.04, raw * mult));
      }

      currentBeatEnergy = energy;
    }

    function update() {
      cancelAnimationFrame(frame);
      const active = playing && !document.hidden && !reduced.matches && mult > 0;
      root.dataset.motion = active ? 'playing' : 'paused';
      root.dataset.audioMotion = active ? 'audio' : 'idle';
      if (active) frame = requestAnimationFrame(sample);
      else clear();
    }

    update();
    document.addEventListener('visibilitychange', update);
    reduced.addEventListener('change', update);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', update);
      reduced.removeEventListener('change', update);
    };
  }, [rootRef, analyserRef, playing, analysable, beatIntensity]);
}
