import { useEffect, useRef, useState } from 'react';
import { getFile } from './storage';
import { nextIndex } from './music';
let youtubeReady;
function loadYoutube() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!youtubeReady) youtubeReady = new Promise((resolve, reject) => {
    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
    const script = document.createElement('script'); script.src = 'https://www.youtube.com/iframe_api'; script.onerror = () => { youtubeReady = null; reject(new Error('YouTube could not be loaded. Check your connection.')); }; document.head.append(script);
  });
  return youtubeReady;
}
export function usePlayer({ notify, onPlayed }) {
  const audio = useRef(new Audio());
  const silentAudioRef = useRef(null);
  const youtube = useRef(null);
  const analyserRef = useRef(null);
  const localUrl = useRef(null);
  const generation = useRef(0);
  const currentRef = useRef(null);
  const isUserExplicitlyPaused = useRef(false);
  const backgroundRetryTimer = useRef(null);
  const [current, setCurrent] = useState(null);
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('off');
  const advanceRef = useRef(null);

  function handleYoutubeStateChange(e) {
    if (currentRef.current?.source !== 'youtube') return;
    if (e.data === 1) {
      isUserExplicitlyPaused.current = false;
      setPlaying(true);
      silentAudioRef.current?.play().catch(() => {});
    } else if (e.data === 2) {
      if (isUserExplicitlyPaused.current) {
        setPlaying(false);
        silentAudioRef.current?.pause();
      } else {
        // Tab hidden, game switched, or background WebKit auto-pause. Override and keep audio thread alive!
        silentAudioRef.current?.play().catch(() => {});
        youtube.current?.playVideo?.();
        clearTimeout(backgroundRetryTimer.current);
        backgroundRetryTimer.current = setTimeout(() => {
          if (!isUserExplicitlyPaused.current && currentRef.current?.source === 'youtube') {
            youtube.current?.playVideo?.();
          }
        }, 300);
      }
    } else if (e.data === 0) {
      setPlaying(false);
      silentAudioRef.current?.pause();
      advanceRef.current?.(1, true);
    }
  }

  useEffect(() => {
    if ('audioSession' in navigator) {
      try {
        navigator.audioSession.type = 'playback';
        const onSessionStateChange = () => {
          if (navigator.audioSession.state === 'active' && !isUserExplicitlyPaused.current && currentRef.current) {
            if (currentRef.current.source === 'local') audio.current.play().catch(() => {});
            else {
              silentAudioRef.current?.play().catch(() => {});
              youtube.current?.playVideo?.();
            }
          }
        };
        navigator.audioSession.addEventListener('statechange', onSessionStateChange);
      } catch {}
    }

    // High quality looping silent audio shield to hold iOS/iPadOS audio session during game & background playback
    const silentAudio = new Audio('/silence.wav');
    silentAudio.loop = true;
    silentAudio.volume = 0.01;
    silentAudio.preload = 'auto';
    silentAudioRef.current = silentAudio;

    // Warm-up YouTube iframe player ahead of time so first tap plays with 0 delay
    loadYoutube().then(YT => {
      if (!youtube.current && document.getElementById('youtube-player')) {
        youtube.current = new YT.Player('youtube-player', {
          width: '100%', height: '100%', playerVars: { playsinline: 1, origin: window.location.origin },
          events: {
            onStateChange: handleYoutubeStateChange,
            onError: () => { setPlaying(false); silentAudioRef.current?.pause(); notify('This recording cannot play here. Try another result or open it on YouTube.'); },
          },
        });
      }
    }).catch(() => {});

    // Prime/unlock WebKit media engine on the very first touch gesture anywhere
    const unlock = () => {
      if (silentAudioRef.current) {
        silentAudioRef.current.play().then(() => {
          if (!currentRef.current || isUserExplicitlyPaused.current) silentAudioRef.current.pause();
        }).catch(() => {});
      }
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('touchend', unlock);
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('click', unlock);
    };
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('touchend', unlock, { passive: true });
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('click', unlock, { passive: true });

    // Keep audio session locked across visibility and focus changes (e.g. switching to game)
    const handleVisibility = () => {
      if (!isUserExplicitlyPaused.current && currentRef.current) {
        silentAudioRef.current?.play().catch(() => {});
        if (currentRef.current.source === 'youtube' && youtube.current?.playVideo) {
          youtube.current.playVideo();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', handleVisibility);
    window.addEventListener('pageshow', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    return () => {
      clearTimeout(backgroundRetryTimer.current);
      silentAudio.pause();
      silentAudio.src = '';
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('touchend', unlock);
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('click', unlock);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', handleVisibility);
      window.removeEventListener('pageshow', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, []);

  async function start(track, tracks = queue, at = tracks.findIndex(t => t.id === track.id)) {
    isUserExplicitlyPaused.current = false;
    clearTimeout(backgroundRetryTimer.current);
    // Synchronously prime iOS user gesture activation immediately on user tap
    try { silentAudioRef.current?.play().catch(() => {}); } catch {}
    const token = ++generation.current;
    audio.current.pause(); youtube.current?.stopVideo?.();
    if (localUrl.current) { URL.revokeObjectURL(localUrl.current); localUrl.current = null; }
    currentRef.current = track; setCurrent(track); setPosition(0); setDuration(track.duration || 0); setPlaying(false);
    setQueue(tracks.length ? tracks : [track]); setIndex(Math.max(0, at));
    try {
      if (track.source === 'local') {
        const file = await getFile(track.id);
        if (token !== generation.current) return;
        if (!file) throw new Error('This file is missing. Import it again.');
        localUrl.current = URL.createObjectURL(file); audio.current.src = localUrl.current;
        // Local media can be analysed without copying or uploading the audio.
        try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext && !analyserRef.current) {
            const context = new AudioContext();
            const analyser = context.createAnalyser();
            analyser.fftSize = 1024;
            analyser.smoothingTimeConstant = 0.75;
            const source = context.createMediaElementSource(audio.current);
            source.connect(analyser);
            analyser.connect(context.destination);
            analyserRef.current = { context, analyser, source };
          }
          if (analyserRef.current?.context.state === 'suspended') await analyserRef.current.context.resume();
        } catch { /* Audio playback still works in browsers without Web Audio. */ }
        if (token !== generation.current) return;
        await audio.current.play();
        if (token === generation.current) onPlayed(track);
      } else {
        let playableTrack = track;
        if (track.source === 'spotify' || track.id.startsWith('sp_') || !/^[\w-]{11}$/.test(track.id)) {
          try {
            const query = `${track.title} ${track.artist}`;
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            if (res.ok) {
              const data = await res.json();
              if (data?.tracks?.[0]?.id) {
                playableTrack = {
                  ...track,
                  id: data.tracks[0].id,
                  source: 'youtube',
                  cover: track.cover || data.tracks[0].cover
                };
                setCurrent(playableTrack);
                currentRef.current = playableTrack;
              }
            }
          } catch {}
        }
        const YT = await loadYoutube();
        if (token !== generation.current) return;
        if (!youtube.current) {
          await new Promise(resolve => {
            youtube.current = new YT.Player('youtube-player', {
              width: '100%', height: '100%', playerVars: { playsinline: 1, origin: window.location.origin },
              events: {
                onReady: resolve,
                onStateChange: handleYoutubeStateChange,
                onError: () => { setPlaying(false); silentAudioRef.current?.pause(); notify('This recording cannot play here. Try another result or open it on YouTube.'); },
              },
            });
          });
        }
        if (token !== generation.current) return;
        youtube.current.setVolume(volume * 100);
        youtube.current.loadVideoById(playableTrack.id);
        youtube.current.playVideo?.();
        if (token === generation.current) onPlayed(playableTrack);
        return;
      }
    } catch (error) { if (token === generation.current) { setPlaying(false); notify(error.message); } }
  }
  function advance(direction = 1, ended = false) {
    const next = nextIndex(index, queue.length, shuffle, repeat, direction, ended);
    if (next < 0) { setPlaying(false); return; }
    if (ended && repeat === 'one') { seek(0); if (current.source === 'local') audio.current.play().catch(e => notify(e.message)); else youtube.current?.playVideo(); return; }
    start(queue[next], queue, next);
  }
  advanceRef.current = advance;
  function toggle() {
    if (!current) return;
    if (current.source === 'local') {
      if (audio.current.paused) {
        isUserExplicitlyPaused.current = false;
        audio.current.play().catch(e => notify(e.message));
      } else {
        isUserExplicitlyPaused.current = true;
        audio.current.pause();
      }
    } else if (playing) {
      isUserExplicitlyPaused.current = true;
      silentAudioRef.current?.pause();
      youtube.current?.pauseVideo();
    } else {
      isUserExplicitlyPaused.current = false;
      silentAudioRef.current?.play().catch(() => {});
      youtube.current?.playVideo();
    }
  }
  function seek(value) { if (!current) return; if (current.source === 'local') audio.current.currentTime = value; else youtube.current?.seekTo(value, true); setPosition(value); }
  useEffect(() => {
    const el = audio.current;
    const update = () => { setPosition(el.currentTime || 0); setDuration(Number.isFinite(el.duration) ? el.duration : 0); };
    const play = () => setPlaying(true), pause = () => setPlaying(false), ended = () => advanceRef.current?.(1, true);
    const error = () => { setPlaying(false); notify('Your browser could not decode this audio file. Try MP3, M4A, WAV, or OGG.'); };
    el.addEventListener('timeupdate', update); el.addEventListener('loadedmetadata', update); el.addEventListener('play', play); el.addEventListener('pause', pause); el.addEventListener('ended', ended); el.addEventListener('error', error);
    let lastPos = -1;
    const timer = setInterval(() => {
      if (currentRef.current?.source === 'youtube' && youtube.current?.getCurrentTime) {
        const t = youtube.current.getCurrentTime();
        if (typeof t === 'number' && !Number.isNaN(t)) {
          if (Math.abs(t - lastPos) >= 0.1) {
            lastPos = t;
            setPosition(t);
          }
          const d = youtube.current.getDuration?.();
          if (d && !Number.isNaN(d)) setDuration(d);
        }
      } else if (currentRef.current?.source === 'local' && el && !el.paused) {
        if (Math.abs(el.currentTime - lastPos) >= 0.1) {
          lastPos = el.currentTime;
          setPosition(el.currentTime || 0);
        }
        if (Number.isFinite(el.duration)) setDuration(el.duration);
      }
    }, 150);
    return () => { clearInterval(timer); el.pause(); for (const [event, handler] of [['timeupdate', update], ['loadedmetadata', update], ['play', play], ['pause', pause], ['ended', ended], ['error', error]]) el.removeEventListener(event, handler); };
  }, []);
  useEffect(() => { audio.current.volume = volume; youtube.current?.setVolume?.(volume * 100); }, [volume]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
    }
  }, [playing]);

  useEffect(() => {
    if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
    if (typeof duration === 'number' && duration > 0 && typeof position === 'number' && position >= 0) {
      try {
        navigator.mediaSession.setPositionState({
          duration: Math.max(0, duration),
          playbackRate: playing ? 1 : 0,
          position: Math.min(Math.max(0, position), duration),
        });
      } catch {}
    }
  }, [position, duration, playing]);

  useEffect(() => {
    if (!current || !('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.title,
      artist: current.artist,
      album: current.album || 'Xenn',
      artwork: current.cover ? [{ src: current.cover, sizes: '512x512', type: 'image/png' }] : []
    });
    const actions = {
      play: () => {
        isUserExplicitlyPaused.current = false;
        if (currentRef.current?.source === 'local') audio.current.play().catch(e => notify(e.message));
        else {
          silentAudioRef.current?.play().catch(() => {});
          youtube.current?.playVideo();
        }
      },
      pause: () => {
        isUserExplicitlyPaused.current = true;
        audio.current.pause();
        silentAudioRef.current?.pause();
        youtube.current?.pauseVideo?.();
      },
      previoustrack: () => advanceRef.current(-1),
      nexttrack: () => advanceRef.current(1),
      seekto: e => seek(e.seekTime)
    };
    for (const [name, handler] of Object.entries(actions)) try { navigator.mediaSession.setActionHandler(name, handler); } catch {}
  }, [current]);
  function removeQueueItem(at) { if (at === index) return; setQueue(old => old.filter((_, i) => i !== at)); if (at < index) setIndex(old => old - 1); }
  return { current, queue, index, playing, position, duration, volume, setVolume, shuffle, setShuffle, repeat, setRepeat, start, advance, toggle, seek, setQueue, removeQueueItem, analyserRef };
}
