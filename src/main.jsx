
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('App render crash caught by ErrorBoundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'grid', placeItems: 'center', height: '100dvh', background: '#0b0b0b', color: '#eee', padding: 24, textAlign: 'center', fontFamily: '-apple-system, sans-serif' }}>
          <div style={{ maxWidth: 480, background: '#1c1917', border: '1px solid #382a2e', borderRadius: 18, padding: 32 }}>
            <h1 style={{ fontSize: 24, marginBottom: 12 }}>Something unexpected happened</h1>
            <p style={{ color: '#aaa', fontSize: 13, marginBottom: 20 }}>{this.state.error?.message || 'An error occurred during display.'}</p>
            <button
              onClick={() => window.location.reload()}
              style={{ background: '#007AFF', color: '#fff', border: 0, padding: '12px 24px', borderRadius: 20, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
            >
              Reload Xenn
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

import React, { useEffect, useMemo, useRef, useState, useCallback, memo } from 'react';
import { createRoot } from 'react-dom/client';
import { Home, Search, Library, Settings, Heart, Plus, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, ListMusic, Mic2, Volume2, ChevronDown, ChevronRight, ArrowUpRight, Upload, Music2, X, Download, Check, MoreHorizontal, Clock3, Disc3, Headphones, WifiOff, Trash2, Maximize2, Minimize2, Link2, SlidersHorizontal } from 'lucide-react';
import { getLibrary, saveTrack, readState, writeState, importAudio, removeTrack } from './storage';
import { findMusic, time, parseLrc } from './music';
import { usePlayer } from './usePlayer';
import './style.css';
import './apple-music.css';
import { AlbumAtmosphere, usePlaybackMotion } from './PlaybackAtmosphere';
import { highResolutionArtwork } from './artwork';
import { useArtwork } from './useArtwork';
import { useTabBeatSync } from './useTabBeatSync';
import { AudioLab } from './AudioLab';
import { DEFAULT_AUDIO_LAB } from './audio-lab';

if (typeof window !== 'undefined') {
  const isTouch = 'ontouchstart' in window || (navigator.maxTouchPoints > 0);
  if (isTouch) {
    document.documentElement.classList.add('is-touch');
  }
}

function IconButton({ icon: Icon, label, onClick, active, className = '', ...props }) { return <button type="button" className={`icon-button ${active ? 'active' : ''} ${className}`} aria-label={label} title={label} onClick={onClick} {...props}><Icon size={20}/></button>; }
const Cover = memo(function Cover({ track, className = '' }) {
  const original = track?.cover || '';
  const target = useMemo(() => highResolutionArtwork(original), [original]);
  const [failed, setFailed] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    setFailed(false);
    setFallback(false);
  }, [original]);

  const src = fallback ? original : target;

  if (failed || !src) {
    return (
      <div className={`cover placeholder ${className}`}>
        <Music2/>
      </div>
    );
  }

  return (
    <img
      className={`cover ${className}`}
      src={src}
      alt=""
      onError={() => {
        if (!fallback && target !== original) {
          setFallback(true);
        } else {
          setFailed(true);
        }
      }}
    />
  );
});

const TrackRow = memo(function TrackRow({ track, list, number, isCurrent, isPlaying, isLiked, onPlay, onLike, onMenu }) {
  return (
    <div
      className={`track-row ${isCurrent ? 'is-playing' : ''}`}
      onClick={() => onPlay(track, list)}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPlay(track, list);
        }
      }}
    >
      <div className="track-main" aria-label={`Play ${track.title}`}>
        {number !== undefined && (
          <span className="track-number">
            {isCurrent && isPlaying ? <span className="equalizer">▥</span> : String(number + 1).padStart(2, '0')}
          </span>
        )}
        <Cover track={track}/>
        <span className="track-info">
          <strong>{track.title}</strong>
          <small>{track.artist}{track.source === 'local' && ' · On this device'}</small>
        </span>
      </div>
      <span className="track-duration">{time(track.duration)}</span>
      <IconButton
        icon={Heart}
        label={isLiked ? `Unlike ${track.title}` : `Like ${track.title}`}
        active={isLiked}
        onClick={e => {
          e.stopPropagation();
          onLike(track);
        }}
      />
      <IconButton
        icon={MoreHorizontal}
        label={`Options for ${track.title}`}
        onClick={e => {
          e.stopPropagation();
          onMenu(track);
        }}
      />
    </div>
  );
});

const Tracks = memo(function Tracks({ tracks, numbered = true, currentId, isPlaying, likesSet, onPlay, onLike, onMenu }) {
  return (
    <div className="track-list">
      {tracks.map((track, i) => (
        <TrackRow
          key={`${track.id}-${i}`}
          track={track}
          list={tracks}
          number={numbered ? i : undefined}
          isCurrent={currentId === track.id}
          isPlaying={isPlaying}
          isLiked={likesSet ? likesSet.has(track.id) : false}
          onPlay={onPlay}
          onLike={onLike}
          onMenu={onMenu}
        />
      ))}
    </div>
  );
});

const Cards = memo(function Cards({ tracks, onPlay }) {
  return (
    <div className="album-grid">
      {tracks.map(track => (
        <article
          className="album-card"
          key={track.id}
          onClick={() => onPlay(track, tracks)}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onPlay(track, tracks);
            }
          }}
        >
          <div className="album-art" aria-label={`Play ${track.title}`}>
            <Cover track={track}/>
            <span className="card-play"><Play size={22} fill="currentColor"/></span>
          </div>
          <div className="album-name">{track.title}</div>
          <p>{track.artist}</p>
        </article>
      ))}
    </div>
  );
});

const Empty = memo(function Empty({ title, text, action = 'Import music', onClick }) {
  return (
    <div className="empty">
      <div className="empty-icon"><Music2 size={36}/></div>
      <h2>{title}</h2>
      <p>{text}</p>
      {onClick && <button className="primary" onClick={onClick}>{action}<Plus size={17}/></button>}
    </div>
  );
});

const SectionHead = memo(function SectionHead({ title, subtitle, action, onClick }) {
  return (
    <div className="section-head">
      <div>
        {subtitle && <span className="eyebrow">{subtitle}</span>}
        <h2>{title}</h2>
      </div>
      {action && <button className="text-button" onClick={onClick}>{action}<ChevronRight size={16}/></button>}
    </div>
  );
});

const LyricItem = memo(function LyricItem({ line, position, isCurrent, isPast, activeRef, onSeek, distance = 0 }) {
  // LRC gives line times. Only animate words when the source provides word times.
  return (
    <button
      ref={activeRef}
      className={`af-lyric-line ${isCurrent ? 'active' : isPast ? 'past' : 'upcoming'}`}
      data-distance={Math.min(3, Math.abs(distance))}
      onClick={() => onSeek(line.time)}
    >
      {isCurrent && line.words?.length ? (
        line.words.map((word, i) => (
          <span
            key={i}
            className={`af-timed-word af-word ${position >= word.time ? 'sung active' : ''}`}
          >
            {word.text}
          </span>
        ))
      ) : (
        line.text || '♪'
      )}
    </button>
  );
}, (prev, next) => {
  if (prev.line !== next.line) return false;
  if (prev.isCurrent !== next.isCurrent) return false;
  if (prev.isPast !== next.isPast) return false;
  if (prev.distance !== next.distance) return false;
  if (prev.activeRef !== next.activeRef) return false;
  if (next.isCurrent && next.line.words?.length) {
    return prev.position === next.position;
  }
  return true;
});

