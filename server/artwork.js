import { normaliseName } from './lyrics-match.js';
const cache = new Map();
const same = (a, b) => normaliseName(a) === normaliseName(b);
export async function findArtwork({ title, artist, album = '' }) {
  const key = JSON.stringify([title, artist, album]);
  const hit = cache.get(key); if (hit && hit.until > Date.now()) return hit.items;
  const result = await Promise.allSettled([
    (async () => {
      const url = new URL('https://api.deezer.com/search');
      url.searchParams.set('q', `artist:"${artist.replaceAll('"', '')}" track:"${title.replaceAll('"', '')}"`);
      url.searchParams.set('limit', '12');
      const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (!response.ok) return null;
      const data = await response.json();
      const track = data.data?.find(item => same(item.artist?.name || '', artist) && same(item.title || '', title) && (!album || same(item.album?.title || '', album)));
      return track?.album?.cover_xl ? { url: track.album.cover_xl, provider: 'Deezer', link: `https://www.deezer.com/album/${track.album.id}` } : null;
    })(),
    (async () => {
      const url = new URL('https://itunes.apple.com/search');
      url.searchParams.set('term', `${artist} ${title}`); url.searchParams.set('entity', 'song'); url.searchParams.set('limit', '15');
      const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (!response.ok) return null;
      const data = await response.json();
      const track = data.results?.find(item => same(item.artistName || '', artist) && same(item.trackName || '', title) && (!album || same(item.collectionName || '', album)));
      return track?.artworkUrl100 ? { url: track.artworkUrl100.replace(/\/\d+x\d+[^/]*\.(jpg|png)$/, '/1000x1000bb.$1'), provider: 'Apple Music', link: track.collectionViewUrl || track.trackViewUrl } : null;
    })(),
  ]);
  const items = result.filter(value => value.status === 'fulfilled' && value.value).map(value => value.value);
  if (cache.size >= 100) cache.delete(cache.keys().next().value);
  cache.set(key, { until: Date.now() + (items.length ? 86400000 : 300000), items });
  return items;
}
