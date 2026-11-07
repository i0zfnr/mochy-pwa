// Web adaptation of Mochy's InnerTube WEB_REMIX search provider (GPL-3.0).
import { setDefaultResultOrder } from 'node:dns';
import { matchRecording, selectRecording } from './lyrics-match.js';
setDefaultResultOrder('ipv4first');

export function parseSearch(data) {
  const tracks = new Map();
  function walk(value) {
    if (!value || typeof value !== 'object') return;
    const r = value.musicResponsiveListItemRenderer;
    if (r) {
      const cols = r.flexColumns?.map(c => c.musicResponsiveListItemFlexColumnRenderer?.text?.runs || []) || [];
      const id = r.playlistItemData?.videoId || cols[0]?.find(x => x.navigationEndpoint?.watchEndpoint)?.navigationEndpoint.watchEndpoint.videoId;
      if (id && /^[\w-]{11}$/.test(id)) {
        const detail = cols[1] || [];
        const time = detail.map(x => x.text).find(x => /^\d+:\d+(?::\d+)?$/.test(x)) || '';
        const duration = time.split(':').reduce((s, v) => s * 60 + Number(v), 0);
        tracks.set(id, {
          id,
          title: cols[0].map(x => x.text).join(''),
          artist: detail.find(x => x.navigationEndpoint?.browseEndpoint?.browseId?.startsWith('UC'))?.text || detail[0]?.text || 'Unknown artist',
          album: detail.find(x => x.navigationEndpoint?.browseEndpoint?.browseId?.startsWith('MPRE'))?.text || '',
          duration,
          cover: r.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.at(-1)?.url || '',
          source: 'youtube'
        });
      }
    }
    Object.values(value).forEach(walk);
  }
  walk(data);
  return [...tracks.values()];
}

const cache = new Map();
export async function search(query) {
  const key = query.toLowerCase();
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) return cached.tracks;
  const response = await fetch('https://music.youtube.com/youtubei/v1/search?prettyPrint=false', {
    method: 'POST',
    signal: AbortSignal.timeout(15000),
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'https://music.youtube.com',
      'X-YouTube-Client-Name': '67',
      'X-YouTube-Client-Version': '1.20260707.12.00'
    },
    body: JSON.stringify({
      context: { client: { clientName: 'WEB_REMIX', clientVersion: '1.20260707.12.00', hl: 'en', gl: 'US' } },
      query,
      params: 'EgWKAQIIAWoKEAkQBRAKEAMQBA%3D%3D'
    }),
  });
  if (!response.ok) throw new Error(`Music search returned ${response.status}`);
  const data = await response.json();
  if (data.error) throw new Error('Music provider is unavailable');
  const tracks = parseSearch(data);
  if (cache.size > 100) cache.delete(cache.keys().next().value);
  cache.set(key, { tracks, expires: Date.now() + 10 * 60 * 1000 });
  return tracks;
}

export function cleanTitle(str = '') {
  return str
    .replace(/\s*[\(\[](?:official|video|audio|lyrics?|feat\.?|ft\.?|sped\s*up|slowed|reverb|remix|hd|4k|visualizer|live|remastered?|tiktok)[^\)\]]*[\)\]]/gi, '')
    .replace(/[-–—]\s*(?:sped\s*up|slowed|reverb|remix|audio|video|lyrics?)/gi, '')
    .replace(/\s*-\s*Topic$/gi, '')
    .trim();
}

export function cleanArtist(str = '') {
  return str
    .replace(/\s*-\s*Topic$/gi, '')
    .replace(/\s*VEVO$/gi, '')
    .replace(/\s*Official\s*(?:Channel|Music)?$/gi, '')
    .trim();
}

const lyricsCache = new Map();

