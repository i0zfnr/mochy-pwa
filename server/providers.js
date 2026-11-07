// Web adaptation of Mochy's InnerTube WEB_REMIX search provider (GPL-3.0).
import { setDefaultResultOrder } from 'node:dns';
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
        tracks.set(id, { id, title: cols[0].map(x => x.text).join(''), artist: detail.find(x => x.navigationEndpoint?.browseEndpoint?.browseId?.startsWith('UC'))?.text || detail[0]?.text || 'Unknown artist', album: detail.find(x => x.navigationEndpoint?.browseEndpoint?.browseId?.startsWith('MPRE'))?.text || '', duration, cover: r.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.at(-1)?.url || '', source: 'youtube' });
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
    method: 'POST', signal: AbortSignal.timeout(15000),
    headers: { 'Content-Type': 'application/json', 'Origin': 'https://music.youtube.com', 'X-YouTube-Client-Name': '67', 'X-YouTube-Client-Version': '1.20260707.12.00' },
    body: JSON.stringify({ context: { client: { clientName: 'WEB_REMIX', clientVersion: '1.20260707.12.00', hl: 'en', gl: 'US' } }, query, params: 'EgWKAQIIAWoKEAkQBRAKEAMQBA%3D%3D' }),
  });
  if (!response.ok) throw new Error(`Music search returned ${response.status}`);
  const data = await response.json();
  if (data.error) throw new Error('Music provider is unavailable');
  const tracks = parseSearch(data);
  if (cache.size > 100) cache.delete(cache.keys().next().value);
  cache.set(key, { tracks, expires: Date.now() + 10 * 60 * 1000 });
  return tracks;
}