function useSmoothLyricScroll(containerRef, activeLineRef, lyricIndex, isEnabled = true) {
  const isUserInteractingRef = useRef(false);
  const userScrollTimeoutRef = useRef(null);

  const scrollToActive = useCallback((force = false) => {
    if (!isEnabled) return;
    if (isUserInteractingRef.current && !force) return;
    const container = containerRef.current;
    const activeEl = activeLineRef.current;
    if (!container || !activeEl) return;

    const containerRect = container.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();

    const relativeTop = activeRect.top - containerRect.top;
    // Golden ratio offset: active line positioned comfortably at 38% from top of container
    const targetScrollTop = container.scrollTop + relativeTop - (containerRect.height * 0.38) + (activeRect.height / 2);

    container.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: 'smooth'
    });
  }, [containerRef, activeLineRef, isEnabled]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onUserInteraction = () => {
      isUserInteractingRef.current = true;
      if (userScrollTimeoutRef.current) clearTimeout(userScrollTimeoutRef.current);
      userScrollTimeoutRef.current = setTimeout(() => {
        isUserInteractingRef.current = false;
        scrollToActive();
      }, 3500);
    };

    container.addEventListener('wheel', onUserInteraction, { passive: true });
    container.addEventListener('touchstart', onUserInteraction, { passive: true });
    container.addEventListener('pointerdown', onUserInteraction, { passive: true });

    return () => {
      container.removeEventListener('wheel', onUserInteraction);
      container.removeEventListener('touchstart', onUserInteraction);
      container.removeEventListener('pointerdown', onUserInteraction);
      if (userScrollTimeoutRef.current) clearTimeout(userScrollTimeoutRef.current);
    };
  }, [containerRef, scrollToActive]);

  useEffect(() => {
    if (isEnabled && lyricIndex >= 0) {
      scrollToActive();
    }
  }, [lyricIndex, isEnabled, scrollToActive]);

  return useCallback(() => {
    isUserInteractingRef.current = false;
    if (userScrollTimeoutRef.current) clearTimeout(userScrollTimeoutRef.current);
    requestAnimationFrame(() => scrollToActive(true));
  }, [scrollToActive]);
}
function LyricsTiming({ delay, onChange }) {
  return <details className="lyrics-timing"><summary><Clock3 size={14}/>Adjust lyric timing{delay !== 0 && <span>{delay > 0 ? '+' : ''}{delay.toFixed(2)}s</span>}</summary>
    <div className="lyrics-timing-controls"><button onClick={() => onChange(Math.max(-30, delay - .25))} title="Show lyrics 0.25 seconds earlier">− 0.25s</button><span>{delay > 0 ? '+' : ''}{delay.toFixed(2)}s</span><button onClick={() => onChange(Math.min(30, delay + .25))} title="Show lyrics 0.25 seconds later">+ 0.25s</button><button onClick={() => onChange(0)} disabled={delay === 0}>Reset</button></div>
    <p>Lyrics early? Add time. Lyrics late? Subtract time. Saved for this song.</p>
  </details>;
}

