import { useEffect, useState } from 'react';
import { highResolutionArtwork } from './artwork';
const candidates = new Map();
export function useArtwork(track) {
  const [found, setFound] = useState(null);
  useEffect(() => {
    setFound(null);
    if (!track || track.source === 'local') return;
    const key = JSON.stringify([track.title, track.artist, track.album]);
    if (candidates.has(key)) { setFound({ id: track.id, item: candidates.get(key) }); return; }
    const controller = new AbortController();
    const query = new URLSearchParams({ title: track.title, artist: track.artist, album: track.album || '' });
    fetch(`/api/artwork?${query}`, { signal: controller.signal }).then(response => response.ok ? response.json() : null).then(data => {
      const item = data?.artwork?.[0];
      if (item) { if (candidates.size >= 100) candidates.delete(candidates.keys().next().value); candidates.set(key, item); setFound({ id: track.id, item }); }
    }).catch(() => {});
    return () => controller.abort();
  }, [track?.id, track?.title, track?.artist, track?.album]);
  const item = found?.id === track?.id ? found?.item : null;
  return { ...track, cover: highResolutionArtwork(item?.url || track?.cover || ''), artworkProvider: item?.provider, artworkLink: item?.link };
}
