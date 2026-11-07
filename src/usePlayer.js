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
  const youtube = useRef(null);
  const analyserRef = useRef(null);
  const localUrl = useRef(null);
  const generation = useRef(0);
  const currentRef = useRef(null);
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

  async function start(track, tracks = queue, at = tracks.findIndex(t => t.id === track.id)) {
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
                onStateChange: e => { if (currentRef.current?.source !== 'youtube') return; setPlaying(e.data === 1); if (e.data === 0) advanceRef.current?.(1, true); },
                onError: () => { setPlaying(false); notify('This recording cannot play here. Try another result or open it on YouTube.'); },
              },
            });
          });
        }
        if (token !== generation.current) return;
        youtube.current.setVolume(volume * 100);
        youtube.current.loadVideoById(playableTrack.id);
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
    if (current.source === 'local') { if (audio.current.paused) audio.current.play().catch(e => notify(e.message)); else audio.current.pause(); }
    else if (playing) youtube.current?.pauseVideo(); else youtube.current?.playVideo();
  }
  function seek(value) { if (!current) return; if (current.source === 'local') audio.current.currentTime = value; else youtube.current?.seekTo(value, true); setPosition(value); }
  useEffect(() => {
    const el = audio.current;
    const update = () => { setPosition(el.currentTime || 0); setDuration(Number.isFinite(el.duration) ? el.duration : 0); };
    const play = () => setPlaying(true), pause = () => setPlaying(false), ended = () => advanceRef.current?.(1, true);
    const error = () => { setPlaying(false); notify('Your browser could not decode this audio file. Try MP3, M4A, WAV, or OGG.'); };
    el.addEventListener('timeupdate', update); el.addEventListener('loadedmetadata', update); el.addEventListener('play', play); el.addEventListener('pause', pause); el.addEventListener('ended', ended); el.addEventListener('error', error);
    const timer = setInterval(() => { if (currentRef.current?.source === 'youtube' && youtube.current?.getCurrentTime) { const t = youtube.current.getCurrentTime(); if (typeof t === 'number' && !Number.isNaN(t)) { setPosition(t); const d = youtube.current.getDuration?.(); if (d && !Number.isNaN(d)) setDuration(d); } } else if (currentRef.current?.source === 'local' && el && !el.paused) { setPosition(el.currentTime || 0); if (Number.isFinite(el.duration)) setDuration(el.duration); } }, 50);
    return () => { clearInterval(timer); el.pause(); for (const [event, handler] of [['timeupdate', update], ['loadedmetadata', update], ['play', play], ['pause', pause], ['ended', ended], ['error', error]]) el.removeEventListener(event, handler); };
  }, []);
  useEffect(() => { audio.current.volume = volume; youtube.current?.setVolume?.(volume * 100); }, [volume]);
  useEffect(() => {
    if (!current || !('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: current.title, artist: current.artist, album: current.album, artwork: current.cover ? [{ src: current.cover }] : [] });
    const actions = { play: () => { if (current.source === 'local') audio.current.play().catch(e => notify(e.message)); else youtube.current?.playVideo(); }, pause: () => { audio.current.pause(); youtube.current?.pauseVideo?.(); }, previoustrack: () => advanceRef.current(-1), nexttrack: () => advanceRef.current(1), seekto: e => seek(e.seekTime) };
    for (const [name, handler] of Object.entries(actions)) try { navigator.mediaSession.setActionHandler(name, handler); } catch {}
  }, [current]);
  function removeQueueItem(at) { if (at === index) return; setQueue(old => old.filter((_, i) => i !== at)); if (at < index) setIndex(old => old - 1); }
  return { current, queue, index, playing, position, duration, volume, setVolume, shuffle, setShuffle, repeat, setRepeat, start, advance, toggle, seek, setQueue, removeQueueItem, analyserRef };
}
