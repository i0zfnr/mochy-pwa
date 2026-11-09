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
    let frame = 0, previous = performance.now(), lastDraw = 0, clock = 0, glowEnergy = 0;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');

    function draw(now) {
      frame = 0;
      const active = app?.dataset.motion === 'playing' && !document.hidden && !reduced.matches;
      const progress = reduced.matches ? 1 : Math.min(1, Math.max(0, (now - fade.current.start) / 1400));
      if (active) clock += Math.min(.1, (now - previous) / 1000);
      previous = now;
      if (now - lastDraw >= 33 || !active) {
        lastDraw = now;
        const eased = progress * progress * (3 - 2 * progress);
        shown.current = fade.current.from.map((color, i) => color.map((value, channel) => value + (fade.current.to[i][channel] - value) * eased));
        const targetEnergy = active ? currentBeatEnergy : 0;
        glowEnergy += (targetEnergy - glowEnergy) * (targetEnergy > glowEnergy ? .55 : .14);
        const energy = active ? glowEnergy : 0;
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
    <div className="album-color-fallback"/>
    {!compact && <canvas ref={canvas}/>}
    <div className="album-atmosphere-shade"/>
  </div>;
});

// Local files or explicitly shared tab audio can drive the light field.
// Strictly tracks bass frequencies (20-130Hz) so beat motion follows the bass drum/808.
export function usePlaybackMotion(rootRef, analyserRef, playing, analysable, beatIntensity = 'normal') {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let lastTime = 0;
    let data;
    let bassBaseline = 0.20;
    let bassPeak = 0;

    const multipliers = {
      off: 0,
      low: 0.55,
      normal: 1.0,
      aggressive: 1.85,
    };
    const mult = multipliers[beatIntensity] ?? 1.0;

    function clear() {
      currentBeatEnergy = 0;
      bassPeak = 0;
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

        // STRICTLY isolate bass frequencies: 20Hz - 130Hz (FFT bins 0, 1, 2)
        // Bin 0: sub-bass (0-43Hz), Bin 1: kick fundamental (43-86Hz), Bin 2: kick punch (86-129Hz)
        const subBass = (data[0] || 0) / 255;
        const kickFund = (data[1] || 0) / 255;
        const kickPunch = (data[2] || 0) / 255;
        const currentBass = subBass * 0.35 + kickFund * 0.45 + kickPunch * 0.20;

        // Dynamic bass baseline tracking (adapts to song mastering level)
        bassBaseline = bassBaseline * 0.92 + currentBass * 0.08;

        // Kick / 808 transient punch: only triggers when bass spikes above recent baseline
        const bassDelta = Math.max(0, currentBass - bassBaseline * 1.06);
        if (bassDelta > 0.04) {
          bassPeak = Math.max(bassPeak, Math.min(1.0, bassDelta * 3.4));
        }
        // Natural bass drum decay curve (~140ms half-life)
        bassPeak *= 0.88;

        const rawEnergy = bassPeak * 0.75 + currentBass * 0.25;
        energy = Math.min(1.0, Math.max(0.04, rawEnergy * mult));
      } else {
        root.dataset.audioMotion = 'ambient';
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
