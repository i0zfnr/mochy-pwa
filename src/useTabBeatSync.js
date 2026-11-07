import { useEffect, useRef, useState } from 'react';
import { readState, writeState } from './storage';

// Built-in automatic beat sync with optional direct hardware tab PCM capture.
// Active by default so the ambient atmosphere automatically pulses and reacts to the beat.
export function useTabBeatSync(notify) {
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const [active, setActive] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const available = true;

  useEffect(() => {
    readState('beatSync', true).then(saved => {
      if (typeof saved === 'boolean') setActive(saved);
    }).catch(() => {});
  }, []);

  function stop() {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    analyserRef.current?.source?.disconnect();
    analyserRef.current?.context?.close().catch(() => {});
    analyserRef.current = null;
    setActive(false);
    writeState('beatSync', false).catch(() => {});
  }

  async function toggle() {
    if (active) {
      stop();
      return;
    }
    setActive(true);
    writeState('beatSync', true).catch(() => {});
  }

  async function connectTabAudio() {
    if (typeof navigator.mediaDevices?.getDisplayMedia !== 'function' || connecting) return;
    setConnecting(true);
    let stream;
    let context;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: { suppressLocalAudioPlayback: false },
        preferCurrentTab: true,
        selfBrowserSurface: 'include'
      });
      const audio = stream.getAudioTracks()[0];
      if (!audio) {
        stream.getTracks().forEach(track => track.stop());
        notify?.('Choose this browser tab and turn on “Share tab audio” for hardware-level beat sync.');
        return;
      }
      context = new (window.AudioContext || window.webkitAudioContext)();
      await context.resume();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.75;
      source.connect(analyser);
      analyserRef.current = { context, source, analyser };
      streamRef.current = stream;
      stream.getTracks().forEach(track => track.addEventListener('ended', stop, { once: true }));
      setActive(true);
      writeState('beatSync', true).catch(() => {});
    } catch (error) {
      stream?.getTracks().forEach(track => track.stop());
      context?.close().catch(() => {});
      if (!['NotAllowedError', 'AbortError'].includes(error.name)) {
        notify?.('Hardware tab audio unavailable. Automatic beat sync is active.');
      }
    } finally {
      setConnecting(false);
    }
  }

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    analyserRef.current?.context?.close().catch(() => {});
  }, []);

  return { analyserRef, active, setActive, connecting, available, toggle, stop, connectTabAudio };
}