export async function getLyrics({ id, title, artist, duration = 0, album = '' }) {
  const cacheKey = `${id || ''}-${title.toLowerCase()}-${artist.toLowerCase()}-${duration}-${album}`;
  const cached = lyricsCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return cached.lyrics;

  const cleanT = cleanTitle(title) || title;
  const cleanA = cleanArtist(artist) || artist;

  const recording = { title, artist: cleanA, duration };
  let plainFallback = null;
  function remember(lyrics) {
    if (lyricsCache.size >= 200) lyricsCache.delete(lyricsCache.keys().next().value);
    lyricsCache.set(cacheKey, { lyrics, expires: Date.now() + 30 * 60 * 1000 });
    return lyrics;
  }
  function fromRecord(record, provider) {
    const timed = matchRecording(record, recording) && !!record.syncedLyrics;
    return { syncedLyrics: timed ? record.syncedLyrics : null, plainLyrics: record.plainLyrics,
      instrumental: record.instrumental, provider, matchedDuration: record.duration,
      timing: timed ? (/<\d+:\d/.test(record.syncedLyrics) ? 'word' : 'line') : 'none' };
  }
  // Timed lyrics must match artist, title/version AND the actual recording length.
  // A music video, live take, cover or sped-up edit must not borrow studio timing.
  try {
    const url = new URL('https://lrclib.net/api/get');
    url.searchParams.set('track_name', title); url.searchParams.set('artist_name', cleanA);
    if (duration > 0) url.searchParams.set('duration', String(duration));
    if (album) url.searchParams.set('album_name', album);
    const res = await fetch(url, { headers: { 'User-Agent': 'Mochy-Web/0.1.0' }, signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const record = await res.json();
      if (matchRecording(record, recording) && (record.syncedLyrics || record.instrumental)) return remember(fromRecord(record, 'lrclib'));
      if (matchRecording(record, { ...recording, duration: 0 }) && record.plainLyrics) plainFallback = fromRecord({ ...record, syncedLyrics: null }, 'lrclib');
    }
  } catch {}
  try {
    const url = new URL('https://lrclib.net/api/search');
    url.searchParams.set('track_name', title); url.searchParams.set('artist_name', cleanA);
    const res = await fetch(url, { headers: { 'User-Agent': 'Mochy-Web/0.1.0' }, signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list)) {
        const match = selectRecording(list, recording);
        if (match?.syncedLyrics || match?.instrumental) return remember(fromRecord(match, 'lrclib'));
        const plain = list.find(x => matchRecording(x, { ...recording, duration: 0 }) && x.plainLyrics);
        if (plain) plainFallback = fromRecord({ ...plain, syncedLyrics: null }, 'lrclib');
      }
    }
  } catch {}
  if (plainFallback) return remember(plainFallback);

  // 3. YouTube Music Official Lyrics (InnerTube API)
  if (id && /^[\w-]{11}$/.test(id)) {
    try {
      const nextRes = await fetch('https://music.youtube.com/youtubei/v1/next', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://music.youtube.com',
          'X-YouTube-Client-Name': '67',
          'X-YouTube-Client-Version': '1.20260707.12.00'
        },
        body: JSON.stringify({
          context: { client: { clientName: 'WEB_REMIX', clientVersion: '1.20260707.12.00', hl: 'en', gl: 'US' } },
          videoId: id
        }),
        signal: AbortSignal.timeout(6000)
      });
      if (nextRes.ok) {
        const nextData = await nextRes.json();
        const tabs = nextData.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer?.watchNextTabbedResultsRenderer?.tabs;
        const browseId = tabs?.find(t => t.tabRenderer?.title === 'Lyrics')?.tabRenderer?.endpoint?.browseEndpoint?.browseId;
        if (browseId) {
          const bRes = await fetch('https://music.youtube.com/youtubei/v1/browse', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Origin': 'https://music.youtube.com',
              'X-YouTube-Client-Name': '67',
              'X-YouTube-Client-Version': '1.20260707.12.00'
            },
            body: JSON.stringify({
              context: { client: { clientName: 'WEB_REMIX', clientVersion: '1.20260707.12.00', hl: 'en', gl: 'US' } },
              browseId
            }),
            signal: AbortSignal.timeout(6000)
          });
          if (bRes.ok) {
            const bData = await bRes.json();
            const text = bData.contents?.sectionListRenderer?.contents?.[0]?.musicDescriptionShelfRenderer?.description?.runs?.map(x => x.text).join('');
            if (text) {
              const result = { plainLyrics: text, syncedLyrics: null, instrumental: false, provider: 'youtube-music' };
              lyricsCache.set(cacheKey, { lyrics: result, expires: Date.now() + 30 * 60 * 1000 });
              return result;
            }
          }
        }
      }
    } catch {}
  }

  // 5. Lyrics.ovh API fallback
  try {
    const ovhRes = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(cleanA)}/${encodeURIComponent(cleanT)}`, {
      signal: AbortSignal.timeout(5000)
    });
    if (ovhRes.ok) {
      const ovhData = await ovhRes.json();
      if (ovhData.lyrics) {
        const result = { plainLyrics: ovhData.lyrics, syncedLyrics: null, instrumental: false, provider: 'lyrics-ovh' };
        lyricsCache.set(cacheKey, { lyrics: result, expires: Date.now() + 30 * 60 * 1000 });
        return result;
      }
    }
  } catch {}

  if (lyricsCache.size > 200) lyricsCache.delete(lyricsCache.keys().next().value);
  return { error: 'No lyrics found for this recording.' };
}


export async function fetchSpotify(inputUrl) {
  const match = inputUrl.match(/(playlist|track|album)[\/:]([a-zA-Z0-9]+)/i);
  if (!match) throw new Error('Invalid Spotify link. Please paste a valid Spotify playlist, track, or album URL.');
  const type = match[1].toLowerCase();
  const id = match[2];

  const embedUrl = `https://open.spotify.com/embed/${type}/${id}`;
  const res = await fetch(embedUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    },
    signal: AbortSignal.timeout(10000)
  });

  if (!res.ok) throw new Error(`Spotify returned status ${res.status}`);
  const html = await res.text();
  const jsonMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!jsonMatch) throw new Error('Could not parse Spotify page. The playlist or track may be private or unavailable.');

  const data = JSON.parse(jsonMatch[1]);
  const entity = data.props?.pageProps?.state?.data?.entity;
  if (!entity) throw new Error('Spotify playlist or song details not found.');

  const cover = entity.coverArt?.sources?.[0]?.url || entity.visualIdentity?.image?.[1]?.url || entity.visualIdentity?.image?.[0]?.url || '';
  const title = entity.name || entity.title || 'Spotify Import';

  let rawList = [];
  if (Array.isArray(entity.trackList)) {
    rawList = entity.trackList;
  } else if (type === 'track') {
    rawList = [entity];
  }

  const tracks = rawList.map(t => {
    const trackId = t.uri ? t.uri.replace(/^spotify:track:/, '') : (t.id || Math.random().toString(36).slice(2));
    const trackTitle = t.title || t.name;
    const trackArtist = t.subtitle || (Array.isArray(t.artists) ? t.artists.map(a => a.name).join(', ') : (t.artist || 'Unknown Artist'));
    const durSec = t.duration ? Math.round(t.duration / 1000) : 0;
    const trackCover = t.coverArt?.sources?.[0]?.url || cover;
    return {
      id: `sp_${trackId}`,
      spotifyId: trackId,
      title: trackTitle,
      artist: trackArtist,
      duration: durSec,
      cover: trackCover,
      source: 'spotify'
    };
  }).filter(t => t.title);

  // Pre-resolve first track to YouTube Music for instant initial playback
  if (tracks.length > 0) {
    try {
      const topSearch = await search(`${tracks[0].title} ${tracks[0].artist}`);
      if (topSearch?.[0]?.id) {
        tracks[0].id = topSearch[0].id;
        tracks[0].source = 'youtube';
        if (!tracks[0].cover && topSearch[0].cover) tracks[0].cover = topSearch[0].cover;
      }
    } catch {}
  }

  return {
    type,
    id,
    name: title,
    cover,
    trackCount: tracks.length,
    tracks
  };
}
