import { useEffect, useRef, useState } from 'react';

// Streaming audio analysis requires explicit tab-audio sharing. No capture starts automatically.
export function useTabBeatSync(notify) {
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const [active, setActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const available = typeof navigator.mediaDevices?.getDisplayMedia === 'function';

  function stop() {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    analyserRef.current?.source?.disconnect();
    analyserRef.current?.context?.close().catch(() => {});
    analyserRef.current = null;
    setActive(false);
  }

  async function toggle() { if (active) stop(); else await connectTabAudio(); }

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
    } catch (error) {
      stream?.getTracks().forEach(track => track.stop());
      context?.close().catch(() => {});
      if (!['NotAllowedError', 'AbortError'].includes(error.name)) {
        notify?.('Tab audio is unavailable. The background will continue its ambient movement.');
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