function App() {
  const [page, setPage] = useState('home');
  const [library, setLibrary] = useState([]);
  const [likes, setLikes] = useState([]);
  const [history, setHistory] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [feed, setFeed] = useState([]);
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState('');
  const [panel, setPanel] = useState('playing');
  const [expanded, setExpanded] = useState(false);
  const [menu, setMenu] = useState(null);
  const [playlistName, setPlaylistName] = useState('');
  const [newPlaylist, setNewPlaylist] = useState(false);
  const [install, setInstall] = useState(null);
  const [online, setOnline] = useState(navigator.onLine);
  const [shape, setShape] = useState('clover');
  const [theme, setTheme] = useState('apple-dark');
  const [pureBlack, setPureBlack] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [lyrics, setLyrics] = useState(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [lyricDelays, setLyricDelays] = useState({});
  const [delaysReady, setDelaysReady] = useState(false);
  const [importing, setImporting] = useState(false);
  const [spotifyModal, setSpotifyModal] = useState(false);
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [spotifyLoading, setSpotifyLoading] = useState(false);
  const [spotifyError, setSpotifyError] = useState('');
  const [audioLabSettings, setAudioLabSettings] = useState(DEFAULT_AUDIO_LAB);
  const input = useRef(null);
  const request = useRef(null);
  const searchedQuery = useRef('');
  const activeLyricRef = useRef(null);
  const panelLyricRef = useRef(null);
  const fullscreenLyricsRef = useRef(null);
  const panelLyricsRef = useRef(null);
  const notify = message => setToast(message);
  const player = usePlayer({ notify, onPlayed: track => setHistory(old => [track, ...old.filter(t => t.id !== track.id)].slice(0, 100)), audioLabSettings });
  const current = player.current;
  const displayCurrent = useArtwork(current);
  const motionRoot = useRef(null);
  const tabBeatSync = useTabBeatSync(notify);
  usePlaybackMotion(motionRoot, current?.source === 'local' ? player.analyserRef : tabBeatSync.analyserRef, player.playing, tabBeatSync.active);
  const synced = useMemo(() => parseLrc(lyrics?.syncedLyrics || ''), [lyrics?.syncedLyrics]);
  const hasLyricsContent = Boolean(synced.length > 0 || lyrics?.plainLyrics);
  const noLyrics = !lyricsLoading && !hasLyricsContent;
  const lyricDelay = Number(lyricDelays[current?.id]) || 0;
  const lyricPosition = player.position - lyricDelay;
  const lyricDuration = Math.round(player.duration || current?.duration || 0);
  let lyricIndex = -1;
  for (let i = synced.length - 1; i >= 0; i--) {
    if (synced[i].time <= lyricPosition) {
      lyricIndex = i;
      break;
    }
  }
  const forceScrollFullscreen = useSmoothLyricScroll(fullscreenLyricsRef, activeLyricRef, lyricIndex, fullScreen);
  const forceScrollPanel = useSmoothLyricScroll(panelLyricsRef, panelLyricRef, lyricIndex, panel === 'lyrics');
  const seekLyric = useCallback(value => {
    player.seek(Math.max(0, value + lyricDelay));
    forceScrollFullscreen();
    forceScrollPanel();
  }, [player, lyricDelay, forceScrollFullscreen, forceScrollPanel]);
  const setLyricDelay = value => setLyricDelays(old => ({ ...old, [current.id]: Math.round(value * 100) / 100 }));
  useEffect(() => { readState('lyricDelays', {}).then(value => { setLyricDelays(value); setDelaysReady(true); }).catch(() => setDelaysReady(true)); }, []);
  useEffect(() => { if (delaysReady) writeState('lyricDelays', lyricDelays).catch(() => {}); }, [delaysReady, lyricDelays]);
  useEffect(() => { (async () => {
    try { const [tracks, savedLikes, savedHistory, savedPlaylists, appearance, cachedFeed, savedAudioLab] = await Promise.all([getLibrary(), readState('likes', []), readState('history', []), readState('playlists', []), readState('appearance', {}), readState('feed', []), readState('audioLabSettings', DEFAULT_AUDIO_LAB)]); setLibrary(tracks); setLikes(savedLikes); setHistory(savedHistory); setPlaylists(savedPlaylists); setShape(appearance.shape || 'rounded'); const activeTheme = (!appearance.theme || appearance.theme === 'mochy') ? 'apple-dark' : appearance.theme; setTheme(activeTheme); setPureBlack(activeTheme === 'pure-black'); setFeed(cachedFeed); if (savedAudioLab) setAudioLabSettings(savedAudioLab); }
    catch { notify('Local storage is unavailable. Check your browser storage settings.'); }
    setReady(true);
    try { const tracks = await findMusic('Laufey beabadoobee wave to earth'); setFeed(tracks); await writeState('feed', tracks); } catch (e) { setError(e.message); } finally { setLoading(false); }
  })();
    const connected = () => setOnline(navigator.onLine);
    const prompt = e => { e.preventDefault(); setInstall(e); };
    window.addEventListener('online', connected); window.addEventListener('offline', connected); window.addEventListener('beforeinstallprompt', prompt);
    return () => { window.removeEventListener('online', connected); window.removeEventListener('offline', connected); window.removeEventListener('beforeinstallprompt', prompt); request.current?.abort(); };
  }, []);
  useEffect(() => { if (ready) Promise.all([writeState('likes', likes), writeState('history', history), writeState('playlists', playlists), writeState('appearance', { theme, shape, pureBlack: theme === 'pure-black' }), writeState('audioLabSettings', audioLabSettings)]).catch(() => notify('Could not save changes. Your device may be out of storage.')); }, [ready, likes, history, playlists, theme, shape, pureBlack, audioLabSettings]);
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', theme === 'apple-light' ? '#FFFFFF' : theme === 'apple-dark' ? '#080F16' : theme === 'pure-black' ? '#000000' : '#080808'); }, [theme]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 5500); return () => clearTimeout(t); } }, [toast]);
  useEffect(() => {
    if (!menu && !newPlaylist && !spotifyModal) return;
    const previous = document.activeElement;
    const dialog = document.querySelector('[role="dialog"]');
    if (!dialog) return;
    const focusable = () => [...dialog.querySelectorAll('button:not(:disabled), input, select, a[href]')];
    const items = focusable();
    if (items.length) items[0]?.focus();
    const trap = e => {
      if (e.key !== 'Tab') return;
      const list = focusable();
      if (!list.length) return;
      const first = list[0], last = list.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    dialog.addEventListener('keydown', trap);
    return () => {
      dialog.removeEventListener('keydown', trap);
      if (previous?.isConnected) previous.focus();
    };
  }, [menu, newPlaylist, spotifyModal]);
  useEffect(() => {
    if (!current || (!fullScreen && panel !== 'lyrics')) return;
    const controller = new AbortController(); setLyrics(null); setLyricsLoading(true);
    fetch(`/api/lyrics?title=${encodeURIComponent(current.title)}&artist=${encodeURIComponent(current.artist)}${current.id ? `&id=${encodeURIComponent(current.id)}` : ''}&duration=${lyricDuration}&album=${encodeURIComponent(current.album || '')}`, { signal: controller.signal }).then(async r => { const data = await r.json(); if (!r.ok) throw new Error(data.error); return data; }).then(setLyrics).catch(e => { if (e.name !== 'AbortError') setLyrics({ error: e.message }); }).finally(() => { if (!controller.signal.aborted) setLyricsLoading(false); });
    return () => controller.abort();
  }, [current?.id, panel, fullScreen, lyricDuration]);
  // Smooth lyric scroll handled by useSmoothLyricScroll
  useEffect(() => { const handler = e => { if (e.key === 'Escape') { if (fullScreen) { setFullScreen(false); return; } setMenu(null); setNewPlaylist(false); setExpanded(false); } if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(e.target.tagName) && !menu && !newPlaylist) { e.preventDefault(); player.toggle(); } }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler); });

  useEffect(() => { if (page !== 'search') return; const trimmed = query.trim(); if (!trimmed) { searchedQuery.current = ''; setResults([]); setError(''); setLoading(false); request.current?.abort(); return; } if (searchedQuery.current === trimmed) return; const timer = setTimeout(async () => { searchedQuery.current = trimmed; request.current?.abort(); request.current = new AbortController(); const signal = request.current.signal; setLoading(true); setError(''); try { const tracks = await findMusic(trimmed, signal); if (!signal.aborted) setResults(tracks); } catch (e) { if (e.name !== 'AbortError') setError(e.message); } finally { if (!signal.aborted) setLoading(false); } }, 250); return () => clearTimeout(timer); }, [query, page]);
  function navigate(target) { setPage(target); setSelectedPlaylist(null); setError(''); document.querySelector('main')?.scrollTo(0, 0); }
  async function search(value = query) {
    const trimmed = value.trim(); if (!trimmed) return; searchedQuery.current = trimmed;
    request.current?.abort(); request.current = new AbortController(); const signal = request.current.signal;
    setQuery(value); setPage('search'); setLoading(true); setError('');
    try { const tracks = await findMusic(value, signal); if (!signal.aborted) setResults(tracks); }
    catch (e) { if (e.name !== 'AbortError') setError(e.message); }
    finally { if (!signal.aborted) setLoading(false); }
  }
  const save = useCallback(async (track) => {
    try {
      await saveTrack(track);
      setLibrary(old => [track, ...old.filter(t => t.id !== track.id)]);
    } catch {
      notify('Could not save to your library. Check available storage.');
    }
  }, []);

  const like = useCallback((track) => {
    setLikes(old => {
      const exists = old.includes(track.id);
      const next = exists ? old.filter(id => id !== track.id) : [...old, track.id];
      if (!exists) save(track);
      return next;
    });
  }, [save]);

  async function importFiles(files) {
    setImporting(true); let count = 0;
    for (const file of files) { if (!file.type.startsWith('audio/') && !/\.(mp3|m4a|flac|wav|ogg|aac|opus|webm)$/i.test(file.name)) continue; try { const track = await importAudio(file); setLibrary(old => [track, ...old.filter(t => t.id !== track.id)]); count++; } catch { notify(`Could not import ${file.name}. Check available storage.`); } }
    setImporting(false); if (count) { notify(`${count} ${count === 1 ? 'song' : 'songs'} added. Ready for offline listening.`); navigate('library'); }
  }
  function createPlaylist(e) { e.preventDefault(); const name = playlistName.trim(); if (!name) return; const list = { id: crypto.randomUUID(), name, tracks: [] }; setPlaylists(old => [...old, list]); setPlaylistName(''); setNewPlaylist(false); setSelectedPlaylist(list.id); setPage('playlist'); }
  function addToPlaylist(id, track) { save(track); setPlaylists(old => old.map(p => p.id === id ? { ...p, tracks: [...new Set([...p.tracks, track.id])] } : p)); setMenu(null); notify('Added to playlist'); }
  function openPlaylist(id) { setSelectedPlaylist(id); setPage('playlist'); }
  const playerRef = useRef(player);
  playerRef.current = player;
  const play = useCallback((track, list) => {
    playerRef.current.start(track, list);
    setPanel('playing');
  }, []);

  const likesSet = useMemo(() => new Set(likes), [likes]);
  const currentId = current?.id;
  const isPlaying = player.playing;
  const playlist = playlists.find(p => p.id === selectedPlaylist);
  const visibleTracks = page === 'likes' ? library.filter(t => likes.includes(t.id)) : page === 'local' ? library.filter(t => t.source === 'local') : page === 'history' ? history : page === 'playlist' ? (playlist?.tracks || []).map(id => library.find(t => t.id === id)).filter(Boolean) : page === 'search' ? results : library;
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const hero = history[0] || feed[0];
  // synced and lyricIndex computed above
  async function handleImportSpotify(urlOverride) {
    const targetUrl = (urlOverride || spotifyUrl).trim();
    if (!targetUrl) return;
    setSpotifyLoading(true);
    setSpotifyError('');
    try {
      const res = await fetch(`/api/spotify?url=${encodeURIComponent(targetUrl)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not import Spotify playlist');
      if (!data.tracks?.length) throw new Error('No playable songs found in this Spotify link.');

      for (const t of data.tracks) {
        await saveTrack(t);
      }
      setLibrary(old => {
        const existingIds = new Set(data.tracks.map(t => t.id));
        return [...old.filter(t => !existingIds.has(t.id)), ...data.tracks];
      });

      if (data.type === 'track') {
        const singleTrack = data.tracks[0];
        play(singleTrack, [singleTrack]);
        notify(`Imported "${singleTrack.title}" by ${singleTrack.artist}`);
      } else {
        const newPl = {
          id: `pl_${Date.now()}`,
          name: data.name || 'Spotify Playlist',
          tracks: data.tracks.map(t => t.id)
        };
        setPlaylists(old => [...old, newPl]);
        setSelectedPlaylist(newPl.id);
        setPage('playlist');
        notify(`Imported ${data.tracks.length} songs from "${newPl.name}"!`);
      }
      setSpotifyModal(false);
      setSpotifyUrl('');
    } catch (e) {
      setSpotifyError(e.message);
      notify(e.message);
    } finally {
      setSpotifyLoading(false);
    }
  }

  return <div className={`app theme-${theme} ${pureBlack ? 'pure-black' : ''} ${expanded ? 'player-expanded' : ''}`} data-theme={theme} ref={motionRoot}>
    <input ref={input} type="file" accept="audio/*,.flac,.opus" multiple hidden onChange={e => { importFiles([...e.target.files]); e.target.value = ''; }}/>
    <aside className="sidebar"><button className="brand" onClick={() => navigate('home')}><img src="/icon.png" alt=""/><span>xenn<span className="brand-dot">.</span></span></button><span className="sidebar-label">YOUR LITTLE UNIVERSE</span><nav>{[[Home, 'Home', 'home'], [Search, 'Search', 'search'], [Library, 'Your library', 'library'], [SlidersHorizontal, 'Audio Lab', 'audiolab']].map(([Icon, name, key]) => <button key={key} className={`nav-item ${page === key ? 'selected' : ''}`} onClick={() => navigate(key)}><Icon size={21}/>{name}{page === key && <span className="nav-dot"/>}</button>)}</nav><div className="sidebar-divider"/><div className="sidebar-heading"><span>YOUR COLLECTION</span><IconButton icon={Plus} label="Create playlist" onClick={() => setNewPlaylist(true)}/></div><button className={`collection ${page === 'likes' ? 'selected' : ''}`} onClick={() => navigate('likes')}><span className="collection-icon pink"><Heart size={19}/></span><span>Liked songs<small>{likes.length} songs</small></span></button><button className={`collection ${page === 'local' ? 'selected' : ''}`} onClick={() => navigate('local')}><span className="collection-icon green"><Download size={19}/></span><span>On this device<small>{library.filter(t => t.source === 'local').length} songs</small></span></button>{playlists.map(p => <button className="collection" key={p.id} onClick={() => openPlaylist(p.id)}><span className="collection-icon"><ListMusic size={19}/></span><span>{p.name}<small>{p.tracks.length} songs</small></span></button>)}<button className="create-playlist" onClick={() => setNewPlaylist(true)}><Plus size={17}/> Create playlist</button><div className="sidebar-bottom"><div className="local-note"><Headphones size={25}/><strong>A home for your music.</strong><p>Bring your favorites.<br/>Make yourself comfortable.</p><button onClick={() => input.current.click()}>{importing ? 'Importing…' : 'Import music'}<ArrowUpRight size={15}/></button></div><button className={`nav-item ${page === 'settings' ? 'selected' : ''}`} onClick={() => navigate('settings')}><Settings size={20}/>Settings<span className="version">WEB BETA</span></button></div></aside>
    <main>
      <header className="topbar"><div className="breadcrumb">Xenn <span>/</span> <strong>{({ home: 'Home', search: 'Search', library: 'Your library', likes: 'Liked songs', local: 'On this device', history: 'Listening history', playlist: playlist?.name, settings: 'Settings', audiolab: 'Audio Lab' })[page]}</strong></div><div className="topbar-actions">{!online && <span className="offline-pill"><WifiOff size={14}/>Offline</span>}{install && <button className="install-button" onClick={async () => { await install.prompt(); setInstall(null); }}><Download size={15}/>Install app</button>}<IconButton icon={Clock3} label="Listening history" onClick={() => navigate('history')}/><button className="avatar" aria-label="Open settings" onClick={() => navigate('settings')}>x<span/></button></div></header>
      {page === 'home' ? <div className="page home-page"><div className="greeting"><div><span className="eyebrow">{greeting} <span className="sparkle">✳</span></span><h1>A little music.<br className="mobile-break"/> A little you.</h1><p>Settle in. Your next favorite is waiting.</p></div><span className="date-stamp">{new Date().toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</span></div>
        <section className="hero"><div className="hero-text"><span className="hero-label"><span/>YOUR DAILY SOUNDTRACK</span><h2>{history.length ? 'Right where\nyou left off.' : 'Find your\nlittle escape.'}</h2><p>{hero ? `${hero.artist}, a deep breath, and a moment just for you.` : 'The songs you love. The ones you haven’t met yet.'}</p><button className="primary" disabled={!hero} onClick={() => hero && play(hero, history.length ? history : feed)}><Play size={17} fill="currentColor"/>{history.length ? 'Keep listening' : 'Start listening'}</button><span className="hero-footnote">A sound for every version of you.</span></div><div className="hero-visual"><span className="orbit orbit-one"/><span className="orbit orbit-two"/><span className="hero-star">✳</span><div className="hero-cover"><Cover track={hero}/></div><span className="hero-caption">a little out of this world <span>↗</span></span></div></section>
        <div className="mood-row">{['For you', 'Chill', 'Focus', 'Feel good', 'Late night', 'Romance', 'Workout'].map((m, i) => <button className={i === 0 ? 'selected' : ''} key={m} onClick={() => i === 0 ? navigate('home') : search(`${m} music`)}>{i === 0 && <span>✳</span>}{m}</button>)}</div>
        {history.length > 0 && <section><SectionHead title="Back in your rotation" subtitle="SOUNDS LIKE YOU" action="History" onClick={() => navigate('history')}/><div className="quick-grid"><Tracks tracks={history.slice(0, 6)} numbered={false} currentId={currentId} isPlaying={isPlaying} likesSet={likesSet} onPlay={play} onLike={like} onMenu={setMenu}/></div></section>}
        <section><SectionHead title="Your next favorites" subtitle="A LITTLE DISCOVERY" action="Explore more" onClick={() => search('indie pop music')}/>{loading && !feed.length ? <div className="skeleton-grid">{[0, 1, 2, 3].map(i => <div className="skeleton" key={i}/>)}</div> : feed.length ? <Cards tracks={feed.slice(0, 5)} onPlay={play}/> : <div className="inline-error"><p>{error || 'Connect to discover new music. Your local library is always here.'}</p><button onClick={() => search('indie music')}>Try search<ChevronRight size={16}/></button></div>}</section>
        <section className="bring-music"><div className="bring-icon"><Upload size={24}/></div><div><h3>Your collection. Right at home.</h3><p>Import your music and take it offline. No account needed.</p></div><button onClick={() => input.current.click()}>Add music<Plus size={17}/></button></section><footer>Made with a little love. <span>♡</span> Based on Mochy Music · <a href="https://github.com/realidkroo/Mochy-Music" target="_blank" rel="noreferrer">Open source</a></footer>
      </div> : page === 'search' ? <div className="page"><span className="eyebrow">FOLLOW YOUR CURIOSITY</span><h1>Find your sound.</h1><form className="search-box" onSubmit={e => { e.preventDefault(); search(); }}><Search size={24}/><input type="search" autoComplete="off" autoCapitalize="none" spellCheck="false" aria-label="Search songs and artists" autoFocus placeholder="Songs, artists, little obsessions…" value={query} maxLength={150} onChange={e => setQuery(e.target.value)}/>{query && <IconButton icon={X} label="Clear search" onClick={() => { setQuery(''); setResults([]); searchedQuery.current = ''; }}/>}<button className="primary" type="submit">Search</button></form><p className="provider-note">Search YouTube Music · Playback through the YouTube player</p>{query && (query.includes('spotify.com') || query.startsWith('spotify:')) && (
          <div className="spotify-detect-card">
            <div>
              <Disc3 size={24}/>
              <div>
                <strong>Spotify Link Detected</strong>
                <p>Import all tracks directly into your Xenn library and playlists</p>
              </div>
            </div>
            <button className="primary" onClick={() => handleImportSpotify(query)} disabled={spotifyLoading}>
              {spotifyLoading ? 'Importing…' : 'Import Now'}
            </button>
          </div>
        )}{error ? <div className="inline-error" role="alert">{error}<button onClick={() => search()}>Try again</button></div> : loading ? <div className="loading"><span/>Finding your sound…</div> : results.length ? <><SectionHead title="Songs" subtitle={`${results.length} RECORDINGS`}/><Tracks tracks={results} currentId={currentId} isPlaying={isPlaying} likesSet={likesSet} onPlay={play} onLike={like} onMenu={setMenu}/></> : query ? <Empty title="No songs here yet" text="Search for a song or artist. Try a different spelling if nothing comes back." action="Try Laufey" onClick={() => search('Laufey')}/> : <><SectionHead title="Where do you want to go?"/><div className="browse-grid">{[['Soft mornings', 'Acoustic', 'peach'], ['After hours', 'Late night jazz', 'purple'], ['In your feelings', 'Sad indie', 'blue'], ['A little energy', 'Indie pop', 'green']].map(([title, q, color]) => <button className={`browse-card ${color}`} key={title} onClick={() => search(q)}><span>{title}</span><Disc3 size={95}/><ArrowUpRight size={22}/></button>)}</div></>}</div> : page === 'audiolab' ? <AudioLab settings={audioLabSettings} onChange={setAudioLabSettings} onBack={() => navigate('settings')}/> : page === 'settings' ? <div className="page"><span className="eyebrow">MAKE YOURSELF AT HOME</span><h1>A little more you.</h1><p className="page-description">Your space, your way.</p><SectionHead title="Audio Processing & Sound"/><div className="settings-audiolab-card" onClick={() => navigate('audiolab')} role="button" tabIndex={0}><div className="sac-left"><div className="sac-icon"><SlidersHorizontal size={22}/></div><div className="sac-info"><strong>Audio Lab</strong><p>Equalizer, Audio Effects, Quality & Transitions</p></div></div><ChevronRight size={18} color="#71717a"/></div><SectionHead title="Appearance"/><div className="settings-group"><div className="setting"><div><strong>Visual theme</strong><p>Choose your visual style & design system</p></div><select aria-label="Visual theme" value={theme} onChange={e => { const val = e.target.value; setTheme(val); setPureBlack(val === 'pure-black'); }}><option value="apple-dark">Apple Music (Dark)</option><option value="apple-light">Apple Music (Light)</option><option value="mochy">Mochy Warm</option><option value="pure-black">Pure Black</option></select></div>{theme.startsWith('apple-') ? <div className="setting"><div><strong>Apple Music color mode</strong><p>Switch between light canvas and dark mode</p></div><button className="secondary" onClick={() => setTheme(t => t === 'apple-light' ? 'apple-dark' : 'apple-light')}>{theme === 'apple-light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}</button></div> : <div className="setting"><div><strong>Pure black</strong><p>A darker home for your music</p></div><button className={`toggle ${pureBlack ? 'on' : ''}`} role="switch" aria-checked={pureBlack} aria-label="Pure black" onClick={() => { const next = !pureBlack; setPureBlack(next); setTheme(next ? 'pure-black' : 'mochy'); }}><span/></button></div>}<div className="setting"><div><strong>Player artwork</strong><p>A signature Mochy touch</p></div><select aria-label="Player artwork shape" value={shape} onChange={e => setShape(e.target.value)}><option value="clover">Clover</option><option value="rounded">Rounded</option><option value="circle">Circle</option></select></div><div className="setting"><div><strong>Beat sync atmosphere</strong><p>Always sync background ambient colors and fluid shader to the music rhythm</p></div><button className={`toggle ${tabBeatSync.active ? 'on' : ''}`} role="switch" aria-checked={tabBeatSync.active} aria-label="Always-on Beat sync" onClick={tabBeatSync.toggle}><span/></button></div></div><SectionHead title="Your music & data"/><div className="settings-group"><div className="setting"><div><strong>Import from Spotify</strong><p>Paste a public playlist, album, or track link to import songs</p></div><button className="secondary" onClick={() => { setSpotifyError(''); setSpotifyModal(true); }}><Link2 size={17}/>Import link</button></div><div className="setting"><div><strong>Import audio files</strong><p>Stored on this device for offline listening</p></div><button className="secondary" disabled={importing} onClick={() => input.current.click()}><Upload size={17}/>{importing ? 'Importing…' : 'Import'}</button></div><div className="setting"><div><strong>Export library backup</strong><p>Playlist and library metadata; audio files stay on your device</p></div><button className="secondary" onClick={() => { const blob = new Blob([JSON.stringify({ version: 1, library, likes, playlists, history }, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'xenn-library.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }}><Download size={17}/>Export</button></div></div><SectionHead title="Xenn for the web"/><div className="about-card"><img src="/icon.png" alt="Xenn"/><div><h3>Music, made yours.</h3><p>Web beta 0.1.0 · An independent port of Mochy Music.</p><a href="https://github.com/realidkroo/Mochy-Music" target="_blank" rel="noreferrer">Original project & GPL-3.0 license <ArrowUpRight size={14}/></a></div></div><p className="provider-note">Online tracks need a connection and may have regional or embedding restrictions. Background playback is controlled by your browser. Imported local music works offline after the app has loaded once. Install from your browser menu or use “Add to Home Screen” on iOS.</p></div> : <div className="page"><div className="library-title"><div><span className="eyebrow">{page === 'history' ? 'THE SOUNDTRACK SO FAR' : 'COLLECT THE GOOD STUFF'}</span><h1>{page === 'playlist' ? playlist?.name : page === 'likes' ? 'A little love.' : page === 'local' ? 'Always with you.' : page === 'history' ? 'On repeat, lately.' : 'Your little library.'}</h1><p className="page-description">{visibleTracks.length} songs{page === 'local' ? ' · Available offline on this device' : ' · A collection that sounds like you'}</p></div><div style={{ display: 'flex', gap: '10px' }}><button className="secondary" onClick={() => { setSpotifyError(''); setSpotifyModal(true); }}><Link2 size={17}/>Import Spotify</button><button className="secondary" onClick={() => input.current.click()}><Plus size={17}/>Import audio</button></div></div>{page === 'library' && <div className="library-shortcuts"><button onClick={() => navigate('likes')}><Heart/><strong>Liked songs</strong><small>{likes.length} favorites</small><ChevronRight/></button><button onClick={() => navigate('local')}><Download/><strong>On this device</strong><small>Yours, offline</small><ChevronRight/></button></div>}{page === 'library' && <><SectionHead title="Your playlists" action="Create playlist" onClick={() => setNewPlaylist(true)}/><div className="playlist-grid">{playlists.map(p => <button className="playlist-tile" key={p.id} onClick={() => openPlaylist(p.id)}><ListMusic size={28}/><strong>{p.name}</strong><small>{p.tracks.length} songs</small></button>)}<button className="playlist-tile add" onClick={() => setNewPlaylist(true)}><Plus size={28}/><strong>A new little collection</strong><small>Create a playlist</small></button></div><SectionHead title="All songs"/></>}{visibleTracks.length ? <><div className="list-actions"><button className="primary" onClick={() => play(visibleTracks[0], visibleTracks)}><Play size={17} fill="currentColor"/>Play all</button><button className="secondary" onClick={() => { player.setShuffle(true); play(visibleTracks[Math.floor(Math.random() * visibleTracks.length)], visibleTracks); }}><Shuffle size={17}/>Shuffle</button>{page === 'playlist' && <button className="text-button danger" onClick={() => { setPlaylists(old => old.filter(p => p.id !== selectedPlaylist)); navigate('library'); }}><Trash2 size={16}/>Delete playlist</button>}</div><Tracks tracks={visibleTracks} currentId={currentId} isPlaying={isPlaying} likesSet={likesSet} onPlay={play} onLike={like} onMenu={setMenu}/></> : <Empty title={page === 'history' ? 'Your story starts with a song.' : 'Room for all your favorites.'} text={page === 'playlist' ? 'Open a song’s options to add it to this playlist.' : 'Import music from your device or find something new in Search.'} action={page === 'playlist' || page === 'likes' ? 'Discover music' : 'Import music'} onClick={() => page === 'playlist' || page === 'likes' ? navigate('search') : input.current.click()}/>}</div>}
    </main>
    <aside className={`player-panel ${current ? 'has-track' : ''}`}>{current && <AlbumAtmosphere artwork={displayCurrent.cover || ''} compact/>}<div className="player-heading"><span>{panel === 'queue' ? 'UP NEXT' : panel === 'lyrics' ? 'THE WORDS' : 'NOW PLAYING'}</span><IconButton icon={Maximize2} label="Apple Music Full Screen" disabled={!current} onClick={() => setFullScreen(true)}/><IconButton icon={ChevronDown} label="Close expanded player" className="close-player" onClick={() => setExpanded(false)}/><IconButton icon={MoreHorizontal} label="Current song options" disabled={!current} onClick={() => current && setMenu(current)}/></div>

      <div className={`player-content ${panel === 'lyrics' ? 'is-lyrics' : ''}`}>{panel === 'queue' ? <div className="queue-panel"><h2>A little more music.</h2><p>{player.queue.length} songs in your queue</p>{player.queue.map((track, i) => <div className={`queue-item ${i === player.index ? 'selected' : ''}`} key={`${track.id}-${i}`}><button onClick={() => player.start(track, player.queue, i)}><Cover track={track}/><span><strong>{track.title}</strong><small>{track.artist}</small></span></button>{i !== player.index && <IconButton icon={X} label={`Remove ${track.title} from queue`} onClick={() => { player.removeQueueItem(i); }}/>}</div>)}</div> : panel === 'lyrics' ? <div className="lyrics-panel" ref={panelLyricsRef}>{!current ? <p>Choose a song to find its words.</p> : lyricsLoading ? <p>Finding the words…</p> : lyrics?.error ? <p>{lyrics.error}</p> : lyrics?.instrumental ? <p>No words needed. This one is instrumental.</p> : synced.length ? synced.map((line, i) => <LyricItem key={i} line={line} nextLine={synced[i + 1]} position={lyricPosition} distance={i - lyricIndex} isCurrent={i === lyricIndex} isPast={i < lyricIndex} activeRef={i === lyricIndex ? panelLyricRef : null} onSeek={seekLyric}/>) : <p className="plain-lyrics">{lyrics?.plainLyrics || 'No lyrics found for this recording.'}</p>}<span className="lyrics-credit">Lyrics from {lyrics?.provider === 'youtube-music' ? 'YouTube Music' : lyrics?.provider === 'lyrics-ovh' ? 'Lyrics.ovh' : 'LRCLIB'}</span></div> : current ? <><div className={`player-art ${shape}`} onClick={() => current && setFullScreen(true)} role="button" tabIndex={0} title="Click to open Full Screen Lyrics & Album" style={{ cursor: 'pointer' }}><Cover track={displayCurrent}/></div><div className="playing-label">A LITTLE MOMENT, JUST FOR YOU</div><div className="now-title"><div><h2>{current.title}</h2><p>{current.artist}</p></div><IconButton icon={Heart} label="Like current song" active={likes.includes(current.id)} onClick={() => like(current)}/></div><div className="source-tag"><span/>{current.source === 'local' ? 'On this device · Offline ready' : 'YouTube · Online playback'}</div>{current.source === 'youtube' && <a className="youtube-link" href={`https://www.youtube.com/watch?v=${current.id}`} target="_blank" rel="noreferrer">Open on YouTube<ArrowUpRight size={13}/></a>}</> : <div className="player-empty"><div className="empty-record"><Disc3 size={90} strokeWidth={0.6}/><span>✳</span></div><h2>Let something<br/>good play.</h2><p>Your next little obsession<br/>could be one song away.</p><button className="text-button" onClick={() => navigate('search')}>Find a song<ArrowUpRight size={16}/></button></div>}</div>
      <div className="player-controls"><div className="seek-bar"><input type="range" aria-label="Playback position" min="0" max={player.duration || 1} step="0.1" value={Math.min(player.position, player.duration || 1)} onChange={e => player.seek(Number(e.target.value))} disabled={!current}/><div><span>{time(player.position)}</span><span>{time(player.duration)}</span></div></div><div className="transport"><IconButton icon={Shuffle} label="Shuffle" active={player.shuffle} onClick={() => player.setShuffle(!player.shuffle)}/><IconButton icon={SkipBack} label="Previous song" disabled={!current} onClick={() => player.position > 3 ? player.seek(0) : player.advance(-1)}/><IconButton icon={player.playing ? Pause : Play} label={player.playing ? 'Pause' : 'Play'} className="play-button" disabled={!current} onClick={player.toggle}/><IconButton icon={SkipForward} label="Next song" disabled={!current} onClick={() => player.advance(1)}/><IconButton icon={player.repeat === 'one' ? Repeat1 : Repeat} label={`Repeat: ${player.repeat}`} active={player.repeat !== 'off'} onClick={() => player.setRepeat(({ off: 'all', all: 'one', one: 'off' })[player.repeat])}/></div><div className="volume"><Volume2 size={16}/><input type="range" aria-label="Volume" min="0" max="1" step="0.01" value={player.volume} onChange={e => player.setVolume(Number(e.target.value))}/><span>{Math.round(player.volume * 100)}%</span></div><div className="player-tabs"><button className={panel === 'playing' ? 'selected' : ''} onClick={() => setPanel('playing')}><Disc3 size={17}/>Playing</button><button className={panel === 'lyrics' ? 'selected' : ''} onClick={() => setPanel('lyrics')}><Mic2 size={17}/>Lyrics</button><button className={panel === 'queue' ? 'selected' : ''} onClick={() => setPanel('queue')}><ListMusic size={17}/>Queue</button></div></div></aside>
    {current && <div className="mobile-mini"><button className="mini-track" onClick={() => { setPanel('playing'); setExpanded(true); }}><Cover track={displayCurrent}/><span><strong>{current.title}</strong><small>{current.artist}</small></span></button><IconButton icon={Maximize2} label="Full screen" onClick={() => setFullScreen(true)}/><IconButton icon={player.playing ? Pause : Play} label={player.playing ? 'Pause' : 'Play'} onClick={player.toggle}/><IconButton icon={SkipForward} label="Next song" onClick={() => player.advance(1)}/></div>}
    <nav className="mobile-nav">{[[Home, 'Home', 'home'], [Search, 'Search', 'search'], [Library, 'Library', 'library'], [SlidersHorizontal, 'Audio Lab', 'audiolab'], [Settings, 'Settings', 'settings']].map(([Icon, title, key]) => <button key={key} className={page === key ? 'selected' : ''} onClick={() => navigate(key)}><Icon size={21}/><span>{title}</span></button>)}</nav>
    {toast && <div className="toast" role="status"><Check size={17}/><span>{toast}</span><IconButton icon={X} label="Dismiss notification" onClick={() => setToast('')}/></div>}
    {menu && <div className="modal-backdrop" onClick={() => setMenu(null)}><section className="modal" role="dialog" aria-modal="true" aria-label="Song options" onClick={e => e.stopPropagation()}><div className="modal-heading"><h2>Make it yours.</h2><IconButton icon={X} label="Close song options" onClick={() => setMenu(null)}/></div><div className="menu-track"><Cover track={menu}/><div><strong>{menu.title}</strong><p>{menu.artist}</p></div></div><button className="menu-action" onClick={() => { like(menu); setMenu(null); }}><Heart size={18}/>{likes.includes(menu.id) ? 'Remove from liked songs' : 'Add to liked songs'}</button><button className="menu-action" onClick={() => { save(menu); setMenu(null); notify('Saved to your library'); }}><Library size={18}/>Save to library</button><button className="menu-action" onClick={() => { if (current) player.setQueue(old => [...old, menu]); else player.start(menu, [menu]); setMenu(null); notify('Added to queue'); }}><ListMusic size={18}/>Add to queue</button><span className="sidebar-label">ADD TO PLAYLIST</span>{playlists.map(p => <button className="menu-action" key={p.id} onClick={() => addToPlaylist(p.id, menu)}><Plus size={18}/>{p.name}</button>)}<button className="menu-action" onClick={() => { setMenu(null); setNewPlaylist(true); }}><Plus size={18}/>Create playlist</button>{page === 'playlist' && <button className="menu-action" onClick={() => { setPlaylists(old => old.map(p => p.id === selectedPlaylist ? { ...p, tracks: p.tracks.filter(id => id !== menu.id) } : p)); setMenu(null); }}><X size={18}/>Remove from this playlist</button>}{library.some(t => t.id === menu.id) && <button className="menu-action danger" onClick={async () => { try { await removeTrack(menu.id); setLibrary(old => old.filter(t => t.id !== menu.id)); setLikes(old => old.filter(id => id !== menu.id)); setPlaylists(old => old.map(p => ({ ...p, tracks: p.tracks.filter(id => id !== menu.id) }))); setMenu(null); notify('Removed from your library'); } catch { notify('Could not remove this song. Try again.'); } }}><Trash2 size={18}/>Remove from library{menu.source === 'local' ? ' & device' : ''}</button>}</section></div>}
    {newPlaylist && <div className="modal-backdrop" onClick={() => setNewPlaylist(false)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="playlist-dialog-title" onClick={e => e.stopPropagation()}><div className="modal-heading"><h2 id="playlist-dialog-title">A new little collection.</h2><IconButton icon={X} label="Close create playlist" onClick={() => setNewPlaylist(false)}/></div><p>Give your soundtrack a name.</p><form onSubmit={createPlaylist}><input className="name-input" aria-label="Playlist name" placeholder="Sunday kind of love" maxLength={80} autoFocus value={playlistName} onChange={e => setPlaylistName(e.target.value)} required/><button className="primary" type="submit">Create playlist<Plus size={17}/></button></form></section></div>}
    {spotifyModal && <div className="modal-backdrop" onClick={() => setSpotifyModal(false)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="spotify-dialog-title" onClick={e => e.stopPropagation()}><div className="modal-heading"><h2 id="spotify-dialog-title">Import from Spotify.</h2><IconButton icon={X} label="Close modal" onClick={() => setSpotifyModal(false)}/></div><p>Paste a public Spotify playlist, album, or song link.</p><form onSubmit={e => { e.preventDefault(); handleImportSpotify(); }}><input className="name-input" aria-label="Spotify link" placeholder="https://open.spotify.com/playlist/..." value={spotifyUrl} onChange={e => setSpotifyUrl(e.target.value)} autoFocus required/>{spotifyError && <div className="inline-error" style={{ marginBottom: '16px' }}>{spotifyError}</div>}<button className="primary" type="submit" disabled={spotifyLoading || !spotifyUrl.trim()}>{spotifyLoading ? 'Importing playlist…' : 'Import from Spotify'}<Plus size={17}/></button></form></section></div>}
    {fullScreen && current && <div className={`apple-fullscreen-player ${noLyrics ? 'no-lyrics' : ''}`} role="dialog" aria-modal="true" aria-label="Now playing full screen"><AlbumAtmosphere artwork={highResolutionArtwork(displayCurrent.cover, 128)}/><header className="af-header"><div className="af-brand"><span>XENN · NOW PLAYING</span></div><div className="af-header-actions"><button className="beat-sync-button" aria-pressed={tabBeatSync.active} disabled={tabBeatSync.connecting} onClick={tabBeatSync.toggle} title={tabBeatSync.active ? "Beat sync is always on. Click to pause beat sync." : "Click to resume beat sync."}><Headphones size={14}/>{tabBeatSync.connecting ? 'Connecting…' : tabBeatSync.active ? 'Beat sync on' : 'Beat sync'}</button><IconButton icon={Heart} label="Like current song" active={likes.includes(current.id)} onClick={() => like(current)}/><IconButton icon={Minimize2} label="Exit full screen (Esc)" onClick={() => setFullScreen(false)}/></div></header><div className={`af-content ${noLyrics ? 'no-lyrics' : ''}`}><div className="af-left"><div className={`af-cover-box ${shape}`}><Cover track={displayCurrent}/></div><div className="af-meta"><div className="af-meta-heading"><h2>{current.title}</h2></div><p>{current.artist}</p>{lyrics?.instrumental && <span className="af-instrumental-tag">♪ Instrumental</span>}{displayCurrent.artworkLink && <a className="artwork-credit" href={displayCurrent.artworkLink} target="_blank" rel="noreferrer">View album on {displayCurrent.artworkProvider}<ArrowUpRight size={11}/></a>}</div><div className="af-controls"><div className="seek-bar af-seek"><input type="range" aria-label="Playback position" min="0" max={player.duration || 1} step="0.1" value={Math.min(player.position, player.duration || 1)} onChange={e => player.seek(Number(e.target.value))}/><div><span>{time(player.position)}</span><span>{time(player.duration)}</span></div></div><div className="transport af-transport"><IconButton icon={Shuffle} label="Shuffle" active={player.shuffle} onClick={() => player.setShuffle(!player.shuffle)}/><IconButton icon={SkipBack} label="Previous song" onClick={() => player.position > 3 ? player.seek(0) : player.advance(-1)}/><IconButton icon={player.playing ? Pause : Play} label={player.playing ? 'Pause' : 'Play'} className="play-button af-play" onClick={player.toggle}/><IconButton icon={SkipForward} label="Next song" onClick={() => player.advance(1)}/><IconButton icon={player.repeat === 'one' ? Repeat1 : Repeat} label={`Repeat: ${player.repeat}`} active={player.repeat !== 'off'} onClick={() => player.setRepeat(({ off: 'all', all: 'one', one: 'off' })[player.repeat])}/></div><div className="volume af-volume"><Volume2 size={18}/><input type="range" aria-label="Volume" min="0" max="1" step="0.01" value={player.volume} onChange={e => player.setVolume(Number(e.target.value))}/><span>{Math.round(player.volume * 100)}%</span></div></div></div><div className="af-lyrics">{synced.length > 0 && <LyricsTiming delay={lyricDelay} onChange={setLyricDelay}/>}{lyricsLoading ? <div className="af-lyrics-empty"><div className="loading"><span/>Loading lyrics…</div></div> : lyrics?.error ? <div className="af-lyrics-empty"><p>{lyrics.error}</p></div> : lyrics?.instrumental ? <div className="af-lyrics-empty"><p>♪ Instrumental ♪</p></div> : synced.length ? <div className="af-lyrics-scroll" ref={fullscreenLyricsRef}>{synced.map((line, i) => <LyricItem key={i} line={line} nextLine={synced[i + 1]} position={lyricPosition} distance={i - lyricIndex} isCurrent={i === lyricIndex} isPast={i < lyricIndex} activeRef={i === lyricIndex ? activeLyricRef : null} onSeek={seekLyric}/>)}<div className="af-lyrics-credit">Lyrics provided by {lyrics?.provider === 'youtube-music' ? 'YouTube Music' : lyrics?.provider === 'lyrics-ovh' ? 'Lyrics.ovh' : 'LRCLIB'}</div></div> : lyrics?.plainLyrics ? <div className="af-lyrics-scroll plain" ref={fullscreenLyricsRef}><p className="plain-lyrics">{lyrics.plainLyrics}</p><div className="af-lyrics-credit">Lyrics provided by {lyrics?.provider === 'youtube-music' ? 'YouTube Music' : lyrics?.provider === 'lyrics-ovh' ? 'Lyrics.ovh' : 'LRCLIB'}</div></div> : <div className="af-lyrics-empty"><p>No lyrics found for this song.</p></div>}</div></div></div>}
  <div className="youtube-audio-only" aria-hidden="true" style={{ position: 'fixed', bottom: 0, right: 0, width: '160px', height: '90px', opacity: 0.001, pointerEvents: 'none', overflow: 'hidden', zIndex: -999 }}><div id="youtube-player"/></div></div>;
}

createRoot(document.getElementById('root')).render(<ErrorBoundary><App/></ErrorBoundary>);
if (import.meta.env.PROD && 'serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(error => console.warn('Offline shell registration failed:', error)));
